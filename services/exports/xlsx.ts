// services/exports/xlsx.ts
// Excel workbook export — full diligence workbook

import * as XLSX from 'xlsx'

function addSummarySheet(wb: XLSX.WorkBook, site: Record<string, any>) {
  const scorecard = site.scorecard ?? {}
  const rows: (string | number | null)[][] = [
    ['UNYKORN DATA CENTER OS — SITE DILIGENCE WORKBOOK'],
    [`Generated: ${new Date().toISOString()}`],
    [],
    ['IDENTITY'],
    ['Site Name', site.name],
    ['City', site.city],
    ['State', site.state],
    ['Country', site.country],
    ['Site Type', site.siteType?.replace(/_/g, ' ')],
    ['Ownership Status', site.ownershipStatus],
    ['Pipeline Stage', site.stage?.replace(/_/g, ' ')],
    ['Source', site.leadSource],
    [],
    ['SCORECARD'],
    ['Overall Score (0–100)', scorecard.totalScore ?? null],
    ['Recommendation Tier', scorecard.recommendation?.replace(/_/g, ' ') ?? null],
    ['Confidence (%)', scorecard.confidenceScore != null ? Math.round(scorecard.confidenceScore * 100) : null],
    ['Power Depth & Expandability', scorecard.powerExpandability ?? null],
    ['Strategic Fit', scorecard.strategicFit ?? null],
    ['Cooling & AI Readiness', scorecard.coolingAiReadiness ?? null],
    ['Network & Latency', scorecard.networkLatency ?? null],
    ['Resilience & Security', scorecard.resilienceSecurity ?? null],
    ['Compliance & Sovereignty', scorecard.complianceSovereignty ?? null],
    ['Operational Maturity', scorecard.operationalMaturity ?? null],
    ['Financial Attractiveness', scorecard.financialAttractiveness ?? null],
    [],
    ['RATIONALE'],
    [scorecard.rationale ?? ''],
    [],
    ['MISSING CRITICAL FIELDS'],
    [scorecard.missingCriticalFields ?? ''],
  ]
  const ws = XLSX.utils.aoa_to_sheet(rows)
  XLSX.utils.book_append_sheet(wb, ws, 'Overview')
}

function addPowerSheet(wb: XLSX.WorkBook, site: Record<string, any>) {
  const u = site.utilities?.[0] ?? {}
  const g = site.generators?.[0] ?? {}
  const ups = site.upsSystems?.[0] ?? {}

  const rows: (string | number | null | boolean)[][] = [
    ['POWER & UTILITY'],
    ['Provider', u.provider ?? null],
    ['Substation', u.substationName ?? null],
    ['Delivered MW', u.deliveredMW ?? null],
    ['Expandable MW', u.expandableMW ?? null],
    ['BTM Capacity (MW)', u.btmCapacityMW ?? null],
    ['Feed Count', u.feedCount ?? null],
    ['Feed Diversity', u.feedDiversity ?? null],
    ['Grid Reliability (%)', u.gridReliabilityPercent ?? null],
    ['Transmission Voltage (kV)', u.transmissionVoltageKv ?? null],
    ['Rate ($/kWh)', u.ratePerKwh ?? null],
    [],
    ['GENERATORS'],
    ['Count', g.count ?? null],
    ['Capacity (kW each)', g.capacityKwEach ?? null],
    ['Total Capacity (kW)', g.count && g.capacityKwEach ? g.count * g.capacityKwEach : null],
    ['Redundancy Model', g.redundancyModel ?? null],
    ['Autonomy (hours)', g.autonomyHours ?? null],
    ['Fuel Type', g.fuelType ?? null],
    ['Test Schedule', g.testSchedule ?? null],
    [],
    ['UPS'],
    ['Topology', ups.topology ?? null],
    ['Runtime (minutes)', ups.runtimeMinutes ?? null],
    ['Capacity (kW each)', ups.capacityKwEach ?? null],
    ['Redundancy Model', ups.redundancyModel ?? null],
    ['Battery Type', ups.batteryType ?? null],
  ]
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rows), 'Power')
}

function addCoolingSheet(wb: XLSX.WorkBook, site: Record<string, any>) {
  const c = site.coolingSystems?.[0] ?? {}
  const rows: (string | number | null | boolean)[][] = [
    ['COOLING SYSTEMS'],
    ['Cooling Type', c.coolingType?.replace(/_/g, ' ') ?? null],
    ['Max Rack kW Supported', c.maxRackKwSupported ?? null],
    ['Total Cooling Capacity (kW)', c.totalCoolingCapacityKw ?? null],
    ['PUE Annual', c.pueAnnual ?? null],
    ['PUE Target', c.pueTarget ?? null],
    ['Liquid Cooling Ready', c.isLiquidCoolingReady ?? null],
    ['CDU Present', c.hasCdu ?? null],
    ['Immersion Cooling', c.hasImmersionCooling ?? null],
    ['Rear Door HX', c.hasRearDoorHeat ?? null],
    ['Water Source', c.waterSource ?? null],
    ['WUE Annual', c.wueAnnual ?? null],
    ['Cooling Capacity (tons)', c.coolingCapacityTons ?? null],
    ['Notes', c.notes ?? null],
  ]
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rows), 'Cooling')
}

function addNetworkSheet(wb: XLSX.WorkBook, site: Record<string, any>) {
  const n = site.networkProfiles?.[0] ?? {}
  const routes = n.fiberRoutes ?? []
  const rows: (string | number | null | boolean)[][] = [
    ['NETWORK & CONNECTIVITY'],
    ['Carriers On-Site', n.carriersOnSite ?? null],
    ['Route Diversity', n.hasRouteDiv ?? null],
    ['Dark Fiber', n.hasDarkFiber ?? null],
    ['Meet-Me Room', n.hasMeetMeRoom ?? null],
    ['IX Proximity (miles)', n.ixProximityMiles ?? null],
    ['IX Name', n.ixName ?? null],
    ['Aggregate Bandwidth (Tbps)', n.aggregateBandwidthTbps ?? null],
    ['Cloud On-Ramp Latency (ms)', n.cloudOnRampLatencyMs ?? null],
    ['MPLS Present', n.hasMpls ?? null],
    [],
    ['FIBER ROUTES'],
    ['Carrier', 'Type', 'Direction', 'Distance (mi)', 'Dark Fiber', 'Notes'],
    ...routes.map((r: any) => [r.carrier, r.routeType, r.direction, r.distanceMi, r.isDark, r.notes]),
  ]
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rows), 'Network')
}

function addComplianceSheet(wb: XLSX.WorkBook, site: Record<string, any>) {
  const comp = site.complianceProfile ?? {}
  const sec = site.securityProfile ?? {}
  const rows: (string | number | null | boolean)[][] = [
    ['COMPLIANCE & SECURITY'],
    ['SOC 2 Type II', comp.hasSoc2 ?? null],
    ['ISO 27001', comp.hasIso27001 ?? null],
    ['CJIS', comp.hasCjis ?? null],
    ['PCI-DSS', comp.hasPciDss ?? null],
    ['HIPAA', comp.hasHipaa ?? null],
    ['FedRAMP Authorized', comp.hasFedRamp ?? null],
    ['Uptime Tier', comp.uptierCertification ?? null],
    ['Sovereign Hosting Suitable', comp.sovereignHostingSuitable ?? null],
    ['Financial Infra Suitable', comp.financialInfraSuitable ?? null],
    ['Digital Asset Suitable', comp.digitalAssetSuitable ?? null],
    [],
    ['PHYSICAL SECURITY'],
    ['Biometrics', sec.hasBiometrics ?? null],
    ['Mantraps', sec.hasMantraps ?? null],
    ['SOC/NOC', sec.hasSocNoc ?? null],
    ['CCTV (DC floor)', sec.hasCctvDataCenter ?? null],
    ['Cabinet Locks', sec.hasCabinetLocks ?? null],
    ['Security Certifications', sec.physicalSecurityCert ?? null],
  ]
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rows), 'Compliance')
}

function addCapitalSheet(wb: XLSX.WorkBook, site: Record<string, any>) {
  const cap = site.capitalPlan ?? {}
  const fm = site.financialModel ?? {}
  const rows: (string | number | null)[][] = [
    ['CAPITAL & FINANCIAL MODEL'],
    ['Total Project Cost ($M)', cap.totalProjectCostM ?? null],
    ['Land Cost ($M)', cap.landCostM ?? null],
    ['Infrastructure Cost ($M)', cap.infraCostM ?? null],
    ['IT Equipment Budget ($M)', cap.itEquipmentBudgetM ?? null],
    ['Equity ($M)', cap.equityM ?? null],
    ['Senior Debt ($M)', cap.seniorDebtM ?? null],
    ['Mezzanine ($M)', cap.mezzanineM ?? null],
    ['LTV (%)', cap.ltvPercent ?? null],
    ['DSCR (target)', cap.dscrTarget ?? null],
    ['Target IRR (levered)', cap.targetIrrLevered != null ? `${(cap.targetIrrLevered * 100).toFixed(1)}%` : null],
    ['Target IRR (unlevered)', cap.targetIrrUnlevered != null ? `${(cap.targetIrrUnlevered * 100).toFixed(1)}%` : null],
    ['Equity Multiple', cap.equityMultiple ?? null],
    ['Hold Period (years)', cap.holdPeriodYears ?? null],
    [],
    ['FINANCIAL MODEL'],
    ['Year 1 Revenue ($M)', fm.year1RevenueM ?? null],
    ['Year 1 EBITDA ($M)', fm.year1EbitdaM ?? null],
    ['Stabilized NOI ($M)', fm.stabilizedNoiM ?? null],
    ['Capex $/MW', fm.capexPerMW ?? null],
    ['Revenue/MW', fm.revenuePerMW ?? null],
    ['Energy Cost %', fm.energyCostPercent ?? null],
  ]
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rows), 'Capital')
}

function addRiskSheet(wb: XLSX.WorkBook, site: Record<string, any>) {
  const risks = site.riskFlags ?? []
  const header = ['ID', 'Category', 'Severity', 'Title', 'Description', 'Recommendation', 'Auto-Generated', 'Resolved']
  const body = risks.map((r: any) => [
    r.id,
    r.category,
    r.severity,
    r.title,
    r.description,
    r.recommendation ?? '',
    r.isAutoGenerated ? 'Yes' : 'No',
    r.isResolved ? 'Yes' : 'No',
  ])
  const ws = XLSX.utils.aoa_to_sheet([header, ...body])
  XLSX.utils.book_append_sheet(wb, ws, 'Risk Flags')
}

function addTasksSheet(wb: XLSX.WorkBook, site: Record<string, any>) {
  const tasks = site.workflowTasks ?? []
  const header = ['ID', 'Title', 'Type', 'Priority', 'Status', 'Owner', 'Due Date', 'SLA Hours', 'Completed']
  const body = tasks.map((t: any) => [
    t.id,
    t.title,
    t.taskType,
    t.priority,
    t.status,
    t.owner?.name ?? '',
    t.dueDate ? new Date(t.dueDate).toLocaleDateString() : '',
    t.slaHours ?? '',
    t.completedAt ? new Date(t.completedAt).toLocaleDateString() : '',
  ])
  const ws = XLSX.utils.aoa_to_sheet([header, ...body])
  XLSX.utils.book_append_sheet(wb, ws, 'Tasks')
}

// ── Main export ────────────────────────────────────────────────────────────
export function generateExcelWorkbook(site: Record<string, any>): Buffer {
  const wb = XLSX.utils.book_new()
  addSummarySheet(wb, site)
  addPowerSheet(wb, site)
  addCoolingSheet(wb, site)
  addNetworkSheet(wb, site)
  addComplianceSheet(wb, site)
  addCapitalSheet(wb, site)
  addRiskSheet(wb, site)
  addTasksSheet(wb, site)
  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }) as Buffer
}
