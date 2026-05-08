import { IconSun, IconMoon } from '@tabler/icons-react'
import { PresenceData } from '../lib/presence'

interface Props {
  myPresence: PresenceData | null
  partnerPresence: PresenceData | null
}

export default function PresenceBadge({ myPresence, partnerPresence }: Props) {
  const myOnline = myPresence?.online === true
  const partnerOnline = partnerPresence?.online === true
  const myName = myPresence?.displayName ?? '...'
  const partnerName = partnerPresence?.displayName ?? '...'

  return (
    <div
      style={{
        position: 'fixed',
        top: 48,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 48,
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        userSelect: 'none',
        fontFamily: 'Baloo 2, sans-serif',
        background:
          'linear-gradient(160deg, rgba(251,234,240,0.55) 0%, rgba(252,220,235,0.45) 100%)',
        border: '1.5px solid rgba(212,160,176,0.5)',
        borderRadius: 14,
        padding: '6px 6px',
        backdropFilter: 'blur(18px) saturate(1.4)',
        WebkitBackdropFilter: 'blur(18px) saturate(1.4)',
        boxShadow: '0 2px 12px rgba(232,160,176,0.15), inset 0 1px 0 rgba(255,255,255,0.45)',
      }}
    >
      {/* eu */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 7,
          width: 80,
          justifyContent: 'flex-end',
        }}
      >
        <span style={{ fontSize: 11, fontWeight: 800, color: 'rgba(61,36,8,0.75)' }}>{myName}</span>
        {myOnline ? (
          <IconSun size={16} stroke={1.8} color="rgba(200,140,60,0.85)" />
        ) : (
          <IconMoon size={16} stroke={1.8} color="rgba(100,80,160,0.7)" />
        )}
      </div>

      {/* divisor */}
      <div style={{ width: 1, height: 18, background: 'rgba(232,160,176,0.5)' }} />

      {/* parceiro */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 7,
          width: 80,
          justifyContent: 'flex-start',
        }}
      >
        {partnerOnline ? (
          <IconSun size={16} stroke={1.8} color="rgba(200,140,60,0.85)" />
        ) : (
          <IconMoon size={16} stroke={1.8} color="rgba(100,80,160,0.7)" />
        )}
        <span style={{ fontSize: 11, fontWeight: 800, color: 'rgba(61,36,8,0.75)' }}>
          {partnerName}
        </span>
      </div>
    </div>
  )
}
