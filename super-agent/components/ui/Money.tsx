import { cn } from "@/lib/cn";
import { formatKES, formatKESCompact } from "@/lib/format";

interface MoneyProps {
  amount: number;
  compact?: boolean;
  className?: string;
}

/** Ledger-formatted shillings. Always monospace, always tabular. */
export function Money({ amount, compact = false, className }: MoneyProps) {
  const label = compact ? formatKESCompact(amount) : formatKES(amount);
  return (
    <span
      data-numeric
      className={cn("font-mono font-medium tabular-nums", className)}
      title={compact ? formatKES(amount) : undefined}
    >
      {label}
    </span>
  );
}
