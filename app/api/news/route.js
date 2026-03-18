import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { collectSingleImageUrl } from '@/lib/storageUploads';
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
            .from('news')
            .select('*')
            .order('date', { ascending: false });

        if (error) throw error;
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching news:', error);
        return NextResponse.json({ error: 'Failed to load news' }, { status: 500 });
    }
}

export async function POST(request) {
    if (!isAdminRequestAuthorized(request)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const formData = await request.formData();
        const title = formData.get('title');
        const date = formData.get('date') || new Date().toISOString().split('T')[0];
        const content = formData.get('content');

        if (!title || !content) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const imageUrl = await collectSingleImageUrl({
            supabase,
            input: formData.get('image'),
            folder: 'news',
            prefix: 'news-'
        });

        const { data, error } = await supabase
            .from('news')
            .insert([{
                title,
                date,
                content,
                image: imageUrl
            }])
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(data, { status: 201 });
    } catch (error) {
        console.error('Error in POST news:', error);
        return getUploadErrorResponse(error, 'Failed to save news');
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
        if (formData.has('title')) updates.title = formData.get('title');
        if (formData.has('date')) updates.date = formData.get('date');
        if (formData.has('content')) updates.content = formData.get('content');

        const imageUrl = await collectSingleImageUrl({
            supabase,
            input: formData.get('image'),
            folder: 'news',
            prefix: 'news-'
        });
        if (imageUrl) updates.image = imageUrl;

        const { data, error } = await supabase
            .from('news')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(data);
    } catch (error) {
        console.error('Error in PUT news:', error);
        return getUploadErrorResponse(error, 'Failed to update news');
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
            .from('news')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({ message: 'News deleted' });
    } catch (error) {
        console.error('Error in DELETE news:', error);
        return NextResponse.json({ error: 'Failed to delete news' }, { status: 500 });
    }
}
