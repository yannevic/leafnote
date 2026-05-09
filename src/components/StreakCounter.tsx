import { useState } from 'react'
import { useStreak } from '../hooks/useStreak'
import {
  Bird,
  Lock,
  Gift,
  CalendarDays,
  HeartCrack,
  Star,
  Trophy,
  Heart,
  X,
  ChevronRight,
} from 'lucide-react'

const MILESTONES = [
  {
    days: 7,
    title: '1 semana!',
    prize: 'Escrevam uma cartinha fofa um pro outro e escolham juntos um prêmio especial',
  },
  {
    days: 14,
    title: '2 semanas!',
    prize: 'Peçam a comida favorita de cada um e jantem juntos em chamada',
  },
  {
    days: 21,
    title: '3 semanas!',
    prize: 'Noite de jogos relaxantes juntos em chamada — escolham um jogo fofo pra jogar',
  },
  {
    days: 30,
    title: '1 mês! Super prêmio!',
    prize:
      'Filme com pipoca ao mesmo tempo em chamada e noite especial — e uma semente épica foi adicionada ao jardim de vocês!',
  },
]

function getMilestone(days: number) {
  return [...MILESTONES].reverse().find((m) => days >= m.days) ?? null
}

function getNext(days: number) {
  return MILESTONES.find((m) => days < m.days) ?? null
}

// Gradiente da barra por urgência (igual CountdownPin)
const BAR_GRADIENT = 'linear-gradient(90deg, #e8607a, #fda4b4)'

export default function StreakCounter() {
  const { streak, loading, days, setStart, reset } = useStreak()
  const [showPanel, setShowPanel] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [dateInput, setDateInput] = useState('')
  const [showMilestone, setShowMilestone] = useState(false)

  const milestone = getMilestone(days)
  const next = getNext(days)

  const handleSetDate = async () => {
    if (!dateInput) return
    await setStart(new Date(dateInput).toISOString())
    setShowDatePicker(false)
  }

  const handleReset = async () => {
    await reset()
    setShowConfirm(false)
    setShowPanel(false)
  }

  const progressPct = next
    ? Math.min(100, ((days - (milestone?.days ?? 0)) / (next.days - (milestone?.days ?? 0))) * 100)
    : 100

  if (loading) return null

  return (
    <>
      {/* ── Botão flutuante (mini-pin) ── */}
      <div
        data-item
        onClick={(e) => {
          e.stopPropagation()
          setShowPanel((v) => !v)
        }}
        style={{
          position: 'fixed',
          top: 48,
          left: 14,
          zIndex: 48,
          background: 'rgba(253,242,246,0.82)',
          border: '1.5px solid rgba(232,160,176,0.35)',
          borderRadius: 14,
          overflow: 'hidden',
          boxShadow: '0 2px 12px rgba(200,120,140,0.10)',
          cursor: 'pointer',
          fontFamily: 'Baloo 2, sans-serif',
          userSelect: 'none',
          minWidth: 120,
        }}
      >
        {/* barra de cor no topo */}
        <div style={{ height: 3, background: BAR_GRADIENT, width: '100%' }} />

        <div style={{ padding: '7px 13px 8px', display: 'flex', alignItems: 'center', gap: 7 }}>
          <Bird size={15} strokeWidth={2} style={{ color: 'rgba(122,48,64,0.6)', flexShrink: 0 }} />
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: '#3d1a10' }}>
              {streak?.startDate ? `${days} dia${days !== 1 ? 's' : ''}` : 'definir data'}
            </span>
            <span
              style={{
                fontSize: 9,
                fontWeight: 800,
                color: 'rgba(122,48,64,0.55)',
                textTransform: 'uppercase',
                letterSpacing: '0.8px',
              }}
            >
              sem brigar
            </span>
          </div>
        </div>
      </div>

      {/* ── Painel expandido ── */}
      {showPanel && (
        <div
          style={{
            position: 'fixed',
            top: 96,
            left: 14,
            zIndex: 48,
            width: 280,
            background:
              'linear-gradient(160deg, rgba(253,246,240,0.45) 0%, rgba(252,232,238,0.40) 100%)',
            border: '1.5px solid rgba(232,160,176,0.4)',
            borderRadius: 20,
            boxShadow: '0 8px 40px rgba(200,120,140,0.18), inset 0 1px 0 rgba(255,255,255,0.45)',
            backdropFilter: 'blur(32px) saturate(1.8)',
            WebkitBackdropFilter: 'blur(32px) saturate(1.8)',
            fontFamily: 'Baloo 2, sans-serif',
            overflow: 'hidden',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* barra de cor no topo */}
          <div style={{ height: 3, background: BAR_GRADIENT, width: '100%' }} />

          {/* Header */}
          <div style={{ padding: '14px 16px 12px', position: 'relative' }}>
            {/* botão fechar */}
            <button
              onClick={() => setShowPanel(false)}
              style={{
                position: 'absolute',
                top: 12,
                right: 12,
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
            >
              <X size={10} color="rgba(122,48,64,0.6)" strokeWidth={2.5} />
            </button>

            {/* sublabel */}
            <div
              style={{
                fontSize: 9,
                fontWeight: 800,
                color: 'rgba(122,48,64,0.55)',
                textTransform: 'uppercase',
                letterSpacing: '0.8px',
                marginBottom: 3,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <Bird size={10} strokeWidth={2} color="rgba(122,48,64,0.55)" />
              dias sem brigar
            </div>

            {/* contador grande */}
            <div
              style={{
                fontSize: 36,
                fontWeight: 900,
                color: '#3d1a10',
                lineHeight: 1.1,
                marginBottom: 2,
              }}
            >
              {streak?.startDate ? days : '—'}
              {streak?.startDate && (
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    marginLeft: 6,
                    color: 'rgba(61,26,16,0.5)',
                  }}
                >
                  dia{days !== 1 ? 's' : ''}
                </span>
              )}
            </div>

            {/* barra de progresso pro próximo marco */}
            {streak?.startDate && next && (
              <div style={{ marginTop: 8 }}>
                <div
                  style={{
                    fontSize: 9,
                    fontWeight: 800,
                    color: 'rgba(122,48,64,0.55)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.6px',
                    marginBottom: 5,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <ChevronRight size={9} strokeWidth={2.5} color="rgba(122,48,64,0.55)" />
                  próximo marco: {next.days} dias
                </div>
                <div
                  style={{
                    height: 5,
                    background: 'rgba(232,160,176,0.25)',
                    borderRadius: 99,
                    overflow: 'hidden',
                    border: '1px solid rgba(232,160,176,0.2)',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${progressPct}%`,
                      background: BAR_GRADIENT,
                      borderRadius: 99,
                      transition: 'width 0.6s ease',
                    }}
                  />
                </div>
              </div>
            )}

            {streak?.startDate && !next && (
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  color: 'rgba(122,48,64,0.55)',
                  marginTop: 6,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <Star size={10} strokeWidth={2} color="rgba(122,48,64,0.55)" />
                todos os marcos conquistados!
              </div>
            )}
          </div>

          {/* separador */}
          <div style={{ borderTop: '2px dashed rgba(232,160,176,0.4)', margin: '0 16px' }} />

          {/* Marco atual */}
          {milestone && (
            <>
              <div
                onClick={() => setShowMilestone(true)}
                style={{
                  padding: '10px 16px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  background: 'rgba(253,242,246,0.5)',
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 10,
                    background: 'rgba(232,160,176,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Trophy size={15} strokeWidth={2} color="rgba(122,48,64,0.7)" />
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: '#3d1a10' }}>
                    {milestone.title}
                  </div>
                  <div
                    style={{
                      fontSize: 10,
                      color: 'rgba(122,48,64,0.55)',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 3,
                    }}
                  >
                    <Gift size={9} strokeWidth={2} color="rgba(122,48,64,0.55)" />
                    toque pra ver o prêmio
                  </div>
                </div>
              </div>

              {/* separador */}
              <div style={{ borderTop: '2px dashed rgba(232,160,176,0.4)', margin: '0 16px' }} />
            </>
          )}

          {/* Marcos */}
          <div style={{ padding: '10px 16px' }}>
            <div
              style={{
                fontSize: 9,
                fontWeight: 800,
                color: 'rgba(122,48,64,0.55)',
                textTransform: 'uppercase',
                letterSpacing: '0.8px',
                marginBottom: 7,
              }}
            >
              marcos
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {MILESTONES.map((m) => {
                const reached = days >= m.days
                return (
                  <div
                    key={m.days}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      opacity: reached ? 1 : 0.4,
                    }}
                  >
                    {reached ? (
                      <Trophy size={12} strokeWidth={2} color="rgba(122,48,64,0.7)" />
                    ) : (
                      <Lock size={12} strokeWidth={2} color="rgba(122,48,64,0.5)" />
                    )}
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: reached ? '#3d1a10' : 'rgba(61,26,16,0.4)',
                        fontFamily: 'Baloo 2, sans-serif',
                      }}
                    >
                      {m.days} dias — {m.title}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* separador */}
          <div style={{ borderTop: '2px dashed rgba(232,160,176,0.4)', margin: '0 16px' }} />

          {/* Ações */}
          <div style={{ padding: '10px 16px', display: 'flex', flexDirection: 'column', gap: 7 }}>
            {!streak?.startDate ? (
              <button
                onClick={() => setShowDatePicker(true)}
                style={{
                  padding: '7px 0',
                  borderRadius: 10,
                  background: 'rgba(232,160,176,0.55)',
                  border: 'none',
                  color: '#3d1a10',
                  fontWeight: 800,
                  fontSize: 12,
                  cursor: 'pointer',
                  fontFamily: 'Baloo 2, sans-serif',
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                }}
              >
                <CalendarDays size={13} strokeWidth={2} />
                definir data de início
              </button>
            ) : (
              <button
                onClick={() => setShowDatePicker(true)}
                style={{
                  padding: '6px 0',
                  borderRadius: 10,
                  background: 'transparent',
                  border: '1.5px solid rgba(232,160,176,0.4)',
                  color: 'rgba(61,26,16,0.5)',
                  fontWeight: 800,
                  fontSize: 11,
                  cursor: 'pointer',
                  fontFamily: 'Baloo 2, sans-serif',
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                }}
              >
                <CalendarDays size={12} strokeWidth={2} />
                alterar data
              </button>
            )}

            {streak?.startDate && (
              <button
                onClick={() => setShowConfirm(true)}
                style={{
                  padding: '6px 0',
                  borderRadius: 10,
                  background: 'rgba(232,96,122,0.12)',
                  border: 'none',
                  color: '#e8607a',
                  fontWeight: 800,
                  fontSize: 11,
                  cursor: 'pointer',
                  fontFamily: 'Baloo 2, sans-serif',
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                }}
              >
                <HeartCrack size={12} strokeWidth={2} />
                brigamos
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Modal: escolher data ── */}
      {showDatePicker && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(44,20,8,0.35)',
            backdropFilter: 'blur(4px)',
            zIndex: 300,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onClick={() => setShowDatePicker(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background:
                'linear-gradient(160deg, rgba(253,246,240,0.97) 0%, rgba(252,232,238,0.97) 100%)',
              border: '1.5px solid rgba(232,160,176,0.4)',
              borderRadius: 20,
              padding: '24px 28px',
              boxShadow: '0 8px 40px rgba(200,120,140,0.2), inset 0 1px 0 rgba(255,255,255,0.6)',
              backdropFilter: 'blur(18px) saturate(1.4)',
              fontFamily: 'Baloo 2, sans-serif',
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
              minWidth: 280,
            }}
          >
            <div
              style={{
                fontSize: 15,
                fontWeight: 800,
                color: '#3d1a10',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <CalendarDays size={15} strokeWidth={2} color="rgba(122,48,64,0.6)" />
              quando foi o último desentendimento?
            </div>
            <div
              style={{
                fontSize: 9,
                fontWeight: 800,
                color: 'rgba(122,48,64,0.55)',
                textTransform: 'uppercase',
                letterSpacing: '0.8px',
              }}
            >
              escolha a data de início do contador
            </div>
            <input
              type="date"
              value={dateInput}
              onChange={(e) => setDateInput(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              style={{
                padding: '8px 12px',
                borderRadius: 10,
                border: '1.5px solid rgba(232,160,176,0.4)',
                fontSize: 13,
                fontFamily: 'Baloo 2, sans-serif',
                color: '#3d1a10',
                outline: 'none',
                background: 'rgba(253,242,246,0.7)',
                fontWeight: 600,
              }}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => setShowDatePicker(false)}
                style={{
                  flex: 1,
                  padding: '7px 0',
                  borderRadius: 10,
                  background: 'transparent',
                  border: '1.5px solid rgba(232,160,176,0.4)',
                  color: 'rgba(61,26,16,0.5)',
                  fontWeight: 800,
                  fontSize: 12,
                  cursor: 'pointer',
                  fontFamily: 'Baloo 2, sans-serif',
                }}
              >
                cancelar
              </button>
              <button
                onClick={handleSetDate}
                style={{
                  flex: 1,
                  padding: '7px 0',
                  borderRadius: 10,
                  background: 'rgba(232,160,176,0.55)',
                  border: 'none',
                  color: '#3d1a10',
                  fontWeight: 800,
                  fontSize: 12,
                  cursor: 'pointer',
                  fontFamily: 'Baloo 2, sans-serif',
                }}
              >
                salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: confirmar reset ── */}
      {showConfirm && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(44,20,8,0.28)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            zIndex: 300,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onClick={() => setShowConfirm(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background:
                'linear-gradient(160deg, rgba(253,246,240,0.78) 0%, rgba(252,232,238,0.74) 100%)',
              border: '1.5px solid rgba(232,160,176,0.45)',
              borderRadius: 20,
              boxShadow: '0 8px 40px rgba(200,120,140,0.22), inset 0 1px 0 rgba(255,255,255,0.6)',
              backdropFilter: 'blur(28px) saturate(1.7)',
              WebkitBackdropFilter: 'blur(28px) saturate(1.7)',
              fontFamily: 'Baloo 2, sans-serif',
              width: 240,
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            {/* barra de cor no topo */}
            <div style={{ height: 3, background: BAR_GRADIENT, width: '100%' }} />

            {/* botão fechar */}
            <button
              onClick={() => setShowConfirm(false)}
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
            >
              <X size={10} color="rgba(122,48,64,0.6)" strokeWidth={2.5} />
            </button>

            <div
              style={{
                padding: '14px 16px 16px',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
                alignItems: 'center',
                textAlign: 'center',
              }}
            >
              {/* ícone */}
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: 'rgba(232,96,122,0.12)',
                  border: '1.5px solid rgba(232,96,122,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <HeartCrack size={18} strokeWidth={1.8} color="#e8607a" />
              </div>

              {/* título */}
              <div style={{ fontSize: 14, fontWeight: 900, color: '#3d1a10' }}>tem certeza?</div>

              {/* separador */}
              <div style={{ borderTop: '2px dashed rgba(232,160,176,0.4)', width: '100%' }} />

              {/* texto */}
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: 'rgba(61,26,16,0.65)',
                  lineHeight: 1.55,
                  background: 'rgba(253,242,246,0.55)',
                  border: '1.5px solid rgba(232,160,176,0.25)',
                  borderRadius: 10,
                  padding: '8px 11px',
                  width: '100%',
                  textAlign: 'left',
                }}
              >
                isso vai zerar o contador e reiniciar do zero hoje. mas tá tudo bem, a gente se
                resolve!
              </div>

              {/* botões */}
              <div style={{ display: 'flex', gap: 7, width: '100%' }}>
                <button
                  onClick={() => setShowConfirm(false)}
                  style={{
                    flex: 1,
                    padding: '6px 0',
                    borderRadius: 10,
                    background: 'transparent',
                    border: '1.5px solid rgba(232,160,176,0.4)',
                    color: 'rgba(61,26,16,0.5)',
                    fontWeight: 800,
                    fontSize: 11,
                    cursor: 'pointer',
                    fontFamily: 'Baloo 2, sans-serif',
                  }}
                >
                  cancelar
                </button>
                <button
                  onClick={handleReset}
                  style={{
                    flex: 1,
                    padding: '6px 0',
                    borderRadius: 10,
                    background: 'rgba(232,96,122,0.12)',
                    border: 'none',
                    color: '#e8607a',
                    fontWeight: 800,
                    fontSize: 11,
                    cursor: 'pointer',
                    fontFamily: 'Baloo 2, sans-serif',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 5,
                  }}
                >
                  <HeartCrack size={11} strokeWidth={2} />
                  brigamos
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: prêmio do marco ── */}
      {showMilestone && milestone && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(44,20,8,0.28)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            zIndex: 300,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onClick={() => setShowMilestone(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background:
                'linear-gradient(160deg, rgba(253,246,240,0.78) 0%, rgba(252,232,238,0.74) 100%)',
              border: '1.5px solid rgba(232,160,176,0.45)',
              borderRadius: 20,
              boxShadow: '0 8px 40px rgba(200,120,140,0.22), inset 0 1px 0 rgba(255,255,255,0.6)',
              backdropFilter: 'blur(28px) saturate(1.7)',
              WebkitBackdropFilter: 'blur(28px) saturate(1.7)',
              fontFamily: 'Baloo 2, sans-serif',
              width: 240,
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            {/* barra de cor no topo */}
            <div style={{ height: 3, background: BAR_GRADIENT, width: '100%' }} />

            {/* botão fechar */}
            <button
              onClick={() => setShowMilestone(false)}
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
            >
              <X size={10} color="rgba(122,48,64,0.6)" strokeWidth={2.5} />
            </button>

            <div
              style={{
                padding: '14px 16px 16px',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
                alignItems: 'center',
                textAlign: 'center',
              }}
            >
              {/* ícone */}
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: 'rgba(232,160,176,0.2)',
                  border: '1.5px solid rgba(232,160,176,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Trophy size={18} strokeWidth={1.8} color="rgba(122,48,64,0.65)" />
              </div>

              {/* título */}
              <div style={{ fontSize: 14, fontWeight: 900, color: '#3d1a10', lineHeight: 1.2 }}>
                {milestone.title}
              </div>

              {/* separador */}
              <div style={{ borderTop: '2px dashed rgba(232,160,176,0.4)', width: '100%' }} />

              {/* prêmio */}
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: 'rgba(61,26,16,0.65)',
                  lineHeight: 1.55,
                  background: 'rgba(253,242,246,0.55)',
                  border: '1.5px solid rgba(232,160,176,0.25)',
                  borderRadius: 10,
                  padding: '8px 11px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 6,
                  textAlign: 'left',
                  width: '100%',
                }}
              >
                <Gift
                  size={11}
                  strokeWidth={2}
                  color="rgba(122,48,64,0.5)"
                  style={{ flexShrink: 0, marginTop: 2 }}
                />
                {milestone.prize}
              </div>

              {/* botão */}
              <button
                onClick={() => setShowMilestone(false)}
                style={{
                  padding: '6px 20px',
                  borderRadius: 10,
                  background: 'rgba(232,160,176,0.55)',
                  border: 'none',
                  color: '#3d1a10',
                  fontWeight: 800,
                  fontSize: 11,
                  cursor: 'pointer',
                  fontFamily: 'Baloo 2, sans-serif',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                }}
              >
                <Heart size={11} strokeWidth={2} />
                que fofinho!
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
