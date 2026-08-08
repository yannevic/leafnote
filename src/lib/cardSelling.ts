import { ref, get, set, remove } from 'firebase/database'
import { db } from './firebase'
import { CardRarity } from './rarity'
import { addCoins } from './personalCoin'
import { CARD_SELL_VALUE } from './economyConfig'
import {
  CARD_SELL_NEGOTIATE_MAX_MULTIPLIER,
  CARD_SELL_NEGOTIATE_MIN_CHANCE,
  CARD_SELL_NEGOTIATE_CURVE_POWER,
  CARD_SELL_COOLDOWN_MS,
} from './dropRates'

export function getDefaultSellPrice(rarity: CardRarity): number {
  return CARD_SELL_VALUE[rarity]
}

export function getNegotiateMaxPrice(rarity: CardRarity): number {
  return Math.round(getDefaultSellPrice(rarity) * CARD_SELL_NEGOTIATE_MAX_MULTIPLIER)
}

// t = 0 no preço padrão, t = 1 no preço máximo do slider.
// pow(t, 0.5) sobe rápido logo no início — chance cai rápido assim que
// o slider sai do preço padrão, até o mínimo (CARD_SELL_NEGOTIATE_MIN_CHANCE) no topo
export function getNegotiateChance(rarity: CardRarity, requestedAmount: number): number {
  const min = getDefaultSellPrice(rarity)
  const max = getNegotiateMaxPrice(rarity)
  if (max <= min) return 1
  const t = Math.min(1, Math.max(0, (requestedAmount - min) / (max - min)))
  const chance =
    1 - (1 - CARD_SELL_NEGOTIATE_MIN_CHANCE) * Math.pow(t, CARD_SELL_NEGOTIATE_CURVE_POWER)
  return Math.max(CARD_SELL_NEGOTIATE_MIN_CHANCE, Math.min(1, chance))
}

// retorna ms restantes de cooldown, ou null se pode negociar
export async function getSellCooldown(
  coupleId: string,
  uid: string,
  cardId: string
): Promise<number | null> {
  const cdRef = ref(db, `couples/${coupleId}/cards/sellCooldown/${uid}/${cardId}`)
  const snap = await get(cdRef)
  const expiresAt = snap.val() as number | null
  if (!expiresAt) return null
  const remaining = expiresAt - Date.now()
  return remaining > 0 ? remaining : null
}

// venda direta: sempre aceita, preço fixo por raridade
export async function sellCardInstant(
  coupleId: string,
  uid: string,
  instanceId: string,
  rarity: CardRarity
): Promise<void> {
  const price = getDefaultSellPrice(rarity)
  await remove(ref(db, `couples/${coupleId}/cards/pendingCards/${uid}/${instanceId}`))
  await addCoins(uid, price, 'venda de carta repetida')
}

export type NegotiateResult = 'accepted' | 'refused'

// negociação: rola a chance com base no valor pedido no slider.
// aceitou -> credita o valor pedido e remove a instância.
// recusou -> NÃO remove a instância (continua pendente) e bloqueia
// negociação (não venda direta) daquele cardId por CARD_SELL_COOLDOWN_MS
export async function negotiateSellCard(
  coupleId: string,
  uid: string,
  instanceId: string,
  cardId: string,
  rarity: CardRarity,
  requestedAmount: number
): Promise<NegotiateResult> {
  const chance = getNegotiateChance(rarity, requestedAmount)
  const success = Math.random() < chance

  if (success) {
    await remove(ref(db, `couples/${coupleId}/cards/pendingCards/${uid}/${instanceId}`))
    await addCoins(uid, requestedAmount, 'venda negociada de carta repetida')
    return 'accepted'
  }

  const cdRef = ref(db, `couples/${coupleId}/cards/sellCooldown/${uid}/${cardId}`)
  await set(cdRef, Date.now() + CARD_SELL_COOLDOWN_MS)
  return 'refused'
}
