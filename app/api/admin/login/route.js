import { NextResponse } from 'next/server';
import {
    createAdminSessionToken,
    isAdminPasswordValid,
    setAdminSessionCookie
} from '@/lib/adminAuth';

export const runtime = 'nodejs';

export async function POST(request) {
    try {
        const body = await request.json().catch(() => null);
        const password = typeof body?.password === 'string' ? body.password : '';

        if (!password) {
            return NextResponse.json({ error: 'Password is required.' }, { status: 400 });
        }

        if (!isAdminPasswordValid(password)) {
            return NextResponse.json({ error: 'Invalid password.' }, { status: 401 });
        }

        const token = createAdminSessionToken();
        const response = NextResponse.json({ authenticated: true });
        setAdminSessionCookie(response, token);
        return response;
    } catch (error) {
        console.error('Admin login failed:', error);
        return NextResponse.json({ error: 'Login failed.' }, { status: 500 });
    }
}
