export interface SolutionCategory {
  id: string
  name: string
  description: string
  segments: string[]
  solutions: string[]
}

export const solutionCategories: SolutionCategory[] = [
  {
    id: 'health-life',
    name: 'Health & Life',
    description: 'Protection for health, life, and financial security across personal and group arrangements.',
    segments: ['Individual', 'SME', 'Corporate'],
    solutions: [
      'Individual and family medical',
      'Group medical',
      'Group life',
      'Last expense',
      'Credit life',
      'Education and savings-linked life',
      'Retirement and pension arrangements',
    ],
  },
  {
    id: 'motor',
    name: 'Motor',
    description: 'Cover for vehicles — from private cars to commercial fleets and specialist motor risks.',
    segments: ['Individual', 'SME', 'Corporate'],
    solutions: [
      'Private motor',
      'Commercial vehicle',
      'Public service vehicle (PSV)',
      'Fleet',
      'Motor trade',
    ],
  },
  {
    id: 'property-assets',
    name: 'Property & Assets',
    description: 'Protection for physical assets, premises, stock, equipment, and goods in transit.',
    segments: ['SME', 'Corporate'],
    solutions: [
      'Fire and perils',
      'Burglary',
      'All risks',
      'Electronic equipment',
      'Machinery breakdown',
      'Goods in transit',
      'Marine cargo',
      'Contractors all risks',
      'Business interruption',
    ],
  },
  {
    id: 'liability',
    name: 'Liability',
    description: 'Cover for legal obligations and exposure to claims from third parties, employees, or professional services.',
    segments: ['SME', 'Corporate'],
    solutions: [
      'Public liability',
      'Product liability',
      'Professional indemnity',
      'Directors and officers',
      'Employers liability',
    ],
  },
  {
    id: 'people-statutory',
    name: 'People & Statutory',
    description: 'Statutory and employee-focused cover required for businesses with staff.',
    segments: ['SME', 'Corporate'],
    solutions: [
      'Work Injury Benefits Act (WIBA)',
      'Group personal accident',
      'Employee benefits programmes',
    ],
  },
  {
    id: 'personal-lines',
    name: 'Personal Lines',
    description: 'Cover for personal and household needs — home, travel, and individual protection.',
    segments: ['Individual', 'SME'],
    solutions: [
      'Domestic package and home',
      'Travel',
      'Personal accident',
      'Householder and all risks',
    ],
  },
  {
    id: 'specialty',
    name: 'Specialty',
    description: 'Specialist risks that require specific insurer appetite and tailored terms.',
    segments: ['SME', 'Corporate'],
    solutions: [
      'Political violence and terrorism',
      'Cyber',
      'Fidelity guarantee',
      'Bonds and guarantees',
      'Agriculture',
    ],
  },
]

export interface SolutionDetail {
  id: string
  name: string
  category: string
  whatItIs: string
  whoNeedsIt: string
  whatItProtects: string[]
  keyConsiderations: string[]
  informationNeeded: string[]
  howGoldOakHelps: string
}

export const solutionDetails: SolutionDetail[] = [
  {
    id: 'individual-medical',
    name: 'Individual & Family Medical',
    category: 'health-life',
    whatItIs: 'Medical insurance that covers the cost of healthcare for individuals and families, including inpatient, outpatient, and specialist treatment.',
    whoNeedsIt: 'Anyone who wants to protect themselves and their family from unexpected medical costs. Particularly important for those without employer-provided medical cover.',
    whatItProtects: [
      'Hospital admission and surgery',
      'Outpatient treatment and consultations',
      'Maternity and newborn care',
      'Specialist and dental treatment',
      'Emergency evacuation',
    ],
    keyConsiderations: [
      'Waiting periods for certain conditions',
      'Pre-existing condition exclusions',
      'Annual limits and sub-limits',
      'Hospital network restrictions',
      'Excess and co-payment amounts',
    ],
    informationNeeded: [
      'Ages of all members',
      'Pre-existing medical conditions',
      'Preferred hospital network',
      'Budget range',
      'Current cover details if any',
    ],
    howGoldOakHelps: 'We compare medical plans from multiple insurers, explain the differences in cover and exclusions, and help you choose a plan that matches your health needs and budget — not just the cheapest option.',
  },
  {
    id: 'group-medical',
    name: 'Group Medical',
    category: 'health-life',
    whatItIs: 'Employer-provided medical insurance covering employees and often their dependants. A key component of employee benefits.',
    whoNeedsIt: 'Businesses with staff who want to attract and retain talent while meeting their duty of care.',
    whatItProtects: [
      'Employee inpatient and outpatient care',
      'Dependant cover',
      'Maternity benefits',
      'Dental and optical',
      'Wellness and preventive care',
    ],
    keyConsiderations: [
      'Number of employees and dependants',
      'Pre-existing condition loading',
      'Grace periods and waiting periods',
      'Hospital network adequacy',
      'Cost-sharing arrangements',
    ],
    informationNeeded: [
      'Number of employees',
      'Employee demographics (ages, locations)',
      'Dependant requirements',
      'Current cover details',
      'Budget allocation per employee',
    ],
    howGoldOakHelps: 'We design group medical programmes that balance adequate cover with sustainable cost, negotiate terms with insurers, and manage the scheme through member changes, claims, and annual renewal.',
  },
  {
    id: 'comprehensive-motor',
    name: 'Comprehensive Motor',
    category: 'motor',
    whatItIs: 'Full motor cover protecting against damage to your own vehicle, third-party liability, and theft.',
    whoNeedsIt: 'Vehicle owners who want complete protection for their car or van, particularly newer or higher-value vehicles.',
    whatItProtects: [
      'Accidental damage to your vehicle',
      'Third-party property damage',
      'Third-party bodily injury',
      'Theft and attempted theft',
      'Fire damage',
      'Windscreen damage',
      'Emergency roadside assistance',
    ],
    keyConsiderations: [
      'Excess amounts (voluntary and compulsory)',
      'Market value vs agreed value',
      'Geographic limitations',
      'Driver age and experience restrictions',
      'Modification declarations',
    ],
    informationNeeded: [
      'Vehicle registration and details',
      'Driver licence information',
      'Previous claims history',
      'Parking and security arrangements',
      'Intended use (personal, business, commercial)',
    ],
    howGoldOakHelps: 'We obtain and compare comprehensive motor quotes from multiple insurers, explain the differences in cover and excess structures, and handle claims when incidents occur.',
  },
  {
    id: 'property-fire',
    name: 'Fire & Perils',
    category: 'property-assets',
    whatItIs: 'Cover for buildings, stock, and contents against fire, lightning, explosion, and related perils.',
    whoNeedsIt: 'Property owners, tenants with insurable interest, and businesses with premises or stock.',
    whatItProtects: [
      'Fire and lightning damage',
      'Explosion damage',
      'Storm and flood (where included)',
      'Impact damage',
      'Riots and malicious damage',
      'Building and contents replacement',
    ],
    keyConsiderations: [
      'Sum insured accuracy — underinsurance risks',
      'Excess amounts',
      'Exclusions for wear and tear',
      'Business interruption add-on',
      'Security and fire prevention requirements',
    ],
    informationNeeded: [
      'Property type and construction details',
      'Sum insured or replacement value',
      'Occupancy details',
      'Security arrangements',
      'Previous claims history',
    ],
    howGoldOakHelps: 'We help determine appropriate sums insured, compare fire and perils cover across insurers, and ensure your property is adequately protected without over- or under-insuring.',
  },
  {
    id: 'public-liability',
    name: 'Public Liability',
    category: 'liability',
    whatItIs: 'Protection against claims from third parties for bodily injury or property damage arising from your business activities.',
    whoNeedsIt: 'Any business that interacts with the public, has premises visited by customers, or carries out work on third-party property.',
    whatItProtects: [
      'Third-party bodily injury claims',
      'Third-party property damage claims',
      'Legal defence costs',
      'Settlement and compensation amounts',
      'Products liability (if included)',
    ],
    keyConsiderations: [
      'Limit of indemnity appropriate to your exposure',
      'Exclusions for professional advice',
      'Territorial limits',
      'Contractual liability requirements',
      'Excess amounts',
    ],
    informationNeeded: [
      'Nature of business activities',
      'Annual turnover',
      'Premises details',
      'Number of public interactions',
      'Contractual liability requirements',
    ],
    howGoldOakHelps: 'We assess your public liability exposure, recommend appropriate limits of indemnity, compare insurer terms, and ensure your cover matches your actual risk — not just a standard policy.',
  },
  {
    id: 'wiba',
    name: 'Work Injury Benefits Act (WIBA)',
    category: 'people-statutory',
    whatItIs: 'Statutory cover required under Kenyan law for employees who suffer work-related injuries or occupational diseases.',
    whoNeedsIt: 'All employers in Kenya with one or more employees. This is a legal requirement.',
    whatItProtects: [
      'Medical expenses for work injuries',
      'Temporary disability benefits',
      'Permanent disability benefits',
      'Death benefits to dependants',
      'Funeral expenses',
    ],
    keyConsiderations: [
      'Correct employee count and payroll declaration',
      'Occupational disease classification',
      'Compliance with WIBA Act requirements',
      'Reporting obligations',
      'Penalties for non-compliance',
    ],
    informationNeeded: [
      'Number of employees',
      'Employee payroll details',
      'Nature of work and risk classification',
      'Previous WIBA claims',
      'Current WIBA certificate details',
    ],
    howGoldOakHelps: 'We ensure your WIBA cover meets statutory requirements, obtain competitive terms, manage certificate issuance, and assist with claims — so you remain compliant and your employees are protected.',
  },
]
