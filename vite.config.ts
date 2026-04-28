import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig(({ mode }) => {
  // loadEnv with prefix '' loads ALL variables from .env / .env.local —
  // not just VITE_* ones — so we can read NEXT_PUBLIC_* vars here.
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],

    define: {
      // Inject NEXT_PUBLIC_ vars as compile-time constants so that
      // process.env.NEXT_PUBLIC_* works in the browser bundle.
      // Vite performs a straight string-substitution — no runtime cost.
      'process.env.NEXT_PUBLIC_SUPABASE_URL':
        JSON.stringify(env.NEXT_PUBLIC_SUPABASE_URL ?? ''),
      'process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY':
        JSON.stringify(env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''),
      'process.env.NEXT_PUBLIC_FLOWISE_BASE_URL':
        JSON.stringify(env.NEXT_PUBLIC_FLOWISE_BASE_URL ?? ''),
      'process.env.NEXT_PUBLIC_FLOWISE_API_KEY':
        JSON.stringify(env.NEXT_PUBLIC_FLOWISE_API_KEY ?? ''),
    },

    build: {
      chunkSizeWarningLimit: 800,
      rollupOptions: {
        output: {
          manualChunks: {
            supabase: ['@supabase/supabase-js'],
            vendor:   ['react', 'react-dom'],
            motion:   ['framer-motion'],
          },
        },
      },
    },
  }
})
