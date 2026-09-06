---
name: auth
description: "Signed session cookies, role middleware, sign-in/sign-up, admin invitations."
metadata.type: fact
---

## Sessions
- Cookie `goldoak_session`, 7 days, httpOnly, SameSite=Lax. Payload `{ uid, role, oid, name, exp }` signed with HMAC-SHA256 over `AUTH_SECRET` (Web Crypto, so it runs in edge middleware and Node). `lib/auth/session.ts`.
- `lib/auth/server.ts`: `getSession()`, `requireSession(area)` (redirects to `/signin?as=…` or to the role's home).
- `middleware.ts` gates `/admin`, `/agency`, `/portal`; signed-in users skip `/signin` and `/signup`.
- `homeFor(role)`: admin `/admin`, agency `/agency/today`, client `/portal`. `canAccess`: admin may enter agency.

## Passwords
scrypt (`lib/auth/password.ts`), stored as `scrypt$N$salt$hash`. No plaintext anywhere.

## Sign-in (`/signin`, `lib/auth/actions.ts` → `signInAction`)
Two tabs. **Client** tab matches `role = 'client'`; **Agency** tab matches `role IN ('agency','admin')`. Deactivated users are refused. Optional `next` is honoured only inside the role's own area.

## Sign-up (`/signup` → `signUpAction`) — clients only
Fields: name, business name (SME/corporate), email, WhatsApp number (**required**, normalised to E.164 digits), what to protect (optional), password. Creates `users` + `clients` (stage `understand`) under `DEFAULT_ORGANIZATION_ID`, then `onClientSignedUp()` sends the welcome (portal + WhatsApp) and creates the agency lead task and notification.

## Agency accounts (admin only)
`/admin` → `createAgencyAccountAction`: name, email, phone, title, role (agency/admin), password (chosen or generated `xxxx-xxxx-xxxx`). The generated password is shown once in the success message. `resetAgencyPasswordAction`, `setAgencyActiveAction`. Agencies never self-register.

## Secrets
`AUTH_SECRET`, `ADMIN_TOKEN`, `CRON_SECRET`, `ADMIN_PASSWORD` are sensitive on Vercel. Rotating `AUTH_SECRET` signs everyone out.
