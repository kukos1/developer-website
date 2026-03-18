import { Buffer } from 'node:buffer';

const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024;

function sanitizeFileName(fileName = 'image') {
    return fileName
        .normalize('NFKD')
        .replace(/[^\w.\-]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
}

function isFileLike(value) {
    return (
        value &&
        typeof value === 'object' &&
        typeof value.name === 'string' &&
        typeof value.arrayBuffer === 'function'
    );
}

function isNonEmptyString(value) {
    return typeof value === 'string' && value.trim().length > 0;
}

async function uploadFileToStorage({ supabase, file, folder, prefix = '' }) {
    if (!isFileLike(file) || !file.name) return null;

    if (typeof file.size === 'number' && file.size > MAX_FILE_SIZE_BYTES) {
        throw new Error(`File "${file.name}" is larger than 50MB.`);
    }

    const safeName = sanitizeFileName(file.name);
    const uniqueSegment = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const filePath = `${folder}/${prefix}${uniqueSegment}-${safeName}`;
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const { error: uploadError } = await supabase.storage
        .from('uploads')
        .upload(filePath, buffer, {
            contentType: file.type || 'application/octet-stream',
            upsert: false
        });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
        .from('uploads')
        .getPublicUrl(filePath);

    return publicUrl;
}

export async function collectImageUrls({ supabase, inputs, folder, prefix = '' }) {
    const urls = [];

    for (const input of inputs) {
        if (isNonEmptyString(input)) {
            urls.push(input.trim());
            continue;
        }

        const uploadedUrl = await uploadFileToStorage({ supabase, file: input, folder, prefix });
        if (uploadedUrl) urls.push(uploadedUrl);
    }

    return urls;
}

export async function collectSingleImageUrl({ supabase, input, folder, prefix = '' }) {
    const urls = await collectImageUrls({
        supabase,
        inputs: input == null ? [] : [input],
        folder,
        prefix
    });

    return urls[0] || null;
}
