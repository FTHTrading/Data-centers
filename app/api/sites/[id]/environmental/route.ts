import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { db } from '@/lib/db'
import { authOptions } from '@/lib/auth'

const EnvironmentalSchema = z.object({
  renewableEnergyPercent: z.coerce.number().optional(),
  hasPpa:                 z.boolean().optional(),
  ppaTermYears:           z.coerce.number().int().optional(),
  ppaPricePerKwh:         z.coerce.number().optional(),
  hasBtmGeneration:       z.boolean().optional(),
  hasMicrogrid:           z.boolean().optional(),
  carbonMetricTons:       z.coerce.number().optional(),
  ghgScope1:              z.coerce.number().optional(),
  ghgScope2Market:        z.coerce.number().optional(),
  waterStressLevel:       z.string().optional(),
  floodRisk:              z.string().optional(),
  fireRisk:               z.string().optional(),
  seismicRisk:            z.string().optional(),
  climateRiskNarrative:   z.string().optional(),
  hasEsReporting:         z.boolean().optional(),
  insuranceComplexity:    z.string().optional(),
  permittingRisk:         z.string().optional(),
  communityRisk:          z.string().optional(),
  notes:                  z.string().optional(),
})

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const site = await db.site.findUnique({ where: { id: params.id }, select: { id: true } })
  if (!site) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const data = await db.environmentalProfile.findUnique({ where: { siteId: params.id } })
  return NextResponse.json({ data })
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const site = await db.site.findUnique({ where: { id: params.id }, select: { id: true } })
  if (!site) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  let body: unknown
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const parsed = EnvironmentalSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })

  const userId = (session.user as { id: string }).id

  const result = await db.environmentalProfile.upsert({
    where:  { siteId: params.id },
    create: { siteId: params.id, ...parsed.data },
    update: parsed.data,
  })

  await db.auditLog.create({
    data: { userId, siteId: params.id, action: 'ENVIRONMENTAL_UPDATE', entityType: 'Site', entityId: params.id, changes: parsed.data as any },
  })

  return NextResponse.json({ data: result })
}
