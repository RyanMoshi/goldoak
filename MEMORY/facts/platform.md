---
name: platform
description: "Super Agent map: roles, areas, services, server actions, components, types."
metadata.type: fact
---

## Roles and areas
| Role | Enters | Created by | Home |
|------|--------|-----------|------|
| `admin` | `/admin` and `/agency/*` | bootstrap (`ADMIN_EMAIL`/`ADMIN_PASSWORD`) or another admin | `/admin` |
| `agency` | `/agency/*` | admin at `/admin` (username = email, password chosen or generated) | `/agency/today` |
| `client` | `/portal/*` | self at `/signup` (phone required; it is their WhatsApp identity) | `/portal` |

`lib/auth/session.ts` → `canAccess(role, area)`: admin may also use the agency workspace.

## Layers (never skip one)
```
UI (components/platform/*, app/(platform)/*)
  → server actions (lib/{auth,admin,agency,portal}/actions.ts)  'use server', validate input, requireSession
    → services (services/*.ts)                                    SQL via getSql(), mappers, business rules
      → notifications (services/notifications.ts)               store + WhatsApp
```
The WhatsApp bot (`lib/whatsapp/bot.ts`) calls the same services, never the actions.

## Services
| File | Purpose |
|------|---------|
| `services/users.ts` | find/create users, staff accounts (admin), organisation, platform counts |
| `services/journey.ts` | `requestQuote`, `reportClaim`, `updateClientStage`, `addPolicy`, `updateQuoteStage`, `updateClaimStage`, `messageClient`, `createClient` |
| `services/notifications.ts` | `notify()` (store + WhatsApp), `notifyOrganization()`, list/markRead |
| `services/automation.ts` | `onClientSignedUp()`, `runDailyAutomation()` (renewals, quote chasers, claim reminders) |
| `services/agency/dashboard.ts` | Today metrics, tasks, pipeline, insurer activity; `completeTask` |
| `services/agency/clients.ts` | client register and client 360 |
| `services/agency/commands.ts` | `runAgencyCommand()` for the command bar and WhatsApp agency commands |
| `services/portal.ts` | everything a client sees |

## Components
- `components/platform/shell/*` — AppShell, Sidebar, MobileNav, TopBar (command bar + New lead), AgentProfile
- `components/platform/ai/*` — AICommandBar (calls `runCommandAction`), suggestions, response panel
- `components/platform/dashboard/*` — Today dashboard pieces, `ComingNext` placeholder
- `components/platform/clients/*` — ClientsTable, ClientDetail, ClientWorkbench (stage, message, quote/claim stages, record policy), NewClientForm
- `components/platform/portal/*` — PortalShell, JourneyTracker, PolicyList, QuoteList, ClaimList, PortalActions (ask for cover, report claim), UpdatesFeed, WhatsAppCard, PhoneForm
- `components/platform/admin/AgencyAccounts.tsx` — invite/reset/deactivate
- `components/platform/auth/*` — AuthShell, SignInForm (Client/Agency tabs), SignUpForm
- `components/platform/ui/*` — Button, Card, Badge, Avatar, Kbd, Money (KES mono), EmptyState, Wordmark

## Types
`types/platform.ts`: Role, Organization, PublicUser, Client (+ `JOURNEY_STAGES`), Policy, QuoteRequest/QuoteSubmission, Claim (+ `CLAIM_STAGES`), Notification, SLATask, PriorityMetric, PipelineStage, ActivityItem, PortalData, CommandResult, `PRODUCT_LINES`.

## Conventions
- Money is `bigint` shillings in the DB, formatted by `formatKES` (`KES 184,500`) in `lib/format.ts`; always monospace.
- Phones are E.164 digits without plus (`normalizePhone`), shown with `formatPhone`.
- References: `QR-2026-00012`, `CLM-2026-00003` (`lib/ids.ts`).
- Ids: prefixed (`usr_`, `cli_`, `pol_`, `qr_`, `qs_`, `clm_`, `tsk_`, `act_`, `ntf_`, `wam_`).
- Agency workspaces not yet built render `ComingNext` from `data/platform/roadmap.ts` via `app/(platform)/agency/[section]/page.tsx`.
