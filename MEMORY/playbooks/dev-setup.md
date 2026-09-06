---
name: dev-setup
description: "First-time setup, environment, dev server."
metadata.type: playbook
---

```bash
git clone https://github.com/RyanMoshi/goldoak.git && cd goldoak
npm install
vercel link --yes --project goldoak          # once
vercel env pull .env.local --environment=production
```

`.env.local` will contain empty values for the sensitive Supabase variables. For local database access add one line with the pooled Supabase URL (password from Supabase → Project Settings → Database):
```
DATABASE_URL=postgresql://postgres.zvwapjpnlfavqtdtkffa:<password>@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
```
Without it the site runs, and sign-in shows "database not connected".

Also make sure `.env.local` has `AUTH_SECRET` (any long string) and `ADMIN_TOKEN` (same as Vercel, for `npm run db:seed`).

```bash
npm run dev                # http://localhost:3000
npx tsc --noEmit && npx next lint && npm run build
```

Seed a local database: `SEED_URL=http://localhost:3000 npm run db:seed` (dev server running).
