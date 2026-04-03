// services/scoring/red-flags.ts
// Automatic risk-flag detection rules — 18 hard rules from UNYKORN spec

import type { SiteScoringInput } from '@/types'

export interface RedFlagResult {
  flags: string[]
  missing: string[]
}

export function detectRedFlags(input: SiteScoringInput): RedFlagResult {
  const flags: string[] = []
  const missing: string[] = []

  // ── Power ────────────────────────────────────────────────────────────────
  if (input.deliveredMW == null) missing.push('Delivered MW')
  else if (input.deliveredMW < 5)
    flags.push('LOW_POWER: Delivered MW < 5 — insufficient for meaningful AI workloads.')

  if ((input.feedCount ?? 1) <= 1 && !input.hasFeedDiversity && !input.btmCapacityMW)
    flags.push('SINGLE_UTILITY_FEED: Single utility feed with no BTM backup — unacceptable single point of failure for Tier III+ workloads.')

  if (input.generatorCount == null) missing.push('Generator count / redundancy model')
  else if (input.generatorCount > 0) {
    const gr = (input.generatorRedundancy ?? '').toUpperCase()
    if (!gr.includes('N+1') && !gr.includes('2N') && !gr.includes('N+2'))
      flags.push('GENERATOR_REDUNDANCY: Generators present but no recognized N+1/2N model — any generator failure exposes full IT load.')
    if ((input.generatorAutonomyHours ?? 0) < 24)
      flags.push('GENERATOR_AUTONOMY: Generator autonomy < 24 h — insufficient for extended grid outages or contested logistics.')
  }

  if (input.upsRuntimeMinutes == null) missing.push('UPS runtime (minutes)')
  else if (input.upsRuntimeMinutes < 10)
    flags.push('UPS_RUNTIME: UPS bridge < 10 min — insufficient for orderly generator transfer under load.')

  // ── Cooling ───────────────────────────────────────────────────────────────
  if (input.maxRackKwSupported == null) missing.push('Max rack kW supported')
  else if (input.maxRackKwSupported < 10)
    flags.push('COOLING_DENSITY: Max rack density < 10 kW — not compatible with GPU/AI compute workloads (require ≥ 30 kW/rack minimum).')

  const pue = input.pueAnnual ?? input.pueTarget
  if (pue == null) missing.push('PUE (annual or target)')
  else if (pue > 2.0)
    flags.push(`HIGH_PUE: PUE ${pue.toFixed(2)} is poor by modern hyperscale standards — significant stranded capacity and opex penalty.`)

  const coolingType = (input.coolingType ?? '').toUpperCase()
  if (coolingType === 'AIR' && (input.maxRackKwSupported ?? 0) > 30)
    flags.push('COOLING_MISMATCH: Air-only cooling claimed alongside >30 kW/rack density — technically inconsistent; requires engineer validation.')

  // ── Network ───────────────────────────────────────────────────────────────
  if (input.carriersOnSite == null) missing.push('Carriers on-site count')
  else if (input.carriersOnSite === 0)
    flags.push('NO_FIBER: Zero carrier-grade fiber on-site — all WAN connectivity requires new construction investment at unknown cost and lead time.')

  if ((input.carriersOnSite ?? 0) === 1 && !input.hasDarkFiber)
    flags.push('SINGLE_CARRIER: One on-site carrier, no dark fiber — catastrophic single point for all connectivity.')

  if (!input.hasRouteDiversity)
    flags.push('NO_ROUTE_DIVERSITY: No confirmed physical path diversity — a single conduit cut event can sever all WAN traffic.')

  // ── Compliance ────────────────────────────────────────────────────────────
  if (input.financialInfraSuitable && !input.hasSoc2)
    flags.push('COMPLIANCE_MISMATCH: Financial-infrastructure flag set but SOC 2 Type II absent — disqualifying for regulated financial and banking workloads.')

  if (input.sovereignSuitable && !input.hasBiometrics)
    flags.push('SOVEREIGN_GAP: Sovereign-hosting flag set but biometric access control not confirmed — likely disqualifying for government agency requirements.')

  if (input.hasCjis && !(input.hasMantraps && input.hasBiometrics && input.hasSocNoc))
    flags.push('CJIS_GAPS: CJIS flag set but mantraps + biometrics + SOC/NOC not all confirmed — fails FBI CJIS Security Policy physical access criteria.')

  // ── Grid reliability ──────────────────────────────────────────────────────
  if (input.gridReliabilityPercent == null) missing.push('Grid reliability %')
  else if (input.gridReliabilityPercent < 99.9)
    flags.push(`GRID_RELIABILITY: Utility uptime ${input.gridReliabilityPercent}% — below 99.9% minimum for Tier III/IV and financial infrastructure workloads.`)

  // ── Land & scale ──────────────────────────────────────────────────────────
  if ((input.targetItMW ?? input.maxExpandableMW ?? 0) > 100 && (input.totalAcres ?? 0) < 20)
    flags.push('LAND_CONSTRAINED: >100 MW target scale but apparent site acreage insufficient for planned build-out — verify parcel map and setback requirements.')

  // ── Missing critical fields for capital stack readiness ───────────────────
  if (input.totalProjectCostM == null) missing.push('Total project cost ($M)')
  if (input.siteType == null) missing.push('Site type')
  if (input.ownershipStatus == null) missing.push('Ownership status')

  return { flags, missing }
}
