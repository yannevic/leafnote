import { Lock } from 'lucide-react'
import { CardDefinition } from '../../lib/cards'
import { RARITY_COLOR } from '../../lib/rarity'

interface CollectibleCardProps {
  card: CardDefinition
  quantity: number
}

export default function CollectibleCard({ card, quantity }: CollectibleCardProps) {
  const owned = quantity > 0
  const color = RARITY_COLOR[card.rarity]

  return (
    <div
      style={{
        position: 'relative',
        aspectRatio: '1 / 1.4',
        borderRadius: 12,
        border: `2px solid ${owned ? color : '#3d3d3d33'}`,
        overflow: 'hidden',
        background: owned ? '#fff' : '#e8e8e8',
        boxShadow: owned ? `0 0 8px ${color}55` : 'none',
      }}
    >
      {owned ? (
        <img
          src={card.image}
          alt={card.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#999',
          }}
        >
          <Lock size={22} />
        </div>
      )}

      {owned && quantity > 1 && (
        <div
          style={{
            position: 'absolute',
            bottom: 6,
            right: 6,
            background: color,
            color: '#fff',
            fontSize: 11,
            fontWeight: 700,
            borderRadius: 999,
            padding: '2px 7px',
          }}
        >
          x{quantity}
        </div>
      )}

      {owned && (
        <div
          style={{
            position: 'absolute',
            top: 6,
            left: 6,
            fontSize: 9,
            fontWeight: 700,
            color,
            background: '#fff',
            borderRadius: 6,
            padding: '2px 6px',
            textTransform: 'uppercase',
          }}
        >
          {card.rarity}
        </div>
      )}
    </div>
  )
}
