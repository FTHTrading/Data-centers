export default function SettingsPage() {
  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <h1 className="text-base font-bold text-[--text-primary]">Settings</h1>
        <p className="text-xs text-[--text-muted]">Platform configuration — scoring weights, policy rules, access control.</p>
      </div>

      <div className="dc-card p-4 space-y-4">
        <h2 className="text-xs font-semibold text-[--accent-blue] uppercase tracking-wide">Scoring Weights</h2>
        <p className="text-xs text-[--text-muted]">
          Scoring weights are configured in{' '}
          <code className="text-[--accent-blue]">config/scoring-weights.ts</code>.
          Changes require a re-deploy and all existing scorecards will need recomputation.
        </p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {[
            ['Power & Expandability', '20%'],
            ['Strategic Fit', '15%'],
            ['Cooling & AI Readiness', '15%'],
            ['Network & Latency', '10%'],
            ['Resilience & Security', '10%'],
            ['Compliance & Sovereignty', '10%'],
            ['Operational Maturity', '10%'],
            ['Financial Attractiveness', '10%'],
          ].map(([label, weight]) => (
            <div key={label} className="flex justify-between bg-[--bg-hover] rounded px-3 py-2">
              <span className="text-[--text-muted]">{label}</span>
              <span className="font-bold text-[--text-primary]">{weight}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="dc-card p-4 space-y-3">
        <h2 className="text-xs font-semibold text-[--accent-blue] uppercase tracking-wide">Recommendation Tiers</h2>
        <div className="space-y-2 text-xs">
          <TierRow label="FLAGSHIP"  min="≥ 80" color="text-green-400" />
          <TierRow label="STRATEGIC" min="≥ 65" color="text-blue-400" />
          <TierRow label="STANDARD"  min="≥ 50" color="text-amber-400" />
          <TierRow label="WATCHLIST" min="≥ 30" color="text-orange-400" />
          <TierRow label="REJECT"    min="< 30"  color="text-red-400" />
        </div>
      </div>

      <div className="dc-card p-4 space-y-3">
        <h2 className="text-xs font-semibold text-[--accent-blue] uppercase tracking-wide">Platform Info</h2>
        <div className="text-xs space-y-1 text-[--text-muted]">
          <div>Version: <span className="text-[--text-primary]">1.0.0</span></div>
          <div>Framework: <span className="text-[--text-primary]">Next.js 14 + Prisma + PostgreSQL</span></div>
          <div>Agents: <span className="text-[--text-primary]">14 specialized AI agents</span></div>
          <div>Total evaluation fields: <span className="text-[--text-primary]">178</span></div>
        </div>
      </div>
    </div>
  )
}

function TierRow({ label, min, color }: { label: string; min: string; color: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className={`font-bold w-24 ${color}`}>{label}</span>
      <span className="text-[--text-dimmed]">{min} overall score</span>
    </div>
  )
}
