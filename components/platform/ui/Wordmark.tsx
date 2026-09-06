import Image from 'next/image'
import { cn } from '@/lib/cn'

interface WordmarkProps {
  on?: 'light' | 'forest'
  compact?: boolean
  className?: string
}

/** GoldOak mark with the Super Agent wordmark. */
export function Wordmark({ on = 'light', compact = false, className }: WordmarkProps) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <Image src="/assets/Gold Icon.png" alt="" width={36} height={36} className="size-9 shrink-0 rounded-[8px]" priority />
      {compact ? (
        <span className="sr-only">Super Agent by GoldOak</span>
      ) : (
        <span className="flex min-w-0 flex-col leading-none">
          <span className={cn('font-serif text-[15px] font-bold tracking-[0.06em]', on === 'forest' ? 'text-white' : 'text-forest')}>
            SUPER AGENT
          </span>
          <span className="mt-1 text-[9.5px] font-bold uppercase tracking-[0.14em] text-gold">GoldOak Insurance OS</span>
        </span>
      )}
    </span>
  )
}
