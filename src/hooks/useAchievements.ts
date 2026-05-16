import { useEffect, useRef, useState, useCallback } from 'react'
import { FLOWERS } from '../lib/garden'
import {
  subscribeAchievements,
  subscribeFlowerHistory,
  unlockAchievement,
  claimAchievementReward,
  runBootstrap,
  checkAndPayCategoryBonus,
  getByCategory,
  type AchievementsMap,
  type AchievementCategory,
} from '../lib/achievements'

// ═══════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════

function parseDatingDate(raw: string | undefined | null): string | null {
  if (!raw || raw === 'DD-MM-AAAA') return null
  const parts = raw.split('-')
  if (parts.length !== 3) return null
  const [dd, mm, yyyy] = parts
  if (!dd || !mm || !yyyy || yyyy.length !== 4) return null
  return `${yyyy}-${mm}-${dd}`
}

function buildFlowersByRarity() {
  const entries = Object.values(FLOWERS)
  return {
    comum: entries.filter((f) => f.rarity === 'comum').map((f) => f.type),
    incomum: entries.filter((f) => f.rarity === 'incomum').map((f) => f.type),
    rara: entries.filter((f) => f.rarity === 'rara').map((f) => f.type),
    all: entries.map((f) => f.type),
  }
}

const ALL_CATEGORIES: AchievementCategory[] = [
  'jardim',
  'streak',
  'cartas',
  'financas',
  'filmes',
  'namoro',
  'secreta',
]

// ═══════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════

interface UseAchievementsParams {
  uid: string
  plants: { flowerType: string }[]
  seeds: { flowerType: string }[]
  coins: number
  maxPlants: number
  streakDays: number
  movies: { tipo: string; status: string }[]
  goals: { archived?: boolean; current?: number; target?: number }[]
  debts: { paid?: boolean }[]
  transactions: unknown[]
  moviesLoaded?: boolean
  datingDate: string | undefined | null
}

interface UseAchievementsReturn {
  achievements: AchievementsMap
  categoryBonus: Partial<Record<AchievementCategory, boolean>>
  unlock: (id: string) => Promise<void>
  claim: (id: string) => Promise<void>
  newlyUnlocked: string[]
  clearNewlyUnlocked: () => void
}

// ═══════════════════════════════════════
// HOOK
// ═══════════════════════════════════════

export function useAchievements({
  uid,
  plants,
  seeds,
  coins,
  maxPlants,
  streakDays,
  movies,
  goals,
  debts,
  transactions,
  moviesLoaded,
  datingDate,
}: UseAchievementsParams): UseAchievementsReturn {
  const [achievements, setAchievements] = useState<AchievementsMap>({})
  const [categoryBonus, setCategoryBonus] = useState<Partial<Record<AchievementCategory, boolean>>>(
    {}
  )
  const [newlyUnlocked, setNewlyUnlocked] = useState<string[]>([])
  const [flowerHistory, setFlowerHistory] = useState<string[]>([])
  const prevAchievementsRef = useRef<AchievementsMap>({})
  const bootstrapRanRef = useRef(false)

  // ── Subscribe ao histórico de flores ──
  useEffect(() => {
    const unsub = subscribeFlowerHistory(setFlowerHistory)
    return unsub
  }, [])

  // ── Subscribe ao Firebase (achievements + categoryBonus) ──
  useEffect(() => {
    const unsub = subscribeAchievements((state) => {
      const { records, categoryBonus: cb } = state
      const prev = prevAchievementsRef.current

      // detecta novas conquistas para o toast
      const newIds = Object.keys(records).filter((id) => !prev[id] && records[id])
      if (newIds.length > 0) {
        setNewlyUnlocked((old) => [...old, ...newIds])
      }
      prevAchievementsRef.current = records
      setAchievements(records)
      setCategoryBonus(cb)

      // verifica bônus de categoria a cada atualização
      for (const cat of ALL_CATEGORIES) {
        const defs = getByCategory(cat)
        const allUnlocked = defs.every((d) => records[d.id])
        if (allUnlocked) {
          checkAndPayCategoryBonus(cat, records)
        }
      }
    })
    return unsub
  }, [])

  // ── Bootstrap — roda uma vez quando uid estiver pronto ──
  const dataReadyRef = useRef(false)

  useEffect(() => {
    if (bootstrapRanRef.current || !uid || uid === 'anon') return
    // espera moviesLoaded antes de rodar — filmes chegam async
    if (!moviesLoaded && !dataReadyRef.current) return

    const hasData =
      plants.length > 0 ||
      seeds.length > 0 ||
      movies.length > 0 ||
      transactions.length > 0 ||
      goals.length > 0 ||
      streakDays > 0 ||
      coins > 0 ||
      flowerHistory.length > 0

    void hasData // usado indiretamente pelo bootstrap

    dataReadyRef.current = true
    bootstrapRanRef.current = true

    runBootstrap({
      uid,
      plants,
      seeds,
      flowerHistory,
      coins,
      maxPlants,
      streakDays,
      movies,
      goals,
      debts,
      transactions,
      datingStartDate: parseDatingDate(datingDate),
      flowersByRarity: buildFlowersByRarity(),
    })
  }, [
    uid,
    plants,
    seeds,
    movies,
    transactions,
    goals,
    streakDays,
    coins,
    flowerHistory,
    moviesLoaded,
  ])

  // fallback: roda após 5s mesmo com tudo zerado
  useEffect(() => {
    if (dataReadyRef.current || !uid || uid === 'anon') return
    const timer = setTimeout(() => {
      if (bootstrapRanRef.current) return
      dataReadyRef.current = true
      bootstrapRanRef.current = true
      runBootstrap({
        uid,
        plants,
        seeds,
        flowerHistory,
        coins,
        maxPlants,
        streakDays,
        movies,
        goals,
        debts,
        transactions,
        datingStartDate: parseDatingDate(datingDate),
        flowersByRarity: buildFlowersByRarity(),
      })
    }, 5000)
    return () => clearTimeout(timer)
  }, [uid])

  // ── Unlock manual em tempo real ──
  const unlock = useCallback(
    async (id: string) => {
      if (!uid || uid === 'anon') return
      await unlockAchievement(id, uid)
    },
    [uid]
  )

  // ── Resgatar recompensa individual ──
  const claim = useCallback(async (id: string) => {
    await claimAchievementReward(id)
  }, [])

  const clearNewlyUnlocked = useCallback(() => setNewlyUnlocked([]), [])

  return { achievements, categoryBonus, unlock, claim, newlyUnlocked, clearNewlyUnlocked }
}
