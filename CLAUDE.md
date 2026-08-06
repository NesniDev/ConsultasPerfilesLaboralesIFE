## Project

Astro 7 static site — student profile management dashboard. Single-page app, no SSR, no framework components (React/Vue/Svelte). All client-side logic is vanilla JS.

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

## Architecture

```
src/
  pages/index.astro     # single page — full dashboard UI
  layouts/Layout.astro  # HTML shell, meta, fonts, global reset
  styles/dashboard.css  # all component styles (~650 lines)
  scripts/app.js        # NOT served — copy to public/scripts/ after edits
  components/           # unused (default Astro template leftovers)
public/
  scripts/app.js        # served client-side JS (copy of src/scripts/app.js)
```

**Critical quirk**: `src/scripts/app.js` is NOT served by Astro. It must be copied to `public/scripts/app.js` to be available at runtime. The `index.astro` page loads it via `<script is:inline src="/scripts/app.js">`.

**`is:inline` required**: The script tag referencing a public asset MUST use `is:inline` or the build fails with a Vite bundling error.

## Node

Requires Node >= 22.12.0 (enforced in package.json `engines`).

## Styling

No Tailwind. Pure CSS with custom properties (blue palette) in `src/styles/dashboard.css`. Imported in the Astro frontmatter of `index.astro`.

## Data

Client-side only — localStorage persistence. 10 seed records auto-generated on first load. No backend, no API, no database.

## Build

`npm run build` produces a static `dist/` directory. One HTML file, one CSS bundle, one JS file. No prerendering config or dynamic routes.
