import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { PortalDocuments } from '@/components/platform/portal/PortalDocuments'
import { requireSession } from '@/lib/auth/server'
import { clientForUser } from '@/services/journey'
import { listUploadsForClient, uploadsReady } from '@/services/uploads'

export const metadata: Metadata = { title: 'My documents' }
export const dynamic = 'force-dynamic'

export default async function PortalDocumentsPage() {
  const session = await requireSession('client')
  const client = await clientForUser(session.uid)
  const uploads = client ? await listUploadsForClient(client.id) : []
  return (
    <div className="animate-fade-up space-y-5">
      <div>
        <Link href="/portal" className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-ink-muted hover:text-ink focus-ring rounded-control">
          <ArrowLeft className="size-4" aria-hidden="true" /> My insurance
        </Link>
        <h1 className="mt-3 font-serif text-[28px] font-medium leading-9 text-forest sm:text-[34px] sm:leading-[2.75rem]">My documents</h1>
        <p className="mt-1 text-[15px] text-ink-muted">Upload here or send on WhatsApp (reply 5). We read each document, show you what we found, and you confirm before it is saved to your file.</p>
      </div>
      <PortalDocuments uploads={uploads} storageReady={uploadsReady()} />
    </div>
  )
}
