import { useState, useEffect, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { Diamond, Loader2 } from 'lucide-react'
import { supabase, supabaseConfigured } from '../lib/supabase'

interface AuthGateProps { children: ReactNode }

export default function AuthGate({ children }: AuthGateProps) {
  const [session, setSession] = useState<Session | null | 'loading'>('loading')
  const [email, setEmail]     = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]     = useState<string | null>(null)
  const [busy, setBusy]       = useState(false)
  const [mode, setMode]       = useState<'login' | 'signup'>('login')

  useEffect(() => {
    // If Supabase is not configured, skip auth entirely
    if (!supabaseConfigured) { setSession(null); return }

    supabase.auth.getSession().then(({ data }) => setSession(data.session))

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => subscription.unsubscribe()
  }, [])

  // ── Not configured → bypass auth, show app ────────────────────────────────
  if (!supabaseConfigured) return <>{children}</>

  // ── Loading ───────────────────────────────────────────────────────────────
  if (session === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#06060e' }}>
        <Loader2 size={20} className="animate-spin text-white/20" />
      </div>
    )
  }

  // ── Authenticated → show app ───────────────────────────────────────────────
  if (session !== null) return <>{children}</>

  // ── Login / signup form ───────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setBusy(true)
    const fn = mode === 'login'
      ? supabase.auth.signInWithPassword({ email, password })
      : supabase.auth.signUp({ email, password })
    const { error } = await fn
    if (error) setError(error.message)
    setBusy(false)
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-8"
      style={{ background: '#06060e' }}
    >
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, rgba(168,85,247,0.35), rgba(59,130,246,0.18))',
              border: '1px solid rgba(168,85,247,0.38)',
              boxShadow: '0 0 40px rgba(168,85,247,0.12)',
            }}
          >
            <Diamond size={24} className="text-white/80" />
          </div>
          <div className="text-center">
            <div className="font-bold text-white/90 tracking-wide">Diamond Protocol</div>
            <div className="text-white/30 text-xs mt-0.5 tracking-widest uppercase">Sovereignty OS</div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Email"
            required
            autoComplete="email"
            className="w-full px-4 py-3 rounded-xl text-sm text-white/85 placeholder-white/22 outline-none transition-colors"
            style={{
              background: 'rgba(255,255,255,0.045)',
              border: '1px solid rgba(255,255,255,0.09)',
            }}
            onFocus={e => (e.currentTarget.style.borderColor = 'rgba(168,85,247,0.45)')}
            onBlur={e  => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)')}
          />
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Password"
            required
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            className="w-full px-4 py-3 rounded-xl text-sm text-white/85 placeholder-white/22 outline-none transition-colors"
            style={{
              background: 'rgba(255,255,255,0.045)',
              border: '1px solid rgba(255,255,255,0.09)',
            }}
            onFocus={e => (e.currentTarget.style.borderColor = 'rgba(168,85,247,0.45)')}
            onBlur={e  => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)')}
          />

          {error && (
            <p className="text-red-400/75 text-xs px-1 leading-relaxed">{error}</p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full py-3 rounded-xl text-sm font-bold transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50 mt-1 flex items-center justify-center gap-2"
            style={{
              background: 'linear-gradient(135deg, rgba(168,85,247,0.32), rgba(59,130,246,0.22))',
              border: '1px solid rgba(168,85,247,0.40)',
              color: 'rgba(248,250,252,0.90)',
              boxShadow: '0 0 20px rgba(168,85,247,0.10)',
            }}
          >
            {busy && <Loader2 size={13} className="animate-spin" />}
            {busy ? 'Authenticating…' : mode === 'login' ? 'Enter the Protocol' : 'Create Account'}
          </button>
        </form>

        <button
          onClick={() => { setMode(m => m === 'login' ? 'signup' : 'login'); setError(null) }}
          className="w-full mt-5 text-center text-xs text-white/25 hover:text-white/50 transition-colors"
        >
          {mode === 'login' ? 'No account? Create one' : 'Have an account? Sign in'}
        </button>
      </div>
    </div>
  )
}
