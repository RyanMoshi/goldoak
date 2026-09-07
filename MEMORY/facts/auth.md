---
name: auth
description: "Signed session cookies, role middleware, sign-in/sign-up, the four roles and who creates whom."
metadata.type: fact
---

## Sessions
- Cookie `goldoak_session`, 7 days, httpOnly, SameSite=Lax. Payload `{ uid, role, oid, name, exp }` signed with HMAC-SHA256 over `AUTH_SECRET` (Web Crypto, so it runs in edge middleware and Node). `lib/auth/session.ts`.
- `lib/auth/server.ts`: `getSession()`, `requireSession(area)` (area = `admin | agency | client`), `requireAgencyAdmin()`.
- `middleware.ts` gates `/admin`, `/agency`, `/portal`; signed-in users skip `/signin` and `/signup`.
- `homeFor(role)`: admin `/admin`, agency_admin and agency `/agency/today`, client `/portal`. `canAccess(role, area)`: admin area only for `admin`; agency area for `admin`, `agency_admin`, `agency`; client area for `client`.

## Roles
`admin` (platform super admin) → `agency_admin` (runs one agency) → `agency` (staff) → `client`. `isAgencyAdmin` = admin or agency_admin (Team, Settings edits). Every server action re-checks the role and scopes by `session.oid`; cross-organisation ids are rejected (`userInOrganization`, org-scoped queries).

## Passwords
scrypt (`lib/auth/password.ts`), stored as `scrypt$N$salt$hash`. Generated passwords look like `xxxx-xxxx-xxxx` (`generatePassword` in `lib/conversation/flows.ts`).

## Sign-in (`/signin`, `signInAction`)
Two tabs. **Client** matches `role = 'client'`; **Agency** matches `role IN ('agency','agency_admin','admin')`. Deactivated users are refused. `next` is honoured only inside the role's own area.

## Sign-up — clients only
- Web `/signup` (`signUpAction`): name, business name (SME/corporate), email, WhatsApp number (required, E.164 digits), what to protect, password. Optional `?agency=CODE` attaches the client to that agency (default GoldOak). Then `onClientSignedUp()`.
- WhatsApp: reply 1 → `signup` flow → `createClientUser` with a generated password sent back in the chat, linked to the agency the contact is routed to.

## Who creates whom
- Bootstrap creates the platform admin (`ADMIN_EMAIL`/`ADMIN_PASSWORD`).
- Admin creates agencies + their first agency admin (`/admin`, or `POST /api/admin/seed { organization }`), and can add staff to any agency.
- Agency admins invite their own staff at `/agency/team` (`inviteStaffAction`), reset passwords, promote/demote, deactivate.
- Agencies and staff never self-register.

## Secrets
`AUTH_SECRET`, `ADMIN_TOKEN`, `CRON_SECRET`, `ADMIN_PASSWORD`, `OPENWA_*`, `ANTHROPIC_API_KEY` are sensitive on Vercel. Rotating `AUTH_SECRET` signs everyone out.
