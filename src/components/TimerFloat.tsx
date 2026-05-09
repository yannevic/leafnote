import { useEffect, useRef, useState, useCallback } from 'react'
import { Play, Pause, RotateCcw, X } from 'lucide-react'
import type { TimerState } from './Timer'

function computeDisplay(state: TimerState): number {
  const elapsed = state.running
    ? state.elapsed + Math.floor((Date.now() - state.startedAt) / 1000)
    : state.elapsed
  return state.mode === 'countdown' ? Math.max(0, state.target - elapsed) : elapsed
}

function formatTime(total: number) {
  const m = Math.floor(Math.abs(total) / 60)
  const s = Math.abs(total) % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

interface Props {
  state: TimerState
  onChange: (s: TimerState) => void
  onDismiss: () => void
}

export default function TimerFloat({ state, onChange, onDismiss }: Props) {
  const [_tick, setTick] = useState(0)
  const [pos, setPos] = useState({ x: 80, y: -1 })
  const dragRef = useRef({ dragging: false, moved: false, sx: 0, sy: 0, px: 0, py: 0 })

  useEffect(() => {
    setPos((p) => ({ ...p, y: window.innerHeight - 90 }))
  }, [])

  useEffect(() => {
    if (!state.running) return
    const id = setInterval(() => setTick((t) => t + 1), 500)
    return () => clearInterval(id)
  }, [state.running])

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      dragRef.current = {
        dragging: true,
        moved: false,
        sx: e.clientX,
        sy: e.clientY,
        px: pos.x,
        py: pos.y,
      }
      e.preventDefault()
    },
    [pos]
  )

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const d = dragRef.current
      if (!d.dragging) return
      const dx = e.clientX - d.sx
      const dy = e.clientY - d.sy
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) d.moved = true
      setPos({
        x: Math.max(0, Math.min(window.innerWidth - 180, d.px + dx)),
        y: Math.max(0, Math.min(window.innerHeight - 60, d.py + dy)),
      })
    }
    const onUp = () => {
      dragRef.current.dragging = false
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [])

  function handlePlayPause(e: React.MouseEvent) {
    e.stopPropagation()
    if (dragRef.current.moved) return
    if (state.running) {
      const cur = state.elapsed + Math.floor((Date.now() - state.startedAt) / 1000)
      onChange({ ...state, running: false, elapsed: cur, startedAt: 0 })
    } else {
      onChange({ ...state, running: true, startedAt: Date.now(), finished: false })
    }
  }

  function handleReset(e: React.MouseEvent) {
    e.stopPropagation()
    onChange({ ...state, running: false, elapsed: 0, startedAt: 0, finished: false })
  }

  if (pos.y < 0) return null

  const display = computeDisplay(state)
  const isUrgent = state.mode === 'countdown' && display <= 10 && display > 0 && state.running
  const progress =
    state.mode === 'countdown' && state.target > 0 ? (state.target - display) / state.target : 0
  const circumference = 2 * Math.PI * 16
  const dashOffset = circumference * (1 - Math.min(1, progress))

  return (
    <div
      onMouseDown={onMouseDown}
      style={{
        position: 'fixed',
        left: pos.x,
        top: pos.y,
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '7px 10px',
        background:
          'linear-gradient(160deg, rgba(253,246,240,0.97) 0%, rgba(252,232,238,0.97) 100%)',
        border: '1.5px solid rgba(232,160,176,0.4)',
        borderRadius: 16,
        boxShadow: '0 4px 20px rgba(200,120,140,0.2), inset 0 1px 0 rgba(255,255,255,0.6)',
        backdropFilter: 'blur(18px) saturate(1.4)',
        WebkitBackdropFilter: 'blur(18px) saturate(1.4)',
        fontFamily: 'Baloo 2, sans-serif',
        cursor: 'grab',
        userSelect: 'none',
        animation: state.finished ? 'timerFloatBounce 0.5s ease-out' : 'none',
      }}
    >
      <style>{`
        @keyframes timerFloatBounce { 0%{transform:scale(1)} 30%{transform:scale(1.1)} 70%{transform:scale(0.97)} 100%{transform:scale(1)} }
        @keyframes timerFloatPulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
      `}</style>

      {/* mini anel de progresso */}
      {state.mode === 'countdown' && (
        <svg width="38" height="38" style={{ flexShrink: 0 }}>
          <circle
            cx="19"
            cy="19"
            r="16"
            fill="none"
            stroke="rgba(232,160,176,0.2)"
            strokeWidth="3"
          />
          <circle
            cx="19"
            cy="19"
            r="16"
            fill="none"
            stroke={isUrgent ? '#e8607a' : 'rgba(232,160,176,0.8)'}
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            transform="rotate(-90 19 19)"
            style={{ transition: 'stroke-dashoffset 0.9s linear, stroke 0.3s' }}
          />
          <text
            x="19"
            y="23"
            textAnchor="middle"
            fontSize="9"
            fontWeight="800"
            fontFamily="Baloo 2, sans-serif"
            fill={state.finished ? 'rgba(122,48,64,0.7)' : isUrgent ? '#e8607a' : '#3d1a10'}
            style={{ animation: isUrgent ? 'timerFloatPulse 1s ease-in-out infinite' : 'none' }}
          >
            {formatTime(display)}
          </text>
        </svg>
      )}

      {/* display cronômetro simples */}
      {state.mode === 'stopwatch' && (
        <span
          style={{
            fontSize: 18,
            fontWeight: 800,
            color: '#3d1a10',
            letterSpacing: 1,
            minWidth: 58,
            textAlign: 'center',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {formatTime(display)}
        </span>
      )}

      {/* label finished */}
      {state.finished && (
        <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(122,48,64,0.7)' }}>pronto!</span>
      )}

      {/* botões */}
      <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
        <button
          onClick={handlePlayPause}
          style={{
            width: 26,
            height: 26,
            borderRadius: 8,
            border: 'none',
            cursor: 'pointer',
            background: state.running ? 'rgba(232,96,122,0.15)' : 'rgba(232,160,176,0.4)',
            color: state.running ? '#e8607a' : '#3d1a10',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {state.running ? (
            <Pause size={12} strokeWidth={2.5} />
          ) : (
            <Play size={12} strokeWidth={2.5} />
          )}
        </button>
        <button
          onClick={handleReset}
          style={{
            width: 26,
            height: 26,
            borderRadius: 8,
            border: '1.5px solid rgba(232,160,176,0.35)',
            cursor: 'pointer',
            background: 'transparent',
            color: 'rgba(122,48,64,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <RotateCcw size={11} strokeWidth={2} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDismiss()
          }}
          style={{
            width: 26,
            height: 26,
            borderRadius: 8,
            border: 'none',
            cursor: 'pointer',
            background: 'rgba(200,120,140,0.15)',
            color: 'rgba(122,48,64,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <X size={11} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  )
}
