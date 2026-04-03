interface ScoreRingProps {
  score: number
  size?: number
  strokeWidth?: number
  label?: string
}

export function ScoreRing({ score, size = 80, strokeWidth = 6, label }: ScoreRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  const color =
    score >= 80 ? '#10b981'
    : score >= 65 ? '#3b82f6'
    : score >= 50 ? '#f59e0b'
    : '#ef4444'

  return (
    <div className="inline-flex flex-col items-center gap-1">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--bg-border)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div className="flex flex-col items-center" style={{ marginTop: `-${size / 2 + 4}px` }}>
        <span className="text-lg font-semibold text-white leading-none">{score.toFixed(0)}</span>
      </div>
      {label && (
        <span className="text-[10px] text-[var(--fg-muted)] text-center leading-tight">{label}</span>
      )}
    </div>
  )
}
