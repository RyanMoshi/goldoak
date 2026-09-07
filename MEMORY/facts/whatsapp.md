---
name: whatsapp
description: "WhatsApp: providers (OpenWA, Meta), tenant routing on one shared number, the step engine and flows, consultation, human handoff, webhooks, notifications and daily automation."
metadata.type: fact
---

## Principle
WhatsApp is a channel, not the system. Providers only send text and parse inbound messages. Identity, tenancy, permissions and actions come from the same services the site uses, so a person can start on WhatsApp and continue on the site or the other way round.

## Number
`+255 742 473 493` → `WHATSAPP_BOT_NUMBER=255742473493` and `organizations.whatsapp` (same number for every agency). Profile name should be "Super Agent" (set on the phone; the whatsapp-web.js engine refuses the API call). Status line set via `PUT /api/sessions/:id/profile/status`.

## Providers (`lib/whatsapp/provider.ts` → `getProvider()`)
1. **OpenWA** (`providers/openwa.ts`) when `OPENWA_BASE_URL`, `OPENWA_API_KEY`, `OPENWA_SESSION_ID` are set. Send: `POST {base}/api/sessions/{session}/messages/send-text` with `X-API-Key` and `{ chatId: "<phone>@c.us", text }`. Webhook `POST /api/whatsapp/openwa`, body `{ event, sessionId, idempotencyKey, deliveryId, data }`, header `X-OpenWA-Signature: sha256=<hmac of raw body>` (secret `OPENWA_WEBHOOK_SECRET`), idempotent via `processed_webhooks`. Only `message.received`, individual, non-`fromMe`, text messages are handled; `data.pushName` becomes the contact's display name. With header `x-admin-token: <ADMIN_TOKEN>` the route is a **dry run**: replies are echoed, nothing is sent (used by the live test).
2. **Meta Cloud API** (`providers/meta.ts`) when `WHATSAPP_ACCESS_TOKEN` + `WHATSAPP_PHONE_NUMBER_ID` are set. Webhook `GET/POST /api/whatsapp/webhook`.
3. None → notifications are stored for the portal only; the OpenWA route echoes `reply`.

`sendWhatsApp(phone, text)` never throws; it returns whether the message was sent. `handleInbound(phone, text, name)` returns `{ replies[], userId, organizationId, answered }`.

## Tenant routing (`lib/whatsapp/bot.ts` → `route()`)
1. Number belongs to a user → that user's organisation (contact is re-linked automatically).
2. Contact already linked (`whatsapp_contacts.organization_id`).
3. Message is `JOIN <CODE>` / `AGENCY <CODE>` / a bare code → that organisation, its greeting, its guest menu. Onboarding link: `https://wa.me/255742473493?text=JOIN%20<CODE>` (shown on `/agency/settings`).
4. Exactly one active organisation → auto-link. Several → the `join` flow lists them (number or code).
5. Super admin can re-route any contact at `/admin/conversations`.
Staff (`admin`, `agency_admin`, `agency`) numbers get the workspace command line (TODAY, RENEWALS, QUOTES, CLAIMS, FIND, WITHOUT).

## Engine (`lib/conversation/engine.ts`)
A flow = ordered steps `{ id, label, question, choices?, hint?, optional?, skip?(data), parse() }`. The caller stores `{ step, data }` on the contact (`workflow`, `step`, `data`; expires after 2 hours). Global commands handled by the bot: `MENU`/`0`, `CANCEL`/`STOP`, `RESTART`, `HELP`, `BACK`, `SKIP` (optional steps), `9`/`ADVISER` (handoff). After the last step the engine shows a summary: `1` confirm → `onComplete`, `2` change something (pick a field, re-ask, back to summary), `3` cancel. Validation errors are prefixed ⚠️ and re-ask the question. Templates in `lib/conversation/messages.ts` (`stepPrompt`, `confirmation`, `menuBlock`, `success`, …).

## Flows (`lib/conversation/flows.ts`)
- `signup` (guests): name → who is it for → business name (skipped for individuals) → email (checked for duplicates) → what to protect (optional) → confirm → `createClientUser` (generated password) + `onClientSignedUp`; reply includes the website login.
- `quote` (clients): cover (number or free text, `matchProduct`) → details (optional) → confirm → `requestQuote`.
- `claim` (clients with a live policy): policy → what happened → when (TODAY / YESTERDAY / date, optional) → confirm → `reportClaim`.
- `join`: choose agency by number or code.
- `consult` mode (not a step flow): every message → `services/consult.ts`; `MENU` leaves. `[HANDOFF]` from the model triggers a handoff.

## Menus
Guest: 1 Create my account · 2 Ask a question · 3 Talk to an adviser · 4 About. Client: 1 Where things stand · 2 Policies · 3 Quotes · 4 Claims · 5 Ask for cover · 6 Report a claim · 7 Ask a question · 8 Updates · 9 Talk to an adviser.

## Human handoff (`services/handoff.ts`)
`requestHandoff` sets `whatsapp_contacts.mode='human'`, creates a lead-contact task, notifies the organisation (portal + WhatsApp) and audits. In human mode the assistant stays quiet (one acknowledgement per 30 minutes) and every inbound raises an in-app notification. Advisers reply from `/agency/conversations/<phone>` (`agentReply` → WhatsApp, role `agent`), can "Take over" or "Hand back to assistant" (`resumeAssistant`). The client can type `MENU` to return to the assistant.

## Notifications (`services/notifications.ts`)
`notify({ organizationId, userId, clientId, kind, title, body, reference?, phone?, inAppOnly? })` stores a row and sends on WhatsApp when a phone exists and the user has not opted out; `reference` makes it idempotent. `notifyOrganization()` fans out to every active staff user of the organisation. Failed sends are retried by the daily cron for 3 days.

## Automation (`services/automation.ts`)
`onClientSignedUp()` (welcome, lead task, agency notification) and `runDailyAutomation()` via `GET /api/cron/daily` (Vercel cron `0 4 * * *`): renewal-due marking, reminders at 30/14/7/1 days, renewal task at ≤45 days, quote chasers >3 days, weekly claim-update tasks, WhatsApp outbox retry.

## Logs
`conversation_messages` (in/out, role user/assistant/agent/system), `consultations`, `notifications.whatsapp_status`, `audit_log`.

## Current deployment (September 2026)
- OpenWA v0.23.4 runs on Ryan's Windows laptop at `C:/Users/ryanm/OpenWA` under a portable Node 22 (`C:/Users/ryanm/tools/node22`), SQLite, whatsapp-web.js engine, API only on `:2785`. `better-sqlite3` is pinned to 12.4.1 with a prebuilt binary.
- Session `goldoak` (id in `.env.local` as `OPENWA_SESSION_ID`) is paired with +255 742 473 493. Webhook registered to `https://goldoak.vercel.app/api/whatsapp/openwa` with `OPENWA_WEBHOOK_SECRET`.
- Public URL is a Cloudflare quick tunnel that changes on restart. `C:/Users/ryanm/tools/start-openwa.ps1` (scheduled task "GoldOak OpenWA Gateway", at logon) starts both processes and updates Vercel's `OPENWA_BASE_URL` + redeploys. Run by hand: `Start-ScheduledTask -TaskName "GoldOak OpenWA Gateway"`.
- Only this gateway depends on the laptop. To move to a server: copy `OpenWA/.env` and `OpenWA/data/` to the host, run with Docker, set `OPENWA_BASE_URL` to the host's HTTPS URL, disable the scheduled task.
