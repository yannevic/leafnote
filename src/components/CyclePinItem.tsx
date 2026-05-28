import { useRef, useCallback } from 'react'
import { X, CloudRain, AlertTriangle } from 'lucide-react'
import type { CyclePinItem as CyclePinItemType } from '../types/board'
import { useCycle } from '../hooks/useCycle'
import { computeCycleState } from '../lib/cycle'

interface Props {
  coupleId: string
  item: CyclePinItemType
  zIndex: number
  onUpdate: (id: string, data: Partial<CyclePinItemType>) => void
  onDelete: (id: string) => void
  onFocus: (id: string) => void
}

function DropletFilled({ color }: { color: string }) {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill={color} stroke={color} strokeWidth="1">
      <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z" />
    </svg>
  )
}

const STATE_CONFIG = {
  chegando: {
    color: '#c87090',
    barColor: 'linear-gradient(90deg, #c87090, #e8607a)',
    sublabel: 'vem aí',
    icon: 'droplet',
  },
  tpm: {
    color: '#9B7FD4',
    barColor: 'linear-gradient(90deg, #9B7FD4, #7060a8)',
    sublabel: 'tpm',
    icon: 'alert',
  },
  active: {
    color: '#D94F4F',
    barColor: 'linear-gradient(90deg, #D94F4F, #b03030)',
    sublabel: 'menstruada',
    icon: 'cloud',
  },
  ended: null,
  none: null,
} as const

export default function CyclePinItem({
  coupleId,
  item,
  zIndex,
  onUpdate,
  onDelete,
  onFocus,
}: Props) {
  const dragRef = useRef({ dragging: false, moved: false, sx: 0, sy: 0, px: 0, py: 0 })
  const { currentCycle, allCycles } = useCycle(coupleId)
  const cycleData = item.cycleKey ? allCycles[item.cycleKey] : null
  const resolvedCycle = cycleData
    ? { ...computeCycleState(cycleData), key: item.cycleKey!, data: cycleData }
    : currentCycle

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

  if (!resolvedCycle || resolvedCycle.state === 'none' || resolvedCycle.state === 'ended') {
    return null
  }

  const config = STATE_CONFIG[resolvedCycle.state]
  if (!config) return null

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
        border: '1.5px solid rgba(232,160,176,0.35)',
        borderRadius: 14,
        overflow: 'hidden',
        boxShadow: '0 2px 12px rgba(200,120,140,0.10)',
      }}
    >
      {/* barra de cor — full width */}
      <div style={{ height: 3, background: config.barColor, width: '100%' }} />

      <div style={{ padding: '10px 14px 12px' }}>
        {/* sublabel */}
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
          {config.sublabel}
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
          {resolvedCycle.state === 'tpm'
            ? 'semana de tpm'
            : resolvedCycle.state === 'active'
              ? 'menstruada'
              : 'vem aí'}
        </div>

        {/* ícone + label */}
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: config.color,
            display: 'flex',
            alignItems: 'center',
            gap: 5,
          }}
        >
          {config.icon === 'alert' && (
            <AlertTriangle size={13} color={config.color} strokeWidth={2} />
          )}
          {config.icon === 'cloud' && <CloudRain size={13} color={config.color} strokeWidth={2} />}
          {config.icon === 'droplet' && <DropletFilled color={config.color} />}
          {resolvedCycle.label}
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
