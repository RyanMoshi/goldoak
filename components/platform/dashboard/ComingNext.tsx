import { ArrowLeft, type LucideIcon } from 'lucide-react'
import { ButtonLink } from '@/components/platform/ui/Button'
import { Card } from '@/components/platform/ui/Card'

interface Props {
  icon: LucideIcon
  title: string
  step: string
  description: string
  capabilities: string[]
}

/** An honest placeholder for a workspace that is planned but not built. */
export function ComingNext({ icon: Icon, title, step, description, capabilities }: Props) {
  return (
    <div className="mx-auto max-w-2xl animate-fade-up py-6 lg:py-12">
      <p className="label-caps flex items-center gap-2 text-gold-700">
        <span aria-hidden="true" className="size-1.5 rounded-full bg-gold" />
        {step}
      </p>
      <h2 className="mt-2 font-serif text-[28px] font-medium leading-9 tracking-[-0.01em] text-forest sm:text-[34px] sm:leading-[2.75rem]">{title}</h2>
      <p className="mt-2 max-w-prose text-[15px] text-ink-muted">{description}</p>
      <Card className="mt-6">
        <div className="flex items-center gap-3">
          <span className="inline-flex size-9 items-center justify-center rounded-control bg-forest text-gold">
            <Icon className="size-[18px]" aria-hidden="true" strokeWidth={1.75} />
          </span>
          <p className="text-[13px] font-bold uppercase tracking-[0.08em] text-ink-muted">What this workspace will do</p>
        </div>
        <ul className="mt-4 divide-y divide-divider">
          {capabilities.map((item) => (
            <li key={item} className="py-2.5 text-[14px] text-ink">
              {item}
            </li>
          ))}
        </ul>
      </Card>
      <div className="mt-6">
        <ButtonLink href="/agency/today" variant="outline">
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to Today
        </ButtonLink>
      </div>
    </div>
  )
}
