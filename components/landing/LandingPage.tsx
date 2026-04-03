'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import {
  ArrowRight, Server, Activity, Globe,
  CheckCircle2, TrendingUp, Database, Layers, Building2,
  ChevronDown, BarChart3, Lock, BrainCircuit,
  Terminal, Radio, Package, FileText, Play, Headphones,
} from 'lucide-react'
import { useAudio, TOUR_SEGMENTS } from '@/components/audio/DataCenterAudio'

/* ── Video backgrounds (largest/best-quality files) ──────────────────────── */
const HERO_VIDEOS = [
  '/videos/dc-bg-37.mp4',
  '/videos/dc-bg-19.mp4',
  '/videos/dc-bg-21.mp4',
  '/videos/dc-bg-16.mp4',
]

/* ── Four pillars of the OS ──────────────────────────────────────────────── */
const OS_PILLARS = [
  {
    step: '01',
    title: 'Develop',
    color: '#2196f3',
    icon: Building2,
    desc: 'Project intake, technical diligence, site underwriting, and infrastructure readiness assessment.',
    items: ['Site sourcing & qualification', 'Technical scoring engine', 'Power & connectivity audit', 'Risk assessment'],
  },
  {
    step: '02',
    title: 'Capitalize',
    color: '#8b5cf6',
    icon: Layers,
    desc: 'SPV architecture, investor structures, compliant capital formation, and digital asset issuance.',
    items: ['SPV & entity structuring', 'Capital stack modeling', 'Investor allocation systems', 'RWA issuance frameworks'],
  },
  {
    step: '03',
    title: 'Settle',
    color: '#22c55e',
    icon: Database,
    desc: 'Treasury control, milestone-based disbursements, distributions, and financial reconciliation.',
    items: ['Treasury & disbursement rails', 'Milestone-triggered settlements', 'Multi-currency operations', 'Audit-grade reconciliation'],
  },
  {
    step: '04',
    title: 'Command',
    color: '#f59e0b',
    icon: Terminal,
    desc: 'AI-driven monitoring, portfolio reporting, exception handling, and operational oversight.',
    items: ['AI monitoring systems', 'Portfolio dashboards', 'Real-time alerting', 'Performance reporting'],
  },
]

/* ── What runs in UnyKorn DC infrastructure ─────────────────────────────── */
const DC_CAPABILITIES = [
  { icon: Server,       label: 'Application Hosting',       color: '#2196f3', desc: 'Platform services, APIs, and backend systems' },
  { icon: BrainCircuit, label: 'AI Runtime',                color: '#8b5cf6', desc: 'Model inference, agents, monitoring AI' },
  { icon: Database,     label: 'Treasury Infrastructure',   color: '#22c55e', desc: 'Settlement rails, ledger systems, custody backend' },
  { icon: Radio,        label: 'Blockchain Connectors',     color: '#06b6d4', desc: 'Registry, chain state, digital asset rails' },
  { icon: Activity,     label: 'Observability & Telemetry', color: '#f59e0b', desc: 'Full-stack monitoring, metrics, alerting' },
  { icon: Terminal,     label: 'Command Center Systems',    color: '#ef4444', desc: 'Operator dashboards, exception queues' },
  { icon: Lock,         label: 'Secure Routing & Control',  color: '#8b5cf6', desc: 'Zero-trust access, encrypted service mesh' },
  { icon: BarChart3,    label: 'Reporting Engines',         color: '#2196f3', desc: 'Portfolio analytics, compliance outputs' },
]

/* ── DC market metrics ───────────────────────────────────────────────────── */
const DC_STATS = [
  { v: '17.2 GW',  l: 'US Active IT Capacity' },
  { v: '2,396',    l: 'US Data Centers' },
  { v: '$500B',    l: 'Stargate AI Buildout' },
  { v: '150 kW',   l: 'AI Rack Density Peak' },
]

/* ── Platform entry points ───────────────────────────────────────────────── */
const PLATFORM_LINKS = [
  { label: 'Infrastructure Pipeline',  href: '/pipeline',      icon: BarChart3,    desc: 'Track sites from intake to operation' },
  { label: 'Data Centers',             href: '/data-centers',  icon: Server,       desc: 'The execution backbone & asset class' },
  { label: 'Submit Documents',         href: '/documents',     icon: FileText,     desc: 'Send project materials for review' },
  { label: 'Resources & Research',     href: '/resources',     icon: Package,      desc: 'UnyKorn frameworks and white papers' },
  { label: 'Site Evaluation',          href: '/sourcing',      icon: Globe,        desc: 'AI-powered scoring engine' },
  { label: 'Talk to Advisor',          href: '/qualify',                 icon: BrainCircuit, desc: 'Institutional qualification interview' },
]

/* ════════════════════════════════════════════════════════════════════════════
   COMPONENT
════════════════════════════════════════════════════════════════════════════ */
export function LandingPage() {
  const [videoIdx, setVideoIdx] = useState(0)
  const [videoLoaded, setVideoLoaded] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const { start, stop, isPlaying, hasStarted, currentTitle, currentChapter } = useAudio()

  /* Cycle videos every 18 s */
  useEffect(() => {
    const t = setInterval(() => {
      setVideoIdx(i => (i + 1) % HERO_VIDEOS.length)
      setVideoLoaded(false)
    }, 18000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load()
      videoRef.current.play().catch(() => {})
    }
  }, [videoIdx])

  return (
    <div className="min-h-screen bg-[#050709] text-[#e8eaf0] overflow-x-hidden">

      {/* ── TOP NAV ──────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 inset-x-0 z-50 glass border-b border-white/[0.05]">
        <div className="max-w-7xl mx-auto px-5 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white font-black text-sm">
              U
            </div>
            <div>
              <span className="font-mono font-bold text-sm tracking-widest text-white">UNYKORN</span>
              <span className="text-blue-400 text-sm">·OS</span>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-7 text-xs text-[#6b7485] font-medium">
            <a href="#os"    className="hover:text-white transition-colors">Platform</a>
            <a href="#dc"    className="hover:text-white transition-colors">Data Centers</a>
            <a href="#enter" className="hover:text-white transition-colors">Enter</a>
          </div>
          <div className="flex items-center gap-3">
            {!hasStarted ? (
              <button
                onClick={start}
                className="hidden sm:flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300 transition-colors px-3 py-1.5 rounded-lg border border-blue-500/20 hover:border-blue-500/40"
              >
                <Headphones size={13} /> Audio Tour
              </button>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <span className="flex items-center gap-2 text-xs text-blue-400 px-3 py-1.5">
                  <span className="audio-playing-dot w-1.5 h-1.5 rounded-full bg-blue-400" />
                  Ch.{currentChapter} — {currentTitle}
                </span>
                <button
                  onClick={stop}
                  className="text-[10px] text-[#4a5068] hover:text-red-400 transition-colors px-2 py-1 rounded border border-white/[0.06] hover:border-red-500/30"
                  title="Stop audio tour"
                >
                  Stop
                </button>
              </div>
            )}
            <Link href="/"
              className="cta-primary text-xs font-semibold text-white px-4 py-2 rounded-lg flex items-center gap-1.5">
              Enter Platform <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </nav>

      {/* ════════════════════════════════════════════════════════════════════
          HERO
      ════════════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Video */}
        <video
          ref={videoRef}
          key={videoIdx}
          autoPlay
          muted
          playsInline
          onCanPlay={() => setVideoLoaded(true)}
          onEnded={() => setVideoIdx(i => (i + 1) % HERO_VIDEOS.length)}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-[2000ms] ${videoLoaded ? 'opacity-100' : 'opacity-0'}`}
        >
          <source src={HERO_VIDEOS[videoIdx]} type="video/mp4" />
        </video>

        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#050709]/70 via-[#050709]/55 to-[#050709]/90" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050709]/60 via-transparent to-[#050709]/60" />
        <div className="absolute inset-0 landing-grid opacity-30 pointer-events-none" />
        <div className="absolute inset-0 scanline-overlay pointer-events-none" />

        {/* Ambient orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="animate-orb   absolute top-[20%] left-[8%]  w-[500px] h-[500px] rounded-full bg-blue-600/[0.08]   blur-[140px]" />
          <div className="animate-orb-2 absolute top-[50%] right-[5%] w-[400px] h-[400px] rounded-full bg-violet-600/[0.07] blur-[120px]" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-5 text-center pt-28 pb-24">
          <div className="animate-fade-up mb-8" style={{ animationDelay: '0.1s' }}>
            <span className="section-label inline-flex">
              <Activity size={11} /> Infrastructure Operating System · 2026
            </span>
          </div>

          <h1 className="animate-fade-up text-[clamp(3rem,7vw,6rem)] font-black leading-[1.0] tracking-[-0.02em]"
              style={{ animationDelay: '0.2s' }}>
            <span className="gradient-text">UnyKorn</span>
          </h1>
          <h2 className="animate-fade-up mt-4 text-[clamp(1.1rem,2.5vw,2rem)] font-light text-white/80 leading-tight tracking-wide"
              style={{ animationDelay: '0.3s' }}>
            The Operating System for Energy<br className="hidden sm:block" /> and Infrastructure Assets
          </h2>

          <p className="animate-fade-up mt-6 max-w-2xl mx-auto text-[clamp(0.85rem,1.4vw,1.05rem)] text-[#7c8494] leading-relaxed"
             style={{ animationDelay: '0.45s' }}>
            From project intake and capital formation through treasury settlement,
            digital asset structuring, and operational command — built for principals
            who operate at the infrastructure level.
          </p>

          {/* Stats */}
          <div className="animate-fade-up mt-10 flex flex-wrap justify-center gap-3"
               style={{ animationDelay: '0.55s' }}>
            {DC_STATS.map(s => (
              <div key={s.l} className="stat-card rounded-xl px-5 py-3 flex flex-col items-center gap-0.5">
                <div className="font-mono font-bold text-lg text-white">{s.v}</div>
                <div className="text-[10px] text-[#4a5068] uppercase tracking-wide">{s.l}</div>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div className="animate-fade-up mt-10 flex flex-wrap justify-center gap-4"
               style={{ animationDelay: '0.7s' }}>
            <Link href="/"
              className="cta-primary flex items-center gap-2.5 px-8 py-3.5 rounded-xl font-bold text-sm text-white">
              <Server size={16} /> Enter the Platform
            </Link>
            {!hasStarted ? (
              <button
                onClick={start}
                className="glass glass-hover flex items-center gap-2.5 px-8 py-3.5 rounded-xl font-semibold text-sm text-white border border-white/[0.08]">
                <Headphones size={16} className="text-blue-400" /> Start Audio Tour
              </button>
            ) : (
              <button
                onClick={stop}
                className="glass glass-hover flex items-center gap-2.5 px-8 py-3.5 rounded-xl font-semibold text-sm text-red-400 border border-red-500/20 hover:border-red-500/40">
                <Headphones size={16} /> Stop Audio Tour
              </button>
            )}
          </div>

          <a href="#os"
             className="animate-fade-up mt-16 inline-flex flex-col items-center gap-2 text-[#3a4058] hover:text-[#7c8494] transition-colors"
             style={{ animationDelay: '0.9s' }}>
            <span className="text-[9px] uppercase tracking-[0.2em]">Scroll to explore</span>
            <ChevronDown size={16} className="animate-bounce" />
          </a>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          OS PILLARS
      ════════════════════════════════════════════════════════════════════ */}
      <section id="os" className="py-28 px-5 relative">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
        </div>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="section-label mb-5 inline-flex"><Globe size={11} /> Infrastructure OS</span>
            <h2 className="mt-4 text-3xl md:text-4xl font-bold text-white">
              Four Functions. One System.
            </h2>
            <p className="mt-3 text-[#7c8494] max-w-xl mx-auto text-sm leading-relaxed">
              UnyKorn manages the complete infrastructure lifecycle — from first diligence
              through capital formation, settlement, and ongoing command operations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-px bg-white/[0.04] rounded-2xl overflow-hidden">
            {OS_PILLARS.map((p) => {
              const Icon = p.icon
              return (
                <div key={p.step}
                  className="bg-[#0a0c0f] p-7 flex flex-col gap-5 hover:bg-[#0e1014] transition-colors group">
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: `${p.color}15`, border: `1px solid ${p.color}28` }}>
                      <Icon size={19} style={{ color: p.color }} />
                    </div>
                    <span className="font-mono text-[11px] tracking-widest"
                      style={{ color: `${p.color}60` }}>{p.step}</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-white/90 transition-colors">{p.title}</h3>
                    <p className="mt-2 text-xs text-[#6b7485] leading-relaxed">{p.desc}</p>
                  </div>
                  <ul className="space-y-2 mt-auto">
                    {p.items.map(item => (
                      <li key={item} className="flex items-start gap-2 text-xs text-[#4a5068]">
                        <CheckCircle2 size={12} className="mt-0.5 flex-shrink-0" style={{ color: `${p.color}80` }} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          DATA CENTER SECTION
      ════════════════════════════════════════════════════════════════════ */}
      <section id="dc" className="py-28 px-5 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-violet-500/20 to-transparent" />
          <div className="absolute right-[-15%] top-[10%] w-[500px] h-[500px] rounded-full bg-violet-700/[0.05] blur-[120px]" />
          <div className="absolute left-[-10%] bottom-[10%] w-[400px] h-[400px] rounded-full bg-blue-700/[0.05] blur-[100px]" />
        </div>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
            <div>
              <span className="section-label mb-5 inline-flex"><Server size={11} /> Data Center Layer</span>
              <h2 className="mt-4 text-3xl md:text-4xl font-bold text-white leading-tight">
                The Digital Backbone<br />
                <span className="gradient-text-static">Powering the Platform</span>
              </h2>
              <p className="mt-5 text-[#7c8494] text-sm leading-relaxed">
                Data centers are not an IT conversation. They are the physical and digital
                execution backbone behind every treasury operation, AI workflow, blockchain
                connector, and command system that UnyKorn runs. And they are a strategic
                asset class the platform can finance, structure, and operate.
              </p>
              <p className="mt-4 text-[#7c8494] text-sm leading-relaxed">
                Serious infrastructure businesses require secure runtime environments,
                resilient service architecture, high-visibility monitoring, and controlled
                backend execution. That is what data center infrastructure provides — and
                that is what UnyKorn operates.
              </p>
              <Link href="/data-centers"
                className="mt-8 inline-flex items-center gap-2.5 cta-primary text-sm font-semibold text-white px-6 py-3 rounded-xl">
                Explore the DC Layer <ArrowRight size={14} />
              </Link>
            </div>

            <div className="space-y-4">
              {[
                {
                  badge: 'Operational Backbone',
                  color: '#2196f3',
                  title: 'The platform runs here',
                  items: [
                    'Compute, hosting, application services',
                    'AI runtimes and orchestration',
                    'Treasury and settlement backend',
                    'Blockchain registry connectors',
                    'Full-stack observability and monitoring',
                    'Command center infrastructure',
                  ],
                },
                {
                  badge: 'Infrastructure Asset Class',
                  color: '#8b5cf6',
                  title: 'A category UnyKorn can support',
                  items: [
                    'Infrastructure intelligence and diligence',
                    'Capital structuring and formation',
                    'Treasury workflows and controls',
                    'Digital asset and RWA frameworks',
                    'Energy and power integration',
                    'Operational monitoring and command',
                  ],
                },
              ].map(role => (
                <div key={role.badge} className="glass rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full"
                      style={{ background: `${role.color}18`, color: role.color, border: `1px solid ${role.color}30` }}>
                      {role.badge}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-white mb-3">{role.title}</h4>
                  <div className="grid grid-cols-2 gap-1.5">
                    {role.items.map(item => (
                      <div key={item} className="flex items-start gap-2 text-xs text-[#6b7485]">
                        <div className="w-1 h-1 rounded-full mt-1.5 flex-shrink-0" style={{ background: role.color }} />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-bold text-white mb-1">What Runs in UnyKorn Infrastructure</h3>
            <p className="text-xs text-[#4a5068]">Eight capability domains behind the platform</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {DC_CAPABILITIES.map(cap => {
              const Icon = cap.icon
              return (
                <div key={cap.label} className="glass glass-hover rounded-xl p-4 flex flex-col gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: `${cap.color}15`, border: `1px solid ${cap.color}25` }}>
                    <Icon size={16} style={{ color: cap.color }} />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white leading-tight">{cap.label}</div>
                    <div className="text-[11px] text-[#4a5068] mt-1 leading-snug">{cap.desc}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          AUDIO TOUR
      ════════════════════════════════════════════════════════════════════ */}
      <section className="py-20 px-5 relative">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-500/15 to-transparent" />
        </div>
        <div className="max-w-4xl mx-auto">
          <div className="glass rounded-3xl p-10 text-center relative overflow-hidden">
            <div className="absolute inset-0 landing-grid opacity-20 pointer-events-none" />
            <div className="relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-blue-500/15 border border-blue-500/25 flex items-center justify-center mx-auto mb-6">
                <Headphones size={28} className="text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">Audio Tour — 7 Chapters</h2>
              <p className="text-[#7c8494] text-sm max-w-xl mx-auto leading-relaxed mb-8">
                A narrated guide through data center infrastructure, the UnyKorn platform,
                market context, and how it all connects. Start here if you want to understand
                exactly what this platform is built for.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-8 text-left max-w-xl mx-auto">
                {TOUR_SEGMENTS.map(seg => (
                  <div key={seg.id} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/[0.025]">
                    <span className="font-mono text-[9px] text-blue-400/60 tracking-widest w-4">{seg.chapter}</span>
                    <span className="text-xs text-[#6b7485]">{seg.title}</span>
                  </div>
                ))}
              </div>
              <button onClick={start}
                className="cta-primary inline-flex items-center gap-3 px-8 py-4 rounded-xl font-bold text-sm text-white">
                <Play size={16} /> Start Guided Audio Tour
              </button>
              <p className="mt-4 text-[10px] text-[#3a4058] uppercase tracking-widest">
                Uses browser speech synthesis · can be paused or skipped at any time
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          PLATFORM ENTRY POINTS
      ════════════════════════════════════════════════════════════════════ */}
      <section id="enter" className="py-28 px-5 relative">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="section-label mb-5 inline-flex"><TrendingUp size={11} /> Platform Access</span>
            <h2 className="mt-4 text-3xl md:text-4xl font-bold text-white">Where You Need to Go</h2>
            <p className="mt-3 text-[#7c8494] max-w-xl mx-auto text-sm leading-relaxed">
              Six core entry points. Institutional principals start with documents or the advisor.
              Capital partners go directly to the pipeline.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {PLATFORM_LINKS.map((link, i) => {
              const Icon = link.icon
              const emphasis = i < 2
              return (
                <Link key={link.href} href={link.href}
                  className={`glass glass-hover rounded-2xl p-6 flex flex-col gap-4 group transition-all ${emphasis ? 'border-blue-500/20 hover:border-blue-500/40' : ''}`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${emphasis ? 'bg-blue-500/15 border border-blue-500/25' : 'bg-white/[0.04] border border-white/[0.06]'}`}>
                    <Icon size={18} className={emphasis ? 'text-blue-400' : 'text-[#6b7485] group-hover:text-white'} />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white group-hover:text-blue-200 transition-colors">{link.label}</div>
                    <div className="text-xs text-[#4a5068] mt-1 leading-snug">{link.desc}</div>
                  </div>
                  <ArrowRight size={14} className="text-[#3a4058] group-hover:text-blue-400 transition-colors mt-auto" />
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/[0.05] py-8 px-5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white font-black text-[10px]">U</div>
            <span className="font-mono text-xs text-[#4a5068] tracking-widest">UNYKORN · INFRASTRUCTURE OS</span>
          </div>
          <div className="text-[10px] text-[#2a3048] uppercase tracking-widest">
            Institutional Use Only · Qualified Principals · © 2026 UnyKorn
          </div>
        </div>
      </footer>

    </div>
  )
}
