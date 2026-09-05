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

## Brand Identity

- **Primary Navy:** `#004B87`
- **Secondary Gold:** `#C19A6B`
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
