# Portfolio Glance-First Redesign — Design Spec

**Date:** 2026-07-12
**Repo:** `Desktop/Projects/Portfolio` → deployed to https://EoinHoustoun.github.io (push to `pages` remote)
**Scope:** `index.html`, `style.css`, `script.js` only. No changes to GitHub READMEs or project repos.

## Goal

The current site is 8 stacked sections of prose (~1,260 visible words, over half in Projects and Experience). A recruiter cannot take it in at a glance. This redesign makes the default view scannable in seconds — visuals and metric chips carry the information, full detail moves behind click-to-expand — and gives the site a distinctive interactive identity via an animated background. Inspiration: sanidhyy/space-portfolio (summarised, interactive, unique, professional), adapted to Eoin's AI/data-science brand rather than copied.

## Decisions (agreed 2026-07-12)

1. **Stack:** keep the existing vanilla HTML/CSS/JS site and upgrade it. No framework migration.
2. **Summarising:** glance-first + expand. Cards show essentials by default; full prose is preserved behind a click. Nothing is deleted outright.
3. **Background:** neural constellation canvas (on-brand for AI), not a starfield.
4. **Structure:** condense 8 sections to 5: Hero → Snapshot → Experience → Projects → Contact.

## 1. Page architecture

- New section order: `#hero`, `#snapshot` (merges about + education + skills), `#experience`, `#projects`, `#contact`.
- The `#publication` section is dissolved, not demoted:
  - Hero gains a Springer badge chip ("Published — AIAI 2025, Springer") linking to https://link.springer.com/chapter/10.1007/978-3-031-96235-6_5.
  - The featured Alzheimer's project card keeps its Springer badge and paper link.
- Nav shrinks to five links matching the new sections. Mobile nav and theme toggle unchanged.

## 2. Neural constellation background

- One fixed, full-viewport `<canvas>` behind all content (`position: fixed; z-index` below content; `pointer-events: none`).
- ~70 drifting nodes on desktop, ~35 on mobile (breakpoint or area-scaled). Faint lines connect nodes within a distance threshold; line opacity falls off with distance.
- Cursor acts as a gentle attractor and draws temporary links to nearby nodes — the interactive moment.
- Colour: accent electric blue `#00d4ff` on `#0a0a0a`; in light mode the canvas is heavily dimmed (low opacity, darker stroke) so text contrast is unaffected.
- Performance/guardrails:
  - `devicePixelRatio`-aware sizing; redraw on resize (debounced).
  - Animation pauses when the tab is hidden (`visibilitychange`).
  - Fully disabled under `prefers-reduced-motion: reduce` (canvas not started; static or empty background).
  - Vanilla JS, no libraries; target negligible CPU (single rAF loop, squared-distance checks).
- Section backgrounds become slightly translucent (e.g. `rgba` card/section backgrounds) so the constellation shows through between content blocks without hurting readability.

## 3. Hero

- Typing effect stays.
- New row of 3–4 glance chips under the title:
  - 📄 Published — AIAI 2025, Springer (links to paper)
  - AI Engineer @ TurinTech
  - MSc AI & Data Science — Distinction
- Existing CTA buttons and layout otherwise unchanged. Headline credentials visible without scrolling.

## 4. Snapshot section (About + Education + Skills merged)

- **Intro:** current 156-word professional summary cut to 2–3 sentences beside the headshot. The animated forecast canvas (`#dataViz`) stays.
- **Education:** the three degree cards tightened to degree / institution / grade / flag only — no prose sentences.
- **Skills:** text pills replaced by a categorised icon grid — inline SVG logos (Python, PyTorch, scikit-learn, pandas, SQL, etc.) with small text labels, grouped under the existing category headings. Icons are inline SVG (no external icon CDN dependency).

## 5. Experience — glance timeline

- Timeline layout stays. Each role compresses to: role, company, dates, one bold summary line, and 2–3 metric chips.
- A per-role "details" expander (`<button>`-driven, `aria-expanded`) reveals the current full bullet list. No content deleted.

## 6. Projects — glance cards + expand

- Every card default view: image/visual header, title, one punchy line, 2–3 metric chips (real numbers only — e.g. AUC, accuracy, "Live Demo"), small tech icons, GitHub link.
- The current 2–3 sentence paragraphs move into a click-to-expand area on each card (same expander pattern as Experience).
- Featured Alzheimer's card keeps its full-width treatment and Springer badge — it remains the most prominent project (lead credential rule in CLAUDE.md).
- Secondary projects stay behind the existing "Additional Projects" toggle.

## 7. Motion & guardrails

- Staggered fade-in for chips/cards via the existing IntersectionObserver `.fade-in` pattern — subtle, no bounce.
- Both light and dark themes fully supported; constellation dimmed in light mode.
- No font below 0.78rem.
- Mobile verified at 375px width.
- All expanders keyboard-accessible (`button` elements, `aria-expanded`, `aria-controls`).

## 8. Error handling / degradation

- If canvas is unsupported or reduced-motion is set, the site renders identically minus the background — no layout dependence on the canvas.
- Expanders are progressive: content is in the DOM (hidden), so no-JS still exposes it via graceful fallback (default to expanded when JS is absent — `hidden` applied by JS on load).

## 9. Verification

- Serve locally (`python3 -m http.server`), Playwright screenshots of every section in both themes at desktop and 375px mobile widths.
- Manual checks: cursor interaction on constellation, expander open/close, reduced-motion behaviour, tab-hidden pause.
- Only after visual verification: commit and push to `pages` remote.

## Out of scope

- GitHub project READMEs, README.md profile page.
- Any framework migration, build tooling, or new dependencies.
- New projects or content additions.
