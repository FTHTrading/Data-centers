'use client'

const STAGE_ORDER = [
  'SOURCING', 'QUALIFICATION', 'INITIAL_REVIEW', 'TECHNICAL_REVIEW',
  'FINANCIAL_REVIEW', 'COMPLIANCE_REVIEW', 'EXECUTIVE_REVIEW', 'APPROVED',
]

const STAGE_LABELS: Record<string, string> = {
  SOURCING:          'Sourcing',
  QUALIFICATION:     'Qual.',
  INITIAL_REVIEW:    'Initial',
  TECHNICAL_REVIEW:  'Technical',
  FINANCIAL_REVIEW:  'Financial',
  COMPLIANCE_REVIEW: 'Compliance',
  EXECUTIVE_REVIEW:  'Executive',
  APPROVED:          'Approved',
}

const STAGE_COLORS: Record<string, string> = {
  SOURCING:          '#374151',
  QUALIFICATION:     '#4b5563',
  INITIAL_REVIEW:    '#2196f3',
  TECHNICAL_REVIEW:  '#3b82f6',
  FINANCIAL_REVIEW:  '#8b5cf6',
  COMPLIANCE_REVIEW: '#f59e0b',
  EXECUTIVE_REVIEW:  '#22c55e',
  APPROVED:          '#16a34a',
}

interface PipelineChartProps {
  stageMap: Record<string, number>
}

export function PipelineChart({ stageMap }: PipelineChartProps) {
  const maxVal = Math.max(1, ...Object.values(stageMap))

  return (
    <div className="space-y-2.5">
      {STAGE_ORDER.map(stage => {
        const count = stageMap[stage] ?? 0
        const pct = (count / maxVal) * 100
        const color = STAGE_COLORS[stage] ?? '#374151'
        return (
          <div key={stage} className="flex items-center gap-2">
            <span className="text-[10px] text-[--text-dimmed] w-20 text-right shrink-0">
              {STAGE_LABELS[stage]}
            </span>
            <div className="flex-1 bg-[--bg-hover] rounded-full h-5 relative overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{ width: `${pct}%`, background: color, minWidth: count > 0 ? 24 : 0 }}
              />
              {count > 0 && (
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-white">
                  {count}
                </span>
              )}
            </div>
            {count === 0 && <span className="text-[10px] text-[--text-dimmed]">0</span>}
          </div>
        )
      })}
    </div>
  )
}
