import { ref, set, onValue, off } from 'firebase/database'
import { db } from './firebase'

export interface SpecialDates {
  birthdayOf: Record<string, string> // { [uid]: 'DD-MM' }
  anniversary: string
  metDate: string
  datingDate: string
}

export const EMPTY_SPECIAL_DATES: SpecialDates = {
  birthdayOf: {},
  anniversary: '',
  metDate: '',
  datingDate: '',
}

export const DATE_LABELS: Record<string, string> = {
  anniversary: 'Aniversário do casal',
  metDate: 'Dia que se conheceram',
  datingDate: 'Início do namoro',
  christmas: 'Natal',
  valentines: 'Dia dos Namorados',
}

export const FIXED_DATES: Record<string, string> = {
  christmas: '25-12',
  valentines: '12-06',
}

export function saveSpecialDates(dates: SpecialDates) {
  return set(ref(db, 'specialDates'), dates)
}

export function subscribeSpecialDates(cb: (dates: SpecialDates) => void) {
  const r = ref(db, 'specialDates')
  onValue(r, (snap) => {
    const val = snap.val() as SpecialDates | null
    cb(val ?? EMPTY_SPECIAL_DATES)
  })
  return () => off(r)
}

export function getAvailableDates(
  dates: SpecialDates,
  myUid: string,
  partnerUid: string,
  myNick: string,
  partnerNick: string
) {
  const result: { key: string; label: string; mmdd: string; dayOnly?: boolean }[] = []

  Object.entries(FIXED_DATES).forEach(([key, mmdd]) => {
    result.push({ key, label: DATE_LABELS[key], mmdd })
  })

  const birthdayOf = dates.birthdayOf ?? {}
  if (birthdayOf[myUid]) {
    result.push({
      key: `birthday-${myUid}`,
      label: `Aniversário de ${myNick}`,
      mmdd: birthdayOf[myUid],
    })
  }
  if (birthdayOf[partnerUid]) {
    result.push({
      key: `birthday-${partnerUid}`,
      label: `Aniversário de ${partnerNick}`,
      mmdd: birthdayOf[partnerUid],
    })
  }

  if (dates.anniversary?.length >= 5)
    result.push({
      key: 'anniversary',
      label: DATE_LABELS.anniversary,
      mmdd: dates.anniversary,
      dayOnly: true,
    })
  if (dates.metDate?.length >= 5)
    result.push({ key: 'metDate', label: DATE_LABELS.metDate, mmdd: dates.metDate, dayOnly: true })
  if (dates.datingDate?.length >= 5)
    result.push({
      key: 'datingDate',
      label: DATE_LABELS.datingDate,
      mmdd: dates.datingDate,
      dayOnly: true,
    })

  return result
}

export function isToday(ddmm: string) {
  if (!ddmm || ddmm.length < 5) return false
  const parts = ddmm.split('-')
  if (parts.length < 2) return false
  const dd = parts[0]
  const mm = parts[1]
  const now = new Date()
  const todayMm = String(now.getMonth() + 1).padStart(2, '0')
  const todayDd = String(now.getDate()).padStart(2, '0')
  return dd === todayDd && mm === todayMm
}

export function isTodayDay(ddmmaaaa: string) {
  if (!ddmmaaaa) return false
  const dd = parseInt(ddmmaaaa.split('-')[0], 10)
  const todayDd = new Date().getDate()
  return todayDd >= dd
}

export function formatMmdd(ddmm: string) {
  if (!ddmm || ddmm.length < 5) return ''
  const parts = ddmm.split('-')
  if (parts.length === 3) return `${parts[0]}/${parts[1]}/${parts[2]}`
  return `${parts[0]}/${parts[1]}`
}

// ── novo ──────────────────────────────────────────────
import type { CalendarEvent } from './calendar'

/**
 * Gera eventos virtuais de datas especiais para um ano inteiro.
 * IDs prefixados com "special::" para identificação no calendário.
 */
export function getSpecialDateEventsForYear(
  dates: SpecialDates,
  year: number,
  myUid: string,
  partnerUid: string,
  myNick: string,
  partnerNick: string
): Record<string, CalendarEvent[]> {
  const result: Record<string, CalendarEvent[]> = {}

  const allDates = getAvailableDates(dates, myUid, partnerUid, myNick, partnerNick)

  for (const item of allDates) {
    const parts = item.mmdd.split('-')
    if (parts.length < 2) continue

    const dd = parseInt(parts[0], 10)
    const mm = parseInt(parts[1], 10)
    if (isNaN(dd) || isNaN(mm)) continue

    // Para datas com ano (dayOnly = true), calcula anos decorridos
    let text = item.label.toLowerCase()
    if (item.dayOnly && parts.length === 3) {
      const originalYear = parseInt(parts[2], 10)
      if (!isNaN(originalYear) && year > originalYear) {
        const years = year - originalYear
        text = `${text} (${years} ${years === 1 ? 'ano' : 'anos'})`
      }
    }

    const dateKey = `${year}-${String(mm).padStart(2, '0')}-${String(dd).padStart(2, '0')}`

    if (!result[dateKey]) result[dateKey] = []
    result[dateKey].push({
      id: `special::${item.key}`,
      time: null,
      text,
      createdBy: 'especial',
    })
  }

  return result
}
