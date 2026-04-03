import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { db } from '@/lib/db'
import { authOptions } from '@/lib/auth'

const CapitalSchema = z.object({
  totalProjectCostM:    z.coerce.number().optional(),
  siteControlCostM:     z.coerce.number().optional(),
  buildoutCostPerMwM:   z.coerce.number().optional(),
  retrofitCostM:        z.coerce.number().optional(),
  coolingRetrofitCostM: z.coerce.number().optional(),
  securityUpliftCostM:  z.coerce.number().optional(),
  utilityDepositM:      z.coerce.number().optional(),
  seniorDebtM:          z.coerce.number().optional(),
  mezzDebtM:            z.coerce.number().optional(),
  preferredEquityM:     z.coerce.number().optional(),
  commonEquityM:        z.coerce.number().optional(),
  targetDscr:           z.coerce.number().optional(),
  targetLtv:            z.coerce.number().optional(),
  targetIrrUnlevered:   z.coerce.number().optional(),
  targetIrrLevered:     z.coerce.number().optional(),
  ppaAnnualCostM:       z.coerce.number().optional(),
  gridAnnualCostM:      z.coerce.number().optional(),
  readinessForLenders:  z.string().optional(),
  tokenizationStrategy: z.string().optional(),
  rwaTokenTicker:       z.string().optional(),
  rwaChain:             z.string().optional(),
  notes:                z.string().optional(),
})

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const site = await db.site.findUnique({ where: { id: params.id }, select: { id: true } })
  if (!site) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const data = await db.capitalPlan.findUnique({ where: { siteId: params.id } })
  return NextResponse.json({ data })
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const site = await db.site.findUnique({ where: { id: params.id }, select: { id: true } })
  if (!site) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  let body: unknown
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const parsed = CapitalSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })

  const userId = (session.user as { id: string }).id

  const result = await db.capitalPlan.upsert({
    where:  { siteId: params.id },
    create: { siteId: params.id, ...parsed.data },
    update: parsed.data,
  })

  await db.auditLog.create({
    data: { userId, siteId: params.id, action: 'CAPITAL_UPDATE', entityType: 'Site', entityId: params.id, changes: parsed.data as any },
  })

  return NextResponse.json({ data: result })
}
