import { db } from '@/lib/db'
import Link from 'next/link'
import { formatMW } from '@/lib/utils'

async function getPipelineSites() {
  return db.site.findMany({
    where: { status: { not: 'ARCHIVED' } },
    select: {
      id: true, name: true, city: true, state: true,
      siteType: true, stage: true, status: true,
      totalScore: true, recommendation: true,
      targetItMW: true,
      ownershipStatus: true, sourceName: true,
      riskFlags: { where: { isResolved: false }, select: { severity: true } },
      scorecard: { select: { confidenceScore: true } },
      _count: { select: { tasks: { where: { status: { in: ['OPEN','IN_PROGRESS','ESCALATED'] } } } } },
    },
    orderBy: [{ totalScore: 'desc' }, { createdAt: 'desc' }],
  })
}

export default async function PipelinePage() {
  const sites = await getPipelineSites()

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-base font-bold text-[--text-primary]">Site Pipeline</h1>
          <p className="text-xs text-[--text-muted]">{sites.length} sites across all stages</p>
        </div>
        <div className="ml-auto flex gap-2">
          <Link href="/sites/new" className="btn-primary text-xs">
            + New Site
          </Link>
        </div>
      </div>

      <div className="dc-card overflow-x-auto">
        <table className="dc-table min-w-[900px]">
          <thead>
            <tr>
              <th>#</th>
              <th>Site</th>
              <th>Type</th>
              <th>Stage</th>
              <th>MW</th>
              <th>Score</th>
              <th>Confidence</th>
              <th>Tier</th>
              <th>Risks</th>
              <th>Tasks</th>
            </tr>
          </thead>
          <tbody>
            {sites.map((site, i) => {
              const crits = site.riskFlags.filter(r => r.severity === 'CRITICAL').length
              const highs = site.riskFlags.filter(r => r.severity === 'HIGH').length
              const score = site.totalScore
              const scoreColor = !score ? '#7c8494' :
                score >= 80 ? '#22c55e' :
                score >= 65 ? '#2196f3' :
                score >= 50 ? '#f59e0b' :
                score >= 30 ? '#f97316' : '#ef4444'

              return (
                <tr key={site.id}>
                  <td className="text-[--text-dimmed] text-xs">{i + 1}</td>
                  <td>
                    <Link href={`/sites/${site.id}`} className="text-[--text-primary] hover:text-[--accent-blue] font-medium">
                      {site.name}
                    </Link>
                    <span className="text-[--text-dimmed] text-xs ml-1.5">{site.city}, {site.state}</span>
                  </td>
                  <td className="text-[--text-muted] text-xs">{site.siteType?.replace(/_/g, ' ') ?? '—'}</td>
                  <td className="text-[10px]">
                    <span className="status-pill bg-[--bg-hover] text-[--text-muted]">
                      {site.stage?.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="text-[--text-muted]">{site.targetItMW ? formatMW(site.targetItMW) : '—'}</td>
                  <td className="font-bold text-sm" style={{ color: scoreColor }}>
                    {score?.toFixed(1) ?? '—'}
                  </td>
                  <td className="text-[--text-muted] text-xs">
                    {site.scorecard?.confidenceScore != null
                      ? `${Math.round(site.scorecard.confidenceScore * 100)}%`
                      : '—'}
                  </td>
                  <td>
                    {site.recommendation ? (
                      <span className={`status-pill text-[10px] ${
                        site.recommendation === 'FLAGSHIP_FIT' ? 'bg-green-900/30 text-green-400' :
                        site.recommendation === 'STRATEGIC_FIT' ? 'bg-blue-900/30 text-blue-400' :
                        site.recommendation === 'STANDARD_FIT' ? 'bg-amber-900/30 text-amber-400' :
                        site.recommendation === 'WATCHLIST' ? 'bg-orange-900/30 text-orange-400' :
                        'bg-gray-800 text-gray-400'
                      }`}>
                        {site.recommendation.replace(/_/g, ' ')}
                      </span>
                    ) : <span className="text-[--text-dimmed] text-xs">Pending</span>}
                  </td>
                  <td>
                    {crits > 0 && <span className="sev-critical mr-1">{crits} C</span>}
                    {highs > 0 && <span className="sev-high">{highs} H</span>}
                    {crits === 0 && highs === 0 && <span className="text-[--text-dimmed] text-xs">—</span>}
                  </td>
                  <td className="text-[--text-muted] text-xs">
                    {site._count.tasks > 0
                      ? <span className="status-pill bg-[--bg-hover]">{site._count.tasks}</span>
                      : '—'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
