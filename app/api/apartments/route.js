import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { writeFile } from 'fs/promises';

const dataFilePath = path.join(process.cwd(), 'data', 'apartments.json');
const uploadsDir = path.join(process.cwd(), 'public', 'uploads');

async function getApartments() {
    try {
        const fileContent = await fs.readFile(dataFilePath, 'utf8');
        return JSON.parse(fileContent);
    } catch (error) {
        return [];
    }
}

async function saveApartments(apartments) {
    await fs.writeFile(dataFilePath, JSON.stringify(apartments, null, 2));
}

export async function GET() {
    try {
        const apartments = await getApartments();
        return NextResponse.json(apartments);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to load apartments' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const formData = await request.formData();

        // ... existing POST logic reused or extracted ...
        // Since we are replacing the file, we copy the logic here or refactor.
        // For simplicity in this replacement, I'll keep the full logic.

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
        if (imageFiles.length > 0) {
            try { await fs.access(uploadsDir); } catch { await fs.mkdir(uploadsDir, { recursive: true }); }
            for (const file of imageFiles) {
                if (file && file.name) {
                    const bytes = await file.arrayBuffer();
                    const buffer = Buffer.from(bytes);
                    const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${file.name.replace(/\s/g, '-')}`;
                    const filePath = path.join(uploadsDir, fileName);
                    await writeFile(filePath, buffer);
                    images.push(`/uploads/${fileName}`);
                }
            }
        }

        const apartments = await getApartments();
        const apartmentToAdd = {
            id: Date.now().toString(),
            name,
            floor: Number(floor),
            rooms: Number(rooms),
            area: Number(area),
            price: Number(price),
            status,
            description,
            images,
            imageUrl: images.length > 0 ? images[0] : null
        };

        apartments.push(apartmentToAdd);
        await saveApartments(apartments);

        return NextResponse.json(apartmentToAdd, { status: 201 });
    } catch (error) {
        console.error(error);
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

        const apartments = await getApartments();
        const index = apartments.findIndex(apt => apt.id === id);

        if (index === -1) {
            return NextResponse.json({ error: 'Apartment not found' }, { status: 404 });
        }

        const existingApartment = apartments[index];

        // Update basic fields
        if (formData.has('name')) existingApartment.name = formData.get('name');
        if (formData.has('floor')) existingApartment.floor = Number(formData.get('floor'));
        if (formData.has('rooms')) existingApartment.rooms = Number(formData.get('rooms'));
        if (formData.has('area')) existingApartment.area = Number(formData.get('area'));
        if (formData.has('price')) existingApartment.price = Number(formData.get('price'));
        if (formData.has('status')) existingApartment.status = formData.get('status');
        if (formData.has('description')) existingApartment.description = formData.get('description');

        // Handle new images
        const imageFiles = formData.getAll('images');
        if (imageFiles.length > 0) {
            try { await fs.access(uploadsDir); } catch { await fs.mkdir(uploadsDir, { recursive: true }); }
            for (const file of imageFiles) {
                if (file && file.name) {
                    const bytes = await file.arrayBuffer();
                    const buffer = Buffer.from(bytes);
                    const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${file.name.replace(/\s/g, '-')}`;
                    const filePath = path.join(uploadsDir, fileName);
                    await writeFile(filePath, buffer);
                    if (!existingApartment.images) existingApartment.images = [];
                    existingApartment.images.push(`/uploads/${fileName}`);
                }
            }
            // Update primary image if needed
            if (existingApartment.images.length > 0) {
                existingApartment.imageUrl = existingApartment.images[0];
            }
        }

        // Handle image removal (optional logic, simplifed for now to just append new ones. 
        // Real deletion would need specific IDs of images to remove)

        apartments[index] = existingApartment;
        await saveApartments(apartments);

        return NextResponse.json(existingApartment);

    } catch (error) {
        console.error(error);
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

        const apartments = await getApartments();
        const filteredApartments = apartments.filter(apt => apt.id !== id);

        if (apartments.length === filteredApartments.length) {
            return NextResponse.json({ error: 'Apartment not found' }, { status: 404 });
        }

        await saveApartments(filteredApartments);
        return NextResponse.json({ message: 'Apartment deleted' });

    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete apartment' }, { status: 500 });
    }
}
