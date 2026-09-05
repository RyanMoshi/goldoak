# The $100M Question — GoldOak + Super Agent Founder Strategy

*Version 1.0 · September 2026 · Sits on top of 01 Critique, 02 Product Strategy, 03 Business Plan v3 and 04 Pitch Deck v2, and changes their ceiling.*

**How to read this.** Documents 01–04 fixed the concept: an advice-first workstation, built inside GoldOak, that works with every insurer today. They were deliberately conservative, and they were right to be. But their model tops out at roughly KSh 12M of Year-3 revenue, which is about $90,000. That is a good Kenyan software business. It is not a venture. This document answers the question those documents avoided: what has to be true for this to become a $100M company, and what do we build first so that it can. It keeps every evidence gate from 01. It changes the destination.

Every regulatory point is marked **[verify]**. It must be confirmed with the IRA, ODPC or counsel before it is relied on. This is founder reasoning, not legal advice.

---

## Part 0 — The answer in one page

**1. Agent SaaS cannot reach $100M. Not in Kenya, not in Africa.** Kenya has about 15,000 licensed agents and 237 brokers. If every one of them paid KSh 3,000 a month, the ceiling is KSh 550M a year, about $4M. Even ten countries at that saturation is under $40M, and no one saturates. SaaS is the wedge and the data engine. It is not the business.

**2. The only path to $100M is premium economics.** Insurance distribution revenue is a percentage of premium. Kenya writes about KSh 395bn a year; Africa outside South Africa writes about $30bn. A platform earning a blended 6–7% of the premium it originates or services needs roughly $1.5bn of premium under influence to earn $100M. That is a five-to-seven-country, ten-year business. It is also the only kind of insurance business that has ever reached that size without underwriting.

**3. Therefore the company must be regulated, not just technical.** Super Agent stays a technology company. But the group must hold, or partner with, a licence that sits in the premium flow: a broker licence, and ideally the right to operate a network of sub-intermediaries under it the way India's point-of-sale-person (POSP) regime works. Whether Kenya's IRA permits that structure is **the single question the $100M outcome hinges on** **[verify]**. If yes, Super Agent becomes the rails and GoldOak becomes the licensed umbrella for thousands of agents. If no, the ceiling is a $100M *valuation*, not $100M of revenue, and that is still worth building.

**4. The wedge does not change.** The first product is still the agent workstation that turns a client conversation into a risk profile, a market request, a normalised comparison, a reasoned proposal and a serviced policy. It is buildable in twelve weeks without insurer APIs. It is where the data, the workflow lock-in and the insurer relationships come from. What changes is that it is designed from day one as the front end of a distribution network, not as a standalone tool.

**5. First class: SME with motor inside it.** SME is where GoldOak already wins, where one relationship carries six covers, and where the advice is worth paying for. Motor is where quotes are standardised enough to normalise and where the first insurer API will come from. Build the SME fact-find and the motor quote object in the same MVP. Do not start with medical or life.

**6. Capital.** KSh 800,000 builds a spreadsheet. KSh 1.5M builds the MVP inside GoldOak. About KSh 25M ($200K) builds the network pilot and the licence. $2M builds the platform business. $8–10M builds the second country. The money follows the gates, never the other way round.

**7. The moat, once real:** the only structured record in the market of how every insurer actually prices, responds and pays, attached to the largest documented base of SME risk profiles, inside the workflow that thousands of agents use to earn their living, under a licence that lets the platform move premium. Software alone copies in a year. That stack does not.

---

## Part 1 — The opportunity

### 1.1 The market, with the right numbers

| Figure | Value | Source and note |
|---|---|---|
| Kenya gross written premium, 2024 | ≈ KSh 395bn (≈ $3.0bn) | AKI 2024; re-verify at submission |
| Penetration | 2.44% | AKI 2024; African average ≈ 3%, world ≈ 7% |
| Licensed agents / brokers | ≈ 15,000 / 237 | IRA 2024 data |
| Share of premium via intermediaries | ≈ 60–70% (estimate) | Motor and medical dominate general business; verify with IRA channel data |
| Implied intermediary commission pool, Kenya | ≈ KSh 25–35bn ($190–270M) | 8–12% blended commission on intermediated premium; estimate |
| Africa GWP ex-South Africa | ≈ $30bn | Swiss Re Sigma / Deloitte; Morocco, Egypt, Nigeria, Kenya, Ghana lead |
| East Africa (KE, UG, TZ, RW, ET) GWP | ≈ $4.5–5bn | Kenya is ≈ 60% of it |

Two conclusions fall out immediately. First, the Kenyan commission pool alone is a few hundred million dollars, so a platform that takes a meaningful share of it is a $20–50M revenue business at maturity, in one country. Second, $100M of revenue requires the platform to be in the premium flow across several markets. Any plan that does not say this is not a $100M plan.

### 1.2 Who hurts, and how much

Ranked by the product of pain, frequency, cost, how underserved it is, how automatable it is and how monetisable it is. Score out of 5 each; the total is what we prioritise on.

| Problem | Owner | Pain | Freq | Cost | Underserved | Automatable | Monetisable | Total |
|---|---|---|---|---|---|---|---|---|
| Quote request → comparison → proposal takes hours and is undocumented | Agent | 5 | 5 | 4 | 5 | 5 | 4 | 28 |
| Renewals lapse because the diary lives in someone's head | Agent, client | 4 | 5 | 5 | 4 | 5 | 4 | 27 |
| SME owners are underinsured and do not know it | SME | 4 | 4 | 5 | 5 | 3 | 5 | 26 |
| Insurers receive incomplete submissions and re-work them | Insurer | 3 | 5 | 4 | 5 | 4 | 3 | 24 |
| Nobody knows where the claim is | Client, agent | 5 | 3 | 4 | 4 | 4 | 2 | 22 |
| Brokers run tenders and multi-class programmes in Excel | Broker | 4 | 3 | 5 | 3 | 3 | 4 | 22 |
| Insurers cannot see distribution performance by agent | Insurer | 3 | 4 | 3 | 5 | 4 | 3 | 22 |
| Client cannot see what they own across insurers | Client | 3 | 3 | 3 | 5 | 5 | 2 | 21 |
| Fraud and data quality at onboarding | Insurer | 3 | 3 | 4 | 3 | 3 | 2 | 18 |
| Customers cannot discover or trust insurance without a person | Individual | 4 | 3 | 3 | 2 | 2 | 3 | 17 |

The top three are the same workflow seen from three seats. That is why the wedge is the placement workflow and not a marketplace, a chatbot or a claims platform.

### 1.3 Why now

- **Smartphone and M-Pesa are universal** among agents and SME owners; the channel problem is solved.
- **The IRA is pushing conduct, documentation and digitisation**, which makes a documented needs assessment a compliance asset rather than a nice-to-have.
- **Large language models now extract structured fields from a PDF quotation reliably and cheaply.** In 2022 the "capture every insurer's reply in any format" step needed humans. In 2026 it costs a few shillings per document. That single capability is what makes a no-API multi-insurer comparison buildable by a two-person team.
- **AKI's Digital Motor Vehicle Insurance Certificate (DMVIC)** means every motor policy in Kenya already touches a shared digital rail. Motor is the class where an integration story is already half-built **[verify integration access rules]**.
- **The competitor set has solved quoting and not advice.** Lami, mTek and Kakbima are quote-and-issue or back-office tools. None owns the risk profile.

---

## Part 2 — The big idea

### 2.1 Two companies, one system

| | GoldOak Insurance Agency | Super Agent |
|---|---|---|
| What it is | The regulated intermediary. Advises, places, services, fights claims | The technology company. Builds and operates the distribution operating system |
| Role in the plan | Laboratory, first customer, proof of ROI, and later the licensed umbrella through which network premium flows | Product, data, integrations, AI, and the SaaS and platform revenue |
| Revenue | Commission on premium (regulated) | Subscriptions, platform fees, API usage, insurer technology fees, and a share of network economics **[verify structure]** |
| Ownership | Separate companies, common founders, arm's-length design-partner and network agreements | Same |

Keeping them separate is not optional. It is what lets Super Agent sell to agencies that compete with GoldOak, and what keeps a technology fee from being recharacterised as intermediary remuneration **[verify]**.

### 2.2 The eight models, judged

| Model | $100M-capable? | Verdict |
|---|---|---|
| A. Agent SaaS | No. Ceiling ≈ $4M in Kenya | Wedge only |
| B. Brokerage OS | No on its own. 237 brokers | Enterprise tier of the wedge, Year 2 |
| C. Insurance marketplace (B2B2C) | Only with premium economics and a licence | Phase 5 |
| D. Infrastructure / API | Partial. Transaction fees need volume that only distribution creates | Phase 4 layer |
| E. Embedded infrastructure | Yes, but needs licence and partners; slow to start | Phase 4 engine |
| F. Consumer marketplace | No. CAC in a 2.4%-penetration market kills it | Do not build |
| G. Insurer distribution technology | Partial. Insurers pay for distribution results, not software | Revenue layer once volume exists |
| **H. Platform: SaaS wedge → licensed network → embedded rails** | **Yes** | **This plan** |

The company is Model H, sequenced. SaaS is how we enter. A licensed agent network is how we get into the premium flow. Embedded rails and insurer technology are how we scale it beyond people we can onboard by hand.

### 2.3 The one regulatory question

India's insurance regulator lets a licensed broker or corporate agent operate a network of point-of-sale persons: lightly certified individuals who sell simple products under the licence, compliance and systems of the umbrella entity. PolicyBazaar, InsuranceDekho and Turtlemint built multi-hundred-million-dollar businesses on it. The Kenyan Insurance Act (Cap 487) licenses agents individually and appoints them to insurers; whether a broker or a multi-insurer agency may lawfully operate a sub-intermediary network, share commission with it and hold the client relationship on its behalf is not something to assume **[verify — this is the first task, before any code]**.

Three possible answers, and what each does to the plan:

1. **Permitted, or permitted with an IRA sandbox.** Full Model H. GoldOak (or a new broking entity) becomes the umbrella; Super Agent is its rails and takes platform fees. $100M revenue is on the table.
2. **Not permitted, but agents may use a shared platform and insurers may pay technology fees.** Super Agent earns SaaS plus insurer distribution-technology fees plus embedded partner fees where the partner is the licensed intermediary. Realistic ceiling: $10–20M revenue, $100M+ valuation.
3. **Not permitted and technology fees tied to premium are treated as intermediary remuneration.** Pure SaaS plus data. Small profitable company. Do not raise venture money.

The plan below is written for answer 1, with every step still valuable under answer 2.

---

## Part 3 — The wedge and the MVP

### 3.1 The wedge, tested

| Option | Pain | Freq | WTP | Tech risk | Reg risk | Distribution | Competition | Time to rev | Scale | Defensible | Total |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1. AI agent workstation (placement workflow) | 5 | 5 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | **41** |
| 2. Multi-insurer quoting engine (API-first) | 5 | 5 | 4 | 1 | 3 | 3 | 2 | 1 | 5 | 3 | 32 |
| 3. Insurance CRM | 3 | 5 | 2 | 5 | 5 | 3 | 2 | 4 | 3 | 2 | 34 |
| 4. Digital marketplace | 3 | 3 | 2 | 2 | 1 | 1 | 2 | 1 | 5 | 3 | 23 |
| 5. SME insurance platform (direct) | 4 | 3 | 3 | 3 | 2 | 2 | 3 | 2 | 4 | 4 | 30 |
| 6. Claims platform | 4 | 2 | 2 | 3 | 3 | 2 | 4 | 2 | 3 | 3 | 28 |
| 7. Embedded API | 3 | 4 | 4 | 2 | 1 | 2 | 3 | 1 | 5 | 5 | 30 |

Scores are 5 = best for us (so a low technical or regulatory risk scores high). Option 1 wins because it is the only one that starts producing revenue and data within a quarter, needs no insurer cooperation, and is the natural front door to options 2 and 7 later. Option 2 collapses on time-to-revenue: you cannot quote in real time from insurers that have no rating API. Option 7 is the endgame and cannot be the start, because partners integrate with volume, not with promises.

**Decision:** the wedge is the placement workflow, sold as a workstation, engineered as the first surface of a distribution platform.

### 3.2 The killer workflow and the honest speed claim

> Customer → Risk profile → Quote requests → Multi-insurer comparison → Recommendation → Placement

| Step | Today (GoldOak, to be measured in Month 1) | Super Agent target | What makes it faster |
|---|---|---|---|
| Fact-find and risk profile | 45–90 min, on paper or in the head | 15 min on a phone, structured | Segment-specific question sets, progressive disclosure, prefill from documents |
| Quote requests to 3–5 insurers | 60–120 min of emails | 5 min | One request pack, generated per insurer from the risk profile |
| Waiting for insurers | 1–5 days | 1–5 days, unchanged, but visible and chased automatically | SLA timers, automatic chasers, insurer turnaround record |
| Capturing replies into a comparison | 60–90 min in Excel | 10 min | PDF and email extraction into the normalised quote object; adviser confirms |
| Recommendation and proposal | 60 min in Word | 10 min | Drafted reasoning from the comparison; branded PDF and link |
| **Agent time per placement** | **≈ 4–6 hours** | **≈ 45 minutes** | |

We never promise instant insurance. We promise the agent their day back, and the client a same-day proposal once the insurers have replied.

### 3.3 MVP scope: twelve weeks, one engineer plus the founder

Everything in 02 Product Strategy §8 stands, with two changes: Tier 1 document AI moves *into* the MVP because it is now cheap and it is the step the whole workflow turns on, and the data model is built multi-tenant and network-ready from the first migration so that the licensed-network pivot in Year 2 is a configuration change, not a rewrite.

| Module | In MVP | Deferred |
|---|---|---|
| Client record and consent | Individual and business; contacts, assets, vehicles, employee census, documents, interactions | Corporate group structures |
| Fact-find and risk profile | SME flow (six questions, branching) and motor flow; versioned risk profile; approve step | Medical, life, travel flows |
| Insurer registry | Eight GoldOak panel insurers; appetite grid by class; contacts; commission; turnaround stats accrue automatically | Insurer self-service |
| Quote request manager | Request pack per insurer; sent by email; status and days outstanding; automatic chaser at SLA | Portal and API adapters |
| Quote capture | Upload PDF or forward email → extracted fields into the normalised quote object → adviser confirms | Rate-table engine |
| Comparison and recommendation | Table on identical terms; cheapest / best value / broadest / recommended; reasoning drafted, adviser edits | Weighted-scoring tuning |
| Proposal | Branded PDF and web link; WhatsApp deep link; viewed and accepted tracking | E-signature |
| Policy register and renewal diary | Expiry detection; 90/45/30/14/7/0 cadence by email and SMS | WhatsApp Platform campaigns |
| Claims tracker | Intake, checklist by class, insurer notification, status board, 7-day client update | Assessor scheduling |
| Tasks, audit log, reports | SLA-driven tasks; append-only audit; premium and commission by insurer, class, month | Insurer dashboard |
| Client surfaces | Proposal link, upload link, claim form, read-only wallet page (no login) | OTP login, payments |

Explicitly out of the MVP: real-time insurer APIs, client-facing AI, in-app premium payment, e-signature, the WhatsApp Business Platform, corporate workspace, embedded API, native mobile apps, more than two fact-find flows, and any feature that only GoldOak wants.

### 3.4 The four journeys the MVP must complete end to end

1. **New SME client.** Referral arrives on WhatsApp → agent creates the client in 30 seconds → runs the six-question fact-find in the meeting → approves the risk map → selects insurers from the appetite grid → packs go out → replies land and are extracted → comparison builds → adviser marks recommended and edits the reasoning → proposal link goes to the owner → owner accepts and uploads documents → policy recorded → renewal diary starts.
2. **Individual motor client, fast path.** Registration number, use, value, drivers → three packs → comparison → proposal same day.
3. **Renewal.** Case opens at 90 days with "what changed?" → remarket at 45 → options at 30 → reminders at 14 and 7 → lapse handling at 0.
4. **Claim.** Client taps "report a claim" → guided form → claim record, insurer notification, checklist → weekly automatic update until settled → outcome recorded against the insurer.

---

## Part 4 — AI

### 4.1 The rule

AI drafts, extracts, classifies, summarises and follows up. A licensed human decides. Every AI output that could reach a client carries an approval state, the source it was derived from, and the identity of the person who approved it. The system never invents a policy term: if a term is not in an approved source it says it does not know and routes to a person.

### 4.2 The agent network, sequenced

The prompt lists fourteen agents. Building fourteen at once produces fourteen mediocre ones. These are the six that matter in the first year, the order they ship in, and the gate for the rest.

| Agent | Job | Sources it may use | Human step | Ships |
|---|---|---|---|---|
| Document Intelligence | Extract premium, sums insured, limits, excess, exclusions, warranties, validity from insurer quotes and schedules; classify uploads | The document only | Adviser confirms every extracted field before it enters the comparison | MVP |
| Fact-find Copilot | Turn a voice note, WhatsApp thread or meeting notes into structured fact-find answers; list what is still missing | Client's own words, uploaded documents | Adviser reviews before approving the risk profile | MVP |
| Quote Normaliser | Map extracted fields to the universal quote object; flag mismatched bases (different sums insured, missing sections) | Extracted fields, request pack | Adviser resolves flags | MVP |
| Reasoning Drafter | Draft the recommendation rationale and plain-language exclusion summary from the comparison | Comparison object, approved product notes | Adviser edits and approves; draft watermark until then | MVP |
| Follow-up Drafter | Draft chasers to insurers, reminders to clients, renewal "what changed?" messages | Pipeline state, templates | Auto-send only for templated chasers; anything bespoke is approved | Month 4 |
| Claims Summariser | Summarise a claim's correspondence into a status line and next action | Claim thread | Handler confirms | Month 6 |
| Product Matcher | Risk profile → protection areas → candidate products by appetite | Approved product catalogue, registry | Adviser decides suitability | Gate: 150 seats and a catalogue of 40+ products |
| Client Explainer | Answer "what does this excess mean?" on the proposal page | Retrieval over approved wordings only | Escalate-to-human button; audit trail; regulatory view on AI explanations **[verify]** | Gate: Phase 3 |
| Compliance Checker | Flag missing disclosures, documents, KYC, unusual premiums | Checklist rules, then model | Compliance officer | Month 9 |
| Concierge (WhatsApp) | First conversation with a prospective client | Scripted intents, then model | Hands to agent for anything substantive | Phase 3 |
| Renewal Predictor, Claims Guide, Agent Copilot (natural-language commands) | Prediction and orchestration | Platform history | Adviser | Phase 3–4, once there is data to predict from |

### 4.3 Knowledge architecture

- **Approved product catalogue.** One record per insurer product version with the fields in Part 7. Every record cites its source document (brochure, wording, rate guide, insurer email) with page references. Nothing enters the catalogue without an adviser's approval.
- **Retrieval.** Client-facing or advice-adjacent answers are generated only from retrieved chunks of approved sources, with the chunk ids stored alongside the output. No retrieval hit, no answer.
- **Model routing.** Small, cheap model for classification and extraction; strong model for reasoning drafts; both behind a gateway that logs prompts, outputs, tokens and cost per tenant.
- **PII minimisation.** Extraction runs on the document, not on the client record. Drafting prompts carry the comparison, not the client's identity, where the output does not need it.
- **Evaluation.** A golden set of 200 real GoldOak quotes and schedules, hand-labelled, run on every prompt or model change. Field-level accuracy target: 97% on premium and sums insured, 90% on exclusions, before an extraction may pre-fill without a warning. Reasoning drafts are graded monthly by the principal on a five-point rubric.
- **Vendor.** Hosted frontier model through an API gateway with a data-processing agreement; document any cross-border transfer **[verify ODPC]**.

### 4.4 Escalation rules

| Trigger | Route |
|---|---|
| Extraction confidence below threshold on any money field | Adviser must key the field |
| Sum insured above an agency-set limit; any liability, marine, engineering, or medical group above 50 lives | Principal approval before proposal |
| Client asks a question the Explainer cannot source | Human, within the 24-hour service standard |
| Claim declined or offer below claimed amount | Principal, same day |
| Client chooses an option other than the recommended one | Recorded with the client's stated reason |

---

## Part 5 — Technology

### 5.1 Stack

| Layer | Choice | Why |
|---|---|---|
| Frontend | Next.js (App Router), TypeScript, Tailwind, mobile-first PWA | Same stack as the GoldOak site; one language across the team; installable on Android without an app store |
| Backend | Next.js server actions and route handlers in a **modular monolith**; background jobs on a queue | One deployable, one engineer, zero service boundaries to argue about |
| Database | PostgreSQL with row-level security per tenant | Relational data, audit trail; RLS enforces isolation in the database, not in application code |
| Documents | S3-compatible object storage, server-side encryption, signed short-lived URLs, virus scan | |
| AI | Frontier model via a gateway; structured-output extraction; retrieval index in Postgres (pgvector) | No separate vector database until it hurts |
| Email | Transactional provider with inbound parsing | The request-pack channel and the reply-capture channel |
| SMS | Africa's Talking | Sender-ID registration, Kenyan delivery |
| WhatsApp | Deep links (MVP) → Meta Cloud API (Phase 2) | Cost follows volume |
| Payments | M-Pesa Daraja for subscriptions (Month 10); premium payments only after licensing **[verify]** | |
| PDF | HTML → PDF service | Proposals, comparison schedules, onboarding packs |
| Hosting | Managed platform in a region acceptable under ODPC guidance; document the choice **[verify residency]** | |
| Observability | Structured logs, error tracking, uptime alerts, audit table | |
| Identity | OTP by SMS or email, optional password, MFA for principals, roles, tenant membership | |

Modular monolith, not microservices. A two-person team with one deployable ships weekly. Split a module out only when it has its own scaling profile (extraction workers first, in Year 2) or its own team.

### 5.2 Architecture

<!-- block:architecture -->

Every channel enters through one gateway. Identity resolves the tenant and the role. The workflow engine owns pipeline state and SLAs and is the only thing that mutates them. The domain services are modules inside one codebase that share a database. The integration layer is the only code that knows an insurer's channel; everything above it sees the same request-pack and normalised-quote objects. Cross-cutting services are shared tables and jobs, not separate systems.

### 5.3 Core entities

`Organisation` (tenant: agency, brokerage, network member) → `User` (role) · `Client` (individual or business) → `Contact`, `Asset` (vehicle, property, equipment, stock), `Person` (dependant, employee), `Location`, `Consent`, `Document`, `Interaction`, `Task` · `RiskProfile` (versioned, approved-by) → `Exposure` · `Insurer` → `InsurerProduct` (versioned, sourced) → `AppetiteRule` · `QuoteRequest` → `Submission` (per insurer, channel, timestamps) → `Quote` (normalised) → `QuoteSection` · `Comparison` → `Recommendation` (option, reasoning, approved-by) · `Proposal` (viewed, accepted) · `Policy` → `Endorsement`, `Commission` · `RenewalCase` · `Claim` → `ClaimEvent` · `Payment` · `AIRun` (prompt, sources, output, approval) · `AuditLog` (append-only) · `NetworkAgreement` (Year 2: umbrella, member, commission split).

Rules: one client per legal person per tenant; every row links to a tenant; risk profiles and recommendations are versioned so the advice given on the day survives; every AI output references the AIRun that produced it.

### 5.4 API design

Internal from day one, public from Phase 4. REST, JSON, versioned path, bearer tokens scoped to tenant and role, idempotency keys on every write, every request logged with actor and tenant.

| Resource | Endpoints | Notes |
|---|---|---|
| Auth | `POST /auth/otp`, `POST /auth/verify`, `POST /auth/refresh` | |
| Clients | `POST /clients`, `GET /clients/{id}`, `PATCH /clients/{id}`, `GET /clients?q=` | Consent record required on create |
| Risk profiles | `POST /clients/{id}/risk-profiles`, `POST /risk-profiles/{id}/approve` | Creates a new version; approval is immutable |
| Insurers, products | `GET /insurers`, `GET /insurers/{id}/products`, `GET /products?class=&segment=` | Catalogue with source references |
| Quote requests | `POST /quote-requests`, `POST /quote-requests/{id}/submissions`, `POST /submissions/{id}/responses` | Response accepts a PDF, an email id or manual JSON |
| Comparisons | `GET /quote-requests/{id}/comparison`, `POST /comparisons/{id}/recommendation` | |
| Proposals | `POST /proposals`, `GET /p/{token}` (client), `POST /p/{token}/accept` | Token-scoped public surface |
| Policies | `POST /policies`, `GET /policies?expiring_before=`, `POST /policies/{id}/endorsements` | |
| Claims | `POST /claims`, `POST /claims/{id}/events`, `GET /c/{token}` (client) | |
| Renewals | `GET /renewals?window=30d`, `POST /renewals/{id}/remarket` | |
| Payments | `POST /payments/intents`, webhook `POST /payments/mpesa/callback` | Subscription only until licensing is settled |
| Documents | `POST /documents` (signed upload), `GET /documents/{id}` (signed download) | Classified on upload |
| AI | `POST /ai/extract`, `POST /ai/draft/recommendation`, `POST /ai/runs/{id}/approve` | Every run stored |
| Partners (Phase 4) | `POST /partners/{id}/customers`, `POST /partners/{id}/quotes`, `GET /partners/{id}/policies`, webhooks | Sandbox, keys, rate limits |

Errors are typed (`validation_error`, `not_found`, `conflict`, `forbidden`, `rate_limited`) with field paths. Anything touching money or advice writes to the audit log before returning.

### 5.5 Security

Encryption in transit and at rest; column-level encryption for health and identity fields; RLS tenant isolation; roles with least privilege; MFA for principals; secrets in a managed vault; rate limiting and input validation on every public route; dependency scanning in CI; daily encrypted backups with a quarterly tested restore; incident runbook with the DPA's breach notification timeline **[verify 72 hours]**; annual penetration test from Phase 2; cyber insurance from Month 6 (GoldOak can place it).

### 5.6 Country configuration layer

Built in Year 3, designed in Year 1: currency, regulator, licence types, permitted intermediary structures, insurance classes and mandatory covers, taxes and levies (training levy, policyholders' compensation fund, stamp duty), required documents and KYC, payment rails, messaging providers, disclosure texts, policy document formats. Every hard-coded Kenyan value in the MVP lives in one config file so that the second country is a file, not a fork.

---

## Part 6 — UX and UI

### 6.1 Design system

The product should feel closer to M-Pesa and a modern bank than to an insurer portal: calm, confident, one decision per screen, nothing that affects the client's money hidden behind a click.

| Token | Value | Use |
|---|---|---|
| Forest | `#073423` | Primary surfaces, primary buttons, headings on light |
| Forest 700 / 500 / 100 | `#0f4d34` / `#2a6b4f` / `#e6efe9` | Hover, secondary emphasis, tinted panels |
| Gold | `#c28d38` | The one accent: recommended badge, primary CTA on dark, progress, key figures |
| Gold 100 | `#f6ecd8` | Highlight rows, "recommended" card ground |
| Cream | `#f7f4ec` | Page ground on light |
| Ink | `#16211b` | Body text on light |
| Ink muted | `#5d6b63` | Secondary text, labels |
| Line | `#dcd6c8` | Hairlines, table rules |
| Good / Warning / Critical / Info | `#1f7a4d` / `#b8730f` / `#b3261e` / `#2b5f8e` | Status only: never decoration, always paired with a label or icon |
| Dark ground / surface / ink | `#0d1a14` / `#132419` / `#e9e4d6` | Dark theme, gold lifted to `#d3a04c` for contrast |

Typography: **Petrona** for headings and key figures (the brand's serif, human and confident), **Karla** for interface and body, **IBM Plex Mono** for premiums, policy numbers and anything that lines up in a column, with tabular numerals everywhere money appears. Scale: 12 / 14 / 16 / 18 / 22 / 28 / 36. Spacing on a 4-pt grid, 8-pt rhythm. Corner radius 6px on controls, 10px on cards, never on tables. Shadows only on the one element that floats (a sheet, a menu).

Principles that decide arguments: mobile first and low bandwidth (every agent screen under 200KB, forms tolerate a dropped connection); progressive disclosure (ask the next question, not the whole form); every insurance term carries a plain-language tooltip drawn from the approved catalogue; agent and client never see the same screen; status is shown in form as well as colour; the recommended option is always explained in a sentence a client can repeat to their spouse.

### 6.2 Customer screens

<!-- block:mockups-customer -->

| # | Screen | Purpose | Inputs | Outputs | AI | Automation | UX note |
|---|---|---|---|---|---|---|---|
| 01 | Landing — "What would you like to protect?" | Entry from WhatsApp, web, referral | One tap: my car, my business, my family, my home, my staff, something else | Starts a guided conversation | None | Lead created for the agency | Six big targets, no form |
| 02 | Risk discovery | Conversational fact-find | One question per screen, branching; photos of logbook, licence, premises | Structured answers | Fact-find Copilot fills from photos | Missing items flagged | Progress bar, "skip and ask me later" |
| 03 | Risk profile — "What we've understood" | Confirm before market | Edit any line | Approved profile, shared with adviser | Exposure list drafted | | Plain language, one screen |
| 04 | Recommended protection | Show what matters first | | Ranked protection areas with why | Product Matcher (Phase 3) | | Must-have / should-have / later |
| 05 | Quotes | Options arriving | | Status per insurer; options as they land | | Chasers to insurers | Honest waiting state, not a spinner |
| 06 | Comparison | Decide on identical terms | Toggle sections | Side-by-side: premium, limits, excess, exclusions, service record | | Differences highlighted | Recommended card gold-tinted, reason on it |
| 07 | Recommendation | Why this one | Accept, ask a question, choose another (with reason) | Accepted option | Reasoning drafted, adviser approved | | One paragraph, then details |
| 08 | Checkout | Documents, payment instructions | Upload via camera; pay by M-Pesa (Phase 2) | Placement started | Document classification | Missing-document reminders | Checklist, not a form |
| 09 | Policy wallet | Everything I own | | Policies by class: insurer, cover, premium, renewal, documents, claims contact, key exclusions | | | One identity, many policies |
| 10 | Report a claim | Start the moment of truth | Incident story, photos, date | Claim opened; checklist | Claims Summariser | Insurer notified; weekly updates | Calm, guided, named person shown |
| 11 | Claim tracking | Where is it | | Stage, last update, next update due, who to call | | 7-day update cadence | Timeline, not a status code |
| 12 | Renewals | What is coming | "What changed?" answers | Renewal options 30 days out | Change detection | 90/45/30/14/7 cadence | Never a surprise |
| 13 | Profile | My details, consents, documents | | | | | Consents visible and revocable |

### 6.3 Agent screens

<!-- block:mockups-agent -->

| # | Screen | Purpose | Key elements | AI | Automation |
|---|---|---|---|---|---|
| A1 | Today | Priorities | Counters: leads, quotes awaited (oldest days), proposals out, renewals ≤ 30d, claims needing action, missing documents; task list; natural-language command bar | Command bar (Phase 3) | Tasks from SLAs |
| A2 | Leads and pipeline | Move work | Kanban: Lead → Fact-find → Requested → Compared → Proposed → Accepted → Placed → Live → Renewal; SLA colour per card | | Stage timers |
| A3 | Client 360 | One record | Tabs: profile, risk profile, policies, quotes, claims, documents, timeline, tasks; covers-per-client shown | | De-duplication |
| A4 | Fact-find | Needs assessment | Segment flow; "skip and flag"; approve | Copilot from notes and photos | |
| A5 | Risk profile | Output of A4 | Exposures, protection areas, gaps, approve | Exposure draft | |
| A6 | Quote workspace | Go to market and track | Class; suggested insurers from appetite; required-field checklist; generate packs; per-insurer status, days outstanding, chase | Quote Normaliser on replies | Chasers at SLA |
| A7 | Comparison engine | Decide | Table on identical terms; mismatched-basis flags; tag cheapest / best value / broadest / recommended; reasoning box | Reasoning Drafter | |
| A8 | Proposal builder | Send | Preview; share by WhatsApp link, email, PDF; viewed and accepted | | Tracking |
| A9 | Documents | File | Classified, linked, missing-document checklist | Classifier | Reminders |
| A10 | Claims board | Track | Stages Notified → Registered → Documenting → With insurer → Assessed → Offer → Settled → Closed; next update due | Summariser | 7-day updates, escalation on silence |
| A11 | Renewals | Diary | Calendar and list; cadence status; "what changed?" | Change detection | Cadence |
| A12 | Insurer panel | Reference | Cards; appetite grid; contacts; turnaround, hit-rate, claims record from our own data | | Stats accrue |
| A13 | Analytics | Business | Premium and commission by insurer, class, adviser, month; conversion; renewal rate; covers per client | | |
| A14 | Automation centre | Control | Which agents are on; approval rules; templates; SLA settings | | |
| A15 | Settings | Configure | Branding, users, roles, disclosure texts, consent texts | | |

### 6.4 AI-first interaction

Natural-language commands ship in Phase 3, once there is enough structured data for them to be reliable. Design for them now: every screen's actions are also exposed as internal commands, so "prepare comprehensive motor quotes for John Kamau" resolves to find client → check vehicle data → list missing fields → suggest insurers → generate packs, with the agent confirming at the one step that matters (which insurers). "Show me all clients renewing next month" and "which SME clients have no business interruption cover" are saved queries from day one, surfaced as buttons before they become sentences.

### 6.5 WhatsApp

MVP: deep links only. The proposal, the upload checklist and the claim form open from a WhatsApp message; documents come back on the web page, not in the chat. Phase 2: templated renewal and document-request messages on the Cloud API. Phase 3: the Concierge agent handles "I need insurance for my business" as far as the first six questions, then hands the person to a secure link and an adviser. Sensitive data never lives in the chat.

---

## Part 7 — Insurer infrastructure

### 7.1 Product data model

One record per insurer product version:

`insurer · product name · class · sub-class · customer segment · eligibility rules · covered perils and sections · benefits · limits and sub-limits · exclusions (structured list plus wording) · excess by section · waiting periods · conditions and warranties · required documents · rating factors (where published) · commission terms · payment terms · geographic availability · effective and expiry dates · version · source document and page · approved by · approved on`

GoldOak's eight panel insurers across the seven solution families is roughly 60–80 product records. That is a month of the principal's evenings and the most valuable month in the plan.

### 7.2 Universal quote object

<!-- block:quote-object -->

Every insurer reply, whatever the channel, maps into this before it is compared. Where a section is missing or the basis differs (a different sum insured, a different excess structure), the normaliser flags it rather than silently comparing unlike with unlike.

### 7.3 Integration levels and adapters

| Level | Channel | Insurers today (estimate) | What we automate |
|---|---|---|---|
| 3 — Assisted | Email out, email or PDF in, manual entry; portal use by a human with the insurer's permission | All eight on the panel | Pack generation, extraction, normalisation, chasing, turnaround record |
| 2 — Partial | Published rate tables for tariffed lines; DMVIC for motor certificates; document-exchange agreements | Motor at most insurers | Indicative premium (labelled), certificate issuance |
| 1 — Full API | Rating, quote, bind, issue, claims status | Zero to two in Kenya today; motor first | Real-time where it exists |

Adapter interface, the same for every level: `prepare(riskProfile) → RequestPack`, `submit(pack) → Submission`, `capture(response) → NormalisedQuote`, `status(submission)`, `bind(quote) → Policy` (Level 1 only). Adding an insurer is a new adapter and a registry record, never a change above the integration layer. Portal automation happens only with written permission **[verify terms of use]**.

### 7.4 Comparison scoring

Weighted score per option: coverage breadth 30, premium 25, limits adequacy 15, exclusions severity 10, excess 5, insurer service record 10, claims record 5. Weights are agency-configurable within bounds and shown to the client on request. The four labels: **Best price** (lowest gross premium on a like basis), **Best value** (highest score per shilling), **Broadest** (highest coverage-and-limits sub-score), **Recommended** (adviser's choice, always with a written reason). The engine proposes; the adviser decides; the client sees why.

### 7.5 Insurer strategy

Three insurers first, chosen for high-demand products, competitive SME and motor pricing, responsive underwriters and a stated appetite for digital distribution. From GoldOak's panel, the shortlist to test is APA, CIC and Jubilee for SME and motor, with Britam and Old Mutual as the next two; confirm against GoldOak's own turnaround and claims record before approaching anyone. The first conversation is not "integrate with us". It is "here is your turnaround and hit-rate on 200 submissions versus the anonymised panel average, and here is how a standard pack cuts your re-work". Integration follows evidence.

---

## Part 8 — Business model

### 8.1 Revenue streams, in the order they become real

| Stream | Starts | Mechanism | Margin | Recurring | Regulatory |
|---|---|---|---|---|---|
| 1. Agent and agency subscriptions | Month 8 | Seats and agency plans | 80% | Yes | Clean |
| 2. Setup and template services | Month 8 | One-time | 50% | No | Clean |
| 3. Network economics | Year 2, gate: licence opinion | Members place through the licensed umbrella; umbrella retains an override on commission; Super Agent charges the umbrella a platform fee | 70% | Yes, scales with premium | **[verify: hinges on Part 2.3]** |
| 4. Insurer distribution technology | Year 2 | Performance dashboard subscription; integration and submission-quality fees | 85% | Yes | Fee for technology, not for placement **[verify]** |
| 5. Embedded and partner API | Year 3 | Per-policy platform fee and API usage where the partner or umbrella is the licensed intermediary | 75% | Yes | **[verify per partner]** |
| 6. Enterprise brokerage | Year 2 | Annual contracts, customisation | 70% | Yes | Clean |
| 7. Analytics | Year 3 | Aggregated, anonymised, lawful market intelligence for insurers and reinsurers | 90% | Yes | Privacy-preserving by design |
| Excluded until licensing confirmed | — | Any share of premium or commission taken by Super Agent directly | — | — | — |

### 8.2 Pricing

| Plan | For | KSh / month | Includes |
|---|---|---|---|
| Starter | Single agent | 1,500 | Client record, fact-find, requests, comparison, proposals, renewal diary; 1 user |
| Professional | Agent with admin | 3,500 | Starter plus claims, documents, SMS/WhatsApp reminders, document AI, reports; 2 users |
| Agency | Small agency or brokerage | 12,000 for 5 users, +2,000 per user | Professional plus roles, approvals, templates, priority support |
| Network member (Year 2) | Agent placing through the umbrella | 0–1,500 plus commission split | The platform fee is earned from the premium, not the seat **[verify]** |
| Brokerage enterprise | 20+ users, tenders, multi-class programmes | 60,000–150,000 | Custom templates, API, SSO, dedicated support |
| Insurer | Dashboard and integration | 150,000–500,000 | Turnaround and hit-rate analytics, standard-pack channel, adapter maintenance |
| Partner API | Embedded distribution | 2–4% of premium as platform fee, or per-policy fee, plus usage | Sandbox, keys, webhooks |

Pricing logic: Professional costs less than one hour of an adviser's week. If Super Agent saves ten hours a week, the price is under 3% of the value created.

### 8.3 Unit economics

| | SaaS seat | Network member | Embedded partner |
|---|---|---|---|
| Revenue per unit per year | KSh 33,600 (ARPU 2,800) | KSh 120,000–300,000 (platform fee on KSh 3–8M premium placed) | KSh 2–10M (partner writing KSh 100–400M premium at 2–3%) |
| CAC | KSh 8,000–12,000 | KSh 25,000 (recruit, licence check, train) | KSh 400,000–1M (sales cycle 6–9 months) |
| Gross margin | 80% | 70% | 75% |
| Annual churn | 30–40% | 15% | 10% |
| LTV : CAC | 5–7× | 8–12× | 6–10× |
| Payback | 4 months | 3 months | 12 months |

---

## Part 9 — Go-to-market

| Stage | When | Who | Channel | Proof required to move on |
|---|---|---|---|---|
| 1. GoldOak | Months 1–4 | GoldOak's own advisers | Internal | 100% of new business through the platform for 90 days; before/after time per placement |
| 2. Friendly agents | Months 5–8 | 5–10 agencies from the founder's and GoldOak's insurer-BDO network, SME and group focused, Nairobi | Direct, free 90 days | Weekly usage, one case study each |
| 3. Founding customers | Months 8–12 | 25 paying seats | Referrals, AKI / AIBK / IIK events, principal-focused content, WhatsApp user community | Churn under 4%, NPS over 40 |
| 4. Agency plans | Year 2 H1 | 150 seats across 30–40 agencies | Sell to principals in 5-seat blocks; insurer BDO referrals | MRR KSh 420,000 |
| 5. Network pilot | Year 2 H2 | 50 agents under the licensed umbrella (if permitted) | Recruit from existing users first | KSh 100M premium through the umbrella in 6 months |
| 6. Brokerages and insurers | Year 2–3 | 5 brokerages; 2 insurer dashboard customers; first API | Evidence-led conversations | An insurer pays |
| 7. Embedded partners | Year 3 | One SACCO, one HR or payroll platform, one vehicle marketplace | Founder-led enterprise sales | 10,000 policies via partners |

Referral loops that are real rather than gimmicks: an agency principal invites their advisers (seat expansion); a network member recruits a colleague because the umbrella's commission terms are better than going alone; an SME owner adds their staff for medical or PA cover and their vehicles for motor (covers per client); an insurer BDO refers an organised agency because clean submissions make the BDO's numbers better. Consumer-to-consumer referral is not a loop in this market and is not designed for.

---

## Part 10 — Financial model

Assumptions: KSh 130 per dollar; SaaS ARPU KSh 2,800; network platform fee 2.5% of premium placed through the umbrella; average SME programme premium KSh 250,000, average motor premium KSh 45,000; embedded platform fee 2.5%; churn as in 8.3. All figures are targets requiring the gates in Part 13, not forecasts.

<!-- block:revenue-chart -->

### 10.1 Milestones and what each requires

| Milestone | Year | Seats | Network agents | Premium via platform (KSh) | Partners | Insurers with API | Revenue (KSh) | Revenue ($) |
|---|---|---|---|---|---|---|---|---|
| KSh 10M | 2–3 | 300 | 50 | 1bn | 0 | 0–1 | 10M | 77K |
| KSh 100M | 4 | 1,200 | 600 | 6bn | 2 | 3 | 100M | 770K |
| KSh 1bn | 6 | 3,000 (KE + UG + RW) | 4,000 | 30bn | 8 | 8 | 1bn | 7.7M |
| $10M | 6–7 | 3,500 | 5,000 | 40bn | 10 | 10 | 1.3bn | 10M |
| $100M | 10–12 | 15,000 across 6–7 countries | 40,000 | 1.5tn (≈ $11.5bn) at a blended 0.85% of premium as platform revenue, plus SaaS, insurer and analytics | 60 | 40 | 13bn | 100M |

Read the last row carefully. $100M of revenue means originating or servicing about a third of Africa-ex-South-Africa's premium outside the big corporate accounts. The honest version of this row is: it is a Nigeria-plus-East-Africa-plus-Ghana-plus-one-francophone-market outcome, needing three funding rounds and a decade. The row before it, $10M of revenue on East Africa alone, is what the next five years should be planned and funded against, and at a 10× revenue multiple it is a $100M company.

### 10.2 Three-year scenarios

| | Conservative | Base | Aggressive |
|---|---|---|---|
| Description | Good Kenyan SaaS; licence answer is no | Kenyan distribution infrastructure; network permitted | Network scales, first second country |
| Year 3 revenue | KSh 12M ($90K) | KSh 45M ($350K) | KSh 120M ($920K) |
| Paying seats | 400 | 800 | 1,500 |
| Network agents | 0 | 200 | 800 |
| Premium via platform | KSh 0.4bn (serviced) | KSh 2.5bn | KSh 8bn |
| Insurers integrated | 1 | 3 | 5 |
| Countries | 1 | 1 | 2 |
| Employees | 5 | 12 | 25 |
| Funding raised | KSh 8M | $1.5–2M seed | $2M seed + $8M Series A opened |
| Outcome | Profitable, small | Category leader in Kenya, venture-backable | Regional platform |

### 10.3 Funding roadmap

| Round | When | Amount | Gate that unlocks it | Buys |
|---|---|---|---|---|
| Bootstrap MVP | Now | KSh 1.5M (founder, GoldOak commission, grant) | None | Founder + one contract engineer + licensing opinion + design system, 12 months |
| Pre-seed | Month 12 | KSh 20–30M ($150–230K) | 25 paying seats, churn < 4%, licence opinion in hand | Second engineer, customer success, network pilot, first insurer dashboard, broker licence application if required |
| Seed | Month 24–30 | $1.5–2.5M | 150 seats, 50 network agents, KSh 1bn premium, one insurer paying | Engineering team of 5, sales, compliance officer, two insurer APIs, embedded pilot |
| Series A | Month 42–48 | $6–10M | KSh 6bn premium, 3 APIs, 2 partners, unit economics proven | Second country, developer platform, claims OS |

KSh 800,000 buys the licensing opinion, the design system, three months of a contractor and a spreadsheet version of the workflow in daily use at GoldOak. That is not nothing: it is the evidence that raises the next KSh 700,000. It does not buy a product.

---

## Part 11 — Moat

Ranked by when it can realistically exist.

1. **Workflow lock-in (Year 1).** The client history, documents, versioned advice and renewal diary live in the file. Leaving means losing the file.
2. **Insurer behaviour data (Year 2).** Turnaround, pricing behaviour, hit-rate and claims conduct per insurer per class, accumulated from ordinary use. Nobody else records it because nobody else runs the request workflow.
3. **Risk-profile corpus (Year 2–3).** The largest structured base of SME exposures in the market. The training data for matching and pricing intelligence.
4. **Licence plus network (Year 2–3).** A regulated umbrella with hundreds of members is a distribution asset a software competitor cannot copy by hiring engineers.
5. **Integrations (Year 3+).** Adapters and agreements per insurer, each earned with volume.
6. **Embedded ecosystem (Year 4+).** Partners whose products depend on our rails.
7. **Brand (continuous).** "The file that stands up at claim time."

What becomes impossible to replicate at 100,000 clients, 10,000 agents and hundreds of product integrations: a competitor would need the agents (who will not move because their book lives here), the insurer record (which only accrues through use), the risk profiles (which only accrue through advice), the licences (which take years), and the partners (who integrate with volume). Each is copyable in isolation over years. Together they compound, and the flywheel below is what makes them compound.

<!-- block:flywheel -->

Network effects, judged honestly: agent-side and insurer-side effects are real but indirect (more agents make the insurer record better, which makes the platform better for the next agent). Data effects are real. Customer-to-customer effects are not real and should not be claimed. Developer effects exist only after Phase 4.

---

## Part 12 — Regulation

All **[verify]** with IRA, ODPC and counsel; ordered by how much of the plan depends on the answer.

| # | Question | If the answer is restrictive |
|---|---|---|
| 1 | May a broker or multi-insurer agency in Kenya operate a network of sub-intermediaries, share commission with them and hold the client relationship on their behalf? Is there a sandbox route? | Model H collapses to SaaS plus insurer technology; plan for a $100M valuation, not $100M revenue |
| 2 | GoldOak's licence category today, and the one this model needs (agent, multi-agency, broker); permitted self-description; PI and capital requirements | Wording of comparison, recommendation and "independent" changes; broker licence application budgeted (Year 2) |
| 3 | Is a SaaS platform used by licensed intermediaries itself an intermediary? Does a fee expressed as a percentage of premium change that? | Platform fees priced per policy or per seat, never per premium |
| 4 | Premium handling: who may collect, into which account, within what period; cash-and-carry | In-app payment routes only to insurer or licensed-intermediary accounts; Super Agent never holds premium |
| 5 | Commission disclosure to clients | Disclosure block in every proposal |
| 6 | What constitutes an adequate needs assessment and suitability record | The fact-find and versioned risk profile are designed to be that record |
| 7 | Data Protection Act 2019: registration, lawful basis, marketing consent, DPIA for health data, retention, cross-border transfer including to AI vendors | Consent capture, DPIA before medical, residency decision, vendor DPAs |
| 8 | AML and KYC obligations for intermediaries | KYC checklist; unusual-premium flags |
| 9 | Electronic signatures and records under the Business Laws (Amendment) Act 2020; insurer acceptance | E-sign only with accepting insurers; wet-ink fallback |
| 10 | Whether AI-generated explanations to clients constitute advice; audit expectations | Client Explainer stays gated; every output sourced and approved |
| 11 | Embedded distribution: who is the licensed intermediary in each partner flow | Partner contracts name the licensed party; no flow without one |
| 12 | Insurer portal terms of use | No automation without written permission |
| 13 | Consumer protection: cooling-off, complaints handling, mandatory disclosures | Complaints log with SLAs; proposal template |
| 14 | Messaging consent and sender-ID registration | Consent flag; template approval |

Budget KSh 120,000 in Year 1 and a compliance officer from the seed round.

---

## Part 13 — Roadmap

| Horizon | Product and engineering | AI | Partnerships and sales | Compliance | KPIs | Budget (KSh) |
|---|---|---|---|---|---|---|
| 30 days | Stack chosen; data model migrated; auth, client record, insurer registry live; GoldOak fact-find in daily use on a spreadsheet; design system | Golden set of 50 quotes collected | GoldOak baseline measured: time per placement, renewal rate, covers per client | Licensing opinion commissioned (questions 1 and 2 of Part 12); ODPC registration filed | Baseline numbers recorded | 150,000 |
| 60 days | Fact-find (SME, motor), risk profile, quote request manager, email out and in | Extraction on the golden set; field accuracy measured | First 30 GoldOak clients migrated | — | Extraction ≥ 90% on money fields | 130,000 |
| 90 days | Comparison, recommendation, proposal PDF and link, WhatsApp deep links; every GoldOak placement through the platform | Reasoning Drafter in use, adviser-approved | Five friendly agencies identified | Opinion received; wording adjusted per licence | Time per placement ≤ 60 min | 130,000 |
| 6 months | Renewal diary, tasks, claims tracker, reports, multi-tenant hardening; five agencies live | Follow-up Drafter; Claims Summariser | Case study from GoldOak; product catalogue at 60 records | Cyber cover placed; DPIA outline | Gate 1 passed; 5 agencies weekly active | 400,000 |
| 12 months | Client wallet page with OTP; M-Pesa subscription billing; agency roles; onboarding tooling; country config file | Compliance Checker; eval suite in CI | 25 paying seats; events; content; pre-seed opened | Broker licence path decided | MRR ≥ KSh 70,000; churn < 4%; 12 months of turnaround data on 8 insurers | 640,000 |
| 24 months | Network member tenancy and commission split; insurer dashboard; first adapter (motor); WhatsApp Cloud API; e-signature; premium payment links (post-opinion) | Product Matcher on 40+ products | 150 seats; 50 network agents; 1 insurer paying; 3 brokerages | Compliance officer hired | KSh 1bn premium via platform; break-even in sight | Seed round |
| 36 months | Embedded API and sandbox; corporate workspace; claims OS v1; second-country config | Client Explainer (gated); command bar | 800 seats; 200 network agents; 2 partners; 3 APIs | Second-country regulatory study | KSh 2.5bn premium; revenue KSh 45M | Series A prep |

What we do not build in the first twelve months: native iOS or Android apps; a consumer marketplace; every insurance class; any second country; more than two insurer adapters; predictive models; blockchain or crypto anything; microservices; social features; a chatbot that talks to clients about cover; a rating engine that pretends to know premiums it does not; anything only GoldOak wants.

---

## Part 14 — The founder test and the investor story

### 14.1 Twelve answers

1. **Single biggest opportunity.** Being the licensed, data-rich rails through which independent agents and embedded partners distribute insurance in East Africa. Not software. Distribution with software inside it.
2. **Biggest mistake we could make.** Building the marketplace, the consumer AI adviser or a second country before the placement workflow is used daily by 150 agents, or raising venture money before knowing the answer to the network question.
3. **Build first.** The placement workflow inside GoldOak, with document AI, in twelve weeks.
4. **Absolutely not build.** Real-time quoting from insurers that have no API; a consumer app; anything that takes a share of premium before counsel says it may.
5. **First ten customers.** GoldOak, then nine Nairobi agencies of 2–10 people placing SME, WIBA, group medical and property business, found through insurer BDOs who know which agencies are organised.
6. **Insurers to approach first.** From the panel, the three with the best measured turnaround on SME and motor after 90 days of data; the shortlist to test is APA, CIC and Jubilee.
7. **Product class.** SME programme (WIBA, fire and burglary, GPA, employer's liability) with motor inside it. Medical and life later.
8. **Minimum team.** Founder, one full-stack contract engineer, compliance counsel on retainer, a fixed-fee designer, two advisers. Year 2: second engineer, customer success, compliance officer.
9. **Minimum capital.** KSh 1.5M to the first gate; KSh 25M to the network pilot; $2M to a platform business.
10. **Metric that proves product-market fit.** Weekly active agencies placing ≥ 3 quote requests through the platform, with monthly churn under 3% at paid pricing. North star from then on: **premium placed through the platform per month**, because it is the number every revenue stream is a function of.
11. **What could stop $100M.** The regulator says no to networks; insurers refuse standard packs and API access; a funded competitor bundles a free workstation with issuance; the founder runs the agency, the product and the degree at once; a data breach involving health records.
12. **What would make it extraordinarily valuable.** A regulated network of ten thousand agents earning better commission on our rails, an insurer record nobody else has, the SME risk corpus of a region, and the API that a bank or a SACCO calls when a loan needs cover.

### 14.2 The investor narrative

**Problem.** Insurance in Africa is sold by people, and those people run on email, Excel and WhatsApp. Advice is undocumented, renewals lapse, claims vanish, and insurers rework half their submissions. Penetration is 2.4%.

**Solution.** Super Agent is the operating system for insurance distribution: it turns a conversation into a documented risk profile, a market request to every insurer, a normalised comparison, a reasoned proposal and a serviced policy, and then becomes the licensed rails those agents and partners distribute through.

**Why now.** Universal smartphones and mobile money; a regulator pushing documentation; language models that read any insurer's PDF for a shilling; a competitor set that solved quoting and not advice.

**Market.** KSh 395bn of premium in Kenya, $30bn in Africa outside South Africa, a commission pool in Kenya alone of about $200M, and 15,000 agents with no operating system.

**Product.** Live inside GoldOak, a licensed agency, from Month 3. Six modules, mobile-first, works with every insurer today.

**Traction.** GoldOak's measured before-and-after; then seats, agencies, premium through the platform, and insurer turnaround data no one else holds.

**Business model.** Subscriptions to enter; platform fees on premium through the licensed network to scale; insurer technology, embedded API and analytics on top.

**Moat.** The file, the insurer record, the risk corpus, the licence, the network, the integrations, in that order.

**Expansion.** Country configuration, not forks. Uganda and Rwanda first because the regulators are cooperative and the markets are small enough to learn on; Nigeria and Ghana when the model is proven.

**Financial opportunity.** $10M revenue on East Africa in six to seven years is a $100M company. $100M of revenue is a six-country, ten-year outcome that this plan makes possible and does not promise.

**The vision.** Customers experience simplicity. Agents experience productivity. Insurers experience distribution. Businesses experience visibility. Developers experience infrastructure. The platform accumulates data, integrations, distribution, workflows, trust and intelligence, and that is the moat.

---

*Prepared as founder reasoning for GoldOak Insurance Agency Limited and Super Agent. Market statistics to be re-verified against current IRA and AKI publications; every [verify] item to be confirmed with counsel before reliance.*
