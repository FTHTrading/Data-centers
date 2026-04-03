import { cn } from '@/lib/utils'

type BadgeVariant =
  | 'flagship' | 'strategic' | 'standard' | 'watchlist' | 'reject'
  | 'critical'  | 'high'      | 'medium'   | 'low'
  | 'default'

const variantMap: Record<BadgeVariant, string> = {
  flagship:  'badge-flagship',
  strategic: 'badge-strategic',
  standard:  'badge-standard',
  watchlist: 'badge-watchlist',
  reject:    'badge-reject',
  critical:  'sev-critical',
  high:      'sev-high',
  medium:    'sev-medium',
  low:       'sev-low',
  default:   'bg-[var(--bg-border)] text-[var(--fg-muted)]',
}

interface BadgeProps {
  variant?: BadgeVariant
  className?: string
  children: React.ReactNode
}

export function Badge({ variant = 'default', className, children }: BadgeProps) {
  return (
    <span className={cn('status-pill', variantMap[variant], className)}>
      {children}
    </span>
  )
}
