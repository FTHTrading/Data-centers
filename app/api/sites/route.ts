import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

const CreateSiteSchema = z.object({
  name:             z.string().min(1),
  city:             z.string().optional(),
  state:            z.string().optional(),
  country:          z.string().optional().default('US'),
  postalCode:       z.string().optional(),
  siteType:         z.string().optional(),
  ownershipStatus:  z.string().optional(),
  targetItMW:       z.coerce.number().optional(),
  maxExpandableMW:  z.coerce.number().optional(),
  totalAcres:       z.coerce.number().optional(),
  leadSource:       z.string().optional(),
  brokerName:       z.string().optional(),
  askingPriceM:     z.coerce.number().optional(),
  intakeNotes:      z.string().optional(),
  rawListingId:     z.string().optional(),
})

const ListQuerySchema = z.object({
  stage:          z.string().optional(),
  status:         z.string().optional(),
  recommendation: z.string().optional(),
  page:           z.coerce.number().default(1),
  limit:          z.coerce.number().max(100).default(20),
  q:              z.string().optional(),
})

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const params = Object.fromEntries(req.nextUrl.searchParams.entries())
  const query = ListQuerySchema.parse(params)
  const { page, limit, q, stage, status, recommendation } = query
  const skip = (page - 1) * limit

  const where: any = {}
  if (stage)          where.stage = stage
  if (status)         where.status = status
  if (recommendation) where.recommendation = recommendation
  if (q)              where.OR = [
    { name:  { contains: q, mode: 'insensitive' } },
    { city:  { contains: q, mode: 'insensitive' } },
    { state: { contains: q, mode: 'insensitive' } },
  ]

  const [total, sites] = await Promise.all([
    db.site.count({ where }),
    db.site.findMany({
      where,
      skip,
      take: limit,
      orderBy: [{ totalScore: 'desc' }, { createdAt: 'desc' }],
      select: {
        id: true, name: true, city: true, state: true,
        siteType: true, stage: true, status: true,
        totalScore: true, recommendation: true,
        targetItMW: true,
        createdAt: true, updatedAt: true,
        _count: {
          select: {
            riskFlags: { where: { isResolved: false } },
            tasks: { where: { status: { in: ['OPEN', 'ESCALATED'] } } },
          },
        },
      },
    }),
  ])

  return NextResponse.json({
    data: sites,
    meta: { total, page, limit, pages: Math.ceil(total / limit) },
  })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = CreateSiteSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { rawListingId, brokerName, askingPriceM, intakeNotes, ...siteData } = parsed.data

  const site = await db.site.create({
    data: {
      ...siteData,
      siteType:        siteData.siteType as any,
      ownershipStatus: siteData.ownershipStatus as any,
      stage:           'SOURCING',
      status:          'INTAKE',
      createdById:     (session.user as any).id,
    } as any,
    select: { id: true, name: true, stage: true },
  })

  // Mark raw listing as processed if provided
  if (rawListingId) {
    await db.rawListing.update({
      where: { id: rawListingId },
      data: { status: 'NORMALIZED', normalizedSiteId: site.id },
    })
  }

  // Audit log
  await db.auditLog.create({
    data: {
      userId:     (session.user as any).id,
      siteId:     site.id,
      action:     'SITE_CREATE',
      entityType: 'Site',
      entityId:   site.id,
    },
  })

  return NextResponse.json({ data: site }, { status: 201 })
}
