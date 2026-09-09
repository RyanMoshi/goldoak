# Super Agent — production handover

Super Agent is a multi-tenant insurance platform. One deployment serves many
independent agencies; each has its own staff, clients, WhatsApp number,
branding, documents and AI configuration, and none can see another's.

- **Live:** https://goldoak.vercel.app
- **Code:** https://github.com/RyanMoshi/goldoak (branch `main`, deploys on push)
- **Database:** Supabase Postgres · **Email:** SMTP · **AI:** NVIDIA NIM · **WhatsApp:** OpenWA gateway

---

## 1. The four things that are not the same thing

| | What it is | Where it lives | Who gets in |
|---|---|---|---|
| **Super Admin** | The platform operator. Oversees every agency, every user, every channel and the platform's health. Belongs to no agency, and links to no agency workspace. | `/super-admin`, signing in at `/super-admin/login` | The bootstrap administrator account |
| **Super Agent** | The AI product that serves all agencies. Managed on its own terms: usage, models, shared knowledge, failures. | `/superagent` | Super Admin |
| **Agency** | One insurance agency: its people, clients, conversations, documents, money. GoldOak is one of these, with no special treatment. | `/agency/*` | That agency's admins and staff |
| **Client** | A customer of one agency. Sees only their own cover. | `/portal/*` | The client |

GoldOak Insurance Agency is a tenant like any other. There is no GoldOak-only
code path in authentication, routing or data access: it was created through the
same agency onboarding every other agency uses, and its administrators sign in
through the ordinary agency sign-in.

---

## 2. Signing in

Agencies and clients sign in at **https://goldoak.vercel.app/signin**, where the
tab decides which kind of membership counts. The platform operator has a
separate door at **/super-admin/login** which accepts nobody else:

| Who | Tab | Lands on |
|---|---|---|
| Super Admin | Agency | `/super-admin` |
| Agency admin or staff (GoldOak or any other) | Agency | `/agency/today` for that agency |
| Client | Client | `/portal` |

Rules that apply to everyone:

- **A temporary password always leads to `/account/password` first.** Nothing
  else is reachable until a new password is set. The temporary one stops working
  the moment it is changed.
- **One email, several agencies.** The same person can be a client of one agency
  and staff of another. If more than one membership matches the tab, the agency
  picker at `/choose-agency` appears; "Switch agency" is in the profile menu
  afterwards.
- **Five wrong passwords locks the account for fifteen minutes.** Every sign-in,
  failure and lockout is written to the audit log, and a "new sign-in" email goes
  to the account holder.
- Forgotten password: **Forgot your password?** on the sign-in page sends a
  one-hour reset link. An administrator can also issue a fresh temporary password.

### Creating the first Super Admin

The administrator is created by the bootstrap endpoint from environment
variables — never from code, and never with a password committed to the repo:

```bash
curl -X POST https://goldoak.vercel.app/api/admin/seed \
  -H "x-admin-token: $ADMIN_TOKEN" -H "content-type: application/json" -d '{}'
```

It reads `ADMIN_EMAIL` and `ADMIN_PASSWORD` from the deployment. If an
administrator with that email already exists it does nothing. To rotate the
administrator's password, set a new `ADMIN_PASSWORD` and call it again.

---

## 3. What the Super Admin can do

At `/super-admin`:

- **Agencies** — create an agency and its first administrator, approve agencies
  that signed themselves up, activate or suspend.
- **Accounts** — create staff in any agency, issue a fresh temporary password,
  deactivate, and **View as** (impersonation). Impersonation shows a gold banner
  for the whole session, expires after an hour, and both the start and the end
  are recorded in the audit log against the administrator.
- **Conversations** — every WhatsApp conversation across the platform.
- **WhatsApp** — every agency's connected number and the shared line.
- **Emails / Templates** — delivery log for every agency, and the global email
  wording an agency's own wording sits on top of.
- **System** — health, background jobs, dead letters.
- **Super Agent** — the AI console (below).

---

## 4. Super Agent, the AI product

At `/superagent`: answers and success rate, response times, which agencies use
it and how well they have configured it, which models answered, failures and
fallbacks, and the global policy.

**How it stays neutral.** The prompt is assembled per answer in this order:

1. **Agency layer** — who the assistant is speaking for, its tone, products,
   FAQs and escalation rules, read from *that agency's* settings.
2. **Fixed ground rules** — including: never mention, recommend or compare
   another agency or intermediary; never reveal anything about another agency on
   the platform; if asked who built it, say it runs on the Super Agent platform.
3. **Platform policy** — anything the operator writes at
   `/superagent/knowledge`, applied to every agency equally.
4. **Neutral product catalogue** — insurance product types, never who sells them.
5. **The person's own records** — their policies, their conversation, their memory.

Nothing from one agency ever enters another agency's prompt. Serving Literal
Insurance, the assistant is Literal's assistant; serving GoldOak, it is
GoldOak's. Telemetry in `/superagent` is operational only — model, latency,
success, agency — never message content.

---

## 5. Onboarding an agency

**Self-serve:** the agency completes `/agencies/signup`, verifies its email with
a one-time code, and waits. The Super Admin is emailed, approves at `/super-admin`, and
the agency admin gets an approval email.

**Operator-created:** `/super-admin` → create the agency and its first administrator.
A friendly temporary password (e.g. `Mango4827`) is emailed and, where a number
is known, sent on WhatsApp.

Either way the agency admin then works through the checklist at
`/agency/onboarding` (also shown on Today until it is finished):

| Step | Where | Why it matters |
|---|---|---|
| Agency registered | `/agency/settings` | Legal name and contacts appear on every document |
| Administrator account | `/account/password` | Their own password, not a shared one |
| Branding | `/agency/settings` | Logo and colours on emails, PDFs, quotes, invoices |
| WhatsApp number | `/agency/whatsapp` | Clients reach the assistant on the agency's own number |
| Assistant knowledge | `/agency/ai` | Answers use their products and tone |
| Team | `/agency/team` | Work is assigned to real people |
| Clients | `/agency/clients/new` | Reminders, quotes and the assistant work from these |

A step is ticked when the thing actually exists, not when a button was clicked.

---

## 6. Onboarding a client

`/agency/clients/new`, with **Send an invitation** ticked:

- **New email** → account created, temporary password emailed and WhatsApped.
- **Email already on the platform** → that identity is added to this agency as a
  client. They keep their existing password; their other agencies see nothing.
- **Unticked** → a lead record only, no login.

Clients can also self-register at `/signup?agency=CODE`, or on WhatsApp by
replying `1`. First sign-in always forces a password change.

---

## 7. WhatsApp, per agency

Routing is **Number → Agency → Client → Conversation**. Each agency connects its
own number at `/agency/whatsapp` (scan the QR from the agency's phone); the
session id maps to the agency in `whatsapp_channels`, and the webhook resolves
the agency from the session before anything else. A conversation therefore
belongs to exactly one agency, and outbound messages go out from that agency's
own number. The shared Super Agent line still works for agencies without their
own number, routed by account, join code, or asking which agency.

---

## 8. Campaigns

`/agency/campaigns` (agency admins). Compose once, choose the audience by
journey stage, client type, or policies expiring within N days, preview exactly
how many people it reaches, then launch.

- Sending happens in a **background worker**, twenty at a time, with a pause
  between WhatsApp messages. The dashboard never blocks and a closed tab does
  not stop it.
- Every recipient is a row that moves from pending to sent, failed or skipped
  **once**, so a retry or a crash never double-sends.
- Opt-outs are honoured: the agency's do-not-contact list plus each client's own
  marketing preference. Skipped recipients are counted and shown.
- Audiences of fifty or more require the count to be typed to confirm.
- Scheduled campaigns start on the next worker run after their time.

---

## 9. Email

One service renders, logs and delivers everything: welcome, invitation,
temporary password, verification code, password reset, security alerts, renewal,
payment and appointment reminders, claim updates, document received, quotations,
invoices, invoice reminders, staff and system notices, and campaigns.

- Every email uses the **agency's own branding** — logo, colours, contact
  details, footer — resolved per tenant at send time.
- Templates live in one registry with `{{variables}}`; agencies may reword the
  parts marked customisable at `/agency/templates`, on top of the global wording
  at `/admin/templates`.
- Delivery is queued with retry and backoff, and every attempt is logged with its
  status and error. Agencies see their own log at `/agency/emails`; the operator
  sees all of them at `/admin/emails`.
- Security and account emails are always sent. Reminders, updates and marketing
  can be switched off by each client at `/portal/profile`.

---

## 10. Automated reminders

The daily sweep (`/api/cron/daily`) does this, idempotently:

- Marks policies entering the renewal window.
- Sends renewal reminders on each agency's configured days (default 30, 14, 7, 1)
  by email, WhatsApp and in-app.
- Chases quote SLAs and claim updates.
- Marks invoices overdue and quotations expired.
- Chases overdue invoices on day 1, 7, 14 and 30 — never daily.
- Starts any campaign whose scheduled time has passed.
- Retries failed WhatsApp deliveries.

---

## 11. Quotations and invoices

`/agency/billing/quotes` and `/agency/billing/invoices`.

- Numbered per agency and year (`QT-2026-0001`, `INV-2026-0001`) from a sequence
  that cannot collide or reuse.
- Line items with quantity, unit price, discount and tax; totals are recomputed
  from the lines on every save, so the screen, the PDF and the database agree.
- **Send**: email with the branded PDF attached, or a share link (`/d/<token>`)
  that needs no login and shows the agency's branding.
- **Track**: draft → sent → accepted/declined/expired for quotations; draft →
  sent → part paid → paid, or overdue, for invoices. Payments are recorded
  against the invoice and the balance is shown everywhere.

---

## 12. PDFs

All generated documents share one engine (`lib/pdf/document.ts`) which uses the
**agency's** colours and logo, not the platform's.

- Tables measure each row before drawing it: a row never splits across a page
  break, and the column header is repeated on the new page.
- Cells wrap, so long descriptions and long names are never clipped.
- Headings stay with the content that follows them; the totals block is drawn
  whole or moved to the next page.
- Every page carries the header band, the agency's contact footer and
  `Page n of m`.

Verified in production against a deliberately awkward document — twelve fleet
lines with two-hundred-character descriptions and a sixty-character customer
name: three pages, all twelve lines present, headers repeated, totals correct,
page numbers right. A one-line invoice stays on one page.

---

## 13. Multi-tenancy and how it is enforced

- `users` is the platform identity; `memberships` is the relationship with each
  agency (role, status, client link). The session carries the chosen membership.
- Every service takes `organizationId` from the session and scopes its SQL by it.
  Ids from the browser are checked against the session's agency — never trusted.
- Verified in production: signed in as another agency's administrator, a GoldOak
  quotation page shows nothing, and `GET /api/billing/<id>/pdf` for a GoldOak
  document returns **404**, not the file. An agency admin who visits
  `/superagent` is redirected away.

---

## 14. Production requirements

Everything runs without a laptop **except the WhatsApp gateway**:

| Piece | Where it runs |
|---|---|
| Frontend, backend, server actions | Vercel |
| Database | Supabase Postgres |
| File storage | Supabase Storage |
| Background jobs and campaigns | Vercel functions (queue drained after each request, plus the daily cron) |
| Scheduled reminders | Vercel Cron |
| Email | SMTP |
| AI | NVIDIA NIM |
| PDF generation | Vercel functions |
| **WhatsApp gateway** | **a laptop today; moving to Oracle Cloud** — see `deploy/oracle/README.md` |

The WhatsApp gateway (OpenWA) still runs on the development laptop behind a
tunnel, kept alive by two scheduled tasks. While it is off, WhatsApp messages
are not received; everything else keeps working.

The move off the laptop is decided and prepared. `deploy/oracle/README.md` is
the walkthrough — an Oracle Cloud Always Free Ampere instance, which has no
expiry and enough capacity for a headless browser — and `deploy/oracle/setup.sh`
does the machine setup in one idempotent command: Docker, the firewall Oracle
ships closed, swap, the compose stack from `deploy/openwa/` behind Caddy with
an automatic certificate, a watchdog every two minutes, and a nightly backup of
the WhatsApp session folder. `deploy/HOSTING.md` records why Oracle was chosen
over the alternatives, including the five repositories that were rejected.

Once a real message has gone through the new gateway, disable the two scheduled
tasks on the laptop and nothing in production depends on your machine.

---

## 15. Environment variables

| Name | Purpose |
|---|---|
| `POSTGRES_HOST`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DATABASE` (or `DATABASE_URL`) | Database |
| `AUTH_SECRET` | Session and one-time-code signing. Rotating it signs everyone out |
| `ADMIN_TOKEN` | Protects `/api/admin/*` |
| `CRON_SECRET` | Protects `/api/cron/*` |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Bootstrap the platform administrator |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` | Email |
| `NVIDIA_API_KEY` | AI |
| `AI_MODEL`, `AI_FALLBACK_MODELS`, `AI_VISION_MODEL`, `AI_OCR_MODEL` | Models (defaults are sensible) |
| `OPENWA_BASE_URL`, `OPENWA_API_KEY`, `OPENWA_SESSION_ID`, `OPENWA_WEBHOOK_SECRET` | WhatsApp gateway |
| `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `STORAGE_BUCKET` | File storage |
| `NEXT_PUBLIC_SITE_URL` | Links in emails and WhatsApp messages |
| `ALLOW_DB_RESET` | Only while performing a clean reset. Remove afterwards |

Never commit any of these. Vercel is the source of truth for production.

---

## 16. Clean reset before handover

`POST /api/admin/reset` removes every tenant and everything under it, leaving
only the platform administrator. It is deliberately hard to fire:

1. It needs `x-admin-token`.
2. It refuses unless `ALLOW_DB_RESET=1` is set on the deployment.
3. It needs the exact phrase `RESET <today's date>` in the body.
4. **With no body it is a dry run** and reports exactly what it would delete.

```bash
# 1. See what would go
curl -X POST https://goldoak.vercel.app/api/admin/reset -H "x-admin-token: $ADMIN_TOKEN"

# 2. Take a Supabase backup, set ALLOW_DB_RESET=1, then:
curl -X POST https://goldoak.vercel.app/api/admin/reset \
  -H "x-admin-token: $ADMIN_TOKEN" -H "content-type: application/json" \
  -d '{"confirm":"RESET 2026-09-08"}'

# 3. Remove ALLOW_DB_RESET, then create the first agency at /admin.
```

Pass `{"keepOrganizationIds":["org_goldoak"]}` to keep one agency and clear the
rest.

---

## 17. Checking a deployment

- `GET /api/health` — version, database, jobs, AI, WhatsApp, email, cron.
- `GET /api/admin/inspect` with `x-admin-token` — identities and memberships,
  agencies, recent emails, jobs, channels, conversations and the audit trail.
  Read-only; never returns password hashes or message content.

---

## 18. The state you are being handed

The production database was reset on 8 September 2026 with the guarded endpoint
above. Nothing from the build survives it: no test agencies, clients,
conversations, documents, quotes, invoices, campaigns, emails or audit history.

What exists now:

| | |
|---|---|
| **Platform administrator** | `admin@goldoak.co.ke` — one account, belongs to no agency, holds a **temporary password that must be changed at first sign-in** |
| **GoldOak Insurance Agency** | Created afterwards through the ordinary agency onboarding in `/super-admin` — the same path any other agency takes. Join code `GOLDOAK` |
| **GoldOak agency administrator** | `ryanmoshi77@gmail.com` — also on a **temporary password that must be changed at first sign-in** |
| Everything else | Empty, waiting for real data |

The two temporary passwords were handed over separately and are not written
anywhere in this repository. If either is lost:

- **GoldOak agency admin** — the platform administrator issues a new one from
  `/super-admin` → the account row → **New password**.
- **Platform administrator** — the same button works on its own row; or set a
  new `ADMIN_PASSWORD` on the deployment and call `POST /api/admin/seed`.

### What GoldOak should do first

1. Sign in at `/signin` (Agency tab) and set a real password.
2. Work through `/agency/onboarding`: branding, WhatsApp number, assistant
   knowledge, team, clients.
3. Send itself a test email from `/agency/emails` and a test quotation to
   confirm the branding looks right on both.

---

## 19. What changed in the September 2026 rework

**Three separate products, three separate doors.**

| | Address | Sign in at |
|---|---|---|
| Super Admin (the platform operator) | `/super-admin` | `/super-admin/login` |
| Super Agent (the AI product console) | `/superagent` | `/super-admin/login` — it is platform-level |
| An agency workspace | `/agency/today` (alias `/agent/dashboard`) | `/signin`, Agency tab (alias `/agent/login`) |
| A client portal | `/portal` | `/signin`, Client tab |

The platform console carries **no link into any agency workspace**, and neither
does the Super Agent console — verified in production at phone, tablet and
desktop widths. An agency admin who visits `/superagent` is redirected away.

**The AI.** `lib/ai/gateway.ts` routes by task rather than by model: chat,
reason, vision and ocr each have a model chain, and every model is tried across
all three NVIDIA keys before the chain moves on. Keys live only in the
environment. Primary chat model is Nemotron 3.5 Lightning; Nemotron 3 Super,
Kimi K3 and DeepSeek V4 Pro back it up.

**What the assistant knows about GoldOak** comes from `lib/company.ts` and
`lib/insights.ts`, both extracted from the company's own profile documents and
published website. Facts the company has not supplied — the IRA licence number,
company registration, KRA PIN and the Principal Officer's name — are listed in
`PENDING` and the assistant says it does not have them rather than guessing.

**The public site** has a floating dock on every page: WhatsApp to a human, and
the assistant in a chat that keeps its thread for the session.
