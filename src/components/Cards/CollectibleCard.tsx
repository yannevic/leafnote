import { useState } from 'react'
import { Lock, ZoomIn } from 'lucide-react'
import { CardDefinition } from '../../lib/cards'
import { RARITY_COLOR } from '../../lib/rarity'
import CardZoomModal from './CardZoomModal'

interface CollectibleCardProps {
  card: CardDefinition
  quantity: number
}

export default function CollectibleCard({ card, quantity }: CollectibleCardProps) {
  const [zoomed, setZoomed] = useState(false)
  const owned = quantity > 0
  const color = RARITY_COLOR[card.rarity]

  return (
    <>
      <div
        onClick={() => owned && setZoomed(true)}
        style={{
          position: 'relative',
          aspectRatio: '1 / 1.4',
          borderRadius: 12,
          border: `2px solid ${owned ? color : '#3d3d3d33'}`,
          overflow: 'hidden',
          background: owned ? '#fff' : '#e8e8e8',
          boxShadow: owned ? `0 0 8px ${color}55` : 'none',
          cursor: owned ? 'pointer' : 'default',
        }}
      >
        <img
          src={card.image}
          alt={card.name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            filter: owned ? 'none' : 'blur(7px) grayscale(55%) brightness(0.55)',
          }}
        />

        {!owned && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(0,0,0,0.2)',
            }}
          >
            <Lock size={26} color="#fff" strokeWidth={2.2} />
          </div>
        )}

        {owned && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: 0,
              background: 'rgba(0,0,0,0)',
              transition: 'opacity 0.15s, background 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '1'
              e.currentTarget.style.background = 'rgba(0,0,0,0.28)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '0'
              e.currentTarget.style.background = 'rgba(0,0,0,0)'
            }}
          >
            <ZoomIn size={26} color="#fff" strokeWidth={2.2} />
          </div>
        )}

        {owned && quantity > 1 && (
          <div
            style={{
              position: 'absolute',
              bottom: 6,
              right: 6,
              background: color,
              color: '#fff',
              fontSize: 11,
              fontWeight: 700,
              borderRadius: 999,
              padding: '2px 7px',
            }}
          >
            x{quantity}
          </div>
        )}

        {owned && (
          <div
            style={{
              position: 'absolute',
              top: 6,
              left: 6,
              fontSize: 9,
              fontWeight: 700,
              color,
              background: '#fff',
              borderRadius: 6,
              padding: '2px 6px',
              textTransform: 'uppercase',
            }}
          >
            {card.rarity}
          </div>
        )}
      </div>

      {zoomed && <CardZoomModal card={card} onClose={() => setZoomed(false)} />}
    </>
  )
}
