import { ref, get, set, onValue, off } from 'firebase/database'
import { db } from './firebase'

export interface StreakData {
  startDate: string // ISO string da data que escolheram
  resetAt?: string // última vez que brigaram
}

const streakPath = (coupleId: string) => `couples/${coupleId}/streak`

export function subscribeStreak(coupleId: string, callback: (data: StreakData | null) => void) {
  const streakRef = ref(db, streakPath(coupleId))
  onValue(streakRef, (snap) => {
    const val = snap.val() as StreakData | null
    callback(val)
  })
  return () => off(streakRef, 'value')
}

export async function setStreakStart(coupleId: string, startDate: string): Promise<void> {
  const streakRef = ref(db, streakPath(coupleId))
  const snap = await get(streakRef)
  const current = snap.val() as StreakData | null
  await set(streakRef, { ...current, startDate })
}

export async function resetStreak(coupleId: string): Promise<void> {
  const now = new Date().toISOString()
  await set(ref(db, streakPath(coupleId)), {
    startDate: now,
    resetAt: now,
  })
  await set(ref(db, `couples/${coupleId}/garden/specialSeedGiven`), -1)
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

const specialSeedPath = (coupleId: string) => `couples/${coupleId}/garden/specialSeedGiven`

export async function checkSpecialSeedReward(coupleId: string, days: number): Promise<boolean> {
  if (days < 28) return false
  const currentCycle = Math.floor(days / 28)
  const snap = await get(ref(db, specialSeedPath(coupleId)))
  const lastCycle = (snap.val() as number) ?? -1
  return currentCycle > lastCycle
}

export async function claimSpecialSeedReward(coupleId: string, days: number): Promise<void> {
  const currentCycle = Math.floor(days / 28)
  await set(ref(db, specialSeedPath(coupleId)), currentCycle)
}

export interface MilestoneChecks {
  [key: number]: boolean // ex: { 7: true, 14: true }
}

const milestonePath = (coupleId: string) => `couples/${coupleId}/streak/milestoneChecks`

export function subscribeMilestoneChecks(
  coupleId: string,
  callback: (data: MilestoneChecks) => void
) {
  const r = ref(db, milestonePath(coupleId))
  onValue(r, (snap) => callback((snap.val() as MilestoneChecks) ?? {}))
  return () => off(r, 'value')
}

export async function toggleMilestoneCheck(
  coupleId: string,
  day: number,
  value: boolean
): Promise<void> {
  await set(ref(db, `${milestonePath(coupleId)}/${day}`), value)
}

export async function resetMilestoneChecks(coupleId: string): Promise<void> {
  await set(ref(db, milestonePath(coupleId)), null)
}

export function formatMilestoneDays(days: number): string {
  const weeks = Math.floor(days / 7)
  const rest = days % 7
  if (weeks === 0) return `${days} dia${days !== 1 ? 's' : ''}`
  if (rest === 0) return `${weeks} semana${weeks !== 1 ? 's' : ''}`
  return `${weeks} semana${weeks !== 1 ? 's' : ''} e ${rest} dia${rest !== 1 ? 's' : ''}`
}

export const WEEKLY_CHALLENGES = [
  'Trocar couplezinho',
  'Escrevam uma cartinha fofa um pro outro e escolham juntos um prêmio especial',
  'Escolher a foto de perfil do outro por 24h',
  'Dia de Gartic e StopotS',
  'Dia inteiro apenas falando english, all right?',
  'Dá um lanchinho de presente pro perdedor (decidido nos dados ou jokenpô! md5)',
  'Façam um quiz impossível valendo castigos fofos',
  'Dia de quebra-cabeça juntos',
  'Noite de jogos relaxantes juntos em chamada — escolham um jogo fofo pra jogar, deu briga na escolha? sorteio!',
  'Filme com pipoca ao mesmo tempo em chamada e noite especial',
]

export interface WeeklyChallenge {
  challengeIndex: number
  weekKey: string
  previousIndex: number
}

export interface WeeklyPending {
  requestedBy: string
  requestedByNick: string
}

const weeklyPath = (coupleId: string) => `couples/${coupleId}/streak/weeklyChallenge`
const weeklyPendingPath = (coupleId: string) => `couples/${coupleId}/streak/weeklyPending`
export async function confirmWeeklySorteo(
  coupleId: string,
  days: number
): Promise<WeeklyChallenge> {
  const snap = await get(ref(db, weeklyPath(coupleId)))
  const current = snap.val() as WeeklyChallenge | null
  const prev = current?.challengeIndex ?? -1
  const next = drawChallenge(prev)
  const challenge: WeeklyChallenge = {
    challengeIndex: next,
    weekKey: String(getCurrentStreakWeek(days)),
    previousIndex: prev,
  }
  await set(ref(db, weeklyPath(coupleId)), challenge)
  await set(ref(db, weeklyPendingPath(coupleId)), null)
  return challenge
}

export async function panicWeeklySorteo(coupleId: string, days: number): Promise<WeeklyChallenge> {
  return confirmWeeklySorteo(coupleId, days)
}

export function subscribeWeeklyChallenge(
  coupleId: string,
  callback: (data: WeeklyChallenge | null) => void
) {
  const r = ref(db, weeklyPath(coupleId))
  onValue(r, (snap) => callback((snap.val() as WeeklyChallenge) ?? null))
  return () => off(r, 'value')
}

export function subscribeWeeklyPending(
  coupleId: string,
  callback: (data: WeeklyPending | null) => void
) {
  const r = ref(db, weeklyPendingPath(coupleId))
  onValue(r, (snap) => callback((snap.val() as WeeklyPending) ?? null))
  return () => off(r, 'value')
}

function drawChallenge(previousIndex: number): number {
  const available = WEEKLY_CHALLENGES.map((_, i) => i).filter((i) => i !== previousIndex)
  return available[Math.floor(Math.random() * available.length)]
}

export async function requestWeeklySorteo(
  coupleId: string,
  uid: string,
  nick: string
): Promise<void> {
  await set(ref(db, weeklyPendingPath(coupleId)), { requestedBy: uid, requestedByNick: nick })
}
export function getCurrentStreakWeek(days: number): number {
  // retorna o marco atual: 7, 14, 21, 30, 37, 44...
  // 0 se ainda não chegou em 7
  if (days < 7) return 0
  return Math.floor(days / 7) * 7
}

export function isCurrentStreakWeek(challenge: WeeklyChallenge | null, days: number): boolean {
  if (!challenge) return false
  const currentMilestone = getCurrentStreakWeek(days)
  if (currentMilestone === 0) return false
  return challenge.weekKey === String(currentMilestone)
}
