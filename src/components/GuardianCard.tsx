import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Zap } from 'lucide-react'
import type { Guardian } from '../data/guardians'
import MetricsPanel from './MetricsPanel'
import ChatWindow from './ChatWindow'

// ─── Analysis prompt builder ──────────────────────────────────────────────────
// Formats the guardian's current metrics into a structured briefing string.
// This is sent as a hidden trigger to ChatWindow — the user never types it.

function buildAnalysisPrompt(guardian: Guardian, metrics: Record<string, string>): string {
  const filled = guardian.metrics.filter(f => metrics[f.key])

  if (filled.length === 0) {
    return `Run a ${guardian.outputLabel} for the ${guardian.domain} domain. No specific metrics have been entered yet — give me your top 3 baseline recommendations and one clear executive directive for this week.`
  }

  const metricLines = filled
    .map(f => `${f.label}: ${metrics[f.key]}${f.unit ?? ''}`)
    .join(', ')

  return (
    `Run a ${guardian.outputLabel}. ` +
    `My current ${guardian.domain} metrics are: ${metricLines}. ` +
    `Identify the 3 highest-leverage insights, flag any risks or anomalies, ` +
    `and give me one clear executive directive for this week.`
  )
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface GuardianCardProps {
  guardian: Guardian
  metrics: Record<string, string>
  isExpanded: boolean
  onToggle: () => void
  onMetricChange: (key: string, value: string) => void
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function GuardianCard({
  guardian,
  metrics,
  isExpanded,
  onToggle,
  onMetricChange,
}: GuardianCardProps) {
  // triggerMsg: set by Run Analysis, consumed by ChatWindow, cleared on ack
  const [triggerMsg, setTriggerMsg] = useState<string | undefined>(undefined)

  function handleRunAnalysis(e: React.MouseEvent) {
    e.stopPropagation()
    setTriggerMsg(buildAnalysisPrompt(guardian, metrics))
  }

  return (
    // col-span-2 is handled by the wrapper <div> in Dashboard.tsx
    <motion.div
      className="w-full rounded-2xl overflow-hidden"
      style={{
        border: `1px solid ${isExpanded ? guardian.color + '50' : guardian.borderColor}`,
        background: isExpanded
          ? `radial-gradient(ellipse 130% 90% at 50% -5%,
               ${guardian.glowColor.replace('0.35', '0.09')} 0%,
               transparent 55%),
             rgba(6,6,20,0.93)`
          : 'rgba(8,8,26,0.60)',
        backdropFilter: 'blur(22px)',
        WebkitBackdropFilter: 'blur(22px)',
        boxShadow: isExpanded
          ? `0 0 0 1px ${guardian.color}1a, 0 12px 48px ${guardian.glowColor.replace('0.35', '0.18')}`
          : `0 0 0 1px ${guardian.borderColor}`,
        transition: 'box-shadow 0.3s, border-color 0.3s',
      }}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32 }}
    >
      {/* ── HEADER ──────────────────────────────────────────────────────────── */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-white/[0.025] active:bg-white/[0.04]"
      >
        {/* Avatar */}
        <div
          className="relative w-11 h-11 rounded-full flex items-center justify-center shrink-0 text-xl"
          style={{
            background: guardian.bgColor,
            border: `${isExpanded ? 2 : 1}px solid ${isExpanded ? guardian.color : guardian.borderColor}`,
            boxShadow: isExpanded
              ? `0 0 0 3px ${guardian.color}15, 0 0 22px ${guardian.glowColor}`
              : 'none',
            transition: 'box-shadow 0.3s, border-color 0.3s',
          }}
        >
          {guardian.imageUrl ? (
            <img
              src={guardian.imageUrl}
              alt={guardian.name}
              className="w-full h-full rounded-full object-cover object-top"
              style={{ mixBlendMode: guardian.imageMixBlend ?? 'normal' }}
            />
          ) : (
            guardian.icon
          )}
          {isExpanded && (
            <span
              className="absolute inset-0 rounded-full animate-ping"
              style={{ border: `2px solid ${guardian.color}`, opacity: 0.18 }}
            />
          )}
        </div>

        {/* Identity */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm" style={{ color: guardian.color }}>
              {guardian.name}
            </span>
            <span
              className="hidden sm:inline px-2 py-0.5 rounded-full text-[9px] font-bold tracking-widest uppercase"
              style={{
                background: guardian.bgColor,
                color: guardian.textColor,
                border: `1px solid ${guardian.borderColor}`,
              }}
            >
              {guardian.domain}
            </span>
          </div>
          <div className="text-[11px] text-white/35 mt-0.5 truncate">{guardian.title}</div>
        </div>

        {/* Metric preview chips — collapsed state only */}
        {!isExpanded && (
          <div className="hidden md:flex gap-1.5 flex-wrap justify-end max-w-[220px]">
            {guardian.metrics.slice(0, 3).map(f => (
              <span
                key={f.key}
                className="px-2 py-0.5 rounded-full text-[9px] font-medium"
                style={{
                  background: metrics[f.key] ? guardian.bgColor : 'rgba(255,255,255,0.04)',
                  color:      metrics[f.key] ? guardian.textColor : 'rgba(255,255,255,0.22)',
                  border:     `1px solid ${metrics[f.key] ? guardian.borderColor : 'rgba(255,255,255,0.06)'}`,
                }}
              >
                {metrics[f.key] ? `${metrics[f.key]}${f.unit ?? ''}` : f.label}
              </span>
            ))}
          </div>
        )}

        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.22 }}
          className="shrink-0"
        >
          <ChevronDown size={15} className="text-white/28" />
        </motion.div>
      </button>

      {/* ── EXPANDED BODY ────────────────────────────────────────────────────── */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.30, ease: [0.4, 0, 0.2, 1] }}
            style={{ overflow: 'hidden' }}
          >
            {/*
              ──────────────────────────────────────────────────────────────────
              RIGID TWO-COLUMN LAYOUT
              Left  (256 px fixed) : MetricsPanel inputs + Run Analysis CTA
              Right (flex-1)       : ChatWindow — min-h 440 px
              ──────────────────────────────────────────────────────────────────
            */}
            <div
              className="flex flex-col sm:flex-row"
              style={{ borderTop: `1px solid ${guardian.color}28` }}
            >
              {/* ── LEFT COLUMN — metrics ─────────────────────────────────── */}
              <div
                className="flex flex-col gap-4 p-5 w-full sm:w-64 sm:shrink-0 border-b sm:border-b-0 sm:border-r"
                style={{
                  borderColor: guardian.borderColor,
                  background: 'rgba(5,5,18,0.45)',
                }}
              >
                {/* Section label */}
                <span
                  className="text-[9px] font-black tracking-[0.2em] uppercase"
                  style={{ color: guardian.color + '70' }}
                >
                  Metrics Input
                </span>

                <MetricsPanel
                  metrics={guardian.metrics}
                  values={metrics}
                  color={guardian.color}
                  borderColor={guardian.borderColor}
                  bgColor={guardian.bgColor}
                  onChange={onMetricChange}
                />

                {/* ── Run Analysis CTA ── */}
                <button
                  onClick={handleRunAnalysis}
                  className="mt-auto flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-[11px] font-bold tracking-wide transition-all hover:brightness-110 active:scale-[0.97]"
                  style={{
                    background: `linear-gradient(135deg, ${guardian.bgColor} 0%, ${guardian.color}15 100%)`,
                    border: `1px solid ${guardian.borderColor}`,
                    color: guardian.color,
                    boxShadow: `0 0 14px ${guardian.glowColor}, inset 0 1px 0 ${guardian.color}20`,
                  }}
                >
                  <Zap size={12} />
                  Run Analysis
                </button>
              </div>

              {/* ── RIGHT COLUMN — chat ───────────────────────────────────── */}
              <div
                className="flex flex-col gap-3 p-4 flex-1 min-w-0"
                style={{ minHeight: 320 }}
              >
                {/* Section label */}
                <span
                  className="text-[9px] font-black tracking-[0.2em] uppercase shrink-0"
                  style={{ color: guardian.color + '70' }}
                >
                  Agent Chat
                </span>

                <ChatWindow
                  color={guardian.color}
                  glowColor={guardian.glowColor}
                  borderColor={guardian.borderColor}
                  guardianName={guardian.name}
                  flowiseId={guardian.flowiseId}
                  triggerMessage={triggerMsg}
                  onTriggerConsumed={() => setTriggerMsg(undefined)}
                  placeholder={`Ask ${guardian.name} about your ${guardian.domain}…`}
                  height={400}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
