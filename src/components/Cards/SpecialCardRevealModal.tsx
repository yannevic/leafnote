// src/components/Cards/SpecialCardRevealModal.tsx
import { useState } from 'react'
import type { SpecialCardDefinition } from '../../lib/specialCards'
import versoCard from '../../assets/cards/jardim-secreto/verso-card.png'

const SPECIAL_GLOW = '0 0 20px 4px #ffd97e, 0 0 34px 10px #fff3c4'

interface Props {
  card: SpecialCardDefinition
  onClose: () => void
}

export default function SpecialCardRevealModal({ card, onClose }: Props) {
  const [revealed, setRevealed] = useState(false)

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999999,
        background: 'rgba(20,10,15,0.75)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Baloo 2, sans-serif',
      }}
    >
      <style>{`
        @keyframes specialCardFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @keyframes specialGlowPulse {
          0% { border-color: #ffd97e; box-shadow: 0 0 16px 4px #ffd97e; }
          50% { border-color: #fff3c4; box-shadow: 0 0 16px 4px #fff3c4; }
          100% { border-color: #ffd97e; box-shadow: 0 0 16px 4px #ffd97e; }
        }
        @keyframes specialShineSweep {
          0% { transform: translateX(-120%) rotate(20deg); opacity: 0; }
          15% { opacity: 1; }
          60% { opacity: 1; }
          100% { transform: translateX(120%) rotate(20deg); opacity: 0; }
        }
      `}</style>

      <span
        style={{
          color: '#ffd97e',
          fontSize: 13,
          fontWeight: 800,
          marginBottom: 18,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
        }}
      >
        carta especial
      </span>

      <div
        onClick={() => setRevealed(true)}
        style={{
          width: 210,
          height: 294,
          perspective: 800,
          cursor: revealed ? 'default' : 'pointer',
          animation: revealed ? 'none' : 'specialCardFloat 2.6s ease-in-out infinite',
        }}
      >
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            transformStyle: 'preserve-3d',
            transition: 'transform 0.6s cubic-bezier(.25,.8,.35,1)',
            transform: revealed ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
        >
          {/* verso */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: 14,
              backfaceVisibility: 'hidden',
              overflow: 'hidden',
              border: '2px solid rgba(255,255,255,0.15)',
            }}
          >
            <img
              src={versoCard}
              alt="verso da carta"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
            {!revealed && (
              <div
                style={{
                  position: 'absolute',
                  inset: -4,
                  borderRadius: 16,
                  border: '2px solid #ffd97e',
                  animation: 'specialGlowPulse 1.4s ease-in-out infinite',
                  pointerEvents: 'none',
                }}
              />
            )}
          </div>

          {/* frente */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: 14,
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              overflow: 'hidden',
              border: '2px solid #ffd97e',
              background: '#fff',
              boxShadow: revealed ? SPECIAL_GLOW : 'none',
            }}
          >
            {card.image ? (
              <img
                src={card.image}
                alt={card.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            ) : (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 16,
                  textAlign: 'center',
                  fontWeight: 800,
                  color: '#8b6914',
                }}
              >
                {card.name}
              </div>
            )}
            {revealed && (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: 60,
                  height: '100%',
                  background:
                    'linear-gradient(100deg, transparent 0%, rgba(255,255,255,0.85) 50%, transparent 100%)',
                  animation: 'specialShineSweep 1.2s ease-out',
                  pointerEvents: 'none',
                }}
              />
            )}
          </div>
        </div>
      </div>

      <div
        style={{
          marginTop: 26,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 10,
        }}
      >
        {!revealed && (
          <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: 700 }}>
            clica na carta pra virar
          </span>
        )}
        {revealed && (
          <>
            <span style={{ color: '#ffd97e', fontSize: 15, fontWeight: 800 }}>{card.name}</span>
            <button
              onClick={onClose}
              style={{
                padding: '10px 26px',
                borderRadius: 999,
                border: 'none',
                background: '#c87090',
                color: '#fff',
                fontWeight: 800,
                fontSize: 13,
                cursor: 'pointer',
                fontFamily: 'Baloo 2',
              }}
            >
              fechar
            </button>
          </>
        )}
      </div>
    </div>
  )
}
