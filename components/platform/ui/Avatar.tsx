import { cn } from '@/lib/cn'
import { initials } from '@/lib/format'

interface AvatarProps {
  name: string
  size?: 'sm' | 'md'
  tone?: 'forest' | 'muted'
  className?: string
}

/** Initials avatar. Nothing to load, nothing to leak. */
export function Avatar({ name, size = 'md', tone = 'forest', className }: AvatarProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full font-mono font-semibold tracking-wide',
        size === 'sm' ? 'size-7 text-[11px]' : 'size-9 text-xs',
        tone === 'forest' ? 'bg-forest text-gold' : 'bg-surface-2 text-ink-muted',
        className,
      )}
    >
      {initials(name)}
    </span>
  )
}
