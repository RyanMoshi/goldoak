import type { LucideIcon } from "lucide-react";

export type WorkspaceRoute =
  | "/today"
  | "/pipeline"
  | "/clients"
  | "/quotes"
  | "/renewals"
  | "/claims"
  | "/insurers"
  | "/reports"
  | "/settings";

export interface NavItem {
  href: WorkspaceRoute;
  label: string;
  icon: LucideIcon;
  /** One-line purpose, used for tooltips and the coming-next pages. */
  description: string;
}
