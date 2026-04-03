import { notFound } from 'next/navigation'
import Link from 'next/link'
import { db } from '@/lib/db'
import { SiteEditClient } from './client'

async function getSiteForEdit(id: string) {
  const site = await db.site.findUnique({
    where: { id },
    include: {
      utilities:           true,
      generators:          true,
      upsSystems:          true,
      coolingSystems:      true,
      networkProfiles:     true,
      securityProfile:     true,
      complianceProfile:   true,
      environmentalProfile: true,
      capitalPlan:         true,
      jurisdictionProfile: true,
    },
  })
  if (!site) notFound()
  return site
}

export default async function SiteEditPage({ params }: { params: { id: string } }) {
  const site = await getSiteForEdit(params.id)

  return (
    <div className="space-y-5 max-w-5xl">
      {/* Breadcrumb */}
      <nav className="text-xs text-[--text-muted] flex items-center gap-1.5">
        <Link href="/pipeline" className="hover:text-[--accent-blue]">Pipeline</Link>
        <span>/</span>
        <Link href={`/sites/${site.id}`} className="hover:text-[--accent-blue]">{site.name}</Link>
        <span>/</span>
        <span className="text-[--text-primary]">Edit</span>
      </nav>

      <div>
        <h1 className="text-base font-bold text-[--text-primary]">{site.name}</h1>
        <p className="text-xs text-[--text-muted]">Enter or update subsystem data. Each section saves independently.</p>
      </div>

      <SiteEditClient siteId={site.id} initial={{
        utility:     site.utilities[0]    ?? null,
        generators:  site.generators[0]   ?? null,
        ups:         site.upsSystems[0]   ?? null,
        cooling:     site.coolingSystems[0] ?? null,
        network:     site.networkProfiles[0] ?? null,
        security:    site.securityProfile  ?? null,
        compliance:  site.complianceProfile ?? null,
        environmental: site.environmentalProfile ?? null,
        capital:     site.capitalPlan      ?? null,
        jurisdiction: site.jurisdictionProfile ?? null,
        overview: {
          name:            site.name,
          address:         site.address,
          city:            site.city,
          state:           site.state,
          country:         site.country,
          lat:             site.lat,
          lng:             site.lng,
          siteType:        site.siteType,
          ownershipStatus: site.ownershipStatus,
          totalAcres:      site.totalAcres,
          targetItMW:      site.targetItMW,
          maxExpandableMW: site.maxExpandableMW,
          currentPUE:      site.currentPUE,
          internalNotes:   site.internalNotes,
        },
      }} />
    </div>
  )
}
