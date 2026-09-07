---
name: routes
description: "Every URL (site, platform, API) and which file renders it."
metadata.type: fact
---

## Site (public) — `app/(site)/`, Navigation + Footer
| URL | Description |
|-----|-------------|
| `/` | `Hero` (Get started, Talk to the AI, Sign in, For agencies, Chat on WhatsApp) → `HowItWorks` (3 steps + question cards) → Why → Solutions → `PortalPreview` → Insurers → CTA |
| `/super-agent` | public assistant (`#ask`), for clients (menu), for agencies (`#agencies` → `/agencies/signup`) |
| `/about`, `/solutions`, `/how-we-work`, `/claims`, `/contact`, `/privacy`, `/terms` | marketing and legal pages |

## Platform — `app/(platform)/`
| URL | Who | Notes |
|-----|-----|-------|
| `/signin?as=client\|agency&next=` | public | tabs; link to forgot password and agency registration |
| `/signup?agency=CODE` | public | clients only |
| `/agencies/signup` | public | two-step agency registration → org `pending` + agency admin, signed in |
| `/forgot-password`, `/reset-password?token=` | public | email reset link, 1 hour |
| `/admin` | admin | agencies (approve, deactivate), all staff, tiles |
| `/admin/conversations` | admin | every chat; route unassigned |
| `/admin/system` | admin | job stats, retries, audit trail |
| `/agency/today` | staff | dashboard (pending-approval banner when the agency is not yet approved) |
| `/agency/conversations[/phone]` | staff | chats; thread with reply / take over / hand back |
| `/agency/clients`, `/new`, `/[id]` | staff | register, new lead, client 360 (+ PDFs) |
| `/agency/businesses` | staff | businesses + business-claim review |
| `/agency/documents` | staff | uploads, OCR results, confirmations, open file, retry |
| `/agency/enquiries` | staff | enquiries; answer reaches WhatsApp + portal |
| `/agency/pipeline`, `/quotes`, `/renewals`, `/claims`, `/insurers`, `/reports` | staff | workspace pages |
| `/agency/search?q=` | staff | one search box (clients, businesses, claims, quotes, chats, documents, enquiries) |
| `/agency/team`, `/agency/audit` | agency_admin, admin | team, audit log |
| `/agency/settings` | staff (edit: admins) | profile, join code, links, greeting |
| `/portal` | client | home with links to Ask, Documents, Requests |
| `/portal/ask`, `/portal/documents`, `/portal/requests`, `/portal/profile` | client | assistant, uploads + confirm, claim business / enquiry / tracker, WhatsApp number |

## API — see `facts/api.md`.
