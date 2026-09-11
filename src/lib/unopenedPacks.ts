import { ref, push, remove, onValue, off } from 'firebase/database'
import { db } from './firebase'
import { spendCoins } from './personalCoin'
import { PackType, PACK_PRICES, drawPackCards, PackResult } from './packs'
import { ensurePromoCollectionCurrent } from './promoCollection'
import { addPendingCards } from './pendingCards'
import { CardRarity } from './rarity'

export interface UnopenedPack {
  id: string
  type: PackType
  boughtAt: number
  collectionId?: string // travado no momento da compra (só relevante pra promocional)
  redeemRarity?: CardRarity // travado no resgate (só relevante pro tipo 'rarity-redeem')
}

// compra: paga e guarda o pacote fechado na mochila (não sorteia ainda)
export async function buyPack(
  coupleId: string,
  uid: string,
  packType: PackType,
  quantity: number = 1
): Promise<boolean> {
  const price = PACK_PRICES[packType] * quantity
  const paid = await spendCoins(
    uid,
    price,
    `pacote ${packType}${quantity > 1 ? ` x${quantity}` : ''}`
  )
  if (!paid) return false

  // pro promocional, trava a coleção que está em cartaz AGORA (garante
  // rotação em dia antes de travar) — se abrir o pacote depois de a
  // rotação virar, continua sorteando da coleção que estava em cartaz na
  // hora da compra
  let collectionId: string | undefined
  if (packType === 'promocional') {
    const promoState = await ensurePromoCollectionCurrent(coupleId)
    collectionId = promoState.current
  }

  const packsRef = ref(db, `couples/${coupleId}/cards/unopenedPacks/${uid}`)
  for (let i = 0; i < quantity; i++) {
    await push(packsRef, {
      type: packType,
      boughtAt: Date.now(),
      ...(collectionId && { collectionId }),
    })
  }
  return true
}

// dá um pacote grátis direto na mochila, sem cobrar — usado em recompensas
// como o marco de streak de 28 dias (sempre comum, nunca trava coleção)
export async function grantPack(coupleId: string, uid: string, packType: PackType): Promise<void> {
  const packsRef = ref(db, `couples/${coupleId}/cards/unopenedPacks/${uid}`)
  await push(packsRef, {
    type: packType,
    boughtAt: Date.now(),
  })
}

// abertura: sorteia agora, grava no inventário e remove da mochila
export async function openUnopenedPack(
  coupleId: string,
  uid: string,
  packInstanceId: string,
  packType: PackType,
  collectionId?: string,
  redeemRarity?: CardRarity
): Promise<PackResult> {
  const result = await drawPackCards(coupleId, uid, packType, collectionId, redeemRarity)
  // cartas vão pra mochila como soltas, não pro inventário direto — só
  // entram na coleção quando arrastadas pro slot certo (CollectionGrid)
  await addPendingCards(coupleId, uid, result.cards)
  const packRef = ref(db, `couples/${coupleId}/cards/unopenedPacks/${uid}/${packInstanceId}`)
  await remove(packRef)
  return result
}

export function subscribeUnopenedPacks(
  coupleId: string,
  uid: string,
  callback: (packs: UnopenedPack[]) => void
) {
  const packsRef = ref(db, `couples/${coupleId}/cards/unopenedPacks/${uid}`)
  const listener = onValue(packsRef, (snap) => {
    const val = snap.val() ?? {}
    const list: UnopenedPack[] = Object.entries(val).map(([id, v]) => {
      const data = v as {
        type: PackType
        boughtAt: number
        collectionId?: string
        redeemRarity?: CardRarity
      }
      return {
        id,
        type: data.type,
        boughtAt: data.boughtAt,
        collectionId: data.collectionId,
        redeemRarity: data.redeemRarity,
      }
    })
    list.sort((a, b) => a.boughtAt - b.boughtAt)
    callback(list)
  })
  return () => off(packsRef, 'value', listener)
}
