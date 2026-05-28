import { useState, useEffect, useRef, useCallback } from 'react'
import { X, Lock, ShoppingBag, ChevronDown, ChevronRight } from 'lucide-react'
import { STICKER_PACKS } from '../assets/stickers/index'
import { subscribeOwnedStickers, type OwnedStickers } from '../lib/stickers'

import { useCoupleId } from '../contexts/CoupleContext'

interface Props {
  uid: string
  onSelect: (stickerKey: string) => void
  onClose: () => void
  onOpenShop?: (packId?: string) => void
}

export default function StickerPickerModal({ uid, onSelect, onClose, onOpenShop }: Props) {
  const { coupleId } = useCoupleId()
  const [ownedStickers, setOwnedStickers] = useState<OwnedStickers>({})
  const [expandedPack, setExpandedPack] = useState<string | null>(null)
  const [pos, setPos] = useState({ x: 80, y: 80 })
  const dragRef = useRef({ dragging: false, sx: 0, sy: 0, px: 0, py: 0 })
  const widgetRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setPos({ x: window.innerWidth / 2 - 110, y: 80 })
  }, [])

  useEffect(() => {
    if (!coupleId) return
    return subscribeOwnedStickers(coupleId, uid, setOwnedStickers)
  }, [coupleId, uid])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (widgetRef.current && !widgetRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    window.addEventListener('mousedown', handler)
    return () => window.removeEventListener('mousedown', handler)
  }, [onClose])

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      dragRef.current = { dragging: true, sx: e.clientX, sy: e.clientY, px: pos.x, py: pos.y }
      e.preventDefault()
      const onMove = (ev: MouseEvent) => {
        if (!dragRef.current.dragging) return
        setPos({
          x: Math.max(
            0,
            Math.min(
              window.innerWidth - 230,
              dragRef.current.px + (ev.clientX - dragRef.current.sx)
            )
          ),
          y: Math.max(
            0,
            Math.min(
              window.innerHeight - 100,
              dragRef.current.py + (ev.clientY - dragRef.current.sy)
            )
          ),
        })
      }
      const onUp = () => {
        dragRef.current.dragging = false
        window.removeEventListener('mousemove', onMove)
        window.removeEventListener('mouseup', onUp)
      }
      window.addEventListener('mousemove', onMove)
      window.addEventListener('mouseup', onUp)
    },
    [pos]
  )

  return (
    <>
      <style>{`
        .sticker-picker-scroll::-webkit-scrollbar { width: 4px; }
        .sticker-picker-scroll::-webkit-scrollbar-track { background: transparent; }
        .sticker-picker-scroll::-webkit-scrollbar-thumb { background: rgba(232,160,176,0.55); border-radius: 99px; }
        .sticker-picker-scroll::-webkit-scrollbar-thumb:hover { background: rgba(232,160,176,0.99); }
      `}</style>

      <div
        ref={widgetRef}
        style={{
          position: 'fixed',
          left: pos.x,
          top: pos.y,
          zIndex: 999999,
          width: 230,
          maxHeight: 400,
          display: 'flex',
          flexDirection: 'column',
          background:
            'linear-gradient(160deg, rgba(253,246,240,0.45) 0%, rgba(252,232,238,0.38) 100%)',
          border: '1.5px solid rgba(255,255,255,0.35)',
          backdropFilter: 'blur(18px) saturate(1.4)',
          WebkitBackdropFilter: 'blur(18px) saturate(1.4)',
          boxShadow: '0 8px 32px rgba(232,160,176,0.18), inset 0 1px 0 rgba(255,255,255,0.5)',
          borderRadius: 16,
          fontFamily: 'Baloo 2, sans-serif',
          overflow: 'hidden',
          userSelect: 'none',
        }}
      >
        {/* header arrastável */}
        <div
          onMouseDown={onMouseDown}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '9px 11px',
            borderBottom: '1.5px solid rgba(255,255,255,0.3)',
            cursor: 'grab',
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: 11, fontWeight: 800, color: '#3d1a10' }}>stickers</span>
          <button
            onMouseDown={(e) => e.stopPropagation()}
            onClick={onClose}
            style={{
              width: 22,
              height: 22,
              borderRadius: '50%',
              background: 'rgba(200,120,140,0.18)',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={10} color="rgba(122,48,64,0.7)" strokeWidth={2.5} />
          </button>
        </div>

        {/* lista de packs */}
        <div
          className="sticker-picker-scroll"
          style={{ overflowY: 'auto', flex: 1, padding: '7px 8px 8px' }}
        >
          {STICKER_PACKS.map((pack) => {
            const ownedInPack = pack.stickers.filter((s) => ownedStickers[s.key])
            const hasAny = ownedInPack.length > 0
            const isExpanded = expandedPack === pack.id

            return (
              <div
                key={pack.id}
                style={{
                  marginBottom: 5,
                  border: `1.5px solid ${hasAny ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.2)'}`,
                  borderRadius: 10,
                  overflow: 'hidden',
                  background: hasAny ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.08)',
                }}
              >
                {/* cabeçalho do pack */}
                <div
                  onClick={() => hasAny && setExpandedPack(isExpanded ? null : pack.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 7,
                    padding: '5px 8px',
                    cursor: hasAny ? 'pointer' : 'default',
                  }}
                >
                  <img
                    src={`./stickers/${pack.preview}`}
                    style={{
                      width: 26,
                      height: 26,
                      objectFit: 'contain',
                      flexShrink: 0,
                      filter: hasAny ? 'none' : 'grayscale(1) opacity(0.35)',
                    }}
                    alt={pack.label}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 10,
                        fontWeight: 800,
                        color: '#3d1a10',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {pack.label}
                    </div>
                    <div style={{ fontSize: 9, color: 'rgba(61,26,16,0.45)' }}>
                      {ownedInPack.length}/{pack.stickers.length}
                    </div>
                  </div>
                  {!hasAny ? (
                    <button
                      onMouseDown={(e) => e.stopPropagation()}
                      onClick={(e) => {
                        e.stopPropagation()
                        onOpenShop?.(pack.id)
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 3,
                        padding: '3px 7px',
                        borderRadius: 20,
                        border: 'none',
                        background: 'rgba(232,160,176,0.35)',
                        fontSize: 9,
                        fontWeight: 800,
                        color: '#3d1a10',
                        cursor: 'pointer',
                        flexShrink: 0,
                        fontFamily: 'Baloo 2, sans-serif',
                      }}
                    >
                      <ShoppingBag size={9} /> loja
                    </button>
                  ) : isExpanded ? (
                    <ChevronDown size={12} color="rgba(122,48,64,0.5)" />
                  ) : (
                    <ChevronRight size={12} color="rgba(122,48,64,0.5)" />
                  )}
                </div>

                {/* grid de stickers */}
                {isExpanded && hasAny && (
                  <div style={{ borderTop: '1.5px solid rgba(255,255,255,0.25)', padding: '7px' }}>
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(42px, 1fr))',
                        gap: 4,
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
                              borderRadius: 7,
                              position: 'relative',
                              border: `1.5px solid ${owned ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.15)'}`,
                              background: owned
                                ? 'rgba(255,255,255,0.25)'
                                : 'rgba(255,255,255,0.06)',
                              cursor: owned ? 'pointer' : 'default',
                              transition: 'transform .12s, background .12s',
                            }}
                            onMouseEnter={(e) => {
                              if (owned) {
                                ;(e.currentTarget as HTMLDivElement).style.transform = 'scale(1.12)'
                                ;(e.currentTarget as HTMLDivElement).style.background =
                                  'rgba(255,255,255,0.4)'
                              }
                            }}
                            onMouseLeave={(e) => {
                              ;(e.currentTarget as HTMLDivElement).style.transform = ''
                              ;(e.currentTarget as HTMLDivElement).style.background = owned
                                ? 'rgba(255,255,255,0.25)'
                                : 'rgba(255,255,255,0.06)'
                            }}
                          >
                            <img
                              src={`./stickers/${sticker.file}`}
                              style={{
                                width: 32,
                                height: 32,
                                objectFit: 'contain',
                                filter: owned ? 'none' : 'grayscale(1) opacity(0.25)',
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
                                <Lock size={10} color="rgba(122,48,64,0.35)" />
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

        {/* rodapé */}
        <div
          style={{
            padding: '5px 10px 7px',
            borderTop: '1.5px solid rgba(255,255,255,0.25)',
            flexShrink: 0,
            textAlign: 'center',
          }}
        >
          <span style={{ fontSize: 9, color: 'rgba(61,26,16,0.4)', fontWeight: 600 }}>
            clique no sticker para adicionar ao mural
          </span>
        </div>
      </div>
    </>
  )
}
