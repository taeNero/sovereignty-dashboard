import { motion, AnimatePresence } from 'framer-motion'
import type { Guardian, GuardianId } from '../data/guardians'
import { GUARDIANS } from '../data/guardians'

// ─── Canvas geometry ──────────────────────────────────────────────────────────
//  260 × 260 bounding box. Diamond radius 90px from centre.
//  Guardian assignment (per spec):
//    Kael         → TOP
//    Anansi       → RIGHT
//    Siriyadirian → BOTTOM
//    Aurixen      → LEFT
//    Angel        → CENTRE
const SIZE = 260
const CX   = 130
const CY   = 130
const R    = 90

const NODE_PX: Record<GuardianId, { x: number; y: number }> = {
  kael:         { x: CX,     y: CY - R },   // top    (130, 40)
  anansi:       { x: CX + R, y: CY     },   // right  (220, 130)
  siriyadirian: { x: CX,     y: CY + R },   // bottom (130, 220)
  aurixen:      { x: CX - R, y: CY     },   // left   (40,  130)
  angel:        { x: CX,     y: CY     },   // centre (130, 130)
}

// SVG polygon: top → right → bottom → left (draws the diamond outline)
const DIAMOND_POINTS = [
  NODE_PX.kael,
  NODE_PX.anansi,
  NODE_PX.siriyadirian,
  NODE_PX.aurixen,
].map(p => `${p.x},${p.y}`).join(' ')

// ─── Individual node button ───────────────────────────────────────────────────
interface GuardianNodeProps {
  guardian: Guardian
  isActive: boolean
  onClick: () => void
}

function GuardianNode({ guardian, isActive, onClick }: GuardianNodeProps) {
  const { x, y } = NODE_PX[guardian.id]
  const size      = guardian.isAngel ? 52 : 44

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.13 }}
      whileTap={{ scale: 0.92 }}
      animate={{ opacity: isActive ? 1 : 0.27 }}
      transition={{ duration: 0.2 }}
      className="absolute flex flex-col items-center gap-1 select-none"
      style={{ left: x, top: y, transform: 'translate(-50%, -50%)' }}
    >
      {/* Avatar circle */}
      <div
        className="relative flex items-center justify-center rounded-full"
        style={{
          width:  size,
          height: size,
          background: guardian.bgColor,
          border: `${isActive ? 2 : 1}px solid ${isActive ? guardian.color : guardian.borderColor}`,
          boxShadow: isActive
            ? `0 0 0 2px ${guardian.color}22,
               0 0 18px ${guardian.glowColor},
               0 0 36px ${guardian.glowColor.replace('0.35', '0.10')}`
            : 'none',
          transition: 'box-shadow 0.25s, border-color 0.25s',
          fontSize: guardian.isAngel ? 20 : 16,
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

        {/* Ping ring — active nodes only */}
        {isActive && (
          <span
            className="absolute inset-0 rounded-full animate-ping"
            style={{ border: `2px solid ${guardian.color}`, opacity: 0.22 }}
          />
        )}
      </div>

      {/* Name label */}
      <span
        className="text-[8px] font-bold tracking-[0.18em] uppercase whitespace-nowrap"
        style={{ color: isActive ? guardian.color : 'rgba(248,250,252,0.32)' }}
      >
        {guardian.name}
      </span>
    </motion.button>
  )
}

// ─── Live readout panel ───────────────────────────────────────────────────────
interface LiveReadoutProps {
  guardian: Guardian
  allMetrics: Record<string, string>
}

function LiveReadout({ guardian, allMetrics }: LiveReadoutProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={guardian.id}
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -8 }}
        transition={{ duration: 0.16, ease: 'easeOut' }}
        className="flex flex-col h-full"
      >
        {/* Identity row */}
        <div
          className="flex items-center gap-2.5 pb-3 mb-3"
          style={{ borderBottom: `1px solid ${guardian.borderColor}` }}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0"
            style={{
              background: guardian.bgColor,
              border: `1px solid ${guardian.borderColor}`,
              boxShadow: `0 0 10px ${guardian.glowColor}`,
            }}
          >
            {guardian.icon}
          </div>
          <div className="min-w-0">
            <div className="font-bold text-xs" style={{ color: guardian.color }}>
              {guardian.name}
            </div>
            <div className="text-[9px] text-white/35 truncate">{guardian.domain}</div>
          </div>
        </div>

        {/* Metrics list */}
        <div className="flex flex-col gap-2 flex-1 overflow-y-auto min-h-0">
          {guardian.isAngel ? (
            <p className="text-[10px] text-white/35 italic leading-relaxed">
              Synthesises all four Guardian domains into a single executive directive.
            </p>
          ) : (
            guardian.metrics.map(f => {
              const val = allMetrics[f.key]
              return (
                <div key={f.key} className="flex items-center justify-between gap-2">
                  <span className="text-[10px] text-white/38 truncate">{f.label}</span>
                  <span
                    className="text-[11px] font-semibold tabular-nums shrink-0"
                    style={{ color: val ? guardian.color : 'rgba(255,255,255,0.16)' }}
                  >
                    {val ? `${val}${f.unit ? '\u2009' + f.unit : ''}` : '—'}
                  </span>
                </div>
              )
            })
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

// ─── DiamondNav ───────────────────────────────────────────────────────────────
interface DiamondNavProps {
  activeId: GuardianId
  allMetrics: Record<string, string>
  onSelect: (id: GuardianId) => void
}

export default function DiamondNav({ activeId, allMetrics, onSelect }: DiamondNavProps) {
  const active = GUARDIANS.find(g => g.id === activeId) ?? GUARDIANS[0]!

  return (
    <div className="flex flex-col md:flex-row items-center md:items-start gap-5">

      {/* ── 260 × 260 diamond canvas ── */}
      <div className="relative shrink-0 scale-75 md:scale-100" style={{ width: SIZE, height: SIZE }}>

        {/* SVG layer: outline + spokes */}
        <svg
          className="absolute inset-0 pointer-events-none"
          width={SIZE} height={SIZE}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
        >
          {/* Diamond perimeter */}
          <polygon
            points={DIAMOND_POINTS}
            fill="none"
            stroke="rgba(248,250,252,0.07)"
            strokeWidth="1"
            strokeDasharray="5 5"
          />

          {/* Spokes: centre → each outer node */}
          {([NODE_PX.kael, NODE_PX.anansi, NODE_PX.siriyadirian, NODE_PX.aurixen] as typeof NODE_PX[GuardianId][]).map((p, i) => (
            <line
              key={i}
              x1={CX} y1={CY} x2={p.x} y2={p.y}
              stroke="rgba(248,250,252,0.04)"
              strokeWidth="1"
            />
          ))}

          {/* Active spoke — coloured */}
          {activeId !== 'angel' && (
            <motion.line
              key={activeId}
              x1={CX} y1={CY}
              x2={NODE_PX[activeId].x} y2={NODE_PX[activeId].y}
              stroke={active.color}
              strokeWidth="1.5"
              strokeOpacity="0.45"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.3 }}
            />
          )}
        </svg>

        {/* Nodes */}
        {GUARDIANS.map(g => (
          <GuardianNode
            key={g.id}
            guardian={g}
            isActive={activeId === g.id}
            onClick={() => onSelect(g.id)}
          />
        ))}
      </div>

      {/* ── Vertical divider ── */}
      <div
        className="self-stretch w-px shrink-0"
        style={{ background: 'rgba(248,250,252,0.06)' }}
      />

      {/* ── Live readout panel ── */}
      <div
        className="rounded-2xl p-4 self-stretch w-full md:w-48"
        style={{
          background: `linear-gradient(145deg, ${active.bgColor} 0%, rgba(8,8,26,0.55) 100%)`,
          border: `1px solid ${active.borderColor}`,
          boxShadow: `inset 0 1px 0 ${active.color}15`,
          backdropFilter: 'blur(18px)',
          transition: 'border-color 0.3s, background 0.3s',
          minHeight: SIZE,
        }}
      >
        <LiveReadout guardian={active} allMetrics={allMetrics} />
      </div>
    </div>
  )
}
