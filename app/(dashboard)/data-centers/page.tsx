'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Server, Zap, Shield, Activity, Cpu, ArrowRight,
  CheckCircle2, Globe, Database, Terminal, BrainCircuit,
  Radio, BarChart3, Lock, TrendingUp, Thermometer,
  Building2, Layers, Package, FileText,
} from 'lucide-react'

/* ── What runs here ─────────────────────────────────────────────────────── */
const RUNTIME_CAPS = [
  { icon: Server,       color: '#2196f3', title: 'Application Hosting',        desc: 'Core platform services, APIs, frontend delivery, backend processing' },
  { icon: BrainCircuit, color: '#8b5cf6', title: 'AI Runtime & Orchestration', desc: 'Model inference, AI agents, classification, monitoring AI systems' },
  { icon: Database,     color: '#22c55e', title: 'Treasury Infrastructure',    desc: 'Settlement rails, ledger systems, custody backend, reconciliation engines' },
  { icon: Radio,        color: '#06b6d4', title: 'Blockchain Connectors',      desc: 'On-chain registry state, digital asset rails, chain event listeners' },
  { icon: Activity,     color: '#f59e0b', title: 'Observability & Telemetry',  desc: 'Full-stack metrics, alerting systems, distributed tracing, log aggregation' },
  { icon: Terminal,     color: '#ef4444', title: 'Command Center Systems',     desc: 'Operator dashboards, exception queues, escalation workflows' },
  { icon: Lock,         color: '#8b5cf6', title: 'Secure Routing & Access',    desc: 'Zero-trust mesh, encrypted service interconnects, vault systems' },
  { icon: BarChart3,    color: '#2196f3', title: 'Reporting & Analytics',      desc: 'Portfolio analytics, investor reporting, compliance data outputs' },
]

/* ── Tier standards ─────────────────────────────────────────────────────── */
const DC_TIERS = [
  {
    tier: 'I',
    name: 'Basic',
    uptime: '99.671%',
    downtime: '28.8h/yr',
    redundancy: 'None (N)',
    color: '#6b7485',
    desc: 'Single path for power and cooling. No redundancy. Suitable for non-critical workloads only.',
  },
  {
    tier: 'II',
    name: 'Redundant',
    uptime: '99.741%',
    downtime: '22h/yr',
    redundancy: 'Partial (N+1)',
    color: '#f59e0b',
    desc: 'Redundant components but still single distribution path. Better than Tier I, still has vulnerability.',
  },
  {
    tier: 'III',
    name: 'Concurrently Maintainable',
    uptime: '99.982%',
    downtime: '1.6h/yr',
    redundancy: 'Full (N+1)',
    color: '#2196f3',
    desc: 'Multiple paths for power and cooling. No shutdown needed for maintenance. Industry standard for serious operations.',
  },
  {
    tier: 'IV',
    name: 'Fault Tolerant',
    uptime: '99.995%',
    downtime: '26min/yr',
    redundancy: '2N or 2N+1',
    color: '#22c55e',
    desc: 'Fully fault tolerant with 2N redundancy. No single point of failure. Required for mission-critical and financial infrastructure.',
  },
]

/* ── KPIs ───────────────────────────────────────────────────────────────── */
const DC_METRICS = [
  { v: '17.2 GW',  l: 'US Active IT Load' },
  { v: '2,396',    l: 'US Data Centers' },
  { v: '$500B+',   l: 'AI Infrastructure Commitment' },
  { v: '150 kW',   l: 'AI Rack Density Peak' },
  { v: '3–5×',     l: 'Demand Growth Forecast' },
  { v: '40%',      l: 'Energy from Power Systems' },
]

/* ── Platform connections ───────────────────────────────────────────────── */
const PLATFORM_CONNECTIONS = [
  { label: 'Energy Systems',  color: '#f59e0b', icon: Zap,       desc: 'Power procurement, utility agreements, renewable sourcing, energy arbitrage' },
  { label: 'Capital Layer',   color: '#8b5cf6', icon: Layers,    desc: 'SPV structuring, investor capital stacks, debt facilities, equity placement' },
  { label: 'Treasury Rails',  color: '#22c55e', icon: Database,  desc: 'Disbursement flows, settlement confirmation, reconciliation, custody' },
  { label: 'Asset Registry',  color: '#06b6d4', icon: Radio,     desc: 'Digital asset issuance, RWA tokenization, chain connector, on-chain state' },
  { label: 'AI Command',      color: '#ef4444', icon: BrainCircuit, desc: 'Operational AI, monitoring, exception management, predictive systems' },
]

/* ═══════════════════════════════════════════════════════════════════════════
   PAGE
═══════════════════════════════════════════════════════════════════════════ */
export default function DataCentersPage() {
  const [activeTier, setActiveTier] = useState<string | null>(null)

  return (
    <div className="max-w-6xl mx-auto space-y-16 pb-20">

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#090b10] to-[#0d1018] border border-white/[0.06] p-10 md:p-14">
        <div className="absolute inset-0 landing-grid opacity-20 pointer-events-none" />
        <div className="absolute right-0 top-0 w-[400px] h-[400px] rounded-full bg-blue-600/[0.06] blur-[100px] pointer-events-none" />

        <div className="relative z-10">
          <span className="section-label mb-6 inline-flex"><Server size={11} /> Infrastructure Layer</span>

          <h1 className="mt-4 text-3xl md:text-5xl font-black text-white leading-tight tracking-tight">
            Data Center Infrastructure<br />
            <span className="gradient-text">for Digital Execution</span>
          </h1>
          <p className="mt-5 max-w-2xl text-[#7c8494] text-sm leading-relaxed">
            Data centers occupy two distinct roles in the UnyKorn system: they are the physical and digital
            backbone on which the platform runs, and they represent a distinct infrastructure asset class
            that the platform can analyze, capitalize, and operate.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/documents"
              className="cta-primary flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-white">
              <FileText size={15} /> Submit Project Documents
            </Link>
            <Link href="/resources"
              className="glass glass-hover flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-white border border-white/[0.08]">
              <Package size={15} /> Download Resources
            </Link>
          </div>
        </div>
      </div>

      {/* ── MARKET METRICS ───────────────────────────────────────────────── */}
      <div>
        <h2 className="text-lg font-bold text-white mb-1">Market Context</h2>
        <p className="text-xs text-[#4a5068] mb-6">The scale and trajectory of digital infrastructure demand</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {DC_METRICS.map(m => (
            <div key={m.l} className="glass rounded-xl p-4 text-center">
              <div className="font-mono font-bold text-xl text-white">{m.v}</div>
              <div className="text-[10px] text-[#4a5068] uppercase tracking-wide mt-1 leading-snug">{m.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── WHY IT MATTERS ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <span className="section-label mb-5 inline-flex"><Globe size={11} /> Why It Matters</span>
          <h2 className="mt-4 text-2xl md:text-3xl font-bold text-white leading-tight">
            Execution Happens Here
          </h2>
          <p className="mt-4 text-[#7c8494] text-sm leading-relaxed">
            Every treasury transaction, AI classification, investor report, and on-chain event that
            flows through UnyKorn is processed, stored, or routed through data center infrastructure.
            There is no platform without the physical layer behind it.
          </p>
          <p className="mt-3 text-[#7c8494] text-sm leading-relaxed">
            The current AI-driven infrastructure buildout — Stargate, Blackwell GPU clusters, hyperscale
            AI factories — is creating a massive structural demand for power, cooling, connectivity, and
            control systems. This is the market UnyKorn operates in and for.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: Activity, color: '#22c55e', title: 'Uptime & SLA',     desc: 'Mission-critical uptime guarantees and contractual SLA management' },
            { icon: Shield,   color: '#2196f3', title: 'Physical Security', desc: 'CCTV, biometrics, mantrap access, perimeter control systems' },
            { icon: Zap,      color: '#f59e0b', title: 'Power Certainty',  desc: 'Utility feeds, generators, UPS systems, load management' },
            { icon: Lock,     color: '#8b5cf6', title: 'Data Sovereignty', desc: 'Jurisdiction control, data residency, audit access, compliance' },
          ].map(item => {
            const Icon = item.icon
            return (
              <div key={item.title} className="glass rounded-2xl p-5 flex flex-col gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: `${item.color}18`, border: `1px solid ${item.color}2a` }}>
                  <Icon size={17} style={{ color: item.color }} />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">{item.title}</div>
                  <div className="text-[11px] text-[#4a5068] mt-1 leading-snug">{item.desc}</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── WHAT RUNS HERE ───────────────────────────────────────────────── */}
      <div>
        <span className="section-label mb-5 inline-flex"><Terminal size={11} /> What Runs Here</span>
        <h2 className="mt-4 text-2xl font-bold text-white mb-2">
          Eight Capability Domains
        </h2>
        <p className="text-xs text-[#4a5068] mb-8">The systems and services deployed within UnyKorn infrastructure</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {RUNTIME_CAPS.map(cap => {
            const Icon = cap.icon
            return (
              <div key={cap.title} className="glass glass-hover rounded-2xl p-5 flex flex-col gap-3 group">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: `${cap.color}15`, border: `1px solid ${cap.color}28` }}>
                  <Icon size={17} style={{ color: cap.color }} />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white leading-tight group-hover:text-blue-200 transition-colors">
                    {cap.title}
                  </div>
                  <div className="text-[11px] text-[#4a5068] mt-1.5 leading-snug">{cap.desc}</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── TIER STANDARDS ───────────────────────────────────────────────── */}
      <div>
        <span className="section-label mb-5 inline-flex"><Cpu size={11} /> Uptime Institute Tier Standards</span>
        <h2 className="mt-4 text-2xl font-bold text-white mb-2">Infrastructure Classification</h2>
        <p className="text-xs text-[#4a5068] mb-8">
          The Uptime Institute Tier Certification classifies data centers I–IV by redundancy, uptime guarantee, and fault tolerance.
          UnyKorn infrastrucure targets Tier III and Tier IV facilities only.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {DC_TIERS.map(t => (
            <button
              key={t.tier}
              onClick={() => setActiveTier(activeTier === t.tier ? null : t.tier)}
              className={`glass glass-hover rounded-2xl p-5 text-left flex flex-col gap-3 transition-all ${
                activeTier === t.tier ? 'border-[var(--tc)]' : ''
              }`}
              style={{ '--tc': t.color } as React.CSSProperties}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center font-mono font-black text-lg"
                  style={{ background: `${t.color}18`, color: t.color, border: `1px solid ${t.color}30` }}>
                  {t.tier}
                </div>
                <div>
                  <div className="text-xs font-bold text-white">{t.name}</div>
                  <div className="text-[10px] text-[#4a5068]">Tier {t.tier}</div>
                </div>
              </div>
              <div className="flex gap-3 text-[10px]">
                <div>
                  <div className="text-[#4a5068]">Uptime</div>
                  <div className="font-mono font-semibold text-white">{t.uptime}</div>
                </div>
                <div>
                  <div className="text-[#4a5068]">Downtime</div>
                  <div className="font-mono font-semibold text-white">{t.downtime}</div>
                </div>
              </div>
              <div className="text-[10px] px-2 py-0.5 rounded-full w-fit font-medium"
                style={{ background: `${t.color}18`, color: t.color }}>
                {t.redundancy}
              </div>
              {activeTier === t.tier && (
                <p className="text-[11px] text-[#7c8494] leading-relaxed border-t border-white/[0.05] pt-3 mt-1">
                  {t.desc}
                </p>
              )}
            </button>
          ))}
        </div>
        <p className="mt-4 text-[11px] text-[#3a4058]">Click any tier to expand details</p>
      </div>

      {/* ── PLATFORM CONNECTIONS ─────────────────────────────────────────── */}
      <div>
        <span className="section-label mb-5 inline-flex"><TrendingUp size={11} /> Platform Integration</span>
        <h2 className="mt-4 text-2xl font-bold text-white mb-2">
          How the DC Layer Connects to the OS
        </h2>
        <p className="text-xs text-[#4a5068] mb-8">
          Data center infrastructure is the runtime environment for five interconnected platform layers
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {PLATFORM_CONNECTIONS.map(pc => {
            const Icon = pc.icon
            return (
              <div key={pc.label} className="glass glass-hover rounded-2xl p-5 flex flex-col gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: `${pc.color}15`, border: `1px solid ${pc.color}28` }}>
                  <Icon size={16} style={{ color: pc.color }} />
                </div>
                <div className="text-xs font-bold text-white">{pc.label}</div>
                <div className="text-[11px] text-[#4a5068] leading-snug">{pc.desc}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── CTA ─────────────────────────────────────────────────────────── */}
      <div className="glass rounded-3xl p-10 text-center relative overflow-hidden">
        <div className="absolute inset-0 landing-grid opacity-20 pointer-events-none" />
        <div className="relative z-10">
          <h2 className="text-2xl font-bold text-white mb-3">Ready to Connect Your Infrastructure?</h2>
          <p className="text-[#7c8494] text-sm max-w-xl mx-auto mb-8 leading-relaxed">
            Whether you have an existing facility to optimize, a site under development, or a capital position
            to deploy into infrastructure — submit your documents and we will route your situation to the
            appropriate system.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/documents"
              className="cta-primary flex items-center gap-2.5 px-8 py-3.5 rounded-xl font-bold text-sm text-white">
              <FileText size={16} /> Submit Documents
            </Link>
            <Link href="/resources"
              className="glass glass-hover flex items-center gap-2.5 px-8 py-3.5 rounded-xl font-semibold text-sm text-white border border-white/[0.08]">
              <Package size={16} /> View Resources
            </Link>
          </div>
        </div>
      </div>

    </div>
  )
}
