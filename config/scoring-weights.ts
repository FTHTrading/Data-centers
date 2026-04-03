// config/scoring-weights.ts
// Source: UNYKORN-DataCenter-System-2026.md § Scoring Framework
// All weights must sum to 1.0

export type ScoringCategory =
  | 'strategicFit'
  | 'powerExpandability'
  | 'coolingAiReadiness'
  | 'networkLatency'
  | 'resilienceSecurity'
  | 'complianceSovereignty'
  | 'operationalMaturity'
  | 'financialAttractiveness'

export const SCORING_WEIGHTS: Record<ScoringCategory, number> = {
  powerExpandability:       0.20,  // "Power Depth & Expandability"
  strategicFit:             0.15,
  coolingAiReadiness:       0.15,
  networkLatency:           0.10,
  resilienceSecurity:       0.10,
  complianceSovereignty:    0.10,
  operationalMaturity:      0.10,
  financialAttractiveness:  0.10,
}

// Sanity check (dev-time only)
if (process.env.NODE_ENV === 'development') {
  const sum = Object.values(SCORING_WEIGHTS).reduce((a, b) => a + b, 0)
  if (Math.abs(sum - 1.0) > 0.0001) {
    throw new Error(`SCORING_WEIGHTS do not sum to 1.0 — got ${sum}`)
  }
}

export const CATEGORY_LABELS: Record<ScoringCategory, string> = {
  powerExpandability:       'Power Depth & Expandability',
  strategicFit:             'Strategic Fit',
  coolingAiReadiness:       'Cooling & AI Readiness',
  networkLatency:           'Network & Latency',
  resilienceSecurity:       'Resilience & Security',
  complianceSovereignty:    'Compliance & Sovereignty',
  operationalMaturity:      'Operational Maturity',
  financialAttractiveness:  'Financial Attractiveness',
}

export const CATEGORY_ICONS: Record<ScoringCategory, string> = {
  powerExpandability:       'Zap',
  strategicFit:             'Target',
  coolingAiReadiness:       'Thermometer',
  networkLatency:           'Network',
  resilienceSecurity:       'Shield',
  complianceSovereignty:    'BadgeCheck',
  operationalMaturity:      'Settings',
  financialAttractiveness:  'DollarSign',
}

// Recommendation tiers
export type SiteRecommendationTier = 'REJECT' | 'WATCHLIST' | 'STANDARD_FIT' | 'STRATEGIC_FIT' | 'FLAGSHIP_FIT'

export const RECOMMENDATION_THRESHOLDS: { tier: SiteRecommendationTier; min: number; max: number; label: string; color: string }[] = [
  { tier: 'FLAGSHIP_FIT',  min: 80,  max: 100, label: 'Flagship Fit',  color: 'text-emerald-400' },
  { tier: 'STRATEGIC_FIT', min: 65,  max: 79,  label: 'Strategic Fit', color: 'text-dc-blue-400'  },
  { tier: 'STANDARD_FIT',  min: 50,  max: 64,  label: 'Standard Fit',  color: 'text-yellow-400'   },
  { tier: 'WATCHLIST',     min: 30,  max: 49,  label: 'Watchlist',     color: 'text-orange-400'   },
  { tier: 'REJECT',        min: 0,   max: 29,  label: 'Reject',        color: 'text-red-400'      },
]

export function getRecommendationTier(score: number): SiteRecommendationTier {
  for (const t of RECOMMENDATION_THRESHOLDS) {
    if (score >= t.min && score <= t.max) return t.tier
  }
  return 'REJECT'
}

export function getRecommendationLabel(tier: SiteRecommendationTier): string {
  return RECOMMENDATION_THRESHOLDS.find(t => t.tier === tier)?.label ?? tier
}

export function getRecommendationColor(tier: SiteRecommendationTier): string {
  return RECOMMENDATION_THRESHOLDS.find(t => t.tier === tier)?.color ?? 'text-gray-400'
}

// Scoring sub-criteria for each category
export const SCORING_CRITERIA: Record<ScoringCategory, { field: string; label: string; weight: number }[]> = {
  powerExpandability: [
    { field: 'deliveredMW',        label: 'Delivered MW today',            weight: 0.25 },
    { field: 'expandableMW',       label: 'Expandable MW (contractual)',    weight: 0.30 },
    { field: 'hasFeedDiversity',   label: 'Feed path diversity (N+1)',      weight: 0.20 },
    { field: 'redundancyModel',    label: 'Generator redundancy',           weight: 0.15 },
    { field: 'btmCapacityMW',      label: 'Behind-the-meter generation',    weight: 0.10 },
  ],
  strategicFit: [
    { field: 'siteType',           label: 'Site type alignment',            weight: 0.20 },
    { field: 'targetItMW',         label: 'IT MW target alignment',         weight: 0.25 },
    { field: 'jurisdiction',       label: 'Jurisdiction desirability',       weight: 0.20 },
    { field: 'ownershipStatus',    label: 'Ownership / control',            weight: 0.20 },
    { field: 'expansionPotential', label: 'Expansion pathway',              weight: 0.15 },
  ],
  coolingAiReadiness: [
    { field: 'isLiquidCoolingReady', label: 'Liquid cooling capable',       weight: 0.30 },
    { field: 'maxRackKwSupported', label: 'Max rack density (kW)',          weight: 0.30 },
    { field: 'pueAnnual',          label: 'Annualized PUE',                 weight: 0.25 },
    { field: 'hasCdu',             label: 'CDU / in-row cooling',           weight: 0.15 },
  ],
  networkLatency: [
    { field: 'carriersOnSite',     label: 'Carriers on-site',               weight: 0.30 },
    { field: 'hasRouteDiversity',  label: 'Diverse fiber paths',            weight: 0.25 },
    { field: 'ixProximityMiles',   label: 'IX proximity (miles)',           weight: 0.25 },
    { field: 'aggregateBandwidthTbps', label: 'Aggregate bandwidth (Tb/s)', weight: 0.20 },
  ],
  resilienceSecurity: [
    { field: 'hasBiometrics',      label: 'Biometric access control',       weight: 0.20 },
    { field: 'hasMantraps',        label: 'Mantraps / physical hardening',  weight: 0.20 },
    { field: 'generatorAutonomy',  label: 'Generator autonomy (hours)',     weight: 0.25 },
    { field: 'upsRedundancy',      label: 'UPS redundancy model',           weight: 0.20 },
    { field: 'hasSocNoc',          label: '24/7 SOC / NOC',                 weight: 0.15 },
  ],
  complianceSovereignty: [
    { field: 'hasSoc2',            label: 'SOC 2 Type II',                  weight: 0.25 },
    { field: 'hasIso27001',        label: 'ISO 27001',                      weight: 0.20 },
    { field: 'hasCjis',            label: 'CJIS alignment',                 weight: 0.15 },
    { field: 'sovereignSuitable',  label: 'Sovereign hosting suitable',     weight: 0.20 },
    { field: 'financialInfraSuitable', label: 'Financial infra suitable',   weight: 0.20 },
  ],
  operationalMaturity: [
    { field: 'hasSocNoc',          label: 'Active NOC / SOC',               weight: 0.25 },
    { field: 'yearBuilt',          label: 'Facility age / history',         weight: 0.15 },
    { field: 'gridReliability',    label: 'Grid reliability %',             weight: 0.30 },
    { field: 'testSchedule',       label: 'Gen/UPS test schedule',          weight: 0.30 },
  ],
  financialAttractiveness: [
    { field: 'ppaPricePerKwh',     label: 'Energy cost ($/kWh)',            weight: 0.30 },
    { field: 'hasTaxAbatement',    label: 'Tax abatement / incentives',     weight: 0.25 },
    { field: 'totalProjectCostM',  label: 'All-in project cost',            weight: 0.25 },
    { field: 'targetIrrLevered',   label: 'Target levered IRR',             weight: 0.20 },
  ],
}
