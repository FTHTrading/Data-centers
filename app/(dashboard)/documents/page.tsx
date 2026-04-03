'use client'

import { useState } from 'react'
import {
  FileText, Upload, CheckCircle2, Loader2,
  Building2, User, Mail, ChevronDown,
  Link2, MessageSquare, Send,
} from 'lucide-react'

const PROJECT_TYPES = [
  'Data Center Development',
  'Energy Infrastructure',
  'Capital Formation / SPV',
  'Treasury & Settlement',
  'RWA Tokenization',
  'AI Infrastructure',
  'Co-location or Leasing',
  'Partnership / JV',
  'Other',
]

const DOC_TYPES = [
  { id: 'feasibility',  label: 'Feasibility Study' },
  { id: 'site-plan',    label: 'Site Plan / Layout' },
  { id: 'power',        label: 'Power Agreements / Utility Docs' },
  { id: 'financial',    label: 'Financial Model' },
  { id: 'legal',        label: 'Legal / Corporate Docs' },
  { id: 'permits',      label: 'Permits & Entitlements' },
  { id: 'cap-stack',    label: 'Capital Stack Summary' },
  { id: 'tech',         label: 'Technical Specs / Engineering' },
  { id: 'env',          label: 'Environmental Reports' },
  { id: 'other',        label: 'Other Materials' },
]

interface FormState {
  company: string
  contact: string
  email: string
  projectType: string
  docTypes: string[]
  link: string
  notes: string
}

export default function DocumentsPage() {
  const [form, setForm] = useState<FormState>({
    company: '', contact: '', email: '',
    projectType: '', docTypes: [], link: '', notes: '',
  })
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [refId, setRefId] = useState<string>('')

  function toggleDoc(id: string) {
    setForm(f => ({
      ...f,
      docTypes: f.docTypes.includes(id)
        ? f.docTypes.filter(d => d !== id)
        : [...f.docTypes, id],
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.company || !form.email || !form.projectType) return
    setStatus('submitting')

    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (data.ok) {
        setRefId(data.id)
        setStatus('success')
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center space-y-6">
        <div className="w-20 h-20 rounded-2xl bg-green-500/15 border border-green-500/25 flex items-center justify-center mx-auto">
          <CheckCircle2 size={36} className="text-green-400" />
        </div>
        <h1 className="text-3xl font-bold text-white">Submission Received</h1>
        <p className="text-[#7c8494] text-sm leading-relaxed max-w-md mx-auto">
          Your project documents have been logged and routed to the UnyKorn review team.
          We will follow up via the email address you provided.
        </p>
        <div className="glass rounded-2xl p-5 text-left space-y-2 max-w-sm mx-auto">
          <div className="text-[10px] text-[#4a5068] uppercase tracking-widest">Reference ID</div>
          <div className="font-mono text-sm text-white">{refId}</div>
          <div className="text-[10px] text-[#4a5068] mt-2">Keep this for your records. Average response time: 2–3 business days.</div>
        </div>
        <button
          onClick={() => { setStatus('idle'); setForm({ company: '', contact: '', email: '', projectType: '', docTypes: [], link: '', notes: '' }) }}
          className="text-xs text-blue-400 hover:text-blue-300 transition-colors underline underline-offset-2"
        >
          Submit another inquiry
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto pb-20 space-y-8">

      {/* Header */}
      <div>
        <span className="section-label mb-5 inline-flex"><FileText size={11} /> Document Submission</span>
        <h1 className="mt-4 text-2xl md:text-3xl font-bold text-white">Submit Your Documents</h1>
        <p className="mt-3 text-[#7c8494] text-sm leading-relaxed max-w-xl">
          Send us your project materials for review. Include a shared link to Google Drive, Dropbox,
          or a similar service. We handle all document types: site plans, feasibility studies, financial
          models, legal structures, cap stacks, and technical specs.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Contact info */}
        <div className="glass rounded-2xl p-6 space-y-5">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <User size={14} className="text-blue-400" /> Contact Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] text-[#6b7485] uppercase tracking-wider mb-1.5">
                Company / Entity Name <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Building2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4a5068]" />
                <input
                  required
                  type="text"
                  placeholder="Acme Infrastructure LLC"
                  value={form.company}
                  onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
                  className="form-input pl-9 w-full"
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] text-[#6b7485] uppercase tracking-wider mb-1.5">Contact Name</label>
              <div className="relative">
                <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4a5068]" />
                <input
                  type="text"
                  placeholder="John Smith"
                  value={form.contact}
                  onChange={e => setForm(f => ({ ...f, contact: e.target.value }))}
                  className="form-input pl-9 w-full"
                />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-[11px] text-[#6b7485] uppercase tracking-wider mb-1.5">
              Email Address <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4a5068]" />
              <input
                required
                type="email"
                placeholder="you@company.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="form-input pl-9 w-full"
              />
            </div>
          </div>
        </div>

        {/* Project type */}
        <div className="glass rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <Building2 size={14} className="text-violet-400" /> Project Type
            <span className="text-red-400 text-xs ml-1">*</span>
          </h2>
          <div className="relative">
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4a5068] pointer-events-none" />
            <select
              required
              value={form.projectType}
              onChange={e => setForm(f => ({ ...f, projectType: e.target.value }))}
              className="form-input w-full appearance-none pr-8 cursor-pointer"
            >
              <option value="">Select project type…</option>
              {PROJECT_TYPES.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Document types */}
        <div className="glass rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <FileText size={14} className="text-green-400" /> Documents Included
          </h2>
          <p className="text-[11px] text-[#4a5068]">Select all document types you plan to share</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {DOC_TYPES.map(dt => (
              <button
                key={dt.id}
                type="button"
                onClick={() => toggleDoc(dt.id)}
                className={`text-left text-[11px] px-3 py-2 rounded-lg border transition-all ${
                  form.docTypes.includes(dt.id)
                    ? 'border-blue-500/40 bg-blue-500/10 text-blue-300'
                    : 'border-white/[0.06] bg-white/[0.02] text-[#6b7485] hover:border-white/[0.12] hover:text-white'
                }`}
              >
                {form.docTypes.includes(dt.id) && (
                  <CheckCircle2 size={10} className="inline mr-1.5 mb-0.5 text-blue-400" />
                )}
                {dt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Link + notes */}
        <div className="glass rounded-2xl p-6 space-y-5">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <Link2 size={14} className="text-cyan-400" /> Document Link & Notes
          </h2>
          <div>
            <label className="block text-[11px] text-[#6b7485] uppercase tracking-wider mb-1.5">
              Shared Drive Link
            </label>
            <div className="relative">
              <Link2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4a5068]" />
              <input
                type="url"
                placeholder="https://drive.google.com/…"
                value={form.link}
                onChange={e => setForm(f => ({ ...f, link: e.target.value }))}
                className="form-input pl-9 w-full"
              />
            </div>
            <p className="mt-1.5 text-[10px] text-[#3a4058]">
              Share view access before submitting. Google Drive, Dropbox, OneDrive, or Box accepted.
            </p>
          </div>
          <div>
            <label className="block text-[11px] text-[#6b7485] uppercase tracking-wider mb-1.5">
              Additional Notes
            </label>
            <div className="relative">
              <MessageSquare size={14} className="absolute left-3 top-3 text-[#4a5068]" />
              <textarea
                rows={4}
                placeholder="Describe your project, timeline, what you need from UnyKorn, any context that helps us route your inquiry correctly…"
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                className="form-input pl-9 w-full resize-none"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={status === 'submitting'}
            className="cta-primary flex items-center gap-2.5 px-8 py-3.5 rounded-xl font-bold text-sm text-white disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {status === 'submitting' ? (
              <><Loader2 size={16} className="animate-spin" /> Submitting…</>
            ) : (
              <><Send size={16} /> Submit Documents</>
            )}
          </button>
          {status === 'error' && (
            <span className="text-xs text-red-400">Submission failed. Please try again.</span>
          )}
        </div>

        <p className="text-[11px] text-[#3a4058] leading-relaxed">
          Your documents are reviewed by UnyKorn's institutional team. We do not share your materials
          with third parties without your consent. All submissions are treated as confidential.
        </p>
      </form>
    </div>
  )
}
