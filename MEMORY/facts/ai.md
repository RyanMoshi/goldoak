---
name: ai
description: "The AI provider layer: which vendor and models, OCR and vision, memory, grounding rules, and how to switch."
metadata.type: fact
---

## One door: `lib/ai/provider.ts`
- `aiVendor()` → `anthropic` when `ANTHROPIC_API_KEY` is set, else `nvidia` when `NVIDIA_API_KEY` is set, else `none`.
- `chat({ system, messages, maxTokens, temperature, json, timeoutMs })` → string or `null`. Roles are normalised (alternating, leading assistant dropped). `json: true` asks for a single JSON object; parse with `parseJson<T>()`.
- `describeImage(image, prompt, { json })` → vision model. `ocrImage(image)` → document-parse model (layout blocks with text), falling back to vision transcription.
- Reasoning models sometimes leak `<think>` blocks; `clean()` strips them.
- Every call has a timeout and never throws; callers fall back to deterministic behaviour (catalogue answers, "could not read", numbered menus).

## NVIDIA NIM (current production)
OpenAI-compatible endpoint `https://integrate.api.nvidia.com/v1/chat/completions` with `Authorization: Bearer NVIDIA_API_KEY`. Models (override with env):
| Env | Default | Used for |
|-----|---------|----------|
| `AI_MODEL` | `nvidia/nemotron-3-super-120b-a12b` | consultation, intent classification, extraction from OCR text, memory summaries |
| `AI_VISION_MODEL` | `meta/llama-3.2-11b-vision-instruct` | structured extraction from an image (the 90b variant timed out) |
| `AI_OCR_MODEL` | `nvidia/nemotron-parse` | OCR; accepts image-only content and answers with a `markdown_bbox` tool call of blocks |
Verified 2026-09-08 with the keys in `.env.local` ("NVIDIA KEY", "Kimi_KEY", "Nemotron" are all `nvapi-…` keys for the same NIM account; `moonshotai/kimi-k2-instruct` is retired and `kimi-k2.6` is not enabled on this account). Rate limits are per key; the same key works for all three model calls.

## Anthropic (optional)
Set `ANTHROPIC_API_KEY` (model `ANTHROPIC_MODEL`, default `claude-opus-5`, adaptive thinking) and the same code paths switch vendor. No code change.

## Where the AI is used
- `services/consult.ts`: grounded consultation (catalogue + person's records + memory); `[HANDOFF]` token → human handoff.
- `services/memory.ts`: `understand()` intent classification (rules first, model when unsure), `refreshSummary()` background summaries (`memory-summary` job every 8 inbound messages), `memoryContext()`.
- `services/uploads.ts`: `processUpload()` OCR + extraction (`ocr-upload` job), `Extracted { documentType, summary, fields, confidence }`.
- `/api/consult`: public, rate-limited, not personalised.

## Grounding rules (in the system prompt)
No firm premiums, no claim promises, no invented terms; say "I don't have enough information…"; assistant is not a licensed adviser; escalate complaints, disputes, live claim decisions and firm prices with `[HANDOFF]`. Every extracted document field must be confirmed by the person before it counts.
