// services/sourcing/ranking.ts
// Rank a batch of opportunities for pipeline priority sorting

export interface RankingInput {
  siteId: string
  siteName: string
  totalScore?: number | null
  criticalRiskCount: number
  highRiskCount: number
  completenessScore?: number | null  // 0–1
  stage?: string
  deliveredMW?: number | null
  recommendation?: string | null
}

export interface RankedSite extends RankingInput {
  rank: number
  compositeScore: number
  rankingNotes: string[]
}

const STAGE_URGENCY: Record<string, number> = {
  EXECUTIVE_REVIEW:  10,
  FINANCIAL_REVIEW:  8,
  COMPLIANCE_REVIEW: 8,
  TECHNICAL_REVIEW:  6,
  INITIAL_REVIEW:    4,
  QUALIFICATION:     2,
  SOURCING:          1,
  ON_HOLD:           0,
  REJECTED:         -99,
}

export function rankSites(sites: RankingInput[]): RankedSite[] {
  const scored = sites.map(site => {
    const notes: string[] = []
    let score = 0

    // Base score (0–100 → scaled to 60 pts)
    const base = site.totalScore ?? 50
    score += base * 0.60

    // Completeness (0–1 → scaled to 15 pts)
    const complete = site.completenessScore ?? 0.5
    score += complete * 15
    if (complete < 0.3) notes.push('Low data completeness — score confidence reduced.')

    // Risk penalty (up to -25 pts)
    const riskPenalty = site.criticalRiskCount * 8 + site.highRiskCount * 2
    score -= Math.min(riskPenalty, 25)
    if (site.criticalRiskCount > 0) notes.push(`${site.criticalRiskCount} CRITICAL risk(s) pending.`)

    // Stage urgency bonus (0–10 pts)
    const stageBonus = STAGE_URGENCY[site.stage ?? ''] ?? 0
    score += stageBonus

    // Recommendation tier bonus
    const rec = site.recommendation
    if (rec === 'FLAGSHIP_FIT')   score += 10
    else if (rec === 'STRATEGIC_FIT') score += 5

    // MW scale bonus
    const mw = site.deliveredMW ?? 0
    if (mw >= 100) score += 5
    else if (mw >= 50) score += 3

    return {
      ...site,
      compositeScore: Math.round(score * 10) / 10,
      rankingNotes: notes,
      rank: 0,
    } as RankedSite
  })

  scored.sort((a, b) => b.compositeScore - a.compositeScore)
  scored.forEach((s, i) => { s.rank = i + 1 })

  return scored
}
