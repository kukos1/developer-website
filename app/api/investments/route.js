import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';
import { collectImageUrls } from '@/lib/storageUploads';
import { isAdminRequestAuthorized } from '@/lib/adminAuth';

export const runtime = 'nodejs';

function getUploadErrorResponse(error, fallbackMessage) {
    const message = error?.message || fallbackMessage;
    const status = message.includes('larger than 50MB') ? 413 : 500;
    return NextResponse.json({ error: message }, { status });
}

function toTrimmedString(value) {
    return typeof value === 'string' ? value.trim() : '';
}

function parseRemovedImages(inputs) {
    const removed = new Set();

    for (const input of inputs) {
        if (typeof input !== 'string') continue;
        const trimmed = input.trim();
        if (trimmed) removed.add(trimmed);
    }

    return removed;
}

function mergeImageUrls(existingImages, newImages) {
    return [...new Set([...existingImages, ...newImages].filter(Boolean))];
}

export async function GET() {
    try {
        const { data, error } = await supabaseServer
            .from('investments')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching investments:', error);
        return NextResponse.json({ error: 'Failed to load investments' }, { status: 500 });
    }
}

export async function POST(request) {
    if (!isAdminRequestAuthorized(request)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const formData = await request.formData();
        const name = toTrimmedString(formData.get('name'));
        const location = toTrimmedString(formData.get('location')) || null;
        const description = toTrimmedString(formData.get('description')) || null;
        const visualizationLink = toTrimmedString(formData.get('visualization_link')) || null;

        if (!name) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const images = await collectImageUrls({
            supabase: supabaseServer,
            inputs: formData.getAll('images'),
            folder: 'investments',
            prefix: 'inv-'
        });

        const { data, error } = await supabaseServer
            .from('investments')
            .insert([{
                name,
                location,
                description,
                visualization_link: visualizationLink,
                images
            }])
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(data, { status: 201 });
    } catch (error) {
        console.error('Error in POST investments:', error);
        return getUploadErrorResponse(error, 'Failed to save investment');
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
                return NextResponse.json({ error: 'Name is required.' }, { status: 400 });
            }
            updates.name = name;
        }
        if (formData.has('location')) updates.location = toTrimmedString(formData.get('location')) || null;
        if (formData.has('description')) updates.description = toTrimmedString(formData.get('description')) || null;
        if (formData.has('visualization_link')) updates.visualization_link = toTrimmedString(formData.get('visualization_link')) || null;

        const imageInputs = formData.getAll('images');
        const removedImages = parseRemovedImages(formData.getAll('removedImages'));

        if (imageInputs.length > 0 || removedImages.size > 0) {
            const { data: existingInvestment, error: existingError } = await supabaseServer
                .from('investments')
                .select('images')
                .eq('id', id)
                .single();

            if (existingError) throw existingError;

            const existingImages = Array.isArray(existingInvestment?.images)
                ? existingInvestment.images.filter((item) => typeof item === 'string' && item.trim().length > 0)
                : [];
            const keptImages = existingImages.filter((imageUrl) => !removedImages.has(imageUrl));
            let newImages = [];

            if (imageInputs.length > 0) {
                newImages = await collectImageUrls({
                    supabase: supabaseServer,
                    inputs: imageInputs,
                    folder: 'investments',
                    prefix: 'inv-'
                });
            }

            updates.images = mergeImageUrls(keptImages, newImages);
        }

        if (Object.keys(updates).length === 0) {
            return NextResponse.json({ error: 'No fields to update.' }, { status: 400 });
        }

        const { data, error } = await supabaseServer
            .from('investments')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(data);
    } catch (error) {
        console.error('Error in PUT investments:', error);
        return getUploadErrorResponse(error, 'Failed to update investment');
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
            .from('investments')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({ message: 'Investment deleted' });
    } catch (error) {
        console.error('Error in DELETE investment:', error);
        return NextResponse.json({ error: 'Failed to delete investment' }, { status: 500 });
    }
}
