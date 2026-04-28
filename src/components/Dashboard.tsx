import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Diamond, Save, CheckCircle, Clock, ChevronDown, Trash2 } from 'lucide-react'
import type { GuardianId } from '../data/guardians'
import { FOUR_GUARDIANS } from '../data/guardians'
import { useLocalSession } from '../hooks/useLocalSession'
import { buildSessionPayload } from '../lib/sessionPayload'
import { supabase, supabaseConfigured } from '../lib/supabase'
import DailyResonanceBanner from './DailyResonanceBanner'
import DiamondNav from './DiamondNav'
import MetricsSummaryBar from './MetricsSummaryBar'
import GuardianCard from './GuardianCard'
import TeamSessionPanel from './TeamSessionPanel'
import AngelConsole from './AngelConsole'

// ─── Constants ────────────────────────────────────────────────────────────────
const FLASH_MS = 2200

// ─── Session history drawer ───────────────────────────────────────────────────
interface HistoryDrawerProps {
  sessions: ReturnType<typeof useLocalSession>['sessions']
  onLoad: (metrics: Record<string, string>, label: string) => void
  onRemove: (id: string) => void
  onClose: () => void
}

function HistoryDrawer({ sessions, onLoad, onRemove, onClose }: HistoryDrawerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -6, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.97 }}
      transition={{ duration: 0.16 }}
      className="absolute right-0 top-full mt-2 w-80 rounded-2xl overflow-hidden z-[60]"
      style={{
        background: 'rgba(8,8,26,0.97)',
        border: '1px solid rgba(248,250,252,0.10)',
        backdropFilter: 'blur(28px)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.7)',
      }}
    >
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <span className="text-[10px] font-black tracking-[0.18em] uppercase text-white/50">
          Saved Sessions
        </span>
        <button
          onClick={onClose}
          className="text-[10px] text-white/30 hover:text-white/60 transition-colors"
        >
          Close
        </button>
      </div>

      <div className="max-h-72 overflow-y-auto">
        {sessions.length === 0 ? (
          <div className="px-4 py-6 text-center text-xs text-white/25 italic">
            No sessions saved yet.
          </div>
        ) : (
          sessions.map(s => (
            <div
              key={s.id}
              className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.03] transition-colors group"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
            >
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-white/80 truncate">{s.label}</div>
                <div className="text-[10px] text-white/28 mt-0.5">
                  {new Date(s.savedAt).toLocaleString([], {
                    month: 'short', day: 'numeric',
                    hour: '2-digit', minute: '2-digit',
                  })}
                </div>
              </div>
              <button
                onClick={() => { onLoad(s.metrics, s.label); onClose() }}
                className="text-[10px] font-semibold px-2.5 py-1 rounded-lg transition-all hover:brightness-110 shrink-0"
                style={{
                  background: 'rgba(168,85,247,0.14)',
                  border: '1px solid rgba(168,85,247,0.28)',
                  color: '#a855f7',
                }}
              >
                Load
              </button>
              <button
                onClick={() => onRemove(s.id)}
                className="shrink-0 opacity-0 group-hover:opacity-100 p-1 rounded-lg text-white/28 hover:text-red-400 transition-all"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))
        )}
      </div>
    </motion.div>
  )
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [expandedId, setExpandedId]     = useState<GuardianId | null>(null)
  const [activeNav, setActiveNav]       = useState<GuardianId>('kael')
  const [allMetrics, setAllMetrics]     = useState<Record<string, string>>({})
  const [sessionLabel, setSessionLabel] = useState('')
  const [savedFlash, setSavedFlash]     = useState(false)
  const [showHistory, setShowHistory]   = useState(false)

  const historyRef  = useRef<HTMLDivElement>(null)
  const flashTimer  = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { sessions, isLoading, save, remove } = useLocalSession()

  // ── Hydrate from most recent saved session on mount ───────────────────────
  useEffect(() => {
    if (isLoading) return
    const latest = sessions[0]
    if (latest) {
      setAllMetrics(latest.metrics)
      setSessionLabel(latest.label)
    }
  }, [isLoading]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Outside-click dismissal for history drawer ────────────────────────────
  useEffect(() => {
    if (!showHistory) return
    function handler(e: MouseEvent) {
      if (historyRef.current && !historyRef.current.contains(e.target as Node)) {
        setShowHistory(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showHistory])

  // ── Handlers ──────────────────────────────────────────────────────────────
  function handleMetricChange(key: string, value: string) {
    setAllMetrics(prev => ({ ...prev, [key]: value }))
  }

  function handleToggleCard(id: GuardianId) {
    setExpandedId(prev => (prev === id ? null : id))
    setActiveNav(id)
  }

  async function handleSave() {
    const payload = buildSessionPayload(allMetrics, sessionLabel)

    // Persist to Supabase when configured
    if (supabaseConfigured) {
      const { error } = await supabase.from('sessions').insert(payload)
      if (error) console.error('[Supabase] Insert failed:', error.message)
    }

    // Always mirror to localStorage as offline backup
    save(allMetrics, sessionLabel)

    setSavedFlash(true)
    if (flashTimer.current) clearTimeout(flashTimer.current)
    flashTimer.current = setTimeout(() => setSavedFlash(false), FLASH_MS)
  }

  function handleLoadSession(metrics: Record<string, string>, label: string) {
    setAllMetrics(metrics)
    setSessionLabel(label)
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col">

      {/* ══ HEADER ══════════════════════════════════════════════════════════ */}
      <header
        className="flex items-center gap-3 px-6 py-3 shrink-0"
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          borderBottom: '1px solid rgba(248,250,252,0.06)',
          background: 'rgba(8,8,26,0.88)',
          backdropFilter: 'blur(22px)',
          WebkitBackdropFilter: 'blur(22px)',
        }}
      >
        {/* Wordmark */}
        <div className="flex items-center gap-2 shrink-0">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, rgba(168,85,247,0.38), rgba(59,130,246,0.20))',
              border: '1px solid rgba(168,85,247,0.38)',
            }}
          >
            <Diamond size={14} className="text-white/80" />
          </div>
          <span className="font-bold text-sm tracking-wide text-white/90">Diamond Protocol</span>
          <span className="text-white/18 text-xs hidden sm:inline">·</span>
          <span className="text-white/28 text-xs hidden sm:inline">Sovereignty OS</span>
        </div>

        {/* Session label input — centre */}
        <div className="flex-1 flex justify-center px-4">
          <input
            type="text"
            value={sessionLabel}
            onChange={e => setSessionLabel(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleSave() }}
            placeholder="Session label…"
            className="w-full max-w-xs text-center text-xs bg-transparent outline-none placeholder-white/20 text-white/65"
            style={{
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              paddingBottom: 4,
              transition: 'border-color 0.2s',
            }}
            onFocus={e => (e.currentTarget.style.borderBottomColor = 'rgba(168,85,247,0.55)')}
            onBlur={e  => (e.currentTarget.style.borderBottomColor = 'rgba(255,255,255,0.08)')}
          />
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2 shrink-0">

          {/* History button + dropdown */}
          <div className="relative" ref={historyRef}>
            <button
              onClick={() => setShowHistory(v => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-medium transition-all hover:bg-white/[0.05]"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: 'rgba(248,250,252,0.42)',
              }}
            >
              <Clock size={12} />
              <span className="hidden sm:inline">History</span>
              {sessions.length > 0 && (
                <span
                  className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{ background: 'rgba(168,85,247,0.22)', color: '#a855f7' }}
                >
                  {sessions.length}
                </span>
              )}
              <ChevronDown
                size={11}
                style={{
                  transform: showHistory ? 'rotate(180deg)' : 'none',
                  transition: 'transform 0.2s',
                }}
              />
            </button>

            <AnimatePresence>
              {showHistory && (
                <HistoryDrawer
                  sessions={sessions}
                  onLoad={handleLoadSession}
                  onRemove={remove}
                  onClose={() => setShowHistory(false)}
                />
              )}
            </AnimatePresence>
          </div>

          {/* Save Session button */}
          <motion.button
            onClick={handleSave}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-4 py-1.5 rounded-xl text-[12px] font-bold"
            style={{
              background: savedFlash
                ? 'rgba(34,197,94,0.16)'
                : 'linear-gradient(135deg, rgba(168,85,247,0.24), rgba(59,130,246,0.14))',
              border: `1px solid ${savedFlash ? 'rgba(34,197,94,0.42)' : 'rgba(168,85,247,0.38)'}`,
              color: savedFlash ? '#22c55e' : 'rgba(248,250,252,0.85)',
              boxShadow: savedFlash
                ? '0 0 14px rgba(34,197,94,0.22)'
                : '0 0 14px rgba(168,85,247,0.12)',
              transition: 'all 0.3s',
            }}
          >
            <AnimatePresence mode="wait">
              {savedFlash ? (
                <motion.span
                  key="saved"
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  className="flex items-center gap-1.5"
                >
                  <CheckCircle size={13} /> Saved
                </motion.span>
              ) : (
                <motion.span
                  key="save"
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  className="flex items-center gap-1.5"
                >
                  <Save size={13} /> Save Session
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </header>

      {/* ══ ASTRAL CALENDAR BANNER ════════════════════════════════════════════ */}
      <DailyResonanceBanner />

      {/* ══ MAIN LAYOUT ══════════════════════════════════════════════════════ */}
      <main className="flex-1 flex flex-col lg:flex-row min-h-0">

        {/* ── Left sidebar: DiamondNav (sticky) ── */}
        <aside
          className="shrink-0 p-2 lg:p-5 lg:overflow-y-auto"
          style={{
            borderBottom: '1px solid rgba(248,250,252,0.05)',
            borderRight: '1px solid rgba(248,250,252,0.05)',
          }}
        >
          <div className="sticky" style={{ top: 96 }}>
            <DiamondNav
              activeId={activeNav}
              allMetrics={allMetrics}
              onSelect={id => {
                setActiveNav(id)
                if (id !== 'angel') handleToggleCard(id)
              }}
            />
          </div>
        </aside>

        {/* ── Right content ── */}
        <div className="flex-1 flex flex-col gap-5 p-2 lg:p-5 overflow-y-auto min-w-0">

          {/* 4-up summary */}
          <MetricsSummaryBar allMetrics={allMetrics} />

          {/*
            Guardian cards grid.
            The WRAPPER DIV (not GuardianCard itself) controls col-span-2
            so Framer Motion layout animation on the card is not disrupted.
          */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.06 } },
            }}
          >
            {FOUR_GUARDIANS.map(g => (
              <div
                key={g.id}
                className={expandedId === g.id ? 'col-span-2' : ''}
              >
                <GuardianCard
                  guardian={g}
                  metrics={allMetrics}
                  isExpanded={expandedId === g.id}
                  onToggle={() => handleToggleCard(g.id)}
                  onMetricChange={handleMetricChange}
                />
              </div>
            ))}
          </motion.div>

          {/* Council session */}
          <TeamSessionPanel allMetrics={allMetrics} />

          {/* Angel console */}
          <AngelConsole allMetrics={allMetrics} />

          <div className="text-center text-[10px] text-white/12 pb-4 pt-2 select-none">
            Diamond Protocol · Sovereignty OS · Internal Build · © 2026
          </div>
        </div>
      </main>
    </div>
  )
}
