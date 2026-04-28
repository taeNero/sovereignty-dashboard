/// <reference types="vite/client" />

// process.env.NEXT_PUBLIC_* are injected at build time by vite.config.ts
// via Vite's `define` option. These declarations let tsc accept them without
// requiring @types/node or a global process polyfill.
declare const process: {
  readonly env: {
    readonly NEXT_PUBLIC_SUPABASE_URL:      string | undefined
    readonly NEXT_PUBLIC_SUPABASE_ANON_KEY: string | undefined
    readonly NEXT_PUBLIC_FLOWISE_BASE_URL:  string | undefined
    readonly NEXT_PUBLIC_FLOWISE_API_KEY:   string | undefined
    readonly [key: string]: string | undefined
  }
}
