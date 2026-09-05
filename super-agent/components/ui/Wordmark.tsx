import { cn } from "@/lib/cn";

interface WordmarkProps {
  /** Ground the mark sits on; affects text colour. */
  on?: "light" | "forest";
  /** Icon only, for tight spaces. */
  compact?: boolean;
  className?: string;
}

export function ShieldMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 36 36"
      aria-hidden="true"
      className={cn("size-9 shrink-0", className)}
    >
      <rect width="36" height="36" rx="6" fill="#073423" />
      <path
        d="M18 7L27 12V19C27 24.8 23.2 30.1 18 31.5C12.8 30.1 9 24.8 9 19V12L18 7Z"
        fill="none"
        stroke="#C28D38"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <path
        d="M14 18.5L16.8 21.5L22 15.5"
        fill="none"
        stroke="#F7F4EC"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Shield plus wordmark: "SUPER AGENT / Insurance Operating System". */
export function Wordmark({ on = "light", compact = false, className }: WordmarkProps) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <ShieldMark />
      {compact ? (
        <span className="sr-only">Super Agent</span>
      ) : (
        <span className="flex min-w-0 flex-col leading-none">
          <span
            className={cn(
              "font-serif text-[15px] font-bold tracking-[0.06em]",
              on === "forest" ? "text-white" : "text-forest",
            )}
          >
            SUPER AGENT
          </span>
          <span className="mt-1 text-[9.5px] font-bold uppercase tracking-[0.14em] text-gold">
            Insurance Operating System
          </span>
        </span>
      )}
    </span>
  );
}
