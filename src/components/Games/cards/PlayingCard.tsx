import React from 'react'

// ─── TIPOS ────────────────────────────────────────────────────────────────────

type Suit = 'hearts' | 'diamonds' | 'spades' | 'clubs'
type CardValue = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K'

// ─── NAIPES SVG (pequeno — cantos) ────────────────────────────────────────────

const HeartSuit = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path
      d="M12 21C12 21 3 14 3 8.5C3 5.5 5.5 3 8.5 3C10 3 11.5 3.8 12 5C12.5 3.8 14 3 15.5 3C18.5 3 21 5.5 21 8.5C21 14 12 21 12 21Z"
      fill="#e8607a"
    />
  </svg>
)

const DiamondSuit = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <ellipse cx="12" cy="8" rx="3" ry="5" fill="#e8607a" opacity="0.85" />
    <ellipse cx="12" cy="16" rx="3" ry="5" fill="#e8607a" opacity="0.85" />
    <ellipse cx="8" cy="12" rx="5" ry="3" fill="#e8607a" opacity="0.85" />
    <ellipse cx="16" cy="12" rx="5" ry="3" fill="#e8607a" opacity="0.85" />
    <circle cx="12" cy="12" r="2.5" fill="#f4b8c8" />
  </svg>
)

const SpadeSuit = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path
      d="M12 3 C12 3 4 8 4 14 C4 18 7.5 20 12 20 C16.5 20 20 18 20 14 C20 8 12 3 12 3Z"
      fill="#3d1a10"
    />
    <path
      d="M12 20 L12 22 M10 22 L14 22"
      stroke="#3d1a10"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
)

const ClubSuit = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="9" r="4" fill="#3d1a10" />
    <circle cx="8" cy="13" r="4" fill="#3d1a10" />
    <circle cx="16" cy="13" r="4" fill="#3d1a10" />
    <rect x="10.5" y="15" width="3" height="5" fill="#3d1a10" />
    <rect x="8" y="19" width="8" height="1.5" rx="1" fill="#3d1a10" />
  </svg>
)

const SuitIcon = ({ suit, size = 14 }: { suit: Suit; size?: number }) => {
  if (suit === 'hearts') return <HeartSuit size={size} />
  if (suit === 'diamonds') return <DiamondSuit size={size} />
  if (suit === 'spades') return <SpadeSuit size={size} />
  return <ClubSuit size={size} />
}

// ─── NAIPES SVG (grande — centro) ─────────────────────────────────────────────

const HeartLarge = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
    <path
      d="M12 21C12 21 3 14 3 8.5C3 5.5 5.5 3 8.5 3C10 3 11.5 3.8 12 5C12.5 3.8 14 3 15.5 3C18.5 3 21 5.5 21 8.5C21 14 12 21 12 21Z"
      fill="#e8607a"
    />
  </svg>
)

const DiamondLarge = () => (
  <svg width="38" height="38" viewBox="0 0 24 24" fill="none">
    <ellipse cx="12" cy="7" rx="3.5" ry="5.5" fill="#e8607a" opacity="0.8" />
    <ellipse cx="12" cy="17" rx="3.5" ry="5.5" fill="#e8607a" opacity="0.8" />
    <ellipse cx="7" cy="12" rx="5.5" ry="3.5" fill="#e8607a" opacity="0.8" />
    <ellipse cx="17" cy="12" rx="5.5" ry="3.5" fill="#e8607a" opacity="0.8" />
    <circle cx="12" cy="12" r="3" fill="#f4b8c8" />
    <circle cx="12" cy="12" r="1.5" fill="#e8607a" opacity="0.5" />
  </svg>
)

const SpadeLarge = () => (
  <svg width="38" height="42" viewBox="0 0 24 26" fill="none">
    <path
      d="M12 2 C12 2 3 8 3 15 C3 19.5 7 22 12 22 C17 22 21 19.5 21 15 C21 8 12 2 12 2Z"
      fill="#3d1a10"
    />
    <path
      d="M12 22 L12 25 M9.5 25 L14.5 25"
      stroke="#3d1a10"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
)

const ClubLarge = () => (
  <svg width="38" height="38" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="9" r="4.5" fill="#3d1a10" />
    <circle cx="7.5" cy="14" r="4.5" fill="#3d1a10" />
    <circle cx="16.5" cy="14" r="4.5" fill="#3d1a10" />
    <rect x="10.5" y="16" width="3" height="4.5" fill="#3d1a10" />
    <rect x="7.5" y="19.5" width="9" height="2" rx="1" fill="#3d1a10" />
  </svg>
)

const SuitIconLarge = ({ suit }: { suit: Suit }) => {
  if (suit === 'hearts') return <HeartLarge />
  if (suit === 'diamonds') return <DiamondLarge />
  if (suit === 'spades') return <SpadeLarge />
  return <ClubLarge />
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const isRedSuit = (suit: Suit) => suit === 'hearts' || suit === 'diamonds'

// ─── ESTILOS ──────────────────────────────────────────────────────────────────

const styles = {
  pc: {
    width: 88,
    height: 132,
    borderRadius: 14,
    background: 'linear-gradient(160deg,rgba(253,246,240,0.99) 0%,rgba(252,232,238,0.99) 100%)',
    border: '1.5px solid rgba(232,160,176,0.45)',
    boxShadow: '0 4px 18px rgba(200,120,140,0.18),inset 0 1px 0 rgba(255,255,255,0.7)',
    position: 'relative' as const,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '7px 6px',
    boxSizing: 'border-box' as const,
    overflow: 'hidden',
    fontFamily: "'Baloo 2', sans-serif",
  },
  pcBackInner: {
    position: 'absolute' as const,
    inset: 7,
    borderRadius: 9,
    border: '1.5px dashed rgba(232,160,176,0.55)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column' as const,
    gap: 4,
    background:
      'repeating-linear-gradient(45deg,rgba(232,160,176,0.07) 0,rgba(232,160,176,0.07) 1px,transparent 0,transparent 8px)',
  },
  corner: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: 1,
    position: 'relative' as const,
    zIndex: 2,
  },
  mid: {
    position: 'absolute' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%,-50%)',
    zIndex: 1,
  },
}

// ─── COMPONENTE ───────────────────────────────────────────────────────────────

export interface PlayingCardProps {
  suit: Suit
  value: CardValue
  faceDown?: boolean
}

export const PlayingCard: React.FC<PlayingCardProps> = ({ suit, value, faceDown = false }) => {
  const color = isRedSuit(suit) ? '#e8607a' : '#3d1a10'

  if (faceDown) {
    return (
      <div style={styles.pc}>
        <div style={styles.pcBackInner}>
          <svg width="32" height="28" viewBox="0 0 32 28" fill="none">
            <path
              d="M16 24C16 24 5 17 5 10.5C5 7 7.8 4 11.5 4C13.2 4 15 5 16 6.5C17 5 18.8 4 20.5 4C24.2 4 27 7 27 10.5C27 17 16 24 16 24Z"
              fill="rgba(232,160,176,0.45)"
            />
          </svg>
          <span
            style={{
              fontSize: 16,
              fontWeight: 800,
              color: 'rgba(122,48,64,0.45)',
              letterSpacing: 2,
              textTransform: 'lowercase' as const,
              fontFamily: "'Baloo 2', sans-serif",
            }}
          >
            yami
          </span>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.pc}>
      {/* canto superior esquerdo */}
      <div style={{ ...styles.corner, alignSelf: 'flex-start' }}>
        <span style={{ fontSize: 13, fontWeight: 800, lineHeight: 1, color }}>{value}</span>
        <SuitIcon suit={suit} size={14} />
      </div>

      {/* símbolo central */}
      <div style={styles.mid}>
        <SuitIconLarge suit={suit} />
      </div>

      {/* canto inferior direito (rotacionado) */}
      <div style={{ ...styles.corner, alignSelf: 'flex-end', transform: 'rotate(180deg)' }}>
        <span style={{ fontSize: 13, fontWeight: 800, lineHeight: 1, color }}>{value}</span>
        <SuitIcon suit={suit} size={14} />
      </div>
    </div>
  )
}

export type { Suit, CardValue }
