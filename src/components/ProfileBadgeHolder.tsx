// src/components/ProfileBadgeHolder.tsx
import { useRef, useState, useCallback } from 'react'
import { X, Plus, Lock, Trash2 } from 'lucide-react'
import { COLLECTIONS } from '../lib/cards'
import { MAX_BADGES_PER_HOLDER } from '../lib/profileBadgeHolders'
import type { BadgeHolderPlacement, BadgeHolderModel } from '../lib/profileBadgeHolders'
import type { ProfileBadges as ProfileBadgesState } from '../lib/profileBadges'
import { BADGE_IMAGES } from '../assets/badges'

interface Props {
  placement: BadgeHolderPlacement
  model: BadgeHolderModel | undefined
  unlockedBadges: ProfileBadgesState
  editable: boolean
  onMove: (x: number, y: number) => void
  onAddBadge: (collectionId: string) => void
  onRemoveBadge: (collectionId: string) => void
  onClose: () => void
}

const CIRCLE = 44

// null = fechado · 'add' = escolhendo pra vaga vazia · string = trocando a badge daquele collectionId
type PickerMode = null | 'add' | string

const SCROLLBAR_CSS = `
  .badge-picker-scroll::-webkit-scrollbar { width: 5px; }
  .badge-picker-scroll::-webkit-scrollbar-track { background: transparent; }
  .badge-picker-scroll::-webkit-scrollbar-thumb { background: rgba(232,160,176,0.55); border-radius: 99px; }
  .badge-picker-scroll::-webkit-scrollbar-thumb:hover { background: rgba(232,160,176,0.85); }
`

export default function ProfileBadgeHolder({
  placement,
  model,
  unlockedBadges,
  editable,
  onMove,
  onAddBadge,
  onRemoveBadge,
  onClose,
}: Props) {
  const [picker, setPicker] = useState<PickerMode>(null)
  const dragRef = useRef({ dragging: false, sx: 0, sy: 0, px: 0, py: 0 })

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!editable) return
      dragRef.current = {
        dragging: true,
        sx: e.clientX,
        sy: e.clientY,
        px: placement.x,
        py: placement.y,
      }
      e.preventDefault()
      const onMoveEv = (ev: MouseEvent) => {
        if (!dragRef.current.dragging) return
        onMove(
          dragRef.current.px + (ev.clientX - dragRef.current.sx),
          dragRef.current.py + (ev.clientY - dragRef.current.sy)
        )
      }
      const onUp = () => {
        dragRef.current.dragging = false
        window.removeEventListener('mousemove', onMoveEv)
        window.removeEventListener('mouseup', onUp)
      }
      window.addEventListener('mousemove', onMoveEv)
      window.addEventListener('mouseup', onUp)
    },
    [editable, placement.x, placement.y, onMove]
  )

  // fallback defensivo, além do fix na origem (subscribeBadgeHolderPlacements)
  const badgeIds = placement.badgeIds ?? []
  const isSwapMode = typeof picker === 'string'
  const swapTargetId = isSwapMode ? (picker as string) : null

  const allCollections = Object.values(COLLECTIONS)

  const handlePick = (collectionId: string) => {
    if (isSwapMode && swapTargetId) {
      onRemoveBadge(swapTargetId)
    }
    onAddBadge(collectionId)
    setPicker(null)
  }

  const handleRemoveCurrent = () => {
    if (swapTargetId) onRemoveBadge(swapTargetId)
    setPicker(null)
  }

  return (
    <div
      data-item
      onMouseDown={onMouseDown}
      style={{
        position: 'absolute',
        left: placement.x,
        top: placement.y,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '10px 16px',
        borderRadius: 999,
        background: model?.background ?? 'rgba(253,242,246,0.9)',
        border: '2px solid rgba(255,255,255,0.6)',
        boxShadow: '0 6px 18px rgba(122,48,64,0.18)',
        cursor: editable ? 'grab' : 'default',
        zIndex: 45,
        userSelect: 'none',
      }}
    >
      {editable && (
        <button
          onMouseDown={(e) => e.stopPropagation()}
          onClick={onClose}
          title="tirar do perfil"
          style={{
            position: 'absolute',
            top: -8,
            right: -8,
            width: 20,
            height: 20,
            borderRadius: '50%',
            background: 'rgba(232,96,122,0.85)',
            border: '2px solid white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
          }}
        >
          <X size={10} color="#fff" strokeWidth={2.5} />
        </button>
      )}

      {badgeIds.map((collectionId) => {
        const col = COLLECTIONS[collectionId as keyof typeof COLLECTIONS]
        if (!col) return null
        return (
          <div
            key={collectionId}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={() => editable && setPicker(collectionId)}
            title={editable ? `${col.name} — clique pra trocar ou remover` : col.name}
            style={{
              width: CIRCLE,
              height: CIRCLE,
              borderRadius: '50%',
              border: '2px solid rgba(255,255,255,0.7)',
              overflow: 'hidden',
              flexShrink: 0,
              cursor: editable ? 'pointer' : 'default',
              boxShadow: '0 2px 6px rgba(122,48,64,0.2)',
            }}
          >
            <img
              src={BADGE_IMAGES[col.id]}
              alt={col.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        )
      })}

      {editable && badgeIds.length < MAX_BADGES_PER_HOLDER && (
        <button
          onMouseDown={(e) => e.stopPropagation()}
          onClick={() => setPicker('add')}
          style={{
            width: CIRCLE,
            height: CIRCLE,
            borderRadius: '50%',
            border: '2px dashed rgba(122,48,64,0.4)',
            background: 'rgba(255,255,255,0.35)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Plus size={18} color="rgba(122,48,64,0.6)" strokeWidth={2.5} />
        </button>
      )}

      {picker && (
        <div
          onMouseDown={(e) => e.stopPropagation()}
          onClick={() => setPicker(null)}
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
        >
          <style>{SCROLLBAR_CSS}</style>
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 300,
              maxHeight: 420,
              display: 'flex',
              flexDirection: 'column',
              background:
                'linear-gradient(160deg, rgba(253,246,240,0.98) 0%, rgba(252,232,238,0.98) 100%)',
              border: '1.5px solid rgba(232,160,176,0.4)',
              borderRadius: 18,
              padding: 16,
              fontFamily: 'Baloo 2, sans-serif',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 10,
                flexShrink: 0,
              }}
            >
              <span style={{ fontSize: 13, fontWeight: 800, color: '#3d1a10' }}>
                {isSwapMode ? 'trocar insígnia' : 'escolher insígnia'}
              </span>
              <button
                onClick={() => setPicker(null)}
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
                }}
              >
                <X size={11} color="rgba(122,48,64,0.7)" />
              </button>
            </div>

            <div
              className="badge-picker-scroll"
              style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                {allCollections.map((c) => {
                  const isCurrent = isSwapMode && c.id === swapTargetId
                  const isPlacedElsewhere = badgeIds.includes(c.id) && !isCurrent
                  const isUnlocked = !!unlockedBadges[c.id]
                  const clickable = isUnlocked && !isPlacedElsewhere && !isCurrent

                  return (
                    <div
                      key={c.id}
                      onClick={() => clickable && handlePick(c.id)}
                      style={{
                        border: isCurrent
                          ? '1.5px solid rgba(232,160,176,0.9)'
                          : '1.5px solid rgba(232,160,176,0.35)',
                        borderRadius: 12,
                        padding: 10,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 6,
                        cursor: clickable ? 'pointer' : 'default',
                        opacity: isPlacedElsewhere ? 0.5 : 1,
                      }}
                    >
                      <div
                        style={{
                          position: 'relative',
                          width: 56,
                          height: 56,
                          borderRadius: '50%',
                          overflow: 'hidden',
                          border: '2px solid rgba(255,255,255,0.6)',
                          filter: isUnlocked ? 'none' : 'grayscale(1)',
                          opacity: isUnlocked ? 1 : 0.5,
                        }}
                      >
                        <img
                          src={BADGE_IMAGES[c.id]}
                          alt={c.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        {!isUnlocked && (
                          <div
                            style={{
                              position: 'absolute',
                              inset: 0,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              background: 'rgba(0,0,0,0.25)',
                            }}
                          >
                            <Lock size={16} color="#fff" />
                          </div>
                        )}
                      </div>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          color: '#3d1a10',
                          textAlign: 'center',
                        }}
                      >
                        {c.name}
                      </span>
                      {isCurrent && (
                        <span
                          style={{ fontSize: 9, fontWeight: 800, color: 'rgba(122,48,64,0.6)' }}
                        >
                          atual
                        </span>
                      )}
                      {isPlacedElsewhere && (
                        <span style={{ fontSize: 9, color: 'rgba(61,26,16,0.4)' }}>
                          já colocada
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {isSwapMode && (
              <button
                onClick={handleRemoveCurrent}
                style={{
                  marginTop: 12,
                  flexShrink: 0,
                  fontSize: 11,
                  fontWeight: 800,
                  padding: '6px 12px',
                  borderRadius: 20,
                  border: 'none',
                  background: 'rgba(232,96,122,0.15)',
                  color: 'rgba(150,50,60,0.85)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 5,
                }}
              >
                <Trash2 size={12} /> remover sem trocar
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
