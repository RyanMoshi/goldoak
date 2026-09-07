---
name: bootstrap-admin
description: "Bootstrap the database, create the platform admin, create agencies, invite staff, run the live multi-agency test."
metadata.type: playbook
---

## When
First deployment, a new database, a new agency, or after rotating `ADMIN_PASSWORD`.

## Prerequisites
- Vercel env (Production): `AUTH_SECRET`, `ADMIN_TOKEN`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `CRON_SECRET`, `WHATSAPP_BOT_NUMBER`, `OPENWA_*`, optional `ANTHROPIC_API_KEY`, plus the Supabase-synced `POSTGRES_URL`.
- `.env.local` with the same `ADMIN_TOKEN` and `OPENWA_WEBHOOK_SECRET` (for the live test).

## Bootstrap
```bash
curl -s https://goldoak.vercel.app/api/health          # 1. healthy?
npm run db:seed                                          # 2. GoldOak org (code GOLDOAK) + admin, idempotent
# 3. Sign in: https://goldoak.vercel.app/signin?as=agency  (Agency tab, ADMIN_EMAIL / ADMIN_PASSWORD)
```

## Create an agency (tenant)
- UI: `/admin` → "Add an agency": name, short name, join code, contacts, greeting, first agency admin (name, email, WhatsApp, password or blank to generate). The success message shows the password once.
- API (scripts): `POST /api/admin/seed` with `x-admin-token` and body `{ "organization": { "name", "code", "email", "adminName", "adminEmail", "adminPassword" } }`.
- The agency admin signs in on the Agency tab, opens `/agency/settings` for the join code and onboarding links, and `/agency/team` to invite advisers.

## Invite staff
- Agency admins: `/agency/team` (agency staff or agency admin, password chosen or generated).
- Super admin: `/admin` → "Invite a user into any agency" (choose the agency).

## Live multi-agency test
Script: `scratch/live-test.mjs` pattern (kept outside the repo; recreate from `facts/whatsapp.md` if lost). It: purges `TEST*` organisations, creates Alpha and Beta via the seed endpoint, drives the signed OpenWA webhook in dry-run mode (`x-admin-token`) through choose-agency, JOIN code, WhatsApp sign-up with BACK and "change something", quote flow, consultation, handoff quiet mode, and checks Beta never sees Alpha; then checks route gating, document auth, public consult and public pages. Clean up afterwards with `{ "purgeTestOrganizations": true, "purgeExampleAccounts": true }`.

## Notes
- The admin is created only if no admin with that email exists. Reset any staff password from `/admin` or `/agency/team`.
- Clients never need this: they sign up at `/signup` or on WhatsApp.
