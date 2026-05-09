import { useState, useRef, useCallback } from 'react'
import { PostItItem } from '../types/board'

export const COLOR_MAP: Record<
  string,
  { bg: string; border: string; title: string; name: string }
> = {
  yellow: { bg: '#fef9d7', border: '#e8cc60', title: '#5a3e00', name: 'amarelo' },
  pink: { bg: '#fde8ee', border: '#e8a0b0', title: '#7a3040', name: 'rosa' },
  green: { bg: '#e8f5e8', border: '#8fce9a', title: '#1a4a2a', name: 'verde' },
  blue: { bg: '#e8f0fd', border: '#93b8f0', title: '#1e3a5f', name: 'azul' },
  lavender: { bg: '#ede8fd', border: '#b8a8f0', title: '#3a2070', name: 'lilás' },
  peach: { bg: '#fdeee0', border: '#e8a878', title: '#5a2a00', name: 'pêssego' },
}

const COLOR_KEYS = Object.keys(COLOR_MAP)

interface Props {
  item: PostItItem
  editMode: boolean
  zIndex: number
  onUpdate: (id: string, data: Partial<PostItItem>) => void
  onDelete: (id: string) => void
  onBringForward: (id: string) => void
  onSendBackward: (id: string) => void
  onFocus: (id: string) => void
  onOpenModal: (id: string) => void
  onContextMenu?: (e: React.MouseEvent) => void
}

export default function PostIt({
  item,
  editMode,
  zIndex,
  onUpdate,
  onDelete,
  onBringForward,
  onSendBackward,
  onFocus,
  onOpenModal,
  onContextMenu,
}: Props) {
  const [showMenu, setShowMenu] = useState(false)
  const dragRef = useRef({ dragging: false, moved: false, sx: 0, sy: 0, px: 0, py: 0 })
  const resizeRef = useRef({ resizing: false, sx: 0, sy: 0, sw: 0, sh: 0 })
  const colors = COLOR_MAP[item.color] ?? COLOR_MAP.yellow

  const isExpanded = !item.compacted && !!item.content

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!editMode) return
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
    [editMode, item.x, item.y, item.id, onUpdate, onFocus]
  )

  const onResizeMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      e.preventDefault()
      resizeRef.current = {
        resizing: true,
        sx: e.clientX,
        sy: e.clientY,
        sw: item.width,
        sh: item.height,
      }
      const onMove = (ev: MouseEvent) => {
        const r = resizeRef.current
        if (!r.resizing) return
        const newW = Math.max(100, r.sw + ev.clientX - r.sx)
        const newH = Math.max(80, r.sh + ev.clientY - r.sy)
        onUpdate(item.id, { width: newW, height: newH })
      }
      const onUp = () => {
        resizeRef.current.resizing = false
        window.removeEventListener('mousemove', onMove)
        window.removeEventListener('mouseup', onUp)
      }
      window.addEventListener('mousemove', onMove)
      window.addEventListener('mouseup', onUp)
    },
    [item.id, item.width, item.height, onUpdate]
  )

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (editMode || dragRef.current.moved) return
    dragRef.current.moved = false
    onOpenModal(item.id)
  }

  return (
    <div
      data-item
      onMouseDown={onMouseDown}
      onClick={handleClick}
      onContextMenu={onContextMenu}
      onMouseEnter={() => setShowMenu(true)}
      onMouseLeave={() => setShowMenu(false)}
      style={{
        position: 'absolute',
        left: item.x,
        top: item.y,
        width: isExpanded ? item.width * 1.4 : item.width,
        minHeight: item.height,
        height: item.compacted ? 120 : undefined,
        background: colors.bg,
        border: `1.5px solid ${colors.border}`,
        padding: '16px 12px 12px',
        borderRadius: 12,
        boxShadow: '2px 4px 18px rgba(200,120,140,0.18), 0 1px 0 rgba(255,255,255,0.6) inset',
        cursor: editMode ? 'grab' : 'pointer',
        userSelect: 'none',
        fontFamily: 'Baloo 2, sans-serif',
        zIndex,
        overflow: 'visible',
        transition: 'width 0.2s ease, height 0.2s ease',
      }}
    >
      {/* fita */}
      <div
        style={{
          position: 'absolute',
          top: -9,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 40,
          height: 17,
          background: 'rgba(253,246,240,0.75)',
          border: '1px solid rgba(232,160,176,0.35)',
          borderRadius: 4,
          boxShadow: '0 1px 3px rgba(200,120,140,0.12)',
        }}
      />

      {/* botões de contexto em modo edição */}
      {editMode && showMenu && (
        <div style={{ position: 'absolute', top: 4, right: 4, display: 'flex', gap: 3 }}>
          <CtxBtn
            label="↑"
            title="à frente"
            onClick={(e) => {
              e.stopPropagation()
              onBringForward(item.id)
            }}
          />
          <CtxBtn
            label="↓"
            title="atrás"
            onClick={(e) => {
              e.stopPropagation()
              onSendBackward(item.id)
            }}
          />
          <CtxBtn
            label={item.compacted ? '↕' : '↔'}
            title={item.compacted ? 'expandir' : 'compactar'}
            onClick={(e) => {
              e.stopPropagation()
              onUpdate(item.id, { compacted: !item.compacted })
            }}
          />
          <CtxBtn
            label="✕"
            title="deletar"
            onClick={(e) => {
              e.stopPropagation()
              onDelete(item.id)
            }}
          />
        </div>
      )}

      {item.title && (
        <div
          style={{
            fontWeight: 700,
            fontSize: 11,
            color: colors.title,
            marginBottom: 3,
            lineHeight: 1.3,
          }}
        >
          {item.title}
        </div>
      )}
      <div
        style={{
          fontSize: item.fontSize ?? 10,
          color: '#3d2408',
          lineHeight: 1.5,
          opacity: item.content ? 1 : 0.35,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          overflow: item.compacted ? 'hidden' : 'visible',
          display: item.compacted ? '-webkit-box' : 'block',
          WebkitLineClamp: item.compacted ? 4 : undefined,
          WebkitBoxOrient: item.compacted ? 'vertical' : undefined,
        }}
      >
        {item.content || 'clique pra abrir'}
      </div>

      {editMode && (
        <div
          onMouseDown={onResizeMouseDown}
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: 18,
            height: 18,
            cursor: 'nwse-resize',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path
              d="M2 9 L9 2 M5 9 L9 5 M8 9 L9 8"
              stroke="#8b5a2a"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
      )}
      {editMode && (
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            right: 18,
            display: 'flex',
            gap: 2,
            padding: 2,
          }}
        >
          <button
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation()
              onUpdate(item.id, { fontSize: Math.max(8, (item.fontSize ?? 10) - 1) })
            }}
            style={{
              width: 14,
              height: 14,
              borderRadius: 3,
              background: 'rgba(44,20,8,0.15)',
              border: 'none',
              cursor: 'pointer',
              fontSize: 9,
              color: '#3d2408',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              lineHeight: 1,
            }}
          >
            A
          </button>
          <button
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation()
              onUpdate(item.id, { fontSize: Math.min(22, (item.fontSize ?? 10) + 1) })
            }}
            style={{
              width: 16,
              height: 16,
              borderRadius: 3,
              background: 'rgba(44,20,8,0.15)',
              border: 'none',
              cursor: 'pointer',
              fontSize: 11,
              color: '#3d2408',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              lineHeight: 1,
            }}
          >
            A
          </button>
        </div>
      )}
    </div>
  )
}

function CtxBtn({
  label,
  title,
  onClick,
}: {
  label: string
  title: string
  onClick: (e: React.MouseEvent) => void
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      style={{
        width: 18,
        height: 18,
        borderRadius: '50%',
        background: 'rgba(44,20,8,0.2)',
        border: 'none',
        cursor: 'pointer',
        fontSize: 9,
        color: '#3d2408',
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

export function PostItModal({
  item,
  onUpdate,
  onClose,
}: {
  item: PostItItem
  onUpdate: (id: string, data: Partial<PostItItem>) => void
  onClose: () => void
}) {
  const isNew = item.content === '' && !item.title
  const [editing, setEditing] = useState(isNew)
  const [title, setTitle] = useState(item.title ?? '')
  const [content, setContent] = useState(item.content)
  const [color, setColor] = useState<PostItItem['color']>(item.color)
  const colors = COLOR_MAP[color] ?? COLOR_MAP.yellow

  const handleSave = () => {
    onUpdate(item.id, { title: title.trim() || undefined, content, color })
    setEditing(false)
  }

  const handleCancel = () => {
    if (isNew) {
      onClose()
    } else {
      setTitle(item.title ?? '')
      setContent(item.content)
      setColor(item.color)
      setEditing(false)
    }
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(44,20,8,0.4)',
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 380,
          background:
            'linear-gradient(160deg, rgba(253,246,240,0.98) 0%, rgba(252,232,238,0.98) 100%)',
          border: '1.5px solid rgba(232,160,176,0.4)',
          borderRadius: 20,
          boxShadow: '0 8px 40px rgba(200,120,140,0.22), inset 0 1px 0 rgba(255,255,255,0.6)',
          backdropFilter: 'blur(18px) saturate(1.4)',
          fontFamily: 'Baloo 2, sans-serif',
          overflow: 'hidden',
          animation: 'popIn 0.25s cubic-bezier(.34,1.56,.64,1)',
        }}
      >
        <style>{`
          @keyframes popIn {
            from { transform: scale(0.88) translateY(16px); opacity: 0; }
            to   { transform: scale(1) translateY(0); opacity: 1; }
          }
        `}</style>

        {/* fita decorativa */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            paddingTop: 6,
            marginBottom: -8,
            position: 'relative',
            zIndex: 1,
          }}
        >
          <div
            style={{
              width: 52,
              height: 18,
              background: 'rgba(255,255,200,0.65)',
              border: '1px solid rgba(200,180,0,0.3)',
              borderRadius: 3,
            }}
          />
        </div>

        <div style={{ padding: '20px 22px 22px' }}>
          {editing ? (
            <>
              {/* seletor de cor */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 14, justifyContent: 'center' }}>
                {COLOR_KEYS.map((key) => (
                  <button
                    key={key}
                    title={COLOR_MAP[key].name}
                    onClick={() => setColor(key as PostItItem['color'])}
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      background: COLOR_MAP[key].bg,
                      border:
                        color === key
                          ? `2.5px solid ${COLOR_MAP[key].title}`
                          : `1.5px solid ${COLOR_MAP[key].border}`,
                      cursor: 'pointer',
                      boxShadow:
                        color === key
                          ? `0 0 0 2px ${COLOR_MAP[key].bg}, 0 0 0 4px ${COLOR_MAP[key].border}`
                          : 'none',
                      transform: color === key ? 'scale(1.2)' : 'scale(1)',
                      transition: 'transform 0.12s',
                    }}
                  />
                ))}
              </div>

              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="título (opcional)"
                style={{
                  width: '100%',
                  background: 'rgba(253,242,246,0.7)',
                  border: '1.5px solid rgba(232,160,176,0.3)',
                  borderRadius: 8,
                  padding: '8px 12px',
                  fontSize: 13,
                  fontWeight: 700,
                  color: colors.title,
                  outline: 'none',
                  fontFamily: 'Baloo 2, sans-serif',
                  marginBottom: 10,
                  boxSizing: 'border-box',
                }}
              />

              <textarea
                autoFocus
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="escreva aqui... 🌸"
                style={{
                  width: '100%',
                  minHeight: 150,
                  background: 'rgba(253,242,246,0.7)',
                  border: '1.5px solid rgba(232,160,176,0.3)',
                  borderRadius: 8,
                  padding: '10px 12px',
                  fontSize: 13,
                  color: '#3d2408',
                  outline: 'none',
                  resize: 'vertical',
                  fontFamily: 'Baloo 2, sans-serif',
                  lineHeight: 1.6,
                  boxSizing: 'border-box',
                }}
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 14 }}>
                <button
                  onClick={handleCancel}
                  style={{
                    background: 'none',
                    border: '1.5px solid rgba(232,160,176,0.4)',
                    color: 'rgba(122,48,64,0.8)',
                    borderRadius: 8,
                    padding: '6px 14px',
                    fontSize: 11,
                    cursor: 'pointer',
                    fontFamily: 'Baloo 2, sans-serif',
                  }}
                >
                  cancelar
                </button>
                <button
                  onClick={handleSave}
                  style={{
                    background: 'rgba(232,160,176,0.55)',
                    color: '#3d1a10',
                    border: 'none',
                    borderRadius: 8,
                    padding: '6px 16px',
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontFamily: 'Baloo 2, sans-serif',
                  }}
                >
                  salvar ✓
                </button>
              </div>
            </>
          ) : (
            <>
              {item.title && (
                <div
                  style={{ fontWeight: 700, fontSize: 14, color: colors.title, marginBottom: 8 }}
                >
                  {item.title}
                </div>
              )}
              <div
                style={{
                  fontSize: 13,
                  color: '#3d2408',
                  lineHeight: 1.6,
                  minHeight: 80,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {content || <span style={{ opacity: 0.35 }}>post-it vazio...</span>}
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: 16,
                }}
              >
                <button
                  onClick={onClose}
                  style={{
                    background: 'none',
                    border: '1.5px solid rgba(232,160,176,0.4)',
                    borderRadius: 10,
                    padding: '6px 14px',
                    fontSize: 11,
                    color: 'rgba(122,48,64,0.8)',
                    cursor: 'pointer',
                    fontFamily: 'Baloo 2, sans-serif',
                  }}
                >
                  fechar
                </button>
                <button
                  onClick={() => setEditing(true)}
                  style={{
                    background: 'rgba(232,160,176,0.55)',
                    border: 'none',
                    borderRadius: 10,
                    padding: '6px 16px',
                    fontSize: 11,
                    color: '#3d1a10',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontFamily: 'Baloo 2, sans-serif',
                  }}
                >
                  editar
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
