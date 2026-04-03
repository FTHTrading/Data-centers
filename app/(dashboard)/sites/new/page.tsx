'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const SITE_TYPES = [
  'GREENFIELD', 'POWERED_SHELL', 'OPERATING_FACILITY', 'RETROFIT',
  'CAMPUS_EXPANSION', 'CARRIER_HOTEL', 'LAND_ONLY', 'INDUSTRIAL',
]
const OWNERSHIP_STATUSES = [
  'OWN', 'GROUND_LEASE', 'LEASE', 'UNDER_CONTRACT', 'LOI', 'MARKETED',
]

export default function NewSitePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const fd = new FormData(e.currentTarget)
    const body = Object.fromEntries(fd.entries())

    const res = await fetch('/api/sites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    setLoading(false)
    if (!res.ok) {
      const err = await res.json()
      setError(err.error ?? 'Failed to create site.')
      return
    }
    const data = await res.json()
    router.push(`/dashboard/sites/${data.data.id}`)
  }

  return (
    <div className="max-w-2xl space-y-5">
      <div>
        <h1 className="text-base font-bold text-[--text-primary]">Register New Site</h1>
        <p className="text-xs text-[--text-muted]">Begin intake — additional data collected through agents and manual entry.</p>
      </div>

      <form onSubmit={handleSubmit} className="dc-card p-6 space-y-5">
        <section className="space-y-4">
          <h2 className="text-xs font-semibold text-[--accent-blue] uppercase tracking-wide">Identity</h2>
          <Field label="Site Name *" name="name" required placeholder="e.g. Park Place Chicago" />
          <div className="grid grid-cols-2 gap-4">
            <Field label="City *" name="city" required placeholder="e.g. Chicago" />
            <Field label="State" name="state" placeholder="e.g. IL" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Country" name="country" placeholder="US" defaultValue="US" />
            <Field label="Zip / Postal" name="postalCode" placeholder="60601" />
          </div>
          <SelectField label="Site Type" name="siteType" options={SITE_TYPES} />
          <SelectField label="Ownership Status" name="ownershipStatus" options={OWNERSHIP_STATUSES} />
        </section>

        <section className="space-y-4">
          <h2 className="text-xs font-semibold text-[--accent-blue] uppercase tracking-wide">Scale</h2>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Target IT MW" name="targetItMW" type="number" placeholder="50" />
            <Field label="Max Expandable MW" name="maxExpandableMW" type="number" placeholder="200" />
          </div>
          <Field label="Total Acres" name="totalAcres" type="number" placeholder="25" />
        </section>

        <section className="space-y-4">
          <h2 className="text-xs font-semibold text-[--accent-blue] uppercase tracking-wide">Source</h2>
          <Field label="Lead Source" name="leadSource" placeholder="e.g. Broker, CBRE, Direct" />
          <Field label="Broker / Contact Name" name="brokerName" placeholder="Jane Smith" />
          <Field label="Asking Price ($M)" name="askingPriceM" type="number" placeholder="150" />
          <Field label="Notes" name="intakeNotes" placeholder="Any initial observations or flags..." />
        </section>

        {error && (
          <div className="text-xs text-[--accent-red] bg-red-950/30 border border-red-900/40 rounded px-3 py-2">
            {error}
          </div>
        )}

        <div className="flex gap-2">
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Creating…' : 'Create Site'}
          </button>
          <button type="button" onClick={() => router.back()} className="btn-ghost">Cancel</button>
        </div>
      </form>
    </div>
  )
}

function Field({ label, name, type = 'text', placeholder, required, defaultValue }: {
  label: string; name: string; type?: string; placeholder?: string; required?: boolean; defaultValue?: string
}) {
  return (
    <div>
      <label className="block text-xs text-[--text-muted] mb-1.5">{label}</label>
      <input
        type={type}
        name={name}
        required={required}
        placeholder={placeholder}
        defaultValue={defaultValue}
        step={type === 'number' ? 'any' : undefined}
        className="dc-input"
      />
    </div>
  )
}

function SelectField({ label, name, options }: { label: string; name: string; options: string[] }) {
  return (
    <div>
      <label className="block text-xs text-[--text-muted] mb-1.5">{label}</label>
      <select name={name} className="dc-input">
        <option value="">— Select —</option>
        {options.map(o => <option key={o} value={o}>{o.replace(/_/g, ' ')}</option>)}
      </select>
    </div>
  )
}
