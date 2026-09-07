---
name: database
description: "Supabase Postgres: tables, connection, bootstrap, and why env values look empty locally."
metadata.type: fact
---

## Connection
- Driver: `postgres` (postgres.js), client in `lib/db/client.ts` (`getSql()`, `hasDatabase()`, `connectionString()`).
- Precedence: `DATABASE_URL` → `POSTGRES_URL` → `POSTGRES_PRISMA_URL` → `POSTGRES_URL_NON_POOLING` → built from `POSTGRES_HOST/USER/PASSWORD/DATABASE`. Empty strings count as unset.
- Supabase project ref `zvwapjpnlfavqtdtkffa`, region `eu-central-1`. Pooled URL shape: `postgresql://postgres.<ref>:<password>@aws-0-eu-central-1.pooler.supabase.com:6543/postgres`. `prepare: false` is required (transaction pooler).
- The Supabase → Vercel integration syncs `POSTGRES_*` and `SUPABASE_*` to **Production only** as **sensitive** values. `vercel env pull` writes sensitive values as empty strings. This is expected; the deployment has them. Never seed from a local machine; there is no local database, so everything is tested against production with test organisations (`TEST*` codes) that are purged afterwards.

## Schema
`lib/db/schema.ts` (embedded string), applied by `ensureSchema()` (`lib/db/migrate.ts`) on first use per server instance. Every statement is `IF NOT EXISTS`, additive `ALTER`, or an idempotent `DROP TABLE IF EXISTS` for retired tables. Comment lines are stripped before splitting on `;\n`.

| Table | Holds |
|-------|-------|
| `organizations` | tenant: name, short_name, phone, email, `whatsapp` (shared bot number), `code` (join code, unique, case-insensitive), `active`, `greeting`, `licence_label` |
| `users` | `admin` / `agency_admin` / `agency` / `client`; `organization_id`; `phone` unique = WhatsApp identity; `active`; `whatsapp_opt_in` |
| `clients` | one per legal person; `user_id` links a portal account; `stage` (six stages); `notes` = what they want to protect |
| `policies` | insurer, product, number, sums, premium, dates, status, `key_exclusions` |
| `quote_requests` | reference, product, stage, `channel` (web/whatsapp/agency), notes, `premium_estimate` |
| `quote_submissions` | per-insurer status for a request; `sent_at`, `responded_at`, `premium` |
| `claims` | reference, insurer, product, stage, amount, description, `incident_date`, `next_update_due`, channel |
| `tasks` | agency work queue with SLA, priority, `reference` (idempotent automation) |
| `activity` | timeline per client |
| `notifications` | every message to a person; `whatsapp_status` skipped/sent/failed (failed ones retried daily); unique `reference` |
| `whatsapp_contacts` | one row per phone: `organization_id` (tenant routing), `user_id`, `display_name`, `mode` ai/human, `assigned_user_id`, `workflow`/`step`/`data` (engine state), `handoff_at` |
| `conversation_messages` | every inbound/outbound message: phone, organization_id, direction, role (user/assistant/agent/system), body |
| `consultations` | questions and answers from the assistant (web or WhatsApp), `source` claude/catalogue |
| `documents` | generated PDFs: type, unique `number`, subject_id (re-used per subject) |
| `audit_log` | who did what: organization_id, actor_user_id, action, target, detail |
| `processed_webhooks` | idempotency keys for at-least-once webhooks |

Retired: `whatsapp_sessions`, `whatsapp_messages` (dropped by the schema).

## Bootstrap
`lib/db/seed.ts` → `bootstrap()`: upserts the GoldOak organisation (code `GOLDOAK`, `WHATSAPP_BOT_NUMBER`), creates the admin once (`ADMIN_EMAIL`, `ADMIN_PASSWORD`), optionally purges demo rows / `@example.com` accounts / `TEST*` organisations, and can create an agency with its first agency admin (`organization`). Exposed at `POST /api/admin/seed` (header `x-admin-token`). From a laptop: `npm run db:seed`.

## Health
`GET /api/health` → `{ database: { status, users, clients, organizations, waitingForHuman, failedWhatsApp24h }, whatsapp, ai, version, cron, auth }`. Use it after every deploy.
