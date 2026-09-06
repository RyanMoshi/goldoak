---
name: database
description: "Supabase Postgres: tables, connection, bootstrap, and why env values look empty locally."
metadata.type: fact
---

## Connection
- Driver: `postgres` (postgres.js), client in `lib/db/client.ts` (`getSql()`, `hasDatabase()`, `connectionString()`).
- Precedence: `DATABASE_URL` → `POSTGRES_URL` → `POSTGRES_PRISMA_URL` → `POSTGRES_URL_NON_POOLING` → built from `POSTGRES_HOST/USER/PASSWORD/DATABASE`. Empty strings count as unset.
- Supabase project ref `zvwapjpnlfavqtdtkffa`, region `eu-central-1`. Pooled URL shape: `postgresql://postgres.<ref>:<password>@aws-0-eu-central-1.pooler.supabase.com:6543/postgres`. `prepare: false` is required (transaction pooler).
- The Supabase → Vercel integration syncs `POSTGRES_*` and `SUPABASE_*` to **Production only** as **sensitive** values. `vercel env pull` writes sensitive values as empty strings. This is expected; the deployment has them. Never seed from a local machine.

## Schema
`lib/db/schema.sql`, applied by `ensureSchema()` (`lib/db/migrate.ts`) on first use per server instance. Every statement is `IF NOT EXISTS` or additive `ALTER`. Comment lines are stripped before splitting on `;\n`.

| Table | Holds |
|-------|-------|
| `organizations` | tenant (GoldOak = `org_goldoak`), phone, email, `whatsapp` (bot number) |
| `users` | admin/agency/client accounts; `phone` unique = WhatsApp identity; `active`; `whatsapp_opt_in` |
| `clients` | one per legal person; `user_id` links a portal account; `stage` (six GoldOak stages); `notes` = what they want to protect |
| `policies` | insurer, product, number, sums, premium, dates, status, `key_exclusions` |
| `quote_requests` | reference, product, stage, `channel` (web/whatsapp/agency), notes |
| `quote_submissions` | per-insurer status for a request (awaiting/received/clarification/ready/declined) |
| `claims` | reference, insurer, product, stage, amount, description, `next_update_due`, channel |
| `tasks` | agency work queue with SLA, priority, `reference` (used for idempotent automation) |
| `activity` | timeline per client |
| `notifications` | every message to a person; `whatsapp_status` skipped/sent/failed; unique `reference` for dedupe |
| `whatsapp_sessions` | multi-step bot flows (quote, claim) per phone |
| `whatsapp_messages` | inbound/outbound log |
| `processed_webhooks` | idempotency keys for at-least-once webhooks |

## Bootstrap
`lib/db/seed.ts` → `bootstrap()`: upserts the organisation (with `WHATSAPP_BOT_NUMBER`), creates the admin once (`ADMIN_EMAIL`, `ADMIN_PASSWORD`), optionally purges the old demo rows. Exposed at `POST /api/admin/seed` (header `x-admin-token: ADMIN_TOKEN`). Run from a laptop with `npm run db:seed` (`scripts/seed.mjs`, reads `ADMIN_TOKEN` and optional `SEED_ADMIN_PASSWORD` from `.env.local`).

## Health
`GET /api/health` → `{ database: { status, users, clients }, whatsapp, cron, auth }`. Use it after every deploy.
