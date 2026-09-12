# WhatsApp Integration Guide

A production-tested WhatsApp integration using a self-hosted gateway (WAHA) with a provider abstraction pattern. Multi-tenant: each customer gets their own WhatsApp number as a named session in a single container.

---

## Architecture

```
Your App (Next.js, etc.)
       │
       │ POST /api/whatsapp/waha
       ▼
┌──────────────┐     POST /api/sendText     ┌──────────────┐
│  Webhook     │ ──────────────────────────▶ │  WAHA        │
│  Receiver    │                             │  Gateway     │
│              │ ◀── POST message event ─────│  (Docker)    │
└──────────────┘     HMAC signed             └──────┬───────┘
       │                                            │
       ▼                                            ▼
  Your Database                              WhatsApp Cloud
```

**Why WAHA (not whatsapp-web.js directly)?**
- One container holds tens of sessions (one per customer number)
- NOWEB engine uses WebSocket, not a full Chromium browser per session
- REST API for sending; webhooks for receiving
- Sessions persist across restarts

---

## Files to Create

```
lib/whatsapp/
  provider.ts              # Provider interface + send helpers
  providers/
    waha.ts                # WAHA adapter (primary)
    openwa.ts              # OpenWA adapter (optional fallback)
    meta.ts                # Meta Cloud API adapter (optional)
  channels.ts              # Multi-tenant session management
  bot.ts                   # Inbound message routing + bot logic

app/api/whatsapp/
  waha/
    route.ts               # WAHA webhook endpoint
  channel/
    route.ts               # Channel status endpoint

deploy/waha/
  docker-compose.yml       # WAHA + Caddy reverse proxy
  Caddyfile                # TLS termination
  .env.example             # Gateway config
```

---

## Step 1: Deploy the WAHA Gateway

### docker-compose.yml

```yaml
services:
  waha:
    image: devlikeapro/waha:noweb
    restart: unless-stopped
    environment:
      - TZ=UTC
      - WHATSAPP_DEFAULT_ENGINE=NOWEB
      - WHATSAPP_API_KEY=${WAHA_API_KEY}
      - WHATSAPP_RESTART_ALL_SESSIONS=True
      - WHATSAPP_STORE_ENABLED=False
      - WHATSAPP_SWAGGER_ENABLED=False
    ports:
      - '127.0.0.1:3000:3000'
    volumes:
      - ./sessions:/app/.sessions
      - ./media:/app/.media
    healthcheck:
      test: ['CMD-SHELL', 'wget -q -O- --header="X-Api-Key: $$WAHA_API_KEY" http://localhost:3000/health || exit 1']
      interval: 60s
      timeout: 10s
      retries: 3
    logging:
      driver: json-file
      options: { max-size: '10m', max-file: '3' }

  caddy:
    image: caddy:2
    restart: unless-stopped
    ports:
      - '80:80'
      - '443:443'
    environment:
      - DOMAIN=${DOMAIN}
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile:ro
      - caddy_data:/data
      - caddy_config:/config
    depends_on:
      - waha

volumes:
  caddy_data:
  caddy_config:
```

### Caddyfile

```
{$DOMAIN} {
    encode gzip
    reverse_proxy waha:3000
}
```

### .env.example

```
DOMAIN=wa.yourdomain.com
WAHA_API_KEY=change-me-long-random-string
WAHA_SESSION=main
```

### Deploy

```bash
cp .env.example .env
# Edit .env with your domain and API key
docker compose up -d
```

Point a DNS A record at the machine. The gateway is now at `https://wa.yourdomain.com`.

---

## Step 2: Environment Variables (Your App)

```env
# Gateway address (pinned, or let the gateway publish it at runtime)
WAHA_BASE_URL=https://wa.yourdomain.com

# Same key as in docker-compose .env
WAHA_API_KEY=your-long-random-string

# Default session name (matches WAHA_SESSION)
WAHA_SESSION=main

# HMAC key for webhook signature verification (same on both sides)
WAHA_HMAC_KEY=another-long-random-string

# Bot number for wa.me links (E.164 without +)
WHATSAPP_BOT_NUMBER=15551234567
```

---

## Step 3: Provider Interface

### lib/whatsapp/provider.ts

```typescript
export type InboundMediaKind = 'image' | 'document' | 'audio' | 'video' | 'sticker' | 'other'

export interface InboundMedia {
  kind: InboundMediaKind
  mimetype: string
  filename: string | null
  base64?: string | null
  url?: string | null
  omitted?: boolean
  sizeBytes?: number | null
  chatId?: string
}

export interface InboundMessage {
  phone: string          // E.164 digits without +
  text: string
  messageId: string
  name?: string | null
  media?: InboundMedia | null
}

export interface OutboundDocument {
  url?: string
  base64?: string
  mimetype: string
  filename: string
  caption?: string
}

export interface WhatsAppProvider {
  readonly name: 'waha' | 'openwa' | 'meta'
  sendText(toPhone: string, body: string): Promise<void>
  sendDocument?(toPhone: string, doc: OutboundDocument): Promise<void>
  sendImage?(toPhone: string, doc: OutboundDocument): Promise<void>
  downloadMedia?(chatId: string, messageId: string): Promise<{ bytes: Uint8Array; mimetype: string } | null>
  downloadMediaUrl?(url: string): Promise<{ bytes: Uint8Array; mimetype: string } | null>
  markRead?(chatId: string): Promise<void>
  typing?(chatId: string): Promise<void>
}
```

### Provider Selection

```typescript
export function getProvider(): WhatsAppProvider | null {
  if (wahaConfigured()) return new WahaProvider()
  if (process.env.OPENWA_BASE_URL && process.env.OPENWA_API_KEY && process.env.OPENWA_SESSION_ID)
    return new OpenWAProvider()
  if (process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID)
    return new MetaProvider()
  return null
}
```

### Send Helpers

```typescript
export async function sendWhatsApp(toPhone: string, body: string, organizationId?: string | null): Promise<boolean> {
  const provider = await providerForOrganization(organizationId)
  if (!provider) return false
  try {
    await provider.sendText(toPhone, body.slice(0, 4000))
    return true
  } catch (error) {
    console.error(`whatsapp send failed (${provider.name})`, error)
    return false
  }
}

export async function sendWhatsAppImage(toPhone: string, doc: OutboundDocument, organizationId?: string | null): Promise<boolean> {
  const provider = await providerForOrganization(organizationId)
  if (!provider?.sendImage) return false
  try {
    await provider.sendImage(toPhone, doc)
    return true
  } catch (error) {
    console.error(`whatsapp image failed (${provider.name})`, error)
    return false
  }
}

export async function sendWhatsAppDocument(toPhone: string, doc: OutboundDocument, organizationId?: string | null): Promise<boolean> {
  const provider = await providerForOrganization(organizationId)
  if (!provider?.sendDocument) return false
  try {
    await provider.sendDocument(toPhone, doc)
    return true
  } catch (error) {
    console.error(`whatsapp document failed (${provider.name})`, error)
    return false
  }
}

export async function acknowledgeChat(toPhone: string, organizationId?: string | null): Promise<void> {
  const provider = await providerForOrganization(organizationId)
  if (!provider) return
  const chatId = `${toPhone.replace(/\D/g, '')}@c.us`
  try {
    await provider.markRead?.(chatId)
    await provider.typing?.(chatId)
  } catch {
    /* presence is cosmetic */
  }
}
```

---

## Step 4: WAHA Provider

### lib/whatsapp/providers/waha.ts

Key pieces:

```typescript
import { createHmac, timingSafeEqual } from 'node:crypto'

// --- Config helpers ---

export function wahaBase(): string {
  return (process.env.WAHA_BASE_URL ?? '').replace(/\/$/, '')
}

export function wahaApiKey(): string {
  return process.env.WAHA_API_KEY ?? ''
}

export function wahaDefaultSession(): string {
  return process.env.WAHA_SESSION ?? 'default'
}

export function wahaConfigured(): boolean {
  return Boolean(wahaBase() && wahaApiKey())
}

// --- Provider class ---

function chatId(phone: string): string {
  return `${phone.replace(/\D/g, '')}@c.us`
}

function filePayload(doc: OutboundDocument): Record<string, unknown> {
  return doc.url
    ? { mimetype: doc.mimetype, url: doc.url, filename: doc.filename }
    : { mimetype: doc.mimetype, data: doc.base64, filename: doc.filename }
}

export class WahaProvider implements WhatsAppProvider {
  readonly name = 'waha' as const
  private base: string
  private apiKey = wahaApiKey()
  private session: string

  constructor(sessionId?: string, base?: string) {
    this.session = sessionId ?? wahaDefaultSession()
    this.base = (base ?? wahaBase()).replace(/\/$/, '')
  }

  private async post(path: string, body: Record<string, unknown>, timeoutMs = 20_000): Promise<Response> {
    const controller = new AbortController()
    const t = setTimeout(() => controller.abort(), timeoutMs)
    try {
      const response = await fetch(`${this.base}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Api-Key': this.apiKey },
        body: JSON.stringify({ session: this.session, ...body }),
        signal: controller.signal,
      })
      if (!response.ok) {
        const text = await response.text().catch(() => '')
        throw new Error(`WAHA ${response.status}: ${text.slice(0, 300)}`)
      }
      return response
    } finally {
      clearTimeout(t)
    }
  }

  async sendText(toPhone: string, body: string): Promise<void> {
    await this.post('/api/sendText', { chatId: chatId(toPhone), text: body })
  }

  async sendImage(toPhone: string, doc: OutboundDocument): Promise<void> {
    await this.post('/api/sendImage', { chatId: chatId(toPhone), file: filePayload(doc), caption: doc.caption }, 60_000)
  }

  async sendDocument(toPhone: string, doc: OutboundDocument): Promise<void> {
    await this.post('/api/sendFile', { chatId: chatId(toPhone), file: filePayload(doc), caption: doc.caption }, 60_000)
  }

  async markRead(chat: string): Promise<void> {
    await this.post('/api/sendSeen', { chatId: chat }, 8_000)
  }

  async typing(chat: string): Promise<void> {
    await this.post('/api/startTyping', { chatId: chat }, 8_000)
  }

  async downloadMediaUrl(url: string): Promise<{ bytes: Uint8Array; mimetype: string } | null> {
    if (!this.base || !url.startsWith(this.base)) return null
    const response = await fetch(url, { headers: { 'X-Api-Key': this.apiKey } })
    if (response.status === 404) return null
    if (!response.ok) throw new Error(`WAHA media ${response.status}`)
    return { bytes: new Uint8Array(await response.arrayBuffer()), mimetype: response.headers.get('content-type') ?? 'application/octet-stream' }
  }
}
```

### Webhook Signature Verification

WAHA signs the raw body with HMAC SHA-512:

```typescript
export function verifyWahaSignature(rawBody: string, header: string | null): boolean {
  const secret = process.env.WAHA_HMAC_KEY
  if (!secret) return true  // Start verifying once the key is configured
  if (!header) return false
  const expected = createHmac('sha512', secret).update(rawBody).digest('hex')
  const a = Buffer.from(header.trim().toLowerCase())
  const b = Buffer.from(expected)
  return a.length === b.length && timingSafeEqual(a, b)
}
```

### Event Parsing

```typescript
export function parseWahaEvent(payload: unknown): { key: string | null; sessionId: string | null; message: InboundMessage | null } {
  const event = payload as any
  const key = event?.id ?? null
  const sessionId = event?.session ? String(event.session) : null
  if (event?.event !== 'message' || !event.payload) return { key, sessionId, message: null }

  const d = event.payload
  if (d.fromMe || d.participant) return { key, sessionId, message: null }  // Ignore own/group messages

  const from = String(d.from ?? '')
  if (!from || from.endsWith('@g.us') || from.endsWith('@lid') || from.endsWith('@broadcast'))
    return { key, sessionId, message: null }

  const phone = from.replace(/@.*$/, '').replace(/\D/g, '')
  if (!phone) return { key, sessionId, message: null }

  const name = d.notifyName ?? d._data?.notifyName ?? d._data?.pushName ?? null
  const text = (d.body ?? d.caption ?? '').trim()

  let media: InboundMedia | null = null
  if (d.hasMedia && d.media) {
    const mimetype = d.media.mimetype ?? 'application/octet-stream'
    media = {
      kind: mimetype.startsWith('application/pdf') ? 'document' : (mimetype.split('/')[0] as InboundMediaKind) ?? 'other',
      mimetype,
      filename: d.media.filename ?? null,
      url: d.media.url ?? null,
      omitted: !d.media.url,
      chatId: String(d.from ?? `${phone}@c.us`),
    }
  }

  if (!text && !media) return { key, sessionId, message: null }
  return { key, sessionId, message: { phone, text, messageId: String(d.id ?? key ?? ''), name: name ? String(name).slice(0, 80) : null, media } }
}
```

---

## Step 5: Webhook Endpoint

### app/api/whatsapp/waha/route.ts

```typescript
import { NextResponse } from 'next/server'
import { parseWahaEvent, verifyWahaSignature } from '@/lib/whatsapp/providers/waha'
import { sendWhatsApp, whatsappReady, acknowledgeChat } from '@/lib/whatsapp/provider'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  // 1. Verify HMAC signature
  const raw = await request.text()
  if (!verifyWahaSignature(raw, request.headers.get('x-webhook-hmac'))) {
    return new Response('Invalid signature', { status: 401 })
  }

  // 2. Parse the event
  let payload: unknown
  try { payload = JSON.parse(raw) } catch { return NextResponse.json({ ok: false }, { status: 400 }) }

  const { key, sessionId, message } = parseWahaEvent(payload)
  if (!message) return NextResponse.json({ ok: true, ignored: true })

  // 3. De-duplicate (check your DB for this key)
  // const inserted = await db INSERT INTO processed_webhooks ... ON CONFLICT DO NOTHING
  // if (!inserted) return NextResponse.json({ ok: true, duplicate: true })

  // 4. Acknowledge quickly (gateway retries on slow reply)
  await acknowledgeChat(message.phone)

  // 5. Process in background (route, AI, workflow, reply)
  // This is where your bot logic goes. Use waitUntil or a job queue.
  try {
    await processInbound(message, sessionId)
  } catch (error) {
    // Fallback: queue for retry
    await enqueue({ type: 'process-inbound', payload: { message, sessionId } })
    await sendWhatsApp(message.phone, 'Something went wrong. I will get back to you shortly.')
  }

  return NextResponse.json({ ok: true })
}

export async function GET() {
  return NextResponse.json({ ok: true, provider: 'waha', expects: 'POST message events' })
}
```

---

## Step 6: Multi-Tenant Channels (Optional)

If each customer has their own number, create sessions on the gateway:

### lib/whatsapp/channels.ts

```typescript
// Session naming: stable so reconnecting reuses the pairing
function sessionName(organizationId: string): string {
  return `org-${organizationId.replace(/^org_/, '').replace(/[^a-zA-Z0-9_-]/g, '')}`
}

// Create a session for a customer
export async function connectChannel(organizationId: string): Promise<Channel> {
  const name = sessionName(organizationId)
  const site = process.env.NEXT_PUBLIC_SITE_URL
  const hmacKey = process.env.WAHA_HMAC_KEY

  const config = {
    webhooks: [{
      url: `${site}/api/whatsapp/waha`,
      events: ['message'],
      ...(hmacKey ? { hmac: { key: hmacKey } } : {}),
      retries: { policy: 'exponential', attempts: 3, delaySeconds: 2 },
    }],
  }

  // Create session on gateway
  await fetch(`${gatewayBase}/api/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Api-Key': apiKey },
    body: JSON.stringify({ name, start: true, config }),
  })

  // Save to your DB
  await db INSERT INTO whatsapp_channels (organization_id, session_id, status) ...
}

// Resolve which customer an inbound message belongs to (by session name)
export async function organizationForSession(sessionId: string): Promise<string | null> {
  const rows = await db SELECT organization_id FROM whatsapp_channels WHERE session_id = $1
  return rows[0]?.organization_id ?? null
}
```

### Sending to a Specific Customer's Number

```typescript
async function providerForOrganization(organizationId?: string | null): Promise<WhatsAppProvider | null> {
  if (organizationId) {
    const channel = await channelForOrganization(organizationId)
    if (channel?.sessionId && channel.status === 'ready') {
      return new WahaProvider(channel.sessionId)  // Uses their session
    }
  }
  return new WahaProvider()  // Fallback to shared number
}
```

---

## Step 7: WAHA API Reference

### Sending

| Endpoint | Method | Body |
|----------|--------|------|
| `/api/sendText` | POST | `{ session, chatId, text }` |
| `/api/sendImage` | POST | `{ session, chatId, file: { mimetype, url/data, filename }, caption }` |
| `/api/sendFile` | POST | `{ session, chatId, file: { mimetype, url/data, filename }, caption }` |
| `/api/sendSeen` | POST | `{ session, chatId }` |
| `/api/startTyping` | POST | `{ session, chatId }` |
| `/api/stopTyping` | POST | `{ session, chatId }` |

All requests need header `X-Api-Key: <your-key>`.

`chatId` format: `<phone>@c.us` (e.g. `15551234567@c.us`)

### Sessions

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/sessions` | GET | List all sessions |
| `/api/sessions` | POST | Create a session `{ name, start, config }` |
| `/api/sessions/:id` | GET | Get session status |
| `/api/sessions/:id` | PUT | Update session config |
| `/api/sessions/:id` | DELETE | Delete session |
| `/api/sessions/:id/start` | POST | Start session (shows QR) |
| `/api/sessions/:id/stop` | POST | Stop session |
| `/api/sessions/:id/restart` | POST | Restart session |
| `/api/sessions/:id/logout` | POST | Logout (unpair number) |
| `/api/:id/auth/qr` | GET | Get QR code (base64) |

### Webhook Event Format

```json
{
  "id": "unique-event-id",
  "event": "message",
  "session": "org_abc123",
  "timestamp": 1234567890,
  "payload": {
    "id": "message-id",
    "from": "15551234567@c.us",
    "to": "15559876543@c.us",
    "body": "Hello!",
    "fromMe": false,
    "hasMedia": false,
    "notifyName": "John"
  }
}
```

Webhook headers: `X-Webhook-Hmac: <hex-hmac-sha512-of-raw-body>`

---

## Step 8: Database Tables

```sql
-- Multi-tenant channel mapping
CREATE TABLE whatsapp_channels (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  provider TEXT NOT NULL DEFAULT 'waha',
  session_id TEXT UNIQUE,
  phone TEXT,
  label TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  last_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Per-contact state (workflow, mode, memory)
CREATE TABLE whatsapp_contacts (
  phone TEXT PRIMARY KEY,
  organization_id TEXT,
  display_name TEXT,
  mode TEXT DEFAULT 'ai',           -- 'ai' | 'human'
  workflow TEXT,
  step TEXT,
  data JSONB DEFAULT '{}',
  memory JSONB DEFAULT '{}',
  inbound_count INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Message history
CREATE TABLE conversation_messages (
  id TEXT PRIMARY KEY,
  phone TEXT NOT NULL,
  organization_id TEXT,
  direction TEXT NOT NULL,           -- 'in' | 'out'
  role TEXT NOT NULL,                -- 'user' | 'assistant' | 'system'
  body TEXT,
  at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- At-least-once delivery idempotency
CREATE TABLE processed_webhooks (
  key TEXT PRIMARY KEY,
  received_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

## Step 9: Using It

### Simple Text Send

```typescript
import { sendWhatsApp } from '@/lib/whatsapp/provider'

await sendWhatsApp('15551234567', 'Your quote is ready!')
```

### Send Image

```typescript
import { sendWhatsAppImage } from '@/lib/whatsapp/provider'

await sendWhatsAppImage('15551234567', {
  url: 'https://example.com/chart.png',
  mimetype: 'image/png',
  filename: 'chart.png',
  caption: 'Here is your chart',
})
```

### Send Document

```typescript
import { sendWhatsAppDocument } from '@/lib/whatsapp/provider'

await sendWhatsAppDocument('15551234567', {
  url: 'https://example.com/policy.pdf',
  mimetype: 'application/pdf',
  filename: 'policy.pdf',
  caption: 'Your policy document',
})
```

### Read-Receipt + Typing Indicator

```typescript
import { acknowledgeChat } from '@/lib/whatsapp/provider'

await acknowledgeChat('15551234567')  // Marks read + shows typing
```

### Send to a Specific Customer's Number (Multi-Tenant)

```typescript
await sendWhatsApp('15551234567', 'Hello from your agency!', organizationId)
```

---

## Key Patterns

1. **HMAC signature verification** on every inbound webhook -- never trust the network
2. **Idempotency** via `processed_webhooks` table -- WhatsApp retries on slow/failed responses
3. **Return 200 immediately** from the webhook, process in background (or job queue) -- gateways time out at ~10s
4. **Never throw from send helpers** -- return `boolean` so callers can degrade gracefully
5. **Text limit 4000 chars** -- WhatsApp rejects longer messages
6. **Media via URL** -- WAHA fetches from its own gateway, not your server
7. **Gateway address discovery** -- tunnel URLs change on restart; gateway publishes its address to your app via an admin API

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Webhook returns 401 | HMAC key mismatch between gateway `.env` and app env |
| Messages not received | Check gateway logs: `docker compose logs -f waha` |
| QR won't appear | Session might be stuck; restart: `POST /api/sessions/:id/restart` |
| Send fails with 404 | `WAHA_BASE_URL` wrong or gateway not running |
| Duplicate messages | `processed_webhooks` table not being checked |
| Media download fails | URL must start with gateway base; check `X-Api-Key` header |
