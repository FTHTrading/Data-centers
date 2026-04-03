import Link from 'next/link'
import { formatRelative } from '@/lib/utils'

interface AgentRun {
  id: string
  agentType: string
  status: string
  summary?: string | null
  confidenceScore?: number | null
  factsExtracted?: number | null
  risksDetected?: number | null
  durationMs?: number | null
  startedAt?: Date | null
  site?: { id: string; name?: string | null }
}

const AGENT_TYPE_LABELS: Record<string, string> = {
  INTAKE:              'Intake',
  DOCUMENT_EXTRACTION: 'Doc Extraction',
  POWER_UTILITY:       'Power & Utility',
  COOLING_AI_READINESS:'Cooling AI',
  NETWORK:             'Network',
  COMPLIANCE:          'Compliance',
  RISK:                'Risk',
  FINANCIAL_MODELING:  'Financial Model',
  SUMMARY:             'Summary',
}

const STATUS_COLORS: Record<string, string> = {
  COMPLETED: 'bg-emerald-500',
  RUNNING:   'bg-blue-400 animate-pulse',
  FAILED:    'bg-red-500',
  PENDING:   'bg-[var(--fg-muted)]',
  QUEUED:    'bg-amber-400 animate-pulse',
}

interface AgentCardProps {
  run: AgentRun
  showSite?: boolean
}

export function AgentCard({ run, showSite = false }: AgentCardProps) {
  const label   = AGENT_TYPE_LABELS[run.agentType] ?? run.agentType
  const dotColor = STATUS_COLORS[run.status] ?? STATUS_COLORS.PENDING

  return (
    <div className="dc-card p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className={`h-2 w-2 rounded-full flex-shrink-0 ${dotColor}`} />
          <span className="text-sm font-medium text-white truncate">{label}</span>
        </div>
        <span className="text-xs text-[var(--fg-muted)] whitespace-nowrap">
          {run.startedAt ? formatRelative(run.startedAt) : '—'}
        </span>
      </div>

      {showSite && run.site && (
        <Link
          href={`/dashboard/sites/${run.site.id}`}
          className="text-xs text-[var(--accent-blue)] hover:underline"
        >
          {run.site.name ?? run.site.id.slice(0, 8)}
        </Link>
      )}

      {run.summary && (
        <p className="text-xs text-[var(--fg-muted)] leading-relaxed line-clamp-2">
          {run.summary}
        </p>
      )}

      <div className="flex items-center gap-4 text-xs text-[var(--fg-muted)]">
        {run.factsExtracted != null && (
          <span>{run.factsExtracted} facts</span>
        )}
        {run.risksDetected != null && run.risksDetected > 0 && (
          <span className="text-amber-400">{run.risksDetected} risks</span>
        )}
        {run.confidenceScore != null && (
          <span>{Math.round(run.confidenceScore * 100)}% confidence</span>
        )}
        {run.durationMs != null && (
          <span>{run.durationMs < 1000 ? `${run.durationMs}ms` : `${(run.durationMs / 1000).toFixed(1)}s`}</span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <span className={`status-pill text-[10px] ${
          run.status === 'COMPLETED' ? 'text-emerald-400 bg-emerald-400/10' :
          run.status === 'FAILED'    ? 'text-red-400 bg-red-400/10' :
          run.status === 'RUNNING'   ? 'text-blue-400 bg-blue-400/10' :
          'text-[var(--fg-muted)] bg-[var(--bg-border)]'
        }`}>
          {run.status}
        </span>
        <span className="text-[10px] text-[var(--fg-muted)]">run:{run.id.slice(0, 8)}</span>
      </div>
    </div>
  )
}
