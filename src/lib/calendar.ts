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

const CALENDAR_PATH = 'calendar'
const THEME_PATH = 'settings/calendarTheme'

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
  dateKey: string,
  callback: (entries: CalendarEvent[]) => void
) {
  const path = `${CALENDAR_PATH}/${dateKey}/entries`
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
  dateKey: string,
  event: Omit<CalendarEvent, 'id'>
): Promise<void> {
  const path = `${CALENDAR_PATH}/${dateKey}/entries`
  await push(ref(db, path), event)
}

export async function addCalendarEventReturningId(
  dateKey: string,
  event: Omit<CalendarEvent, 'id'>
): Promise<string | null> {
  const path = `${CALENDAR_PATH}/${dateKey}/entries`
  const result = await push(ref(db, path), event)
  return result.key
}

export async function moveCalendarEvent(
  oldDateKey: string,
  oldEventId: string,
  newDateKey: string,
  event: Omit<CalendarEvent, 'id'>
): Promise<string | null> {
  await remove(ref(db, `${CALENDAR_PATH}/${oldDateKey}/entries/${oldEventId}`))
  const result = await push(ref(db, `${CALENDAR_PATH}/${newDateKey}/entries`), event)
  return result.key
}

export async function removeCalendarEvent(dateKey: string, eventId: string): Promise<void> {
  await remove(ref(db, `${CALENDAR_PATH}/${dateKey}/entries/${eventId}`))
}

export async function getCalendarTheme(): Promise<CalendarTheme> {
  const snap = await get(ref(db, THEME_PATH))
  return (snap.val() as CalendarTheme) ?? 'rosa'
}

export async function setCalendarTheme(theme: CalendarTheme): Promise<void> {
  await set(ref(db, THEME_PATH), theme)
}
