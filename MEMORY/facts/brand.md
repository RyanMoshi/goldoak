---
name: brand
description: "Brand colors, logo, CSS theme, typography, and design rules."
metadata.type: fact
---

## Color Palette

### Primary
| Name | Hex | Tailwind Token | Usage |
|------|-----|----------------|-------|
| Primary Navy | `#004B87` | `primary`, `navy-700` | Nav bg, primary buttons, headings, focus rings, hero gradients |
| Secondary Gold | `#C19A6B` | `secondary`, `gold-400` | CTA buttons, accents, gold accent lines, hover states, badges |

### Navy Scale
| Token | Hex |
|-------|-----|
| `navy-50` | `#f0f5fa` |
| `navy-100` | `#d9e6f2` |
| `navy-200` | `#b3cce5` |
| `navy-300` | `#8cb3d8` |
| `navy-400` | `#6699cb` |
| `navy-500` | `#4080be` |
| `navy-600` | `#1a66b1` |
| `navy-700` | `#004B87` (primary) |
| `navy-800` | `#003d6f` |
| `navy-900` | `#002e54` |
| `navy-950` | `#001f39` |

### Gold Scale
| Token | Hex |
|-------|-----|
| `gold-50` | `#faf6f0` |
| `gold-100` | `#f2e8d5` |
| `gold-200` | `#e5d1ab` |
| `gold-300` | `#d8ba81` |
| `gold-400` | `#C19A6B` (secondary) |
| `gold-500` | `#b08550` |
| `gold-600` | `#9a7040` |
| `gold-700` | `#7d5a30` |
| `gold-800` | `#604420` |
| `gold-900` | `#432e10` |
| `gold-950` | `#261a00` |

### Semantic
| Token | Hex | Usage |
|-------|-----|-------|
| `text-headline` | `#1a1a2e` | All headings |
| `text-body` | `#4a4a5a` | Body text |
| `bg-section` | `#f8f7f4` | Section backgrounds |
| `bg-cream` | `#faf9f6` | Cream section backgrounds |

### Gradients
- `.hero-gradient-navy`: `linear-gradient(135deg, #004B87 0%, #002e54 100%)`
- `.hero-gradient-gold`: `linear-gradient(135deg, #C19A6B 0%, #9a7040 100%)`
- `.hero-gradient-mixed`: `linear-gradient(135deg, #004B87 0%, #003d6f 50%, #C19A6B 100%)`

## Logo
- Source files: `Assets/` directory (Gold Downname, Gold Icon, Gold SideName, Green variants)
- Public files: `public/assets/` (duplicated)
- Component: `components/Logo.tsx` — props: `variant` (gold/green), `size` (sm/md/lg/xl), `logoType` (icon/sidename/downname)
- Error fallback: renders "G" circle

## Typography
| Role | Font | Fallback |
|------|------|----------|
| Headings (h1-h6) | **Petrona** (serif) | Georgia, serif |
| Body | **Karla** (sans-serif) | Helvetica Neue, Arial, sans-serif |

### Responsive Type Scale
| Token | Size | Line Height |
|-------|------|-------------|
| `display` | `clamp(2.5rem, 5vw, 4.5rem)` | 1.05 |
| `heading-1` | `clamp(2rem, 4vw, 3.5rem)` | 1.1 |
| `heading-2` | `clamp(1.5rem, 3vw, 2.5rem)` | 1.15 |
| `heading-3` | `clamp(1.25rem, 2vw, 1.75rem)` | 1.2 |
| `body-lg` | `1.125rem` | 1.7 |
| `body` | `1rem` | 1.7 |
| `body-sm` | `0.875rem` | 1.6 |
| `caption` | `0.75rem` | 1.5 |

## Design Rules
- **Light mode only** — no dark backgrounds anywhere
- **Navbar:** navy bg when scrolled, white text, gold CTA button
- **Hero:** navy gradient bg with gold accent lines and dot pattern overlay
- **Sections:** alternating `bg-section` (#f8f7f4) and `bg-cream` (#faf9f6)
- **Cards:** white bg with `border-gray-100` borders
- **Buttons:** gold primary, navy secondary/outline
- **Gold accent lines:** `SectionHeader` renders "GoldOak" label between two gold horizontal lines
- **Focus rings:** `focus-visible:ring` with navy color
- **Scroll animations:** `AnimatedSection` with IntersectionObserver, respects `prefers-reduced-motion`
