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
  type MilestoneChecks,
} from '../lib/streak'
import type { StreakData } from '../lib/streak'

const BASE_MILESTONES = [7, 14, 21, 30]

export function useStreak() {
  const [streakData, setStreakData] = useState<StreakData | null>(null)
  const [loading, setLoading] = useState(true)
  const [milestoneChecks, setMilestoneChecks] = useState<MilestoneChecks>({})

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
    })
  }, [days])

  // Descobre o cycle offset real: quantos grupos completos de 4 checks existem
  const allKeys = Object.keys(milestoneChecks)
    .map(Number)
    .sort((a, b) => a - b)
  const completedCycles = Math.floor(allKeys.length / 4)
  const currentOffset = completedCycles * 30

  const currentMilestones = BASE_MILESTONES.map((d) => d + currentOffset)

  const handleCheck = useCallback(
    async (day: number) => {
      const current = milestoneChecks[day] ?? false
      await toggleMilestoneCheck(day, !current)

      // Se marcou o último marco do ciclo atual, reseta e avança
      const lastOfCycle = currentMilestones[currentMilestones.length - 1]
      if (day === lastOfCycle && !current) {
        // Aguarda um tick pra garantir que o Firebase atualizou
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

  return {
    streak: streakData,
    loading,
    days,
    setStart,
    reset,
    milestoneChecks,
    currentMilestones,
    handleCheck,
  }
}
