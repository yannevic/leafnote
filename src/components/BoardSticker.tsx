import { useRef, useCallback, useState } from 'react'
import { X } from 'lucide-react'
import { STICKER_PACKS } from '../assets/stickers/index'
import type { BoardStickerItem } from '../types/board'

interface Props {
  item: BoardStickerItem
  editMode: boolean
  zIndex: number
  onUpdate: (id: string, data: Partial<BoardStickerItem>) => void
  onDelete: (id: string) => void
  onBringForward: (id: string) => void
  onSendBackward: (id: string) => void
  onFocus: (id: string) => void
  onContextMenu?: (e: React.MouseEvent) => void
}

export default function BoardSticker({
  item,
  editMode,
  zIndex,
  onUpdate,
  onDelete,
  onBringForward,
  onSendBackward,
  onFocus,
  onContextMenu,
}: Props) {
  const [showMenu, setShowMenu] = useState(false)
  const dragRef = useRef({ dragging: false, sx: 0, sy: 0, px: 0, py: 0 })

  const pack = STICKER_PACKS.find((p) => p.stickers.some((s) => s.key === item.stickerKey))
  const stickerItem = pack?.stickers.find((s) => s.key === item.stickerKey)
  if (!stickerItem) return null

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!editMode) return
      onFocus(item.id)
      dragRef.current = { dragging: true, sx: e.clientX, sy: e.clientY, px: item.x, py: item.y }
      e.preventDefault()
      const onMove = (ev: MouseEvent) => {
        if (!dragRef.current.dragging) return
        onUpdate(item.id, {
          x: dragRef.current.px + (ev.clientX - dragRef.current.sx),
          y: dragRef.current.py + (ev.clientY - dragRef.current.sy),
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
    [editMode, item.x, item.y, item.id, onUpdate, onFocus]
  )

  return (
    <div
      data-item
      onMouseDown={onMouseDown}
      onContextMenu={onContextMenu}
      onMouseEnter={() => setShowMenu(true)}
      onMouseLeave={() => setShowMenu(false)}
      style={{
        position: 'absolute',
        left: item.x,
        top: item.y,
        width: item.width,
        height: item.height,
        zIndex,
        transform: `rotate(${item.rotation ?? 0}deg)`,
        transformOrigin: 'center center',
        cursor: editMode ? 'grab' : 'default',
        userSelect: 'none',
      }}
    >
      <img
        src={`./stickers/${stickerItem.file}`}
        alt={item.stickerKey}
        style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
        draggable={false}
      />

      {editMode && showMenu && (
        <>
          {/* deletar */}
          <button
            onMouseDown={(e) => e.stopPropagation()}
            onClick={() => onDelete(item.id)}
            style={{
              position: 'absolute',
              top: -8,
              right: -8,
              width: 18,
              height: 18,
              borderRadius: '50%',
              background: 'rgba(232,96,122,0.85)',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10,
            }}
          >
            <X size={9} color="#fff" />
          </button>

          {/* girar — topo centro */}
          <div
            onMouseDown={(e) => {
              e.stopPropagation()
              e.preventDefault()
              const rect = (e.currentTarget.parentElement as HTMLElement).getBoundingClientRect()
              const cx = rect.left + rect.width / 2
              const cy = rect.top + rect.height / 2
              const startAngle = Math.atan2(e.clientY - cy, e.clientX - cx) * (180 / Math.PI)
              const origRot = item.rotation ?? 0
              const onMove = (ev: MouseEvent) => {
                const angle = Math.atan2(ev.clientY - cy, ev.clientX - cx) * (180 / Math.PI)
                onUpdate(item.id, { rotation: origRot + (angle - startAngle) })
              }
              const onUp = () => {
                window.removeEventListener('mousemove', onMove)
                window.removeEventListener('mouseup', onUp)
              }
              window.addEventListener('mousemove', onMove)
              window.addEventListener('mouseup', onUp)
            }}
            style={{
              position: 'absolute',
              top: -20,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 14,
              height: 14,
              borderRadius: '50%',
              background: '#9B7FD4',
              border: '2px solid #fff',
              cursor: 'crosshair',
              zIndex: 10,
            }}
          />

          {/* redimensionar — canto inferior direito */}
          <div
            onMouseDown={(e) => {
              e.stopPropagation()
              e.preventDefault()
              const startX = e.clientX
              const startY = e.clientY
              const origW = item.width
              const origH = item.height
              const onMove = (ev: MouseEvent) => {
                const newSize = Math.max(
                  24,
                  Math.max(origW + (ev.clientX - startX), origH + (ev.clientY - startY))
                )
                onUpdate(item.id, { width: newSize, height: newSize })
              }
              const onUp = () => {
                window.removeEventListener('mousemove', onMove)
                window.removeEventListener('mouseup', onUp)
              }
              window.addEventListener('mousemove', onMove)
              window.addEventListener('mouseup', onUp)
            }}
            style={{
              position: 'absolute',
              bottom: -6,
              right: -6,
              width: 14,
              height: 14,
              borderRadius: 4,
              background: '#9B7FD4',
              border: '2px solid #fff',
              cursor: 'se-resize',
              zIndex: 10,
            }}
          />

          {/* frente/trás */}
          <div
            style={{ position: 'absolute', top: -8, left: -8, display: 'flex', gap: 3, zIndex: 10 }}
          >
            <button
              onMouseDown={(e) => e.stopPropagation()}
              onClick={() => onBringForward(item.id)}
              style={{
                width: 18,
                height: 18,
                borderRadius: '50%',
                background: 'rgba(240,200,220,0.9)',
                border: '1px solid #9b5a78',
                cursor: 'pointer',
                fontSize: 10,
                color: '#5a2a40',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
              }}
            >
              ↑
            </button>
            <button
              onMouseDown={(e) => e.stopPropagation()}
              onClick={() => onSendBackward(item.id)}
              style={{
                width: 18,
                height: 18,
                borderRadius: '50%',
                background: 'rgba(240,200,220,0.9)',
                border: '1px solid #9b5a78',
                cursor: 'pointer',
                fontSize: 10,
                color: '#5a2a40',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
              }}
            >
              ↓
            </button>
          </div>
        </>
      )}
    </div>
  )
}
