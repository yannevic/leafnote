import { useEffect, useState, useCallback, useRef } from 'react'
import {
  subscribeStreak,
  setStreakStart,
  resetStreak,
  calcDays,
  checkSpecialSeedReward,
  claimSpecialSeedReward,
  claimMilestoneReward,
  subscribeMilestoneChecks,
  toggleMilestoneCheck,
  resetMilestoneChecks,
  subscribeWeeklyChallenge,
  subscribeWeeklyPending,
  requestWeeklySorteo,
  confirmWeeklySorteo,
  panicWeeklySorteo,
  isCurrentStreakWeek,
  getCurrentStreakWeek,
  WEEKLY_CHALLENGES,
  type MilestoneChecks,
  type WeeklyChallenge,
  type WeeklyPending,
} from '../lib/streak'
import type { StreakData } from '../lib/streak'

const BASE_MILESTONES = [7, 14, 21, 28]

// PARA:
function buildCurrentMilestones(milestoneChecks: MilestoneChecks): number[] {
  const cycleSize = 28
  let cycle = 0
  while (true) {
    const offset = cycle * cycleSize
    const marcos = BASE_MILESTONES.map((d) => d + offset)
    const lastMarco = marcos[marcos.length - 1]
    if (!milestoneChecks[lastMarco]) return marcos
    cycle++
  }
}

export function useStreak(coupleId: string, uid?: string, nick?: string, panicMode?: boolean) {
  const [streakData, setStreakData] = useState<StreakData | null>(null)
  const [loading, setLoading] = useState(true)
  const [milestoneChecks, setMilestoneChecks] = useState<MilestoneChecks>({})
  const [weeklyChallenge, setWeeklyChallenge] = useState<WeeklyChallenge | null>(null)
  const [weeklyPending, setWeeklyPending] = useState<WeeklyPending | null>(null)
  const [justClaimed, setJustClaimed] = useState<{
    day: number
    amount: number
    gotPack: boolean
  } | null>(null)

  useEffect(() => {
    const unsub = subscribeStreak(coupleId, (data: StreakData | null) => {
      setStreakData(data)
      setLoading(false)
    })
    return unsub
  }, [])

  useEffect(() => {
    const unsub = subscribeMilestoneChecks(coupleId, setMilestoneChecks)
    return unsub
  }, [])

  useEffect(() => {
    const unsub = subscribeWeeklyChallenge(coupleId, setWeeklyChallenge)
    return unsub
  }, [])

  useEffect(() => {
    const unsub = subscribeWeeklyPending(coupleId, setWeeklyPending)
    return unsub
  }, [])

  const days = streakData?.startDate ? calcDays(streakData.startDate) : 0
  const checkedCycleRef = useRef(-1)

  useEffect(() => {
    if (days < 28) return
    const currentCycle = Math.floor(days / 28)
    if (checkedCycleRef.current === currentCycle) return
    checkedCycleRef.current = currentCycle
    checkSpecialSeedReward(coupleId, days).then(async (eligible) => {
      if (!eligible) return
      const { addSeed } = await import('../lib/garden')
      await addSeed(coupleId, 'especial')
      await claimSpecialSeedReward(coupleId, days)
      if (panicMode) {
        await panicWeeklySorteo(coupleId, days)
      } else {
        await requestWeeklySorteo(coupleId, uid ?? '', nick ?? '')
      }
    })
  }, [days])

  const currentMilestones = buildCurrentMilestones(milestoneChecks)

  const handleCheck = useCallback(
    async (day: number) => {
      const current = milestoneChecks[day] ?? false
      const newValue = !current
      await toggleMilestoneCheck(coupleId, day, newValue)
      if (newValue) {
        const resetAt = streakData?.resetAt ?? 'inicio'
        const reward = await claimMilestoneReward(coupleId, resetAt, day)
        if (reward) setJustClaimed({ day, ...reward })
      }
    },
    [milestoneChecks, currentMilestones, streakData]
  )
  const setStart = useCallback(async (iso: string) => {
    await setStreakStart(coupleId, iso)
  }, [])

  const reset = useCallback(async () => {
    await resetStreak(coupleId)
    await resetMilestoneChecks(coupleId)
  }, [])

  const requestSorteo = useCallback(async () => {
    if (!uid || !nick) return
    await requestWeeklySorteo(coupleId, uid, nick)
  }, [uid, nick])

  const confirmSorteo = useCallback(async () => {
    await confirmWeeklySorteo(coupleId, days)
  }, [days])

  const panicSorteo = useCallback(async () => {
    await panicWeeklySorteo(coupleId, days)
  }, [days])

  const hasWeeklyThisWeek = isCurrentStreakWeek(weeklyChallenge, days)
  const currentStreakWeek = getCurrentStreakWeek(days)
  const iRequested = weeklyPending?.requestedBy === uid
  const partnerRequested = !!weeklyPending && !iRequested

  return {
    streak: streakData,
    loading,
    days,
    setStart,
    reset,
    milestoneChecks,
    currentMilestones,
    handleCheck,
    weeklyChallenge,
    weeklyChallengeName:
      weeklyChallenge !== null ? WEEKLY_CHALLENGES[weeklyChallenge.challengeIndex] : null,
    weeklyPending,
    hasWeeklyThisWeek,
    currentStreakWeek,
    iRequested,
    partnerRequested,
    requestSorteo,
    confirmSorteo,
    panicSorteo,
    justClaimed,
    clearJustClaimed: () => setJustClaimed(null),
  }
}
