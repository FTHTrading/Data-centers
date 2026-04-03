import { notFound } from 'next/navigation'
import Link from 'next/link'
import { db } from '@/lib/db'
import { formatMW, formatScore, formatDate } from '@/lib/utils'
import { ScorecardView } from '@/components/sites/scorecard-view'
import { AgentTimeline } from '@/components/agents/agent-timeline'

async function getSite(id: string) {
  const site = await db.site.findUnique({
    where: { id },
    include: {
      utilities: true,
      generators: true,
      upsSystems: true,
      coolingSystems: true,
      networkProfiles: { include: { fiberRoutes: true } },
      securityProfile: true,
      complianceProfile: true,
      environmentalProfile: true,
      capitalPlan: true,
      financialModels: true,
      jurisdictionProfile: true,
      buildings: true,
      scorecard: true,
      riskFlags: { orderBy: [{ severity: 'asc' }, { createdAt: 'desc' }] },
      tasks: { orderBy: { dueDate: 'asc' } },
      agentRuns: { orderBy: { startedAt: 'desc' }, take: 20, include: { attachment: { select: { fileName: true } } } },
      extractedFacts: { where: { reviewStatus: 'PENDING' }, orderBy: { createdAt: 'desc' }, take: 10 },
      contacts: true,
    },
  })
  if (!site) notFound()
  return site
}

const SEVERITY_ORDER: Record<string, number> = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 }

export default async function SitePage({ params }: { params: { id: string } }) {
  const site = await getSite(params.id)
  const u   = site.utilities[0]
  const g   = site.generators[0]
  const ups = site.upsSystems[0]
  const c   = site.coolingSystems[0]
  const n   = site.networkProfiles[0]
  const sec = site.securityProfile
  const comp = site.complianceProfile
  const cap  = site.capitalPlan

  const openRisks  = site.riskFlags.filter(r => !r.isResolved)
  const critRisks  = openRisks.filter(r => r.severity === 'CRITICAL')
  const openTasks  = site.tasks.filter(t => ['OPEN','IN_PROGRESS','ESCALATED'].includes(t.status))

  const scoreColor = !site.totalScore ? '#7c8494' :
    site.totalScore >= 80 ? '#22c55e' :
    site.totalScore >= 65 ? '#2196f3' :
    site.totalScore >= 50 ? '#f59e0b' : '#ef4444'

  return (
    <div className="space-y-5 max-w-7xl">
      {/* Breadcrumb */}
      <nav className="text-xs text-[--text-muted] flex items-center gap-1.5">
        <Link href="/pipeline" className="hover:text-[--accent-blue]">Pipeline</Link>
        <span>/</span>
        <span className="text-[--text-primary]">{site.name}</span>
      </nav>

      {/* Site header */}
      <div className="flex items-start gap-4 flex-wrap">
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-bold text-[--text-primary]">{site.name}</h1>
          <p className="text-sm text-[--text-muted]">
            {[site.city, site.state, site.country].filter(Boolean).join(', ')}
            {site.siteType && <span className="ml-2 text-[--text-dimmed]">· {site.siteType.replace(/_/g, ' ')}</span>}
          </p>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className="status-pill bg-[--bg-hover] text-[--text-muted] text-[10px]">
              {site.stage?.replace(/_/g, ' ')}
            </span>
            {site.recommendation && (
              <span className={`status-pill text-[10px] ${
                site.recommendation === 'FLAGSHIP_FIT' ? 'bg-green-900/30 text-green-400' :
                site.recommendation === 'STRATEGIC_FIT' ? 'bg-blue-900/30 text-blue-400' :
                site.recommendation === 'STANDARD_FIT' ? 'bg-amber-900/30 text-amber-400' :
                'bg-gray-800 text-gray-400'
              }`}>
                {site.recommendation.replace(/_/g, ' ')}
              </span>
            )}
            {critRisks.length > 0 && (
              <span className="sev-critical text-[10px]">{critRisks.length} CRITICAL</span>
            )}
            {openTasks.length > 0 && (
              <span className="status-pill bg-amber-900/20 text-amber-400 text-[10px]">
                {openTasks.length} open tasks
              </span>
            )}
          </div>
        </div>

        {/* Score pill */}
        {site.totalScore != null && (
          <div className="dc-card px-5 py-3 text-center">
            <div className="text-3xl font-bold" style={{ color: scoreColor }}>
              {site.totalScore.toFixed(1)}
            </div>
            <div className="text-[10px] text-[--text-muted] uppercase tracking-wide">Score</div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Link href={`/sites/${site.id}/edit`} className="btn-primary text-xs">
            Edit Data
          </Link>
          <form action={`/api/sites/${site.id}/score`} method="POST">
            <button type="submit" className="btn-ghost text-xs">Recompute Score</button>
          </form>
          <Link href={`/reports?siteId=${site.id}`} className="btn-ghost text-xs">
            Export
          </Link>
        </div>
      </div>

      {/* Scorecard */}
      {site.scorecard && (
        <div className="dc-card p-4">
          <h2 className="text-xs font-semibold text-[--text-muted] uppercase tracking-wide mb-4">Scorecard</h2>
          <ScorecardView scorecard={site.scorecard as any} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Power */}
        <div className="dc-card p-4 space-y-2">
          <h2 className="text-xs font-semibold text-[--accent-blue] uppercase tracking-wide">Power & Utility</h2>
          <Row label="Provider"          value={u?.provider} />
          <Row label="Delivered MW"      value={u?.deliveredMW ? `${u.deliveredMW} MW` : null} />
          <Row label="Expandable MW"     value={u?.expandableMW ? `${u.expandableMW} MW` : null} />
          <Row label="Feed count"        value={u?.feedCount?.toString()} />
          <Row label="Grid reliability"  value={u?.gridReliabilityPercent ? `${u.gridReliabilityPercent}%` : null} />
          <Row label="Generators"        value={g ? `${g.count ?? '?'} × ${g.capacityKwEach ?? '?'} kW (${g.redundancyModel ?? '?'})` : null} />
          <Row label="Gen autonomy"      value={g?.autonomyHours ? `${g.autonomyHours}h` : null} />
          <Row label="UPS topology"      value={ups?.topology} />
          <Row label="UPS runtime"       value={ups?.runtimeMinutes ? `${ups.runtimeMinutes} min` : null} />
        </div>

        {/* Cooling */}
        <div className="dc-card p-4 space-y-2">
          <h2 className="text-xs font-semibold text-[--accent-blue] uppercase tracking-wide">Cooling</h2>
          <Row label="Type"              value={c?.coolingType?.replace(/_/g, ' ')} />
          <Row label="Max rack kW"       value={c?.maxRackKwSupported ? `${c.maxRackKwSupported} kW` : null} />
          <Row label="PUE (annual)"      value={c?.pueAnnual?.toFixed(2)} />
          <Row label="PUE (target)"      value={c?.pueTarget?.toFixed(2)} />
          <Row label="Liquid cooling"    value={c?.isLiquidCoolingReady ? 'Yes' : c?.isLiquidCoolingReady === false ? 'No' : null} />
          <Row label="CDU"               value={c?.hasCdu ? 'Yes' : c?.hasCdu === false ? 'No' : null} />
          <Row label="Immersion"         value={c?.hasImmersionCooling ? 'Yes' : c?.hasImmersionCooling === false ? 'No' : null} />
          <Row label="WUE"               value={c?.wueValue?.toFixed(2)} />
        </div>

        {/* Network */}
        <div className="dc-card p-4 space-y-2">
          <h2 className="text-xs font-semibold text-[--accent-blue] uppercase tracking-wide">Network</h2>
          <Row label="Carriers on-site"  value={n?.carriersOnSite?.toString()} />
          <Row label="Route diversity"   value={n?.hasRouteDiversity ? 'Yes' : n?.hasRouteDiversity === false ? 'No' : null} />
          <Row label="Dark fiber"        value={n?.hasDarkFiber ? 'Yes' : n?.hasDarkFiber === false ? 'No' : null} />
          <Row label="MMR"               value={n?.hasMeetMeRoom ? 'Yes' : n?.hasMeetMeRoom === false ? 'No' : null} />
          <Row label="IX proximity"      value={n?.ixProximityMiles ? `${n.ixProximityMiles} mi` : null} />
          <Row label="Bandwidth"         value={n?.aggregateBandwidthTbps ? `${n.aggregateBandwidthTbps} Tbps` : null} />
          <Row label="Cloud latency"     value={n?.cloudOnRampLatencyMs ? `${n.cloudOnRampLatencyMs} ms` : null} />
        </div>

        {/* Security & Compliance */}
        <div className="dc-card p-4 space-y-2">
          <h2 className="text-xs font-semibold text-[--accent-blue] uppercase tracking-wide">Security & Compliance</h2>
          <Row label="Biometrics"        value={sec?.hasBiometrics ? 'Yes' : sec?.hasBiometrics === false ? 'No' : null} />
          <Row label="Mantraps"          value={sec?.hasMantraps ? 'Yes' : sec?.hasMantraps === false ? 'No' : null} />
          <Row label="SOC/NOC"           value={sec?.hasSocNoc ? 'Yes' : sec?.hasSocNoc === false ? 'No' : null} />
          <Row label="CCTV (DC floor)"   value={sec?.hasCctvDataCenter ? 'Yes' : sec?.hasCctvDataCenter === false ? 'No' : null} />
          <Row label="SOC 2 Type II"     value={comp?.hasSoc2 ? 'Yes ✓' : comp?.hasSoc2 === false ? 'No' : null} />
          <Row label="ISO 27001"         value={comp?.hasIso27001 ? 'Yes ✓' : comp?.hasIso27001 === false ? 'No' : null} />
          <Row label="CJIS"              value={comp?.hasCjis ? 'Yes ✓' : comp?.hasCjis === false ? 'No' : null} />
          <Row label="Uptime Tier"       value={comp?.uptimeTier} />
          <Row label="Sovereign suitable" value={comp?.sovereignSuitable ? 'Yes' : comp?.sovereignSuitable === false ? 'No' : null} />
        </div>
      </div>

      {/* Capital */}
      {cap && (
        <div className="dc-card p-4 space-y-2">
          <h2 className="text-xs font-semibold text-[--accent-blue] uppercase tracking-wide">Capital Structure</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Mini label="Total Cost" value={cap.totalProjectCostM ? `$${cap.totalProjectCostM}M` : '—'} />
            <Mini label="Equity"     value={cap.commonEquityM ? `$${cap.commonEquityM}M` : '—'} />
            <Mini label="Debt"       value={cap.seniorDebtM ? `$${cap.seniorDebtM}M` : '—'} />
            <Mini label="LTV"        value={cap.targetLtv ? `${(cap.targetLtv * 100).toFixed(0)}%` : '—'} />
            <Mini label="DSCR"       value={cap.targetDscr?.toFixed(2) ?? '—'} />
            <Mini label="IRR (lev.)" value={cap.targetIrrLevered ? `${(cap.targetIrrLevered * 100).toFixed(1)}%` : '—'} />
            <Mini label="Hold"       value="—" />
            <Mini label="Eq. Multiple" value="—" />
          </div>
        </div>
      )}

      {/* Risk Flags */}
      {openRisks.length > 0 && (
        <div className="dc-card p-4">
          <h2 className="text-xs font-semibold text-[--accent-red] uppercase tracking-wide mb-3">
            Risk Flags ({openRisks.length} open)
          </h2>
          <div className="space-y-2">
            {openRisks.slice(0, 12).map(r => (
              <div key={r.id} className="flex gap-3 p-2.5 rounded bg-[--bg-hover]">
                <span className={`text-[10px] shrink-0 mt-0.5 ${
                  r.severity === 'CRITICAL' ? 'sev-critical' :
                  r.severity === 'HIGH' ? 'sev-high' :
                  r.severity === 'MEDIUM' ? 'sev-medium' : 'sev-low'
                }`}>{r.severity}</span>
                <div>
                  <div className="text-xs font-medium text-[--text-primary]">{r.title}</div>
                  <div className="text-xs text-[--text-muted] mt-0.5">{r.description}</div>
                  {r.recommendation && (
                    <div className="text-[10px] text-[--accent-blue] mt-1">→ {r.recommendation}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Agent runs */}
      {site.agentRuns.length > 0 && (
        <div className="dc-card p-4">
          <h2 className="text-xs font-semibold text-[--text-muted] uppercase tracking-wide mb-3">
            Agent Activity
          </h2>
          <AgentTimeline runs={site.agentRuns as any} />
        </div>
      )}
    </div>
  )
}

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex items-baseline gap-2 text-xs">
      <span className="text-[--text-dimmed] w-36 shrink-0">{label}</span>
      <span className={value ? 'text-[--text-primary]' : 'text-[--text-dimmed]'}>{value ?? '—'}</span>
    </div>
  )
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[--bg-hover] rounded p-3">
      <div className="text-[10px] text-[--text-dimmed] uppercase tracking-wide">{label}</div>
      <div className="text-sm font-bold text-[--text-primary] mt-1">{value}</div>
    </div>
  )
}
