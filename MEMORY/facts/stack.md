---
name: stack
description: "Tech stack, dependencies, build commands, and framework quirks."
metadata.type: fact
---

## Framework
- **Next.js 14.0.4** (App Router, webpack) · **React 18** · **TypeScript 5** strict
- **Tailwind CSS 3.4.17** (`tailwind.config.js`; NOT v4 `@theme`)
- Node 20+ locally (Node 24 in use); Vercel Node 22

## Key Dependencies
| Package | Purpose |
|---------|---------|
| `postgres` | Supabase Postgres client (postgres.js), `lib/db/client.ts` |
| `lucide-react` | Icons (site and platform) |
| `nodemailer` | SMTP email for the site's contact/application forms |
| `react-hook-form`, `react-hot-toast` | Site forms and toasts |
| `jspdf`, `html2canvas` | PDF quote generator on the site |
| `framer-motion` | Installed, unused (AnimatedSection uses IntersectionObserver) |

No ORM, no auth library, no state-management library.

## Commands
```bash
npm run dev            # next dev
npm run build          # next build (also type-checks)
npx tsc --noEmit       # type-check only
npx next lint          # ESLint (next/core-web-vitals)
npm run db:seed        # bootstrap the live database via /api/admin/seed (needs ADMIN_TOKEN in .env.local)
npm run db:seed -- --purge   # also delete the old demo rows
```

## Quirks
- No `src/`; `@/*` maps to the project root.
- `app/(site)/layout.tsx` renders Navigation + Footer; `app/layout.tsx` only fonts + Toaster. Platform routes have their own shells.
- Server actions are invoked from client components via `startTransition(async () => await action(formData))`; `redirect()` inside an action performs the navigation. `useFormState` is not used (types unavailable in this React version).
- `next/font/google`: Petrona, Karla, JetBrains Mono as CSS variables `--font-petrona`, `--font-karla`, `--font-jetbrains`.
- `vercel.json` only declares the cron.
- `middleware.ts` runs on the edge: only Web Crypto there, no `node:` imports.
