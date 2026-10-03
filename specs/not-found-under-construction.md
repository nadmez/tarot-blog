# Custom not-found page (“Sayfa yapım aşamasında”)

## Summary

Replace the default Next.js 404 screen (“404 / This page could not be found.”) with a
on-brand, mobile-first “under construction” experience in Turkish. A decorative cat
SVG appears above the message, plus a simple link back to the home page, so missing
routes feel intentional and friendly rather than broken.

## Scope

One coherent behavior: any App Router **not-found** outcome (unmatched URL or explicit
`notFound()`) renders a custom UI with the cat illustration, the Turkish message, and
an “Anasayfaya dön” link, inside the existing site chrome.

## Acceptance criteria

### Routing and HTTP behavior

- The system must render the custom not-found UI when the user navigates to a URL that
  does not match any defined route (for example `/bu-sayfa-yok`).
- The system must render the same custom not-found UI when application code calls
  Next.js `notFound()` (so future pages can reuse it).
- The HTTP response for an unmatched document route must remain **404** (Next.js default
  for `not-found.js`); the system must not return 200 for unknown pages.

### Content and copy

- The system must **not** display the default Next.js strings “404” or “This page could
  not be found.” anywhere in the document body.
- The system must display visible text **exactly** `Sayfa yapım aşamasında` as the
  primary message (single line; no extra English 404 copy).
- The primary message must be exposed as a heading (`h1`) so assistive technology can
  identify the page purpose.
- The system must render a link with visible text **exactly** `Anasayfaya dön` that
  navigates to `/` (home).
- The home link must appear **below** the primary heading in visual order (cat →
  heading → link).
- The home link must be a semantic link (`<a>` via Next.js `Link`) with an accessible
  name matching its visible text.

### Cat illustration

- The system must display a **fancy** cat illustration **above** the primary message
  in the visual order (cat first, then heading, then home link).
- The illustration must use the **existing** SVG already in the repo at
  `assets/kawaiicat1.svg`. Do not substitute a different cat file or fetch a new
  asset from the web.
- The cat must be presented via an `<img>` or Next.js `Image` (or equivalent) that
  loads that SVG (static import from `assets/kawaiicat1.svg`, or another Next.js-
  supported pattern that resolves to the same file). Inline hand-authored SVG markup
  in the component is out of scope for this spec.
- The image must have non-empty Turkish `alt` text that describes the decorative cat
  (for example `Süs amaçlı kedi illüstrasyonu`), not the page status alone.

### Layout and design

- The not-found content must render inside the existing root layout (`Header`, `main`,
  `Footer` from `src/app/layout.js`)—users still see site navigation on missing pages.
- The not-found block must use **simple** layout and styling—no extra sections,
  carousels, or decorative chrome beyond the cat image, heading, and home link.
- The not-found block must be **mobile-first**: a single centered column with
  comfortable vertical spacing (`gap` between cat, heading, and link), horizontal
  padding consistent with other pages (`px-4 sm:px-6`), and enough vertical padding
  that the block reads clearly in `main` (for example `py-16 sm:py-20`).
- Typography and colors must match the rest of the blog using existing Tailwind
  tokens only (`text-primary`, `font-heading`, `text-foreground/70`, `bg-background`,
  etc.)—no new hex colors or one-off fonts.
- The `h1` must use heading typography aligned with the site (for example
  `font-heading`, `text-primary`, and a modest size such as `text-2xl sm:text-3xl`
  rather than hero-scale `text-4xl`).
- The `Anasayfaya dön` link must reuse the **secondary outline button** pattern from
  the home hero (see `src/components/Hero/index.js`): rounded-full, border
  `border-primary/30`, `text-primary`, `text-sm font-semibold`, padding similar to
  hero CTAs, plus `hover:bg-primary/5` (or equivalent classes that match that link).
- The cat image must have a sensible max width on small screens (roughly 160–240px
  logical width) and scale up modestly on larger breakpoints without dominating the
  viewport.

### Document metadata

- The system must set page metadata so the document `<title>` includes
  `Sayfa yapım aşamasında` and remains consistent with the site brand (for example
  `Sayfa yapım aşamasında | Tarot Falı`).

### Regression: known routes

- The system must continue to render the home page and other existing routes unchanged
  when those URLs are requested (not-found UI must only appear for missing routes).

## Edge cases and error handling

- When the requested path is deeply nested and unmatched (for example
  `/blog/olmayan-yazi`), the system must show the same custom not-found UI—not the
  default Next.js 404 page.
- When `assets/kawaiicat1.svg` is unavailable at build/runtime, the page must still
  render the Turkish heading and the `Anasayfaya dön` link; the implementation may show
  a broken-image state for the graphic, but must not crash or fall back to the
  default Next.js 404 copy.
- Whitespace-only or odd encodings in the URL are handled by Next.js routing; this spec
  only requires the custom UI whenever Next.js resolves to `not-found`.

## Out of scope

- Different messages per section (blog vs tarot vs global)—one message for all
  not-found outcomes.
- Interactive behavior (search box, “notify me” form, animations).
- Replacing or customizing Next.js **error** boundaries (`error.js`) or global
  `global-error.js`.
- Hiding `Header` / `Footer` on not-found pages.
- End-to-end coverage beyond a single smoke test for an unknown URL (optional e2e is
  noted below but not required for unit-level acceptance).

## Context / notes

### Implementation pointers (for the code-writer, not acceptance tests)

- Add `src/app/not-found.js` per Next.js App Router conventions (see
  `node_modules/next/dist/docs/` for this repo’s Next 16 API).
- There is currently **no** `not-found.js`; that file is a new artifact. The cat SVG
  already lives at **`assets/kawaiicat1.svg`** (project-root `assets/` folder).
- Existing patterns: mobile-first sections in `src/components/*`, Turkish `lang="tr"`
  on `<html>` in `src/app/layout.js`.
- Testing conventions: Vitest + Testing Library (`src/**/*.test.jsx`), Playwright e2e
  under `e2e/`. Suggested checks:
  - **Unit**: render the not-found module; assert `h1` text, absence of default 404
    copy, a visible decorative cat image (with the expected Turkish `alt`), and a link
    `Anasayfaya dön` with `href="/"`. Prefer asserting behavior over a specific
    bundled URL if the SVG is imported from `assets/kawaiicat1.svg`.
  - **E2E (optional)**: `page.goto('/nonexistent')`; expect heading, home link, and
    404 status.

### Cat asset

| Field | Value                                                                                                                        |
| ----- | ---------------------------------------------------------------------------------------------------------------------------- |
| Path  | `assets/kawaiicat1.svg`                                                                                                      |
| Notes | Kawaii-style cat illustration; already committed—wire it up, do not relocate or replace unless a future spec says otherwise. |
