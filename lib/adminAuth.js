import { createHmac, timingSafeEqual } from 'node:crypto';

const ADMIN_COOKIE_NAME = 'admin_session';
const SESSION_DURATION_SECONDS = 60 * 60 * 12;

function base64UrlEncode(value) {
    return Buffer.from(value).toString('base64url');
}

function base64UrlDecode(value) {
    return Buffer.from(value, 'base64url').toString('utf8');
}

function getSessionSecret() {
    if (process.env.ADMIN_SESSION_SECRET) return process.env.ADMIN_SESSION_SECRET;

    if (process.env.NODE_ENV !== 'production') {
        console.warn('ADMIN_SESSION_SECRET is not set. Using development fallback secret.');
        return 'dev-admin-session-secret-change-me';
    }

    throw new Error('ADMIN_SESSION_SECRET is required in production.');
}

function getAdminPassword() {
    if (process.env.ADMIN_PASSWORD) return process.env.ADMIN_PASSWORD;

    if (process.env.NODE_ENV !== 'production') {
        console.warn('ADMIN_PASSWORD is not set. Using development fallback password.');
        return 'admin123';
    }

    throw new Error('ADMIN_PASSWORD is required in production.');
}

function createSignature(payloadBase64, secret) {
    return createHmac('sha256', secret).update(payloadBase64).digest('base64url');
}

function parseToken(token) {
    if (!token || typeof token !== 'string') return null;

    const [payloadBase64, signature] = token.split('.');
    if (!payloadBase64 || !signature) return null;

    return { payloadBase64, signature };
}

function parseCookieHeader(cookieHeader = '') {
    const cookies = {};

    for (const rawCookie of cookieHeader.split(';')) {
        const item = rawCookie.trim();
        if (!item) continue;

        const separatorIndex = item.indexOf('=');
        if (separatorIndex === -1) continue;

        const name = item.slice(0, separatorIndex).trim();
        const value = item.slice(separatorIndex + 1).trim();
        cookies[name] = value;
    }

    return cookies;
}

export function isAdminPasswordValid(password) {
    try {
        const expected = getAdminPassword();
        const providedBuffer = Buffer.from(String(password ?? ''));
        const expectedBuffer = Buffer.from(expected);

        if (providedBuffer.length !== expectedBuffer.length) return false;
        return timingSafeEqual(providedBuffer, expectedBuffer);
    } catch (error) {
        console.error('Admin password validation failed:', error);
        return false;
    }
}

export function createAdminSessionToken() {
    const secret = getSessionSecret();
    const payload = {
        exp: Date.now() + SESSION_DURATION_SECONDS * 1000
    };
    const payloadBase64 = base64UrlEncode(JSON.stringify(payload));
    const signature = createSignature(payloadBase64, secret);

    return `${payloadBase64}.${signature}`;
}

export function isAdminSessionTokenValid(token) {
    try {
        const secret = getSessionSecret();
        const parsed = parseToken(token);
        if (!parsed) return false;

        const { payloadBase64, signature } = parsed;
        const expectedSignature = createSignature(payloadBase64, secret);

        const providedBuffer = Buffer.from(signature);
        const expectedBuffer = Buffer.from(expectedSignature);
        if (providedBuffer.length !== expectedBuffer.length) return false;
        if (!timingSafeEqual(providedBuffer, expectedBuffer)) return false;

        const payload = JSON.parse(base64UrlDecode(payloadBase64));
        if (!payload?.exp || typeof payload.exp !== 'number') return false;

        return payload.exp > Date.now();
    } catch (error) {
        console.error('Admin token validation failed:', error);
        return false;
    }
}

export function isAdminRequestAuthorized(request) {
    const cookieHeader = request.headers.get('cookie') || '';
    const cookies = parseCookieHeader(cookieHeader);
    const token = cookies[ADMIN_COOKIE_NAME];
    return isAdminSessionTokenValid(token);
}

export function setAdminSessionCookie(response, token) {
    response.cookies.set({
        name: ADMIN_COOKIE_NAME,
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: SESSION_DURATION_SECONDS,
        path: '/'
    });
}

export function clearAdminSessionCookie(response) {
    response.cookies.set({
        name: ADMIN_COOKIE_NAME,
        value: '',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 0,
        path: '/'
    });
}
