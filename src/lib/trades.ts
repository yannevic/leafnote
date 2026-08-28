import { ref, push, set, get, remove, update, runTransaction, onValue } from 'firebase/database'
import { db } from './firebase'

export type TradeStatus = 'pending_response' | 'countered' | 'accepted' | 'declined' | 'cancelled'
export type TradeEventType = 'request' | 'countered' | 'accepted' | 'declined'

export interface CardRef {
  collectionId: string
  cardId: string
  instanceId: string // referência à cópia específica em pendingCards/{uid}/{instanceId}
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

/**
 * Grava o último evento de troca — useNotificationCenter escuta esse nó
 * (mesmo padrão do lastActivityCompleted). Sempre que actorUid !== uid de
 * quem está vendo, aparece uma notificação pro outro parceiro.
 */
async function notifyTradeEvent(
  coupleId: string,
  tradeId: string,
  type: TradeEventType,
  actorUid: string
) {
  await set(ref(db, `couples/${coupleId}/cards/lastTradeEvent`), {
    id: `${tradeId}-${type}-${Date.now()}`,
    tradeId,
    type,
    actorUid,
    createdAt: Date.now(),
  })
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
  const tradeId = newRef.key as string
  await notifyTradeEvent(coupleId, tradeId, 'request', requesterUid)
  return tradeId
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
  const result = await runTransaction(tradeRef, (current: Trade | null) => {
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

  if (result.committed && result.snapshot.exists()) {
    const updated = result.snapshot.val() as Trade
    if (updated.status === 'countered' && updated.proposedBy === byUid) {
      await notifyTradeEvent(coupleId, tradeId, 'countered', byUid)
    }
  }
}

/** Recusa — só quem NÃO fez a última oferta recusa (quem propôs cancela, não recusa). */
export async function declineTrade(coupleId: string, tradeId: string, byUid: string) {
  const tradeRef = ref(db, `couples/${coupleId}/cards/trades/${tradeId}`)
  const result = await runTransaction(tradeRef, (current: Trade | null) => {
    if (!current) return current
    if (current.status !== 'pending_response' && current.status !== 'countered') return current
    if (current.proposedBy === byUid) return current
    return { ...current, status: 'declined', updatedAt: Date.now() }
  })

  if (result.committed && result.snapshot.exists()) {
    const updated = result.snapshot.val() as Trade
    if (updated.status === 'declined') {
      await notifyTradeEvent(coupleId, tradeId, 'declined', byUid)
    }
  }
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
  // cancelar a própria oferta não gera notificação pro parceiro — ele nem
  // tinha aceitado nada ainda.
}

/**
 * Aceita — só quem NÃO fez a última oferta aceita. Trava o status em
 * 'accepted' via transaction primeiro (evita aceite duplicado), valida que
 * CADA instância ofertada ainda existe em pendingCards de quem prometeu ela
 * (ninguém vendeu pra Folhinha nem usou aquela cópia noutra troca enquanto
 * essa esperava resposta) e só então transfere: remove a instância pendente
 * de quem deu, cria uma nova entrada pendente na mochila de quem recebeu —
 * nunca toca em inventory. Se qualquer instância sumiu, a troca inteira é
 * marcada declined automaticamente, nada fica pela metade.
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
    // 1) valida que cada instância ofertada ainda existe na mochila de quem prometeu ela
    for (const card of trade.cardsFromRequester) {
      const snap = await get(
        ref(db, `couples/${coupleId}/cards/pendingCards/${trade.requesterUid}/${card.instanceId}`)
      )
      if (!snap.exists()) {
        throw new Error('uma das cartas da proposta não está mais disponível')
      }
    }
    for (const card of trade.cardsFromPartner) {
      const snap = await get(
        ref(db, `couples/${coupleId}/cards/pendingCards/${trade.partnerUid}/${card.instanceId}`)
      )
      if (!snap.exists()) {
        throw new Error('uma das cartas da proposta não está mais disponível')
      }
    }

    // 2) tudo validado — transfere de fato: remove instância pendente de quem
    // deu, cria uma nova entrada pendente (mesmo formato de addPendingCards)
    // na mochila de quem recebeu.
    const now = Date.now()

    for (const card of trade.cardsFromRequester) {
      await remove(
        ref(db, `couples/${coupleId}/cards/pendingCards/${trade.requesterUid}/${card.instanceId}`)
      )
      const newRef = push(ref(db, `couples/${coupleId}/cards/pendingCards/${trade.partnerUid}`))
      await set(newRef, {
        cardId: card.cardId,
        collectionId: card.collectionId,
        addedAt: now,
      })
    }
    for (const card of trade.cardsFromPartner) {
      await remove(
        ref(db, `couples/${coupleId}/cards/pendingCards/${trade.partnerUid}/${card.instanceId}`)
      )
      const newRef = push(ref(db, `couples/${coupleId}/cards/pendingCards/${trade.requesterUid}`))
      await set(newRef, {
        cardId: card.cardId,
        collectionId: card.collectionId,
        addedAt: now,
      })
    }
  } catch (err) {
    await update(tradeRef, { status: 'declined', updatedAt: Date.now() })
    throw err
  }

  await notifyTradeEvent(coupleId, tradeId, 'accepted', byUid)
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
