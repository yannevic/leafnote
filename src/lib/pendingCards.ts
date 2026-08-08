import { ref, push, remove, onValue, off, runTransaction } from 'firebase/database'
import { db } from './firebase'
import { CardDefinition } from './cards'
import { grantCard } from './cardsInventory'

export interface PendingCardInstance {
  id: string
  cardId: string
  collectionId: string
  addedAt: number
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
      const data = v as { cardId: string; collectionId: string; addedAt: number }
      return { id, cardId: data.cardId, collectionId: data.collectionId, addedAt: data.addedAt }
    })
    list.sort((a, b) => a.addedAt - b.addedAt)
    callback(list)
  })
  return () => off(pendingRef, 'value', listener)
}
