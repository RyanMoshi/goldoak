# Super Agent — Product Strategy

### The operating system for advice-led insurance intermediaries, starting with GoldOak, Kenya

*Version 1.0 · September 2026 · Built on the redesigned concept in 01_Critique_and_Redesign.md*

**How to read this.** Thirty-three sections, in the order the master prompt asked for them. Every feature is judged against the master prompt's seven questions (problem, beneficiary, automation, data, human involvement, regulation, revenue); where a feature is in the MVP the answers are in the MVP table (section 8), and where it is later they are in the roadmap notes. Everything regulatory is flagged **[verify]** where it must be confirmed with IRA, ODPC or counsel before it is relied on.

---

## 1. Product vision

**North star:** *Tell us what you want to protect. We'll help you figure out the rest.*

**Product thesis:** Insurance is hard to buy and hard to sell because the administration around it is manual, fragmented and undocumented. The intermediary who does the work properly — understands the risk, goes to market, compares honestly, documents the advice, services the policy and fights the claim — is doing four hours of admin for every hour of advice. Super Agent removes the admin so the advice can scale.

**What Super Agent is:** a cloud workstation for licensed intermediaries that turns a client conversation into a risk profile, a standardised market request, a reasoned comparison, a branded proposal, a serviced policy, a tracked claim and an automatic renewal — with a human adviser deciding at every step that requires judgement.

**What it is not (yet):** a consumer marketplace, a rating hub, an AI adviser or a pan-African platform. Those are gated behind evidence (see roadmap).

**Three promises:**
- To agents: less administration, more clients, more revenue — and a file that will stand up at claim time.
- To clients: understand what you have, why you have it, and where your claim is.
- To insurers (later): cleaner submissions, faster decisions, and data you do not have today.

---

## 2. Product architecture (conceptual)

```
                CLIENTS                          INSURERS
   (web link / WhatsApp / in person)        (email / portal / API)
              │                                      ▲
              ▼                                      │
 ┌──────────────────────────────────────────────────────────────┐
 │                      SUPER AGENT WORKSTATION                  │
 │                                                              │
 │  Fact-find ─► Risk Profile ─► Quote Requests ─► Comparison   │
 │      │            │               │                │         │
 │      ▼            ▼               ▼                ▼         │
 │   CRM / Client Record  ◄──  Documents  ◄──  Proposal Gen     │
 │      │                                                       │
 │      ├─► Policies ─► Renewal Diary ─► Renewal Campaigns      │
 │      ├─► Claims Tracker ─► Insurer Follow-up ─► Settlement   │
 │      └─► Tasks / Follow-ups / Notifications                  │
 │                                                              │
 │  ┌─────────────────────┐  ┌──────────────────────────────┐  │
 │  │ Insurer Registry &  │  │ Integration Layer            │  │
 │  │ Performance DB      │  │ (email-in, PDF extract,      │  │
 │  │ (appetite, SLAs,    │  │  manual entry, rate tables,  │  │
 │  │  commission, claims)│  │  API adapters when available)│  │
 │  └─────────────────────┘  └──────────────────────────────┘  │
 │                                                              │
 │  Cross-cutting: Auth & roles · Audit log · Document store    │
 │  · Notifications (email/SMS/WhatsApp link) · Reporting       │
 └──────────────────────────────────────────────────────────────┘
```

**Layers:**
1. **Experience layer** — mobile-first web app (agent), lightweight client web pages (proposal view, document upload, claim form), WhatsApp deep links.
2. **Workflow layer** — pipeline states, tasks, SLAs, reminders.
3. **Domain layer** — client, risk profile, quote request, quote, comparison, proposal, policy, endorsement, claim, renewal, insurer.
4. **Integration layer** — adapters that normalise insurer responses regardless of channel.
5. **Data layer** — PostgreSQL, object storage for documents, audit log.
6. **Intelligence layer (Phase 2+)** — document extraction, drafting, matching, analytics.

---

## 3. User personas

| Persona | Who | Today's pain | What they need from Super Agent |
|---|---|---|---|
| **Adviser (GoldOak principal)** | Runs a small agency; advises, places, services | Re-keys client data 4–6 times; Excel comparisons; renewals in a diary; claims chased over WhatsApp | One client record; fast comparison; audit-ready file; nothing missed |
| **Agent (independent, 1–3 lines)** | Motor/medical-heavy, commission-driven, phone-first | Quotes take a day; loses clients to faster agents; no professional output | Speed, a branded proposal, renewal reminders |
| **Agency admin / servicing officer** | Handles endorsements, documents, premium follow-up | Lost documents; policy schedule in email threads | Document management, task lists, status tracking |
| **Claims handler** | Chases insurers, assembles documents | Nobody knows where the claim is; clients call constantly | Checklist, status board, automatic client updates |
| **SME owner (client)** | Runs a 5–50 person business; time-poor | Doesn't know what cover they have or need; fears WIBA penalties | One page: what I have, what I'm missing, what it costs, when it renews |
| **Individual client** | Motor/medical buyer; WhatsApp-native | Doesn't understand exclusions; discovers them at claim time | Plain-language proposal, one link to everything |
| **Insurer business-development officer** (later) | Wants clean submissions and volume | Incomplete requests, re-work | Standardised request pack; turnaround dashboard |

---

## 4. Customer journeys

**Journey A — New SME client (the core loop)**
1. Discover: referral / WhatsApp / website → agent creates lead in 30 seconds.
2. Fact-find: agent runs the SME conversation (business type, premises, people, stock, vehicles, contracts) on a phone in a meeting; system captures it structured.
3. Risk profile: system produces an SME Risk Map (exposures → recommended protection areas → missing information) which the adviser edits and signs off.
4. Market request: one standard request pack is generated per insurer selected from the registry (filtered by appetite); sent by email/portal/API.
5. Responses captured (PDF extract, email-in or manual entry); comparison auto-builds.
6. Adviser tags: cheapest / best value / broadest / recommended, and writes the reasoning (system pre-drafts from the comparison).
7. Proposal generated (PDF + web link); client views on phone; accepts.
8. Onboarding: documents uploaded via link; payment instructions; policy placed; documents delivered; wallet page live.
9. Service: endorsements, renewal diary starts at day 90-before-expiry.

**Journey B — Renewal:** system opens a renewal case at 90 days → adviser reviews changes → market re-approached at 45 → options at 30 → reminders at 14/7 → escalation at expiry. Client sees one link.

**Journey C — Claim:** client taps "I need to make a claim" → guided form → claim record + insurer notification + checklist → weekly status update to client automatically until settled.

**Journey D — Individual motor client (fast path):** registration number + use + value + drivers → request pack to 3 insurers → comparison → proposal same day.

---

## 5. Agent journeys

- **Day start:** Today view — new leads, quotes awaited (with days outstanding by insurer), proposals awaiting client decision, renewals due, claims needing action, outstanding documents.
- **Pipeline:** Lead → Fact-find → Requested → Compared → Proposed → Accepted → Paid → Placed → Live → Renewal. Each stage has an SLA from GoldOak's service charter (enquiry acknowledged 4h, quotation 3 working days of complete information, documents 3 days, endorsement 2 days, claim acknowledged 1 day).
- **Working a quote:** open request, see insurer responses side by side, fill gaps, request clarification with one click, mark recommendation.
- **Reporting:** premium, commission, by insurer / product / client / month; turnaround; renewal rate.
- **Week end:** renewal diary review; overdue insurer responses chased automatically.

---

## 6. Insurer journeys

**Phase 1 (no integration):** insurer receives a clean, complete, standardised request pack by email, replies by email; their turnaround and pricing behaviour are recorded on the GoldOak side. They feel nothing except fewer clarification calls.

**Phase 2 (data conversation):** GoldOak shows the insurer their own turnaround, hit-rate and claims-response record versus anonymised panel averages. This is the opening for an integration conversation.

**Phase 3 (integration):** rate-table feed or API adapter; insurer dashboard (submissions received, quotes issued, hit-rate, renewal retention); optional technology fee **[verify commercial and regulatory permissibility]**.

---

## 7. Core features (full product, all phases)

Grouped by the automation filter.

**Automate (software does it):** client record de-duplication; request-pack generation; comparison table build; proposal PDF; document classification and filing; renewal diary and reminder cadence; insurer chasing on SLA breach; claim status updates; commission calculation; reports.

**Assist (AI or software drafts, human approves):** risk map from fact-find; recommendation reasoning draft; PDF field extraction from insurer quotes and schedules; plain-language exclusion summary; claim checklist by product; renewal change detection.

**Escalate (human decides):** which insurers to approach; the recommendation itself; any deviation from suitability; claim disputes; premium negotiation; anything a licence requires a person to sign.

---

## 8. MVP feature list (Phase 1) — with the seven questions

MVP = what GoldOak runs 100% of its own new business through for 90 days before anyone else sees it.

| # | Feature | Problem solved | Who benefits | How automated | Data required | Human involvement | Regulatory | Revenue effect |
|---|---|---|---|---|---|---|---|---|
| 1 | **Client CRM** (individual + business; contacts; assets; dependants; vehicles; employees; documents; interactions) | Data re-keyed 4–6×; lost history | Agent, client | Single record; auto-link policies, quotes, claims | Identity, contact, KYC docs | Agent enters/edits | DPA 2019: lawful basis, consent record, retention rule **[verify ODPC registration]** | Retention; cross-sell visibility |
| 2 | **Risk fact-find** (guided, per segment: individual / motor / SME) with progressive disclosure | Needs assessment undocumented; questions forgotten | Adviser, client, compliance | Branching question sets; outputs structured risk profile | Answers, existing policies | Adviser conducts, signs off | Documented needs assessment supports suitability and "advice we give" record | Enables multi-line placement (2–3× covers per client) |
| 3 | **Insurer registry** (identity, appetite by product, contacts, commission, turnaround, documentation, claims process, notes) | Appetite knowledge lives in the principal's head | Agent, agency | Filters which insurers to approach; logs every interaction | Insurer master data; commission terms | Agency maintains | Commission disclosure to client where required **[verify]** | Faster placement; future data asset |
| 4 | **Quote request manager** (standard request pack per insurer; sent by email; responses captured by email-in, PDF upload or manual entry; status and days-outstanding) | 2–4 hours of emails and chasing; mismatched formats | Agent, insurer | Pack generation; SLA chase reminders; normalised quote object | Risk profile; insurer requirements | Agent selects insurers, keys any missing fields | Request pack must not misstate the risk; declarations captured | The 4h→30min claim, honestly |
| 5 | **Comparison builder** (premium, limits, excess, exclusions, benefits, conditions, add-ons, payment terms, validity; cheapest / best value / broadest / recommended with reasoning field) | Excel comparisons; price-only decisions | Adviser, client | Table auto-builds from quotes; drafts reasoning stub | Normalised quotes | Adviser chooses and explains | Recommendation must be suitable and reasoned; agent-vs-broker wording **[verify]** | Higher conversion; larger average premium |
| 6 | **Proposal generator** (branded PDF + web link: summary, options, recommendation, exclusions, excess, next steps, disclaimers) | Manual Word/PDF prep | Agent, client | One click; WhatsApp deep-link share | Comparison, agency branding | Adviser reviews before send | Mandatory disclosures, licence number, IRA disclaimer text | Professional output wins clients |
| 7 | **Document management** (upload via link; classify; link to client/policy/claim; missing-document checklist) | Documents scattered in WhatsApp/email | Everyone | Auto-file by type; missing-doc reminders | Files | Agent confirms classification | Secure storage, access control, retention/deletion workflow | Fewer failed claims |
| 8 | **Policy register + renewal diary** (expiry detection; 90/45/30/14/7/0 cadence; email + SMS + WhatsApp link) | Missed renewals | Agency, client | Fully automated cadence | Policy dates, premiums | Adviser handles review | Marketing consent for outbound messages **[verify]** | Renewal rate = the agency's income |
| 9 | **Tasks and follow-ups** (auto-created from SLAs; manual) | Forgotten follow-ups | Agent | SLA-driven | Pipeline state | Agent completes | — | Throughput |
| 10 | **Basic claims tracker** (intake form; checklist by product; insurer notification; status; 7-day client update) | "Where is my claim?" | Client, claims handler | Checklist and update cadence automated | Claim details, documents | Handler drives insurer | Claim notification obligations; no admission of liability by system text | Retention; advocacy is GoldOak's brand |

Ten items look like a lot; in practice 1, 3, 7 and 9 are the same data model, and 4–6 are one pipeline. It is a six-module product.

**Explicitly not in MVP:** real-time insurer APIs, client-facing AI, consumer portal beyond proposal/upload/claim links, payments in-app, e-signature, WhatsApp Platform, corporate workspace, embedded insurance, multi-agency tenancy beyond GoldOak plus pilot agencies.

---

## 9. Phase 2–4 roadmap

Gates are from the critique document; each phase starts only when its gate is passed.

**Phase 2 — "Serve" (gate: 25 paying external seats)**
- Client portal: insurance wallet ("what insurance do I have?"), documents, certificates, renewal dates, claim status.
- Payments: M-Pesa (Daraja) and card links for premium and subscription; receipts; reconciliation. Premium handling rules **[verify: who may collect premium, into which account, within what period]**.
- E-signature on proposal forms **[verify: Business Laws (Amendment) Act 2020 recognition and insurer acceptance]**.
- WhatsApp Business Platform for renewal campaigns and document requests (template messages).
- Document AI: extract fields from insurer quotes and policy schedules; auto-populate comparison.
- Rate-table engine for lines where insurers publish tariffs (indicative premium, clearly labelled).
- Endorsement workflow.
- Multi-agency tenancy, roles, agency branding, brokerage plans.

**Phase 3 — "Match" (gate: 150 paying seats, 12 months of insurer data on 10+ insurers)**
- First insurer API/data-feed integrations (motor first).
- Insurer dashboard (their turnaround, hit-rate, retention).
- Product matching engine: risk profile → recommended protection programme → candidate insurers by appetite (assistive, adviser confirms).
- SME risk engine as a client-facing self-assessment that feeds the adviser.
- Client-facing plain-language explanations from approved product data only, with AI audit trail.
- Proactive risk triggers (new vehicle, headcount change, new premises).
- Analytics: retention, covers per client, insurer performance league.

**Phase 4 — "Infrastructure" (gate: 300 seats, 2 live APIs, a profitable quarter)**
- Corporate workspace (subsidiaries, locations, census, fleet, asset register, approvals).
- Embedded distribution for partners (SACCOs, HR/payroll platforms, vehicle marketplaces) **[verify: who is the licensed intermediary in each embedded flow]**.
- Marketplace layer only if licensing permits and the agent base wants it.
- Regional expansion study (Uganda, Rwanda first: smaller markets, cooperative regulators) — no build until study concludes.

---

## 10. UX architecture

**Principles:** mobile-first (Android, low bandwidth, sub-200KB pages, offline-tolerant forms); one screen per decision; progressive disclosure; every insurance term has an inline plain-language tooltip from the translation layer; agent and client never see the same screen; nothing hidden that affects the client's money.

**Information architecture (agent app):**
```
Home (Today)
├── Clients
│   └── Client 360: Profile · Risk profile · Policies · Quotes · Claims · Documents · Timeline · Tasks
├── Pipeline (kanban by stage)
├── Quotes
│   └── Request: Pack · Insurers · Responses · Comparison · Proposal
├── Renewals (calendar + list)
├── Claims (board)
├── Insurers (registry)
├── Reports
└── Settings: Agency · Branding · Users · Templates · Consent texts
```

**Client surfaces (link-based, no login in MVP; OTP login in Phase 2):** Proposal view → Accept → Upload documents → Policy wallet → Claim form → Claim status.

---

## 11. Screen-by-screen application structure (MVP)

| # | Screen | Purpose | Key elements |
|---|---|---|---|
| 1 | Sign in | Auth | Phone/email + OTP; agency selection |
| 2 | Today | Daily control | Counters: leads, quotes awaiting (with oldest days), proposals out, renewals ≤30d, claims needing action, missing docs; task list |
| 3 | Client list | Find/create | Search, segment filter, "new client" |
| 4 | New client | Capture | Type (individual/business); minimal fields; consent capture |
| 5 | Client 360 | Everything | Tabs as in IA; timeline of interactions |
| 6 | Fact-find | Needs assessment | Segment-specific flow; progress bar; "skip and flag" for unknowns |
| 7 | Risk profile | Output | Exposures list; recommended protection areas; gaps; "approve" |
| 8 | New quote request | Go to market | Product line; auto-suggested insurers from appetite; checklist of required fields; generate pack |
| 9 | Request detail | Track | Per-insurer status, days outstanding, chase button, add response |
| 10 | Add response | Capture | Upload PDF → extracted fields (Phase 2) / manual form (MVP) |
| 11 | Comparison | Decide | Table; highlight differences; tag options; reasoning box |
| 12 | Proposal preview | Send | Branded PDF; share via WhatsApp link / email; track viewed/accepted |
| 13 | Policy | Record | Insurer, number, dates, premium, commission, documents, endorsements |
| 14 | Renewals | Diary | Calendar and list; cadence status per policy |
| 15 | Claims board | Track | Stages: Notified · Registered · Documenting · With insurer · Assessed · Settled · Closed |
| 16 | Claim detail | Work | Checklist, documents, insurer contact, update log, next update due |
| 17 | Insurer registry | Reference | Cards; appetite matrix; contacts; performance stats |
| 18 | Reports | Manage | Premium/commission by dimension; turnaround; renewal rate |
| 19 | Settings | Configure | Branding, users, templates, disclosure texts |
| C1 | Client proposal page | Client decides | Options, recommendation, exclusions, accept button, questions |
| C2 | Client upload page | Documents | Checklist; camera upload |
| C3 | Client wallet page | "What do I have?" | Policies, dates, documents, contacts (Phase 2 login) |
| C4 | Claim form | Notify | Guided questions; photo upload |

---

## 12. AI architecture

**Principle:** AI is assistive and internal first; client-facing only from approved data with an audit trail.

| Tier | Use | Data source | Safeguard |
|---|---|---|---|
| **Tier 0 (MVP)** | None in production. Templated drafting only. | — | — |
| **Tier 1 (Phase 2) — document intelligence** | Extract premium, limits, excess, exclusions from insurer quote PDFs and schedules; classify uploaded documents; summarise claim email threads | The document itself | Extracted fields shown for confirmation; never auto-accepted |
| **Tier 2 (Phase 2–3) — drafting** | Draft recommendation reasoning from a completed comparison; draft plain-language exclusion summary; draft renewal review notes | Structured comparison + insurer product data on file | Adviser edits and approves; draft watermark until approved |
| **Tier 3 (Phase 3) — matching** | Risk profile → protection areas → candidate products/insurers by appetite | Risk profile + insurer registry + approved product catalogue | Suggestions only; suitability decision by adviser |
| **Tier 4 (Phase 3) — client-facing explanations** | "What does this excess mean?" on proposal page; claim guidance | Retrieval over approved product wording only; refuses outside it | AI audit trail (input, source, output, approval); disclaimer; escalate-to-human button |

**Never:** invent terms, guarantee acceptance or claims, alter insurer documents, make underwriting decisions, give legal/financial advice.

**Implementation:** hosted LLM via API (Claude or equivalent) with retrieval over the agency's approved documents; prompts and outputs logged; PII minimised in prompts; data-processing agreement with the model vendor **[verify ODPC cross-border transfer requirements]**.

---

## 13. Automation opportunities (ranked by hours saved × frequency)

1. Renewal detection and reminder cadence — every policy, every year.
2. Standard request-pack generation — every new placement.
3. Comparison table build from captured quotes — every placement.
4. Insurer chasing on SLA breach — daily.
5. Proposal PDF and link — every placement.
6. Client document requests and missing-doc tracking — every onboarding and claim.
7. Claim status updates every 7 days — every claim.
8. Commission calculation and insurer reconciliation — monthly.
9. Document classification and filing — continuous.
10. Weekly agency reports — weekly.

---

## 14. Insurer integration architecture

**Adapter pattern.** Every insurer is an adapter that implements the same interface: `submit(request_pack) → submission_id`, `capture(response) → NormalisedQuote`, `status()`. Channels behind the adapter:

| Channel | When | Cost | Reliability |
|---|---|---|---|
| Email-out + email-in (parsed) | MVP, all insurers | Free | Medium |
| PDF extraction | Phase 2 | Low | Medium-high |
| Manual entry form | MVP fallback | Free | High |
| Published rate table | Phase 2, lines with tariffs | Low | Medium (staleness) |
| Portal automation | Only with written insurer permission **[verify terms of use]** | Medium | Low |
| API | Phase 3, willing insurers | High (per insurer) | High |

**Normalised quote schema:** insurer, product, premium (gross, levies, net), sum insured/limits per section, excess per section, exclusions (structured list + free text), conditions/warranties, benefits/add-ons, payment terms, validity, documents required, underwriter contact, turnaround (timestamps). Everything else is stored as attachment.

**The asset:** every submission and response timestamps insurer behaviour. Twelve months of this is the insurer conversation.

---

## 15. CRM architecture

Entities: `Client` (individual/business) → `Contacts`, `Assets` (vehicles, properties, equipment, stock), `People` (dependants, employees census), `Locations`, `RiskProfile` (versioned), `Interactions` (calls, meetings, messages), `Tasks`, `Consents`, `Documents`. Related: `QuoteRequest`, `Quote`, `Comparison`, `Proposal`, `Policy`, `Endorsement`, `Claim`, `RenewalCase`, `Commission`.

Rules: one client record per legal person; every entity links to a client; every document links to at least one entity; every interaction is timestamped and attributed; risk profile is versioned so the advice given at the time is preserved.

---

## 16. Claims architecture

States: Notified → Acknowledged (SLA 1 working day) → Registered with insurer (SLA 1 working day of documents) → Documenting → With insurer → Assessed → Offer → Settled → Closed / Disputed.

Components: intake form (client link or agent), product-specific checklist library, insurer notification template, document tracker, status log, 7-day client update automation, escalation rules (no insurer movement in N days → task to principal), settlement record, post-claim insurer performance score.

Human retained: advocacy, negotiation, dispute, anything that is advice.

---

## 17. Renewal architecture

Trigger: policy expiry date. Cadence (configurable per agency; GoldOak default): 90d open renewal case and ask "what changed?"; 45d market review (re-use last year's request pack with changes); 30d present options (matches GoldOak charter); 14d reminder; 7d urgent; 0 escalation and lapse handling. Channels: email, SMS, WhatsApp link (Phase 2: WhatsApp template). Outputs: renewal proposal, renewal rate and premium-change reporting.

---

## 18. Data architecture

- **Primary store:** PostgreSQL (row-level security per agency tenant).
- **Documents:** object storage (S3-compatible), server-side encrypted, signed short-lived URLs, virus scanning.
- **Audit log:** append-only table for every create/update/delete and every document access; retained for the statutory record-keeping period **[verify Insurance Act record retention]**.
- **Data classification:** Public (product names) · Internal (insurer appetite) · Confidential (client identity, financials) · Sensitive (health declarations, claims involving injury). Sensitive fields encrypted at column level; access logged; minimised in AI prompts.
- **Retention & deletion:** per-entity retention rule; client deletion workflow that preserves legally required records and removes the rest; export on request (DPA right of access).
- **Backups:** daily encrypted, tested restore quarterly.
- **Residency:** prefer a region acceptable under ODPC guidance; document any cross-border processing **[verify]**.
- **Analytics:** nightly warehouse copy with client identifiers pseudonymised; insurer performance metrics computed here.

---

## 19. Security architecture

Authentication: OTP (SMS/email) plus optional password; MFA for principals; session expiry. Authorisation: roles (Principal, Adviser, Servicing, Claims, Read-only, Client) with least privilege; tenant isolation enforced in the database. Transport: TLS everywhere. Secrets: managed vault. Application: OWASP top-10 controls, dependency scanning, rate limiting, input validation. Operations: logging, alerting, incident-response runbook, breach notification procedure within the DPA's timeline **[verify 72-hour requirement]**. Third parties: DPAs with hosting, messaging, AI vendors. Assurance: annual penetration test from Phase 2; SOC 2 is a Phase 4 ambition, not a Year 1 claim.

---

## 20. Regulatory and compliance considerations

All items **[verify]** with IRA, ODPC and counsel; this is a checklist, not advice.

| Area | Question to settle | Design consequence |
|---|---|---|
| GoldOak licence category | Agent vs broker; number of insurers an agent may represent; permitted self-description | Determines comparison wording, "independent" claims, recommendation language, PI level |
| Super Agent's own status | Is a SaaS tool used by licensed intermediaries itself an intermediary? Does any revenue tied to premium change that? | Keep platform out of premium/commission flow until confirmed; no per-premium fees in Phase 1 |
| Premium handling | Who may receive premium, into which accounts, remittance periods; cash-and-carry rules | In-app payment (Phase 2) routes to insurer or licensed intermediary account only; receipts |
| Commission disclosure | What must be disclosed to clients and when | Disclosure block in proposal template |
| Advice records | What constitutes a needs assessment / suitability record | Fact-find and versioned risk profile designed as the record |
| Data Protection Act 2019 | Controller/processor registration; lawful basis; consent for marketing; DPIA for health data; retention; cross-border transfer | Consent capture in CRM; DPIA before medical lines; residency decision |
| AML/KYC | CDD requirements for intermediaries; source-of-funds thresholds | KYC document checklist; flag large/unusual premiums |
| Electronic signatures & records | Recognition and insurer acceptance of e-signed proposal forms | Phase 2 e-sign only for insurers that accept it; wet-ink fallback |
| Consumer protection | Mandatory disclosures, cooling-off, complaint handling | Proposal template; complaints log with 2-day/14-day SLAs from the charter |
| Messaging | Consent for SMS/WhatsApp; sender-ID registration | Consent flag; template approval |
| AI | Whether AI-generated explanations constitute advice; audit expectations | Tier 4 gated; audit trail; human escalation |
| Embedded distribution | Who is the licensed intermediary in a partner flow | Phase 4 only |

---

## 21. Business model

Revenue streams, in the order they become real:

1. **Agent/agency SaaS subscriptions** (Year 1 onward) — the core.
2. **Onboarding and template services** (Year 1) — paid setup for brokerages; branded template packs.
3. **Insurer data and integration services** (Year 2+) — performance dashboard subscription; integration/technology fee **[verify]**.
4. **Enterprise / brokerage customisation** (Year 2+).
5. **Embedded/partner distribution** (Year 3+, conditional on licensing).

Explicitly excluded until licensing is confirmed: any share of premium or commission.

GoldOak's own economics: GoldOak pays nothing for Super Agent (it is the design partner) and contributes the founder's time; in return Super Agent's roadmap is GoldOak's workflow. GoldOak commission income is the venture's bridge financing.

---

## 22. Pricing strategy

| Plan | For | Price (KSh/month) | Includes |
|---|---|---|---|
| **Starter** | Single agent | 1,500 | CRM, fact-find, quote requests, comparison, proposals (agency-branded PDF), renewal diary; 1 user |
| **Professional** | Agent with admin support | 3,500 | Starter + claims tracker, document management, WhatsApp/SMS reminders, reports; 2 users |
| **Agency** | Small agency / brokerage | 12,000 for 5 users, +2,000 per additional user | Professional + roles, approval workflow, custom templates, priority support |
| **Setup** | Agencies | 15,000–50,000 one-time | Data migration, templates, training |

Annual billing: 2 months free. Founding customers (first 25 external seats): 50% for 12 months in exchange for feedback and a reference.

Rationale: one extra policy closed per month pays for Professional several times over; Agency plan is priced below the cost of a part-time admin.

---

## 23. Go-to-market strategy

**Year 1 sequence:**
1. **Months 1–4: GoldOak only.** Build while using. Weekly "what did we do manually this week?" review drives the backlog.
2. **Months 5–8: five design-partner agencies** recruited from the founder's network and GoldOak's insurer contacts (insurer BDOs know which agencies are organised). Free for 90 days, then founding-customer pricing.
3. **Months 9–12: 25 paying seats** via referrals from design partners, presence at AIBK/AKI/IIK events, and content ("how to document a needs assessment", "WIBA compliance checklist") aimed at agency principals.
4. **Year 2: 150 seats** via agency plan sales (5+ seats at once), insurer BDO referrals (they benefit from cleaner submissions), and the first insurer dashboard.

**Wedge:** agencies that place SME and group business (WIBA, group medical, property). They do multi-insurer placement most often, feel the admin pain most, and value documentation most. Motor-only agents are a later, cheaper-to-serve segment.

**Channel economics:** founder-led sales in Year 1; one sales/onboarding hire when MRR passes KSh 150,000.

---

## 24. Competitive positioning

| Alternative | What it does well | Where it stops | Super Agent's position |
|---|---|---|---|
| Lami (agent/broker platform, 30+ insurers, funded) | Quote, issue, commission for standard lines | Quote-first, not advice-first; no needs assessment or claims advocacy workflow | "They give you a quote. We give you a file that stands up at claim time." |
| mTek / Kakbima | Insurer-side and brokerage back-office | Not designed around the agent's client conversation | Front-office workflow, mobile-first |
| Insurer portals | Direct, free | Single insurer | Multi-insurer request and comparison |
| Email + Excel + WhatsApp | Free, familiar | Slow, undocumented, unauditable | The same workflow, structured |
| Generic CRMs (HubSpot, Zoho) | Mature | No insurance objects, no comparison, no renewals | Insurance-native |

Positioning statement: *For agencies and brokers who sell on advice rather than price, Super Agent is the workstation built around the needs assessment — it produces the market request, the reasoned comparison, the proposal and the service record, and it works with every insurer from day one, API or not.*

---

## 25. Key metrics / KPIs

**Product:** time from fact-find complete to proposal sent (target: same day); insurer response days (by insurer); % quotes captured by extraction vs manual; % renewals with options presented ≥30 days out; claims acknowledged within 1 day.

**Agency outcomes (GoldOak first):** covers per client; conversion lead→placed; renewal rate; premium and commission per adviser; complaints.

**Business:** paying seats; MRR; net revenue retention; monthly churn (<4%); CAC payback (<9 months); NPS; support tickets per seat.

**Data asset:** insurers with ≥20 submissions; months of turnaround history.

---

## 26. Unit economics assumptions (Year 1–2)

| Item | Assumption | Note |
|---|---|---|
| Blended ARPU | KSh 2,800/seat/month | Mix of Starter/Pro/Agency |
| Gross margin | 80% | Hosting, SMS, WhatsApp, AI usage ~20% |
| CAC (Year 1, founder-led) | KSh 8,000/seat | Events, travel, onboarding time |
| CAC (Year 2, with sales hire) | KSh 12,000/seat | |
| Monthly churn | 4% (Year 1) → 3% (Year 2) | Lifetime ≈ 25–33 months |
| LTV (gross-margin basis) | ≈ KSh 56,000–74,000 | LTV:CAC ≈ 5–7× — good, not 20× |
| CAC payback | ≈ 4 months | |

---

## 27. Risks

1. Licensing position forces removal of comparison/recommendation features from an agent-licensed product.
2. Agencies will not pay for software (price-sensitive, WhatsApp-satisfied).
3. Lami or an insurer bundles a free agent tool.
4. Founder bandwidth: agency, product, sales, degree.
5. Insurer refusal to accept standardised packs or e-documents.
6. Data breach involving health or financial data.
7. Under-funding; runway shorter than sales cycle.
8. Building for GoldOak's idiosyncrasies rather than the market.
9. AI output errors reaching clients.
10. Key-person/contractor departure.

## 28. Risk mitigation

1. Settle licensing first (budgeted); design comparison wording per licence type; broker plan as a feature flag.
2. Founding-customer pricing; prove ROI with GoldOak's own before/after numbers; sell to principals not agents.
3. Compete on advice workflow and data, not integrations; keep switching cost in the file (history, documents, renewals).
4. Ruthless scope (six modules); one contractor; low-code where possible; degree timeline in the plan.
5. Packs mirror each insurer's own proposal forms; wet-ink fallback.
6. Security architecture (section 19); cyber insurance; DPIA before medical lines.
7. Raise for 12 months; GoldOak commission as bridge; monthly burn review.
8. Five design partners by month 5; feature only ships if two agencies want it.
9. Tiered AI with human approval; no client-facing AI until Phase 3.
10. Documentation, shared repo, vesting.

---

## 29. Development roadmap (build view)

| Months | Build | Stack decision |
|---|---|---|
| 1–2 | Data model, auth, CRM, insurer registry, document upload; fact-find (SME + motor) | Next.js + Supabase (Postgres, auth, storage) — fast, cheap, one developer; migrate off only if forced |
| 3–4 | Quote request manager, email-in, comparison builder, proposal PDF, WhatsApp deep links | React-PDF or HTML→PDF service |
| 5–6 | Renewal diary + reminders (email/SMS), tasks, claims tracker, reports; multi-tenant hardening | Africa's Talking or equivalent for SMS |
| 7–9 | Design-partner feedback loop; PDF extraction (Tier 1 AI); endorsement workflow; agency roles | Hosted LLM API |
| 10–12 | Client wallet page with OTP login; M-Pesa for subscription billing; onboarding tooling | Daraja |
| 13–18 | Premium payment links (post-licensing decision); WhatsApp Platform templates; rate-table engine | |
| 19–24 | First insurer data dashboard; first API adapter; matching engine (assistive) | |

---

## 30. Team requirements

**Year 1 (lean):** Founder (product, GoldOak domain, sales); one full-stack contractor (0.5–1.0 FTE, KSh 80,000–120,000/month); part-time compliance counsel (retainer); designer on a fixed-fee basis for the design system (KSh 60,000–100,000 one-time). Advisers: an experienced broker principal and an insurer BD manager (equity or honorarium).

**Year 2 (post 25 seats):** second engineer; customer success/onboarding lead; part-time data analyst for insurer metrics.

**Year 3:** engineering lead; sales lead; compliance officer as embedded distribution begins.

---

## 31. Funding requirements

| Use | Year 1 (KSh) |
|---|---|
| Contractor engineering (12 months, avg 0.75 FTE) | 900,000 |
| Design system and branding | 80,000 |
| Legal: licensing opinion, ODPC registration, terms, DPAs | 120,000 |
| Hosting, SMS, email, AI, tooling | 120,000 |
| Go-to-market: events, travel, content | 100,000 |
| Contingency (10%) | 130,000 |
| **Total** | **≈ 1,450,000** |

Sources: founder and family KSh 200,000; GoldOak commission contribution (target KSh 40,000/month = 480,000); incubator/grant (Strathmore iBiz, KENIA, Villgro) KSh 300,000–500,000; angel/pre-seed KSh 400,000–600,000 for 8–12%. A second raise of KSh 5–8M in Year 2 funds the sales hire, second engineer and integrations, and should be pitched on 25+ paying seats and GoldOak's before/after data.

---

## 32. 12-month execution plan

| Month | Milestones |
|---|---|
| 1 | Licensing opinion commissioned; ODPC registration filed; stack chosen; data model; GoldOak fact-find spreadsheet in daily use |
| 2 | CRM, insurer registry, documents live for GoldOak; first 30 clients migrated |
| 3 | Quote request manager + comparison in use for every GoldOak placement; licensing opinion received; wording adjusted |
| 4 | Proposal generator; GoldOak runs 100% of new business through Super Agent (gate 1 starts) |
| 5 | Renewal diary, tasks, claims tracker; five design-partner agencies recruited |
| 6 | Design partners onboarded free; feedback cadence weekly; gate 1 passed |
| 7 | Multi-tenant hardening; PDF extraction pilot; first before/after case study from GoldOak |
| 8 | Founding-customer pricing launched; first paying seats |
| 9 | Events presence (AKI/AIBK/IIK); content series; 10 paying seats |
| 10 | Client wallet page; M-Pesa subscription billing; 15 seats |
| 11 | Agency plan first sale; 20 seats; pre-seed/Year 2 raise materials |
| 12 | 25 paying seats (gate 2); churn/NPS measured; insurer data review; Year 2 raise opened |

---

## 33. Three-year strategic vision

**Year 1 — Prove the workflow.** GoldOak runs on Super Agent; 25 paying seats; the file is the product; licensing settled; first insurer data.

**Year 2 — Prove the market.** 150 seats across 30–40 agencies; Agency plan is the main SKU; client wallet and payments live; 12 months of turnaround data on 10+ insurers; first insurer dashboard sold; second raise closed; break-even in sight at Month 20–24.

**Year 3 — Become infrastructure.** 300–500 seats; two or three insurer APIs; assistive matching; SME risk engine; profitable; embedded distribution pilots with one SACCO and one HR platform (licensing permitting); regional expansion study complete and a decision taken on Uganda or Rwanda.

**What success looks like:** a Kenyan agency principal opens Super Agent at 8 a.m. and knows every client, every quote awaiting, every renewal due and every claim's status — and a client of that agency opens one link and sees exactly what they are protected against, why, and where their claim is. Insurance is still complicated; the infrastructure around it is not.
