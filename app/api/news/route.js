import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

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
    try {
        const formData = await request.formData();
        const title = formData.get('title');
        const date = formData.get('date') || new Date().toISOString().split('T')[0];
        const content = formData.get('content');
        const imageFile = formData.get('image');

        if (!title || !content) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        let imageUrl = null;
        if (imageFile && imageFile.name) {
            const bytes = await imageFile.arrayBuffer();
            const buffer = Buffer.from(bytes);
            const fileName = `news-${Date.now()}-${imageFile.name.replace(/\s/g, '-')}`;

            const { error: uploadError } = await supabase.storage
                .from('uploads')
                .upload(`news/${fileName}`, buffer, {
                    contentType: imageFile.type,
                    upsert: true
                });

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('uploads')
                .getPublicUrl(`news/${fileName}`);

            imageUrl = publicUrl;
        }

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
        return NextResponse.json({ error: 'Failed to save news' }, { status: 500 });
    }
}

export async function PUT(request) {
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

        const imageFile = formData.get('image');
        if (imageFile && imageFile.name) {
            const bytes = await imageFile.arrayBuffer();
            const buffer = Buffer.from(bytes);
            const fileName = `news-${Date.now()}-${imageFile.name.replace(/\s/g, '-')}`;

            const { error: uploadError } = await supabase.storage
                .from('uploads')
                .upload(`news/${fileName}`, buffer, {
                    contentType: imageFile.type,
                    upsert: true
                });

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('uploads')
                .getPublicUrl(`news/${fileName}`);

            updates.image = publicUrl;
        }

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
        return NextResponse.json({ error: 'Failed to update news' }, { status: 500 });
    }
}

export async function DELETE(request) {
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
