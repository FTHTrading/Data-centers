interface ScorecardViewProps {
  scorecard: {
    totalScore: number | null
    strategicFit: number | null
    powerExpandability: number | null
    coolingAiReadiness: number | null
    networkLatency: number | null
    resilienceSecurity: number | null
    complianceSovereignty: number | null
    operationalMaturity: number | null
    financialAttractiveness: number | null
    confidenceScore: number | null
    rationale: string | null
    missingCriticalFields: string | null
  }
}

const CATEGORIES = [
  { key: 'powerExpandability',      label: 'Power & Expandability',     weight: 0.20 },
  { key: 'strategicFit',            label: 'Strategic Fit',              weight: 0.15 },
  { key: 'coolingAiReadiness',      label: 'Cooling & AI Readiness',     weight: 0.15 },
  { key: 'networkLatency',          label: 'Network & Latency',          weight: 0.10 },
  { key: 'resilienceSecurity',      label: 'Resilience & Security',      weight: 0.10 },
  { key: 'complianceSovereignty',   label: 'Compliance & Sovereignty',   weight: 0.10 },
  { key: 'operationalMaturity',     label: 'Operational Maturity',       weight: 0.10 },
  { key: 'financialAttractiveness', label: 'Financial Attractiveness',   weight: 0.10 },
]

function scoreColor(v: number) {
  if (v >= 75) return '#22c55e'
  if (v >= 55) return '#2196f3'
  if (v >= 35) return '#f59e0b'
  return '#ef4444'
}

export function ScorecardView({ scorecard }: ScorecardViewProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {CATEGORIES.map(cat => {
          const raw = scorecard[cat.key as keyof typeof scorecard]
          const val = typeof raw === 'number' ? raw : null
          const contribution = val != null ? val * cat.weight : null
          const color = val != null ? scoreColor(val) : '#4b5563'
          const barPct = val ?? 0

          return (
            <div key={cat.key} className="bg-[--bg-hover] rounded p-3 space-y-2">
              <div className="flex items-baseline justify-between">
                <span className="text-[10px] text-[--text-muted] uppercase tracking-wide leading-tight">
                  {cat.label}
                </span>
                <span className="text-xs text-[--text-dimmed]">{Math.round(cat.weight * 100)}%</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold" style={{ color }}>
                  {val?.toFixed(0) ?? '—'}
                </span>
                <span className="text-[10px] text-[--text-dimmed]">
                  {contribution != null ? `→ ${contribution.toFixed(1)} pts` : ''}
                </span>
              </div>
              <div className="h-1.5 bg-[--bg-border] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${barPct}%`, background: color }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* Rationale */}
      {scorecard.rationale && (
        <div className="bg-[--bg-hover] rounded p-3">
          <div className="text-[10px] text-[--text-dimmed] uppercase tracking-wide mb-1">Scoring Rationale</div>
          <p className="text-xs text-[--text-muted] leading-relaxed">{scorecard.rationale}</p>
        </div>
      )}

      {/* Missing fields */}
      {scorecard.missingCriticalFields && (
        <div className="bg-amber-950/20 border border-amber-800/30 rounded p-3">
          <div className="text-[10px] text-amber-500 uppercase tracking-wide mb-1">Missing Critical Fields</div>
          <p className="text-xs text-amber-400">{scorecard.missingCriticalFields}</p>
        </div>
      )}

      {/* Confidence */}
      {scorecard.confidenceScore != null && (
        <div className="text-xs text-[--text-dimmed]">
          Scoring confidence: {Math.round(scorecard.confidenceScore * 100)}% data completeness
        </div>
      )}
    </div>
  )
}
