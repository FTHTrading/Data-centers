'use client'

import { useState, useRef, useEffect } from 'react'
import { useAdvisor } from '@/components/ai/useAdvisor'
import { QUAL_META, REDIRECT_RESOURCES, type QualState } from '@/lib/ai-qualify'
import { Send, RotateCcw, AlertTriangle, ExternalLink, Download, CheckCircle2, ArrowRight } from 'lucide-react'
import Link from 'next/link'

const QUICK_STARTS = [
  'I manage a family office portfolio and want to add data centers',
  "I'm an operator looking for institutional capital partners",
  'I have an equity mandate from a REIT and a specific market in mind',
  "I'm new to this space and exploring if it's right for me",
  'I own a site with power and want to develop it',
  'I want to understand the investment thesis',
]

const PLATFORM_STANDARDS = [
  '$10M+ minimum check size or equity commitment',
  'Specific market, site, or operational mandate',
  'Institutional debt or equity relationships in place',
  'Willingness to execute — not just learn or explore',
]

export default function QualifyPage() {
  const [qual, setQual] = useState<QualState>({ score: 50, level: 'assessing', signals: [], messageCount: 0 })
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const { messages, status, error, send, reset } = useAdvisor({
    isPublic: true,
    onQualUpdate: setQual,
  })

  const isLoading = status === 'loading' || status === 'streaming'
  const qualConfig = QUAL_META[qual.level]
  const showConfigError = error === 'AI_NOT_CONFIGURED'
  const showInstitutional = qual.level === 'institutional' && qual.messageCount >= 3
  const showRedirect = qual.level === 'redirect' && qual.messageCount >= 3

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  async function handleSend() {
    if (!input.trim() || isLoading) return
    await send(input)
    setInput('')
  }

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left — context panel */}
      <div className="lg:w-[360px] lg:min-h-screen flex-shrink-0 bg-[--bg-card] border-b lg:border-b-0 lg:border-r border-[--bg-border] flex flex-col p-6 gap-6">
        {/* Logo + title */}
        <div>
          <div className="text-[--accent-blue] font-bold tracking-widest text-sm mb-1">UNYKORN DC-OS</div>
          <h1 className="text-xl font-bold text-[--text-primary] leading-tight">
            Are you ready for this?
          </h1>
          <p className="text-xs text-[--text-muted] mt-2 leading-relaxed">
            This platform is built for institutional capital deployers executing real data center acquisitions and developments.
            Not everyone is — and that&apos;s fine.
          </p>
          <p className="text-xs text-[--text-muted] mt-2 leading-relaxed">
            Have an honest conversation with the DC Advisor. In a few exchanges it will tell you where you stand
            — and exactly what to do next regardless of your answer.
          </p>
        </div>

        {/* Platform standards */}
        <div>
          <div className="text-[10px] font-bold text-[--text-dimmed] uppercase tracking-widest mb-2">Platform Standards</div>
          <div className="space-y-1.5">
            {PLATFORM_STANDARDS.map((s, i) => (
              <div key={i} className="flex gap-2 text-[11px] text-[--text-muted]">
                <span className="text-[--accent-blue] flex-shrink-0 mt-0.5">—</span>
                {s}
              </div>
            ))}
          </div>
        </div>

        {/* Live qualification status */}
        {qual.messageCount > 0 && (
          <div className="border border-[--bg-border] rounded p-3 space-y-2">
            <div className="text-[10px] font-bold text-[--text-dimmed] uppercase tracking-widest">Your Assessment</div>
            <div className="flex items-center gap-2">
              <span
                className="text-xs font-bold px-2 py-0.5 rounded"
                style={{ color: qualConfig.color, background: `${qualConfig.color}18` }}
              >
                {qualConfig.label}
              </span>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-[--text-dimmed]">
                <span>Readiness score</span>
                <span style={{ color: qualConfig.color }}>{qual.score} / 100</span>
              </div>
              <div className="h-1.5 bg-[--bg-hover] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${qual.score}%`, backgroundColor: qualConfig.color }}
                />
              </div>
            </div>
            <p className="text-[10px] text-[--text-muted] italic">{qualConfig.description}</p>
          </div>
        )}

        {/* Result card — INSTITUTIONAL */}
        {showInstitutional && (
          <div className="border border-green-800/40 bg-green-950/20 rounded p-3 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[--accent-green]">
              <CheckCircle2 size={13} />
              You belong here.
            </div>
            <p className="text-[11px] text-[--text-muted]">
              Your profile aligns with the platform&apos;s institutional standards. DC-OS has the tools you need for sourcing, scoring, and closing.
            </p>
            <Link
              href="/login"
              className="flex items-center gap-1.5 text-xs font-bold text-[--accent-blue] hover:underline mt-1"
            >
              Request access <ArrowRight size={11} />
            </Link>
          </div>
        )}

        {/* Result card — REDIRECT */}
        {showRedirect && (
          <div className="border border-amber-800/30 bg-amber-950/10 rounded p-3 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[--accent-amber]">
              <AlertTriangle size={13} />
              Build your foundation first.
            </div>
            <p className="text-[11px] text-[--text-muted]">
              The DC Institutional Playbook covers everything you need to close this gap. It&apos;s the honest starting point.
            </p>
            <div className="space-y-1 mt-1">
              {REDIRECT_RESOURCES.slice(0, 4).map(r => (
                r.href.startsWith('/api') ? (
                  <a
                    key={r.href}
                    href={r.href}
                    download
                    className="flex items-center gap-1.5 text-[10px] text-[--accent-blue] hover:underline"
                  >
                    <Download size={9} />
                    {r.label}
                  </a>
                ) : (
                  <Link
                    key={`${r.href}-${r.section}`}
                    href={r.href}
                    className="flex items-center gap-1.5 text-[10px] text-[--accent-blue] hover:underline"
                  >
                    <ExternalLink size={9} />
                    {r.label}
                  </Link>
                )
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-auto text-[10px] text-[--text-dimmed]">
          &copy; {new Date().getFullYear()} UnyKorn DC-OS &mdash; Institutional Use Only
        </div>
      </div>

      {/* Right — chat interface */}
      <div className="flex-1 flex flex-col min-h-screen lg:min-h-0 lg:h-screen">
        {/* Chat header */}
        <div className="flex-shrink-0 flex items-center justify-between px-5 py-3 border-b border-[--bg-border] bg-[--bg-card]">
          <div>
            <span className="text-xs font-bold text-[--text-primary]">DC ADVISOR</span>
            <span className="text-[10px] text-[--text-dimmed] ml-2">AI qualification interview</span>
          </div>
          <button
            onClick={reset}
            className="flex items-center gap-1 text-[10px] text-[--text-dimmed] hover:text-[--text-muted] transition-colors"
          >
            <RotateCcw size={11} />
            Start over
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">

          {showConfigError && (
            <div className="max-w-lg mx-auto mt-10 p-5 border border-[--bg-border] rounded text-center space-y-3">
              <AlertTriangle size={20} className="mx-auto text-[--accent-amber]" />
              <p className="text-xs font-bold text-[--text-primary]">AI Advisor Not Configured</p>
              <p className="text-[11px] text-[--text-muted]">
                An <code className="text-[--accent-blue]">OPENAI_API_KEY</code> is required to use this feature.
              </p>
            </div>
          )}

          {!showConfigError && messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[75%] rounded px-4 py-3 text-[12px] leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-[--accent-blue]/20 text-[--text-primary] rounded-br-none'
                    : 'bg-[--bg-card] text-[--text-primary] border border-[--bg-border] rounded-bl-none'
                }`}
              >
                {msg.role === 'assistant' && (
                  <div className="text-[9px] font-bold text-[--accent-blue] uppercase tracking-widest mb-1.5 opacity-60">DC Advisor</div>
                )}
                {msg.content}
                {msg.streaming && (
                  <span className="inline-block ml-0.5 w-1.5 h-3.5 bg-[--accent-blue] animate-pulse align-middle" />
                )}
              </div>
            </div>
          ))}

          {status === 'loading' && (
            <div className="flex justify-start">
              <div className="bg-[--bg-card] border border-[--bg-border] rounded rounded-bl-none px-4 py-3">
                <div className="flex gap-1.5 items-center">
                  <span className="w-2 h-2 rounded-full bg-[--text-dimmed] animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full bg-[--text-dimmed] animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full bg-[--text-dimmed] animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          {error && !showConfigError && (
            <div className="flex justify-center">
              <div className="text-[11px] text-[--accent-red] bg-red-950/20 border border-red-900/30 rounded px-3 py-2">
                {error}
              </div>
            </div>
          )}

          {/* Quick start chips — only on welcome */}
          {messages.length === 1 && !isLoading && (
            <div className="max-w-lg">
              <p className="text-[10px] text-[--text-dimmed] mb-2">Or pick a starting point:</p>
              <div className="flex flex-wrap gap-2">
                {QUICK_STARTS.map(chip => (
                  <button
                    key={chip}
                    onClick={() => { send(chip); }}
                    className="px-3 py-1.5 text-[11px] border border-[--bg-border] text-[--text-muted] rounded hover:border-[--accent-blue] hover:text-[--text-primary] transition-colors text-left"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        {!showConfigError && (
          <div className="flex-shrink-0 p-4 border-t border-[--bg-border] bg-[--bg-card]">
            <div className="flex gap-3 items-end max-w-3xl">
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                disabled={isLoading}
                placeholder={isLoading ? 'DC Advisor is responding…' : 'Tell me about your background and what you\'re trying to do…'}
                rows={1}
                className="flex-1 bg-[--bg-hover] border border-[--bg-border] rounded px-3 py-2.5 text-[12px] text-[--text-primary] placeholder:text-[--text-dimmed] resize-none outline-none focus:border-[--accent-blue] transition-colors disabled:opacity-60"
                style={{ minHeight: 42, maxHeight: 140 }}
                onInput={e => {
                  const el = e.currentTarget
                  el.style.height = 'auto'
                  el.style.height = `${Math.min(el.scrollHeight, 140)}px`
                }}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="flex-shrink-0 p-2.5 bg-[--accent-blue] text-white rounded hover:bg-blue-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Send size={15} />
              </button>
            </div>
            <p className="text-[10px] text-[--text-dimmed] mt-2">
              Press Enter to send &mdash; Shift+Enter for new line &mdash; Your conversation is private and not stored.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
