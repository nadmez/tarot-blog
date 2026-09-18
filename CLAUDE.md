# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Quick Start

**Package manager**: pnpm (v12.4.2) — use `pnpm` instead of `npm` or `yarn`

**Common commands**:
- `pnpm dev` — Start development server on http://localhost:3000
- `pnpm build` — Build for production
- `pnpm start` — Start production server
- `pnpm lint` — Run ESLint

## Project Structure

```
src/app/              # App Router (Next.js 16.3.5)
  layout.js           # Root layout
  page.js             # Home page
  globals.css         # Global styles
  favicon.ico
```

Path alias: `@/*` maps to `./src/*`

## Tech Stack

- **Framework**: Next.js 16.3.5 (App Router, src/ directory)
- **Runtime**: React 19.2.8
- **Styling**: Tailwind CSS 4 (with @tailwindcss/postcss and PostCSS)
- **Compiler**: Babel React Compiler (enabled in next.config.mjs)
- **Linting**: ESLint 9 with eslint-config-next (core-web-vitals preset)
- **Package Manager**: pnpm 12.4.2

## Important Notes

**Next.js 16.3.5 has breaking changes** — see `AGENTS.md` for details. Check `node_modules/next/dist/docs/` for updated API documentation before writing code that uses framework features beyond standard React patterns.

**React Compiler** is enabled — understand its constraints on side effects and mutable captures before using complex hooks or patterns.

**Tailwind v4** uses a new PostCSS-only approach — do not try to use Tailwind config files from v3.

**ESLint config**: Uses `eslint-config-next` with the base Next.js + core web vitals rules. Config is in `eslint.config.mjs` (new flat config format).

## Design Principles

**AI Agent Readability**: This website is designed to be easily understood and traversed by AI agents. This means:
- Use semantic HTML (`<article>`, `<nav>`, `<section>`, `<header>`, `<footer>`, etc.) for clear content structure
- Provide descriptive text and metadata; avoid vague labels or placeholder text
- Use proper heading hierarchy (h1 → h2 → h3, etc.)
- Include `alt` text on images and descriptive `aria-labels` on interactive elements
- Prefer structured data (JSON-LD, microdata) for complex information
- Keep content machine-readable: clear prose, consistent formatting, logical organization
- Avoid information hidden behind animations, client-side rendering, or dynamic content that lacks fallbacks

## Development Flow

1. Edit files in `src/app/` — the dev server watches and hot-reloads
2. Run `pnpm lint` to check for lint errors (ESLint)
3. Test in browser at http://localhost:3000
4. Build with `pnpm build` before committing to verify production build works
