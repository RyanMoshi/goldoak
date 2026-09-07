---
name: bootstrap-admin
description: "Bootstrap the database, create the platform admin, approve or create agencies, invite staff, run the live tests, start afresh."
metadata.type: playbook
---

## When
First deployment, a new database, a new agency, a fresh start, or after rotating `ADMIN_PASSWORD` / `AUTH_SECRET`.

## Prerequisites
- Vercel env (Production): `AUTH_SECRET`, `ADMIN_TOKEN`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `CRON_SECRET`, `WHATSAPP_BOT_NUMBER`, `OPENWA_*`, `NVIDIA_API_KEY` (or `ANTHROPIC_API_KEY`), `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` (storage), SMTP, plus the Supabase-synced `POSTGRES_URL`.
- `.env.local` with the same `ADMIN_TOKEN` and `OPENWA_WEBHOOK_SECRET` (for the live test).
- The Vercel CLI must be driven from **PowerShell** on this machine (`cmd /c "vercel … --non-interactive < nul"`); from Git Bash it prints nothing. Add secrets with `vercel env add NAME production --value X --force --sensitive --non-interactive`.

## Bootstrap
```bash
curl -s https://goldoak.vercel.app/api/health
npm run db:seed        # GoldOak org (GOLDOAK) + admin, idempotent
# Sign in: /signin?as=agency with ADMIN_EMAIL / ADMIN_PASSWORD
```

## Agencies
- Self-service: `/agencies/signup` → org `pending`; approve at `/admin` (Approve button) → the agency admin gets an email + notification and the agency starts receiving WhatsApp contacts.
- Admin-created: `/admin` → Add an agency, or `POST /api/admin/seed { organization: {…} }` (active immediately).
- Staff: agency admins at `/agency/team`; super admin at `/admin`.

## Start afresh (sign everyone out, remove all customer data)
1. Rotate `AUTH_SECRET` on Vercel (every session cookie becomes invalid on the next deploy).
2. `POST /api/admin/seed { "purgeAllData": true }` with `x-admin-token`: removes clients, client users, conversations, contacts, requests, uploads (rows; storage objects remain in the bucket), jobs, notifications, tasks. Organisations and staff stay.

## Live tests (production, test tenants purged afterwards)
- `live-test-v3.mjs` (scratchpad; recreate from `facts/whatsapp.md` if lost): purge `TEST*` → create Alpha/Beta → bad signature (401), duplicate webhook, welcome menu, "I want to register" → registration with a question mid-flow, agency type → web link, memory recall and "change my name to …", assistance sub-menu + WIBA question, enquiry with reference, check a request, business search, image upload → OCR job → request list, voice note, handoff quiet mode, Beta isolation and memory separation, public consult, route gating, public pages without the phone number, health.
- `ui-test.cjs` (puppeteer from `C:/Users/ryanm/OpenWA/node_modules/puppeteer`, separate browser contexts per user): sign-ins, isolation of conversations/clients/threads, PDFs, portal.
- Clean up: `{ "purgeTestOrganizations": true, "purgeExampleAccounts": true }`.
