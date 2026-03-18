import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { collectImageUrls } from '@/lib/storageUploads';
import { isAdminRequestAuthorized } from '@/lib/adminAuth';

export const runtime = 'nodejs';

function getUploadErrorResponse(error, fallbackMessage) {
    const message = error?.message || fallbackMessage;
    const status = message.includes('larger than 50MB') ? 413 : 500;
    return NextResponse.json({ error: message }, { status });
}

export async function GET() {
    try {
        const { data, error } = await supabase
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
        const name = formData.get('name');
        const location = formData.get('location');
        const description = formData.get('description');

        if (!name) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const images = await collectImageUrls({
            supabase,
            inputs: formData.getAll('images'),
            folder: 'investments',
            prefix: 'inv-'
        });

        const { data, error } = await supabase
            .from('investments')
            .insert([{
                name,
                location,
                description,
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
        const id = formData.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
        }

        const updates = {};
        if (formData.has('name')) updates.name = formData.get('name');
        if (formData.has('location')) updates.location = formData.get('location');
        if (formData.has('description')) updates.description = formData.get('description');

        const imageInputs = formData.getAll('images');
        if (imageInputs.length > 0) {
            const newImages = await collectImageUrls({
                supabase,
                inputs: imageInputs,
                folder: 'investments',
                prefix: 'inv-'
            });

            if (newImages.length > 0) updates.images = newImages;
        }

        const { data, error } = await supabase
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

        const { error } = await supabase
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
