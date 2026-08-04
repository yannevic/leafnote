import { useState } from 'react'
import { Users, User } from 'lucide-react'
import { CARDS, COLLECTIONS } from '../../lib/cards'
import { useCardInventory } from '../../hooks/useCardInventory'
import CollectibleCard from './CollectibleCard'

interface CollectionGridProps {
  coupleId: string
  uid: string
  partnerUid: string | null
}

export default function CollectionGrid({ coupleId, uid, partnerUid }: CollectionGridProps) {
  const [viewingUid, setViewingUid] = useState(uid)
  const { inventory, loading } = useCardInventory(coupleId, viewingUid)

  const collectionId = 'jardim-secreto'
  const cards = CARDS.filter((c) => c.collectionId === collectionId).sort(
    (a, b) => a.number - b.number
  )
  const collection = COLLECTIONS[collectionId]
  const collectionInventory = inventory[collectionId] ?? {}
  const ownedCount = cards.filter((c) => (collectionInventory[c.id] ?? 0) > 0).length

  return (
    <div style={{ padding: 16 }}>
      {partnerUid && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <button
            onClick={() => setViewingUid(uid)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 14px',
              borderRadius: 999,
              border: 'none',
              background: viewingUid === uid ? '#4A7A4A' : '#E8F5E8',
              color: viewingUid === uid ? '#fff' : '#2D4A2D',
              cursor: 'pointer',
              fontFamily: 'Baloo 2',
            }}
          >
            <User size={16} /> minha coleção
          </button>
          <button
            onClick={() => setViewingUid(partnerUid)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 14px',
              borderRadius: 999,
              border: 'none',
              background: viewingUid === partnerUid ? '#4A7A4A' : '#E8F5E8',
              color: viewingUid === partnerUid ? '#fff' : '#2D4A2D',
              cursor: 'pointer',
              fontFamily: 'Baloo 2',
            }}
          >
            <Users size={16} /> coleção do parceiro
          </button>
        </div>
      )}

      <div style={{ marginBottom: 12, fontFamily: 'Baloo 2', color: '#2D4A2D' }}>
        {collection.name} — {ownedCount}/{collection.total}
      </div>

      {loading ? (
        <div>carregando...</div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
            gap: 16,
          }}
        >
          {cards.map((card) => (
            <CollectibleCard
              key={card.id}
              card={card}
              quantity={collectionInventory[card.id] ?? 0}
            />
          ))}
        </div>
      )}
    </div>
  )
}
