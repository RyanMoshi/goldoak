---
name: dev-setup
description: "First-time setup, install, dev server, and environment commands."
metadata.type: playbook
---

## Phase 1: Install
```bash
cd /path/to/goldoak
npm install
```

## Phase 2: Environment
```bash
cp env.example .env
```
Edit `.env` with your SMTP credentials:
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM="GoldOak Insurance <your-email@gmail.com>"
ADMIN_EMAIL=info@goldoak.co.ke
```

## Phase 3: Dev Server
```bash
npm run dev
# Opens at http://localhost:3000
```

## Phase 4: Verify
1. Open `http://localhost:3000` — homepage loads with hero, sections, footer
2. Navigate to `/about` — company story renders
3. Navigate to `/solutions` — 7 categories with filterable tabs
4. Navigate to `/how-we-work` — 7-stage process page
5. Navigate to `/claims` — 6-step claims process
6. Navigate to `/contact` — contact info + Risk Review form renders
7. Test form submission (requires valid SMTP credentials)

## Verify Recipe (mechanical)
```bash
# Dev server starts without errors
npm run dev 2>&1 | head -20
# Should see "Ready" or "started server on"

# Build passes
npm run build 2>&1 | tail -10
# Should see all routes listed, no errors

# TypeScript clean
npx tsc --noEmit
# Should produce no output
```

## Common Issues
- **Port 3000 in use:** `npm run dev -- -p 3001`
- **SMTP errors:** Check `.env` credentials, ensure Gmail App Password (not regular password)
- **Email not sending:** Verify `ADMIN_EMAIL` is set correctly
