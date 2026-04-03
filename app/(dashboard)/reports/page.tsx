'use client'

import { useState } from 'react'
import { FileText, Table, Code } from 'lucide-react'

export default function ReportsPage() {
  const [siteId, setSiteId] = useState('')
  const [loading, setLoading] = useState<string | null>(null)

  async function download(type: 'executive-pdf' | 'technical-pdf' | 'xlsx' | 'json') {
    if (!siteId.trim()) return
    setLoading(type)
    const res = await fetch(`/api/exports/${type}?siteId=${encodeURIComponent(siteId.trim())}`)
    setLoading(null)
    if (!res.ok) {
      alert('Export failed — check site ID and try again.')
      return
    }
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const ext = type.includes('pdf') ? 'pdf' : type === 'xlsx' ? 'xlsx' : 'json'
    const a = document.createElement('a')
    a.href = url
    a.download = `unykorn-${type}-${siteId.slice(0, 8)}.${ext}`
    a.click()
    URL.revokeObjectURL(url)
  }

  const isLoading = (t: string) => loading === t

  return (
    <div className="space-y-5 max-w-xl">
      <div>
        <h1 className="text-base font-bold text-[--text-primary]">Reports & Exports</h1>
        <p className="text-xs text-[--text-muted]">Generate PDF memos, Excel workbooks, and JSON data packs.</p>
      </div>

      <div className="dc-card p-4 space-y-4">
        <div>
          <label className="block text-xs text-[--text-muted] mb-1.5">Site ID</label>
          <input
            type="text"
            value={siteId}
            onChange={e => setSiteId(e.target.value)}
            className="dc-input"
            placeholder="Paste site UUID here…"
          />
        </div>

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
