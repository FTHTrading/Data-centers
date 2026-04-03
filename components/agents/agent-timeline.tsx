interface AgentTimelineProps {
  runs: {
    id: string
    agentType: string
    status: string
    summary: string | null
    factsExtracted: number | null
    risksDetected: number | null
    durationMs: number | null
    startedAt: Date | null
    attachment?: { filename: string } | null
  }[]
}

const AGENT_COLOR: Record<string, string> = {
  INTAKE:               '#6366f1',
  DOCUMENT_EXTRACTION:  '#8b5cf6',
  POWER_UTILITY:        '#f59e0b',
  COOLING_AI_READINESS: '#06b6d4',
  NETWORK:              '#3b82f6',
  COMPLIANCE:           '#10b981',
  RISK:                 '#ef4444',
  FINANCIAL_MODELING:   '#8b5cf6',
  SUMMARY:              '#22c55e',
}

const STATUS_STYLE: Record<string, string> = {
  COMPLETED: 'bg-green-900/30 text-green-400',
  RUNNING:   'bg-blue-900/30 text-blue-400',
  FAILED:    'bg-red-900/30 text-red-400',
  PENDING:   'bg-gray-800 text-gray-400',
}

export function AgentTimeline({ runs }: AgentTimelineProps) {
  return (
    <div className="space-y-2">
      {runs.map(run => {
        const color = AGENT_COLOR[run.agentType] ?? '#6b7280'
        const ago = run.startedAt
          ? Math.round((Date.now() - new Date(run.startedAt).getTime()) / 60000)
          : null
        return (
          <div key={run.id} className="flex items-start gap-3 p-2.5 rounded bg-[--bg-hover]">
            <div className="mt-1 w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-medium text-[--text-primary]">
                  {run.agentType.replace(/_/g, ' ')}
                </span>
                <span className={`status-pill text-[9px] ${STATUS_STYLE[run.status] ?? 'bg-gray-800 text-gray-400'}`}>
                  {run.status}
                </span>
                {run.factsExtracted != null && run.factsExtracted > 0 && (
                  <span className="text-[10px] text-[--text-dimmed]">{run.factsExtracted} facts</span>
                )}
                {run.risksDetected != null && run.risksDetected > 0 && (
                  <span className="text-[10px] text-red-400">{run.risksDetected} risks</span>
                )}
                {run.durationMs != null && (
                  <span className="text-[10px] text-[--text-dimmed]">{(run.durationMs / 1000).toFixed(1)}s</span>
                )}
              </div>
              {run.summary && (
                <p className="text-xs text-[--text-muted] mt-0.5 truncate">{run.summary}</p>
              )}
              {run.attachment && (
                <span className="text-[10px] text-[--text-dimmed]">📎 {run.attachment.filename}</span>
              )}
            </div>
            <span className="text-[10px] text-[--text-dimmed] shrink-0">
              {ago != null ? (ago < 60 ? `${ago}m ago` : `${Math.round(ago / 60)}h ago`) : ''}
            </span>
          </div>
        )
      })}
    </div>
  )
}
