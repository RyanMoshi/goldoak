---
name: api
description: "API endpoints: site forms, public assistant, documents, health, bootstrap, cron, WhatsApp webhooks."
metadata.type: fact
---

## Site forms (nodemailer)
- `POST /api/contact` — risk review and quote request forms; branded HTML email to admin + confirmation to client; attachments.
- `POST /api/send-form` — insurance application form with files.
Env: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `TO_EMAIL`.

## Platform
- `POST /api/consult` — public. `{ question, agency? }` → `{ answer, source: claude|catalogue, handoff }`. Per-IP limit 12 per 10 minutes (in-memory per instance). Not personalised.
- `GET /api/documents/<type>?id=<subject>` — session cookie required. Types: `registration` (id = client), `client-summary` (id = client), `claim` (id = claim), `quote` (id = quote request), `agency-report` (staff only). Staff: subject must belong to `session.oid`; clients: subject must be theirs (id ignored for registration/summary). Returns `application/pdf`, header `X-Document-Number`, and writes `documents` + `audit_log`.
- `GET /api/health` — `{ ok, database: { status, users, clients, organizations, waitingForHuman, failedWhatsApp24h }, whatsapp, ai: claude|catalogue, version: <commit>, cron, auth, time }`.
- `POST /api/admin/seed` — header `x-admin-token`. Body options: `purgeDemo`, `purgeExampleAccounts`, `purgeTestOrganizations` (codes starting `TEST`), `adminEmail/adminPassword/adminName`, `whatsapp`, and `organization: { name, shortName?, code, phone?, email?, greeting?, adminName, adminEmail, adminPassword, adminPhone? }` which creates an agency and its first `agency_admin`. Returns `{ organization, admin, adminEmail, purged?, createdOrganization? }`.
- `GET /api/cron/daily` — `Authorization: Bearer <CRON_SECRET>` or `x-admin-token`. Returns the automation summary (incl. `whatsappRetried`, `whatsappRecovered`).
- `POST /api/whatsapp/openwa` — OpenWA events; HMAC `X-OpenWA-Signature`; idempotent via `X-OpenWA-Idempotency-Key`. With `x-admin-token` it returns `{ dryRun: true, replies, organizationId, userId, answered }` without sending.
- `GET|POST /api/whatsapp/webhook` — Meta Cloud API verification and inbound messages.

All platform routes are `runtime = 'nodejs'`, `dynamic = 'force-dynamic'`. `next.config.js` traces `node_modules/pdfkit/js/data/**` into the documents function.
