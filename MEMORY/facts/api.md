---
name: api
description: "API endpoints: site forms, public assistant, uploads, documents (PDF), health, bootstrap/purge, cron, jobs, WhatsApp webhooks."
metadata.type: fact
---

## Site forms (nodemailer)
- `POST /api/contact`, `POST /api/send-form` — site forms with attachments. Env: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `TO_EMAIL`. `lib/email.ts` reuses the same account for password resets and agency-approval emails.

## Platform
- `POST /api/consult` — public. `{ question, agency? }` → `{ answer, source: claude|nvidia|catalogue, handoff }`. 12 per 10 min per IP.
- `POST /api/uploads` — session. multipart `{ file, kind?, clientId? (staff), caption? }` → `{ id, filename, status }`. Stores privately, queues OCR, drains jobs in the background. `maxDuration = 300`.
- `GET /api/uploads/<id>` — session; the record. `?file=1` streams the file (staff: own organisation; clients: own uploads only). `POST` `{ confirmed, corrections? }` records the person's confirmation.
- `GET /api/documents/<registration|client-summary|claim|quote|agency-report>?id=` — branded PDFs (see previous notes; ownership checked server-side).
- `GET /api/health` — `{ ok, database: { status, users, clients, organizations, waitingForHuman, failedWhatsApp24h }, whatsapp, ai: <model>, storage: supabase|not configured, jobs: { queued, running, failed24h, dead, done24h }, version, cron, auth, time }`.
- `POST /api/admin/seed` — `x-admin-token`. Options: `purgeDemo`, `purgeExampleAccounts`, `purgeTestOrganizations` (codes `TEST*` and everything under them), **`purgeAllData`** (start afresh: every client, conversation, request, document, job; keeps organisations and staff), `adminEmail/adminPassword/adminName`, `whatsapp`, `organization {…}` (creates an agency + first `agency_admin`, status active).
- `GET /api/cron/daily` — `Bearer CRON_SECRET` or `x-admin-token`; automation + job drain (04:00 UTC).
- `GET|POST /api/cron/jobs` — same auth; drains up to 25 jobs (04:30 UTC, or on demand).
- `POST /api/whatsapp/openwa` — OpenWA events; HMAC; idempotent; fast ack + background processing. `x-admin-token` → dry run (synchronous, replies echoed); `x-debug: 1` adds error details.
- `GET|POST /api/whatsapp/webhook` — Meta Cloud API; also background-processed.

All platform routes are `runtime = 'nodejs'`, `dynamic = 'force-dynamic'`. `next.config.js` keeps `pdfkit` external and traces `node_modules/pdfkit/js/**`.
