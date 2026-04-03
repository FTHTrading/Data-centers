// Client-side qualification scoring engine
// Analyzes user message history to assess institutional readiness

export type QualLevel = 'institutional' | 'learning' | 'assessing' | 'redirect'

export interface QualState {
  score: number
  level: QualLevel
  signals: string[]
  messageCount: number
}

// Institutional vocabulary — each match adds points
const INST_TERMS: [string, number][] = [
  // Power
  ['\\bmw\\b', 6], ['megawatt', 6], ['\\bpue\\b', 6], ['wue', 4],
  ['substati', 5], ['interconnect', 6], ['utility rate', 5], ['large power', 5],
  ['n\\+1', 8], ['2n\\b', 7], ['generator', 4], ['\\bups\\b', 5], ['transfer switch', 6],
  ['btm\\b', 7], ['behind.the.meter', 7], ['\\bitc\\b', 6], ['solar', 3],
  // Cooling
  ['\\bpue\\b', 6], ['cooling', 3], ['hvac', 4], ['liquid cool', 7], ['immersion', 7],
  ['dlc\\b', 6], ['direct liquid', 7], ['cdr\\b', 5], ['chilled water', 5],
  // Network
  ['dark fiber', 7], ['carrier', 4], ['co-locat', 5], ['colocation', 5],
  ['\\bix\\b', 5], ['\\bclec\\b', 6], ['interconnect', 6],
  // Tiers / standards
  ['tier (iii|iv|3|4)', 7], ['uptime institute', 6], ['soc 2', 5],
  ['iso 27001', 5], ['\\bpci\\b', 4], ['cmmc', 6], ['fedramp', 6],
  // Finance
  ['\\byoc\\b', 8], ['yield on cost', 8], ['\\bdscr\\b', 8], ['\\bnoi\\b', 7],
  ['cap rate', 7], ['\\birr\\b', 7], ['\\bltv\\b', 7], ['ebitda', 7],
  ['lease.up', 6], ['mezz', 6], ['mezzanine', 6], ['preferred equity', 7],
  ['sale.leaseback', 7], ['triple net', 6], ['\\bnnn\\b', 6], ['\\bgmp\\b', 5],
  ['investment commit', 7], ['\\bic\\b presentation', 6], ['underwrite', 6],
  ['proforma', 5], ['pro forma', 5], ['stabilized', 5], ['debt service', 6],
  // Deal / execution signals
  ['specific (site|asset|market|deal)', 8], ['due diligence', 6], ['close', 4],
  ['execute', 5], ['deploy capital', 9], ['equity', 4], ['check size', 8],
  ['hyperscale', 7], ['hyperscaler', 7], ['gpu cluster', 6], ['campus', 4],
  ['acquisition', 6], ['development', 4], ['ground-up', 6],
]

// Capital magnitude signals (regex patterns)
const CAPITAL_PATTERNS: RegExp[] = [
  /\$\s?\d+\s?[mb]\b/i,          // $50M, $10B, $500m
  /\d+\s?(million|billion)/i,      // 50 million
  /\d+\s?mw\b/i,                   // 100MW
  /family\s+office/i,
  /institutional\b/i,
  /\bfund\b/i,
  /\bpe\b|\bprivate equity\b/i,
  /\blp\b|\bgeneral partner\b|\bgp\b/i,
  /capital\s+partner/i,
  /equity\s+(stack|partner|raise)/i,
  /debt\s+(facility|raise|relationship)/i,
]

// Signals that indicate the user is NOT ready
const NOT_READY_PHRASES = [
  'what is a data center',
  'how do data centers work',
  'where do i start',
  'how do i get into',
  'passive income',
  'side investment',
  'invest in data centers',
  'good investment',
  'i want to invest',
  'is this profitable',
  'how much do i need',
  'learn about data centers',
  'brand new to',
  'never done this before',
  'just starting out',
  'beginner',
  'zero experience',
  'no experience',
]

// Very basic questions that suggest pre-institutional stage
const BASIC_QUESTIONS = [
  'what is pue',
  'what is mw',
  'what is colocation',
  'what is tier 3',
  'what does dscr mean',
  'what is noi',
]

export function computeQual(userMessages: string[]): QualState {
  if (userMessages.length === 0) {
    return { score: 50, level: 'assessing', signals: [], messageCount: 0 }
  }

  const combined = userMessages.join(' ').toLowerCase()
  let score = 50
  const signals: string[] = []

  // Score institutional terms
  for (const [pattern, pts] of INST_TERMS) {
    const re = new RegExp(pattern, 'i')
    if (re.test(combined)) {
      score += pts
      signals.push(pattern.replace(/\\/g, '').replace(/\(.*\)/g, '').trim())
    }
  }

  // Score capital patterns
  for (const re of CAPITAL_PATTERNS) {
    if (re.test(combined)) {
      score += 8
      signals.push('capital signal')
    }
  }

  // Penalize not-ready phrases
  for (const phrase of NOT_READY_PHRASES) {
    if (combined.includes(phrase)) {
      score -= 25
      signals.push(`weak: ${phrase}`)
    }
  }

  // Penalize basic question patterns
  for (const phrase of BASIC_QUESTIONS) {
    if (combined.includes(phrase)) {
      score -= 15
      signals.push(`basic question: ${phrase}`)
    }
  }

  // Message length proxy for engagement depth
  const avgLen = userMessages.reduce((a, m) => a + m.length, 0) / userMessages.length
  if (avgLen > 300) { score += 12; signals.push('detailed messages') }
  else if (avgLen > 150) { score += 5 }
  else if (avgLen < 40) { score -= 8; signals.push('short messages') }

  // More messages = more data = more confidence in routing
  if (userMessages.length >= 5) score = Math.round(score * 0.95) // slight regression toward evidence

  score = Math.max(0, Math.min(100, Math.round(score)))

  // Only commit to redirect after enough evidence (3+ exchanges)
  const level: QualLevel =
    score >= 75 ? 'institutional' :
    score >= 42 ? 'learning' :
    userMessages.length >= 3 ? 'redirect' :
    'assessing'

  return {
    score,
    level,
    signals: [...new Set(signals)].slice(0, 8),
    messageCount: userMessages.length,
  }
}

export const QUAL_META: Record<QualLevel, { label: string; color: string; description: string }> = {
  institutional: {
    label: 'INSTITUTIONAL',
    color: '#22c55e',
    description: 'Institutional-grade operator',
  },
  learning: {
    label: 'DEVELOPING',
    color: '#2196f3',
    description: 'Building toward execution-ready',
  },
  assessing: {
    label: 'ASSESSING',
    color: '#f59e0b',
    description: 'Evaluating fit — more context needed',
  },
  redirect: {
    label: 'NOT YET READY',
    color: '#ef4444',
    description: 'Preparation recommended before proceeding',
  },
}

export const REDIRECT_RESOURCES = [
  { label: 'Market Overview',     href: '/learn',            section: 'market'  },
  { label: 'Scoring Framework',   href: '/learn',            section: 'scoring' },
  { label: 'Power Infrastructure',href: '/learn',            section: 'power'   },
  { label: 'Capital Stack',       href: '/learn',            section: 'capital' },
  { label: 'Due Diligence Guide', href: '/learn',            section: 'dd'      },
  { label: 'Download Playbook',   href: '/api/exports/dc-guide',       section: 'pdf'     },
]
