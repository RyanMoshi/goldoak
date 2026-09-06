const TIME_ZONE = 'Africa/Nairobi'
const LOCALE = 'en-KE'
const CURRENCY = 'KES'

const wholeNumber = new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 0 })

/** `KES 184,500` — whole shillings, thousands separated, currency first. */
export function formatKES(amount: number): string {
  return `${CURRENCY} ${wholeNumber.format(Math.round(amount))}`
}

/** `KES 1.42M`, `KES 480K` — for tight spaces. */
export function formatKESCompact(amount: number): string {
  const abs = Math.abs(amount)
  if (abs >= 1_000_000) return `${CURRENCY} ${trimZeros((amount / 1_000_000).toFixed(2))}M`
  if (abs >= 1_000) return `${CURRENCY} ${trimZeros((amount / 1_000).toFixed(1))}K`
  return formatKES(amount)
}

function trimZeros(value: string): string {
  return value.replace(/\.0+$|(\.\d*?)0+$/, '$1')
}

/** `Saturday, 5 September 2026` in Nairobi time. */
export function formatLongDate(date: Date): string {
  return new Intl.DateTimeFormat(LOCALE, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: TIME_ZONE,
  }).format(date)
}

/** `12 Nov 2026` */
export function formatShortDate(value: Date | string): string {
  const date = typeof value === 'string' ? new Date(value) : value
  return new Intl.DateTimeFormat(LOCALE, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: TIME_ZONE,
  }).format(date)
}

/** Whole days from now until `value`; negative when past. */
export function daysUntil(value: Date | string, now = new Date()): number {
  const date = typeof value === 'string' ? new Date(value) : value
  return Math.round((date.getTime() - now.getTime()) / 86_400_000)
}

/** "8 min ago", "2 hrs ago", "Yesterday", "3 days ago" */
export function relativeTime(value: Date | string, now = new Date()): string {
  const date = typeof value === 'string' ? new Date(value) : value
  const diff = Math.max(0, now.getTime() - date.getTime())
  const minutes = Math.round(diff / 60_000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours} hr${hours === 1 ? '' : 's'} ago`
  const days = Math.round(hours / 24)
  if (days === 1) return 'Yesterday'
  if (days < 30) return `${days} days ago`
  return formatShortDate(date)
}

export function localHour(date: Date): number {
  const parts = new Intl.DateTimeFormat(LOCALE, { hour: 'numeric', hour12: false, timeZone: TIME_ZONE }).formatToParts(date)
  const hour = parts.find((part) => part.type === 'hour')?.value ?? '0'
  return Number(hour) % 24
}

export function greetingFor(date: Date): string {
  const hour = localHour(date)
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

/** "Alex Kamau" → "AK" */
export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

/** Normalises Kenyan numbers to E.164 without the plus: 0712… → 254712…, +254… → 254… */
export function normalizePhone(input: string): string | null {
  const digits = input.replace(/[^\d+]/g, '')
  if (!digits) return null
  let n = digits.startsWith('+') ? digits.slice(1) : digits
  if (n.startsWith('0') && n.length === 10) n = `254${n.slice(1)}`
  if (n.length === 9 && /^[17]/.test(n)) n = `254${n}`
  if (!/^\d{10,15}$/.test(n)) return null
  return n
}

export function formatPhone(e164: string): string {
  if (e164.startsWith('254') && e164.length === 12) {
    return `+254 ${e164.slice(3, 6)} ${e164.slice(6, 9)} ${e164.slice(9)}`
  }
  return `+${e164}`
}
