# Unit test coverage for existing components

## Summary

Add unit tests for the currently untested components in `src/` -- Header,
Footer, ApproachSection, RecentPosts, the Home page composition, and the icon
components -- using the existing Vitest + Testing Library setup. Follow the
established pattern in `src/components/Hero.test.jsx` (`render`/`screen` from
`@testing-library/react`, `test`/`expect` from `vitest`, colocated as
`<Component>.test.jsx`). This closes the gap where only `Hero.js` currently
has coverage.

## Scope

Add `*.test.jsx` unit tests for:

- `src/components/Header.js` (structural/render checks only -- see Out of
  scope for what's excluded)
- `src/components/Footer.js`
- `src/components/ApproachSection.js`
- `src/components/RecentPosts.js`
- `src/app/page.js`
- `src/components/icons.js`

This is a test-only effort: no production code in these files should change
in order to make a test pass. If writing a real test seems to require a
production code change, that's a signal to stop and flag it rather than
guess at a fix.

## Acceptance criteria

### Header.js

- The system must render a link to `/` containing the text "Tarot Falı" with
  an accessible name/label referencing "Ana Sayfa".
- The system must render a desktop navigation (`nav` with
  `aria-label="Ana menü"`) containing an entry for every top-level item in
  `NAV_ITEMS`: "Ana Sayfa", "Hakkında", "Tarot", "Blog", "Podcastler",
  "Bağlan", "Ücretsiz Haber Bülteni".
- The system must render "Hakkında" and "Tarot" as buttons (they have
  children) with `aria-haspopup="true"` and `aria-expanded="false"` on
  initial render.
- The system must render "Blog", "Podcastler", "Bağlan", and "Ücretsiz Haber
  Bülteni" as plain links (no children) pointing to their respective `href`
  values.
- The system must render a "Giriş Yap" button.
- The system must render a mobile menu toggle button with
  `aria-expanded="false"` and accessible label "Menüyü aç" on initial
  render.
- The system must NOT render the mobile menu (`#mobile-menu`) on initial
  render.

### Footer.js

- The system must render "Tarot Falı" as the footer heading text.
- The system must render a footer navigation (`nav` with
  `aria-label="Alt bilgi menüsü"`) containing a link for every entry in
  `FOOTER_LINKS`, each with the correct `href`.
- The system must render a link to `/haber-bulteni` with visible text
  "Abone Ol".
- The system must render a copyright line containing the current year,
  computed the same way the test itself computes "now" (e.g. via
  `new Date().getFullYear()` at test time) -- not a hardcoded year -- so the
  test keeps passing in future years.

### ApproachSection.js

- The system must render a `section` landmark labelled by a heading with id
  `approach-heading`.
- The system must render an `h2` heading with the text "Lorem ipsum dolor
  sit amet consectetur." (the placeholder copy as it exists today).
- The system must render the "Benim Yaklaşımım" eyebrow label text.

### RecentPosts.js

- The system must render a heading with id `recent-posts-heading` and text
  "Son Yazılar".
- The system must render exactly as many post cards as there are entries in
  the `POSTS` array (currently 3).
- For each post, the system must render its `title` as heading text, its
  `excerpt` text, and a link to `/blog/<slug>` (both the title link and the
  "Devamını oku" link).
- The system must render each post's date formatted via
  `toLocaleDateString("tr-TR", { day: "numeric", month: "long", year:
"numeric" })` inside a `<time>` element whose `dateTime` attribute equals
  the post's raw ISO date string.
- The system must render one JSON-LD `<script type="application/ld+json">`
  per post whose parsed content includes `"@type": "Article"` and the
  post's title as `headline`.

### page.js (Home)

- The system must render the `Hero`, `ApproachSection`, and `RecentPosts`
  components together, in that order, when the Home page is rendered.

### icons.js

- Each exported icon component (`MoonIcon`, `StarIcon`, `CardsIcon`,
  `ChevronIcon`, `MenuIcon`, `CloseIcon`) must render an `<svg>` element when
  invoked with no props.
- Each icon component must forward arbitrary props (e.g. `className` and
  `aria-hidden`) onto the rendered `<svg>` element -- matching how Header.js
  already relies on this behavior (e.g. `className="h-6 w-6 text-accent"`,
  `aria-hidden="true"`).

## Edge cases and error handling

- Footer: the year assertion must not break when the year rolls over --
  compute the expected year the same way in the test (see acceptance
  criterion above); never hardcode a literal year like "2026".
- icons.js: calling any icon component with no props at all must not throw.
- RecentPosts: this spec covers `POSTS` as it exists today (3 hardcoded
  entries); it does not require handling an empty-array case, since that
  isn't a real state the component currently has to support.

## Out of scope

- `src/app/layout.js` (root layout) -- not covered by this spec.
- Header's interactive behavior: opening/closing desktop dropdowns on
  click, closing a desktop dropdown on outside click (pointerdown), and
  toggling the mobile menu / mobile submenus. Only the initial static
  render is covered here.
- Any end-to-end/integration tests -- there's already a Playwright e2e
  suite at `e2e/home.spec.js` for that layer; this spec is unit-test only.
- Any production code changes -- this is a test-only effort against the
  code as it exists today.
- Visual/styling assertions (Tailwind classes) beyond what's needed to
  identify elements.

## Context / notes

- Existing pattern to follow: `src/components/Hero.test.jsx`.
- Test runner: `pnpm test` (vitest run); config at `vitest.config.mjs`.
  Coverage report: `pnpm test:coverage`.
- `@testing-library/user-event` is not currently installed. Not needed for
  this spec (Header's interactions are out of scope here), but relevant if
  a future spec adds coverage for Header's open/close behavior.
