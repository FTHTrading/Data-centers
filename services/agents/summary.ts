// services/agents/summary.ts
// SummaryAgent — generates executive brief, IC memo content, partner-facing summary

import { BaseAgent, type AgentInput } from './base'
import type { AgentOutputPayload } from '@/types'

const RECOMMENDATION_LABELS: Record<string, string> = {
  FLAGSHIP_FIT:  'Flagship Fit — Tier I Strategic Acquisition',
  STRATEGIC_FIT: 'Strategic Fit — Proceed to Full Diligence',
  STANDARD_FIT:  'Standard Fit — Conditional Proceed',
  WATCHLIST:     'Watchlist — Monitor with Conditions',
  REJECT:        'Reject — Does Not Meet Minimum Criteria',
}

export class SummaryAgent extends BaseAgent {
  readonly agentType = 'SUMMARY' as const
  readonly displayName = 'Executive Summary Agent'

  protected async execute(
    input: AgentInput,
    site: Record<string, unknown>,
  ): Promise<AgentOutputPayload> {
    const recs  = []

    const name         = site.name as string
    const city         = site.city as string | null
    const state        = site.state as string | null
    const siteType     = site.siteType as string | null
    const targetMW     = site.targetItMW as number | null
    const scorecard    = site.scorecard as Record<string, any> | null
    const riskFlags    = (site.riskFlags as any[]) ?? []
    const tasks        = [] // would need to include in fetch
    const stage        = site.stage as string

    const criticalRisks = riskFlags.filter((r: any) => r.severity === 'CRITICAL' && !r.isResolved)
    const highRisks     = riskFlags.filter((r: any) => r.severity === 'HIGH' && !r.isResolved)

    const score       = scorecard?.totalScore
    const rec         = scorecard?.recommendation
    const recLabel    = rec ? RECOMMENDATION_LABELS[rec] ?? rec : 'Not yet scored'

    // Build executive summary
    const location  = [city, state].filter(Boolean).join(', ') || 'Location TBD'
    const mwStr     = targetMW ? `${targetMW} MW IT target` : 'Scale TBD'
    const typeStr   = siteType?.replace(/_/g, ' ').toLowerCase() ?? 'type unspecified'
    const scoreStr  = score != null ? `${score.toFixed(1)}/100` : 'Not yet computed'

    const summary = [
      `${name} (${location}) — ${typeStr} — ${mwStr}.`,
      `Overall score: ${scoreStr}. Recommendation: ${recLabel}.`,
      criticalRisks.length > 0
        ? `⚠ ${criticalRisks.length} CRITICAL risk(s) currently block advancement: ${criticalRisks.slice(0, 2).map((r: any) => r.title).join('; ')}${criticalRisks.length > 2 ? '...' : '.'}`
        : 'No critical blockers.',
      scorecard?.keyStrengths ? `Key strengths: ${scorecard.keyStrengths}.` : '',
      scorecard?.keyWeaknesses ? `Key gaps: ${scorecard.keyWeaknesses}.` : '',
      `Pipeline stage: ${stage.replace(/_/g, ' ')}.`,
    ].filter(Boolean).join(' ')

    // IC memo recommendation
    if (rec === 'FLAGSHIP_FIT' && criticalRisks.length === 0) {
      recs.push(this.rec('EXECUTIVE',
        `${name} qualifies as Flagship Fit (${scoreStr}). Recommend IC approval to proceed to contract negotiation with priority allocation.`,
        0.95))
    } else if (rec === 'STRATEGIC_FIT' && criticalRisks.length === 0) {
      recs.push(this.rec('EXECUTIVE',
        `${name} qualifies as Strategic Fit (${scoreStr}). Recommend IC approval to proceed to binding diligence period with standard conditions.`,
        0.90))
    } else if (rec === 'STANDARD_FIT') {
      recs.push(this.rec('EXECUTIVE',
        `${name} is a Standard Fit (${scoreStr}). Recommend conditional proceed — ${highRisks.length} HIGH risk(s) should be addressed within 30 days.`,
        0.80))
    } else if (criticalRisks.length > 0) {
      recs.push(this.rec('EXECUTIVE',
        `${name} has ${criticalRisks.length} CRITICAL risk(s) outstanding. Do not advance to IC until resolved. Assign remediation tasks to responsible engineers.`,
        1.0))
    }

    // Partner brief note
    recs.push(this.rec('PARTNER_BRIEF',
      `${name} (${location}): ${typeStr}, ${mwStr}. Score ${scoreStr}. ${rec ? recLabel : 'Pending scoring.'}`,
      0.85))

    return {
      agentType: 'SUMMARY',
      siteId: input.siteId,
      summary,
      confidence:  scorecard ? 0.9 : 0.5,
      extractedFacts: [],
      riskFlags: [],
      recommendations: recs,
      missingCriticalFields: score == null ? ['Scorecard not yet computed'] : [],
    }
  }
}

export const summaryAgent = new SummaryAgent()
