# GoldOak Insurance Solutions Website

A premium, modern website for **GoldOak Insurance Solutions**, built with **Next.js 14** (App Router), **Tailwind CSS**, and **TypeScript**.

> Understand the risk first. The policy comes after.

## Getting Started

### Prerequisites
- Node.js 18+
- npm

### Installation

```bash
npm install
cp env.example .env.local
```

Configure SMTP settings in `.env.local`:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```
sk-5f90e60b133749b6a930ec340438be21

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Production

```bash
npm run build
npm start
```

## Project Structure

```
├── app/                    # Next.js 14 App Router
│   ├── about/              # About GoldOak
│   ├── claims/             # Claims support
│   ├── contact/            # Contact + Risk Review form
│   ├── how-we-work/        # 7-stage process
│   ├── solutions/          # Insurance solutions by category
│   ├── api/                # API routes (contact, upload)
│   ├── layout.tsx          # Root layout (Petrona + Karla fonts)
│   ├── page.tsx            # Homepage
│   ├── globals.css         # Brand styles
│   ├── sitemap.ts          # Dynamic sitemap
│   └── robots.ts           # Robots.txt
├── components/             # 15 reusable components
│   ├── AnimatedSection     # Scroll-triggered animations
│   ├── Breadcrumbs         # Navigation breadcrumbs
│   ├── Button              # Reusable button variants
│   ├── CTASection          # Call-to-action section
│   ├── Footer              # Site footer
│   ├── Hero                # Homepage hero
│   ├── InsurerPanel        # Insurer logos
│   ├── Logo                # Brand logo component
│   ├── Navigation          # Main navigation
│   ├── PageHero            # Page hero template
│   ├── ProcessPreview      # Process section (home)
│   ├── SectionHeader       # Section heading
│   ├── SolutionsPreview    # Solutions grid (home)
│   ├── WhoWeServe          # Client segments
│   └── WhyGoldOak          # 4 principles
├── lib/                    # Shared data & utilities
│   ├── contact.ts          # Contact information
│   ├── navigation.ts       # Navigation structure
│   ├── solutions.ts        # Solution categories & details
│   ├── process.ts          # Process stages & principles
│   └── insurers.ts         # Insurer panel & claims steps
├── public/                 # Static assets
│   └── assets/             # Brand logos
└── Assets/                 # Source brand files
```

## Super Agent platform (inside this site)

The GoldOak website is the front door. Clients create an account and follow their cover; GoldOak advisers sign in to the **Super Agent** workspace. Everything runs in this one Next.js app.

| Route | Who | What |
|---|---|---|
| `/signup` | Clients only | Create a free account. Agency accounts are provisioned by GoldOak. |
| `/signin` | Client or Agency | One page, two tabs. |
| `/portal` | Clients | Progress through the six GoldOak stages, policies, quotes, claims, adviser contact. |
| `/agency/today` | Agency | Priorities, work queue with SLAs, pipeline, insurer activity, AI command bar. |
| `/agency/clients` | Agency | Client register and client 360. |
| `/api/whatsapp/webhook` | Meta | WhatsApp Cloud API webhook: registered clients get status, policies, quotes, claims by message. |

### Setup

1. **Database (Supabase Postgres).** Connect the Supabase project to the Vercel project (Supabase → Integrations → Vercel); it syncs `POSTGRES_URL` to Production. Locally: `vercel env pull .env.local --environment=production`. The schema is applied automatically on first use (`lib/db/schema.sql`).
2. **Seed demo data.** Set `ADMIN_TOKEN` (random, 32+ chars) in Vercel and `.env.local`, deploy, then `npm run db:seed`. It calls `/api/admin/seed` inside the deployment, which applies the schema and creates the GoldOak organisation, an agency account and demo clients. Passwords default to `GoldOak2026!` (override with `SEED_PASSWORD` in Vercel). Health: `/api/health`.
3. **Session secret.** Set `AUTH_SECRET` (32+ random characters) in Vercel and `.env.local`.
4. **WhatsApp.** In Meta for Developers, add the WhatsApp product, then set `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_VERIFY_TOKEN` and `WHATSAPP_APP_SECRET`. Point the webhook at `https://<your-domain>/api/whatsapp/webhook` with the same verify token and subscribe to `messages`.

Clients are recognised on WhatsApp by the mobile number on their account, so ask them to sign up with the number they message from.

### Code map

```
app/(site)/            Marketing site (navigation + footer)
app/(platform)/        signin, signup, agency/*, portal/*
components/platform/   Workspace shell, AI command bar, dashboard, clients, portal, auth
lib/auth/              scrypt passwords, signed session cookie, server actions
lib/db/                Postgres client (postgres.js), schema.sql, migrate, row mappers
lib/whatsapp/          Cloud API client and reply builder
services/              Data access: users, agency dashboard, clients, portal
scripts/seed.mjs       Demo data
middleware.ts          Role gate for /agency and /portal
```

## Brand Identity

- **Primary Forest Green:** `#073423`
- **Secondary Gold:** `#c28d38`
- **Typography:** Petrona (headings) + Karla (body)
- **Logo variants:** Gold/Green, Icon/SideName/DownName

## Pages

| Route | Description |
|---|---|
| `/` | Homepage — storytelling scroll journey |
| `/about` | Company story, philosophy, client segments |
| `/solutions` | Insurance solutions by category |
| `/how-we-work` | 7-stage GoldOak process |
| `/claims` | Claims support process |
| `/contact` | Contact info + Risk Review form |

## Key Features

- Premium navy/gold brand identity
- Editorial typography (Petrona + Karla)
- Scroll-triggered animations with reduced-motion support
- Responsive design (mobile → desktop)
- Working contact form with email submission
- Proper SEO (sitemap, robots, Open Graph)
- Accessible (semantic HTML, focus states, ARIA)

## Contact

- **Phone:** +254 729 911 311
- **Email:** info@goldoak.co.ke
- **WhatsApp:** [Message us](https://wa.me/254729911311)
- **Location:** Nairobi, Kenya

## License

Proprietary — GoldOak Insurance Solutions.
