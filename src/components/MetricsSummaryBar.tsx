import { motion } from 'framer-motion'
import { FOUR_GUARDIANS } from '../data/guardians'

interface MetricsSummaryBarProps {
  allMetrics: Record<string, string>
}

function getScore(metrics: Record<string, string>, keys: string[]): string {
  const vals = keys.map(k => parseFloat(metrics[k] ?? '')).filter(n => !isNaN(n))
  if (vals.length === 0) return '—'
  return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1)
}

export default function MetricsSummaryBar({ allMetrics }: MetricsSummaryBarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.4 }}
      className="grid grid-cols-4 gap-3"
    >
      {FOUR_GUARDIANS.map(g => {
        const score = getScore(allMetrics, g.metrics.map(m => m.key))
        return (
          <div
            key={g.id}
            className="flex flex-col gap-1 rounded-xl px-4 py-3"
            style={{
              background: g.bgColor,
              border: `1px solid ${g.borderColor}`,
            }}
          >
            <div className="flex items-center gap-2">
              <span className="text-base">{g.icon}</span>
              <span className="text-[10px] font-semibold tracking-wider uppercase" style={{ color: g.color }}>
                {g.name}
              </span>
            </div>
            <div className="text-2xl font-bold tracking-tight" style={{ color: g.color }}>
              {score}
            </div>
            <div className="text-[9px] text-white/30 uppercase tracking-wider">{g.domain}</div>
          </div>
        )
      })}
    </motion.div>
  )
}
