---
name: routes
description: "Every URL (site, platform, API) and which file renders it."
metadata.type: fact
---

## Site (public) — `app/(site)/`, Navigation + Footer
| URL | File | Description |
|-----|------|-------------|
| `/` | `app/(site)/page.tsx` | Homepage; `Hero` (Get started, Talk to the AI, Sign in, For agencies), `PortalPreview` |
| `/super-agent` | `app/(site)/super-agent/page.tsx` | Public assistant (`#ask`), for clients, for agencies (`#agencies`), sign-in links |
| `/about`, `/solutions`, `/how-we-work`, `/claims`, `/contact` | `app/(site)/<name>/page.tsx` | Marketing pages |

## Platform — `app/(platform)/`
| URL | Who | File |
|-----|-----|------|
| `/signin?as=client|agency&next=` | public | `signin/page.tsx` |
| `/signup?agency=CODE` | public (clients only) | `signup/page.tsx` (agency code attaches the client to that agency) |
| `/admin` | admin | agencies, all staff accounts, health tiles |
| `/admin/conversations` | admin | every WhatsApp contact; route unassigned ones |
| `/agency/today` | staff | Today dashboard |
| `/agency/conversations`, `/agency/conversations/[phone]` | staff | chats of this agency; thread with reply / take over / hand back |
| `/agency/pipeline` | staff | kanban by journey stage |
| `/agency/clients`, `/agency/clients/new`, `/agency/clients/[id]` | staff | register, new lead, client 360 (+ PDF links) |
| `/agency/quotes`, `/agency/renewals`, `/agency/claims`, `/agency/insurers`, `/agency/reports` | staff | workspace pages from `services/agency/workspace.ts` |
| `/agency/team` | agency_admin, admin | invite staff, reset passwords, roles, deactivate |
| `/agency/settings` | staff (edit: agency_admin, admin) | profile, join code, greeting, onboarding links |
| `/portal`, `/portal/ask`, `/portal/profile` | client | portal, assistant, WhatsApp number |

Layouts: `agency/layout.tsx` (AppShell with waiting badge), `portal/layout.tsx`, `admin/layout.tsx`.

## API — `app/api/`
| Method | URL | Auth | Purpose |
|--------|-----|------|---------|
| POST | `/api/contact`, `/api/send-form` | none | Site forms (nodemailer) |
| POST | `/api/consult` | none (12 questions / 10 min per IP) | Public assistant `{ question, agency? }` |
| GET | `/api/documents/<registration|client-summary|claim|quote|agency-report>?id=` | session | Branded PDFs; staff for their org, clients for their own |
| GET | `/api/health` | none | DB, agencies, handoffs, failed WhatsApp, provider, AI mode, commit |
| POST | `/api/admin/seed` | `x-admin-token` | Bootstrap, create an agency, purge test data |
| GET | `/api/cron/daily` | `Bearer CRON_SECRET` or `x-admin-token` | Daily automation |
| POST | `/api/whatsapp/openwa` | `X-OpenWA-Signature` (+ `x-admin-token` = dry run) | OpenWA inbound |
| GET/POST | `/api/whatsapp/webhook` | verify token / `X-Hub-Signature-256` | Meta Cloud API inbound |

Also `manifest.webmanifest`, `robots.txt`, `sitemap.xml`.
