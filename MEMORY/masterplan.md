---
name: masterplan
description: "Project overview, current state, and priority queue. Read first in every session."
metadata.type: masterplan
---

Read this file first in any session, then open only the linked memory that matches the task. Do not re-explore the codebase for facts recorded here.

## What is GoldOak?

GoldOak is an insurance solutions agency in Nairobi, Kenya ("Understand the risk first. The policy comes after."). This repository is **one Next.js app** that contains two things:

1. **The marketing site** (`app/(site)/`): homepage (hero → how it works → what you can do → why → solutions → Super Agent → CTA), about, solutions, how-we-work, claims, contact, privacy, terms, and the Super Agent page with a public "Talk to the AI" box.
2. **Super Agent** (`app/(platform)/`): a **multi-tenant** insurance operating system: client portal, agency workspace, super-admin area, an AI WhatsApp assistant on one shared number, document upload + OCR, server-side PDFs, background jobs and daily automation, all on Supabase Postgres + Supabase Storage.

Deployed at `https://goldoak.vercel.app/` (Vercel project `goldoak`, GitHub `RyanMoshi/goldoak`, branch `main`). One repo, one deployment; never split Super Agent into a separate tree.

**Stack:** Next.js 14.0.4 (App Router), React 18, TypeScript strict, Tailwind CSS 3.4, `postgres` (postgres.js), `pdfkit`, `pdf-parse`, `@vercel/functions` (waitUntil), `@anthropic-ai/sdk` (optional), nodemailer. AI runs on **NVIDIA NIM** (`NVIDIA_API_KEY`; chat `nvidia/nemotron-3-super-120b-a12b`, vision `meta/llama-3.2-11b-vision-instruct`, OCR `nvidia/nemotron-parse`) behind `lib/ai/provider.ts`; Anthropic is used instead when `ANTHROPIC_API_KEY` is set; with neither the assistant answers from the catalogue.

## How the platform works (the model)

- **Tenants:** every agency is an `organizations` row with a **join code** and a `status` (`pending` → approved `active`). Every record carries `organization_id`; every query is scoped by it. GoldOak (`org_goldoak`, code `GOLDOAK`) is the first tenant and the default for web sign-ups without a code.
- **Roles:** `admin` (super admin: approves agencies, sees everything, routes chats, system page), `agency_admin` (team, settings, audit), `agency` (staff), `client`. Agencies register themselves at `/agencies/signup` (pending until approved) or are created by the admin. Enforced in `lib/auth/session.ts`, `middleware.ts` and every server action.
- **The WhatsApp number is never displayed.** Only wa.me links (`superAgentLink()` in `lib/contact.ts`) that open the chat.
- **Client journey:** six stages `understand → solve → compare → implement → support → review` on `clients.stage`.
- **Two channels, one system:** registration, business claims, enquiries, quotes, claims, document uploads and consultations all go through `services/*`; WhatsApp flows (`lib/conversation/flows.ts`) and portal forms (`lib/portal/*.ts`) call the same functions. `services/notifications.ts` stores every message for the portal and sends it on WhatsApp.
- **WhatsApp assistant** (`lib/whatsapp/bot.ts`): the webhook acknowledges in milliseconds and processes in the background (`lib/background.ts` → `waitUntil`; falls back to a durable `jobs` row). Routing: tenant (account → contact → JOIN code → choose) → human handoff → media → first-contact welcome with consent → running workflow (engine) → consultation mode → menu numbers → `understand()` intents (rules first, model for the rest). Memory: contact `memory` (facts + rolling summary refreshed by a background job), workflow state, user profile, organisation context.
- **Menus (spec):** guest 1 Get started / Sign up · 2 Find or claim a business · 3 Get insurance assistance · 4 Make an enquiry · 5 Upload a document · 6 Check a request · 7 Talk to an agent · 8 Help. Registered: 1 My insurance … 8 Help · 9 Report a claim.
- **Documents:** photos/PDFs from WhatsApp or the portal → private Supabase Storage → `ocr-upload` job (nemotron-parse OCR → vision/LLM extraction) → the person confirms or corrects → agency reviews under Documents.
- **Background jobs** (`services/jobs.ts`): Postgres queue with SKIP LOCKED, retries with backoff, dead-letter, admin retry at `/admin/system`; drained after every webhook, by `/api/cron/jobs`, and by the daily cron.
- **Automation:** sign-up → welcome + lead task; daily cron → renewal reminders, quote chasers, claim-update tasks, WhatsApp outbox retry, job drain.
- **No fake data.** Every dashboard reads real records.

## Current State (September 2026, v3)

### Done
- Multi-tenancy, 4 roles, agency self sign-up with approval, join codes/links, strict server-side isolation (verified live: Agency 1 cannot read Agency 2's chats, clients, documents, requests).
- Conversation engine with BACK/SKIP/CANCEL/RESTART/HELP/MENU, progress, confirm/edit; flows: registration (name, email, type, business, phone confirm, review), claim a business (search → pick → relationship → verification → submit), enquiry, quote, claim, name change; consult mode; interruptions (a question mid-flow is answered, then the step is re-asked); profile recall/update.
- WhatsApp media (images, PDFs; voice notes politely declined), OCR + extraction + confirmation, document review in the agency, portal upload page.
- Agency pages: Today, Conversations, Clients, Businesses (+claims review), Documents, Enquiries, Pipeline, Quotes, Renewals, Claims, Insurers, Reports (+PDF), Team, Audit log, Settings, Search. Admin: agencies (approve/deactivate), all staff, all conversations with routing, System (jobs, retries, audit).
- Portal: journey, actions, policies/quotes/claims, Ask the assistant, My documents, Requests (claim business, enquiry, tracker), PDFs, profile.
- Forgot/reset password by email (SMTP), privacy and terms pages, consent line in the WhatsApp welcome.
- Health endpoint reports AI model, storage, jobs, handoffs, failures.

### Pending / blockers
- **The OpenWA gateway still runs on Ryan's laptop** (Cloudflare quick tunnel). Vercel, Supabase, AI, jobs and PDFs run without the laptop, but WhatsApp goes quiet when it is off. Moving OpenWA to a VPS (Docker) is the one remaining always-on step; see `playbooks/whatsapp-openwa.md`.
- The WhatsApp profile name must be set to "Super Agent" on the phone (the engine refuses the API call).
- OpenWA on whatsapp-web.js has no interactive buttons; numbered menus are the fallback and the default.
- Vercel Hobby cron runs daily only; jobs are otherwise drained right after each webhook/upload.
- Voice notes are not transcribed.

## Priority Queue
1. Host OpenWA on a VPS (Docker) → `playbooks/whatsapp-openwa.md`.
2. Voice-note transcription (NVIDIA Riva/Whisper NIM) in `handleMedia`.
3. Quotes workspace step 2: per-insurer request packs and reply capture.
4. Agency logo upload (Storage) shown on PDFs and the portal.

## File Links

| File | Open when… |
|------|-----------|
| [platform.md](facts/platform.md) | Anything about Super Agent: roles, tenancy, services, components, actions |
| [database.md](facts/database.md) | Tables, connection, bootstrap, why env values look empty locally |
| [auth.md](facts/auth.md) | Sessions, middleware, sign-in/up, roles, agency approval, password reset |
| [whatsapp.md](facts/whatsapp.md) | Providers, routing, engine, flows, memory, media/OCR, handoff, webhooks, jobs |
| [ai.md](facts/ai.md) | AI provider layer: vendors, models, OCR, grounding rules |
| [stack.md](facts/stack.md) | Dependencies, build commands, framework quirks |
| [routes.md](facts/routes.md) | Every URL and which file renders it |
| [brand.md](facts/brand.md) | Colours, logo, typography, platform design tokens |
| [api.md](facts/api.md) | API routes (forms, health, seed, cron, webhooks, documents, uploads, consult) |
| [data.md](facts/data.md) | Static site content in `lib/` |
| [email.md](facts/email.md) | SMTP for the site forms and password resets |
| [dev-setup.md](playbooks/dev-setup.md) | First-time setup, env pull, dev server |
| [deploy-vercel.md](playbooks/deploy-vercel.md) | Deploying, env vars, verifying live |
| [bootstrap-admin.md](playbooks/bootstrap-admin.md) | Bootstrap, create agencies, invite staff, run the live tests, purge |
| [whatsapp-openwa.md](playbooks/whatsapp-openwa.md) | Connect the OpenWA gateway, move it to a server, test the bot |
| [add-feature.md](playbooks/add-feature.md) | Adding pages, services, actions, tables, flows, jobs |
| [fix-build.md](playbooks/fix-build.md) | Build failures and fixes |

## State after v4 (8 September 2026)
Live at https://goldoak.vercel.app. Verified in production with puppeteer: super admin sign-in (3 s, was 127 s), agency creation, temporary passwords by email + WhatsApp, forced first-login change, attaching an existing identity to another agency, agency picker, tenant isolation (Otto Test Agency cannot see GoldOak clients), client invitation (email + WhatsApp delivered), portal chat persisting across reload, all admin/agency/portal/public pages at 375/768/1366 px with no horizontal overflow. Test tenant "Otto Test Agency" (code OTTO, ottoalexis61@gmail.com) and GoldOak agency admin ryanmoshi77@gmail.com exist; remove/deactivate the test tenant when done. Remaining outside the code: rotate `AUTH_SECRET`, run the purge, and move the OpenWA gateway to a VPS (`deploy/openwa/`).
