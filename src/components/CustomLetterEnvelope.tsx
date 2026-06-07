import { useState, useRef, useCallback } from 'react'
import type { CustomLetterBoardItem } from '../types/board'

interface Props {
  item: CustomLetterBoardItem
  isOwner: boolean
  panicMode?: boolean
  editMode: boolean
  zIndex: number
  onOpen: (id: string) => void
  onOpenViewer: (item: CustomLetterBoardItem) => void
  onUpdate: (id: string, data: Partial<CustomLetterBoardItem>) => void
  onDelete: (id: string) => void
  onBringForward: (id: string) => void
  onSendBackward: (id: string) => void
  onFocus: (id: string) => void
  onContextMenu?: (e: React.MouseEvent) => void
}

export default function CustomLetterEnvelope({
  item,
  isOwner,
  panicMode,
  editMode,
  zIndex,
  onOpen,
  onOpenViewer,
  onUpdate,
  onDelete,
  onBringForward,
  onSendBackward,
  onFocus,
  onContextMenu,
}: Props) {
  const [animating, setAnimating] = useState(false)
  const [showCard, setShowCard] = useState(() => item.opened === true)
  const [showMenu, setShowMenu] = useState(false)
  const [showBlocked, setShowBlocked] = useState(false)
  const dragRef = useRef({ dragging: false, moved: false, sx: 0, sy: 0, px: 0, py: 0 })

  const ENV_W = 110
  const ENV_H = 70

  const canOpen = (() => {
    if (isOwner) return item.opened === true || !!panicMode
    if (!item.availableFrom) return true
    const today = new Date().toISOString().split('T')[0]
    return today >= item.availableFrom
  })()

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
    if (editMode) return
    if (dragRef.current.moved) {
      dragRef.current.moved = false
      return
    }
    if (isOwner && !item.opened && !panicMode) return
    if (!canOpen) {
      setShowBlocked(true)
      setTimeout(() => setShowBlocked(false), 3000)
      return
    }
    if (showCard) {
      onOpenViewer(item)
      return
    }
    if (!item.opened) {
      setAnimating(true)
      setTimeout(() => {
        setAnimating(false)
        setShowCard(true)
        onOpen(item.id)
      }, 600)
    } else {
      setShowCard(true)
    }
  }

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
        <style>{`
          @keyframes purpleShimmer {
            0% { stop-color: #c87090; }
            50% { stop-color: #e0a0c8; }
            100% { stop-color: #c87090; }
          }
          @keyframes starPulsePurple {
            0%, 100% { opacity: 0.7; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.3); }
          }
        `}</style>

        <svg
          viewBox={`0 0 ${ENV_W} ${ENV_H + 30}`}
          xmlns="http://www.w3.org/2000/svg"
          style={{
            display: 'block',
            width: ENV_W,
            height: ENV_H + 30,
            overflow: 'visible',
            filter: animating
              ? 'drop-shadow(0 0 8px #c87090aa)'
              : 'drop-shadow(0 2px 6px #9b5a7855)',
            transition: 'filter 0.3s',
          }}
        >
          <defs>
            <linearGradient id="purpleBody" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fdf0f8" />
              <stop offset="50%" stopColor="#f5e0f0" />
              <stop offset="100%" stopColor="#ead0e8" />
            </linearGradient>
            <linearGradient id="purpleFlap" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#e0a0c8" />
              <stop offset="100%" stopColor="#9b5a78" />
            </linearGradient>
            <linearGradient id="purpleStroke" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#c87090" />
              <stop offset="50%" stopColor="#7a3a58" />
              <stop offset="100%" stopColor="#c87090" />
            </linearGradient>
            <linearGradient id="purpleSeal" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#e0a0c8" />
              <stop offset="40%" stopColor="#c87090" />
              <stop offset="100%" stopColor="#7a3a58" />
            </linearGradient>
          </defs>

          {/* sombra */}
          <rect x="4" y="6" width="104" height="62" rx="7" fill="rgba(100,40,80,0.15)" />

          {/* corpo */}
          <rect
            x="1"
            y="3"
            width="104"
            height="62"
            rx="7"
            fill="url(#purpleBody)"
            stroke="url(#purpleStroke)"
            strokeWidth="1.8"
          />

          {/* borda interna */}
          <rect
            x="5"
            y="7"
            width="96"
            height="54"
            rx="5"
            fill="none"
            stroke="#c87090"
            strokeWidth="0.6"
            opacity="0.5"
          />

          {/* vincos */}
          <line
            x1="1"
            y1="3"
            x2="55"
            y2={ENV_H * 0.52}
            stroke="#c87090"
            strokeWidth="1"
            opacity="0.7"
          />
          <line
            x1="105"
            y1="3"
            x2="55"
            y2={ENV_H * 0.52}
            stroke="#c87090"
            strokeWidth="1"
            opacity="0.7"
          />
          <line
            x1="1"
            y1="65"
            x2="55"
            y2={ENV_H * 0.52}
            stroke="#c87090"
            strokeWidth="1"
            opacity="0.7"
          />
          <line
            x1="105"
            y1="65"
            x2="55"
            y2={ENV_H * 0.52}
            stroke="#c87090"
            strokeWidth="1"
            opacity="0.7"
          />

          {/* aba */}
          <path
            d={`M1 3 L55 ${animating || showCard ? ENV_H * 0.08 : ENV_H * 0.42} L105 3`}
            fill="url(#purpleFlap)"
            stroke="url(#purpleStroke)"
            strokeWidth="1.5"
            strokeLinejoin="round"
            style={{ transition: 'd 0.5s ease' }}
          />

          {/* lacre */}
          {!showCard && !animating && (
            <g transform={`translate(55, ${ENV_H * 0.54})`}>
              <circle r="8" fill="url(#purpleSeal)" stroke="#7a3a58" strokeWidth="1" />
              <circle r="6" fill="none" stroke="#e0a0c8" strokeWidth="0.8" opacity="0.6" />
              <path
                d="M0,-5 L1.2,-1.7 L4.8,-1.5 L2.2,0.8 L3,4.5 L0,2.5 L-3,4.5 L-2.2,0.8 L-4.8,-1.5 L-1.2,-1.7Z"
                fill="#fdf0f8"
              />
            </g>
          )}

          {/* estrelinhas */}
          {!showCard && (
            <>
              <text
                x="8"
                y="14"
                fontSize="7"
                fill="#c87090"
                opacity="0.9"
                style={{ animation: 'starPulsePurple 2s ease-in-out infinite' }}
              >
                ✦
              </text>
              <text
                x="91"
                y="14"
                fontSize="7"
                fill="#c87090"
                opacity="0.9"
                style={{ animation: 'starPulsePurple 2s ease-in-out infinite 0.5s' }}
              >
                ✦
              </text>
              <text
                x="8"
                y="62"
                fontSize="6"
                fill="#c87090"
                opacity="0.8"
                style={{ animation: 'starPulsePurple 2s ease-in-out infinite 1s' }}
              >
                ✦
              </text>
              <text
                x="91"
                y="62"
                fontSize="6"
                fill="#c87090"
                opacity="0.8"
                style={{ animation: 'starPulsePurple 2s ease-in-out infinite 1.5s' }}
              >
                ✦
              </text>
            </>
          )}

          {/* hint abertura */}
          {!item.opened && !isOwner && !showCard && (
            <text
              x="55"
              y={ENV_H + 16}
              textAnchor="middle"
              fontSize="7"
              fill="#7a3a58"
              fontFamily="Baloo 2, sans-serif"
              opacity="0.9"
            >
              clique pra abrir ✉
            </text>
          )}

          {/* data especial */}
          {item.specialDateLabel && (
            <text
              x="7"
              y={ENV_H * 0.7 - 10}
              textAnchor="start"
              fontSize="7"
              fill="#9b5a78"
              fontFamily="Baloo 2, sans-serif"
              fontWeight="700"
              opacity="0.9"
              fontStyle="italic"
            >
              {item.specialDateLabel}
            </text>
          )}

          {/* de/para */}
          <text
            x="7"
            y={ENV_H * 0.7 + 1}
            textAnchor="start"
            fontSize="7.5"
            fill="#5a2a40"
            fontFamily="Baloo 2, sans-serif"
            fontWeight="700"
            opacity="0.85"
          >
            {`De: ${item.fromName}`}
          </text>
          <text
            x="7"
            y={ENV_H * 0.7 + 10}
            textAnchor="start"
            fontSize="7.5"
            fill="#5a2a40"
            fontFamily="Baloo 2, sans-serif"
            fontWeight="700"
            opacity="0.85"
          >
            {`Para: ${item.toName}${(item as any).openedAt ? '  •  ' + new Date((item as any).openedAt).toLocaleDateString('pt-BR') : ''}`}
          </text>
        </svg>

        {/* aviso bloqueado */}
        {showBlocked && (
          <div
            style={{
              position: 'absolute',
              top: -38,
              left: '50%',
              transform: 'translateX(-50%)',
              background: '#3a1a08',
              color: '#e0a0c8',
              fontFamily: "'Baloo 2', cursive",
              fontSize: 11,
              fontWeight: 700,
              padding: '6px 12px',
              borderRadius: 10,
              whiteSpace: 'nowrap',
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
              zIndex: 99,
            }}
          >
            {`abre em ${item.availableFrom!.split('-').reverse().join('/')}`}
          </div>
        )}

        {/* folhinha quando aberto */}
        {showCard && (
          <div
            style={{
              position: 'absolute',
              top: -28,
              left: 18,
              width: 74,
              zIndex: zIndex + 1,
              pointerEvents: 'none',
            }}
          >
            <svg viewBox="0 0 74 60" width="74" height="60">
              <rect
                x="0"
                y="0"
                width="74"
                height="60"
                rx="4"
                fill="#fdf0f8"
                stroke="#c87090"
                strokeWidth="1"
              />
              <line x1="8" y1="12" x2="66" y2="12" stroke="#e8c0d8" strokeWidth="0.9" />
              <line x1="8" y1="20" x2="62" y2="20" stroke="#e8c0d8" strokeWidth="0.9" />
              <line x1="8" y1="28" x2="64" y2="28" stroke="#e8c0d8" strokeWidth="0.9" />
              <line x1="8" y1="36" x2="56" y2="36" stroke="#e8c0d8" strokeWidth="0.9" />
            </svg>
          </div>
        )}

        {/* menu edição */}
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
      {label}
    </button>
  )
}
