'use client'

import { useState, useCallback, useRef } from 'react'
import { computeQual, type QualState } from '@/lib/ai-qualify'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  streaming?: boolean
}

interface UseAdvisorOptions {
  isPublic?: boolean
  onQualUpdate?: (qual: QualState) => void
}

const WELCOME: Message = {
  id: 'welcome',
  role: 'assistant',
  content: `DC Advisor initialized.\n\nI assess and advise on institutional data center investment and development. Two questions to calibrate:\n\n1 — What's your background in this space?\n2 — What are you trying to accomplish — evaluating a specific site, building a thesis, or understanding the market?`,
}

export function useAdvisor({ isPublic = false, onQualUpdate }: UseAdvisorOptions = {}) {
  const [messages, setMessages] = useState<Message[]>([WELCOME])
  const [status, setStatus] = useState<'idle' | 'loading' | 'streaming' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)
  const [qual, setQual] = useState<QualState>({ score: 50, level: 'assessing', signals: [], messageCount: 0 })
  const abortRef = useRef<AbortController | null>(null)

  const send = useCallback(async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || status === 'loading' || status === 'streaming') return

    // Abort any in-flight stream
    abortRef.current?.abort()
    abortRef.current = new AbortController()

    const userMsg: Message = { id: `u-${Date.now()}`, role: 'user', content: trimmed }
    const assistantId = `a-${Date.now()}`

    setMessages(prev => [...prev, userMsg])
    setStatus('loading')
    setError(null)

    // Build the API message history (exclude welcome, no streaming placeholders)
    const apiMessages = [...messages.filter(m => m.id !== 'welcome'), userMsg]
      .map(m => ({ role: m.role, content: m.content }))

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: abortRef.current.signal,
        body: JSON.stringify({ messages: apiMessages, isPublic }),
      })

      if (!res.ok) {
        const { error: errCode } = await res.json().catch(() => ({ error: 'UNKNOWN' }))
        if (errCode === 'AI_NOT_CONFIGURED') {
          setError('AI_NOT_CONFIGURED')
        } else {
          setError('Failed to reach the AI. Please try again.')
        }
        setStatus('error')
        return
      }

      // Add streaming placeholder
      setMessages(prev => [...prev, { id: assistantId, role: 'assistant', content: '', streaming: true }])
      setStatus('streaming')

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let accumulated = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6).trim()
          if (data === '[DONE]') break
          try {
            const parsed = JSON.parse(data)
            if (typeof parsed.t === 'string') {
              accumulated += parsed.t
              const snap = accumulated
              setMessages(prev =>
                prev.map(m => m.id === assistantId ? { ...m, content: snap } : m)
              )
            }
          } catch { /* skip */ }
        }
      }

      // Finalize — remove streaming flag
      setMessages(prev =>
        prev.map(m => m.id === assistantId ? { ...m, streaming: false } : m)
      )

      // Update qualification score using all user messages including this one
      const allUserContent = [...messages, userMsg]
        .filter(m => m.role === 'user' && m.id !== 'welcome')
        .map(m => m.content)
      const newQual = computeQual(allUserContent)
      setQual(newQual)
      onQualUpdate?.(newQual)

      setStatus('idle')
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        setStatus('idle')
        return
      }
      setError('Connection interrupted. Please try again.')
      setStatus('error')
      // Remove the empty placeholder if it exists
      setMessages(prev => prev.filter(m => m.id !== assistantId))
    }
  }, [messages, status, isPublic, onQualUpdate])

  const reset = useCallback(() => {
    abortRef.current?.abort()
    setMessages([WELCOME])
    setStatus('idle')
    setError(null)
    setQual({ score: 50, level: 'assessing', signals: [], messageCount: 0 })
  }, [])

  return { messages, status, error, qual, send, reset }
}
