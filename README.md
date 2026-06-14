# 🛒 Shopping List Builder

A small **Nuxt 4** shopping-list app: search real grocery products, organize items by
which store you'll buy them at, and drag items between stores. Built as a hands-on tour
of the modern Vue/Nuxt ecosystem.

> **Status:** the list is currently stored per-browser (`localStorage`). Real
> multi-device, private sharing (just two accounts) is the planned next step via
> Supabase auth — see [Roadmap](#roadmap).

## Features

- 🔎 **Live food search** — type a food and get generic food suggestions (milk, peanut
  butter, banana…) from the [OpenFoodFacts](https://world.openfoodfacts.org) ingredients
  taxonomy.
- 🏬 **Group by store** — assign each item a store; the list renders one card per store.
- 🔀 **Drag-and-drop** — drag an item from one store card onto another to reassign it.
- ➕ **Smart add** — re-adding the same item (same store) bumps its quantity instead of
  duplicating; store names are normalized so `costco`/`Costco`/`COSTCO` collapse into one.
- ✅ **Check off / clear done**, with a completion progress bar.
- 🌗 Light/dark mode (Nuxt UI).

## Tech stack

| Concern | Choice |
| --- | --- |
| Framework | [Nuxt 4](https://nuxt.com) (Vue 3, Vite, Nitro server) |
| UI / styling | [Nuxt UI 4](https://ui.nuxt.com) (built on Tailwind CSS v4) |
| State | [Pinia](https://pinia.vuejs.org) (`@pinia/nuxt`) |
| Language | TypeScript |
| Lint | ESLint (`@nuxt/eslint`) |
| Icons | Lucide (`i-lucide-*`) |

## Getting started

Requires **Node ≥ 20.19** (or ≥ 22.12) and npm.

```bash
npm install        # install dependencies
npm run dev        # start the dev server (http://localhost:3000)
```

Other scripts:

```bash
npm run build      # production build (.output/)
npm run preview    # preview the production build locally
npm run typecheck  # type-check with vue-tsc
npm run lint       # ESLint
```

## Project structure

```
app/                       # Nuxt 4 source directory
  app.vue                  # root layout (header + <NuxtPage/>)
  pages/index.vue          # the shopping list page (grouping + drag-and-drop)
  components/
    AddItemForm.vue        # food search + store + quantity inputs
    ShoppingListItem.vue   # a single draggable item row
  composables/
    useFoodSearch.ts       # debounced, cancellable search (calls /api/foods)
  stores/
    shoppingList.ts        # Pinia store: items, grouping, normalization, persistence
  types.ts                 # Item + FoodSuggestion interfaces
  assets/css/main.css      # Tailwind + Nuxt UI theme
server/
  api/foods.get.ts         # protected server route -> OpenFoodFacts proxy
nuxt.config.ts             # modules + runtimeConfig (secret key lives here)
```

## How the "protected API" works

The browser never calls OpenFoodFacts directly. Instead:

```
browser  ──$fetch('/api/foods?q=…')──▶  server/api/foods.get.ts  ──▶  OpenFoodFacts
```

`server/api/foods.get.ts` runs only on the server, so it can read secrets from
`useRuntimeConfig()` without exposing them to the client. OpenFoodFacts needs no key,
but the pattern is wired up: set a key with the `NUXT_FOOD_API_KEY` env var and it is
sent server-side only. Doing the call server-side also avoids CORS and lets us shape and
de-duplicate the response.

### Environment variables

| Variable | Purpose | Required |
| --- | --- | --- |
| `NUXT_FOOD_API_KEY` | Secret key for the food API (server-only) | No — OpenFoodFacts is keyless |

## Deployment

This app has a **server route**, so it needs a host that runs a server — **not** GitHub
Pages (static only). Recommended: **[Vercel](https://vercel.com)**, which auto-detects
Nuxt and deploys the server route as a function. Import the GitHub repo in Vercel; set
`NUXT_FOOD_API_KEY` in the dashboard if you ever use a keyed API.

## Roadmap

- [ ] Deploy to Vercel (shareable public link)
- [ ] **Supabase auth + database** for real privacy — only two allow-listed accounts can
      see the list — and cross-device sync (replaces `localStorage`)
- [ ] Touch-friendly drag-and-drop (swap native HTML5 DnD for SortableJS / `vue-draggable-plus`)

## Notes & limitations

- **Not private yet.** The list lives in your browser's `localStorage`; anyone with the
  deployed URL gets their own empty list. Privacy/sharing arrives with the Supabase step.
- **Drag-and-drop is desktop-only** (HTML5 DnD doesn't fire on touchscreens).
- OpenFoodFacts' search can be slow at times; the UI shows a loading state and keeps
  previous results visible while typing.
