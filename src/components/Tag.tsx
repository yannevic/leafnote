import { useState, useRef, useCallback } from 'react'
import { TagItem } from '../types/board'

const TAG_COLORS = [
  { bg: 'rgba(253,214,228,0.75)', border: 'rgba(232,160,176,0.7)', text: '#7a3040' },
  { bg: 'rgba(210,242,220,0.75)', border: 'rgba(140,200,160,0.7)', text: '#1a5a2a' },
  { bg: 'rgba(210,228,252,0.75)', border: 'rgba(140,180,240,0.7)', text: '#1a3a6a' },
  { bg: 'rgba(254,248,200,0.75)', border: 'rgba(220,190,80,0.7)', text: '#5a3e00' },
  { bg: 'rgba(230,220,252,0.75)', border: 'rgba(180,160,240,0.7)', text: '#3a1a7a' },
  { bg: 'rgba(252,220,215,0.75)', border: 'rgba(230,150,130,0.7)', text: '#6a1a10' },
]

interface Props {
  item: TagItem
  editMode: boolean
  zIndex: number
  onUpdate: (id: string, data: Partial<TagItem>) => void
  onDelete: (id: string) => void
  onBringForward: (id: string) => void
  onSendBackward: (id: string) => void
  onFocus: (id: string) => void
  onContextMenu?: (e: React.MouseEvent) => void
}

export default function Tag({
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
  const [editing, setEditing] = useState(false)
  const [label, setLabel] = useState(item.label)
  const [showMenu, setShowMenu] = useState(false)
  const dragRef = useRef({ dragging: false, moved: false, sx: 0, sy: 0, px: 0, py: 0 })

  const colorIdx = parseInt(item.color, 10) % TAG_COLORS.length
  const colors = TAG_COLORS[colorIdx] ?? TAG_COLORS[0]

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!editMode || editing) return
      onFocus(item.id)
      dragRef.current = {
        dragging: true,
        moved: false,
        sx: e.clientX,
        sy: e.clientY,
        px: item.x,
        py: item.y,
      }
      e.preventDefault()
      const onMove = (ev: MouseEvent) => {
        const d = dragRef.current
        if (!d.dragging) return
        const dx = ev.clientX - d.sx
        const dy = ev.clientY - d.sy
        if (Math.abs(dx) > 4 || Math.abs(dy) > 4) d.moved = true
        onUpdate(item.id, { x: d.px + dx, y: d.py + dy })
      }
      const onUp = () => {
        dragRef.current.dragging = false
        window.removeEventListener('mousemove', onMove)
        window.removeEventListener('mouseup', onUp)
      }
      window.addEventListener('mousemove', onMove)
      window.addEventListener('mouseup', onUp)
    },
    [editMode, editing, item.x, item.y, item.id, onUpdate, onFocus]
  )

  const handleBlur = () => {
    setEditing(false)
    onUpdate(item.id, { label: label.trim() || 'tag' })
  }

  return (
    <div
      data-item
      onMouseDown={onMouseDown}
      onContextMenu={onContextMenu}
      onDoubleClick={() => {
        if (!editMode) setEditing(true)
      }}
      onMouseEnter={() => setShowMenu(true)}
      onMouseLeave={() => setShowMenu(false)}
      style={{
        position: 'absolute',
        left: item.x,
        top: item.y,
        background: colors.bg,
        border: `1.5px solid ${colors.border}`,
        borderRadius: 99,
        padding: '4px 14px',
        boxShadow: '1px 2px 8px rgba(200,120,140,0.15), inset 0 1px 0 rgba(255,255,255,0.4)',
        backdropFilter: 'blur(8px)',
        cursor: editMode ? 'grab' : 'default',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        fontFamily: 'Baloo 2, sans-serif',
        zIndex,
      }}
    >
      {editing ? (
        <input
          autoFocus
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleBlur()
          }}
          style={{
            background: 'transparent',
            border: 'none',
            outline: 'none',
            fontSize: 11,
            fontWeight: 700,
            color: colors.text,
            width: Math.max(60, label.length * 8),
            fontFamily: 'Baloo 2, sans-serif',
          }}
        />
      ) : (
        <span style={{ fontSize: 11, fontWeight: 700, color: colors.text }}>{label}</span>
      )}

      {editMode && showMenu && !editing && (
        <div style={{ display: 'flex', gap: 2, marginLeft: 4 }}>
          <CtxBtn
            label="↑"
            onClick={(e) => {
              e.stopPropagation()
              onBringForward(item.id)
            }}
          />
          <CtxBtn
            label="↓"
            onClick={(e) => {
              e.stopPropagation()
              onSendBackward(item.id)
            }}
          />
          <CtxBtn
            label="✕"
            onClick={(e) => {
              e.stopPropagation()
              onDelete(item.id)
            }}
          />
        </div>
      )}
    </div>
  )
}

function CtxBtn({ label, onClick }: { label: string; onClick: (e: React.MouseEvent) => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: 14,
        height: 14,
        borderRadius: '50%',
        background: 'rgba(253,214,228,0.9)',
        border: '1px solid rgba(232,160,176,0.5)',
        cursor: 'pointer',
        fontSize: 8,
        color: '#7a3040',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 700,
      }}
    >
      {label}
    </button>
  )
}
