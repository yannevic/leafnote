import { useEffect, useRef, useState, useCallback } from 'react'
import { FLOWERS } from '../lib/garden'
import { useCoupleId } from '../contexts/CoupleContext'
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
  resetBootstrap,
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
  ownedPackCount: number
  totalPackCount: number
  uniqueStickersOnBoard: number
}

interface UseAchievementsReturn {
  achievements: AchievementsMap
  categoryBonus: Partial<Record<AchievementCategory, boolean>>
  unlock: (id: string) => Promise<void>
  claim: (id: string) => Promise<void>
  newlyUnlocked: string[]
  clearNewlyUnlocked: () => void
  reset: () => Promise<void>
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
  ownedPackCount,
  totalPackCount,
  uniqueStickersOnBoard,
}: UseAchievementsParams): UseAchievementsReturn {
  const [achievements, setAchievements] = useState<AchievementsMap>({})
  const [categoryBonus, setCategoryBonus] = useState<Partial<Record<AchievementCategory, boolean>>>(
    {}
  )
  const [newlyUnlocked, setNewlyUnlocked] = useState<string[]>([])
  const [flowerHistory, setFlowerHistory] = useState<string[]>([])
  const prevAchievementsRef = useRef<AchievementsMap>({})
  const { coupleId } = useCoupleId()
  const bootstrapRanRef = useRef(false)

  // ── Subscribe ao histórico de flores ──
  useEffect(() => {
    const unsub = subscribeFlowerHistory(coupleId!, setFlowerHistory)
    return unsub
  }, [])

  // ── Subscribe ao Firebase (achievements + categoryBonus) ──
  useEffect(() => {
    const unsub = subscribeAchievements(coupleId!, (state) => {
      const { records, categoryBonus: cb } = state
      const prev = prevAchievementsRef.current

      // detecta novas conquistas para o toast — ignora primeira leitura
      const isFirstLoad = Object.keys(prev).length === 0
      if (!isFirstLoad) {
        const newIds = Object.keys(records).filter((id) => !prev[id] && records[id])
        if (newIds.length > 0) {
          setNewlyUnlocked((old) => [...old, ...newIds])
        }
      }
      prevAchievementsRef.current = records
      setAchievements(records)
      setCategoryBonus(cb)

      // verifica bônus de categoria a cada atualização
      for (const cat of ALL_CATEGORIES) {
        const defs = getByCategory(cat)
        const allUnlocked = defs.every((d) => records[d.id])
        if (allUnlocked) {
          checkAndPayCategoryBonus(cat, records, coupleId!)
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
      ownedPackCount,
      totalPackCount,
      uniqueStickersOnBoard,
      coupleId: coupleId!,
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
        ownedPackCount,
        totalPackCount,
        uniqueStickersOnBoard,
        coupleId: coupleId!,
      })
    }, 5000)
    return () => clearTimeout(timer)
  }, [uid])

  // ── Unlock manual em tempo real ──
  const unlock = useCallback(
    async (id: string) => {
      if (!uid || uid === 'anon') return
      await unlockAchievement(id, uid, coupleId!)
    },
    [uid]
  )

  // ── Unlock em tempo real — stickers ──
  useEffect(() => {
    if (!uid || uid === 'anon') return
    if (ownedPackCount >= 1) void unlock('sticker_pack_1')
    if (ownedPackCount >= 3) void unlock('sticker_pack_3')
    if (ownedPackCount >= totalPackCount && totalPackCount > 0) void unlock('sticker_pack_all')
  }, [ownedPackCount, totalPackCount, uid])

  useEffect(() => {
    if (!uid || uid === 'anon') return
    if (uniqueStickersOnBoard >= 1) void unlock('sticker_unique_1')
    if (uniqueStickersOnBoard >= 10) void unlock('sticker_unique_10')
    if (uniqueStickersOnBoard >= 25) void unlock('sticker_unique_25')
    if (uniqueStickersOnBoard >= 50) void unlock('sticker_unique_50')
  }, [uniqueStickersOnBoard, uid])

  // ── Resgatar recompensa individual ──
  const claim = useCallback(async (id: string) => {
    await claimAchievementReward(id, coupleId!)
  }, [])

  const clearNewlyUnlocked = useCallback(() => setNewlyUnlocked([]), [])

  const reset = useCallback(async () => {
    bootstrapRanRef.current = false
    dataReadyRef.current = false
    await resetBootstrap(coupleId!)
  }, [])

  return { achievements, categoryBonus, unlock, claim, newlyUnlocked, clearNewlyUnlocked, reset }
}
