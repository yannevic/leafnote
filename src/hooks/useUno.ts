import { useEffect, useRef, useState, useCallback } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '../lib/firebase'
import {
  subscribeUno,
  createUnoRoom,
  unoPlayCard,
  unoDrawCard,
  deleteUnoRoom,
  type UnoRoom,
  type UnoColor,
} from '../lib/games'

// ─── Tipos exportados ─────────────────────────────────────────────────────────

export interface UseUnoOptions {
  coupleId: string
  roomId: string
  partnerUid: string
}

export interface UseUnoReturn {
  room: UnoRoom | null
  myUid: string | null
  isHost: boolean
  isMyTurn: boolean
  myHand: UnoRoom['hands'][string]
  partnerHandCount: number
  loading: boolean
  hasUno: boolean // eu tenho 1 carta na mão
  partnerHasUno: boolean // parceiro tem 1 carta
  // ações
  startGame: () => Promise<void>
  playCard: (cardId: string, chosenColor?: UnoColor) => Promise<void>
  drawCard: () => Promise<void>
  leaveGame: () => Promise<void>
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useUno({ coupleId, roomId, partnerUid }: UseUnoOptions): UseUnoReturn {
  const [user] = useAuthState(auth)
  const myUid = user?.uid ?? null

  const [room, setRoom] = useState<UnoRoom | null>(null)
  const [loading, setLoading] = useState(false)

  const startingRef = useRef(false)

  // ── Subscribe ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!roomId) return
    const unsub = subscribeUno(roomId, coupleId, (data: UnoRoom | null) => setRoom(data))
    return unsub
  }, [roomId])

  // ── Derivações ────────────────────────────────────────────────────────────

  const isHost = room?.host === myUid
  const isMyTurn = !!myUid && room?.state === `turn_${myUid}`

  const myHand = myUid ? (room?.hands?.[myUid] ?? []) : []
  const partnerHandCount = (room?.hands?.[partnerUid] ?? []).length

  const hasUno = myHand.length === 1
  const partnerHasUno = partnerHandCount === 1

  // ── Ações ─────────────────────────────────────────────────────────────────

  const startGame = useCallback(async () => {
    if (!myUid || startingRef.current) return
    startingRef.current = true
    setLoading(true)
    try {
      await createUnoRoom(roomId, myUid, partnerUid, coupleId)
    } finally {
      setLoading(false)
      startingRef.current = false
    }
  }, [myUid, roomId, partnerUid])

  const playCard = useCallback(
    async (cardId: string, chosenColor?: UnoColor) => {
      if (!myUid || !isMyTurn) return
      await unoPlayCard(roomId, myUid!, partnerUid, cardId, chosenColor!)
    },
    [myUid, isMyTurn, roomId, partnerUid]
  )

  const drawCard = useCallback(async () => {
    if (!myUid || !isMyTurn) return
    await unoDrawCard(roomId, myUid, partnerUid, coupleId)
  }, [myUid, isMyTurn, roomId, partnerUid])

  const leaveGame = useCallback(async () => {
    if (isHost) await deleteUnoRoom(coupleId, roomId)
  }, [isHost, roomId])

  return {
    room,
    myUid,
    isHost,
    isMyTurn,
    myHand,
    partnerHandCount,
    loading,
    hasUno,
    partnerHasUno,
    startGame,
    playCard,
    drawCard,
    leaveGame,
  }
}
