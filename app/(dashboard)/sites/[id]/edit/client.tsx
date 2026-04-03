'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Zap, Wind, Network, Shield, CheckSquare, Leaf, DollarSign, MapPin, Building2 } from 'lucide-react'

// ── Types ─────────────────────────────────────────────────────────────────────

type Nullable<T> = { [K in keyof T]: T[K] | null | undefined }

interface InitialData {
  overview:      Record<string, any>
  utility:       Record<string, any> | null
  generators:    Record<string, any> | null
  ups:           Record<string, any> | null
  cooling:       Record<string, any> | null
  network:       Record<string, any> | null
  security:      Record<string, any> | null
  compliance:    Record<string, any> | null
  environmental: Record<string, any> | null
  capital:       Record<string, any> | null
  jurisdiction:  Record<string, any> | null
}

type Tab = 'overview' | 'power' | 'cooling' | 'network' | 'security' | 'compliance' | 'environmental' | 'capital' | 'jurisdiction'

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'overview',      label: 'Overview',      icon: Building2   },
  { id: 'power',         label: 'Power',          icon: Zap         },
  { id: 'cooling',       label: 'Cooling',        icon: Wind        },
  { id: 'network',       label: 'Network',        icon: Network     },
  { id: 'security',      label: 'Security',       icon: Shield      },
  { id: 'compliance',    label: 'Compliance',     icon: CheckSquare },
  { id: 'environmental', label: 'Environmental',  icon: Leaf        },
  { id: 'capital',       label: 'Capital',        icon: DollarSign  },
  { id: 'jurisdiction',  label: 'Jurisdiction',   icon: MapPin      },
]

// ── Helper components ─────────────────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-[10px] font-bold text-[--accent-blue] uppercase tracking-widest mb-3 mt-5 first:mt-0">{children}</h3>
}

function FieldRow({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">{children}</div>
}

function TextField({
  label, value, onChange, placeholder, textarea,
}: {
  label: string; value: string | null | undefined; onChange: (v: string | null) => void
  placeholder?: string; textarea?: boolean
}) {
  const cls = 'w-full bg-[--bg-hover] border border-[--bg-border] rounded px-3 py-1.5 text-xs text-[--text-primary] placeholder:text-[--text-dimmed] focus:outline-none focus:border-[--accent-blue]'
  return (
    <label className={`block space-y-1 ${textarea ? 'sm:col-span-2 md:col-span-3' : ''}`}>
      <span className="text-[10px] text-[--text-muted] uppercase tracking-wide">{label}</span>
      {textarea
        ? <textarea className={`${cls} min-h-[72px] resize-y`} value={value ?? ''} placeholder={placeholder}
            onChange={e => onChange(e.target.value || null)} />
        : <input type="text" className={cls} value={value ?? ''} placeholder={placeholder}
            onChange={e => onChange(e.target.value || null)} />}
    </label>
  )
}

function NumField({
  label, value, onChange, placeholder, step,
}: {
  label: string; value: number | null | undefined; onChange: (v: number | null) => void
  placeholder?: string; step?: string
}) {
  return (
    <label className="block space-y-1">
      <span className="text-[10px] text-[--text-muted] uppercase tracking-wide">{label}</span>
      <input
        type="number" step={step ?? 'any'}
        className="w-full bg-[--bg-hover] border border-[--bg-border] rounded px-3 py-1.5 text-xs text-[--text-primary] placeholder:text-[--text-dimmed] focus:outline-none focus:border-[--accent-blue]"
        value={value ?? ''}
        placeholder={placeholder}
        onChange={e => onChange(e.target.value === '' ? null : Number(e.target.value))}
      />
    </label>
  )
}

function SelectField({
  label, value, onChange, options,
}: {
  label: string; value: string | null | undefined; onChange: (v: string | null) => void
  options: string[]
}) {
  return (
    <label className="block space-y-1">
      <span className="text-[10px] text-[--text-muted] uppercase tracking-wide">{label}</span>
      <select
        className="w-full bg-[--bg-hover] border border-[--bg-border] rounded px-3 py-1.5 text-xs text-[--text-primary] focus:outline-none focus:border-[--accent-blue]"
        value={value ?? ''}
        onChange={e => onChange(e.target.value || null)}
      >
        <option value="">— select —</option>
        {options.map(o => <option key={o} value={o}>{o.replace(/_/g, ' ')}</option>)}
      </select>
    </label>
  )
}

function BoolField({ label, value, onChange }: { label: string; value: boolean | null | undefined; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer py-1.5">
      <input
        type="checkbox"
        className="w-3.5 h-3.5 accent-[--accent-blue]"
        checked={value ?? false}
        onChange={e => onChange(e.target.checked)}
      />
      <span className="text-xs text-[--text-primary]">{label}</span>
    </label>
  )
}

function SaveRow({ onSave, saving, saved, error }: { onSave: () => void; saving: boolean; saved: boolean; error: string | null }) {
  return (
    <div className="flex items-center gap-3 pt-4 mt-4 border-t border-[--bg-border]">
      <button
        type="button"
        onClick={onSave}
        disabled={saving}
        className="btn-primary text-xs disabled:opacity-50"
      >
        {saving ? 'Saving…' : 'Save Section'}
      </button>
      {saved && !saving && <span className="text-xs text-green-400">Saved</span>}
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  )
}

// ── Save helpers ──────────────────────────────────────────────────────────────

async function put(url: string, body: unknown): Promise<string | null> {
  const res = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    return err.error ? JSON.stringify(err.error) : `Error ${res.status}`
  }
  return null
}

async function patch(url: string, body: unknown): Promise<string | null> {
  const res = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    return err.error ? JSON.stringify(err.error) : `Error ${res.status}`
  }
  return null
}

// ── Main component ────────────────────────────────────────────────────────────

export function SiteEditClient({ siteId, initial }: { siteId: string; initial: InitialData }) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>('overview')

  // ── Per-section state ──
  const [overview,      setOverview]      = useState<Record<string, any>>(initial.overview ?? {})
  const [utility,       setUtility]       = useState<Record<string, any>>(initial.utility ?? {})
  const [generators,    setGenerators]    = useState<Record<string, any>>(initial.generators ?? {})
  const [ups,           setUps]           = useState<Record<string, any>>(initial.ups ?? {})
  const [cooling,       setCooling]       = useState<Record<string, any>>(initial.cooling ?? {})
  const [network,       setNetwork]       = useState<Record<string, any>>(initial.network ?? {})
  const [security,      setSecurity]      = useState<Record<string, any>>(initial.security ?? {})
  const [compliance,    setCompliance]    = useState<Record<string, any>>(initial.compliance ?? {})
  const [environmental, setEnvironmental] = useState<Record<string, any>>(initial.environmental ?? {})
  const [capital,       setCapital]       = useState<Record<string, any>>(initial.capital ?? {})
  const [jurisdiction,  setJurisdiction]  = useState<Record<string, any>>(initial.jurisdiction ?? {})

  // ── Per-section save state ──
  const [saveState, setSaveState] = useState<Record<Tab, { saving: boolean; saved: boolean; error: string | null }>>({
    overview:      { saving: false, saved: false, error: null },
    power:         { saving: false, saved: false, error: null },
    cooling:       { saving: false, saved: false, error: null },
    network:       { saving: false, saved: false, error: null },
    security:      { saving: false, saved: false, error: null },
    compliance:    { saving: false, saved: false, error: null },
    environmental: { saving: false, saved: false, error: null },
    capital:       { saving: false, saved: false, error: null },
    jurisdiction:  { saving: false, saved: false, error: null },
  })

  function setSaving(tab: Tab, saving: boolean) {
    setSaveState(s => ({ ...s, [tab]: { ...s[tab], saving } }))
  }
  function setSaved(tab: Tab, saved: boolean) {
    setSaveState(s => ({ ...s, [tab]: { ...s[tab], saved, error: null } }))
  }
  function setError(tab: Tab, error: string | null) {
    setSaveState(s => ({ ...s, [tab]: { ...s[tab], error, saving: false } }))
  }

  // ── Field updaters ──
  const u = <T extends Record<string, any>>(setter: React.Dispatch<React.SetStateAction<T>>) =>
    (key: string) => (v: any) => setter(prev => ({ ...prev, [key]: v }))

  const setOv  = u(setOverview)
  const setUt  = u(setUtility)
  const setGen = u(setGenerators)
  const setUs  = u(setUps)
  const setCl  = u(setCooling)
  const setNet = u(setNetwork)
  const setSec = u(setSecurity)
  const setCom = u(setCompliance)
  const setEnv = u(setEnvironmental)
  const setCap = u(setCapital)
  const setJur = u(setJurisdiction)

  // ── Save handlers ──
  const base = `/api/sites/${siteId}`

  async function saveOverview() {
    setSaving('overview', true)
    const err = await patch(`${base}`, overview)
    setSaving('overview', false)
    if (err) { setError('overview', err); return }
    setSaved('overview', true)
    router.refresh()
  }

  async function savePower() {
    setSaving('power', true)
    const err = await put(`${base}/power`, { utility, generators, ups })
    setSaving('power', false)
    if (err) { setError('power', err); return }
    setSaved('power', true)
  }

  async function saveCooling() {
    setSaving('cooling', true)
    const err = await put(`${base}/cooling`, cooling)
    setSaving('cooling', false)
    if (err) { setError('cooling', err); return }
    setSaved('cooling', true)
  }

  async function saveNetwork() {
    setSaving('network', true)
    const err = await put(`${base}/network`, network)
    setSaving('network', false)
    if (err) { setError('network', err); return }
    setSaved('network', true)
  }

  async function saveSecurity() {
    setSaving('security', true)
    const err = await put(`${base}/security`, security)
    setSaving('security', false)
    if (err) { setError('security', err); return }
    setSaved('security', true)
  }

  async function saveCompliance() {
    setSaving('compliance', true)
    const err = await put(`${base}/compliance`, compliance)
    setSaving('compliance', false)
    if (err) { setError('compliance', err); return }
    setSaved('compliance', true)
  }

  async function saveEnvironmental() {
    setSaving('environmental', true)
    const err = await put(`${base}/environmental`, environmental)
    setSaving('environmental', false)
    if (err) { setError('environmental', err); return }
    setSaved('environmental', true)
  }

  async function saveCapital() {
    setSaving('capital', true)
    const err = await put(`${base}/capital`, capital)
    setSaving('capital', false)
    if (err) { setError('capital', err); return }
    setSaved('capital', true)
  }

  async function saveJurisdiction() {
    setSaving('jurisdiction', true)
    const err = await put(`${base}/jurisdiction`, jurisdiction)
    setSaving('jurisdiction', false)
    if (err) { setError('jurisdiction', err); return }
    setSaved('jurisdiction', true)
  }

  const ss = saveState[activeTab]

  return (
    <div className="dc-card overflow-hidden">
      {/* Tab bar */}
      <div className="flex items-center gap-0.5 overflow-x-auto border-b border-[--bg-border] px-2 bg-[--bg-base]">
        {TABS.map(t => {
          const Icon = t.icon
          const active = t.id === activeTab
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-xs whitespace-nowrap border-b-2 transition-colors ${
                active
                  ? 'border-[--accent-blue] text-[--accent-blue]'
                  : 'border-transparent text-[--text-muted] hover:text-[--text-primary]'
              }`}
            >
              <Icon size={12} />
              {t.label}
            </button>
          )
        })}
      </div>

      {/* Tab content */}
      <div className="p-5">

        {/* ── OVERVIEW ──────────────────────────────────────────── */}
        {activeTab === 'overview' && (
          <div>
            <SectionTitle>Identity</SectionTitle>
            <FieldRow>
              <TextField  label="Site Name *"       value={overview.name}            onChange={setOv('name')}            placeholder="Park Place Chicago" />
              <SelectField label="Site Type"        value={overview.siteType}        onChange={setOv('siteType')}
                options={['GREENFIELD','POWERED_SHELL','OPERATING_FACILITY','RETROFIT','CAMPUS_EXPANSION','CARRIER_HOTEL','LAND_ONLY','INDUSTRIAL']} />
              <SelectField label="Ownership Status" value={overview.ownershipStatus} onChange={setOv('ownershipStatus')}
                options={['OWN','GROUND_LEASE','LEASE','UNDER_CONTRACT','LOI','MARKETED','OFF_MARKET']} />
            </FieldRow>

            <SectionTitle>Location</SectionTitle>
            <FieldRow>
              <TextField  label="Address"    value={overview.address} onChange={setOv('address')} placeholder="123 Power Blvd" />
              <TextField  label="City"       value={overview.city}    onChange={setOv('city')}    placeholder="Chicago" />
              <TextField  label="State"      value={overview.state}   onChange={setOv('state')}   placeholder="IL" />
              <TextField  label="Country"    value={overview.country} onChange={setOv('country')} placeholder="US" />
              <NumField   label="Latitude"   value={overview.lat}     onChange={setOv('lat')} />
              <NumField   label="Longitude"  value={overview.lng}     onChange={setOv('lng')} />
            </FieldRow>

            <SectionTitle>Scale</SectionTitle>
            <FieldRow>
              <NumField label="Total Acres"       value={overview.totalAcres}      onChange={setOv('totalAcres')}      placeholder="25" />
              <NumField label="Target IT MW"      value={overview.targetItMW}      onChange={setOv('targetItMW')}      placeholder="50" />
              <NumField label="Max Expandable MW" value={overview.maxExpandableMW} onChange={setOv('maxExpandableMW')} placeholder="200" />
              <NumField label="Current PUE"       value={overview.currentPUE}      onChange={setOv('currentPUE')}      placeholder="1.45" step="0.01" />
            </FieldRow>

            <SectionTitle>Internal Notes</SectionTitle>
            <TextField label="Notes" value={overview.internalNotes} onChange={setOv('internalNotes')} textarea placeholder="Internal observations, flags, follow-ups…" />

            <SaveRow onSave={saveOverview} saving={ss.saving} saved={ss.saved} error={ss.error} />
          </div>
        )}

        {/* ── POWER ─────────────────────────────────────────────── */}
        {activeTab === 'power' && (
          <div>
            <SectionTitle>Utility Feed</SectionTitle>
            <FieldRow>
              <TextField label="Provider"              value={utility.provider}               onChange={setUt('provider')}               placeholder="ComEd" />
              <NumField  label="Delivered MW"          value={utility.deliveredMW}            onChange={setUt('deliveredMW')}            placeholder="80" />
              <NumField  label="Contracted MW"         value={utility.contractedMW}           onChange={setUt('contractedMW')}          placeholder="60" />
              <NumField  label="Expandable MW"         value={utility.expandableMW}           onChange={setUt('expandableMW')}          placeholder="120" />
              <NumField  label="Feed Count"            value={utility.feedCount}              onChange={setUt('feedCount')}             placeholder="2" step="1" />
              <NumField  label="Service Voltage (kV)"  value={utility.serviceVoltageKv}       onChange={setUt('serviceVoltageKv')}       placeholder="34.5" />
              <NumField  label="Grid Reliability %"    value={utility.gridReliabilityPercent} onChange={setUt('gridReliabilityPercent')} placeholder="99.99" />
              <TextField label="Interconnection Status" value={utility.interconnectionStatus} onChange={setUt('interconnectionStatus')}  placeholder="Approved" />
              <TextField label="Upgrade Timeline"      value={utility.upgradeTimeline}        onChange={setUt('upgradeTimeline')}        placeholder="12 months" />
            </FieldRow>
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-x-6">
              <BoolField label="Feed diversity"   value={utility.hasFeedDiversity}   onChange={setUt('hasFeedDiversity')} />
              <BoolField label="Upgrade required" value={utility.upgradeRequired}    onChange={setUt('upgradeRequired')} />
              <BoolField label="BTM generation"   value={utility.hasBtmGeneration}   onChange={setUt('hasBtmGeneration')} />
            </div>
            {utility.hasBtmGeneration && (
              <FieldRow>
                <NumField  label="BTM Capacity MW" value={utility.btmCapacityMW} onChange={setUt('btmCapacityMW')} />
                <TextField label="BTM Sources"     value={utility.btmSources}    onChange={setUt('btmSources')}    placeholder="Solar, battery" />
              </FieldRow>
            )}
            <TextField label="Notes" value={utility.notes} onChange={setUt('notes')} textarea />

            <SectionTitle>Generator Plant</SectionTitle>
            <FieldRow>
              <NumField  label="Generator Count"      value={generators.count}           onChange={setGen('count')}           step="1" placeholder="4" />
              <NumField  label="Capacity (kW each)"   value={generators.capacityKwEach}  onChange={setGen('capacityKwEach')}  placeholder="2000" />
              <TextField label="Fuel Type"            value={generators.fuelType}        onChange={setGen('fuelType')}        placeholder="Diesel" />
              <TextField label="Redundancy Model"     value={generators.redundancyModel} onChange={setGen('redundancyModel')} placeholder="N+1" />
              <NumField  label="Autonomy (hours)"     value={generators.autonomyHours}   onChange={setGen('autonomyHours')}   placeholder="72" />
              <NumField  label="Year Installed"       value={generators.yearInstalled}   onChange={setGen('yearInstalled')}  step="1" placeholder="2018" />
            </FieldRow>
            <div className="mt-3">
              <BoolField label="Has refuel contract" value={generators.hasRefuelContract} onChange={setGen('hasRefuelContract')} />
            </div>
            <TextField label="Notes" value={generators.notes} onChange={setGen('notes')} textarea />

            <SectionTitle>UPS Systems</SectionTitle>
            <FieldRow>
              <TextField label="Topology"           value={ups.topology}              onChange={setUs('topology')}         placeholder="Double-conversion" />
              <TextField label="Manufacturer"       value={ups.manufacturer}          onChange={setUs('manufacturer')}     placeholder="Vertiv" />
              <TextField label="Chemistry"          value={ups.chemistry}             onChange={setUs('chemistry')}        placeholder="VRLA" />
              <NumField  label="UPS Count"          value={ups.count}                 onChange={setUs('count')}           step="1" placeholder="4" />
              <NumField  label="Capacity (kW each)" value={ups.capacityKwEach}        onChange={setUs('capacityKwEach')}  placeholder="500" />
              <NumField  label="Runtime (minutes)"  value={ups.runtimeMinutes}        onChange={setUs('runtimeMinutes')}  placeholder="15" />
              <NumField  label="Total kW Backed"    value={ups.totalKwBacked}         onChange={setUs('totalKwBacked')}   placeholder="1800" />
              <NumField  label="Current kW Utilized" value={ups.currentKwUtilized}   onChange={setUs('currentKwUtilized')} placeholder="1200" />
              <TextField label="Redundancy Model"   value={ups.redundancyModel}       onChange={setUs('redundancyModel')} placeholder="2N" />
              <NumField  label="Year Installed"     value={ups.yearInstalled}         onChange={setUs('yearInstalled')}  step="1" placeholder="2020" />
            </FieldRow>
            <div className="mt-3">
              <BoolField label="Has telemetry" value={ups.hasTelemetry} onChange={setUs('hasTelemetry')} />
            </div>
            <TextField label="Notes" value={ups.notes} onChange={setUs('notes')} textarea />

            <SaveRow onSave={savePower} saving={saveState.power.saving} saved={saveState.power.saved} error={saveState.power.error} />
          </div>
        )}

        {/* ── COOLING ───────────────────────────────────────────── */}
        {activeTab === 'cooling' && (
          <div>
            <SectionTitle>Cooling Systems</SectionTitle>
            <FieldRow>
              <SelectField label="Cooling Type"      value={cooling.coolingType}       onChange={setCl('coolingType')}
                options={['AIR','WATER','HYBRID','DIRECT_LIQUID','IMMERSION_SINGLE_PHASE','IMMERSION_TWO_PHASE','REAR_DOOR']} />
              <NumField  label="Aggregate Tons"      value={cooling.aggregateTons}     onChange={setCl('aggregateTons')}     placeholder="1200" />
              <NumField  label="Chilled Water Tons"  value={cooling.chilledWaterTons}  onChange={setCl('chilledWaterTons')}  placeholder="800" />
              <NumField  label="CRAH/CRAC Count"     value={cooling.crahCracCount}     onChange={setCl('crahCracCount')}    step="1" />
              <TextField label="Redundancy Model"    value={cooling.redundancyModel}   onChange={setCl('redundancyModel')}  placeholder="N+1" />
              <NumField  label="Max Rack kW"         value={cooling.maxRackKwSupported} onChange={setCl('maxRackKwSupported')} placeholder="30" />
            </FieldRow>

            <SectionTitle>PUE / WUE</SectionTitle>
            <FieldRow>
              <NumField label="PUE Design"   value={cooling.pueDesign} onChange={setCl('pueDesign')} step="0.01" placeholder="1.30" />
              <NumField label="PUE Annual"   value={cooling.pueAnnual} onChange={setCl('pueAnnual')} step="0.01" placeholder="1.45" />
              <NumField label="PUE Target"   value={cooling.pueTarget} onChange={setCl('pueTarget')} step="0.01" placeholder="1.25" />
              <NumField label="WUE"          value={cooling.wueValue}  onChange={setCl('wueValue')}  step="0.01" placeholder="1.2" />
              <TextField label="Water Source Risk" value={cooling.waterSourceRisk} onChange={setCl('waterSourceRisk')} placeholder="Municipal / Low" />
            </FieldRow>

            <SectionTitle>Capabilities</SectionTitle>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6">
              <BoolField label="Liquid cooling ready"  value={cooling.isLiquidCoolingReady} onChange={setCl('isLiquidCoolingReady')} />
              <BoolField label="In-row cooling"        value={cooling.hasInRowCooling}       onChange={setCl('hasInRowCooling')} />
              <BoolField label="Rear-door coolers"     value={cooling.hasRearDoorCooler}     onChange={setCl('hasRearDoorCooler')} />
              <BoolField label="CDU (direct liquid)"   value={cooling.hasCdu}                onChange={setCl('hasCdu')} />
              <BoolField label="Immersion cooling"     value={cooling.hasImmersionCooling}   onChange={setCl('hasImmersionCooling')} />
              <BoolField label="Warm water loop"       value={cooling.hasWarmWaterLoop}      onChange={setCl('hasWarmWaterLoop')} />
              <BoolField label="Heat reuse"            value={cooling.hasHeatReuse}          onChange={setCl('hasHeatReuse')} />
            </div>
            <TextField label="Notes" value={cooling.notes} onChange={setCl('notes')} textarea />

            <SaveRow onSave={saveCooling} saving={ss.saving} saved={ss.saved} error={ss.error} />
          </div>
        )}

        {/* ── NETWORK ───────────────────────────────────────────── */}
        {activeTab === 'network' && (
          <div>
            <SectionTitle>Connectivity</SectionTitle>
            <FieldRow>
              <NumField  label="Carriers On-site"         value={network.carriersOnSite}           onChange={setNet('carriersOnSite')}          step="1" placeholder="3" />
              <NumField  label="Carriers Nearby"          value={network.carriersNearby}           onChange={setNet('carriersNearby')}          step="1" placeholder="5" />
              <NumField  label="Aggregate Bandwidth (Tbps)" value={network.aggregateBandwidthTbps} onChange={setNet('aggregateBandwidthTbps')}  placeholder="4" />
              <NumField  label="IX Proximity (miles)"     value={network.ixProximityMiles}         onChange={setNet('ixProximityMiles')}        placeholder="2.5" />
              <NumField  label="Cloud On-Ramp Latency (ms)" value={network.cloudOnRampLatencyMs}  onChange={setNet('cloudOnRampLatencyMs')}    placeholder="3" />
              <NumField  label="Cross-Connect Lead Time (days)" value={network.crossConnectLeadTimeDays} onChange={setNet('crossConnectLeadTimeDays')} step="1" placeholder="5" />
              <TextField label="Carrier Names"            value={network.carrierNames}             onChange={setNet('carrierNames')}            placeholder="AT&T, Zayo, CenturyLink" />
            </FieldRow>

            <SectionTitle>Infrastructure</SectionTitle>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6">
              <BoolField label="Dark fiber on-site"   value={network.hasDarkFiber}          onChange={setNet('hasDarkFiber')} />
              <BoolField label="Meet-me room"         value={network.hasMeetMeRoom}         onChange={setNet('hasMeetMeRoom')} />
              <BoolField label="Route diversity"      value={network.hasRouteDiversity}     onChange={setNet('hasRouteDiversity')} />
              <BoolField label="Wavelength service"   value={network.hasWavelengthService}  onChange={setNet('hasWavelengthService')} />
            </div>
            <TextField label="Notes" value={network.notes} onChange={setNet('notes')} textarea />

            <SaveRow onSave={saveNetwork} saving={ss.saving} saved={ss.saved} error={ss.error} />
          </div>
        )}

        {/* ── SECURITY ──────────────────────────────────────────── */}
        {activeTab === 'security' && (
          <div>
            <SectionTitle>Physical Security</SectionTitle>
            <FieldRow>
              <TextField label="Guards Schedule"       value={security.guardsSchedule}     onChange={setSec('guardsSchedule')}     placeholder="24/7" />
              <NumField  label="CCTV Retention (days)" value={security.cctvRetentionDays}  onChange={setSec('cctvRetentionDays')}  step="1" placeholder="90" />
              <TextField label="Biometric Method"     value={security.biometricMethod}    onChange={setSec('biometricMethod')}    placeholder="Fingerprint, Iris" />
              <TextField label="Building Auth Method"  value={security.buildingAuthMethod}  onChange={setSec('buildingAuthMethod')} placeholder="Badge + PIN" />
              <TextField label="DC Floor Auth Method"  value={security.datacenterAuthMethod} onChange={setSec('datacenterAuthMethod')} placeholder="Biometric + Badge" />
            </FieldRow>

            <SectionTitle>Capabilities</SectionTitle>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6">
              <BoolField label="Perimeter guards"  value={security.hasPerimeterGuards}  onChange={setSec('hasPerimeterGuards')} />
              <BoolField label="CCTV — building"   value={security.hasCctvBuilding}     onChange={setSec('hasCctvBuilding')} />
              <BoolField label="CCTV — DC floor"   value={security.hasCctvDataCenter}   onChange={setSec('hasCctvDataCenter')} />
              <BoolField label="Mantraps"          value={security.hasMantraps}         onChange={setSec('hasMantraps')} />
              <BoolField label="Biometrics"        value={security.hasBiometrics}       onChange={setSec('hasBiometrics')} />
              <BoolField label="Visitor management" value={security.hasVisitorMgmt}    onChange={setSec('hasVisitorMgmt')} />
              <BoolField label="SOC / NOC"          value={security.hasSocNoc}          onChange={setSec('hasSocNoc')} />
              <BoolField label="Anti-tailgating"   value={security.hasAntiTailgating}  onChange={setSec('hasAntiTailgating')} />
              <BoolField label="Cabinet locks"     value={security.hasCabinetLocks}    onChange={setSec('hasCabinetLocks')} />
            </div>
            <TextField label="Notes" value={security.notes} onChange={setSec('notes')} textarea />

            <SaveRow onSave={saveSecurity} saving={ss.saving} saved={ss.saved} error={ss.error} />
          </div>
        )}

        {/* ── COMPLIANCE ────────────────────────────────────────── */}
        {activeTab === 'compliance' && (
          <div>
            <SectionTitle>Certifications</SectionTitle>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6">
              <BoolField label="SOC 1"      value={compliance.hasSoc1}     onChange={setCom('hasSoc1')} />
              <BoolField label="SOC 2"      value={compliance.hasSoc2}     onChange={setCom('hasSoc2')} />
              <BoolField label="SOC 3"      value={compliance.hasSoc3}     onChange={setCom('hasSoc3')} />
              <BoolField label="ISO 27001"  value={compliance.hasIso27001} onChange={setCom('hasIso27001')} />
              <BoolField label="PCI DSS"    value={compliance.hasPciDss}   onChange={setCom('hasPciDss')} />
              <BoolField label="HIPAA"      value={compliance.hasHipaa}    onChange={setCom('hasHipaa')} />
              <BoolField label="FedRAMP"    value={compliance.hasFedRamp}  onChange={setCom('hasFedRamp')} />
              <BoolField label="CJIS"       value={compliance.hasCjis}     onChange={setCom('hasCjis')} />
              <BoolField label="ISO 50001"  value={compliance.hasIso50001} onChange={setCom('hasIso50001')} />
              <BoolField label="NIST 800-53" value={compliance.hasNist}   onChange={setCom('hasNist')} />
              <BoolField label="StateM-SSP" value={compliance.hasStatemssp} onChange={setCom('hasStatemssp')} />
            </div>

            <SectionTitle>Suitability</SectionTitle>
            <FieldRow>
              <SelectField label="Uptime Institute Tier" value={compliance.uptimeTier} onChange={setCom('uptimeTier')}
                options={['Tier I','Tier II','Tier III','Tier III+',' Tier IV']} />
            </FieldRow>
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-x-6">
              <BoolField label="Financial infra suitable"   value={compliance.financialInfraSuitable} onChange={setCom('financialInfraSuitable')} />
              <BoolField label="Sovereign hosting suitable" value={compliance.sovereignSuitable}      onChange={setCom('sovereignSuitable')} />
              <BoolField label="Digital asset suitable"     value={compliance.digitalAssetSuitable}   onChange={setCom('digitalAssetSuitable')} />
            </div>
            <TextField label="Data Residency Notes"  value={compliance.dataResidencyNotes}  onChange={setCom('dataResidencyNotes')}  textarea />
            <TextField label="Certification Notes"   value={compliance.certificationNotes}  onChange={setCom('certificationNotes')}  textarea />

            <SaveRow onSave={saveCompliance} saving={ss.saving} saved={ss.saved} error={ss.error} />
          </div>
        )}

        {/* ── ENVIRONMENTAL ─────────────────────────────────────── */}
        {activeTab === 'environmental' && (
          <div>
            <SectionTitle>Clean Energy</SectionTitle>
            <FieldRow>
              <NumField  label="Renewable Energy %"   value={environmental.renewableEnergyPercent} onChange={setEnv('renewableEnergyPercent')} placeholder="85" />
              <NumField  label="PPA Term (years)"     value={environmental.ppaTermYears}           onChange={setEnv('ppaTermYears')}          step="1" placeholder="15" />
              <NumField  label="PPA Price ($/kWh)"    value={environmental.ppaPricePerKwh}         onChange={setEnv('ppaPricePerKwh')}        step="0.001" placeholder="0.032" />
              <NumField  label="GHG Scope 1 (MT)"     value={environmental.ghgScope1}              onChange={setEnv('ghgScope1')} />
              <NumField  label="GHG Scope 2 Mkt (MT)" value={environmental.ghgScope2Market}       onChange={setEnv('ghgScope2Market')} />
            </FieldRow>
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-x-6">
              <BoolField label="Has PPA"           value={environmental.hasPpa}           onChange={setEnv('hasPpa')} />
              <BoolField label="BTM generation"    value={environmental.hasBtmGeneration} onChange={setEnv('hasBtmGeneration')} />
              <BoolField label="Microgrid"         value={environmental.hasMicrogrid}     onChange={setEnv('hasMicrogrid')} />
              <BoolField label="ESG reporting"     value={environmental.hasEsReporting}   onChange={setEnv('hasEsReporting')} />
            </div>

            <SectionTitle>Climate Risks</SectionTitle>
            <FieldRow>
              <SelectField label="Water Stress"        value={environmental.waterStressLevel}  onChange={setEnv('waterStressLevel')}
                options={['Low','Medium-Low','Medium','Medium-High','High','Extremely High']} />
              <SelectField label="Flood Risk"          value={environmental.floodRisk}         onChange={setEnv('floodRisk')}
                options={['Minimal','Low','Moderate','High','Severe']} />
              <SelectField label="Fire Risk"           value={environmental.fireRisk}          onChange={setEnv('fireRisk')}
                options={['Minimal','Low','Moderate','High','Severe']} />
              <SelectField label="Seismic Risk"        value={environmental.seismicRisk}       onChange={setEnv('seismicRisk')}
                options={['Zone 0','Zone 1','Zone 2A','Zone 2B','Zone 3','Zone 4']} />
              <SelectField label="Permitting Risk"     value={environmental.permittingRisk}    onChange={setEnv('permittingRisk')}
                options={['Low','Moderate','High']} />
              <SelectField label="Insurance Complexity" value={environmental.insuranceComplexity} onChange={setEnv('insuranceComplexity')}
                options={['Standard','Elevated','Complex','Specialty Required']} />
            </FieldRow>
            <TextField label="Climate Risk Narrative" value={environmental.climateRiskNarrative} onChange={setEnv('climateRiskNarrative')} textarea />
            <TextField label="Notes"                  value={environmental.notes}               onChange={setEnv('notes')} textarea />

            <SaveRow onSave={saveEnvironmental} saving={ss.saving} saved={ss.saved} error={ss.error} />
          </div>
        )}

        {/* ── CAPITAL ───────────────────────────────────────────── */}
        {activeTab === 'capital' && (
          <div>
            <SectionTitle>Project Costs ($M)</SectionTitle>
            <FieldRow>
              <NumField label="Total Project Cost"        value={capital.totalProjectCostM}    onChange={setCap('totalProjectCostM')}    placeholder="250" />
              <NumField label="Site Control Cost"         value={capital.siteControlCostM}     onChange={setCap('siteControlCostM')}     placeholder="15" />
              <NumField label="Buildout Cost / MW"        value={capital.buildoutCostPerMwM}   onChange={setCap('buildoutCostPerMwM')}   placeholder="4" />
              <NumField label="Retrofit Cost"             value={capital.retrofitCostM}        onChange={setCap('retrofitCostM')} />
              <NumField label="Cooling Retrofit"          value={capital.coolingRetrofitCostM} onChange={setCap('coolingRetrofitCostM')} />
              <NumField label="Security Uplift"           value={capital.securityUpliftCostM}  onChange={setCap('securityUpliftCostM')} />
              <NumField label="Utility Deposit"           value={capital.utilityDepositM}      onChange={setCap('utilityDepositM')} />
            </FieldRow>

            <SectionTitle>Capital Stack ($M)</SectionTitle>
            <FieldRow>
              <NumField label="Senior Debt"        value={capital.seniorDebtM}        onChange={setCap('seniorDebtM')}       placeholder="180" />
              <NumField label="Mezz Debt"          value={capital.mezzDebtM}          onChange={setCap('mezzDebtM')} />
              <NumField label="Preferred Equity"   value={capital.preferredEquityM}   onChange={setCap('preferredEquityM')} />
              <NumField label="Common Equity"      value={capital.commonEquityM}      onChange={setCap('commonEquityM')}    placeholder="70" />
            </FieldRow>

            <SectionTitle>Return Targets</SectionTitle>
            <FieldRow>
              <NumField label="Target LTV"          value={capital.targetLtv}            onChange={setCap('targetLtv')}           step="0.01" placeholder="0.65" />
              <NumField label="Target DSCR"         value={capital.targetDscr}           onChange={setCap('targetDscr')}          step="0.01" placeholder="1.35" />
              <NumField label="Target IRR (unlev)"  value={capital.targetIrrUnlevered}   onChange={setCap('targetIrrUnlevered')}  step="0.001" placeholder="0.12" />
              <NumField label="Target IRR (lev)"    value={capital.targetIrrLevered}     onChange={setCap('targetIrrLevered')}    step="0.001" placeholder="0.18" />
              <NumField label="PPA Annual Cost"     value={capital.ppaAnnualCostM}       onChange={setCap('ppaAnnualCostM')} />
              <NumField label="Grid Annual Cost"    value={capital.gridAnnualCostM}      onChange={setCap('gridAnnualCostM')} />
            </FieldRow>

            <SectionTitle>Digital Asset / RWA</SectionTitle>
            <FieldRow>
              <TextField label="Tokenization Strategy" value={capital.tokenizationStrategy} onChange={setCap('tokenizationStrategy')} placeholder="RWA token, fractionalized ownership" />
              <TextField label="RWA Token Ticker"      value={capital.rwaTokenTicker}       onChange={setCap('rwaTokenTicker')}       placeholder="DCTKN" />
              <TextField label="RWA Chain"             value={capital.rwaChain}             onChange={setCap('rwaChain')}             placeholder="Ethereum, Polygon" />
            </FieldRow>
            <TextField label="Lender Readiness Notes" value={capital.readinessForLenders} onChange={setCap('readinessForLenders')} textarea />
            <TextField label="Notes"                  value={capital.notes}               onChange={setCap('notes')} textarea />

            <SaveRow onSave={saveCapital} saving={ss.saving} saved={ss.saved} error={ss.error} />
          </div>
        )}

        {/* ── JURISDICTION ──────────────────────────────────────── */}
        {activeTab === 'jurisdiction' && (
          <div>
            <SectionTitle>Location</SectionTitle>
            <FieldRow>
              <TextField label="Country"      value={jurisdiction.country}      onChange={setJur('country')}      placeholder="US" />
              <TextField label="State"        value={jurisdiction.state}        onChange={setJur('state')}        placeholder="TX" />
              <TextField label="County"       value={jurisdiction.county}       onChange={setJur('county')}       placeholder="Travis" />
              <TextField label="Municipality" value={jurisdiction.municipality} onChange={setJur('municipality')} placeholder="Austin" />
            </FieldRow>

            <SectionTitle>Incentives & Tax</SectionTitle>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6">
              <BoolField label="Tax abatement"            value={jurisdiction.hasTaxAbatement}        onChange={setJur('hasTaxAbatement')} />
              <BoolField label="Sales tax exemption"      value={jurisdiction.hasSalesTaxExemption}   onChange={setJur('hasSalesTaxExemption')} />
              <BoolField label="Property tax exemption"   value={jurisdiction.hasPropertyTaxExemption} onChange={setJur('hasPropertyTaxExemption')} />
              <BoolField label="Enterprise zone"          value={jurisdiction.enterpriseZone}         onChange={setJur('enterpriseZone')} />
              <BoolField label="Data center incentive"    value={jurisdiction.dataCenterIncentive}    onChange={setJur('dataCenterIncentive')} />
              <BoolField label="Crypto friendly"          value={jurisdiction.cryptoFriendly}         onChange={setJur('cryptoFriendly')} />
            </div>
            {jurisdiction.hasTaxAbatement && (
              <TextField label="Tax Abatement Details" value={jurisdiction.taxAbatementDetails} onChange={setJur('taxAbatementDetails')} textarea />
            )}

            <SectionTitle>Regulatory Environment</SectionTitle>
            <FieldRow>
              <SelectField label="Political Risk" value={jurisdiction.politicalRisk} onChange={setJur('politicalRisk')}
                options={['Low','Moderate','Elevated','High']} />
              <TextField  label="SPE Structure"   value={jurisdiction.speStructure}  onChange={setJur('speStructure')} placeholder="Delaware LLC" />
            </FieldRow>
            <TextField label="Financial Regulations Notes" value={jurisdiction.financialRegsNotes} onChange={setJur('financialRegsNotes')} textarea />
            <TextField label="Notes"                       value={jurisdiction.notes}              onChange={setJur('notes')} textarea />

            <SaveRow onSave={saveJurisdiction} saving={ss.saving} saved={ss.saved} error={ss.error} />
          </div>
        )}

      </div>
    </div>
  )
}
