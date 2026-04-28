import { useState, useEffect, useCallback } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SavedSession {
  id: string
  label: string
  savedAt: string          // ISO timestamp
  metrics: Record<string, string>
}

const STORAGE_KEY = 'dp_sessions'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function readSessions(): SavedSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as SavedSession[]
  } catch {
    return []
  }
}

function writeSessions(sessions: SavedSession[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions))
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

interface UseLocalSessionReturn {
  /** All persisted sessions, newest first */
  sessions: SavedSession[]
  /** True while loading from localStorage on mount */
  isLoading: boolean
  /** Save current metrics + label. Returns the saved session. */
  save: (metrics: Record<string, string>, label: string) => SavedSession
  /** Delete one session by id */
  remove: (id: string) => void
  /** Clear all sessions */
  clearAll: () => void
}

export function useLocalSession(): UseLocalSessionReturn {
  const [sessions, setSessions] = useState<SavedSession[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Load on mount
  useEffect(() => {
    setSessions(readSessions())
    setIsLoading(false)
  }, [])

  const save = useCallback((metrics: Record<string, string>, label: string): SavedSession => {
    const session: SavedSession = {
      id: `dp_${Date.now()}`,
      label: label.trim() || `Session · ${new Date().toLocaleDateString()}`,
      savedAt: new Date().toISOString(),
      metrics,
    }
    setSessions(prev => {
      const updated = [session, ...prev]
      writeSessions(updated)
      return updated
    })
    return session
  }, [])

  const remove = useCallback((id: string) => {
    setSessions(prev => {
      const updated = prev.filter(s => s.id !== id)
      writeSessions(updated)
      return updated
    })
  }, [])

  const clearAll = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setSessions([])
  }, [])

  return { sessions, isLoading, save, remove, clearAll }
}
