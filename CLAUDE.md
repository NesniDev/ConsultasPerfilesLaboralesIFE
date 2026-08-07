# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Astro 7 dashboard for managing student ("Estudiantes") work-profile records. Single-page app (`src/pages/index.astro`) with vanilla JS on the client and a small Supabase-backed JSON API on the server. No React/Vue/Svelte components.

## Commands

```bash
npm run dev          # dev server (foreground)
astro dev --background   # dev server (background)
astro dev stop       # stop background server
astro dev status     # check server status
astro dev logs       # view server logs
npm run build        # production build → dist/
npm run preview      # preview production build
```

Requires a `.env` (git-ignored) with `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` — `src/lib/supabase.js` throws at import time if either is missing.

## Architecture

```
src/
  pages/
    index.astro             # single page — composes the dashboard sections
    api/
      estudiantes.js         # GET (list) / POST (create)
      estudiantes/[id].js    # GET (one) / PUT (update) / DELETE
  lib/
    supabase.js              # server-only Supabase client (service role key)
    validation.js            # validateCreate / validateUpdate for API bodies
    mapping.js                # UI/API body → Supabase row shape
    http.js                   # json() Response helper
  layouts/Layout.astro       # HTML shell, meta, fonts, global reset, CSS variables (:root)
  styles/dashboard.css       # all component styles (~1270 lines)
  scripts/
    api.js                   # StudentApi — fetch client for /api/estudiantes
    store.js                 # StudentStore — async data layer, maps API rows ↔ UI model
    app.js                   # DOM rendering/wiring — NOT served, copy to public/scripts/ after edits
  components/
    Navbar.astro             # top navbar: brand logo + nav links + mobile menu
    PageHeader.astro         # gradient hero header + global search
    StatsCards.astro         # 4 stat cards (config-driven, prop array)
    RegistrosCard.astro      # composes FiltersBar + StudentTable + TablePagination
    FiltersBar.astro         # filters bar — ONLY the document filter
    StudentTable.astro       # sortable thead + empty tbody (rows rendered by app.js)
    TablePagination.astro    # empty footer (pagination rendered by app.js)
    ToastContainer.astro     # toast notifications container
    modals/
      StudentFormModal.astro   # create/edit form modal
      StudentDetailModal.astro # detail view modal
      ConfirmModal.astro       # delete confirmation modal
public/
  scripts/               # served client-side JS (copies of src/scripts/*.js)
  LOGO-IFE.png           # main brand logo (used in Navbar)
```

**Critical quirk**: `src/scripts/*.js` (`api.js`, `store.js`, `app.js`) are NOT served by Astro. All three must be copied to `public/scripts/` to be available at runtime. `index.astro` loads them in that order via `<script is:inline src="/scripts/...">`.

**`is:inline` required**: script tags referencing a public asset MUST use `is:inline` or the build fails with a Vite bundling error.

**Static output + per-route SSR**: `astro.config.mjs` sets `output: 'static'` with the `@astrojs/node` adapter (standalone mode). `src/pages/index.astro` is prerendered as static HTML; the two files under `src/pages/api/` opt back into server rendering with `export const prerender = false`, so they run as real request handlers at runtime instead of being prerendered.

**Component contracts**: `app.js` manipulates the DOM by fixed IDs (`student-tbody`, `table-footer`, `stat-*`, `field-*`, `form-modal`, `toast-container`, etc.). When editing components, keep every ID and `onclick`/`oninput` handler referenced by `app.js` intact — check `src/scripts/app.js` before removing anything.

## Data flow

Backend is Supabase (table `Estudiantes`), accessed **only** from the server — `src/lib/supabase.js` uses the service role key and is never imported by client code. The browser never talks to Supabase directly:

```
app.js (DOM) → store.js (StudentStore, UI model) → api.js (StudentApi, fetch) → /api/estudiantes* → lib/supabase.js → Supabase
```

- API rows use snake_case fields (`full_name`, `documento`, `fecha_inicio`, `fecha_fin`, `meses`, `consecutivo`, `tipo_documento`, `funciones`, `created_at`).
- `store.js` maps rows to a UI model that splits `full_name` into `nombres`/`apellidos` (`toUiModel`/`toApiPayload`), and keeps an in-memory `students` array kept in sync after create/update/delete.
- Server-side validation (`src/lib/validation.js`) and mapping (`src/lib/mapping.js`) are the source of truth for required fields — required: `full_name`, `documento`, `cargo`, `fecha_inicio`, `fecha_fin`, `meses`, `consecutivo`.
- Duplicate `documento` on insert/update returns HTTP 409 (Postgres unique-violation code `23505`).

## Node

Requires Node >= 22.12.0 (enforced in package.json `engines`).

## Styling

No Tailwind. Pure CSS with custom properties (blue palette) in `src/styles/dashboard.css`. Imported in the Astro frontmatter of `index.astro`.

## Build

`npm run build` produces `dist/` with a static entry page plus a Node standalone server (from the `@astrojs/node` adapter) for the `/api/estudiantes*` routes.
