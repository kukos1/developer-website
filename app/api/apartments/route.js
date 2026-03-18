import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';
import { collectImageUrls } from '@/lib/storageUploads';
import { isAdminRequestAuthorized } from '@/lib/adminAuth';

export const runtime = 'nodejs';

const ALLOWED_STATUSES = new Set(['available', 'reserved', 'sold']);

function getUploadErrorResponse(error, fallbackMessage) {
    const message = error?.message || fallbackMessage;
    const status = message.includes('larger than 50MB') ? 413 : 500;
    return NextResponse.json({ error: message }, { status });
}

function toTrimmedString(value) {
    return typeof value === 'string' ? value.trim() : '';
}

function parseOptionalNumber(value, { fieldName, integer = false, min = null }) {
    if (value == null) return { ok: true, value: null };

    const raw = String(value).trim();
    if (!raw) return { ok: true, value: null };

    const parsed = Number(raw);
    if (!Number.isFinite(parsed)) {
        return { ok: false, error: `Invalid ${fieldName}.` };
    }

    if (integer && !Number.isInteger(parsed)) {
        return { ok: false, error: `Invalid ${fieldName}.` };
    }

    if (min != null && parsed < min) {
        return { ok: false, error: `Invalid ${fieldName}.` };
    }

    return { ok: true, value: parsed };
}

function parseRequiredNumber(value, options) {
    const parsed = parseOptionalNumber(value, options);
    if (!parsed.ok) return parsed;

    if (parsed.value == null) {
        return { ok: false, error: `${options.fieldName} is required.` };
    }

    return parsed;
}

function parseStatus(value) {
    const normalized = toTrimmedString(value) || 'available';
    if (!ALLOWED_STATUSES.has(normalized)) return null;
    return normalized;
}

export async function GET() {
    try {
        const { data, error } = await supabaseServer
            .from('apartments')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching apartments:', error);
        return NextResponse.json({ error: 'Failed to load apartments' }, { status: 500 });
    }
}

export async function POST(request) {
    if (!isAdminRequestAuthorized(request)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const formData = await request.formData();

        const name = toTrimmedString(formData.get('name'));
        if (!name) {
            return NextResponse.json({ error: 'Name is required.' }, { status: 400 });
        }

        const areaResult = parseRequiredNumber(formData.get('area'), {
            fieldName: 'area',
            min: 0
        });
        if (!areaResult.ok) {
            return NextResponse.json({ error: areaResult.error }, { status: 400 });
        }

        const priceResult = parseRequiredNumber(formData.get('price'), {
            fieldName: 'price',
            min: 0
        });
        if (!priceResult.ok) {
            return NextResponse.json({ error: priceResult.error }, { status: 400 });
        }

        const floorResult = parseOptionalNumber(formData.get('floor'), {
            fieldName: 'floor',
            integer: true,
            min: 0
        });
        if (!floorResult.ok) {
            return NextResponse.json({ error: floorResult.error }, { status: 400 });
        }

        const roomsResult = parseOptionalNumber(formData.get('rooms'), {
            fieldName: 'rooms',
            integer: true,
            min: 0
        });
        if (!roomsResult.ok) {
            return NextResponse.json({ error: roomsResult.error }, { status: 400 });
        }

        const status = parseStatus(formData.get('status'));
        if (!status) {
            return NextResponse.json({ error: 'Invalid status.' }, { status: 400 });
        }

        const description = toTrimmedString(formData.get('description')) || null;

        const images = await collectImageUrls({
            supabase: supabaseServer,
            inputs: formData.getAll('images'),
            folder: 'apartments'
        });

        const { data, error } = await supabaseServer
            .from('apartments')
            .insert([{
                name,
                floor: floorResult.value,
                rooms: roomsResult.value,
                area: areaResult.value,
                price: priceResult.value,
                status,
                description,
                images,
                image_url: images[0] || null
            }])
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(data, { status: 201 });
    } catch (error) {
        console.error('Error in POST apartments:', error);
        return getUploadErrorResponse(error, 'Failed to save apartment');
    }
}

export async function PUT(request) {
    if (!isAdminRequestAuthorized(request)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const formData = await request.formData();
        const id = toTrimmedString(formData.get('id'));

        if (!id) {
            return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
        }

        const updates = {};

        if (formData.has('name')) {
            const name = toTrimmedString(formData.get('name'));
            if (!name) {
                return NextResponse.json({ error: 'Name cannot be empty.' }, { status: 400 });
            }
            updates.name = name;
        }

        if (formData.has('floor')) {
            const floorResult = parseOptionalNumber(formData.get('floor'), {
                fieldName: 'floor',
                integer: true,
                min: 0
            });
            if (!floorResult.ok) {
                return NextResponse.json({ error: floorResult.error }, { status: 400 });
            }
            updates.floor = floorResult.value;
        }

        if (formData.has('rooms')) {
            const roomsResult = parseOptionalNumber(formData.get('rooms'), {
                fieldName: 'rooms',
                integer: true,
                min: 0
            });
            if (!roomsResult.ok) {
                return NextResponse.json({ error: roomsResult.error }, { status: 400 });
            }
            updates.rooms = roomsResult.value;
        }

        if (formData.has('area')) {
            const areaResult = parseOptionalNumber(formData.get('area'), {
                fieldName: 'area',
                min: 0
            });
            if (!areaResult.ok) {
                return NextResponse.json({ error: areaResult.error }, { status: 400 });
            }
            updates.area = areaResult.value;
        }

        if (formData.has('price')) {
            const priceResult = parseOptionalNumber(formData.get('price'), {
                fieldName: 'price',
                min: 0
            });
            if (!priceResult.ok) {
                return NextResponse.json({ error: priceResult.error }, { status: 400 });
            }
            updates.price = priceResult.value;
        }

        if (formData.has('status')) {
            const status = parseStatus(formData.get('status'));
            if (!status) {
                return NextResponse.json({ error: 'Invalid status.' }, { status: 400 });
            }
            updates.status = status;
        }

        if (formData.has('description')) {
            updates.description = toTrimmedString(formData.get('description')) || null;
        }

        const imageInputs = formData.getAll('images');
        if (imageInputs.length > 0) {
            const newImages = await collectImageUrls({
                supabase: supabaseServer,
                inputs: imageInputs,
                folder: 'apartments'
            });

            if (newImages.length > 0) {
                updates.images = newImages;
                updates.image_url = newImages[0];
            }
        }

        if (Object.keys(updates).length === 0) {
            return NextResponse.json({ error: 'No fields to update.' }, { status: 400 });
        }

        const { data, error } = await supabaseServer
            .from('apartments')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(data);
    } catch (error) {
        console.error('Error in PUT apartments:', error);
        return getUploadErrorResponse(error, 'Failed to update apartment');
    }
}

export async function DELETE(request) {
    if (!isAdminRequestAuthorized(request)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
        }

        const { error } = await supabaseServer
            .from('apartments')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({ message: 'Apartment deleted' });
    } catch (error) {
        console.error('Error in DELETE apartment:', error);
        return NextResponse.json({ error: 'Failed to delete apartment' }, { status: 500 });
    }
}
