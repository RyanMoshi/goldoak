import { BarChart3, Building2, FileText, KanbanSquare, RefreshCw, Settings, ShieldAlert, type LucideIcon } from 'lucide-react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ComingNext } from '@/components/platform/dashboard/ComingNext'
import { agencyRoadmap } from '@/data/platform/roadmap'

const icons: Record<string, LucideIcon> = {
  pipeline: KanbanSquare,
  quotes: FileText,
  renewals: RefreshCw,
  claims: ShieldAlert,
  insurers: Building2,
  reports: BarChart3,
  settings: Settings,
}

export function generateMetadata({ params }: { params: { section: string } }): Metadata {
  return { title: agencyRoadmap[params.section]?.title ?? 'Super Agent' }
}

/** Workspaces that are planned but not yet built get an honest coming-next page. */
export default function AgencySectionPage({ params }: { params: { section: string } }) {
  const entry = agencyRoadmap[params.section]
  const Icon = icons[params.section]
  if (!entry || !Icon) notFound()
  return <ComingNext icon={Icon} {...entry} />
}
