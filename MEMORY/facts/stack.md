---
name: stack
description: "Tech stack, dependencies, build commands, and framework quirks."
metadata.type: fact
---

## Framework
- **Next.js 14.0.4** (App Router, webpack) · **React 18** · **TypeScript 5** strict
- **Tailwind CSS 3.4.17** (`tailwind.config.js`; NOT v4 `@theme`)
- Node 22 locally (portable at `C:/Users/ryanm/tools/node22`); Vercel Node 22

## Key Dependencies
| Package | Purpose |
|---------|---------|
| `postgres` | Supabase Postgres client (postgres.js), `lib/db/client.ts` |
| `@anthropic-ai/sdk` | Consultation assistant (`services/consult.ts`, model `claude-opus-5`, adaptive thinking); optional, needs `ANTHROPIC_API_KEY` |
| `pdfkit` (+ `@types/pdfkit`) | Server-side PDFs (`lib/pdf/document.ts`); external package, `pdfkit/js/**` traced into the documents function |
| `pdf-parse` | Text from uploaded PDFs before extraction (`services/uploads.ts`) |
| `@vercel/functions` | `waitUntil` so webhooks answer instantly and keep working in the background (`lib/background.ts`) |
| NVIDIA NIM (no SDK, `fetch`) | Chat, vision and OCR models through `lib/ai/provider.ts` |
| `lucide-react` | Icons (site and platform) |
| `nodemailer` | SMTP email for the site's contact/application forms |
| `react-hook-form`, `react-hot-toast` | Site forms and toasts |

Removed in the v2 cleanup: `framer-motion`, `html2canvas`, `jspdf`, `lib/pdfGenerator.ts`, `app/api/upload` (wrote to disk, which Vercel does not persist).

No ORM, no auth library, no state-management library.

## Commands
```bash
npm run dev            # next dev
npm run build          # next build (also type-checks)
npx tsc --noEmit       # type-check only
npx next lint          # ESLint (next/core-web-vitals)
npm run db:seed        # bootstrap the live database via /api/admin/seed (needs ADMIN_TOKEN in .env.local)
```

## Quirks
- The Bash tool on this machine fails on large heredocs; write scripts to the scratchpad with the Write tool and run them with `node`.
- Deleting a route leaves stale `.next/types/...` files that break `tsc`; delete `.next/types/app/<route>` (or the whole `.next`) before type-checking.
- Server-action files (`'use server'`) may export only async functions; keep helpers such as `generatePassword` elsewhere (`lib/conversation/flows.ts`).
- Static segments win over dynamic ones in the App Router, which is why `/agency/settings` could replace the old `[section]` placeholder without conflicts.
- `vercel logs` streams and never exits; run it in the background and read the file.
- **jsonb columns:** pass objects with `sql.json(value)` (or the raw object). Never `${JSON.stringify(x)}::jsonb`: postgres.js serialises again, stores a JSON *string*, and it comes back as a string (this once made the WhatsApp flow state grow exponentially per step until the function ran out of memory).
- A schema statement that re-adds a check constraint must list every value in use; a stale `ADD CONSTRAINT` fails on every cold start and takes the whole platform down with it.
- Puppeteer 24 (from C:/Users/ryanm/OpenWA/node_modules) has no `page.$x`; find buttons with `page.evaluate` and text matching. Never click `form button[type=submit]` blindly: the sign-out form and the command bar come first in the DOM; call `closest('form').requestSubmit()` on a field inside the target form instead.
- Full-page screenshots of the marketing site look blank because `AnimatedSection` reveals sections with an IntersectionObserver; use viewport screenshots or scroll first.
- pdfkit must be in `serverComponentsExternalPackages` with `node_modules/pdfkit/js/**` traced into the documents route; it loads fonts via package `imports` (`#standard-fonts/*`).
