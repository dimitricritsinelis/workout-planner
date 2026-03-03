# agents.md

Instructions for an AI coding agent (Codex) to improve this repo safely.

## Product goals

- Professional, minimalist, modern UI
- Fast plan assembly: searchable exercise tiles + quick Rx overrides
- PDF output must be client-ready and consistent across machines
- First-class support for Mac Chrome/Safari
- Good behavior on iPhone Safari (PWA is a later upgrade)

## Non-negotiables

- Do not remove server-side PDF generation (Playwright). Client-side PDF generation is not acceptable for this product.
- Do not introduce heavy UI frameworks (MUI, Chakra, Ant) unless explicitly requested.
- Do not change the overall information hierarchy without preserving the current speed of use.
- Keep dependencies minimal. Every new dependency must have a clear reason.

## Quick commands

From `workout-planner-app/`:

```bash
npm install
npx playwright install chromium
npm run dev
npm run lint
npm run build
```

PDF smoke test:
- Run `npm run dev`
- Open http://localhost:3000
- Add a few exercises across multiple sections
- Export PDF
- Confirm:
  - headers render
  - section colors render
  - images render
  - pagination is sane

## Architecture map

### Pages
- `app/page.tsx`
  - Plan Builder UI
  - Exports PDF via `/api/pdf`
- `app/library/page.tsx`
  - Full exercise library grid

### State
- `lib/store.ts` (Zustand)
  - Stores the working `Plan`
  - Mutations: set client name/title, add exercise instance, update Rx, remove

### Data
- `data/exercises.seed.json`
  - Preloaded exercise library

### PDF
- `app/api/pdf/route.ts`
  - Accepts `Plan` JSON
  - Calls `renderPlanHtml(plan, { inlineImages: true })`
  - Uses Playwright to print to PDF
- `lib/pdf/renderPlanHtml.tsx`
  - Generates HTML + CSS
  - Inlines `/public` images into base64 for deterministic output

## Data model (important)

- `Exercise` is a library item.
- `PlanExerciseInstance` is a per-plan copy with editable `rx`.

Rules:
- Never mutate the exercise seed data at runtime.
- Plan items should store `exerciseId` plus display fields (name/image) so PDFs can render without doing joins.

## PDF template rules

- Template changes must preserve:
  - Letter sizing
  - professional spacing
  - readable typography
  - consistent borders
- Images must continue to render even if the app is offline.
  - Keep base64 inlining enabled by default.

Where to work:
- Primary: `lib/pdf/renderPlanHtml.tsx`
- Secondary: `app/api/pdf/route.ts` for print settings (margins, format)

## Preferred improvement sequence

Implement improvements in small, testable steps. Suggested order:

1) Persistence
- Autosave plan to `localStorage`
- Add “Reset plan” and “Load last plan” controls

2) Plan assembly UX
- Drag/drop reorder within a section
- Tap-to-add improvements:
  - quick add to active section
  - optional modal for notes and Rx

3) PDF fidelity
- Make tile pages match the reference spacing more closely
- Split overflow sections across pages cleanly

4) Multi-week progression (optional, requires data model update)
- Add phases: Week 1-2, Week 3-4, Week 5-6, Notes
- Update plan schema to support:
  - rxByPhase per exercise instance
  - section notes
- Update details pages into the multi-column table format

5) PWA (optional)
- Add manifest + icons
- Offline caching for the app shell and images

## Guardrails for changes

- Keep TypeScript strictness.
- Keep UI styling in Tailwind where possible.
- Avoid large refactors that do not ship user-visible value.
- When adding a feature, update:
  - types (`lib/types.ts`)
  - store (`lib/store.ts`)
  - builder UI (`app/page.tsx`)
  - PDF output (`lib/pdf/renderPlanHtml.tsx`) if relevant

## Data quality checks (recommended)

If you touch the exercise library:
- Validate every `image` path exists under `public/`
- Validate `id` uniqueness
- Validate reasonable defaultRx values

## Definition of done

A change is done only if:
- `npm run lint` passes
- `npm run build` passes
- PDF export works locally
- No broken images in the library grid
- UI remains minimal and professional

