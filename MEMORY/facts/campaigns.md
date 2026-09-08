---
name: campaigns
description: "Bulk WhatsApp and email campaigns: audience resolution, the batching worker, opt-out and suppression, statuses."
metadata.type: fact
---

## Shape
`campaigns` (name, channel `whatsapp|email|both`, status, audience jsonb, subject, body, cta, schedule, counters) and `campaign_recipients` (one row per person per channel, with its own status and error). `services/campaigns.ts` owns both.

## Audience
`resolveAudience(organizationId, audience)` filters this agency's clients by journey stage, client type, "policy expiring within N days", explicit client ids, and whether to include leads without a login. The composer's "Who will this reach?" runs the *same* function the send uses, so the number previewed is the number that receives it.

## Sending
`launchCampaign` resolves the audience into recipient rows (deduplicated per channel and address, opt-outs written straight in as `skipped`), sets the campaign `processing`, and enqueues one `campaign-batch` job. The handler sends 20 at a time, with a ~900 ms pause between WhatsApp messages, then re-enqueues itself with an incrementing idempotency key until nothing is pending. Nothing is ever sent inside the web request.

**Why per-recipient rows:** each moves from `pending` to `sent`/`failed`/`skipped` exactly once, claimed with `FOR UPDATE SKIP LOCKED`, so a retry, a crash or a double click cannot double-send. Calling `launchCampaign` on a campaign that is already processing is a no-op.

## Opt-out and compliance
- `suppressions (organization_id, channel, address)` is the agency's do-not-contact list, managed on `/agency/campaigns`.
- A client switching off marketing at `/portal/profile` (`users.email_prefs.marketing = false`) is excluded from email campaigns.
- Campaign emails always carry the unsubscribe line (`footerExtra` in the email layout).
- Audiences of 50+ require the recipient count to be typed before launching.

## Statuses
`draft → scheduled → processing → sent | partial | failed`, plus `cancelled`. `partial` means some recipients failed. Cancelling marks pending recipients `skipped`; anything already sent has gone.

## Scheduling
`launchDueCampaigns()` runs in the daily sweep and starts any `scheduled` campaign whose time has passed.
