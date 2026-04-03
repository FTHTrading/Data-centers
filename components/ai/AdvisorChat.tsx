'use client'

import { useState, useRef, useEffect } from 'react'
import { useAdvisor } from './useAdvisor'
import { QUAL_META, REDIRECT_RESOURCES } from '@/lib/ai-qualify'
import {
  MessageSquare, X, Minus, Send, RotateCcw,
  AlertTriangle, ExternalLink, Download,
} from 'lucide-react'
import Link from 'next/link'

const SUGGESTION_CHIPS = [
  'Evaluate a specific site',
  'Explain yield on cost',
  'What makes a site institutional-grade?',
  'How does the scoring work?',
  'Walk me through power diligence',
  'What does a cap stack look like?',
]

interface AdvisorChatProps {
  /** If true, runs in public mode (no auth required for API calls) */
  isPublic?: boolean
  /** Pre-open the panel */
  defaultOpen?: boolean
}

export function AdvisorChat({ isPublic = false, defaultOpen = false }: AdvisorChatProps) {
  const [open, setOpen] = useState(defaultOpen)
  const [minimized, setMinimized] = useState(false)
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const { messages, status, error, qual, send, reset } = useAdvisor({ isPublic })

  const qualConfig = QUAL_META[qual.level]
  const isLoading = status === 'loading' || status === 'streaming'
  const showRedirectCard = qual.level === 'redirect' && qual.messageCount >= 3
  const showConfigError = error === 'AI_NOT_CONFIGURED'

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input when panel opens
  useEffect(() => {
    if (open && !minimized) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open, minimized])

  async function handleSend() {
    if (!input.trim() || isLoading) return
    await send(input)
    setInput('')
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  async function handleChip(chip: string) {
    if (isLoading) return
    await send(chip)
  }

  return (
    <>
      {/* Floating toggle button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-3 bg-[--accent-blue] text-white rounded-full shadow-2xl hover:bg-blue-600 transition-all hover:scale-105 active:scale-95 text-xs font-bold"
          aria-label="Open DC Advisor"
        >
          <MessageSquare size={15} />
          DC ADVISOR
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div
          className={`fixed bottom-5 right-5 z-50 flex flex-col bg-[--bg-card] border border-[--bg-border] rounded-lg shadow-2xl transition-all ${
            minimized ? 'h-11 w-72 overflow-hidden' : 'w-[380px] h-[560px]'
          }`}
          style={{ maxHeight: 'calc(100vh - 40px)' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2.5 border-b border-[--bg-border] bg-[--bg-hover] rounded-t-lg flex-shrink-0">
            <div className="flex items-center gap-2">
              <MessageSquare size={13} className="text-[--accent-blue]" />
              <span className="text-xs font-bold text-[--text-primary] tracking-wide">DC ADVISOR</span>
              <span
                className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                style={{ color: qualConfig.color, background: `${qualConfig.color}18` }}
              >
                {qualConfig.label}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => { reset(); }}
                title="New conversation"
                className="p-1 text-[--text-dimmed] hover:text-[--text-muted] transition-colors"
              >
                <RotateCcw size={12} />
              </button>
              <button
                onClick={() => setMinimized(m => !m)}
                title={minimized ? 'Expand' : 'Minimize'}
                className="p-1 text-[--text-dimmed] hover:text-[--text-muted] transition-colors"
              >
                <Minus size={12} />
              </button>
              <button
                onClick={() => setOpen(false)}
                title="Close"
                className="p-1 text-[--text-dimmed] hover:text-[--text-muted] transition-colors"
              >
                <X size={12} />
              </button>
            </div>
          </div>

          {!minimized && (
            <>
              {/* Configuration error state */}
              {showConfigError && (
                <div className="flex-1 flex flex-col items-center justify-center p-5 gap-3 text-center">
                  <AlertTriangle size={20} className="text-[--accent-amber]" />
                  <div>
                    <p className="text-xs font-bold text-[--text-primary]">AI Advisor Not Configured</p>
                    <p className="text-[11px] text-[--text-muted] mt-1">
                      Add your <code className="text-[--accent-blue]">OPENAI_API_KEY</code> to <code className="text-[--accent-blue]">.env</code> to enable the AI Advisor.
                    </p>
                  </div>
                  <Link
                    href="/dashboard/learn"
                    className="text-[11px] text-[--accent-blue] hover:underline flex items-center gap-1"
                  >
                    Browse the DC Guide instead <ExternalLink size={10} />
                  </Link>
                </div>
              )}

              {/* Normal chat state */}
              {!showConfigError && (
                <>
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-3 space-y-3">
                    {messages.map(msg => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`rounded px-3 py-2 text-[11px] leading-relaxed max-w-[88%] whitespace-pre-wrap ${
                            msg.role === 'user'
                              ? 'bg-[--accent-blue]/20 text-[--text-primary] rounded-br-none'
                              : 'bg-[--bg-hover] text-[--text-primary] rounded-bl-none border border-[--bg-border]'
                          }`}
                        >
                          {msg.content}
                          {msg.streaming && (
                            <span className="inline-block ml-0.5 w-1 h-3 bg-[--accent-blue] animate-pulse align-middle" />
                          )}
                        </div>
                      </div>
                    ))}

                    {/* Loading indicator (before first stream token) */}
                    {status === 'loading' && (
                      <div className="flex justify-start">
                        <div className="bg-[--bg-hover] border border-[--bg-border] rounded rounded-bl-none px-3 py-2">
                          <div className="flex gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[--text-dimmed] animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-1.5 h-1.5 rounded-full bg-[--text-dimmed] animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-1.5 h-1.5 rounded-full bg-[--text-dimmed] animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Generic error */}
                    {error && !showConfigError && (
                      <div className="flex justify-start">
                        <div className="bg-red-950/30 border border-red-900/30 rounded px-3 py-2 text-[11px] text-[--accent-red]">
                          {error}
                        </div>
                      </div>
                    )}

                    {/* Redirect card — shown when score drops and enough exchanges */}
                    {showRedirectCard && (
                      <div className="border border-[--accent-amber]/30 bg-amber-950/10 rounded p-3 space-y-2">
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-[--accent-amber]">
                          <AlertTriangle size={11} />
                          Suggested: Build your foundation first
                        </div>
                        <p className="text-[10px] text-[--text-muted]">
                          The DC Guide covers everything you need to get to execution-ready. Start here:
                        </p>
                        <div className="space-y-1">
                          {REDIRECT_RESOURCES.map(r => (
                            r.href.startsWith('/api')
                              ? (
                                <a
                                  key={r.href}
                                  href={r.href}
                                  download
                                  className="flex items-center gap-1.5 text-[10px] text-[--accent-blue] hover:underline"
                                >
                                  <Download size={9} />
                                  {r.label}
                                </a>
                              )
                              : (
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

                    {/* Suggestion chips — shown after welcome message only */}
                    {messages.length === 1 && !isLoading && (
                      <div className="space-y-1">
                        <p className="text-[10px] text-[--text-dimmed]">Quick starts:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {SUGGESTION_CHIPS.map(chip => (
                            <button
                              key={chip}
                              onClick={() => handleChip(chip)}
                              className="px-2 py-1 text-[10px] border border-[--bg-border] text-[--text-muted] rounded hover:border-[--accent-blue] hover:text-[--text-primary] transition-colors"
                            >
                              {chip}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>

                  {/* Qual score bar */}
                  {qual.messageCount > 0 && (
                    <div className="px-3 py-1.5 border-t border-[--bg-border] flex items-center gap-2">
                      <span className="text-[10px] text-[--text-dimmed] flex-shrink-0">Readiness</span>
                      <div className="flex-1 h-1 bg-[--bg-hover] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${qual.score}%`,
                            backgroundColor: qualConfig.color,
                          }}
                        />
                      </div>
                      <span
                        className="text-[10px] font-bold flex-shrink-0"
                        style={{ color: qualConfig.color }}
                      >
                        {qual.score}
                      </span>
                    </div>
                  )}

                  {/* Input area */}
                  <div className="p-2.5 border-t border-[--bg-border] flex gap-2 items-end">
                    <textarea
                      ref={inputRef}
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      disabled={isLoading}
                      placeholder={isLoading ? 'Thinking…' : 'Ask anything about data centers…'}
                      rows={1}
                      className="flex-1 bg-[--bg-hover] border border-[--bg-border] rounded px-2.5 py-2 text-[11px] text-[--text-primary] placeholder:text-[--text-dimmed] resize-none outline-none focus:border-[--accent-blue] transition-colors disabled:opacity-60"
                      style={{ minHeight: 36, maxHeight: 100 }}
                      onInput={e => {
                        const el = e.currentTarget
                        el.style.height = 'auto'
                        el.style.height = `${Math.min(el.scrollHeight, 100)}px`
                      }}
                    />
                    <button
                      onClick={handleSend}
                      disabled={!input.trim() || isLoading}
                      className="flex-shrink-0 p-2 bg-[--accent-blue] text-white rounded hover:bg-blue-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Send size={13} />
                    </button>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      )}
    </>
  )
}
