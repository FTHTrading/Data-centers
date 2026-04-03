import { cn } from '@/lib/utils'

type Status = 'ok' | 'warn' | 'error' | 'unknown' | 'running' | 'pending'

const colorMap: Record<Status, string> = {
  ok:      'bg-emerald-500',
  warn:    'bg-amber-400',
  error:   'bg-red-500',
  unknown: 'bg-[var(--fg-muted)]',
  running: 'bg-blue-400 animate-pulse',
  pending: 'bg-[var(--fg-muted)] animate-pulse',
}

interface StatusDotProps {
  status: Status
  size?: 'sm' | 'md'
  className?: string
  label?: string
}

export function StatusDot({ status, size = 'md', className, label }: StatusDotProps) {
  const sizeClass = size === 'sm' ? 'h-1.5 w-1.5' : 'h-2 w-2'
  return (
    <span className={cn('inline-flex items-center gap-1.5', className)}>
      <span className={cn('rounded-full flex-shrink-0', sizeClass, colorMap[status])} />
      {label && <span className="text-xs text-[var(--fg-muted)]">{label}</span>}
    </span>
  )
}
