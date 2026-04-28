export type GuardianId = 'kael' | 'siriyadirian' | 'anansi' | 'aurixen' | 'angel'

export interface MetricField {
  key: string
  label: string
  placeholder: string
  unit?: string
}

export interface Guardian {
  id: GuardianId
  name: string
  title: string
  agentId: string
  /** Flowise chatflow ID — used to route chat messages to the correct AI agent */
  flowiseId: string
  color: string
  glowColor: string
  borderColor: string
  bgColor: string
  textColor: string
  domain: string
  icon: string
  imageUrl?: string
  imageMixBlend?: 'multiply' | 'normal'
  metrics: MetricField[]
  outputLabel: string
  isAngel?: boolean
}

export const GUARDIANS: Guardian[] = [
  {
    id: 'kael',
    name: 'Kael',
    title: 'Lead Execution Engineer',
    agentId: '01KJ4QX7XWBY60XPE2JRW5E1G6',
    flowiseId: 'a168847e-9df5-4991-9ef3-c6bfd169d708',
    color: '#22c55e',
    glowColor: 'rgba(34,197,94,0.35)',
    borderColor: 'rgba(34,197,94,0.30)',
    bgColor: 'rgba(34,197,94,0.08)',
    textColor: '#22c55e',
    domain: 'Performance & Energy',
    icon: '⚡',
    imageMixBlend: 'normal',
    metrics: [
      { key: 'sleep',    label: 'Sleep Hours',       placeholder: '7.5', unit: 'hrs' },
      { key: 'deepWork', label: 'Deep Work Hours',   placeholder: '4',   unit: 'hrs' },
      { key: 'exercise', label: 'Exercise Sessions', placeholder: '5',   unit: '/wk' },
      { key: 'stress',   label: 'Stress Level',      placeholder: '3',   unit: '/10' },
      { key: 'habits',   label: 'Habit Completion',  placeholder: '80',  unit: '%'   },
    ],
    outputLabel: 'Somatic Performance Report',
  },
  {
    id: 'siriyadirian',
    name: 'Siryandorin',
    title: 'Chief Revenue Architect',
    agentId: '01KJ4QXGTV6QV1A0VT3VFEYA5J',
    flowiseId: '54457f0a-55a0-4c9c-a71b-395a2f26e4b7',
    color: '#eab308',
    glowColor: 'rgba(234,179,8,0.35)',
    borderColor: 'rgba(234,179,8,0.30)',
    bgColor: 'rgba(234,179,8,0.08)',
    textColor: '#eab308',
    domain: 'Revenue & Leverage',
    icon: '💰',
    imageMixBlend: 'normal',
    metrics: [
      { key: 'revenue',    label: 'Monthly Revenue',   placeholder: '12000',  unit: '$'   },
      { key: 'offers',     label: 'Active Offers',     placeholder: '3'                   },
      { key: 'conversion', label: 'Conversion Rate',   placeholder: '4.5',    unit: '%'   },
      { key: 'traffic',    label: 'Monthly Traffic',   placeholder: '8500',   unit: '/mo' },
      { key: 'margin',     label: 'Margin',            placeholder: '68',     unit: '%'   },
    ],
    outputLabel: 'Revenue Intelligence Report',
  },
  {
    id: 'anansi',
    name: 'Anansi',
    title: 'Master of Stories & Signal',
    agentId: '01KJ4QXRJ1CGNEN8203E1XC73R',
    flowiseId: 'e1353487-491a-4879-9771-21866ee8eb4b',
    color: '#3b82f6',
    glowColor: 'rgba(59,130,246,0.35)',
    borderColor: 'rgba(59,130,246,0.30)',
    bgColor: 'rgba(59,130,246,0.08)',
    textColor: '#3b82f6',
    domain: 'Brand & Community',
    icon: '🕷️',
    imageMixBlend: 'multiply',
    metrics: [
      { key: 'audience',    label: 'Audience Size',     placeholder: '12400'              },
      { key: 'engagement',  label: 'Engagement Rate',   placeholder: '4.2',  unit: '%'   },
      { key: 'contentFreq', label: 'Content / Week',    placeholder: '5',    unit: '/wk' },
      { key: 'emailGrowth', label: 'Email List Growth', placeholder: '340',  unit: '/mo' },
      { key: 'community',   label: 'Community Active',  placeholder: '62',   unit: '%'   },
    ],
    outputLabel: 'Brand & Signal Report',
  },
  {
    id: 'aurixen',
    name: 'Aurixen',
    title: 'Oracle of Futures & Risk',
    agentId: '01KJ4QY10MADYTB43R6CAYPBND',
    flowiseId: 'c40f12c4-717f-4adf-bb80-7843f0020b45',
    color: '#a855f7',
    glowColor: 'rgba(168,85,247,0.35)',
    borderColor: 'rgba(168,85,247,0.30)',
    bgColor: 'rgba(168,85,247,0.08)',
    textColor: '#a855f7',
    domain: 'Strategy & Risk',
    icon: '🔮',
    imageMixBlend: 'normal',
    metrics: [
      { key: 'industryShifts', label: 'Industry Shifts',      placeholder: 'AI regulation, platform changes…' },
      { key: 'competition',    label: 'Competitive Landscape', placeholder: 'New entrants, market shifts…'    },
      { key: 'constraints',    label: 'Internal Constraints',  placeholder: 'Bandwidth, resources…'           },
      { key: 'goals',          label: 'Quarterly Goals',       placeholder: 'Ship v2, reach 10k…'             },
      { key: 'signals',        label: 'Market Signals',        placeholder: 'Emerging trends…'                },
    ],
    outputLabel: 'Strategic Intelligence Report',
  },
  {
    id: 'angel',
    name: 'The Angel',
    title: 'Executive Synthesiser',
    agentId: '01KJ4QYC1FHNFQ7JGMQS1F7H7D',
    flowiseId: 'e3aac1ef-d35d-4124-975e-3ef94a010dd3',
    color: '#f8fafc',
    glowColor: 'rgba(248,250,252,0.20)',
    borderColor: 'rgba(248,250,252,0.20)',
    bgColor: 'rgba(248,250,252,0.04)',
    textColor: '#f8fafc',
    domain: 'Executive Direction',
    icon: '✦',
    imageMixBlend: 'normal',
    metrics: [],
    outputLabel: 'Executive Synthesis',
    isAngel: true,
  },
]

export const GUARDIAN_MAP: Record<GuardianId, Guardian> = Object.fromEntries(
  GUARDIANS.map(g => [g.id, g])
) as Record<GuardianId, Guardian>

export const FOUR_GUARDIANS = GUARDIANS.filter(g => !g.isAngel)

/** Single consolidated endpoint — all guardian analysis routes through The Angel */
export const ANGEL_FLOWISE_ID = 'e3aac1ef-d35d-4124-975e-3ef94a010dd3'
