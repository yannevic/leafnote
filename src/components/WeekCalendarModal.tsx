import { useState } from 'react'
import { CalendarEvent, CalendarTheme, THEME_COLORS, MONTH_NAMES, DAY_NAMES } from '../lib/calendar'
import { X, Pin, Clock, Plus } from 'lucide-react'

interface Props {
  dateKey: string
  entries: CalendarEvent[]
  theme: CalendarTheme
  onClose: () => void
  onAdd: (text: string, time: string | null) => void
  onRemove: (id: string) => void
  onPinToBoard: (entry: CalendarEvent, dateKey: string) => void
  onPinCycleToBoard: () => void
  isNana: boolean
  currentUser: string
}

function parseDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split('-').map(Number)
  return { year, month: month - 1, day }
}

export default function WeekCalendarModal({
  dateKey,
  entries,
  theme,
  onClose,
  onAdd,
  onRemove,
  onPinToBoard,
  currentUser,
}: Props) {
  const [newText, setNewText] = useState('')
  const [newHour, setNewHour] = useState('')
  const [newMin, setNewMin] = useState('')
  const t = THEME_COLORS[theme]

  const { year, month, day } = parseDateKey(dateKey)
  const weekday = new Date(year, month, day).getDay()
  const label = `${DAY_NAMES[weekday]}, ${day} de ${MONTH_NAMES[month]}`

  function handleAdd() {
    const trimmed = newText.trim()
    if (!trimmed) return
    const time = newHour ? `${newHour.padStart(2, '0')}:${(newMin || '00').padStart(2, '0')}` : null
    onAdd(trimmed, time)
    setNewText('')
    setNewHour('')
    setNewMin('')
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(44,20,8,0.35)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => {
        e.stopPropagation()
        onClose()
      }}
    >
      <style>{`
        .modal-scroll::-webkit-scrollbar { width: 4px; }
        .modal-scroll::-webkit-scrollbar-track { background: transparent; }
        .modal-scroll::-webkit-scrollbar-thumb { background: ${t.accent}55; border-radius: 99px; }
        .modal-scroll::-webkit-scrollbar-thumb:hover { background: ${t.accent}99; }
        .time-input::-webkit-inner-spin-button,
        .time-input::-webkit-outer-spin-button { -webkit-appearance: none; }
      `}</style>

      <div
        className="relative flex flex-col"
        style={{
          width: 480,
          maxWidth: '92vw',
          height: 540,
          background:
            'linear-gradient(160deg, rgba(253,246,240,0.97) 0%, rgba(252,232,238,0.97) 100%)',
          borderRadius: 20,
          border: '1.5px solid rgba(232,160,176,0.4)',
          boxShadow: '0 8px 40px rgba(200,120,140,0.2), inset 0 1px 0 rgba(255,255,255,0.6)',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* header */}
        <div
          className="flex items-center justify-between shrink-0"
          style={{
            borderBottom: `2px dashed rgba(232,160,176,0.4)`,
            padding: '16px 24px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <CalendarIcon color={t.accent} />
            <span
              style={{
                fontSize: 15,
                fontWeight: 800,
                color: '#3d1a10',
                fontFamily: 'Baloo 2, sans-serif',
              }}
            >
              {label.toLowerCase()}
            </span>
          </div>
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

        {/* lista */}
        <div
          className="modal-scroll flex-1 overflow-y-auto flex flex-col"
          style={{ padding: '14px 24px', gap: 10 }}
        >
          {entries.length === 0 && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                flex: 1,
                gap: 8,
                opacity: 0.45,
                marginTop: 40,
              }}
            >
              <CalendarIcon color={t.accent} size={28} />
              <span
                style={{
                  fontFamily: 'Baloo 2, sans-serif',
                  fontSize: 13,
                  color: '#3d1a10',
                }}
              >
                nenhum evento ainda
              </span>
            </div>
          )}
          {entries.map((entry) => (
            <div
              key={entry.id}
              style={{
                background: 'rgba(253,242,246,0.7)',
                border: '1.5px solid rgba(232,160,176,0.3)',
                borderRadius: 12,
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: 10,
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {entry.time && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={11} color={t.accent} strokeWidth={2.5} />
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 800,
                        color: t.accent,
                        fontFamily: 'Baloo 2, sans-serif',
                      }}
                    >
                      {entry.time}
                    </span>
                  </div>
                )}
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: '#3d1a10',
                    fontFamily: 'Baloo 2, sans-serif',
                  }}
                >
                  {entry.text}
                </span>
                <span
                  style={{
                    fontSize: 10,
                    color: 'rgba(61,26,16,0.4)',
                    fontFamily: 'Baloo 2, sans-serif',
                  }}
                >
                  por {entry.createdBy}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 5, flexShrink: 0, marginTop: 2 }}>
                <button
                  onClick={() => onPinToBoard(entry, dateKey)}
                  title="fixar no mural"
                  style={{
                    background: 'rgba(74,122,74,0.12)',
                    border: 'none',
                    borderRadius: 8,
                    width: 28,
                    height: 28,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  <Pin size={12} color="#4A7A4A" strokeWidth={2} />
                </button>
                {entry.createdBy === currentUser && (
                  <button
                    onClick={() => onRemove(entry.id)}
                    style={{
                      background: 'rgba(232,96,122,0.12)',
                      border: 'none',
                      borderRadius: 8,
                      width: 28,
                      height: 28,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    <X size={12} color="#e8607a" strokeWidth={2.5} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* input */}
        <div
          className="shrink-0 flex flex-col"
          style={{
            borderTop: `2px dashed rgba(232,160,176,0.4)`,
            padding: '16px 24px',
            gap: 10,
          }}
        >
          <div style={{ display: 'flex', gap: 8 }}>
            {/* horário personalizado */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                background: 'rgba(253,242,246,0.7)',
                border: '1.5px solid rgba(232,160,176,0.35)',
                borderRadius: 10,
                padding: '0 10px',
                flexShrink: 0,
              }}
            >
              <Clock size={12} color={t.accent} strokeWidth={2} />
              <input
                className="time-input"
                type="number"
                min={0}
                max={23}
                placeholder="hh"
                value={newHour}
                onChange={(e) => setNewHour(e.target.value)}
                style={{
                  width: 28,
                  background: 'none',
                  border: 'none',
                  outline: 'none',
                  fontFamily: 'Baloo 2, sans-serif',
                  fontSize: 13,
                  fontWeight: 700,
                  color: '#3d1a10',
                  textAlign: 'center',
                  padding: '8px 0',
                }}
              />
              <span style={{ color: 'rgba(61,26,16,0.4)', fontWeight: 700, fontSize: 13 }}>:</span>
              <input
                className="time-input"
                type="number"
                min={0}
                max={59}
                placeholder="mm"
                value={newMin}
                onChange={(e) => setNewMin(e.target.value)}
                style={{
                  width: 28,
                  background: 'none',
                  border: 'none',
                  outline: 'none',
                  fontFamily: 'Baloo 2, sans-serif',
                  fontSize: 13,
                  fontWeight: 700,
                  color: '#3d1a10',
                  textAlign: 'center',
                  padding: '8px 0',
                }}
              />
            </div>

            <input
              className="flex-1 rounded-xl text-sm outline-none"
              style={{
                background: 'rgba(253,242,246,0.7)',
                border: '1.5px solid rgba(232,160,176,0.35)',
                borderRadius: 10,
                fontFamily: 'Baloo 2, sans-serif',
                fontSize: 13,
                color: '#3d1a10',
                padding: '10px 14px',
              }}
              placeholder="novo evento..."
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAdd()
              }}
            />
          </div>

          <button
            onClick={handleAdd}
            style={{
              width: '100%',
              background: 'rgba(232,160,176,0.55)',
              border: 'none',
              borderRadius: 12,
              padding: '11px 0',
              fontFamily: 'Baloo 2, sans-serif',
              fontSize: 13,
              fontWeight: 800,
              color: '#3d1a10',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            <Plus size={15} strokeWidth={2.5} />
            adicionar
          </button>
        </div>
      </div>
    </div>
  )
}

function CalendarIcon({ color, size = 16 }: { color: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="18" rx="3" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  )
}
