// src/lib/economyConfig.ts
//
// FONTE ÚNICA de todos os valores econômicos do app — moeda pessoal E
// moeda conjunta do casal (jardim). Mude um valor aqui e ele se aplica
// em todo o app — incluindo o popup de "+X moedas". Não duplique esses
// números em outros arquivos. Chances/% ficam em dropRates.ts, não aqui.

import { FlowerRarity } from './garden'
import { CardRarity } from './rarity'

// ─── Ganhar moeda pessoal ───────────────────────
export const WATER_REWARD = 3 // moedas por rega válida

export const SEED_SELL_VALUE: Record<FlowerRarity, number> = {
  comum: 2,
  incomum: 5,
  rara: 14,
  epica: 40,
}

export const FLOWER_SELL_VALUE: Record<FlowerRarity, number> = {
  comum: 6,
  incomum: 18,
  rara: 55,
  epica: 180,
}

// Marco de streak (Fase 4 — ainda não implementado)
export const STREAK_MILESTONE_REWARD = 15
export const STREAK_CYCLE_BONUS = 50

// Atividades (Fase 4 — ainda não implementado)
export const ACTIVITY_REWARD = {
  leve: 10,
  medio: 20, // ou 1 pacote básico
  alto: 30, // + 1 pacote básico
} as const

// ─── Gastar moeda pessoal (cartinhas) ───────────
export const PACK_PRICES: Record<'comum' | 'promocional', number> = {
  comum: 40,
  promocional: 55,
}

export const SHOP_PRICES: Record<'incomum' | 'rara' | 'epica', number> = {
  incomum: 20,
  rara: 50,
  epica: 130,
}

// Venda de carta repetida (seção 6 do plano — ainda sem UI)
export const CARD_SELL_VALUE: Record<CardRarity, number> = {
  comum: 1,
  incomum: 3,
  rara: 8,
  epica: 25,
}

// ─── Moeda conjunta do casal (jardim) ───────────
export const SLOT_PRICES = [80, 250, 500, 900]

export const EXCHANGE_COST: Record<FlowerRarity, number> = {
  comum: 5,
  incomum: 6,
  rara: 7,
  epica: 999,
}
