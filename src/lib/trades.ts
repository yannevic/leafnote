import { ref, push, set, update, get, remove, runTransaction, onValue } from 'firebase/database'
import { db } from './firebase'

export type TradeStatus = 'pending_response' | 'countered' | 'accepted' | 'declined' | 'cancelled'

export interface CardRef {
  collectionId: string
  cardId: string
  instanceId: string // referência à instância em pendingCards/{uid}/{instanceId} de quem está ofertando essa cópia
}

export interface Trade {
  id: string
  requesterUid: string
  partnerUid: string
  cardsFromRequester: CardRef[]
  cardsFromPartner: CardRef[]
  proposedBy: string
  status: TradeStatus
  createdAt: number
  updatedAt: number
}

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

export async function declineTrade(coupleId: string, tradeId: string, byUid: string) {
  const tradeRef = ref(db, `couples/${coupleId}/cards/trades/${tradeId}`)
  await runTransaction(tradeRef, (current: Trade | null) => {
    if (!current) return current
    if (current.status !== 'pending_response' && current.status !== 'countered') return current
    if (current.proposedBy === byUid) return current
    return { ...current, status: 'declined', updatedAt: Date.now() }
  })
}

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
 * Aceita — trava o status via transaction, valida que cada instância
 * pendente ofertada ainda existe (não foi vendida/já usada em outro lugar
 * nesse meio tempo), e só então move: remove da mochila de quem deu,
 * adiciona como nova pendente na mochila de quem recebe. Nunca toca em
 * inventory — quem recebe decide depois, arrastando normalmente na
 * coleção (placePendingCard já trata credita/avisa-duplicata).
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
  if (trade.status !== 'accepted') return

  try {
    // valida que cada instância ofertada ainda está na mochila de quem prometeu ela
    for (const card of trade.cardsFromRequester) {
      const snap = await get(
        ref(db, `couples/${coupleId}/cards/pendingCards/${trade.requesterUid}/${card.instanceId}`)
      )
      const data = snap.val()
      if (!data || data.cardId !== card.cardId || data.collectionId !== card.collectionId) {
        throw new Error('uma das cartas da proposta não está mais disponível')
      }
    }
    for (const card of trade.cardsFromPartner) {
      const snap = await get(
        ref(db, `couples/${coupleId}/cards/pendingCards/${trade.partnerUid}/${card.instanceId}`)
      )
      const data = snap.val()
      if (!data || data.cardId !== card.cardId || data.collectionId !== card.collectionId) {
        throw new Error('uma das cartas da proposta não está mais disponível')
      }
    }

    // transfere: sai da mochila de quem deu, entra como pendente nova na mochila de quem recebe
    for (const card of trade.cardsFromRequester) {
      await remove(
        ref(db, `couples/${coupleId}/cards/pendingCards/${trade.requesterUid}/${card.instanceId}`)
      )
      await push(ref(db, `couples/${coupleId}/cards/pendingCards/${trade.partnerUid}`), {
        cardId: card.cardId,
        collectionId: card.collectionId,
        addedAt: Date.now(),
      })
    }
    for (const card of trade.cardsFromPartner) {
      await remove(
        ref(db, `couples/${coupleId}/cards/pendingCards/${trade.partnerUid}/${card.instanceId}`)
      )
      await push(ref(db, `couples/${coupleId}/cards/pendingCards/${trade.requesterUid}`), {
        cardId: card.cardId,
        collectionId: card.collectionId,
        addedAt: Date.now(),
      })
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
