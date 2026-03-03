# Workout Planner App (MVP)

This is a minimal Next.js (App Router) workout plan builder + PDF export.

## What you get
- Exercise library (image + name + default Rx)
- Plan builder: 5 days, 3 sections per day (Movement Prep, Strength Blocks, Regeneration)
- Add exercises into sections, override Rx inline
- Export a professional, printable PDF using Playwright (Chromium)

## Setup
```bash
npm install
npx playwright install chromium
npm run dev
```

Open http://localhost:3000

## Notes
- PDF generation uses `app/api/pdf/route.ts` and Playwright's `page.pdf()`.
- Images are inlined into the PDF (data URIs) for consistent, offline rendering.
- The PDF template is in `lib/pdf/renderPlanHtml.tsx`.
