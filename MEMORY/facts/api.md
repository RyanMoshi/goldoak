---
name: api
description: "API endpoints: site forms, health, bootstrap, cron, WhatsApp webhooks."
metadata.type: fact
---

## Site forms (nodemailer)
- `POST /api/contact` — risk review and quote request forms; branded HTML email to admin + confirmation to client; attachments.
- `POST /api/send-form` — insurance application form with files.
- `POST /api/upload` — saves to `public/uploads/`.
Env: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `TO_EMAIL`.

## Platform
- `GET /api/health` — no auth. `{ ok, database: { status: ok|unconfigured|error, users, clients, detail? }, whatsapp: openwa|meta|not configured, cron, auth, time }`.
- `POST /api/admin/seed` — header `x-admin-token: <ADMIN_TOKEN>`; JSON body optional `{ purgeDemo, adminEmail, adminPassword, adminName, whatsapp }`. Upserts the organisation, creates the admin once. Returns `{ organization, admin, adminEmail, purged }`.
- `GET /api/cron/daily` — `Authorization: Bearer <CRON_SECRET>` (what Vercel Cron sends) or `x-admin-token`. Returns the automation summary.
- `POST /api/whatsapp/openwa` — OpenWA `message.received` events; HMAC via `X-OpenWA-Signature`; idempotent via `X-OpenWA-Idempotency-Key`. Echoes `reply` when no gateway is configured.
- `GET|POST /api/whatsapp/webhook` — Meta Cloud API verification and inbound messages.

All platform routes are `runtime = 'nodejs'`, `dynamic = 'force-dynamic'`.
