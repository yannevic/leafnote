import { useState, DragEvent } from 'react'
import { Users, User, ChevronDown, ChevronRight } from 'lucide-react'
import { CARDS, COLLECTIONS, CardDefinition } from '../../lib/cards'
import { useCardInventory } from '../../hooks/useCardInventory'
import { placePendingCard } from '../../lib/pendingCards'
import CollectibleCard from './CollectibleCard'

interface CollectionGridProps {
  coupleId: string
  uid: string
  partnerUid: string | null
}

// ordem de exibição = ordem de lançamento (mais antiga primeiro), que é a
// mesma ordem em que as coleções foram cadastradas em lib/cards.ts
const COLLECTION_IDS = Object.keys(COLLECTIONS)

export default function CollectionGrid({ coupleId, uid, partnerUid }: CollectionGridProps) {
  const [viewingUid, setViewingUid] = useState(uid)
  const [rejectedCardId, setRejectedCardId] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<Set<string>>(new Set([COLLECTION_IDS[0]]))
  const { inventory, loading } = useCardInventory(coupleId, viewingUid)

  function toggleExpanded(collectionId: string) {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(collectionId)) {
        next.delete(collectionId)
      } else {
        next.add(collectionId)
      }
      return next
    })
  }

  async function handleDrop(e: DragEvent<HTMLDivElement>, card: CardDefinition) {
    e.preventDefault()
    if (viewingUid !== uid) return // não dá pra encaixar carta na coleção do parceiro
    const raw = e.dataTransfer.getData('application/json')
    if (!raw) return
    const data = JSON.parse(raw) as { instanceId: string; cardId: string; collectionId: string }
    const success = await placePendingCard(
      coupleId,
      uid,
      data.instanceId,
      data.cardId,
      data.collectionId,
      card.id
    )
    if (!success) {
      setRejectedCardId(card.id)
      setTimeout(() => setRejectedCardId(null), 500)
    }
  }

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

      {loading ? (
        <div>carregando...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {COLLECTION_IDS.map((collectionId) => {
            const collection = COLLECTIONS[collectionId as keyof typeof COLLECTIONS]
            const cards = CARDS.filter((c) => c.collectionId === collectionId).sort(
              (a, b) => a.number - b.number
            )
            const collectionInventory = inventory[collectionId] ?? {}
            const ownedCount = cards.filter((c) => (collectionInventory[c.id] ?? 0) > 0).length
            const isExpanded = expanded.has(collectionId)

            return (
              <div
                key={collectionId}
                style={{
                  background: 'rgba(255,255,255,0.4)',
                  borderRadius: 16,
                  overflow: 'hidden',
                }}
              >
                <button
                  onClick={() => toggleExpanded(collectionId)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '14px 18px',
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    fontFamily: 'Baloo 2',
                    textAlign: 'left',
                  }}
                >
                  {isExpanded ? (
                    <ChevronDown size={18} color="#2D4A2D" />
                  ) : (
                    <ChevronRight size={18} color="#2D4A2D" />
                  )}
                  <span style={{ fontWeight: 800, color: '#2D4A2D', fontSize: 14 }}>
                    {collection.name}
                  </span>
                  <span
                    style={{ marginLeft: 'auto', fontWeight: 700, color: '#8B6914', fontSize: 13 }}
                  >
                    {ownedCount}/{collection.total}
                  </span>
                </button>

                {isExpanded && (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                      gap: 16,
                      padding: '0 18px 20px',
                    }}
                  >
                    {cards.map((card) => (
                      <div
                        key={card.id}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => handleDrop(e, card)}
                        style={{
                          borderRadius: 12,
                          boxShadow: rejectedCardId === card.id ? '0 0 0 3px #c0392b' : 'none',
                          transition: 'box-shadow 0.15s',
                        }}
                      >
                        <CollectibleCard card={card} quantity={collectionInventory[card.id] ?? 0} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
