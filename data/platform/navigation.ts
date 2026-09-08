import {
  BarChart3,
  Building2,
  FileText,
  FolderOpen,
  KanbanSquare,
  LayoutDashboard,
  Mail,
  Smartphone,
  Sparkles,
  MessageSquare,
  MessagesSquare,
  RefreshCw,
  ScrollText,
  Settings,
  ShieldAlert,
  Store,
  UserCog,
  Users,
  type LucideIcon,
} from 'lucide-react'
import type { Role } from '@/types/platform'

export interface PlatformNavItem {
  href: string
  label: string
  icon: LucideIcon
  description: string
  /** Only agency admins and the super admin see it. */
  adminOnly?: boolean
}

export const agencyNavigation: PlatformNavItem[] = [
  { href: '/agency/today', label: 'Today', icon: LayoutDashboard, description: 'What needs your attention now.' },
  { href: '/agency/conversations', label: 'Conversations', icon: MessageSquare, description: 'WhatsApp chats: who is waiting for a person, and every message.' },
  { href: '/agency/clients', label: 'Clients', icon: Users, description: 'One record per client: stage, policies, quotes, claims.' },
  { href: '/agency/businesses', label: 'Businesses', icon: Store, description: 'Businesses you serve and claims to link them.' },
  { href: '/agency/documents', label: 'Documents', icon: FolderOpen, description: 'Files clients sent, what the assistant read, confirmations.' },
  { href: '/agency/enquiries', label: 'Enquiries', icon: MessagesSquare, description: 'Questions and requests waiting for an answer.' },
  { href: '/agency/pipeline', label: 'Pipeline', icon: KanbanSquare, description: 'Every opportunity from lead to placement.' },
  { href: '/agency/quotes', label: 'Quotes', icon: FileText, description: 'Request, capture and compare insurer quotes on identical terms.' },
  { href: '/agency/renewals', label: 'Renewals', icon: RefreshCw, description: 'The renewal diary, 90 days out to expiry.' },
  { href: '/agency/claims', label: 'Claims', icon: ShieldAlert, description: 'Every open claim, its stage and the next update due.' },
  { href: '/agency/insurers', label: 'Insurers', icon: Building2, description: 'Panel appetite, contacts and turnaround record.' },
  { href: '/agency/reports', label: 'Reports', icon: BarChart3, description: 'Premium, commission, conversion and retention.' },
  { href: '/agency/whatsapp', label: 'WhatsApp', icon: Smartphone, description: 'Your agency’s own WhatsApp number.', adminOnly: true },
  { href: '/agency/ai', label: 'Assistant', icon: Sparkles, description: 'What the assistant knows and how it speaks for you.', adminOnly: true },
  { href: '/agency/emails', label: 'Emails', icon: Mail, description: 'Email activity and template wording.', adminOnly: true },
  { href: '/agency/team', label: 'Team', icon: UserCog, description: 'Invite staff, reset passwords, set roles.', adminOnly: true },
  { href: '/agency/audit', label: 'Audit log', icon: ScrollText, description: 'Who did what.', adminOnly: true },
]

export const agencySettings: PlatformNavItem = {
  href: '/agency/settings',
  label: 'Settings',
  icon: Settings,
  description: 'Agency profile, join code and WhatsApp greeting.',
}

/** Bottom tab bar on phones: the five most used destinations. */
export const agencyMobileTabs: PlatformNavItem[] = [agencyNavigation[0], agencyNavigation[1], agencyNavigation[2], agencyNavigation[4], agencyNavigation[9]]

export function navigationFor(role: Role): PlatformNavItem[] {
  const admin = role === 'admin' || role === 'agency_admin'
  return agencyNavigation.filter((item) => !item.adminOnly || admin)
}

export function agencyNavFor(pathname: string): PlatformNavItem | undefined {
  if (pathname.startsWith('/agency/search')) return { href: '/agency/search', label: 'Search', icon: Users, description: 'Search the agency.' }
  return [...agencyNavigation, agencySettings].find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))
}
