import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { GUARDIAN_MAP, FOUR_GUARDIANS } from '../data/guardians'
import ChatWindow from './ChatWindow'

const COUNCIL_BRIEFING_URL = 'https://diamond-protocol-server-production.up.railway.app/api/council-briefing'

interface AngelConsoleProps {
  allMetrics: Record<string, string>
}

// Fetches live Guardian intelligence from Railway server
async function fetchCouncilBriefing(): Promise<string> {
  try {
    const res = await fetch(COUNCIL_BRIEFING_URL)
    const data = await res.json()
    const b = data.briefing

    if (!b) return '⚠️ Council Briefing API returned no data.'

    const gm = b.guardian_metrics || {}

    return `
=== LIVE GUARDIAN INTELLIGENCE BRIEFING ===
Generated: ${b.generated_at}

--- KAEL (Performance & Energy) ---
Energy Score: ${gm.kael?.energy_score?.value ?? 'N/A'}/100
Summary: ${gm.kael?.energy_score?.summary ?? 'No data'}

--- SIRYANDORIN (Revenue & Leverage) ---
Revenue Leverage: ${gm.siryandorin?.revenue_leverage?.value ?? 'N/A'}/100
Conversion Rate: ${gm.siryandorin?.conversion_rate?.value ?? 'N/A'}%
Summary: ${gm.siryandorin?.revenue_leverage?.summary ?? 'No data'}

--- ANANSI (Brand & Community) ---
Narrative Density: ${gm.anansi?.narrative_density?.value ?? 'N/A'}/100
Summary: ${gm.anansi?.narrative_density?.summary ?? 'No data'}

--- AURIXEN (Strategy & Risk) ---
Risk Index: ${gm.aurixen?.risk_index?.value ?? 'N/A'}/100
Opportunity Score: ${gm.aurixen?.opportunity_score?.value ?? 'N/A'}/100
Summary: ${gm.aurixen?.risk_index?.summary ?? 'No data'}

=== PIPELINE STATUS ===
Total Leads: ${b.pipeline?.total_leads ?? 0}
Paying Clients: ${b.pipeline?.total_paying_clients ?? 0}
Recent Intakes: ${(b.pipeline?.recent_intakes ?? []).join(', ') || 'None'}

=== REVENUE STATUS ===
Recent Orders: ${b.revenue?.recent_orders ?? 0}
Total Revenue: $${b.revenue?.total_recent_revenue ?? 0}

=== ENGAGEMENT STATUS ===
Recent Events: ${b.engagement?.recent_events ?? 0}
Latest Rank Event: ${b.engagement?.latest_rank_event?.username ?? 'None'} → ${b.engagement?.latest_rank_event?.rank_level ?? 'N/A'}
`.trim()
  } catch (e) {
    return '⚠️ Failed to fetch Council Briefing. Check Railway server connection.'
  }
}

// Builds the full synthesis prompt combining live data + any manually entered metrics
async function buildSynthesisPrompt(allMetrics: Record<string, string>): Promise<string> {
  const liveBriefing = await fetchCouncilBriefing()

  // Include manually entered metrics as supplemental context if present
  const manualSections = FOUR_GUARDIANS.map(g => {
    const lines = g.metrics
      .filter(f => allMetrics[f.key])
      .map(f => `  - ${f.label}: ${allMetrics[f.key]}${f.unit ? ' ' + f.unit : ''}`)
      .join('\n')
    return lines ? `**${g.name} (${g.domain})**\n${lines}` : null
  }).filter(Boolean).join('\n\n')

  const manualContext = manualSections
    ? `\n\n=== MANUALLY ENTERED METRICS ===\n${manualSections}`
    : ''

  return `Please provide an Executive Synthesis across all four domains based on the following live intelligence.\n\n${liveBriefing}${manualContext}\n\nSynthesize cross-domain patterns, identify the single highest-leverage action, and provide your executive directive for this week.`
}

export default function AngelConsole({ allMetrics }: AngelConsoleProps) {
  const [trigger, setTrigger]           = useState<string | undefined>(undefined)
  const [loading, setLoading]           = useState(false)
  const [liveContext, setLiveContext]   = useState<string | undefined>(undefined)
  const angel = GUARDIAN_MAP['angel']

  // Fetch live briefing once on mount — injected into every chat message
  useEffect(() => {
    fetchCouncilBriefing().then(ctx => {
      if (ctx && !ctx.startsWith('⚠️')) setLiveContext(ctx)
    })
  }, [])

  async function handleRunSynthesis() {
    setLoading(true)
    try {
      const prompt = await buildSynthesisPrompt(allMetrics)
      setTrigger(prompt)
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      className="rounded-2xl overflow-hidden"
      style={{
        border: `1px solid ${angel.borderColor}`,
        background: `radial-gradient(ellipse 100% 80% at 50% 0%, rgba(248,250,252,0.04) 0%, transparent 60%), rgba(8,8,26,0.85)`,
        backdropFilter: 'blur(16px)',
      }}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 px-4 sm:px-6 py-4" style={{ borderBottom: `1px solid ${angel.borderColor}` }}>

        {/* Avatar with ping */}
        <div className="relative w-12 h-12 shrink-0">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
            style={{
              background: angel.bgColor,
              border: `2px solid ${angel.color}`,
              boxShadow: `0 0 32px ${angel.glowColor}, 0 0 64px ${angel.glowColor.replace('0.20', '0.08')}`,
            }}
          >
            {angel.icon}
          </div>
          <span
            className="absolute inset-0 rounded-full animate-ping"
            style={{ border: `2px solid ${angel.color}`, opacity: 0.2 }}
          />
        </div>

        <div className="flex-1">
          <div className="font-bold text-base" style={{ color: angel.color }}>The Angel</div>
          <div className="text-xs text-white/40">Executive Synthesiser · All Domains</div>
        </div>

        <button
          onClick={handleRunSynthesis}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all hover:brightness-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: angel.bgColor,
            border: `1px solid ${angel.borderColor}`,
            color: angel.color,
            boxShadow: `0 0 12px ${angel.glowColor}`,
          }}
        >
          <Sparkles size={13} />
          {loading ? 'Briefing Council...' : 'Run Synthesis'}
        </button>
      </div>

      {/* Chat */}
      <div className="p-1 sm:p-4">
        <ChatWindow
          color={angel.color}
          glowColor={angel.glowColor}
          borderColor={angel.borderColor}
          guardianName={angel.name}
          flowiseId={angel.flowiseId}
          triggerMessage={trigger}
          onTriggerConsumed={() => setTrigger(undefined)}
          systemContext={liveContext}
          placeholder="Ask The Angel for executive direction…"
          height={300}
        />
      </div>
    </motion.div>
  )
}