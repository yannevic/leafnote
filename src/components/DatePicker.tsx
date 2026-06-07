import { useState, useRef, useEffect } from 'react'
import { CalendarDays, X, ChevronLeft, ChevronRight } from 'lucide-react'

interface DatePickerProps {
  value: string // "YYYY-MM-DD"
  onChange: (v: string) => void
  max?: string
  min?: string
  placeholder?: string
  label?: string
}

const MONTHS_PT = [
  'janeiro',
  'fevereiro',
  'março',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro',
]

const DAYS_PT = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']

export default function DatePicker({
  value,
  onChange,
  max,
  min,
  placeholder = 'selecionar data',
  label,
}: DatePickerProps) {
  const today = new Date()
  const parsed = value ? new Date(value + 'T00:00:00') : null

  const [open, setOpen] = useState(false)
  const [openUp, setOpenUp] = useState(false)
  const [viewYear, setViewYear] = useState(parsed?.getFullYear() ?? today.getFullYear())
  const [viewMonth, setViewMonth] = useState(parsed?.getMonth() ?? today.getMonth())
  const [mode, setMode] = useState<'days' | 'months' | 'years'>('days')

  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
        setMode('days')
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    if (parsed) {
      setViewYear(parsed.getFullYear())
      setViewMonth(parsed.getMonth())
    }
  }, [value])

  const handleOpen = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      setOpenUp(window.innerHeight - rect.bottom < 320)
    }
    setOpen((o) => !o)
    setMode('days')
  }

  const minDate = min ? new Date(min + 'T00:00:00') : null
  const maxDate = max ? new Date(max + 'T00:00:00') : null

  const isDisabled = (date: Date) => {
    if (minDate && date < minDate) return true
    if (maxDate && date > maxDate) return true
    return false
  }

  const isToday = (date: Date) =>
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()

  const isSelected = (date: Date) =>
    !!parsed &&
    date.getDate() === parsed.getDate() &&
    date.getMonth() === parsed.getMonth() &&
    date.getFullYear() === parsed.getFullYear()

  const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate()
  const getFirstDayOfMonth = (y: number, m: number) => new Date(y, m, 1).getDay()

  const handleDayClick = (day: number) => {
    const mm = String(viewMonth + 1).padStart(2, '0')
    const dd = String(day).padStart(2, '0')
    const dateStr = `${viewYear}-${mm}-${dd}`
    if (!isDisabled(new Date(`${dateStr}T00:00:00`))) {
      onChange(dateStr)
      setOpen(false)
      setMode('days')
    }
  }

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11)
      setViewYear((y) => y - 1)
    } else setViewMonth((m) => m - 1)
  }

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0)
      setViewYear((y) => y + 1)
    } else setViewMonth((m) => m + 1)
  }

  const formatDisplay = () => {
    if (!parsed) return ''
    const dd = String(parsed.getDate()).padStart(2, '0')
    const mm = String(parsed.getMonth() + 1).padStart(2, '0')
    return `${dd}/${mm}/${parsed.getFullYear()}`
  }

  const daysInMonth = getDaysInMonth(viewYear, viewMonth)
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth)
  const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7
  const yearStart = Math.floor(viewYear / 12) * 12

  const navBtnStyle: React.CSSProperties = {
    width: 28,
    height: 28,
    borderRadius: 8,
    border: 'none',
    background: 'rgba(200,120,140,0.12)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    transition: 'background 0.15s',
  }

  const headerChipStyle: React.CSSProperties = {
    border: 'none',
    borderRadius: 8,
    padding: '3px 10px',
    background: 'rgba(232,160,176,0.15)',
    color: '#3d1a10',
    fontSize: 11,
    fontFamily: 'Baloo 2, sans-serif',
    fontWeight: 800,
    cursor: 'pointer',
    transition: 'background 0.15s',
    textTransform: 'lowercase' as const,
  }

  return (
    <div
      ref={containerRef}
      style={{ position: 'relative', width: '100%', fontFamily: 'Baloo 2, sans-serif' }}
    >
      {label && (
        <span
          style={{
            fontSize: 9,
            fontWeight: 800,
            color: 'rgba(122,48,64,0.55)',
            textTransform: 'uppercase',
            letterSpacing: '0.8px',
            marginBottom: 4,
            display: 'block',
          }}
        >
          {label}
        </span>
      )}

      {/* Trigger */}
      <button
        ref={triggerRef}
        type="button"
        onClick={handleOpen}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '7px 10px',
          borderRadius: 10,
          border: open ? '1.5px solid rgba(232,160,176,0.7)' : '1.5px solid rgba(232,160,176,0.3)',
          background: 'rgba(253,242,246,0.7)',
          color: parsed ? '#3d1a10' : 'rgba(61,26,16,0.35)',
          fontSize: 12,
          fontWeight: 600,
          fontFamily: 'Baloo 2, sans-serif',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
          boxSizing: 'border-box',
          boxShadow: open ? '0 0 0 3px rgba(232,160,176,0.15)' : 'none',
          outline: 'none',
        }}
      >
        <CalendarDays size={13} strokeWidth={2} color="rgba(122,48,64,0.5)" />
        <span style={{ flex: 1, textAlign: 'left' }}>{parsed ? formatDisplay() : placeholder}</span>
        {parsed && (
          <span
            onClick={(e) => {
              e.stopPropagation()
              onChange('')
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 16,
              height: 16,
              borderRadius: '50%',
              background: 'rgba(200,120,140,0.15)',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            <X size={9} strokeWidth={2.5} color="rgba(122,48,64,0.6)" />
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div
          style={{
            position: 'fixed',
            top: (() => {
              if (!triggerRef.current) return 0
              const rect = triggerRef.current.getBoundingClientRect()
              return openUp ? rect.top - 6 - 320 : rect.bottom + 6
            })(),
            left: (() => {
              if (!triggerRef.current) return 0
              return triggerRef.current.getBoundingClientRect().left
            })(),
            zIndex: 9999,
            background:
              'linear-gradient(160deg, rgba(253,246,240,0.99) 0%, rgba(252,232,238,0.99) 100%)',
            backdropFilter: 'blur(18px) saturate(1.4)',
            border: '1.5px solid rgba(232,160,176,0.4)',
            borderRadius: 16,
            padding: 12,
            width: 256,
            boxShadow: '0 8px 40px rgba(200,120,140,0.2), inset 0 1px 0 rgba(255,255,255,0.6)',
            animation: 'dpFadeIn 0.15s ease',
          }}
        >
          <style>{`
              @keyframes dpFadeIn {
                from { opacity: 0; transform: translateY(${openUp ? '4px' : '-4px'}) scale(0.98); }
                to   { opacity: 1; transform: translateY(0) scale(1); }
              }
              .dp-day { transition: background 0.12s; }
              .dp-day:hover:not(:disabled) { background: rgba(232,160,176,0.2) !important; }
              .dp-day-sel { background: rgba(232,160,176,0.55) !important; color: #3d1a10 !important; font-weight: 800 !important; }
              .dp-day-today:not(.dp-day-sel) { border: 1.5px solid rgba(232,160,176,0.6) !important; color: #7a3040 !important; font-weight: 800 !important; }
              .dp-chip:hover { background: rgba(232,160,176,0.2) !important; }
              .dp-chip-sel { background: rgba(232,160,176,0.55) !important; color: #3d1a10 !important; font-weight: 800 !important; }
              .dp-nav:hover { background: rgba(200,120,140,0.22) !important; }
              .dp-hoje:hover { background: rgba(232,160,176,0.25) !important; }
            `}</style>

          {/* Header navegação */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 10,
            }}
          >
            <button
              type="button"
              className="dp-nav"
              onClick={() => {
                if (mode === 'days') prevMonth()
                else if (mode === 'years') setViewYear((y) => y - 12)
              }}
              style={navBtnStyle}
            >
              <ChevronLeft size={13} strokeWidth={2.5} color="rgba(122,48,64,0.7)" />
            </button>

            <div style={{ display: 'flex', gap: 5 }}>
              {mode !== 'months' && (
                <button
                  type="button"
                  onClick={() => setMode((m) => (m === 'months' ? 'days' : 'months'))}
                  style={headerChipStyle}
                >
                  {MONTHS_PT[viewMonth].slice(0, 3)}
                </button>
              )}
              <button
                type="button"
                onClick={() => setMode((m) => (m === 'years' ? 'days' : 'years'))}
                style={headerChipStyle}
              >
                {mode === 'years' ? `${yearStart}–${yearStart + 11}` : viewYear}
              </button>
            </div>

            <button
              type="button"
              className="dp-nav"
              onClick={() => {
                if (mode === 'days') nextMonth()
                else if (mode === 'years') setViewYear((y) => y + 12)
              }}
              style={navBtnStyle}
            >
              <ChevronRight size={13} strokeWidth={2.5} color="rgba(122,48,64,0.7)" />
            </button>
          </div>

          {/* Modo: dias */}
          {mode === 'days' && (
            <>
              <div
                style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 3 }}
              >
                {DAYS_PT.map((d, i) => (
                  <div
                    key={i}
                    style={{
                      textAlign: 'center',
                      fontSize: 9,
                      fontWeight: 800,
                      color: 'rgba(122,48,64,0.4)',
                      padding: '2px 0',
                      letterSpacing: '0.05em',
                    }}
                  >
                    {d}
                  </div>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
                {Array.from({ length: totalCells }).map((_, i) => {
                  const day = i - firstDay + 1
                  if (day < 1 || day > daysInMonth) return <div key={i} />
                  const date = new Date(viewYear, viewMonth, day)
                  const disabled = isDisabled(date)
                  const sel = isSelected(date)
                  const tod = isToday(date)
                  return (
                    <button
                      key={i}
                      type="button"
                      className={`dp-day${sel ? ' dp-day-sel' : ''}${tod ? ' dp-day-today' : ''}`}
                      onClick={() => handleDayClick(day)}
                      disabled={disabled}
                      style={{
                        width: '100%',
                        aspectRatio: '1',
                        border: '1.5px solid transparent',
                        borderRadius: 8,
                        background: 'transparent',
                        color: disabled ? 'rgba(61,26,16,0.2)' : '#3d1a10',
                        fontSize: 11,
                        fontFamily: 'Baloo 2, sans-serif',
                        fontWeight: 600,
                        cursor: disabled ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 0,
                      }}
                    >
                      {day}
                    </button>
                  )
                })}
              </div>
            </>
          )}

          {/* Modo: meses */}
          {mode === 'months' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 5 }}>
              {MONTHS_PT.map((m, i) => (
                <button
                  key={i}
                  type="button"
                  className={`dp-chip${i === viewMonth ? ' dp-chip-sel' : ''}`}
                  onClick={() => {
                    setViewMonth(i)
                    setMode('days')
                  }}
                  style={{
                    border: 'none',
                    borderRadius: 10,
                    padding: '7px 4px',
                    background: 'rgba(232,160,176,0.1)',
                    color: '#3d1a10',
                    fontSize: 10,
                    fontFamily: 'Baloo 2, sans-serif',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'background 0.12s',
                  }}
                >
                  {m.slice(0, 3)}
                </button>
              ))}
            </div>
          )}

          {/* Modo: anos */}
          {mode === 'years' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 5 }}>
              {Array.from({ length: 12 }).map((_, i) => {
                const yr = yearStart + i
                return (
                  <button
                    key={yr}
                    type="button"
                    className={`dp-chip${yr === viewYear ? ' dp-chip-sel' : ''}`}
                    onClick={() => {
                      setViewYear(yr)
                      setMode('days')
                    }}
                    style={{
                      border: 'none',
                      borderRadius: 10,
                      padding: '7px 2px',
                      background: 'rgba(232,160,176,0.1)',
                      color: '#3d1a10',
                      fontSize: 10,
                      fontFamily: 'Baloo 2, sans-serif',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'background 0.12s',
                    }}
                  >
                    {yr}
                  </button>
                )
              })}
            </div>
          )}

          {/* Botão hoje */}
          {mode === 'days' && (
            <div style={{ marginTop: 8, display: 'flex', justifyContent: 'center' }}>
              <button
                type="button"
                className="dp-hoje"
                onClick={() => {
                  const yr = today.getFullYear()
                  const mm = String(today.getMonth() + 1).padStart(2, '0')
                  const dd = String(today.getDate()).padStart(2, '0')
                  const dateStr = `${yr}-${mm}-${dd}`
                  if (!isDisabled(new Date(`${dateStr}T00:00:00`))) {
                    onChange(dateStr)
                    setOpen(false)
                  } else {
                    setViewYear(yr)
                    setViewMonth(today.getMonth())
                  }
                }}
                style={{
                  background: 'rgba(232,160,176,0.15)',
                  border: '1.5px solid rgba(232,160,176,0.35)',
                  borderRadius: 8,
                  padding: '3px 16px',
                  color: 'rgba(122,48,64,0.8)',
                  fontSize: 10,
                  fontFamily: 'Baloo 2, sans-serif',
                  fontWeight: 800,
                  cursor: 'pointer',
                  transition: 'background 0.12s',
                  textTransform: 'lowercase' as const,
                }}
              >
                hoje
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
