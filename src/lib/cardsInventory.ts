import { ref, runTransaction, get, set } from 'firebase/database'
import { db } from './firebase'

export async function grantCard(
  coupleId: string,
  uid: string,
  collectionId: string,
  cardId: string,
  quantity: number = 1
) {
  const cardRef = ref(db, `couples/${coupleId}/cards/inventory/${uid}/${collectionId}/${cardId}`)
  await runTransaction(cardRef, (current) => (current ?? 0) + quantity)
}

export async function revokeCard(
  coupleId: string,
  uid: string,
  collectionId: string,
  cardId: string
) {
  const cardRef = ref(db, `couples/${coupleId}/cards/inventory/${uid}/${collectionId}/${cardId}`)
  const snap = await get(cardRef)
  const current = snap.val() ?? 0
  if (current < 1) {
    throw new Error('essa pessoa não tem mais essa carta')
  }
  await set(cardRef, 0)
}
