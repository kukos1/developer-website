import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
    try {
        const { data, error } = await supabase
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
    try {
        const formData = await request.formData();
        const name = formData.get('name');
        const floor = formData.get('floor');
        const rooms = formData.get('rooms');
        const area = formData.get('area');
        const price = formData.get('price');
        const status = formData.get('status') || 'available';
        const description = formData.get('description');
        const imageFiles = formData.getAll('images');

        if (!name || !price || !area) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const images = [];
        for (const file of imageFiles) {
            if (file && file.name) {
                const bytes = await file.arrayBuffer();
                const buffer = Buffer.from(bytes);
                const fileName = `${Date.now()}-${file.name.replace(/\s/g, '-')}`;

                const { data, error: uploadError } = await supabase.storage
                    .from('uploads')
                    .upload(`apartments/${fileName}`, buffer, {
                        contentType: file.type,
                        upsert: true
                    });

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('uploads')
                    .getPublicUrl(`apartments/${fileName}`);

                images.push(publicUrl);
            }
        }

        const { data, error } = await supabase
            .from('apartments')
            .insert([{
                name,
                floor: Number(floor),
                rooms: Number(rooms),
                area: Number(area),
                price: Number(price),
                status,
                description,
                images,
                image_url: images.length > 0 ? images[0] : null
            }])
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(data, { status: 201 });
    } catch (error) {
        console.error('Error in POST apartments:', error);
        return NextResponse.json({ error: 'Failed to save apartment' }, { status: 500 });
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
        if (formData.has('floor')) updates.floor = Number(formData.get('floor'));
        if (formData.has('rooms')) updates.rooms = Number(formData.get('rooms'));
        if (formData.has('area')) updates.area = Number(formData.get('area'));
        if (formData.has('price')) updates.price = Number(formData.get('price'));
        if (formData.has('status')) updates.status = formData.get('status');
        if (formData.has('description')) updates.description = formData.get('description');

        const imageFiles = formData.getAll('images');
        if (imageFiles.length > 0) {
            const newImages = [];
            for (const file of imageFiles) {
                if (file && file.name) {
                    const bytes = await file.arrayBuffer();
                    const buffer = Buffer.from(bytes);
                    const fileName = `${Date.now()}-${file.name.replace(/\s/g, '-')}`;

                    const { error: uploadError } = await supabase.storage
                        .from('uploads')
                        .upload(`apartments/${fileName}`, buffer, {
                            contentType: file.type,
                            upsert: true
                        });

                    if (uploadError) throw uploadError;

                    const { data: { publicUrl } } = supabase.storage
                        .from('uploads')
                        .getPublicUrl(`apartments/${fileName}`);

                    newImages.push(publicUrl);
                }
            }

            // To be robust, we'd fetch existing images and append, but for now we follow old logic
            // providing limited image management
            if (newImages.length > 0) {
                updates.images = newImages;
                updates.image_url = newImages[0];
            }
        }

        const { data, error } = await supabase
            .from('apartments')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(data);
    } catch (error) {
        console.error('Error in PUT apartments:', error);
        return NextResponse.json({ error: 'Failed to update apartment' }, { status: 500 });
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
