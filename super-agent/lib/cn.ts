type ClassValue = string | number | false | null | undefined;

/** Joins class names, dropping falsy values. Small enough not to need a dependency. */
export function cn(...values: ClassValue[]): string {
  return values.filter(Boolean).join(" ");
}
