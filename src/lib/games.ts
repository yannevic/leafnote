import { ref, set, get, update, remove, onValue, off } from 'firebase/database'
import { db } from './firebase'

// ─── Tipos compartilhados ─────────────────────────────────────────────────────

export type Suit = 'hearts' | 'diamonds' | 'spades' | 'clubs'
export type CardValue = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K'
export type UnoColor = 'pink' | 'green' | 'mauve' | 'peach' | 'wild'
export type UnoType = 'number' | 'skip' | 'reverse' | 'draw2' | 'draw4' | 'wild'

export interface PlayingCard {
  suit: Suit
  value: CardValue
}

export interface UnoCard {
  id: string
  color: UnoColor
  type: UnoType
  value?: number
}

// ─── Tipos — Blackjack ────────────────────────────────────────────────────────

export type BlackjackState =
  | 'idle'
  | 'waiting'
  | 'dealing'
  | 'player_turn'
  | 'dealer_turn'
  | 'result'

export type BlackjackAction = 'hit' | 'stand' | 'bust'

export interface BlackjackPlayer {
  hand: PlayingCard[]
  action: BlackjackAction | null
  bet: number
}

export interface BlackjackResult {
  dealerScore: number
  players: Record<string, { score: number; outcome: 'win' | 'lose' | 'push' | 'bust' }>
}

export interface BlackjackRoom {
  state: BlackjackState
  host: string
  deck: PlayingCard[]
  players: Record<string, BlackjackPlayer>
  dealer: {
    hand: PlayingCard[]
  }
  result: BlackjackResult | null
}

// ─── Tipos — UNO ─────────────────────────────────────────────────────────────

export interface UnoRoom {
  state: string
  host: string
  deck: UnoCard[]
  discard: UnoCard[]
  hands: Record<string, UnoCard[]>
  topCard: Pick<UnoCard, 'color' | 'type' | 'value'>
  currentColor: UnoColor
  winner: string | null
}

// ─── Paths ────────────────────────────────────────────────────────────────────

const bjPath = (coupleId: string, roomId: string) => `couples/${coupleId}/games/blackjack/${roomId}`
const unoPath = (coupleId: string, roomId: string) => `couples/${coupleId}/games/uno/${roomId}`

// ─── Deck — Baralho comum ─────────────────────────────────────────────────────

const SUITS: Suit[] = ['hearts', 'diamonds', 'spades', 'clubs']
const VALUES: CardValue[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']

export function buildDeck(): PlayingCard[] {
  const deck: PlayingCard[] = []
  for (const suit of SUITS) {
    for (const value of VALUES) {
      deck.push({ suit, value })
    }
  }
  return shuffle(deck)
}

export function cardScore(value: CardValue): number {
  if (['J', 'Q', 'K'].includes(value)) return 10
  if (value === 'A') return 11
  return parseInt(value, 10)
}

export function handScore(hand: PlayingCard[]): number {
  let score = hand.reduce((acc, c) => acc + cardScore(c.value), 0)
  let aces = hand.filter((c) => c.value === 'A').length
  while (score > 21 && aces > 0) {
    score -= 10
    aces--
  }
  return score
}

// ─── Deck — UNO (108 cartas) ──────────────────────────────────────────────────

const UNO_COLORS: Exclude<UnoColor, 'wild'>[] = ['pink', 'green', 'mauve', 'peach']

export function buildUnoDeck(): UnoCard[] {
  const deck: UnoCard[] = []
  let i = 0

  const card = (color: UnoColor, type: UnoType, value?: number): UnoCard => ({
    id: `uno_${i++}`,
    color,
    type,
    ...(value !== undefined && { value }),
  })

  for (const color of UNO_COLORS) {
    // 0 — apenas 1 por cor
    deck.push(card(color, 'number', 0))
    // 1-9 — 2 de cada por cor
    for (let n = 1; n <= 9; n++) {
      deck.push(card(color, 'number', n))
      deck.push(card(color, 'number', n))
    }
    // especiais — 2 de cada por cor
    deck.push(card(color, 'skip'))
    deck.push(card(color, 'skip'))
    deck.push(card(color, 'reverse'))
    deck.push(card(color, 'reverse'))
    deck.push(card(color, 'draw2'))
    deck.push(card(color, 'draw2'))
  }

  // curingas — 4 wild + 4 draw4
  for (let n = 0; n < 4; n++) {
    deck.push(card('wild', 'wild'))
    deck.push(card('wild', 'draw4'))
  }

  return shuffle(deck)
}

// ─── Utilitário ───────────────────────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// ─── Firebase — Blackjack ─────────────────────────────────────────────────────

export async function createBlackjackRoom(
  coupleId: string,
  roomId: string,
  hostUid: string,
  partnerUid: string
): Promise<void> {
  const deck = buildDeck()

  const hostHand: PlayingCard[] = [deck.pop()!, deck.pop()!]
  const partnerHand: PlayingCard[] = [deck.pop()!, deck.pop()!]
  const dealerHand: PlayingCard[] = [deck.pop()!, deck.pop()!]

  const room: BlackjackRoom = {
    state: 'player_turn',
    host: hostUid,
    deck,
    players: {
      [hostUid]: { hand: hostHand, action: null, bet: 0 },
      [partnerUid]: { hand: partnerHand, action: null, bet: 0 },
    },
    dealer: { hand: dealerHand },
    result: null,
  }

  await set(ref(db, bjPath(coupleId, roomId)), room)
}

export async function blackjackHit(coupleId: string, roomId: string, uid: string): Promise<void> {
  const snap = await get(ref(db, bjPath(coupleId, roomId)))
  if (!snap.exists()) return

  const room = snap.val() as BlackjackRoom
  const deck = [...(room.deck ?? [])]
  const hand = [...(room.players[uid]?.hand ?? [])]

  const card = deck.pop()
  if (!card) return

  hand.push(card)
  const score = handScore(hand)
  const action: BlackjackAction | null = score > 21 ? 'bust' : null

  await update(ref(db, bjPath(coupleId, roomId)), {
    deck,
    [`players/${uid}/hand`]: hand,
    [`players/${uid}/action`]: action,
  })
}

export async function blackjackStand(coupleId: string, roomId: string, uid: string): Promise<void> {
  await update(ref(db, `${bjPath(coupleId, roomId)}/players/${uid}`), { action: 'stand' })
}

export async function blackjackSetBet(
  coupleId: string,
  roomId: string,
  uid: string,
  bet: number
): Promise<void> {
  await update(ref(db, `${bjPath(coupleId, roomId)}/players/${uid}`), { bet })
}

export async function resolveBlackjack(coupleId: string, roomId: string): Promise<void> {
  const snap = await get(ref(db, bjPath(coupleId, roomId)))
  if (!snap.exists()) return

  const room = snap.val() as BlackjackRoom
  let deck = [...(room.deck ?? [])]
  let dHand = [...room.dealer.hand]
  let dScore = handScore(dHand)

  while (dScore < 17) {
    const card = deck.pop()
    if (!card) break
    dHand.push(card)
    dScore = handScore(dHand)
  }

  const playerResults: BlackjackResult['players'] = {}
  for (const [uid, player] of Object.entries(room.players)) {
    const pScore = handScore(player.hand)
    let outcome: 'win' | 'lose' | 'push' | 'bust'

    if (pScore > 21) {
      outcome = 'bust'
    } else if (dScore > 21 || pScore > dScore) {
      outcome = 'win'
    } else if (pScore === dScore) {
      outcome = 'push'
    } else {
      outcome = 'lose'
    }

    playerResults[uid] = { score: pScore, outcome }
  }

  const result: BlackjackResult = { dealerScore: dScore, players: playerResults }

  await update(ref(db, bjPath(coupleId, roomId)), {
    state: 'result',
    deck,
    'dealer/hand': dHand,
    result,
  })
}

export async function resetBlackjack(coupleId: string, roomId: string): Promise<void> {
  await update(ref(db, bjPath(coupleId, roomId)), { state: 'idle', result: null })
}

export async function deleteBlackjackRoom(coupleId: string, roomId: string): Promise<void> {
  await remove(ref(db, bjPath(coupleId, roomId)))
}

export function subscribeBlackjack(
  coupleId: string,
  roomId: string,
  callback: (room: BlackjackRoom | null) => void
): () => void {
  const r = ref(db, bjPath(coupleId, roomId))
  const handler = onValue(r, (snap) => {
    callback(snap.exists() ? (snap.val() as BlackjackRoom) : null)
  })
  return () => off(r, 'value', handler)
}

// ─── Firebase — UNO ───────────────────────────────────────────────────────────

export async function createUnoRoom(
  coupleId: string,
  roomId: string,
  hostUid: string,
  partnerUid: string
): Promise<void> {
  const deck = buildUnoDeck()

  const hostHand: UnoCard[] = deck.splice(0, 7)
  const partnerHand: UnoCard[] = deck.splice(0, 7)

  // primeira carta do discard não pode ser wild nem draw4
  let startIndex = deck.findIndex((c) => c.type !== 'wild' && c.type !== 'draw4')
  if (startIndex === -1) startIndex = 0
  const [topCard] = deck.splice(startIndex, 1)

  const room: UnoRoom = {
    state: `turn_${hostUid}`,
    host: hostUid,
    deck,
    discard: [topCard],
    hands: {
      [hostUid]: hostHand,
      [partnerUid]: partnerHand,
    },
    topCard: { color: topCard.color, type: topCard.type, value: topCard.value },
    currentColor: topCard.color === 'wild' ? 'pink' : (topCard.color as Exclude<UnoColor, 'wild'>),
    winner: null,
  }

  await set(ref(db, unoPath(coupleId, roomId)), room)
}

export async function unoPlayCard(
  coupleId: string,
  roomId: string,
  uid: string,
  partnerUid: string,
  cardId: string,
  chosenColor?: UnoColor
): Promise<void> {
  const snap = await get(ref(db, unoPath(coupleId, roomId)))
  if (!snap.exists()) return

  const room = snap.val() as UnoRoom
  const hand = [...(room.hands[uid] ?? [])]
  const discard = [...(room.discard ?? [])]
  let deck = [...(room.deck ?? [])]

  const cardIndex = hand.findIndex((c) => c.id === cardId)
  if (cardIndex === -1) return

  const [card] = hand.splice(cardIndex, 1)
  discard.push(card)

  const activeColor: UnoColor =
    chosenColor ?? (card.color !== 'wild' ? (card.color as UnoColor) : room.currentColor)

  const topCard = {
    color: activeColor,
    type: card.type,
    ...(card.value !== undefined && { value: card.value }),
  }

  // vitória
  if (hand.length === 0) {
    await update(ref(db, unoPath(coupleId, roomId)), {
      state: 'finished',
      winner: uid,
      discard,
      topCard,
      currentColor: activeColor,
      [`hands/${uid}`]: hand,
    })
    return
  }

  let partnerHand = [...(room.hands[partnerUid] ?? [])]

  // skip e reverse com 2 jogadores = fica na vez
  if (card.type === 'skip' || card.type === 'reverse') {
    await update(ref(db, unoPath(coupleId, roomId)), {
      state: `turn_${uid}`,
      deck,
      discard,
      topCard,
      currentColor: activeColor,
      [`hands/${uid}`]: hand,
    })
    return
  }

  if (card.type === 'draw2') {
    const drawn = drawFromDeck(deck, discard, 2)
    partnerHand = [...partnerHand, ...drawn.cards]
    await update(ref(db, unoPath(coupleId, roomId)), {
      state: `turn_${uid}`,
      deck: drawn.deck,
      discard: drawn.discard,
      topCard,
      currentColor: activeColor,
      [`hands/${uid}`]: hand,
      [`hands/${partnerUid}`]: partnerHand,
    })
    return
  }

  if (card.type === 'draw4') {
    const drawn = drawFromDeck(deck, discard, 4)
    partnerHand = [...partnerHand, ...drawn.cards]
    await update(ref(db, unoPath(coupleId, roomId)), {
      state: `turn_${uid}`,
      deck: drawn.deck,
      discard: drawn.discard,
      topCard,
      currentColor: activeColor,
      [`hands/${uid}`]: hand,
      [`hands/${partnerUid}`]: partnerHand,
    })
    return
  }

  // carta normal — passa a vez
  await update(ref(db, unoPath(coupleId, roomId)), {
    state: `turn_${partnerUid}`,
    deck,
    discard,
    topCard,
    currentColor: activeColor,
    [`hands/${uid}`]: hand,
  })
}

export async function unoDrawCard(
  coupleId: string,
  roomId: string,
  uid: string,
  partnerUid: string
): Promise<void> {
  const snap = await get(ref(db, unoPath(coupleId, roomId)))
  if (!snap.exists()) return

  const room = snap.val() as UnoRoom
  const hand = [...(room.hands[uid] ?? [])]
  const drawn = drawFromDeck([...room.deck], [...room.discard], 1)

  hand.push(...drawn.cards)

  await update(ref(db, unoPath(coupleId, roomId)), {
    state: `turn_${partnerUid}`,
    deck: drawn.deck,
    discard: drawn.discard,
    [`hands/${uid}`]: hand,
  })
}

export async function deleteUnoRoom(coupleId: string, roomId: string): Promise<void> {
  await remove(ref(db, unoPath(coupleId, roomId)))
}

export function subscribeUno(
  coupleId: string,
  roomId: string,
  callback: (room: UnoRoom | null) => void
): () => void {
  const r = ref(db, unoPath(coupleId, roomId))
  const handler = onValue(r, (snap) => {
    callback(snap.exists() ? (snap.val() as UnoRoom) : null)
  })
  return () => off(r, 'value', handler)
}

// ─── Helper interno — comprar do deck ────────────────────────────────────────

function drawFromDeck(
  deck: UnoCard[],
  discard: UnoCard[],
  count: number
): { cards: UnoCard[]; deck: UnoCard[]; discard: UnoCard[] } {
  const cards: UnoCard[] = []
  let d = [...deck]
  let disc = [...discard]

  for (let i = 0; i < count; i++) {
    if (d.length === 0) {
      const top = disc[disc.length - 1]
      d = shuffle(disc.slice(0, -1))
      disc = [top]
    }
    if (d.length === 0) break
    cards.push(d.pop()!)
  }

  return { cards, deck: d, discard: disc }
}

// ─── Lobby ────────────────────────────────────────────────────────────────────

export type GameMode = 'blackjack' | 'uno'
export type LobbyState = 'idle' | 'waiting' | 'starting'

export interface GameLobby {
  mode: GameMode | null
  ready: Record<string, boolean>
  state: LobbyState
}

const lobbyPath = (coupleId: string) => `couples/${coupleId}/games/lobby`

export function setLobbyMode(
  coupleId: string,
  roomId: string,
  mode: GameMode | null
): Promise<void> {
  return set(ref(db, `${lobbyPath(coupleId)}/${roomId}/mode`), mode)
}

export function setReady(
  coupleId: string,
  roomId: string,
  uid: string,
  value: boolean
): Promise<void> {
  return set(ref(db, `${lobbyPath(coupleId)}/${roomId}/ready/${uid}`), value)
}

export function setLobbyState(coupleId: string, roomId: string, state: LobbyState): Promise<void> {
  return set(ref(db, `${lobbyPath(coupleId)}/${roomId}/state`), state)
}

export function resetLobby(coupleId: string, roomId: string): Promise<void> {
  return set(ref(db, `${lobbyPath(coupleId)}/${roomId}`), {
    mode: null,
    ready: {},
    state: 'idle',
  })
}

export function subscribeLobby(
  coupleId: string,
  roomId: string,
  cb: (lobby: GameLobby | null) => void
): () => void {
  const r = ref(db, `${lobbyPath(coupleId)}/${roomId}`)
  const handler = onValue(r, (snap) => cb(snap.exists() ? (snap.val() as GameLobby) : null))
  return () => off(r, 'value', handler)
}
