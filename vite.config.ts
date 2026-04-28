import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig(({ mode }) => {
  // loadEnv reads from .env files on disk (works locally).
  // On Vercel, there are no .env files — vars live in process.env instead.
  // We merge both so the build works in both environments.
  const fileEnv = loadEnv(mode, process.cwd(), '')

  function getEnv(key: string): string {
    return fileEnv[key] || process.env[key] || ''
  }

  return {
    plugins: [react()],

    define: {
      // Bake env vars into the browser bundle as compile-time constants.
      // Reads from .env files locally, falls back to process.env on Vercel.
      'process.env.NEXT_PUBLIC_SUPABASE_URL':
        JSON.stringify(getEnv('NEXT_PUBLIC_SUPABASE_URL')),
      'process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY':
        JSON.stringify(getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY')),
      'process.env.NEXT_PUBLIC_FLOWISE_BASE_URL':
        JSON.stringify(getEnv('NEXT_PUBLIC_FLOWISE_BASE_URL')),
      'process.env.NEXT_PUBLIC_FLOWISE_API_KEY':
        JSON.stringify(getEnv('NEXT_PUBLIC_FLOWISE_API_KEY')),
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
