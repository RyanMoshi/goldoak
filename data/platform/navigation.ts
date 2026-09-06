import {
  BarChart3,
  Building2,
  FileText,
  KanbanSquare,
  LayoutDashboard,
  RefreshCw,
  Settings,
  ShieldAlert,
  Users,
  type LucideIcon,
} from 'lucide-react'

export interface PlatformNavItem {
  href: string
  label: string
  icon: LucideIcon
  description: string
}

export const agencyNavigation: PlatformNavItem[] = [
  { href: '/agency/today', label: 'Today', icon: LayoutDashboard, description: 'What needs your attention now.' },
  { href: '/agency/pipeline', label: 'Pipeline', icon: KanbanSquare, description: 'Every opportunity from lead to placement.' },
  { href: '/agency/clients', label: 'Clients', icon: Users, description: 'One record per client: stage, policies, quotes, claims.' },
  { href: '/agency/quotes', label: 'Quotes', icon: FileText, description: 'Request, capture and compare insurer quotes on identical terms.' },
  { href: '/agency/renewals', label: 'Renewals', icon: RefreshCw, description: 'The renewal diary, 90 days out to expiry.' },
  { href: '/agency/claims', label: 'Claims', icon: ShieldAlert, description: 'Every open claim, its stage and the next update due.' },
  { href: '/agency/insurers', label: 'Insurers', icon: Building2, description: 'Panel appetite, contacts and turnaround record.' },
  { href: '/agency/reports', label: 'Reports', icon: BarChart3, description: 'Premium, commission, conversion and retention.' },
]

export const agencySettings: PlatformNavItem = {
  href: '/agency/settings',
  label: 'Settings',
  icon: Settings,
  description: 'Organisation, users, templates and disclosures.',
}

export function agencyNavFor(pathname: string): PlatformNavItem | undefined {
  return [...agencyNavigation, agencySettings].find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))
}
