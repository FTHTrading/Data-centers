// config/site-sections.ts
// Full evaluation sections derived from the Canovate Data Center Site Evaluation questionnaire
// and the UNYKORN-DataCenter-System-2026.md specification.
// Each section maps to a prisma model path and a set of displayable fields.

export type SectionId =
  | 'overview'
  | 'power_utility'
  | 'generators'
  | 'ups_systems'
  | 'cooling'
  | 'network'
  | 'security'
  | 'compliance'
  | 'environmental'
  | 'capital_plan'
  | 'financial_models'
  | 'jurisdiction'
  | 'expansion'
  | 'contacts'
  | 'attachments'

export interface SiteSection {
  id: SectionId
  label: string
  description: string
  icon: string
  modelPaths: string[]
  criticalFields: string[]
  estimatedFields: number
}

export const SITE_SECTIONS: SiteSection[] = [
  {
    id: 'overview',
    label: 'Site Overview',
    description: 'Identity, location, ownership, physical characteristics, and pipeline status',
    icon: 'Building2',
    modelPaths: ['site'],
    criticalFields: ['name', 'city', 'state', 'siteType', 'ownershipStatus', 'totalAcres', 'targetItMW', 'status'],
    estimatedFields: 22,
  },
  {
    id: 'power_utility',
    label: 'Power & Utility',
    description: 'Grid provider, delivered and contractual MW, feed count, substation proximity, BTM generation',
    icon: 'Zap',
    modelPaths: ['utilities', 'substations'],
    criticalFields: [
      'provider', 'deliveredMW', 'expandableMW', 'feedCount', 'hasFeedDiversity',
      'substationProximityMiles', 'gridReliabilityPercent',
    ],
    estimatedFields: 24,
  },
  {
    id: 'generators',
    label: 'Emergency Generation',
    description: 'Generator count, fuel type, capacity, redundancy, autonomy, test schedule',
    icon: 'Power',
    modelPaths: ['generators'],
    criticalFields: ['count', 'fuelType', 'capacityKwEach', 'autonomyHours', 'redundancyModel'],
    estimatedFields: 10,
  },
  {
    id: 'ups_systems',
    label: 'UPS Systems',
    description: 'Topology, chemistry, capacity, runtime, redundancy, supported density',
    icon: 'BatteryCharging',
    modelPaths: ['upsSystems'],
    criticalFields: ['topology', 'capacityKwEach', 'count', 'runtimeMinutes', 'redundancyModel', 'supportedRackDensityKw'],
    estimatedFields: 12,
  },
  {
    id: 'cooling',
    label: 'Cooling & Thermal',
    description: 'Type, aggregate capacity, liquid cooling readiness, max rack density, PUE, WUE, AI readiness',
    icon: 'Thermometer',
    modelPaths: ['coolingSystems'],
    criticalFields: [
      'coolingType', 'isLiquidCoolingReady', 'maxRackKwSupported', 'pueAnnual',
      'redundancyModel', 'hasCdu',
    ],
    estimatedFields: 18,
  },
  {
    id: 'network',
    label: 'Network & Connectivity',
    description: 'Carriers, fiber routes, dark fiber, MMR, route diversity, bandwidth, IX proximity, latency',
    icon: 'Network',
    modelPaths: ['networkProfiles', 'fiberRoutes'],
    criticalFields: [
      'carriersOnSite', 'hasRouteDiversity', 'hasDarkFiber',
      'aggregateBandwidthTbps', 'ixProximityMiles', 'cloudOnRampLatencyMs',
    ],
    estimatedFields: 14,
  },
  {
    id: 'security',
    label: 'Physical Security',
    description: 'Perimeter guards, CCTV, mantraps, biometrics, access control, SOC/NOC',
    icon: 'Shield',
    modelPaths: ['securityProfile'],
    criticalFields: ['hasMantraps', 'hasBiometrics', 'hasCctvDataCenter', 'hasSocNoc'],
    estimatedFields: 14,
  },
  {
    id: 'compliance',
    label: 'Compliance & Certifications',
    description: 'SOC 1/2/3, ISO 27001, PCI-DSS, HIPAA, FedRAMP, CJIS, Uptime tier, sovereign suitability',
    icon: 'BadgeCheck',
    modelPaths: ['complianceProfile'],
    criticalFields: ['hasSoc2', 'hasIso27001', 'sovereignSuitable', 'financialInfraSuitable', 'uptimeTier'],
    estimatedFields: 14,
  },
  {
    id: 'environmental',
    label: 'Environmental & ESG',
    description: 'Renewable %, PPA terms, GHG emissions, water risk, climate exposure, ESG reporting',
    icon: 'Leaf',
    modelPaths: ['environmentalProfile'],
    criticalFields: ['renewableEnergyPercent', 'hasPpa', 'waterStressLevel', 'floodRisk', 'climateRiskNarrative'],
    estimatedFields: 16,
  },
  {
    id: 'capital_plan',
    label: 'Capital Stack & Financing',
    description: 'All-in cost, debt/equity split, target DSCR/LTV/IRR, lender readiness, tokenization strategy',
    icon: 'DollarSign',
    modelPaths: ['capitalPlan'],
    criticalFields: [
      'totalProjectCostM', 'seniorDebtM', 'commonEquityM',
      'targetDscr', 'targetIrrLevered', 'readinessForLenders',
    ],
    estimatedFields: 18,
  },
  {
    id: 'financial_models',
    label: 'Financial Scenarios',
    description: 'Revenue per MW, NOI margin, EBITDA, payback, cash-on-cash for each scenario',
    icon: 'BarChart3',
    modelPaths: ['financialModels'],
    criticalFields: ['modelName', 'revenuePerMwAnnualM', 'noiMarginPercent', 'ebitdaM'],
    estimatedFields: 8,
  },
  {
    id: 'jurisdiction',
    label: 'Jurisdiction & Tax',
    description: 'Tax abatements, sales/property tax exemptions, enterprise zones, SPE structure, political risk',
    icon: 'Landmark',
    modelPaths: ['jurisdictionProfile'],
    criticalFields: ['hasTaxAbatement', 'taxAbatementDetails', 'speStructure', 'cryptoFriendly'],
    estimatedFields: 12,
  },
  {
    id: 'expansion',
    label: 'Expansion Phases',
    description: 'Phase-by-phase expansion roadmap with MW targets, cost, timeline',
    icon: 'TrendingUp',
    modelPaths: ['expansionPlans'],
    criticalFields: ['phaseNumber', 'targetMW', 'estimatedCostM', 'targetDate'],
    estimatedFields: 6,
  },
  {
    id: 'contacts',
    label: 'Contacts & Counterparties',
    description: 'Brokers, owners, utility contacts, legal, engineers, lenders',
    icon: 'Users',
    modelPaths: ['contacts'],
    criticalFields: ['name', 'contactType', 'company', 'email'],
    estimatedFields: 6,
  },
  {
    id: 'attachments',
    label: 'Documents & Attachments',
    description: 'Uploaded documents including utility letters, lease docs, engineering reports, broker packages',
    icon: 'Paperclip',
    modelPaths: ['attachments'],
    criticalFields: [],
    estimatedFields: 0,
  },
]

export function getSectionById(id: SectionId): SiteSection | undefined {
  return SITE_SECTIONS.find(s => s.id === id)
}

export const TOTAL_EVALUATION_FIELDS = SITE_SECTIONS.reduce(
  (sum, s) => sum + s.estimatedFields, 0
)

// Lender readiness thresholds (from UNYKORN-DataCenter-System-2026.md § Institutional Lending)
export const LENDER_READINESS_TIERS = [
  { id: 'A', label: 'Category A', minCompleteness: 85, description: 'Full documentation — qualified for conventional construction + perm loan, TIFIA, NMTC' },
  { id: 'B', label: 'Category B', minCompleteness: 65, description: 'Partial documentation — viable for bridge, mez debt, special situations lenders' },
  { id: 'C', label: 'Category C', minCompleteness: 45, description: 'Early stage — suitable for equity only, family office, development capital' },
  { id: 'D', label: 'Category D', minCompleteness: 0,  description: 'Pre-qualification — insufficient documentation for any institutional capital' },
]

export function getLenderReadinessTier(completenessScore: number): typeof LENDER_READINESS_TIERS[0] {
  return LENDER_READINESS_TIERS.find(t => completenessScore >= t.minCompleteness) ?? LENDER_READINESS_TIERS[3]
}
