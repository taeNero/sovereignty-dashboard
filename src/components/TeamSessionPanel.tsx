import { useState } from 'react'
import { motion } from 'framer-motion'
import { Users, Play, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { GUARDIAN_MAP, FOUR_GUARDIANS, ANGEL_FLOWISE_ID } from '../data/guardians'

type SessionState = 'idle' | 'running' | 'done' | 'error'

interface TeamSessionPanelProps {
  allMetrics?: Record<string, string>
}

function buildCouncilPrompt(briefing: string, allMetrics: Record<string, string>): string {
  const sections = FOUR_GUARDIANS.map(g => {
    const lines = g.metrics
      .filter(f => allMetrics[f.key])
      .map(f => `  - ${f.label}: ${allMetrics[f.key]}${f.unit ? ' ' + f.unit : ''}`)
      .join('\n')
    return `${g.name} (${g.domain}):\n${lines || '  (no data entered)'}`
  }).join('\n\n')

  const focusLine = briefing.trim()
    ? `Council focus: ${briefing.trim()}\n\n`
    : ''

  return (
    `${focusLine}` +
    `You are The Angel, Executive Synthesiser of the Diamond Protocol. ` +
    `The four Guardians have reported their domain metrics:\n\n${sections}\n\n` +
    `Synthesize cross-domain patterns, identify the single highest-leverage action across all domains, ` +
    `flag any critical risks or conflicts between domains, and deliver your executive directive for this week.`
  )
}

export default function TeamSessionPanel({ allMetrics = {} }: TeamSessionPanelProps) {
  const [state, setState]     = useState<SessionState>('idle')
  const [synthesis, setSynthesis] = useState<string | null>(null)
  const [errorMsg, setErrorMsg]   = useState<string | null>(null)
  const [briefing, setBriefing]   = useState('')
  const angel = GUARDIAN_MAP['angel']

  async function handleLaunch() {
    setState('running')
    setSynthesis(null)
    setErrorMsg(null)

    const flowiseBase = process.env.NEXT_PUBLIC_FLOWISE_BASE_URL?.replace(/\/$/, '')
    const flowiseKey  = process.env.NEXT_PUBLIC_FLOWISE_API_KEY
    const question    = buildCouncilPrompt(briefing, allMetrics)

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (flowiseKey) headers['Authorization'] = `Bearer ${flowiseKey}`

      const controller = new AbortController()
      const timeoutId  = setTimeout(() => controller.abort(), 60_000)

      const res = await fetch(`${flowiseBase}/${ANGEL_FLOWISE_ID}`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ question }),
        signal: controller.signal,
      })
      clearTimeout(timeoutId)

      if (!res.ok) throw new Error(`HTTP ${res.status} — ${res.statusText}`)

      const data = await res.json() as { text?: string; answer?: string }
      const reply = data.text ?? data.answer ?? '*(No response returned)*'

      setSynthesis(reply)
      setState('done')
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      setErrorMsg(msg)
      setState('error')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.4 }}
      className="rounded-2xl overflow-hidden"
      style={{
        border: '1px solid rgba(248,250,252,0.08)',
        background: 'rgba(8,8,26,0.7)',
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 px-5 py-4"
        style={{ borderBottom: '1px solid rgba(248,250,252,0.06)' }}
      >
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(248,250,252,0.06)', border: '1px solid rgba(248,250,252,0.12)' }}
        >
          <Users size={16} className="text-white/50" />
        </div>
        <div>
          <div className="font-semibold text-sm text-white/90">Council Session</div>
          <div className="text-[10px] text-white/30">All four guardians + Angel synthesis</div>
        </div>
        <div className="ml-auto">
          {state === 'running' && (
            <span className="text-[10px] text-white/40 flex items-center gap-1">
              <Loader2 size={10} className="animate-spin" /> Running…
            </span>
          )}
          {state === 'done' && (
            <span className="text-[10px] text-emerald-400 flex items-center gap-1">
              <CheckCircle size={10} /> Complete
            </span>
          )}
          {state === 'error' && (
            <span className="text-[10px] text-red-400 flex items-center gap-1">
              <AlertCircle size={10} /> Error
            </span>
          )}
        </div>
      </div>

      <div className="px-5 py-4 flex flex-col gap-3">
        {/* Briefing input */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-medium uppercase tracking-wider text-white/40">
            Session Briefing
          </label>
          <textarea
            rows={3}
            value={briefing}
            onChange={e => setBriefing(e.target.value)}
            disabled={state === 'running'}
            placeholder="Describe the focus for this council session… (e.g. Q2 planning, revenue crisis, content strategy)"
            className="w-full resize-none rounded-xl px-3 py-2.5 text-xs text-white/80 placeholder-white/20 outline-none disabled:opacity-40 transition-opacity"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          />
        </div>

        {/* Launch button */}
        <button
          onClick={handleLaunch}
          disabled={state === 'running'}
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-xs font-bold transition-all hover:brightness-110 active:scale-95 disabled:opacity-40"
          style={{
            background: 'rgba(248,250,252,0.06)',
            border: `1px solid ${angel.borderColor}`,
            color: angel.color,
            boxShadow: `0 0 16px ${angel.glowColor}`,
          }}
        >
          {state === 'running' ? (
            <><Loader2 size={13} className="animate-spin" /> Convening Council…</>
          ) : (
            <><Play size={13} /> Launch Council Session</>
          )}
        </button>

        {/* Error */}
        {state === 'error' && errorMsg && (
          <div
            className="rounded-xl p-3 text-xs text-red-400/80"
            style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}
          >
            {errorMsg}
          </div>
        )}

        {/* Angel synthesis result */}
        {synthesis && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl p-4 text-xs text-white/75 leading-relaxed prose-dark"
            style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${angel.borderColor}` }}
          >
            <div
              className="text-[9px] font-black tracking-[0.2em] uppercase mb-3"
              style={{ color: angel.color + '70' }}
            >
              Executive Synthesis
            </div>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {synthesis}
            </ReactMarkdown>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
