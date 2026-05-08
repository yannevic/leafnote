import { useState, useCallback } from 'react'
import { FLOWERS, FlowerType, getFlowerFromSum } from '../../lib/garden'
import { TbPlant2 } from 'react-icons/tb'

const RARITY_COLOR: Record<string, string> = {
  comum: '#3d7a3d',
  incomum: '#8b6914',
  rara: '#c87090',
  epica: '#7a3040',
}

interface DieFaceProps {
  value: number
  isRolling: boolean
}

const FACES = [
  [{ cx: 50, cy: 50 }],
  [
    { cx: 28, cy: 28 },
    { cx: 72, cy: 72 },
  ],
  [
    { cx: 28, cy: 28 },
    { cx: 50, cy: 50 },
    { cx: 72, cy: 72 },
  ],
  [
    { cx: 28, cy: 28 },
    { cx: 72, cy: 28 },
    { cx: 28, cy: 72 },
    { cx: 72, cy: 72 },
  ],
  [
    { cx: 28, cy: 28 },
    { cx: 72, cy: 28 },
    { cx: 50, cy: 50 },
    { cx: 28, cy: 72 },
    { cx: 72, cy: 72 },
  ],
  [
    { cx: 28, cy: 22 },
    { cx: 72, cy: 22 },
    { cx: 28, cy: 50 },
    { cx: 72, cy: 50 },
    { cx: 28, cy: 78 },
    { cx: 72, cy: 78 },
  ],
]

function DieFace({ value, isRolling }: DieFaceProps) {
  const dots = FACES[value - 1]
  return (
    <div
      style={{
        width: 72,
        height: 72,
        background: 'var(--color-bark-100)',
        border: '2px solid var(--color-wood-300)',
        borderRadius: 14,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 8,
        boxShadow: '0 4px 12px rgba(44,24,16,0.15), inset 0 1px 0 rgba(255,255,255,0.6)',
        animation: isRolling ? 'seedDiceShake 0.5s ease-in-out' : 'none',
      }}
    >
      <svg
        viewBox="0 0 100 100"
        width="100%"
        height="100%"
        style={{ opacity: isRolling ? 0 : 1, transition: 'opacity 0.1s' }}
      >
        {dots.map((dot) => (
          <circle
            key={`${dot.cx}-${dot.cy}`}
            cx={dot.cx}
            cy={dot.cy}
            r={8}
            fill="var(--color-leaf-800)"
          />
        ))}
      </svg>
    </div>
  )
}

type ModalState = 'idle' | 'rolling' | 'waiting' | 'result'

interface SeedRollModalProps {
  // Para eventos de estágio
  eventId?: string
  plantName?: string
  newStage?: number
  // Para welcome seed
  isWelcome?: boolean
  // Contexto
  panicMode: boolean
  partnerName: string
  partnerAlreadyRolled: boolean
  iAlreadyRolled: boolean
  onRoll: (roll: number) => Promise<{ done: boolean; flowerType: FlowerType | null }>
  onClose: () => void
}

export default function SeedRollModal({
  eventId: _eventId,
  plantName,
  newStage,
  isWelcome = false,
  panicMode,
  partnerName,
  partnerAlreadyRolled,
  iAlreadyRolled,
  onRoll,
  onClose,
}: SeedRollModalProps) {
  const diceCount = panicMode ? 2 : 1
  const [values, setValues] = useState<number[]>(Array.from({ length: diceCount }, () => 1))
  const [modalState, setModalState] = useState<ModalState>(iAlreadyRolled ? 'waiting' : 'idle')
  const [flowerResult, setFlowerResult] = useState<FlowerType | null>(null)

  const roll = useCallback(async () => {
    if (modalState !== 'idle') return
    setModalState('rolling')

    try {
      const finalValues = Array.from({ length: diceCount }, () => Math.floor(Math.random() * 6) + 1)
      setValues(finalValues)

      const myRoll = panicMode ? finalValues[0] + finalValues[1] : finalValues[0]

      const result = await onRoll(myRoll)

      if (result.done && result.flowerType) {
        setFlowerResult(result.flowerType)
        setModalState('result')
      } else {
        setModalState('waiting')
      }
    } catch (err) {
      console.error('Erro no roll:', err)
      setModalState('idle')
    }
  }, [modalState, diceCount, panicMode, onRoll])

  // Quando parceiro rola enquanto estamos em waiting
  if (modalState === 'waiting' && partnerAlreadyRolled && flowerResult == null) {
    setModalState('result')
  }

  const isRolling = modalState === 'rolling'
  const canRoll = modalState === 'idle'

  const titleText = () => {
    if (isWelcome) return 'Bem-vindos ao jardim!'
    return `${plantName} subiu para o estágio ${newStage}!`
  }

  const subtitleText = () => {
    if (isWelcome) return 'Role o dado para descobrir sua primeira semente'
    return 'Role o dado para ganhar uma semente'
  }

  const previewFlower = flowerResult
    ? FLOWERS[flowerResult]
    : values.length > 0
      ? FLOWERS[getFlowerFromSum(panicMode ? values[0] + values[1] : values[0])]
      : null

  // Fechar: reseta estado local antes de chamar onClose
  // Isso permite que o próximo evento abra o modal limpo
  const handleClose = () => {
    setModalState('idle')
    setFlowerResult(null)
    setValues(Array.from({ length: diceCount }, () => 1))
    onClose()
  }

  return (
    <>
      <style>{`
        @keyframes seedDiceShake {
          0%   { transform: rotate(0deg)   scale(1);    }
          15%  { transform: rotate(-12deg) scale(1.08); }
          30%  { transform: rotate(10deg)  scale(1.1);  }
          45%  { transform: rotate(-8deg)  scale(1.08); }
          60%  { transform: rotate(6deg)   scale(1.05); }
          75%  { transform: rotate(-4deg)  scale(1.02); }
          90%  { transform: rotate(2deg)   scale(1.01); }
          100% { transform: rotate(0deg)   scale(1);    }
        }
        @keyframes seedPop {
          0%   { transform: scale(0.7); opacity: 0; }
          70%  { transform: scale(1.15); }
          100% { transform: scale(1);   opacity: 1; }
        }
      `}</style>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.55)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 300,
        }}
      >
        <div
          style={{
            background: 'var(--color-bark-100)',
            border: '2px solid var(--color-wood-300)',
            borderRadius: 20,
            padding: '28px 28px 24px',
            width: 320,
            fontFamily: 'Baloo 2, sans-serif',
            boxShadow: '0 12px 48px rgba(0,0,0,0.25)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 16,
          }}
        >
          {/* Título */}
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: 'var(--color-leaf-950)',
                marginBottom: 4,
              }}
            >
              {titleText()}
            </div>
            <div style={{ fontSize: 13, color: 'var(--color-bark-700)' }}>{subtitleText()}</div>
            {panicMode && (
              <div style={{ fontSize: 11, color: '#c87090', marginTop: 4, fontWeight: 600 }}>
                Modo pânico ativo — rolando pelos dois
              </div>
            )}
          </div>

          {/* Dados */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            {values.map((v, i) => (
              // eslint-disable-next-line react/no-array-index-key
              <DieFace key={`seed-die-${i}`} value={v} isRolling={isRolling} />
            ))}
          </div>

          {/* Preview da flor */}
          {modalState === 'idle' && previewFlower && (
            <div style={{ fontSize: 12, color: 'var(--color-bark-700)', opacity: 0.6 }}>
              Role para descobrir qual flor você ganha
            </div>
          )}

          {/* Resultado com flor conhecida */}
          {modalState === 'result' && flowerResult && (
            <div
              style={{
                textAlign: 'center',
                animation: 'seedPop 0.4s ease-out',
                background: 'var(--color-leaf-100)',
                borderRadius: 12,
                padding: '10px 20px',
                border: '1.5px solid var(--color-leaf-400)',
              }}
            >
              <TbPlant2
                size={28}
                color={RARITY_COLOR[FLOWERS[flowerResult].rarity]}
                style={{ margin: '0 auto 4px' }}
              />
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-leaf-950)' }}>
                Semente de {FLOWERS[flowerResult].name}!
              </div>
              <div style={{ fontSize: 11, color: 'var(--color-bark-700)', marginTop: 2 }}>
                adicionada ao estoque do jardim
              </div>
            </div>
          )}

          {/* Resultado quando parceiro concluiu (sem saber a flor localmente) */}
          {modalState === 'result' && !flowerResult && (
            <div
              style={{
                textAlign: 'center',
                animation: 'seedPop 0.4s ease-out',
                background: 'var(--color-leaf-100)',
                borderRadius: 12,
                padding: '10px 20px',
                border: '1.5px solid var(--color-leaf-400)',
              }}
            >
              <div style={{ fontSize: 24, marginBottom: 4 }}>🌰</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-leaf-950)' }}>
                Semente adicionada ao jardim!
              </div>
              <div style={{ fontSize: 11, color: 'var(--color-bark-700)', marginTop: 2 }}>
                veja no estoque abaixo
              </div>
            </div>
          )}

          {/* Aguardando parceiro */}
          {modalState === 'waiting' && (
            <div
              style={{
                textAlign: 'center',
                fontSize: 13,
                color: 'var(--color-bark-700)',
                fontWeight: 600,
              }}
            >
              Aguardando {partnerName} rolar...
            </div>
          )}

          {/* Status do parceiro */}
          {modalState === 'idle' && partnerAlreadyRolled && !panicMode && (
            <div style={{ fontSize: 12, color: 'var(--color-leaf-600)', fontWeight: 600 }}>
              {partnerName} já rolou — sua vez!
            </div>
          )}

          {/* Botões */}
          {canRoll && (
            <button
              onClick={roll}
              style={{
                width: '100%',
                padding: '10px 0',
                borderRadius: 12,
                background: 'var(--color-leaf-600)',
                color: '#fff',
                fontFamily: 'Baloo 2, sans-serif',
                fontWeight: 700,
                fontSize: 15,
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 3px 8px rgba(74,122,74,0.35)',
              }}
            >
              Rolar
            </button>
          )}

          {isRolling && (
            <div style={{ fontSize: 13, color: 'var(--color-bark-700)', fontWeight: 600 }}>
              Rolando...
            </div>
          )}

          {modalState === 'result' && (
            <button
              onClick={handleClose}
              style={{
                width: '100%',
                padding: '8px 0',
                borderRadius: 12,
                background: '#f0e8d8',
                border: '1.5px solid var(--color-wood-300)',
                color: 'var(--color-bark-700)',
                fontFamily: 'Baloo 2, sans-serif',
                fontWeight: 600,
                fontSize: 14,
                cursor: 'pointer',
              }}
            >
              Fechar
            </button>
          )}
        </div>
      </div>
    </>
  )
}
