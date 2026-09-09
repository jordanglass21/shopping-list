# Shopping List

A grocery list web app that turns recipes into shopping lists, sorts items by supermarket aisle, and syncs across devices.

<img width="656" height="817" alt="Screenshot 2026-09-09 at 5 07 16 PM" src="https://github.com/user-attachments/assets/fb8a8725-89d4-40d4-9c60-c9b53c27f06c" />


**Live demo:** [list.jordanglass.dev](https://list.jordanglass.dev)

## Features

- **Recipe import** — paste a recipe's ingredients and they're parsed into shopping items. A review step lets you edit before anything is added.
- **Aisle categorization** — items auto-sort into supermarket sections, with one-tap recategorization.
- **Saved lists** — save a list and reload it later as a fresh copy.
- **Check-off & progress** — mark items bought with a running "X left" count.
- **Authentication** — one-tap Google sign-in with a magic-link email fallback.

<img width="757" height="762" alt="Screenshot 2026-09-09 at 5 28 50 PM" src="https://github.com/user-attachments/assets/4a30bbdd-6c42-438d-8886-5209623859f6" />

<img width="663" height="740" alt="Screenshot 2026-09-09 at 5 06 36 PM" src="https://github.com/user-attachments/assets/6572c035-da68-4c3c-8ac5-39fd122aa238" />

## Tech stack

Next.js (App Router) · React · TypeScript · Tailwind CSS · Supabase (PostgreSQL, Row Level Security, OAuth) · Vercel

## Architecture

- **Security at the data layer** — PostgreSQL Row Level Security enforces per-user access, so the client uses a publishable key safely.
- **Hooks-as-viewmodel** — data logic lives in custom hooks (`useItems`, `useLists`, `useRecipeImport`), keeping components presentational.
- **Version-controlled schema** — the database is defined in Supabase CLI migrations.
- **Deterministic parsing** — recipe parsing is rule-based with a human review step, favoring accuracy over cleverness.

## Running locally

```bash
git clone https://github.com/jordanglass21/shopping-list.git
cd shopping-list
npm install
```

Add a `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-publishable-key
```

Then `npm run dev`.
