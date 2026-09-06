---
name: routes
description: "Every URL (site, platform, API) and which file renders it."
metadata.type: fact
---

## Site (public) — `app/(site)/`, Navigation + Footer
| URL | File | Description |
|-----|------|-------------|
| `/` | `app/(site)/page.tsx` | Homepage; includes `PortalPreview` (Super Agent section) |
| `/super-agent` | `app/(site)/super-agent/page.tsx` | Super Agent landing: for clients (sign up / sign in / WhatsApp), for agencies (sign in / ask for access) |
| `/about`, `/solutions`, `/how-we-work`, `/claims`, `/contact` | `app/(site)/<name>/page.tsx` | Marketing pages |

The navigation shows **Super Agent** (no Sign in / Sign up buttons). Footer "Super Agent" column links to `/super-agent`.

## Platform — `app/(platform)/`
| URL | Who | File |
|-----|-----|------|
| `/signin?as=client|agency&next=` | public | `signin/page.tsx` → `SignInForm` |
| `/signup` | public (clients only) | `signup/page.tsx` → `SignUpForm` |
| `/admin` | admin | `admin/page.tsx` (accounts + health tiles), `admin/layout.tsx` |
| `/agency/today` | agency, admin | `agency/today/page.tsx` (+ `loading.tsx`) |
| `/agency/clients` | agency, admin | `agency/clients/page.tsx` |
| `/agency/clients/new` | agency, admin | `agency/clients/new/page.tsx` |
| `/agency/clients/[id]` | agency, admin | `agency/clients/[id]/page.tsx` → `ClientDetail` + `ClientWorkbench` |
| `/agency/{pipeline,quotes,renewals,claims,insurers,reports,settings}` | agency, admin | `agency/[section]/page.tsx` → `ComingNext` (planned workspaces) |
| `/portal` | client | `portal/page.tsx` |
| `/portal/profile` | client | `portal/profile/page.tsx` |

Layouts: `agency/layout.tsx` (AppShell), `portal/layout.tsx` (PortalShell), `admin/layout.tsx`. Errors: `app/(workspace)`-style `error.tsx` lives at `app/(platform)/error.tsx`? No: use `app/error.tsx` at root.

## API — `app/api/`
| Method | URL | Auth | Purpose |
|--------|-----|------|---------|
| POST | `/api/contact`, `/api/send-form`, `/api/upload` | none | Site forms (nodemailer) and uploads |
| GET | `/api/health` | none | DB/schema/WhatsApp/cron/auth status, user and client counts |
| POST | `/api/admin/seed` | `x-admin-token` | Bootstrap org + admin; `{ purgeDemo: true }` removes old demo rows |
| GET | `/api/cron/daily` | `Bearer CRON_SECRET` or `x-admin-token` | Daily automation |
| POST | `/api/whatsapp/openwa` | `X-OpenWA-Signature` | OpenWA inbound messages |
| GET/POST | `/api/whatsapp/webhook` | verify token / `X-Hub-Signature-256` | Meta Cloud API inbound |

Also `manifest.webmanifest`, `robots.txt`, `sitemap.xml`.
