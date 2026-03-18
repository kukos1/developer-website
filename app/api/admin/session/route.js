import { NextResponse } from 'next/server';
import { isAdminRequestAuthorized } from '@/lib/adminAuth';

export const runtime = 'nodejs';

export async function GET(request) {
    const authenticated = isAdminRequestAuthorized(request);
    return NextResponse.json({ authenticated }, {
        headers: { 'Cache-Control': 'no-store' }
    });
}
