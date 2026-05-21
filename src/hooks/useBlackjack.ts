import { useEffect, useRef, useState, useCallback } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '../lib/firebase'
import {
  subscribeBlackjack,
  createBlackjackRoom,
  blackjackHit,
  blackjackStand,
  blackjackSetBet,
  resolveBlackjack,
  resetBlackjack,
  deleteBlackjackRoom,
  handScore,
  type BlackjackRoom,
  type BlackjackAction,
} from '../lib/games'

// ─── Tipos exportados ─────────────────────────────────────────────────────────

export interface UseBlackjackOptions {
  roomId: string // uid do casal (boardId principal)
  partnerUid: string
}

export interface UseBlackjackReturn {
  room: BlackjackRoom | null
  myUid: string | null
  isHost: boolean
  isMyTurn: boolean // fase player_turn + ainda não agi
  myScore: number
  partnerScore: number
  myAction: BlackjackAction | null
  myOutcome: 'win' | 'lose' | 'push' | 'bust' | null
  partnerOutcome: 'win' | 'lose' | 'push' | 'bust' | null
  loading: boolean
  // ações
  startGame: (bet?: number) => Promise<void>
  hit: () => Promise<void>
  stand: () => Promise<void>
  setBet: (amount: number) => Promise<void>
  playAgain: () => Promise<void>
  leaveGame: () => Promise<void>
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useBlackjack({ roomId, partnerUid }: UseBlackjackOptions): UseBlackjackReturn {
  const [user] = useAuthState(auth)
  const myUid = user?.uid ?? null

  const [room, setRoom] = useState<BlackjackRoom | null>(null)
  const [loading, setLoading] = useState(false)

  // flag para não chamar resolveBlackjack duas vezes
  const resolvingRef = useRef(false)

  // ── Subscribe ao Firebase ──────────────────────────────────────────────────
  useEffect(() => {
    if (!roomId) return
    const unsub = subscribeBlackjack(roomId, (data) => setRoom(data))
    return unsub
  }, [roomId])

  // ── Auto-resolve quando ambos os jogadores agiram ─────────────────────────
  useEffect(() => {
    if (!room || room.state !== 'player_turn') return
    if (!myUid) return

    const players = room.players ?? {}
    const uids = Object.keys(players)
    if (uids.length < 2) return

    const allActed = uids.every(
      (uid) => players[uid].action === 'stand' || players[uid].action === 'bust'
    )

    const isHost = room.host === myUid

    if (allActed && isHost && !resolvingRef.current) {
      resolvingRef.current = true
      resolveBlackjack(roomId).finally(() => {
        resolvingRef.current = false
      })
    }
  }, [room, myUid, roomId])

  // ── Derivações ────────────────────────────────────────────────────────────

  const isHost = room?.host === myUid

  const myHand = myUid ? (room?.players?.[myUid]?.hand ?? []) : []
  const partnerHand = room?.players?.[partnerUid]?.hand ?? []

  const myScore = handScore(myHand)
  const partnerScore = handScore(partnerHand)
  // durante player_turn: só mostra a 2ª carta do dealer (1ª está oculta)

  const myAction = myUid ? (room?.players?.[myUid]?.action ?? null) : null
  const isMyTurn = room?.state === 'player_turn' && myAction === null

  const myOutcome =
    room?.state === 'result' && myUid ? (room.result?.players?.[myUid]?.outcome ?? null) : null
  const partnerOutcome =
    room?.state === 'result' ? (room.result?.players?.[partnerUid]?.outcome ?? null) : null

  // ── Ações ─────────────────────────────────────────────────────────────────

  const startGame = useCallback(
    async (bet = 0) => {
      if (!myUid) return
      setLoading(true)
      try {
        if (bet > 0) await blackjackSetBet(roomId, myUid, bet)
        await createBlackjackRoom(roomId, myUid, partnerUid)
      } finally {
        setLoading(false)
      }
    },
    [myUid, roomId, partnerUid]
  )

  const hit = useCallback(async () => {
    if (!myUid || !isMyTurn) return
    await blackjackHit(roomId, myUid)
  }, [myUid, isMyTurn, roomId])

  const stand = useCallback(async () => {
    if (!myUid || !isMyTurn) return
    await blackjackStand(roomId, myUid)
  }, [myUid, isMyTurn, roomId])

  const setBet = useCallback(
    async (amount: number) => {
      if (!myUid) return
      await blackjackSetBet(roomId, myUid, amount)
    },
    [myUid, roomId]
  )

  const playAgain = useCallback(async () => {
    await resetBlackjack(roomId)
  }, [roomId])

  const leaveGame = useCallback(async () => {
    if (isHost) {
      await deleteBlackjackRoom(roomId)
    }
  }, [isHost, roomId])

  return {
    room,
    myUid,
    isHost,
    isMyTurn,
    myScore,
    partnerScore,
    myAction,
    myOutcome,
    partnerOutcome,
    loading,
    startGame,
    hit,
    stand,
    setBet,
    playAgain,
    leaveGame,
  }
}
