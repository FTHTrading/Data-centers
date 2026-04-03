// services/agents/orchestrator.ts
// WorkflowOrchestrator — routes agent runs, advances pipeline stages, enforces SLAs

import { db } from '@/lib/db'
import { scoreSite } from '@/services/scoring/engine'
import type { SiteStage, SiteScoringInput } from '@/types'

// Tasks spawned automatically when a site enters a new stage
const STAGE_TASKS: Record<string, { title: string; taskType: string; priority: string; slaHours: number }[]> = {
  INITIAL_REVIEW: [
    { title: 'Upload utility letter of intent / confirmation', taskType: 'UPLOAD_DOCUMENT', priority: 'HIGH',     slaHours: 48  },
    { title: 'Validate stated MW capacity', taskType: 'VALIDATE_DATA',   priority: 'HIGH',     slaHours: 72  },
    { title: 'Confirm site ownership / LOI status',           taskType: 'REVIEW_SECTION', priority: 'MEDIUM',   slaHours: 96  },
    { title: 'Identify primary broker / owner contact',       taskType: 'FOLLOW_UP_BROKER', priority: 'MEDIUM', slaHours: 48  },
  ],
  TECHNICAL_REVIEW: [
    { title: 'Engineering review — power systems',   taskType: 'TECHNICAL_REVIEW', priority: 'HIGH',     slaHours: 120 },
    { title: 'Engineering review — cooling capacity', taskType: 'TECHNICAL_REVIEW', priority: 'HIGH',    slaHours: 120 },
    { title: 'Verify fiber diversity (site walkthrough)', taskType: 'VALIDATE_DATA', priority: 'HIGH',    slaHours: 96  },
    { title: 'Upload one-line diagram',              taskType: 'UPLOAD_DOCUMENT',  priority: 'HIGH',     slaHours: 96  },
  ],
  FINANCIAL_REVIEW: [
    { title: 'Build project capital stack model',    taskType: 'FINANCIAL_REVIEW', priority: 'HIGH',     slaHours: 120 },
    { title: 'Obtain competing energy price quotes', taskType: 'FOLLOW_UP_BROKER', priority: 'MEDIUM',   slaHours: 168 },
    { title: 'Confirm tax abatement eligibility',    taskType: 'LEGAL_REVIEW',     priority: 'MEDIUM',   slaHours: 168 },
  ],
  COMPLIANCE_REVIEW: [
    { title: 'Collect SOC 2 Type II report (if applicable)', taskType: 'UPLOAD_DOCUMENT', priority: 'HIGH', slaHours: 96  },
    { title: 'Compliance profile final review',      taskType: 'COMPLIANCE_REVIEW', priority: 'HIGH',    slaHours: 96  },
  ],
  EXECUTIVE_REVIEW: [
    { title: 'Prepare IC memo for executive presentation', taskType: 'APPROVE', priority: 'CRITICAL', slaHours: 72 },
    { title: 'Schedule executive site briefing',     taskType: 'REVIEW_SECTION',  priority: 'HIGH',    slaHours: 96 },
  ],
}

export class WorkflowOrchestrator {
  /** Advance site to a new pipeline stage, spawn tasks, log audit */
  async advanceStage(siteId: string, targetStage: SiteStage, userId: string): Promise<void> {
    const site = await db.site.findUniqueOrThrow({ where: { id: siteId } })

    await db.site.update({ where: { id: siteId }, data: { stage: targetStage as any } })

    const tasks = STAGE_TASKS[targetStage] ?? []
    if (tasks.length) {
      await db.workflowTask.createMany({
        data: tasks.map(t => ({
          siteId,
          title:    t.title,
          taskType: t.taskType as any,
          priority: t.priority as any,
          status:   'OPEN',
          slaHours: t.slaHours,
          dueDate:  new Date(Date.now() + t.slaHours * 3_600_000),
        })),
      })
    }

    await db.auditLog.create({
      data: {
        userId,
        siteId,
        action:     'STAGE_ADVANCE',
        entityType: 'Site',
        entityId:   siteId,
        changes:    { from: site.stage, to: targetStage } as any,
      },
    })
  }

  /** Escalate all OPEN tasks whose dueDate has passed */
  async checkSLAs(): Promise<number> {
    const overdue = await db.workflowTask.findMany({
      where: {
        status:  { in: ['OPEN', 'IN_PROGRESS'] },
        dueDate: { lt: new Date() },
      },
    })
    if (overdue.length) {
      await db.workflowTask.updateMany({
        where: { id: { in: overdue.map(t => t.id) } },
        data:  { status: 'ESCALATED', escalatedAt: new Date() },
      })
    }
    return overdue.length
  }

  /** Recompute scorecard from live site data and write back */
  async computeAndSaveScorecard(siteId: string): Promise<void> {
    const site = await db.site.findUniqueOrThrow({
      where: { id: siteId },
      include: {
        utilities:            true,
        generators:           true,
        upsSystems:           true,
        coolingSystems:       true,
        networkProfiles:      true,
        securityProfile:      true,
        complianceProfile:    true,
        environmentalProfile: true,
        capitalPlan:          true,
        jurisdictionProfile:  true,
        buildings:            true,
      },
    })

    const u    = site.utilities[0]
    const g    = site.generators[0]
    const ups  = site.upsSystems[0]
    const cool = site.coolingSystems[0]
    const net  = site.networkProfiles[0]
    const sec  = site.securityProfile
    const comp = site.complianceProfile
    const cap  = site.capitalPlan
    const jur  = site.jurisdictionProfile
    const env  = site.environmentalProfile

    const input: SiteScoringInput = {
      deliveredMW:             u?.deliveredMW    ?? null,
      expandableMW:            u?.expandableMW   ?? null,
      feedCount:               u?.feedCount      ?? null,
      hasFeedDiversity:        u?.hasFeedDiversity  ?? null,  
      generatorCount:          g?.count          ?? null,
      generatorCapacityKwEach: g?.capacityKwEach ?? null,
      generatorAutonomyHours:  g?.autonomyHours  ?? null,
      generatorRedundancy:     g?.redundancyModel ?? null,
      btmCapacityMW:           u?.btmCapacityMW  ?? null,
      upsRuntimeMinutes:       ups?.runtimeMinutes ?? null,
      upsRedundancyModel:      ups?.redundancyModel ?? null,
      upsCapacityKw:           ups?.capacityKwEach  ?? null,
      coolingType:             cool?.coolingType ?? null,
      isLiquidCoolingReady:    cool?.isLiquidCoolingReady ?? null,
      hasCdu:                  cool?.hasCdu ?? null,
      hasImmersionCooling:     cool?.hasImmersionCooling ?? null,
      maxRackKwSupported:      cool?.maxRackKwSupported ?? null,
      pueAnnual:               cool?.pueAnnual   ?? null,
      pueTarget:               cool?.pueTarget   ?? null,
      carriersOnSite:          net?.carriersOnSite ?? null,
      hasRouteDiversity:       net?.hasRouteDiversity    ?? null,
      hasDarkFiber:            net?.hasDarkFiber   ?? null,
      hasMeetMeRoom:           net?.hasMeetMeRoom  ?? null,
      aggregateBandwidthTbps:  net?.aggregateBandwidthTbps ?? null,
      ixProximityMiles:        net?.ixProximityMiles ?? null,
      cloudLatencyMs:          net?.cloudOnRampLatencyMs ?? null,
      hasMantraps:             sec?.hasMantraps ?? null,
      hasBiometrics:           sec?.hasBiometrics ?? null,
      hasSocNoc:               sec?.hasSocNoc ?? null,
      hasCctvDataCenter:       sec?.hasCctvDataCenter ?? null,
      hasCabinetLocks:         sec?.hasCabinetLocks ?? null,
      hasSoc2:                 comp?.hasSoc2    ?? null,
      hasIso27001:             comp?.hasIso27001 ?? null,
      hasCjis:                 comp?.hasCjis    ?? null,
      sovereignSuitable:       comp?.sovereignSuitable ?? null,
      financialInfraSuitable:  comp?.financialInfraSuitable  ?? null,
      digitalAssetSuitable:    comp?.digitalAssetSuitable    ?? null,
      uptimeTier:              comp?.uptimeTier ?? null,
      gridReliabilityPercent:  u?.gridReliabilityPercent ?? null,
      yearBuilt:               site.buildings[0]?.yearBuilt ?? null,
      hasTestSchedule:         g?.testSchedule ? true : null,
      ppaPricePerKwh:          env?.ppaPricePerKwh ?? null,
      hasPpa:                  env?.hasPpa ?? null,
      hasTaxAbatement:         jur?.hasTaxAbatement ?? null,  
      totalProjectCostM:       cap?.totalProjectCostM ?? null,
      targetIrrLevered:        cap?.targetIrrLevered  ?? null,
      siteType:                site.siteType as any,
      targetItMW:              site.targetItMW  ?? null,
      maxExpandableMW:         site.maxExpandableMW ?? null,
      jurisdiction:            site.state ?? site.jurisdiction ?? null,
      ownershipStatus:         site.ownershipStatus ?? null,
      totalAcres:              site.totalAcres ?? null,
    }

    const result = scoreSite(input)

    const scorecardData = {
      strategicFit:            result.scores.strategicFit,
      powerExpandability:      result.scores.powerExpandability,
      coolingAiReadiness:      result.scores.coolingAiReadiness,
      networkLatency:          result.scores.networkLatency,
      resilienceSecurity:      result.scores.resilienceSecurity,
      complianceSovereignty:   result.scores.complianceSovereignty,
      operationalMaturity:     result.scores.operationalMaturity,
      financialAttractiveness: result.scores.financialAttractiveness,
      totalScore:              result.totalScore,
      confidenceScore:         result.confidenceScore,
      recommendation:          result.recommendation as any,
      rationale:               result.rationale,
      missingCriticalFields:   result.missingCriticalFields.join(', ') || null,
      computedAt:              new Date(),
    }

    let scorecardId = site.scorecardId
    if (scorecardId) {
      await db.scorecard.update({ where: { id: scorecardId }, data: scorecardData })
    } else {
      const sc = await db.scorecard.create({ data: scorecardData })
      scorecardId = sc.id
    }

    await db.site.update({
      where: { id: siteId },
      data: {
        scorecardId,
        totalScore:     result.totalScore,
        recommendation: result.recommendation as any,
      },
    })
  }
}

export const orchestrator = new WorkflowOrchestrator()
