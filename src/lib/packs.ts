import { ref, runTransaction, onValue } from 'firebase/database'
import { db } from './firebase'
import { CARDS, CardDefinition } from './cards'
import { CardRarity } from './rarity'

const PACK_SIZE = 5

export type PackType = 'comum' | 'promocional' | 'rarity-redeem'

import { PACK_PRICES } from './economyConfig'
import { PACK_ODDS, PITY_THRESHOLD } from './dropRates'
import { getMissingCardsByRarity } from './rarityRedeem'
export { PACK_PRICES }

// fallback de segurança — só usado se por algum motivo drawPackCards for
// chamada sem promoCollectionId (não deve acontecer no fluxo normal, já
// que unopenedPacks.ts sempre resolve a coleção atual via promoCollection.ts
// antes de travar a compra)
const FALLBACK_PROMO_COLLECTION_ID = 'jardim-secreto'

function cardPoolForPack(packType: PackType, promoCollectionId?: string): CardDefinition[] {
  if (packType === 'promocional') {
    const collectionId = promoCollectionId ?? FALLBACK_PROMO_COLLECTION_ID
    return CARDS.filter((c) => c.collectionId === collectionId)
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

// ⚠️ NÃO faz pagamento — só sorteia e grava no inventário. O pagamento
// acontece na compra (buyPack, lib/unopenedPacks.ts). Chamada tanto pelo
// fluxo antigo quanto pela abertura de pacote guardado na mochila.
export async function drawPackCards(
  coupleId: string,
  uid: string,
  packType: PackType,
  promoCollectionId?: string,
  redeemRarity?: CardRarity
): Promise<PackResult> {
  // resgate por raridade: 1 carta só, sorteada AGORA (não no resgate),
  // entre as que a pessoa ainda não tem daquela raridade — nunca toca
  // no pity, porque esse branch termina aqui, antes da transação de pity
  if (packType === 'rarity-redeem') {
    if (!redeemRarity) {
      throw new Error('redeemRarity é obrigatório pro tipo rarity-redeem')
    }
    const missing = await getMissingCardsByRarity(coupleId, uid, redeemRarity)
    // fallback defensivo: se por acaso já tiver tudo daquela raridade
    // (não deveria acontecer, o botão já vem desabilitado nesse caso),
    // sorteia entre todas as cartas daquela raridade mesmo repetindo
    const pool =
      missing.length > 0 ? missing : CARDS.filter((c) => c.rarity === redeemRarity && !c.secret)
    const card = pool[Math.floor(Math.random() * pool.length)]
    return { cards: [card], pityTriggered: false }
  }

  const pityRef = ref(db, `couples/${coupleId}/cards/pity/${uid}`)
  const pityResult = await runTransaction(pityRef, (current) => (current ?? 0) + 1)
  const pityCount = (pityResult.snapshot.val() as number) ?? 1
  const pityTriggered = pityCount >= PITY_THRESHOLD
  if (pityTriggered) {
    await runTransaction(pityRef, () => 0)
  }

  const pool = cardPoolForPack(packType, promoCollectionId)
  const drawnCards: CardDefinition[] = []
  for (let i = 0; i < PACK_SIZE; i++) {
    const forceRareOrBetter = pityTriggered && i === 0
    const rarity = weightedRarity(forceRareOrBetter)
    drawnCards.push(randomCardOfRarity(pool, rarity))
  }

  return { cards: drawnCards, pityTriggered }
}
export function subscribePityCount(
  coupleId: string,
  uid: string,
  callback: (count: number) => void
) {
  const pityRef = ref(db, `couples/${coupleId}/cards/pity/${uid}`)
  return onValue(pityRef, (snap) => callback((snap.val() as number) ?? 0))
}
