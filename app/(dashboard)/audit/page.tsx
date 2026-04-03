import { db } from '@/lib/db'

async function getAuditLogs() {
  return db.auditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: {
      user: { select: { name: true, email: true } },
    },
  })
}

export default async function AuditPage() {
  const logs = await getAuditLogs()

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-base font-bold text-[--text-primary]">Audit Log</h1>
        <p className="text-xs text-[--text-muted]">Last {logs.length} system events — immutable record</p>
      </div>

      <div className="dc-card overflow-x-auto">
        <table className="dc-table min-w-[700px]">
          <thead>
            <tr>
              <th>Time</th>
              <th>User</th>
              <th>Action</th>
              <th>Entity</th>
              <th>Site</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(log => (
              <tr key={log.id}>
                <td className="text-[10px] text-[--text-dimmed] font-mono">
                  {new Date(log.createdAt).toLocaleString()}
                </td>
                <td className="text-xs text-[--text-muted]">
                  {log.user?.name ?? log.user?.email ?? 'System'}
                </td>
                <td>
                  <span className="status-pill bg-[--bg-hover] text-[10px] text-[--text-muted]">
                    {log.action}
                  </span>
                </td>
                <td className="text-xs text-[--text-muted]">{log.entityType}</td>
                <td className="text-xs">
                  {log.siteId ? (
                    <a href={`/dashboard/sites/${log.siteId}`} className="text-[--accent-blue] hover:underline">
                      {log.siteId.slice(0, 8)}
                    </a>
                  ) : '—'}
                </td>
                <td className="text-[10px] text-[--text-dimmed] max-w-xs truncate font-mono">
                  {log.changes ? JSON.stringify(log.changes).slice(0, 80) : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
