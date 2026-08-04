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
  bottom: number
  right: number
  radius?: number
  size?: number
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
  right,
  radius = 75,
  size = 220,
}: WheelMenuProps) {
  const [expanded, setExpanded] = useState(false)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const angleStep = 360 / items.length

  function open() {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    setExpanded(true)
  }

  function scheduleClose() {
    closeTimer.current = setTimeout(() => setExpanded(false), 400)
  }

  return (
    <div
      style={{
        position: 'fixed',
        right,
        bottom,
        zIndex: 48,
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onMouseEnter={open}
      onMouseLeave={scheduleClose}
    >
      {items.map((item, i) => {
        const angleDeg = -90 + i * angleStep
        const rad = (angleDeg * Math.PI) / 180
        const x = Math.round(Math.cos(rad) * radius)
        const y = Math.round(Math.sin(rad) * radius)
        const delay = 0.02 + i * 0.02
        return (
          <div
            key={item.id}
            onClick={item.onClick}
            title={item.label}
            style={{
              position: 'absolute',
              width: 48,
              height: 48,
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
              transform: expanded
                ? `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(1)`
                : 'translate(-50%, -50%) scale(0.3)',
              opacity: expanded ? 1 : 0,
              pointerEvents: expanded ? 'auto' : 'none',
              top: '50%',
              left: '50%',
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
          position: 'relative',
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
