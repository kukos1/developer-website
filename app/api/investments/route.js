import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

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
    try {
        const formData = await request.formData();
        const name = formData.get('name');
        const location = formData.get('location');
        const description = formData.get('description');
        const imageFiles = formData.getAll('images');

        if (!name) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const images = [];
        for (const file of imageFiles) {
            if (file && file.name) {
                const bytes = await file.arrayBuffer();
                const buffer = Buffer.from(bytes);
                const fileName = `inv-${Date.now()}-${file.name.replace(/\s/g, '-')}`;

                const { error: uploadError } = await supabase.storage
                    .from('uploads')
                    .upload(`investments/${fileName}`, buffer, {
                        contentType: file.type,
                        upsert: true
                    });

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('uploads')
                    .getPublicUrl(`investments/${fileName}`);

                images.push(publicUrl);
            }
        }

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
        return NextResponse.json({ error: 'Failed to save investment' }, { status: 500 });
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
        if (formData.has('name')) updates.name = formData.get('name');
        if (formData.has('location')) updates.location = formData.get('location');
        if (formData.has('description')) updates.description = formData.get('description');

        const imageFiles = formData.getAll('images');
        if (imageFiles.length > 0) {
            const newImages = [];
            for (const file of imageFiles) {
                if (file && file.name) {
                    const bytes = await file.arrayBuffer();
                    const buffer = Buffer.from(bytes);
                    const fileName = `inv-${Date.now()}-${file.name.replace(/\s/g, '-')}`;

                    const { error: uploadError } = await supabase.storage
                        .from('uploads')
                        .upload(`investments/${fileName}`, buffer, {
                            contentType: file.type,
                            upsert: true
                        });

                    if (uploadError) throw uploadError;

                    const { data: { publicUrl } } = supabase.storage
                        .from('uploads')
                        .getPublicUrl(`investments/${fileName}`);

                    newImages.push(publicUrl);
                }
            }
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
        return NextResponse.json({ error: 'Failed to update investment' }, { status: 500 });
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
