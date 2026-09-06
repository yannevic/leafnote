// src/components/ProfileBadgeHolder.tsx
import { useRef, useState, useCallback } from 'react'
import { X, Plus } from 'lucide-react'
import { COLLECTIONS } from '../lib/cards'
import { MAX_BADGES_PER_HOLDER } from '../lib/profileBadgeHolders'
import type { BadgeHolderPlacement, BadgeHolderModel } from '../lib/profileBadgeHolders'
import type { ProfileBadges as ProfileBadgesState } from '../lib/profileBadges'

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
  const [showPicker, setShowPicker] = useState(false)
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

  const availableToAdd = Object.values(COLLECTIONS).filter(
    (c) => unlockedBadges[c.id] && !placement.badgeIds.includes(c.id)
  )

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

      {placement.badgeIds.map((collectionId) => {
        const col = COLLECTIONS[collectionId as keyof typeof COLLECTIONS]
        if (!col) return null
        return (
          <div
            key={collectionId}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={() => editable && onRemoveBadge(collectionId)}
            title={editable ? `${col.name} — clique pra remover` : col.name}
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
              src={`./badges/${col.id}.png`}
              alt={col.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        )
      })}

      {editable &&
        placement.badgeIds.length < MAX_BADGES_PER_HOLDER &&
        availableToAdd.length > 0 && (
          <div style={{ position: 'relative' }}>
            <button
              onMouseDown={(e) => e.stopPropagation()}
              onClick={() => setShowPicker((v) => !v)}
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

            {showPicker && (
              <div
                onMouseDown={(e) => e.stopPropagation()}
                style={{
                  position: 'absolute',
                  top: CIRCLE + 8,
                  left: 0,
                  display: 'flex',
                  gap: 6,
                  padding: 8,
                  borderRadius: 14,
                  background: 'rgba(253,246,240,0.98)',
                  border: '1.5px solid rgba(232,160,176,0.4)',
                  boxShadow: '0 6px 20px rgba(122,48,64,0.2)',
                  zIndex: 999999,
                }}
              >
                {availableToAdd.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      onAddBadge(c.id)
                      setShowPicker(false)
                    }}
                    title={c.name}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      border: 'none',
                      padding: 0,
                      cursor: 'pointer',
                      overflow: 'hidden',
                    }}
                  >
                    <img
                      src={`./badges/${c.id}.png`}
                      alt={c.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
    </div>
  )
}
