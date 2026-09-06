import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { NewClientForm } from '@/components/platform/clients/NewClientForm'
import { requireSession } from '@/lib/auth/server'

export const metadata: Metadata = { title: 'New lead' }

export default async function NewClientPage() {
  await requireSession('agency')
  return (
    <div className="animate-fade-up">
      <Link href="/agency/clients" className="inline-flex items-center gap-1.5 rounded-control text-[13px] font-semibold text-ink-muted hover:text-ink focus-ring">
        <ArrowLeft className="size-4" aria-hidden="true" /> Clients
      </Link>
      <h2 className="mt-3 font-serif text-[28px] font-medium leading-9 text-forest sm:text-[34px] sm:leading-[2.75rem]">New lead</h2>
      <p className="mt-1 mb-6 text-[14px] text-ink-muted">A fact-find task is created for you. If they sign up on the website with the same number, the records link.</p>
      <NewClientForm />
    </div>
  )
}
