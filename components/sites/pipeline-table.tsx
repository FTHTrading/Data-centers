import Link from 'next/link'

interface Row {
  id: string
  name?: string | null
  city?: string | null
  state?: string | null
  siteType?: string | null
  targetItMW?: number | null
  stage: string
  totalScore?: number | null
  recommendation?: string | null
  _count?: {
    riskFlags?: number
    workflowTasks?: number
  }
}

const STAGE_LABELS: Record<string, string> = {
  SOURCING:          'Sourcing',
  QUALIFICATION:     'Qualification',
  INITIAL_REVIEW:    'Initial Review',
  TECHNICAL_REVIEW:  'Technical Review',
  FINANCIAL_REVIEW:  'Financial Review',
  COMPLIANCE_REVIEW: 'Compliance Review',
  EXECUTIVE_REVIEW:  'Executive Review',
  APPROVED:          'Approved',
  REJECTED:          'Rejected',
  ON_HOLD:           'On Hold',
}

const TIER_MAP: Record<string, string> = {
  FLAGSHIP:  'badge-flagship',
  STRATEGIC: 'badge-strategic',
  STANDARD:  'badge-standard',
  WATCHLIST: 'badge-watchlist',
  REJECT:    'badge-reject',
}

function scoreColor(n: number | null | undefined) {
  if (n == null) return 'text-[var(--fg-muted)]'
  if (n >= 80) return 'text-emerald-400'
  if (n >= 65) return 'text-blue-400'
  if (n >= 50) return 'text-amber-400'
  return 'text-red-400'
}

interface PipelineTableProps {
  rows: Row[]
  showRank?: boolean
}

export function PipelineTable({ rows, showRank = true }: PipelineTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="dc-table w-full">
        <thead>
          <tr>
            {showRank && <th className="w-10">#</th>}
            <th>Site</th>
            <th>Type</th>
            <th>Stage</th>
            <th className="text-right">MW</th>
            <th className="text-right">Score</th>
            <th>Tier</th>
            <th className="text-right">Risks</th>
            <th className="text-right">Tasks</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={row.id}>
              {showRank && (
                <td className="text-[var(--fg-muted)] text-xs">{idx + 1}</td>
              )}
              <td>
                <Link
                  href={`/dashboard/sites/${row.id}`}
                  className="text-white hover:text-[var(--accent-blue)] transition-colors font-medium"
                >
                  {row.name ?? row.id.slice(0, 8)}
                </Link>
                {(row.city || row.state) && (
                  <div className="text-xs text-[var(--fg-muted)] mt-0.5">
                    {row.city ? `${row.city}, ` : ''}{row.state}
                  </div>
                )}
              </td>
              <td className="text-[var(--fg-muted)] text-xs">
                {row.siteType?.replace(/_/g, ' ') ?? '—'}
              </td>
              <td>
                <span className="text-xs text-[var(--fg-primary)]">
                  {STAGE_LABELS[row.stage] ?? row.stage}
                </span>
              </td>
              <td className="text-right font-medium text-[var(--fg-primary)]">
                {row.targetItMW ?? '—'}
              </td>
              <td className={`text-right font-semibold tabular-nums ${scoreColor(row.totalScore)}`}>
                {row.totalScore?.toFixed(1) ?? '—'}
              </td>
              <td>
                {row.recommendation ? (
                  <span className={`status-pill ${TIER_MAP[row.recommendation] ?? 'badge-watchlist'}`}>
                    {row.recommendation}
                  </span>
                ) : (
                  <span className="text-[var(--fg-muted)] text-xs">—</span>
                )}
              </td>
              <td className="text-right text-xs">
                {(row._count?.riskFlags ?? 0) > 0 ? (
                  <span className="text-red-400 font-medium">{row._count!.riskFlags}</span>
                ) : (
                  <span className="text-[var(--fg-muted)]">0</span>
                )}
              </td>
              <td className="text-right text-xs text-[var(--fg-muted)]">
                {row._count?.workflowTasks ?? 0}
              </td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={showRank ? 9 : 8} className="text-center py-8 text-[var(--fg-muted)]">
                No sites found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
