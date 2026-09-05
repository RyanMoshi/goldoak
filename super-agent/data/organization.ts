import type { Agent, Organization } from "@/types/domain";

/**
 * Super Agent is multi-tenant. GoldOak is one organisation using the platform,
 * never a hard-coded assumption. In Step 1 the current tenant and agent are
 * static; later they come from the session.
 */
export const currentOrganization: Organization = {
  id: "org_goldoak",
  name: "GoldOak Insurance Agency",
  shortName: "GoldOak",
  type: "agency",
  country: "KE",
  currency: "KES",
  timezone: "Africa/Nairobi",
  licenceLabel: "IRA-licensed intermediary",
};

export const currentAgent: Agent = {
  id: "agt_alex_kamau",
  organizationId: currentOrganization.id,
  firstName: "Alex",
  lastName: "Kamau",
  role: "Senior Insurance Agent",
  email: "alex.kamau@goldoak.co.ke",
};
