---
name: bootstrap-admin
description: "Bootstrap the database, create the platform admin, invite agency users."
metadata.type: playbook
---

## When
First deployment, a new database, or after rotating `ADMIN_PASSWORD`.

## Prerequisites
- Vercel env (Production): `AUTH_SECRET`, `ADMIN_TOKEN`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `CRON_SECRET`, `WHATSAPP_BOT_NUMBER`, plus the Supabase-synced `POSTGRES_URL`.
- `.env.local` with the same `ADMIN_TOKEN` (and optionally `SEED_ADMIN_PASSWORD` to override the admin password on first creation).

## Steps
```bash
# 1. Deployment healthy?
curl -s https://goldoak.vercel.app/api/health

# 2. Bootstrap organisation + admin (idempotent). Add --purge once to drop the old demo rows.
npm run db:seed -- --purge

# 3. Sign in as admin: https://goldoak.vercel.app/signin?as=agency  (Agency tab, ADMIN_EMAIL / ADMIN_PASSWORD)
# 4. At /admin, invite agency users: name, email (their username), WhatsApp number, title. Leave password blank to generate one.
#    Copy the password from the green message and send it privately.
```

## Notes
- The admin is created only if no admin with that email exists. To change the admin password later, use "New password" on `/admin` (any admin can reset any staff account) or re-run the bootstrap after deleting the user.
- Agency users sign in on the **Agency** tab; admins too.
- Clients never need this: they sign up at `/signup`.
