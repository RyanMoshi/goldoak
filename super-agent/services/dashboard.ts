import { dashboardData } from "@/data/dashboard";
import type { DashboardData } from "@/types/dashboard";

/**
 * Data-access boundary for the Today dashboard. Server-only callers. When the
 * database exists this becomes a tenant-scoped query; the UI does not change.
 */
export async function getDashboardData(organizationId: string): Promise<DashboardData> {
  if (!organizationId) {
    throw new Error("getDashboardData requires an organisation id");
  }
  return {
    ...dashboardData,
    tasks: [...dashboardData.tasks].sort((a, b) => b.priority - a.priority),
  };
}
