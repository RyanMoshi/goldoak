import Link from 'next/link'

export const dynamic = 'force-dynamic'

/**
 * The assistant's pages, inside the one console rather than beside it.
 *
 * These used to live at /superagent behind a shell of their own, which is what
 * made the platform feel like two separate dashboards. They now sit under the
 * Super Admin rail like everything else, with a small strip of their own for
 * moving between them.
 */
const TABS: [string, string][] = [
  ['/super-admin/superagent', 'Overview'],
  ['/super-admin/superagent/agencies', 'Agencies'],
  ['/super-admin/superagent/knowledge', 'Knowledge'],
  ['/super-admin/superagent/configuration', 'Configuration'],
  ['/super-admin/superagent/monitoring', 'Monitoring'],
]

export default function SuperAgentSection({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-5">
      <nav aria-label="Super Agent" className="scrollbar-none -mx-1 flex gap-1 overflow-x-auto px-1">
        {TABS.map(([href, label]) => (
          <Link
            key={href}
            href={href}
            className="whitespace-nowrap rounded-control border border-line bg-surface px-3.5 py-2 text-[13.5px] font-semibold text-ink transition-colors hover:border-ink-muted focus-ring"
          >
            {label}
          </Link>
        ))}
      </nav>
      {children}
    </div>
  )
}
