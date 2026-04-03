// services/agents/intake.ts
// IntakeAgent — normalizes broker submissions, maps loose language to structured fields

import { BaseAgent, type AgentInput } from './base'
import type { AgentOutputPayload } from '@/types'

export class IntakeAgent extends BaseAgent {
  readonly agentType = 'INTAKE' as const
  readonly displayName = 'Intake & Normalization Agent'

  protected async execute(
    input: AgentInput,
    site: Record<string, unknown>,
  ): Promise<AgentOutputPayload> {
    const facts = []
    const risks = []
    const recs  = []

    // Check completeness of basic identity fields
    const name         = site.name as string | null
    const city         = site.city as string | null
    const state        = site.state as string | null
    const status       = site.status as string
    const siteType     = site.siteType as string | null
    const ownership    = site.ownershipStatus as string | null
    const targetMW     = site.targetItMW as number | null
    const maxExpandMW  = site.maxExpandableMW as number | null
    const sourceName   = site.sourceName as string | null

    let missingCritical: string[] = []

    if (!city || !state) {
      missingCritical.push('City / State')
      risks.push(this.risk('DATA_QUALITY', 'MEDIUM', 'Missing location data',
        'Site city or state not captured — required for jurisdiction scoring and logistics analysis.',
        'Obtain broker confirmation or map parcel to jurisdiction.'))
    }

    if (!siteType) {
      missingCritical.push('Site type (Greenfield / Retrofit / Powered Shell)')
      risks.push(this.risk('DATA_QUALITY', 'HIGH', 'Site type not classified',
        'Site type is required for scoring, stage routing, and capex estimation.',
        'Classify as Greenfield, Retrofit, Powered Shell, etc.'))
    }

    if (!ownership) {
      missingCritical.push('Ownership / control status')
    }

    if (!targetMW && !maxExpandMW) {
      missingCritical.push('Target IT MW or max expandable MW')
      risks.push(this.risk('DATA_QUALITY', 'HIGH', 'No power scale captured',
        'Neither target IT MW nor expandable MW is present — cannot score power depth.',
        'Obtain LOI or utility capacity letter with committed MW.'))
    }

    if (!sourceName) {
      facts.push(this.fact('sourceName', 'Source / broker name',
        'Unknown', 0.3, 'No source captured in intake form.', true))
    }

    // Normalization recommendations
    recs.push(this.rec('INTAKE',
      status === 'INTAKE'
        ? 'Site ready for initial screening — assign analyst and upload any available broker package.'
        : 'Site already past intake — confirm all identity fields are locked before advancing.',
      0.9))

    if (targetMW && targetMW > 100) {
      recs.push(this.rec('INTAKE',
        `Large-scale site (${targetMW} MW target) — prioritize utility confirmation and interconnection queue check.`,
        0.85))
    }

    const filled = [name, city, state, siteType, ownership, targetMW].filter(Boolean).length
    const confidence = filled / 6

    return {
      agentType: 'INTAKE',
      siteId: input.siteId,
      summary: `Intake review complete. ${6 - missingCritical.length}/6 key identity fields present. ${missingCritical.length} critical gaps detected.`,
      confidence,
      extractedFacts: facts,
      riskFlags: risks,
      recommendations: recs,
      missingCriticalFields: missingCritical,
    }
  }
}

export const intakeAgent = new IntakeAgent()
