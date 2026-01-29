import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { writeFile } from 'fs/promises';

const dataFilePath = path.join(process.cwd(), 'data', 'news.json');
const uploadsDir = path.join(process.cwd(), 'public', 'uploads');

async function getNews() {
    try {
        const fileContent = await fs.readFile(dataFilePath, 'utf8');
        return JSON.parse(fileContent);
    } catch (error) {
        return [];
    }
}

async function saveNews(data) {
    await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2));
}

export async function GET() {
    try {
        const data = await getNews();
        return NextResponse.json(data);
    } catch (error) {
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
            try { await fs.access(uploadsDir); } catch { await fs.mkdir(uploadsDir, { recursive: true }); }
            const bytes = await imageFile.arrayBuffer();
            const buffer = Buffer.from(bytes);
            const fileName = `news-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${imageFile.name.replace(/\s/g, '-')}`;
            const filePath = path.join(uploadsDir, fileName);
            await writeFile(filePath, buffer);
            imageUrl = `/uploads/${fileName}`;
        }

        const currentData = await getNews();
        const newItem = {
            id: Date.now().toString(),
            title,
            date,
            content,
            image: imageUrl,
        };

        currentData.unshift(newItem); // Add new post to the beginning
        await saveNews(currentData);

        return NextResponse.json(newItem, { status: 201 });
    } catch (error) {
        console.error(error);
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

        const currentData = await getNews();
        const index = currentData.findIndex(item => item.id === id);

        if (index === -1) {
            return NextResponse.json({ error: 'News not found' }, { status: 404 });
        }

        const existingItem = currentData[index];

        if (formData.has('title')) existingItem.title = formData.get('title');
        if (formData.has('date')) existingItem.date = formData.get('date');
        if (formData.has('content')) existingItem.content = formData.get('content');

        const imageFile = formData.get('image');
        if (imageFile && imageFile.name) {
            try { await fs.access(uploadsDir); } catch { await fs.mkdir(uploadsDir, { recursive: true }); }
            const bytes = await imageFile.arrayBuffer();
            const buffer = Buffer.from(bytes);
            const fileName = `news-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${imageFile.name.replace(/\s/g, '-')}`;
            const filePath = path.join(uploadsDir, fileName);
            await writeFile(filePath, buffer);
            existingItem.image = `/uploads/${fileName}`;
        }

        currentData[index] = existingItem;
        await saveNews(currentData);

        return NextResponse.json(existingItem);

    } catch (error) {
        console.error(error);
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

        const currentData = await getNews();
        const filteredData = currentData.filter(item => item.id !== id);

        if (currentData.length === filteredData.length) {
            return NextResponse.json({ error: 'News not found' }, { status: 404 });
        }

        await saveNews(filteredData);
        return NextResponse.json({ message: 'News deleted' });

    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete news' }, { status: 500 });
    }
}
