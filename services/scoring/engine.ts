// services/scoring/engine.ts
// Core weighted scoring engine — UNYKORN-DataCenter-System-2026.md § Scoring Framework

import { SCORING_WEIGHTS, RECOMMENDATION_THRESHOLDS, type ScoringCategory } from '@/config/scoring-weights'
import type { SiteScoringInput, ScoringResult, SiteRecommendation } from '@/types'
import { detectRedFlags } from './red-flags'

// ── Power Depth & Expandability (weight 0.20) ─────────────────────────────
function scorePowerExpandability(i: SiteScoringInput): number {
  let s = 0
  // Delivered MW (0–30)
  const mw = i.deliveredMW ?? 0
  if (mw >= 100) s += 30; else if (mw >= 50) s += 22; else if (mw >= 20) s += 16
  else if (mw >= 10) s += 10; else if (mw >= 5) s += 5

  // Expandable MW (0–20)
  const exp = i.expandableMW ?? 0
  if (exp >= 200) s += 20; else if (exp >= 100) s += 16; else if (exp >= 50) s += 12
  else if (exp >= 20) s += 8; else if (exp >= 10) s += 5

  // Feed diversity (0–15)
  if ((i.feedCount ?? 1) >= 2 && i.hasFeedDiversity) s += 15
  else if ((i.feedCount ?? 1) >= 2) s += 8

  // BTM generation (0–10)
  const btm = i.btmCapacityMW ?? 0
  if (btm >= 50) s += 10; else if (btm >= 20) s += 7; else if (btm >= 5) s += 4

  // Generator redundancy (0–15)
  const gr = (i.generatorRedundancy ?? '').toUpperCase()
  if (gr.includes('2N')) s += 15; else if (gr.includes('N+2')) s += 12
  else if (gr.includes('N+1')) s += 9; else if ((i.generatorCount ?? 0) > 0) s += 3

  // Generator autonomy (0–10)
  const hr = i.generatorAutonomyHours ?? 0
  if (hr >= 168) s += 10; else if (hr >= 72) s += 7; else if (hr >= 48) s += 5
  else if (hr >= 24) s += 2

  return Math.min(100, s)
}

// ── Strategic Fit (weight 0.15) ───────────────────────────────────────────
function scoreStrategicFit(i: SiteScoringInput): number {
  let s = 0
  // Target IT MW (0–30)
  const mw = i.targetItMW ?? i.deliveredMW ?? 0
  if (mw >= 100) s += 30; else if (mw >= 50) s += 24; else if (mw >= 20) s += 18;
  else if (mw >= 5) s += 10

  // Site type (0–20)
  const type = i.siteType
  const typeMap: Record<string, number> = {
    GREENFIELD: 20, POWERED_SHELL: 18, CARRIER_HOTEL: 17, OPERATING_FACILITY: 15,
    RETROFIT: 12, CAMPUS_EXPANSION: 10, LAND_ONLY: 8, INDUSTRIAL: 6,
  }
  if (type) s += typeMap[type] ?? 0

  // Jurisdiction quality (0–20)
  const jur = (i.jurisdiction ?? '').toUpperCase()
  const t1 = ['WY', 'TX', 'ND', 'SD', 'MT', 'NV', 'AZ']
  const t2 = ['VA', 'CO', 'GA', 'NC', 'TN', 'OR']
  const t3 = ['IL', 'OH', 'PA', 'MI', 'IN', 'MN']
  if (t1.some(x => jur.includes(x))) s += 20
  else if (t2.some(x => jur.includes(x))) s += 14
  else if (t3.some(x => jur.includes(x))) s += 8

  // Max expandable MW (0–15)
  const maxMW = i.maxExpandableMW ?? 0
  if (maxMW >= 500) s += 15; else if (maxMW >= 200) s += 12
  else if (maxMW >= 100) s += 8; else if (maxMW >= 50) s += 4

  // Ownership status (0–15)
  const ownMap: Record<string, number> = {
    OWN: 15, GROUND_LEASE: 12, UNDER_CONTRACT: 9, LEASE: 8, LOI: 7, MARKETED: 3,
  }
  s += ownMap[i.ownershipStatus ?? ''] ?? 5

  return Math.min(100, s)
}

// ── Cooling & AI Readiness (weight 0.15) ──────────────────────────────────
function scoreCoolingAiReadiness(i: SiteScoringInput): number {
  let s = 0
  // Max rack kW (0–30) — AI GPU target 100 kW/rack
  const kw = i.maxRackKwSupported ?? 0
  if (kw >= 100) s += 30; else if (kw >= 50) s += 22; else if (kw >= 30) s += 16
  else if (kw >= 20) s += 10; else if (kw >= 10) s += 5

  // Cooling technology (0–25)
  const ctMap: Record<string, number> = {
    IMMERSION_TWO_PHASE: 25, IMMERSION_SINGLE_PHASE: 22, DIRECT_LIQUID: 20,
    HYBRID: 15, WATER: 12, REAR_DOOR: 10, AIR: 5,
  }
  s += ctMap[(i.coolingType ?? '').toUpperCase()] ?? 0

  // Liquid cooling modules (0–20)
  if (i.hasCdu) s += 10
  if (i.isLiquidCoolingReady) s += 8
  if (i.hasImmersionCooling) s += 5 // stacking bonus capped at 20

  // PUE (0–25)
  const pue = i.pueAnnual ?? i.pueTarget ?? 2.0
  if (pue <= 1.15) s += 25; else if (pue <= 1.25) s += 20; else if (pue <= 1.40) s += 14
  else if (pue <= 1.60) s += 8; else if (pue <= 1.80) s += 4

  return Math.min(100, s)
}

// ── Network & Latency (weight 0.10) ───────────────────────────────────────
function scoreNetworkLatency(i: SiteScoringInput): number {
  let s = 0
  // Carriers on site (0–30)
  const c = i.carriersOnSite ?? 0
  if (c >= 5) s += 30; else if (c >= 4) s += 25; else if (c >= 3) s += 18
  else if (c >= 2) s += 12; else if (c === 1) s += 5

  // Route diversity (0–20)
  if (i.hasRouteDiversity) s += 20

  // Dark fiber (0–15)
  if (i.hasDarkFiber) s += 15

  // Meet-me room (0–10)
  if (i.hasMeetMeRoom) s += 10

  // IX proximity (0–15)
  const ix = i.ixProximityMiles ?? 999
  if (ix <= 5) s += 15; else if (ix <= 20) s += 10; else if (ix <= 50) s += 5
  else if (ix <= 100) s += 2

  // Aggregate bandwidth (0–10)
  const bw = i.aggregateBandwidthTbps ?? 0
  if (bw >= 10) s += 10; else if (bw >= 5) s += 7; else if (bw >= 1) s += 5
  else if (bw >= 0.1) s += 2

  return Math.min(100, s)
}

// ── Resilience & Security (weight 0.10) ───────────────────────────────────
function scoreResilienceSecurity(i: SiteScoringInput): number {
  let s = 0
  // UPS runtime (0–20)
  const upsMin = i.upsRuntimeMinutes ?? 0
  if (upsMin >= 60) s += 20; else if (upsMin >= 30) s += 14; else if (upsMin >= 20) s += 10
  else if (upsMin >= 10) s += 5

  // UPS redundancy (0–15)
  const upsR = (i.upsRedundancyModel ?? '').toUpperCase()
  if (upsR.includes('2N')) s += 15; else if (upsR.includes('N+1')) s += 10
  else if (upsR.length > 0) s += 4

  // Feed & diversity (0–15)
  if ((i.feedCount ?? 0) >= 2 && i.hasFeedDiversity) s += 15
  else if ((i.feedCount ?? 0) >= 2) s += 8

  // Physical security (0–25)
  if (i.hasBiometrics) s += 8
  if (i.hasMantraps) s += 7
  if (i.hasCctvDataCenter) s += 5
  if (i.hasSocNoc) s += 5

  // Cabinet locks (0–10)
  if (i.hasCabinetLocks) s += 10

  // Generator autonomy as resilience metric (0–15)
  const hr = i.generatorAutonomyHours ?? 0
  if (hr >= 168) s += 15; else if (hr >= 72) s += 10; else if (hr >= 24) s += 5

  return Math.min(100, s)
}

// ── Compliance & Sovereignty (weight 0.10) ────────────────────────────────
function scoreComplianceSovereignty(i: SiteScoringInput): number {
  let s = 0
  if (i.sovereignSuitable) s += 30
  if (i.financialInfraSuitable) s += 20
  if (i.digitalAssetSuitable) s += 10
  if (i.hasSoc2) s += 12
  if (i.hasIso27001) s += 10
  if (i.hasCjis) s += 10
  const tier = (i.uptimeTier ?? '').toUpperCase()
  if (tier.includes('IV')) s += 10; else if (tier.includes('III')) s += 6
  else if (tier.includes('II')) s += 3
  return Math.min(100, s)
}

// ── Operational Maturity (weight 0.10) ────────────────────────────────────
function scoreOperationalMaturity(i: SiteScoringInput): number {
  let s = 0
  // Grid reliability (0–30)
  const rel = i.gridReliabilityPercent ?? 0
  if (rel >= 99.99) s += 30; else if (rel >= 99.9) s += 22; else if (rel >= 99.5) s += 14
  else if (rel >= 99.0) s += 7

  // Building age (0–25)
  const yr = i.yearBuilt
  if (!yr) { s += 10 } else {
    const age = new Date().getFullYear() - yr
    if (age <= 5) s += 25; else if (age <= 10) s += 20; else if (age <= 15) s += 15
    else if (age <= 20) s += 10; else if (age <= 30) s += 5
  }

  // Test schedule (0–15)
  if (i.hasTestSchedule) s += 15

  // Generator autonomy (operational continuity proxy) (0–15)
  const hr = i.generatorAutonomyHours ?? 0
  if (hr >= 168) s += 15; else if (hr >= 72) s += 10; else if (hr >= 48) s += 7
  else if (hr >= 24) s += 4

  // SOC/NOC (0–15)
  if (i.hasSocNoc) s += 15

  return Math.min(100, s)
}

// ── Financial Attractiveness (weight 0.10) ────────────────────────────────
function scoreFinancialAttractiveness(i: SiteScoringInput): number {
  let s = 0
  // Power price $/kWh (0–30) — lower is better
  const ppa = i.ppaPricePerKwh
  if (ppa != null) {
    if (ppa <= 0.025) s += 30; else if (ppa <= 0.035) s += 24
    else if (ppa <= 0.045) s += 18; else if (ppa <= 0.055) s += 12
    else if (ppa <= 0.070) s += 6
  } else s += 12 // unknown — neutral

  // PPA structure bonus (0–10)
  if (i.hasPpa) s += 10

  // Tax abatement (0–15)
  if (i.hasTaxAbatement) s += 15

  // Target levered IRR (0–20)
  const irr = i.targetIrrLevered ?? 0
  if (irr >= 0.20) s += 20; else if (irr >= 0.15) s += 15
  else if (irr >= 0.12) s += 10; else if (irr >= 0.10) s += 5

  // Cost / MW reasonableness (0–25)
  const cost = i.totalProjectCostM
  const mw = Math.max(i.targetItMW ?? 1, i.deliveredMW ?? 1)
  if (cost != null) {
    const pmw = cost / mw
    if (pmw <= 3) s += 25; else if (pmw <= 6) s += 18; else if (pmw <= 10) s += 12
    else if (pmw <= 15) s += 6
  } else s += 12

  return Math.min(100, s)
}

// ── Confidence score ───────────────────────────────────────────────────────
function computeConfidence(i: SiteScoringInput): number {
  const vals = Object.values(i)
  const filled = vals.filter(v => v != null).length
  return Math.round((filled / vals.length) * 100) / 100
}

// ── Recommendation tier ────────────────────────────────────────────────────
function getRecommendation(score: number): SiteRecommendation {
  for (const t of RECOMMENDATION_THRESHOLDS) {
    if (score >= t.min) return t.tier as SiteRecommendation
  }
  return 'REJECT'
}

// ── Rationale builder ──────────────────────────────────────────────────────
function buildRationale(
  scores: Record<string, number>,
  flags: string[],
  i: SiteScoringInput,
): string {
  const strengths: string[] = []
  const gaps: string[] = []

  if (scores.powerExpandability >= 70)
    strengths.push(`strong power position (${i.deliveredMW ?? '?'} MW / ${i.expandableMW ?? '?'} MW expandable)`)
  else if (scores.powerExpandability < 40) gaps.push('limited power headroom')

  if (scores.coolingAiReadiness >= 70)
    strengths.push(`AI-density cooling (${i.maxRackKwSupported ?? '?'} kW/rack, PUE ${i.pueAnnual?.toFixed(2) ?? '?'})`)
  else if (scores.coolingAiReadiness < 40) gaps.push('cooling not AI-ready')

  if (scores.networkLatency >= 60)
    strengths.push(`carrier-rich (${i.carriersOnSite ?? 0} on-site carriers)`)
  else if (scores.networkLatency < 30) gaps.push('limited carrier diversity')

  if (scores.complianceSovereignty >= 70)
    strengths.push('compliance-qualified for financial/sovereign workloads')

  if (scores.financialAttractiveness >= 70)
    strengths.push(`financially attractive ($${i.ppaPricePerKwh?.toFixed(3) ?? '?'}/kWh power)`)
  else if (scores.financialAttractiveness < 40) gaps.push('marginal financial profile')

  const sStr = strengths.length > 0 ? `Strengths: ${strengths.join('; ')}. ` : ''
  const gStr = gaps.length > 0 ? `Gaps: ${gaps.join('; ')}. ` : ''
  const fStr = flags.length > 0 ? `${flags.length} risk flag(s) require resolution before advancement.` : ''
  return `${sStr}${gStr}${fStr}`.trim() || 'Insufficient data for detailed rationale.'
}

// ── Main export — scoreSite ────────────────────────────────────────────────
export function scoreSite(input: SiteScoringInput): ScoringResult {
  const scores = {
    strategicFit:            scoreStrategicFit(input),
    powerExpandability:      scorePowerExpandability(input),
    coolingAiReadiness:      scoreCoolingAiReadiness(input),
    networkLatency:          scoreNetworkLatency(input),
    resilienceSecurity:      scoreResilienceSecurity(input),
    complianceSovereignty:   scoreComplianceSovereignty(input),
    operationalMaturity:     scoreOperationalMaturity(input),
    financialAttractiveness: scoreFinancialAttractiveness(input),
  }

  const totalScore = Object.entries(scores).reduce((acc, [key, val]) => {
    return acc + val * (SCORING_WEIGHTS[key as ScoringCategory] ?? 0)
  }, 0)

  const confidenceScore   = computeConfidence(input)
  const recommendation    = getRecommendation(totalScore)
  const { flags, missing } = detectRedFlags(input)
  const rationale         = buildRationale(scores, flags, input)

  return {
    scores,
    totalScore:     Math.round(totalScore * 10) / 10,
    confidenceScore,
    recommendation,
    rationale,
    redFlags:               flags,
    missingCriticalFields:  missing,
  }
}
