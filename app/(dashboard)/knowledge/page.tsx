import { GLOSSARY, searchGlossary } from '@/config/glossary'
import { SCORING_WEIGHTS, CATEGORY_LABELS } from '@/config/scoring-weights'
import { JURISDICTIONS } from '@/config/jurisdictions'

export default function KnowledgePage() {
  const glossary = GLOSSARY.reduce<Record<string, typeof GLOSSARY>>((acc, t) => {
    acc[t.category] = acc[t.category] ?? []
    acc[t.category].push(t)
    return acc
  }, {})

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-base font-bold text-[--text-primary]">Knowledge Base</h1>
        <p className="text-xs text-[--text-muted]">Benchmarks, scoring reference, jurisdictions, and glossary.</p>
      </div>

      {/* Scoring weights reference */}
      <div className="dc-card p-4">
        <h2 className="text-xs font-semibold text-[--accent-blue] uppercase tracking-wide mb-3">Scoring Weight Reference</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(SCORING_WEIGHTS).map(([key, weight]) => (
            <div key={key} className="bg-[--bg-hover] rounded p-3">
              <div className="text-[10px] text-[--text-dimmed] uppercase tracking-wide">
                {CATEGORY_LABELS[key as keyof typeof CATEGORY_LABELS] ?? key}
              </div>
              <div className="text-xl font-bold text-[--accent-blue] mt-1">
                {Math.round(weight * 100)}%
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 text-xs text-[--text-muted] space-y-1">
          <div>FLAGSHIP ≥ 80 · STRATEGIC ≥ 65 · STANDARD ≥ 50 · WATCHLIST ≥ 30 · REJECT &lt; 30</div>
        </div>
      </div>

      {/* Jurisdiction rankings */}
      <div className="dc-card p-4">
        <h2 className="text-xs font-semibold text-[--accent-blue] uppercase tracking-wide mb-3">Jurisdiction Rankings</h2>
        <div className="space-y-2">
          {JURISDICTIONS.map(j => {
            const tier = j.rank <= 3 ? 1 : j.rank <= 7 ? 2 : 3
            return (
            <div key={j.id} className="flex items-center gap-3 py-1.5 border-b border-[--bg-border] last:border-0">
              <span className="text-xs font-bold text-[--text-primary] w-8">{j.rank}</span>
              <span className="text-xs font-medium text-[--text-primary] w-24">{j.state}</span>
              <span className={`status-pill text-[10px] ${
                tier === 1 ? 'bg-green-900/30 text-green-400' :
                tier === 2 ? 'bg-blue-900/30 text-blue-400' :
                'bg-gray-800 text-gray-400'
              }`}>Tier {tier}</span>
              <span className="text-xs text-[--text-muted] flex-1 truncate">{j.notes}</span>
            </div>
            )
          })}
        </div>
      </div>

      {/* Glossary */}
      <div className="dc-card p-4">
        <h2 className="text-xs font-semibold text-[--accent-blue] uppercase tracking-wide mb-3">Glossary</h2>
        {Object.entries(glossary).map(([category, terms]) => (
          <div key={category} className="mb-4">
            <h3 className="text-[10px] uppercase tracking-widest text-[--text-dimmed] mb-2">{category}</h3>
            <div className="space-y-2">
              {terms.map((term) => (
                <div key={term.term} className="flex gap-3">
                  <span className="text-xs font-mono font-semibold text-[--accent-blue] shrink-0 w-36">{term.term}</span>
                  <span className="text-xs text-[--text-muted]">{term.definition}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
