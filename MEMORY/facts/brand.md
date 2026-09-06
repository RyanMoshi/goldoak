---
name: brand
description: "Brand colours, logo, typography, and the platform design tokens."
metadata.type: fact
---

## Colours (from `BRAND_INTEGRATION.md`)
| Name | Hex | Tailwind | Usage |
|------|-----|----------|-------|
| Forest green | `#073423` | `primary`, `forest`, `navy-700` | Nav, primary buttons, headings, sidebar active state |
| Gold | `#c28d38` | `secondary`, `gold`, `gold-400` | CTAs, accents, recommended badges, key figures |
| Cream canvas | `#f7f4ec` | `canvas` | Platform page background |
| Ink | `#16211b` / `#5d6b63` / `#8a968f` | `ink`, `ink-muted`, `ink-faint` | Text |
| Lines | `#e8e3d5` / `#d8d2c2` / `#f0ece1` | `line`, `line-strong`, `divider` | Borders, table rules |
| Surfaces | `#ffffff` / `#f2efe5` / `#fcfaf7` | `surface`, `surface-2`, `surface-3` | Cards, table headers, AI panels |
| Status | `#1f7a4d` / `#c47c1b` / `#b3261e` / `#2b5f8e` | `success`, `warning`, `error`, `info` | Status only, always with a text label |

The `navy-*` scale now holds forest greens so older site classes keep working. `gold-*` is the gold scale (`gold-700 #7a541a` for gold text on light).

## Typography
- **Petrona** (serif): headings, key figures — `font-serif`
- **Karla** (sans): body and interface — `font-sans`
- **JetBrains Mono**: premiums, policy/claim/quote numbers, phone numbers — `font-mono` (tabular numerals via `[data-numeric]`)

## Shapes and elevation (platform)
Controls `rounded-control` (6px), cards `rounded-card` (10px), tables square. No drop shadows on cards; `shadow-float` only on menus/popovers, `shadow-drawer` on the mobile drawer. Active navigation inverts to forest with gold icon.

## Logo
`public/assets/`: `Gold Icon.png` (favicon, platform wordmark), `Gold/Green SideNamelogo.png`, `Gold/Green Downname logo.png`. Site `Logo` component at `components/Logo.tsx`; platform `Wordmark` at `components/platform/ui/Wordmark.tsx` ("SUPER AGENT / GoldOak Insurance OS").

## Utilities (`app/globals.css`)
`.focus-ring`, `.label-caps`, `.scrollbar-none`, `.tabular`; site classes `btn-primary`, `btn-secondary`, `btn-outline`, `badge-gold`, `card-premium`, `section-padding`, `container-custom`, `hero-gradient-navy` (forest gradient).
