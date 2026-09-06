// src/lib/profileBadges.ts
import { ref, set, remove, onValue, off } from 'firebase/database'
import { db } from './firebase'

export interface ProfileBadges {
  [collectionId: string]: true
}

const badgesPath = (uid: string) => `users/${uid}/profile/badges`

export function subscribeProfileBadges(
  uid: string,
  callback: (badges: ProfileBadges) => void
): () => void {
  const r = ref(db, badgesPath(uid))
  const handler = onValue(r, (snap) => {
    // mesmo padrão de profileLayout.ts/profileDecoration.ts — adia o callback
    // pra evitar o bug conhecido de "setState durante render de outro componente"
    queueMicrotask(() => callback((snap.val() as ProfileBadges) ?? {}))
  })
  return () => off(r, 'value', handler)
}

// ⏳ ainda sem nenhuma chamada automática em lugar nenhum do app — reservado pro dia
// que a lógica de "completar coleção = desbloquear" for implementada (ver pendência
// no Plano — Perfil Pessoal). Quando isso for ligado, vai precisar contar cartas por
// uid (não do casal) via lib/cardsInventory.ts — ver nota na resposta.
export async function unlockBadge(uid: string, collectionId: string): Promise<void> {
  await set(ref(db, `${badgesPath(uid)}/${collectionId}`), true)
}

export async function lockBadge(uid: string, collectionId: string): Promise<void> {
  await remove(ref(db, `${badgesPath(uid)}/${collectionId}`))
}
