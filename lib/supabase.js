import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function createSupabaseClient(key, label) {
    if (!supabaseUrl || !key) {
        throw new Error(`Missing Supabase environment variables for ${label}.`);
    }

    return createClient(supabaseUrl, key, {
        auth: {
            persistSession: false,
            autoRefreshToken: false
        }
    });
}

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY.');
}

// Client/browser-safe Supabase client.
export const supabase = createSupabaseClient(supabaseAnonKey, 'public client');

// Server-side client for API routes and privileged operations.
// Falls back to anon key in development when service role key is unavailable.
export const supabaseServer = createSupabaseClient(
    supabaseServiceRoleKey || supabaseAnonKey,
    'server client'
);

export const hasServiceRoleKey = Boolean(supabaseServiceRoleKey);
