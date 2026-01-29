import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { writeFile } from 'fs/promises';

const dataFilePath = path.join(process.cwd(), 'data', 'investments.json');
const uploadsDir = path.join(process.cwd(), 'public', 'uploads');

async function getInvestments() {
    try {
        const fileContent = await fs.readFile(dataFilePath, 'utf8');
        return JSON.parse(fileContent);
    } catch (error) {
        return [];
    }
}

async function saveInvestments(data) {
    await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2));
}

export async function GET() {
    try {
        const data = await getInvestments();
        return NextResponse.json(data);
    } catch (error) {
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
        if (imageFiles.length > 0) {
            try { await fs.access(uploadsDir); } catch { await fs.mkdir(uploadsDir, { recursive: true }); }
            for (const file of imageFiles) {
                if (file && file.name) {
                    const bytes = await file.arrayBuffer();
                    const buffer = Buffer.from(bytes);
                    const fileName = `inv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${file.name.replace(/\s/g, '-')}`;
                    const filePath = path.join(uploadsDir, fileName);
                    await writeFile(filePath, buffer);
                    images.push(`/uploads/${fileName}`);
                }
            }
        }

        const currentData = await getInvestments();
        const newItem = {
            id: Date.now().toString(),
            name,
            location,
            description,
            images,
        };

        currentData.push(newItem);
        await saveInvestments(currentData);

        return NextResponse.json(newItem, { status: 201 });
    } catch (error) {
        console.error(error);
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

        const currentData = await getInvestments();
        const index = currentData.findIndex(item => item.id === id);

        if (index === -1) {
            return NextResponse.json({ error: 'Investment not found' }, { status: 404 });
        }

        const existingItem = currentData[index];

        if (formData.has('name')) existingItem.name = formData.get('name');
        if (formData.has('location')) existingItem.location = formData.get('location');
        if (formData.has('description')) existingItem.description = formData.get('description');

        const imageFiles = formData.getAll('images');
        if (imageFiles.length > 0) {
            try { await fs.access(uploadsDir); } catch { await fs.mkdir(uploadsDir, { recursive: true }); }
            for (const file of imageFiles) {
                if (file && file.name) {
                    const bytes = await file.arrayBuffer();
                    const buffer = Buffer.from(bytes);
                    const fileName = `inv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${file.name.replace(/\s/g, '-')}`;
                    const filePath = path.join(uploadsDir, fileName);
                    await writeFile(filePath, buffer);
                    if (!existingItem.images) existingItem.images = [];
                    existingItem.images.push(`/uploads/${fileName}`);
                }
            }
        }

        currentData[index] = existingItem;
        await saveInvestments(currentData);

        return NextResponse.json(existingItem);

    } catch (error) {
        console.error(error);
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

        const currentData = await getInvestments();
        const filteredData = currentData.filter(item => item.id !== id);

        if (currentData.length === filteredData.length) {
            return NextResponse.json({ error: 'Investment not found' }, { status: 404 });
        }

        await saveInvestments(filteredData);
        return NextResponse.json({ message: 'Investment deleted' });

    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete investment' }, { status: 500 });
    }
}
