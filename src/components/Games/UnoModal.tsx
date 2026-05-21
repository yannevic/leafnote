import React, { useState } from 'react'
import { X, RefreshCw, LogOut } from 'lucide-react'
import { UnoCard } from './cards/UnoCard'
import { useUno } from '../../hooks/useUno'
import type { UnoColor, UnoType, UnoCard as UnoCardType } from '../../lib/games'

// ─── Props ────────────────────────────────────────────────────────────────────

interface UnoModalProps {
  onClose: () => void
  roomId: string
  partnerUid: string
  partnerNick: string
  myNick: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const COLOR_LABELS: Record<Exclude<UnoColor, 'wild'>, string> = {
  pink: 'Rosa',
  green: 'Verde',
  mauve: 'Lilás',
  peach: 'Pêssego',
}

const COLOR_HEX: Record<Exclude<UnoColor, 'wild'>, string> = {
  pink: '#e8607a',
  green: '#5a9e6e',
  mauve: '#a06090',
  peach: '#d87858',
}

// Versão mais simples e segura
function isPlayable(
  card: UnoCardType,
  topCard: { color: UnoColor; type: UnoType; value?: number },
  currentColor: UnoColor
): boolean {
  if (card.color === 'wild') return true
  if (card.color === currentColor) return true
  if (card.type === topCard.type) return true
  if (card.type === 'number' && topCard.type === 'number' && card.value === topCard.value)
    return true
  return false
}

// Cartinha virada para baixo (verso) — mão do parceiro
function FaceDownCard({ small = false }: { small?: boolean }) {
  const w = small ? 44 : 60
  const h = small ? 69 : 95
  return (
    <div
      style={{
        width: w,
        height: h,
        borderRadius: small ? 8 : 10,
        background: 'linear-gradient(135deg,#3d1a10,#7a3040)',
        border: '1.5px solid rgba(232,160,176,0.35)',
        boxShadow: '0 2px 8px rgba(61,26,16,0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: w - 12,
          height: h - 12,
          borderRadius: small ? 5 : 7,
          border: '1.5px dashed rgba(232,160,176,0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span
          style={{
            fontFamily: "'Baloo 2', sans-serif",
            fontWeight: 800,
            fontSize: small ? 8 : 10,
            color: 'rgba(232,160,176,0.5)',
            letterSpacing: 1,
          }}
        >
          yami
        </span>
      </div>
    </div>
  )
}

// Seletor de cor (para wild / draw4)
function ColorPicker({ onPick }: { onPick: (c: Exclude<UnoColor, 'wild'>) => void }) {
  const colors: Exclude<UnoColor, 'wild'>[] = ['pink', 'green', 'mauve', 'peach']
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 10,
        background: 'rgba(26,42,26,0.6)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 20,
        gap: 12,
      }}
    >
      <p
        style={{
          fontFamily: "'Baloo 2', sans-serif",
          fontWeight: 800,
          fontSize: 15,
          color: 'white',
          marginBottom: 4,
        }}
      >
        Escolha a cor
      </p>
      <div style={{ display: 'flex', gap: 12 }}>
        {colors.map((c) => (
          <button
            key={c}
            onClick={() => onPick(c)}
            style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              border: '2.5px solid rgba(255,255,255,0.5)',
              background: COLOR_HEX[c],
              cursor: 'pointer',
              boxShadow: `0 4px 14px ${COLOR_HEX[c]}66`,
              transition: 'transform 0.1s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.12)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            title={COLOR_LABELS[c]}
          />
        ))}
      </div>
    </div>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────

export const UnoModal: React.FC<UnoModalProps> = ({
  onClose,
  roomId,
  partnerUid,
  partnerNick,
  myNick,
}) => {
  const {
    room,
    myUid,
    isHost,
    isMyTurn,
    myHand,
    partnerHandCount,
    loading,
    hasUno,
    partnerHasUno,
    startGame,
    playCard,
    drawCard,
    leaveGame,
  } = useUno({ roomId, partnerUid })

  // carta que precisa de escolha de cor (wild/draw4)
  const [pendingCard, setPendingCard] = useState<string | null>(null)

  const state = room?.state ?? 'idle'
  const isIdle = state === 'idle'
  const isFinished = state === 'finished'
  const isPlaying = !isIdle && !isFinished

  const topCard = room?.topCard
  const currentColor = room?.currentColor ?? 'pink'
  const winner = room?.winner

  const winnerNick = winner === myUid ? myNick : partnerNick

  // ── Handler jogar carta ───────────────────────────────────────────────────
  function handlePlayCard(card: UnoCardType) {
    if (!isMyTurn) return
    if (!topCard) return
    if (!isPlayable(card, topCard, currentColor)) return

    if (card.type === 'wild' || card.type === 'draw4') {
      setPendingCard(card.id)
      return
    }
    playCard(card.id)
  }

  function handleColorPick(color: Exclude<UnoColor, 'wild'>) {
    if (!pendingCard) return
    playCard(pendingCard, color)
    setPendingCard(null)
  }

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(26,42,26,0.55)',
        backdropFilter: 'blur(6px)',
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Modal */}
      <div
        style={{
          width: '100%',
          maxWidth: 600,
          maxHeight: '92vh',
          borderRadius: 20,
          background:
            'linear-gradient(160deg,rgba(245,236,215,0.98) 0%,rgba(232,245,232,0.98) 100%)',
          border: '1.5px solid rgba(196,149,106,0.35)',
          boxShadow: '0 24px 60px rgba(26,42,26,0.28), inset 0 1px 0 rgba(255,255,255,0.7)',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: "'Baloo 2', sans-serif",
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Seletor de cor overlay */}
        {pendingCard && <ColorPicker onPick={handleColorPick} />}

        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px 14px',
            borderBottom: '1px solid rgba(196,149,106,0.2)',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                fontWeight: 800,
                fontSize: 17,
                color: '#2D4A2D',
                letterSpacing: -0.5,
              }}
            >
              UNO
            </span>
            {isPlaying && (
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: 6,
                  background: isMyTurn ? 'rgba(127,184,127,0.2)' : 'rgba(196,149,106,0.15)',
                  color: isMyTurn ? '#2D4A2D' : '#8B6914',
                  border: `1px solid ${isMyTurn ? 'rgba(127,184,127,0.4)' : 'rgba(196,149,106,0.3)'}`,
                }}
              >
                {isMyTurn ? 'Sua vez' : `Vez de ${partnerNick}`}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#4A7A4A',
              display: 'flex',
              padding: 4,
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Corpo */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
          {/* ── IDLE ─────────────────────────────────────────────────────── */}
          {isIdle && (
            <div style={{ textAlign: 'center', paddingTop: 24 }}>
              <p style={{ fontSize: 14, color: '#4A7A4A', marginBottom: 8, lineHeight: 1.6 }}>
                108 cartas, 7 na mão cada. Zere primeiro!
              </p>
              <p style={{ fontSize: 12, color: '#8B6914', marginBottom: 28 }}>
                +2, +4, Skip, Reverse e curingas incluídos.
              </p>

              {isHost || !room ? (
                <button
                  onClick={startGame}
                  disabled={loading}
                  style={{
                    padding: '10px 32px',
                    borderRadius: 12,
                    border: 'none',
                    background: 'linear-gradient(135deg,#7FB87F,#4A7A4A)',
                    color: 'white',
                    fontFamily: "'Baloo 2', sans-serif",
                    fontWeight: 800,
                    fontSize: 15,
                    cursor: loading ? 'default' : 'pointer',
                    opacity: loading ? 0.7 : 1,
                    boxShadow: '0 4px 14px rgba(74,122,74,0.3)',
                  }}
                >
                  {loading ? 'Distribuindo...' : 'Iniciar Partida'}
                </button>
              ) : (
                <p style={{ fontSize: 13, color: '#8B6914', fontWeight: 600 }}>
                  Aguardando {partnerNick} iniciar...
                </p>
              )}
            </div>
          )}

          {/* ── JOGANDO ──────────────────────────────────────────────────── */}
          {isPlaying && topCard && (
            <>
              {/* Mão do parceiro (verso) */}
              <div style={{ marginBottom: 16 }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    marginBottom: 8,
                  }}
                >
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#4A7A4A' }}>
                    {partnerNick}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: '1px 7px',
                      borderRadius: 6,
                      background: partnerHasUno
                        ? 'rgba(232,96,122,0.15)'
                        : 'rgba(196,149,106,0.12)',
                      color: partnerHasUno ? '#e8607a' : '#8B6914',
                      border: `1px solid ${partnerHasUno ? 'rgba(232,96,122,0.3)' : 'rgba(196,149,106,0.25)'}`,
                    }}
                  >
                    {partnerHasUno ? 'UNO!' : `${partnerHandCount} cartas`}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                  {Array.from({ length: Math.min(partnerHandCount, 14) }).map((_, i) => (
                    <FaceDownCard key={i} small />
                  ))}
                  {partnerHandCount > 14 && (
                    <div
                      style={{
                        width: 44,
                        height: 69,
                        borderRadius: 8,
                        background: 'rgba(139,105,20,0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 12,
                        fontWeight: 800,
                        color: '#8B6914',
                      }}
                    >
                      +{partnerHandCount - 14}
                    </div>
                  )}
                </div>
              </div>

              {/* Mesa — topo + cor atual + deck */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 24,
                  padding: '16px 0',
                  borderTop: '1px solid rgba(196,149,106,0.2)',
                  borderBottom: '1px solid rgba(196,149,106,0.2)',
                  margin: '8px 0',
                }}
              >
                {/* Deck (comprar) */}
                <div
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}
                >
                  <button
                    onClick={drawCard}
                    disabled={!isMyTurn}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: isMyTurn ? 'pointer' : 'default',
                      opacity: isMyTurn ? 1 : 0.45,
                      padding: 0,
                    }}
                  >
                    <FaceDownCard />
                  </button>
                  {isMyTurn && (
                    <span style={{ fontSize: 10, color: '#8B6914', fontWeight: 700 }}>Comprar</span>
                  )}
                </div>

                {/* Carta do topo */}
                <div
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}
                >
                  <UnoCard
                    color={topCard.color === 'wild' ? (currentColor as any) : topCard.color}
                    type={topCard.type}
                    value={topCard.value}
                  />
                  {/* Cor ativa */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <div
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        background: COLOR_HEX[currentColor as Exclude<UnoColor, 'wild'>] ?? '#888',
                        border: '1.5px solid rgba(255,255,255,0.6)',
                        boxShadow: `0 0 6px ${COLOR_HEX[currentColor as Exclude<UnoColor, 'wild'>] ?? '#888'}88`,
                      }}
                    />
                    <span style={{ fontSize: 10, color: '#8B6914', fontWeight: 700 }}>
                      {COLOR_LABELS[currentColor as Exclude<UnoColor, 'wild'>] ?? 'Cor ativa'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Mão do jogador */}
              <div style={{ marginTop: 16 }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    marginBottom: 10,
                  }}
                >
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#4A7A4A' }}>
                    {myNick} (você)
                  </span>
                  {hasUno && (
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 800,
                        padding: '1px 8px',
                        borderRadius: 6,
                        background: 'rgba(232,96,122,0.15)',
                        color: '#e8607a',
                        border: '1px solid rgba(232,96,122,0.3)',
                        animation: 'pulse 0.8s infinite alternate',
                      }}
                    >
                      UNO!
                    </span>
                  )}
                </div>

                <div
                  style={{
                    display: 'flex',
                    gap: 8,
                    flexWrap: 'wrap',
                    paddingBottom: 4,
                  }}
                >
                  {myHand.map((card) => {
                    const playable = isMyTurn && topCard && isPlayable(card, topCard, currentColor)
                    return (
                      <div
                        key={card.id}
                        onClick={() => playable && handlePlayCard(card)}
                        style={{
                          cursor: playable ? 'pointer' : 'default',
                          opacity: isMyTurn && !playable ? 0.45 : 1,
                          transform: playable ? 'translateY(-6px)' : 'none',
                          transition: 'transform 0.15s, opacity 0.15s',
                          outline: playable ? '2.5px solid rgba(127,184,127,0.7)' : 'none',
                          outlineOffset: 3,
                          borderRadius: 14,
                        }}
                      >
                        <UnoCard color={card.color} type={card.type} value={card.value} />
                      </div>
                    )
                  })}
                </div>

                {isMyTurn && (
                  <p style={{ fontSize: 11, color: '#8B6914', marginTop: 10, fontWeight: 600 }}>
                    Cartas destacadas podem ser jogadas. Clique para jogar ou compre do deck.
                  </p>
                )}
              </div>
            </>
          )}

          {/* ── RESULTADO ────────────────────────────────────────────────── */}
          {isFinished && (
            <div style={{ textAlign: 'center', paddingTop: 24 }}>
              <p
                style={{
                  fontSize: 22,
                  fontWeight: 800,
                  color: winner === myUid ? '#4A7A4A' : '#e8607a',
                  marginBottom: 6,
                }}
              >
                {winner === myUid ? 'Você ganhou!' : `${winnerNick} ganhou!`}
              </p>
              <p style={{ fontSize: 13, color: '#8B6914', marginBottom: 28 }}>
                {winner === myUid ? 'Zerou a mão primeiro!' : `${winnerNick} zerou a mão primeiro.`}
              </p>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                <button
                  onClick={startGame}
                  disabled={!isHost}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 20px',
                    borderRadius: 10,
                    border: 'none',
                    background: isHost
                      ? 'linear-gradient(135deg,#7FB87F,#4A7A4A)'
                      : 'rgba(127,184,127,0.2)',
                    color: isHost ? 'white' : '#4A7A4A',
                    fontFamily: "'Baloo 2', sans-serif",
                    fontWeight: 800,
                    fontSize: 13,
                    cursor: isHost ? 'pointer' : 'default',
                    boxShadow: isHost ? '0 3px 10px rgba(74,122,74,0.25)' : 'none',
                  }}
                >
                  <RefreshCw size={13} />
                  {isHost ? 'Jogar de novo' : `Aguardando ${partnerNick}...`}
                </button>
                <button
                  onClick={async () => {
                    await leaveGame()
                    onClose()
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 16px',
                    borderRadius: 10,
                    border: '1.5px solid rgba(232,96,122,0.3)',
                    background: 'transparent',
                    color: '#e8607a',
                    fontFamily: "'Baloo 2', sans-serif",
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: 'pointer',
                  }}
                >
                  <LogOut size={13} />
                  Sair
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
