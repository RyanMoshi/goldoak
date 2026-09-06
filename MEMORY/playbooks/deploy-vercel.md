---
name: deploy-vercel
description: "Deploy to Vercel, manage env vars, verify the live site."
metadata.type: playbook
---

## Deploy
Push to `main`; Vercel builds `goldoak` automatically (root directory, Next.js defaults, `vercel.json` only adds the cron).
```bash
git add -A && git commit -m "..." && git push origin main
```
Manual: `vercel redeploy goldoak.vercel.app` (needed after changing env vars).

## Environment variables (Production)
| Group | Names |
|-------|-------|
| Site email | `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `TO_EMAIL` |
| Database (synced by Supabase, sensitive) | `POSTGRES_URL`, `POSTGRES_*`, `SUPABASE_*` |
| Platform | `AUTH_SECRET`, `ADMIN_TOKEN`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `CRON_SECRET`, `DEFAULT_ORGANIZATION_ID`, `NEXT_PUBLIC_SITE_URL`, `WHATSAPP_BOT_NUMBER` |
| WhatsApp | `OPENWA_BASE_URL`, `OPENWA_API_KEY`, `OPENWA_SESSION_ID`, `OPENWA_WEBHOOK_SECRET` (or `WHATSAPP_*` for Meta) |

Add: `vercel env add NAME production --value "..." --sensitive --force`. Sensitive values cannot be pulled locally (they arrive empty); that is expected.

## Verify after deploy
```bash
curl -s https://goldoak.vercel.app/api/health
curl -s -o /dev/null -w "%{http_code}\n" https://goldoak.vercel.app/super-agent
curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" https://goldoak.vercel.app/agency/today   # 307 → /signin?as=agency
```
Then sign in as admin and open `/admin`, `/agency/today`.

## Cron
`vercel.json` → `/api/cron/daily` at 04:00 UTC (07:00 Nairobi). Vercel sends `Authorization: Bearer $CRON_SECRET`. Run by hand: `curl -H "x-admin-token: $ADMIN_TOKEN" https://goldoak.vercel.app/api/cron/daily`.
