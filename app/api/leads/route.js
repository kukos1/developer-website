import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';
import { isAdminRequestAuthorized } from '@/lib/adminAuth';

export const runtime = 'nodejs';

const ALLOWED_STATUSES = new Set(['new', 'in_progress', 'closed', 'spam']);
const DEFAULT_SOURCE = 'contact_form';
const LEADS_BUCKET = 'uploads';
const LEADS_FOLDER = 'leads';
const ENABLE_STORAGE_FALLBACK = process.env.LEADS_STORAGE_FALLBACK === 'true';

function toTrimmedString(value) {
    return typeof value === 'string' ? value.trim() : '';
}

function isEmailValid(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isMissingLeadsTableError(error) {
    const message = String(error?.message || '').toLowerCase();
    const hint = String(error?.hint || '').toLowerCase();
    return error?.code === 'PGRST205'
        || message.includes("could not find the table 'public.leads'")
        || message.includes('relation "leads" does not exist')
        || hint.includes("table 'public.leads'");
}

async function parseRequestBody(request) {
    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
        return await request.json().catch(() => null);
    }

    if (contentType.includes('multipart/form-data') || contentType.includes('application/x-www-form-urlencoded')) {
        const formData = await request.formData();
        return {
            id: formData.get('id'),
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            message: formData.get('message'),
            source: formData.get('source'),
            status: formData.get('status'),
            admin_note: formData.get('admin_note')
        };
    }

    return await request.json().catch(() => null);
}

function getStoragePathFromId(id) {
    const normalized = toTrimmedString(id);
    if (!normalized.startsWith('storage:')) return null;
    const rawPath = normalized.slice('storage:'.length);
    return rawPath.startsWith(`${LEADS_FOLDER}/`) ? rawPath : null;
}

async function saveLeadToStorage(payload) {
    const fileName = `${new Date().toISOString().replace(/[:.]/g, '-')}-${randomUUID()}.json`;
    const storagePath = `${LEADS_FOLDER}/${fileName}`;
    const serialized = JSON.stringify(payload, null, 2);

    const { error } = await supabaseServer.storage
        .from(LEADS_BUCKET)
        .upload(storagePath, Buffer.from(serialized, 'utf8'), {
            contentType: 'application/json; charset=utf-8',
            upsert: false
        });

    if (error) throw error;
    return storagePath;
}

async function loadLeadFromStoragePath(storagePath) {
    const { data, error } = await supabaseServer.storage
        .from(LEADS_BUCKET)
        .download(storagePath);

    if (error) throw error;
    const raw = await data.text();
    return JSON.parse(raw);
}

async function listLeadsFromStorage({ status, limit }) {
    const { data: entries, error } = await supabaseServer.storage
        .from(LEADS_BUCKET)
        .list(LEADS_FOLDER, {
            limit,
            sortBy: { column: 'name', order: 'desc' }
        });

    if (error) throw error;

    const leadFiles = (entries || []).filter((entry) => entry?.name && !entry.name.endsWith('/'));
    const parsed = await Promise.all(leadFiles.map(async (entry) => {
        const storagePath = `${LEADS_FOLDER}/${entry.name}`;
        try {
            const lead = await loadLeadFromStoragePath(storagePath);
            return {
                ...lead,
                id: `storage:${storagePath}`
            };
        } catch (innerError) {
            console.error(`Failed to parse lead file ${storagePath}:`, innerError);
            return null;
        }
    }));

    return parsed
        .filter(Boolean)
        .filter((item) => !status || item.status === status)
        .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
}

async function upsertStorageLead(id, updates) {
    const storagePath = getStoragePathFromId(id);
    if (!storagePath) return null;

    const current = await loadLeadFromStoragePath(storagePath);
    const merged = {
        ...current,
        ...updates,
        updated_at: new Date().toISOString()
    };

    const serialized = JSON.stringify(merged, null, 2);
    const { error } = await supabaseServer.storage
        .from(LEADS_BUCKET)
        .upload(storagePath, Buffer.from(serialized, 'utf8'), {
            contentType: 'application/json; charset=utf-8',
            upsert: true
        });

    if (error) throw error;
    return { ...merged, id: `storage:${storagePath}` };
}

async function deleteStorageLead(id) {
    const storagePath = getStoragePathFromId(id);
    if (!storagePath) return false;

    const { error } = await supabaseServer.storage
        .from(LEADS_BUCKET)
        .remove([storagePath]);

    if (error) throw error;
    return true;
}

export async function GET(request) {
    if (!isAdminRequestAuthorized(request)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const status = toTrimmedString(searchParams.get('status'));
        const limitRaw = Number(searchParams.get('limit') || 200);
        const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 500) : 200;

        if (status && !ALLOWED_STATUSES.has(status)) {
            return NextResponse.json({ error: 'Invalid status filter.' }, { status: 400 });
        }

        let query = supabaseServer
            .from('leads')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit);

        if (status) query = query.eq('status', status);

        const { data, error } = await query;
        if (error) {
            if (isMissingLeadsTableError(error) && ENABLE_STORAGE_FALLBACK) {
                const storageLeads = await listLeadsFromStorage({ status, limit });
                return NextResponse.json(storageLeads);
            }

            if (isMissingLeadsTableError(error)) {
                return NextResponse.json({ error: 'Leads table is missing. Run Supabase migration.' }, { status: 500 });
            }

            throw error;
        }

        return NextResponse.json(data || []);
    } catch (error) {
        console.error('Error fetching leads:', error);
        return NextResponse.json({ error: 'Failed to load leads' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await parseRequestBody(request);

        const name = toTrimmedString(body?.name);
        const email = toTrimmedString(body?.email).toLowerCase();
        const message = toTrimmedString(body?.message);
        const phone = toTrimmedString(body?.phone) || null;
        const source = toTrimmedString(body?.source) || DEFAULT_SOURCE;

        if (!name || !email || !message) {
            return NextResponse.json({ error: 'Name, email and message are required.' }, { status: 400 });
        }

        if (!isEmailValid(email)) {
            return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 });
        }

        const leadPayload = {
            created_at: new Date().toISOString(),
            name,
            email,
            phone,
            message,
            source,
            status: 'new',
            admin_note: null,
            responded_at: null
        };

        const { data, error } = await supabaseServer
            .from('leads')
            .insert([leadPayload])
            .select()
            .single();

        if (error) {
            if (isMissingLeadsTableError(error) && ENABLE_STORAGE_FALLBACK) {
                const storagePath = await saveLeadToStorage(leadPayload);
                return NextResponse.json({ success: true, id: `storage:${storagePath}`, fallback: 'storage' }, { status: 201 });
            }

            if (isMissingLeadsTableError(error)) {
                return NextResponse.json({ error: 'Leads table is missing. Run Supabase migration.' }, { status: 500 });
            }

            throw error;
        }

        return NextResponse.json({ success: true, id: data.id }, { status: 201 });
    } catch (error) {
        console.error('Error creating lead:', error);
        return NextResponse.json({ error: 'Failed to save lead' }, { status: 500 });
    }
}

export async function PUT(request) {
    if (!isAdminRequestAuthorized(request)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await parseRequestBody(request);
        const id = toTrimmedString(body?.id);

        if (!id) {
            return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
        }

        const updates = {};

        if (Object.prototype.hasOwnProperty.call(body || {}, 'status')) {
            const status = toTrimmedString(body?.status);
            if (!ALLOWED_STATUSES.has(status)) {
                return NextResponse.json({ error: 'Invalid status.' }, { status: 400 });
            }
            updates.status = status;
            updates.responded_at = status === 'closed' ? new Date().toISOString() : null;
        }

        if (Object.prototype.hasOwnProperty.call(body || {}, 'admin_note')) {
            updates.admin_note = toTrimmedString(body?.admin_note) || null;
        }

        if (Object.keys(updates).length === 0) {
            return NextResponse.json({ error: 'No fields to update.' }, { status: 400 });
        }

        if (id.startsWith('storage:')) {
            const updatedLead = await upsertStorageLead(id, updates);
            if (!updatedLead) {
                return NextResponse.json({ error: 'Invalid lead identifier.' }, { status: 400 });
            }
            return NextResponse.json(updatedLead);
        }

        const { data, error } = await supabaseServer
            .from('leads')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            if (isMissingLeadsTableError(error)) {
                return NextResponse.json({ error: 'Leads table not found. Run schema migration or use storage lead IDs.' }, { status: 404 });
            }
            throw error;
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Error updating lead:', error);
        return NextResponse.json({ error: 'Failed to update lead' }, { status: 500 });
    }
}

export async function DELETE(request) {
    if (!isAdminRequestAuthorized(request)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const id = toTrimmedString(searchParams.get('id'));

        if (!id) {
            return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
        }

        if (id.startsWith('storage:')) {
            await deleteStorageLead(id);
            return NextResponse.json({ message: 'Lead deleted' });
        }

        const { error } = await supabaseServer
            .from('leads')
            .delete()
            .eq('id', id);

        if (error) {
            if (isMissingLeadsTableError(error)) {
                return NextResponse.json({ error: 'Leads table not found. Run schema migration or use storage lead IDs.' }, { status: 404 });
            }
            throw error;
        }

        return NextResponse.json({ message: 'Lead deleted' });
    } catch (error) {
        console.error('Error deleting lead:', error);
        return NextResponse.json({ error: 'Failed to delete lead' }, { status: 500 });
    }
}
