import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { isAdminRequestAuthorized } from '@/lib/adminAuth';

export const runtime = 'nodejs';

const ALLOWED_STATUSES = new Set(['new', 'in_progress', 'closed', 'spam']);
const DEFAULT_SOURCE = 'contact_form';

function toTrimmedString(value) {
    return typeof value === 'string' ? value.trim() : '';
}

function isEmailValid(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
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

export async function GET(request) {
    if (!isAdminRequestAuthorized(request)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const status = toTrimmedString(searchParams.get('status'));
        const limitRaw = Number(searchParams.get('limit') || 200);
        const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 500) : 200;

        let query = supabase
            .from('leads')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit);

        if (status) {
            if (!ALLOWED_STATUSES.has(status)) {
                return NextResponse.json({ error: 'Invalid status filter.' }, { status: 400 });
            }
            query = query.eq('status', status);
        }

        const { data, error } = await query;
        if (error) throw error;
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

        const { data, error } = await supabase
            .from('leads')
            .insert([{
                name,
                email,
                phone,
                message,
                source,
                status: 'new'
            }])
            .select()
            .single();

        if (error) throw error;
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

        const { data, error } = await supabase
            .from('leads')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
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

        const { error } = await supabase
            .from('leads')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return NextResponse.json({ message: 'Lead deleted' });
    } catch (error) {
        console.error('Error deleting lead:', error);
        return NextResponse.json({ error: 'Failed to delete lead' }, { status: 500 });
    }
}
