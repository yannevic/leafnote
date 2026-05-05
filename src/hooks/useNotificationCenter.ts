import { useState, useEffect } from 'react'
import { ref, onValue, off } from 'firebase/database'
import { db } from '../lib/firebase'
import type { AnyBoardItem, LetterItem } from '../types/board'
import type { PlantData } from '../lib/garden'
import { boardItemsPath, DEFAULT_BOARD_ID } from '../lib/boards'

export interface AppNotification {
  id: string
  type: 'letter' | 'special-letter' | 'garden-water'
  message: string
  boardId?: string
  boardName?: string
}

interface Props {
  uid: string
  partnerUid: string
  extraBoardNames: Record<string, string>
}

export function useNotificationCenter({ uid, partnerUid, extraBoardNames }: Props) {
  const [notifications, setNotifications] = useState<AppNotification[]>([])

  // Cartas não abertas
  useEffect(() => {
    if (!uid || !partnerUid) return

    const boardIds = [DEFAULT_BOARD_ID, ...Object.keys(extraBoardNames)]
    const unsubs: (() => void)[] = []

    boardIds.forEach((boardId) => {
      const path = boardItemsPath(boardId)
      const r = ref(db, path)
      const handler = onValue(r, (snap) => {
        const data = (snap.val() ?? {}) as Record<string, AnyBoardItem>

        const letterNotifs: AppNotification[] = Object.values(data)
          .filter((item) => {
            if (item.type !== 'letter' && item.type !== 'special-letter') return false
            if (item.createdBy === uid) return false
            const letter = item as LetterItem
            if (letter.opened) return false
            return true
          })
          .map((item) => ({
            id: `${boardId}-${item.id}`,
            type: item.type as 'letter' | 'special-letter',
            message: item.type === 'letter' ? 'cartinha não aberta' : 'carta especial não aberta',
            boardId,
            boardName:
              boardId === DEFAULT_BOARD_ID
                ? 'mural principal'
                : (extraBoardNames[boardId] ?? boardId),
          }))

        setNotifications((prev) => {
          const filtered = prev.filter((n) => {
            if (n.type !== 'letter' && n.type !== 'special-letter') return true
            return !n.id.startsWith(`${boardId}-`)
          })
          return [...filtered, ...letterNotifs]
        })
      })

      unsubs.push(() => off(r, 'value', handler))
    })

    return () => unsubs.forEach((u) => u())
  }, [uid, partnerUid, extraBoardNames])

  // Plantas não regadas hoje
  useEffect(() => {
    if (!uid) return

    const r = ref(db, 'garden/plants')
    const handler = onValue(r, (snap) => {
      const data = (snap.val() ?? {}) as Record<string, PlantData>
      const today = new Date().toLocaleDateString('en-CA')

      const waterNotifs: AppNotification[] = Object.values(data)
        .filter((plant) => {
          if (plant.stage >= 5) return false
          const alreadyWatered = plant.water?.[uid] === true && plant.waterDate === today
          if (alreadyWatered) return false
          if (plant.waterDate === today && !plant.water?.[uid] && !plant.water?.[partnerUid])
            return false
          return true
        })
        .map((plant) => ({
          id: `garden-${plant.id}`,
          type: 'garden-water' as const,
          message: `${plant.flowerType} ainda não foi regada hoje`,
        }))

      setNotifications((prev) => [...prev.filter((n) => n.type !== 'garden-water'), ...waterNotifs])
    })

    return () => off(r, 'value', handler)
  }, [uid, partnerUid])

  return { notifications }
}
