import { db } from '@/lib/db'
import Link from 'next/link'
import { KpiCard } from '@/components/dashboard/kpi-card'
import { PipelineChart } from '@/components/dashboard/pipeline-chart'
import { formatMW, formatScore, RECOMMENDATION_COLORS } from '@/lib/utils'
import { AlertTriangle, Zap, TrendingUp, CheckCircle } from 'lucide-react'

async function getDashboardData() {
  const [sites, tasks, recentRuns] = await Promise.all([
    db.site.findMany({
      where: { status: { not: 'ARCHIVED' } },
      select: {
        id: true, name: true, city: true, state: true,
        stage: true, status: true, totalScore: true,
        recommendation: true, targetItMW: true,
        riskFlags: { where: { severity: 'CRITICAL', isResolved: false }, select: { id: true } },
        scorecard: { select: { computedAt: true } },
      },
      orderBy: { totalScore: 'desc' },
    }),
    db.workflowTask.findMany({
      where: { status: { in: ['OPEN', 'IN_PROGRESS', 'ESCALATED'] } },
      orderBy: { dueDate: 'asc' },
      take: 6,
      include: { site: { select: { name: true, id: true } } },
    }),
    db.agentRun.findMany({
      orderBy: { startedAt: 'desc' },
      take: 5,
      include: { site: { select: { name: true, id: true } } },
    }),
  ])

  const stageMap: Record<string, number> = {}
  let totalMW = 0
  let critCount = 0
  for (const s of sites) {
    stageMap[s.stage] = (stageMap[s.stage] ?? 0) + 1
    totalMW += s.targetItMW ?? 0
    critCount += s.riskFlags.length
  }

  return { sites, tasks, recentRuns, stageMap, totalMW, critCount }
}

export default async function DashboardPage() {
  const { sites, tasks, recentRuns, stageMap, totalMW, critCount } = await getDashboardData()

  const flagship  = sites.filter(s => s.recommendation === 'FLAGSHIP_FIT').length
  const strategic = sites.filter(s => s.recommendation === 'STRATEGIC_FIT').length

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-base font-bold text-[--text-primary]">Operations Dashboard</h1>
        <p className="text-xs text-[--text-muted]">Live pipeline intelligence — {sites.length} active sites</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Active Sites"    value={sites.length}    icon={<TrendingUp size={16} />} />
        <KpiCard label="Total MW"         value={`${Math.round(totalMW)} MW`} icon={<Zap size={16} />} />
        <KpiCard label="Critical Risks"   value={critCount}       icon={<AlertTriangle size={16} />} accent="red" />
        <KpiCard label="Flagship / Strategic" value={`${flagship} / ${strategic}`} icon={<CheckCircle size={16} />} accent="green" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Pipeline chart */}
        <div className="lg:col-span-2 dc-card p-4">
          <h2 className="text-xs font-semibold text-[--text-muted] uppercase tracking-wide mb-4">
            Pipeline by Stage
          </h2>
          <PipelineChart stageMap={stageMap} />
        </div>

        {/* Open tasks */}
        <div className="dc-card p-4">
          <h2 className="text-xs font-semibold text-[--text-muted] uppercase tracking-wide mb-3">
            Open Tasks
          </h2>
          <div className="space-y-2">
            {tasks.length === 0 && (
              <p className="text-xs text-[--text-dimmed]">No open tasks.</p>
            )}
            {tasks.map(t => (
              <div key={t.id} className="flex items-start gap-2 p-2 rounded bg-[--bg-hover]">
                <div className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${t.status === 'ESCALATED' ? 'bg-red-500' : 'bg-amber-400'}`} />
                <div className="min-w-0">
                  <div className="text-xs text-[--text-primary] truncate">{t.title}</div>
                  <Link href={`/sites/${t.site?.id}`} className="text-[10px] text-[--accent-blue] hover:underline">
                    {t.site?.name}
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <Link href="/approvals" className="block mt-3 text-xs text-[--accent-blue] hover:underline">
            View all tasks →
          </Link>
        </div>
      </div>

      {/* Top sites */}
      <div className="dc-card">
        <div className="px-4 py-3 border-b border-[--bg-border] flex items-center gap-3">
          <h2 className="text-xs font-semibold text-[--text-muted] uppercase tracking-wide flex-1">
            Top Ranked Sites
          </h2>
          <Link href="/pipeline" className="text-xs text-[--accent-blue] hover:underline">
            Full pipeline →
          </Link>
        </div>
        <table className="dc-table">
          <thead>
            <tr>
              <th>Site</th>
              <th>Stage</th>
              <th>MW</th>
              <th>Score</th>
              <th>Tier</th>
              <th>Risks</th>
            </tr>
          </thead>
          <tbody>
            {sites.slice(0, 8).map(site => (
              <tr key={site.id}>
                <td>
                  <Link href={`/sites/${site.id}`} className="text-[--text-primary] hover:text-[--accent-blue]">
                    {site.name}
                  </Link>
                  <span className="text-[--text-dimmed] text-xs ml-1.5">{site.city}, {site.state}</span>
                </td>
                <td className="text-[--text-muted] text-xs">{site.stage?.replace(/_/g, ' ')}</td>
                <td className="text-[--text-muted]">{site.targetItMW ? formatMW(site.targetItMW) : '—'}</td>
                <td className="font-bold" style={{ color: site.totalScore ? (site.totalScore >= 80 ? '#22c55e' : site.totalScore >= 65 ? '#2196f3' : site.totalScore >= 50 ? '#f59e0b' : '#ef4444') : '#7c8494' }}>
                  {site.totalScore?.toFixed(1) ?? '—'}
                </td>
                <td>
                  {site.recommendation ? (
                    <span className={`status-pill text-[10px] ${
                      site.recommendation === 'FLAGSHIP_FIT' ? 'bg-green-900/30 text-green-400' :
                      site.recommendation === 'STRATEGIC_FIT' ? 'bg-blue-900/30 text-blue-400' :
                      site.recommendation === 'STANDARD_FIT' ? 'bg-amber-900/30 text-amber-400' :
                      'bg-gray-800 text-gray-400'
                    }`}>
                      {site.recommendation.replace(/_/g, ' ')}
                    </span>
                  ) : <span className="text-[--text-dimmed] text-xs">—</span>}
                </td>
                <td>
                  {site.riskFlags.length > 0 ? (
                    <span className="status-pill text-[10px] bg-red-900/30 text-red-400">
                      {site.riskFlags.length} CRIT
                    </span>
                  ) : <span className="text-[--text-dimmed] text-xs">—</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
