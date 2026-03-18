# Developer Website

Nowoczesna strona dewelopera oparta o Next.js (App Router) i Supabase.

## Wymagania

- Node.js 20+
- npm

## Konfiguracja

Utworz plik `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY

# Wymagane do bezpiecznego logowania panelu admina
ADMIN_PASSWORD=change-me
ADMIN_SESSION_SECRET=change-this-to-a-long-random-string
```

W produkcji `ADMIN_PASSWORD` i `ADMIN_SESSION_SECRET` musza byc ustawione.

## Uruchomienie

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run start
```

## Panel administratora

- URL: `/admin`
- Logowanie odbywa sie po stronie serwera (`/api/admin/login`)
- Sesja jest przechowywana w cookie `httpOnly`
- Endpointy modyfikujace CMS (`POST/PUT/DELETE`) wymagaja aktywnej sesji admina
