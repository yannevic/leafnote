import { useState, useMemo } from 'react'
import { Backpack, X, PackageOpen, ZoomIn, Package } from 'lucide-react'
import { PackType } from '../../lib/packs'
import { openUnopenedPack } from '../../lib/unopenedPacks'
import { useUnopenedPacks } from '../../hooks/useUnopenedPacks'
import { usePendingCards } from '../../hooks/usePendingCards'
import { useCardInventory } from '../../hooks/useCardInventory'
import { CardDefinition, CARDS } from '../../lib/cards'
import { RARITY_COLOR } from '../../lib/rarity'
import { PACK_ART, getPromoPackArt } from '../../assets/cards/packs'
import PackOpenModal from './PackOpenModal'
import CardZoomModal from './CardZoomModal'

interface BackpackDrawerProps {
  coupleId: string
  uid: string
}

const PACK_LABEL: Record<PackType, string> = {
  comum: 'pacote comum',
  promocional: 'pacote promocional',
}

export default function BackpackDrawer({ coupleId, uid }: BackpackDrawerProps) {
  const [open, setOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [openingId, setOpeningId] = useState<string | null>(null)
  const [result, setResult] = useState<CardDefinition[] | null>(null)
  const [ownedBefore, setOwnedBefore] = useState<Record<string, number>>({})
  const [zoomCard, setZoomCard] = useState<CardDefinition | null>(null)

  const { packs, loading: loadingPacks } = useUnopenedPacks(coupleId, uid)
  const { pending, loading: loadingPending } = usePendingCards(coupleId, uid)
  const { inventory } = useCardInventory(coupleId, uid)

  // agrupa as pendentes iguais (mesmo cardId) só pra exibição empilhada —
  // cada instância continua existindo separada no Firebase, isso é só visual
  const groupedPending = useMemo(() => {
    const order: string[] = []
    const map = new Map<string, typeof pending>()
    for (const p of pending) {
      if (!map.has(p.cardId)) {
        map.set(p.cardId, [])
        order.push(p.cardId)
      }
      map.get(p.cardId)!.push(p)
    }
    return order.map((cardId) => map.get(cardId)!)
  }, [pending])

  const totalItems = packs.length + pending.length

  async function handleOpenPack(packId: string, type: PackType, collectionId?: string) {
    setOpeningId(packId)
    setOpen(false) // fecha o painel da mochila já aqui, pra evitar ver as
    // cartas soltas (pendingCards atualiza em tempo real assim que o
    // Firebase grava, antes do PackOpenModal terminar a animação)
    // inventário ATUAL, no instante de abrir — como as cartas não vão
    // mais pro inventário na abertura (ficam pendentes até arrastar),
    // esse já é o "antes" real, sem precisar de snapshot
    const snapshotBefore: Record<string, number> = {}
    for (const collectionInventory of Object.values(inventory)) {
      Object.assign(snapshotBefore, collectionInventory)
    }
    const res = await openUnopenedPack(coupleId, uid, packId, type, collectionId)
    setOpeningId(null)
    setSelectedId(null)
    setResult(res.cards)
    setOwnedBefore(snapshotBefore)
  }

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          position: 'fixed',
          right: 20,
          bottom: 20,
          zIndex: 400,
          width: 52,
          height: 52,
          borderRadius: '50%',
          border: 'none',
          background: '#4A7A4A',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 6px 18px rgba(45,74,45,0.35)',
        }}
      >
        <Backpack size={24} />
        {totalItems > 0 && (
          <span
            style={{
              position: 'absolute',
              top: -2,
              right: -2,
              background: '#c87090',
              color: '#fff',
              fontSize: 11,
              fontWeight: 800,
              borderRadius: 999,
              minWidth: 18,
              height: 18,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 4px',
              fontFamily: 'Baloo 2',
            }}
          >
            {totalItems}
          </span>
        )}
      </button>

      {open && (
        <div
          style={{
            position: 'fixed',
            right: 20,
            bottom: 82,
            zIndex: 400,
            width: 340,
            maxHeight: 480,
            overflowY: 'auto',
            background: 'linear-gradient(160deg, #FBEAF0 0%, #F5ECD7 100%)',
            border: '1.5px solid rgba(212,160,176,0.5)',
            borderRadius: 16,
            padding: 14,
            fontFamily: 'Baloo 2, sans-serif',
            boxShadow: '0 10px 30px rgba(122,48,64,0.2)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 10,
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 800, color: '#2D4A2D' }}>mochila</span>
            <button
              onClick={() => setOpen(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2D4A2D' }}
            >
              <X size={18} />
            </button>
          </div>

          {pending.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  color: 'rgba(61,26,16,0.5)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginBottom: 6,
                }}
              >
                cartas soltas — arraste até a coleção
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {groupedPending.map((group) => {
                  const top = group[0]
                  const stackCount = group.length
                  const card = CARDS.find((c) => c.id === top.cardId)
                  if (!card) return null
                  const color = RARITY_COLOR[card.rarity]
                  return (
                    <div
                      key={top.id}
                      style={{ position: 'relative', width: 84, height: 118, flexShrink: 0 }}
                    >
                      {stackCount > 1 && (
                        <>
                          <div
                            style={{
                              position: 'absolute',
                              top: 6,
                              left: 6,
                              width: 84,
                              height: 118,
                              borderRadius: 10,
                              background: '#e8d9c4',
                              border: `2px solid ${color}55`,
                            }}
                          />
                          <div
                            style={{
                              position: 'absolute',
                              top: 3,
                              left: 3,
                              width: 84,
                              height: 118,
                              borderRadius: 10,
                              background: '#f5ecd7',
                              border: `2px solid ${color}88`,
                            }}
                          />
                        </>
                      )}
                      <div
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData(
                            'application/json',
                            JSON.stringify({
                              instanceId: top.id,
                              cardId: top.cardId,
                              collectionId: top.collectionId,
                            })
                          )
                        }}
                        title={stackCount > 1 ? `${card.name} (${stackCount})` : card.name}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: 84,
                          height: 118,
                          borderRadius: 10,
                          overflow: 'hidden',
                          border: `2px solid ${color}`,
                          cursor: 'grab',
                          background: '#fff',
                        }}
                      >
                        <img
                          src={card.image}
                          alt={card.name}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            display: 'block',
                          }}
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setZoomCard(card)
                          }}
                          style={{
                            position: 'absolute',
                            top: 4,
                            right: 4,
                            width: 22,
                            height: 22,
                            borderRadius: '50%',
                            border: 'none',
                            background: 'rgba(0,0,0,0.5)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            padding: 0,
                          }}
                        >
                          <ZoomIn size={12} color="#fff" strokeWidth={2.5} />
                        </button>
                      </div>
                      {stackCount > 1 && (
                        <div
                          style={{
                            position: 'absolute',
                            bottom: -6,
                            right: -6,
                            minWidth: 22,
                            height: 22,
                            padding: '0 5px',
                            borderRadius: 999,
                            background: '#c87090',
                            border: '2px solid #fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 2,
                            boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                          }}
                        >
                          <span
                            style={{
                              color: '#fff',
                              fontSize: 11,
                              fontWeight: 800,
                              fontFamily: 'Baloo 2',
                              lineHeight: 1,
                            }}
                          >
                            {stackCount}
                          </span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          <div
            style={{
              fontSize: 10,
              fontWeight: 800,
              color: 'rgba(61,26,16,0.5)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: 6,
            }}
          >
            pacotes guardados
          </div>

          {(loadingPacks || loadingPending) && (
            <div style={{ fontSize: 12, color: '#8b6914', textAlign: 'center' }}>carregando...</div>
          )}

          {!loadingPacks && packs.length === 0 && (
            <div style={{ fontSize: 12, color: '#8b6914', textAlign: 'center', padding: '12px 0' }}>
              nenhum pacote guardado ainda
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {packs.map((pack) => {
              const isSelected = selectedId === pack.id
              const isOpening = openingId === pack.id
              return (
                <div
                  key={pack.id}
                  style={{
                    border: isSelected ? '2px solid #4A7A4A' : '1.5px solid rgba(212,160,176,0.4)',
                    borderRadius: 12,
                    padding: 8,
                    background: '#fff',
                  }}
                >
                  <div
                    onClick={() => setSelectedId(isSelected ? null : pack.id)}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
                  >
                    {(() => {
                      const art =
                        pack.type === 'comum'
                          ? PACK_ART.comum
                          : pack.collectionId
                            ? getPromoPackArt(pack.collectionId)
                            : undefined
                      return art ? (
                        <img
                          src={art}
                          alt={PACK_LABEL[pack.type]}
                          style={{ width: 32, height: 32, objectFit: 'contain' }}
                        />
                      ) : (
                        <Package size={26} color="#8b6914" />
                      )
                    })()}
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#3d1a10' }}>
                      {PACK_LABEL[pack.type]}
                    </span>
                  </div>

                  {isSelected && (
                    <button
                      onClick={() => handleOpenPack(pack.id, pack.type, pack.collectionId)}
                      disabled={isOpening}
                      style={{
                        marginTop: 8,
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                        padding: '8px 0',
                        borderRadius: 999,
                        border: 'none',
                        background: '#4A7A4A',
                        color: '#fff',
                        fontWeight: 800,
                        fontSize: 12,
                        cursor: isOpening ? 'default' : 'pointer',
                        fontFamily: 'Baloo 2',
                      }}
                    >
                      <PackageOpen size={14} />
                      {isOpening ? 'abrindo...' : 'abrir'}
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {result && (
        <PackOpenModal cards={result} ownedBefore={ownedBefore} onClose={() => setResult(null)} />
      )}
      {zoomCard && <CardZoomModal card={zoomCard} onClose={() => setZoomCard(null)} />}
    </>
  )
}
