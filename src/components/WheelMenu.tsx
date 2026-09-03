import { useState, useRef, ReactNode } from 'react'

export interface WheelItem {
  id: string
  icon: ReactNode
  label: string
  onClick: () => void
  bg: string
  border: string
  notifCount?: number
  notifColor?: string
}

function NotifBadge({ count, color = '#c87090' }: { count: number; color?: string }) {
  if (!count) return null
  return (
    <span
      style={{
        position: 'absolute',
        top: -4,
        right: -4,
        background: color,
        color: '#fff',
        fontSize: 8,
        fontWeight: 800,
        fontFamily: 'Baloo 2, sans-serif',
        borderRadius: '50%',
        width: 14,
        height: 14,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        lineHeight: 1,
        pointerEvents: 'none',
        zIndex: 2,
        boxShadow: '0 1px 4px rgba(0,0,0,0.18)',
      }}
    >
      {count > 9 ? '9+' : count}
    </span>
  )
}

interface WheelMenuProps {
  items: WheelItem[]
  centerIcon: ReactNode
  centerBg: string
  centerBgActive: string
  centerBorder: string
  centerShadow: string
  totalNotif?: number
  bottom?: number
  top?: number
  center?: boolean
  right: number
  radius?: number
  startAngle?: number
  endAngle?: number
  zIndex?: number
}

export default function WheelMenu({
  items,
  centerIcon,
  centerBg,
  centerBgActive,
  centerBorder,
  centerShadow,
  totalNotif = 0,
  bottom,
  top,
  center,
  right,
  radius = 90,
  startAngle = 90,
  endAngle = 270,
  zIndex = 48,
}: WheelMenuProps) {
  const [expanded, setExpanded] = useState(false)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const angleStep = items.length > 1 ? (endAngle - startAngle) / (items.length - 1) : 0

  function open() {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    setExpanded(true)
  }
  function scheduleClose() {
    closeTimer.current = setTimeout(() => setExpanded(false), 400)
  }

  // caixa que engloba o leque inteiro — generosa de propósito, pra nunca cortar
  // item nem "soltar" o hover no meio do caminho
  const containerW = radius + 80
  const containerH = radius * 2 + 80

  // o botão central e TODOS os itens usam exatamente essa mesma âncora —
  // é o que garante que o leque sempre nasce de onde o botão realmente está
  const anchorStyle: React.CSSProperties = center
    ? { position: 'absolute', top: '50%', right: 0 }
    : top !== undefined
      ? { position: 'absolute', top: 0, right: 0 }
      : { position: 'absolute', bottom: 0, right: 0 }

  const collapsedTransform = 'scale(0.3)'

  return (
    <div
      style={{
        position: 'fixed',
        right,
        zIndex,
        width: containerW,
        height: containerH,
        pointerEvents: 'none',
        ...(center
          ? { top: '50%', transform: 'translateY(-50%)' }
          : top !== undefined
            ? { top }
            : { bottom }),
      }}
      onMouseEnter={open}
      onMouseLeave={scheduleClose}
    >
      {items.map((item, i) => {
        const angleDeg = startAngle + i * angleStep
        const rad = (angleDeg * Math.PI) / 180
        const dx = Math.round(Math.cos(rad) * radius)
        const dy = Math.round(Math.sin(rad) * radius)
        const delay = 0.02 + i * 0.02
        const expandedTransform = `translate(${dx}px, ${dy}px)`
        return (
          <div
            key={item.id}
            onClick={item.onClick}
            title={item.label}
            style={{
              ...anchorStyle,
              width: 48,
              height: 48,
              marginTop: center ? -24 : undefined,
              borderRadius: '50%',
              background: item.bg,
              border: `1.5px solid ${item.border}`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              cursor: 'pointer',
              color: 'rgba(61,36,8,0.8)',
              backdropFilter: 'blur(6px)',
              WebkitBackdropFilter: 'blur(6px)',
              transition: `transform 0.3s cubic-bezier(.34,1.4,.64,1) ${delay}s, opacity 0.2s ${delay}s`,
              transform: expanded ? expandedTransform : collapsedTransform,
              opacity: expanded ? 1 : 0,
              pointerEvents: expanded ? 'auto' : 'none',
            }}
          >
            <NotifBadge count={item.notifCount ?? 0} color={item.notifColor} />
            {item.icon}
            <span
              style={{
                fontSize: 9,
                fontWeight: 700,
                color: 'rgba(61,36,8,0.75)',
                fontFamily: 'Baloo 2, sans-serif',
                textAlign: 'center',
                lineHeight: 1.15,
                maxWidth: 40,
              }}
            >
              {item.label}
            </span>
          </div>
        )
      })}

      <div
        style={{
          ...anchorStyle,
          marginTop: center ? -24 : undefined,
          transform: center ? 'translateY(0)' : undefined,
          zIndex: 3,
          width: 48,
          height: 48,
          borderRadius: '50%',
          background: expanded ? centerBgActive : centerBg,
          border: `1.5px solid ${centerBorder}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          pointerEvents: 'auto',
          boxShadow: expanded ? centerShadow : '0 2px 8px rgba(0,0,0,0.1)',
          transition: 'all 0.2s',
          color: 'rgba(61,36,8,0.82)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        }}
      >
        {centerIcon}
        <NotifBadge count={totalNotif} />
      </div>
    </div>
  )
}
