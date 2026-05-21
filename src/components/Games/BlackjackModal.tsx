import React, { useState } from 'react'
import { X, RefreshCw, LogOut, Coins, Zap } from 'lucide-react'
import { PlayingCard } from './cards/PlayingCard'
import { useBlackjack } from '../../hooks/useBlackjack'
import { handScore, type PlayingCard as PlayingCardType } from '../../lib/games'

// ─── Props ────────────────────────────────────────────────────────────────────

interface BlackjackModalProps {
  onClose: () => void
  roomId: string // uid do casal
  partnerUid: string
  partnerNick: string
  myNick: string
  myCoins: number
}

// ─── Helpers visuais ──────────────────────────────────────────────────────────

const OUTCOME_LABEL: Record<string, { text: string; color: string }> = {
  win: { text: 'Você ganhou!', color: '#7FB87F' },
  lose: { text: 'Você perdeu', color: '#e8607a' },
  push: { text: 'Empate!', color: '#C4956A' },
  bust: { text: 'Estourou!', color: '#e8607a' },
}

function ScoreTag({ score, busted }: { score: number; busted?: boolean }) {
  return (
    <span
      style={{
        fontFamily: "'Baloo 2', sans-serif",
        fontWeight: 800,
        fontSize: 13,
        background: busted ? 'rgba(232,96,122,0.18)' : 'rgba(127,184,127,0.18)',
        color: busted ? '#e8607a' : '#4A7A4A',
        border: `1px solid ${busted ? 'rgba(232,96,122,0.35)' : 'rgba(127,184,127,0.35)'}`,
        borderRadius: 8,
        padding: '1px 8px',
        display: 'inline-block',
      }}
    >
      {score > 21 ? `${score} — bust` : score}
    </span>
  )
}

function HandRow({
  cards,
  faceDownFirst = false,
  label,
  score,
  action,
}: {
  cards: PlayingCardType[]
  faceDownFirst?: boolean
  label: string
  score: number
  action?: string | null
}) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 8,
          fontFamily: "'Baloo 2', sans-serif",
          fontSize: 13,
          color: '#4A7A4A',
          fontWeight: 600,
        }}
      >
        <span>{label}</span>
        <ScoreTag score={score} busted={score > 21} />
        {action === 'stand' && (
          <span
            style={{
              fontSize: 11,
              background: 'rgba(196,149,106,0.15)',
              color: '#8B6914',
              padding: '1px 7px',
              borderRadius: 6,
              fontWeight: 700,
            }}
          >
            STAND
          </span>
        )}
        {action === 'bust' && (
          <span
            style={{
              fontSize: 11,
              background: 'rgba(232,96,122,0.15)',
              color: '#e8607a',
              padding: '1px 7px',
              borderRadius: 6,
              fontWeight: 700,
            }}
          >
            BUST
          </span>
        )}
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {cards.map((card, i) =>
          faceDownFirst && i === 0 ? (
            <PlayingCard key={i} suit={card.suit} value={card.value} faceDown />
          ) : (
            <PlayingCard key={i} suit={card.suit} value={card.value} />
          )
        )}
        {cards.length === 0 && (
          <div
            style={{
              width: 88,
              height: 132,
              borderRadius: 14,
              border: '2px dashed rgba(127,184,127,0.3)',
              background: 'rgba(232,245,232,0.4)',
            }}
          />
        )}
      </div>
    </div>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────

export const BlackjackModal: React.FC<BlackjackModalProps> = ({
  onClose,
  roomId,
  partnerUid,
  partnerNick,
  myNick,
  myCoins,
}) => {
  const {
    room,
    myUid,
    isHost,
    isMyTurn,
    myScore,
    partnerScore,
    myAction,
    myOutcome,
    partnerOutcome,
    loading,
    startGame,
    hit,
    stand,
    playAgain,
    leaveGame,
  } = useBlackjack({ roomId, partnerUid })

  const [bet, setBetLocal] = useState(0)

  const state = room?.state ?? 'idle'
  const myHand = myUid ? (room?.players?.[myUid]?.hand ?? []) : []
  const partnerHand = room?.players?.[partnerUid]?.hand ?? []
  const dealerHand = room?.dealer?.hand ?? []
  const partnerAction = room?.players?.[partnerUid]?.action ?? null

  const isResult = state === 'result'
  const isPlaying = state === 'player_turn'
  const isIdle = state === 'idle'
  const isDealer = state === 'dealer_turn'

  // ── Overlay ───────────────────────────────────────────────────────────────
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
          maxWidth: 560,
          maxHeight: '90vh',
          overflowY: 'auto',
          borderRadius: 20,
          background:
            'linear-gradient(160deg,rgba(245,236,215,0.98) 0%,rgba(232,245,232,0.98) 100%)',
          border: '1.5px solid rgba(196,149,106,0.35)',
          boxShadow: '0 24px 60px rgba(26,42,26,0.28), inset 0 1px 0 rgba(255,255,255,0.7)',
          padding: '0 0 24px',
          fontFamily: "'Baloo 2', sans-serif",
          position: 'relative',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px 14px',
            borderBottom: '1px solid rgba(196,149,106,0.2)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Zap size={18} color="#8B6914" />
            <span style={{ fontWeight: 800, fontSize: 17, color: '#2D4A2D' }}>21 — Blackjack</span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#4A7A4A',
              display: 'flex',
              alignItems: 'center',
              padding: 4,
            }}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: '20px 20px 0' }}>
          {/* ── IDLE — tela inicial ─────────────────────────────────────────── */}
          {isIdle && (
            <div style={{ textAlign: 'center', paddingTop: 16 }}>
              <div
                style={{
                  fontSize: 48,
                  marginBottom: 8,
                  filter: 'drop-shadow(0 2px 6px rgba(232,96,122,0.2))',
                }}
              >
                {/* decorativo — sem emoji funcional */}
              </div>
              <p
                style={{
                  fontSize: 14,
                  color: '#4A7A4A',
                  marginBottom: 24,
                  lineHeight: 1.6,
                }}
              >
                Cada jogador recebe 2 cartas. Chegue mais perto de 21 sem estourar!
              </p>

              {/* Aposta */}
              <div style={{ marginBottom: 20 }}>
                <p style={{ fontSize: 12, color: '#8B6914', fontWeight: 700, marginBottom: 8 }}>
                  Aposta opcional
                </p>
                <div
                  style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}
                >
                  {[0, 5, 10, 25, 50].map((v) => (
                    <button
                      key={v}
                      onClick={() => setBetLocal(v)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        padding: '5px 12px',
                        borderRadius: 10,
                        border: `1.5px solid ${bet === v ? '#7FB87F' : 'rgba(127,184,127,0.3)'}`,
                        background: bet === v ? 'rgba(127,184,127,0.15)' : 'transparent',
                        cursor: 'pointer',
                        fontFamily: "'Baloo 2', sans-serif",
                        fontWeight: 700,
                        fontSize: 13,
                        color: bet === v ? '#2D4A2D' : '#4A7A4A',
                      }}
                    >
                      {v === 0 ? (
                        'Sem aposta'
                      ) : (
                        <>
                          <Coins size={12} />
                          {v}
                        </>
                      )}
                    </button>
                  ))}
                </div>
                {bet > 0 && (
                  <p style={{ fontSize: 11, color: '#C4956A', marginTop: 6 }}>
                    Suas moedas: {myCoins} — apostando {bet}
                  </p>
                )}
              </div>

              <button
                onClick={() => startGame(bet)}
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
                {loading ? 'Iniciando...' : 'Iniciar Partida'}
              </button>

              {!isHost && room && (
                <p style={{ fontSize: 12, color: '#C4956A', marginTop: 12 }}>
                  Aguardando {partnerNick} iniciar...
                </p>
              )}
            </div>
          )}

          {/* ── JOGANDO / RESULT / DEALER ───────────────────────────────────── */}
          {(isPlaying || isResult || isDealer) && (
            <>
              {/* Dealer */}
              <HandRow
                cards={dealerHand}
                faceDownFirst={isPlaying}
                label="Dealer"
                score={isPlaying ? handScore(dealerHand.slice(1)) : handScore(dealerHand)}
              />

              <div
                style={{
                  height: 1,
                  background: 'rgba(196,149,106,0.25)',
                  margin: '4px 0 16px',
                }}
              />

              {/* Parceiro */}
              <HandRow
                cards={partnerHand}
                label={partnerNick}
                score={partnerScore}
                action={partnerAction}
              />

              {/* Você */}
              <HandRow
                cards={myHand}
                label={`${myNick} (você)`}
                score={myScore}
                action={myAction}
              />

              {/* Botões de ação */}
              {isPlaying && isMyTurn && (
                <div
                  style={{
                    display: 'flex',
                    gap: 10,
                    marginTop: 8,
                    justifyContent: 'center',
                  }}
                >
                  <button
                    onClick={hit}
                    style={{
                      padding: '10px 28px',
                      borderRadius: 12,
                      border: 'none',
                      background: 'linear-gradient(135deg,#e8607a,#c84060)',
                      color: 'white',
                      fontFamily: "'Baloo 2', sans-serif",
                      fontWeight: 800,
                      fontSize: 15,
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(232,96,122,0.3)',
                    }}
                  >
                    Pedir carta
                  </button>
                  <button
                    onClick={stand}
                    style={{
                      padding: '10px 28px',
                      borderRadius: 12,
                      border: '1.5px solid rgba(139,105,20,0.4)',
                      background: 'rgba(245,236,215,0.8)',
                      color: '#8B6914',
                      fontFamily: "'Baloo 2', sans-serif",
                      fontWeight: 800,
                      fontSize: 15,
                      cursor: 'pointer',
                    }}
                  >
                    Parar
                  </button>
                </div>
              )}

              {isPlaying && !isMyTurn && myAction !== null && (
                <p
                  style={{
                    textAlign: 'center',
                    fontSize: 13,
                    color: '#8B6914',
                    fontWeight: 600,
                    marginTop: 12,
                  }}
                >
                  Aguardando {partnerNick}...
                </p>
              )}

              {isDealer && (
                <p
                  style={{
                    textAlign: 'center',
                    fontSize: 13,
                    color: '#4A7A4A',
                    fontWeight: 600,
                    marginTop: 12,
                  }}
                >
                  Dealer jogando...
                </p>
              )}

              {/* Resultado */}
              {isResult && (
                <div
                  style={{
                    marginTop: 16,
                    padding: '16px 20px',
                    borderRadius: 14,
                    background: 'rgba(255,255,255,0.5)',
                    border: '1px solid rgba(196,149,106,0.25)',
                    textAlign: 'center',
                  }}
                >
                  <p
                    style={{
                      fontSize: 11,
                      color: '#8B6914',
                      fontWeight: 700,
                      marginBottom: 10,
                      letterSpacing: 1,
                      textTransform: 'uppercase',
                    }}
                  >
                    Resultado
                  </p>

                  <div
                    style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}
                  >
                    {myOutcome && (
                      <div
                        style={{
                          padding: '8px 16px',
                          borderRadius: 10,
                          background:
                            myOutcome === 'win'
                              ? 'rgba(127,184,127,0.2)'
                              : myOutcome === 'push'
                                ? 'rgba(196,149,106,0.2)'
                                : 'rgba(232,96,122,0.15)',
                          border: `1.5px solid ${
                            myOutcome === 'win'
                              ? 'rgba(127,184,127,0.4)'
                              : myOutcome === 'push'
                                ? 'rgba(196,149,106,0.4)'
                                : 'rgba(232,96,122,0.3)'
                          }`,
                        }}
                      >
                        <p style={{ fontSize: 11, color: '#8B6914', fontWeight: 700 }}>{myNick}</p>
                        <p
                          style={{
                            fontSize: 15,
                            fontWeight: 800,
                            color: OUTCOME_LABEL[myOutcome].color,
                          }}
                        >
                          {OUTCOME_LABEL[myOutcome].text}
                        </p>
                      </div>
                    )}

                    {partnerOutcome && (
                      <div
                        style={{
                          padding: '8px 16px',
                          borderRadius: 10,
                          background:
                            partnerOutcome === 'win'
                              ? 'rgba(127,184,127,0.2)'
                              : partnerOutcome === 'push'
                                ? 'rgba(196,149,106,0.2)'
                                : 'rgba(232,96,122,0.15)',
                          border: `1.5px solid ${
                            partnerOutcome === 'win'
                              ? 'rgba(127,184,127,0.4)'
                              : partnerOutcome === 'push'
                                ? 'rgba(196,149,106,0.4)'
                                : 'rgba(232,96,122,0.3)'
                          }`,
                        }}
                      >
                        <p style={{ fontSize: 11, color: '#8B6914', fontWeight: 700 }}>
                          {partnerNick}
                        </p>
                        <p
                          style={{
                            fontSize: 15,
                            fontWeight: 800,
                            color: OUTCOME_LABEL[partnerOutcome].color,
                          }}
                        >
                          {OUTCOME_LABEL[partnerOutcome].text}
                        </p>
                      </div>
                    )}
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      gap: 10,
                      justifyContent: 'center',
                      marginTop: 16,
                    }}
                  >
                    <button
                      onClick={playAgain}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '8px 20px',
                        borderRadius: 10,
                        border: 'none',
                        background: 'linear-gradient(135deg,#7FB87F,#4A7A4A)',
                        color: 'white',
                        fontFamily: "'Baloo 2', sans-serif",
                        fontWeight: 800,
                        fontSize: 13,
                        cursor: 'pointer',
                        boxShadow: '0 3px 10px rgba(74,122,74,0.25)',
                      }}
                    >
                      <RefreshCw size={13} />
                      Jogar de novo
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
            </>
          )}
        </div>
      </div>
    </div>
  )
}
