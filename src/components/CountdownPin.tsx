  import { useRef, useCallback } from 'react'
  import { X, Clock, AlertTriangle } from 'lucide-react'
  import type { CountdownPinItem } from '../types/board'

  interface Props {
    item: CountdownPinItem
    zIndex: number
    onUpdate: (id: string, data: Partial<CountdownPinItem>) => void
    onDelete: (id: string) => void
    onFocus: (id: string) => void
  }

  function getDaysLeft(targetDate: string): number {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const target = new Date(targetDate + 'T00:00:00')
    return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  }

  function getStatus(days: number): {
    label: string
    color: string
    icon: 'clock' | 'triangle' | 'clock-pink'
  } {
    if (days <= 0) return { label: 'é hoje!', color: '#c87090', icon: 'clock-pink' }
    if (days === 1) return { label: '1 dia', color: '#9B7FD4', icon: 'triangle' }
    if (days === 2) return { label: '2 dias', color: '#9B7FD4', icon: 'triangle' }
    if (days === 3) return { label: '3 dias', color: '#9B7FD4', icon: 'triangle' }
    if (days <= 7) return { label: `${days} dias`, color: '#C4956A', icon: 'triangle' }
    return { label: `${days} dias`, color: '#4A7A4A', icon: 'clock' }
  }

  export default function CountdownPin({ item, zIndex, onUpdate, onDelete, onFocus }: Props) {
    const dragRef = useRef({ dragging: false, moved: false, sx: 0, sy: 0, px: 0, py: 0 })
    const days = getDaysLeft(item.targetDate)
    const status = getStatus(days)
    const isToday = days <= 0

    const onMouseDown = useCallback(
      (e: React.MouseEvent) => {
        onFocus(item.id)
        dragRef.current = {
          dragging: true,
          moved: false,
          sx: e.clientX,
          sy: e.clientY,
          px: item.x,
          py: item.y,
        }
        e.preventDefault()
        const onMove = (ev: MouseEvent) => {
          const d = dragRef.current
          if (!d.dragging) return
          const dx = ev.clientX - d.sx
          const dy = ev.clientY - d.sy
          if (Math.abs(dx) > 4 || Math.abs(dy) > 4) d.moved = true
          onUpdate(item.id, { x: d.px + dx, y: d.py + dy })
        }
        const onUp = () => {
          dragRef.current.dragging = false
          window.removeEventListener('mousemove', onMove)
          window.removeEventListener('mouseup', onUp)
        }
        window.addEventListener('mousemove', onMove)
        window.addEventListener('mouseup', onUp)
      },
      [item.x, item.y, item.id, onUpdate, onFocus]
    )

    return (
      <div
        data-item
        onMouseDown={onMouseDown}
        style={{
          position: 'absolute',
          left: item.x,
          top: item.y,
          width: 210,
          zIndex,
          cursor: 'grab',
          userSelect: 'none',
          fontFamily: 'Baloo 2, sans-serif',
          background: 'var(--color-background-primary, #fffaf4)',
          border: isToday ? `1.5px solid ${item.color}` : '0.5px solid rgba(0,0,0,0.12)',
          borderRadius: 12,
          padding: '10px 16px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
        }}
      >
        {/* barra de cor */}
        <div style={{ height: 3, borderRadius: 2, background: item.color, marginBottom: 9 }} />

        {/* label de estado */}
        <div
          style={{
            fontSize: 11,
            color: 'rgba(0,0,0,0.35)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginBottom: 3,
          }}
        >
          {isToday
            ? 'hoje'
            : days <= 1
              ? 'amanhã'
              : days <= 3
                ? 'quase lá'
                : days <= 7
                  ? '1 semana'
                  : 'em breve'}
        </div>

        {/* título */}
        <div
          style={{
            fontSize: 15,
            fontWeight: 700,
            color: '#2C1810',
            marginBottom: 7,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {item.label}
        </div>

        {/* status com ícone */}
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: status.color,
            display: 'flex',
            alignItems: 'center',
            gap: 5,
          }}
        >
          {status.icon === 'clock' && <Clock size={13} color={status.color} />}
          {status.icon === 'triangle' && <AlertTriangle size={13} color={status.color} />}
          {status.icon === 'clock-pink' && <Clock size={13} color={status.color} />}
          {status.label}
        </div>

        {/* botão desfixar */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete(item.id)
          }}
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 2,
            opacity: 0.4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          title="desfixar"
        >
          <X size={11} color="#2C1810" />
        </button>
      </div>
    )
  }
