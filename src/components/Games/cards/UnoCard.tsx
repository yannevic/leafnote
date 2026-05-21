import React from 'react'

// ─── TIPOS ────────────────────────────────────────────────────────────────────

type UnoColor = 'pink' | 'green' | 'mauve' | 'peach' | 'wild'
type UnoType = 'number' | 'skip' | 'reverse' | 'draw2' | 'draw4' | 'wild'

// ─── GRADIENTES POR COR ───────────────────────────────────────────────────────

const UNO_BG: Record<UnoColor, string> = {
  pink: 'linear-gradient(135deg,#e8607a,#f09ab0)',
  green: 'linear-gradient(135deg,#5a9e6e,#8ecfa0)',
  mauve: 'linear-gradient(135deg,#a06090,#c890b8)',
  peach: 'linear-gradient(135deg,#d87858,#f0a888)',
  wild: 'linear-gradient(135deg,#3d1a10,#7a3040)',
}

// ─── ÍCONES ESPECIAIS ─────────────────────────────────────────────────────────

const SkipIcon = ({ size = 12 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="white"
    strokeWidth="2.5"
    strokeLinecap="round"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
  </svg>
)

const ReverseIcon = ({ size = 12 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="white"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17 1l4 4-4 4" />
    <path d="M3 11V9a4 4 0 014-4h14" />
    <path d="M7 23l-4-4 4-4" />
    <path d="M21 13v2a4 4 0 01-4 4H3" />
  </svg>
)

// ─── QUADRANTES WILD ──────────────────────────────────────────────────────────

const WildQuadrants = ({ rotate = false }: { rotate?: boolean }) => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 4,
      transform: rotate ? 'rotate(25deg)' : undefined,
    }}
  >
    {(['#e8607a', '#5a9e6e', '#a06090', '#d87858'] as const).map((c, i) => (
      <div key={i} style={{ width: 30, height: 30, borderRadius: 6, background: c }} />
    ))}
  </div>
)

// ─── ESTILOS ──────────────────────────────────────────────────────────────────

const unoOval: React.CSSProperties = {
  position: 'absolute',
  width: 56,
  height: 86,
  borderRadius: '50%',
  background: 'rgba(255,255,255,0.18)',
  transform: 'translate(-50%,-50%) rotate(-25deg)',
  top: '50%',
  left: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1,
}

const unoTL: React.CSSProperties = {
  position: 'absolute',
  top: 7,
  left: 7,
  fontFamily: "'Baloo 2', sans-serif",
  fontSize: 12,
  fontWeight: 800,
  color: 'white',
  textShadow: '0 1px 3px rgba(0,0,0,0.25)',
  lineHeight: 1,
  zIndex: 3,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 1,
}

const unoBR: React.CSSProperties = {
  position: 'absolute',
  bottom: 7,
  right: 7,
  fontFamily: "'Baloo 2', sans-serif",
  fontSize: 12,
  fontWeight: 800,
  color: 'white',
  textShadow: '0 1px 3px rgba(0,0,0,0.25)',
  lineHeight: 1,
  zIndex: 3,
  transform: 'rotate(180deg)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 1,
}

const unoNum: React.CSSProperties = {
  fontFamily: "'Baloo 2', sans-serif",
  fontWeight: 800,
  fontSize: 36,
  color: 'white',
  transform: 'rotate(25deg)',
  lineHeight: 1,
  textShadow: '0 2px 6px rgba(0,0,0,0.15)',
}

// ─── COMPONENTE ───────────────────────────────────────────────────────────────

export interface UnoCardProps {
  color: UnoColor
  type: UnoType
  value?: number // para cartas numéricas: 0-9
}

export const UnoCard: React.FC<UnoCardProps> = ({ color, type, value }) => {
  const base: React.CSSProperties = {
    width: 80,
    height: 126,
    borderRadius: 14,
    position: 'relative',
    overflow: 'hidden',
    border:
      color === 'wild' ? '2px solid rgba(232,160,176,0.4)' : '2px solid rgba(255,255,255,0.55)',
    boxShadow: '0 4px 18px rgba(200,120,140,0.22)',
    background: UNO_BG[color],
    fontFamily: "'Baloo 2', sans-serif",
  }

  const showQuadrantCorner = type === 'draw4' || type === 'wild'

  const cornerLabel = () => {
    if (type === 'number') return <>{value}</>
    if (type === 'draw2') return <>+2</>
    if (type === 'draw4' || type === 'wild') return <WildQuadrants />
    if (type === 'skip') return <SkipIcon size={12} />
    if (type === 'reverse') return <ReverseIcon size={12} />
    return null
  }

  const centerContent = () => {
    if (type === 'number') return <span style={unoNum}>{value}</span>
    if (type === 'draw2') return <span style={{ ...unoNum, fontSize: 26 }}>+2</span>
    if (type === 'draw4' || type === 'wild')
      return (
        <div
          style={{
            background: 'rgba(255,255,255,0.06)',
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <WildQuadrants rotate />
        </div>
      )
    if (type === 'skip')
      return (
        <div style={{ transform: 'rotate(25deg)' }}>
          <SkipIcon size={34} />
        </div>
      )
    if (type === 'reverse')
      return (
        <div style={{ transform: 'rotate(25deg)' }}>
          <ReverseIcon size={34} />
        </div>
      )
    return null
  }

  const quadrantCorner = (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
      {(['#e8607a', '#5a9e6e', '#a06090', '#d87858'] as const).map((c, i) => (
        <div key={i} style={{ width: 8, height: 8, borderRadius: 2, background: c }} />
      ))}
    </div>
  )

  return (
    <div style={base}>
      {/* canto superior esquerdo */}
      <div style={unoTL}>{showQuadrantCorner ? quadrantCorner : cornerLabel()}</div>

      {/* oval central */}
      <div style={unoOval}>{centerContent()}</div>

      {/* canto inferior direito (rotacionado) */}
      <div style={unoBR}>{showQuadrantCorner ? quadrantCorner : cornerLabel()}</div>
    </div>
  )
}

export type { UnoColor, UnoType }

// ─── EXEMPLOS DE USO ──────────────────────────────────────────────────────────
//
// <UnoCard color="pink"  type="number"  value={5} />
// <UnoCard color="green" type="number"  value={3} />
// <UnoCard color="mauve" type="skip" />
// <UnoCard color="peach" type="reverse" />
// <UnoCard color="pink"  type="draw2" />
// <UnoCard color="wild"  type="draw4" />   ← +4 com seletor de cor
// <UnoCard color="wild"  type="wild" />    ← curinga puro
