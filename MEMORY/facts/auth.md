---
name: auth
description: "Identities vs memberships, signed sessions, temporary passwords and forced change, OTP, lockout, impersonation, who creates whom."
metadata.type: fact
---

## Identity vs membership (v4)
- `users` is the platform identity (one row per email). `memberships` (`user_id`, `organization_id`, `role agency_admin|agency|client`, `client_id`, `status invited|active|suspended`, unique per user+org) is the relationship with each agency. The same email can be a client of one agency and staff of another; each agency sees only its own records.
- The session carries the chosen membership: cookie `goldoak_session` payload `{ uid, role, oid, name, mcp?, imp?, exp }` signed with HMAC-SHA256 over `AUTH_SECRET` (`lib/auth/session.ts`). `mcp` = must change password; `imp` = id of the super admin impersonating.
- `users.role` / `users.organization_id` remain as the "primary" legacy columns and are kept in step by `services/memberships.ts` (`ensureMembership`, `setMembershipRole`, `listMemberships`, `getMembership`).

## Sign-in (`/signin`, `signInAction`)
1. Find the identity by email; refuse if locked (5 failed attempts → 15 minutes, `failed_logins`/`locked_until`) or deactivated.
2. Tab decides which memberships count: **Client** = `role = client`; **Agency** = staff roles (and the platform admin).
3. Temporary password (`must_change_password`) → `/account/password?first=1` before anything else (middleware enforces it on every area).
4. Several matching agencies → `/choose-agency` (`chooseAgencyAction` re-signs the cookie for that membership). One → straight to its home. Menu → "Switch agency" when there is more than one.
5. Every sign-in is audited and a `security-login` email is queued.

## Passwords
- scrypt (`lib/auth/password.ts`). Temporary passwords are friendly: `generateTempPassword()` → word + 4 digits (e.g. `Mango4827`, no 0/1). They are sent once (email `temp-password`, WhatsApp when a number is known) and must be changed at first sign-in (`changePasswordAction`: ≥10 chars with a letter and a number; emails `security-password-changed`).
- Reset: `/forgot-password` → `password-reset` email (immediate) → `/reset-password?token=`. Admins/agency admins can issue a new temporary password (`resetToTemporaryPassword`).
- Email verification: self sign-ups go to `/verify-email` (6-digit OTP, hashed, 10 min, 3 per 10 min, 5 attempts; `services/otp.ts`).

## Roles
`admin` (super admin: everything, may impersonate) → `agency_admin` → `agency` (staff) → `client`. `canAccess(role, area)` in `lib/auth/session.ts`; `requireSession(area)` / `requireAgencyAdmin()` / `requireAnySession()` in `lib/auth/server.ts`. Every service takes `organizationId` from the session and rejects foreign ids.

## Impersonation
`/admin` → "View as" on any active non-admin account → `impersonateAction` signs a 1-hour cookie with `imp = admin id`; a gold banner ("X is viewing as Y … Return to admin") sits above the workspace; both start and stop are audited (`admin.impersonate`, `admin.impersonate-stop`).

## Who creates whom
- Bootstrap: `POST /api/admin/seed` creates the platform admin from `ADMIN_EMAIL` / `ADMIN_PASSWORD` (`SEED_ADMIN_PASSWORD` locally).
- Super admin: agencies + first agency admin (`/admin`), any staff account in any agency, password resets, activate/deactivate, impersonate.
- Agency admin: staff (`/agency/team`), clients (`/agency/clients/new` → invitation with temporary password, or lead only), resets.
- Inviting an email that already exists attaches that identity to the agency (membership) instead of creating a second account; the person keeps their password and is told by email/WhatsApp.
- Agencies self-register at `/agencies/signup` (pending until approved; `agency-registered` + `admin-alert` emails, `agency-approved` on approval). Clients self-register at `/signup` or on WhatsApp (reply 1 → temporary password + email).

## Login procedures
- **Super admin**: `/signin` → Agency tab → `ADMIN_EMAIL` + password → `/admin`.
- **GoldOak** (a normal tenant, code `GOLDOAK`): its agency admins/staff use `/signin` → Agency tab; its clients use the Client tab. Nothing special-cases GoldOak in auth.
- **Other agencies**: identical; the membership decides the workspace. Same email in several agencies → picker.

## Secrets
`AUTH_SECRET`, `ADMIN_TOKEN`, `CRON_SECRET`, `ADMIN_PASSWORD`, `OPENWA_*`, `NVIDIA_API_KEY`, `SMTP_PASS` are sensitive on Vercel. Rotating `AUTH_SECRET` signs everyone out (see playbooks/logins-and-onboarding.md).
