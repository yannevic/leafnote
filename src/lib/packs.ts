import { ref, runTransaction } from 'firebase/database'
import { db } from './firebase'
import { CARDS, CardDefinition } from './cards'
import { CardRarity } from './rarity'
import { grantCard } from './cardsInventory'
import { spendCoins } from './personalCoin'

const PACK_SIZE = 5

export type PackType = 'comum' | 'promocional'

import { PACK_PRICES } from './economyConfig'
import { PACK_ODDS, PITY_THRESHOLD } from './dropRates'
export { PACK_PRICES }

// coleção que está "em cartaz" no pacote promocional — trocar aqui quando
// lançar a coleção 2 (Dexter)
export const CURRENT_PROMO_COLLECTION_ID = 'jardim-secreto'

function cardPoolForPack(packType: PackType): CardDefinition[] {
  if (packType === 'promocional') {
    return CARDS.filter((c) => c.collectionId === CURRENT_PROMO_COLLECTION_ID)
  }
  return CARDS
}

function weightedRarity(onlyRareOrBetter: boolean): CardRarity {
  const pool: CardRarity[] = onlyRareOrBetter
    ? ['rara', 'epica']
    : (Object.keys(PACK_ODDS) as CardRarity[])
  const weights = pool.map((r) => PACK_ODDS[r])
  const total = weights.reduce((a, b) => a + b, 0)
  let roll = Math.random() * total
  for (let i = 0; i < pool.length; i++) {
    roll -= weights[i]
    if (roll <= 0) return pool[i]
  }
  return pool[pool.length - 1]
}

function randomCardOfRarity(pool: CardDefinition[], rarity: CardRarity): CardDefinition {
  const options = pool.filter((c) => c.rarity === rarity)
  return options[Math.floor(Math.random() * options.length)]
}

export interface PackResult {
  cards: CardDefinition[]
  pityTriggered: boolean
}

export async function openPack(
  coupleId: string,
  uid: string,
  packType: PackType
): Promise<PackResult | null> {
  const price = PACK_PRICES[packType]
  const paid = await spendCoins(uid, price, `pacote ${packType}`)
  if (!paid) return null

  const pityRef = ref(db, `couples/${coupleId}/cards/pity/${uid}`)
  const pityResult = await runTransaction(pityRef, (current) => (current ?? 0) + 1)
  const pityCount = (pityResult.snapshot.val() as number) ?? 1
  const pityTriggered = pityCount >= PITY_THRESHOLD
  if (pityTriggered) {
    await runTransaction(pityRef, () => 0)
  }

  const pool = cardPoolForPack(packType)
  const drawnCards: CardDefinition[] = []
  for (let i = 0; i < PACK_SIZE; i++) {
    const forceRareOrBetter = pityTriggered && i === 0
    const rarity = weightedRarity(forceRareOrBetter)
    drawnCards.push(randomCardOfRarity(pool, rarity))
  }

  await Promise.all(drawnCards.map((c) => grantCard(coupleId, uid, c.collectionId, c.id, 1)))

  return { cards: drawnCards, pityTriggered }
}
