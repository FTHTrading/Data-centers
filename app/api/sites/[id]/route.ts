import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { db } from '@/lib/db'
import { authOptions } from '@/lib/auth'

// Only fields that users are permitted to change directly
const PatchSiteSchema = z.object({
  name:             z.string().min(1).optional(),
  address:          z.string().optional(),
  city:             z.string().optional(),
  state:            z.string().optional(),
  country:          z.string().optional(),
  lat:              z.number().optional(),
  lng:              z.number().optional(),
  jurisdiction:     z.string().optional(),
  zoning:           z.string().optional(),
  parcelIds:        z.string().optional(),
  ownershipStatus:  z.string().optional(),
  totalAcres:       z.number().optional(),
  laydownAcres:     z.number().optional(),
  totalSqFt:        z.number().optional(),
  currentItMW:      z.number().optional(),
  targetItMW:       z.number().optional(),
  maxExpandableMW:  z.number().optional(),
  currentPUE:       z.number().optional(),
  targetPUE:        z.number().optional(),
  isStandalone:     z.boolean().optional(),
  isOnCampus:       z.boolean().optional(),
  sourceType:       z.string().optional(),
  sourceUrl:        z.string().url().optional(),
  sourceName:       z.string().optional(),
  brokerName:       z.string().optional(),
  listingDate:      z.string().datetime().optional(),
  stage:            z.string().optional(),
  status:           z.string().optional(),
  siteType:         z.string().optional(),
  priority:         z.string().optional(),
  tags:             z.array(z.string()).optional(),
  internalNotes:    z.string().optional(),
}).strict()

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {

  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const site = await db.site.findUnique({
    where: { id: params.id },
    include: {
      utilities: true,
      generators: true,
      upsSystems: true,
      coolingSystems: true,
      networkProfiles: { include: { fiberRoutes: true } },
      securityProfile: true,
      complianceProfile: true,
      environmentalProfile: true,
      capitalPlan: true,
      financialModels: true,
      jurisdictionProfile: true,
      buildings: true,
      scorecard: true,
      riskFlags: { orderBy: [{ severity: 'asc' }, { createdAt: 'desc' }] },
      tasks: { orderBy: { dueDate: 'asc' } },
      agentRuns: { orderBy: { startedAt: 'desc' }, take: 20 },
      contacts: true,
    },
  })

  if (!site) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ data: site })
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {

  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const site = await db.site.findUnique({ where: { id: params.id } })
  if (!site) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = PatchSiteSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })
  }

  const userId = (session.user as { id: string }).id

  const updated = await db.site.update({
    where: { id: params.id },
    data: parsed.data as any,
    select: { id: true, name: true, stage: true, status: true, updatedAt: true },
  })

  await db.auditLog.create({
    data: {
      userId,
      siteId:     params.id,
      action:     'SITE_UPDATE',
      entityType: 'Site',
      entityId:   params.id,
      changes:    parsed.data as any,
    },
  })

  return NextResponse.json({ data: updated })
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {

  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const site = await db.site.findUnique({ where: { id: params.id } })
  if (!site) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const userId = (session.user as { id: string }).id

  // Soft delete (archive)
  await db.site.update({
    where: { id: params.id },
    data: { status: 'ARCHIVED' },
  })

  await db.auditLog.create({
    data: {
      userId,
      siteId: params.id,
      action: 'SITE_ARCHIVE',
      entityType: 'Site',
      entityId: params.id,
    },
  })

  return NextResponse.json({ data: { id: params.id, status: 'ARCHIVED' } })
}
