---
name: routes
description: "All 6 routes with URL paths and descriptions."
metadata.type: fact
---

## Public Routes (no auth — entire site is public)
| URL | File | Description |
|-----|------|-------------|
| `/` | `app/page.tsx` | Homepage: Hero, WhyGoldOak, WhoWeServe, SolutionsPreview, ProcessPreview, InsurerPanel, CTASection |
| `/about` | `app/about/page.tsx` | Company story, philosophy (4 principles), who we serve (3 segments) |
| `/solutions` | `app/solutions/page.tsx` | 7 insurance solution categories with filterable tabs |
| `/how-we-work` | `app/how-we-work/page.tsx` | 7-stage GoldOak process with outputs + 4 principles |
| `/claims` | `app/claims/page.tsx` | 6-step claims process with timeframes |
| `/contact` | `app/contact/page.tsx` | Contact info + Risk Review form (react-hook-form) |

## API Routes
| Method | URL | File | Description |
|--------|-----|------|-------------|
| `POST` | `/api/contact` | `app/api/contact/route.ts` | Contact form + quote requests (nodemailer) |
| `POST` | `/api/send-form` | `app/api/send-form/route.ts` | Insurance application form (nodemailer + file attachments) |
| `POST` | `/api/upload` | `app/api/upload/route.ts` | File upload to `public/uploads/` |

## Missing Routes (linked in footer but no page exists)
- `/privacy` — Privacy Policy (no file)
- `/terms` — Terms of Service (no file)

## Layout Pattern
- `app/layout.tsx` renders Navigation + Footer + Toaster globally
- All pages are `'use client'` except root layout and `not-found.tsx`
- Additional pages: `error.tsx`, `global-error.tsx`, `not-found.tsx`, `robots.ts`, `sitemap.ts`

## Component Composition Pattern
Pages compose from reusable components:
- `PageHero` — page header (navy gradient or cream bg)
- `AnimatedSection` — IntersectionObserver scroll animations
- `SectionHeader` — heading with gold accent lines + "GoldOak" label
- `CTASection` — call-to-action with phone/WhatsApp/email links
- `Breadcrumbs` — navigation breadcrumbs (server component)
