import { useState, useEffect, useRef, useCallback } from 'react'
import {
  SharedTimerState,
  TimerMode,
  subscribeTimer,
  saveTimerState,
  computeElapsed,
  makeDefaultTimer,
} from '../lib/widgets'

export function useSharedTimer(coupleId: string, nick: string) {
  const [remote, setRemote] = useState<SharedTimerState | null>(null)
  const [localElapsed, setLocalElapsed] = useState(0)
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const remoteRef = useRef<SharedTimerState | null>(null)

  // Assina Firebase
  useEffect(() => {
    const unsub = subscribeTimer(coupleId, (state: SharedTimerState | null) => {
      remoteRef.current = state
      setRemote(state)
      setLocalElapsed(state ? computeElapsed(state) : 0)
    })
    return unsub
  }, [])

  // Tick local quando rodando
  useEffect(() => {
    if (tickRef.current) {
      clearInterval(tickRef.current)
      tickRef.current = null
    }
    if (remote?.running) {
      tickRef.current = setInterval(() => {
        if (remoteRef.current?.running) {
          setLocalElapsed(computeElapsed(remoteRef.current))
        }
      }, 500)
    }
    return () => {
      if (tickRef.current) {
        clearInterval(tickRef.current)
        tickRef.current = null
      }
    }
  }, [remote?.running, remote?.startedAt])

  const start = useCallback(() => {
    const base = remoteRef.current ?? makeDefaultTimer()
    const isCountdown = base.mode === 'countdown'
    const wasFinished = isCountdown && base.target > 0 && base.elapsed >= base.target
    const isPaused = !base.running && base.elapsed > 0 && !wasFinished
    const next: SharedTimerState = {
      ...base,
      running: true,
      startedAt: Date.now(),
      pausedAt: 0,
      elapsed: wasFinished ? 0 : isPaused ? base.elapsed : base.elapsed,
      startedBy: nick,
    }
    saveTimerState(coupleId, next)
  }, [nick])

  const pause = useCallback(() => {
    const base = remoteRef.current
    if (!base) return
    const elapsed = computeElapsed(base)
    const next: SharedTimerState = {
      ...base,
      running: false,
      pausedAt: Date.now(),
      elapsed,
    }
    saveTimerState(coupleId, next)
    setLocalElapsed(elapsed)
  }, [])

  const reset = useCallback(() => {
    const base = remoteRef.current ?? makeDefaultTimer()
    const next: SharedTimerState = {
      ...base,
      running: false,
      startedAt: 0,
      pausedAt: 0,
      elapsed: 0,
    }
    remoteRef.current = next
    saveTimerState(coupleId, next)
    setLocalElapsed(0)
  }, [])

  const setMode = useCallback((mode: TimerMode) => {
    const base = remoteRef.current ?? makeDefaultTimer()
    const next: SharedTimerState = {
      ...base,
      mode,
      running: false,
      startedAt: 0,
      pausedAt: 0,
      elapsed: 0,
    }
    remoteRef.current = next
    saveTimerState(coupleId, next)
    setLocalElapsed(0)
  }, [])

  const setTarget = useCallback((seconds: number) => {
    const base = remoteRef.current ?? makeDefaultTimer()
    const next: SharedTimerState = {
      ...base,
      target: seconds,
      running: false,
      startedAt: 0,
      pausedAt: 0,
      elapsed: 0,
    }
    remoteRef.current = next
    saveTimerState(coupleId, next)
    setLocalElapsed(0)
  }, [])

  const isRunning = remote?.running ?? false
  const mode = remote?.mode ?? 'stopwatch'
  const target = remote?.target ?? 60
  const finished = mode === 'countdown' && localElapsed >= target && target > 0

  // Se acabou o countdown, para no Firebase
  useEffect(() => {
    if (finished && remoteRef.current?.running) {
      const base = remoteRef.current
      const next: SharedTimerState = {
        ...base,
        running: false,
        elapsed: base.target,
        pausedAt: Date.now(),
      }
      remoteRef.current = next
      saveTimerState(coupleId, next)
    }
  }, [finished])

  const displaySeconds = mode === 'countdown' ? Math.max(0, target - localElapsed) : localElapsed

  return {
    remote,
    localElapsed,
    displaySeconds,
    isRunning,
    mode,
    target,
    finished,
    start,
    pause,
    reset,
    setMode,
    setTarget,
  }
}
