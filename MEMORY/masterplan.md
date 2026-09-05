---
name: masterplan
description: "Project overview, current state, and priority queue. Read first in every session."
metadata.type: masterplan
---

Read this file first in any session, then open only the linked memory that matches the task. Do not re-explore the codebase for facts recorded here.

## What is GoldOak?

GoldOak is an insurance solutions agency website based in Nairobi, Kenya. It serves individuals, SMEs, and corporates — helping them understand risk before choosing policies. The site showcases GoldOak's 7-stage process, insurance solution categories, claims support, and provides a Risk Review contact form with email notifications. Deployed at `https://goldoak.co.ke/`.

**Tagline:** "Understand the risk first. The policy comes after."

**Stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS v3, framer-motion, react-hook-form, nodemailer, jsPDF, Lucide React. No database, no auth, no Prisma.

## Current State

### Done
- Full Next.js project at repo root
- 6 pages: homepage, about, solutions, how-we-work, claims, contact
- 3 API routes: contact form, application form, file upload
- 15 reusable components (Navigation, Footer, Hero, PageHero, Button, Logo, etc.)
- 6 lib/ data files (static TypeScript data — no database)
- Brand colors: Navy #004B87, Gold #C19A6B
- Typography: Petrona (serif headings), Karla (sans-serif body)
- Logo variants: gold/green, icon/sidename/downname in `public/assets/`
- Responsive design across all pages
- AnimatedSection with IntersectionObserver scroll animations
- Nodemailer SMTP email sending (admin + client confirmation)
- PDF quote generator with jsPDF
- SEO: sitemap.ts, robots.ts, OpenGraph metadata
- Toast notifications with react-hot-toast
- Risk Review form with react-hook-form validation

### In Progress
- Memory folder rewritten from Ujumbe+ project to reflect GoldOak

### Pending
- Privacy Policy page (linked in footer but no route exists)
- Terms of Service page (linked in footer but no route exists)
- Add more detailed solution pages (individual solution deep-dives)
- Testimonials/social proof section
- Blog or news section
- Insurance calculator tools
- Client portal or login area
- Analytics integration
- Performance optimization (image optimization, lazy loading)

### Blockers
- Footer links to `/privacy` and `/terms` but those pages don't exist yet
- No `vercel.json` config file exists (using defaults)
- framer-motion is installed but AnimatedSection uses IntersectionObserver instead

## Priority Queue

1. **[HUMAN DECISION]** — What feature or page should be built next? Options below:
   - Privacy Policy page
   - Terms of Service page
   - Individual solution detail pages (deeper than the category overview)
   - Testimonials section
   - Blog/news section
   - Insurance calculator tools
   - Client portal/login area

## File Links

| File | Open when… |
|------|-----------|
| [stack.md](facts/stack.md) | You need to know dependencies, build commands, or framework version |
| [routes.md](facts/routes.md) | You're adding/modifying a page or need to know what URL paths exist |
| [brand.md](facts/brand.md) | You're changing colors, logo, or visual design |
| [api.md](facts/api.md) | You're adding API endpoints or modifying email/upload logic |
| [data.md](facts/data.md) | You're editing content data (solutions, process, insurers, navigation) |
| [email.md](facts/email.md) | You're working with SMTP, email templates, or env vars |
| [dev-setup.md](playbooks/dev-setup.md) | First time setting up the project or need dev server commands |
| [deploy-vercel.md](playbooks/deploy-vercel.md) | Deploying or fixing Vercel build issues |
| [add-feature.md](playbooks/add-feature.md) | Adding a new page, route, component, or API endpoint |
| [fix-build.md](playbooks/fix-build.md) | Build is failing and you need to diagnose it |
