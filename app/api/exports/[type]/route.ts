import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { db } from '@/lib/db'
import { authOptions } from '@/lib/auth'
import { generateExecutivePdf, generateTechnicalPdf, generateDCGuidePdf } from '@/services/exports/pdf'
import { generateExcelWorkbook } from '@/services/exports/xlsx'

export async function GET(
  req: NextRequest,
  { params }: { params: { type: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { type } = params

  // DC Guide PDF does not require a siteId
  if (type === 'dc-guide') {
    const buf = generateDCGuidePdf()
    return new NextResponse(buf as unknown as BodyInit, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="UnyKorn-DC-Institutional-Playbook.pdf"',
      },
    })
  }

  const siteId = req.nextUrl.searchParams.get('siteId')
  if (!siteId) return NextResponse.json({ error: 'siteId required' }, { status: 400 })

  const site = await db.site.findUnique({
    where: { id: siteId },
    include: {
      utilities:          true,
      generators:         true,
      upsSystems:         true,
      coolingSystems:     true,
      networkProfiles:    { include: { fiberRoutes: true } },
      securityProfile:    true,
      complianceProfile:  true,
      environmentalProfile: true,
      capitalPlan:        true,
      financialModels:    true,
      jurisdictionProfile: true,
      buildings:          true,
      scorecard:          true,
      riskFlags:          { where: { isResolved: false }, orderBy: { severity: 'asc' } },
      tasks:              { where: { status: { not: 'COMPLETED' } } },
      contacts:           true,
    },
  })

  if (!site) return NextResponse.json({ error: 'Site not found' }, { status: 404 })

  if (type === 'json') {
    return NextResponse.json({ data: site }, {
      headers: {
        'Content-Disposition': `attachment; filename="site-${siteId}.json"`,
        'Content-Type': 'application/json',
      },
    })
  }

  if (type === 'executive-pdf') {
    const buf = await generateExecutivePdf(site as any)
    return new NextResponse(buf as unknown as BodyInit, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${site.name ?? siteId}-executive.pdf"`,
      },
    })
  }

  if (type === 'technical-pdf') {
    const buf = await generateTechnicalPdf(site as any)
    return new NextResponse(buf as unknown as BodyInit, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${site.name ?? siteId}-technical.pdf"`,
      },
    })
  }

  if (type === 'xlsx') {
    const buf = await generateExcelWorkbook(site as any)
    return new NextResponse(buf as unknown as BodyInit, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${site.name ?? siteId}.xlsx"`,
      },
    })
  }

  return NextResponse.json({ error: `Unknown export type: ${type}` }, { status: 400 })
}
