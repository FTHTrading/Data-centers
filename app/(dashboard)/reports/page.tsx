'use client'

import { useState, useEffect } from 'react'
import { FileText, Table, Code, BookOpen, Search, Download, ChevronDown } from 'lucide-react'

interface SiteBrief { id: string; name: string; location: string; status: string }

export default function ReportsPage() {
  const [sites, setSites] = useState<SiteBrief[]>([])
  const [siteId, setSiteId] = useState('')
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState<string | null>(null)

  // Load site list
  useEffect(() => {
    fetch('/api/sites?limit=100')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.sites) setSites(data.sites)
      })
      .catch(() => {})
  }, [])

  const selectedSite = sites.find(s => s.id === siteId)

  const filtered = sites.filter(s =>
    !query.trim() || s.name.toLowerCase().includes(query.toLowerCase()) || s.location.toLowerCase().includes(query.toLowerCase())
  )

  async function download(type: 'executive-pdf' | 'technical-pdf' | 'xlsx' | 'json' | 'dc-guide') {
    if (type !== 'dc-guide' && !siteId.trim()) return
    setLoading(type)
    try {
      const url = type === 'dc-guide'
        ? '/api/exports/dc-guide'
        : `/api/exports/${type}?siteId=${encodeURIComponent(siteId.trim())}`
      const res = await fetch(url)
      if (!res.ok) { alert('Export failed — please try again.'); return }
      const blob = await res.blob()
      const objUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = objUrl
      a.download = type === 'dc-guide'
        ? 'UnyKorn-DC-Institutional-Playbook.pdf'
        : `unykorn-${type}-${siteId.slice(0, 8)}.${type.includes('pdf') ? 'pdf' : type === 'xlsx' ? 'xlsx' : 'json'}`
      a.click()
      URL.revokeObjectURL(objUrl)
    } finally {
      setLoading(null)
    }
  }

  const isLoading = (t: string) => loading === t

  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <h1 className="text-base font-bold text-[--text-primary]">Reports & Exports</h1>
        <p className="text-xs text-[--text-muted]">Generate PDF memos, Excel workbooks, and JSON data packs for any evaluated site.</p>
      </div>

      {/* DC Guide — no site required */}
      <div className="dc-card p-4 border-[--accent-blue]/40 bg-blue-950/10">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-[--accent-blue]/10 rounded">
              <BookOpen size={18} className="text-[--accent-blue]" />
            </div>
            <div>
              <div className="text-sm font-bold text-[--text-primary] mb-0.5">DC Institutional Playbook</div>
              <div className="text-xs text-[--text-muted]">
                Complete guide covering market intelligence, scoring framework, power, cooling, capital stack,
                red flags, and full DD checklist. No site required.
              </div>
            </div>
          </div>
          <button
            onClick={() => download('dc-guide')}
            disabled={isLoading('dc-guide')}
            className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 bg-[--accent-blue] text-white rounded text-xs font-bold hover:bg-blue-600 transition-colors disabled:opacity-60"
          >
            <Download size={13} />
            {isLoading('dc-guide') ? 'Generating…' : 'Download PDF'}
          </button>
        </div>
      </div>

      {/* Site Picker + site-specific exports */}
      <div className="dc-card p-4 space-y-4">
        <div>
          <h2 className="text-xs font-bold text-[--text-primary] mb-0.5">Site-Specific Reports</h2>
          <p className="text-[11px] text-[--text-muted]">Select a site to generate targeted executive, technical, and data exports.</p>
        </div>

        {/* Site selector */}
        <div className="relative">
          <label className="block text-xs text-[--text-muted] mb-1.5">Select Site</label>
          <button
            type="button"
            onClick={() => setOpen(o => !o)}
            className="dc-input w-full text-left flex items-center justify-between"
          >
            {selectedSite
              ? <span className="text-[--text-primary] font-medium">{selectedSite.name} <span className="text-[--text-muted] font-normal text-[11px]">— {selectedSite.location}</span></span>
              : <span className="text-[--text-muted]">{sites.length ? 'Choose a site…' : 'Loading sites…'}</span>
            }
            <ChevronDown size={13} className="text-[--text-muted] flex-shrink-0" />
          </button>

          {open && sites.length > 0 && (
            <div className="absolute z-30 left-0 right-0 top-full mt-1 bg-[--bg-card] border border-[--bg-border] rounded shadow-xl max-h-72 overflow-hidden flex flex-col">
              <div className="p-2 border-b border-[--bg-border] flex items-center gap-2">
                <Search size={12} className="text-[--text-muted] flex-shrink-0" />
                <input
                  autoFocus
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search sites…"
                  className="flex-1 bg-transparent text-xs text-[--text-primary] outline-none placeholder:text-[--text-dimmed]"
                />
              </div>
              <div className="overflow-y-auto">
                {filtered.length === 0
                  ? <div className="px-3 py-4 text-xs text-[--text-muted] text-center">No sites match</div>
                  : filtered.map(s => (
                    <button
                      key={s.id}
                      onClick={() => { setSiteId(s.id); setOpen(false); setQuery('') }}
                      className={`w-full text-left px-3 py-2 text-xs hover:bg-[--bg-hover] transition-colors ${siteId === s.id ? 'bg-[--bg-hover] text-[--accent-blue]' : 'text-[--text-primary]'}`}
                    >
                      <span className="font-medium">{s.name}</span>
                      <span className="text-[--text-muted] ml-2">{s.location}</span>
                      <span className="float-right text-[10px] text-[--text-dimmed]">{s.status}</span>
                    </button>
                  ))
                }
              </div>
            </div>
          )}
        </div>

        {/* Export cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <ExportCard
            icon={<FileText size={20} />}
            title="Executive PDF"
            description="Site brief for IC and partner distribution"
            onExport={() => download('executive-pdf')}
            loading={isLoading('executive-pdf')}
            disabled={!siteId.trim()}
          />
          <ExportCard
            icon={<FileText size={20} />}
            title="Technical Report PDF"
            description="Full technical specifications and systems overview"
            onExport={() => download('technical-pdf')}
            loading={isLoading('technical-pdf')}
            disabled={!siteId.trim()}
          />
          <ExportCard
            icon={<Table size={20} />}
            title="Diligence Workbook (XLSX)"
            description="All sections — power, cooling, network, capital, risks, tasks"
            onExport={() => download('xlsx')}
            loading={isLoading('xlsx')}
            disabled={!siteId.trim()}
          />
          <ExportCard
            icon={<Code size={20} />}
            title="JSON Data Pack"
            description="Full structured site record for API consumers"
            onExport={() => download('json')}
            loading={isLoading('json')}
            disabled={!siteId.trim()}
          />
        </div>
        {!siteId && <p className="text-[11px] text-[--text-muted]">Select a site above to enable export.</p>}
      </div>
    </div>
  )
}

function ExportCard({ icon, title, description, onExport, loading, disabled }: {
  icon: React.ReactNode
  title: string
  description: string
  onExport: () => void
  loading: boolean
  disabled: boolean
}) {
  return (
    <button
      onClick={onExport}
      disabled={disabled || loading}
      className="dc-card p-4 text-left hover:border-[--accent-blue] transition-colors disabled:opacity-40 space-y-2"
    >
      <div className="text-[--accent-blue]">{icon}</div>
      <div className="text-sm font-medium text-[--text-primary]">{loading ? 'Generating…' : title}</div>
      <div className="text-xs text-[--text-muted]">{description}</div>
    </button>
  )
}
