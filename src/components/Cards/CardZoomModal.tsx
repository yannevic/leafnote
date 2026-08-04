// src/components/Cards/CardZoomModal.tsx
import { X } from 'lucide-react'
import { RARITY_COLOR } from '../../lib/rarity'
import type { CardDefinition } from '../../lib/cards'

interface CardZoomModalProps {
  card: CardDefinition
  onClose: () => void
}

export default function CardZoomModal({ card, onClose }: CardZoomModalProps) {
  const rarityColor = RARITY_COLOR[card.rarity]

  return (
    <div
      onClick={onClose}
      style={{ zIndex: 999999 }}
      className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative flex flex-col items-center gap-4"
      >
        <button
          onClick={onClose}
          className="absolute -top-4 -right-4 bg-bark-100 rounded-full p-2 shadow-lg hover:scale-110 transition-transform"
        >
          <X size={20} className="text-leaf-950" />
        </button>

        <img
          src={card.image}
          alt={card.name}
          style={{
            boxShadow: `0 0 40px ${rarityColor}80`,
          }}
          className="h-[75vh] max-w-[90vw] object-contain rounded-2xl"
        />

        <div className="flex flex-col items-center gap-1">
          <span className="font-baloo text-lg text-bark-100">{card.name}</span>
          <span
            style={{ color: rarityColor }}
            className="text-sm font-semibold uppercase tracking-wide"
          >
            {card.rarity}
          </span>
        </div>
      </div>
    </div>
  )
}
