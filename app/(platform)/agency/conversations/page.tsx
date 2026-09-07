import type { Metadata } from 'next'
import { ConversationList } from '@/components/platform/conversations/ConversationList'
import { PageHeader } from '@/components/platform/ui/PageHeader'
import { requireSession } from '@/lib/auth/server'
import { listConversations } from '@/services/conversations'

export const metadata: Metadata = { title: 'Conversations' }
export const dynamic = 'force-dynamic'

export default async function ConversationsPage() {
  const session = await requireSession('agency')
  const rows = await listConversations(session.oid)
  const waiting = rows.filter((r) => r.mode === 'human').length
  return (
    <div className="animate-fade-up space-y-6">
      <PageHeader eyebrow="WhatsApp" title="Conversations" description={waiting ? `${waiting} ${waiting === 1 ? 'person is' : 'people are'} waiting for an adviser. Open the chat and reply; the assistant stays quiet until you hand it back.` : 'Every chat on the Super Agent number that reached your agency. The assistant handles them until someone asks for a person.'} />
      <ConversationList rows={rows} />
    </div>
  )
}
