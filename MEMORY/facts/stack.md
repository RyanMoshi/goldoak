---
name: stack
description: "Tech stack, dependencies, build commands, and framework quirks."
metadata.type: fact
---

## Framework
- **Next.js 14.0.4** (App Router) — no Turbopack
- **React 18**, **TypeScript 5**
- **Tailwind CSS v3.3.0** (PostCSS plugin `tailwindcss`)

## Key Dependencies
| Package | Version | Purpose |
|---------|---------|---------|
| `framer-motion` | ^10.16.16 | Installed but NOT used (AnimatedSection uses IntersectionObserver) |
| `react-hook-form` | ^7.48.2 | Contact/Risk Review form validation |
| `react-hot-toast` | ^2.4.1 | Toast notifications (navy-themed) |
| `nodemailer` | ^6.9.7 | SMTP email sending (contact form, applications) |
| `jspdf` | ^3.0.3 | PDF quote generation |
| `html2canvas` | ^1.4.1 | Canvas capture for PDF generation |
| `lucide-react` | ^0.294.0 | Icons |

## Build Commands
```bash
npm run dev          # next dev
npm run build        # next build
npm run start        # next start
npm run lint         # next lint
```

## No Database, No Auth
- No Prisma, no database, no ORM
- No authentication system
- All content is static in `lib/` TypeScript files
- API routes use nodemailer for email, not database queries

## Quirks
- **No `src/` directory** — `app/`, `components/`, `lib/` are at project root
- **Path alias** — `@/*` maps to `./*` (project root, NOT `src/`)
- **Tailwind v3** — uses `tailwind.config.js` (NOT v4 `@theme` in globals.css)
- **`next.config.js`** — only allows `images.unsplash.com` as remote image host
- **PostCSS** — standard `tailwindcss` + `autoprefixer` (NOT `@tailwindcss/postcss`)
- **No tests** — no test framework installed, no test files exist
- **Static data** — all content hardcoded in `lib/` files, no CMS, no fetching
