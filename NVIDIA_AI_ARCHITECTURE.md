# Goldoak Insurance — NVIDIA AI Architecture

## Overview

The AI stack is built around a **Super Agent** powered by an **AI Gateway** that routes requests to the appropriate NVIDIA model based on task type. This allows automatic failover, specialized model usage, and easy provider swapping in the future.

---

## AI Stack Architecture

```
                    SUPER AGENT
                         │
                     AI GATEWAY
                         │
       ┌─────────────────┼──────────────────┐
       │                 │                  │
       ▼                 ▼                  ▼
  PRIMARY LLM        BACKUP LLM       SPECIALIZED AI
   Nemotron           DeepSeek             │
       │                 │          ┌──────┼────────┐
       │                 │          │      │        │
       │                 │         OCR  Retriever  Translate
       │                 │
       └────────┬────────┘
                │
          RESPONSE ENGINE
                │
       ┌────────┼──────────┐
       │        │          │
    Database  Documents   APIs
       │        │          │
       └────────┴──────────┘
```

---

## Super Agent Request Flow

```
Super Agent
     │
     ▼
  AI Gateway
     │
     ├── Nemotron 3.5 Lightning
     │       ↓ failure
     ├── DeepSeek V4 Pro
     │       ↓ failure
     └── optional future provider

Specialized services
     ├── Kimi K3 → Vision / multimodal
     ├── Nemotron OCR v2 → OCR
     ├── Parakeet → Speech-to-text
     ├── Riva Translate → Translation
     └── Muse Glimmer → Multimodal/reasoning
```

---

## Failover Flow

```
Nemotron
   ↓
timeout/error
   ↓
AI Gateway
   ↓
DeepSeek
   ↓
response
```

The user should not notice the system switched models.

---

## Model-to-Task Mapping

| Job                              | Preferred AI                          |
|----------------------------------|---------------------------------------|
| Super Agent conversations        | Nemotron 3.5 Lightning                |
| Complex reasoning                | Nemotron / DeepSeek                   |
| Backup chat                      | DeepSeek V4 Pro                       |
| Policy/document search           | NeMo Retriever                        |
| OCR                              | Nemotron OCR v2                       |
| Images                           | Kimi K3 (multimodal)                  |
| Translation                      | Riva Translate                        |
| Safety                           | Nemotron Content Safety               |
| Simple classification            | Smaller/faster model                  |
| Embeddings                       | Nemotron Embed                        |
| Reranking                        | NeMo Retriever reranker               |
| Multimodal reasoning             | Meta Muse Glimmer 30B                 |

---

## Document / RAG Pipeline

```
         INSURANCE DOCUMENTS
                 │
                 ▼
          OCR / Extraction
                 │
                 ▼
             EMBEDDING
                 │
                 ▼
           VECTOR DATABASE
                 │
          ┌──────┴──────┐
          │             │
       Question      Documents
          │             │
          └──────┬──────┘
                 ▼
             RETRIEVAL
                 │
                 ▼
            SUPER AGENT
                 │
                 ▼
               LLM
```

This allows Super Agent to answer questions like:

> "What does this customer's policy exclude?"

using the actual policy document, not just the model's general knowledge.

---

## OCR Pipeline

```
PDF/Image
   ↓
Nemotron OCR v2
   ↓
Structured text/data
   ↓
Document storage
   ↓
RAG
   ↓
Super Agent
```

Insurance use cases for OCR:

- Scanned policies
- IDs
- Claim forms
- Invoices
- Certificates
- Receipts
- Accident reports
- Handwritten/printed documents
- Tables

---

## Translation Pipeline

```
Customer
   ↓
Swahili (or other language)
   ↓
Riva Translate
   ↓
English
   ↓
Super Agent
   ↓
Insurance workflow
   ↓
Translate response back
```

Useful for East African insurance operations serving multilingual customers.

---

## Content Safety Flow

```
User
 ↓
Safety Check (Nemotron Content Safety)
 ↓
Super Agent
 ↓
Safety Check
 ↓
Response
```

Not required for every internal operation, but useful as a platform-level control.

---

## AI Gateway Abstraction

Build the gateway with method-level routing:

```
AI Gateway
  chat()
  reason()
  summarize()
  extract()
  translate()
  embed()
  rerank()
  vision()
```

Each method internally:

```
Primary Model
   ↓
failure?
   ↓
Backup Model
   ↓
failure?
   ↓
Third Model
```

This allows adding providers later without rebuilding Super Agent:

- NVIDIA
- xAI / Grok
- OpenAI
- Anthropic
- Google
- Self-hosted model

---

## Production Architecture

```
              INSURANCE PLATFORM
                     │
               ┌─────▼─────┐
               │SUPER AGENT│
               └─────┬─────┘
                     │
               ┌─────▼─────┐
               │ AI GATEWAY│
               └─────┬─────┘
                     │
     ┌───────────────┼──────────────┐
     │               │              │
 NVIDIA NIM        xAI          Future
 Development     Production?   Provider
     │               │
     └───────────────┼──────────────┘
                     │
               YOUR AI LOGIC
                     │
     ┌───────────────┼───────────────┐
     │               │               │
  Database       Documents      Insurance APIs
     │               │               │
     └───────────────┴───────────────┘
```

---

## Important: NVIDIA Free Tier Notice

NVIDIA-hosted free endpoints are for **prototyping/development/testing**, not unrestricted production use.

- Developer Program NIM access is free for prototyping
- Production use requires NVIDIA AI Enterprise
- NVIDIA AI Enterprise starts at ~$4,500/GPU/year or ~$1/GPU/hour in cloud

**Design the AI Gateway now so you can switch providers or self-host later.**

---

## Environment Variables Reference

### App Secrets

| Variable | Purpose |
|---|---|
| `SUPERBASE_PASSWORD` | Supabase database password |
| `ADMIN_TOKEN` | Admin authentication token |
| `CRON_SECRET` | Cron job authentication |
| `SEED_ADMIN_PASSWORD` | Initial admin user password |

### OpenWA (WhatsApp API)

| Variable | Purpose |
|---|---|
| `OPENWA_API_KEY` | OpenWA API authentication |
| `OPENWA_SESSION_ID` | Active WhatsApp session |
| `OPENWA_BASE_URL` | OpenWA tunnel endpoint |
| `OPENWA_WEBHOOK_SECRET` | Webhook signature verification |
| `OPENWA_VERCEL_KEY` | OpenWA Vercel deployment key |

### NVIDIA AI — Shared

| Variable | Purpose |
|---|---|
| `NVIDIA_API_BASE_URL` | Base URL for all NVIDIA API calls |

### NVIDIA LLM — Primary

| Variable | Purpose |
|---|---|
| `NVIDIA_NEMOTRON_API_KEY` | Nemotron 3.5 Lightning auth |
| `NVIDIA_NEMOTRON_MODEL` | `nvidia/nemotron-3.5-lightning-30b-a3b` |

### NVIDIA LLM — Fallback

| Variable | Purpose |
|---|---|
| `NVIDIA_DEEPSEEK_API_KEY` | DeepSeek V4 Pro auth |
| `NVIDIA_DEEPSEEK_MODEL` | `deepseek-ai/deepseek-v4-pro-0813` |

### NVIDIA Multimodal / Vision

| Variable | Purpose |
|---|---|
| `NVIDIA_KIMI_API_KEY` | Kimi K3 auth |
| `NVIDIA_KIMI_MODEL` | `moonshotai/kimi-k3` |

### NVIDIA Multimodal Reasoning

| Variable | Purpose |
|---|---|
| `NVIDIA_MUSE_GLIMMER_API_KEY` | Muse Glimmer auth |
| `NVIDIA_MUSE_GLIMMER_MODEL` | `meta/muse-glimmer-30b` |

### NVIDIA OCR

| Variable | Purpose |
|---|---|
| `NVIDIA_OCR_API_KEY` | Nemotron OCR v2 auth |
| `NVIDIA_OCR_MODEL` | `nemotron-ocr-v2` |

### NVIDIA Speech-to-Text

| Variable | Purpose |
|---|---|
| `NVIDIA_PARAKEET_API_KEY` | Parakeet TDT auth |
| `NVIDIA_PARAKEET_MODEL` | `parakeet-tdt-0.6b` |

### NVIDIA Translation

| Variable | Purpose |
|---|---|
| `NVIDIA_RIVA_TRANSLATE_API_KEY` | Riva Translate auth |
| `NVIDIA_RIVA_TRANSLATE_MODEL` | `riva-translate` |

### AI Gateway Configuration

| Variable | Value |
|---|---|
| `AI_PRIMARY_PROVIDER` | `nvidia` |
| `AI_PRIMARY_MODEL` | `nvidia/nemotron-3.5-lightning-30b-a3b` |
| `AI_FALLBACK_PROVIDER` | `nvidia` |
| `AI_FALLBACK_MODEL` | `deepseek-ai/deepseek-v4-pro-0813` |
| `AI_VISION_PROVIDER` | `nvidia` |
| `AI_VISION_MODEL` | `moonshotai/kimi-k3` |
| `AI_OCR_PROVIDER` | `nvidia` |
| `AI_OCR_MODEL` | `nemotron-ocr-v2` |
| `AI_TRANSLATION_PROVIDER` | `nvidia` |
| `AI_TRANSLATION_MODEL` | `riva-translate` |
| `AI_SPEECH_PROVIDER` | `nvidia` |
| `AI_SPEECH_MODEL` | `parakeet-tdt-0.6b` |
| `AI_MULTIMODAL_PROVIDER` | `nvidia` |
| `AI_MULTIMODAL_MODEL` | `meta/muse-glimmer-30b` |

### AI Runtime Defaults

| Variable | Value |
|---|---|
| `AI_REQUEST_TIMEOUT_MS` | `60000` |
| `AI_MAX_RETRIES` | `2` |
| `AI_ENABLE_FALLBACK` | `true` |
| `AI_ENABLE_STREAMING` | `true` |
| `AI_SERVER_ONLY` | `true` |

---

## Notes

- Do **not** use `NEXT_PUBLIC_*` for any API keys — they must remain server-side only.
- Do **not** use `nemoretriever-ocr-v1` — it is deprecated by NVIDIA. Use `nemotron-ocr-v2`.
- `.gitignore` must include `.env`, `.env.local`, `.env.*.local`.
- For claims decisions, keep AI as an assistant and require human review.
