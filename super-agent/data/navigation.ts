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
} from "lucide-react";
import type { NavItem, WorkspaceRoute } from "@/types/navigation";

export const primaryNavigation: NavItem[] = [
  {
    href: "/today",
    label: "Today",
    icon: LayoutDashboard,
    description: "What needs your attention now.",
  },
  {
    href: "/pipeline",
    label: "Pipeline",
    icon: KanbanSquare,
    description: "Every opportunity from lead to placement.",
  },
  {
    href: "/clients",
    label: "Clients",
    icon: Users,
    description: "One record per client: risk profile, policies, documents, history.",
  },
  {
    href: "/quotes",
    label: "Quotes",
    icon: FileText,
    description: "Request, capture and compare insurer quotes on identical terms.",
  },
  {
    href: "/renewals",
    label: "Renewals",
    icon: RefreshCw,
    description: "The renewal diary, 90 days out to expiry.",
  },
  {
    href: "/claims",
    label: "Claims",
    icon: ShieldAlert,
    description: "Every open claim, its stage and the next update due.",
  },
  {
    href: "/insurers",
    label: "Insurers",
    icon: Building2,
    description: "Panel appetite, contacts and turnaround record.",
  },
  {
    href: "/reports",
    label: "Reports",
    icon: BarChart3,
    description: "Premium, commission, conversion and retention.",
  },
];

export const settingsNavigation: NavItem = {
  href: "/settings",
  label: "Settings",
  icon: Settings,
  description: "Organisation, users, templates and disclosures.",
};

export function navItemFor(pathname: string): NavItem | undefined {
  const all = [...primaryNavigation, settingsNavigation];
  return all.find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
  );
}

export function isWorkspaceRoute(value: string): value is WorkspaceRoute {
  return [...primaryNavigation, settingsNavigation].some((item) => item.href === value);
}
