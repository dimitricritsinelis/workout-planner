# Workout Planner

Professional workout plan builder (Next.js) with high-fidelity PDF export.

This repo is designed for fitness coaches who want a fast, repeatable workflow:
- Pick exercises from a preloaded library (image + name + default Rx)
- Assemble a multi-day plan by sections (Movement Prep, Strength Blocks, Regeneration)
- Override prescriptions quickly
- Export a client-ready PDF

## Repo structure

```text
workout-planner/
  workout-planner-app/           # Next.js web app + PDF export
  workout-assets-from-pdf/       # Extracted exercise images + seed JSON (source-of-truth)
  Justin Jones - 5 Day Strength.pdf  # Reference template (optional, recommended to keep)
```

Notes:
- `workout-planner-app/` already includes a copy of the seed library + images under `data/` and `public/exercises/`.
- `workout-assets-from-pdf/` is kept as the reproducible input set (so we can re-sync assets cleanly).

## Quick start (Mac)

From the app folder:

```bash
cd workout-planner-app
npm install
npx playwright install chromium
npm run dev
```

Open:
- http://localhost:3000 (Plan Builder)
- http://localhost:3000/library (Exercise Library)

## What you can do today

### Build a plan
- Set **Client name** and **Plan title**
- Select a **Day**
- Select a **Section** (Movement Prep / Strength Blocks / Regeneration)
- Click **Add** on exercise tiles
- Override **Rx** inline

### Export PDF
- Click **Export PDF**
- The app calls `POST /api/pdf` and downloads a Letter-sized PDF

## PDF export pipeline

PDFs are generated server-side for consistency.

- Entry point: `workout-planner-app/app/api/pdf/route.ts`
- Renderer: `workout-planner-app/lib/pdf/renderPlanHtml.tsx`
  - Produces HTML/CSS that mirrors the reference style
  - Inlines images as data URIs to make output deterministic
- Engine: Playwright `page.pdf()`

If you want the PDF to match a specific brand system (logo, colors, typography), update the CSS in:
- `workout-planner-app/lib/pdf/renderPlanHtml.tsx`

## Exercise library

### Where exercises live
- Seed data: `workout-planner-app/data/exercises.seed.json`
- Images: `workout-planner-app/public/exercises/*.png`

### Add or edit an exercise
1. Add an image under `workout-planner-app/public/exercises/`
2. Add an entry to `workout-planner-app/data/exercises.seed.json`

Shape:

```json
{
  "id": "unique-string",
  "name": "DB Bench Press",
  "category": "Strength Blocks",
  "defaultRx": "3x10",
  "image": "/exercises/db-bench-press.png"
}
```

Conventions:
- `image` must start with `/exercises/...` so it can be served by Next.js and inlined into PDFs
- Keep `id` stable once used (PDF items store `exerciseId`)

## Syncing assets from the extracted folder

If you update or regenerate the assets in `workout-assets-from-pdf/`, sync them into the app:

```bash
# from repo root
cp -R workout-assets-from-pdf/public/exercises/* workout-planner-app/public/exercises/
cp workout-assets-from-pdf/data/exercises.seed.json workout-planner-app/data/exercises.seed.json
```

## Roadmap

High-impact upgrades that fit the product goals:
- Drag/drop reordering within and across sections
- Local persistence (autosave to localStorage)
- “Template” workflow (save reusable plan templates)
- Multi-week progression columns in the PDF (Week 1-2, 3-4, 5-6, Notes)
- PWA install (Home Screen icon + offline caching)

## Contributing

See `agents.md` for implementation rules and guardrails.

