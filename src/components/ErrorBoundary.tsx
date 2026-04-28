import { Component, type ReactNode } from 'react'
import { Diamond, RefreshCw } from 'lucide-react'

interface Props { children: ReactNode }
interface State { hasError: boolean; error: Error | null }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div
        className="min-h-screen flex items-center justify-center p-8"
        style={{ background: '#06060e' }}
      >
        <div
          className="w-full max-w-md rounded-2xl p-10 text-center"
          style={{
            background: 'rgba(8,8,26,0.92)',
            border: '1px solid rgba(239,68,68,0.22)',
            boxShadow: '0 0 60px rgba(239,68,68,0.06)',
          }}
        >
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{
              background: 'linear-gradient(135deg, rgba(168,85,247,0.28), rgba(59,130,246,0.16))',
              border: '1px solid rgba(168,85,247,0.32)',
            }}
          >
            <Diamond size={20} className="text-white/70" />
          </div>
          <h2 className="text-white/90 font-bold text-base mb-2">System Exception</h2>
          <p className="text-white/38 text-xs leading-relaxed mb-6 font-mono">
            {this.state.error?.message ?? 'An unexpected runtime error occurred.'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all hover:brightness-110 active:scale-95"
            style={{
              background: 'rgba(168,85,247,0.16)',
              border: '1px solid rgba(168,85,247,0.32)',
              color: '#a855f7',
            }}
          >
            <RefreshCw size={13} />
            Reload Dashboard
          </button>
        </div>
      </div>
    )
  }
}
