import { useState, useRef, useCallback } from 'react'
import { ChecklistItem, ChecklistEntry } from '../types/board'

interface Props {
  item: ChecklistItem
  editMode: boolean
  zIndex: number
  onUpdate: (id: string, data: Partial<ChecklistItem>) => void
  onDelete: (id: string) => void
  onBringForward: (id: string) => void
  onSendBackward: (id: string) => void
  onFocus: (id: string) => void
  onOpenModal: (id: string) => void
  onContextMenu?: (e: React.MouseEvent) => void
}

function makeEntryId() {
  return Math.random().toString(36).slice(2)
}

export default function Checklist({
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
    onOpenModal(item.id)
  }

  const entries = item.entries ?? []
  const done = entries.filter((e) => e.done).length
  const total = entries.length

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
        width: item.width,
        minHeight: item.height,
        background: 'rgba(232,248,238,0.88)',
        border: '1.5px solid rgba(140,200,160,0.6)',
        borderRadius: 12,
        boxShadow: '2px 4px 18px rgba(100,180,130,0.15), inset 0 1px 0 rgba(255,255,255,0.5)',
        padding: '14px 12px 12px',
        cursor: editMode ? 'grab' : 'pointer',
        userSelect: 'none',
        fontFamily: 'Baloo 2, sans-serif',
        zIndex,
        overflow: 'visible',
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

      {editMode && showMenu && (
        <div style={{ position: 'absolute', top: 4, right: 4, display: 'flex', gap: 3 }}>
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

      {item.title && (
        <div style={{ fontWeight: 700, fontSize: 11, color: '#2a5a38', marginBottom: 5 }}>
          {item.title}
        </div>
      )}

      {(item.entries ?? []).map((entry) => (
        <div
          key={entry.id}
          style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3 }}
        >
          <div
            style={{
              width: 11,
              height: 11,
              borderRadius: 3,
              border: '1.5px solid rgba(140,200,160,0.7)',
              background: entry.done ? '#5a9e6a' : 'transparent',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {entry.done && <span style={{ color: '#fff', fontSize: 7, lineHeight: 1 }}>✓</span>}
          </div>
          <span
            style={{
              fontSize: item.fontSize ?? 10,
              color: '#3d2408',
              lineHeight: 1.4,
              textDecoration: entry.done ? 'line-through' : 'none',
              opacity: entry.done ? 0.5 : 1,
            }}
          >
            {entry.text || '...'}
          </span>
        </div>
      ))}

      {total > 0 && (
        <div style={{ fontSize: 9, color: 'rgba(42,90,56,0.7)', marginTop: 4, opacity: 0.7 }}>
          {done}/{total} feitos
        </div>
      )}

      {total === 0 && (
        <div style={{ fontSize: 10, color: '#3d2408', opacity: 0.35 }}>clique pra adicionar</div>
      )}

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
              stroke="#5a9e6a"
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
              background: 'rgba(100,180,130,0.2)',
              border: 'none',
              cursor: 'pointer',
              fontSize: 9,
              color: '#2a5a38',
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
              background: 'rgba(100,180,130,0.2)',
              border: 'none',
              cursor: 'pointer',
              fontSize: 11,
              color: '#2a5a38',
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

function CtxBtn({ label, onClick }: { label: string; onClick: (e: React.MouseEvent) => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: 18,
        height: 18,
        borderRadius: '50%',
        background: 'rgba(253,214,228,0.9)',
        border: '1px solid rgba(232,160,176,0.5)',
        cursor: 'pointer',
        fontSize: 9,
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

export function ChecklistModal({
  item,
  onUpdate,
  onClose,
}: {
  item: ChecklistItem
  onUpdate: (id: string, data: Partial<ChecklistItem>) => void
  onClose: () => void
}) {
  const isNew = (item.entries ?? []).length === 0 && !item.title
  const [editing, setEditing] = useState(isNew)
  const [title, setTitle] = useState(item.title ?? '')
  const [entries, setEntries] = useState<ChecklistEntry[]>(
    (item.entries ?? []).length > 0 ? item.entries : [{ id: makeEntryId(), text: '', done: false }]
  )

  const toggleDone = (id: string) => {
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, done: !e.done } : e)))
  }

  const updateText = (id: string, text: string) => {
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, text } : e)))
  }

  const addEntry = () => {
    setEntries((prev) => [...prev, { id: makeEntryId(), text: '', done: false }])
  }

  const removeEntry = (id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id))
  }

  const handleKeyDown = (e: React.KeyboardEvent, idx: number) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (idx === entries.length - 1) addEntry()
    }
    if (e.key === 'Backspace' && entries[idx].text === '' && entries.length > 1) {
      e.preventDefault()
      removeEntry(entries[idx].id)
    }
  }

  const handleSave = () => {
    onUpdate(item.id, {
      title: title.trim() || undefined,
      entries: entries.filter((e) => e.text.trim() !== '' || e.done),
    })
    setEditing(false)
  }

  const handleCancel = () => {
    if (isNew) {
      onClose()
    } else {
      setTitle(item.title ?? '')
      setEntries(
        (item.entries ?? []).length > 0
          ? item.entries
          : [{ id: makeEntryId(), text: '', done: false }]
      )
      setEditing(false)
    }
  }

  const done = entries.filter((e) => e.done).length

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
          width: 360,
          background:
            'linear-gradient(160deg, rgba(240,252,244,0.98) 0%, rgba(220,246,230,0.98) 100%)',
          border: '1.5px solid rgba(140,200,160,0.45)',
          borderRadius: 20,
          boxShadow: '0 8px 40px rgba(100,180,130,0.2), inset 0 1px 0 rgba(255,255,255,0.6)',
          backdropFilter: 'blur(18px) saturate(1.4)',
          fontFamily: 'Baloo 2, sans-serif',
          overflow: 'hidden',
          animation: 'popIn 0.25s cubic-bezier(.34,1.56,.64,1)',
        }}
      >
        <style>{`@keyframes popIn { from { transform: scale(0.88) translateY(16px); opacity: 0; } to { transform: scale(1); opacity: 1; } }`}</style>

        {/* fita */}
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 6, marginBottom: -8 }}>
          <div
            style={{
              width: 52,
              height: 18,
              background: 'rgba(253,246,240,0.75)',
              border: '1px solid rgba(232,160,176,0.35)',
              borderRadius: 4,
              boxShadow: '0 1px 3px rgba(200,120,140,0.12)',
            }}
          />
        </div>

        <div style={{ padding: '20px 22px 22px' }}>
          {editing ? (
            <>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="título da lista (opcional)"
                style={{
                  width: '100%',
                  background: 'rgba(240,252,244,0.7)',
                  border: '1.5px solid rgba(140,200,160,0.35)',
                  borderRadius: 10,
                  padding: '8px 12px',
                  fontSize: 13,
                  fontWeight: 700,
                  color: '#2a5a38',
                  outline: 'none',
                  fontFamily: 'Baloo 2, sans-serif',
                  marginBottom: 14,
                  boxSizing: 'border-box',
                }}
              />

              <div style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 10, color: 'rgba(42,90,56,0.7)' }}>
                    {done} de {entries.length} feitos
                  </span>
                  <span style={{ fontSize: 10, color: 'rgba(42,90,56,0.5)' }}>
                    {entries.length > 0 ? Math.round((done / entries.length) * 100) : 0}%
                  </span>
                </div>
                <div
                  style={{
                    height: 4,
                    background: 'rgba(140,200,160,0.2)',
                    borderRadius: 4,
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      borderRadius: 4,
                      background: 'linear-gradient(90deg, #5a9e6a, #8fce9a)',
                      width: `${entries.length > 0 ? (done / entries.length) * 100 : 0}%`,
                      transition: 'width 0.3s',
                    }}
                  />
                </div>
              </div>

              <div
                style={{
                  maxHeight: 240,
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                }}
              >
                {entries.map((entry, idx) => (
                  <div key={entry.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button
                      onClick={() => toggleDone(entry.id)}
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: 5,
                        flexShrink: 0,
                        border: '1.5px solid rgba(140,200,160,0.7)',
                        background: entry.done ? '#5a9e6a' : 'transparent',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {entry.done && <span style={{ color: '#fff', fontSize: 10 }}>✓</span>}
                    </button>
                    <input
                      autoFocus={idx === entries.length - 1 && entry.text === ''}
                      value={entry.text}
                      onChange={(e) => updateText(entry.id, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, idx)}
                      placeholder="item..."
                      style={{
                        flex: 1,
                        background: 'transparent',
                        border: 'none',
                        outline: 'none',
                        fontSize: 12,
                        color: '#3d2408',
                        fontFamily: 'Baloo 2, sans-serif',
                        textDecoration: entry.done ? 'line-through' : 'none',
                        opacity: entry.done ? 0.5 : 1,
                      }}
                    />
                    <button
                      onClick={() => removeEntry(entry.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: 11,
                        color: 'rgba(42,90,56,0.5)',
                        padding: 0,
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              <button
                onClick={addEntry}
                style={{
                  marginTop: 10,
                  background: 'none',
                  border: '1.5px dashed rgba(140,200,160,0.6)',
                  borderRadius: 10,
                  padding: '5px 14px',
                  fontSize: 11,
                  color: 'rgba(42,90,56,0.7)',
                  cursor: 'pointer',
                  fontFamily: 'Baloo 2, sans-serif',
                  width: '100%',
                }}
              >
                + adicionar item
              </button>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 14 }}>
                <button
                  onClick={handleCancel}
                  style={{
                    background: 'none',
                    border: '1.5px solid rgba(140,200,160,0.4)',
                    borderRadius: 10,
                    padding: '8px 16px',
                    fontSize: 12,
                    color: 'rgba(42,90,56,0.8)',
                    cursor: 'pointer',
                    fontFamily: 'Baloo 2, sans-serif',
                  }}
                >
                  cancelar
                </button>
                <button
                  onClick={handleSave}
                  style={{
                    background: 'rgba(140,200,160,0.55)',
                    border: 'none',
                    borderRadius: 10,
                    padding: '8px 18px',
                    fontSize: 12,
                    color: '#1a4a2a',
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
                <div style={{ fontWeight: 700, fontSize: 14, color: '#2a5a38', marginBottom: 10 }}>
                  {item.title}
                </div>
              )}

              {(item.entries ?? []).length > 0 && (
                <div style={{ marginBottom: 12 }}>
                  <div
                    style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}
                  >
                    <span style={{ fontSize: 10, color: 'rgba(42,90,56,0.7)' }}>
                      {(item.entries ?? []).filter((e) => e.done).length} de{' '}
                      {(item.entries ?? []).length} feitos
                    </span>
                    <span style={{ fontSize: 10, color: 'rgba(42,90,56,0.5)' }}>
                      {Math.round(
                        ((item.entries ?? []).filter((e) => e.done).length /
                          (item.entries ?? []).length) *
                          100
                      )}
                      %
                    </span>
                  </div>
                  <div
                    style={{
                      height: 4,
                      background: 'rgba(140,200,160,0.2)',
                      borderRadius: 4,
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        borderRadius: 4,
                        background: 'linear-gradient(90deg, #5a9e6a, #8fce9a)',
                        width: `${((item.entries ?? []).filter((e) => e.done).length / (item.entries ?? []).length) * 100}%`,
                        transition: 'width 0.3s',
                      }}
                    />
                  </div>
                </div>
              )}

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                  maxHeight: 260,
                  overflowY: 'auto',
                }}
              >
                {(item.entries ?? []).length === 0 && (
                  <div style={{ fontSize: 12, color: '#3d2408', opacity: 0.35 }}>
                    lista vazia...
                  </div>
                )}
                {(item.entries ?? []).map((entry) => (
                  <div key={entry.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button
                      onClick={() => {
                        const updated = (item.entries ?? []).map((e) =>
                          e.id === entry.id ? { ...e, done: !e.done } : e
                        )
                        onUpdate(item.id, { entries: updated })
                      }}
                      style={{
                        width: 16,
                        height: 16,
                        borderRadius: 4,
                        flexShrink: 0,
                        border: '1.5px solid rgba(140,200,160,0.6)',
                        background: entry.done ? '#5a9e6a' : 'transparent',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {entry.done && <span style={{ color: '#fff', fontSize: 9 }}>✓</span>}
                    </button>
                    <span
                      style={{
                        fontSize: 12,
                        color: '#3d2408',
                        lineHeight: 1.5,
                        textDecoration: entry.done ? 'line-through' : 'none',
                        opacity: entry.done ? 0.5 : 1,
                      }}
                    >
                      {entry.text}
                    </span>
                  </div>
                ))}
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
                    border: '1.5px solid rgba(140,200,160,0.4)',
                    borderRadius: 10,
                    padding: '8px 16px',
                    fontSize: 12,
                    color: 'rgba(42,90,56,0.8)',
                    cursor: 'pointer',
                    fontFamily: 'Baloo 2, sans-serif',
                  }}
                >
                  fechar
                </button>
                <button
                  onClick={() => setEditing(true)}
                  style={{
                    background: 'rgba(140,200,160,0.55)',
                    border: 'none',
                    borderRadius: 10,
                    padding: '8px 18px',
                    fontSize: 12,
                    color: '#1a4a2a',
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
