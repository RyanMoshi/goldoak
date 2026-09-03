export interface ProcessStage {
  number: number
  title: string
  description: string
  output: string
}

export const processStages: ProcessStage[] = [
  {
    number: 1,
    title: 'Understand',
    description:
      'We look at your circumstances, assets, activities, people and the risks that sit behind them before discussing any product.',
    output: 'Client risk profile — a completed fact-find with a written list of identified exposures and current cover.',
  },
  {
    number: 2,
    title: 'Solve',
    description:
      'We identify the insurance solutions that genuinely address what we found, and say plainly where cover is not the right answer.',
    output: 'Risk and recommendation summary — exposure, our recommendation, why, and what happens if left uninsured.',
  },
  {
    number: 3,
    title: 'Compare',
    description:
      'We obtain terms from several insurers where it is useful to do so, and set the options side by side — cover, exclusions, limits and price.',
    output: 'Comparison schedule — options presented on identical terms with a stated recommendation.',
  },
  {
    number: 4,
    title: 'Implement',
    description:
      'Once you choose, we handle documentation, payment, issuance and onboarding so the policy is in force without loose ends.',
    output: 'Onboarding pack — policy documents, schedule, plain-language summary, claims instructions, and contacts.',
  },
  {
    number: 5,
    title: 'Support',
    description:
      'We remain available through the policy year for changes, additions, questions and day-to-day service.',
    output: 'Service log — every interaction dated and recorded against the client file.',
  },
  {
    number: 6,
    title: 'Claims',
    description:
      'We guide you through notification, documentation, follow-up and settlement. This is the stage that tests the advice, so we take it seriously.',
    output: 'Claims record — outcome tracked and fed back into placement decisions.',
  },
  {
    number: 7,
    title: 'Review & Renew',
    description:
      'We check in during the year and review cover at renewal, because what you were insuring twelve months ago has usually changed.',
    output: 'Review report and renewal recommendation — issued at least 45 days before expiry.',
  },
]

export const processPrinciples = [
  {
    title: 'Risk Before Product',
    description:
      'No recommendation is made before the exposure is understood and written down. A quotation request that arrives without a risk picture is incomplete work.',
  },
  {
    title: 'Appropriate Over Cheap',
    description:
      'The objective is the most suitable cover for the client\'s circumstances. Price is one variable among cover, limits, exclusions, excess, and the insurer\'s ability to pay and to service.',
  },
  {
    title: 'Options, Not Assumptions',
    description:
      'Where the market allows, the client sees more than one option and sees them compared on the same terms. We never assume which insurer wins.',
  },
  {
    title: 'The Relationship Outlives the Policy',
    description:
      'Issuing the policy is the middle of the job, not the end. Service, claims and review are the product.',
  },
]
