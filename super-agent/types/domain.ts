/**
 * Core domain identities shared across features. Kept deliberately small in
 * Step 1; the full model (RiskProfile, Quote, Policy, Claim, …) grows here.
 */

export type OrganizationType = "agency" | "brokerage" | "network-member";

export interface Organization {
  id: string;
  name: string;
  shortName: string;
  type: OrganizationType;
  country: "KE";
  currency: "KES";
  timezone: "Africa/Nairobi";
  licenceLabel: string;
}

export interface Agent {
  id: string;
  organizationId: string;
  firstName: string;
  lastName: string;
  role: string;
  email: string;
}

export type InsurerId =
  | "britam"
  | "jubilee"
  | "cic"
  | "apa"
  | "old-mutual"
  | "aig";

export interface Insurer {
  id: InsurerId;
  name: string;
  /** Two- or three-letter monogram used where a logo would be. */
  monogram: string;
}

export type ProductLine =
  | "Motor Comprehensive"
  | "Motor Fleet"
  | "Fire & Allied Perils"
  | "Burglary"
  | "Group Medical"
  | "WIBA"
  | "Public Liability"
  | "Professional Indemnity"
  | "Goods in Transit";
