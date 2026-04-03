'use client'

import { useState } from 'react'
import {
  Zap, Wind, Network, Shield, DollarSign, BarChart2,
  AlertTriangle, CheckSquare, Download, BookOpen, TrendingUp,
  Server, Award, ChevronDown, ChevronRight,
} from 'lucide-react'

// ── Types ────────────────────────────────────────────────────────────────────
type Tab = 'market' | 'scoring' | 'power' | 'cooling' | 'capital' | 'dd'

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'market',  label: 'Market Overview',  icon: TrendingUp   },
  { id: 'scoring', label: 'Scoring Framework', icon: BarChart2    },
  { id: 'power',   label: 'Power & Infra',     icon: Zap          },
  { id: 'cooling', label: 'Cooling & AI',      icon: Wind         },
  { id: 'capital', label: 'Capital Stack',     icon: DollarSign   },
  { id: 'dd',      label: 'Due Diligence',     icon: CheckSquare  },
]

// ── Reusable primitives ───────────────────────────────────────────────────────
function StatCard({ value, label, accent = false }: { value: string; label: string; accent?: boolean }) {
  return (
    <div className={`dc-card p-4 text-center ${accent ? 'border-[--accent-blue]' : ''}`}>
      <div className="text-2xl font-bold text-[--accent-blue] tracking-tight">{value}</div>
      <div className="text-[10px] text-[--text-muted] mt-1 uppercase tracking-wide">{label}</div>
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10px] font-bold text-[--accent-blue] uppercase tracking-widest mb-3 mt-5">
      {children}
    </div>
  )
}

function Table({ head, rows }: { head: string[]; rows: (string | React.ReactNode)[][] }) {
  return (
    <div className="overflow-x-auto rounded border border-[--bg-border]">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-[--bg-hover]">
            {head.map((h, i) => (
              <th key={i} className="px-3 py-2 text-left text-[--text-muted] font-medium whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} className={ri % 2 === 0 ? 'bg-[--bg-card]' : 'bg-[--bg-hover]/40'}>
              {row.map((cell, ci) => (
                <td key={ci} className="px-3 py-1.5 text-[--text-primary] align-top">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Callout({ type, children }: { type: 'info' | 'warn' | 'danger'; children: React.ReactNode }) {
  const styles = {
    info:   'border-l-[--accent-blue] bg-blue-950/20 text-[--text-primary]',
    warn:   'border-l-[--accent-amber] bg-amber-950/20 text-[--text-primary]',
    danger: 'border-l-[--accent-red] bg-red-950/20 text-[--text-primary]',
  }
  return (
    <div className={`border-l-2 pl-3 py-2 pr-3 rounded-r text-xs leading-relaxed my-3 ${styles[type]}`}>
      {children}
    </div>
  )
}

function Expand({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-[--bg-border] rounded mb-2">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-3 py-2.5 text-xs font-medium text-[--text-primary] hover:bg-[--bg-hover] transition-colors"
      >
        {title}
        {open ? <ChevronDown size={14} className="text-[--text-muted]" /> : <ChevronRight size={14} className="text-[--text-muted]" />}
      </button>
      {open && <div className="px-3 pb-3 space-y-2 border-t border-[--bg-border] pt-3">{children}</div>}
    </div>
  )
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1.5 text-xs text-[--text-primary]">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2">
          <span className="text-[--accent-blue] mt-0.5 flex-shrink-0">—</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

function Pill({ color, children }: { color: string; children: React.ReactNode }) {
  return <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${color}`}>{children}</span>
}

// ── Tab content ───────────────────────────────────────────────────────────────
function MarketTab() {
  return (
    <div className="space-y-5">
      <p className="text-xs text-[--text-muted] leading-relaxed">
        The global data center market is one of the most durable infrastructure investment categories of the decade.
        AI workloads, cloud migration, and edge deployments have compressed available power capacity in primary US markets
        to record lows — driving wholesale lease rates and asset valuations to all-time highs.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <StatCard value="$220B+" label="Global Market 2024" />
        <StatCard value="22%+" label="CAGR Through 2030" />
        <StatCard value="40%+" label="AI GPU Demand Growth YoY" />
        <StatCard value="<5%" label="Primary Markets w/ MW Available" />
        <StatCard value="10+ yrs" label="Hyperscaler Avg Lease Term" />
        <StatCard value="$80–$150" label="Wholesale Rate /kW/mo" />
      </div>

      <SectionLabel>Top US Markets by Tier</SectionLabel>
      <Table
        head={['Market', 'State', 'Key Drivers', 'Power', 'Rate /kW/mo']}
        rows={[
          ['Northern Virginia', 'VA', 'Hyperscale hub, fiber density', <Pill color="bg-red-900/40 text-red-400">CONSTRAINED</Pill>, '$120–$160'],
          ['Dallas / Fort Worth', 'TX', 'Low tax, deregulated grid, land', <Pill color="bg-amber-900/40 text-amber-400">MODERATE</Pill>, '$90–$120'],
          ['Phoenix / Goodyear', 'AZ', 'APS/SRP power, low seismic', <Pill color="bg-amber-900/40 text-amber-400">MODERATE</Pill>, '$95–$130'],
          ['Atlanta', 'GA', 'Network IX hub, competitive utility', <Pill color="bg-amber-900/40 text-amber-400">MODERATE</Pill>, '$85–$110'],
          ['Chicago', 'IL', 'Finance sector, carrier dense', <Pill color="bg-orange-900/40 text-orange-400">TIGHT</Pill>, '$100–$140'],
          ['Columbus', 'OH', 'Hyperscale greenfield, low cost', <Pill color="bg-green-900/40 text-green-400">EXCELLENT</Pill>, '$80–$100'],
          ['Reno / Sparks', 'NV', 'Nevada tax incentives, renewables', <Pill color="bg-green-900/40 text-green-400">GOOD</Pill>, '$80–$105'],
        ]}
      />

      <SectionLabel>What Is Driving Demand</SectionLabel>
      <BulletList items={[
        'Generative AI & GPU Clusters — LLM training requires 10–100MW+ dedicated GPU fabric per campus. A single model training run can consume 50MW continuously for months.',
        'Enterprise Cloud Migration — 65%+ of enterprise workloads projected to be cloud-hosted by 2027, driving hyperscalers to pre-lease capacity years in advance.',
        'Edge Compute — <10ms latency requirements for autonomous vehicles, AR/VR, and real-time gaming are driving distributed deployments in secondary and tertiary markets.',
        'Government & Defense — CMMC, FedRAMP, IL4/IL5 sovereign data requirements create a captive tenant class with 10–20+ year lease terms and government-backed credit.',
        'Cryptocurrency & Blockchain — Variable demand, power-intensive. Lease terms are typically 1–3 years and include power-based pricing; useful for filling whitespace.',
        'Healthcare & Life Sciences — HIPAA workloads moving to colocation as on-premises infrastructure ages out; compliant data centers command lease premiums.',
      ]} />

      <SectionLabel>Why Power Is The Binding Constraint</SectionLabel>
      <Callout type="warn">
        <strong>Key insight:</strong> In primary US markets, there is effectively zero available utility-committed power capacity above 20MW. Interconnection queues at MISO, PJM, and WECC routinely stretch 5–8 years for new large load attachments. Owning or optioning a site with existing or committed power allocation is a genuine scarce asset — it is the moat.
      </Callout>
    </div>
  )
}

function ScoringTab() {
  return (
    <div className="space-y-5">
      <p className="text-xs text-[--text-muted] leading-relaxed">
        UnyKorn DC-OS evaluates every site across eight weighted categories. Each category is scored 0–100 and
        blended into a composite total score that drives the institutional recommendation tier.
      </p>

      <Table
        head={['#', 'Category', 'Weight', 'Primary Metrics', 'Green Threshold']}
        rows={[
          ['1', 'Power Depth & Expandability', <span className="font-bold text-[--accent-blue]">20%</span>, 'Delivered MW, BTM MW, feed count, grid reliability', '≥50MW expandable, ≥99.9%'],
          ['2', 'Strategic Fit',               <span className="font-bold text-[--accent-blue]">15%</span>, 'Corridor proximity, incentives, talent, renewables', 'Tier I/II market, ≥$10M incentive'],
          ['3', 'Cooling & AI Readiness',       <span className="font-bold text-[--accent-blue]">15%</span>, 'PUE, max rack kW, liquid cooling, CDU presence', 'PUE <1.40, ≥20kW/rack, LCD ready'],
          ['4', 'Network & Latency',            <span className="font-bold text-[--accent-blue]">10%</span>, 'Carrier count, dark fiber, IX proximity, bandwidth', '≥3 carriers, diverse routes, <50mi IX'],
          ['5', 'Resilience & Security',        <span className="font-bold text-[--accent-blue]">10%</span>, 'Generator redundancy, fuel autonomy, biometrics', 'N+1 gen, 72hr fuel, biometrics, SOC'],
          ['6', 'Compliance & Sovereignty',     <span className="font-bold text-[--accent-blue]">10%</span>, 'Certifications, data residency, uptime tier', 'SOC 2 T2, ISO 27001, Tier III+'],
          ['7', 'Operational Maturity',         <span className="font-bold text-[--accent-blue]">10%</span>, 'DCIM, CMMS, on-site staff, SLA framework', 'DCIM deployed, CMMS, 24/7 NOC'],
          ['8', 'Financial Attractiveness',     <span className="font-bold text-[--accent-blue]">10%</span>, 'Price/MW, YoC, DSCR, LTV, construction basis', 'YoC ≥10%, DSCR ≥1.25x, LTV ≤65%'],
        ]}
      />

      <SectionLabel>Recommendation Tiers</SectionLabel>
      <div className="space-y-2">
        {[
          { tier: 'FLAGSHIP FIT',  range: '82–100', color: 'bg-green-900/30 text-green-400',  action: 'Immediate LOI / full IC approval',                  meaning: 'Exceptional across all 8 categories. Rare. Move immediately — competing capital is watching the same site.' },
          { tier: 'STRATEGIC FIT', range: '65–81',  color: 'bg-blue-900/30 text-blue-400',    action: 'Advance to Phase II DD',                            meaning: 'Strong fundamentals with manageable gaps. Primary diligence warranted before committing.' },
          { tier: 'STANDARD',      range: '50–64',  color: 'bg-amber-900/30 text-amber-400',  action: 'Conditional advance, risk mitigation plan required', meaning: 'Meets institutional baseline. Specific remediation items must be addressed before IC submission.' },
          { tier: 'WATCHLIST',     range: '35–49',  color: 'bg-orange-900/30 text-orange-400',action: 'Hold; re-evaluate after utility/rezoning resolution', meaning: 'Material gaps present. Keep monitoring — often good sites awaiting a single utility or zoning unlock.' },
          { tier: 'REJECT',        range: '0–34',   color: 'bg-red-900/30 text-red-400',      action: 'Pass — document rationale in audit log',            meaning: 'Fails institutional minimum standards. Document and move on. Do not negotiate around a disqualifier.' },
        ].map(t => (
          <div key={t.tier} className="dc-card p-3 flex gap-3 items-start">
            <Pill color={t.color}>{t.tier}</Pill>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-[--text-primary]">{t.range}</span>
                <span className="text-[10px] text-[--text-muted]">|</span>
                <span className="text-[10px] text-[--accent-amber]">{t.action}</span>
              </div>
              <p className="text-[11px] text-[--text-muted]">{t.meaning}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function PowerTab() {
  return (
    <div className="space-y-5">
      <Callout type="danger">
        <strong>Power is the single most critical variable in data center underwriting.</strong> A site scoring perfectly on all other dimensions is automatically disqualified if utility power cannot be secured in writing by a credible utility at a defined MW allocation and timeline.
      </Callout>

      <SectionLabel>Utility Power — What To Look For</SectionLabel>
      <BulletList items={[
        'Utility type: Investor-Owned Utilities (IOU, e.g. Duke, PG&E) vs electric cooperatives vs municipal. IOUs have more structured rate cases but slower interconnection processes.',
        'Grid reliability: Target ≥99.9% annual uptime (≤8.76 hours downtime/year). Request SAIDI and SAIFI statistics from the utility directly for the prior 5 years.',
        'Feed count: Minimum 2 independent feeders sourced from separate substations on separate grid segments. Single-feed is an automatic disqualifier for Tier II+.',
        'Interconnection queue position: MISO, PJM, ERCOT, and WECC queues regularly represent 3–8 years of wait time for large load attachments above 50MW. Earlier positions are worth premium.',
        'Behind-The-Meter (BTM) solar/battery: Reduces peak demand charges by 15–30%, provides 30% federal ITC, and offsets utility dependence during demand events.',
        'Large Power Industrial rate class: Confirm the utility has existing LPI or equivalent tariff schedules and experience serving data center-class loads.',
        'Demand response programs: Participation in utility demand response can generate $50K–$200K/yr in additional revenue per MW while improving grid relationship.',
      ]} />

      <SectionLabel>Backup Power Standards</SectionLabel>
      <Table
        head={['Spec', 'Tier I (Min)', 'Tier II/III (Target)', 'Tier IV (Best-in-Class)']}
        rows={[
          ['Redundancy',     'N',              'N+1',                        '2N or 2(N+1)'],
          ['Fuel Autonomy',  '8 hours',        '48 hours',                   '96+ hours'],
          ['Fuel Type',      'Diesel No. 2',   'Diesel + biodiesel blend',   'Dual-fuel (LNG + diesel)'],
          ['Transfer Time',  '<30 seconds',    '<10 seconds',                '<5 seconds (static transfer switch)'],
          ['Load Testing',   'Annual at 25%',  'Quarterly full load bank',   'Monthly load bank + continuous telemetry'],
          ['Genset Sizing',  '125% of load',   '150% per genset',            '150% + 25% shared spinning reserve'],
        ]}
      />

      <SectionLabel>UPS Systems</SectionLabel>
      <BulletList items={[
        'Topology: Double-conversion (online) UPS provides zero transfer time — power is always running through the inverter. Line-interactive is acceptable for Tier I only.',
        'Redundancy: N+1 minimum per power module. 2N for mission-critical regulated workloads. Modular UPS architecture allows hot-swap maintenance.',
        'Battery: Lithium-ion (Li-ion) preferred over VRLA — 2–3× longer calendar life, smaller footprint, integrated BMS with per-cell monitoring, faster recharge.',
        'Runtime target: 5–15 minutes. Longer runtimes are expensive capex — the UPS bridges to generator, not to operate the site indefinitely.',
        'Efficiency: Target ≥97% at 25% load. Vendors: Vertiv (Liebert), Eaton (9SX/9PX), Schneider Electric (Galaxy), ABB (PowerValue).',
      ]} />

      <SectionLabel>Common Power Diligence Failures</SectionLabel>
      <div className="space-y-2">
        {[
          { label: 'Verbal utility commitment only', detail: 'Utilities routinely over-commit in early conversations. A firm capacity allocation requires an executed interconnection agreement or at minimum a signed capacity letter with MW, timeline, and pricing.' },
          { label: 'Generator autonomy overstated', detail: 'Sellers often quote rated autonomy at name-plate load. In practice, tanks may not be full, load may be higher than specs, and fuel delivery contracts are not always executed. Verify fuel contracts and tank capacity independently.' },
          { label: 'BTM modeled without interconnection study', detail: 'BTM solar/battery adds significant value but requires utility approval and a separate interconnection process. Do not model ITC benefits until a feasibility study is complete.' },
          { label: 'Single substation with redundant feeds', detail: 'Two feeds from the same substation provide no protection against a substation failure. True redundancy requires feeds from separate substations on separate transmission circuits.' },
        ].map(f => (
          <Expand key={f.label} title={`⚠ ${f.label}`}>
            <p className="text-xs text-[--text-muted]">{f.detail}</p>
          </Expand>
        ))}
      </div>
    </div>
  )
}

function CoolingTab() {
  return (
    <div className="space-y-5">
      <p className="text-xs text-[--text-muted] leading-relaxed">
        Cooling is the second largest cost center in a data center (after power) and is the primary technical
        differentiator for AI/GPU workload eligibility. As rack densities climb from the historical 5–10kW range
        toward 100–120kW for GPU pods, the cooling architecture determines which tenants a facility can serve.
      </p>

      <SectionLabel>PUE — Power Usage Effectiveness</SectionLabel>
      <p className="text-[11px] text-[--text-muted] mb-3">PUE = Total Facility Power ÷ IT Equipment Power. Lower = better. 1.0 is theoretical perfection.</p>
      <div className="grid grid-cols-3 gap-3 mb-4">
        <StatCard value="1.58" label="Global Average PUE" />
        <StatCard value="1.12" label="Hyperscaler Target" />
        <StatCard value="<1.20" label="AI GPU Optimal" />
      </div>
      <Callout type="info">
        Every 0.10 improvement in PUE at a 50MW IT load facility reduces annual cooling overhead by ~5MW — worth $400K–$700K/year in power cost savings or capacity to sell additional IT load.
      </Callout>

      <SectionLabel>Cooling Technology Comparison</SectionLabel>
      <Table
        head={['Type', 'Max Rack kW', 'PUE Range', 'AI Ready', 'Est. CAPEX/kW']}
        rows={[
          ['Air CRAC/CRAH',          '<10 kW',     '1.40–1.80', <Pill color="bg-red-900/30 text-red-400">No</Pill>,      '$800–$1,200'],
          ['Hot/Cold Aisle Contain.','10–20 kW',   '1.25–1.50', <Pill color="bg-amber-900/30 text-amber-400">Partial</Pill>, '$1,000–$1,400'],
          ['Rear-Door HX',           '20–35 kW',   '1.15–1.35', <Pill color="bg-amber-900/30 text-amber-400">Partial</Pill>, '$1,200–$1,600'],
          ['Direct Liquid (DLC)',    '30–100 kW',  '1.05–1.20', <Pill color="bg-green-900/30 text-green-400">Yes</Pill>,  '$1,500–$2,200'],
          ['Immersion (1-phase)',     '50–200 kW',  '1.02–1.10', <Pill color="bg-green-900/30 text-green-400">Yes</Pill>,  '$2,000–$3,500'],
          ['Immersion (2-phase)',     '100–300 kW', '1.01–1.05', <Pill color="bg-green-900/30 text-green-400">Yes</Pill>,  '$3,000–$6,000'],
        ]}
      />

      <SectionLabel>AI GPU Cluster Requirements by Generation</SectionLabel>
      <Table
        head={['GPU SKU', 'TDP/GPU', 'Node Size', 'Rack kW (w/ network)', 'Cooling Required']}
        rows={[
          ['NVIDIA A100', '400W', '8 GPU', '8–12 kW', 'Air (barely) or rear-door HX'],
          ['NVIDIA H100/H200 SXM', '700W', '8 GPU', '10–14 kW', 'Air containment or DLC'],
          ['NVIDIA H200 NVL', '1,000W', '8 GPU', '14–20 kW', 'DLC required'],
          ['NVIDIA GB200 NVL72', '1,000W+', '72 GPU', '90–120 kW', 'Direct liquid cooling REQUIRED'],
          ['AMD MI300X', '750W', '8 GPU', '10–16 kW', 'Air or DLC preferred'],
          ['Google TPU v5', '~200W', 'Pod configs', '30–60 kW', 'Air with containment or DLC'],
        ]}
      />

      <SectionLabel>WUE — Water Usage Effectiveness</SectionLabel>
      <p className="text-[11px] text-[--text-muted]">WUE = Annual Water Usage ÷ Annual IT Energy. Target: &lt;1.0 gal/kWh. Increasingly regulated in drought-prone markets.</p>
      <BulletList items={[
        'Evaporative cooling towers are efficient for PUE but water-intensive — critical issue in Phoenix, Dallas, Las Vegas.',
        'Adiabatic cooling (evaporative assist only during high ambient temperatures) balances PUE and WUE.',
        'Closed-loop cooling (glycol or chilled water without evaporation) achieves best WUE at cost of slightly higher PUE.',
        'California, Arizona, and Nevada have imposed or are considering WUE caps on new data center permits.',
      ]} />
    </div>
  )
}

function CapitalTab() {
  return (
    <div className="space-y-5">
      <SectionLabel>Development Cost Structure</SectionLabel>
      <Table
        head={['Cost Component', 'Shell Only', 'Warm Shell', 'Fully Fitted IT-Ready']}
        rows={[
          ['Land Acquisition',       '$0.5–2M/acre',  '$0.5–2M/acre',  '$0.5–2M/acre'],
          ['Shell Construction',     '$200–350/sqft', '$250–400/sqft', '$300–500/sqft'],
          ['Power Infrastructure',   '$2–4M/MW',      '$3–6M/MW',      '$5–10M/MW'],
          ['Cooling Systems',        '$0.5–1M/MW',    '$1–2M/MW',      '$2–4M/MW'],
          ['Network Entrance',       '$500K–2M',      '$1–3M',         '$2–5M'],
          ['TOTAL COST / MW',        '$8–12M/MW',     '$12–16M/MW',    '$14–22M/MW'],
          ['Annual Revenue / MW',    '$1.0–1.4M',     '$1.5–2.0M',     '$2.0–3.0M'],
        ]}
      />

      <SectionLabel>Capital Stack Structure</SectionLabel>
      <div className="space-y-2">
        {[
          { tranche: 'Senior Construction Loan', pct: '55–65%', cost: 'SOFR + 200–350bps', note: 'Interest-only during construction. Converts to permanent loan at stabilization. Recourse during construction, non-recourse at perm conversion.' },
          { tranche: 'Mezzanine / Preferred Equity', pct: '10–20%', cost: '12–16% preferred return', note: 'Sits behind senior debt in the capital stack. Typically receives a preferred current return plus participation above a hurdle rate.' },
          { tranche: 'Common Equity (Sponsor)', pct: '20–30%', cost: 'Target 18–25% IRR', note: 'Residual cash flow and appreciation. Promoted interest (carried interest) on performance above hurdle rate. Co-investors participate pari passu up to hurdle.' },
          { tranche: 'Tax Equity (ITC for BTM Solar)', pct: 'Off-balance-sheet', cost: 'Effective 10–12%', note: 'Monetizes the federal 30% Investment Tax Credit for behind-the-meter solar. Pass-through structure. Does not count against LTV.' },
        ].map(t => (
          <div key={t.tranche} className="dc-card p-3">
            <div className="flex items-start justify-between gap-2 mb-1">
              <span className="text-xs font-bold text-[--text-primary]">{t.tranche}</span>
              <div className="flex gap-2 flex-shrink-0">
                <Pill color="bg-blue-900/30 text-blue-400">{t.pct}</Pill>
                <Pill color="bg-purple-900/30 text-purple-400">{t.cost}</Pill>
              </div>
            </div>
            <p className="text-[11px] text-[--text-muted]">{t.note}</p>
          </div>
        ))}
      </div>

      <SectionLabel>Key Financial KPIs</SectionLabel>
      <Table
        head={['Metric', 'Formula', 'Institutional Target', 'Red Flag']}
        rows={[
          ['Yield on Cost (YoC)', 'Stabilized NOI ÷ Total Dev. Cost', '≥10.0%', '<8.0%'],
          ['DSCR', 'NOI ÷ Annual Debt Service', '≥1.25x', '<1.10x'],
          ['LTV', 'Senior Debt ÷ Appraised Value', '≤65%', '>75%'],
          ['Stabilized Cap Rate', 'NOI ÷ Stabilized Value', '5.5–7.5%', '>9% (distress signal)'],
          ['Leveraged IRR', '5-year exit model', '18–25%', '<14%'],
          ['Equity Multiple', 'Total Return ÷ Equity Invested', '≥2.0× (5yr)', '<1.5×'],
          ['Price per MW', 'Purchase Price ÷ IT MW', '$5–18M/MW', '>$20M/MW'],
          ['EBITDA Margin', 'EBITDA ÷ Revenue', '≥45%', '<35%'],
        ]}
      />

      <SectionLabel>Common Financial Modeling Mistakes</SectionLabel>
      <div className="space-y-2">
        {[
          { title: 'Modeling 100% occupancy at year 1', detail: 'Institutional grade proformas assume a 12–24 month lease-up period from shell completion. Underwriting to instant full occupancy inflates IRR and creates unrealistic debt covenants.' },
          { title: 'Excluding operating capex reserves', detail: 'Data center mechanical systems (UPS batteries, generators, cooling infrastructure) have 7–15 year replacement cycles. A $0.50–1.00/sqft/year capex reserve should be modeled against NOI.' },
          { title: 'Treating tax abatement as guaranteed', detail: 'Incentive packages often require minimum employment thresholds, investment minimums, or annual certification renewals. Model without abatement and treat it as upside only.' },
          { title: 'Ignoring power cost escalation', detail: 'Utility rates escalate 2–4%/year on average. On a 10-year lease with flat power pass-through to tenant, the margin compression can reduce YoC by 100–150bps at expiry.' },
        ].map(f => (
          <Expand key={f.title} title={`⚠ ${f.title}`}>
            <p className="text-xs text-[--text-muted]">{f.detail}</p>
          </Expand>
        ))}
      </div>
    </div>
  )
}

function DDTab() {
  const sections: { title: string; icon: React.ElementType; items: string[] }[] = [
    {
      title: 'Power & Utility',
      icon: Zap,
      items: [
        'Utility Letter of Intent / capacity allocation letter — MW committed, timeline, and pricing confirmed',
        'Interconnection study results (Phase I & II) from MISO/PJM/ERCOT/WECC',
        'Substation engineering report — existing vs. planned capacity with load schedule',
        'Grid reliability statistics (SAIDI/SAIFI) from utility for prior 5 years',
        'Rate schedule confirmation — Large Power Industrial (LPI) or equivalent',
        'Fuel supply contract for generator diesel + on-site tank capacity validation',
        'BTM solar/battery feasibility study with ITC qualification memo from tax counsel',
        'Electrical single-line diagram reviewed and stamped by licensed Professional Engineer',
      ],
    },
    {
      title: 'Physical & Environmental',
      icon: Shield,
      items: [
        'Phase I Environmental Site Assessment — no Recognized Environmental Conditions (RECs)',
        'Phase II ESA (if Phase I reveals any conditions)',
        'ALTA/NSPS survey and title report — confirm clean title with no undisclosed encumbrances',
        'Zoning confirmation letter — data center use confirmed as-of-right (generators, HVAC included)',
        'FEMA flood map review — confirm Zone X (minimal hazard); LOMA if needed',
        'Seismic hazard assessment — structural compliance per local code and ASCE 7',
        'Geotechnical report — soil bearing capacity for raised floor + generator pad loads (1,200 lbs/sqft typical)',
        'All existing building permits confirmed — no unpermitted construction',
      ],
    },
    {
      title: 'Network & Connectivity',
      icon: Network,
      items: [
        'Carrier LOIs from ≥3 independent fiber providers confirming on-net capability and pricing',
        'Fiber route diversity map — no single point of entry or shared conduit into building',
        'Dark fiber availability confirmed from CLEC or IRU provider with pricing',
        'IX proximity: round-trip latency to nearest major IX documented (<50 miles target)',
        'Conduit entry points reviewed — capacity for planned expansion confirmed',
        'Bandwidth upgrade path confirmed with carriers for 5-year growth projections',
      ],
    },
    {
      title: 'Financial & Legal',
      icon: DollarSign,
      items: [
        'Independent third-party appraisal (as-is and as-stabilized completed)',
        'Construction budget executed by GC with GMP or cost-plus with hard cap',
        '10% construction contingency reserved separately in proforma',
        'Anchor tenant LOI or executed lease reviewed by qualified real estate counsel',
        'Development agreement with local jurisdiction executed (or term sheet)',
        '5-year operating proforma: revenue, opex, NOI, debt service schedule, DSCR sensitivity',
        'Insurance quotes received: property, business interruption, cyber liability, E&O',
        'Tax abatement agreement fully executed — or proforma underwritten entirely without it',
      ],
    },
    {
      title: 'Operations & Compliance',
      icon: Award,
      items: [
        'DCIM software vendor selected and API/integration timeline confirmed',
        'CMMS (Computerized Maintenance Management System) platform in place or contracted',
        'Staffing plan with Facilities, NOC, and security headcount and loaded cost confirmed',
        'SOC 2 Type II readiness assessment completed (or certification already in place)',
        'ISO 27001 gap analysis completed with remediation timeline',
        'Uptime Institute Tier III+ certification path confirmed with independent consultant',
        'Fire suppression system compliant with NFPA 75 standard and local AHJ approval',
        'Business Continuity and Disaster Recovery plan documented and tested (BCP/DRP)',
      ],
    },
  ]

  return (
    <div className="space-y-5">
      <p className="text-xs text-[--text-muted] leading-relaxed">
        Institutional due diligence for data center acquisition or development spans five workstreams.
        Every item below is a potential financing, insurance, or legal blocker if undiscovered before
        closing. Work through each in parallel across specialized advisors.
      </p>

      <SectionLabel>Automatic Disqualifiers — Stop If Any Are Present</SectionLabel>
      <Table
        head={['Disqualifier', 'Why It Kills The Deal']}
        rows={[
          ['Single utility feed, no redundancy path', 'Any outage = full facility down. Tier II+ co-location insurance policies specifically exclude single-feed sites.'],
          ['Site in FEMA 100-year flood plain (Zone AE/AO)', 'Business interruption insurance is prohibitively expensive or unavailable. Colocation MSAs expressly prohibit.'],
          ['Utility refuses written MW commitment', 'Phantom capacity is common. Verbal commitments have stranded hundreds of millions in development capital.'],
          ['Phase II ESA reveals recognized environmental conditions', 'EPA Superfund risk exposure + remediation cost undermine any return model.'],
          ['Zoning prohibits data center or generator use', 'Multi-year variance process with no guaranteed outcome. NIMBY opposition intensely litigated.'],
          ['Active fault within seismic setback (Zone 4)', 'Structural hardening to meet code adds $3–8M/MW — typically destroys return on acquisition.'],
          ['Title search reveals undischarged liens >5% of site value', 'Acquisition cannot close; lender will not fund over encumbered title.'],
        ]}
      />

      <SectionLabel>Detailed Checklists by Workstream</SectionLabel>
      {sections.map(s => {
        const Icon = s.icon
        return (
          <div key={s.title} className="dc-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <Icon size={14} className="text-[--accent-blue]" />
              <span className="text-xs font-bold text-[--text-primary]">{s.title}</span>
            </div>
            <div className="space-y-2">
              {s.items.map((item, i) => (
                <label key={i} className="flex gap-2.5 text-[11px] text-[--text-muted] cursor-pointer group">
                  <input type="checkbox" className="mt-0.5 accent-[--accent-blue] flex-shrink-0" />
                  <span className="group-hover:text-[--text-primary] transition-colors">{item}</span>
                </label>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function LearnPage() {
  const [activeTab, setActiveTab] = useState<Tab>('market')
  const [downloading, setDownloading] = useState(false)

  async function downloadGuide() {
    setDownloading(true)
    try {
      const res = await fetch('/api/exports/dc-guide')
      if (!res.ok) throw new Error('Export failed')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'UnyKorn-DC-Institutional-Playbook.pdf'
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="space-y-5 max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BookOpen size={15} className="text-[--accent-blue]" />
            <h1 className="text-base font-bold text-[--text-primary]">DC Institutional Playbook</h1>
          </div>
          <p className="text-xs text-[--text-muted]">
            Elite-level market intelligence, evaluation frameworks, capital strategy, and due diligence
            — everything needed to evaluate, underwrite, and close data center opportunities at an institutional standard.
          </p>
        </div>
        <button
          onClick={downloadGuide}
          disabled={downloading}
          className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-[--accent-blue] text-white rounded text-xs font-bold hover:bg-blue-600 transition-colors disabled:opacity-60"
        >
          <Download size={13} />
          {downloading ? 'Generating…' : 'Download PDF'}
        </button>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 border-b border-[--bg-border] overflow-x-auto">
        {TABS.map(tab => {
          const Icon = tab.icon
          const active = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs whitespace-nowrap border-b-2 transition-colors ${
                active
                  ? 'border-[--accent-blue] text-[--accent-blue] font-medium'
                  : 'border-transparent text-[--text-muted] hover:text-[--text-primary]'
              }`}
            >
              <Icon size={13} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab content */}
      <div>
        {activeTab === 'market'  && <MarketTab />}
        {activeTab === 'scoring' && <ScoringTab />}
        {activeTab === 'power'   && <PowerTab />}
        {activeTab === 'cooling' && <CoolingTab />}
        {activeTab === 'capital' && <CapitalTab />}
        {activeTab === 'dd'      && <DDTab />}
      </div>
    </div>
  )
}
