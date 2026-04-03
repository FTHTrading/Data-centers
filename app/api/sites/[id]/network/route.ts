import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { db } from '@/lib/db'
import { authOptions } from '@/lib/auth'

const NetworkSchema = z.object({
  carriersOnSite:            z.coerce.number().int().optional(),
  carriersNearby:            z.coerce.number().int().optional(),
  hasDarkFiber:              z.boolean().optional(),
  hasMeetMeRoom:             z.boolean().optional(),
  hasRouteDiversity:         z.boolean().optional(),
  aggregateBandwidthTbps:    z.coerce.number().optional(),
  ixProximityMiles:          z.coerce.number().optional(),
  cloudOnRampLatencyMs:      z.coerce.number().optional(),
  crossConnectLeadTimeDays:  z.coerce.number().int().optional(),
  hasWavelengthService:      z.boolean().optional(),
  carrierNames:              z.string().optional(),
  notes:                     z.string().optional(),
})

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const site = await db.site.findUnique({ where: { id: params.id }, select: { id: true } })
  if (!site) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const data = await db.networkProfile.findFirst({ where: { siteId: params.id } })
  return NextResponse.json({ data })
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const site = await db.site.findUnique({ where: { id: params.id }, select: { id: true } })
  if (!site) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  let body: unknown
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const parsed = NetworkSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })

  const userId = (session.user as { id: string }).id

  const existing = await db.networkProfile.findFirst({ where: { siteId: params.id } })
  const result = existing
    ? await db.networkProfile.update({ where: { id: existing.id }, data: parsed.data })
    : await db.networkProfile.create({ data: { siteId: params.id, ...parsed.data } })

  await db.auditLog.create({
    data: { userId, siteId: params.id, action: 'NETWORK_UPDATE', entityType: 'Site', entityId: params.id, changes: parsed.data as any },
  })

  return NextResponse.json({ data: result })
}
