import { ref, get, set, onValue, off } from 'firebase/database'
import { db } from './firebase'

export interface StreakData {
  startDate: string // ISO string da data que escolheram
  resetAt?: string // última vez que brigaram
}

const STREAK_PATH = 'streak'

export function subscribeStreak(callback: (data: StreakData | null) => void) {
  const streakRef = ref(db, STREAK_PATH)
  onValue(streakRef, (snap) => {
    const val = snap.val() as StreakData | null
    callback(val)
  })
  return () => off(streakRef, 'value')
}

export async function setStreakStart(startDate: string): Promise<void> {
  const streakRef = ref(db, STREAK_PATH)
  const snap = await get(streakRef)
  const current = snap.val() as StreakData | null
  await set(streakRef, { ...current, startDate })
}

export async function resetStreak(): Promise<void> {
  const now = new Date().toISOString()
  await set(ref(db, STREAK_PATH), {
    startDate: now,
    resetAt: now,
  })
  await set(ref(db, 'garden/specialSeedGiven'), false)
}

export function calcDays(startDate: string): number {
  const toLocalDateStr = (d: Date) =>
    d.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })

  const start = new Date(startDate)
  const now = new Date()

  const [dS, mS, yS] = toLocalDateStr(start).split('/').map(Number)
  const [dN, mN, yN] = toLocalDateStr(now).split('/').map(Number)

  const startLocal = new Date(yS, mS - 1, dS)
  const nowLocal = new Date(yN, mN - 1, dN)

  const diff = nowLocal.getTime() - startLocal.getTime()
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)))
}

const SPECIAL_SEED_GIVEN_PATH = 'garden/specialSeedGiven'

export async function checkSpecialSeedReward(days: number): Promise<boolean> {
  if (days < 30) return false
  const snap = await get(ref(db, SPECIAL_SEED_GIVEN_PATH))
  if (snap.val() === true) return false
  return true
}

export async function claimSpecialSeedReward(): Promise<void> {
  await set(ref(db, SPECIAL_SEED_GIVEN_PATH), true)
}

export interface MilestoneChecks {
  [key: number]: boolean // ex: { 7: true, 14: true }
}

const MILESTONE_CHECKS_PATH = 'streak/milestoneChecks'

export function subscribeMilestoneChecks(callback: (data: MilestoneChecks) => void) {
  const r = ref(db, MILESTONE_CHECKS_PATH)
  onValue(r, (snap) => callback((snap.val() as MilestoneChecks) ?? {}))
  return () => off(r, 'value')
}

export async function toggleMilestoneCheck(day: number, value: boolean): Promise<void> {
  await set(ref(db, `${MILESTONE_CHECKS_PATH}/${day}`), value)
}

export async function resetMilestoneChecks(): Promise<void> {
  await set(ref(db, MILESTONE_CHECKS_PATH), null)
}

export function formatMilestoneDays(days: number): string {
  const months = Math.floor(days / 30)
  const rest = days % 30
  if (months === 0) return `${days} dia${days !== 1 ? 's' : ''}`
  if (rest === 0) return `${months} ${months === 1 ? 'mês' : 'meses'}`
  return `${months} ${months === 1 ? 'mês' : 'meses'} e ${rest} dia${rest !== 1 ? 's' : ''}`
}
