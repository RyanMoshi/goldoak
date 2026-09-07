---
name: add-feature
description: "How to add a page, a server action, a service, a table, a notification, or a WhatsApp command."
metadata.type: playbook
---

## A site page
1. `app/(site)/<slug>/page.tsx` (gets Navigation + Footer from the group layout).
2. Add to `lib/navigation.ts` (`mainNav` / `footerNav`).
3. `npx tsc --noEmit && npm run build`.

## A platform page
1. Put it under the right area: `app/(platform)/agency/...`, `portal/...`, `admin/...`. The layout already enforces the role; call `requireSession('agency'|'client'|'admin')` in the page too.
2. Fetch through a function in `services/`; never query in the page.
3. Interactive parts are client components in `components/platform/...` that call a server action.

## A server action
`lib/<area>/actions.ts` with `'use server'`. Pattern:
```ts
export async function doThingAction(formData: FormData): Promise<ActionState> {
  const session = await requireSession('agency')
  // validate, then call a service, then revalidatePath(...)
}
```
Client side: `startTransition(async () => setState(await doThingAction(fd)))`.

## Something a client should know about
Call `notify({ organizationId, userId: client.userId, clientId, kind, title, body, reference })` from the service. It lands in the portal Updates and on WhatsApp. Use `reference` to make it idempotent.

## A table or column
Append to `lib/db/schema.ts` using `CREATE TABLE IF NOT EXISTS` or `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`. It applies on the next request. Every tenant-owned table needs `organization_id`. Add a mapper in `lib/db/mappers.ts` and a type in `types/platform.ts`.

## A PDF
Add a renderer in `services/documents.ts` using the helpers in `lib/pdf/document.ts` (`renderPdf`, `title`, `section`, `keyValues`, `table`, `callout`), register its prefix in `PREFIX`, and expose it in `app/api/documents/[type]/route.ts` with the same ownership checks.

## A sensitive action
Call `audit({ organizationId, actorUserId, action, target, detail })` from `services/audit.ts` after it succeeds.

## A background job
Add the type to `JobType` in `services/jobs.ts`, register a handler in `services/jobs/handlers.ts`, and `enqueue({ type, payload, organizationId, idempotencyKey })`. Jobs run after the next webhook/upload, from `/api/cron/jobs`, or from `/admin/system`. Handlers must be idempotent (they retry).

## An intent the assistant should understand
Add it to `Intent` and to the model prompt in `services/memory.ts` (`understand()`), add a regex to `KEYWORDS` for the obvious phrasings, then handle it in `dispatch()` in `lib/whatsapp/bot.ts`. If it should be a menu number, update `menuIntent()` and `GUEST_MENU` / `CLIENT_MENU` in `lib/conversation/messages.ts` together.

## A WhatsApp flow or command
- **A new step-based flow:** add a `Flow` in `lib/conversation/flows.ts` (steps with `parse`, optional `skip`, `optional`; `onComplete` calls a service), register it in `FLOWS`, and start it from `dispatch()` in `lib/whatsapp/bot.ts` with `startFlow` + `setWorkflow`. BACK/CANCEL/RESTART/HELP/MENU, progress and confirmation come free from the engine.
- **A stateless client reply:** add a case to `dispatch()`; keep `GUEST_MENU` / `CLIENT_MENU` and `menuIntent()` in step.
- **Staff commands:** extend `detect()` in `services/agency/commands.ts` (also powers the dashboard command bar).
- **Message wording:** use the helpers in `lib/conversation/messages.ts` so every message shares one voice.
- **Test:** run the live test (`playbooks/bootstrap-admin.md`) or call the webhook in dry-run mode with `x-admin-token` (+ `x-debug: 1` for error details).

## Verify
`npx tsc --noEmit`, `npx next lint`, `npm run build`, then push and check `/api/health` and the page on the live site.
