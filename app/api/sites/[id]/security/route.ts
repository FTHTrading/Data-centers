import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { db } from '@/lib/db'
import { authOptions } from '@/lib/auth'

const SecuritySchema = z.object({
  hasPerimeterGuards:   z.boolean().optional(),
  guardsSchedule:       z.string().optional(),
  hasCctvBuilding:      z.boolean().optional(),
  hasCctvDataCenter:    z.boolean().optional(),
  cctvRetentionDays:    z.coerce.number().int().optional(),
  hasMantraps:          z.boolean().optional(),
  hasBiometrics:        z.boolean().optional(),
  biometricMethod:      z.string().optional(),
  buildingAuthMethod:   z.string().optional(),
  datacenterAuthMethod: z.string().optional(),
  hasVisitorMgmt:       z.boolean().optional(),
  hasSocNoc:            z.boolean().optional(),
  hasAntiTailgating:    z.boolean().optional(),
  hasCabinetLocks:      z.boolean().optional(),
  notes:                z.string().optional(),
})

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const site = await db.site.findUnique({ where: { id: params.id }, select: { id: true } })
  if (!site) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const data = await db.securityProfile.findUnique({ where: { siteId: params.id } })
  return NextResponse.json({ data })
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const site = await db.site.findUnique({ where: { id: params.id }, select: { id: true } })
  if (!site) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  let body: unknown
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const parsed = SecuritySchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })

  const userId = (session.user as { id: string }).id

  const result = await db.securityProfile.upsert({
    where:  { siteId: params.id },
    create: { siteId: params.id, ...parsed.data },
    update: parsed.data,
  })

  await db.auditLog.create({
    data: { userId, siteId: params.id, action: 'SECURITY_UPDATE', entityType: 'Site', entityId: params.id, changes: parsed.data as any },
  })

  return NextResponse.json({ data: result })
}
