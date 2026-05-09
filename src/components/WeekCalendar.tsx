import { useState, useEffect, useRef } from 'react'
import useCalendar from '../hooks/useCalendar'
import { THEME_COLORS, DAY_NAMES, MONTH_NAMES, CalendarTheme, toDateKey } from '../lib/calendar'
import WeekCalendarModal from './WeekCalendarModal'
import { subscribeAllCycles } from '../lib/cycle'
import type { CycleData } from '../lib/cycle'
import { Pin, X } from 'lucide-react'

const THEME_OPTIONS: { key: CalendarTheme; label: string }[] = [
  { key: 'rosa', label: 'rosa' },
  { key: 'tulipa', label: 'tulipa' },
  { key: 'margarida', label: 'margarida' },
  { key: 'girassol', label: 'girassol' },
  { key: 'orquidea', label: 'orquídea' },
  { key: 'especial', label: 'especial' },
]

import type { CalendarEvent } from '../lib/calendar'

interface Props {
  displayName: string
  isNana: boolean
  onClose: () => void
  onPinToBoard: (entry: CalendarEvent, dateKey: string) => void
  onOpenCycleModal: () => void
  onPinCycleToBoard: () => void
}

export default function WeekCalendar({
  displayName,
  isNana,
  onClose,
  onPinToBoard,
  onOpenCycleModal,
  onPinCycleToBoard,
}: Props) {
  const {
    theme,
    dayEntries,
    viewYear,
    viewMonth,
    subscribeDayEntries,
    addEvent,
    removeEvent,
    changeTheme,
    goToPrevMonth,
    goToNextMonth,
    goToDate,
  } = useCalendar(displayName)

  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null)
  const [showThemePicker, setShowThemePicker] = useState(false)
  const [themePickerPos, setThemePickerPos] = useState({ top: 0, right: 0 })
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [pickerYear, setPickerYear] = useState(viewYear)
  const [datePickerPos, setDatePickerPos] = useState({ top: 0, left: 0 })
  const dateButtonRef = useRef<HTMLButtonElement>(null)
  const themeButtonRef = useRef<HTMLButtonElement>(null)

  const [allCycles, setAllCycles] = useState<Record<string, CycleData>>({})

  useEffect(() => {
    const unsub = subscribeAllCycles(setAllCycles)
    return unsub
  }, [])

  const t = theme ? THEME_COLORS[theme] : null

  function getCycleDayState(dateKey: string): 'tpm' | 'active' | null {
    const found = Object.values(allCycles).find((cycle) => {
      const tpmStart = cycle.tpmStart
      const endDate = cycle.actualEndDate ?? cycle.endDate
      const predictedDate = cycle.predictedDate
      if (cycle.confirmedDate) {
        return dateKey >= tpmStart && dateKey <= endDate
      }
      return dateKey >= tpmStart && dateKey <= predictedDate
    })
    if (!found) return null
    if (found.confirmedDate) {
      const endDate = found.actualEndDate ?? found.endDate
      if (dateKey >= found.confirmedDate && dateKey <= endDate) return 'active'
      if (dateKey >= found.tpmStart && dateKey < found.confirmedDate) return 'tpm'
    }
    return 'tpm'
  }

  const today = new Date()
  const todayKey = toDateKey(today.getFullYear(), today.getMonth(), today.getDate())

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const firstWeekday = new Date(viewYear, viewMonth, 1).getDay()

  useEffect(() => {
    const unsubs: (() => void)[] = []
    Array.from({ length: daysInMonth }, (_, i) => {
      const key = toDateKey(viewYear, viewMonth, i + 1)
      unsubs.push(subscribeDayEntries(key))
    })
    return () => unsubs.forEach((u) => u())
  }, [viewYear, viewMonth, daysInMonth, subscribeDayEntries])

  if (!t) return null

  const cells: (number | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  const selectedEntries = selectedDateKey ? (dayEntries[selectedDateKey] ?? []) : []

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(26,42,26,0.65)' }}
      onClick={onClose}
    >
      <div
        className="relative shadow-2xl flex flex-col"
        style={{
          width: '92vw',
          maxWidth: 900,
          maxHeight: 680,
          height: '90vh',
          borderRadius: 17,
          paddingTop: 6,
          background:
            'linear-gradient(160deg, rgba(253,246,240,0.97) 0%, rgba(252,232,238,0.97) 100%)',
          border: '1.5px solid rgba(232,160,176,0.4)',
          boxShadow: '0 8px 40px rgba(200,120,140,0.2), inset 0 1px 0 rgba(255,255,255,0.6)',
          backdropFilter: 'blur(18px) saturate(1.4)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── HEADER ── */}
        <div
          className="relative z-10 flex items-center justify-between px-10 shrink-0"
          style={{ borderBottom: `2px dashed ${t.border}`, padding: '10px 20px' }}
        >
          <div className="flex items-center gap-4">
            <button
              className="flex items-center justify-center text-2xl font-bold hover:opacity-70 transition-opacity"
              style={{ color: t.accent, padding: '0 8px' }}
              onClick={goToPrevMonth}
            >
              ‹
            </button>

            <div className="relative">
              <button
                ref={dateButtonRef}
                className="text-2xl font-bold min-w-56 text-center hover:opacity-70 transition-opacity"
                style={{ fontFamily: 'Baloo 2, sans-serif', color: t.accent }}
                onClick={() => {
                  if (dateButtonRef.current) {
                    const rect = dateButtonRef.current.getBoundingClientRect()
                    setDatePickerPos({ top: rect.bottom + 8, left: rect.left })
                  }
                  setPickerYear(viewYear)
                  setShowDatePicker((v) => !v)
                }}
              >
                {MONTH_NAMES[viewMonth]} {viewYear} ▾
              </button>
            </div>

            <button
              className="flex items-center justify-center text-2xl font-bold hover:opacity-70 transition-opacity"
              style={{ color: t.accent, padding: '0 8px' }}
              onClick={goToNextMonth}
            >
              ›
            </button>
          </div>

          <div className="flex items-center gap-3">
            {isNana && (
              <button
                className="text-sm font-bold hover:opacity-80 transition-opacity"
                style={{
                  background: `${t.accent}18`,
                  border: 'none',
                  borderRadius: 10,
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  padding: 0,
                }}
                onClick={(e) => {
                  e.stopPropagation()
                  onOpenCycleModal()
                }}
                title="eii coisas de garotas aqui, pode ir saindo!"
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#c87090"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z" />
                </svg>
              </button>
            )}

            {isNana && (
              <button
                className="hover:opacity-80 transition-opacity"
                style={{
                  background: `${t.accent}18`,
                  border: 'none',
                  borderRadius: 10,
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  padding: 0,
                }}
                onClick={(e) => {
                  e.stopPropagation()
                  onPinCycleToBoard()
                }}
                title="fixar ciclo no mural"
              >
                <Pin size={15} color="#c87090" strokeWidth={2} />
              </button>
            )}

            <button
              ref={themeButtonRef}
              className="hover:opacity-80 transition-opacity"
              style={{
                background: `${t.accent}18`,
                border: 'none',
                borderRadius: 10,
                width: 32,
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                padding: 0,
              }}
              onClick={() => {
                if (themeButtonRef.current) {
                  const rect = themeButtonRef.current.getBoundingClientRect()
                  setThemePickerPos({ top: rect.bottom + 8, right: window.innerWidth - rect.right })
                }
                setShowThemePicker((v) => !v)
              }}
              title="tema"
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke={t.accent}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="13.5" cy="6.5" r=".5" fill={t.accent} />
                <circle cx="17.5" cy="10.5" r=".5" fill={t.accent} />
                <circle cx="8.5" cy="7.5" r=".5" fill={t.accent} />
                <circle cx="6.5" cy="12.5" r=".5" fill={t.accent} />
                <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
              </svg>
            </button>

            <button
              onClick={onClose}
              style={{
                background: 'rgba(200,120,140,0.15)',
                border: 'none',
                borderRadius: '50%',
                width: 28,
                height: 28,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                padding: 0,
              }}
            >
              <X size={13} color="rgba(122,48,64,0.7)" strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* ── CABEÇALHO DIAS DA SEMANA ── */}
        <div
          className="relative z-10 grid grid-cols-7 shrink-0"
          style={{ padding: '16px 24px 8px', gap: '8px' }}
        >
          {DAY_NAMES.map((name) => (
            <div
              key={name}
              className="text-center text-xs font-bold uppercase tracking-widest"
              style={{ fontFamily: 'Baloo 2, sans-serif', color: t.accent, opacity: 0.55 }}
            >
              {name}
            </div>
          ))}
        </div>

        {/* ── GRID DE DIAS ── */}
        {/* ── GRID DE DIAS ── */}
        <style>{`
          .cal-scroll::-webkit-scrollbar { width: 4px; }
          .cal-scroll::-webkit-scrollbar-track { background: transparent; }
          .cal-scroll::-webkit-scrollbar-thumb { background: rgba(232,160,176,0.4); border-radius: 99px; }
          .cal-scroll::-webkit-scrollbar-thumb:hover { background: rgba(232,160,176,0.7); }
        `}</style>
        <div
          className="relative z-10 flex-1 overflow-y-auto cal-scroll"
          style={{ padding: '0 24px 24px' }}
        >
          <div className="grid grid-cols-7" style={{ gap: '8px' }}>
            {cells.map((day, idx) => {
              if (day === null) {
                return <div key={`empty-${idx}`} style={{ minHeight: 100, maxHeight: 100 }} />
              }

              const dateKey = toDateKey(viewYear, viewMonth, day)
              const isToday = dateKey === todayKey
              const entries = dayEntries[dateKey] ?? []
              const cycleState = getCycleDayState(dateKey)

              return (
                <button
                  key={dateKey}
                  className="flex flex-col rounded-2xl text-left transition-all hover:scale-[1.03] hover:shadow-md active:scale-95 overflow-hidden"
                  style={{
                    background:
                      cycleState === 'active'
                        ? '#fce8ee'
                        : cycleState === 'tpm'
                          ? '#f5eaf0'
                          : isToday
                            ? `${t.accent}28`
                            : `${t.accent}0d`,
                    border: isToday
                      ? `2px solid ${t.accent}`
                      : cycleState === 'active'
                        ? '1.5px solid #e8a0b0'
                        : cycleState === 'tpm'
                          ? '1.5px solid #c9a0d4'
                          : `1.5px dashed ${t.border}`,
                    minHeight: 100,
                    maxHeight: 100,
                    overflow: 'hidden',
                    padding: '10px 12px',
                    fontFamily: 'Baloo 2, sans-serif',
                    cursor: 'pointer',
                  }}
                  onClick={() => setSelectedDateKey(dateKey)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6 }}>
                    <span
                      className="text-sm font-bold"
                      style={{ color: isToday ? t.accent : t.text, paddingLeft: 2 }}
                    >
                      {day}
                    </span>
                    {cycleState === 'active' && (
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="#D94F4F"
                        stroke="#D94F4F"
                        strokeWidth="1"
                      >
                        <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z" />
                      </svg>
                    )}
                    {cycleState === 'tpm' && (
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#9B7FD4"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M20 16.2A4.5 4.5 0 0 0 17.5 8h-1.8A7 7 0 1 0 4 14.9" />
                        <path d="M16 14v2" />
                        <path d="M8 14v2" />
                        <path d="M12 16v2" />
                      </svg>
                    )}
                  </div>

                  <div className="flex flex-col w-full" style={{ gap: 3 }}>
                    {entries.slice(0, 2).map((entry) => (
                      <div
                        key={entry.id}
                        className="rounded-md truncate"
                        style={{
                          background: `${t.accent}28`,
                          color: t.text,
                          fontSize: 10,
                          fontFamily: 'Baloo 2, sans-serif',
                          padding: '2px 6px',
                        }}
                      >
                        {entry.time && (
                          <span className="font-bold" style={{ color: t.accent, marginRight: 6 }}>
                            {entry.time}
                          </span>
                        )}
                        {entry.text}
                      </div>
                    ))}
                    {entries.length > 2 && (
                      <div style={{ fontSize: 10, color: t.accent, paddingLeft: 4 }}>
                        +{entries.length - 2} mais
                      </div>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {showDatePicker && (
        <div
          className="fixed flex flex-col rounded-2xl"
          onClick={(e) => e.stopPropagation()}
          style={{
            top: datePickerPos.top,
            left: datePickerPos.left,
            background:
              'linear-gradient(160deg, rgba(253,246,240,0.98) 0%, rgba(252,232,238,0.98) 100%)',
            border: '1.5px solid rgba(232,160,176,0.4)',
            boxShadow: '0 8px 40px rgba(200,120,140,0.2)',
            backdropFilter: 'blur(18px)',
            zIndex: 9999,
            padding: '16px',
            minWidth: 280,
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <button
              className="text-lg font-bold hover:opacity-70"
              style={{ color: t.accent, padding: '0 8px' }}
              onClick={() => setPickerYear((y) => y - 1)}
            >
              ‹
            </button>
            <span
              className="font-bold text-lg"
              style={{ fontFamily: 'Baloo 2, sans-serif', color: t.accent }}
            >
              {pickerYear}
            </span>
            <button
              className="text-lg font-bold hover:opacity-70"
              style={{ color: t.accent, padding: '0 8px' }}
              onClick={() => setPickerYear((y) => y + 1)}
            >
              ›
            </button>
          </div>

          <div className="grid grid-cols-3" style={{ gap: 6 }}>
            {MONTH_NAMES.map((name, i) => {
              const isSelected = i === viewMonth && pickerYear === viewYear
              return (
                <button
                  key={name}
                  className="rounded-xl text-sm font-bold hover:opacity-80 transition-opacity"
                  style={{
                    fontFamily: 'Baloo 2, sans-serif',
                    background: isSelected ? t.accent : `${t.accent}18`,
                    color: isSelected ? '#fff' : t.text,
                    padding: '8px 4px',
                  }}
                  onClick={() => {
                    goToDate(pickerYear, i)
                    setShowDatePicker(false)
                  }}
                >
                  {name.slice(0, 3)}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {showThemePicker && (
        <div
          className="fixed flex flex-col rounded-2xl"
          onClick={(e) => e.stopPropagation()}
          style={{
            top: themePickerPos.top,
            right: themePickerPos.right,
            background:
              'linear-gradient(160deg, rgba(253,246,240,0.98) 0%, rgba(252,232,238,0.98) 100%)',
            border: '1.5px solid rgba(232,160,176,0.4)',
            minWidth: 180,
            padding: '10px 8px',
            gap: 4,
            boxShadow: '0 8px 40px rgba(200,120,140,0.2)',
            backdropFilter: 'blur(18px)',
            zIndex: 9999,
          }}
        >
          {THEME_OPTIONS.map(({ key, label }) => (
            <button
              key={key}
              className="rounded-xl text-sm font-bold text-left hover:opacity-80 transition-opacity"
              style={{
                fontFamily: 'Baloo 2, sans-serif',
                background: theme === key ? `${THEME_COLORS[key].accent}33` : 'transparent',
                color: THEME_COLORS[key].accent,
                padding: '8px 14px',
              }}
              onClick={(e) => {
                e.stopPropagation()
                changeTheme(key)
                setShowThemePicker(false)
              }}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {selectedDateKey !== null && (
        <WeekCalendarModal
          dateKey={selectedDateKey}
          entries={selectedEntries}
          theme={theme!}
          onClose={() => setSelectedDateKey(null)}
          onAdd={(text, time) => addEvent(selectedDateKey, text, time)}
          onRemove={(id) => removeEvent(selectedDateKey, id)}
          onPinToBoard={onPinToBoard}
          onPinCycleToBoard={() => {
            onPinCycleToBoard()
            setSelectedDateKey(null)
          }}
          isNana={isNana}
          currentUser={displayName}
        />
      )}
    </div>
  )
}
