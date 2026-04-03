import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { db } from '@/lib/db'
import { authOptions } from '@/lib/auth'

const CoolingSchema = z.object({
  coolingType:          z.string().optional(),
  aggregateTons:        z.coerce.number().optional(),
  chilledWaterTons:     z.coerce.number().optional(),
  condenserTons:        z.coerce.number().optional(),
  crahCracCount:        z.coerce.number().int().optional(),
  redundancyModel:      z.string().optional(),
  isLiquidCoolingReady: z.boolean().optional(),
  hasInRowCooling:      z.boolean().optional(),
  hasRearDoorCooler:    z.boolean().optional(),
  hasCdu:               z.boolean().optional(),
  hasImmersionCooling:  z.boolean().optional(),
  hasWarmWaterLoop:     z.boolean().optional(),
  hasHeatReuse:         z.boolean().optional(),
  maxRackKwSupported:   z.coerce.number().optional(),
  pueDesign:            z.coerce.number().optional(),
  pueAnnual:            z.coerce.number().optional(),
  pueTarget:            z.coerce.number().optional(),
  wueValue:             z.coerce.number().optional(),
  waterSourceRisk:      z.string().optional(),
  waterUseIntensity:    z.coerce.number().optional(),
  notes:                z.string().optional(),
})

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const site = await db.site.findUnique({ where: { id: params.id }, select: { id: true } })
  if (!site) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const data = await db.coolingSystem.findFirst({ where: { siteId: params.id } })
  return NextResponse.json({ data })
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const site = await db.site.findUnique({ where: { id: params.id }, select: { id: true } })
  if (!site) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  let body: unknown
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const parsed = CoolingSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })

  const userId = (session.user as { id: string }).id
  const { coolingType, ...rest } = parsed.data
  const data = { ...rest, coolingType: coolingType as any }

  const existing = await db.coolingSystem.findFirst({ where: { siteId: params.id } })
  const result = existing
    ? await db.coolingSystem.update({ where: { id: existing.id }, data })
    : await db.coolingSystem.create({ data: { siteId: params.id, ...data } })

  await db.auditLog.create({
    data: { userId, siteId: params.id, action: 'COOLING_UPDATE', entityType: 'Site', entityId: params.id, changes: parsed.data as any },
  })

  return NextResponse.json({ data: result })
}
