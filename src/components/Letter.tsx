import { useState, useRef, useCallback } from 'react'
import { LetterItem, LetterColor } from '../types/board'

const LETTER_COLORS: Record<
  LetterColor,
  { bg: string; flap: string; stroke: string; header: string; text: string }
> = {
  rosa: {
    bg: '#fdf6f0',
    flap: '#f9d0e0',
    stroke: '#e8a0b0',
    header: 'linear-gradient(135deg,#fda4b4 0%,#f9d0e0 100%)',
    text: '#7a3040',
  },
  verde: {
    bg: '#f4faf4',
    flap: '#b8e0b8',
    stroke: '#7FB87F',
    header: 'linear-gradient(135deg,#a8d8a8 0%,#d4eed4 100%)',
    text: '#2D4A2D',
  },
  azul: {
    bg: '#f0f6fd',
    flap: '#b8d4f0',
    stroke: '#7aaed4',
    header: 'linear-gradient(135deg,#90c0e8 0%,#cce0f4 100%)',
    text: '#1a3a5c',
  },
  amarelo: {
    bg: '#fffdf0',
    flap: '#f5e8a0',
    stroke: '#d4b840',
    header: 'linear-gradient(135deg,#f0d060 0%,#f8f0b0 100%)',
    text: '#5c4a00',
  },
  lilas: {
    bg: '#faf0fd',
    flap: '#ddb8f0',
    stroke: '#b07ad4',
    header: 'linear-gradient(135deg,#c890e8 0%,#e8c8f8 100%)',
    text: '#4a1a6c',
  },
}

const COLOR_LABELS: Record<LetterColor, string> = {
  rosa: 'rosa',
  verde: 'verde',
  azul: 'azul',
  amarelo: 'amarelo',
  lilas: 'lilás',
}

interface Props {
  item: LetterItem
  editMode: boolean
  currentUid: string
  displayName: string
  otherName: string
  zIndex: number
  onUpdate: (id: string, data: Partial<LetterItem>) => void
  onDelete: (id: string) => void
  onBringForward: (id: string) => void
  onSendBackward: (id: string) => void
  onFocus: (id: string) => void
  onOpenModal: (item: LetterItem) => void
  onContextMenu?: (e: React.MouseEvent) => void
}

export default function Letter({
  item,
  editMode,
  currentUid,
  displayName,
  otherName,
  zIndex,
  onUpdate,
  onDelete,
  onBringForward,
  onSendBackward,
  onFocus,
  onOpenModal,
  onContextMenu,
}: Props) {
  const [opening, setOpening] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const dragRef = useRef({ dragging: false, moved: false, sx: 0, sy: 0, px: 0, py: 0 })

  const color = item.color ?? 'rosa'
  const palette = LETTER_COLORS[color]

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

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (editMode || dragRef.current.moved) return
    if (!item.opened && !isAuthor) {
      setOpening(true)
      setTimeout(() => {
        onUpdate(item.id, { opened: true, openedAt: new Date().toISOString() })
        setOpening(false)
        onOpenModal(item)
      }, 900)
    } else {
      onOpenModal(item)
    }
  }

  const isSealed = !item.opened && !opening
  const ENV_W = 110
  const ENV_H = 70
  const flapY = opening ? ENV_H * 0.15 : ENV_H * 0.42

  const clean = (name: string) => (name.includes('@') ? name.split('@')[0] : name)
  const fromName = clean(item.from || displayName)
  const toName = clean(item.to || otherName)
  const isAuthor = item.createdBy === currentUid
  const dateStr = item.createdAt ? new Date(item.createdAt).toLocaleDateString('pt-BR') : ''

  return (
    <>
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
          width: ENV_W,
          cursor: editMode ? 'grab' : 'pointer',
          userSelect: 'none',
          zIndex,
        }}
      >
        <svg
          viewBox={`0 0 ${ENV_W} ${ENV_H + 50}`}
          xmlns="http://www.w3.org/2000/svg"
          style={{ display: 'block', width: ENV_W, height: ENV_H + 50, overflow: 'visible' }}
        >
          <rect x="3" y="5" width="104" height="62" rx="6" fill="rgba(44,20,8,0.1)" />
          <rect
            x="1"
            y="3"
            width="104"
            height="62"
            rx="6"
            fill={palette.bg}
            stroke={palette.stroke}
            strokeWidth="1.5"
          />
          <line x1="1" y1="3" x2="55" y2={ENV_H * 0.52} stroke={palette.flap} strokeWidth="1.2" />
          <line x1="105" y1="3" x2="55" y2={ENV_H * 0.52} stroke={palette.flap} strokeWidth="1.2" />
          <line x1="1" y1="65" x2="55" y2={ENV_H * 0.52} stroke={palette.flap} strokeWidth="1.2" />
          <line
            x1="105"
            y1="65"
            x2="55"
            y2={ENV_H * 0.52}
            stroke={palette.flap}
            strokeWidth="1.2"
          />
          {(item.opened || opening) && (
            <g
              style={{ transition: 'transform 0.65s cubic-bezier(.34,1.56,.64,1)' }}
              transform={`translate(0, ${item.opened ? -38 : opening ? -16 : 0})`}
            >
              <rect
                x="18"
                y="10"
                width="74"
                height="60"
                rx="4"
                fill="#fff8f0"
                stroke="#e8d0b0"
                strokeWidth="1"
              />
              <line x1="26" y1="22" x2="84" y2="22" stroke="#e8c0a0" strokeWidth="0.9" />
              <line x1="26" y1="30" x2="80" y2="30" stroke="#e8c0a0" strokeWidth="0.9" />
              <line x1="26" y1="38" x2="82" y2="38" stroke="#e8c0a0" strokeWidth="0.9" />
              <line x1="26" y1="46" x2="74" y2="46" stroke="#e8c0a0" strokeWidth="0.9" />
            </g>
          )}
          {!item.opened && !opening && (
            <path
              d={`M1 3 L55 ${flapY} L105 3`}
              fill={palette.flap}
              stroke={palette.stroke}
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          )}
          {isSealed && (
            <g transform={`translate(55,${ENV_H * 0.54})`}>
              <path
                d="M0,-9 C-10,-16 -20,-9 -20,0 C-20,9 0,22 0,22 C0,22 20,9 20,0 C20,-9 10,-16 0,-9Z"
                fill={palette.stroke}
                stroke={palette.text}
                strokeWidth="1"
                transform="scale(0.45)"
              />
            </g>
          )}
          {isSealed && (
            <text
              x="55"
              y={ENV_H + 10}
              textAnchor="middle"
              fontSize="7"
              fill={palette.text}
              fontFamily="Baloo 2, sans-serif"
              opacity="0.85"
            >
              clique pra abrir
            </text>
          )}
          <text
            x="7"
            y={ENV_H * 0.7}
            textAnchor="start"
            fontSize="8"
            fill={palette.text}
            fontFamily="Baloo 2, sans-serif"
            fontWeight="700"
            opacity="0.8"
          >
            {`De: ${fromName}`}
          </text>
          <text
            x="7"
            y={ENV_H * 0.7 + 11}
            textAnchor="start"
            fontSize="8"
            fill={palette.text}
            fontFamily="Baloo 2, sans-serif"
            fontWeight="700"
            opacity="0.8"
          >
            {`Para: ${toName}${dateStr ? `  •  ${dateStr}` : ''}`}
          </text>
        </svg>

        {editMode && showMenu && (
          <div
            style={{
              position: 'absolute',
              top: -4,
              right: -4,
              display: 'flex',
              gap: 3,
              zIndex: 10,
            }}
          >
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
              label="✕"
              title="deletar"
              onClick={(e) => {
                e.stopPropagation()
                onDelete(item.id)
              }}
            />
          </div>
        )}
      </div>
    </>
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
        width: 20,
        height: 20,
        borderRadius: '50%',
        background: 'rgba(253,214,228,0.9)',
        border: '1px solid rgba(232,160,176,0.5)',
        cursor: 'pointer',
        fontSize: 10,
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

export function LetterModal({
  item,
  currentUid,
  displayName,
  otherName,
  onUpdate,
  onClose,
}: {
  item: LetterItem
  currentUid: string
  displayName: string
  otherName: string
  onUpdate: (id: string, data: Partial<LetterItem>) => void
  onClose: () => void
}) {
  const isAuthor = item.createdBy === currentUid
  const [editing, setEditing] = useState(item.content === '' && isAuthor)
  const [content, setContent] = useState(item.content)
  const [from, setFrom] = useState(item.from || displayName)
  const [to, setTo] = useState(item.to || otherName)
  const [color, setColor] = useState<LetterColor>(item.color ?? 'rosa')

  const clean = (name: string) => (name.includes('@') ? name.split('@')[0] : name)
  const nameOptions = [displayName, otherName].map(clean).filter(Boolean)
  const fromClean = clean(from)
  const toClean = clean(to)
  const palette = LETTER_COLORS[color]

  const handleSave = () => {
    onUpdate(item.id, { content, from, to, color })
    setEditing(false)
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(44,20,8,0.45)',
        zIndex: 999999,
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
            'linear-gradient(160deg, rgba(253,246,240,0.99) 0%, rgba(252,232,238,0.99) 100%)',
          border: `1.5px solid ${palette.stroke}`,
          borderRadius: 20,
          boxShadow: '0 8px 40px rgba(200,120,140,0.22), inset 0 1px 0 rgba(255,255,255,0.6)',
          backdropFilter: 'blur(18px) saturate(1.4)',
          overflow: 'hidden',
          fontFamily: 'Baloo 2, sans-serif',
          animation: 'letterPop 0.3s cubic-bezier(.34,1.56,.64,1)',
        }}
      >
        <style>{`@keyframes letterPop { from { transform: scale(0.85) translateY(20px); opacity:0; } to { transform:scale(1); opacity:1; } }`}</style>

        {/* cabeçalho */}
        <div
          style={{
            background: palette.header,
            padding: '16px 20px 14px',
            borderBottom: `1.5px solid ${palette.stroke}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 11, color: palette.text, fontWeight: 700, minWidth: 26 }}>
                de
              </span>
              <NameSelect
                value={fromClean}
                options={nameOptions}
                onChange={setFrom}
                disabled={!editing}
                palette={palette}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 11, color: palette.text, fontWeight: 700, minWidth: 26 }}>
                pra
              </span>
              <NameSelect
                value={toClean}
                options={nameOptions}
                onChange={setTo}
                disabled={!editing}
                palette={palette}
              />
            </div>
            {item.openedAt && (
              <div style={{ fontSize: 10, color: palette.text, opacity: 0.7, marginTop: 2 }}>
                aberta em {new Date(item.openedAt).toLocaleDateString('pt-BR')}
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.4)',
              border: `1px solid ${palette.stroke}`,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: palette.text,
              fontSize: 13,
              fontWeight: 700,
              fontFamily: 'Baloo 2, sans-serif',
            }}
          >
            ✕
          </button>
        </div>

        {/* seletor de cor */}
        {editing && (
          <div
            style={{
              display: 'flex',
              gap: 8,
              padding: '10px 20px 0',
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            <span
              style={{
                fontSize: 11,
                color: 'rgba(122,48,64,0.7)',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.8px',
              }}
            >
              cor
            </span>
            {(Object.keys(LETTER_COLORS) as LetterColor[]).map((c) => (
              <button
                key={c}
                title={COLOR_LABELS[c]}
                onClick={() => setColor(c)}
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  background: LETTER_COLORS[c].flap,
                  border:
                    color === c
                      ? `2.5px solid ${LETTER_COLORS[c].text}`
                      : `1.5px solid ${LETTER_COLORS[c].stroke}`,
                  cursor: 'pointer',
                  outline: 'none',
                  boxShadow: color === c ? '0 0 0 2px rgba(0,0,0,0.1)' : 'none',
                  transform: color === c ? 'scale(1.15)' : 'scale(1)',
                  transition: 'transform 0.12s',
                }}
              />
            ))}
          </div>
        )}

        {/* corpo */}
        <div style={{ position: 'relative', padding: '18px 20px 20px', minHeight: 200 }}>
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: 20,
                right: 20,
                height: 1,
                background: 'rgba(232,160,176,0.2)',
                top: 18 + i * 24,
                pointerEvents: 'none',
              }}
            />
          ))}

          {editing ? (
            <>
              <textarea
                autoFocus
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="escreva sua cartinha aqui..."
                style={{
                  width: '100%',
                  minHeight: 192,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  fontSize: 13,
                  color: '#3d2408',
                  fontFamily: 'Baloo 2, sans-serif',
                  lineHeight: '24px',
                  resize: 'vertical',
                  position: 'relative',
                  zIndex: 1,
                  boxSizing: 'border-box',
                }}
              />
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: 8,
                  marginTop: 12,
                  position: 'relative',
                  zIndex: 1,
                }}
              >
                <button
                  onClick={() => {
                    setContent(item.content)
                    setEditing(false)
                  }}
                  style={{
                    background: 'none',
                    border: '1.5px solid rgba(232,160,176,0.4)',
                    borderRadius: 10,
                    padding: '8px 18px',
                    fontSize: 12,
                    color: 'rgba(122,48,64,0.8)',
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
                    border: 'none',
                    borderRadius: 10,
                    padding: '8px 20px',
                    fontSize: 12,
                    color: '#3d1a10',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontFamily: 'Baloo 2, sans-serif',
                  }}
                >
                  salvar
                </button>
              </div>
            </>
          ) : (
            <>
              <div
                style={{
                  fontSize: 13,
                  color: '#3d2408',
                  lineHeight: '24px',
                  minHeight: 144,
                  whiteSpace: 'pre-wrap',
                  position: 'relative',
                  zIndex: 1,
                }}
              >
                {content || <span style={{ opacity: 0.35 }}>carta vazia...</span>}
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: 14,
                  position: 'relative',
                  zIndex: 1,
                }}
              >
                <button
                  onClick={onClose}
                  style={{
                    background: 'none',
                    border: '1.5px solid rgba(232,160,176,0.4)',
                    borderRadius: 10,
                    padding: '8px 18px',
                    fontSize: 12,
                    color: 'rgba(122,48,64,0.8)',
                    cursor: 'pointer',
                    fontFamily: 'Baloo 2, sans-serif',
                  }}
                >
                  fechar
                </button>
                {isAuthor && (
                  <button
                    onClick={() => setEditing(true)}
                    style={{
                      background: 'rgba(232,160,176,0.55)',
                      border: 'none',
                      borderRadius: 10,
                      padding: '8px 20px',
                      fontSize: 12,
                      color: '#3d1a10',
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontFamily: 'Baloo 2, sans-serif',
                    }}
                  >
                    editar
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function NameSelect({
  value,
  options,
  onChange,
  disabled,
  palette,
}: {
  value: string
  options: string[]
  onChange: (v: string) => void
  disabled: boolean
  palette: (typeof LETTER_COLORS)['rosa']
}) {
  if (disabled) {
    return (
      <span
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: palette.text,
          background: 'rgba(255,255,255,0.45)',
          borderRadius: 6,
          padding: '3px 10px',
          border: `1px solid ${palette.stroke}`,
        }}
      >
        {value}
      </span>
    )
  }
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        fontSize: 12,
        fontWeight: 700,
        color: palette.text,
        background: 'rgba(255,255,255,0.7)',
        border: `1px solid ${palette.stroke}`,
        borderRadius: 6,
        padding: '3px 8px',
        fontFamily: 'Baloo 2, sans-serif',
        cursor: 'pointer',
        outline: 'none',
      }}
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  )
}
