export interface Insurer {
  name: string
  description: string
}

export const insurers: Insurer[] = [
  {
    name: 'Jubilee',
    description: 'One of East Africa\'s largest insurance groups, offering a wide range of commercial and personal lines.',
  },
  {
    name: 'APA',
    description: 'A leading insurance provider in Kenya with a strong presence in motor, medical, and commercial lines.',
  },
  {
    name: 'AAR',
    description: 'Known for medical insurance and healthcare solutions, with a growing commercial insurance portfolio.',
  },
  {
    name: 'AIG',
    description: 'A global insurance organisation with local presence, specialising in large commercial and specialty risks.',
  },
  {
    name: 'Britam',
    description: 'A diversified financial services group offering insurance, asset management, and banking solutions.',
  },
  {
    name: 'CIC',
    description: 'A member-owned insurance group with competitive rates in medical, life, and general insurance.',
  },
  {
    name: 'Old Mutual',
    description: 'A pan-African financial services group with deep expertise in life, property, and investment-linked insurance.',
  },
  {
    name: 'Prudential',
    description: 'An international insurance group with a focus on life and health insurance solutions.',
  },
]

export const claimsSteps = [
  {
    step: 'Notify',
    description: 'Contact GoldOak and receive immediate guidance on what to do and what not to do.',
    timeframe: 'Same day',
  },
  {
    step: 'Register',
    description: 'Claim is logged internally and reported to the insurer. Reference obtained and given to the client.',
    timeframe: 'Within 24 hours',
  },
  {
    step: 'Document',
    description: 'We tell you exactly what is needed and help assemble it. We do not forward a requirements list and wait.',
    timeframe: 'Within 48 hours',
  },
  {
    step: 'Track',
    description: 'We chase the insurer and the assessor, and update you on a fixed rhythm whether or not there is news.',
    timeframe: 'Weekly update',
  },
  {
    step: 'Settle',
    description: 'Offer reviewed before it reaches the client. Where it is short or wrongly declined, we argue the point.',
    timeframe: 'Reviewed within 48 hours',
  },
  {
    step: 'Close',
    description: 'Confirm settlement, reinstate cover where needed, record the outcome against the insurer\'s panel factsheet.',
    timeframe: 'Within 7 days',
  },
]

export const clientSegments = [
  {
    id: 'individual',
    title: 'Individuals',
    description: 'Cover for the things you have worked for and the people who depend on you — your vehicle, your family\'s health, your home, your income and your travel.',
    services: ['Motor', 'Medical', 'Life', 'Personal accident', 'Travel', 'Home & property'],
  },
  {
    id: 'sme',
    title: 'SMEs',
    description: 'Growing businesses carry exposures that rarely fit a standard package: staff, stock, premises, vehicles, contracts and professional obligations. We build cover around the actual operation.',
    services: ['Motor & fleet', 'Medical', 'WIBA', 'Group life', 'Property', 'Fire', 'Burglary', 'Liability', 'Professional indemnity'],
  },
  {
    id: 'corporate',
    title: 'Corporate',
    description: 'Employee benefits, group schemes, fleets, property and liability programmes, arranged and administered with the review discipline a larger organisation expects.',
    services: ['Employee benefits', 'Group medical', 'Group life', 'WIBA', 'Fleet', 'Property', 'Liability', 'Professional risks'],
  },
]
