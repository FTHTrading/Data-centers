import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { db } from '@/lib/db'
import { authOptions } from '@/lib/auth'

const JurisdictionSchema = z.object({
  country:                 z.string().optional(),
  state:                   z.string().optional(),
  county:                  z.string().optional(),
  municipality:            z.string().optional(),
  hasTaxAbatement:         z.boolean().optional(),
  taxAbatementDetails:     z.string().optional(),
  hasSalesTaxExemption:    z.boolean().optional(),
  hasPropertyTaxExemption: z.boolean().optional(),
  enterpriseZone:          z.boolean().optional(),
  dataCenterIncentive:     z.boolean().optional(),
  politicalRisk:           z.string().optional(),
  cryptoFriendly:          z.boolean().optional(),
  financialRegsNotes:      z.string().optional(),
  speStructure:            z.string().optional(),
  notes:                   z.string().optional(),
})

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const site = await db.site.findUnique({ where: { id: params.id }, select: { id: true } })
  if (!site) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const data = await db.jurisdictionProfile.findUnique({ where: { siteId: params.id } })
  return NextResponse.json({ data })
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const site = await db.site.findUnique({ where: { id: params.id }, select: { id: true } })
  if (!site) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  let body: unknown
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const parsed = JurisdictionSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })

  const userId = (session.user as { id: string }).id

  const result = await db.jurisdictionProfile.upsert({
    where:  { siteId: params.id },
    create: { siteId: params.id, ...parsed.data },
    update: parsed.data,
  })

  await db.auditLog.create({
    data: { userId, siteId: params.id, action: 'JURISDICTION_UPDATE', entityType: 'Site', entityId: params.id, changes: parsed.data as any },
  })

  return NextResponse.json({ data: result })
}
