import { useEffect, useState, useCallback, useRef } from 'react'
import {
  subscribeStreak,
  setStreakStart,
  resetStreak,
  calcDays,
  checkSpecialSeedReward,
  claimSpecialSeedReward,
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

const BASE_MILESTONES = [7, 14, 21, 30]

function buildCurrentMilestones(days: number): number[] {
  // mostra o ciclo atual de 4 marcos (ex: 7-30, 37-60, 61-90...)
  const cycleSize = 30
  const currentCycle = Math.floor(Math.max(0, days) / cycleSize)
  const offset = currentCycle * cycleSize
  return BASE_MILESTONES.map((d) => d + offset)
}

export function useStreak(uid?: string, nick?: string) {
  const [streakData, setStreakData] = useState<StreakData | null>(null)
  const [loading, setLoading] = useState(true)
  const [milestoneChecks, setMilestoneChecks] = useState<MilestoneChecks>({})
  const [weeklyChallenge, setWeeklyChallenge] = useState<WeeklyChallenge | null>(null)
  const [weeklyPending, setWeeklyPending] = useState<WeeklyPending | null>(null)

  useEffect(() => {
    const unsub = subscribeStreak((data) => {
      setStreakData(data)
      setLoading(false)
    })
    return unsub
  }, [])

  useEffect(() => {
    const unsub = subscribeMilestoneChecks(setMilestoneChecks)
    return unsub
  }, [])

  useEffect(() => {
    const unsub = subscribeWeeklyChallenge(setWeeklyChallenge)
    return unsub
  }, [])

  useEffect(() => {
    const unsub = subscribeWeeklyPending(setWeeklyPending)
    return unsub
  }, [])

  const days = streakData?.startDate ? calcDays(streakData.startDate) : 0
  const checkedRef = useRef(false)

  useEffect(() => {
    if (checkedRef.current || days < 30) return
    checkedRef.current = true
    checkSpecialSeedReward(days).then(async (eligible) => {
      if (!eligible) return
      const { addSeed } = await import('../lib/garden')
      await addSeed('especial')
      await claimSpecialSeedReward()
      // sorteia a meta do mês automaticamente, sem precisar do parceiro
      await panicWeeklySorteo(days)
    })
  }, [days])

  const currentMilestones = buildCurrentMilestones(days)

  const handleCheck = useCallback(
    async (day: number) => {
      const current = milestoneChecks[day] ?? false
      await toggleMilestoneCheck(day, !current)
      const lastOfCycle = currentMilestones[currentMilestones.length - 1]
      if (day === lastOfCycle && !current) {
        setTimeout(async () => {
          await resetMilestoneChecks()
        }, 800)
      }
    },
    [milestoneChecks, currentMilestones]
  )

  const setStart = useCallback(async (iso: string) => {
    await setStreakStart(iso)
  }, [])

  const reset = useCallback(async () => {
    await resetStreak()
    await resetMilestoneChecks()
  }, [])

  const requestSorteo = useCallback(async () => {
    if (!uid || !nick) return
    await requestWeeklySorteo(uid, nick)
  }, [uid, nick])

  const confirmSorteo = useCallback(async () => {
    await confirmWeeklySorteo(days)
  }, [days])

  const panicSorteo = useCallback(async () => {
    await panicWeeklySorteo(days)
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
  }
}
