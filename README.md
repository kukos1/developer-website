# Developer Website

Nowoczesna strona dewelopera oparta o Next.js (App Router) i Supabase.

## Wymagania

- Node.js 20+
- npm

## Konfiguracja

Utwórz plik `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
LEADS_STORAGE_FALLBACK=false

# Wymagane do bezpiecznego logowania panelu admina
ADMIN_PASSWORD=change-me
ADMIN_SESSION_SECRET=change-this-to-a-long-random-string
```

W produkcji `ADMIN_PASSWORD` i `ADMIN_SESSION_SECRET` muszą być ustawione.
W produkcji ustaw też `SUPABASE_SERVICE_ROLE_KEY`, aby endpointy API działały z uprawnieniami serwerowymi.

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
- Logowanie odbywa się po stronie serwera (`/api/admin/login`)
- Sesja jest przechowywana w cookie `httpOnly`
- Endpointy modyfikujące CMS (`POST/PUT/DELETE`) wymagają aktywnej sesji admina
- Zakładka `Leady` pobiera zapytania z formularza kontaktowego i pozwala zmieniać ich status
- Awaryjny zapis leadów do Storage jest domyślnie wyłączony (`LEADS_STORAGE_FALLBACK=false`)
