import { useState, useEffect, useRef } from 'react'
import { Play, Pause, RotateCcw, Timer as TimerIcon, Hourglass } from 'lucide-react'

const PRESETS = [
  { label: '1 min', seconds: 60 },
  { label: '3 min', seconds: 180 },
  { label: '5 min', seconds: 300 },
  { label: '10 min', seconds: 600 },
]

type TimerMode = 'stopwatch' | 'countdown'

function formatTime(totalSeconds: number): { mm: string; ss: string } {
  const m = Math.floor(Math.abs(totalSeconds) / 60)
  const s = Math.abs(totalSeconds) % 60
  return { mm: String(m).padStart(2, '0'), ss: String(s).padStart(2, '0') }
}

export interface TimerState {
  mode: TimerMode
  running: boolean
  elapsed: number
  startedAt: number
  target: number
  finished: boolean
}

export const makeInitialTimerState = (): TimerState => ({
  mode: 'stopwatch',
  running: false,
  elapsed: 0,
  startedAt: 0,
  target: 60,
  finished: false,
})

function computeDisplay(state: TimerState): number {
  const elapsed = state.running
    ? state.elapsed + Math.floor((Date.now() - state.startedAt) / 1000)
    : state.elapsed
  return state.mode === 'countdown' ? Math.max(0, state.target - elapsed) : elapsed
}

interface TimerProps {
  state: TimerState
  onChange: (s: TimerState) => void
}

export default function Timer({ state, onChange }: TimerProps) {
  const { mode, running, elapsed, target, finished } = state
  const [tick, setTick] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [customMin, setCustomMin] = useState(String(Math.floor(target / 60)))
  const [customSec, setCustomSec] = useState(String(target % 60).padStart(2, '0'))

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    if (!running) return
    intervalRef.current = setInterval(() => setTick((t) => t + 1), 500)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [running])

  useEffect(() => {
    if (!running || mode !== 'countdown') return
    const currentElapsed = elapsed + Math.floor((Date.now() - state.startedAt) / 1000)
    if (currentElapsed >= target) {
      onChange({ ...state, running: false, elapsed: target, startedAt: 0, finished: true })
    }
  }, [tick]) // eslint-disable-line react-hooks/exhaustive-deps

  function handleStart() {
    onChange({ ...state, running: true, startedAt: Date.now(), finished: false })
  }

  function handlePause() {
    const currentElapsed = elapsed + Math.floor((Date.now() - state.startedAt) / 1000)
    onChange({ ...state, running: false, elapsed: currentElapsed, startedAt: 0 })
  }

  function handleReset() {
    onChange({ ...state, running: false, elapsed: 0, startedAt: 0, finished: false })
  }

  function handleSetMode(m: TimerMode) {
    onChange({ ...state, mode: m, running: false, elapsed: 0, startedAt: 0, finished: false })
  }

  function applyPreset(seconds: number) {
    setCustomMin(String(Math.floor(seconds / 60)))
    setCustomSec(String(seconds % 60).padStart(2, '0'))
    onChange({
      ...state,
      target: seconds,
      running: false,
      elapsed: 0,
      startedAt: 0,
      finished: false,
    })
  }

  function applyCustomTime() {
    const mins = Math.max(0, parseInt(customMin, 10) || 0)
    const secs = Math.max(0, Math.min(59, parseInt(customSec, 10) || 0))
    const total = mins * 60 + secs
    if (total > 0)
      onChange({
        ...state,
        target: total,
        running: false,
        elapsed: 0,
        startedAt: 0,
        finished: false,
      })
  }

  const displaySeconds = computeDisplay(state)
  const progress = mode === 'countdown' && target > 0 ? (target - displaySeconds) / target : 0
  const circumference = 2 * Math.PI * 54
  const dashOffset = circumference * (1 - Math.min(1, progress))
  const isUrgent = mode === 'countdown' && displaySeconds <= 10 && displaySeconds > 0 && running
  const { mm, ss } = formatTime(displaySeconds)

  const accentColor = isUrgent ? '#e8607a' : 'rgba(232,160,176,0.8)'
  const trackColor = 'rgba(232,160,176,0.2)'

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 20,
        padding: '24px 16px',
        fontFamily: "'Baloo 2', sans-serif",
      }}
    >
      <style>{`
        @keyframes urgentPulse { 0%,100%{opacity:1} 50%{opacity:0.6} }
        @keyframes finishBounce { 0%{transform:scale(1)} 30%{transform:scale(1.12)} 60%{transform:scale(0.95)} 80%{transform:scale(1.05)} 100%{transform:scale(1)} }
      `}</style>

      {/* toggle modo */}
      <div
        style={{
          display: 'flex',
          background: 'rgba(232,160,176,0.1)',
          borderRadius: 12,
          padding: 4,
          border: '1.5px solid rgba(232,160,176,0.3)',
          gap: 4,
        }}
      >
        {(
          [
            { id: 'stopwatch', label: 'cronômetro', Icon: TimerIcon },
            { id: 'countdown', label: 'contagem', Icon: Hourglass },
          ] as const
        ).map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => handleSetMode(id)}
            style={{
              padding: '6px 14px',
              borderRadius: 8,
              border: 'none',
              cursor: 'pointer',
              fontSize: 12,
              fontFamily: "'Baloo 2', sans-serif",
              fontWeight: 800,
              background: mode === id ? 'rgba(232,160,176,0.55)' : 'transparent',
              color: '#3d1a10',
              transition: 'all 0.15s',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
            }}
          >
            <Icon size={12} strokeWidth={2} />
            {label}
          </button>
        ))}
      </div>

      {/* presets countdown */}
      {mode === 'countdown' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
            {PRESETS.map((p) => (
              <button
                key={p.seconds}
                type="button"
                onClick={() => applyPreset(p.seconds)}
                style={{
                  padding: '4px 12px',
                  borderRadius: 20,
                  cursor: 'pointer',
                  border: `1.5px solid ${target === p.seconds ? 'rgba(232,160,176,0.7)' : 'rgba(232,160,176,0.3)'}`,
                  background: target === p.seconds ? 'rgba(232,160,176,0.2)' : 'transparent',
                  color: '#3d1a10',
                  fontSize: 12,
                  fontFamily: "'Baloo 2', sans-serif",
                  fontWeight: 700,
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <input
              type="text"
              inputMode="numeric"
              value={customMin}
              disabled={running}
              onChange={(e) => setCustomMin(e.target.value.replace(/\D/g, '').slice(0, 3))}
              onBlur={applyCustomTime}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  applyCustomTime()
                  ;(e.target as HTMLInputElement).blur()
                }
              }}
              style={{
                width: 48,
                height: 34,
                textAlign: 'center',
                fontSize: 15,
                fontFamily: "'Baloo 2', sans-serif",
                fontWeight: 700,
                borderRadius: 8,
                border: '1.5px solid rgba(232,160,176,0.35)',
                background: running ? 'rgba(232,160,176,0.08)' : 'rgba(253,242,246,0.7)',
                color: '#3d1a10',
                outline: 'none',
                opacity: running ? 0.5 : 1,
              }}
            />
            <span style={{ fontSize: 18, fontWeight: 700, color: 'rgba(122,48,64,0.5)' }}>:</span>
            <input
              type="text"
              inputMode="numeric"
              value={customSec}
              disabled={running}
              onChange={(e) => setCustomSec(e.target.value.replace(/\D/g, '').slice(0, 2))}
              onBlur={() => {
                const s = Math.max(0, Math.min(59, parseInt(customSec, 10) || 0))
                setCustomSec(String(s).padStart(2, '0'))
                applyCustomTime()
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  applyCustomTime()
                  ;(e.target as HTMLInputElement).blur()
                }
              }}
              style={{
                width: 48,
                height: 34,
                textAlign: 'center',
                fontSize: 15,
                fontFamily: "'Baloo 2', sans-serif",
                fontWeight: 700,
                borderRadius: 8,
                border: '1.5px solid rgba(232,160,176,0.35)',
                background: running ? 'rgba(232,160,176,0.08)' : 'rgba(253,242,246,0.7)',
                color: '#3d1a10',
                outline: 'none',
                opacity: running ? 0.5 : 1,
              }}
            />
            <span style={{ fontSize: 11, color: 'rgba(122,48,64,0.5)', fontWeight: 600 }}>
              min : seg
            </span>
          </div>
        </div>
      )}

      {/* display circular */}
      <div
        style={{
          position: 'relative',
          width: 140,
          height: 140,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: finished ? 'finishBounce 0.5s ease-out' : 'none',
        }}
      >
        {mode === 'countdown' && (
          <svg
            width="140"
            height="140"
            style={{ position: 'absolute', top: 0, left: 0, transform: 'rotate(-90deg)' }}
          >
            <circle cx="70" cy="70" r="54" fill="none" stroke={trackColor} strokeWidth="5" />
            <circle
              cx="70"
              cy="70"
              r="54"
              fill="none"
              stroke={accentColor}
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              style={{ transition: 'stroke-dashoffset 0.9s linear, stroke 0.3s' }}
            />
          </svg>
        )}
        <div
          style={{
            width: mode === 'countdown' ? 112 : 140,
            height: mode === 'countdown' ? 112 : 140,
            borderRadius: '50%',
            background: finished ? 'rgba(232,160,176,0.15)' : 'rgba(253,242,246,0.7)',
            border: `2px solid ${finished ? 'rgba(232,160,176,0.6)' : 'rgba(232,160,176,0.35)'}`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(200,120,140,0.15), inset 0 1px 0 rgba(255,255,255,0.6)',
            transition: 'background 0.3s, border-color 0.3s',
            animation: isUrgent ? 'urgentPulse 1s ease-in-out infinite' : 'none',
          }}
        >
          <div
            style={{
              fontSize: 34,
              fontWeight: 700,
              letterSpacing: 1,
              lineHeight: 1,
              fontVariantNumeric: 'tabular-nums',
              transition: 'color 0.3s',
              color: finished ? 'rgba(122,48,64,0.7)' : isUrgent ? '#e8607a' : '#3d1a10',
            }}
          >
            {mm}:{ss}
          </div>
          {finished && (
            <div
              style={{ fontSize: 11, color: 'rgba(122,48,64,0.6)', fontWeight: 700, marginTop: 2 }}
            >
              pronto!
            </div>
          )}
        </div>
      </div>

      {/* botões */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          type="button"
          onClick={running ? handlePause : handleStart}
          style={{
            padding: '10px 24px',
            borderRadius: 12,
            border: 'none',
            cursor: 'pointer',
            background: running ? 'rgba(232,96,122,0.15)' : 'rgba(232,160,176,0.55)',
            color: running ? '#e8607a' : '#3d1a10',
            fontSize: 13,
            fontFamily: "'Baloo 2', sans-serif",
            fontWeight: 800,
            transition: 'all 0.15s',
            boxShadow: '0 3px 8px rgba(200,120,140,0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          {running ? <Pause size={14} strokeWidth={2.5} /> : <Play size={14} strokeWidth={2.5} />}
          {running ? 'pausar' : elapsed > 0 && !finished ? 'continuar' : 'iniciar'}
        </button>
        <button
          type="button"
          onClick={handleReset}
          style={{
            padding: '10px 14px',
            borderRadius: 12,
            border: '1.5px solid rgba(232,160,176,0.35)',
            cursor: 'pointer',
            background: 'transparent',
            color: 'rgba(122,48,64,0.6)',
            fontSize: 13,
            fontFamily: "'Baloo 2', sans-serif",
            fontWeight: 600,
            transition: 'all 0.15s',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <RotateCcw size={14} strokeWidth={2} />
        </button>
      </div>
    </div>
  )
}
