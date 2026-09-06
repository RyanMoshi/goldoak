---
name: masterplan
description: "Project overview, current state, and priority queue. Read first in every session."
metadata.type: masterplan
---

Read this file first in any session, then open only the linked memory that matches the task. Do not re-explore the codebase for facts recorded here.

## What is GoldOak?

GoldOak is an insurance solutions agency in Nairobi, Kenya ("Understand the risk first. The policy comes after."). This repository is **one Next.js app** that contains two things:

1. **The marketing site** (`app/(site)/`): homepage, about, solutions, how-we-work, claims, contact, and the Super Agent landing page.
2. **Super Agent**, GoldOak's insurance operating system (`app/(platform)/`): a client portal, an agency workspace, a platform-admin area, a WhatsApp bot and daily automation, all on a Supabase Postgres database.

Deployed at `https://goldoak.vercel.app/` (Vercel project `goldoak`, GitHub `RyanMoshi/goldoak`, branch `main`). One repo, one deployment; never split Super Agent into a separate tree.

**Stack:** Next.js 14.0.4 (App Router), React 18, TypeScript strict, Tailwind CSS 3.4, `postgres` (postgres.js) on Supabase, Lucide React, nodemailer (site forms), jsPDF. No ORM, no auth library: sessions are signed cookies, passwords are scrypt.

## How the platform works (the model)

- **Roles:** `admin` (platform owner; invites agency users), `agency` (advisers; run the workspace), `client` (customers; sign up themselves). Agencies never self-register.
- **One door on the site:** the navigation shows **Super Agent** (not Sign in / Sign up). `/super-agent` explains it and holds the sign-in and sign-up links.
- **Client journey:** six GoldOak stages `understand → solve → compare → implement → support → review` on `clients.stage`. Clients see it in the portal and on WhatsApp.
- **Two channels, one system:** every client action (ask for cover, report a claim) and every agency action (stage, quote stage, claim stage, policy, message) goes through `services/journey.ts`, which writes records, creates agency tasks and calls `services/notifications.ts`. A notification is stored (portal "Updates") **and** sent on WhatsApp when the person has a phone. So the user can use the site or WhatsApp interchangeably.
- **WhatsApp line:** `+255 742 473 493` (`WHATSAPP_BOT_NUMBER=255742473493`), served by the self-hosted **OpenWA** gateway (github.com/rmyndharis/OpenWA) via `lib/whatsapp/providers/openwa.ts`. Meta Cloud API is the fallback provider. Bot conversation lives in `lib/whatsapp/bot.ts`.
- **Automation:** sign-up → welcome + agency lead task; daily cron (`/api/cron/daily`, 04:00 UTC) → renewal reminders at 30/14/7/1 days, quote chasers past the 3-day SLA, weekly claim-update tasks.
- **No fake data.** The dashboard and command bar read the organisation's real records. The bootstrap creates only the GoldOak organisation and the platform admin.

## Current State

### Done
- Site rebranded to forest green `#073423` + gold `#c28d38` (Petrona, Karla, JetBrains Mono for figures).
- Route groups: `app/(site)` with nav+footer, `app/(platform)` for signin/signup/admin/agency/portal.
- Auth: signed session cookie (`lib/auth/session.ts`), `middleware.ts` role gate for `/admin`, `/agency`, `/portal`; sign-in with Client / Agency tabs (agency tab admits admin too).
- Admin: `/admin` creates agency users (username = email, password chosen or generated), resets passwords, deactivates.
- Agency: `/agency/today` dashboard (metrics, SLA queue, pipeline, insurer activity, recent activity), `/agency/clients` register, `/agency/clients/new`, client 360 with workbench (stage, message, quote/claim stages, record policy), command bar answered from the database.
- Portal: `/portal` (journey tracker, ask for cover, report a claim, policies, quotes, claims, updates feed, WhatsApp card), `/portal/profile` (WhatsApp number).
- WhatsApp: OpenWA webhook `/api/whatsapp/openwa`, Meta webhook `/api/whatsapp/webhook`, bot with STATUS/POLICIES/QUOTES/CLAIMS/QUOTE/CLAIM/UPDATES/ADVISER and agency commands.
- Ops: `/api/health`, `/api/admin/seed` (bootstrap, ADMIN_TOKEN), `/api/cron/daily` (CRON_SECRET), `vercel.json` cron.
- Founder strategy documents in `Main Files/` (01–05).

### Pending
- Connect OpenWA: set `OPENWA_BASE_URL`, `OPENWA_API_KEY`, `OPENWA_SESSION_ID`, `OPENWA_WEBHOOK_SECRET` on Vercel and register the webhook (see `playbooks/whatsapp-openwa.md`).
- Agency workspaces still marked "coming next": pipeline board, quotes comparison engine, renewals diary, claims board, insurers panel, reports, settings (`app/(platform)/agency/[section]/page.tsx`).
- Privacy Policy and Terms pages (footer links exist, no routes).
- Password reset by email (today: admin resets agency passwords; clients ask on WhatsApp).
- Document uploads on the portal (logbook, ID, policy schedules).

### Blockers
- WhatsApp sends nothing until OpenWA env vars are set; the portal still records every notification, and `/api/whatsapp/openwa` echoes the bot reply in its JSON while no gateway is configured, for testing.

## Priority Queue

1. Connect the OpenWA gateway (user must host it and paste keys) → `playbooks/whatsapp-openwa.md`.
2. Quotes workspace (Step 2 of the product plan): request packs per insurer, capture replies into `quote_submissions`, comparison on identical terms.
3. Renewals diary and claims board pages backed by the existing tables.
4. Portal document upload (Vercel Blob) and e-signature later.
5. Privacy and Terms pages.

## File Links

| File | Open when… |
|------|-----------|
| [platform.md](facts/platform.md) | Anything about Super Agent: roles, routes, services, components, actions |
| [database.md](facts/database.md) | Tables, connection, bootstrap, why env values look empty locally |
| [auth.md](facts/auth.md) | Sessions, middleware, sign-in/up, admin invites |
| [whatsapp.md](facts/whatsapp.md) | Providers, bot commands, flows, webhooks, automation |
| [stack.md](facts/stack.md) | Dependencies, build commands, framework quirks |
| [routes.md](facts/routes.md) | Every URL and which file renders it |
| [brand.md](facts/brand.md) | Colours, logo, typography, platform design tokens |
| [api.md](facts/api.md) | API routes (site forms, health, seed, cron, webhooks) |
| [data.md](facts/data.md) | Static site content in `lib/` |
| [email.md](facts/email.md) | SMTP for the site forms |
| [dev-setup.md](playbooks/dev-setup.md) | First-time setup, env pull, dev server |
| [deploy-vercel.md](playbooks/deploy-vercel.md) | Deploying, env vars, verifying live |
| [bootstrap-admin.md](playbooks/bootstrap-admin.md) | Bootstrap the database, create the admin, invite agencies |
| [whatsapp-openwa.md](playbooks/whatsapp-openwa.md) | Connect the OpenWA gateway and test the bot |
| [add-feature.md](playbooks/add-feature.md) | Adding pages, services, actions, tables |
| [fix-build.md](playbooks/fix-build.md) | Build failures and fixes |
