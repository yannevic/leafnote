import { useState, useRef, useCallback, useEffect } from 'react'
import {
  StickyNote,
  CheckSquare,
  Pencil,
  Tag as TagIcon,
  Mail,
  Trash2,
  Hand,
  Plus,
  Sticker,
} from 'lucide-react'
import { BoardItemType } from '../types/board'

interface Tool {
  type: BoardItemType
  icon: React.ReactNode
  label: string
  bg: string
  border: string
}

const TOOLS: Tool[] = [
  {
    type: 'postit',
    icon: <StickyNote size={18} strokeWidth={1.8} />,
    label: 'Post-it',
    bg: 'rgba(245,213,220,0.42)',
    border: 'rgba(245,180,200,0.6)',
  },
  {
    type: 'checklist',
    icon: <CheckSquare size={18} strokeWidth={1.8} />,
    label: 'Checklist',
    bg: 'rgba(180,230,200,0.42)',
    border: 'rgba(140,200,160,0.6)',
  },
  {
    type: 'drawing',
    icon: <Pencil size={18} strokeWidth={1.8} />,
    label: 'Desenho',
    bg: 'rgba(180,205,245,0.42)',
    border: 'rgba(140,170,230,0.6)',
  },
  {
    type: 'tag',
    icon: <TagIcon size={18} strokeWidth={1.8} />,
    label: 'Tag',
    bg: 'rgba(210,185,245,0.42)',
    border: 'rgba(170,140,230,0.6)',
  },
  {
    type: 'letter',
    icon: <Mail size={18} strokeWidth={1.8} />,
    label: 'Cartinha',
    bg: 'rgba(245,200,180,0.42)',
    border: 'rgba(220,160,130,0.6)',
  },
  {
    type: 'board-sticker',
    icon: <Sticker size={18} strokeWidth={1.8} />,
    label: 'Sticker',
    bg: 'rgba(210,185,245,0.42)',
    border: 'rgba(170,140,230,0.6)',
  },
]

const LABEL_STYLE: React.CSSProperties = {
  position: 'absolute',
  left: 50,
  top: '50%',
  transform: 'translateY(-50%)',
  background: '#1e1208cc',
  color: '#fdf0e0',
  fontSize: 10,
  fontWeight: 700,
  padding: '3px 9px',
  borderRadius: 7,
  whiteSpace: 'nowrap',
  pointerEvents: 'none',
  letterSpacing: '0.04em',
  fontFamily: 'Baloo 2, sans-serif',
  backdropFilter: 'blur(4px)',
}

interface Props {
  selected: BoardItemType | null
  editMode: boolean
  onSelect: (tool: BoardItemType | null) => void
  onToggleEdit: () => void
  onOpenTrash: () => void
  trashCount: number
}

export default function Toolbar({
  selected,
  editMode,
  onSelect,
  onToggleEdit,
  onOpenTrash,
  trashCount,
}: Props) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState({ x: 20, y: -1 })
  const wrapRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef({ dragging: false, moved: false, sx: 0, sy: 0, px: 0, py: 0 })

  useEffect(() => {
    setPos((p) => ({ ...p, y: window.innerHeight / 2 - 27 }))
  }, [])

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      dragRef.current = {
        dragging: true,
        moved: false,
        sx: e.clientX,
        sy: e.clientY,
        px: pos.x,
        py: pos.y,
      }
      e.preventDefault()
    },
    [pos]
  )

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const d = dragRef.current
      if (!d.dragging) return
      const dx = e.clientX - d.sx
      const dy = e.clientY - d.sy
      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) d.moved = true
      setPos({
        x: Math.max(0, Math.min(window.innerWidth - 70, d.px + dx)),
        y: Math.max(0, Math.min(window.innerHeight - 70, d.py + dy)),
      })
    }
    const onUp = () => {
      dragRef.current.dragging = false
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [])

  const handleMainClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (dragRef.current.moved) return
    setOpen((o) => !o)
  }

  const handleChildClick = (e: React.MouseEvent, tool: BoardItemType) => {
    e.stopPropagation()
    onSelect(tool)
    setOpen(false)
  }

  const handleBoardClick = useCallback(() => {
    setOpen(false)
  }, [])
  useEffect(() => {
    window.addEventListener('click', handleBoardClick)
    return () => window.removeEventListener('click', handleBoardClick)
  }, [handleBoardClick])

  // Todos os itens: tools + mover + lixeira
  const allItems = TOOLS.length + 2 // tools + mover + lixeira

  if (pos.y < 0) return null

  return (
    <>
      {/* Badge modo mover */}
      {editMode && (
        <div
          style={{
            position: 'fixed',
            left: pos.x + 58,
            top: pos.y + (open ? (TOOLS.length + 2) * 54 : 0),
            pointerEvents: 'none',
            zIndex: 49,
            background: 'rgba(30,18,8,0.78)',
            color: '#fdf0e0',
            fontSize: 11,
            fontWeight: 700,
            padding: '5px 16px',
            borderRadius: 20,
            fontFamily: 'Baloo 2, sans-serif',
            letterSpacing: '0.04em',
            boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            whiteSpace: 'nowrap',
          }}
        >
          <Hand size={12} />
          modo mover — clique nos itens pra arrastar
        </div>
      )}

      {/* Toolbar flutuante */}
      <div
        ref={wrapRef}
        onMouseDown={onMouseDown}
        style={{
          position: 'fixed',
          left: pos.x,
          top: pos.y,
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 10,
          cursor: dragRef.current.dragging ? 'grabbing' : 'grab',
          userSelect: 'none',
        }}
      >
        {/* Ferramentas */}
        {TOOLS.map((tool, i) => {
          const isSelected = tool.type === selected
          const delay = open ? `${i * 0.045}s` : `${(allItems - 1 - i) * 0.03}s`
          return (
            <div
              key={tool.type}
              onClick={(e) => handleChildClick(e, tool.type)}
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: tool.bg,
                border: `1.5px solid ${isSelected && open ? 'rgba(255,255,255,0.9)' : tool.border}`,
                boxShadow:
                  isSelected && open
                    ? '0 0 0 3px rgba(255,255,255,0.25)'
                    : '0 2px 8px rgba(0,0,0,0.1)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'rgba(61,36,8,0.82)',
                position: 'relative',
                transition: 'transform 0.28s cubic-bezier(.34,1.56,.64,1), opacity 0.2s',
                transitionDelay: delay,
                transform: open
                  ? `scale(${isSelected ? 1.12 : 1})`
                  : 'translateY(16px) scale(0.65)',
                opacity: open ? 1 : 0,
                pointerEvents: open ? 'auto' : 'none',
                backdropFilter: 'blur(6px)',
                WebkitBackdropFilter: 'blur(6px)',
              }}
            >
              {tool.icon}
              <span style={LABEL_STYLE}>{tool.label}</span>
            </div>
          )
        })}

        {/* Lixeira */}
        <div
          onClick={(e) => {
            e.stopPropagation()
            onOpenTrash()
            setOpen(false)
          }}
          style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            background: 'rgba(245,200,200,0.42)',
            border: '1.5px solid rgba(220,140,140,0.6)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'rgba(61,36,8,0.82)',
            position: 'relative',
            transition: 'transform 0.28s cubic-bezier(.34,1.56,.64,1), opacity 0.2s',
            transitionDelay: open
              ? `${TOOLS.length * 0.045}s`
              : `${(allItems - 1 - TOOLS.length) * 0.03}s`,
            transform: open ? 'scale(1)' : 'translateY(16px) scale(0.65)',
            opacity: open ? 1 : 0,
            pointerEvents: open ? 'auto' : 'none',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
          }}
        >
          <Trash2 size={18} strokeWidth={1.8} />
          {trashCount > 0 && (
            <div
              style={{
                position: 'absolute',
                top: -4,
                right: -4,
                width: 15,
                height: 15,
                borderRadius: '50%',
                background: '#1e1208',
                border: '2px solid rgba(255,255,255,0.6)',
                fontSize: 8,
                fontWeight: 700,
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'Baloo 2, sans-serif',
              }}
            >
              {trashCount}
            </div>
          )}
          <span style={LABEL_STYLE}>lixeira {trashCount > 0 ? `(${trashCount})` : ''}</span>
        </div>

        {/* Mover itens */}
        <div
          onClick={(e) => {
            e.stopPropagation()
            onToggleEdit()
          }}
          style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            background: editMode ? 'rgba(160,220,200,0.55)' : 'rgba(175,220,215,0.42)',
            border: `1.5px solid ${editMode ? 'rgba(255,255,255,0.9)' : 'rgba(130,190,180,0.6)'}`,
            boxShadow: editMode
              ? '0 0 0 3px rgba(255,255,255,0.2), 0 2px 8px rgba(0,0,0,0.1)'
              : '0 2px 8px rgba(0,0,0,0.1)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'rgba(61,36,8,0.82)',
            position: 'relative',
            transition: 'transform 0.28s cubic-bezier(.34,1.56,.64,1), opacity 0.2s',
            transitionDelay: open
              ? `${(TOOLS.length + 1) * 0.045}s`
              : `${(allItems - 1 - TOOLS.length - 1) * 0.03}s`,
            transform: open ? 'scale(1)' : 'translateY(16px) scale(0.65)',
            opacity: open ? 1 : 0,
            pointerEvents: open ? 'auto' : 'none',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
          }}
        >
          <Hand size={18} strokeWidth={1.8} />
          <span style={LABEL_STYLE}>{editMode ? 'modo mover ativo' : 'mover itens'}</span>
        </div>

        {/* Botão principal */}
        <div
          onClick={handleMainClick}
          style={{
            width: 50,
            height: 50,
            borderRadius: '50%',
            background: open ? 'rgba(200,160,220,0.55)' : 'rgba(210,185,245,0.48)',
            border: '1.5px solid rgba(255,255,255,0.55)',
            boxShadow: open
              ? '0 4px 16px rgba(160,100,200,0.3), 0 0 0 3px rgba(200,160,240,0.2)'
              : '0 3px 10px rgba(0,0,0,0.12)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'rgba(61,36,8,0.85)',
            position: 'relative',
            zIndex: 2,
            flexShrink: 0,
            transition: 'transform 0.2s, box-shadow 0.2s, background 0.2s',
            transform: open ? 'scale(1.08)' : 'scale(1)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
          }}
        >
          <div
            style={{
              transition: 'transform 0.25s cubic-bezier(.34,1.56,.64,1)',
              transform: open ? 'rotate(45deg)' : 'rotate(0deg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {editMode ? <Hand size={22} strokeWidth={1.8} /> : <Plus size={22} strokeWidth={2} />}
          </div>
        </div>
      </div>
    </>
  )
}
