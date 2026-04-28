import { useState, useRef, useEffect } from 'react'
import { Send, Loader2 } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

const FETCH_TIMEOUT_MS = 30_000

// ─── Types ────────────────────────────────────────────────────────────────────

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  isLoading?: boolean
  isError?: boolean
}

// ─── Props ────────────────────────────────────────────────────────────────────

export interface ChatWindowProps {
  color: string
  glowColor?: string
  borderColor: string

  /** Displayed in the loading indicator: "[guardianName] is analyzing…" */
  guardianName?: string

  /** Flowise chatflow UUID — routes the POST to the correct AI agent */
  flowiseId?: string

  /**
   * Fills the textarea so the user can review/edit before submitting.
   * Parent must clear this value via onPrefillConsumed.
   */
  prefillText?: string
  onPrefillConsumed?: () => void

  /**
   * Hidden auto-trigger: submitted immediately without a user bubble.
   * Used by "Run Analysis". Parent must clear via onTriggerConsumed.
   */
  triggerMessage?: string
  onTriggerConsumed?: () => void

  /**
   * Live intelligence context prepended silently to EVERY outgoing message.
   * The user bubble still shows only their original message.
   * Used by AngelConsole to inject the Railway briefing into every chat.
   */
  systemContext?: string

  placeholder?: string
  height?: number
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ChatWindow({
  color,
  glowColor,
  borderColor,
  guardianName = 'Guardian',
  flowiseId,
  prefillText,
  onPrefillConsumed,
  triggerMessage,
  onTriggerConsumed,
  systemContext,
  placeholder = 'Ask your guardian…',
  height = 400,
}: ChatWindowProps) {
  const [messages, setMessages]         = useState<Message[]>([])
  const [input, setInput]               = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef  = useRef<HTMLTextAreaElement>(null)
  const abortRef  = useRef<AbortController | null>(null)

  // ── Derived ────────────────────────────────────────────────────────────────
  const flowiseBase = process.env.NEXT_PUBLIC_FLOWISE_BASE_URL?.replace(/\/$/, '')
  const flowiseKey  = process.env.NEXT_PUBLIC_FLOWISE_API_KEY
  const isLive      = Boolean(flowiseBase && flowiseId)

  // ── Auto-scroll ────────────────────────────────────────────────────────────
  useEffect(() => {
    // Only scroll if there are messages, to prevent jumping on initial mount
    if (messages.length > 0) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  // ── Abort on unmount ───────────────────────────────────────────────────────
  useEffect(() => () => { abortRef.current?.abort() }, [])

  // ── Prefill ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!prefillText) return
    setInput(prefillText)
    inputRef.current?.focus()
    onPrefillConsumed?.()
  }, [prefillText, onPrefillConsumed])

  // ── Trigger ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!triggerMessage) return
    onTriggerConsumed?.()
    if (isSubmitting) return
    void sendMessage(triggerMessage, true)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [triggerMessage])

  // ─── Core send / fetch ─────────────────────────────────────────────────────
  async function sendMessage(question: string, showUserBubble: boolean) {
    const loadingId = `loading-${Date.now()}`

    // Silently prepend live context to every outgoing message if provided.
    // The user-facing bubble still shows only their original question.
    const payload = systemContext
      ? `${systemContext}\n\n---\n\n${question}`
      : question

    setMessages(prev => {
      const withUser = showUserBubble
        ? [...prev, { id: `u-${Date.now()}`, role: 'user' as const, content: question }]
        : prev
      return [...withUser, { id: loadingId, role: 'assistant' as const, content: '', isLoading: true }]
    })
    setIsSubmitting(true)

    if (isLive) {
      const controller = new AbortController()
      abortRef.current = controller

      let timedOut = false
      const timeoutId = setTimeout(() => {
        timedOut = true
        controller.abort()
      }, FETCH_TIMEOUT_MS)

      try {
        const headers: Record<string, string> = { 'Content-Type': 'application/json' }
        if (flowiseKey) headers['Authorization'] = `Bearer ${flowiseKey}`

        const res = await fetch(`${flowiseBase}/${flowiseId}`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ question: payload }),
          signal: controller.signal,
        })
        clearTimeout(timeoutId)

        if (!res.ok) throw new Error(`HTTP ${res.status} — ${res.statusText}`)

        const data = await res.json() as { text?: string; answer?: string }
        const reply = data.text ?? data.answer ?? '*(No response returned)*'

        setMessages(prev =>
          prev.map(m => m.id === loadingId ? { ...m, content: reply, isLoading: false } : m)
        )
      } catch (err) {
        clearTimeout(timeoutId)
        if ((err as Error).name === 'AbortError') {
          if (!timedOut) return // unmount — silently cancel
          // Timeout
          setMessages(prev =>
            prev.map(m =>
              m.id === loadingId
                ? { ...m, content: `**Request timed out** — ${guardianName} took longer than 30s to respond. The service may be cold-starting. Try again in a moment.`, isLoading: false, isError: true }
                : m
            )
          )
          setIsSubmitting(false)
          return
        }
        const errMsg = err instanceof Error ? err.message : String(err)
        setMessages(prev =>
          prev.map(m =>
            m.id === loadingId
              ? { ...m, content: `**Connection error** — ${errMsg}`, isLoading: false, isError: true }
              : m
          )
        )
      } finally {
        setIsSubmitting(false)
      }
      return
    }

    // ── Fallback: Flowise not configured ──────────────────────────────────
    setTimeout(() => {
      setMessages(prev =>
        prev.map(m =>
          m.id === loadingId
            ? { ...m, content: `**${guardianName} offline** — Add \`NEXT_PUBLIC_FLOWISE_BASE_URL\` to \`.env.local\` to activate live responses.`, isLoading: false }
            : m
        )
      )
      setIsSubmitting(false)
    }, 600)
  }

  // ─── Manual send ───────────────────────────────────────────────────────────
  function handleSend() {
    const text = input.trim()
    if (!text || isSubmitting) return
    setInput('')
    void sendMessage(text, true)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div
      className="flex flex-col rounded-2xl overflow-hidden"
      style={{
        height,
        border: `1px solid ${borderColor}`,
        background: 'rgba(5,5,18,0.80)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        boxShadow: glowColor ? `inset 0 1px 0 ${color}15, 0 0 0 1px ${color}08` : undefined,
      }}
    >
      {/* ── Message history ─────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-3 select-none">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-base opacity-20"
              style={{ border: `1px solid ${borderColor}` }}
            >
              ✦
            </div>
            <p className="text-[11px] text-white/22 text-center leading-relaxed">
              Run Analysis to brief {guardianName},<br />or type a question below.
            </p>
          </div>
        )}

        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'user' ? (
              <div
                className="max-w-[78%] px-3.5 py-2.5 rounded-2xl rounded-tr-sm text-xs text-white/90 leading-relaxed"
                style={{ background: `${color}18`, border: `1px solid ${borderColor}` }}
              >
                {msg.content}
              </div>
            ) : (
              <div
                className="max-w-[92%] px-3.5 py-2.5 rounded-2xl rounded-tl-sm text-xs leading-relaxed"
                style={{
                  background: msg.isError ? 'rgba(239,68,68,0.08)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${msg.isError ? 'rgba(239,68,68,0.25)' : 'rgba(255,255,255,0.07)'}`,
                }}
              >
                {msg.isLoading ? (
                  <div className="flex items-center gap-2.5 py-0.5">
                    <Loader2 size={13} className="animate-spin shrink-0" style={{ color }} />
                    <span className="text-[11px] italic" style={{ color: `${color}bb` }}>
                      {guardianName} is analyzing your telemetry…
                    </span>
                  </div>
                ) : (
                  <div className="prose-dark">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* ── Input bar ───────────────────────────────────────────────────────── */}
      <div
        className="shrink-0 flex items-end gap-2 px-3 py-2.5"
        style={{ borderTop: `1px solid ${borderColor}`, background: 'rgba(6,6,20,0.70)' }}
      >
        <textarea
          ref={inputRef}
          rows={1}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isSubmitting}
          placeholder={isSubmitting ? `${guardianName} is thinking…` : placeholder}
          className="flex-1 resize-none bg-transparent text-[12px] placeholder-white/20 outline-none py-1.5 leading-relaxed max-h-28 overflow-y-auto disabled:opacity-40 transition-opacity"
          style={{ color: 'rgba(248,250,252,0.85)' }}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || isSubmitting}
          className="shrink-0 p-1.5 rounded-xl transition-all disabled:opacity-20 hover:scale-105 active:scale-95"
          style={{
            color,
            background: input.trim() && !isSubmitting ? `${color}18` : 'transparent',
            border: `1px solid ${input.trim() && !isSubmitting ? borderColor : 'transparent'}`,
          }}
        >
          {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
        </button>
      </div>

      {/* ── Status footer ───────────────────────────────────────────────────── */}
      <div
        className="shrink-0 flex items-center gap-1.5 px-4 py-1.5"
        style={{ borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(4,4,16,0.60)' }}
      >
        <span className={`text-[10px] leading-none ${isLive ? 'text-emerald-400' : 'text-amber-400'}`}>●</span>
        <span className={`text-[9px] font-medium tracking-wider ${isLive ? 'text-emerald-400/75' : 'text-amber-400/75'}`}>
          {isLive ? 'Connected' : 'Offline'}
        </span>
        <span className="ml-auto text-[9px] text-white/15">
          {isLive ? `Flowise · ${flowiseId?.slice(0, 8)}…` : 'Flowise pending'}
        </span>
      </div>
    </div>
  )
}
