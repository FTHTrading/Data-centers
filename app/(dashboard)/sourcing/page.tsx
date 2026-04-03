import { db } from '@/lib/db'
import Link from 'next/link'
import { qualifySite } from '@/services/sourcing/qualification'

async function getRawListings() {
  return db.rawListing.findMany({
    where: { status: 'PENDING' },
    orderBy: { scrapedAt: 'desc' },
    take: 50,
  })
}

export default async function SourcingPage() {
  const listings = await getRawListings()

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-base font-bold text-[--text-primary]">Sourcing Intelligence</h1>
        <p className="text-xs text-[--text-muted]">
          {listings.length} unprocessed listings from all registered sources
        </p>
      </div>

      {listings.length === 0 && (
        <div className="dc-card p-8 text-center">
          <p className="text-[--text-dimmed] text-sm">No unprocessed listings.</p>
          <p className="text-xs text-[--text-dimmed] mt-1">
            Configure sources in Settings → Source Registry.
          </p>
        </div>
      )}

      <div className="space-y-2">
        {listings.map(listing => {
          // Quick parse: extract MW from title/body
          const body = listing.rawContent ?? ''
          const mwMatch = body.match(/(\d+)\s*MW/i)
          const mw = mwMatch ? parseInt(mwMatch[1]) : null
          const stateMatch = body.match(/\b([A-Z]{2})\b/)
          const qual = qualifySite({ deliveredMW: mw, state: stateMatch?.[1] })

          return (
            <div key={listing.id} className="dc-card p-4 space-y-2">
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-[--text-primary] truncate">{listing.sourceUrl}</span>
                    <span className={`status-pill text-[10px] ${
                      qual.qualified ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'
                    }`}>
                      {qual.qualified ? 'QUALIFIES' : 'FAILS'}
                    </span>
                  </div>
                  <div className="text-xs text-[--text-dimmed] mt-0.5">
                    {listing.sourceType ?? 'Unknown source'}
                    {mw && <span className="ml-2">{mw} MW detected</span>}
                  </div>
                  {qual.reasons.length > 0 && (
                    <div className="text-xs text-red-400 mt-1">
                      {qual.reasons[0]}
                    </div>
                  )}
                  {qual.warnings.length > 0 && qual.reasons.length === 0 && (
                    <div className="text-xs text-amber-400 mt-1">
                      ⚠ {qual.warnings[0]}
                    </div>
                  )}
                </div>
                <div className="flex gap-2 shrink-0">
                  <form action={`/api/sites`} method="POST">
                    <input type="hidden" name="rawListingId" value={listing.id} />
                    <input type="hidden" name="name" value={listing.sourceUrl} />
                    <button
                      type="submit"
                      className="btn-ghost text-xs"
                      title="Promote to site"
                    >
                      Promote →
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
