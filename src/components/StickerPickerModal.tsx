import { useState, useEffect } from 'react'
import { X, Lock } from 'lucide-react'
import { STICKER_PACKS } from '../assets/stickers/index'
import { subscribeOwnedStickers, type OwnedStickers } from '../lib/stickers'

interface Props {
  uid: string
  onSelect: (stickerKey: string) => void
  onClose: () => void
}

export default function StickerPickerModal({ uid, onSelect, onClose }: Props) {
  const [ownedStickers, setOwnedStickers] = useState<OwnedStickers>({})
  const [expandedPack, setExpandedPack] = useState<string | null>(null)

  useEffect(() => {
    return subscribeOwnedStickers(uid, setOwnedStickers)
  }, [uid])

  const hasAnyOwned = STICKER_PACKS.some((p) => p.stickers.some((s) => ownedStickers[s.key]))

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999999,
        background: 'rgba(44,20,8,0.35)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background:
            'linear-gradient(160deg, rgba(253,246,240,0.97) 0%, rgba(252,232,238,0.97) 100%)',
          border: '1.5px solid rgba(232,160,176,0.4)',
          borderRadius: 20,
          boxShadow: '0 8px 40px rgba(200,120,140,0.2), inset 0 1px 0 rgba(255,255,255,0.6)',
          width: 360,
          maxWidth: '92vw',
          maxHeight: '70vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          fontFamily: 'Baloo 2, sans-serif',
        }}
      >
        {/* header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 18px',
            borderBottom: '2px dashed rgba(232,160,176,0.4)',
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: 14, fontWeight: 800, color: '#3d1a10' }}>escolher sticker</span>
          <button
            onClick={onClose}
            style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: 'rgba(200,120,140,0.15)',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={13} color="rgba(122,48,64,0.7)" strokeWidth={2.5} />
          </button>
        </div>

        {/* conteúdo */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '12px 16px 16px' }}>
          {!hasAnyOwned ? (
            <div
              style={{
                textAlign: 'center',
                padding: '32px 0',
                color: 'rgba(61,26,16,0.4)',
                fontSize: 12,
                fontWeight: 600,
                lineHeight: 1.6,
              }}
            >
              você ainda não tem stickers.
              <br />
              compre na loja para usar no mural!
            </div>
          ) : (
            STICKER_PACKS.map((pack) => {
              const ownedInPack = pack.stickers.filter((s) => ownedStickers[s.key])
              if (ownedInPack.length === 0) return null
              const isExpanded = expandedPack === pack.id
              return (
                <div
                  key={pack.id}
                  style={{
                    marginBottom: 8,
                    border: '1.5px solid rgba(232,160,176,0.3)',
                    borderRadius: 12,
                    overflow: 'hidden',
                    background: 'rgba(253,242,246,0.7)',
                  }}
                >
                  <div
                    onClick={() => setExpandedPack(isExpanded ? null : pack.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '8px 12px',
                      cursor: 'pointer',
                    }}
                  >
                    <img
                      src={`./stickers/${pack.preview}`}
                      style={{ width: 32, height: 32, objectFit: 'contain', flexShrink: 0 }}
                      alt={pack.label}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 800, color: '#3d1a10' }}>
                        {pack.label}
                      </div>
                      <div style={{ fontSize: 10, color: 'rgba(61,26,16,0.45)' }}>
                        {ownedInPack.length}/{pack.stickers.length} desbloqueados
                      </div>
                    </div>
                  </div>
                  {isExpanded && (
                    <div
                      style={{
                        borderTop: '1.5px dashed rgba(232,160,176,0.3)',
                        padding: '10px 12px',
                      }}
                    >
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fill, minmax(52px, 1fr))',
                          gap: 6,
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
                                padding: 5,
                                borderRadius: 8,
                                position: 'relative',
                                border: `1.5px solid ${owned ? 'rgba(232,160,176,0.4)' : 'rgba(200,180,190,0.2)'}`,
                                background: owned
                                  ? 'rgba(255,255,255,0.6)'
                                  : 'rgba(200,180,190,0.1)',
                                cursor: owned ? 'pointer' : 'default',
                                transition: 'transform .12s',
                              }}
                              onMouseEnter={(e) =>
                                owned &&
                                ((e.currentTarget as HTMLDivElement).style.transform = 'scale(1.1)')
                              }
                              onMouseLeave={(e) =>
                                ((e.currentTarget as HTMLDivElement).style.transform = '')
                              }
                            >
                              <img
                                src={`./stickers/${sticker.file}`}
                                style={{
                                  width: 40,
                                  height: 40,
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
                                  <Lock size={11} color="rgba(122,48,64,0.4)" />
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
            })
          )}
        </div>
      </div>
    </div>
  )
}
