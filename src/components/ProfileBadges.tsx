// src/components/ProfileBadges.tsx
import { Lock } from 'lucide-react'
import { COLLECTIONS } from '../lib/cards'
import type { ProfileBadges as ProfileBadgesState } from '../lib/profileBadges'

const T = {
  text: '#3d1a10',
  textSub: 'rgba(61,26,16,0.5)',
  border: 'rgba(232,160,176,0.4)',
}

interface Props {
  badges: ProfileBadgesState
}

export default function ProfileBadges({ badges }: Props) {
  const collections = Object.values(COLLECTIONS)

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        gap: 16,
        padding: '10px 20px',
        borderBottom: '2px dashed rgba(232,160,176,0.4)',
        background: 'rgba(253,246,240,0.6)',
        flexShrink: 0,
      }}
    >
      {collections.map((col) => {
        const unlocked = !!badges[col.id]
        return (
          <div
            key={col.id}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
              width: 76,
            }}
            title={unlocked ? col.name : `${col.name} — ainda não completada`}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                border: `2px solid ${unlocked ? 'rgba(232,160,176,0.6)' : T.border}`,
                background: unlocked ? 'rgba(253,242,246,0.9)' : 'rgba(200,168,180,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: unlocked ? '0 2px 10px rgba(232,160,176,0.35)' : 'none',
                flexShrink: 0,
              }}
            >
              <img
                src={`./badges/${col.id}.png`}
                alt={col.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  filter: unlocked ? 'none' : 'grayscale(1) opacity(0.35)',
                }}
              />
              {!unlocked && (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(61,26,16,0.15)',
                  }}
                >
                  <Lock size={18} color="rgba(61,26,16,0.55)" strokeWidth={2.2} />
                </div>
              )}
            </div>
            <span
              style={{
                fontSize: 9,
                fontWeight: 700,
                color: unlocked ? T.text : T.textSub,
                fontFamily: 'Baloo 2, sans-serif',
                textAlign: 'center',
                lineHeight: 1.2,
              }}
            >
              {col.name}
            </span>
          </div>
        )
      })}
    </div>
  )
}
