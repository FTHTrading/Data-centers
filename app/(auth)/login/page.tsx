'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const res = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })
    setLoading(false)
    if (res?.error) {
      setError('Invalid credentials. Check email and password.')
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-grid-pattern flex items-center justify-center p-4">
      <div className="dc-card w-full max-w-sm p-8 space-y-6">
        {/* Logo */}
        <div className="text-center space-y-1">
          <div className="text-[--accent-blue] text-xs uppercase tracking-widest font-semibold">
            UnyKorn
          </div>
          <h1 className="text-xl font-bold text-[--text-primary]">DC Operating System</h1>
          <p className="text-xs text-[--text-muted]">Institutional access only</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-[--text-muted] mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="dc-input"
              placeholder="you@unykorn.org"
            />
          </div>
          <div>
            <label className="block text-xs text-[--text-muted] mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="dc-input"
              placeholder="••••••••"
            />
          </div>
          {error && (
            <div className="text-xs text-[--accent-red] bg-red-950/30 border border-red-900/40 rounded px-3 py-2">
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full justify-center py-2.5"
          >
            {loading ? 'Authenticating…' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-xs text-[--text-dimmed]">
          Unauthorized access is prohibited and monitored.
        </p>
      </div>
    </div>
  )
}
