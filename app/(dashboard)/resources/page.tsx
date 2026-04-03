'use client'

import { useState } from 'react'
import {
  Package, FileText, Download, ArrowRight,
  Building2, Database, Layers, BrainCircuit,
  Zap, Server, Shield, Globe, Mail,
} from 'lucide-react'

const CATEGORIES = ['All', 'Infrastructure', 'Capital', 'Treasury', 'Technology', 'Energy']

const RESOURCES = [
  {
    id: 'infra-os',
    category: 'Infrastructure',
    badge: 'Overview',
    badgeColor: '#2196f3',
    icon: Server,
    iconColor: '#2196f3',
    title: 'UnyKorn Infrastructure OS — Platform Overview',
    desc: 'A full overview of the UnyKorn operating system: what it does, how it works, the four functions (Develop, Capitalize, Settle, Command), and the market it operates in.',
    pages: '24 pages',
    format: 'PDF',
    available: true,
  },
  {
    id: 'dc-asset',
    category: 'Infrastructure',
    badge: 'Asset Class',
    badgeColor: '#2196f3',
    icon: Building2,
    iconColor: '#2196f3',
    title: 'Data Center as an Asset Class — Investment Framework',
    desc: 'How data center infrastructure is underwritten, capitalized, and valued as an institutional asset. Tier classifications, power analysis, yield expectations, demand drivers.',
    pages: '32 pages',
    format: 'PDF',
    available: true,
  },
  {
    id: 'energy-integration',
    category: 'Energy',
    badge: 'Energy',
    badgeColor: '#f59e0b',
    icon: Zap,
    iconColor: '#f59e0b',
    title: 'Energy & Power Systems Integration Guide',
    desc: 'Power procurement, utility interconnection, PPA structures, renewable energy credits, grid arbitrage, and energy cost modeling for infrastructure projects.',
    pages: '18 pages',
    format: 'PDF',
    available: true,
  },
  {
    id: 'capital-formation',
    category: 'Capital',
    badge: 'Capital',
    badgeColor: '#8b5cf6',
    icon: Layers,
    iconColor: '#8b5cf6',
    title: 'Capital Formation Framework — SPV & Structuring Guide',
    desc: 'How UnyKorn approaches SPV architecture, investor capital stacks, debt facilities, equity placement, and compliant capital formation for infrastructure assets.',
    pages: '28 pages',
    format: 'PDF',
    available: true,
  },
  {
    id: 'treasury-rails',
    category: 'Treasury',
    badge: 'Treasury',
    badgeColor: '#22c55e',
    icon: Database,
    iconColor: '#22c55e',
    title: 'Treasury & Settlement Integration — Technical Reference',
    desc: 'How the UnyKorn treasury layer works: milestone-based disbursements, multi-currency settlement, reconciliation systems, custody backend, and audit trails.',
    pages: '20 pages',
    format: 'PDF',
    available: true,
  },
  {
    id: 'rwa-tokenization',
    category: 'Capital',
    badge: 'Digital Assets',
    badgeColor: '#06b6d4',
    icon: Globe,
    iconColor: '#06b6d4',
    title: 'RWA Tokenization — Real World Assets on Chain',
    desc: 'UnyKorn\'s approach to real-world asset tokenization: what qualifies, how infrastructure assets are represented on chain, compliance frameworks, and investor access structures.',
    pages: '22 pages',
    format: 'PDF',
    available: true,
  },
  {
    id: 'ai-command',
    category: 'Technology',
    badge: 'AI Systems',
    badgeColor: '#ef4444',
    icon: BrainCircuit,
    iconColor: '#ef4444',
    title: 'AI Command Systems — Operational Intelligence Overview',
    desc: 'How AI is used within the UnyKorn platform: monitoring agents, classification systems, anomaly detection, portfolio oversight, and predictive infrastructure management.',
    pages: '16 pages',
    format: 'PDF',
    available: false,
  },
  {
    id: 'underwriting',
    category: 'Infrastructure',
    badge: 'Diligence',
    badgeColor: '#2196f3',
    icon: Shield,
    iconColor: '#2196f3',
    title: 'Infrastructure Underwriting Standards — Site Evaluation Guide',
    desc: 'UnyKorn\'s technical scoring framework for data center and energy asset evaluation: power, connectivity, cooling, jurisdiction, risk, and strategic value assessment.',
    pages: '26 pages',
    format: 'PDF',
    available: false,
  },
]

export default function ResourcesPage() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [requested, setRequested] = useState<Set<string>>(new Set())

  const filtered = activeCategory === 'All'
    ? RESOURCES
    : RESOURCES.filter(r => r.category === activeCategory)

  function handleRequest(id: string) {
    setRequested(prev => new Set(prev).add(id))
  }

  return (
    <div className="max-w-6xl mx-auto pb-20 space-y-10">

      {/* Header */}
      <div>
        <span className="section-label mb-5 inline-flex"><Package size={11} /> Resources</span>
        <h1 className="mt-4 text-2xl md:text-3xl font-bold text-white">
          Institutional Research & Frameworks
        </h1>
        <p className="mt-3 text-[#7c8494] text-sm leading-relaxed max-w-2xl">
          UnyKorn publishes institutional-grade documentation on infrastructure investment, capital formation,
          treasury integration, and platform operations. Request any document below — our team will send it
          directly to your inbox.
        </p>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`text-xs font-medium px-4 py-2 rounded-full border transition-all ${
              activeCategory === cat
                ? 'bg-blue-500/15 border-blue-500/35 text-blue-300'
                : 'border-white/[0.07] bg-white/[0.02] text-[#6b7485] hover:border-white/[0.14] hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Resource grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(r => {
          const Icon = r.icon
          const isRequested = requested.has(r.id)

          return (
            <div key={r.id} className={`glass rounded-2xl p-6 flex flex-col gap-4 ${!r.available ? 'opacity-60' : ''}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${r.iconColor}15`, border: `1px solid ${r.iconColor}28` }}>
                    <Icon size={18} style={{ color: r.iconColor }} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
                        style={{ background: `${r.badgeColor}18`, color: r.badgeColor, border: `1px solid ${r.badgeColor}25` }}>
                        {r.badge}
                      </span>
                      <span className="text-[10px] text-[#3a4058] flex items-center gap-1">
                        <FileText size={9} /> {r.pages} · {r.format}
                      </span>
                      {!r.available && (
                        <span className="text-[10px] text-[#4a5068] border border-white/[0.06] rounded-full px-2 py-0.5">
                          Coming Soon
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-semibold text-white leading-snug">{r.title}</h3>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-[#6b7485] leading-relaxed">{r.desc}</p>

              <div className="mt-auto">
                {r.available ? (
                  isRequested ? (
                    <div className="flex items-center gap-2 text-xs text-green-400">
                      <div className="w-4 h-4 rounded-full bg-green-500/20 flex items-center justify-center">
                        <span className="text-[8px]">✓</span>
                      </div>
                      Request received — check your inbox shortly
                    </div>
                  ) : (
                    <button
                      onClick={() => handleRequest(r.id)}
                      className="flex items-center gap-2 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors group"
                    >
                      <Download size={13} />
                      Request Document
                      <ArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  )
                ) : (
                  <span className="text-xs text-[#3a4058]">Available Q3 2026</span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Custom request CTA */}
      <div className="glass rounded-3xl p-10 relative overflow-hidden">
        <div className="absolute inset-0 landing-grid opacity-15 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/25 flex items-center justify-center">
                <Mail size={18} className="text-blue-400" />
              </div>
              <h2 className="text-lg font-bold text-white">Need something specific?</h2>
            </div>
            <p className="text-[#7c8494] text-sm max-w-md leading-relaxed">
              If you need a customized briefing, a specific data set, or materials tailored to your
              project type — reach out directly. We produce custom research packages for qualified
              institutional principals.
            </p>
          </div>
          <div className="flex flex-col gap-3 flex-shrink-0">
            <a href="mailto:research@unykorn.com"
              className="cta-primary flex items-center gap-2.5 px-6 py-3 rounded-xl font-semibold text-sm text-white whitespace-nowrap">
              <Mail size={15} /> Request Custom Package
            </a>
            <a href="/documents"
              className="glass glass-hover flex items-center gap-2.5 px-6 py-3 rounded-xl font-semibold text-sm text-white border border-white/[0.08] whitespace-nowrap">
              <FileText size={15} /> Submit Project Documents
            </a>
          </div>
        </div>
      </div>

    </div>
  )
}
