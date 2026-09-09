import { useState, useEffect, DragEvent } from 'react'
import { Users, User, ChevronDown, ChevronRight, Award, Sparkles } from 'lucide-react'
import { CARDS, COLLECTIONS, CardDefinition } from '../../lib/cards'
import { SPECIAL_CARDS, SPECIAL_COLLECTION_NAME } from '../../lib/specialCards'
import { useCardInventory } from '../../hooks/useCardInventory'
import { placePendingCard, PlaceResult } from '../../lib/pendingCards'
import {
  subscribeCollectionReward,
  subscribeSpecialCardsInventory,
  PendingCollectionReward,
  SpecialCardInventoryEntry,
} from '../../lib/collectionRewards'
import CollectionRewardsModal from './CollectionRewardsModal'
import CollectibleCard from './CollectibleCard'
import SpecialCollectibleCard from './SpecialCollectibleCard'

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
  const [alreadyOwnedCardId, setAlreadyOwnedCardId] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const { inventory, loading } = useCardInventory(coupleId, viewingUid)

  const [rewards, setRewards] = useState<Record<string, PendingCollectionReward | null>>({})
  const [openRewardsFor, setOpenRewardsFor] = useState<string | null>(null)

  // assina a recompensa pendente de cada coleção (só da própria pessoa —
  // resgate é sempre isOwnProfile-like, não faz sentido ver do parceiro)
  useEffect(() => {
    if (viewingUid !== uid) return
    const unsubscribers = COLLECTION_IDS.filter((id) => id !== 'especiais-clima').map(
      (collectionId) =>
        subscribeCollectionReward(coupleId, uid, collectionId, (reward) => {
          setRewards((prev) => ({ ...prev, [collectionId]: reward }))
        })
    )
    return () => unsubscribers.forEach((unsub) => unsub())
  }, [coupleId, uid, viewingUid])

  const [specialInventory, setSpecialInventory] = useState<
    Record<string, SpecialCardInventoryEntry>
  >({})
  const [specialExpanded, setSpecialExpanded] = useState(false)

  useEffect(
    () => subscribeSpecialCardsInventory(coupleId, viewingUid, setSpecialInventory),
    [coupleId, viewingUid]
  )

  const specialOwnedCount = SPECIAL_CARDS.filter(
    (c) => (specialInventory[c.id]?.quantity ?? 0) > 0
  ).length

  // mais recentes primeiro; as ainda não descobertas ficam no fim, na
  // ordem do catálogo (lib/specialCards.ts)
  const specialCardsSorted = [...SPECIAL_CARDS].sort((a, b) => {
    const aEntry = specialInventory[a.id]
    const bEntry = specialInventory[b.id]
    const aOwned = (aEntry?.quantity ?? 0) > 0
    const bOwned = (bEntry?.quantity ?? 0) > 0
    if (aOwned && bOwned) return (bEntry!.lastAcquiredAt ?? 0) - (aEntry!.lastAcquiredAt ?? 0)
    if (aOwned) return -1
    if (bOwned) return 1
    return 0
  })

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
    const result: PlaceResult = await placePendingCard(
      coupleId,
      uid,
      data.instanceId,
      data.cardId,
      data.collectionId,
      card.id
    )
    if (result === 'wrong_slot') {
      setRejectedCardId(card.id)
      setTimeout(() => setRejectedCardId(null), 500)
    } else if (result === 'already_owned') {
      setAlreadyOwnedCardId(card.id)
      setTimeout(() => setAlreadyOwnedCardId(null), 1800)
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
            const reward = rewards[collectionId]
            const hasUnclaimedReward = reward && !Object.values(reward.claimed).every(Boolean)

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

                {hasUnclaimedReward && viewingUid === uid && (
                  <button
                    onClick={() => setOpenRewardsFor(collectionId)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      width: 'calc(100% - 36px)',
                      margin: '0 18px 14px',
                      padding: '8px 0',
                      borderRadius: 999,
                      border: 'none',
                      background: '#c87090',
                      color: '#fff',
                      fontWeight: 800,
                      fontSize: 12,
                      cursor: 'pointer',
                      fontFamily: 'Baloo 2',
                    }}
                  >
                    <Award size={14} /> resgatar recompensas
                  </button>
                )}

                {isExpanded && (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                      gap: 16,
                      padding: '0 18px 36px',
                    }}
                  >
                    {cards.map((card) => (
                      <div
                        key={card.id}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => handleDrop(e, card)}
                        style={{
                          position: 'relative',
                          borderRadius: 12,
                          boxShadow:
                            rejectedCardId === card.id
                              ? '0 0 0 3px #c0392b'
                              : alreadyOwnedCardId === card.id
                                ? '0 0 0 3px #8B6914'
                                : 'none',
                          transition: 'box-shadow 0.15s',
                        }}
                      >
                        <CollectibleCard card={card} quantity={collectionInventory[card.id] ?? 0} />

                        {alreadyOwnedCardId === card.id && (
                          <div
                            style={{
                              position: 'absolute',
                              bottom: -30,
                              left: '50%',
                              transform: 'translateX(-50%)',
                              whiteSpace: 'nowrap',
                              background: '#8B6914',
                              color: '#fff',
                              fontSize: 11,
                              fontWeight: 800,
                              fontFamily: 'Baloo 2',
                              padding: '4px 10px',
                              borderRadius: 999,
                              boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                              zIndex: 10,
                              pointerEvents: 'none',
                            }}
                          >
                            você já tem essa carta
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}

          {/* ─── Coleção de Cartas Especial — extra, sem meta/recompensa ─── */}
          <div
            style={{
              background:
                'linear-gradient(135deg, rgba(255,236,179,0.5) 0%, rgba(253,246,240,0.4) 100%)',
              border: '1.5px solid rgba(201,150,46,0.35)',
              borderRadius: 16,
              overflow: 'hidden',
            }}
          >
            <button
              onClick={() => setSpecialExpanded((v) => !v)}
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
              {specialExpanded ? (
                <ChevronDown size={18} color="#8B6914" />
              ) : (
                <ChevronRight size={18} color="#8B6914" />
              )}
              <Sparkles size={16} color="#c9962e" />
              <span style={{ fontWeight: 800, color: '#8B6914', fontSize: 14 }}>
                {SPECIAL_COLLECTION_NAME}
              </span>
              <span style={{ marginLeft: 'auto', fontWeight: 700, color: '#c9962e', fontSize: 13 }}>
                {specialOwnedCount}/{SPECIAL_CARDS.length} descobertas
              </span>
            </button>

            {specialExpanded && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                  gap: 16,
                  padding: '0 18px 20px',
                }}
              >
                {specialCardsSorted.map((card) => (
                  <SpecialCollectibleCard
                    key={card.id}
                    card={card}
                    quantity={specialInventory[card.id]?.quantity ?? 0}
                  />
                ))}
              </div>
            )}

            <div
              style={{
                padding: '0 18px 16px',
                fontSize: 10.5,
                color: 'rgba(139,105,20,0.6)',
                lineHeight: 1.5,
              }}
            >
              ganhas ao completar qualquer uma das coleções acima — não dá pra comprar ou trocar
            </div>
          </div>
        </div>
      )}

      {openRewardsFor && rewards[openRewardsFor] && (
        <CollectionRewardsModal
          coupleId={coupleId}
          uid={uid}
          collectionId={openRewardsFor}
          reward={rewards[openRewardsFor]!}
          onClose={() => setOpenRewardsFor(null)}
        />
      )}
    </div>
  )
}
