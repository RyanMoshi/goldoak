/**
 * The "Know your cover" explainers.
 *
 * Extracted verbatim from GoldOak’s own website copy, so the site, the
 * assistant and WhatsApp all answer these questions the same way. Editing an
 * entry here changes it everywhere.
 */

export interface Insight {
  slug: string
  title: string
  /** The one-line summary, used as the page description and in listings. */
  description: string
  /** The short answer, for when a sentence will do. */
  short: string
  body: string[]
}

export const insights: Insight[] = [
  {
    slug: "what-does-excess-actually-mean",
    title: "What does 'excess' actually mean?",
    description: "Always ask what your excess is before you compare two premiums.",
    short: "Always ask what your excess is before you compare two premiums.",
    body: [
      "The excess is the first part of any claim that you pay yourself. If your excess is KSh 20,000 and the repair costs KSh 90,000, the insurer pays 70,000. A lower premium usually means a higher excess — the cost has been moved, not removed.",
    ],
  },
  {
    slug: "comprehensive-or-third-party",
    title: "Comprehensive or third party?",
    description: "If you could not afford to replace your car tomorrow, third party is not enough.",
    short: "If you could not afford to replace your car tomorrow, third party is not enough.",
    body: [
      "Third party covers the damage and injury you cause to other people. It is the legal minimum and it pays you nothing for your own vehicle. Comprehensive adds your own damage, fire and theft.",
      "&larr; What does 'excess' actually mean?Why a small claim can be paid at half ",
    ],
  },
  {
    slug: "why-a-small-claim-can-be-paid-at-half",
    title: "Why a small claim can be paid at half",
    description: "Review your sums insured every three years, and after any major improvement.",
    short: "Review your sums insured every three years, and after any major improvement.",
    body: [
      "If you insure a building for 5 million when rebuilding it would cost 10 million, you are insured for half its value. The average clause then lets the insurer pay half of every claim — including small ones.",
      "&larr; Comprehensive or third party?What is WIBA, and who needs it? ",
    ],
  },
  {
    slug: "what-is-wiba-and-who-needs-it",
    title: "What is WIBA, and who needs it?",
    description: "If you employ anyone — including domestic staff — WIBA applies to you.",
    short: "If you employ anyone — including domestic staff — WIBA applies to you.",
    body: [
      "The Work Injury Benefits Act requires every employer in Kenya to cover employees for injury, illness or death arising from work. It is a statutory duty, not a commercial choice, and a general liability policy does not include it.",
      "&larr; Why a small claim can be paid at halfWaiting periods on medical cover ",
    ],
  },
  {
    slug: "waiting-periods-on-medical-cover",
    title: "Waiting periods on medical cover",
    description: "Buy medical cover before you need it, not when you need it.",
    short: "Buy medical cover before you need it, not when you need it.",
    body: [
      "Most medical policies will not pay for illness in the first 30 days, and maternity usually carries a 10 to 12 month wait. These periods reset if you switch insurer, which is why moving a scheme mid-pregnancy rarely works.",
      "&larr; What is WIBA, and who needs it?Inpatient and outpatient are different budgets ",
    ],
  },
  {
    slug: "inpatient-and-outpatient-are-different-budgets",
    title: "Inpatient and outpatient are different budgets",
    description: "Three numbers matter: inpatient limit, outpatient limit, and the sub-limits.",
    short: "Three numbers matter: inpatient limit, outpatient limit, and the sub-limits.",
    body: [
      "Your inpatient limit covers hospital admission and surgery. Outpatient covers consultations, tests and drugs — and it has its own separate limit, usually much smaller. Dental and optical sit inside that outpatient limit.",
      "&larr; Waiting periods on medical coverThe fastest way to lose a claim ",
    ],
  },
  {
    slug: "the-fastest-way-to-lose-a-claim",
    title: "The fastest way to lose a claim",
    description: "Tell your intermediary everything. Awkward facts cost less than declined claims.",
    short: "Tell your intermediary everything. Awkward facts cost less than declined claims.",
    body: [
      "Non-disclosure. If you leave out a health condition, a past claim, a modification or the real use of a vehicle, the insurer can decline the claim and cancel the policy — even years later, and even if the loss was unrelated.",
      "&larr; Inpatient and outpatient are different budgetsWhat does an intermediary actually do? ",
    ],
  },
  {
    slug: "what-does-an-intermediary-actually-do",
    title: "What does an intermediary actually do?",
    description: "You are not paying extra to have someone on your side. Use one.",
    short: "You are not paying extra to have someone on your side. Use one.",
    body: [
      "An agency sits between you and the insurer. We assess the risk, take it to the insurers we are appointed by, compare their terms, and then run the claim with you. Our commission is paid by the insurer, so our advice costs you nothing.",
      "&larr; The fastest way to lose a claimTerm life or whole life? ",
    ],
  },
  {
    slug: "term-life-or-whole-life",
    title: "Term life or whole life?",
    description: "If your family's security is the priority, buy the protection first.",
    short: "If your family's security is the priority, buy the protection first.",
    body: [
      "Term life pays a lump sum if you die within a set period. It is pure protection and it buys the most cover per shilling. Whole life covers you for life and builds a cash value, but you get far less cover for the same premium.",
      "&larr; What does an intermediary actually do?Declared use on motor cover ",
    ],
  },
  {
    slug: "declared-use-on-motor-cover",
    title: "Declared use on motor cover",
    description: "If how you use your vehicle changes, tell us the same week. The endorsement is cheap.",
    short: "If how you use your vehicle changes, tell us the same week. The endorsement is cheap.",
    body: [
      "Your policy states how the vehicle is used — private, commercial or PSV. If you start doing deliveries or ride-hailing on a private policy, you are outside the declared use, and a claim can be declined on that basis alone.",
      "&larr; Term life or whole life?What you need to make a claim ",
    ],
  },
  {
    slug: "what-you-need-to-make-a-claim",
    title: "What you need to make a claim",
    description: "Notify first, gather second. Late notification sinks otherwise good claims.",
    short: "Notify first, gather second. Late notification sinks otherwise good claims.",
    body: [
      "A completed and signed claim form, proof of the loss, and proof of value. That usually means photographs, a police abstract where there was theft, fire or injury, and invoices, valuations or medical reports.",
      "&larr; Declared use on motor coverWhy your premium went up ",
    ],
  },
  {
    slug: "why-your-premium-went-up",
    title: "Why your premium went up",
    description: "A rise is negotiable. Ask what drove it, and let us test the market.",
    short: "A rise is negotiable. Ask what drove it, and let us test the market.",
    body: [
      "Motor premiums follow the vehicle's current value and your claims history. Group medical renewal pricing follows your own scheme's claims experience. Property follows sums insured and the insurer's view of the risk.",
      "&larr; What you need to make a claimWhat is a no-claims discount? ",
    ],
  },
  {
    slug: "what-is-a-no-claims-discount",
    title: "What is a no-claims discount?",
    description: "Before claiming a minor knock, ask us what it will cost you at renewal.",
    short: "Before claiming a minor knock, ask us what it will cost you at renewal.",
    body: [
      "A reduction on your motor premium for each consecutive year you do not claim. It builds slowly and is usually lost entirely after one claim — which is why a very small claim is sometimes not worth making.",
      "&larr; Why your premium went upSub-limits: the number people miss ",
    ],
  },
  {
    slug: "sub-limits-the-number-people-miss",
    title: "Sub-limits: the number people miss",
    description: "Read the sub-limits, not just the headline figure.",
    short: "Read the sub-limits, not just the headline figure.",
    body: [
      "Your headline limit is not one pot of money. Inside it sit caps on specific benefits — dental, optical, a single item, one hospital bed night. You can exhaust a sub-limit while most of the main limit is untouched.",
      "&larr; What is a no-claims discount?What is business interruption cover? ",
    ],
  },
  {
    slug: "what-is-business-interruption-cover",
    title: "What is business interruption cover?",
    description: "Ask yourself how many months you could survive with no revenue.",
    short: "Ask yourself how many months you could survive with no revenue.",
    body: [
      "Property insurance rebuilds your premises. Business interruption replaces the profit you lose while you cannot trade — rent, salaries, standing costs. Most businesses that fail after a fire were insured for the building only.",
      "&larr; Sub-limits: the number people missPersonal accident is not medical cover ",
    ],
  },
  {
    slug: "personal-accident-is-not-medical-cover",
    title: "Personal accident is not medical cover",
    description: "One pays the hospital. The other pays your family.",
    short: "One pays the hospital. The other pays your family.",
    body: [
      "Medical cover pays for treatment. Personal accident pays a lump sum for death or permanent disability caused by an accident, plus limited medical expenses. They answer different questions and most people need both.",
      "&larr; What is business interruption cover?Never pay a premium to a personal account ",
    ],
  },
  {
    slug: "never-pay-a-premium-to-a-personal-account",
    title: "Never pay a premium to a personal account",
    description: "No receipt, no cover. Insist on both, from us or from anyone else.",
    short: "No receipt, no cover. Insist on both, from us or from anyone else.",
    body: [
      "Premiums should be paid to an official agency or insurer account, and you should receive a receipt every time. Payments to an individual's personal number or account are the most common route to a fake policy.",
      "&larr; Personal accident is not medical coverWhat is professional indemnity? ",
    ],
  },
  {
    slug: "what-is-professional-indemnity",
    title: "What is professional indemnity?",
    description: "If clients rely on your judgement, you carry this exposure already.",
    short: "If clients rely on your judgement, you carry this exposure already.",
    body: [
      "It covers the cost of defending and settling a claim that your professional advice or service caused a client financial loss. Consultants, accountants, engineers, medics, lawyers and IT firms are the usual buyers.",
      "&larr; Never pay a premium to a personal accountWhat happens if you pay late? ",
    ],
  },
  {
    slug: "what-happens-if-you-pay-late",
    title: "What happens if you pay late?",
    description: "If cash flow is tight, talk to us before the due date, not after a loss.",
    short: "If cash flow is tight, talk to us before the due date, not after a loss.",
    body: [
      "Cover can be suspended or cancelled for non-payment, and an insurer is entitled to decline a claim that occurs during an unpaid period — even if you pay afterwards.",
      "&larr; What is professional indemnity?When should you review your cover? ",
    ],
  },
  {
    slug: "when-should-you-review-your-cover",
    title: "When should you review your cover?",
    description: "Cover bought three years ago was designed for a life you may no longer have.",
    short: "Cover bought three years ago was designed for a life you may no longer have.",
    body: [
      "At renewal, and any time your circumstances change: a new vehicle, a new property, a renovation, more staff, a new child, a bigger loan, or a change in how you use an insured asset.",
    ],
  },
]

export function insightBySlug(slug: string): Insight | undefined {
  return insights.find((i) => i.slug === slug)
}

/** Titles and short answers only — small enough to sit in every assistant prompt. */
export function insightDigest(): string {
  return insights.map((i) => `${i.title} — ${i.short || i.description}`).join(String.fromCharCode(10))
}
