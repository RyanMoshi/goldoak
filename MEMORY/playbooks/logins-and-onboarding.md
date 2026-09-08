---
name: logins-and-onboarding
description: "How each role signs in, how agencies and clients are onboarded, how to start afresh (rotate AUTH_SECRET, purge), environment variables and deploy checks."
metadata.type: playbook
---

## Sign-in procedures
| Who | Where | Tab | Lands on |
|-----|-------|-----|----------|
| Super admin | https://goldoak.vercel.app/signin | Agency | `/admin` (Agencies, Conversations, WhatsApp, Emails, Templates, System) |
| GoldOak agency admin / staff | `/signin` | Agency | `/agency/today` (GoldOak is tenant `GOLDOAK`, nothing special) |
| Any other agency's staff | `/signin` | Agency | `/agency/today` of that agency; picker at `/choose-agency` when the email belongs to several |
| Client | `/signin` | Client | `/portal` of the agency chosen (picker when several) |

First sign-in with a temporary password always goes to `/account/password?first=1`; the old password stops working the moment the new one is saved. "Change password" and "Switch agency" live in the profile menu (bottom of the sidebar / top-right avatar).

## Onboarding an agency (scalable, no code)
1. **Self-serve**: the agency fills `/agencies/signup` → verifies email (OTP) → status `pending`. Super admin gets `admin-alert`; approve at `/admin` → `agency-approved` email; the agency admin signs in, sets branding (`/agency/settings`), assistant knowledge (`/agency/ai`), connects its own WhatsApp number (`/agency/whatsapp`), invites staff (`/agency/team`) and clients (`/agency/clients/new`).
2. **Admin-created**: `/admin` → "Create an agency" (name, code, contact, first admin) → temporary password emailed/WhatsApped.
3. **API**: `POST /api/admin/seed` with `x-admin-token` and `{ organization: { name, code, adminName, adminEmail, adminPassword, adminPhone } }`.

## Onboarding a client
`/agency/clients/new` with "Send an invitation" ticked: new email → account with a temporary password (email `invitation` + WhatsApp); existing email → the identity is attached to this agency as a client (email + WhatsApp say "sign in with your usual password"); untick → lead only. Clients can also self-register at `/signup?agency=CODE` or on WhatsApp (reply 1).

## Per-agency WhatsApp number
`/agency/whatsapp` → Connect → scan the QR from the agency's phone. Routing is Number → Agency → Client → Conversation (`whatsapp_channels.session_id` → `organization_id`; the webhook resolves the session id first). The shared Super Agent number keeps routing by account / join code / choice. Admin overview at `/admin/channels`.

## Start afresh
1. Rotate the session secret (signs everyone out): Vercel → Project → Settings → Environment Variables → `AUTH_SECRET` → new 32+ random chars → redeploy. Or `vercel env rm AUTH_SECRET production` then `vercel env add AUTH_SECRET production`.
2. Purge data (keeps organisations and staff accounts, removes every client/conversation/request/document/job):
   `curl -X POST https://goldoak.vercel.app/api/admin/seed -H "x-admin-token: $ADMIN_TOKEN" -H "content-type: application/json" -d '{"purgeAllData":true}'`
   Add `"purgeTestOrganizations":true` to remove agencies whose code starts with `TEST`. Otto Test Agency (code `OTTO`) from the September 2026 tests must be deactivated/removed by hand at `/admin`.
3. Re-invite the real GoldOak agency admin from `/admin` (a temporary password is emailed).

## Environment variables (Vercel, production)
| Name | Purpose |
|------|---------|
| `POSTGRES_HOST/USER/PASSWORD/DATABASE` (or `DATABASE_URL`) | Supabase Postgres |
| `AUTH_SECRET` | session + OTP signing (rotate to sign everyone out) |
| `ADMIN_TOKEN`, `CRON_SECRET` | admin routes (`/api/admin/*`), cron (`/api/cron/*`) |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | bootstrap super admin |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` | email platform |
| `NVIDIA_API_KEY`, `AI_MODEL`, `AI_FALLBACK_MODELS`, `AI_VISION_MODEL`, `AI_OCR_MODEL` | AI (fallback default `nvidia/nemotron-3.5-lightning-30b-a3b`) |
| `OPENWA_BASE_URL`, `OPENWA_API_KEY`, `OPENWA_SESSION_ID`, `OPENWA_WEBHOOK_SECRET` | WhatsApp gateway |
| `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `STORAGE_BUCKET` | file storage |
| `NEXT_PUBLIC_SITE_URL` | links in emails/WhatsApp |

## Verify a deploy
`GET /api/health` → `version` equals the commit, `database.status ok`, `jobs.queued` near 0, `ai`, `whatsapp`, `cron`, `auth` configured. `GET /api/admin/inspect` (with `x-admin-token`) lists identities, memberships, agencies, last emails, jobs, channels, conversations and the audit trail. Live UI tests: the puppeteer scripts described in `bootstrap-admin.md` (sign in as admin → create agency → invite → first login → client invite → portal chat → reload).
