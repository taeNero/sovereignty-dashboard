/**
 * sessionPayload.ts
 *
 * Converts the dashboard's flat Record<string, string> metric state into a
 * typed payload ready to INSERT into the Supabase `sessions` table.
 *
 * Coercion rules (matching the whitepaper §4.3):
 *   • Numeric fields  → parseFloat, null if empty/invalid
 *   • Percent fields  → value / 100  (UI shows 0-100, DB stores 0-1)
 *   • Text fields     → trimmed string, null if empty
 */

// ─── Percent-stored metric keys ───────────────────────────────────────────────
// These are displayed as 0-100 in the UI but persisted as 0-1 in Supabase.
const PERCENT_KEYS = new Set<string>([
  'habits',      // Kael    — Habit Completion %
  'conversion',  // Siriyadirian — Conversion Rate %
  'margin',      // Siriyadirian — Margin %
  'engagement',  // Anansi   — Engagement Rate %
  'community',   // Anansi   — Community Active %
])

// ─── Payload type ─────────────────────────────────────────────────────────────
// Mirrors the intended Supabase table schema.
// All metric columns are nullable — sessions can be saved with partial data.
export interface SessionPayload {
  // Session metadata
  label:        string
  session_date: string   // ISO 8601 timestamp

  // ── Kael — Performance & Energy ───────────────────────────────────────────
  sleep_hours:       number | null
  deep_work_hours:   number | null
  exercise_sessions: number | null
  stress_level:      number | null
  habit_completion:  number | null   // 0–1

  // ── Siriyadirian — Revenue & Leverage ─────────────────────────────────────
  revenue:         number | null
  offers:          string | null   // free text
  conversion_rate: number | null   // 0–1
  traffic:         number | null
  margin:          number | null   // 0–1

  // ── Anansi — Brand & Community ────────────────────────────────────────────
  audience_size:     number | null
  engagement_rate:   number | null   // 0–1
  content_frequency: number | null
  email_growth:      number | null
  community_active:  number | null   // 0–1

  // ── Aurixen — Strategy & Risk ─────────────────────────────────────────────
  industry_shifts: string | null
  competition:     string | null
  constraints:     string | null
  goals:           string | null
  signals:         string | null
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function toNum(val: string | undefined, key: string): number | null {
  if (!val || val.trim() === '') return null
  const n = parseFloat(val)
  if (isNaN(n)) return null
  return PERCENT_KEYS.has(key) ? n / 100 : n
}

function toText(val: string | undefined): string | null {
  if (!val || val.trim() === '') return null
  return val.trim()
}

// ─── Builder ──────────────────────────────────────────────────────────────────
export function buildSessionPayload(
  metrics: Record<string, string>,
  label:   string,
): SessionPayload {
  const m = metrics

  return {
    // Metadata
    label:        label.trim() || `Session · ${new Date().toLocaleDateString()}`,
    session_date: new Date().toISOString(),

    // Kael
    sleep_hours:       toNum(m.sleep,    'sleep'),
    deep_work_hours:   toNum(m.deepWork, 'deepWork'),
    exercise_sessions: toNum(m.exercise, 'exercise'),
    stress_level:      toNum(m.stress,   'stress'),
    habit_completion:  toNum(m.habits,   'habits'),       // 80 → 0.80

    // Siriyadirian
    revenue:         toNum(m.revenue,    'revenue'),
    offers:          toText(m.offers),
    conversion_rate: toNum(m.conversion, 'conversion'),   // 4.5 → 0.045
    traffic:         toNum(m.traffic,    'traffic'),
    margin:          toNum(m.margin,     'margin'),        // 68 → 0.68

    // Anansi
    audience_size:     toNum(m.audience,    'audience'),
    engagement_rate:   toNum(m.engagement,  'engagement'), // 4.2 → 0.042
    content_frequency: toNum(m.contentFreq, 'contentFreq'),
    email_growth:      toNum(m.emailGrowth, 'emailGrowth'),
    community_active:  toNum(m.community,   'community'),  // 62 → 0.62

    // Aurixen
    industry_shifts: toText(m.industryShifts),
    competition:     toText(m.competition),
    constraints:     toText(m.constraints),
    goals:           toText(m.goals),
    signals:         toText(m.signals),
  }
}
