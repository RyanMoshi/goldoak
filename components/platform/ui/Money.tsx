import { cn } from '@/lib/cn'
import { formatKES, formatKESCompact } from '@/lib/format'

interface MoneyProps {
  amount: number
  compact?: boolean
  className?: string
}

/** Ledger-formatted shillings. Always monospace, always tabular. */
export function Money({ amount, compact = false, className }: MoneyProps) {
  return (
    <span data-numeric className={cn('font-mono font-medium', className)} title={compact ? formatKES(amount) : undefined}>
      {compact ? formatKESCompact(amount) : formatKES(amount)}
    </span>
  )
}
