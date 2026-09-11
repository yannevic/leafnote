// src/lib/rarityRedeem.ts
//
// "Resgate por Raridade": dá um destino pra cartas repetidas encalhadas.
// Jogador escolhe uma raridade, paga com pontos de duplicata (CARD_SELL_VALUE
// da raridade ALVO × RARITY_REDEEM_COST_MULTIPLIER, pagos misturando
// duplicatas de qualquer raridade/coleção) e ganha um pacote de 1 carta —
// sorteada só na hora de abrir (nunca no resgate), entre as cartas daquela
// raridade que a pessoa ainda não tem, somando as 5 coleções normais juntas.
// Nunca envolve a Coleção de Cartas Especial. Não conta pro pity.

import { ref, get, remove, push } from 'firebase/database'
import { db } from './firebase'
import { CARDS, CardDefinition } from './cards'
import { CardRarity } from './rarity'
import { CARD_SELL_VALUE, RARITY_REDEEM_COST_MULTIPLIER } from './economyConfig'

export interface PendingCardEntry {
  id: string
  cardId: string
  collectionId: string
  addedAt: number
}

async function getPendingCards(coupleId: string, uid: string): Promise<PendingCardEntry[]> {
  const snap = await get(ref(db, `couples/${coupleId}/cards/pendingCards/${uid}`))
  const val = snap.val() ?? {}
  return Object.entries(val).map(([id, v]) => ({
    id,
    ...(v as Omit<PendingCardEntry, 'id'>),
  }))
}

async function getOwnedCardIds(coupleId: string, uid: string): Promise<Set<string>> {
  const snap = await get(ref(db, `couples/${coupleId}/cards/inventory/${uid}`))
  const val = (snap.val() as Record<string, Record<string, number>>) ?? {}
  const owned = new Set<string>()
  for (const collectionId of Object.keys(val)) {
    for (const cardId of Object.keys(val[collectionId] ?? {})) {
      if ((val[collectionId][cardId] ?? 0) > 0) owned.add(cardId)
    }
  }
  return owned
}

export function getRedeemCost(rarity: CardRarity): number {
  return CARD_SELL_VALUE[rarity] * RARITY_REDEEM_COST_MULTIPLIER
}

// cartas de todas as coleções normais (nunca a Especial, nunca a secreta
// do Dexter) daquela raridade que a pessoa ainda não tem hoje
export async function getMissingCardsByRarity(
  coupleId: string,
  uid: string,
  rarity: CardRarity
): Promise<CardDefinition[]> {
  const owned = await getOwnedCardIds(coupleId, uid)
  return CARDS.filter((c) => c.rarity === rarity && !c.secret && !owned.has(c.id))
}

// duplicatas disponíveis pra pagar: cartas na mochila (pendingCards) cujo
// cardId já está no inventory (cópia extra, não a primeira)
export async function getDuplicatesForRedeem(
  coupleId: string,
  uid: string
): Promise<Array<PendingCardEntry & { rarity: CardRarity; points: number }>> {
  const [pending, owned] = await Promise.all([
    getPendingCards(coupleId, uid),
    getOwnedCardIds(coupleId, uid),
  ])
  const byId = new Map(CARDS.map((c) => [c.id, c]))
  return pending
    .filter((p) => owned.has(p.cardId))
    .map((p) => {
      const card = byId.get(p.cardId)
      const rarity = (card?.rarity ?? 'comum') as CardRarity
      return { ...p, rarity, points: CARD_SELL_VALUE[rarity] }
    })
}

// resgata: valida que a soma dos instanceIds selecionados bate com o
// custo, remove essas cartas da mochila, e cria um pacote de 1 carta
// fechado — a carta em si só é sorteada ao abrir (branch novo em
// drawPackCards, lib/packs.ts)
export async function redeemRarityPack(
  coupleId: string,
  uid: string,
  rarity: CardRarity,
  instanceIds: string[]
): Promise<boolean> {
  const missing = await getMissingCardsByRarity(coupleId, uid, rarity)
  if (missing.length === 0) return false

  const duplicates = await getDuplicatesForRedeem(coupleId, uid)
  const selected = duplicates.filter((d) => instanceIds.includes(d.id))
  const total = selected.reduce((sum, d) => sum + d.points, 0)
  const cost = getRedeemCost(rarity)
  if (total < cost) return false

  for (const d of selected) {
    await remove(ref(db, `couples/${coupleId}/cards/pendingCards/${uid}/${d.id}`))
  }

  const packsRef = ref(db, `couples/${coupleId}/cards/unopenedPacks/${uid}`)
  await push(packsRef, {
    type: 'rarity-redeem',
    boughtAt: Date.now(),
    redeemRarity: rarity,
  })
  return true
}
