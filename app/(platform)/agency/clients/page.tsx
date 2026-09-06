import type { Metadata } from 'next'
import { ClientsTable } from '@/components/platform/clients/ClientsTable'
import { requireSession } from '@/lib/auth/server'
import { listClients } from '@/services/agency/clients'

export const metadata: Metadata = { title: 'Clients' }

export default async function ClientsPage() {
  const session = await requireSession('agency')
  const clients = await listClients(session.oid)
  const inForce = clients.reduce((sum, c) => sum + c.policyCount, 0)
  return (
    <div className="animate-fade-up">
      <p className="label-caps flex items-center gap-2 text-gold-700">
        <span aria-hidden="true" className="size-1.5 rounded-full bg-gold" />
        Client register
      </p>
      <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-serif text-[28px] font-medium leading-9 text-forest sm:text-[34px] sm:leading-[2.75rem]">Clients</h2>
          <p className="mt-1 text-[14px] text-ink-muted">
            {clients.length} client{clients.length === 1 ? '' : 's'} · {inForce} polic{inForce === 1 ? 'y' : 'ies'} in force. New website sign-ups appear here automatically.
          </p>
        </div>
      </div>
      <div className="mt-6">
        <ClientsTable clients={clients} />
      </div>
    </div>
  )
}
