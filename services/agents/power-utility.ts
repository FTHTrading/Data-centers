// services/agents/power-utility.ts
// PowerUtilityAgent — deep analysis of power capacity, redundancy, grid position, BTM, expansion headroom

import { BaseAgent, type AgentInput } from './base'
import type { AgentOutputPayload } from '@/types'

export class PowerUtilityAgent extends BaseAgent {
  readonly agentType = 'POWER_UTILITY' as const
  readonly displayName = 'Power & Utility Analysis Agent'

  protected async execute(
    input: AgentInput,
    site: Record<string, unknown>,
  ): Promise<AgentOutputPayload> {
    const facts = []
    const risks = []
    const recs  = []
    const missing: string[] = []

    const utilities  = (site.utilities  as any[]) ?? []
    const generators = (site.generators as any[]) ?? []
    const upsSystems = (site.upsSystems as any[]) ?? []

    const u   = utilities[0]
    const g   = generators[0]
    const ups = upsSystems[0]

    // ── Utility analysis ──────────────────────────────────────────────────
    if (!u) {
      missing.push('Utility record — provider, delivered MW, feed count')
      risks.push(this.risk('POWER_UTILITY', 'CRITICAL', 'No utility data present',
        'Zero utility records found for this site — power analysis cannot proceed.',
        'Upload utility capacity letter or LOI before advancing to technical review.'))
    } else {
      // Delivered MW
      if (!u.deliveredMW) {
        missing.push('Delivered MW')
      } else {
        facts.push(this.fact('utilities.0.deliveredMW', 'Delivered MW', u.deliveredMW, 0.9,
          `Utility provider: ${u.provider ?? 'unknown'}`))
      }

      // Feed count & diversity
      if (!u.feedCount) {
        missing.push('Feed count')
      } else {
        facts.push(this.fact('utilities.0.feedCount', 'Utility feed count', u.feedCount, 0.85))
        if (u.feedCount === 1 && !u.btmCapacityMW) {
          risks.push(this.risk('POWER_UTILITY', 'CRITICAL', 'Single utility feed',
            `Site reports ${u.feedCount} utility feed only. No BTM backup detected. Single point of failure for all grid delivery.`,
            'Explore secondary substation connection or BTM generation to establish feed redundancy.'))
        }
        if (u.feedCount >= 2 && !u.feedDiversity) {
          risks.push(this.risk('POWER_UTILITY', 'MEDIUM', 'Dual feeds — diversity not confirmed',
            'Two feeds reported but physical path diversity not confirmed. Both feeds may terminate at the same substation.',
            'Request utility to confirm feeds originate from separate substations on diverse routes.'))
        }
      }

      // Grid reliability
      if (u.gridReliabilityPercent && u.gridReliabilityPercent < 99.9) {
        risks.push(this.risk('POWER_UTILITY', 'HIGH', 'Below-threshold grid reliability',
          `Utility reliability: ${u.gridReliabilityPercent}%. Threshold for Tier III workloads is 99.9%.`,
          'Generator and UPS sizing must compensate for above-average outage frequency.'))
      }

      // Expandable MW
      if (u.expandableMW) {
        facts.push(this.fact('utilities.0.expandableMW', 'Expandable MW', u.expandableMW, 0.7,
          'As stated by provider — verify interconnection queue position', true))
        if (u.expandableMW > u.deliveredMW * 3) {
          recs.push(this.rec('POWER',
            `Significant expansion headroom: ${u.expandableMW} MW available vs ${u.deliveredMW} MW currently delivered. Stage phased buildout to reduce capex at launch.`,
            0.8))
        }
      } else {
        missing.push('Expandable MW capacity')
      }

      // BTM
      if (u.btmCapacityMW) {
        facts.push(this.fact('utilities.0.btmCapacityMW', 'BTM generation capacity (MW)', u.btmCapacityMW, 0.8))
        if (u.btmSources) {
          recs.push(this.rec('POWER',
            `BTM generation sources: ${u.btmSources}. Quantify avoided grid cost vs fuel cost to confirm economics.`,
            0.75))
        }
      }
    }

    // ── Generator analysis ────────────────────────────────────────────────
    if (!g || !g.count) {
      missing.push('Generator count and specification')
    } else {
      facts.push(this.fact('generators.0.count', 'Generator count', g.count, 0.9))
      facts.push(this.fact('generators.0.capacityKwEach', 'Generator capacity (kW each)', g.capacityKwEach ?? 0, 0.75))

      const totalGenKw = (g.count ?? 0) * (g.capacityKwEach ?? 0)
      const deliveredKw = (u?.deliveredMW ?? 0) * 1000
      if (deliveredKw > 0 && totalGenKw < deliveredKw) {
        risks.push(this.risk('POWER_UTILITY', 'HIGH', 'Generator capacity below delivered MW',
          `Total gen capacity ${(totalGenKw/1000).toFixed(1)} MW < delivered utility ${u?.deliveredMW ?? '?'} MW. Cannot support full site load on gen alone.`,
          'Assess phased gen augmentation or clarify which circuits are gen-backed.'))
      }

      if (!g.redundancyModel || g.redundancyModel === 'N') {
        risks.push(this.risk('POWER_UTILITY', 'HIGH', 'No generator redundancy model documented',
          'Generator redundancy model not specified or only N (no redundancy). Any single gen failure exposes full IT load.',
          'Document N+1 or 2N redundancy model — required for Tier III and above.'))
      }

      if ((g.autonomyHours ?? 0) < 48) {
        risks.push(this.risk('POWER_UTILITY', 'MEDIUM', 'Generator autonomy < 48 hours',
          `Stated autonomy: ${g.autonomyHours ?? '?'} hours. 48-hour minimum recommended for supply chain resilience.`,
          'Contract dedicated fuel supply or increase on-site tank capacity.'))
      }
    }

    // ── UPS analysis ──────────────────────────────────────────────────────
    if (!ups) {
      missing.push('UPS topology and runtime specification')
    } else {
      facts.push(this.fact('upsSystems.0.topology', 'UPS topology', ups.topology ?? 'Unknown', 0.8))
      facts.push(this.fact('upsSystems.0.runtimeMinutes', 'UPS runtime (min)', ups.runtimeMinutes ?? 0, 0.85))

      if ((ups.runtimeMinutes ?? 0) < 10) {
        risks.push(this.risk('POWER_UTILITY', 'HIGH', 'UPS bridge time insufficient',
          `UPS runtime ${ups.runtimeMinutes ?? '?'} min. Minimum 10 min required for reliable generator transfer under full load.`,
          'Assess additional battery banks or flywheel supplement.'))
      }

      if (ups.currentKwUtilized && ups.totalKwBacked) {
        const utilPct = (ups.currentKwUtilized / ups.totalKwBacked) * 100
        if (utilPct > 80) {
          risks.push(this.risk('POWER_UTILITY', 'MEDIUM', 'UPS load at critical utilization',
            `UPS operating at ${utilPct.toFixed(0)}% of rated capacity. < 20% headroom limits growth without investment.`,
            'Plan UPS expansion concurrent with IT load growth.'))
        }
      }
    }

    const filled = [u?.deliveredMW, u?.feedCount, g?.count, g?.redundancyModel, ups?.runtimeMinutes].filter(Boolean).length
    const confidence = Math.min(0.95, filled / 5 * 0.95)

    return {
      agentType: 'POWER_UTILITY',
      siteId: input.siteId,
      summary: `Power analysis complete: ${u?.deliveredMW ?? '?'} MW delivered, ${u?.feedCount ?? '?'} feeds, ${g?.count ?? '?'} generators, ${ups?.runtimeMinutes ?? '?'} min UPS runtime. ${risks.length} risk(s) detected.`,
      confidence,
      extractedFacts: facts,
      riskFlags: risks,
      recommendations: recs,
      missingCriticalFields: missing,
    }
  }
}

export const powerUtilityAgent = new PowerUtilityAgent()
