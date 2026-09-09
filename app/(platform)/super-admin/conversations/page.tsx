import type { Metadata } from 'next'
import Link from 'next/link'
import { AdminConversations } from '@/components/platform/admin/AdminConversations'
import { requireSession } from '@/lib/auth/server'
import { listAllConversations } from '@/services/conversations'
import { listOrganizations } from '@/services/users'

export const metadata: Metadata = { title: 'All conversations' }
export const dynamic = 'force-dynamic'

export default async function AdminConversationsPage() {
  await requireSession('admin')
  const [rows, organizations] = await Promise.all([listAllConversations(), listOrganizations(true)])
  return (
    <div className="animate-fade-up space-y-6">
      <div>
        <p className="label-caps flex items-center gap-2 text-gold-700">
          <span aria-hidden="true" className="size-1.5 rounded-full bg-gold" />
          <Link href="/super-admin" className="hover:underline">
            Platform
          </Link>
          <span aria-hidden="true">/</span>
          WhatsApp
        </p>
        <h1 className="mt-2 font-serif text-[28px] font-medium leading-9 text-forest sm:text-[34px] sm:leading-[2.75rem]">Conversations across every agency</h1>
        <p className="mt-1 text-[15px] text-ink-muted">{rows.filter((r) => !r.organizationId).length} unrouted. Agencies only ever see their own chats.</p>
      </div>
      <AdminConversations rows={rows} organizations={organizations} />
    </div>
  )
}
