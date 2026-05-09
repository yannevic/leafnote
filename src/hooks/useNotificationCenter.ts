import { useState, useEffect, useRef } from 'react'
import { ref, onValue, off } from 'firebase/database'
import useSound from 'use-sound'
import { db } from '../lib/firebase'
import type { AnyBoardItem, LetterItem } from '../types/board'
import type { PlantData } from '../lib/garden'
import { boardItemsPath, DEFAULT_BOARD_ID } from '../lib/boards'
import { subscribeSpecialDates, getAvailableDates } from '../lib/specialDates'
import type { SpecialDates } from '../lib/specialDates'
import moodSound from '../assets/sounds/mood.mp3'

export interface AppNotification {
  id: string
  type: 'letter' | 'special-letter' | 'garden-water' | 'special-date'
  message: string
  boardId?: string
  boardName?: string
}

interface Props {
  uid: string
  partnerUid: string
  myNick: string
  partnerNick: string
  extraBoardNames: Record<string, string>
}

/** Retorna 'YYYY-MM-DD' de hoje e de amanhã */
function getTodayAndTomorrow() {
  const now = new Date()
  const today = now.toLocaleDateString('en-CA') // YYYY-MM-DD
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowStr = tomorrow.toLocaleDateString('en-CA')
  return { today, tomorrow: tomorrowStr }
}

/** Converte DD-MM ou DD-MM-AAAA para 'MM-DD' para comparar com hoje/amanhã */
function toMmDd(ddmm: string): string {
  if (!ddmm || ddmm.length < 5) return ''
  const parts = ddmm.split('-')
  // partes[0]=DD, partes[1]=MM
  return `${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`
}

/** Verifica se uma data DD-MM (ou DD-MM-AAAA) cai hoje ou amanhã */
function checkDate(ddmm: string): 'today' | 'tomorrow' | null {
  const mmdd = toMmDd(ddmm)
  if (!mmdd) return null
  const { today, tomorrow } = getTodayAndTomorrow()
  const todayMmDd = today.slice(5) // MM-DD
  const tomorrowMmDd = tomorrow.slice(5)
  if (mmdd === todayMmDd) return 'today'
  if (mmdd === tomorrowMmDd) return 'tomorrow'
  return null
}

export function useNotificationCenter({
  uid,
  partnerUid,
  myNick,
  partnerNick,
  extraBoardNames,
}: Props) {
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [play] = useSound(moodSound, { volume: 0.5 })
  const playedDates = useRef<Set<string>>(new Set())

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

  // Datas especiais — notificação no dia e 1 dia antes + som
  useEffect(() => {
    if (!uid || !partnerUid) return

    const unsub = subscribeSpecialDates((dates: SpecialDates) => {
      const allDates = getAvailableDates(dates, uid, partnerUid, myNick, partnerNick)

      const dateNotifs: AppNotification[] = []

      allDates.forEach((d) => {
        const when = checkDate(d.mmdd)
        if (!when) return

        const notifId = `special-date-${d.key}-${when}`
        const message =
          when === 'today'
            ? `hoje é ${d.label.toLowerCase()}!`
            : `amanhã é ${d.label.toLowerCase()}!`

        dateNotifs.push({
          id: notifId,
          type: 'special-date',
          message,
        })

        // toca som só uma vez por data por sessão
        if (!playedDates.current.has(notifId)) {
          playedDates.current.add(notifId)
          play()
        }
      })

      setNotifications((prev) => [...prev.filter((n) => n.type !== 'special-date'), ...dateNotifs])
    })

    return () => unsub()
  }, [uid, partnerUid, myNick, partnerNick, play])

  return { notifications }
}
