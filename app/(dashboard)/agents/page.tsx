import { db } from '@/lib/db'
import Link from 'next/link'

async function getAgentData() {
  const [runs, pendingFacts] = await Promise.all([
    db.agentRun.findMany({
      orderBy: { startedAt: 'desc' },
      take: 50,
      include: {
        site: { select: { id: true, name: true } },
        attachment: { select: { fileName: true } },
      },
    }),
    db.extractedFact.count({ where: { reviewStatus: 'PENDING' } }),
  ])

  const byType: Record<string, { runs: number; facts: number; risks: number; avgMs: number }> = {}
  for (const r of runs) {
    if (!byType[r.agentType]) byType[r.agentType] = { runs: 0, facts: 0, risks: 0, avgMs: 0 }
    byType[r.agentType].runs++
    byType[r.agentType].facts += r.factsExtracted ?? 0
    byType[r.agentType].risks += r.risksDetected ?? 0
    byType[r.agentType].avgMs = r.durationMs ?? 0
  }

  return { runs, byType, pendingFacts }
}

const STATUS_STYLE: Record<string, string> = {
  COMPLETED: 'bg-green-900/30 text-green-400',
  RUNNING:   'bg-blue-900/30 text-blue-400 pulse-dot',
  FAILED:    'bg-red-900/30 text-red-400',
  PENDING:   'bg-gray-800 text-gray-400',
}

export default async function AgentsPage() {
  const { runs, byType, pendingFacts } = await getAgentData()

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-base font-bold text-[--text-primary]">Agent Control Center</h1>
          <p className="text-xs text-[--text-muted]">{runs.length} agent runs — {pendingFacts} facts awaiting review</p>
        </div>
      </div>

      {/* Agent type summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Object.entries(byType).map(([type, stats]) => (
          <div key={type} className="dc-card p-3">
            <div className="text-[10px] text-[--text-dimmed] uppercase tracking-wide truncate">
              {type.replace(/_/g, ' ')}
            </div>
            <div className="text-lg font-bold text-[--text-primary] mt-1">{stats.runs}</div>
            <div className="text-[10px] text-[--text-muted]">
              {stats.facts} facts · {stats.risks} risks
            </div>
          </div>
        ))}
      </div>

      {/* Run history */}
      <div className="dc-card overflow-x-auto">
        <div className="px-4 py-3 border-b border-[--bg-border]">
          <h2 className="text-xs font-semibold text-[--text-muted] uppercase tracking-wide">Recent Agent Runs</h2>
        </div>
        <table className="dc-table min-w-[700px]">
          <thead>
            <tr>
              <th>Agent</th>
              <th>Site</th>
              <th>Status</th>
              <th>Facts</th>
              <th>Risks</th>
              <th>Duration</th>
              <th>Started</th>
            </tr>
          </thead>
          <tbody>
            {runs.map(r => (
              <tr key={r.id}>
                <td className="text-xs text-[--text-primary]">{r.agentType.replace(/_/g, ' ')}</td>
                <td>
                  {r.site ? (
                    <Link href={`/dashboard/sites/${r.site.id}`} className="text-xs text-[--accent-blue] hover:underline">
                      {r.site.name}
                    </Link>
                  ) : <span className="text-[--text-dimmed]">—</span>}
                </td>
                <td>
                  <span className={`status-pill text-[10px] ${STATUS_STYLE[r.status] ?? ''}`}>
                    {r.status}
                  </span>
                </td>
                <td className="text-xs text-[--text-muted]">{r.factsExtracted ?? '—'}</td>
                <td className="text-xs text-[--text-muted]">{r.risksDetected ?? '—'}</td>
                <td className="text-xs text-[--text-muted]">
                  {r.durationMs ? `${(r.durationMs / 1000).toFixed(1)}s` : '—'}
                </td>
                <td className="text-xs text-[--text-dimmed]">
                  {r.startedAt ? new Date(r.startedAt).toLocaleString() : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
