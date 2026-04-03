// services/sourcing/registry.ts
// SourceRegistry CRUD and ScrapeJob management

import { db } from '@/lib/db'

export const sourceRegistry = {
  async list() {
    return db.sourceRegistry.findMany({ orderBy: { createdAt: 'desc' } })
  },

  async create(params: {
    name: string
    url: string
    type: string
  }) {
    return db.sourceRegistry.create({
      data: {
        name: params.name,
        baseUrl: params.url,
        sourceType: params.type as any,
        isActive: true,
      },
    })
  },

  async disable(id: string) {
    return db.sourceRegistry.update({ where: { id }, data: { isActive: false } })
  },

  // ── Scrape jobs ────────────────────────────────────────────────────────────
  async createScrapeJob(registryId: string) {
    return db.scrapeJob.create({
      data: {
        registryId,
        status: 'QUEUED',
      },
    })
  },

  async markJobRunning(jobId: string) {
    return db.scrapeJob.update({
      where: { id: jobId },
      data: { status: 'RUNNING', startedAt: new Date() },
    })
  },

  async markJobComplete(jobId: string, listingsExtracted: number, error?: string) {
    return db.scrapeJob.update({
      where: { id: jobId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        listingsExtracted,
        error: error ?? null,
      },
    })
  },

  async markJobFailed(jobId: string, error: string) {
    return db.scrapeJob.update({
      where: { id: jobId },
      data: { status: 'FAILED', completedAt: new Date(), error },
    })
  },

  // ── Raw listings ────────────────────────────────────────────────────────────
  async getRawListingsForProcessing(limit = 50) {
    return db.rawListing.findMany({
      where: { status: 'PENDING' },
      orderBy: { scrapedAt: 'desc' },
      take: limit,
    })
  },

  async markListingProcessed(id: string, siteId?: string) {
    return db.rawListing.update({
      where: { id },
      data: { status: 'NORMALIZED', normalizedSiteId: siteId ?? null },
    })
  },

  async upsertRawListing(params: {
    scrapeJobId?: string
    sourceUrl: string
    rawContent: string
    scrapedAt?: Date
  }) {
    return db.rawListing.create({
      data: {
        scrapeJobId: params.scrapeJobId ?? null,
        sourceUrl: params.sourceUrl,
        rawContent: params.rawContent,
        scrapedAt: params.scrapedAt ?? new Date(),
        status: 'PENDING',
      },
    })
  },
}
