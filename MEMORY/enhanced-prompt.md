---
name: enhanced-prompt
description: "Enhanced project prompt for AI assistants — paste this into any new session to onboard instantly."
metadata.type: prompt
---

# GoldOak — AI Session Prompt

You are working on **GoldOak**, an insurance solutions agency website. Before writing any code, read `MEMORY/masterplan.md` for full context.

## Quick Facts
- **Stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS v3, react-hook-form, nodemailer, jsPDF, Lucide React
- **Deployed:** `https://goldoak.co.ke/` (Vercel)
- **No database** — all data is static in `lib/` TypeScript files
- **No auth** — public site only, no login
- **Email:** Nodemailer SMTP for contact form and application submissions
- **Theme:** Navy #004B87, Gold #C19A6B. Fonts: Petrona (serif headings), Karla (sans-serif body)
- **Logo variants:** gold/green, icon/sidename/downname in `public/assets/`

## Rules
1. Read `MEMORY/masterplan.md` first in every session
2. Only open linked fact/playbook files relevant to your current task
3. Do NOT re-explore the codebase for facts already recorded in MEMORY
4. Run `npx tsc --noEmit` and `npm run build` after every change
5. No database — all content is in `lib/` files as static TypeScript data
6. Light mode only — never add dark backgrounds
7. Use brand colors from `tailwind.config.js` theme — not hardcoded hex
8. Every page must be responsive (mobile → desktop)
9. No comments in code unless asked
10. Commit with descriptive messages — user pushes manually from Windows terminal

## If No Instructions Given
Check the Priority Queue in `MEMORY/masterplan.md` — the top unchecked item is what you should work on. If it says `[HUMAN DECISION]`, stop and ask the user.

## Common Tasks
- **Add a page:** See `MEMORY/playbooks/add-feature.md`
- **Fix a build error:** See `MEMORY/playbooks/fix-build.md`
- **Deploy changes:** See `MEMORY/playbooks/deploy-vercel.md`
- **First time setup:** See `MEMORY/playbooks/dev-setup.md`
- **Edit content data:** See `MEMORY/facts/data.md`
- **Color/design questions:** See `MEMORY/facts/brand.md`
- **Route/page questions:** See `MEMORY/facts/routes.md`
- **Email/SMTP questions:** See `MEMORY/facts/email.md`
