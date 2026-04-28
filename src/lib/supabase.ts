import { createClient } from '@supabase/supabase-js'

// These are injected at build time by vite.config.ts `define`.
// They map directly to NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY
// in your .env.local file — no renaming required.
const supabaseUrl     = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[Diamond Protocol] Supabase not configured.\n' +
    'Your .env.local needs:\n' +
    '  NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co\n' +
    '  NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>\n' +
    'Sessions are falling back to localStorage.',
  )
}

// createClient is safe with placeholder strings — it only errors on network calls.
export const supabase = createClient(
  supabaseUrl     ?? 'https://placeholder.supabase.co',
  supabaseAnonKey ?? 'placeholder-anon-key',
)

/** Guard: only true when both env vars are present. Gate DB calls behind this. */
export const supabaseConfigured =
  Boolean(supabaseUrl) && Boolean(supabaseAnonKey)
