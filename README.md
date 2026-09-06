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

The GoldOak website is the front door: the navigation shows **Super Agent**, and `/super-agent` is where clients create an account or sign in, and agencies sign in. Everything runs in this one Next.js app on a Supabase Postgres database.

| Route | Who | What |
|---|---|---|
| `/super-agent` | Everyone | The platform page: for clients, for agencies, the WhatsApp line |
| `/signup` | Clients only | Create a free account with the WhatsApp number they message from |
| `/signin` | Client or Agency tab | Admin signs in on the Agency tab |
| `/portal` | Clients | Six-stage progress, ask for cover, report a claim, policies, quotes, claims, updates |
| `/agency/today`, `/agency/clients` | Agencies | Work queue with SLAs, pipeline, client register, client 360 with stage/quote/claim/policy controls, command bar answered from your records |
| `/admin` | Platform admin | Invite agency users (username + password), reset, deactivate; platform health |
| `/api/whatsapp/openwa` | OpenWA | WhatsApp webhook. STATUS · POLICIES · QUOTES · CLAIMS · QUOTE · CLAIM · UPDATES · ADVISER |
| `/api/cron/daily` | Vercel Cron | Renewal reminders (30/14/7/1 days), quote chasers, weekly claim updates |

WhatsApp and the site are equivalent: every action goes through `services/journey.ts`, every message through `services/notifications.ts` (stored for the portal, sent on WhatsApp via the self-hosted [OpenWA](https://github.com/rmyndharis/OpenWA) gateway on **+255 742 473 493**).

### Setup
1. **Database:** connect the Supabase project to the Vercel project (Supabase → Integrations → Vercel). It syncs `POSTGRES_URL` to Production.
2. **Secrets on Vercel:** `AUTH_SECRET`, `ADMIN_TOKEN`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `CRON_SECRET`, `WHATSAPP_BOT_NUMBER` (see `env.example`).
3. **Bootstrap:** `npm run db:seed` (uses `ADMIN_TOKEN` from `.env.local`) creates the GoldOak organisation and the platform admin. No demo data.
4. **WhatsApp:** host OpenWA, pair the number, register the webhook, set `OPENWA_*` on Vercel. Full steps in `MEMORY/playbooks/whatsapp-openwa.md`.
5. **Health:** `GET /api/health`.

### Code map
```
app/(site)/            Marketing site + /super-agent
app/(platform)/        signin, signup, admin, agency/*, portal/*
components/platform/   Shell, command bar, dashboard, clients, portal, admin, auth, ui
lib/auth/              scrypt passwords, signed session cookie, sign-in/up actions
lib/{admin,agency,portal}/actions.ts   Server actions per area
lib/db/                Postgres client, schema.sql (auto-applied), mappers, bootstrap
lib/whatsapp/          provider selection, OpenWA + Meta adapters, the bot
services/              users, journey (client/agency actions), notifications, automation, agency dashboard/clients/commands, portal
middleware.ts          Role gate for /admin, /agency, /portal
MEMORY/                Project memory for AI sessions (start at MEMORY/masterplan.md)
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
