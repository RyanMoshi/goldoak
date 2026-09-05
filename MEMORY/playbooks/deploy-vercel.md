---
name: deploy-vercel
description: "Deploy to Vercel, configure env vars, fix build issues."
metadata.type: playbook
---

## Prerequisites
- Code committed and pushed to `main` branch on GitHub
- Vercel project connected to GitHub repo

## Phase 1: Push
```bash
cd /path/to/goldoak
git add -A
git commit -m "your message"
git push origin main
```

## Phase 2: Vercel Settings
Go to Vercel Dashboard → Project → Settings → Environment Variables:

| Variable | Value |
|----------|-------|
| `SMTP_HOST` | `smtp.gmail.com` |
| `SMTP_PORT` | `587` |
| `SMTP_USER` | your Gmail address |
| `SMTP_PASS` | your Gmail App Password |
| `SMTP_FROM` | `GoldOak Insurance <your-email@gmail.com>` |
| `ADMIN_EMAIL` | `info@goldoak.co.ke` |

## Phase 3: Build Config
No `vercel.json` needed — uses Next.js defaults.

`package.json` scripts:
```json
"dev": "next dev",
"build": "next build",
"start": "next start",
"lint": "next lint"
```

## Phase 4: Verify Deployment
1. Go to Vercel Dashboard → Deployments
2. Check build log for "Building" — no errors
3. Visit `https://goldoak.co.ke/` — landing page loads
4. Navigate to `/solutions` — solutions page works
5. Navigate to `/contact` — form renders

## Verify Recipe
```bash
# Check Vercel build log for:
# - "Building..."
# - "✓ Compiled successfully"
# - No "Module not found" or "Type error"

# After deployment, test:
curl -s https://goldoak.co.ke/ | head -20
# Should contain HTML with "GoldOak"
```

## Common Fixes
- **404 on deploy:** Check Vercel Settings → Root Directory is `.` (not `/` or `goldoak/`)
- **SMTP not working:** Ensure env vars are set in Vercel Dashboard (not just `.env`)
- **Stale cache:** Vercel Dashboard → Deployments → ··· → Redeploy → Clear cache
- **Image errors:** Check `next.config.js` allows remote image domains
