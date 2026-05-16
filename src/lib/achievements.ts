import { ref, get, set, onValue, off, update } from 'firebase/database'
import { db } from './firebase'
import { addCoins } from './garden'

// ═══════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════

export type AchievementCategory =
  | 'jardim'
  | 'streak'
  | 'cartas'
  | 'financas'
  | 'filmes'
  | 'namoro'
  | 'secreta'

export interface AchievementDef {
  id: string
  nome: string
  descricao: string
  categoria: AchievementCategory
  imagem: string // caminho: /achievements/{id}.png
  recompensa: number // moedas ao desbloquear
  dica?: string // apenas conquistas secretas
}

export interface AchievementRecord {
  unlockedAt: string // ISO date ou 'antes do sistema'
  unlockedBy: string // uid de quem desbloqueou
  rewardClaimed?: boolean // se a recompensa individual já foi resgatada
}

export type AchievementsMap = Record<string, AchievementRecord>

// ═══════════════════════════════════════
// BÔNUS DE CATEGORIA COMPLETA
// ═══════════════════════════════════════

export const CATEGORY_BONUS: Record<AchievementCategory, number> = {
  jardim: 25,
  streak: 30,
  cartas: 18,
  financas: 15,
  filmes: 18,
  namoro: 20,
  secreta: 0,
}

// ═══════════════════════════════════════
// LISTA DE CONQUISTAS
// ═══════════════════════════════════════

export const ACHIEVEMENTS: AchievementDef[] = [
  // ── JARDIM ──────────────────────────
  {
    id: 'first_plant',
    nome: 'Primeiros Brotos',
    descricao: 'Plantaram a primeira sementinha juntos',
    categoria: 'jardim',
    imagem: '/achievements/first_plant.png',
    recompensa: 2,
  },
  {
    id: 'all_common',
    nome: 'Jardim Colorido',
    descricao: 'Tiveram todas as flores comuns',
    categoria: 'jardim',
    imagem: '/achievements/all_common.png',
    recompensa: 4,
  },
  {
    id: 'all_uncommon',
    nome: 'Flores Raras do Dia a Dia',
    descricao: 'Tiveram todas as flores incomuns',
    categoria: 'jardim',
    imagem: '/achievements/all_uncommon.png',
    recompensa: 6,
  },
  {
    id: 'all_rare',
    nome: 'Raridades do Jardim',
    descricao: 'Tiveram todas as flores raras',
    categoria: 'jardim',
    imagem: '/achievements/all_rare.png',
    recompensa: 12,
  },
  {
    id: 'full_catalog',
    nome: 'Jardim Completo',
    descricao: 'Tiveram todas as flores do catálogo',
    categoria: 'jardim',
    imagem: '/achievements/full_catalog.png',
    recompensa: 20,
  },
  {
    id: 'first_sell',
    nome: 'Primeira Venda',
    descricao: 'Venderam a primeira flor ou semente',
    categoria: 'jardim',
    imagem: '/achievements/first_sell.png',
    recompensa: 1,
  },
  {
    id: 'coins_100',
    nome: 'Cofrinho Cheio',
    descricao: 'Acumularam 100 moedinhas',
    categoria: 'jardim',
    imagem: '/achievements/coins_100.png',
    recompensa: 2,
  },
  {
    id: 'coins_500',
    nome: 'Tesourinho',
    descricao: 'Acumularam 500 moedinhas',
    categoria: 'jardim',
    imagem: '/achievements/coins_500.png',
    recompensa: 5,
  },
  {
    id: 'coins_1000',
    nome: 'Ricos de Amor',
    descricao: 'Acumularam 1000 moedinhas',
    categoria: 'jardim',
    imagem: '/achievements/coins_1000.png',
    recompensa: 10,
  },
  {
    id: 'all_slots',
    nome: 'Jardim Grandão',
    descricao: 'Desbloquearam todos os 8 vasos',
    categoria: 'jardim',
    imagem: '/achievements/all_slots.png',
    recompensa: 15,
  },

  // ── STREAK ──────────────────────────
  {
    id: 'streak_7',
    nome: 'Uma Semana Juntos',
    descricao: 'Mantiveram o streak por 7 dias',
    categoria: 'streak',
    imagem: '/achievements/streak_7.png',
    recompensa: 2,
  },
  {
    id: 'streak_14',
    nome: 'Duas Semanas',
    descricao: 'Mantiveram o streak por 14 dias',
    categoria: 'streak',
    imagem: '/achievements/streak_14.png',
    recompensa: 3,
  },
  {
    id: 'streak_30',
    nome: 'Um Mês de Amor',
    descricao: 'Mantiveram o streak por 30 dias',
    categoria: 'streak',
    imagem: '/achievements/streak_30.png',
    recompensa: 6,
  },
  {
    id: 'streak_60',
    nome: 'Dois Meses',
    descricao: 'Mantiveram o streak por 60 dias',
    categoria: 'streak',
    imagem: '/achievements/streak_60.png',
    recompensa: 10,
  },
  {
    id: 'streak_90',
    nome: 'Três Meses',
    descricao: 'Mantiveram o streak por 90 dias',
    categoria: 'streak',
    imagem: '/achievements/streak_90.png',
    recompensa: 14,
  },
  {
    id: 'streak_180',
    nome: 'Meio Ano',
    descricao: 'Mantiveram o streak por 180 dias',
    categoria: 'streak',
    imagem: '/achievements/streak_180.png',
    recompensa: 22,
  },
  {
    id: 'streak_365',
    nome: 'Um Ano Inteiro',
    descricao: 'Um ano inteiro de streak consecutivo',
    categoria: 'streak',
    imagem: '/achievements/streak_365.png',
    recompensa: 40,
  },

  // ── CARTAS ──────────────────────────
  {
    id: 'first_letter',
    nome: 'Primeira Cartinha',
    descricao: 'Enviaram a primeira carta um para o outro',
    categoria: 'cartas',
    imagem: '/achievements/first_letter.png',
    recompensa: 1,
  },
  {
    id: 'letters_10',
    nome: 'Caixinha de Memórias',
    descricao: 'Já trocaram 10 cartas',
    categoria: 'cartas',
    imagem: '/achievements/letters_10.png',
    recompensa: 4,
  },
  {
    id: 'letters_50',
    nome: 'Correspondência Infinita',
    descricao: 'Já trocaram 50 cartas',
    categoria: 'cartas',
    imagem: '/achievements/letters_50.png',
    recompensa: 11,
  },
  {
    id: 'first_special',
    nome: 'Carta do Coração',
    descricao: 'Enviaram a primeira carta especial',
    categoria: 'cartas',
    imagem: '/achievements/first_special.png',
    recompensa: 1,
  },
  {
    id: 'special_10',
    nome: 'Guardados Especiais',
    descricao: 'Já enviaram 10 cartas especiais',
    categoria: 'cartas',
    imagem: '/achievements/special_10.png',
    recompensa: 5,
  },
  {
    id: 'special_50',
    nome: 'Tesouro de Cartas',
    descricao: 'Já enviaram 50 cartas especiais',
    categoria: 'cartas',
    imagem: '/achievements/special_50.png',
    recompensa: 12,
  },

  // ── FINANÇAS ────────────────────────
  {
    id: 'first_goal',
    nome: 'Sonho em Andamento',
    descricao: 'Criaram a primeira meta juntos',
    categoria: 'financas',
    imagem: '/achievements/first_goal.png',
    recompensa: 1,
  },
  {
    id: 'goal_complete',
    nome: 'Meta Batida',
    descricao: 'Completaram a primeira meta',
    categoria: 'financas',
    imagem: '/achievements/goal_complete.png',
    recompensa: 3,
  },
  {
    id: 'goals_5',
    nome: 'Realizadores',
    descricao: 'Completaram 5 metas juntos',
    categoria: 'financas',
    imagem: '/achievements/goals_5.png',
    recompensa: 9,
  },
  {
    id: 'first_debt',
    nome: 'Contas em Dia',
    descricao: 'Quitaram a primeira dívida',
    categoria: 'financas',
    imagem: '/achievements/first_debt.png',
    recompensa: 2,
  },
  {
    id: 'transactions_30',
    nome: 'Organizadinhos',
    descricao: 'Registraram 30 lançamentos financeiros',
    categoria: 'financas',
    imagem: '/achievements/transactions_30.png',
    recompensa: 4,
  },

  // ── FILMES E SÉRIES ─────────────────
  {
    id: 'first_movie',
    nome: 'Primeira Sessão',
    descricao: 'Assistiram ao primeiro filme juntos',
    categoria: 'filmes',
    imagem: '/achievements/first_movie.png',
    recompensa: 1,
  },
  {
    id: 'movies_5',
    nome: 'Pipoqueiros',
    descricao: 'Assistiram a 5 filmes juntos',
    categoria: 'filmes',
    imagem: '/achievements/movies_5.png',
    recompensa: 3,
  },
  {
    id: 'movies_10',
    nome: 'Cinéfilos',
    descricao: 'Assistiram a 10 filmes juntos',
    categoria: 'filmes',
    imagem: '/achievements/movies_10.png',
    recompensa: 4,
  },
  {
    id: 'movies_50',
    nome: 'Maratona de Cinema',
    descricao: 'Assistiram a 50 filmes juntos',
    categoria: 'filmes',
    imagem: '/achievements/movies_50.png',
    recompensa: 11,
  },
  {
    id: 'first_series',
    nome: 'Primeira Série',
    descricao: 'Assistiram à primeira série juntos',
    categoria: 'filmes',
    imagem: '/achievements/first_series.png',
    recompensa: 1,
  },
  {
    id: 'series_5',
    nome: 'Maratonistas',
    descricao: 'Assistiram a 5 séries juntos',
    categoria: 'filmes',
    imagem: '/achievements/series_5.png',
    recompensa: 4,
  },
  {
    id: 'series_25',
    nome: 'Viciados em Série',
    descricao: 'Assistiram a 25 séries juntos',
    categoria: 'filmes',
    imagem: '/achievements/series_25.png',
    recompensa: 10,
  },
  {
    id: 'cartoons_3',
    nome: 'Criança no Coração',
    descricao: 'Assistiram a 3 desenhos juntos',
    categoria: 'filmes',
    imagem: '/achievements/cartoons_3.png',
    recompensa: 3,
  },

  // ── TEMPO DE NAMORO ─────────────────
  {
    id: 'dating_1m',
    nome: 'Primeiro Mês de Namoro',
    descricao: 'Um mês desde o pedido',
    categoria: 'namoro',
    imagem: '/achievements/dating_1m.png',
    recompensa: 2,
  },
  {
    id: 'dating_2m',
    nome: 'Dois Meses de Namoro',
    descricao: 'Dois meses namorando',
    categoria: 'namoro',
    imagem: '/achievements/dating_2m.png',
    recompensa: 2,
  },
  {
    id: 'dating_3m',
    nome: 'Três Meses de Namoro',
    descricao: 'Três meses de namoro',
    categoria: 'namoro',
    imagem: '/achievements/dating_3m.png',
    recompensa: 2,
  },
  {
    id: 'dating_4m',
    nome: 'Quatro Meses de Namoro',
    descricao: 'Quatro meses namorando',
    categoria: 'namoro',
    imagem: '/achievements/dating_4m.png',
    recompensa: 2,
  },
  {
    id: 'dating_5m',
    nome: 'Cinco Meses de Namoro',
    descricao: 'Cinco meses juntos de verdade',
    categoria: 'namoro',
    imagem: '/achievements/dating_5m.png',
    recompensa: 2,
  },
  {
    id: 'dating_6m',
    nome: 'Seis Meses de Namoro',
    descricao: 'Meio ano de namoro',
    categoria: 'namoro',
    imagem: '/achievements/dating_6m.png',
    recompensa: 2,
  },
  {
    id: 'dating_7m',
    nome: 'Sete Meses de Namoro',
    descricao: 'Sete meses namorando',
    categoria: 'namoro',
    imagem: '/achievements/dating_7m.png',
    recompensa: 2,
  },
  {
    id: 'dating_8m',
    nome: 'Oito Meses de Namoro',
    descricao: 'Oito meses de namoro',
    categoria: 'namoro',
    imagem: '/achievements/dating_8m.png',
    recompensa: 2,
  },
  {
    id: 'dating_9m',
    nome: 'Nove Meses de Namoro',
    descricao: 'Nove meses namorando',
    categoria: 'namoro',
    imagem: '/achievements/dating_9m.png',
    recompensa: 2,
  },
  {
    id: 'dating_10m',
    nome: 'Dez Meses de Namoro',
    descricao: 'Dez meses juntos de verdade',
    categoria: 'namoro',
    imagem: '/achievements/dating_10m.png',
    recompensa: 2,
  },
  {
    id: 'dating_11m',
    nome: 'Onze Meses de Namoro',
    descricao: 'Quase um ano de namoro',
    categoria: 'namoro',
    imagem: '/achievements/dating_11m.png',
    recompensa: 2,
  },
  {
    id: 'dating_1y',
    nome: 'Um Ano de Namoro',
    descricao: 'Um ano namorando juntos',
    categoria: 'namoro',
    imagem: '/achievements/dating_1y.png',
    recompensa: 8,
  },
  {
    id: 'dating_2y',
    nome: 'Dois Anos de Namoro',
    descricao: 'Dois anos de namoro',
    categoria: 'namoro',
    imagem: '/achievements/dating_2y.png',
    recompensa: 15,
  },
  {
    id: 'dating_3y',
    nome: 'Três Anos de Namoro',
    descricao: 'Três anos namorando juntos',
    categoria: 'namoro',
    imagem: '/achievements/dating_3y.png',
    recompensa: 28,
  },

  // ── SECRETAS ────────────────────────
  {
    id: 'secret_morar',
    nome: 'Nosso Cantinho',
    descricao: 'Construíram um lar juntos',
    categoria: 'secreta',
    imagem: '/achievements/secret_morar.png',
    recompensa: 35,
    dica: 'um novo lar, um novo capítulo',
  },
  {
    id: 'secret_noivado',
    nome: 'Sim para Sempre',
    descricao: 'Disseram sim antes do sim',
    categoria: 'secreta',
    imagem: '/achievements/secret_noivado.png',
    recompensa: 35,
    dica: 'uma pergunta que muda tudo',
  },
  {
    id: 'secret_casamento',
    nome: 'Para Sempre',
    descricao: 'O começo de tudo que vem depois',
    categoria: 'secreta',
    imagem: '/achievements/secret_casamento.png',
    recompensa: 35,
    dica: 'para sempre começa aqui',
  },
]

// ═══════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════

export function getAchievementDef(id: string): AchievementDef | undefined {
  return ACHIEVEMENTS.find((a) => a.id === id)
}

export function getByCategory(categoria: AchievementCategory): AchievementDef[] {
  return ACHIEVEMENTS.filter((a) => a.categoria === categoria)
}

// ═══════════════════════════════════════
// FIREBASE — CRUD
// ═══════════════════════════════════════

export interface AchievementsState {
  records: AchievementsMap
  categoryBonus: Partial<Record<AchievementCategory, boolean>>
}

export function subscribeAchievements(callback: (state: AchievementsState) => void): () => void {
  const r = ref(db, 'achievements')
  const handler = onValue(r, (snap) => {
    const raw = (snap.val() ?? {}) as Record<string, unknown>
    // separa categoryBonus do resto
    const categoryBonus = (raw.categoryBonus ?? {}) as Partial<Record<AchievementCategory, boolean>>
    const records: AchievementsMap = {}
    for (const [key, val] of Object.entries(raw)) {
      if (key === 'bootstrapped' || key === 'categoryBonus') continue
      if (val && typeof val === 'object') {
        records[key] = val as AchievementRecord
      }
    }
    callback({ records, categoryBonus })
  })
  return () => off(r, 'value', handler)
}

export async function unlockAchievement(id: string, uid: string): Promise<boolean> {
  const r = ref(db, `achievements/${id}`)
  const snap = await get(r)
  if (snap.exists()) return false // já desbloqueada
  // NÃO paga moedas aqui — o usuário resgata manualmente pelo botão
  await set(r, {
    unlockedAt: new Date().toISOString(),
    unlockedBy: uid,
    rewardClaimed: false,
  })
  return true
}

export async function unlockAchievementBackfill(id: string, uid: string): Promise<boolean> {
  const r = ref(db, `achievements/${id}`)
  const snap = await get(r)
  if (snap.exists()) return false
  // bootstrap retroativo — rewardClaimed: false para o usuário poder resgatar
  await set(r, {
    unlockedAt: 'antes do sistema',
    unlockedBy: uid,
    rewardClaimed: false,
  })
  return true
}

/**
 * Resgata a recompensa individual de uma conquista.
 * Paga as moedas e marca rewardClaimed: true.
 * Retorna false se já foi resgatada.
 */
export async function claimAchievementReward(id: string): Promise<boolean> {
  const r = ref(db, `achievements/${id}`)
  const snap = await get(r)
  if (!snap.exists()) return false
  const record = snap.val() as AchievementRecord
  if (record.rewardClaimed) return false

  const def = getAchievementDef(id)
  if (def && def.recompensa > 0) {
    await addCoins(def.recompensa)
  }
  await update(r, { rewardClaimed: true })
  return true
}

export async function isBootstrapped(): Promise<boolean> {
  const snap = await get(ref(db, 'achievements/bootstrapped'))
  return snap.val() === true
}

export async function markBootstrapped(): Promise<void> {
  await set(ref(db, 'achievements/bootstrapped'), true)
}

// ═══════════════════════════════════════
// BÔNUS DE CATEGORIA — pago 1x para sempre
// ═══════════════════════════════════════

export async function checkAndPayCategoryBonus(
  categoria: AchievementCategory,
  records: AchievementsMap
): Promise<void> {
  const bonus = CATEGORY_BONUS[categoria]
  if (!bonus) return

  const bonusKey = `achievements/categoryBonus/${categoria}`
  const alreadyPaid = await get(ref(db, bonusKey))
  if (alreadyPaid.exists()) return

  const defs = getByCategory(categoria)
  const allUnlocked = defs.every((d) => records[d.id])
  if (!allUnlocked) return

  await set(ref(db, bonusKey), true)
  await addCoins(bonus)
}

// ═══════════════════════════════════════
// HISTÓRICO DE FLORES — para conquistas de catálogo
// ═══════════════════════════════════════

/**
 * Registra um tipo de flor no histórico permanente do jardim.
 * Chamado toda vez que uma semente é plantada.
 * garden/flowerHistory/{flowerType}: true
 */
export async function recordFlowerHistory(flowerType: string): Promise<void> {
  await set(ref(db, `garden/flowerHistory/${flowerType}`), true)
}

export function subscribeFlowerHistory(callback: (types: string[]) => void): () => void {
  const r = ref(db, 'garden/flowerHistory')
  const handler = onValue(r, (snap) => {
    const val = (snap.val() ?? {}) as Record<string, boolean>
    callback(Object.keys(val).filter((k) => val[k]))
  })
  return () => off(r, 'value', handler)
}

// ═══════════════════════════════════════
// BOOTSTRAP — verificação inicial
// ═══════════════════════════════════════

interface BootstrapParams {
  uid: string
  plants: { flowerType: string }[]
  seeds: { flowerType: string }[]
  flowerHistory: string[] // histórico permanente de flores já plantadas
  coins: number
  maxPlants: number
  streakDays: number
  movies: { tipo: string; status: string }[]
  goals: { archived?: boolean; current?: number; target?: number }[]
  debts: { paid?: boolean }[]
  transactions: unknown[]
  datingStartDate: string | null
  flowersByRarity: {
    comum: string[]
    incomum: string[]
    rara: string[]
    all: string[]
  }
}

export async function runBootstrap(params: BootstrapParams): Promise<void> {
  const already = await isBootstrapped()
  if (already) return

  const {
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
    datingStartDate,
    flowersByRarity,
  } = params

  const unlock = (id: string) => unlockAchievementBackfill(id, uid)

  // Histórico: combina plantas atuais + sementes + histórico permanente
  const allFlowerIds = [
    ...new Set([
      ...plants.map((p) => p.flowerType),
      ...seeds.map((s) => s.flowerType),
      ...flowerHistory,
    ]),
  ]
  const hasAll = (list: string[]) => list.every((f) => allFlowerIds.includes(f))

  // ── Jardim ──
  if (plants.length >= 1 || flowerHistory.length >= 1) await unlock('first_plant')
  if (coins >= 100) await unlock('coins_100')
  if (coins >= 500) await unlock('coins_500')
  if (coins >= 1000) await unlock('coins_1000')
  if (maxPlants >= 8) await unlock('all_slots')
  if (hasAll(flowersByRarity.comum)) await unlock('all_common')
  if (hasAll(flowersByRarity.incomum)) await unlock('all_uncommon')
  if (hasAll(flowersByRarity.rara)) await unlock('all_rare')
  if (hasAll(flowersByRarity.all)) await unlock('full_catalog')

  // ── Streak ──
  const streakMilestones: [number, string][] = [
    [7, 'streak_7'],
    [14, 'streak_14'],
    [30, 'streak_30'],
    [60, 'streak_60'],
    [90, 'streak_90'],
    [180, 'streak_180'],
    [365, 'streak_365'],
  ]
  for (const [days, id] of streakMilestones) {
    if (streakDays >= days) await unlock(id)
  }

  // ── Filmes e Séries ──
  // Filtra apenas itens assistidos (status === 'watched' OU status === 'assistido')
  console.log('[bootstrap] movies recebidos:', JSON.stringify(movies))
  const watchedMovies = movies.filter(
    (m) =>
      (m.status === 'watched' || m.status === 'assistido') &&
      (m.tipo === 'filme' || m.tipo === 'movie')
  )
  const watchedSeries = movies.filter(
    (m) =>
      (m.status === 'watched' || m.status === 'assistido') &&
      (m.tipo === 'série' || m.tipo === 'serie' || m.tipo === 'series')
  )
  const watchedCartoons = movies.filter(
    (m) =>
      (m.status === 'watched' || m.status === 'assistido') &&
      (m.tipo === 'desenho' || m.tipo === 'cartoon')
  )

  if (watchedMovies.length >= 1) await unlock('first_movie')
  if (watchedMovies.length >= 5) await unlock('movies_5')
  if (watchedMovies.length >= 10) await unlock('movies_10')
  if (watchedMovies.length >= 50) await unlock('movies_50')
  if (watchedSeries.length >= 1) await unlock('first_series')
  if (watchedSeries.length >= 5) await unlock('series_5')
  if (watchedSeries.length >= 25) await unlock('series_25')
  if (watchedCartoons.length >= 3) await unlock('cartoons_3')

  // ── Finanças ──
  const completedGoals = goals.filter(
    (g) => !g.archived && g.current !== undefined && g.target !== undefined && g.current >= g.target
  )
  if (goals.length >= 1) await unlock('first_goal')
  if (completedGoals.length >= 1) await unlock('goal_complete')
  if (completedGoals.length >= 5) await unlock('goals_5')
  if (debts.filter((d) => d.paid).length >= 1) await unlock('first_debt')
  if (transactions.length >= 30) await unlock('transactions_30')

  // ── Tempo de Namoro ──
  if (datingStartDate) {
    const start = new Date(datingStartDate)
    const now = new Date()
    const diffMonths =
      (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth())
    const diffYears = now.getFullYear() - start.getFullYear()

    const monthMilestones: [number, string][] = [
      [1, 'dating_1m'],
      [2, 'dating_2m'],
      [3, 'dating_3m'],
      [4, 'dating_4m'],
      [5, 'dating_5m'],
      [6, 'dating_6m'],
      [7, 'dating_7m'],
      [8, 'dating_8m'],
      [9, 'dating_9m'],
      [10, 'dating_10m'],
      [11, 'dating_11m'],
    ]
    for (const [months, id] of monthMilestones) {
      if (diffMonths >= months) await unlock(id)
    }
    if (diffYears >= 1) await unlock('dating_1y')
    if (diffYears >= 2) await unlock('dating_2y')
    if (diffYears >= 3) await unlock('dating_3y')
  }

  await markBootstrapped()
}
