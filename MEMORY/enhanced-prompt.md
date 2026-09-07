---
name: enhanced-prompt
description: "Enhanced project prompt for AI assistants — paste this into any new session to onboard instantly."
metadata.type: prompt
---

# GoldOak + Super Agent — AI Session Prompt

You are working on **GoldOak**, an insurance agency website that also contains **Super Agent**, a multi-tenant insurance operating system (client portal, agency workspace, super admin, WhatsApp assistant on one shared number, PDFs, automation). Before writing any code, read `MEMORY/masterplan.md`.

## Quick Facts
- **Stack:** Next.js 14 (App Router), TypeScript strict, Tailwind CSS 3.4, `postgres` (postgres.js) on Supabase Postgres, Lucide React, nodemailer (site forms), `@anthropic-ai/sdk` (optional AI), `pdfkit` (PDFs)
- **Deployed:** `https://goldoak.vercel.app/` — Vercel project `goldoak`, GitHub `RyanMoshi/goldoak`, branch `main`. Push to `main` deploys.
- **One repo, one app.** Site in `app/(site)`, platform in `app/(platform)`. Never create a separate Super Agent project.
- **Tenancy and roles:** every agency is an `organizations` row with a join code; every record has `organization_id`. `admin` (super admin) creates agencies and their first `agency_admin`; agency admins invite `agency` staff; `client` signs up at `/signup` (optional `?agency=CODE`) or on WhatsApp. Sign-in tabs: Client, Agency (all staff roles).
- **Landing page:** the nav shows **Super Agent** → `/super-agent`. Hero CTAs: Get started, Talk to the AI, Sign in, For agencies. Public assistant box on `/super-agent#ask` (`/api/consult`).
- **Channels:** site and WhatsApp are equivalent. Every action goes through `services/journey.ts` and every message through `services/notifications.ts` (stored for the portal, sent on WhatsApp when a phone exists).
- **WhatsApp line:** +255 742 473 493 (profile "Super Agent") via OpenWA; Meta Cloud API fallback. Bot `lib/whatsapp/bot.ts` = tenant routing + step engine (`lib/conversation/engine.ts`, flows in `lib/conversation/flows.ts`) + consultation (`services/consult.ts`) + human handoff (`services/handoff.ts`). State in `whatsapp_contacts`, log in `conversation_messages`.
- **No fake data.** Dashboards read real records. Bootstrap creates only the organisation and the admin.
- **Theme:** Forest `#073423`, Gold `#c28d38`, cream `#f7f4ec`. Petrona (headings), Karla (body), JetBrains Mono (figures). Controls 6px, cards 10px, tables 0px.
- **Secrets:** Vercel marks Supabase values sensitive; `vercel env pull` writes them empty. Never try to seed from a local machine; use `npm run db:seed` (calls `/api/admin/seed` inside the deployment with `ADMIN_TOKEN`).

## Rules
1. Read `MEMORY/masterplan.md` first in every session.
2. Open only the fact/playbook files relevant to the task.
3. Do NOT re-explore the codebase for facts already recorded in MEMORY.
4. Run `npx tsc --noEmit`, `npx next lint` and `npm run build` after every change.
5. Data access lives in `services/`; server actions in `lib/*/actions.ts`; UI never queries the database directly.
6. Any change a client should know about must call `notify()` so it reaches both the portal and WhatsApp.
7. Schema changes go in `lib/db/schema.ts` as `IF NOT EXISTS` / additive `ALTER ... IF NOT EXISTS`; they apply automatically on first use. Every tenant table carries `organization_id` and every query is scoped by it.
8. Light mode only. Use Tailwind tokens (`forest`, `gold`, `ink`, `canvas`, `line`…), never hardcoded hex in components.
9. Every page must work at 320px. Tables become cards on phones.
10. Commit with descriptive messages and push to `main`; verify `https://goldoak.vercel.app/api/health` after deploy.

## If No Instructions Given
Take the top unchecked item in the Priority Queue in `MEMORY/masterplan.md`.

## Common Tasks
- **Bootstrap DB / create admin / create agencies / live test:** `MEMORY/playbooks/bootstrap-admin.md`
- **Connect or debug WhatsApp:** `MEMORY/playbooks/whatsapp-openwa.md` and `MEMORY/facts/whatsapp.md`
- **Add a page, action, table:** `MEMORY/playbooks/add-feature.md`
- **Deploy / env vars:** `MEMORY/playbooks/deploy-vercel.md`
- **Routes:** `MEMORY/facts/routes.md` · **Brand:** `MEMORY/facts/brand.md` · **Platform map:** `MEMORY/facts/platform.md`
