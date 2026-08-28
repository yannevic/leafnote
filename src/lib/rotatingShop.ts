import { ref, get, set, push } from 'firebase/database'
import { db } from './firebase'
import { CARDS, CardDefinition } from './cards'
import { spendCoins } from './personalCoin'
import { ROTATING_SHOP_WEIGHTS, ROTATING_SHOP_ROTATION_DAYS } from './dropRates'

const SLOTS = 3
type ShopRarity = 'incomum' | 'rara' | 'epica'

import { SHOP_PRICES } from './economyConfig'
export { SHOP_PRICES }

function weightedShopRarity(): ShopRarity {
  const pool = Object.keys(ROTATING_SHOP_WEIGHTS) as ShopRarity[]
  const weights = pool.map((r) => ROTATING_SHOP_WEIGHTS[r])
  const total = weights.reduce((a, b) => a + b, 0)
  let roll = Math.random() * total
  for (let i = 0; i < pool.length; i++) {
    roll -= weights[i]
    if (roll <= 0) return pool[i]
  }
  return pool[pool.length - 1]
}

// sorteia entre TODAS as coleções cadastradas — a loja rotativa é
// independente do sistema de pacote promocional
function pickRandomCardIds(): string[] {
  const eligible = CARDS.filter((c) => c.rarity !== 'comum')
  const picked: string[] = []
  for (let i = 0; i < SLOTS; i++) {
    const rarity = weightedShopRarity()
    const options = eligible.filter((c) => c.rarity === rarity && !picked.includes(c.id))
    const choice =
      options.length > 0 ? options[Math.floor(Math.random() * options.length)] : undefined
    if (choice) picked.push(choice.id)
  }
  return picked
}

export interface RotatingShopData {
  cardIds: string[]
  nextRotation: number
}

export async function getRotatingShop(coupleId: string): Promise<RotatingShopData> {
  const shopRef = ref(db, `couples/${coupleId}/cards/rotatingShop/main`)
  const snap = await get(shopRef)
  const now = Date.now()
  const existing = snap.val() as RotatingShopData | null
  if (existing && existing.nextRotation > now) {
    return existing
  }
  const data: RotatingShopData = {
    cardIds: pickRandomCardIds(),
    nextRotation: now + ROTATING_SHOP_ROTATION_DAYS * 24 * 60 * 60 * 1000,
  }
  await set(shopRef, data)
  return data
}

export async function buyFromRotatingShop(
  coupleId: string,
  uid: string,
  card: CardDefinition
): Promise<boolean> {
  const price = SHOP_PRICES[card.rarity as ShopRarity]
  const paid = await spendCoins(uid, price, `carta do dia: ${card.name}`)
  if (!paid) return false

  const newRef = push(ref(db, `couples/${coupleId}/cards/pendingCards/${uid}`))
  await set(newRef, {
    cardId: card.id,
    collectionId: card.collectionId,
    addedAt: Date.now(),
  })
  return true
}
