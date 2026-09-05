import { currentOrganization } from "@/data/organization";

const TIME_ZONE = currentOrganization.timezone;
const LOCALE = "en-KE";

const wholeNumber = new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 0 });

/** `KES 184,500` — always whole shillings, thousands separated, currency first. */
export function formatKES(amount: number): string {
  return `${currentOrganization.currency} ${wholeNumber.format(Math.round(amount))}`;
}

/** `KES 1.42M`, `KES 480K` — for tight spaces such as metric chips. */
export function formatKESCompact(amount: number): string {
  const abs = Math.abs(amount);
  if (abs >= 1_000_000) {
    return `${currentOrganization.currency} ${trimZeros((amount / 1_000_000).toFixed(2))}M`;
  }
  if (abs >= 1_000) {
    return `${currentOrganization.currency} ${trimZeros((amount / 1_000).toFixed(1))}K`;
  }
  return formatKES(amount);
}

function trimZeros(value: string): string {
  return value.replace(/\.0+$|(\.\d*?)0+$/, "$1");
}

/** `Saturday, 5 September 2026` in the organisation's timezone. */
export function formatLongDate(date: Date): string {
  return new Intl.DateTimeFormat(LOCALE, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: TIME_ZONE,
  }).format(date);
}

/** Hour of day (0–23) in the organisation's timezone. */
export function localHour(date: Date): number {
  const parts = new Intl.DateTimeFormat(LOCALE, {
    hour: "numeric",
    hour12: false,
    timeZone: TIME_ZONE,
  }).formatToParts(date);
  const hour = parts.find((part) => part.type === "hour")?.value ?? "0";
  return Number(hour) % 24;
}

export function greetingFor(date: Date): string {
  const hour = localHour(date);
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

/** Initials for an avatar: "Alex Kamau" → "AK". */
export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
