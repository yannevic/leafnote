import { useState } from 'react'
import { Sparkles, Repeat } from 'lucide-react'
import { CardDefinition } from '../../lib/cards'
import { RARITY_COLOR } from '../../lib/rarity'
import versoCard from '../../assets/cards/jardim-secreto/verso-card.png'

interface PackOpenModalProps {
  cards: CardDefinition[]
  ownedBefore: Record<string, number> // cardId -> quantidade que já tinha ANTES desse pacote
  onClose: () => void
}

export default function PackOpenModal({ cards, ownedBefore, onClose }: PackOpenModalProps) {
  const [revealed, setRevealed] = useState<boolean[]>(cards.map(() => false))
  const [hovered, setHovered] = useState<number | null>(null)
  const allRevealed = revealed.every(Boolean)

  function reveal(i: number) {
    if (revealed[i]) return
    setRevealed((prev) => prev.map((r, idx) => (idx === i ? true : r)))
  }

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
        @keyframes cardFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @keyframes glowPulse {
          0%, 100% { opacity: 0.55; }
          50% { opacity: 1; }
        }
        @keyframes shineSweep {
          0% { transform: translateX(-120%) rotate(20deg); opacity: 0; }
          15% { opacity: 1; }
          60% { opacity: 1; }
          100% { transform: translateX(120%) rotate(20deg); opacity: 0; }
        }
        @keyframes newBadgePop {
          0% { transform: scale(0); opacity: 0; }
          70% { transform: scale(1.15); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>

      <div
        style={{
          display: 'flex',
          gap: 20,
          flexWrap: 'nowrap',
          justifyContent: 'center',
          padding: '0 20px',
        }}
      >
        {cards.map((card, i) => {
          const color = RARITY_COLOR[card.rarity]
          const isHigh = card.rarity === 'rara' || card.rarity === 'epica'
          const isHovered = hovered === i
          const isRevealed = revealed[i]
          const alreadyOwnedBefore = !!ownedBefore[card.id]
          const duplicateInPack = cards.slice(0, i).some((c) => c.id === card.id)
          const isRepeated = alreadyOwnedBefore || duplicateInPack
          const isNew = !isRepeated

          return (
            <div
              key={i}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => reveal(i)}
              style={{
                width: 210,
                height: 294,
                perspective: 800,
                cursor: isRevealed ? 'default' : 'pointer',
                animation: isRevealed ? 'none' : 'cardFloat 2.6s ease-in-out infinite',
                animationDelay: `${i * 0.15}s`,
              }}
            >
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  height: '100%',
                  transformStyle: 'preserve-3d',
                  transition: 'transform 0.6s cubic-bezier(.25,.8,.35,1)',
                  transform: isRevealed ? 'rotateY(180deg)' : 'rotateY(0deg)',
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
                    boxShadow:
                      !isRevealed && isHovered ? `0 0 ${isHigh ? 28 : 14}px 4px ${color}` : 'none',
                  }}
                >
                  <img
                    src={versoCard}
                    alt="verso da carta"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                  {!isRevealed && isHovered && isHigh && (
                    <div
                      style={{
                        position: 'absolute',
                        inset: -4,
                        borderRadius: 16,
                        border: `2px solid ${color}`,
                        animation: 'glowPulse 1.1s ease-in-out infinite',
                        pointerEvents: 'none',
                      }}
                    />
                  )}
                </div>

                {/* frente — só a imagem, sem texto nem badges por cima */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: 14,
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                    overflow: 'hidden',
                    border: `2px solid ${color}`,
                    background: '#fff',
                    boxShadow: isRevealed && isHigh ? `0 0 20px 2px ${color}88` : 'none',
                  }}
                >
                  <img
                    src={card.image}
                    alt={card.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                  {isRevealed && isHigh && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: 60,
                        height: '100%',
                        background:
                          'linear-gradient(100deg, transparent 0%, rgba(255,255,255,0.85) 50%, transparent 100%)',
                        animation: 'shineSweep 1.2s ease-out',
                        pointerEvents: 'none',
                      }}
                    />
                  )}

                  {isRevealed && isNew && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 8,
                        left: 8,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        padding: '3px 9px 3px 7px',
                        borderRadius: 999,
                        background: '#4A7A4A',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.35)',
                        animation: 'newBadgePop 0.4s ease-out 0.55s backwards',
                        pointerEvents: 'none',
                      }}
                    >
                      <Sparkles size={11} color="#fff" />
                      <span
                        style={{
                          color: '#fff',
                          fontSize: 11,
                          fontWeight: 800,
                          fontFamily: 'Baloo 2',
                        }}
                      >
                        nova
                      </span>
                    </div>
                  )}

                  {isRevealed && isRepeated && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 8,
                        left: 8,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        padding: '3px 9px 3px 7px',
                        borderRadius: 999,
                        background: '#8B6914',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.35)',
                        animation: 'newBadgePop 0.4s ease-out 0.55s backwards',
                        pointerEvents: 'none',
                      }}
                    >
                      <Repeat size={11} color="#fff" />
                      <span
                        style={{
                          color: '#fff',
                          fontSize: 11,
                          fontWeight: 800,
                          fontFamily: 'Baloo 2',
                        }}
                      >
                        repetida
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
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
        {!allRevealed && (
          <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: 700 }}>
            clica nas cartas pra virar
          </span>
        )}
        {allRevealed && (
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
        )}
      </div>
    </div>
  )
}
