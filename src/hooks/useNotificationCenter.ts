import { useState, useEffect, useRef } from 'react'
import { ref, onValue, off } from 'firebase/database'
import useSound from 'use-sound'
import { db } from '../lib/firebase'
import type { AnyBoardItem, LetterItem, SpecialLetterItem } from '../types/board'
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
  dismissible?: boolean // pode ser marcada como lida manualmente
}

interface Props {
  uid: string
  partnerUid: string
  myNick: string
  partnerNick: string
  extraBoardNames: Record<string, string>
}

function getTodayAndTomorrow() {
  const now = new Date()
  const today = now.toLocaleDateString('en-CA')
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  return { today, tomorrow: tomorrow.toLocaleDateString('en-CA') }
}

function toMmDd(ddmm: string): string {
  if (!ddmm || ddmm.length < 5) return ''
  const parts = ddmm.split('-')
  return `${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`
}

function checkDate(ddmm: string): 'today' | 'tomorrow' | null {
  const mmdd = toMmDd(ddmm)
  if (!mmdd) return null
  const { today, tomorrow } = getTodayAndTomorrow()
  if (mmdd === today.slice(5)) return 'today'
  if (mmdd === tomorrow.slice(5)) return 'tomorrow'
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
  const [readIds, setReadIds] = useState<Set<string>>(new Set())
  const [play] = useSound(moodSound, { volume: 0.5 })
  const playedDates = useRef<Set<string>>(new Set())

  const dismiss = (id: string) => {
    setReadIds((prev) => new Set([...prev, id]))
  }

  // Cartas
  useEffect(() => {
    if (!uid || !partnerUid) return

    const boardIds = [DEFAULT_BOARD_ID, ...Object.keys(extraBoardNames)]
    const unsubs: (() => void)[] = []
    const today = new Date().toLocaleDateString('en-CA')

    boardIds.forEach((boardId) => {
      const r = ref(db, boardItemsPath(boardId))
      const handler = onValue(r, (snap) => {
        const data = (snap.val() ?? {}) as Record<string, AnyBoardItem>
        console.log('items:', Object.keys(data).length, 'uid:', uid)
        Object.values(data).forEach((item) => {
          if (item.type === 'special-letter') {
            console.log('special-letter:', item.id, 'createdBy:', item.createdBy, 'uid:', uid)
          }
        })
        const boardLabel =
          boardId === DEFAULT_BOARD_ID ? 'mural principal' : (extraBoardNames[boardId] ?? boardId)

        const letterNotifs: AppNotification[] = []

        Object.values(data).forEach((item) => {
          if (item.type !== 'letter' && item.type !== 'special-letter') return

          if (item.createdBy === uid) return

          const notifId = `${boardId}-${item.id}`

          if (item.type === 'letter') {
            const letter = item as LetterItem
            if (letter.opened) return // sumiu: foi aberta
            letterNotifs.push({
              id: notifId,
              type: 'letter',
              message: `você recebeu uma cartinha`,
              boardId,
              boardName: boardLabel,
            })
          }

          if (item.type === 'special-letter') {
            const sl = item as SpecialLetterItem
            const isAvailable = !sl.availableFrom || today >= sl.availableFrom

            if (isAvailable) {
              if (sl.opened) return // sumiu: foi aberta
              letterNotifs.push({
                id: notifId,
                type: 'special-letter',
                message: `você recebeu uma carta especial`,
                boardId,
                boardName: boardLabel,
              })
            } else {
              // bloqueada — aparece como dismissível
              letterNotifs.push({
                id: notifId,
                type: 'special-letter',
                message: `carta especial para ${sl.availableFrom!.split('-').reverse().join('/')}`,
                boardId,
                boardName: boardLabel,
                dismissible: true,
              })
            }
          }
        })

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

  // Plantas
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

  // Datas especiais
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

        dateNotifs.push({ id: notifId, type: 'special-date', message })

        if (!playedDates.current.has(notifId)) {
          playedDates.current.add(notifId)
          play()
        }
      })

      setNotifications((prev) => [...prev.filter((n) => n.type !== 'special-date'), ...dateNotifs])
    })

    return () => unsub()
  }, [uid, partnerUid, myNick, partnerNick, play])

  // Filtra lidas (só dismissíveis saem da lista)
  const visible = notifications.filter((n) => !n.dismissible || !readIds.has(n.id))

  return { notifications: visible, dismiss }
}
