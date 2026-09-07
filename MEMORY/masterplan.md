---
name: masterplan
description: "Project overview, current state, and priority queue. Read first in every session."
metadata.type: masterplan
---

Read this file first in any session, then open only the linked memory that matches the task. Do not re-explore the codebase for facts recorded here.

## What is GoldOak?

GoldOak is an insurance solutions agency in Nairobi, Kenya ("Understand the risk first. The policy comes after."). This repository is **one Next.js app** that contains two things:

1. **The marketing site** (`app/(site)/`): homepage, about, solutions, how-we-work, claims, contact, and the Super Agent landing page with a public "Talk to the AI" box.
2. **Super Agent**, a **multi-tenant** insurance operating system (`app/(platform)/`): client portal, agency workspace, super-admin area, a WhatsApp assistant on one shared number, server-side PDFs and daily automation, all on a Supabase Postgres database.

Deployed at `https://goldoak.vercel.app/` (Vercel project `goldoak`, GitHub `RyanMoshi/goldoak`, branch `main`). One repo, one deployment; never split Super Agent into a separate tree.

**Stack:** Next.js 14.0.4 (App Router), React 18, TypeScript strict, Tailwind CSS 3.4, `postgres` (postgres.js) on Supabase, Lucide React, nodemailer (site forms), `@anthropic-ai/sdk` (optional AI), `pdfkit` (PDFs). No ORM, no auth library: sessions are signed cookies, passwords are scrypt.

## How the platform works (the model)

- **Tenants:** every agency is an `organizations` row with a **join code** (`GOLDOAK`, …). Every record carries `organization_id`; every query is scoped by it. GoldOak (`org_goldoak`) is the first tenant and the default for web sign-ups without an agency code.
- **Roles:** `admin` (platform super admin: creates agencies + their first admin, routes unassigned chats, sees everything), `agency_admin` (runs one agency: team, settings), `agency` (staff: the workspace), `client` (customers: sign up themselves on the site or on WhatsApp). Agencies never self-register. Enforced in `lib/auth/session.ts` (`canAccess`, `isAgencyAdmin`), `middleware.ts`, and every server action.
- **One door on the site:** the navigation shows **Super Agent**. The homepage hero offers Get started, Talk to the AI, Sign in, For agencies. `/super-agent` holds the public assistant, client and agency sections and sign-in links.
- **Client journey:** six stages `understand → solve → compare → implement → support → review` on `clients.stage`, shown in the portal, the pipeline board and on WhatsApp.
- **Two channels, one system:** every client action (sign up, ask for cover, report a claim, ask a question, talk to an adviser) and every agency action goes through `services/*`; `services/notifications.ts` stores every message for the portal **and** sends it on WhatsApp. Site and WhatsApp are interchangeable.
- **WhatsApp:** one shared number `+255 742 473 493` (profile should read "Super Agent") served by self-hosted **OpenWA**. `lib/whatsapp/bot.ts` resolves the tenant (account → saved contact → `JOIN <CODE>` / link → choose from a list → admin routing), then runs the step engine (`lib/conversation/engine.ts`, flows in `lib/conversation/flows.ts`), the consultation assistant (`services/consult.ts`, Claude when `ANTHROPIC_API_KEY` is set, catalogue otherwise) or human handoff (`services/handoff.ts`). State lives in `whatsapp_contacts`; every message in `conversation_messages`.
- **Automation:** sign-up → welcome + lead task; daily cron (`/api/cron/daily`, 04:00 UTC) → renewal reminders 30/14/7/1 days, quote chasers, weekly claim-update tasks, retry of failed WhatsApp deliveries.
- **Documents:** `/api/documents/<type>?id=` renders branded, numbered PDFs (registration, cover summary, claim, quote, agency report) server-side with pdfkit; rows in `documents`, entries in `audit_log`.
- **No fake data.** Every dashboard reads the organisation's real records. Bootstrap creates only the GoldOak organisation and the platform admin.

## Current State

### Done (September 2026)
- Multi-tenancy, RBAC (4 roles), join codes, onboarding links (`wa.me/<number>?text=JOIN <CODE>`, `/signup?agency=<CODE>`).
- Conversation engine with BACK / SKIP / CANCEL / RESTART / HELP / MENU, progress "Step n of m", confirmation with "change something", validation, error recovery; flows: sign-up, ask for cover, report a claim, choose agency; consultation mode; handoff.
- Agency workspace: Today, Conversations (list + thread, reply on WhatsApp, take over / hand back), Pipeline (kanban), Clients (+ client 360 with PDFs), Quotes, Renewals, Claims, Insurers, Reports (+ PDF), Team (agency admins), Settings (profile, join code, greeting, onboarding links). Forest sidebar with gold active pill; bottom tab bar on phones.
- Admin: agencies (create with first admin, deactivate), all staff accounts, all conversations with routing.
- Portal: journey, actions, policies, quotes, claims, updates, documents, Ask the assistant (`/portal/ask`), profile.
- Public `/api/consult` (rate-limited) behind the site's AskWidget.
- Health endpoint reports agencies, chats waiting for a person, failed WhatsApp sends, AI mode and deployed commit.
- Live multi-agency test script (see `playbooks/bootstrap-admin.md` → Testing) passed against production.
- Cleanup: unused deps and files removed, design references in `design/`, legacy bot tables dropped.

### Pending
- Move OpenWA from Ryan's laptop to an always-on host (Docker on a VPS). Only the WhatsApp gateway is laptop-bound; Vercel, the database, cron and PDFs run without the laptop.
- Set the WhatsApp profile name to "Super Agent": the whatsapp-web.js engine refuses `PUT /profile/name` (403), so set it in the WhatsApp app on the phone (Settings → Profile → Name). The status line was set via the API.
- `ANTHROPIC_API_KEY` not yet provided; the assistant answers from the catalogue until it is.
- Privacy Policy and Terms pages; password reset by email; portal document uploads (Vercel Blob).
- A stray key-like string was removed from `README.md` but remains in git history; rotate it if it was real.

## Priority Queue
1. Host OpenWA on a VPS (Docker) → `playbooks/whatsapp-openwa.md`.
2. Add `ANTHROPIC_API_KEY` on Vercel (Production) to switch the assistant to Claude.
3. Quotes workspace step 2: per-insurer request packs and reply capture into `quote_submissions`.
4. Portal document upload (Vercel Blob), then e-signature.
5. Privacy and Terms pages.

## File Links

| File | Open when… |
|------|-----------|
| [platform.md](facts/platform.md) | Anything about Super Agent: roles, tenancy, services, components, actions |
| [database.md](facts/database.md) | Tables, connection, bootstrap, why env values look empty locally |
| [auth.md](facts/auth.md) | Sessions, middleware, sign-in/up, roles, invitations |
| [whatsapp.md](facts/whatsapp.md) | Providers, tenant routing, engine, flows, handoff, webhooks, automation |
| [stack.md](facts/stack.md) | Dependencies, build commands, framework quirks |
| [routes.md](facts/routes.md) | Every URL and which file renders it |
| [brand.md](facts/brand.md) | Colours, logo, typography, platform design tokens |
| [api.md](facts/api.md) | API routes (forms, health, seed, cron, webhooks, documents, consult) |
| [data.md](facts/data.md) | Static site content in `lib/` |
| [email.md](facts/email.md) | SMTP for the site forms |
| [dev-setup.md](playbooks/dev-setup.md) | First-time setup, env pull, dev server |
| [deploy-vercel.md](playbooks/deploy-vercel.md) | Deploying, env vars, verifying live |
| [bootstrap-admin.md](playbooks/bootstrap-admin.md) | Bootstrap, create agencies, invite staff, run the live test |
| [whatsapp-openwa.md](playbooks/whatsapp-openwa.md) | Connect the OpenWA gateway and test the bot |
| [add-feature.md](playbooks/add-feature.md) | Adding pages, services, actions, tables, flows |
| [fix-build.md](playbooks/fix-build.md) | Build failures and fixes |
