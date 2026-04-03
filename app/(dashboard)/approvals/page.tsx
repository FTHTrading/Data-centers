import { db } from '@/lib/db'
import Link from 'next/link'

async function getApprovalQueue() {
  const sites = await db.site.findMany({
    where: {
      stage: { in: ['TECHNICAL_REVIEW', 'FINANCIAL_REVIEW', 'COMPLIANCE_REVIEW', 'EXECUTIVE_REVIEW'] as any[] },
      status: { not: 'ARCHIVED' as any },
    },
    select: {
      id: true, name: true, city: true, state: true,
      stage: true, totalScore: true, recommendation: true,
      riskFlags: { where: { severity: 'CRITICAL', isResolved: false }, select: { id: true } },
      tasks: {
        where: { status: { in: ['OPEN','ESCALATED'] as any[] } },
        orderBy: { dueDate: 'asc' },
        select: { id: true, title: true, priority: true, status: true, dueDate: true },
      },
    },
    orderBy: [{ totalScore: 'desc' }],
  })

  return sites
}

const STAGE_LABEL: Record<string, string> = {
  TECHNICAL_REVIEW:  'Technical Review',
  FINANCIAL_REVIEW:  'Financial Review',
  COMPLIANCE_REVIEW: 'Compliance Review',
  EXECUTIVE_REVIEW:  'Executive Review',
}

export default async function ApprovalsPage() {
  const sites = await getApprovalQueue()

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-base font-bold text-[--text-primary]">Approval Queue</h1>
        <p className="text-xs text-[--text-muted]">
          {sites.length} sites in active review stages — sorted by score
        </p>
      </div>

      {sites.length === 0 && (
        <div className="dc-card p-8 text-center text-[--text-dimmed] text-sm">
          No sites currently in review stages.
        </div>
      )}

      <div className="space-y-3">
        {sites.map(site => {
const overdueTasks = site.tasks.filter(
            t => t.dueDate && new Date(t.dueDate) < new Date()
          )

          return (
            <div key={site.id} className="dc-card p-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <Link href={`/sites/${site.id}`} className="text-sm font-bold text-[--text-primary] hover:text-[--accent-blue]">
                    {site.name}
                  </Link>
                  <div className="text-xs text-[--text-muted] mt-0.5">
                    {site.city}, {site.state} · Stage: {STAGE_LABEL[site.stage] ?? site.stage}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {site.riskFlags.length > 0 && (
                    <span className="sev-critical text-[10px]">{site.riskFlags.length} CRIT</span>
                  )}
                  {site.totalScore != null && (
                    <span className="text-sm font-bold" style={{
                      color: site.totalScore >= 80 ? '#22c55e' :
                             site.totalScore >= 65 ? '#2196f3' :
                             site.totalScore >= 50 ? '#f59e0b' : '#ef4444'
                    }}>
                      {site.totalScore.toFixed(1)}
                    </span>
                  )}
                </div>
              </div>

              {site.tasks.length > 0 && (
                <div className="space-y-1.5">
                  {site.tasks.slice(0, 4).map(t => {
                    const isOverdue = t.dueDate && new Date(t.dueDate) < new Date()
                    return (
                      <div key={t.id} className="flex items-center gap-2 text-xs">
                        <div className={`w-1.5 h-1.5 rounded-full ${
                          t.status === 'ESCALATED' || isOverdue ? 'bg-red-500' :
                          t.priority === 'CRITICAL' ? 'bg-red-400' :
                          t.priority === 'HIGH' ? 'bg-amber-400' : 'bg-gray-500'
                        }`} />
                        <span className={isOverdue ? 'text-red-400' : 'text-[--text-muted]'}>
                          {t.title}
                        </span>
                        {isOverdue && <span className="text-red-400 text-[10px]">OVERDUE</span>}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
