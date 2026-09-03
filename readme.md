# Shopping List

A shopping list that lives on your phone in the store — with the option to build it from recipes on your computer at home.

## What it does

Two ways to add things:

- **Everyday items** — add one at a time, check them off as you shop.
- **Recipes** — paste a recipe and it becomes shopping-list items automatically, converted into purchase quantities ("3 eggs" → "1 dozen eggs").

Everything syncs across devices, so a list built on a laptop is on the phone by the time you're in the parking lot.

## Core features

**Accounts & sync.** Log in on any device and see the same list. Build at home, shop on mobile.

**Check-off.** Tap to mark purchased. Checked items stay visible but recede, so you can un-check a mistake.

**Aisle categorization.** New items are automatically sorted into supermarket sections — produce, meat, dairy, pantry, frozen, household — so the list follows the shape of the store instead of the order you thought of things. Categories are editable; a wrong guess should be one tap to fix.

**Recipe tags.** Items added from a recipe carry a subtle colored border matching that recipe, so a glance tells you what's for Sunday's chili and what's just the usual milk-and-eggs. Manually added items are untagged. Each recipe gets its own color.

**Notes export (optional).** Share the list as plain text to iOS Notes or anywhere else. Secondary now that the list is persistent and lives in the app.

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js (App Router) + TypeScript |
| Styling | Tailwind CSS |
| Auth + database | Supabase (email/password or magic link, Postgres) |
| LLM | Claude API — server-side only |
| Hosting | Vercel |
| Later | PWA manifest + service worker; camera capture |

**Why web, not native:** works on every device with one codebase, no App Store review, instant updates. Installs to the home screen as a PWA and behaves like an app. The native share sheet is reachable from mobile Safari, so Notes export still works.

## Constraints worth knowing

- **Apple has no public API for writing into Notes.** The only supported path is the share sheet, where the user taps "Notes" themselves. A one-tap handoff, not a silent background write.
- **Aisle layouts vary by store.** Start with sensible defaults rather than trying to model specific supermarkets. Per-store customization is a "later, if it's actually annoying" feature.
- **Offline matters more than usual.** Grocery stores have bad signal. Checking items off should work without a connection and sync when it returns.

---

## Development phases

### Phase 1 — Foundation
Project scaffold, accounts, and the data model behind lists, items, categories, and recipes. Deploy to Vercel immediately so mobile can be tested on a real device from day one.

**Done when:** you can log in on a laptop and a phone and both see the same empty list.

### Phase 2 — Manual list
The complete everyday shopping list: add items, check them off, delete, reorder, edit. No AI involved.

This is a genuinely useful product on its own. Get it good before adding anything else — if this part isn't pleasant to use in a store, no amount of recipe cleverness will save it.

**Done when:** you'd use it for a real grocery run.

### Phase 3 — Categorization
Items sort themselves into supermarket sections as they're added. Sensible defaults for common groceries, with a fallback for anything unrecognized. Categories are editable and corrections stick.

**Done when:** a 20-item list is grouped the way you'd actually walk the store.

### Phase 4 — Recipe import
Paste a recipe → it becomes tagged items on the list.

Two things happening here: extracting ingredients from messy text, and converting cooking quantities into purchase quantities. The second is the hard one — the point is a list you can shop from, so don't demand a whole pound of butter for 2 tablespoons, and flag trivial amounts as "you probably have this" instead of inflating the list. Merge duplicates across recipes.

Each imported recipe gets a color; its items carry that border until they're checked off.

**Done when:** three recipes and a handful of manual items coexist on one list and it's obvious at a glance which is which.

### Phase 5 — Polish & offline
Installable PWA. Offline-capable check-off with sync on reconnect. Loading, error, and empty states. Notes export. Real attention to the mobile experience — this is a one-handed, in-a-store, gloves-on kind of app.

**Done when:** it works in a store with one bar of signal.

### Phase 6 — Camera
Photograph a recipe instead of pasting it. The image becomes text, then feeds the exact pipeline built in Phase 4 — nothing gets thrown away.

**Done when:** a photo of a cookbook page produces the same quality of list as pasted text.

---

## Build order rationale

Phases 2 and 3 make a complete, useful app with no AI in it at all. Everything after that is enhancement. If the project stalls halfway, you still have a shopping list you use — which is the right shape for a side project.