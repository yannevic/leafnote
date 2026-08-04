import { ref, runTransaction } from 'firebase/database'
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
