import { useState } from 'react'
import { Backpack, X, PackageOpen } from 'lucide-react'
import { PackType } from '../../lib/packs'
import { openUnopenedPack } from '../../lib/unopenedPacks'
import { useUnopenedPacks } from '../../hooks/useUnopenedPacks'
import { usePendingCards } from '../../hooks/usePendingCards'
import { CardDefinition, CARDS } from '../../lib/cards'
import { RARITY_COLOR } from '../../lib/rarity'
import { PACK_ART } from '../../assets/cards/packs'
import PackOpenModal from './PackOpenModal'

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

  const { packs, loading: loadingPacks } = useUnopenedPacks(coupleId, uid)
  const { pending, loading: loadingPending } = usePendingCards(coupleId, uid)

  const totalItems = packs.length + pending.length

  async function handleOpenPack(packId: string, type: PackType, collectionId?: string) {
    setOpeningId(packId)
    const res = await openUnopenedPack(coupleId, uid, packId, type, collectionId)
    setOpeningId(null)
    setSelectedId(null)
    setResult(res.cards)
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
            width: 280,
            maxHeight: 420,
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
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {pending.map((p) => {
                  const card = CARDS.find((c) => c.id === p.cardId)
                  if (!card) return null
                  const color = RARITY_COLOR[card.rarity]
                  return (
                    <div
                      key={p.id}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData(
                          'application/json',
                          JSON.stringify({
                            instanceId: p.id,
                            cardId: p.cardId,
                            collectionId: p.collectionId,
                          })
                        )
                      }}
                      title={card.name}
                      style={{
                        width: 54,
                        height: 76,
                        borderRadius: 8,
                        overflow: 'hidden',
                        border: `2px solid ${color}`,
                        cursor: 'grab',
                        background: '#fff',
                        flexShrink: 0,
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
                    <img
                      src={PACK_ART[pack.type]}
                      alt={PACK_LABEL[pack.type]}
                      style={{ width: 32, height: 32, objectFit: 'contain' }}
                    />
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

      {result && <PackOpenModal cards={result} ownedBefore={{}} onClose={() => setResult(null)} />}
    </>
  )
}
