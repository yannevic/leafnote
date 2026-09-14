import { ref, push, remove, onValue, off, runTransaction } from 'firebase/database'
import { db } from './firebase'
import { CardDefinition } from './cards'
import { SpecialCardDefinition, SPECIAL_COLLECTION_ID } from './specialCards'
import { unlockCollectionRewardIfComplete } from './collectionRewards'

export interface PendingCardInstance {
  id: string
  cardId: string
  collectionId: string
  addedAt: number
  special?: boolean // true = carta da Coleção de Cartas Especial (permite repetida, nunca bloqueia)
}

// cada carta sorteada vira uma instância solta na mochila — inclusive
// repetidas, cada uma separada (sempre precisa arrastar, decisão tomada)
export async function addPendingCards(coupleId: string, uid: string, cards: CardDefinition[]) {
  const pendingRef = ref(db, `couples/${coupleId}/cards/pendingCards/${uid}`)
  await Promise.all(
    cards.map((c) =>
      push(pendingRef, { cardId: c.id, collectionId: c.collectionId, addedAt: Date.now() })
    )
  )
}

// carta especial sorteada (ao abrir o pacote de resgate) também cai solta na
// mochila, igual as normais — só que marcada com special:true, pra roteirizar
// o drop pro grid certo (vitrine da Coleção Especial) e permitir repetida
export async function addPendingSpecialCard(
  coupleId: string,
  uid: string,
  card: SpecialCardDefinition
) {
  const pendingRef = ref(db, `couples/${coupleId}/cards/pendingCards/${uid}`)
  await push(pendingRef, {
    cardId: card.id,
    collectionId: SPECIAL_COLLECTION_ID,
    addedAt: Date.now(),
    special: true,
  })
}

export type PlaceResult = 'placed' | 'already_owned' | 'wrong_slot'

// chamado no drop do drag-and-drop: só encaixa (e credita no inventário)
// se o cardId da carta arrastada bater com o cardId do slot onde caiu.
// Se o jogador já tem 1+ cópia dessa carta, NÃO credita de novo — a
// carta continua pendente na mochila (ver Plano de Cartinhas, seção 19)
export async function placePendingCard(
  coupleId: string,
  uid: string,
  instanceId: string,
  cardId: string,
  collectionId: string,
  correctCardId: string
): Promise<PlaceResult> {
  if (cardId !== correctCardId) return 'wrong_slot'

  const cardRef = ref(db, `couples/${coupleId}/cards/inventory/${uid}/${collectionId}/${cardId}`)
  let wasAlreadyOwned = false
  const result = await runTransaction(cardRef, (current) => {
    if ((current ?? 0) > 0) {
      wasAlreadyOwned = true
      return current // já tem — aborta sem incrementar
    }
    return 1
  })

  if (!result.committed || wasAlreadyOwned) {
    return 'already_owned'
  }
  const pendingRef = ref(db, `couples/${coupleId}/cards/pendingCards/${uid}/${instanceId}`)
  await remove(pendingRef)

  // detecta e libera a lista de recompensas de coleção completa (seção 25 do
  // Plano de Cartinhas) — só cria o registro pendente com os 4 itens; o
  // resgate de cada um acontece à parte, via CollectionRewardsModal.tsx
  unlockCollectionRewardIfComplete(coupleId, uid, collectionId).catch((err) =>
    console.error('erro ao checar recompensa de coleção completa', err)
  )

  return 'placed'
}

// equivalente ao placePendingCard, mas pra cartas da Coleção Especial: nunca
// bloqueia (repetida sempre soma quantidade) e credita em specialCards/inventory
// em vez do inventário normal — sem checagem de coleção completa (não se aplica)
export async function placeSpecialPendingCard(
  coupleId: string,
  uid: string,
  instanceId: string,
  cardId: string,
  correctCardId: string
): Promise<PlaceResult> {
  if (cardId !== correctCardId) return 'wrong_slot'

  const cardRef = ref(db, `couples/${coupleId}/cards/specialCards/inventory/${uid}/${cardId}`)
  await runTransaction(cardRef, (current) => {
    const entry = (current as { quantity: number; lastAcquiredAt: number } | null) ?? {
      quantity: 0,
      lastAcquiredAt: 0,
    }
    return { quantity: entry.quantity + 1, lastAcquiredAt: Date.now() }
  })

  const pendingRef = ref(db, `couples/${coupleId}/cards/pendingCards/${uid}/${instanceId}`)
  await remove(pendingRef)

  return 'placed'
}

export function subscribePendingCards(
  coupleId: string,
  uid: string,
  callback: (cards: PendingCardInstance[]) => void
) {
  const pendingRef = ref(db, `couples/${coupleId}/cards/pendingCards/${uid}`)
  const listener = onValue(pendingRef, (snap) => {
    const val = snap.val() ?? {}
    const list: PendingCardInstance[] = Object.entries(val).map(([id, v]) => {
      const data = v as {
        cardId: string
        collectionId: string
        addedAt: number
        special?: boolean
      }
      return {
        id,
        cardId: data.cardId,
        collectionId: data.collectionId,
        addedAt: data.addedAt,
        special: data.special,
      }
    })
    list.sort((a, b) => a.addedAt - b.addedAt)
    callback(list)
  })
  return () => off(pendingRef, 'value', listener)
}
