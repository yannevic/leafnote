// src/components/Cards/SpecialCollectibleCard.tsx
import { useState } from 'react'
import { Lock, ZoomIn, X } from 'lucide-react'
import type { SpecialCardDefinition } from '../../lib/specialCards'

const SPECIAL_COLOR = '#c9962e' // dourado — diferencia visualmente das 4 raridades normais

interface Props {
  card: SpecialCardDefinition
  quantity: number
}

export default function SpecialCollectibleCard({ card, quantity }: Props) {
  const [zoomed, setZoomed] = useState(false)
  const owned = quantity > 0

  return (
    <>
      <div
        onClick={() => owned && setZoomed(true)}
        style={{
          position: 'relative',
          aspectRatio: '1 / 1.4',
          borderRadius: 12,
          border: `2px solid ${owned ? SPECIAL_COLOR : '#3d3d3d33'}`,
          overflow: 'hidden',
          background: owned ? '#fff' : '#e8e8e8',
          boxShadow: owned ? `0 0 10px ${SPECIAL_COLOR}77` : 'none',
          cursor: owned ? 'pointer' : 'default',
        }}
      >
        {card.image ? (
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
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 8,
              textAlign: 'center',
              fontSize: 11,
              fontWeight: 800,
              color: '#8b6914',
              filter: owned ? 'none' : 'blur(4px) grayscale(55%)',
            }}
          >
            {card.name}
          </div>
        )}
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
              background: SPECIAL_COLOR,
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
              color: SPECIAL_COLOR,
              background: '#fff',
              borderRadius: 6,
              padding: '2px 6px',
              textTransform: 'uppercase',
            }}
          >
            especial
          </div>
        )}
      </div>

      {zoomed && (
        <div
          onClick={() => setZoomed(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 999999,
            background: 'rgba(20,10,15,0.75)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <button
            onClick={() => setZoomed(false)}
            style={{
              position: 'absolute',
              top: 20,
              right: 20,
              width: 32,
              height: 32,
              borderRadius: '50%',
              border: 'none',
              background: 'rgba(255,255,255,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <X size={16} color="#fff" strokeWidth={2.5} />
          </button>
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 280,
              aspectRatio: '1 / 1.4',
              borderRadius: 16,
              overflow: 'hidden',
              border: `3px solid ${SPECIAL_COLOR}`,
              boxShadow: `0 0 30px ${SPECIAL_COLOR}88`,
              background: '#fff',
            }}
          >
            {card.image ? (
              <img
                src={card.image}
                alt={card.name}
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            ) : (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  color: '#8b6914',
                }}
              >
                {card.name}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
