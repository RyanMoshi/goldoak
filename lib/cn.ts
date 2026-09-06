type ClassValue = string | number | false | null | undefined

/** Joins class names, dropping falsy values. */
export function cn(...values: ClassValue[]): string {
  return values.filter(Boolean).join(' ')
}
