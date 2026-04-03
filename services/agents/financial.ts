// services/agents/financial.ts
// FinancialModelingAgent — capex model, EBITDA estimation, IRR snapshot, capital stack recommendation

import { BaseAgent, type AgentInput } from './base'
import type { AgentOutputPayload } from '@/types'

export class FinancialModelingAgent extends BaseAgent {
  readonly agentType = 'FINANCIAL_MODELING' as const
  readonly displayName = 'Financial Modeling Agent'

  protected async execute(
    input: AgentInput,
    site: Record<string, unknown>,
  ): Promise<AgentOutputPayload> {
    const facts = []
    const risks = []
    const recs  = []
    const missing: string[] = []

    const cap = site.capitalPlan as Record<string, any> | null
    const env = site.environmentalProfile as Record<string, any> | null
    const jur = site.jurisdictionProfile  as Record<string, any> | null
    const fin = (site.financialModels as any[]) ?? []
    const mw  = (site.targetItMW ?? site.currentItMW) as number | null

    if (!cap) {
      missing.push('Capital plan (project cost, debt structure)')
      risks.push(this.risk('COMMERCIAL_FINANCIAL', 'HIGH', 'No capital plan present',
        'Capital plan has not been created — cannot model returns, DSCR, or capital stack.'))
    } else {
      // Capex metrics
      if (cap.totalProjectCostM) {
        facts.push(this.fact('capitalPlan.totalProjectCostM', 'Total project cost ($M)', cap.totalProjectCostM, 0.85))
        if (mw && mw > 0) {
          const perMw = cap.totalProjectCostM / mw
          facts.push(this.fact('capitalPlan._costPerMW', 'Capex per MW ($M/MW)', perMw.toFixed(2), 0.8,
            'Derived: totalProjectCostM / targetItMW', true))
          if (perMw > 12) {
            risks.push(this.risk('COMMERCIAL_FINANCIAL', 'HIGH', 'Above-market capex/MW',
              `$${perMw.toFixed(1)}M/MW is above the $12M institutional threshold. Increases equity requirement and compresses returns.`,
              'Review cost drivers — explore phased buildout to lower initial capex.'))
          } else if (perMw <= 5) {
            recs.push(this.rec('FINANCIAL',
              `Attractive capex efficiency: $${perMw.toFixed(1)}M/MW — well below market. Validate cost completeness (include cooling, security, network uplift).`,
              0.8))
          }
        }
      } else {
        missing.push('Total project cost ($M)')
      }

      // Debt structure
      if (cap.seniorDebtM) {
        facts.push(this.fact('capitalPlan.seniorDebtM', 'Senior debt ($M)', cap.seniorDebtM, 0.8))
      }
      if (cap.targetLtv) {
        facts.push(this.fact('capitalPlan.targetLtv', 'Target LTV (%)', (cap.targetLtv * 100).toFixed(0), 0.8))
        if (cap.targetLtv > 0.75) {
          risks.push(this.risk('COMMERCIAL_FINANCIAL', 'MEDIUM', 'High target LTV',
            `Target LTV ${(cap.targetLtv * 100).toFixed(0)}% exceeds typical 65–75% for data center debt.`,
            'Confirm lender appetite at this level or adjust equity injection assumptions.'))
        }
      }

      // DSCR
      if (cap.targetDscr) {
        facts.push(this.fact('capitalPlan.targetDscr', 'Target DSCR', cap.targetDscr.toFixed(2), 0.8))
        if (cap.targetDscr < 1.25) {
          risks.push(this.risk('COMMERCIAL_FINANCIAL', 'HIGH', 'DSCR below lender threshold',
            `Target DSCR ${cap.targetDscr.toFixed(2)} is below the 1.25x minimum most institutional lenders require for data center debt.`,
            'Adjust revenue assumptions or reduction of senior debt to achieve ≥1.25x DSCR.'))
        }
      }

      // Returns
      if (cap.targetIrrLevered) {
        facts.push(this.fact('capitalPlan.targetIrrLevered', 'Target levered IRR (%)',
          (cap.targetIrrLevered * 100).toFixed(1), 0.75, undefined, true))
        if (cap.targetIrrLevered >= 0.18) {
          recs.push(this.rec('FINANCIAL',
            `Target levered IRR of ${(cap.targetIrrLevered * 100).toFixed(1)}% is strong — above-market for single-asset data center. Verify revenue assumptions are conservative.`,
            0.8))
        } else if (cap.targetIrrLevered < 0.12) {
          risks.push(this.risk('COMMERCIAL_FINANCIAL', 'HIGH', 'Sub-institutional levered IRR',
            `${(cap.targetIrrLevered * 100).toFixed(1)}% levered IRR is likely below equity partner minimum hurdle rate (12–15%).`))
        }
      } else {
        missing.push('Target levered IRR')
      }
    }

    // ── Energy cost analysis ──────────────────────────────────────────────
    if (env?.ppaPricePerKwh) {
      facts.push(this.fact('environmentalProfile.ppaPricePerKwh', 'Power purchase price ($/kWh)',
        env.ppaPricePerKwh.toFixed(4), 0.9))
      if (mw) {
        // Estimate annual energy cost at 0.85 PUE and 85% load factor
        const annualKwh = mw * 1000 * 8760 * 0.85 * 1.18 // 1.18 PUE blended
        const annualCostM = (annualKwh * env.ppaPricePerKwh) / 1_000_000
        recs.push(this.rec('FINANCIAL',
          `Estimated annual energy cost: $${annualCostM.toFixed(1)}M at $${env.ppaPricePerKwh.toFixed(4)}/kWh, ${mw} MW IT, PUE 1.18.`,
          0.7))
      }
    }

    // ── Tax incentives ────────────────────────────────────────────────────
    if (jur?.taxAbatement) {
      recs.push(this.rec('FINANCIAL',
        'Tax abatement available in jurisdiction — quantify NPV impact in capital model. Typical DC abatements range from 5–20 year property tax holidays.',
        0.75))
    }

    // ── Tokenization / RWA ────────────────────────────────────────────────
    if (cap?.tokenizationStrategy) {
      recs.push(this.rec('FINANCIAL',
        `RWA tokenization strategy noted: ${cap.tokenizationStrategy}. Coordinate with Apostle Chain / USDF settlement layer for institutional token issuance.`,
        0.7))
    }

    const filledFinance = [cap?.totalProjectCostM, cap?.targetIrrLevered, cap?.seniorDebtM, cap?.targetDscr, env?.ppaPricePerKwh].filter(v => v != null).length
    const confidence = Math.min(0.9, (filledFinance / 5) * 0.9)

    return {
      agentType: 'FINANCIAL_MODELING',
      siteId: input.siteId,
      summary: `Financial analysis: Project cost $${cap?.totalProjectCostM?.toFixed(0) ?? '?'}M, target levered IRR ${cap?.targetIrrLevered ? (cap.targetIrrLevered * 100).toFixed(1) + '%' : '?'}, power at $${env?.ppaPricePerKwh?.toFixed(4) ?? '?'}/kWh. ${risks.length} financial risk(s) detected.`,
      confidence,
      extractedFacts: facts,
      riskFlags: risks,
      recommendations: recs,
      missingCriticalFields: missing,
    }
  }
}

export const financialModelingAgent = new FinancialModelingAgent()
