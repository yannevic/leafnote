import { ref, runTransaction, onValue } from 'firebase/database'
import { db } from './firebase'
import { COLLECTIONS } from './cards'

// coleção que já estava em cartaz antes deste sistema existir — usada só
// na primeira inicialização, pra não trocar a coleção promocional "do
// nada" na primeira vez que este código rodar.
const INITIAL_PROMO_COLLECTION_ID = 'jardim-secreto'

// Brasília é UTC-3 fixo (sem horário de verão desde 2019)
const BRASILIA_OFFSET_MS = 3 * 60 * 60 * 1000

// intervalo de rotação do pacote promocional, em dias
export const PROMO_ROTATION_DAYS = 3

export interface PromoCollectionState {
  current: string
  nextRotation: number
  featured: string[] // todas as coleções que já entraram em cartaz alguma vez
}

// calcula o timestamp (em ms, UTC) da próxima meia-noite (horário de
// Brasília) que fica PROMO_ROTATION_DAYS dias à frente de fromMs — não é
// mais travado em domingo, cicla a cada N dias a partir de quando a última
// rotação aconteceu
function getNextRotationBrasilia(fromMs: number, days: number = PROMO_ROTATION_DAYS): number {
  const localMs = fromMs - BRASILIA_OFFSET_MS
  const localDate = new Date(localMs)
  const localMidnightToday = Date.UTC(
    localDate.getUTCFullYear(),
    localDate.getUTCMonth(),
    localDate.getUTCDate()
  )
  const localNextRotation = localMidnightToday + days * 24 * 60 * 60 * 1000
  return localNextRotation + BRASILIA_OFFSET_MS
}

// escolhe a próxima coleção: prioriza qualquer coleção que NUNCA esteve em
// cartaz antes (garante que uma coleção recém-lançada vire a próxima,
// sempre). Só quando todas já foram featured é que passa a intercalar,
// evitando repetir a coleção que estava em cartaz agora.
function pickNextCollection(current: string, featured: string[]): string {
  const allIds = Object.keys(COLLECTIONS)
  const neverFeatured = allIds.filter((id) => !featured.includes(id))
  if (neverFeatured.length > 0) {
    return neverFeatured[Math.floor(Math.random() * neverFeatured.length)]
  }
  const avoidingCurrent = allIds.filter((id) => id !== current)
  const pool = avoidingCurrent.length > 0 ? avoidingCurrent : allIds
  return pool[Math.floor(Math.random() * pool.length)]
}

export async function ensurePromoCollectionCurrent(
  coupleId: string
): Promise<PromoCollectionState> {
  const stateRef = ref(db, `couples/${coupleId}/cards/promoCollection`)
  const now = Date.now()
  const result = await runTransaction(stateRef, (current: PromoCollectionState | null) => {
    if (current && current.nextRotation > now) {
      return current // ainda válida, não mexe
    }
    if (!current) {
      // primeira inicialização — mantém a coleção que já estava em cartaz
      // antes deste sistema existir, e agenda a virada pra daqui a
      // PROMO_ROTATION_DAYS dias
      return {
        current: INITIAL_PROMO_COLLECTION_ID,
        nextRotation: getNextRotationBrasilia(now),
        featured: [INITIAL_PROMO_COLLECTION_ID],
      }
    }
    const previousFeatured = current.featured ?? [current.current]
    const newCollectionId = pickNextCollection(current.current, previousFeatured)
    const newFeatured = previousFeatured.includes(newCollectionId)
      ? previousFeatured
      : [...previousFeatured, newCollectionId]
    return {
      current: newCollectionId,
      nextRotation: getNextRotationBrasilia(now),
      featured: newFeatured,
    }
  })
  return result.snapshot.val() as PromoCollectionState
}

export function subscribePromoCollection(
  coupleId: string,
  callback: (state: PromoCollectionState | null) => void
) {
  const stateRef = ref(db, `couples/${coupleId}/cards/promoCollection`)
  return onValue(stateRef, (snap) => {
    callback(snap.val() as PromoCollectionState | null)
  })
}
