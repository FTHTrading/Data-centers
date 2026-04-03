// services/agents/cooling-ai.ts
// CoolingAIReadinessAgent — evaluates thermal density, liquid cooling, PUE for AI GPU workloads

import { BaseAgent, type AgentInput } from './base'
import type { AgentOutputPayload } from '@/types'

// AI GPU thermal reference points
const GPU_RACK_DENSITIES: { gpu: string; kw: number }[] = [
  { gpu: 'H100 (8x SXM)', kw: 10.7 },
  { gpu: 'H200 (8x SXM)', kw: 11.2 },
  { gpu: 'RTX 5090 (4x PCI)', kw: 3.2 },
  { gpu: 'GB200 NVL72', kw: 120 },
]

export class CoolingAIReadinessAgent extends BaseAgent {
  readonly agentType = 'COOLING_AI_READINESS' as const
  readonly displayName = 'Cooling & AI Readiness Agent'

  protected async execute(
    input: AgentInput,
    site: Record<string, unknown>,
  ): Promise<AgentOutputPayload> {
    const facts = []
    const risks = []
    const recs  = []
    const missing: string[] = []

    const coolingSystems = (site.coolingSystems as any[]) ?? []
    const cool = coolingSystems[0]

    if (!cool) {
      missing.push('Cooling system profile (type, max rack kW, PUE)')
      risks.push(this.risk('COOLING_THERMAL', 'HIGH', 'No cooling data present',
        'No cooling system records found — AI readiness cannot be assessed.',
        'Complete cooling section including cooling type, max rack kW, and PUE target.'))
    } else {
      // Cooling type
      const type = cool.coolingType as string | null
      if (!type) {
        missing.push('Cooling type (Air / Water / Hybrid / Direct Liquid / Immersion)')
      } else {
        facts.push(this.fact('coolingSystems.0.coolingType', 'Cooling type', type, 0.9))
        
        // AI GPU readiness by type
        const aiReady = ['DIRECT_LIQUID', 'IMMERSION_SINGLE_PHASE', 'IMMERSION_TWO_PHASE', 'HYBRID']
        const aiPartial = ['WATER', 'REAR_DOOR']
        
        if (aiReady.includes(type)) {
          recs.push(this.rec('COOLING',
            `${type.replace(/_/g, ' ').toLowerCase()} cooling is fully compatible with next-generation GPU rack densities (≥50 kW/rack).`,
            0.9))
        } else if (aiPartial.includes(type)) {
          recs.push(this.rec('COOLING',
            `${type} cooling can support moderate AI density (20–40 kW/rack) but may require liquid CDU retrofit for GB200-class deployments.`,
            0.75))
        } else if (type === 'AIR') {
          risks.push(this.risk('COOLING_THERMAL', 'HIGH', 'Air-only cooling — AI density constrained',
            'Air cooling is limited to ~15–20 kW/rack maximum. Incompatible with modern GPU server densities (GB200: 120 kW/rack, H100: 10.7 kW/rack × 8).',
            'Commission CDU or rear-door cooler retrofit study. Estimate $2–4M per MW IT for liquid cooling upgrade.'))
        }
      }

      // Max rack kW
      const maxKw = cool.maxRackKwSupported
      if (maxKw == null) {
        missing.push('Max rack kW supported')
      } else {
        facts.push(this.fact('coolingSystems.0.maxRackKwSupported', 'Max rack density (kW/rack)', maxKw, 0.85))
        
        // Compare against GPU reference points
        const supportedGPUs = GPU_RACK_DENSITIES.filter(g => g.kw <= maxKw)
        if (supportedGPUs.length === 0) {
          risks.push(this.risk('COOLING_THERMAL', 'CRITICAL', 'Thermal density insufficient for any GPU rack',
            `Max ${maxKw} kW/rack. Even a 4x RTX 5090 rack requires ~3.2 kW — validate if this is per-rack or per-row measurement.`))
        } else if (maxKw < 30) {
          risks.push(this.risk('COOLING_THERMAL', 'HIGH', 'Below AI minimum density threshold',
            `${maxKw} kW/rack supports ${supportedGPUs.map(g => g.gpu).join(', ')} but cannot host current H100 SXM (10.7 kW) or next-gen GPU racks.`,
            'Minimum 30 kW/rack required for current-gen AI training. 100+ kW for GB200/NVL72 class.'))
        } else if (maxKw >= 100) {
          recs.push(this.rec('COOLING',
            `${maxKw} kW/rack density qualifies for GB200 NVL72 hosting — position as next-generation AI infrastructure.`,
            0.95))
        } else if (maxKw >= 30) {
          recs.push(this.rec('COOLING',
            `${maxKw} kW/rack supports H100/H200 SXM deployments. Consider phased CDU upgrade to reach 100+ kW for next-gen GPUs.`,
            0.8))
        }
      }

      // PUE
      const pue = cool.pueAnnual ?? cool.pueTarget
      if (pue == null) {
        missing.push('PUE (annual or target)')
      } else {
        facts.push(this.fact(
          cool.pueAnnual ? 'coolingSystems.0.pueAnnual' : 'coolingSystems.0.pueTarget',
          cool.pueAnnual ? 'Annualized PUE' : 'Target PUE',
          pue.toFixed(2), 0.85))
        
        if (pue > 2.0) {
          risks.push(this.risk('COOLING_THERMAL', 'HIGH', 'PUE above 2.0 — inefficient',
            `PUE ${pue.toFixed(2)} doubles effective energy cost. At $0.05/kWh, adds ~$876K/MW-IT/year in wasted overhead.`,
            'Commission facilities audit. Air-side economization or liquid cooling retrofit can achieve PUE ≤1.4.'))
        } else if (pue <= 1.2) {
          recs.push(this.rec('COOLING',
            `Excellent PUE ${pue.toFixed(2)} — top-quartile efficiency. Useful as ESG differentiator in tenant marketing.`,
            0.9))
        }
      }

      // Liquid cooling modules
      if (cool.hasCdu) {
        facts.push(this.fact('coolingSystems.0.hasCdu', 'CDU present', true, 0.9))
      }
      if (cool.isLiquidCoolingReady) {
        facts.push(this.fact('coolingSystems.0.isLiquidCoolingReady', 'Liquid cooling ready', true, 0.85))
      }
      if (cool.hasImmersionCooling) {
        facts.push(this.fact('coolingSystems.0.hasImmersionCooling', 'Immersion cooling present', true, 0.9))
        recs.push(this.rec('COOLING',
          'Immersion cooling present — position for digital asset mining, AI inference, and high-density compute. Premium lease rates apply.',
          0.9))
      }

      // WUE
      if (cool.wueValue != null) {
        facts.push(this.fact('coolingSystems.0.wueValue', 'WUE (L/kWh)', cool.wueValue.toFixed(2), 0.8))
        if (cool.wueValue > 1.5 && cool.waterSourceRisk) {
          risks.push(this.risk('COOLING_THERMAL', 'MEDIUM', 'Water use intensity in stressed region',
            `WUE ${cool.wueValue.toFixed(2)} L/kWh in region with ${cool.waterSourceRisk} water risk — regulatory and supply chain exposure.`))
        }
      }
    }

    const filled = [cool?.coolingType, cool?.maxRackKwSupported, cool?.pueAnnual ?? cool?.pueTarget].filter(Boolean).length
    const confidence = cool ? Math.min(0.9, filled / 3 * 0.85 + 0.05) : 0.05

    return {
      agentType: 'COOLING_AI_READINESS',
      siteId: input.siteId,
      summary: `Cooling analysis: ${cool?.coolingType ?? 'N/A'} cooling, ${cool?.maxRackKwSupported ?? '?'} kW/rack max, PUE ${(cool?.pueAnnual ?? cool?.pueTarget)?.toFixed(2) ?? '?'}. ${risks.length} thermal risk(s) detected.`,
      confidence,
      extractedFacts: facts,
      riskFlags: risks,
      recommendations: recs,
      missingCriticalFields: missing,
    }
  }
}

export const coolingAiAgent = new CoolingAIReadinessAgent()
