# BUSINESS PLAN — Super Agent (v3)

### The workstation for advice-led insurance intermediaries in Kenya

Prepared by: Abigae Amina · Admission No. 100485
BBIT4202 — Innovations and Entrepreneurship · Strathmore University
Version 3.0 · September 2026 (supersedes April 2026 v1)

**What changed from v1:** market figures corrected to IRA 2024 data; "no direct competitor" removed and replaced with a positioning against Lami, mTek and Kakbima; MVP redesigned from real-time API quoting to a structured request-and-comparison workflow that works with every insurer today; financials rebuilt to a single reconciled model; lead-conversion commission removed pending licensing confirmation; GoldOak Insurance Agency named as design partner and first customer.

---

## 1. Executive Summary

**The problem.** Kenya's roughly 15,000 licensed agents and 237 brokers (IRA, 2024) still run placement by email, phone, WhatsApp and Excel. An adviser who does the job properly — understands the risk, approaches several insurers, compares terms, documents the advice, services the policy and supports the claim — spends more hours on administration than on advice. Clients discover exclusions at claim time. Renewals lapse. Nobody knows where the claim is.

**The solution.** Super Agent is a cloud, mobile-first workstation that turns a client conversation into a documented risk profile, a standardised quote request to any insurer, a normalised side-by-side comparison, a branded proposal, and a serviced policy with automatic renewals and a tracked claim. It works with every insurer from day one — by email and document capture now, by API as insurers become ready — so it does not depend on integrations that do not yet exist.

**The design partner.** GoldOak Insurance Agency Limited (IRA-licensed, Nairobi, est. 2020) runs all of its new business on Super Agent first. Every feature is built because GoldOak needed it that week.

**The market.** Gross written premium of about KSh 395 billion at 2.44% penetration (AKI, 2024). Serviceable market: an estimated 2,500–3,500 organised agencies and brokerages handling multi-insurer SME, group and property business. Year 1 obtainable: 25 paying seats; Year 2: 150; Year 3: 300–500.

**The model.** Agent and agency SaaS subscriptions (KSh 1,500–3,500 per seat; KSh 12,000 agency plan), setup services, and from Year 2 insurer data and integration services. No share of premium or commission until the licensing position is confirmed in writing.

**The ask.** KSh 1.45 million for twelve months (founder plus one contract engineer, legal, design, hosting, go-to-market), from a combination of founder capital, GoldOak commission contribution, incubator/grant funding and a small angel round (8–12% equity). Break-even at approximately 150 paying seats in Month 20–24, funded by a Year 2 raise pitched on evidence.

**Why now.** Fifteen thousand agents, near-universal smartphone and M-Pesa access, an IRA that is pushing digitisation and documentation, and a competitor set that has solved quoting but not advice.

---

## 2. Mission and Vision

**Mission.** To give Kenya's insurance advisers a workstation that removes the administration from good advice — so a documented needs assessment, a fair comparison and a serviced policy become the norm rather than the exception.

**Vision.** To be the operating infrastructure that advice-led insurance intermediaries across East Africa run on.

---

## 3. Business Model Canvas

**Customer segments.** (A) Organised agencies and small brokerages (2–20 staff) placing SME, group and property business — primary. (B) Individual agents in motor and medical — secondary, Year 2. (C) Insurers — data and integration customers, Year 2+. End clients benefit indirectly through proposal, wallet and claim links.

**Value propositions.** For agencies: same-day proposals; one client record; renewals that never lapse; a file that stands up at claim time; professional branded output. For insurers (later): complete standardised submissions; visibility of their own turnaround and hit-rate.

**Channels.** Founder-led sales through GoldOak's insurer and peer network; design-partner referrals; AKI/AIBK/IIK events; principal-focused content; WhatsApp community for users.

**Customer relationships.** Hands-on onboarding for agencies; in-app help; WhatsApp support line; quarterly user review with design partners.

**Revenue streams.** Seat subscriptions; agency plans; setup and template services; insurer dashboard and integration services (Year 2+). Excluded pending licensing: any premium-linked fees.

**Key resources.** GoldOak as live design environment; the product; insurer performance data; founder domain knowledge; compliance counsel.

**Key activities.** Build; use inside GoldOak; onboard agencies; maintain insurer registry; compliance; support.

**Key partnerships.** GoldOak Insurance Agency; compliance counsel; Strathmore iBiz Africa; hosting/SMS/M-Pesa providers; two industry advisers (a broker principal, an insurer BD manager); design-partner agencies.

**Cost structure.** Contract engineering; hosting and messaging; legal; go-to-market. Founder salary deferred.

---

## 4. Business and Industry Profile

**Industry.** The Insurance Regulatory Authority licenses insurers and intermediaries under the Insurance Act (Cap 487). IRA's 2024 data lists about 15,000 licensed agents and 237 brokers; AKI reports 2024 gross written premium of about KSh 395bn and penetration of 2.44% (2.41% in 2023). Medical and motor dominate general premium. Intermediaries remain the primary distribution channel and insurers publicly describe digital as an enhancement to agents rather than a replacement.

**Digitisation.** Insurer-side portals and apps are common; some insurtechs (Lami, mTek) offer agent quoting and issuance. The needs-assessment, comparison-with-reasoning, document, renewal and claims workflow remains largely manual across the intermediary base.

**Porter's Five Forces.**

| Force | Rating | Comment |
|---|---|---|
| New entrants | Medium | Software is easy; insurance-native workflow knowledge and a live agency are not |
| Supplier power (insurers) | Medium-high initially | They control data and integrations; falls as the platform accumulates submission and performance data |
| Buyer power (agencies) | Medium | Low switching cost at first; grows as history, documents and renewals accumulate in the file |
| Substitutes | High | Email, Excel, WhatsApp are free and familiar |
| Rivalry | Medium | Lami is funded and integrated; competes on quoting, not on advice workflow |

**Verdict.** Attractive for a focused, advice-workflow product that does not depend on insurer cooperation to start.

---

## 5. Product / Service Description

**Core product.** A cloud workstation with six connected modules: Client CRM and risk fact-find; Insurer registry; Quote request manager and comparison builder; Proposal generator; Policy register with renewal diary; Claims tracker and document management. Mobile-first web app for agents; link-based pages for clients (proposal, document upload, claim form; wallet with login in Phase 2).

**How a placement works.** Agent captures the client and runs the fact-find → system produces a risk profile → agent selects insurers from the registry (filtered by appetite) → system generates one standard request pack per insurer and sends it → responses are captured (email-in, PDF, manual) into a normalised comparison → adviser tags cheapest / best value / broadest / recommended and records reasoning → branded proposal sent by WhatsApp link → client accepts, uploads documents → policy recorded; renewal diary and claims tracker take over.

**Roadmap.** Phase 2: client wallet, M-Pesa, e-signature, PDF extraction, WhatsApp templates, endorsement workflow. Phase 3: first insurer integrations, insurer dashboard, assistive product matching, client-facing explanations from approved product data. Phase 4: corporate workspace, embedded distribution, regional expansion — each gated on evidence.

---

## 6. Value Proposition Statement

| Question | Answer |
|---|---|
| Target market | Organised agencies and small brokerages in Kenya placing SME, group and property business, with individual motor/medical agents as a second segment |
| Current options | Email + Excel + WhatsApp; single-insurer portals; Lami (quote-and-issue); generic CRMs |
| What we offer | A workstation built around the needs assessment that produces the market request, the reasoned comparison, the proposal and the service record, and works with every insurer from day one |
| Problem solved | Hours of administration per placement; undocumented advice; missed renewals; invisible claims |
| Why better | Advice-first, not quote-first; no integration dependency; mobile-first; the file is the switching cost |

---

## 7. Competitor Analysis

| Competitor | Type | Strength | Gap | Our position |
|---|---|---|---|---|
| Lami Technologies | Funded agent/broker platform, 30+ insurers | Integrations, issuance, commission payments | Quote-first; no needs assessment, reasoning, claims advocacy workflow | Advice layer; complements or replaces depending on the agency |
| mTek | Marketplace/front-end for insurers and brokers | Insurer relationships | Not built around the adviser's client conversation | Front-office workflow |
| Kakbima | Insurance management for insurers/brokers | Policy admin, claims | Back-office orientation | Mobile-first adviser tool |
| Insurer portals | Free, direct | Single insurer | Multi-insurer request and comparison |
| Email/Excel/WhatsApp | Free, familiar | Slow, undocumented | Same workflow, structured and auditable |

**Positioning statement.** For agencies and brokers who sell on advice rather than price, Super Agent is the workstation built around the needs assessment — it produces the market request, the reasoned comparison, the proposal and the service record, and it works with every insurer from day one, API or not.

---

## 8. SWOT

**Strengths.** Live design partner with real clients and insurers; advice-first differentiation nobody else sells; no integration dependency; low build cost; founder domain knowledge.
**Weaknesses.** Pre-revenue; single-founder bandwidth; licensing position unresolved; small budget; brand to be built.
**Opportunities.** 15,000 agents; IRA emphasis on documentation and conduct; insurers wanting cleaner submissions; insurer performance data as a new asset; SME formalisation (WIBA, group medical).
**Threats.** Lami or an insurer bundles a free tool; regulatory limits on what an agent-licensed platform may present; slow adoption; data breach; under-funding.

---

## 9. Market Entry Strategy

**Phase 1 — GoldOak only (Months 1–4).** Build while using; GoldOak runs 100% of new business through the product by Month 4.
**Phase 2 — Design partners (Months 5–8).** Five agencies free for 90 days; weekly feedback; first before/after case study.
**Phase 3 — Founding customers (Months 8–12).** Founding pricing; events; content; 25 paying seats.
**Phase 4 — Agency plans (Year 2).** Sell to principals in 5-seat blocks; 150 seats; first insurer dashboard.
**Phase 5 — Scale (Year 3).** 300–500 seats; integrations; regional study.

---

## 10. Target Market — STP

**Segmentation.** By organisation (individual agent / agency 2–20 / brokerage 20+), by lines (motor-medical / SME-group-property / corporate), by geography (Nairobi, Mombasa, Kisumu, Nakuru, Eldoret), by attitude (advice-led vs price-led).

**Targeting.** Primary: advice-led agencies and small brokerages, Nairobi first. Secondary: individual motor/medical agents (Year 2). Tertiary: insurers as data customers (Year 2+).

**Positioning.** As in section 7.

**Market size.**

| Level | Definition | Estimate |
|---|---|---|
| TAM | All licensed intermediaries (IRA 2024) | ~15,000 agents + 237 brokers |
| SAM | Organised agencies/brokerages with ≥2 staff placing multi-insurer business (estimate; validate with IRA licensee list) | ~2,500–3,500 organisations; ~8,000 seats |
| SOM Year 1 | Founding customers | 25 seats (~KSh 70,000 MRR) |
| SOM Year 2 | Agency plan sales | 150 seats (~KSh 420,000 MRR) |
| SOM Year 3 | | 300–500 seats (~KSh 0.85–1.4M MRR) |

---

## 11. Operations Plan

**Legal structure.** Private limited company (Companies Act, 2015), separate from GoldOak, with a design-partner agreement between the two.
**Regulatory.** Commission a written opinion on (a) GoldOak's licence category and permitted self-description, and (b) whether a SaaS tool used by licensed intermediaries requires any IRA licence; register with ODPC; DPIA before medical lines. Nothing premium-linked in the platform until (b) is answered.
**Team, Year 1.** Founder (product, sales, GoldOak domain; salary deferred); contract full-stack engineer (0.75 FTE, KSh 90,000/month); compliance counsel (retainer KSh 10,000/month plus opinion); fixed-fee designer; two industry advisers.
**Technology.** Next.js + Supabase (PostgreSQL, auth, storage); HTML→PDF; Africa's Talking (SMS); Daraja (M-Pesa, Phase 2); hosted LLM API for document extraction (Phase 2); WhatsApp via deep links (Phase 1), Business Platform (Phase 2).
**Operations flow.** As in section 5.

---

## 12. Marketing Plan (4Ps)

**Product.** Six-module workstation; advice-first; mobile-first; works with every insurer.
**Price.** Starter KSh 1,500; Professional KSh 3,500; Agency KSh 12,000 for 5 users (+KSh 2,000/user); setup KSh 15,000–50,000; annual = 2 months free; founding customers 50% for 12 months.
**Place.** Cloud, any device; onboarding in person in Nairobi Year 1.
**Promotion.** GoldOak before/after case study; principal-focused content (needs-assessment templates, WIBA checklist, renewal cadence); AKI/AIBK/IIK events; insurer BDO referrals; design-partner referrals (one month free per referred agency).

---

## 13. Feasibility

**Market — Strong.** Large intermediary base; documented pain; existing competitor validates willingness to adopt software; gap in advice workflow is real.
**Technical — Strong.** Low-code-adjacent stack; no integration dependency for MVP; one engineer sufficient for six modules over six months.
**Financial — Moderate.** Modest capital need; revenue lags build; Year 2 raise required; GoldOak commission cushions runway.
**Regulatory — Moderate.** Licensing opinion is the first task; product wording adapts to the answer; DPA compliance is straightforward.

---

## 14. Risk Assessment and Mitigation

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Licensing restricts comparison/recommendation features | Medium | High | Opinion in Month 1; feature flags per licence type; broker plan |
| Agencies will not pay | Medium | High | Founding pricing; ROI case study; sell to principals |
| Lami/insurer bundles free tool | Medium | Medium | Compete on advice workflow and file; data asset |
| Founder bandwidth | High | High | Six-module scope; contractor; advisers; degree timeline in plan |
| Insurers reject standard packs | Low | Medium | Packs mirror insurer forms; wet-ink fallback |
| Data breach | Low | Critical | Security architecture; DPIA; cyber cover |
| Under-funding | Medium | High | 12-month raise; GoldOak bridge; monthly burn review |
| Over-fitting to GoldOak | Medium | Medium | Five design partners by Month 5 |

---

## 15. Projected Financial Statements

**15.1 Start-up and Year 1 costs (KSh)**

| Item | Year 1 |
|---|---|
| Contract engineering (12 × 90,000, avg 0.75 FTE) | 1,080,000 |
| Design system and branding | 80,000 |
| Legal: licensing opinion, ODPC, terms, DPAs | 120,000 |
| Hosting, SMS, email, AI usage, tooling | 120,000 |
| Go-to-market: events, travel, content | 100,000 |
| Contingency | 100,000 |
| **Total** | **1,600,000** |

(Ask rounded to KSh 1.45M on the basis of the founder's in-kind contribution covering part of Month 1–2 design and content.)

**15.2 Revenue (KSh)**

| Period | Avg paying seats | ARPU | Subscription | Services | Total |
|---|---|---|---|---|---|
| M1–6 | 0 | — | 0 | 0 | 0 |
| M7–9 | 6 | 1,600 (founding) | 28,800 | 30,000 | 58,800 |
| M10–12 | 18 | 1,800 | 97,200 | 45,000 | 142,200 |
| **Year 1** | | | 126,000 | 75,000 | **201,000** |
| Year 2 (avg 85 seats, ARPU 2,800, exit 150) | | | 2,856,000 | 400,000 | **3,256,000** |
| Year 3 (avg 280 seats, ARPU 3,000, exit 400; insurer services 900,000) | | | 10,080,000 | 1,500,000 | **11,580,000** |

**15.3 Expenses (KSh)**

| | Year 1 | Year 2 | Year 3 |
|---|---|---|---|
| Engineering | 1,080,000 | 2,160,000 (2 engineers) | 3,600,000 |
| Sales/customer success | 0 | 720,000 (from M15) | 1,440,000 |
| Founder salary | 0 | 600,000 (from M13, modest) | 1,200,000 |
| Hosting/messaging/AI | 120,000 | 360,000 | 720,000 |
| Legal/compliance | 120,000 | 150,000 | 300,000 |
| Marketing/events | 100,000 | 300,000 | 600,000 |
| Design/other/contingency | 180,000 | 250,000 | 400,000 |
| **Total** | **1,600,000** | **4,540,000** | **8,260,000** |

**15.4 Profit and loss summary (KSh)**

| | Year 1 | Year 2 | Year 3 |
|---|---|---|---|
| Revenue | 201,000 | 3,256,000 | 11,580,000 |
| Expenses | 1,600,000 | 4,540,000 | 8,260,000 |
| Net | (1,399,000) | (1,284,000) | 3,320,000 |

Year 1 and 2 losses funded by the Year 1 raise (KSh 1.45M), GoldOak contribution and a Year 2 raise of KSh 5–8M.

**15.5 Break-even.** Steady-state monthly cost in Year 2 ≈ KSh 380,000. At ARPU KSh 2,800 and 80% gross margin (contribution KSh 2,240/seat) break-even ≈ 170 seats; with services revenue ≈ 150 seats. Reached Month 20–24 on the ramp above.

**15.6 Unit economics.** ARPU KSh 2,800; gross margin 80%; CAC KSh 8,000 (Y1) rising to KSh 12,000 (Y2); churn 4% → 3%; LTV ≈ KSh 56,000–74,000; LTV:CAC ≈ 5–7×; CAC payback ≈ 4 months.

---

## 16. The Ask

**Amount.** KSh 1,450,000 for twelve months.

**Use of funds.** Engineering 68%; legal and compliance 8%; hosting and tooling 8%; go-to-market 7%; design 5%; contingency 4%.

**Sources.** Founder and family KSh 200,000; GoldOak commission contribution ≈ KSh 40,000/month (≈ 480,000); Strathmore iBiz Africa / KENIA / Villgro grant or programme funding KSh 300,000–500,000; angel/pre-seed KSh 400,000–600,000 for 8–12% equity.

**Returns.** Angel investors: equity at a pre-money of KSh 4–5M, with the Year 2 raise targeted at a step-up on 25+ paying seats and GoldOak's documented before/after results; realistic exit paths are acquisition by a Kenyan insurer group or a regional insurtech consolidator in Year 4–6. Loan funders: repayment from Month 24.

**Milestones.**

| Milestone | Month |
|---|---|
| Licensing opinion and ODPC registration | 1–3 |
| GoldOak 100% on Super Agent | 4 |
| Five design partners live | 6 |
| First paying seats | 8 |
| 25 paying seats; Year 2 raise opened | 12 |
| 150 seats; first insurer dashboard | 24 |
| Break-even | 20–24 |

---

## 17. Appendices (to be attached)

A. System architecture · B. Screen structure and wireframes (see Product Strategy §10–11) · C. Sample proposal output · D. IRA 2024 industry data extract and AKI 2024 report extract · E. Competitor mapping (Lami, mTek, Kakbima) · F. Founder CV · G. GoldOak design-partner agreement (draft) · H. DPA 2019 compliance summary and DPIA outline · I. Design-partner interview notes and agent pain-point survey · J. Financial model assumptions.

## 18. References

Association of Kenya Insurers. (2025). *Insurance industry annual report 2024*. AKI.
Insurance Regulatory Authority of Kenya. (2025). *Insurance industry annual data 2024*. IRA. https://www.ira.go.ke
Insurance Regulatory Authority of Kenya. (2024). *Insurance industry report, January–December 2024*. IRA.
Deloitte. (2025). *East Africa insurance outlook report 2025*. Deloitte East Africa.
Osterwalder, A., & Pigneur, Y. (2010). *Business model generation*. Wiley.
Porter, M. E. (2008). The five competitive forces that shape strategy. *Harvard Business Review, 86*(1), 78–93.
Republic of Kenya. (2019). *The Data Protection Act, 2019*. Government Printer.
Republic of Kenya. (2015). *The Insurance Act (Cap. 487)*, revised edition. National Council for Law Reporting.
Republic of Kenya. (2020). *Business Laws (Amendment) Act, 2020*. Government Printer.
Ries, E. (2011). *The lean startup*. Crown Business.

*Statistics should be re-verified against the current IRA and AKI publications at the date of submission.*
