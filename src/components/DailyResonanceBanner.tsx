import { motion } from 'framer-motion'
import { Waves } from 'lucide-react'

// ─── Static resonance data (will be dynamic later) ───────────────────────────
const RESONANCE = {
  sequence:  'Sequence 36',
  title:     'Great rains sometimes fall',
  upper:     'Menadel',
  lower:     'Stolas',
  focus:     'Cleansing',
  frequency: 'Gamma',
  hz:        '36Hz',
}

// ─── Single data cell ─────────────────────────────────────────────────────────
function Cell({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex flex-col gap-0.5 shrink-0">
      <span className="text-[8px] font-bold tracking-[0.2em] uppercase text-white/25">
        {label}
      </span>
      <span
        className="text-[11px] font-semibold tracking-wide whitespace-nowrap"
        style={{ color: accent ? '#a855f7' : 'rgba(248,250,252,0.75)' }}
      >
        {value}
      </span>
    </div>
  )
}

function Divider() {
  return <div className="self-stretch w-px bg-white/[0.07] mx-1" />
}

// ─── Pulsing Hz badge ─────────────────────────────────────────────────────────
function HzBadge({ frequency, hz }: { frequency: string; hz: string }) {
  return (
    <div className="relative flex items-center gap-1.5 shrink-0">
      {/* Outer pulse ring */}
      <span
        className="absolute inset-0 rounded-full animate-ping opacity-20"
        style={{ border: '1px solid #a855f7' }}
      />
      <div
        className="relative flex items-center gap-1.5 px-3 py-1 rounded-full"
        style={{
          background: 'rgba(168,85,247,0.12)',
          border: '1px solid rgba(168,85,247,0.35)',
          boxShadow: '0 0 12px rgba(168,85,247,0.20)',
        }}
      >
        <Waves size={10} className="text-purple-400 shrink-0" />
        <span className="text-[10px] font-bold tracking-wider text-purple-300 tabular-nums">
          {frequency} {hz}
        </span>
      </div>
    </div>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function DailyResonanceBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="w-full flex items-center gap-4 px-6 py-2.5 overflow-x-auto"
      style={{
        background:
          'linear-gradient(90deg, rgba(168,85,247,0.06) 0%, rgba(8,8,26,0.0) 40%, rgba(59,130,246,0.04) 100%)',
        borderBottom: '1px solid rgba(168,85,247,0.12)',
        backdropFilter: 'blur(8px)',
        scrollbarWidth: 'none',
      }}
    >
      {/* Val's Astral Calendar label */}
      <div className="flex items-center gap-2 shrink-0 pr-3" style={{ borderRight: '1px solid rgba(255,255,255,0.07)' }}>
        <span className="text-[9px] font-black tracking-[0.25em] uppercase text-purple-400/70">
          Val's Astral Calendar
        </span>
      </div>

      {/* Sequence + title */}
      <Cell label="Sequence" value={RESONANCE.sequence} accent />
      <Divider />
      <Cell label="Reading" value={RESONANCE.title} />
      <Divider />

      {/* Trigrams */}
      <Cell label="Upper" value={RESONANCE.upper} />
      <Divider />
      <Cell label="Lower" value={RESONANCE.lower} />
      <Divider />

      {/* Focus */}
      <Cell label="Focus" value={RESONANCE.focus} />
      <Divider />

      {/* Hz badge — right-pinned on large screens */}
      <div className="ml-auto pl-2">
        <HzBadge frequency={RESONANCE.frequency} hz={RESONANCE.hz} />
      </div>
    </motion.div>
  )
}
