/**
 * The AI gateway: which model, on which key, for which job.
 *
 * Everything about model choice lives here so the rest of the platform asks
 * for a *task* ("chat", "vision", "ocr") and never names a model. Adding a
 * provider later, or self-hosting, is a change to this file alone — which is
 * the point of the architecture note in NVIDIA_AI_ARCHITECTURE.md.
 *
 * Two rules the defaults follow:
 *
 * 1. Only models that actually answer on our accounts are listed. The
 *    architecture note names `nemotron-ocr-v2` and `meta/muse-glimmer-30b`;
 *    both were verified against all three keys and neither is available
 *    (404 and empty content respectively), so the working equivalents are
 *    used and the note's intent is preserved.
 * 2. Every task has a chain, not a single model. A busy endpoint should cost
 *    a second, not an answer.
 *
 * Keys are read from the environment only, never bundled, never logged.
 */

export type AiTask = 'chat' | 'reason' | 'vision' | 'ocr'

const env = (name: string): string | undefined => {
  const v = process.env[name]
  return v && v.trim() ? v.trim() : undefined
}

const list = (value: string | undefined): string[] =>
  (value ?? '')
    .split(',')
    .map((m) => m.trim())
    .filter(Boolean)

/**
 * Every NVIDIA key we hold, in preference order and de-duplicated.
 *
 * They are separate accounts on the same endpoint, so a key that is rate
 * limited or missing a model is not a dead end — the next one usually
 * answers. Task-specific names from the architecture note are read first so a
 * dedicated key can be pinned to a job later without touching code.
 */
export function keyPool(task?: AiTask): string[] {
  const perTask: Record<AiTask, string[]> = {
    chat: ['NVIDIA_NEMOTRON_API_KEY'],
    reason: ['NVIDIA_DEEPSEEK_API_KEY', 'NVIDIA_NEMOTRON_API_KEY'],
    vision: ['NVIDIA_KIMI_API_KEY'],
    ocr: ['NVIDIA_OCR_API_KEY'],
  }
  const names = [...(task ? perTask[task] : []), 'NVIDIA_API_KEY', 'NVIDIA_API_KEY_2', 'NVIDIA_API_KEY_3']
  const keys = [...names.map(env), ...list(env('NVIDIA_API_KEYS'))].filter((k): k is string => Boolean(k))
  return [...new Set(keys)]
}

/**
 * The model chain for a task: the first is tried first, and each is tried on
 * every key before moving on.
 */
export function modelChain(task: AiTask): string[] {
  switch (task) {
    case 'chat': {
      // Lightning first: it answers a conversational turn in about a second.
      const primary = env('AI_MODEL') ?? env('AI_PRIMARY_MODEL') ?? 'nvidia/nemotron-3.5-lightning-30b-a3b'
      const fallbacks = list(env('AI_FALLBACK_MODELS')).length
        ? list(env('AI_FALLBACK_MODELS'))
        : [env('AI_FALLBACK_MODEL') ?? 'nvidia/nemotron-3-super-120b-a12b', 'moonshotai/kimi-k3', 'deepseek-ai/deepseek-v4-pro-0813']
      return unique([primary, ...fallbacks])
    }
    case 'reason': {
      // Heavier questions: the bigger models first, accepting more latency.
      const primary = env('AI_REASONING_MODEL') ?? 'nvidia/nemotron-3-super-120b-a12b'
      return unique([primary, 'deepseek-ai/deepseek-v4-pro-0813', 'nvidia/nemotron-3.5-lightning-30b-a3b'])
    }
    case 'vision': {
      const primary = env('AI_VISION_MODEL') ?? 'meta/llama-3.2-11b-vision-instruct'
      return unique([primary, 'meta/llama-3.2-90b-vision-instruct'])
    }
    case 'ocr': {
      // The note asks for nemotron-ocr-v2; that id is not served on these
      // accounts, and nemotron-parse is the document-parse model that is.
      const primary = env('AI_OCR_MODEL') ?? 'nvidia/nemotron-parse'
      return unique([primary, 'meta/llama-3.2-11b-vision-instruct'])
    }
  }
}

function unique(models: string[]): string[] {
  return [...new Set(models.map((m) => m.trim()).filter(Boolean))]
}

export const gatewayConfig = {
  baseUrl: env('NVIDIA_API_BASE_URL') ?? env('NVIDIA_BASE_URL') ?? 'https://integrate.api.nvidia.com/v1',
  timeoutMs: Number(env('AI_REQUEST_TIMEOUT_MS') ?? 45_000),
  /** Set AI_ENABLE_FALLBACK=false to fail fast on the primary model instead. */
  fallbackEnabled: (env('AI_ENABLE_FALLBACK') ?? 'true') !== 'false',
}

/** A short, honest description of the routing, for the Super Agent console. */
export function routingSummary(): { task: AiTask; models: string[]; keys: number }[] {
  return (['chat', 'reason', 'vision', 'ocr'] as AiTask[]).map((task) => ({
    task,
    models: modelChain(task),
    keys: keyPool(task).length,
  }))
}
