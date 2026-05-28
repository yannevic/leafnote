import { ref, set, get, onValue, off, push, remove } from 'firebase/database'
import { db } from './firebase'

export type CalendarTheme = 'rosa' | 'tulipa' | 'margarida' | 'girassol' | 'orquidea' | 'especial'

export interface CalendarEvent {
  id: string
  time: string | null
  text: string
  createdBy: string
}

export const THEME_COLORS: Record<
  CalendarTheme,
  { bg: string; accent: string; text: string; border: string }
> = {
  rosa: { bg: '#fff0f5', accent: '#e8607a', text: '#7a2040', border: '#e8a0b0' },
  tulipa: { bg: '#fff5f0', accent: '#e87060', text: '#7a3020', border: '#e8b0a0' },
  margarida: { bg: '#fffff0', accent: '#c8b820', text: '#5a5000', border: '#d8d890' },
  girassol: { bg: '#fffaf0', accent: '#e8a820', text: '#7a5000', border: '#e8d090' },
  orquidea: { bg: '#f8f0ff', accent: '#a060c8', text: '#502080', border: '#c8a0e8' },
  especial: { bg: '#f0fff8', accent: '#40a880', text: '#205040', border: '#90d8c0' },
}

export const DAY_NAMES = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
export const MONTH_NAMES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
]

export function toDateKey(year: number, month: number, day: number): string {
  const mm = String(month + 1).padStart(2, '0')
  const dd = String(day).padStart(2, '0')
  return `${year}-${mm}-${dd}`
}

export function subscribeCalendarDay(
  coupleId: string,
  dateKey: string,
  callback: (entries: CalendarEvent[]) => void
) {
  const path = `couples/${coupleId}/calendar/${dateKey}/entries`
  const r = ref(db, path)
  onValue(r, (snap) => {
    const val = snap.val() as Record<string, Omit<CalendarEvent, 'id'>> | null
    if (!val) return callback([])
    const list = Object.entries(val).map(([id, entry]) => ({ ...entry, id }))
    list.sort((a, b) => {
      if (!a.time && !b.time) return 0
      if (!a.time) return 1
      if (!b.time) return -1
      return a.time.localeCompare(b.time)
    })
    callback(list)
  })
  return () => off(r, 'value')
}

export async function addCalendarEvent(
  coupleId: string,
  dateKey: string,
  event: Omit<CalendarEvent, 'id'>
): Promise<void> {
  const path = `couples/${coupleId}/calendar/${dateKey}/entries`
  await push(ref(db, path), event)
}

export async function addCalendarEventReturningId(
  coupleId: string,
  dateKey: string,
  event: Omit<CalendarEvent, 'id'>
): Promise<string | null> {
  const path = `couples/${coupleId}/calendar/${dateKey}/entries`
  const result = await push(ref(db, path), event)
  return result.key
}

export async function moveCalendarEvent(
  coupleId: string,
  oldDateKey: string,
  oldEventId: string,
  newDateKey: string,
  event: Omit<CalendarEvent, 'id'>
): Promise<string | null> {
  await remove(ref(db, `couples/${coupleId}/calendar/${oldDateKey}/entries/${oldEventId}`))
  const result = await push(ref(db, `couples/${coupleId}/calendar/${newDateKey}/entries`), event)
  return result.key
}

export async function removeCalendarEvent(
  coupleId: string,
  dateKey: string,
  eventId: string
): Promise<void> {
  await remove(ref(db, `couples/${coupleId}/calendar/${dateKey}/entries/${eventId}`))
}

export async function getCalendarTheme(coupleId: string): Promise<CalendarTheme> {
  const snap = await get(ref(db, `couples/${coupleId}/settings/calendarTheme`))
  return (snap.val() as CalendarTheme) ?? 'rosa'
}

export async function setCalendarTheme(coupleId: string, theme: CalendarTheme): Promise<void> {
  await set(ref(db, `couples/${coupleId}/settings/calendarTheme`), theme)
}
