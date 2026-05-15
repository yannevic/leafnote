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
  barColor: string
  icon: 'clock' | 'triangle'
} {
  if (days === 0)
    return {
      label: 'é hoje!',
      color: '#c87090',
      barColor: 'linear-gradient(90deg, #c87090, #e8607a)',
      icon: 'clock',
    }
  if (days < 0)
    return {
      label: `há ${Math.abs(days)} ${Math.abs(days) === 1 ? 'dia' : 'dias'}`,
      color: 'rgba(61,26,16,0.35)',
      barColor: 'linear-gradient(90deg, rgba(200,160,176,0.4), rgba(180,140,160,0.4))',
      icon: 'clock',
    }
  if (days <= 3)
    return {
      label: `${days === 1 ? '1 dia' : `${days} dias`}`,
      color: '#9B7FD4',
      barColor: 'linear-gradient(90deg, #9B7FD4, #7060a8)',
      icon: 'triangle',
    }
  if (days <= 7)
    return {
      label: `${days} dias`,
      color: '#C4956A',
      barColor: 'linear-gradient(90deg, #C4956A, #a87040)',
      icon: 'triangle',
    }
  return {
    label: `${days} dias`,
    color: '#4A7A4A',
    barColor: 'linear-gradient(90deg, #6aaa6a, #4A7A4A)',
    icon: 'clock',
  }
}

export default function CountdownPin({ item, zIndex, onUpdate, onDelete, onFocus }: Props) {
  const dragRef = useRef({ dragging: false, moved: false, sx: 0, sy: 0, px: 0, py: 0 })
  const days = getDaysLeft(item.targetDate)
  const status = getStatus(days)
  const isToday = days <= 0
  const pinColor = item.color ?? status.color

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
        background: 'rgba(253,242,246,0.82)',
        border: isToday
          ? '1.5px solid rgba(200,112,144,0.6)'
          : '1.5px solid rgba(232,160,176,0.35)',
        borderRadius: 14,
        overflow: 'hidden',
        boxShadow: '0 2px 12px rgba(200,120,140,0.10)',
      }}
    >
      {/* barra de cor — full width, sem padding */}
      <div
        style={{
          height: 3,
          background: pinColor,
          width: '100%',
        }}
      />

      <div style={{ padding: '10px 14px 12px' }}>
        {/* label de estado */}
        <div
          style={{
            fontSize: 9,
            fontWeight: 800,
            color: 'rgba(122,48,64,0.55)',
            textTransform: 'uppercase',
            letterSpacing: '0.8px',
            marginBottom: 4,
          }}
        >
          {days < 0
            ? 'passou'
            : days === 0
              ? 'hoje'
              : days === 1
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
            fontSize: 14,
            fontWeight: 800,
            color: '#3d1a10',
            marginBottom: 8,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            paddingRight: 20,
          }}
        >
          {item.label}
        </div>

        {/* status com ícone */}
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: pinColor,
            display: 'flex',
            alignItems: 'center',
            gap: 5,
          }}
        >
          {status.icon === 'clock' ? (
            <Clock size={13} color={pinColor} strokeWidth={2} />
          ) : (
            <AlertTriangle size={13} color={pinColor} strokeWidth={2} />
          )}
          {status.label}
        </div>
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
          background: 'rgba(200,120,140,0.15)',
          border: 'none',
          borderRadius: '50%',
          width: 18,
          height: 18,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          padding: 0,
        }}
        title="desfixar"
      >
        <X size={10} color="rgba(122,48,64,0.6)" strokeWidth={2.5} />
      </button>
    </div>
  )
}
