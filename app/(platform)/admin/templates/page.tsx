import type { Metadata } from 'next'
import { TemplateEditor } from '@/components/platform/emails/TemplateEditor'
import { requireSession } from '@/lib/auth/server'
import { listTemplateOverrides } from '@/services/emails'

export const metadata: Metadata = { title: 'Email templates' }
export const dynamic = 'force-dynamic'

export default async function AdminTemplatesPage() {
  await requireSession('admin')
  const templates = await listTemplateOverrides(null)
  return (
    <div className="animate-fade-up space-y-6">
      <div>
        <p className="label-caps flex items-center gap-2 text-gold-700">
          <span aria-hidden="true" className="size-1.5 rounded-full bg-gold" />
          Platform
        </p>
        <h1 className="mt-2 font-serif text-[26px] font-medium leading-8 text-forest sm:text-[34px] sm:leading-[2.75rem]">Global email templates</h1>
        <p className="mt-1 text-[14.5px] text-ink-muted">Platform defaults. An agency's own wording, where allowed, sits on top of these.</p>
      </div>
      <TemplateEditor templates={templates} scope="global" />
    </div>
  )
}
