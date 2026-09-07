---
name: platform
description: "Super Agent map: tenancy, roles, areas, services, server actions, components, types."
metadata.type: fact
---

## Tenancy
Every agency is an `organizations` row (`code` = join code, `active`, `greeting`, `licence_label`). `organization_id` is on users, clients, policies, quotes, claims, tasks, activity, notifications, whatsapp_contacts, conversation_messages, consultations, documents, audit_log. Services take `organizationId` from the session (`session.oid`) and never trust ids from the client without checking ownership (`userInOrganization`, `getConversation(orgId, phone)`, `clientIdFor(...)` in the documents route).

## Roles and areas
| Role | Enters | Created by | Home |
|------|--------|-----------|------|
| `admin` | `/admin/*` and any `/agency/*` (for its own org) | bootstrap (`ADMIN_EMAIL`/`ADMIN_PASSWORD`) or another admin | `/admin` |
| `agency_admin` | `/agency/*` incl. Team and Settings editing | admin (with the agency) or another agency admin | `/agency/today` |
| `agency` | `/agency/*` (no Team, read-only Settings) | agency admin at `/agency/team` or admin at `/admin` | `/agency/today` |
| `client` | `/portal/*` | self at `/signup` (optional `?agency=CODE`) or on WhatsApp (reply 1) | `/portal` |

`lib/auth/session.ts`: `canAccess(role, area)`, `isStaffRole`, `isAgencyAdmin`. `lib/auth/server.ts`: `requireSession(area)`, `requireAgencyAdmin()`. `ROLE_LABELS` in `types/platform.ts`.

## Layers (never skip one)
```
UI (components/platform/*, app/(platform)/*)
  → server actions (lib/{auth,admin,agency,portal}/actions.ts)  'use server', validate, requireSession, audit()
    → services (services/*.ts)                                    SQL via getSql(), mappers, business rules
      → notifications (services/notifications.ts)               store + WhatsApp
```
The WhatsApp bot (`lib/whatsapp/bot.ts`) calls the same services, never the actions.

## Services
| File | Purpose |
|------|---------|
| `services/users.ts` | users, sign-in lookup, organisations (create/update/by code/summaries), staff accounts, `placeholderOrganization` |
| `services/journey.ts` | `requestQuote`, `reportClaim`, `updateClientStage`, `addPolicy`, `updateQuoteStage`, `updateClaimStage`, `messageClient`, `createClient` |
| `services/conversations.ts` | `whatsapp_contacts` (touch/link/workflow/mode/assign) and `conversation_messages` (append, recent, list per org, list all, get) |
| `services/handoff.ts` | `requestHandoff` (human mode + task + notify), `agentReply` (dashboard → WhatsApp), `resumeAssistant` |
| `services/consult.ts` | `consult()` (Claude `claude-opus-5` with adaptive thinking when `ANTHROPIC_API_KEY`, else catalogue retrieval), `[HANDOFF]` escalation, consultations log |
| `services/documents.ts` + `lib/pdf/document.ts` | numbered branded PDFs: registration, client summary, claim, quote, agency report |
| `services/audit.ts` | `audit()` (never throws), `listAudit` |
| `services/notifications.ts` | `notify()` (store + WhatsApp), `notifyOrganization()`, list/markRead |
| `services/automation.ts` | `onClientSignedUp()`, `runDailyAutomation()` (renewals, chasers, claim reminders, WhatsApp outbox retry) |
| `services/agency/dashboard.ts` | Today metrics, tasks, pipeline, insurer activity; `completeTask` |
| `services/agency/clients.ts` | client register and client 360 |
| `services/agency/workspace.ts` | `getPipeline`, `listQuotes`, `listRenewals`, `listClaims`, `listInsurers`, `getReport` |
| `services/agency/commands.ts` | `runAgencyCommand()` (command bar and WhatsApp staff commands) |
| `services/portal.ts` | everything a client sees |

## Server actions
- `lib/auth/actions.ts`: signIn (tabs: client / agency incl. agency_admin + admin), signUp (clients; `agency` code optional), signOut.
- `lib/admin/actions.ts`: createOrganization (+ first agency admin), setOrganizationActive, createAgencyAccount (any org, roles agency/agency_admin/admin), resetAgencyPassword, setAgencyActive, assignConversation.
- `lib/agency/actions.ts`: tasks, command bar, stages, policies, quotes, claims, messages, createClient; conversations (reply, resume, take over); team (invite, reset, active, role; agency admins only); settings (agency admins only).
- `lib/portal/actions.ts`: requestQuote, reportClaim, markUpdatesRead, updatePhone, askAssistant.

## Components
- `shell/*`: AppShell (forest rail, drawer, bottom tab bar, waiting badge), Sidebar, SidebarNav (role-filtered), MobileNav + MobileTabBar, TopBar, AgentProfile (`on="forest"`).
- `ui/*`: Button, Card, Badge, Avatar, Kbd, Money, EmptyState, Wordmark, PageHeader + StatusLine.
- `dashboard/*`: Today pieces. `workspace/*`: PipelineBoard, QuotesTable (exports Th/Td), RenewalsTable, ClaimsTable, InsurersTable, Reports.
- `conversations/*`: ConversationList, ConversationThread. `team/TeamManager`. `settings/OrganizationSettings`.
- `admin/*`: Organizations, AgencyAccounts (agency selector), AdminConversations.
- `clients/*`, `portal/*` (+ AskAssistant, DocumentsCard), `auth/*`, `ai/*`.
- Site: `components/site/AskWidget.tsx` (public consult), `components/Hero.tsx`.

## Types
`types/platform.ts`: Role + ROLE_LABELS, Organization (+ code/active/greeting/licenceLabel), OrganizationSummary, PublicUser, Client (+ `JOURNEY_STAGES`), Policy, QuoteRequest/QuoteSubmission, Claim (+ `CLAIM_STAGES`), Notification, SLATask, PriorityMetric, PipelineStage, ActivityItem, PortalData, CommandResult, WhatsAppContact, ConversationMessage, ConversationRow, Consultation, AuditEntry, `PRODUCT_LINES`.

## Conventions
- Money is `bigint` shillings in the DB, formatted by `formatKES` (`KES 184,500`); always monospace.
- Phones are E.164 digits without plus (`normalizePhone`), shown with `formatPhone`.
- References: `QR-2026-00012`, `CLM-2026-00003`; documents `REG/SUM/CLM/QTE/RPT-2026-00001`.
- Ids are prefixed (`usr_`, `org_`, `cli_`, `pol_`, `qr_`, `qs_`, `clm_`, `tsk_`, `act_`, `ntf_`, `msg_`, `con_`, `doc_`, `aud_`).
- Navigation items live in `data/platform/navigation.ts` (`adminOnly` flag, `agencyMobileTabs`).
