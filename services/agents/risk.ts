// services/agents/risk.ts
// RiskAgent — holistic multi-factor risk scoring across all domains

import { BaseAgent, type AgentInput } from './base'
import type { AgentOutputPayload } from '@/types'
import { detectRedFlags } from '@/services/scoring/red-flags'
import type { SiteScoringInput } from '@/types'

export class RiskAgent extends BaseAgent {
  readonly agentType = 'RISK' as const
  readonly displayName = 'Risk Assessment Agent'

  protected async execute(
    input: AgentInput,
    site: Record<string, unknown>,
  ): Promise<AgentOutputPayload> {
    const risks = []
    const recs  = []

    const u    = (site.utilities as any[])?.[0]
    const g    = (site.generators as any[])?.[0]
    const ups  = (site.upsSystems as any[])?.[0]
    const cool = (site.coolingSystems as any[])?.[0]
    const net  = (site.networkProfiles as any[])?.[0]
    const sec  = site.securityProfile as any
    const comp = site.complianceProfile as any
    const env  = site.environmentalProfile as any
    const cap  = site.capitalPlan as any
    const jur  = site.jurisdictionProfile as any
    const bld  = (site.buildings as any[])?.[0]
    const existingRisks = (site.riskFlags as any[]) ?? []

    // ── Run automated flag detection ──────────────────────────────────────
    const scoringInput: SiteScoringInput = {
      deliveredMW:             u?.deliveredMW ?? null,
      expandableMW:            u?.expandableMW ?? null,
      feedCount:               u?.feedCount ?? null,
      hasFeedDiversity:        u?.feedDiversity ?? null,
      generatorCount:          g?.count ?? null,
      generatorCapacityKwEach: g?.capacityKwEach ?? null,
      generatorAutonomyHours:  g?.autonomyHours ?? null,
      generatorRedundancy:     g?.redundancyModel ?? null,
      btmCapacityMW:           u?.btmCapacityMW ?? null,
      upsRuntimeMinutes:       ups?.runtimeMinutes ?? null,
      upsRedundancyModel:      ups?.redundancyModel ?? null,
      upsCapacityKw:           ups?.capacityKwEach ?? null,
      coolingType:             cool?.coolingType ?? null,
      isLiquidCoolingReady:    cool?.isLiquidCoolingReady ?? null,
      hasCdu:                  cool?.hasCdu ?? null,
      hasImmersionCooling:     cool?.hasImmersionCooling ?? null,
      maxRackKwSupported:      cool?.maxRackKwSupported ?? null,
      pueAnnual:               cool?.pueAnnual ?? null,
      pueTarget:               cool?.pueTarget ?? null,
      carriersOnSite:          net?.carriersOnSite ?? null,
      hasRouteDiversity:       net?.hasRouteDiv ?? null,
      hasDarkFiber:            net?.hasDarkFiber ?? null,
      hasMeetMeRoom:           net?.hasMeetMeRoom ?? null,
      aggregateBandwidthTbps:  net?.aggregateBandwidthTbps ?? null,
      ixProximityMiles:        net?.ixProximityMiles ?? null,
      cloudLatencyMs:          net?.cloudOnRampLatencyMs ?? null,
      hasMantraps:             sec?.hasMantraps ?? null,
      hasBiometrics:           sec?.hasBiometrics ?? null,
      hasSocNoc:               sec?.hasSocNoc ?? null,
      hasCctvDataCenter:       sec?.hasCctvDataCenter ?? null,
      hasCabinetLocks:         sec?.hasCabinetLocks ?? null,
      hasSoc2:                 comp?.hasSoc2 ?? null,
      hasIso27001:             comp?.hasIso27001 ?? null,
      hasCjis:                 comp?.hasCjis ?? null,
      sovereignSuitable:       comp?.sovereignHostingSuitable ?? null,
      financialInfraSuitable:  comp?.financialInfraSuitable ?? null,
      digitalAssetSuitable:    comp?.digitalAssetSuitable ?? null,
      uptimeTier:              comp?.uptierCertification ?? null,
      gridReliabilityPercent:  u?.gridReliabilityPercent ?? null,
      yearBuilt:               bld?.yearBuilt ?? null,
      hasTestSchedule:         g?.testSchedule ? true : null,
      ppaPricePerKwh:          env?.ppaPricePerKwh ?? null,
      hasPpa:                  env?.hasPpa ?? null,
      hasTaxAbatement:         jur?.taxAbatement ?? null,
      totalProjectCostM:       cap?.totalProjectCostM ?? null,
      targetIrrLevered:        cap?.targetIrrLevered ?? null,
      siteType:                (site.siteType as any) ?? null,
      targetItMW:              (site.targetItMW as number) ?? null,
      maxExpandableMW:         (site.maxExpandableMW as number) ?? null,
      jurisdiction:            (site.state as string) ?? (site.jurisdiction as string) ?? null,
      ownershipStatus:         (site.ownershipStatus as string) ?? null,
      totalAcres:              (site.totalAcres as number) ?? null,
    }

    const { flags } = detectRedFlags(scoringInput)

    // Convert flags to risk records
    for (const flag of flags) {
      const parts = flag.split(':')
      const code  = parts[0].trim()
      const msg   = parts.slice(1).join(':').trim()
      const sev   = code.includes('CRITICAL') || code === 'SINGLE_UTILITY_FEED' || code === 'NO_FIBER' || code === 'COMPLIANCE_MISMATCH'
        ? 'CRITICAL' : 'HIGH'
      risks.push(this.risk('POWER_UTILITY', sev as any, code.replace(/_/g, ' '), msg))
    }

    // ── Environmental & climate risks ────────────────────────────────────
    if (env) {
      if (env.floodRisk === 'HIGH' || env.floodRisk === 'CRITICAL') {
        risks.push(this.risk('ENVIRONMENTAL_CLIMATE', 'HIGH', 'High flood zone exposure',
          `Site is in a ${env.floodRisk} flood risk zone — increases insurance cost and introduces business continuity risk.`,
          'Commission FEMA LOMA or site-specific flood mitigation study. Assess first-floor elevation and drainage.'))
      }
      if (env.waterStressLevel === 'HIGH' || env.waterStressLevel === 'EXTREME') {
        risks.push(this.risk('ENVIRONMENTAL_CLIMATE', 'MEDIUM', 'Water-stressed region',
          `Water stress level: ${env.waterStressLevel}. Water-cooled systems face supply risk and regulatory exposure.`,
          'Evaluate closed-loop cooling or air-cooled alternatives. Obtain water rights confirmation.'))
      }
      if (!env.hasPpa && !env.hasBtmGeneration) {
        risks.push(this.risk('ENVIRONMENTAL_CLIMATE', 'MEDIUM', 'No renewable energy sourcing',
          'No PPA or BTM renewable generation. Scope 2 emissions will be entirely grid-mix dependent.',
          'Procure utility-scale PPA or retain renewable energy certificates (RECs) to reduce ESG exposure.'))
      }
    }

    // ── Financial risks ──────────────────────────────────────────────────
    if (cap) {
      if (cap.targetIrrLevered && cap.targetIrrLevered < 0.12) {
        risks.push(this.risk('COMMERCIAL_FINANCIAL', 'HIGH', 'Low levered IRR target',
          `Target levered IRR of ${(cap.targetIrrLevered * 100).toFixed(1)}% below typical 12%+ threshold for institutional data center capital.`))
      }
      if (cap.totalProjectCostM && (site.targetItMW as number) && cap.totalProjectCostM / (site.targetItMW as number) > 12) {
        risks.push(this.risk('COMMERCIAL_FINANCIAL', 'MEDIUM', 'Above-market capex per MW',
          `Project cost/MW: $${(cap.totalProjectCostM / (site.targetItMW as number)).toFixed(1)}M — above $12M/MW institutional threshold.`))
      }
    }

    // ── Recommendations ──────────────────────────────────────────────────
    const criticalCount = risks.filter(r => r.severity === 'CRITICAL').length
    const highCount     = risks.filter(r => r.severity === 'HIGH').length

    if (criticalCount > 0) {
      recs.push(this.rec('RISK',
        `${criticalCount} CRITICAL risk(s) detected — site must not advance past current stage until these are resolved or formally mitigated.`,
        1.0))
    } else if (highCount > 2) {
      recs.push(this.rec('RISK',
        `${highCount} HIGH risks detected — recommend risk remediation plan before committee presentation.`,
        0.9))
    } else {
      recs.push(this.rec('RISK', 'Risk profile is within acceptable bounds for continued diligence.', 0.8))
    }

    const confidence = 0.9 - (flags.length * 0.02)

    return {
      agentType:           'RISK',
      siteId:              input.siteId,
      summary:             `Risk assessment: ${risks.length} flags total (${criticalCount} CRITICAL, ${highCount} HIGH). ${existingRisks.length} pre-existing unresolved flags.`,
      confidence:          Math.max(0.5, confidence),
      extractedFacts:      [],
      riskFlags:           risks,
      recommendations:     recs,
      missingCriticalFields: [],
    }
  }
}

export const riskAgent = new RiskAgent()
