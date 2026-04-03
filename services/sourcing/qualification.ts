// services/sourcing/qualification.ts
// Rapid go/no-go qualification filter for raw listings

export interface QualificationInput {
  deliveredMW?: number | null
  targetItMW?: number | null
  state?: string | null
  country?: string | null
  ownershipStatus?: string | null
  siteType?: string | null
  criticalOpenFlagCount?: number
}

export interface QualificationResult {
  qualified: boolean
  score: number        // 0–100 guidance score (same criteria, softer)
  reasons: string[]    // human-readable fail reasons
  warnings: string[]   // non-blocking concerns
}

const APPROVED_STATES = new Set([
  'WY', 'TX', 'ND', 'SD', 'MT', 'NV', 'AZ', 'CO', 'VA', 'GA', 'NC', 'TN',
  'IL', 'OH', 'PA', 'OR', 'WA', 'FL', 'TN', 'KY', 'NM', 'ID', 'UT',
])

const MIN_MW = 5
const DISQUALIFYING_OWNERSHIP = new Set(['CONDEMNED', 'FORECLOSURE_HOLD', 'CONTESTED_TITLE'])

export function qualifySite(input: QualificationInput): QualificationResult {
  const reasons: string[] = []
  const warnings: string[] = []
  let score = 100

  // ── Hard disqualifiers ───────────────────────────────────────────────────
  const mw = input.deliveredMW ?? input.targetItMW ?? 0
  if (mw < MIN_MW) {
    reasons.push(`Delivered / target IT MW (${mw}) is below minimum qualification threshold of ${MIN_MW} MW.`)
    score -= 35
  }

  if (input.ownershipStatus && DISQUALIFYING_OWNERSHIP.has(input.ownershipStatus)) {
    reasons.push(`Ownership status "${input.ownershipStatus}" is disqualifying for institutional capital.`)
    score -= 40
  }

  if (input.criticalOpenFlagCount && input.criticalOpenFlagCount >= 3) {
    reasons.push(`${input.criticalOpenFlagCount} CRITICAL risk flags open — too many blockers for pipeline admission.`)
    score -= 30
  }

  // ── Soft warnings ────────────────────────────────────────────────────────
  const state = (input.state ?? '').toUpperCase().trim()
  if (state && !APPROVED_STATES.has(state)) {
    warnings.push(`State "${state}" is outside our primary jurisdictional focus list — additional political/tax diligence required.`)
    score -= 10
  }

  if (input.ownershipStatus === 'MARKETED') {
    warnings.push('Site is in broad market — competitive bid process expected.')
    score -= 5
  }

  if (mw > 0 && mw < 20) {
    warnings.push(`Small MW footprint (${mw} MW) — viable only for phased edge deployment strategy.`)
    score -= 10
  }

  if (!input.siteType) {
    warnings.push('Site type not specified — intake agent should classify before scoring.')
    score -= 5
  }

  return {
    qualified: reasons.length === 0,
    score: Math.max(0, score),
    reasons,
    warnings,
  }
}
