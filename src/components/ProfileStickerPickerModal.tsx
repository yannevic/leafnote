// src/components/ProfileStickerPickerModal.tsx
import { useState, useEffect } from 'react'
import { X, Lock, ShoppingBag, ChevronDown, ChevronRight, ArrowLeft, Sticker } from 'lucide-react'
import { STICKER_PACKS } from '../assets/stickers/index'
import { subscribeOwnedStickers, type OwnedStickers } from '../lib/stickers'
import { useCoupleId } from '../contexts/CoupleContext'

const T = {
  text: '#3d1a10',
  textSub: 'rgba(61,26,16,0.5)',
  border: 'rgba(232,160,176,0.4)',
  card: 'rgba(253,242,246,0.7)',
}

const SCROLLBAR_CSS = `
  .profile-sticker-scroll::-webkit-scrollbar { width: 5px; }
  .profile-sticker-scroll::-webkit-scrollbar-track { background: transparent; }
  .profile-sticker-scroll::-webkit-scrollbar-thumb { background: rgba(232,160,176,0.55); border-radius: 99px; }
  .profile-sticker-scroll::-webkit-scrollbar-thumb:hover { background: rgba(232,160,176,0.85); }
`

interface Props {
  uid: string
  onSelect: (stickerKey: string) => void
  onOpenShop: (packId?: string) => void
  onBack: () => void
  onClose: () => void
}

// Reskin do StickerPickerModal.tsx no mesmo estilo fixo/centralizado das
// lojas novas. O StickerPickerModal.tsx original fica intocado — ele
// continua sendo usado pelo mural (Board.tsx), com o layout flutuante e
// arrastável dele. Este aqui é só pro fluxo de decoração do Perfil.
export default function ProfileStickerPickerModal({
  uid,
  onSelect,
  onOpenShop,
  onBack,
  onClose,
}: Props) {
  const { coupleId } = useCoupleId()
  const [ownedStickers, setOwnedStickers] = useState<OwnedStickers>({})
  const [expandedPack, setExpandedPack] = useState<string | null>(null)

  useEffect(() => {
    if (!coupleId) return
    return subscribeOwnedStickers(coupleId, uid, setOwnedStickers)
  }, [coupleId, uid])

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999999,
        background: 'rgba(61,26,16,0.35)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
    >
      <style>{SCROLLBAR_CSS}</style>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 300,
          height: 440,
          display: 'flex',
          flexDirection: 'column',
          background:
            'linear-gradient(160deg, rgba(253,246,240,0.98) 0%, rgba(252,232,238,0.98) 100%)',
          border: `1.5px solid ${T.border}`,
          borderRadius: 18,
          padding: 16,
          fontFamily: 'Baloo 2, sans-serif',
        }}
      >
        {/* header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 10,
            flexShrink: 0,
            gap: 8,
          }}
        >
          <button
            onClick={onBack}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              padding: 0,
              color: T.text,
            }}
          >
            <ArrowLeft size={15} strokeWidth={2.3} />
            <Sticker size={15} color="rgba(200,120,140,0.7)" />
            <span style={{ fontSize: 13, fontWeight: 800 }}>escolher sticker</span>
          </button>
          <button
            onClick={onClose}
            style={{
              width: 22,
              height: 22,
              borderRadius: '50%',
              border: 'none',
              background: 'rgba(200,120,140,0.18)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <X size={11} color="rgba(122,48,64,0.7)" />
          </button>
        </div>

        {/* lista de packs */}
        <div
          className="profile-sticker-scroll"
          style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}
        >
          {STICKER_PACKS.map((pack) => {
            const ownedInPack = pack.stickers.filter((s) => ownedStickers[s.key])
            const hasAny = ownedInPack.length > 0
            const isExpanded = expandedPack === pack.id

            return (
              <div
                key={pack.id}
                style={{
                  marginBottom: 8,
                  border: `1.5px solid ${hasAny ? T.border : 'rgba(232,160,176,0.2)'}`,
                  borderRadius: 12,
                  overflow: 'hidden',
                  background: hasAny ? T.card : 'rgba(253,242,246,0.3)',
                }}
              >
                <div
                  onClick={() => hasAny && setExpandedPack(isExpanded ? null : pack.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px 10px',
                    cursor: hasAny ? 'pointer' : 'default',
                  }}
                >
                  <img
                    src={`./stickers/${pack.preview}`}
                    style={{
                      width: 32,
                      height: 32,
                      objectFit: 'contain',
                      flexShrink: 0,
                      filter: hasAny ? 'none' : 'grayscale(1) opacity(0.4)',
                    }}
                    alt={pack.label}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 800,
                        color: T.text,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {pack.label}
                    </div>
                    <div style={{ fontSize: 9, color: T.textSub }}>
                      {ownedInPack.length}/{pack.stickers.length}
                    </div>
                  </div>
                  {!hasAny ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onOpenShop(pack.id)
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 3,
                        padding: '3px 8px',
                        borderRadius: 20,
                        border: 'none',
                        background: 'rgba(232,160,176,0.35)',
                        fontSize: 9,
                        fontWeight: 800,
                        color: T.text,
                        cursor: 'pointer',
                        flexShrink: 0,
                        fontFamily: 'Baloo 2, sans-serif',
                      }}
                    >
                      <ShoppingBag size={9} /> loja
                    </button>
                  ) : isExpanded ? (
                    <ChevronDown size={13} color="rgba(122,48,64,0.5)" />
                  ) : (
                    <ChevronRight size={13} color="rgba(122,48,64,0.5)" />
                  )}
                </div>

                {isExpanded && hasAny && (
                  <div style={{ borderTop: '1.5px solid rgba(255,255,255,0.4)', padding: 8 }}>
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(42px, 1fr))',
                        gap: 5,
                      }}
                    >
                      {pack.stickers.map((sticker) => {
                        const owned = !!ownedStickers[sticker.key]
                        return (
                          <div
                            key={sticker.key}
                            onClick={() => owned && onSelect(sticker.key)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: 3,
                              borderRadius: 8,
                              position: 'relative',
                              border: `1.5px solid ${owned ? T.border : 'rgba(232,160,176,0.15)'}`,
                              background: owned ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.1)',
                              cursor: owned ? 'pointer' : 'default',
                            }}
                          >
                            <img
                              src={`./stickers/${sticker.file}`}
                              style={{
                                width: 32,
                                height: 32,
                                objectFit: 'contain',
                                filter: owned ? 'none' : 'grayscale(1) opacity(0.3)',
                              }}
                              alt={sticker.key}
                            />
                            {!owned && (
                              <div
                                style={{
                                  position: 'absolute',
                                  inset: 0,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}
                              >
                                <Lock size={10} color="rgba(122,48,64,0.4)" />
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
