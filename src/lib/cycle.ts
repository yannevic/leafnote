import { ref, set, get, onValue, off } from 'firebase/database'
import { db } from './firebase'

export type CycleStatus = 'predicted' | 'active' | 'ended'

export type CycleState = 'none' | 'chegando' | 'tpm' | 'active' | 'ended'

export interface CycleData {
  predictedDate: string
  confirmedDate?: string
  duration: number
  endDate: string
  actualEndDate?: string
  tpmStart: string
  tpmDays: number
  status: CycleStatus
}

function addDays(dateStr: string, days: number): string {
  const date = new Date(dateStr + 'T12:00:00')
  date.setDate(date.getDate() + days)
  return date.toISOString().slice(0, 10)
}

function diffDays(a: string, b: string): number {
  const da = new Date(a + 'T12:00:00')
  const db2 = new Date(b + 'T12:00:00')
  return Math.round((da.getTime() - db2.getTime()) / (1000 * 60 * 60 * 24))
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10)
}

export function cycleKey(date: string): string {
  return date.slice(0, 7)
}

export function computeCycleState(cycle: CycleData | null): {
  state: CycleState
  daysLeft: number
  label: string
} {
  if (!cycle || cycle.status === 'ended') {
    return { state: 'none', daysLeft: 0, label: '' }
  }

  const today = todayStr()
  const endDate = cycle.actualEndDate ?? cycle.endDate

  if (cycle.status === 'active') {
    const daysLeft = diffDays(endDate, today)
    if (daysLeft < 0) {
      return { state: 'ended', daysLeft: 0, label: 'ciclo encerrado' }
    }
    return {
      state: 'active',
      daysLeft,
      label: daysLeft === 0 ? 'último dia' : `acaba em ${daysLeft} dia${daysLeft === 1 ? '' : 's'}`,
    }
  }

  const daysToTPM = diffDays(cycle.tpmStart, today)
  const daysToPredicted = diffDays(cycle.predictedDate, today)

  if (daysToTPM > 0) {
    return {
      state: 'chegando',
      daysLeft: daysToTPM,
      label: `tpm em ${daysToTPM} dia${daysToTPM === 1 ? '' : 's'}`,
    }
  }

  if (daysToPredicted >= 0) {
    return {
      state: 'tpm',
      daysLeft: daysToPredicted,
      label:
        daysToPredicted === 0
          ? 'previsto para hoje'
          : `desce em ${daysToPredicted} dia${daysToPredicted === 1 ? '' : 's'}`,
    }
  }

  return {
    state: 'tpm',
    daysLeft: 0,
    label: 'aguardando confirmação',
  }
}

export async function saveCycle(coupleId: string, data: CycleData): Promise<void> {
  const key = cycleKey(data.predictedDate)
  await set(ref(db, `couples/${coupleId}/cycle/${key}`), data)
}

export async function confirmCycleStarted(
  coupleId: string,
  key: string,
  confirmedDate: string,
  duration: number
): Promise<void> {
  const snap = await get(ref(db, `couples/${coupleId}/cycle/${key}`))
  if (!snap.exists()) return
  const current = snap.val() as CycleData
  const updated: CycleData = {
    ...current,
    confirmedDate,
    duration,
    endDate: addDays(confirmedDate, duration - 1),
    status: 'active',
  }
  await set(ref(db, `couples/${coupleId}/cycle/${key}`), updated)
}

export async function endCycle(
  coupleId: string,
  key: string,
  actualEndDate?: string
): Promise<void> {
  const snap = await get(ref(db, `couples/${coupleId}/cycle/${key}`))
  if (!snap.exists()) return
  const current = snap.val() as CycleData
  const updated: CycleData = {
    ...current,
    status: 'ended',
    ...(actualEndDate && { actualEndDate }),
  }
  await set(ref(db, `couples/${coupleId}/cycle/${key}`), updated)
}

export async function predictNextCycle(_uid: string, coupleId: string): Promise<string | null> {
  const snap = await get(ref(db, `couples/${coupleId}/cycle`))
  if (!snap.exists()) return null

  const cycles = snap.val() as Record<string, CycleData>
  const confirmed = Object.values(cycles)
    .filter((c) => c.confirmedDate)
    .sort((a, b) => (a.confirmedDate! > b.confirmedDate! ? 1 : -1))

  if (confirmed.length < 2) return null

  const gaps: number[] = []
  confirmed.forEach((c, i) => {
    if (i === 0) return
    const gap = diffDays(c.confirmedDate!, confirmed[i - 1].confirmedDate!)
    gaps.push(gap)
  })

  const avgGap = Math.round(gaps.reduce((a, b) => a + b, 0) / gaps.length)
  const last = confirmed[confirmed.length - 1]
  return addDays(last.confirmedDate!, avgGap)
}

export function subscribeCycle(
  coupleId: string,
  key: string,
  callback: (data: CycleData | null) => void
): () => void {
  const r = ref(db, `couples/${coupleId}/cycle/${key}`)
  onValue(r, (snap) => {
    callback(snap.exists() ? (snap.val() as CycleData) : null)
  })
  return () => off(r)
}

export function subscribeAllCycles(
  coupleId: string,
  callback: (data: Record<string, CycleData>) => void
): () => void {
  const r = ref(db, `couples/${coupleId}/cycle`)
  onValue(r, (snap) => {
    callback(snap.exists() ? (snap.val() as Record<string, CycleData>) : {})
  })
  return () => off(r)
}

export async function deleteCycle(coupleId: string, key: string): Promise<void> {
  const { remove } = await import('firebase/database')
  await remove(ref(db, `couples/${coupleId}/cycle/${key}`))
}

export { addDays, diffDays, todayStr }
