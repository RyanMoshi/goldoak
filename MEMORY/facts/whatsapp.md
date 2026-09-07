---
name: whatsapp
description: "WhatsApp providers (OpenWA, Meta), the bot's commands and flows, webhooks, notifications and daily automation."
metadata.type: fact
---

## Principle
WhatsApp is a channel, not the system. Providers only send text and parse inbound messages. Identity, permissions and actions come from the same services the site uses, so a client can start on WhatsApp and continue on the site or the other way round.

## Number
`+255 742 473 493` → `WHATSAPP_BOT_NUMBER=255742473493` and `organizations.whatsapp`. Shown on `/super-agent`, the homepage section and the portal WhatsApp card.

## Providers (`lib/whatsapp/provider.ts` → `getProvider()`)
1. **OpenWA** (`providers/openwa.ts`) when `OPENWA_BASE_URL`, `OPENWA_API_KEY`, `OPENWA_SESSION_ID` are set. Send: `POST {base}/api/sessions/{session}/messages/send-text` with `X-API-Key` and `{ chatId: "<phone>@c.us", text }`. Webhook: `POST /api/whatsapp/openwa`, body `{ event, sessionId, idempotencyKey, deliveryId, data }`, header `X-OpenWA-Signature: sha256=<hmac of raw body>` verified with `OPENWA_WEBHOOK_SECRET`; `X-OpenWA-Idempotency-Key` stored in `processed_webhooks`. Only `message.received`, individual, non-`fromMe`, text messages are handled; `@lid` senders are ignored unless `senderPhone` is present (enable `RESOLVE_LID_TO_PHONE=true` on OpenWA).
2. **Meta Cloud API** (`providers/meta.ts`) when `WHATSAPP_ACCESS_TOKEN` + `WHATSAPP_PHONE_NUMBER_ID` are set. Webhook `GET/POST /api/whatsapp/webhook` (verify token, `X-Hub-Signature-256`).
3. None → notifications are stored for the portal only; `/api/whatsapp/openwa` echoes `reply` in its JSON for testing.

`sendWhatsApp(phone, text)` never throws; it returns whether the message was sent.

## Bot (`lib/whatsapp/bot.ts` → `handleInbound(phone, text)`)
Identity = `users.phone` (active users). Unknown numbers get the sign-up link.

**Clients** (word or number): `1 STATUS` · `2 POLICIES` · `3 QUOTES` · `4 CLAIMS` · `5 QUOTE` (flow: product → notes → `requestQuote`) · `6 CLAIM` (flow: policy → what happened → YES → `reportClaim`) · `7 UPDATES` (marks notifications read) · `8 ADVISER` · `STOP` cancels a flow. Flow state in `whatsapp_sessions`, expires after 2 hours. Product names are matched from free text (`matchProduct`).

**Agency/admin users**: `TODAY`, `RENEWALS`, `QUOTES`, `CLAIMS`, `FIND <name>`, `WITHOUT <product>`, `MENU`, all via `runAgencyCommand()` (same as the dashboard command bar).

## Notifications (`services/notifications.ts`)
`notify({ organizationId, userId, clientId, kind, title, body, reference?, phone?, inAppOnly? })` inserts a row (portal "Updates") and sends `title\n\nbody` on WhatsApp when a phone exists and the user has not opted out. `reference` makes it idempotent (unique index). `notifyOrganization()` fans out to every active agency/admin user of the organisation.

## Automation (`services/automation.ts`)
- `onClientSignedUp()` — welcome to the client (with the WhatsApp commands), lead task + notification to the agency.
- `runDailyAutomation()` via `GET /api/cron/daily` (Vercel cron `0 4 * * *`, `Authorization: Bearer CRON_SECRET`, or `x-admin-token`): marks policies `renewal-due` at ≤30 days; reminders at 30/14/7/1 days (`renewal-<n>:<policyId>`); renewal task at ≤45 days; quote chaser task when a submission is awaiting >3 days; weekly claim-update task when `next_update_due` ≤ today.

## Logs
`whatsapp_messages` (direction in/out) and `notifications.whatsapp_status`.

## Current deployment (September 2026)
- OpenWA v0.23.4 runs on Ryan's Windows laptop at `C:/Users/ryanm/OpenWA` under a portable Node 22 (`C:/Users/ryanm/tools/node22`), SQLite, whatsapp-web.js engine, API only on `:2785` (dashboard disabled). `better-sqlite3` is pinned to 12.4.1 with a downloaded prebuilt binary because 13.x has no Windows prebuilt and the machine has no C++ toolchain.
- Session `goldoak` (id in `.env.local` as `OPENWA_SESSION_ID`) is paired with +255 742 473 493. Webhook registered to `https://goldoak.vercel.app/api/whatsapp/openwa` with `OPENWA_WEBHOOK_SECRET`.
- Public URL is a Cloudflare **quick tunnel** (`C:/Users/ryanm/tools/cloudflared.exe`), which changes on every restart. `C:/Users/ryanm/tools/start-openwa.ps1` (scheduled task "GoldOak OpenWA Gateway", at logon) starts both processes, reads the new URL and updates Vercel's `OPENWA_BASE_URL` + redeploys. Log: `C:/Users/ryanm/tools/start-openwa.log`. Run by hand: `Start-ScheduledTask -TaskName "GoldOak OpenWA Gateway"`.
- The Vercel `OPENWA_API_KEY` is OpenWA's master key (this build has no key-management route). Keys live in `goldoak/.env.local`.
- To move to a server: copy `OpenWA/.env` and `OpenWA/data/` (session credentials) to the host, run with Docker, set `OPENWA_BASE_URL` to the host's HTTPS URL, disable the scheduled task.
