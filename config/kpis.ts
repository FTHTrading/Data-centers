// config/kpis.ts
// Pipeline KPIs, operational metrics, and portfolio health indicators
// Source: UNYKORN-DataCenter-System-2026.md § KPIs & Metrics

export interface KpiDefinition {
  id: string
  label: string
  unit: string
  description: string
  target?: number | string
  direction: 'higher' | 'lower' | 'on-target'
  category: 'pipeline' | 'power' | 'network' | 'financial' | 'compliance' | 'ops'
}

export const KPI_DEFINITIONS: KpiDefinition[] = [
  // Pipeline
  { id: 'sites_active', label: 'Active Sites', unit: 'count', description: 'Sites in stages from SOURCING to EXECUTIVE_REVIEW', direction: 'higher', category: 'pipeline' },
  { id: 'sites_approved', label: 'Sites Approved', unit: 'count', description: 'Sites reaching APPROVED stage YTD', direction: 'higher', category: 'pipeline' },
  { id: 'pipeline_mw', label: 'Pipeline MW', unit: 'MW', description: 'Total target IT MW across active pipeline', target: 500, direction: 'higher', category: 'pipeline' },
  { id: 'avg_score', label: 'Avg Site Score', unit: 'pts', description: 'Average composite site score across active pipeline', target: 65, direction: 'higher', category: 'pipeline' },
  { id: 'avg_completeness', label: 'Avg Completeness', unit: '%', description: 'Average field completeness across active pipeline', target: 70, direction: 'higher', category: 'pipeline' },
  { id: 'sites_at_risk', label: 'Sites at Risk', unit: 'count', description: 'Sites with 1+ CRITICAL unresolved risk flags', direction: 'lower', category: 'pipeline' },
  { id: 'open_tasks', label: 'Open Tasks', unit: 'count', description: 'Workflow tasks with OPEN or IN_PROGRESS status', direction: 'lower', category: 'ops' },
  { id: 'overdue_tasks', label: 'Overdue Tasks', unit: 'count', description: 'Tasks past their due date', target: 0, direction: 'lower', category: 'ops' },
  // Power
  { id: 'flagship_mw', label: 'Flagship Site MW', unit: 'MW', description: 'Contracted MW in APPROVED + FLAGSHIP_FIT sites', target: 200, direction: 'higher', category: 'power' },
  { id: 'avg_pue', label: 'Portfolio Avg PUE', unit: 'PUE', description: 'Average annual PUE across evaluated sites', target: 1.40, direction: 'lower', category: 'power' },
  { id: 'avg_ppa_cost', label: 'Avg PPA Cost', unit: '$/kWh', description: 'Blended energy cost across PPA-equipped sites', target: 0.05, direction: 'lower', category: 'power' },
  { id: 'renewable_pct', label: 'Renewable %', unit: '%', description: 'Average renewable energy percentage across sites with PPAs', target: 60, direction: 'higher', category: 'power' },
  // Financial
  { id: 'portfolio_cost_m', label: 'Portfolio CapEx', unit: '$M', description: 'Total projected all-in CapEx across active pipeline', direction: 'higher', category: 'financial' },
  { id: 'avg_irr_levered', label: 'Avg Levered IRR', unit: '%', description: 'Average target levered IRR across financial models', target: 18, direction: 'higher', category: 'financial' },
  // Compliance
  { id: 'soc2_certified', label: 'SOC 2 Certified', unit: 'count', description: 'Sites with active SOC 2 Type II certification', direction: 'higher', category: 'compliance' },
  { id: 'sovereign_suitable', label: 'Sovereign Suitable', unit: 'count', description: 'Sites rated sovereign hosting suitable', direction: 'higher', category: 'compliance' },
]

// Agent SLA thresholds (hours to completion)
export const AGENT_SLA_HOURS: Record<string, number> = {
  INTAKE:                  1,
  DOCUMENT_EXTRACTION:     4,
  VALIDATION:              2,
  POWER_UTILITY:           8,
  COOLING_AI_READINESS:    8,
  NETWORK:                 8,
  COMPLIANCE:              8,
  RISK:                    4,
  FINANCIAL_MODELING:     12,
  SUMMARY:                 2,
  WORKFLOW_ORCHESTRATOR:   1,
  APPROVAL:               24,
  KNOWLEDGE:               4,
  PORTFOLIO_INTELLIGENCE: 24,
  MARKET_SCOUT:           48,
  LISTING_EXTRACTION:      6,
  GEO_ENRICHMENT:          2,
}

// Task SLA thresholds (hours)
export const TASK_SLA_HOURS: Record<string, number> = {
  FOLLOW_UP_BROKER:    72,
  UPLOAD_DOCUMENT:     48,
  VALIDATE_DATA:       24,
  AGENT_RUN:           12,
  REVIEW_SECTION:      48,
  TECHNICAL_REVIEW:   168,
  FINANCIAL_REVIEW:   168,
  COMPLIANCE_REVIEW:  168,
  APPROVE:             48,
  LEGAL_REVIEW:       240,
  ESCALATE:             4,
  CUSTOM:              72,
}
