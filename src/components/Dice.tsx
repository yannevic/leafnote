import { useState, useCallback } from 'react'
import { Dices, Swords } from 'lucide-react'
import { useSharedDice } from '../hooks/useSharedDice'

interface DieFace {
  dots: { cx: number; cy: number }[]
}

const FACES: DieFace[] = [
  { dots: [{ cx: 50, cy: 50 }] },
  {
    dots: [
      { cx: 28, cy: 28 },
      { cx: 72, cy: 72 },
    ],
  },
  {
    dots: [
      { cx: 28, cy: 28 },
      { cx: 50, cy: 50 },
      { cx: 72, cy: 72 },
    ],
  },
  {
    dots: [
      { cx: 28, cy: 28 },
      { cx: 72, cy: 28 },
      { cx: 28, cy: 72 },
      { cx: 72, cy: 72 },
    ],
  },
  {
    dots: [
      { cx: 28, cy: 28 },
      { cx: 72, cy: 28 },
      { cx: 50, cy: 50 },
      { cx: 28, cy: 72 },
      { cx: 72, cy: 72 },
    ],
  },
  {
    dots: [
      { cx: 28, cy: 22 },
      { cx: 72, cy: 22 },
      { cx: 28, cy: 50 },
      { cx: 72, cy: 50 },
      { cx: 28, cy: 78 },
      { cx: 72, cy: 78 },
    ],
  },
]

function DieFaceDisplay({ value, isRolling }: { value: number; isRolling: boolean }) {
  const face = FACES[value - 1]
  return (
    <svg
      viewBox="0 0 100 100"
      width="100%"
      height="100%"
      style={{ opacity: isRolling ? 0 : 1, transition: 'opacity 0.1s' }}
    >
      {face.dots.map((dot) => (
        <circle key={`${dot.cx}-${dot.cy}`} cx={dot.cx} cy={dot.cy} r={8} fill="#3d1a10" />
      ))}
    </svg>
  )
}

function SingleDie({
  value,
  isRolling,
  label,
}: {
  value: number
  isRolling: boolean
  label?: string
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      {label && (
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: 'rgba(122,48,64,0.7)',
            fontFamily: "'Baloo 2', sans-serif",
          }}
        >
          {label}
        </span>
      )}
      <div
        style={{
          width: 90,
          height: 90,
          background: 'rgba(253,242,246,0.7)',
          border: '1.5px solid rgba(232,160,176,0.35)',
          borderRadius: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 10,
          boxShadow: '0 4px 12px rgba(200,120,140,0.15), inset 0 1px 0 rgba(255,255,255,0.6)',
          animation: isRolling ? 'diceShake 0.5s ease-in-out' : 'none',
        }}
      >
        <DieFaceDisplay value={value} isRolling={isRolling} />
      </div>
    </div>
  )
}

interface DiceProps {
  uid: string
  displayName: string
  partnerName?: string
  shared?: boolean
}

export default function Dice({ uid, displayName, partnerName, shared = false }: DiceProps) {
  const [localValues, setLocalValues] = useState<number[]>([1, 1])
  const [localRolling, setLocalRolling] = useState(false)
  const [localDiceCount, setLocalDiceCount] = useState(2)
  const [localHasRolled, setLocalHasRolled] = useState(false)

  const {
    remote,
    isRolling: sharedRolling,
    rollTogether,
    rollVersus,
    setMode,
  } = useSharedDice(uid, displayName)

  const diceMode = remote?.mode ?? 'together'

  const rollLocal = useCallback(() => {
    if (localRolling) return
    setLocalRolling(true)
    let frame = 0
    const frames = 8
    const interval = setInterval(() => {
      setLocalValues(
        Array.from({ length: localDiceCount }, () => Math.floor(Math.random() * 6) + 1)
      )
      frame += 1
      if (frame >= frames) {
        clearInterval(interval)
        const finalValues = Array.from(
          { length: localDiceCount },
          () => Math.floor(Math.random() * 6) + 1
        )
        setLocalValues(finalValues)
        setLocalRolling(false)
        setLocalHasRolled(true)
      }
    }, 60)
  }, [localRolling, localDiceCount])

  const handleLocalDiceCount = useCallback((n: number) => {
    setLocalDiceCount(n)
    setLocalHasRolled(false)
    setLocalValues(Array.from({ length: n }, () => 1))
  }, [])

  if (!shared) {
    const total = localValues.reduce((a, b) => a + b, 0)
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 20,
          padding: '24px 16px',
          fontFamily: "'Baloo 2', sans-serif",
        }}
      >
        <DiceKeyframes />

        {/* seletor de quantidade */}
        <div
          style={{
            display: 'flex',
            gap: 6,
            background: 'rgba(232,160,176,0.1)',
            borderRadius: 12,
            padding: 4,
            border: '1.5px solid rgba(232,160,176,0.3)',
          }}
        >
          {[1, 2, 3, 4].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => handleLocalDiceCount(n)}
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                border: 'none',
                cursor: 'pointer',
                fontSize: 14,
                fontFamily: "'Baloo 2', sans-serif",
                fontWeight: 800,
                background: localDiceCount === n ? 'rgba(232,160,176,0.55)' : 'transparent',
                color: '#3d1a10',
                transition: 'all 0.15s',
              }}
            >
              {n}
            </button>
          ))}
        </div>

        <div
          style={{
            display: 'flex',
            gap: 16,
            flexWrap: 'wrap',
            justifyContent: 'center',
            minHeight: 90,
          }}
        >
          {localValues.map((v, i) => (
            <div key={`local-die-${i}`}>
              {' '}
              {/* eslint-disable-line react/no-array-index-key */}
              <SingleDie value={v} isRolling={localRolling} />
            </div>
          ))}
        </div>

        {localHasRolled && localDiceCount > 1 && (
          <div
            style={{
              fontSize: 15,
              color: '#3d1a10',
              fontWeight: 700,
              animation: 'totalPop 0.3s ease-out',
            }}
          >
            total: {total}
          </div>
        )}

        <button
          type="button"
          onClick={rollLocal}
          disabled={localRolling}
          style={{
            padding: '10px 28px',
            borderRadius: 12,
            border: 'none',
            cursor: localRolling ? 'not-allowed' : 'pointer',
            background: localRolling ? 'rgba(232,160,176,0.3)' : 'rgba(232,160,176,0.55)',
            color: '#3d1a10',
            fontSize: 13,
            fontFamily: "'Baloo 2', sans-serif",
            fontWeight: 800,
            transition: 'all 0.15s',
            boxShadow: localRolling ? 'none' : '0 3px 8px rgba(200,120,140,0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <Dices size={14} strokeWidth={2} />
          {localRolling ? 'rolando...' : 'rolar'}
        </button>
      </div>
    )
  }

  // modo compartilhado
  const allUids = Object.keys(remote?.values ?? {})
  const myVal = remote?.values?.[uid] ?? 1
  const partnerUid = allUids.find((id) => id !== uid) ?? ''
  const partnerVal = partnerUid ? (remote?.values?.[partnerUid] ?? 1) : 1
  const rolling = sharedRolling

  function getVersusResult() {
    if (!partnerUid || remote?.values?.[uid] == null || remote?.values?.[partnerUid] == null)
      return null
    if (myVal > partnerVal) return <span style={{ color: '#c87090' }}>{displayName} ganhou!</span>
    if (partnerVal > myVal)
      return (
        <span style={{ color: 'rgba(122,48,64,0.7)' }}>
          {remote?.rolledBy === partnerUid ? (partnerName ?? partnerUid) : partnerUid} ganhou!
        </span>
      )
    return <span style={{ color: 'rgba(61,26,16,0.5)' }}>empate!</span>
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 16,
        padding: '20px 16px',
        fontFamily: "'Baloo 2', sans-serif",
      }}
    >
      <DiceKeyframes />

      {/* toggle modo */}
      <div
        style={{
          display: 'flex',
          gap: 6,
          background: 'rgba(232,160,176,0.1)',
          borderRadius: 12,
          padding: 4,
          border: '1.5px solid rgba(232,160,176,0.3)',
        }}
      >
        {(
          [
            { id: 'together', label: 'juntos', Icon: Dices },
            { id: 'versus', label: 'disputa', Icon: Swords },
          ] as const
        ).map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setMode(id)}
            style={{
              padding: '5px 14px',
              borderRadius: 8,
              border: 'none',
              cursor: 'pointer',
              fontSize: 12,
              fontFamily: "'Baloo 2', sans-serif",
              fontWeight: 800,
              background: diceMode === id ? 'rgba(232,160,176,0.55)' : 'transparent',
              color: '#3d1a10',
              transition: 'all 0.15s',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
            }}
          >
            <Icon size={12} strokeWidth={2} />
            {label}
          </button>
        ))}
      </div>

      {/* dados */}
      {diceMode === 'together' ? (
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
          <SingleDie value={myVal} isRolling={rolling} />
          <SingleDie value={partnerVal} isRolling={rolling} />
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 24, justifyContent: 'center', alignItems: 'flex-end' }}>
          <SingleDie
            value={myVal}
            isRolling={rolling && remote?.rolledBy === uid}
            label={displayName}
          />
          <SingleDie
            value={partnerVal}
            isRolling={rolling && remote?.rolledBy === partnerUid}
            label={partnerUid ? 'parceiro' : '...'}
          />
        </div>
      )}

      {diceMode === 'versus' && (
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            minHeight: 20,
            animation: 'totalPop 0.3s ease-out',
          }}
        >
          {getVersusResult()}
        </div>
      )}

      {diceMode === 'together' ? (
        <button
          type="button"
          onClick={() => rollTogether(2)}
          disabled={rolling}
          style={{
            padding: '10px 28px',
            borderRadius: 12,
            border: 'none',
            cursor: rolling ? 'not-allowed' : 'pointer',
            background: rolling ? 'rgba(232,160,176,0.3)' : 'rgba(232,160,176,0.55)',
            color: '#3d1a10',
            fontSize: 13,
            fontFamily: "'Baloo 2', sans-serif",
            fontWeight: 800,
            boxShadow: rolling ? 'none' : '0 3px 8px rgba(200,120,140,0.2)',
            transition: 'all 0.15s',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <Dices size={14} strokeWidth={2} />
          {rolling ? 'rolando...' : 'rolar juntos'}
        </button>
      ) : (
        <button
          type="button"
          onClick={rollVersus}
          disabled={rolling}
          style={{
            padding: '10px 24px',
            borderRadius: 12,
            border: 'none',
            cursor: rolling ? 'not-allowed' : 'pointer',
            background: rolling ? 'rgba(232,160,176,0.3)' : 'rgba(232,160,176,0.55)',
            color: '#3d1a10',
            fontSize: 13,
            fontFamily: "'Baloo 2', sans-serif",
            fontWeight: 800,
            boxShadow: rolling ? 'none' : '0 3px 8px rgba(200,120,140,0.2)',
            transition: 'all 0.15s',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <Swords size={14} strokeWidth={2} />
          {rolling ? 'rolando...' : `minha vez (${displayName})`}
        </button>
      )}
    </div>
  )
}

function DiceKeyframes() {
  return (
    <style>{`
      @keyframes diceShake {
        0%   { transform: rotate(0deg)   scale(1);    }
        15%  { transform: rotate(-12deg) scale(1.08); }
        30%  { transform: rotate(10deg)  scale(1.1);  }
        45%  { transform: rotate(-8deg)  scale(1.08); }
        60%  { transform: rotate(6deg)   scale(1.05); }
        75%  { transform: rotate(-4deg)  scale(1.02); }
        90%  { transform: rotate(2deg)   scale(1.01); }
        100% { transform: rotate(0deg)   scale(1);    }
      }
      @keyframes totalPop {
        0%   { transform: scale(0.7); opacity: 0; }
        70%  { transform: scale(1.15); }
        100% { transform: scale(1);   opacity: 1; }
      }
    `}</style>
  )
}
