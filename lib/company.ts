/**
 * GoldOak's own words.
 *
 * Everything here is taken from the two company profile documents
 * (`GoldOak_Insurance_Agency_Company_Profile.pdf` and its editable source
 * copy). It is the single source of truth for the public website *and* for
 * what the assistant is allowed to say about the agency, so the site and the
 * chat can never drift apart or invent a claim the company never made.
 *
 * Items the company still has to supply are listed in `PENDING` rather than
 * guessed at. Nothing in this file may be embellished: if it is not in the
 * profile, it does not belong here.
 */

export const company = {
  legalName: 'GoldOak Insurance Agency Limited',
  shortName: 'GoldOak',
  tagline: 'Protection, considered. Service, sustained.',
  positioning: 'A licensed insurance intermediary serving individuals, families, SMEs and corporates across Kenya.',
  promise: 'We stay with you from policy to payout.',
  established: 2020,
  regulator: 'Insurance Regulatory Authority (IRA), Kenya',
  regulatoryNote: 'Regulated by the Insurance Regulatory Authority of Kenya',
  business: 'Insurance agency / intermediary',
  markets: 'Kenya — nationwide',
  city: 'Nairobi, Kenya',
  /** From GoldOak's published website; the company profile left this as a placeholder. */
  address: 'Milimani Road, Nairobi',

  /** The one-sentence description of what the agency does, from the profile. */
  whatWeDo:
    'We assess a client’s exposure, source competing terms from Kenya’s leading underwriters, recommend the cover that genuinely fits, and then manage the relationship — renewals, endorsements and claims — for as long as the client stays with us.',

  vision: 'To be the most trusted insurance agency in Kenya, known for integrity, service excellence and client-first solutions.',
  mission: 'To equip clients with comprehensive, affordable and tailor-made insurance solutions that meet their specific needs.',

  /** The line the leadership foreword closes on. */
  leadershipLine: 'We would rather lose an account on price than win it on a policy we knew would not respond.',
  oakLine: 'The oak in our name is deliberate. It is slow-growing, deep-rooted and it does not move in a storm.',

  /** The test applied before any recommendation leaves the desk. */
  theTest:
    'Before any recommendation leaves our desk we ask one question: if this client suffers the loss they are insuring against, will this policy actually respond? If the honest answer is no, or not fully, we say so and we fix it before the policy is placed.',
} as const

/** Headline figures. Only those stated in the profile. */
export const figures: { value: string; label: string }[] = [
  { value: '2020', label: 'Year established' },
  { value: '13+', label: 'Underwriting partners' },
  { value: '6', label: 'Core product lines' },
  { value: '1 day', label: 'Claim acknowledgement' },
]

/** How the agency is set up — the trust markers from "GoldOak at a glance". */
export const setup: string[] = [
  'Independent of any single insurer',
  'Multi-underwriter panel',
  'Advice at no cost to the client',
  'Named account contact',
  'Claims advocacy included',
  'IRA licensed and renewed annually',
  'Data Protection Act, 2019',
  'Professional indemnity in force',
]

/** Advise → Place → Serve. What an agency actually does, in the profile's words. */
export const whatAnAgencyDoes: { title: string; body: string }[] = [
  { title: 'Advise', body: 'We start with exposure, not with a product. What could go wrong, how badly, and how likely.' },
  { title: 'Place', body: 'We take that risk to the market, gather competing terms and present them side by side in plain language.' },
  { title: 'Serve', body: 'We remain the client’s contact for endorsements, renewals, disputes and claims for the life of the policy.' },
]

export interface CoreValue {
  number: string
  title: string
  body: string
  practice: string
}

export const coreValues: CoreValue[] = [
  {
    number: '01',
    title: 'Customer centricity',
    body: 'We prioritise our clients’ needs above all else, ensuring every decision we make aligns with their goals and expectations.',
    practice: 'No recommendation is made without a documented needs assessment.',
  },
  {
    number: '02',
    title: 'Integrity',
    body: 'We foster transparency, honesty and ethical conduct in all interactions.',
    practice: 'Exclusions, limits and excesses are disclosed in writing before purchase.',
  },
  {
    number: '03',
    title: 'Solution-driven',
    body: 'We seek to understand each client’s risks and identify the most effective coverage options.',
    practice: 'At least three comparable market quotations wherever the market allows.',
  },
  {
    number: '04',
    title: 'Value for money',
    body: 'We ensure our clients access competitive products that provide optimal benefits.',
    practice: 'Price is compared alongside cover breadth, not in isolation from it.',
  },
  {
    number: '05',
    title: 'Ongoing support',
    body: 'We provide continuous post-sale service, including claims assistance and policy updates.',
    practice: 'A named account contact, renewal review 30 days ahead of expiry.',
  },
]

export interface Differentiator {
  number: string
  title: string
  body: string
}

/** "What sets us apart" — five reasons clients place business, and renew it. */
export const differentiators: Differentiator[] = [
  {
    number: '01',
    title: 'A trusted partner since 2020',
    body: 'Long enough to have handled real claims across every line we place, and to have learned which underwriters perform under pressure.',
  },
  {
    number: '02',
    title: 'Licensed and regulated by the IRA',
    body: 'We operate under the Insurance Act and IRA licensing, with annual renewal, premium-handling discipline and a documented complaints procedure.',
  },
  {
    number: '03',
    title: 'Access to Kenya’s leading underwriters',
    body: 'A broad panel means genuine comparison. We are not obliged to place your risk anywhere in particular, so we can place it well.',
  },
  {
    number: '04',
    title: 'Competitive premiums, uncompromised service',
    body: 'We negotiate on price, but we never trade away cover the client will need. Where a cheaper quote is materially narrower, we show you exactly where.',
  },
  {
    number: '05',
    title: 'Full support from setup to claim resolution',
    body: 'One relationship, end to end. The person who advised on your cover is the person who helps you claim on it.',
  },
]

export interface ProductLine {
  id: string
  name: string
  strapline: string
  summary: string
  /** What the policy covers, in the profile's own bullets. */
  covers: string[]
  /** Who the profile says it suits. */
  suits: string
  /** The adviser's note: the honest warning the profile gives. */
  adviserNote: string
}

/** The six core lines, from "The GoldOak portfolio" and the pages that follow. */
export const productLines: ProductLine[] = [
  {
    id: 'medical',
    name: 'Medical insurance',
    strapline: 'Inpatient · Outpatient · Maternity · Dental · Optical',
    summary: 'Individual, family and corporate schemes with local and regional options.',
    covers: [
      'Inpatient cover — hospital accommodation, surgery, consultants and prescribed treatment up to the chosen limit.',
      'Outpatient cover — consultations, diagnostics, prescribed drugs and specialist referrals.',
      'Maternity — antenatal care, delivery and postnatal cover, subject to the waiting period.',
      'Dental and optical within the plan sub-limits.',
      'Access to a panel of accredited hospitals and clinics nationwide.',
    ],
    suits: 'Families wanting predictable healthcare costs, self-employed professionals without employer cover, and businesses using medical benefits to attract and retain staff.',
    adviserNote:
      'Three numbers decide whether a medical policy works: the inpatient limit, the outpatient limit, and the waiting periods. A low premium usually means one of those three has been cut. We will show you which one before you commit.',
  },
  {
    id: 'life',
    name: 'Life assurance and education plans',
    strapline: 'Whole life · Term · Education · Income protection',
    summary: 'Protection and savings-linked products, plus future finance guidance.',
    covers: [
      'Term life — a defined sum assured over a fixed period; the cheapest way to buy a large death benefit.',
      'Whole life — lifelong cover with a savings element that builds cash value over time.',
      'Education plans — a disciplined savings vehicle that continues to fund school fees if the parent dies or is disabled.',
      'Income protection — a monthly benefit if illness or injury stops you earning.',
      'Credit life — settles an outstanding loan on death or permanent disability.',
    ],
    suits: 'Anyone with dependants, a mortgage or a business loan; parents planning for school and university fees; business partners protecting each other against the loss of a key person.',
    adviserNote:
      'Do not confuse protection with investment. If your priority is that your family is financially secure, buy term cover with a serious sum assured first. Savings-linked products have their place, but they buy less protection per shilling.',
  },
  {
    id: 'motor',
    name: 'Motor insurance',
    strapline: 'Private · Commercial · PSV',
    summary: 'Comprehensive and third-party cover for personal and fleet exposures.',
    covers: [
      'Comprehensive — accidental damage to your own vehicle, fire, theft and third-party liability.',
      'Third-party only — the statutory minimum, covering injury and damage you cause to others.',
      'Third-party fire and theft — the statutory cover plus loss of your own vehicle to fire or theft.',
      'Commercial motor — own goods and general cartage vehicles.',
      'PSV — matatus, buses, taxis and ride-hailing vehicles, with statutory passenger liability.',
      'Fleet arrangements with consolidated renewal dates and negotiated rates.',
    ],
    suits: 'Private owners, businesses running delivery or staff vehicles, PSV operators meeting statutory requirements, and fleet managers seeking a single renewal cycle.',
    adviserNote:
      'Two things quietly void motor claims: driving outside the declared use, and an unlicensed or unauthorised driver. If your vehicle’s use changes, tell us the same week. The endorsement costs far less than a declined claim.',
  },
  {
    id: 'property',
    name: 'Property and general insurance',
    strapline: 'Home · Fire · Theft · All risks',
    summary: 'Domestic package, fire and perils, burglary and specified-item cover.',
    covers: [
      'Fire and perils — fire, lightning, explosion, and named additional perils including flood and storm.',
      'Burglary and theft — forcible entry to premises, with stock and contents cover.',
      'Domestic package — buildings, contents, all-risks items, domestic staff and owner’s liability in one policy.',
      'All risks — specified high-value portable items covered anywhere.',
      'Business interruption — loss of gross profit and standing charges while you cannot trade.',
    ],
    suits: 'Homeowners and landlords, tenants insuring contents, retailers and wholesalers holding stock, and any business whose premises are essential to trading.',
    adviserNote:
      'Underinsurance is the trap. If your buildings are insured for half their rebuilding cost, the average clause allows the insurer to pay half of even a small claim. We recommend a valuation review at least every three years.',
  },
  {
    id: 'group',
    name: 'Group and corporate insurance',
    strapline: 'Group health · Group life · WIBA · Pension',
    summary: 'Employee benefit programmes designed, placed and administered end to end.',
    covers: [
      'Group medical — inpatient and outpatient schemes with staff, spouse and dependant tiers.',
      'Group life — a multiple of salary payable to a member’s beneficiaries on death.',
      'WIBA — statutory cover for work-related injury, illness and death under the Work Injury Benefits Act.',
      'Group personal accident — 24-hour cover extending beyond working hours.',
      'Pension and retirement schemes — umbrella and standalone arrangements.',
    ],
    suits: 'Employers of any size with statutory WIBA obligations, growing companies formalising benefits, SACCOs protecting member loan books, and NGOs meeting donor requirements.',
    adviserNote:
      'WIBA is not optional and it is not covered by a general liability policy. Group medical renewal pricing is driven by your own claims experience, so scheme design and staff education directly affect next year’s premium.',
  },
  {
    id: 'executive',
    name: 'Executive and high-net-worth covers',
    strapline: 'Bespoke portfolio cover',
    summary: 'Consolidated, discreet arrangements for high-net-worth individuals.',
    covers: [
      'Consolidated household cover across multiple properties.',
      'High-value and prestige motor, including collections and limited-use vehicles.',
      'Fine art, jewellery, watches and collectibles on an agreed-value basis.',
      'Worldwide all-risks cover for portable valuables.',
      'Personal and family liability at meaningful limits.',
      'International private medical cover with global treatment access.',
    ],
    suits: 'Business owners, senior executives, professionals with significant personal assets, and families holding property or investments across more than one jurisdiction.',
    adviserNote:
      'At this level, discretion and speed matter as much as limits. We restrict handling of private client files to a single named adviser and agree in advance who may be contacted about a claim.',
  },
]

/** Specialist lines the profile lists beyond the core six. */
export const specialistLines: { name: string; body: string }[] = [
  { name: 'Public liability', body: 'Third-party injury and property damage arising from your premises or operations.' },
  { name: 'Professional indemnity', body: 'Defence costs and damages for professional advice or service that causes a client loss.' },
  { name: 'Directors’ & officers’', body: 'Personal liability protection for board members and senior management.' },
  { name: 'Goods in transit', body: 'Stock and equipment while being moved by road within Kenya or across the region.' },
  { name: 'Marine cargo', body: 'Import and export consignments, single-transit or open-cover arrangements.' },
  { name: 'Contractors’ all risks', body: 'Works, plant and third-party exposure on construction and installation projects.' },
  { name: 'Money & fidelity guarantee', body: 'Cash in transit and on premises; employee dishonesty and theft by staff.' },
  { name: 'Machinery & electronic equipment', body: 'Breakdown, damage and consequential loss for plant, servers and specialised equipment.' },
  { name: 'Political violence & terrorism', body: 'An extension increasingly required by lenders and landlords.' },
  { name: 'Travel insurance', body: 'Medical emergencies, evacuation, delay and baggage for business and leisure travel.' },
  { name: 'Personal accident', body: 'Lump-sum and medical benefits following accidental injury, individually or on a group basis.' },
  { name: 'Cyber liability', body: 'Breach response, business interruption and third-party liability following a cyber incident.' },
]

/** The five-stage placement process, each with its stated output. */
export const howWeWork: { step: number; title: string; timing: string; body: string; output: string }[] = [
  {
    step: 1,
    title: 'Consultation & needs assessment',
    timing: '1–3 days',
    body: 'We map what you actually need to protect — assets, liabilities, people and income. Existing policies are reviewed for gaps and duplication.',
    output: 'A written summary of exposures and cover objectives.',
  },
  {
    step: 2,
    title: 'Custom proposal & competitive quotes',
    timing: '3–5 days',
    body: 'We approach the underwriters best suited to your risk and return with comparable terms — premium, limits, excesses and the exclusions that matter.',
    output: 'A comparison schedule with our recommendation stated and reasoned.',
  },
  {
    step: 3,
    title: 'Guidance on selection',
    timing: 'Same week',
    body: 'We walk you through the options and answer the awkward questions. You decide with a clear view of what is covered and what is not.',
    output: 'A signed proposal form and confirmed instruction to place.',
  },
  {
    step: 4,
    title: 'Onboarding & activation',
    timing: '1–3 days',
    body: 'We place the risk, confirm cover, and deliver your policy documents, schedule and certificates.',
    output: 'Policy documents, certificate and a client service pack.',
  },
  {
    step: 5,
    title: 'Ongoing client support',
    timing: 'Continuous',
    body: 'Endorsements, additions, queries and claims run through your named contact. We initiate the renewal review well before expiry.',
    output: 'Renewal review at 30 days to expiry; annual portfolio check.',
  },
]

/** The claims journey: five steps, in the profile's words. */
export const claimsSteps: { title: string; body: string }[] = [
  { title: 'Notify', body: 'Tell us as soon as you become aware. Late notification is one of the most common reasons good claims fail.' },
  { title: 'Document', body: 'We assist with documentation and tell you precisely which forms and proofs the insurer will require.' },
  { title: 'Engage', body: 'We engage underwriters and appointed claims assessors promptly, and chase them when they go quiet.' },
  { title: 'Update', body: 'We provide regular updates throughout the process, including when there is no news to give.' },
  { title: 'Resolve', body: 'We follow through until your compensation is disbursed — and we challenge a decision where we believe it is wrong.' },
]

/** The service charter: commitments and the standard held to. */
export const serviceCharter: { commitment: string; standard: string }[] = [
  { commitment: 'Enquiry acknowledged', standard: 'Within 4 working hours' },
  { commitment: 'Quotation issued', standard: 'Within 3 working days of complete information' },
  { commitment: 'Policy documents delivered', standard: 'Within 3 working days of cover confirmation' },
  { commitment: 'Endorsement processed', standard: 'Within 2 working days of instruction' },
  { commitment: 'Claim acknowledged', standard: 'Within 1 working day of notification' },
  { commitment: 'Claim registered with underwriter', standard: 'Within 1 working day of documentation' },
  { commitment: 'Claim status update', standard: 'At least every 7 days until settlement' },
  { commitment: 'Renewal review initiated', standard: '30 days before policy expiry' },
  { commitment: 'Complaint acknowledged', standard: 'Within 2 working days' },
  { commitment: 'Complaint resolved or escalated', standard: 'Within 14 working days' },
]

/** Sectors the profile says the agency understands well. */
export const sectors: { name: string; body: string }[] = [
  { name: 'Transport & logistics', body: 'PSV and commercial fleets, goods in transit, driver personal accident, statutory compliance.' },
  { name: 'Retail & wholesale', body: 'Stock, fire and perils, burglary, money, public liability, employee cover under WIBA.' },
  { name: 'Construction & real estate', body: 'Contractors’ all risks, plant, works liability, landlord and tenant property programmes.' },
  { name: 'Professional services', body: 'Professional indemnity, D&O, office contents, group medical for small teams.' },
  { name: 'Manufacturing & light industry', body: 'Machinery breakdown, business interruption, fire, marine cargo on inputs.' },
  { name: 'Hospitality & food service', body: 'Property, public liability, food safety exposure, seasonal staff cover.' },
  { name: 'Education & institutions', body: 'Buildings, personal accident for learners, staff medical and group life, liability.' },
  { name: 'Agriculture & agribusiness', body: 'Assets, produce in transit, farm machinery, workforce cover, weather-linked options.' },
  { name: 'SACCOs & financial services', body: 'Fidelity guarantee, money, cyber, D&O, credit life for member lending.' },
  { name: 'Households & individuals', body: 'Domestic package, motor, medical, life, education and retirement planning.' },
]

/** What a new client is asked for, by type. */
export const onboardingDocuments: { who: string; needs: string }[] = [
  { who: 'Individuals', needs: 'National ID or passport, KRA PIN, and contact details.' },
  { who: 'Businesses', needs: 'Certificate of incorporation, CR12, KRA PIN and directors’ IDs.' },
  { who: 'Motor', needs: 'Logbook, valuation report where required, and driver details.' },
  { who: 'Property', needs: 'Schedule of assets with values, and location details.' },
  { who: 'Medical', needs: 'Member list with dates of birth and any declared conditions.' },
  { who: 'Group schemes', needs: 'Staff census, payroll band and current scheme documents.' },
]

/** How the agency chooses where to place a risk. */
export const placementCriteria: { name: string; body: string }[] = [
  { name: 'Financial strength', body: 'Claims-paying ability and solvency position, not brand familiarity.' },
  { name: 'Claims record', body: 'How the insurer has actually behaved on our clients’ past claims.' },
  { name: 'Policy wording', body: 'Breadth of cover and the exclusions that would bite in your specific case.' },
  { name: 'Price', body: 'Considered last, and always against the cover it buys.' },
]

/**
 * Facts the company profile leaves as placeholders. They are deliberately not
 * invented; the website omits them and the assistant says it does not have
 * them rather than guessing.
 */
export const PENDING: { field: string; note: string }[] = [
  { field: 'IRA licence number', note: 'Marked "[ insert licence number ]" in the profile. Shown on quotations and on request once supplied.' },
  { field: 'Company registration number', note: 'Marked "[ insert company registration ]" in the profile.' },
  { field: 'KRA PIN', note: 'Marked "[ insert PIN ]" in the profile.' },
  { field: 'Principal Officer name', note: 'The foreword is signed "[ Name ], Principal Officer & Managing Director".' },
]

/** The legal footer the profile itself carries. */
export const legalNote =
  'This information is general. It does not constitute an offer of insurance and does not vary the terms of any policy. Cover is subject to underwriter acceptance and to the full policy wording.'
