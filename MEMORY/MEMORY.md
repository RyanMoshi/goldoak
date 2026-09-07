# GoldOak + Super Agent Project Memory

> START HERE → [masterplan.md](masterplan.md) — read this first in any session.

## Index

### Core
- [masterplan.md](masterplan.md) — What the product is, how the platform model works, current state, priority queue, links. Read first always.
- [enhanced-prompt.md](enhanced-prompt.md) — Paste into any new AI session to onboard instantly. Quick facts, rules, task routing.

### Fact Files
- [platform.md](facts/platform.md) — Super Agent map: roles, areas, services, actions, components, types
- [database.md](facts/database.md) — Supabase Postgres, tables, connection precedence, bootstrap, sensitive env values
- [auth.md](facts/auth.md) — Signed sessions, middleware, sign-in/sign-up, admin invitations
- [whatsapp.md](facts/whatsapp.md) — Providers (OpenWA, Meta), tenant routing, step engine and flows, consultation, handoff, webhooks, automation
- [stack.md](facts/stack.md) — Tech stack, dependencies, build commands, quirks
- [routes.md](facts/routes.md) — Every URL (site, platform, API) and its file
- [brand.md](facts/brand.md) — Colours, logo, typography, platform tokens
- [api.md](facts/api.md) — API endpoints: site forms, public assistant, documents (PDF), health, seed, cron, webhooks
- [data.md](facts/data.md) — Static site content in `lib/`
- [email.md](facts/email.md) — Nodemailer SMTP for the site forms

### Playbooks
- [dev-setup.md](playbooks/dev-setup.md) — First-time setup, env pull, dev server
- [deploy-vercel.md](playbooks/deploy-vercel.md) — Deploy, env vars, verify live
- [bootstrap-admin.md](playbooks/bootstrap-admin.md) — Bootstrap, create the admin, create agencies, invite staff, run the live multi-agency test
- [whatsapp-openwa.md](playbooks/whatsapp-openwa.md) — Connect the OpenWA gateway, register the webhook, test the bot
- [add-feature.md](playbooks/add-feature.md) — Add a page, service, server action, table, notification
- [fix-build.md](playbooks/fix-build.md) — Common build failures and fixes
