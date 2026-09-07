import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ConversationThread } from '@/components/platform/conversations/ConversationThread'
import { requireSession } from '@/lib/auth/server'
import { getConversation } from '@/services/conversations'

export const metadata: Metadata = { title: 'Conversation' }
export const dynamic = 'force-dynamic'

export default async function ConversationPage({ params }: { params: { phone: string } }) {
  const session = await requireSession('agency')
  const phone = params.phone.replace(/\D/g, '')
  const conversation = await getConversation(session.oid, phone)
  if (!conversation) notFound()
  return (
    <div className="animate-fade-up">
      <ConversationThread contact={conversation.contact} messages={conversation.messages} />
    </div>
  )
}
