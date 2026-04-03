import { cn } from '@/lib/utils'

interface CardProps {
  className?: string
  children: React.ReactNode
}

export function Card({ className, children }: CardProps) {
  return <div className={cn('dc-card', className)}>{children}</div>
}

export function CardHeader({ className, children }: CardProps) {
  return (
    <div className={cn('flex items-center justify-between px-5 py-4 border-b border-[var(--bg-border)]', className)}>
      {children}
    </div>
  )
}

export function CardTitle({ className, children }: CardProps) {
  return (
    <h3 className={cn('text-sm font-semibold text-[var(--fg-primary)] uppercase tracking-wider', className)}>
      {children}
    </h3>
  )
}

export function CardContent({ className, children }: CardProps) {
  return <div className={cn('p-5', className)}>{children}</div>
}

export function CardFooter({ className, children }: CardProps) {
  return (
    <div className={cn('px-5 py-3 border-t border-[var(--bg-border)] text-xs text-[var(--fg-muted)]', className)}>
      {children}
    </div>
  )
}
