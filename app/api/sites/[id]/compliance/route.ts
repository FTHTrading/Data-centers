import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { db } from '@/lib/db'
import { authOptions } from '@/lib/auth'

const ComplianceSchema = z.object({
  hasSoc1:                z.boolean().optional(),
  hasSoc2:                z.boolean().optional(),
  hasSoc3:                z.boolean().optional(),
  hasIso27001:            z.boolean().optional(),
  hasPciDss:              z.boolean().optional(),
  hasHipaa:               z.boolean().optional(),
  hasFedRamp:             z.boolean().optional(),
  hasCjis:                z.boolean().optional(),
  hasIso50001:            z.boolean().optional(),
  hasNist:                z.boolean().optional(),
  hasStatemssp:           z.boolean().optional(),
  uptimeTier:             z.string().optional(),
  financialInfraSuitable: z.boolean().optional(),
  sovereignSuitable:      z.boolean().optional(),
  digitalAssetSuitable:   z.boolean().optional(),
  dataResidencyNotes:     z.string().optional(),
  certificationNotes:     z.string().optional(),
})

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const site = await db.site.findUnique({ where: { id: params.id }, select: { id: true } })
  if (!site) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const data = await db.complianceProfile.findUnique({ where: { siteId: params.id } })
  return NextResponse.json({ data })
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const site = await db.site.findUnique({ where: { id: params.id }, select: { id: true } })
  if (!site) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  let body: unknown
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const parsed = ComplianceSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })

  const userId = (session.user as { id: string }).id

  const result = await db.complianceProfile.upsert({
    where:  { siteId: params.id },
    create: { siteId: params.id, ...parsed.data },
    update: parsed.data,
  })

  await db.auditLog.create({
    data: { userId, siteId: params.id, action: 'COMPLIANCE_UPDATE', entityType: 'Site', entityId: params.id, changes: parsed.data as any },
  })

  return NextResponse.json({ data: result })
}
