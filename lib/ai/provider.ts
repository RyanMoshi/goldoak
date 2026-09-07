import Anthropic from '@anthropic-ai/sdk'

/**
 * One door to the language models. The rest of the code never knows which
 * vendor answered.
 *
 * Order: Anthropic (ANTHROPIC_API_KEY) → NVIDIA NIM, an OpenAI-compatible API
 * (NVIDIA_API_KEY; models in AI_MODEL / AI_VISION_MODEL / AI_OCR_MODEL) → none.
 * Every call has a timeout and never throws to callers: `null` means "no
 * answer", and callers fall back to deterministic behaviour.
 */

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface ChatOptions {
  system: string
  messages: ChatMessage[]
  maxTokens?: number
  temperature?: number
  /** Ask the model for a JSON object only. */
  json?: boolean
  timeoutMs?: number
}

export type AiVendor = 'anthropic' | 'nvidia' | 'none'

const NVIDIA_BASE = process.env.NVIDIA_BASE_URL ?? 'https://integrate.api.nvidia.com/v1'
const CHAT_MODEL = process.env.AI_MODEL ?? 'nvidia/nemotron-3-super-120b-a12b'
const VISION_MODEL = process.env.AI_VISION_MODEL ?? 'meta/llama-3.2-11b-vision-instruct'
const OCR_MODEL = process.env.AI_OCR_MODEL ?? 'nvidia/nemotron-parse'
const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL ?? 'claude-opus-5'

export function aiVendor(): AiVendor {
  if (process.env.ANTHROPIC_API_KEY) return 'anthropic'
  if (process.env.NVIDIA_API_KEY) return 'nvidia'
  return 'none'
}

export function aiConfigured(): boolean {
  return aiVendor() !== 'none'
}

export function aiModelLabel(): string {
  const v = aiVendor()
  return v === 'anthropic' ? ANTHROPIC_MODEL : v === 'nvidia' ? CHAT_MODEL : 'catalogue'
}

function withTimeout(ms: number): { signal: AbortSignal; clear: () => void } {
  const controller = new AbortController()
  const t = setTimeout(() => controller.abort(), ms)
  return { signal: controller.signal, clear: () => clearTimeout(t) }
}

/** Strips <think>…</think> blocks some reasoning models emit in the visible content. */
function clean(text: string): string {
  return text.replace(/<think>[\s\S]*?<\/think>/g, '').replace(/^\s*Here's a thinking process:[\s\S]*?\n\n(?=\S)/, '').trim()
}

async function nvidiaChat(body: Record<string, unknown>, timeoutMs: number): Promise<string | null> {
  const key = process.env.NVIDIA_API_KEY
  if (!key) return null
  const { signal, clear } = withTimeout(timeoutMs)
  try {
    const res = await fetch(`${NVIDIA_BASE}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify(body),
      signal,
    })
    if (!res.ok) {
      console.error('nvidia chat failed', res.status, (await res.text().catch(() => '')).slice(0, 200))
      return null
    }
    const json = (await res.json()) as { choices?: { message?: { content?: string | null; tool_calls?: { function?: { arguments?: string } }[] } }[] }
    const message = json.choices?.[0]?.message
    if (message?.content) return clean(message.content)
    const args = message?.tool_calls?.[0]?.function?.arguments
    return args ?? null
  } catch (error) {
    console.error('nvidia chat error', error instanceof Error ? error.message : error)
    return null
  } finally {
    clear()
  }
}

export async function chat(options: ChatOptions): Promise<string | null> {
  const timeoutMs = options.timeoutMs ?? 45_000
  const maxTokens = options.maxTokens ?? 700
  const vendor = aiVendor()
  if (vendor === 'none') return null

  // Alternate roles strictly; drop a leading assistant turn and merge duplicates.
  const messages: ChatMessage[] = []
  for (const m of options.messages) {
    if (!m.content.trim()) continue
    if (!messages.length && m.role === 'assistant') continue
    const last = messages[messages.length - 1]
    if (last && last.role === m.role) last.content += `\n${m.content}`
    else messages.push({ role: m.role, content: m.content })
  }
  if (!messages.length) return null

  if (vendor === 'anthropic') {
    try {
      const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY, timeout: timeoutMs })
      const response = await client.messages.create({
        model: ANTHROPIC_MODEL,
        max_tokens: maxTokens,
        thinking: { type: 'adaptive' },
        system: options.json ? `${options.system}\n\nRespond with a single JSON object and nothing else.` : options.system,
        messages,
      })
      const text = response.content
        .filter((b): b is Anthropic.TextBlock => b.type === 'text')
        .map((b) => b.text)
        .join('\n')
        .trim()
      return text || null
    } catch (error) {
      console.error('anthropic chat error', error instanceof Error ? error.message : error)
      return null
    }
  }

  const system = options.json ? `${options.system}\n\nRespond with a single JSON object and nothing else. No prose, no markdown fences.` : options.system
  return nvidiaChat(
    {
      model: CHAT_MODEL,
      messages: [{ role: 'system', content: system }, ...messages],
      max_tokens: maxTokens,
      temperature: options.temperature ?? (options.json ? 0.1 : 0.4),
      stream: false,
    },
    timeoutMs,
  )
}

/** Parses the first JSON object out of a model reply. */
export function parseJson<T>(text: string | null): T | null {
  if (!text) return null
  const trimmed = text.replace(/```json|```/g, '').trim()
  const start = trimmed.indexOf('{')
  const end = trimmed.lastIndexOf('}')
  if (start < 0 || end <= start) return null
  try {
    return JSON.parse(trimmed.slice(start, end + 1)) as T
  } catch {
    return null
  }
}

export interface ImageInput {
  base64: string
  mimetype: string
}

/** Asks a vision model about an image (description, extraction). */
export async function describeImage(image: ImageInput, prompt: string, options: { json?: boolean; maxTokens?: number; timeoutMs?: number } = {}): Promise<string | null> {
  const vendor = aiVendor()
  if (vendor === 'none') return null
  const instruction = options.json ? `${prompt}\n\nRespond with a single JSON object and nothing else.` : prompt
  if (vendor === 'anthropic') {
    try {
      const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY, timeout: options.timeoutMs ?? 60_000 })
      const mediaType = image.mimetype as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp'
      const response = await client.messages.create({
        model: ANTHROPIC_MODEL,
        max_tokens: options.maxTokens ?? 900,
        messages: [{ role: 'user', content: [{ type: 'image', source: { type: 'base64', media_type: mediaType, data: image.base64 } }, { type: 'text', text: instruction }] }],
      })
      const text = response.content
        .filter((b): b is Anthropic.TextBlock => b.type === 'text')
        .map((b) => b.text)
        .join('\n')
        .trim()
      return text || null
    } catch (error) {
      console.error('anthropic vision error', error instanceof Error ? error.message : error)
      return null
    }
  }
  return nvidiaChat(
    {
      model: VISION_MODEL,
      messages: [{ role: 'user', content: [{ type: 'text', text: instruction }, { type: 'image_url', image_url: { url: `data:${image.mimetype};base64,${image.base64}` } }] }],
      max_tokens: options.maxTokens ?? 900,
      temperature: 0.1,
      stream: false,
    },
    options.timeoutMs ?? 90_000,
  )
}

interface ParseBlock {
  text?: string
  type?: string
}

/**
 * OCR: returns the readable text of an image, in reading order. Uses the
 * document-parse model on NVIDIA (layout blocks with text) and falls back to
 * the vision model asked to transcribe.
 */
export async function ocrImage(image: ImageInput, timeoutMs = 90_000): Promise<string | null> {
  if (aiVendor() === 'nvidia') {
    const raw = await nvidiaChat(
      { model: OCR_MODEL, messages: [{ role: 'user', content: [{ type: 'image_url', image_url: { url: `data:${image.mimetype};base64,${image.base64}` } }] }], max_tokens: 3000 },
      timeoutMs,
    )
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as ParseBlock[][] | ParseBlock[]
        const blocks = (Array.isArray(parsed[0]) ? (parsed as ParseBlock[][]).flat() : (parsed as ParseBlock[])).filter((b) => b && typeof b.text === 'string' && b.text.trim())
        const text = blocks.map((b) => b.text!.trim()).join('\n')
        if (text.trim()) return text
      } catch {
        if (raw.trim() && !raw.trim().startsWith('[')) return raw
      }
    }
  }
  return describeImage(image, 'Transcribe every piece of text in this image exactly as written, in reading order. Output only the text.', { maxTokens: 2000, timeoutMs })
}
