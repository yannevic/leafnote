import { useEffect, useRef, useState } from 'react'
import type { CoinPopupPayload } from '../lib/coinPopupBus'

interface ActivePopup extends CoinPopupPayload {
  id: number
}

export default function CoinPopupLayer() {
  const [popups, setPopups] = useState<ActivePopup[]>([])
  const idRef = useRef(0)

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<CoinPopupPayload>).detail
      const id = idRef.current++
      setPopups((prev) => [...prev, { ...detail, id }])
      setTimeout(() => {
        setPopups((prev) => prev.filter((p) => p.id !== id))
      }, 1000)
    }
    window.addEventListener('coin-popup', handler)
    return () => window.removeEventListener('coin-popup', handler)
  }, [])

  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 999999 }}>
      {popups.map((p) => (
        <div
          key={p.id}
          style={{
            position: 'fixed',
            left: p.x,
            top: p.y,
            transform: 'translate(-50%, -100%)',
            fontFamily: "'Baloo 2', sans-serif",
            fontWeight: 700,
            fontSize: 15,
            color: p.color ?? '#4A7A4A',
            textShadow: '0 1px 3px rgba(0,0,0,0.35)',
            animation: 'coinPopupFloat 1s ease-out forwards',
            whiteSpace: 'nowrap',
          }}
        >
          +{p.amount} {p.coinName}
        </div>
      ))}
      <style>{`
        @keyframes coinPopupFloat {
          0%   { opacity: 0; transform: translate(-50%, -100%) translateY(0); }
          15%  { opacity: 1; }
          100% { opacity: 0; transform: translate(-50%, -100%) translateY(-40px); }
        }
      `}</style>
    </div>
  )
}
