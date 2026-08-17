import { ref, push, set, update, get, runTransaction, onValue } from 'firebase/database'
import { db } from './firebase'
import { grantCard, revokeCard } from './cardsInventory'

export type TradeStatus = 'pending_response' | 'countered' | 'accepted' | 'declined' | 'cancelled'

export interface CardRef {
  collectionId: string
  cardId: string
}

export interface Trade {
  id: string
  requesterUid: string // quem criou a proposta original (papel fixo, não muda em contraproposta)
  partnerUid: string // o outro (papel fixo)
  cardsFromRequester: CardRef[] // cartas que requesterUid está oferecendo AGORA
  cardsFromPartner: CardRef[] // cartas que partnerUid está oferecendo AGORA
  proposedBy: string // uid de quem definiu os termos atuais — o OUTRO é quem responde
  status: TradeStatus
  createdAt: number
  updatedAt: number
}

function sameCard(a: CardRef, b: CardRef) {
  return a.collectionId === b.collectionId && a.cardId === b.cardId
}

/**
 * Cria uma proposta nova. Bloqueia se já existir uma troca ativa entre o casal
 * (pending_response ou countered) — só uma por vez.
 */
export async function proposeTrade(
  coupleId: string,
  requesterUid: string,
  partnerUid: string,
  cardsFromRequester: CardRef[],
  cardsFromPartner: CardRef[]
): Promise<string> {
  if (cardsFromRequester.length === 0 && cardsFromPartner.length === 0) {
    throw new Error('selecione ao menos uma carta pra propor a troca')
  }

  const tradesRef = ref(db, `couples/${coupleId}/cards/trades`)
  const snap = await get(tradesRef)
  const existing = Object.values(snap.val() ?? {}) as Omit<Trade, 'id'>[]
  const hasActive = existing.some(
    (t) => t.status === 'pending_response' || t.status === 'countered'
  )
  if (hasActive) {
    throw new Error('já existe uma troca em andamento entre vocês')
  }

  const newRef = push(tradesRef)
  const now = Date.now()
  const trade: Omit<Trade, 'id'> = {
    requesterUid,
    partnerUid,
    cardsFromRequester,
    cardsFromPartner,
    proposedBy: requesterUid,
    status: 'pending_response',
    createdAt: now,
    updatedAt: now,
  }
  await set(newRef, trade)
  return newRef.key as string
}

/**
 * Contraproposta — só quem NÃO fez a última oferta pode contrapropor.
 * byUid pode ajustar qualquer um dos dois lados (cardsFromRequester e/ou
 * cardsFromPartner), independente de qual papel (requester/partner) ele tem.
 */
export async function counterTrade(
  coupleId: string,
  tradeId: string,
  byUid: string,
  newCardsFromRequester: CardRef[],
  newCardsFromPartner: CardRef[]
) {
  if (newCardsFromRequester.length === 0 && newCardsFromPartner.length === 0) {
    throw new Error('selecione ao menos uma carta pra contrapropor')
  }
  const tradeRef = ref(db, `couples/${coupleId}/cards/trades/${tradeId}`)
  await runTransaction(tradeRef, (current: Trade | null) => {
    if (!current) return current
    if (current.status !== 'pending_response' && current.status !== 'countered') return current
    if (current.proposedBy === byUid) return current
    return {
      ...current,
      cardsFromRequester: newCardsFromRequester,
      cardsFromPartner: newCardsFromPartner,
      proposedBy: byUid,
      status: 'countered',
      updatedAt: Date.now(),
    }
  })
}

/** Recusa — só quem NÃO fez a última oferta recusa (quem propôs cancela, não recusa). */
export async function declineTrade(coupleId: string, tradeId: string, byUid: string) {
  const tradeRef = ref(db, `couples/${coupleId}/cards/trades/${tradeId}`)
  await runTransaction(tradeRef, (current: Trade | null) => {
    if (!current) return current
    if (current.status !== 'pending_response' && current.status !== 'countered') return current
    if (current.proposedBy === byUid) return current
    return { ...current, status: 'declined', updatedAt: Date.now() }
  })
}

/** Cancela — só quem fez a última oferta pode desistir dela antes do outro responder. */
export async function cancelTrade(coupleId: string, tradeId: string, byUid: string) {
  const tradeRef = ref(db, `couples/${coupleId}/cards/trades/${tradeId}`)
  await runTransaction(tradeRef, (current: Trade | null) => {
    if (!current) return current
    if (current.status !== 'pending_response' && current.status !== 'countered') return current
    if (current.proposedBy !== byUid) return current
    return { ...current, status: 'cancelled', updatedAt: Date.now() }
  })
}

/**
 * Aceita — só quem NÃO fez a última oferta aceita. Trava o status em
 * 'accepted' via transaction primeiro (evita aceite duplicado), valida posse
 * de TODAS as cartas dos dois lados antes de mexer em qualquer inventário, e
 * só então transfere tudo.
 */
export async function acceptTrade(coupleId: string, tradeId: string, byUid: string) {
  const tradeRef = ref(db, `couples/${coupleId}/cards/trades/${tradeId}`)

  const result = await runTransaction(tradeRef, (current: Trade | null) => {
    if (!current) return current
    if (current.status !== 'pending_response' && current.status !== 'countered') return current
    if (current.proposedBy === byUid) return current
    return { ...current, status: 'accepted', updatedAt: Date.now() }
  })

  if (!result.committed || !result.snapshot.exists()) return
  const trade = result.snapshot.val() as Trade
  if (trade.status !== 'accepted') return // regra bloqueou (não era sua vez, etc.)

  try {
    // 1) valida posse: cada carta que 'requester' vai dar precisa estar com
    // ele; cada carta que 'partner' vai dar precisa estar com ele.
    for (const card of trade.cardsFromRequester) {
      const snap = await get(
        ref(
          db,
          `couples/${coupleId}/cards/inventory/${trade.requesterUid}/${card.collectionId}/${card.cardId}`
        )
      )
      if ((snap.val() ?? 0) < 1) {
        throw new Error('uma das cartas da proposta não está mais disponível')
      }
    }
    for (const card of trade.cardsFromPartner) {
      const snap = await get(
        ref(
          db,
          `couples/${coupleId}/cards/inventory/${trade.partnerUid}/${card.collectionId}/${card.cardId}`
        )
      )
      if ((snap.val() ?? 0) < 1) {
        throw new Error('uma das cartas da proposta não está mais disponível')
      }
    }

    // 2) valida que ninguém vai receber uma carta duplicada (bloqueio de
    // duplicata vale pra trocas também) — cardsFromRequester vão pro partner,
    // cardsFromPartner vão pro requester.
    for (const card of trade.cardsFromRequester) {
      const snap = await get(
        ref(
          db,
          `couples/${coupleId}/cards/inventory/${trade.partnerUid}/${card.collectionId}/${card.cardId}`
        )
      )
      if ((snap.val() ?? 0) > 0) {
        throw new Error('quem vai receber já tem uma das cartas da proposta agora')
      }
    }
    for (const card of trade.cardsFromPartner) {
      const snap = await get(
        ref(
          db,
          `couples/${coupleId}/cards/inventory/${trade.requesterUid}/${card.collectionId}/${card.cardId}`
        )
      )
      if ((snap.val() ?? 0) > 0) {
        throw new Error('quem vai receber já tem uma das cartas da proposta agora')
      }
    }

    // 3) tudo validado — transfere de fato
    for (const card of trade.cardsFromRequester) {
      await revokeCard(coupleId, trade.requesterUid, card.collectionId, card.cardId)
      await grantCard(coupleId, trade.partnerUid, card.collectionId, card.cardId)
    }
    for (const card of trade.cardsFromPartner) {
      await revokeCard(coupleId, trade.partnerUid, card.collectionId, card.cardId)
      await grantCard(coupleId, trade.requesterUid, card.collectionId, card.cardId)
    }
  } catch (err) {
    await update(tradeRef, { status: 'declined', updatedAt: Date.now() })
    throw err
  }
}

export function subscribeTrades(coupleId: string, callback: (trades: Trade[]) => void) {
  const tradesRef = ref(db, `couples/${coupleId}/cards/trades`)
  return onValue(tradesRef, (snapshot) => {
    const val = snapshot.val() ?? {}
    const list: Trade[] = Object.entries(val).map(([id, t]) => ({
      id,
      ...(t as Omit<Trade, 'id'>),
    }))
    callback(list)
  })
}

export { sameCard }
