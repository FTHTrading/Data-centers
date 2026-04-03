import { db } from '@/lib/db'
import Link from 'next/link'

const CATEGORIES = [
  { key: 'strategicFit',            label: 'Strategic Fit',               weight: 0.15 },
  { key: 'powerExpandability',      label: 'Power & Expandability',        weight: 0.20 },
  { key: 'coolingAiReadiness',      label: 'Cooling / AI Readiness',       weight: 0.15 },
  { key: 'networkLatency',          label: 'Network & Latency',            weight: 0.10 },
  { key: 'resilienceSecurity',      label: 'Resilience & Security',        weight: 0.10 },
  { key: 'complianceSovereignty',   label: 'Compliance & Sovereignty',     weight: 0.10 },
  { key: 'operationalMaturity',     label: 'Operational Maturity',         weight: 0.10 },
  { key: 'financialAttractiveness', label: 'Financial Attractiveness',     weight: 0.10 },
]

function scoreColor(n: number) {
  if (n >= 80) return 'text-emerald-400'
  if (n >= 65) return 'text-blue-400'
  if (n >= 50) return 'text-amber-400'
  return 'text-red-400'
}

function barColor(n: number) {
  if (n >= 80) return 'bg-emerald-500'
  if (n >= 65) return 'bg-blue-500'
  if (n >= 50) return 'bg-amber-500'
  return 'bg-red-500'
}

function tierBadge(rec: string | null) {
  const map: Record<string, string> = {
    FLAGSHIP:  'badge-flagship',
    STRATEGIC: 'badge-strategic',
    STANDARD:  'badge-standard',
    WATCHLIST: 'badge-watchlist',
    REJECT:    'badge-reject',
  }
  return map[rec ?? ''] ?? 'badge-watchlist'
}

interface SiteWithScorecard {
  id: string
  name: string | null
  city: string | null
  state: string | null
  siteType: string | null
  targetItMW: number | null
  stage: string
  scorecard: Record<string, number> | null
  riskFlags: { severity: string; title: string }[]
  _count?: { workflowTasks?: number }
}

async function fetchSite(id: string): Promise<SiteWithScorecard | null> {
  const site = await db.site.findUnique({
    where: { id },
    include: {
      scorecard:    true,
      riskFlags:    { where: { isResolved: false }, select: { severity: true, title: true } },
      _count:       { select: { tasks: true } },
    },
  })
  return site as unknown as SiteWithScorecard | null
}

export default async function ComparePage({
  searchParams,
}: {
  searchParams: { a?: string; b?: string }
}) {
  const idA = searchParams.a
  const idB = searchParams.b

  const [siteA, siteB, allSites] = await Promise.all([
    idA ? fetchSite(idA) : Promise.resolve(null),
    idB ? fetchSite(idB) : Promise.resolve(null),
    db.site.findMany({
      where:   { status: { not: 'ARCHIVED' } },
      select:  { id: true, name: true, state: true, targetItMW: true },
      orderBy: { name: 'asc' },
    }),
  ])

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Site Comparison</h1>
          <p className="text-sm text-[var(--fg-muted)] mt-0.5">
            Select two sites to compare scoring across all categories.
          </p>
        </div>
        <Link href="/dashboard/pipeline" className="btn-ghost text-sm">
          ← Pipeline
        </Link>
      </div>

      {/* Site selectors */}
      <form method="GET" className="flex gap-4 items-end">
        <div className="flex-1">
          <label className="block text-xs text-[var(--fg-muted)] mb-1">Site A</label>
          <select name="a" defaultValue={idA ?? ''} className="dc-input w-full">
            <option value="">— select —</option>
            {allSites.map(s => (
              <option key={s.id} value={s.id}>
                {s.name ?? s.id} ({s.state}) — {s.targetItMW ?? '?'} MW
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-xs text-[var(--fg-muted)] mb-1">Site B</label>
          <select name="b" defaultValue={idB ?? ''} className="dc-input w-full">
            <option value="">— select —</option>
            {allSites.map(s => (
              <option key={s.id} value={s.id}>
                {s.name ?? s.id} ({s.state}) — {s.targetItMW ?? '?'} MW
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="btn-primary whitespace-nowrap">Compare →</button>
      </form>

      {/* Comparison grid */}
      {siteA && siteB ? (
        <div className="dc-card overflow-hidden">
          {/* Site headers */}
          <div className="grid grid-cols-[200px_1fr_1fr] border-b border-[var(--bg-border)]">
            <div className="p-4 border-r border-[var(--bg-border)]" />
            {[siteA, siteB].map((site, i) => (
              <div key={i} className="p-4 border-r border-[var(--bg-border)] last:border-r-0">
                <Link
                  href={`/dashboard/sites/${site.id}`}
                  className="font-semibold text-white hover:text-[var(--accent-blue)] transition-colors"
                >
                  {site.name ?? site.id}
                </Link>
                <div className="text-xs text-[var(--fg-muted)] mt-0.5">
                  {site.city ? `${site.city}, ` : ''}{site.state} · {site.siteType?.replace(/_/g, ' ')} · {site.targetItMW ?? '?'} MW
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`text-lg font-semibold ${scoreColor(site.scorecard?.totalScore ?? 0)}`}>
                    {site.scorecard?.totalScore?.toFixed(1) ?? '—'}
                  </span>
                  <span className={`status-pill ${tierBadge(site.scorecard?.recommendation as unknown as string)}`}>
                    {site.scorecard?.recommendation ?? 'Unscored'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Category rows */}
          {CATEGORIES.map(cat => {
            const scoreA = (siteA.scorecard as any)?.[cat.key] as number | undefined
            const scoreB = (siteB.scorecard as any)?.[cat.key] as number | undefined
            const winner = scoreA != null && scoreB != null
              ? scoreA > scoreB ? 'A' : scoreB > scoreA ? 'B' : 'tie'
              : null

            return (
              <div
                key={cat.key}
                className="grid grid-cols-[200px_1fr_1fr] border-b border-[var(--bg-border)] last:border-b-0"
              >
                <div className="p-4 border-r border-[var(--bg-border)]">
                  <div className="text-sm text-[var(--fg-primary)]">{cat.label}</div>
                  <div className="text-xs text-[var(--fg-muted)] mt-0.5">{(cat.weight * 100).toFixed(0)}% weight</div>
                </div>
                {[{ site: siteA, score: scoreA, side: 'A' }, { site: siteB, score: scoreB, side: 'B' }].map(({ site, score, side }) => (
                  <div
                    key={side}
                    className={`p-4 border-r border-[var(--bg-border)] last:border-r-0 ${winner === side ? 'bg-[var(--bg-hover)]' : ''}`}
                  >
                    {score != null ? (
                      <>
                        <div className={`text-base font-semibold ${scoreColor(score)}`}>
                          {score.toFixed(0)}
                          {winner === side && <span className="ml-1 text-xs text-[var(--fg-muted)]">▲</span>}
                        </div>
                        <div className="mt-1.5 w-full bg-[var(--bg-border)] rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full ${barColor(score)}`}
                            style={{ width: `${score}%` }}
                          />
                        </div>
                      </>
                    ) : (
                      <span className="text-[var(--fg-muted)] text-sm">—</span>
                    )}
                  </div>
                ))}
              </div>
            )
          })}

          {/* Risk flags row */}
          <div className="grid grid-cols-[200px_1fr_1fr] border-t border-[var(--bg-border)]">
            <div className="p-4 border-r border-[var(--bg-border)]">
              <div className="text-sm text-[var(--fg-primary)]">Risk Flags</div>
              <div className="text-xs text-[var(--fg-muted)] mt-0.5">Open / unresolved</div>
            </div>
            {[siteA, siteB].map((site, i) => {
              const crits = site.riskFlags.filter(f => f.severity === 'CRITICAL').length
              const highs  = site.riskFlags.filter(f => f.severity === 'HIGH').length
              return (
                <div key={i} className="p-4 border-r border-[var(--bg-border)] last:border-r-0 space-y-1">
                  {crits > 0 && <div className="text-xs sev-critical">{crits} CRITICAL</div>}
                  {highs > 0 && <div className="text-xs sev-high">{highs} HIGH</div>}
                  {crits === 0 && highs === 0 && (
                    <div className="text-xs text-emerald-400">No critical/high flags</div>
                  )}
                  <div className="text-xs text-[var(--fg-muted)]">
                    {site.riskFlags.length} total
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ) : (idA || idB) ? (
        <div className="dc-card p-8 text-center text-[var(--fg-muted)]">
          {!siteA && idA && <p>Site A not found: <code>{idA}</code></p>}
          {!siteB && idB && <p>Site B not found: <code>{idB}</code></p>}
        </div>
      ) : (
        <div className="dc-card p-12 text-center text-[var(--fg-muted)]">
          Select two sites above to compare their scored metrics side by side.
        </div>
      )}
    </div>
  )
}
