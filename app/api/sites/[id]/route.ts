import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

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
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const site = await db.site.findUnique({ where: { id: params.id } })
  if (!site) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // Strip fields that can't be patched this way
  const { id: _id, createdAt: _c, updatedAt: _u, createdById: _cb, ...patchable } = body as any

  const updated = await db.site.update({
    where: { id: params.id },
    data: patchable,
    select: { id: true, name: true, stage: true, status: true, updatedAt: true },
  })

  await db.auditLog.create({
    data: {
      userId:     (session.user as any).id,
      siteId:     params.id,
      action:     'SITE_UPDATE',
      entityType: 'Site',
      entityId:   params.id,
      changes:    body as any,
    },
  })

  return NextResponse.json({ data: updated })
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Only admins can delete
  const role = (session.user as any)?.role
  if (role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Forbidden — admin required' }, { status: 403 })
  }

  const site = await db.site.findUnique({ where: { id: params.id } })
  if (!site) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Soft delete (archive)
  await db.site.update({
    where: { id: params.id },
    data: { status: 'ARCHIVED' },
  })

  await db.auditLog.create({
    data: {
      userId: (session.user as any).id,
      siteId: params.id,
      action: 'SITE_ARCHIVE',
      entityType: 'Site',
      entityId: params.id,
    },
  })

  return NextResponse.json({ data: { id: params.id, status: 'ARCHIVED' } })
}
