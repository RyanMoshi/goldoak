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
Append to `lib/db/schema.sql` using `CREATE TABLE IF NOT EXISTS` or `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`. It applies on the next request. Add a mapper in `lib/db/mappers.ts` and a type in `types/platform.ts`.

## A WhatsApp command
Client commands: extend `clientIntent()` and `clientReply()` in `lib/whatsapp/bot.ts`; multi-step flows use `saveState/loadState`. Agency commands: extend `detect()` in `services/agency/commands.ts` (this also powers the dashboard command bar).

## Verify
`npx tsc --noEmit`, `npx next lint`, `npm run build`, then push and check `/api/health` and the page on the live site.
