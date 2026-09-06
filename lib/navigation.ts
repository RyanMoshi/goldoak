export interface NavItem {
  name: string
  href: string
  children?: NavItem[]
}

export const mainNav: NavItem[] = [
  { name: 'Home', href: '/' },
  { name: 'About', href: '/about' },
  {
    name: 'Solutions',
    href: '/solutions',
    children: [
      { name: 'Health & Life', href: '/solutions#health-life' },
      { name: 'Motor', href: '/solutions#motor' },
      { name: 'Property & Assets', href: '/solutions#property-assets' },
      { name: 'Liability', href: '/solutions#liability' },
      { name: 'People & Statutory', href: '/solutions#people-statutory' },
      { name: 'Personal Lines', href: '/solutions#personal-lines' },
      { name: 'Specialty', href: '/solutions#specialty' },
    ],
  },
  { name: 'How We Work', href: '/how-we-work' },
  { name: 'Claims', href: '/claims' },
  { name: 'Contact', href: '/contact' },
]

export const footerNav = {
  explore: [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'Solutions', href: '/solutions' },
    { name: 'How We Work', href: '/how-we-work' },
    { name: 'Claims', href: '/claims' },
    { name: 'Contact', href: '/contact' },
  ],
  clientTypes: [
    { name: 'Individuals', href: '/solutions#personal-lines' },
    { name: 'SMEs', href: '/about#who-we-serve' },
    { name: 'Corporate', href: '/about#who-we-serve' },
  ],
  portal: [
    { name: 'Super Agent', href: '/super-agent' },
    { name: 'For clients: track your cover', href: '/super-agent#clients' },
    { name: 'For agencies: the workspace', href: '/super-agent#agencies' },
  ],
  legal: [
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
  ],
}
