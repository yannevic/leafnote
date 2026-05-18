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

// adiciona depois de formatMilestoneDays

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

const WEEKLY_PATH = 'streak/weeklyChallenge'
const WEEKLY_PENDING_PATH = 'streak/weeklyPending'
export async function confirmWeeklySorteo(days: number): Promise<WeeklyChallenge> {
  const snap = await get(ref(db, WEEKLY_PATH))
  const current = snap.val() as WeeklyChallenge | null
  const prev = current?.challengeIndex ?? -1
  const next = drawChallenge(prev)
  const challenge: WeeklyChallenge = {
    challengeIndex: next,
    weekKey: String(getCurrentStreakWeek(days)),
    previousIndex: prev,
  }
  await set(ref(db, WEEKLY_PATH), challenge)
  await set(ref(db, WEEKLY_PENDING_PATH), null)
  return challenge
}

export async function panicWeeklySorteo(days: number): Promise<WeeklyChallenge> {
  return confirmWeeklySorteo(days)
}

export function subscribeWeeklyChallenge(callback: (data: WeeklyChallenge | null) => void) {
  const r = ref(db, WEEKLY_PATH)
  onValue(r, (snap) => callback((snap.val() as WeeklyChallenge) ?? null))
  return () => off(r, 'value')
}

export function subscribeWeeklyPending(callback: (data: WeeklyPending | null) => void) {
  const r = ref(db, WEEKLY_PENDING_PATH)
  onValue(r, (snap) => callback((snap.val() as WeeklyPending) ?? null))
  return () => off(r, 'value')
}

function drawChallenge(previousIndex: number): number {
  const available = WEEKLY_CHALLENGES.map((_, i) => i).filter((i) => i !== previousIndex)
  return available[Math.floor(Math.random() * available.length)]
}

export async function requestWeeklySorteo(uid: string, nick: string): Promise<void> {
  await set(ref(db, WEEKLY_PENDING_PATH), { requestedBy: uid, requestedByNick: nick })
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
