import type { MetricField } from '../data/guardians'

// Keys whose values are free-text (not numeric)
const TEXT_KEYS = new Set([
  'industryShifts', 'competition', 'constraints', 'goals', 'signals',
  'offers',
])

interface MetricsPanelProps {
  metrics: MetricField[]
  values: Record<string, string>
  color: string
  borderColor: string
  bgColor: string
  onChange: (key: string, value: string) => void
}

export default function MetricsPanel({
  metrics,
  values,
  color,
  borderColor,
  bgColor,
  onChange,
}: MetricsPanelProps) {
  return (
    <div className="flex flex-col gap-3">
      {metrics.map(field => {
        const isText = TEXT_KEYS.has(field.key)
        const val    = values[field.key] ?? ''

        return (
          <div key={field.key} className="flex flex-col gap-1">
            {/* Label row */}
            <div className="flex items-center justify-between">
              <label
                className="text-[10px] font-bold tracking-wider uppercase"
                style={{ color }}
              >
                {field.label}
              </label>
              {field.unit && (
                <span className="text-[9px] text-white/30 font-medium">{field.unit}</span>
              )}
            </div>

            {/* Input — textarea for text fields, input for numerics */}
            {isText ? (
              <textarea
                rows={2}
                value={val}
                onChange={e => onChange(field.key, e.target.value)}
                placeholder={field.placeholder}
                className="w-full resize-none px-2.5 py-2 rounded-lg text-xs text-white/80 placeholder-white/20 outline-none transition-colors leading-relaxed"
                style={{
                  background: bgColor,
                  border: `1px solid ${borderColor}`,
                }}
                onFocus={e  => (e.currentTarget.style.borderColor = color)}
                onBlur={e   => (e.currentTarget.style.borderColor = borderColor)}
              />
            ) : (
              <div className="relative">
                <input
                  type="text"
                  inputMode="decimal"
                  value={val}
                  onChange={e => {
                    // Allow digits, one decimal point, leading minus (for edge cases)
                    const v = e.target.value
                    if (v === '' || v === '-' || /^-?\d*\.?\d*$/.test(v)) {
                      onChange(field.key, v)
                    }
                  }}
                  placeholder={field.placeholder}
                  className="w-full px-2.5 py-1.5 rounded-lg text-xs text-white/80 placeholder-white/20 outline-none transition-colors tabular-nums"
                  style={{
                    background: bgColor,
                    border: `1px solid ${borderColor}`,
                    paddingRight: val ? '2.5rem' : undefined,
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = color)}
                  onBlur={e  => (e.currentTarget.style.borderColor = borderColor)}
                />
                {/* Live value badge */}
                {val && (
                  <span
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-bold tabular-nums"
                    style={{ color }}
                  >
                    {val}{field.unit ?? ''}
                  </span>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
