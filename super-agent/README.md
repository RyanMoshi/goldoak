# Super Agent

**The operating system for insurance distribution.** An agent-first workspace for Kenyan insurance intermediaries: clients, risk profiles, quotes, comparison, proposals, renewals and claims in one place.

This is Step 1 of the production MVP: the application shell and the Today dashboard. GoldOak Insurance Agency is the first organisation on the platform; the architecture is multi-tenant and nothing about GoldOak is hard-coded.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000. The root redirects to `/today`.

```bash
npm run lint    # ESLint (next/core-web-vitals + typescript)
npm run build   # production build with type-check
npm start       # serve the production build
```

Requires Node 20+. No environment variables are needed in Step 1.

## Stack

Next.js 16 (App Router, Turbopack), React 19, TypeScript strict, Tailwind CSS 4, Lucide React. A modular monolith: one deployable, domains kept apart by folder.

## Structure

```
app/                     Routes. (workspace) group carries the shell; /today is the only full page.
components/app-shell/    Sidebar, mobile drawer, top bar, agent profile, organisation chip.
components/ai/           Command bar, suggestions, response panel.
components/dashboard/    Today dashboard sections and the coming-next placeholder.
components/ui/           Button, Card, Badge, Avatar, Kbd, Money, EmptyState, Wordmark.
data/                    Typed mock data: dashboard, navigation, insurers, organisation, roadmap.
services/                Data-access and AI boundaries. Swap these for real APIs; the UI does not change.
hooks/                   Small client hooks (click-outside, shortcut, recent commands, platform).
lib/                     Formatting (KES, dates, greetings) and class-name helper.
types/                   Domain, dashboard, AI and navigation types.
public/icons/            PWA and favicon SVGs.
```

## Design system

Tokens live in `app/globals.css` under `@theme`. Cream canvas `#F7F4EC`, forest `#073423`, gold `#C28D38`, ink `#16211B`, muted ink `#5D6B63`. Status colours are reserved for status and always carry a text label. Merriweather for headings, Karla for the interface, JetBrains Mono for every figure and identifier. Controls 6px, cards 10px, tables 0px.

## What comes next

Step 2 is the multi-insurer comparison engine. The command bar's `CommandHandler` interface and the `services/dashboard.ts` boundary are where real services plug in.
