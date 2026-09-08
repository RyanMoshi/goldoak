---
name: email
description: "The email platform: SMTP transport, per-tenant branding, template registry and overrides, queue with retries, delivery log, preferences, OTP."
metadata.type: fact
---

## Transport
`lib/email.ts`: nodemailer over SMTP (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, optional `SMTP_FROM`), cached transporter, `deliverEmail()` → `{ ok, messageId, error }`. `emailConfigured()` gates everything; without SMTP, sends are logged as `skipped` ("SMTP not configured"). The old site forms (`/api/contact`, `/api/send-form`) still use `sendEmail()`.

## Branding (`lib/email/branding.ts`)
`brandingFor(org)` → `{ name, shortName, primary, accent, logoUrl, supportEmail, supportPhone, website, footer }`. Platform default is neutral navy/blue; GoldOak gets forest `#073423` / gold `#c28d38` and its icon; other agencies come from `organizations.branding` (set at `/agency/settings` → Branding). Layout is table-based, responsive, dark-mode safe (`lib/email/layout.ts` → `renderEmail(brand, content)` gives HTML + text).

## Templates (`lib/email/templates.ts`)
Registry keyed by name with `variables`, `category`, `customisable` fields, subject and content builders: `welcome`, `temp-password`, `invitation`, `otp`, `password-reset`, `security-login`, `security-password-changed`, `security-email-changed`, `agency-registered`, `agency-approved`, `admin-alert`, `renewal-reminder`, `payment-reminder`, `appointment-reminder`, `claim-update`, `document-received`, `notification`, `staff-notification`. `{{variable}}` substitution in admin-written text. Overrides live in `email_templates` (global row `organization_id NULL`, agency row on top); only `customisable` fields may be overridden; codes, links and security wording stay fixed. Editors: `/admin/templates` (global) and `/agency/templates` (agency). Preview: `/api/emails/preview?key=&scope=`.

## Sending (`services/emails.ts`)
`sendTemplateEmail({ key, to, organizationId, userId, clientId, vars, category, immediate, relatedType, relatedId })` → `queued | sent | failed | skipped | unconfigured`. It renders with the tenant's branding, writes `email_log`, then either delivers now (`immediate`, used for OTP and password reset) or enqueues an `email-send` job with the rendered body (retries with backoff, max 5, then `dead`). `enqueue()` kicks the queue in the background straight away (`kickQueue()`), so queued mail leaves within seconds; the daily cron `/api/cron/jobs` is the safety net.

## Preferences
`users.email_prefs` jsonb: `reminders`, `updates`, `marketing` may be switched off (`/portal/profile`). `security`, `account` and verification emails are always sent (`OPTIONAL_CATEGORIES`).

## Logs and stats
`email_log` (template, to, subject, status, attempts, error, provider_id, related record). `/admin/emails` shows every agency; `/agency/emails` shows the agency's own. Both have a "send a test email" form (`sendTestEmailAction`). `emailStats()` powers the tiles.

## OTP (`services/otp.ts`)
`issueOtp({ email, purpose })` → 6 digits, hashed with `AUTH_SECRET`, 10-minute TTL, 3 per 10 minutes; `verifyOtp` allows 5 attempts and burns the code. Used by `/verify-email`.

## Reminders
`services/automation.ts` reads `organizations.reminder_days` (default `[30,14,7,1]`) and sends `renewal-reminder` (email + WhatsApp + in-app) through `notify({ email: { key, vars } })`.

## Test addresses used in September 2026
`ryanmoshi77@gmail.com` (GoldOak agency admin) and `ottoalexis61@gmail.com` (Otto Test Agency admin + GoldOak client). Delivery confirmed as `sent` in `email_log`.
