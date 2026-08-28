import { useState, useEffect, useRef } from 'react'
import { ref, onValue, off } from 'firebase/database'
import useSound from 'use-sound'
import { db } from '../lib/firebase'
import type { AnyBoardItem, LetterItem, SpecialLetterItem } from '../types/board'
import type { PlantData, StageEvent } from '../lib/garden'
import { boardItemsPath, DEFAULT_BOARD_ID } from '../lib/boards'
import { subscribeSpecialDates, getAvailableDates } from '../lib/specialDates'
import type { SpecialDates } from '../lib/specialDates'
import {
  ref as dbRef,
  onValue as dbOnValue,
  off as dbOff,
  set as dbSet,
  get as dbGet,
} from 'firebase/database'
import moodSound from '../assets/sounds/mood.mp3'
import { subscribeWeeklyPending } from '../lib/streak'

export interface AppNotification {
  id: string
  type:
    | 'letter'
    | 'special-letter'
    | 'garden-water'
    | 'garden-dice'
    | 'garden-sell'
    | 'calendar-event'
    | 'weekly-sorteo'
    | 'activity-completed'
    | 'card-trade-request'
    | 'card-trade-countered'
    | 'card-trade-accepted'
    | 'card-trade-declined'
  message: string
  boardId?: string
  boardName?: string
  dismissible?: boolean
}

interface Props {
  uid: string
  partnerUid: string
  coupleId: string
  myNick: string
  partnerNick: string
  extraBoardNames: Record<string, string>
}
export function useNotificationCenter({
  uid,
  partnerUid,
  coupleId,
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
    // persiste no Firebase se for notif de calendário
    if (id.startsWith('calendar-event-')) {
      dbSet(dbRef(db, `users/${uid}/seenCalendarNotifs/${id}`), true)
    }
    if (id.startsWith('activity-completed-')) {
      dbSet(dbRef(db, `users/${uid}/seenActivityNotifs/${id}`), true)
    }
    if (id.startsWith('card-trade-')) {
      dbSet(dbRef(db, `users/${uid}/seenTradeNotifs/${id}`), true)
    }
  }

  // Cartas
  useEffect(() => {
    if (!uid || !partnerUid) return

    const boardIds = [DEFAULT_BOARD_ID, ...Object.keys(extraBoardNames)]
    const unsubs: (() => void)[] = []
    const today = new Date().toLocaleDateString('en-CA')

    boardIds.forEach((boardId) => {
      const r = ref(db, boardItemsPath(coupleId, boardId))
      const handler = onValue(r, (snap) => {
        const data = (snap.val() ?? {}) as Record<string, AnyBoardItem>

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
    const r = ref(db, `couples/${coupleId}/garden/plants`)
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

  // Dado pendente (stageEvents onde uid ainda não rolou)
  useEffect(() => {
    if (!uid) return
    const r = ref(db, `couples/${coupleId}/garden/stageEvents`)
    const handler = onValue(r, (snap) => {
      const data = (snap.val() ?? {}) as Record<string, StageEvent>
      const pending = Object.values(data).filter((e) => e.rolls?.[uid] == null)
      const diceNotifs: AppNotification[] = pending.map((e) => ({
        id: `garden-dice-${e.id}`,
        type: 'garden-dice' as const,
        message: `${e.plantName} subiu de estágio — gire o dado!`,
      }))
      setNotifications((prev) => [...prev.filter((n) => n.type !== 'garden-dice'), ...diceNotifs])
    })
    return () => off(r, 'value', handler)
  }, [uid])

  // Plantas prontas pra vender (stage 5)
  useEffect(() => {
    if (!uid) return
    const r = ref(db, `couples/${coupleId}/garden/plants`)
    const handler = onValue(r, (snap) => {
      const data = (snap.val() ?? {}) as Record<string, PlantData>
      const ready = Object.values(data).filter((p) => p.stage >= 5)
      const sellNotifs: AppNotification[] = ready.map((p) => ({
        id: `garden-sell-${p.id}`,
        type: 'garden-sell' as const,
        message: `${p.flowerType} floriu e está pronta pra vender`,
      }))
      setNotifications((prev) => [...prev.filter((n) => n.type !== 'garden-sell'), ...sellNotifs])
    })
    return () => off(r, 'value', handler)
  }, [uid])

  // Datas especiais + eventos do calendário — unificados, agrupados por dia
  useEffect(() => {
    if (!uid || !partnerUid) return

    // carrega ids já vistos do Firebase
    const seenRef = dbRef(db, `users/${uid}/seenCalendarNotifs`)
    let seenIds = new Set<string>()

    const run = (
      dates: SpecialDates,
      calendarData: Record<
        string,
        { entries?: Record<string, { text: string; time: string | null; createdBy: string }> }
      >
    ) => {
      const now = new Date()
      now.setHours(0, 0, 0, 0)

      // monta mapa de dias com eventos: { dateKey: string[] }
      const dayEvents: Record<string, string[]> = {}

      // 1. datas especiais
      const allDates = getAvailableDates(dates, uid, partnerUid, myNick, partnerNick)
      allDates.forEach((d) => {
        const parts = d.mmdd.split('-')
        if (parts.length < 2) return
        const dd = parseInt(parts[0], 10)
        const mm = parseInt(parts[1], 10)
        if (isNaN(dd) || isNaN(mm)) return

        for (let offset = 0; offset <= 3; offset++) {
          const target = new Date(now)
          target.setDate(now.getDate() + offset)
          if (target.getMonth() + 1 === mm && target.getDate() === dd) {
            const dateKey = target.toLocaleDateString('en-CA')
            if (!dayEvents[dateKey]) dayEvents[dateKey] = []
            dayEvents[dateKey].push(d.label.toLowerCase())
          }
        }
      })

      // 2. eventos do calendário (próximos 3 dias)
      for (let offset = 0; offset <= 3; offset++) {
        const target = new Date(now)
        target.setDate(now.getDate() + offset)
        const dateKey = target.toLocaleDateString('en-CA')
        const entries = calendarData[dateKey]?.entries ?? {}
        Object.values(entries).forEach((entry) => {
          if (!dayEvents[dateKey]) dayEvents[dateKey] = []
          dayEvents[dateKey].push(entry.text.toLowerCase())
        })
      }

      // monta notificações agrupadas por dia
      const calendarNotifs: AppNotification[] = []

      Object.entries(dayEvents).forEach(([dateKey, texts]) => {
        if (texts.length === 0) return
        const unique = [...new Set(texts)]
        const target = new Date(dateKey + 'T00:00:00')
        const diffDays = Math.round((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

        let prefix = ''
        if (diffDays === 0) prefix = 'hoje'
        else if (diffDays === 1) prefix = 'amanhã'
        else prefix = `em ${diffDays} dias`

        const message = `${prefix}: ${unique.join(', ')}`
        const notifId = `calendar-event-${dateKey}`

        if (seenIds.has(notifId)) return

        calendarNotifs.push({
          id: notifId,
          type: 'calendar-event',
          message,
          dismissible: true,
        })

        // toca som só para hoje/amanhã
        if (diffDays <= 1 && !playedDates.current.has(notifId)) {
          playedDates.current.add(notifId)
          play()
        }
      })

      setNotifications((prev) => [
        ...prev.filter((n) => n.type !== 'calendar-event'),
        ...calendarNotifs,
      ])
    }

    // carrega seenIds primeiro, depois assina
    let cleanupDates: (() => void) | null = null
    let cleanupCal: (() => void) | null = null
    let latestDates: SpecialDates | null = null
    let latestCalendar: Record<
      string,
      { entries?: Record<string, { text: string; time: string | null; createdBy: string }> }
    > = {}
    let destroyed = false

    dbGet(seenRef).then((snap) => {
      if (destroyed) return
      const val = (snap.val() ?? {}) as Record<string, boolean>
      seenIds = new Set(Object.keys(val).filter((k) => val[k]))

      cleanupDates = subscribeSpecialDates(coupleId, (dates: SpecialDates | null) => {
        latestDates = dates ?? ({} as unknown as SpecialDates)
        run(latestDates, latestCalendar)
      })

      const calRef = dbRef(db, `couples/${coupleId}/calendar`)
      const calHandler = dbOnValue(calRef, (snap) => {
        latestCalendar = (snap.val() ?? {}) as typeof latestCalendar
        run(latestDates ?? ({} as unknown as SpecialDates), latestCalendar)
      })
      cleanupCal = () => dbOff(calRef, 'value', calHandler)
    })

    return () => {
      destroyed = true
      cleanupDates?.()
      cleanupCal?.()
    }
  }, [uid, partnerUid, myNick, partnerNick, play])

  useEffect(() => {
    const unsub = subscribeWeeklyPending(
      coupleId,
      (pending: { requestedBy: string; requestedByNick: string } | null) => {
        if (!pending || pending.requestedBy === uid) {
          setNotifications((prev) => prev.filter((n) => n.type !== 'weekly-sorteo'))
          return
        }
        const notif: AppNotification = {
          id: 'weekly-sorteo-pending',
          type: 'weekly-sorteo',
          message: `${pending.requestedByNick} quer sortear a meta da semana — abra o painel da streak pra confirmar`,
          dismissible: false,
        }
        setNotifications((prev) => [...prev.filter((n) => n.type !== 'weekly-sorteo'), notif])
      }
    )
    return unsub
  }, [uid])

  useEffect(() => {
    if (!uid) return
    const r = dbRef(db, `couples/${coupleId}/cards/lastActivityCompleted`)
    const handler = dbOnValue(r, async (snap) => {
      const data = snap.val() as {
        id: string
        name: string
        completedBy: string
        completedAt: number
      } | null
      if (!data || data.completedBy === uid) {
        setNotifications((prev) => prev.filter((n) => n.type !== 'activity-completed'))
        return
      }
      const notifId = `activity-completed-${data.id}`
      const seenSnap = await dbGet(dbRef(db, `users/${uid}/seenActivityNotifs/${notifId}`))
      if (seenSnap.val() === true) {
        setNotifications((prev) => prev.filter((n) => n.type !== 'activity-completed'))
        return
      }
      const notif: AppNotification = {
        id: notifId,
        type: 'activity-completed',
        message: `"${data.name}" foi confirmada — vocês ganharam a recompensa!`,
        dismissible: true,
      }
      setNotifications((prev) => [...prev.filter((n) => n.type !== 'activity-completed'), notif])
    })
    return () => dbOff(r, 'value', handler)
  }, [uid, coupleId])

  useEffect(() => {
    if (!uid) return
    const r = dbRef(db, `couples/${coupleId}/cards/lastTradeEvent`)
    const handler = dbOnValue(r, async (snap) => {
      const data = snap.val() as {
        id: string
        tradeId: string
        type: 'request' | 'countered' | 'accepted' | 'declined'
        actorUid: string
        createdAt: number
      } | null

      if (!data || data.actorUid === uid) {
        setNotifications((prev) => prev.filter((n) => !n.type.startsWith('card-trade-')))
        return
      }

      const notifId = `card-trade-${data.id}`
      const seenSnap = await dbGet(dbRef(db, `users/${uid}/seenTradeNotifs/${notifId}`))
      if (seenSnap.val() === true) {
        setNotifications((prev) => prev.filter((n) => !n.type.startsWith('card-trade-')))
        return
      }

      const messages: Record<typeof data.type, string> = {
        request: `${partnerNick} propôs uma troca de cartas`,
        countered: `${partnerNick} ajustou a proposta de troca`,
        accepted: `a troca de cartas com ${partnerNick} foi aceita!`,
        declined: `${partnerNick} recusou a proposta de troca`,
      }

      const notif: AppNotification = {
        id: notifId,
        type: `card-trade-${data.type}` as AppNotification['type'],
        message: messages[data.type],
        dismissible: true,
      }
      setNotifications((prev) => [...prev.filter((n) => !n.type.startsWith('card-trade-')), notif])
    })
    return () => dbOff(r, 'value', handler)
  }, [uid, coupleId, partnerNick])

  // Filtra lidas
  const visible = notifications.filter((n) => !n.dismissible || !readIds.has(n.id))

  return { notifications: visible, dismiss }
}
