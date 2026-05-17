import { useEffect, useRef } from 'react'
import { ref, onValue, off } from 'firebase/database'
import { db } from '../lib/firebase'
import { AnyBoardItem } from '../types/board'

const BOARD_PATH = 'board/items'
const CALENDAR_PATH = 'calendar'

function notify(title: string, body: string) {
  if (!('Notification' in window)) return
  if (Notification.permission === 'granted') {
    // eslint-disable-next-line no-new
    new Notification(title, { body, silent: false })
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission().then((permission) => {
      if (permission === 'granted') {
        // eslint-disable-next-line no-new
        new Notification(title, { body, silent: false })
      }
    })
  }
}

const ITEM_TYPE_LABEL: Record<string, string> = {
  postit: 'um post-it',
  checklist: 'uma checklist',
  drawing: 'um desenho',
  tag: 'uma tag',
  letter: 'uma cartinha',
  'special-letter': 'uma carta especial',
  'custom-letter': 'uma carta especial',
}

export function useNotifications(uid: string, partnerUid: string, partnerName: string) {
  const knownBoardIds = useRef<Set<string> | null>(null)
  const knownCalendarIds = useRef<Set<string>>(new Set())
  const initialized = useRef(false)

  // notificações do mural
  useEffect(() => {
    if (!uid || !partnerUid) return
    const boardRef = ref(db, BOARD_PATH)

    const unsub = onValue(boardRef, (snap) => {
      const data = snap.val() as Record<string, AnyBoardItem> | null
      if (!data) return

      const remoteIds = new Set(Object.keys(data))

      // primeira carga — só registra os ids existentes, não notifica
      if (knownBoardIds.current === null) {
        knownBoardIds.current = remoteIds
        return
      }

      // detecta ids novos criados pelo parceiro
      remoteIds.forEach((id) => {
        if (knownBoardIds.current!.has(id)) return
        knownBoardIds.current!.add(id)
        const item = data[id]
        if (!item || item.createdBy === uid) return
        const typeLabel = ITEM_TYPE_LABEL[item.type] ?? 'algo novo'
        notify('leafnote 🌸', `${partnerName} adicionou ${typeLabel} no mural!`)
      })
    })

    return () => off(boardRef, 'value', unsub)
  }, [uid, partnerUid, partnerName])

  // notificações do calendário
  useEffect(() => {
    if (!partnerUid) return
    const calRef = ref(db, CALENDAR_PATH)

    const unsub = onValue(calRef, (snap) => {
      const data = snap.val() as Record<
        string,
        { entries?: Record<string, { createdBy: string }> }
      > | null
      if (!data) return

      if (!initialized.current) {
        // primeira carga — registra todos os ids existentes
        Object.values(data).forEach((day) => {
          Object.keys(day.entries ?? {}).forEach((id) => {
            knownCalendarIds.current.add(id)
          })
        })
        initialized.current = true
        return
      }

      // detecta eventos novos criados pelo parceiro
      Object.values(data).forEach((day) => {
        Object.entries(day.entries ?? {}).forEach(([id, entry]) => {
          if (knownCalendarIds.current.has(id)) return
          knownCalendarIds.current.add(id)
          if (entry.createdBy === partnerName) {
            notify('leafnote 🌸', `${partnerName} adicionou um evento no calendário!`)
          }
        })
      })
    })

    return () => off(calRef, 'value', unsub)
  }, [partnerUid, partnerName])
}
