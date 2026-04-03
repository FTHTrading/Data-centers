interface KpiCardProps {
  label: string
  value: string | number
  icon?: React.ReactNode
  accent?: 'blue' | 'green' | 'red' | 'amber'
  sub?: string
}

const ACCENT_COLORS: Record<string, string> = {
  blue:  'text-[--accent-blue]',
  green: 'text-[--accent-green]',
  red:   'text-[--accent-red]',
  amber: 'text-[--accent-amber]',
}

export function KpiCard({ label, value, icon, accent, sub }: KpiCardProps) {
  const accentClass = accent ? ACCENT_COLORS[accent] : 'text-[--text-primary]'
  return (
    <div className="kpi-card">
      <div className="flex items-center gap-2 text-[--text-muted]">
        {icon && <span className={accent ? ACCENT_COLORS[accent] : 'text-[--text-dimmed]'}>{icon}</span>}
        <span className="kpi-label">{label}</span>
      </div>
      <div className={`kpi-value ${accentClass}`}>{value}</div>
      {sub && <div className="text-[10px] text-[--text-dimmed]">{sub}</div>}
    </div>
  )
}
