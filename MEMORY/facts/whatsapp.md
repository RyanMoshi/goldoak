---
name: whatsapp
description: "WhatsApp: providers (OpenWA, Meta), fast-ack webhook and background processing, tenant routing, the step engine and flows, memory and intents, media/OCR, handoff, notifications, automation, jobs."
metadata.type: fact
---

## Principle
WhatsApp is a channel, not the system. Providers only send/parse messages. Identity, tenancy, permissions and actions come from the same services the site uses. The number itself is never shown; people open it through `superAgentLink()`.

## Number and profile
`WHATSAPP_BOT_NUMBER=255742473493` (also `organizations.whatsapp`). Profile name "Super Agent" must be set on the phone (the whatsapp-web.js engine answers 403 to `PUT /profile/name`); the status line was set via `PUT /profile/status`.

## Providers (`lib/whatsapp/provider.ts`)
1. **OpenWA** (`providers/openwa.ts`): `sendText`, `sendDocument`/`sendImage` (flat DTO: `chatId` + `url` or `base64`+`mimetype`, `filename`, `caption`), `downloadMedia(chatId, messageId)`, `markRead`, `typing`. Inbound `message.received`: text or media; media inline base64 ≤ 1 MiB in `data.media.data`, else `{ omitted: true }` → download. `parseOpenWAEvent()` yields `InboundMessage { phone, text, messageId, name, media? }`. Signature `X-OpenWA-Signature: sha256=hmac(raw)` with `OPENWA_WEBHOOK_SECRET`. **The gateway times out at 10 s and retries**, hence the fast acknowledgement below. No interactive buttons on whatsapp-web.js: numbered menus everywhere.
2. **Meta Cloud API** (`providers/meta.ts`) when `WHATSAPP_ACCESS_TOKEN` + `WHATSAPP_PHONE_NUMBER_ID`.
3. None → in-app only; the OpenWA route echoes replies.

## Webhook (`app/api/whatsapp/openwa/route.ts`)
verify signature → parse → `processed_webhooks` idempotency → **return 200 immediately** and run `processInbound()` in the background via `lib/background.ts` (`waitUntil` from `@vercel/functions`); if it cannot be scheduled or throws, the message is enqueued as a `process-inbound` job so nothing is lost. `acknowledgeChat()` marks read + typing. Test mode: `x-admin-token` → synchronous, replies echoed; `x-debug: 1` adds error details. `maxDuration = 300`.

## Tenant routing (`lib/whatsapp/bot.ts` → `route()`)
account's organisation → linked contact → `JOIN <CODE>` / bare code → single active organisation → `join` flow (choose) → admin can re-route at `/admin/conversations`. Only `status = 'active'` organisations are offered. Staff numbers get the workspace command line.

## Order of handling
1 staff · 2 tenant · 3 human mode (assistant quiet, one ack per 30 min, agency notified, media still stored) · 4 media → `handleMedia` · 5 first contact → `welcome()` with consent line (`consented_at`) · 6 global commands from `understand()` (cancel, menu, help, agent) · 7 running flow: back/restart/advance; **interruption**: if the answer fails validation and reads as a question, answer it and re-ask the step (`currentPrompt`) · 8 consult mode · 9 `upload-wait` / `upload-confirm` / `upload-correct` / `assist-pick` mini-states · 10 menu numbers then intents → `dispatch()`.

## Intents (`services/memory.ts` → `understand()`)
Rules (regex) for the obvious cases, model classification (JSON) when unsure. Intents: menu, signup, claim_business, assistance, enquiry, upload, check_request, agent, help, status, quote, claim, question, update_name, update_email, recall_profile, greeting, thanks, cancel, back, restart, unknown. "Sign me up", "1" and "I want to register" all start `signup`.

## Memory
`whatsapp_contacts.memory { facts, summary, paused?, lastIntent? }` + `inbound_count`/`summarised_at`. `noteInbound()` queues a `memory-summary` job every 8 messages; `refreshSummary()` condenses the last 30 messages with the model. `memoryContext()` (facts + summary + last 6 messages) goes into the consultation prompt. Name changes: `update_name` → `name-change` flow (confirm) → `updateUserName()`; `recall_profile` answers from the user row.

## Engine and flows
Engine unchanged (`lib/conversation/engine.ts`; `startFlow(flow, ctx, preset)`, `currentPrompt`). Flows in `lib/conversation/flows.ts`: `signup` (name → email → type Individual/Business/Agency(→ web link) → business name → phone confirm → review), `claim-business` (search → pick → relationship → verification → confirm → `submitBusinessClaim`), `enquiry` (subject → details → name → confirm → `createEnquiry`), `quote`, `claim`, `name-change`, `join`. Templates in `lib/conversation/messages.ts` (`welcome`, `mainMenu`, `helpText`, `handoffReply`, `processingUpload`, `stepPrompt`, `confirmation`, …).

## Media and documents
`handleMedia()`: audio → "can't listen yet"; video/sticker → ask for photo/PDF; image/PDF → bytes (inline or download) → `uploadAllowed` (JPG/PNG/WebP/GIF/PDF ≤ 15 MB) → `storeUpload()` (Supabase Storage, `uploads` row, `ocr-upload` job) → "Document received, reading it". The job runs `processUpload()` then `afterUploadProcessed()` sends "I read your <type> … 1 Yes, save it · 2 No · 3 Skip" and sets `upload-confirm`. Confirmations land in `uploads.confirmed_data`; corrections notify the agency. Same pipeline from the portal (`POST /api/uploads`).

## Handoff (`services/handoff.ts`)
Unchanged: human mode, task, notification, reply from Conversations, take over / hand back; `MENU` returns to the assistant.

## Jobs (`services/jobs.ts`, handlers in `services/jobs/handlers.ts`)
Types: `ocr-upload`, `memory-summary`, `whatsapp-send`, `whatsapp-send-document`, `process-inbound`. Claimed with `FOR UPDATE SKIP LOCKED`, retries with exponential backoff up to `max_attempts` (4), then `dead`; stuck `running` rows are re-queued after 10 min. Drained by `processInbound()` after each message, `POST /api/uploads`, `/api/cron/jobs` (daily 04:30 UTC, or on demand with `x-admin-token`), `/api/cron/daily`, and `/admin/system` retry.

## Automation (`services/automation.ts`)
`onClientSignedUp()`; `runDailyAutomation()` (renewals 30/14/7/1, renewal task ≤45 d, quote chasers >3 d, weekly claim updates, WhatsApp outbox retry) + job drain, 04:00 UTC.

## Current deployment (September 2026)
OpenWA v0.23.4 on Ryan's Windows laptop (`C:/Users/ryanm/OpenWA`, portable Node 22, SQLite, whatsapp-web.js, `:2785`, `WEBHOOK_TIMEOUT=10000`) behind a Cloudflare quick tunnel; two scheduled tasks run `C:/Users/ryanm/tools/start-openwa.ps1`: "GoldOak OpenWA Gateway" at logon and "GoldOak OpenWA Watchdog" every 5 minutes. The script starts OpenWA and cloudflared if they are down, heals a `failed`/`disconnected` session (stop, kill the puppeteer Chrome, delete `Singleton*` locks, start), restarts a tunnel whose URL no longer answers, and updates Vercel `OPENWA_BASE_URL` + redeploys when the URL changes (retrying the CLI once). When the session shows `qr_ready` the pairing was lost and only a QR scan on the phone fixes it: fetch `GET /api/sessions/:id/qr?format=image` (JSON with a data-URI), decode to PNG and send it to Ryan; the code expires after about a minute, so refresh it if unscanned. Symptom of all of these: "WhatsApp gives no replies". **This is the only laptop-bound component.** To go always-on: run OpenWA in Docker on a VPS with a stable HTTPS URL, copy `OpenWA/.env` + `OpenWA/data/` (session), set `OPENWA_BASE_URL`, re-register the webhook, disable the scheduled task.
