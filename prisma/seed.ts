// prisma/seed.ts — Four realistic seed sites for UnyKorn Data Center OS
// Run: npm run db:seed

import { PrismaClient, UserRole, SiteStatus, SiteStage, SiteType,
  OwnershipStatus, SourceType, SitePriority, CoolingType, ContactType,
  AttachmentCategory, RiskCategory, RiskSeverity, SiteRecommendation,
  AgentType, AgentRunStatus, TaskType, TaskPriority, TaskStatus
} from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding UnyKorn Data Center OS...')

  // ── Users ─────────────────────────────────────────────────────────────────
  const adminHash = await bcrypt.hash('admin123', 12)
  const analystHash = await bcrypt.hash('analyst123', 12)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@unykorn.com' },
    update: {},
    create: {
      email: 'admin@unykorn.com',
      name: 'Admin User',
      passwordHash: adminHash,
      role: UserRole.ADMIN,
    },
  })

  const analyst = await prisma.user.upsert({
    where: { email: 'analyst@unykorn.com' },
    update: {},
    create: {
      email: 'analyst@unykorn.com',
      name: 'Site Analyst',
      passwordHash: analystHash,
      role: UserRole.ANALYST,
    },
  })

  const powerEng = await prisma.user.upsert({
    where: { email: 'power@unykorn.com' },
    update: {},
    create: {
      email: 'power@unykorn.com',
      name: 'Power Engineer',
      passwordHash: analystHash,
      role: UserRole.POWER_ENGINEER,
    },
  })

  const executive = await prisma.user.upsert({
    where: { email: 'exec@unykorn.com' },
    update: {},
    create: {
      email: 'exec@unykorn.com',
      name: 'Executive Reviewer',
      passwordHash: adminHash,
      role: UserRole.EXECUTIVE_REVIEWER,
    },
  })

  console.log('Users seeded.')

  // ══════════════════════════════════════════════════════════════════════════════
  // SITE 1: Park Place Financial Node — Urban Retrofit — Chicago, IL
  // Stage: IN_DILIGENCE | Type: RETROFIT | Score: Strategic Fit (~72)
  // ══════════════════════════════════════════════════════════════════════════════
  const sc1 = await prisma.scorecard.create({
    data: {
      strategicFit: 75,
      powerExpandability: 62,
      coolingAiReadiness: 70,
      networkLatency: 88,
      resilienceSecurity: 78,
      complianceSovereignty: 82,
      operationalMaturity: 74,
      financialAttractiveness: 55,
      totalScore: 72.4,
      confidenceScore: 0.78,
      recommendation: SiteRecommendation.STRATEGIC_FIT,
      rationale: 'Strong urban network fabric and compliance pedigree offset constrained power expandability. Financial infrastructure suitability is a major differentiator. Power ceiling at 15 MW as-is limits AI workload density without utility upgrade.',
      keyStrengths: 'Prime CBD location; 4 diverse fiber carriers; SOC 2 Type II + ISO 27001; financial infrastructure suitable; established NOC',
      keyWeaknesses: 'Power expandability constrained to 25 MW; retrofit costs estimated $38M; floor loading PSI requires structural assessment for high-density AI racks',
      verifiedFieldCount: 34,
      totalFieldCount: 48,
      computedAt: new Date(),
    },
  })

  const site1 = await prisma.site.create({
    data: {
      name: 'Park Place Financial Node',
      slug: 'park-place-financial-node',
      status: SiteStatus.IN_DILIGENCE,
      stage: SiteStage.TECHNICAL_REVIEW,
      siteType: SiteType.RETROFIT,
      address: '222 W Adams St',
      city: 'Chicago',
      state: 'IL',
      country: 'US',
      lat: 41.8794,
      lng: -87.6345,
      jurisdiction: 'Cook County, IL',
      zoning: 'DX-16 (Downtown Mixed-Use)',
      ownershipStatus: OwnershipStatus.LEASE,
      totalSqFt: 80000,
      currentItMW: 8.5,
      targetItMW: 15,
      maxExpandableMW: 25,
      currentPUE: 1.55,
      targetPUE: 1.42,
      sourceType: SourceType.BROKER_SUBMISSION,
      sourceName: 'JLL Data Center Capital Markets',
      brokerName: 'Davis Whitmore, JLL',
      listingDate: new Date('2025-11-15'),
      totalScore: 72.4,
      recommendation: SiteRecommendation.STRATEGIC_FIT,
      scorecardId: sc1.id,
      completenessScore: 71,
      createdById: analyst.id,
      priority: SitePriority.HIGH,
      tags: ['financial-infra', 'carrier-dense', 'urban-retrofit', 'soc2-certified'],
      internalNotes: 'Strong interest from compliance team. Power upgrade timeline TBD with ComEd — follow up with utility contact by EOQ.',
    },
  })

  await prisma.utility.create({
    data: {
      siteId: site1.id,
      provider: 'Commonwealth Edison (ComEd)',
      serviceVoltageKv: 12.47,
      deliveredMW: 15,
      contractedMW: 10,
      expandableMW: 25,
      feedCount: 2,
      hasFeedDiversity: true,
      substationCount: 1,
      substationProximityMiles: 0.4,
      interconnectionStatus: 'Active — capacity upgrade discussion with ComEd initiated 2025-Q4',
      upgradeRequired: true,
      upgradeDescription: 'Requires dedicated 2nd substation feed and switchgear upgrade to reach 25 MW',
      upgradeTimeline: '18–24 months pending utility approval',
      gridReliabilityPercent: 99.92,
      hasBtmGeneration: false,
    },
  })

  await prisma.coolingSystem.create({
    data: {
      siteId: site1.id,
      coolingType: CoolingType.WATER,
      aggregateTons: 3200,
      crahCracCount: 24,
      redundancyModel: 'N+1',
      isLiquidCoolingReady: false,
      hasCdu: false,
      hasImmersionCooling: false,
      maxRackKwSupported: 20,
      pueDesign: 1.45,
      pueAnnual: 1.55,
      pueTarget: 1.42,
      wueValue: 0.8,
    },
  })

  await prisma.networkProfile.create({
    data: {
      siteId: site1.id,
      carriersOnSite: 4,
      carriersNearby: 8,
      hasDarkFiber: true,
      hasMeetMeRoom: true,
      hasRouteDiversity: true,
      aggregateBandwidthTbps: 6,
      ixProximityMiles: 0.8,
      cloudOnRampLatencyMs: 4.2,
      crossConnectLeadTimeDays: 5,
      hasWavelengthService: true,
      carrierNames: 'AT&T, Lumen, Zayo, Cogent',
    },
  })

  await prisma.complianceProfile.create({
    data: {
      siteId: site1.id,
      hasSoc1: true,
      hasSoc2: true,
      hasSoc3: false,
      hasIso27001: true,
      hasPciDss: true,
      hasHipaa: false,
      hasFedRamp: false,
      hasCjis: false,
      uptimeTier: 'Tier III',
      financialInfraSuitable: true,
      sovereignSuitable: false,
      digitalAssetSuitable: true,
      certificationNotes: 'SOC 2 Type II certified. ISO 27001 re-audit scheduled Q2 2026.',
    },
  })

  await prisma.capitalPlan.create({
    data: {
      siteId: site1.id,
      totalProjectCostM: 52,
      retrofitCostM: 38,
      coolingRetrofitCostM: 8,
      securityUpliftCostM: 2.5,
      utilityDepositM: 3.5,
      seniorDebtM: 30,
      preferredEquityM: 12,
      commonEquityM: 10,
      targetDscr: 1.35,
      targetLtv: 0.62,
      targetIrrUnlevered: 0.11,
      targetIrrLevered: 0.17,
      readinessForLenders: 'Category B — partial documentation. Needs: utility upgrade letter, structural report, certified financial statements.',
      tokenizationStrategy: 'RWA tranche on Stellar/USDF — feasibility pending legal review',
    },
  })

  await prisma.riskFlag.createMany({
    data: [
      {
        siteId: site1.id,
        category: RiskCategory.POWER_UTILITY,
        severity: RiskSeverity.HIGH,
        title: 'Power expandability constrained — single substation',
        description: 'Site relies on a single ComEd substation feed. Expanding beyond 15 MW requires a 2nd dedicated substation feed with 18–24 month lead time.',
        recommendation: 'Secure a utility upgrade letter and include expansion timeline in CapEx plan before advancing to FINANCIAL_REVIEW.',
        isAutoGenerated: true,
      },
      {
        siteId: site1.id,
        category: RiskCategory.STRUCTURAL,
        severity: RiskSeverity.MEDIUM,
        title: 'Floor loading unknown for high-density AI racks',
        description: 'Current floor loading documentation shows 150 PSF. AI GPU racks at 40–60 kW may exceed safe limits in certain areas.',
        recommendation: 'Commission structural engineering study before rack deployment planning.',
        isAutoGenerated: true,
      },
    ],
  })

  await prisma.contact.create({
    data: {
      siteId: site1.id,
      name: 'Davis Whitmore',
      role: 'Managing Director',
      company: 'JLL Data Center Capital Markets',
      email: 'dwhitmore@jll.com',
      phone: '+1 312 555 0142',
      contactType: ContactType.BROKER,
    },
  })

  // ══════════════════════════════════════════════════════════════════════════════
  // SITE 2: Mesa Verde AI Campus — Greenfield 100 MW — Pecos, TX
  // Stage: SHORTLISTED | Type: GREENFIELD | Score: Strategic Fit (~78)
  // ══════════════════════════════════════════════════════════════════════════════
  const sc2 = await prisma.scorecard.create({
    data: {
      strategicFit: 82,
      powerExpandability: 91,
      coolingAiReadiness: 78,
      networkLatency: 55,
      resilienceSecurity: 70,
      complianceSovereignty: 62,
      operationalMaturity: 48,
      financialAttractiveness: 88,
      totalScore: 77.9,
      confidenceScore: 0.71,
      recommendation: SiteRecommendation.STRATEGIC_FIT,
      rationale: 'Exceptional power depth — 100 MW ERCOT with clear 200 MW expansion path. Solar PPA at $0.038/kWh delivers lowest-cost MW in portfolio. Network is the limiting factor: single diverse path commercially lit today. Greenfield ops maturity takes 12–18 months to build.',
      keyStrengths: '100 MW ERCOT base with 200 MW expansion; $0.038/kWh solar PPA signed; 100+ acres; tax abatement secured; DFM-compatible adjacent to midstream',
      keyWeaknesses: 'Network limited to 2 carriers (Frontier + UTOPIA); compliance framework nascent — no certs; greenfield ops = zero existing staff or NOC',
      verifiedFieldCount: 28,
      totalFieldCount: 48,
      computedAt: new Date(),
    },
  })

  const site2 = await prisma.site.create({
    data: {
      name: 'Mesa Verde AI Campus',
      slug: 'mesa-verde-ai-campus',
      status: SiteStatus.SHORTLISTED,
      stage: SiteStage.TECHNICAL_REVIEW,
      siteType: SiteType.GREENFIELD,
      city: 'Pecos',
      state: 'TX',
      country: 'US',
      lat: 31.4227,
      lng: -103.4932,
      jurisdiction: 'Reeves County, TX (ERCOT territory)',
      zoning: 'Industrial / Energy Zone',
      ownershipStatus: OwnershipStatus.UNDER_CONTRACT,
      totalAcres: 100,
      laydownAcres: 50,
      currentItMW: 0,
      targetItMW: 100,
      maxExpandableMW: 200,
      targetPUE: 1.25,
      sourceType: SourceType.AGENT_DISCOVERY,
      sourceName: 'MarketScoutAgent v1',
      totalScore: 77.9,
      recommendation: SiteRecommendation.STRATEGIC_FIT,
      scorecardId: sc2.id,
      completenessScore: 58,
      createdById: admin.id,
      priority: SitePriority.CRITICAL,
      tags: ['greenfield', '100mw', 'solar-ppa', 'ercot', 'ai-campus', 'dfm-adjacent'],
      internalNotes: 'Critical path: InterConnect study completion, Phase 1 ESA, fiber capacity confirmation from Frontier Enterprise. Ask broker about backup path via Zayo Permian.',
    },
  })

  await prisma.utility.create({
    data: {
      siteId: site2.id,
      provider: 'ERCOT / Oncor',
      serviceVoltageKv: 138,
      deliveredMW: 100,
      contractedMW: 0,
      expandableMW: 200,
      feedCount: 1,
      hasFeedDiversity: false,
      substationProximityMiles: 2.1,
      interconnectionStatus: 'Phase 1 interconnect study submitted Q3 2025 — results expected Q1 2026',
      upgradeRequired: true,
      upgradeDescription: 'Dedicated 345 kV substation required for 200 MW expansion. 36-month lead time.',
      upgradeTimeline: '2027–2028 for Phase 2',
      hasBtmGeneration: true,
      btmCapacityMW: 80,
      btmSources: 'Solar PPA (200-acre adjacent array, 20-year fixed at $0.038/kWh); option for 40 MW battery ESS',
    },
  })

  await prisma.coolingSystem.create({
    data: {
      siteId: site2.id,
      coolingType: CoolingType.HYBRID,
      isLiquidCoolingReady: true,
      hasCdu: true,
      hasRearDoorCooler: true,
      hasImmersionCooling: false,
      maxRackKwSupported: 100,
      pueDesign: 1.22,
      pueTarget: 1.20,
      wueValue: 0.3,
      waterSourceRisk: 'Low — closed loop system; Pecos County groundwater supplemental allocation secured',
    },
  })

  await prisma.networkProfile.create({
    data: {
      siteId: site2.id,
      carriersOnSite: 1,
      carriersNearby: 2,
      hasDarkFiber: false,
      hasMeetMeRoom: false,
      hasRouteDiversity: false,
      aggregateBandwidthTbps: 0.4,
      ixProximityMiles: 280,
      cloudOnRampLatencyMs: 22,
      crossConnectLeadTimeDays: 90,
      hasWavelengthService: false,
      carrierNames: 'Frontier Enterprise (1 path lit), Zayo Permian (dark, unlit)',
    },
  })

  await prisma.environmentalProfile.create({
    data: {
      siteId: site2.id,
      renewableEnergyPercent: 80,
      hasPpa: true,
      ppaTermYears: 20,
      ppaPricePerKwh: 0.038,
      hasBtmGeneration: true,
      hasMicrogrid: false,
      waterStressLevel: 'Moderate — West Texas',
      floodRisk: 'Low',
      fireRisk: 'Low-Medium',
      seismicRisk: 'Low',
      climateRiskNarrative: 'High ambient temperature (avg 95°F summer) increases cooling demand but is offset by closed-loop system design. Drought risk mitigated by closed loop. No hurricane exposure.',
    },
  })

  await prisma.jurisdictionProfile.create({
    data: {
      siteId: site2.id,
      country: 'US',
      state: 'TX',
      county: 'Reeves',
      hasTaxAbatement: true,
      taxAbatementDetails: 'Chapter 313 successor agreement — 10-year ad valorem abatement on 85% of added value, up to $500M',
      hasSalesTaxExemption: true,
      hasPropertyTaxExemption: false,
      enterpriseZone: true,
      dataCenterIncentive: true,
      cryptoFriendly: true,
      speStructure: 'LLC / Texas qualified data center designation',
    },
  })

  // ══════════════════════════════════════════════════════════════════════════════
  // SITE 3: Cheyenne Sovereign Ridge — Powered Shell — Cheyenne, WY
  // Stage: APPROVED | Type: POWERED_SHELL | Score: Flagship Fit (~85)
  // ══════════════════════════════════════════════════════════════════════════════
  const sc3 = await prisma.scorecard.create({
    data: {
      strategicFit: 90,
      powerExpandability: 82,
      coolingAiReadiness: 72,
      networkLatency: 78,
      resilienceSecurity: 92,
      complianceSovereignty: 95,
      operationalMaturity: 85,
      financialAttractiveness: 80,
      totalScore: 85.3,
      confidenceScore: 0.91,
      recommendation: SiteRecommendation.FLAGSHIP_FIT,
      rationale: 'Exceptional compliance and sovereignty posture with CJIS alignment, SOC 1/2/3 and ISO 27001 combination. Rocky Mountain Power master service agreement locks in low-cost energy at $0.048/kWh. High confidence due to complete documentation package.',
      keyStrengths: 'CJIS-aligned; SOC 1/2/3 + ISO 27001; RMP master service at $0.048/kWh; 40 MW with fiber path to Denver; sovereign hosting suitable; full diligence pack provided',
      keyWeaknesses: 'Liquid cooling limited to rear-door; no on-site immersion capability yet; 40 MW ceiling requires substation upgrade for >50 MW',
      verifiedFieldCount: 44,
      totalFieldCount: 48,
      computedAt: new Date(),
    },
  })

  const site3 = await prisma.site.create({
    data: {
      name: 'Cheyenne Sovereign Ridge',
      slug: 'cheyenne-sovereign-ridge',
      status: SiteStatus.APPROVED,
      stage: SiteStage.APPROVED,
      siteType: SiteType.POWERED_SHELL,
      address: '5900 Yellowstone Rd',
      city: 'Cheyenne',
      state: 'WY',
      country: 'US',
      lat: 41.1338,
      lng: -104.8202,
      jurisdiction: 'Laramie County, WY',
      zoning: 'Industrial (BP-1)',
      ownershipStatus: OwnershipStatus.GROUND_LEASE,
      totalAcres: 22,
      totalSqFt: 50000,
      currentItMW: 18,
      targetItMW: 40,
      maxExpandableMW: 80,
      currentPUE: 1.42,
      targetPUE: 1.35,
      sourceType: SourceType.BROKER_SUBMISSION,
      sourceName: 'CBRE Data Center Solutions',
      brokerName: 'Karen Ellison, CBRE',
      totalScore: 85.3,
      recommendation: SiteRecommendation.FLAGSHIP_FIT,
      scorecardId: sc3.id,
      completenessScore: 92,
      createdById: analyst.id,
      priority: SitePriority.CRITICAL,
      tags: ['flagship', 'sovereign', 'cjis', 'soc2', 'powered-shell', 'government-ready', 'approved'],
      internalNotes: 'APPROVED by IC 2026-01-10. Proceed to term sheet negotiation. Loop in legal on ground lease assignment clause.',
    },
  })

  await prisma.utility.create({
    data: {
      siteId: site3.id,
      provider: 'Rocky Mountain Power (PacifiCorp)',
      serviceVoltageKv: 69,
      deliveredMW: 40,
      contractedMW: 40,
      expandableMW: 80,
      feedCount: 2,
      hasFeedDiversity: true,
      substationCount: 1,
      substationProximityMiles: 0.2,
      interconnectionStatus: 'Active master service agreement — 40 MW committed, 80 MW option exercisable in 2027',
      gridReliabilityPercent: 99.95,
      hasBtmGeneration: true,
      btmCapacityMW: 6,
      btmSources: 'On-site diesel gen (4×1.5 MW Caterpillar XQ1500), 2 MW battery ESS',
      verifiedAt: new Date('2025-09-01'),
    },
  })

  await prisma.coolingSystem.create({
    data: {
      siteId: site3.id,
      coolingType: CoolingType.HYBRID,
      aggregateTons: 4800,
      redundancyModel: '2N',
      isLiquidCoolingReady: true,
      hasRearDoorCooler: true,
      hasCdu: false,
      hasImmersionCooling: false,
      hasHeatReuse: true,
      maxRackKwSupported: 40,
      pueDesign: 1.35,
      pueAnnual: 1.42,
      wueValue: 0.5,
      waterSourceRisk: 'Very Low — Cheyenne city water with storage tank backup',
    },
  })

  await prisma.networkProfile.create({
    data: {
      siteId: site3.id,
      carriersOnSite: 3,
      carriersNearby: 5,
      hasDarkFiber: true,
      hasMeetMeRoom: true,
      hasRouteDiversity: true,
      aggregateBandwidthTbps: 1.6,
      ixProximityMiles: 95,
      cloudOnRampLatencyMs: 8,
      crossConnectLeadTimeDays: 10,
      hasWavelengthService: true,
      carrierNames: 'Lumen, Zayo, CenturyLink (legacy)',
    },
  })

  await prisma.securityProfile.create({
    data: {
      siteId: site3.id,
      hasPerimeterGuards: true,
      guardsSchedule: '24/7',
      hasCctvBuilding: true,
      hasCctvDataCenter: true,
      cctvRetentionDays: 90,
      hasMantraps: true,
      hasBiometrics: true,
      biometricMethod: 'Handprint + PIN + Facial (triple factor)',
      buildingAuthMethod: 'Badge + CCTV',
      datacenterAuthMethod: 'Mantrap + biometric + EagleEye',
      hasVisitorMgmt: true,
      hasSocNoc: true,
      hasAntiTailgating: true,
      hasCabinetLocks: true,
    },
  })

  await prisma.complianceProfile.create({
    data: {
      siteId: site3.id,
      hasSoc1: true,
      hasSoc2: true,
      hasSoc3: true,
      hasIso27001: true,
      hasPciDss: true,
      hasHipaa: true,
      hasFedRamp: false,
      hasCjis: true,
      hasIso50001: true,
      uptimeTier: 'Tier IV (concurrent maintainability)',
      financialInfraSuitable: true,
      sovereignSuitable: true,
      digitalAssetSuitable: true,
      certificationNotes: 'CJIS Security Policy v5.9.2 compliant. FedRAMP assessment in progress — expected Q3 2026.',
    },
  })

  await prisma.capitalPlan.create({
    data: {
      siteId: site3.id,
      totalProjectCostM: 290,
      siteControlCostM: 20,
      buildoutCostPerMwM: 6.5,
      seniorDebtM: 190,
      preferredEquityM: 60,
      commonEquityM: 40,
      targetDscr: 1.45,
      targetLtv: 0.65,
      targetIrrUnlevered: 0.13,
      targetIrrLevered: 0.21,
      gridAnnualCostM: 16.8,
      readinessForLenders: 'Category A — full documentation. Compliant with TIFIA, NMTC, and conventional construction loan requirements.',
      tokenizationStrategy: 'Sovereign infrastructure RWA issuance via Apostle Chain — Flagship token tranche under review',
      rwaChain: 'apostle-chain',
    },
  })

  // Approval decision
  await prisma.approvalDecision.create({
    data: {
      siteId: site3.id,
      stage: SiteStage.EXECUTIVE_REVIEW,
      decision: 'APPROVED',
      rationale: 'Site meets all Category A lending requirements. Compliance posture is best in class. Power pricing at $0.048/kWh on 2N feed provides defensible NOI margin. Approved to advance to term sheet.',
      decidedById: executive.id,
      decidedAt: new Date('2026-01-10'),
    },
  })

  // ══════════════════════════════════════════════════════════════════════════════
  // SITE 4: Gulf Coast Power Nexus — Greenfield + DFM — Port Arthur, TX
  // Stage: INITIAL_REVIEW | Type: GREENFIELD | Score: Standard Fit (~58)
  // ══════════════════════════════════════════════════════════════════════════════
  const sc4 = await prisma.scorecard.create({
    data: {
      strategicFit: 65,
      powerExpandability: 88,
      coolingAiReadiness: 55,
      networkLatency: 42,
      resilienceSecurity: 50,
      complianceSovereignty: 38,
      operationalMaturity: 30,
      financialAttractiveness: 72,
      totalScore: 58.1,
      confidenceScore: 0.55,
      recommendation: SiteRecommendation.STANDARD_FIT,
      rationale: 'Power story is exceptional — adjacent LNG facility provides behind-meter natural gas generation opportunity aligned with DFM (Distributed Flare Mitigation). However, network isolation (no carriers on site), compliance immaturity, and operational greenfield risk drag the score into Standard Fit. Warrants further development if network path can be secured.',
      keyStrengths: '200 MW expansion potential; DFM-adjacent natural gas; lowest cost energy in portfolio at $0.028/kWh gas-gen estimate; 500 acres available',
      keyWeaknesses: 'No fiber on site; 220 miles to nearest major IX; no compliance certifications; hurricane zone; saltwater cooling risk; greenfield everything',
      verifiedFieldCount: 18,
      totalFieldCount: 48,
      computedAt: new Date(),
    },
  })

  const site4 = await prisma.site.create({
    data: {
      name: 'Gulf Coast Power Nexus',
      slug: 'gulf-coast-power-nexus',
      status: SiteStatus.IN_REVIEW,
      stage: SiteStage.INITIAL_REVIEW,
      siteType: SiteType.GREENFIELD,
      city: 'Port Arthur',
      state: 'TX',
      country: 'US',
      lat: 29.8990,
      lng: -93.9296,
      jurisdiction: 'Jefferson County, TX (ERCOT South Zone)',
      zoning: 'Heavy Industrial (HI)',
      ownershipStatus: OwnershipStatus.LOI,
      totalAcres: 500,
      laydownAcres: 200,
      currentItMW: 0,
      targetItMW: 100,
      maxExpandableMW: 200,
      targetPUE: 1.35,
      sourceType: SourceType.AGENT_DISCOVERY,
      sourceName: 'MarketScoutAgent v1 + OfferAnalysisAgent',
      totalScore: 58.1,
      recommendation: SiteRecommendation.STANDARD_FIT,
      scorecardId: sc4.id,
      completenessScore: 37,
      createdById: admin.id,
      priority: SitePriority.NORMAL,
      tags: ['dfm', 'natural-gas', 'greenfield', 'gulf-coast', 'power-dense', 'hurricane-zone'],
      internalNotes: 'Interesting DFM angle. Key question: can Frontier or Zayo extend fiber to site economically? Request fiber feasibility study. Check Category 4/5 hurricane risk mitigation requirements.',
    },
  })

  await prisma.utility.create({
    data: {
      siteId: site4.id,
      provider: 'ERCOT (South Zone) / Entergy Texas',
      serviceVoltageKv: 138,
      deliveredMW: 0,
      expandableMW: 200,
      feedCount: 0,
      hasBtmGeneration: true,
      btmCapacityMW: 50,
      btmSources: 'Behind-the-meter natural gas gen from adjacent LNG facility (flare mitigation — DFM model). Est. $0.028/kWh blended.',
      interconnectionStatus: 'Pre-study only — formal application not yet filed',
    },
  })

  await prisma.networkProfile.create({
    data: {
      siteId: site4.id,
      carriersOnSite: 0,
      carriersNearby: 1,
      hasDarkFiber: false,
      hasMeetMeRoom: false,
      hasRouteDiversity: false,
      ixProximityMiles: 220,
      carrierNames: 'Frontier (regional, nearest PoP in Beaumont, TX — 32mi)',
    },
  })

  await prisma.riskFlag.createMany({
    data: [
      {
        siteId: site4.id,
        category: RiskCategory.NETWORK_CONNECTIVITY,
        severity: RiskSeverity.CRITICAL,
        title: 'No fiber connectivity — site is network-isolated',
        description: 'Zero carriers on site. Nearest lit PoP is Frontier in Beaumont (32mi). No dark fiber confirmed. Site is commercially unusable for latency-sensitive AI workloads without $15–25M fiber extension.',
        recommendation: 'Commission fiber feasibility study before advancing past INITIAL_REVIEW. Contact Frontier and Zayo for extension quotes.',
        isAutoGenerated: true,
      },
      {
        siteId: site4.id,
        category: RiskCategory.ENVIRONMENTAL_CLIMATE,
        severity: RiskSeverity.HIGH,
        title: 'Hurricane Zone 4 — significant structural and flood exposure',
        description: 'Port Arthur, TX sits in FEMA Hurricane Zone 4 with documented Category 4/5 exposure. Historical flooding during Harvey (2017) and Ike (2008). Insurance and hardening costs could add $20–40M to CapEx.',
        recommendation: 'Obtain FEMA FIRM map analysis and hurricane hardening cost estimate before progressing capital plan.',
        isAutoGenerated: true,
      },
    ],
  })

  // ── Workflow Tasks for site1 ──────────────────────────────────────────────
  await prisma.workflowTask.createMany({
    data: [
      {
        siteId: site1.id,
        title: 'Obtain ComEd utility upgrade feasibility letter',
        taskType: TaskType.FOLLOW_UP_BROKER,
        priority: TaskPriority.HIGH,
        status: TaskStatus.IN_PROGRESS,
        ownerId: powerEng.id,
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        slaHours: 336,
      },
      {
        siteId: site1.id,
        title: 'Commission structural engineering study (floor loading)',
        taskType: TaskType.TECHNICAL_REVIEW,
        priority: TaskPriority.MEDIUM,
        status: TaskStatus.OPEN,
        ownerId: analyst.id,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
      {
        siteId: site2.id,
        title: 'Confirm Zayo Permian dark fiber lighting feasibility',
        taskType: TaskType.FOLLOW_UP_BROKER,
        priority: TaskPriority.CRITICAL,
        status: TaskStatus.OPEN,
        ownerId: analyst.id,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        slaHours: 168,
      },
      {
        siteId: site4.id,
        title: 'Request fiber extension feasibility from Frontier + Zayo',
        taskType: TaskType.FOLLOW_UP_BROKER,
        priority: TaskPriority.CRITICAL,
        status: TaskStatus.OPEN,
        ownerId: admin.id,
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      },
    ],
  })

  console.log('All sites seeded successfully.')
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║           UnyKorn Data Center OS — Seed Complete             ║
╠══════════════════════════════════════════════════════════════╣
║  Sites:                                                      ║
║  1. Park Place Financial Node  → Strategic Fit  (72.4)      ║
║  2. Mesa Verde AI Campus       → Strategic Fit  (77.9)      ║
║  3. Cheyenne Sovereign Ridge   → Flagship Fit   (85.3)      ║
║  4. Gulf Coast Power Nexus     → Standard Fit   (58.1)      ║
╠══════════════════════════════════════════════════════════════╣
║  Users:                                                      ║
║  admin@unykorn.com   / admin123                              ║
║  analyst@unykorn.com / analyst123                            ║
║  power@unykorn.com   / analyst123                            ║
║  exec@unykorn.com    / admin123                              ║
╚══════════════════════════════════════════════════════════════╝
  `)
}

main()
  .catch((e) => {
    console.error('Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
