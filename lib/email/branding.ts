import type { Organization } from '@/types/platform'

/**
 * What an agency's emails look like. GoldOak has its own brand; every other
 * agency gets its own name, colours, logo and contact details from its
 * settings, with a neutral platform default until it sets them. Nothing
 * GoldOak-specific ever reaches another agency's email.
 */

export interface Branding {
  organizationId: string | null
  name: string
  shortName: string
  primary: string
  accent: string
  /** Absolute URL of the logo, or null for a monogram. */
  logoUrl: string | null
  monogram: string
  supportEmail: string
  supportPhone: string
  website: string
  address: string | null
  footerNote: string
  /** Shown once at the bottom of every email: who runs the platform. */
  poweredBy: string
}

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://goldoak.vercel.app'

export const PLATFORM_BRANDING: Branding = {
  organizationId: null,
  name: 'Super Agent',
  shortName: 'Super Agent',
  primary: '#1b2a3a',
  accent: '#2f6fed',
  logoUrl: null,
  monogram: 'SA',
  supportEmail: process.env.TO_EMAIL || process.env.SMTP_USER || '',
  supportPhone: '',
  website: SITE,
  address: null,
  footerNote: 'You are receiving this because you have an account on the Super Agent platform.',
  poweredBy: 'Super Agent is operated by GoldOak Insurance Agency Limited, Nairobi.',
}

function monogramFor(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean)
  return (parts.length >= 2 ? parts[0][0] + parts[1][0] : name.slice(0, 2)).toUpperCase()
}

export function brandingFor(org: Organization | null): Branding {
  if (!org) return PLATFORM_BRANDING
  const b = (org.branding ?? {}) as Record<string, string | undefined>
  const isGoldOak = org.id === 'org_goldoak' || org.code?.toUpperCase() === 'GOLDOAK'
  return {
    organizationId: org.id,
    name: org.name,
    shortName: org.shortName,
    primary: b.primary || (isGoldOak ? '#073423' : PLATFORM_BRANDING.primary),
    accent: b.accent || (isGoldOak ? '#c28d38' : PLATFORM_BRANDING.accent),
    logoUrl: b.logoUrl || (isGoldOak ? `${SITE}/assets/Gold%20Icon.png` : org.logoPath ? `${SITE}/api/uploads/logo/${org.id}` : null),
    monogram: monogramFor(org.shortName || org.name),
    supportEmail: b.supportEmail || org.email || PLATFORM_BRANDING.supportEmail,
    supportPhone: b.supportPhone || org.phone || '',
    website: b.website || org.website || SITE,
    address: org.address ?? null,
    footerNote: b.footerNote || `You are receiving this because you have an account with ${org.name}.`,
    poweredBy: isGoldOak ? 'GoldOak Insurance Agency Limited · Nairobi, Kenya' : PLATFORM_BRANDING.poweredBy,
  }
}
