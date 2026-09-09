# Shopping List

A grocery list web app that turns recipes into shopping lists, sorts items by supermarket aisle, and syncs across devices.

**Live demo:** [shopping-list-oosm.vercel.app](https://shopping-list-oosm.vercel.app)

## Features

- **Recipe import** — paste a recipe's ingredients and they're parsed into shopping items. A review step lets you edit before anything is added.
- **Aisle categorization** — items auto-sort into supermarket sections, with one-tap recategorization.
- **Saved lists** — save a list and reload it later as a fresh copy.
- **Check-off & progress** — mark items bought with a running "X left" count.
- **Authentication** — one-tap Google sign-in with a magic-link email fallback.

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