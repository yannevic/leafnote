import { useEffect, useState } from 'react'
import { ACHIEVEMENTS } from '../lib/achievements'

interface Props {
  achievementId: string
  onDone: () => void
}

export default function AchievementToast({ achievementId, onDone }: Props) {
  const [visible, setVisible] = useState(false)

  const def = ACHIEVEMENTS.find((a) => a.id === achievementId)

  useEffect(() => {
    const t1 = setTimeout(() => setVisible(true), 50)
    const t2 = setTimeout(() => {
      setVisible(false)
      setTimeout(onDone, 500)
    }, 4500)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [onDone])

  if (!def) return null

  return (
    <>
      <style>{`
        @keyframes ach-shine {
          0%   { transform: translateX(-100%) skewX(-15deg); }
          100% { transform: translateX(350%) skewX(-15deg); }
        }
        @keyframes ach-bounce {
          0%,100% { transform: scale(1); }
          40%     { transform: scale(1.12); }
          60%     { transform: scale(0.95); }
        }
        @keyframes ach-coins {
          0%   { opacity: 0; transform: translateY(0px); }
          20%  { opacity: 1; }
          100% { opacity: 0; transform: translateY(-18px); }
        }
      `}</style>

      <div
        style={{
          position: 'fixed',
          bottom: 28,
          left: '50%',
          transform: visible
            ? 'translateX(-50%) translateY(0px)'
            : 'translateX(-50%) translateY(120px)',
          opacity: visible ? 1 : 0,
          transition: 'transform 0.45s cubic-bezier(0.34,1.56,0.64,1), opacity 0.45s ease',
          zIndex: 999999,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          background:
            'linear-gradient(135deg, rgba(245,213,220,0.97) 0%, rgba(253,242,246,0.97) 60%, rgba(245,236,215,0.97) 100%)',
          border: '1.5px solid rgba(232,160,176,0.6)',
          borderRadius: 18,
          padding: '12px 20px 12px 12px',
          boxShadow:
            '0 8px 40px rgba(200,120,140,0.35), 0 2px 8px rgba(200,120,140,0.15), inset 0 1px 0 rgba(255,255,255,0.7)',
          backdropFilter: 'blur(20px)',
          fontFamily: 'Baloo 2, sans-serif',
          minWidth: 260,
          maxWidth: 340,
          overflow: 'hidden',
        }}
      >
        {/* brilho animado */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.45) 50%, transparent 100%)',
            animation: 'ach-shine 1.2s ease 0.3s forwards',
            pointerEvents: 'none',
          }}
        />

        {/* imagem da conquista */}
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 12,
            overflow: 'hidden',
            flexShrink: 0,
            animation: 'ach-bounce 0.6s ease 0.4s',
            border: '1.5px solid rgba(232,160,176,0.4)',
            background: 'rgba(245,213,220,0.3)',
            position: 'relative',
          }}
        >
          <img
            src={def.imagem}
            alt={def.nome}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => {
              // fallback: esconde a imagem quebrada
              ;(e.currentTarget as HTMLImageElement).style.display = 'none'
            }}
          />
          {/* moedinha flutuante */}
          {def.recompensa > 0 && (
            <div
              style={{
                position: 'absolute',
                bottom: 2,
                right: 2,
                background: 'rgba(139,105,20,0.85)',
                borderRadius: 99,
                padding: '1px 5px',
                fontSize: 8,
                fontWeight: 800,
                color: '#fff',
                fontFamily: 'Baloo 2, sans-serif',
                animation: 'ach-coins 2s ease 0.8s infinite',
              }}
            >
              +{def.recompensa}
            </div>
          )}
        </div>

        {/* texto */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1, minWidth: 0 }}>
          <span
            style={{
              fontSize: 9,
              fontWeight: 800,
              color: 'rgba(139,105,20,0.7)',
              textTransform: 'uppercase',
              letterSpacing: '0.9px',
            }}
          >
            conquista desbloqueada
          </span>
          <span
            style={{
              fontSize: 14,
              fontWeight: 800,
              color: '#3d1a10',
              lineHeight: 1.2,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {def.nome}
          </span>
          <span
            style={{
              fontSize: 10.5,
              fontWeight: 600,
              color: 'rgba(61,26,16,0.55)',
              lineHeight: 1.3,
            }}
          >
            {def.descricao}
          </span>
          {def.recompensa > 0 && (
            <span
              style={{
                fontSize: 10,
                fontWeight: 800,
                color: '#8b6914',
                marginTop: 1,
              }}
            >
              +{def.recompensa} moedinhas
            </span>
          )}
        </div>
      </div>
    </>
  )
}
