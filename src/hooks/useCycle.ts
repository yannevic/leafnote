import { useState, useEffect } from 'react'
import {
  CycleData,
  CycleState,
  computeCycleState,
  subscribeAllCycles,
  cycleKey,
  todayStr,
} from '../lib/cycle'

export interface CycleInfo {
  key: string
  data: CycleData
  state: CycleState
  daysLeft: number
  label: string
}

export interface UseCycleReturn {
  currentCycle: CycleInfo | null
  allCycles: Record<string, CycleData>
  loading: boolean
}

export function useCycle(coupleId: string): UseCycleReturn {
  const [allCycles, setAllCycles] = useState<Record<string, CycleData>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = subscribeAllCycles(coupleId, (data) => {
      setAllCycles(data)
      setLoading(false)
    })
    return unsub
  }, [])

  const currentCycle = findCurrentCycle(allCycles)

  return { currentCycle, allCycles, loading }
}

function findCurrentCycle(cycles: Record<string, CycleData>): CycleInfo | null {
  const today = todayStr()
  const thisMonth = cycleKey(today)
  const lastMonth = cycleKey(
    new Date(new Date(today + 'T12:00:00').setDate(0)).toISOString().slice(0, 10)
  )

  const candidates = [thisMonth, lastMonth]

  let best: CycleInfo | null = null

  candidates.forEach((key) => {
    const data = cycles[key]
    if (!data) return

    const { state, daysLeft, label } = computeCycleState(data)

    if (state === 'none') return

    if (!best) {
      best = { key, data, state, daysLeft, label }
      return
    }

    const priority: Record<CycleState, number> = {
      active: 5,
      tpm: 4,
      chegando: 3,
      ended: 1,
      none: 0,
    }

    if (priority[state] > priority[best.state]) {
      best = { key, data, state, daysLeft, label }
    }
  })

  return best
}
