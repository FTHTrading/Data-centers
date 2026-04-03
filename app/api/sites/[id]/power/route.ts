import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { db } from '@/lib/db'
import { authOptions } from '@/lib/auth'

const UtilitySchema = z.object({
  provider:                 z.string().optional(),
  accountNumber:            z.string().optional(),
  serviceVoltageKv:         z.coerce.number().optional(),
  deliveredMW:              z.coerce.number().optional(),
  contractedMW:             z.coerce.number().optional(),
  expandableMW:             z.coerce.number().optional(),
  feedCount:                z.coerce.number().int().optional(),
  hasFeedDiversity:         z.boolean().optional(),
  substationCount:          z.coerce.number().int().optional(),
  substationProximityMiles: z.coerce.number().optional(),
  interconnectionStatus:    z.string().optional(),
  upgradeRequired:          z.boolean().optional(),
  upgradeDescription:       z.string().optional(),
  upgradeTimeline:          z.string().optional(),
  gridReliabilityPercent:   z.coerce.number().optional(),
  voltageStabilityPercent:  z.coerce.number().optional(),
  hasBtmGeneration:         z.boolean().optional(),
  btmCapacityMW:            z.coerce.number().optional(),
  btmSources:               z.string().optional(),
  notes:                    z.string().optional(),
})

const GeneratorsSchema = z.object({
  count:               z.coerce.number().int().optional(),
  fuelType:            z.string().optional(),
  capacityKwEach:      z.coerce.number().optional(),
  redundancyModel:     z.string().optional(),
  autonomyHours:       z.coerce.number().optional(),
  hasRefuelContract:   z.boolean().optional(),
  testSchedule:        z.string().optional(),
  yearInstalled:       z.coerce.number().int().optional(),
  estimatedLifeYears:  z.coerce.number().int().optional(),
  emissionsNotes:      z.string().optional(),
  notes:               z.string().optional(),
})

const UpsSchema = z.object({
  topology:               z.string().optional(),
  manufacturer:           z.string().optional(),
  chemistry:              z.string().optional(),
  capacityKwEach:         z.coerce.number().optional(),
  count:                  z.coerce.number().int().optional(),
  runtimeMinutes:         z.coerce.number().optional(),
  redundancyModel:        z.string().optional(),
  yearInstalled:          z.coerce.number().int().optional(),
  replacementCycleYears:  z.coerce.number().int().optional(),
  totalKwBacked:          z.coerce.number().optional(),
  currentKwUtilized:      z.coerce.number().optional(),
  supportedRackDensityKw: z.coerce.number().optional(),
  strandedPowerKw:        z.coerce.number().optional(),
  hasTelemetry:           z.boolean().optional(),
  notes:                  z.string().optional(),
})

const PowerSchema = z.object({
  utility:    UtilitySchema.optional(),
  generators: GeneratorsSchema.optional(),
  ups:        UpsSchema.optional(),
})

async function requireSite(id: string) {
  return db.site.findUnique({ where: { id }, select: { id: true } })
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const site = await requireSite(params.id)
  if (!site) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const [utility, generators, ups] = await Promise.all([
    db.utility.findFirst({ where: { siteId: params.id } }),
    db.generatorPlant.findFirst({ where: { siteId: params.id } }),
    db.uPSSystem.findFirst({ where: { siteId: params.id } }),
  ])

  return NextResponse.json({ data: { utility, generators, ups } })
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const site = await requireSite(params.id)
  if (!site) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  let body: unknown
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const parsed = PowerSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })

  const { utility, generators, ups } = parsed.data
  const userId = (session.user as { id: string }).id

  const [utilityResult, generatorsResult, upsResult] = await Promise.all([
    utility ? (async () => {
      const ex = await db.utility.findFirst({ where: { siteId: params.id } })
      return ex
        ? db.utility.update({ where: { id: ex.id }, data: utility })
        : db.utility.create({ data: { siteId: params.id, ...utility } })
    })() : Promise.resolve(null),

    generators ? (async () => {
      const ex = await db.generatorPlant.findFirst({ where: { siteId: params.id } })
      return ex
        ? db.generatorPlant.update({ where: { id: ex.id }, data: generators })
        : db.generatorPlant.create({ data: { siteId: params.id, ...generators } })
    })() : Promise.resolve(null),

    ups ? (async () => {
      const ex = await db.uPSSystem.findFirst({ where: { siteId: params.id } })
      return ex
        ? db.uPSSystem.update({ where: { id: ex.id }, data: ups })
        : db.uPSSystem.create({ data: { siteId: params.id, ...ups } })
    })() : Promise.resolve(null),
  ])

  await db.auditLog.create({
    data: {
      userId,
      siteId:     params.id,
      action:     'POWER_UPDATE',
      entityType: 'Site',
      entityId:   params.id,
      changes:    parsed.data as any,
    },
  })

  return NextResponse.json({ data: { utility: utilityResult, generators: generatorsResult, ups: upsResult } })
}
