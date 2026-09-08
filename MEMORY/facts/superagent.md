---
name: superagent
description: "Super Agent as a product: the console, AI telemetry, the global policy layer, and how tenant neutrality is enforced."
metadata.type: fact
---

## Three distinct things
- **Super Admin** (`/admin`) — the platform operator. Belongs to no agency.
- **Super Agent** (`/superagent`) — the AI product serving every agency. Platform-level, admin-gated in middleware (`/superagent` maps to the `admin` area).
- **Agencies** (`/agency/*`) — tenants. GoldOak is one of them with no special code path.

## The console
`/superagent` overview (answers, success rate, median latency, agencies served, daily chart, busiest agencies, engine, models, recent trouble), `/superagent/agencies` (usage and setup quality per tenant), `/superagent/knowledge` (global policy), `/superagent/configuration` (models and integrations, read from the environment), `/superagent/monitoring` (failures, fallbacks, failed jobs).

## Telemetry (`services/ai-insights.ts`)
Every model call writes one `ai_events` row: organisation, kind, channel, model, vendor, whether a fallback was needed, ok, escalated, latency, error. **No question or answer text** — the conversation itself already lives tenant-scoped in `conversation_messages` and `consultations`, so the console can be read across agencies without leaking content. `recordAiEvent` runs in the background and never throws.

## Prompt assembly (`services/consult.ts`)
1. Agency layer: name, tone, services, FAQs, escalation, do-not-say — from that agency's `ai_settings`.
2. Fixed ground rules, including: never mention, recommend or compare another agency or intermediary; never reveal anything about another agency on the platform; "who built you" → "it runs on the Super Agent platform".
3. Platform policy from `ai_policies` (scope `global`), cached for 60 seconds: extra ground rules, shared knowledge, banned phrases.
4. Neutral product catalogue (product types, never who sells them).
5. The person's own records and conversation memory.

Nothing from one agency ever enters another agency's prompt. Agency-specific knowledge is loaded only for the agency being served.

## Model resilience
`chat()` tries `AI_MODEL`, then each model in `AI_FALLBACK_MODELS`, on 429/5xx/404/410 or timeout. Nemotron-3 models are sent `chat_template_kwargs.enable_thinking=false` so they answer instead of reasoning aloud. When no model answers, the catalogue fallback says so plainly rather than pretending.
