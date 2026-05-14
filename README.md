# Bind

A **frontend-only** strength and coaching companion for a rugby **forward pack**, built around a scrum-centric training framework. There is **no database**: all content comes from a checked-in JSON file.

## Stack

- [Next.js](https://nextjs.org) (App Router) · React 19 · TypeScript
- [Tailwind CSS](https://tailwindcss.com) v4
- [Framer Motion](https://www.framer.com/motion/) · [Lucide](https://lucide.dev) icons

Install and run with **pnpm** (recommended on this project):

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). The home route redirects to the exercise library.

Other scripts:

```bash
pnpm build    # production build
pnpm start    # run production server
pnpm lint     # eslint
```

## What you get

The UI is a **mobile-style** dark layout: bottom navigation, grouped exercise cards, expandable sessions and position notes.

| Route | Purpose |
|--------|---------|
| `/` | Exercise library by category plus an injury-prevention summary |
| `/exercise/[id]` | Single exercise: coaching points, prescription, notes, set tracker |
| `/sessions` | Example training days (expandable blocks) |
| `/positions` | Front row / locks / loose forwards priorities and suggestions |
| `/principles` | Coaching principles and advanced methods |

Legacy URLs **`/scrum`** and **`/scrum/[id]`** redirect to **`/`** and **`/exercise/[id]`**.

## Editing content

- **Source file:** [`data/scrum-strength-framework.json`](data/scrum-strength-framework.json)
- **Types and helpers:** [`lib/scrum/types.ts`](lib/scrum/types.ts), [`lib/scrum/data.ts`](lib/scrum/data.ts)

After structural changes (new top-level keys or shapes), extend the TypeScript types and any components that should display them. **Do not rely on migrations** — there is no server-side datastore in this app.

## Project layout (high level)

- `app/` — routes and layouts
- `components/scrum-app/` — shared UI (navigation, cards, sessions, principles, etc.)
- `data/` — framework JSON
- `lib/scrum/` — parsing, IDs, helpers

---

The `scripts/` directory is listed in `.gitignore` so local tooling can live there without being committed. If you add your own helpers, keep paths and package scripts aligned with your machine.
