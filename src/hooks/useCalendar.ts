import { useState, useEffect, useCallback } from 'react'
import {
  subscribeCalendarDay,
  addCalendarEvent,
  removeCalendarEvent,
  getCalendarTheme,
  setCalendarTheme,
  CalendarEvent,
  CalendarTheme,
} from '../lib/calendar'

export default function useCalendar(coupleId: string, displayName: string) {
  const now = new Date()
  const [theme, setThemeState] = useState<CalendarTheme | null>(null)
  const [viewDate, setViewDate] = useState({ year: now.getFullYear(), month: now.getMonth() })
  const [dayEntries, setDayEntries] = useState<Record<string, CalendarEvent[]>>({})

  useEffect(() => {
    getCalendarTheme(coupleId).then(setThemeState)
  }, [])

  const subscribeDayEntries = useCallback((dateKey: string) => {
    return subscribeCalendarDay(coupleId, dateKey, (entries) => {
      setDayEntries((prev) => ({ ...prev, [dateKey]: entries }))
    })
  }, [])

  const addEvent = useCallback(
    async (dateKey: string, text: string, time: string | null) => {
      await addCalendarEvent(coupleId, dateKey, { text, time, createdBy: displayName })
    },
    [displayName]
  )

  const removeEvent = useCallback(async (dateKey: string, eventId: string) => {
    await removeCalendarEvent(coupleId, dateKey, eventId)
  }, [])

  const changeTheme = useCallback(
    async (t: CalendarTheme) => {
      setThemeState(t)
      await setCalendarTheme(coupleId, t)
    },
    [coupleId]
  )

  const goToPrevMonth = useCallback(() => {
    setViewDate((prev) => {
      if (prev.month === 0) return { year: prev.year - 1, month: 11 }
      return { year: prev.year, month: prev.month - 1 }
    })
  }, [])

  const goToNextMonth = useCallback(() => {
    setViewDate((prev) => {
      if (prev.month === 11) return { year: prev.year + 1, month: 0 }
      return { year: prev.year, month: prev.month + 1 }
    })
  }, [])

  const goToDate = useCallback((year: number, month: number) => {
    setViewDate({ year, month })
  }, [])

  return {
    theme,
    dayEntries,
    viewYear: viewDate.year,
    viewMonth: viewDate.month,
    subscribeDayEntries,
    addEvent,
    removeEvent,
    changeTheme,
    goToPrevMonth,
    goToNextMonth,
    goToDate,
  }
}
