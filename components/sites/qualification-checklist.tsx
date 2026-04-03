import { SITE_SECTIONS } from '@/config/site-sections'

interface ChecklistProps {
  site: Record<string, unknown>
}

/** Resolve the first model path in a site object. Arrays return element 0. */
function getModelData(site: Record<string, unknown>, modelPaths: string[]): Record<string, unknown> | null {
  for (const path of modelPaths) {
    if (path === 'site') return site
    const val = site[path]
    if (Array.isArray(val) && val.length > 0) return val[0] as Record<string, unknown>
    if (val != null && typeof val === 'object') return val as Record<string, unknown>
  }
  return null
}

function countFilledCritical(modelData: Record<string, unknown> | null, fields: string[]): number {
  if (!modelData || fields.length === 0) return 0
  return fields.filter(f => {
    const v = modelData[f]
    return v != null && v !== '' && v !== false
  }).length
}

export function QualificationChecklist({ site }: ChecklistProps) {
  const sections = SITE_SECTIONS.filter(s => s.estimatedFields > 0)

  let totalEstimated = 0
  let totalCritical = 0
  let filledCritical = 0

  const sectionStats = sections.map(sec => {
    const modelData = getModelData(site, sec.modelPaths)
    const filled = countFilledCritical(modelData, sec.criticalFields)
    totalEstimated += sec.estimatedFields
    totalCritical  += sec.criticalFields.length
    filledCritical += filled
    const pct = sec.criticalFields.length > 0
      ? Math.round((filled / sec.criticalFields.length) * 100)
      : modelData != null ? 50 : 0
    return { sec, modelData, filled, pct }
  })

  const overallPct = totalCritical > 0 ? Math.round((filledCritical / totalCritical) * 100) : 0

  return (
    <div className="space-y-4">
      {/* Overall */}
      <div className="dc-card p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-[var(--fg-primary)]">Critical Fields Completeness</span>
          <span className="text-sm font-semibold text-white">{overallPct}%</span>
        </div>
        <div className="w-full bg-[var(--bg-border)] rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${
              overallPct >= 80 ? 'bg-emerald-500' : overallPct >= 50 ? 'bg-amber-400' : 'bg-red-500'
            }`}
            style={{ width: `${overallPct}%` }}
          />
        </div>
        <div className="text-xs text-[var(--fg-muted)] mt-1">
          {filledCritical} of {totalCritical} critical fields · ~{totalEstimated} total evaluation fields
        </div>
      </div>

      {/* Section cards */}
      {sectionStats.map(({ sec, modelData, filled, pct }) => (
        <div key={sec.id} className="dc-card overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--bg-border)]">
            <div>
              <span className="text-xs font-semibold text-[var(--fg-primary)] uppercase tracking-wide">
                {sec.label}
              </span>
              <span className="ml-2 text-xs text-[var(--fg-muted)]">~{sec.estimatedFields} fields</span>
            </div>
            <div className="flex items-center gap-2">
              {modelData == null && (
                <span className="text-[10px] text-amber-400">no data</span>
              )}
              {sec.criticalFields.length > 0 && (
                <>
                  <div className="w-20 bg-[var(--bg-border)] rounded-full h-1">
                    <div
                      className={`h-1 rounded-full ${pct >= 80 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-400' : 'bg-red-500'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-xs text-[var(--fg-muted)] tabular-nums w-10 text-right">
                    {filled}/{sec.criticalFields.length}
                  </span>
                </>
              )}
            </div>
          </div>
          {sec.criticalFields.length > 0 && (
            <div className="grid grid-cols-2 gap-px bg-[var(--bg-border)]">
              {sec.criticalFields.map(field => {
                const val = modelData?.[field]
                const isFilled = val != null && val !== '' && val !== false
                return (
                  <div key={field} className="flex items-center gap-2 px-3 py-2 bg-[var(--bg-card)]">
                    <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${isFilled ? 'bg-emerald-500' : 'bg-red-500'}`} />
                    <span className="text-xs text-[var(--fg-muted)] font-mono truncate">{field}</span>
                    {!isFilled && (
                      <span className="ml-auto text-[10px] text-red-400">missing</span>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
