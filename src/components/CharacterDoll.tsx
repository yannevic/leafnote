// src/components/CharacterDoll.tsx
import { useRef, useState, useCallback } from 'react'
import { PinOff, Pin, FlipHorizontal2 } from 'lucide-react'
import {
  ALL_PIECES,
  CharacterConfig,
  CharacterPiece,
  CharacterCategory,
  LAYER_ORDER,
  isMultiSlot,
} from '../assets/character/index'

function assetUrl(path: string): string {
  return `./character/${path}`
}

function resolveSrc(piece: CharacterPiece, variant: string): string {
  if (!variant || !piece.hasColor || !piece.srcColor) return assetUrl(piece.src)
  return assetUrl(piece.srcColor.replace(/(\d+)(\.png)$/, `$1${variant}$2`))
}

interface CharacterDollProps {
  config: CharacterConfig
  colorVariants: Record<string, string>
  width?: number
  sceneScale?: number
  initialPosition?: { x: number; y: number }
  onPositionChange?: (pos: { x: number; y: number }) => void
  pinned?: boolean
  onPinnedChange?: (v: boolean) => void
  initialFlipped?: boolean
  onFlippedChange?: (v: boolean) => void
}

export default function CharacterDoll({
  config,
  colorVariants,
  width = 160,
  sceneScale = 1,
  initialPosition = { x: 200, y: 160 },
  onPositionChange,
  pinned = false,
  onPinnedChange,
  initialFlipped = false,
  onFlippedChange,
}: CharacterDollProps) {
  const [pos, setPos] = useState(initialPosition)
  const [showPin, setShowPin] = useState(false)
  const [flipped, setFlipped] = useState(initialFlipped)
  const dragging = useRef(false)
  const lastMouse = useRef({ x: 0, y: 0 })
  const pinTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const schedulePinHide = useCallback(() => {
    if (pinTimeoutRef.current) clearTimeout(pinTimeoutRef.current)
    pinTimeoutRef.current = setTimeout(() => setShowPin(false), 3000)
  }, [])

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setShowPin(true)
    schedulePinHide()
  }

  const layers: { piece: CharacterPiece; src: string }[] = []
  for (const cat of LAYER_ORDER) {
    const multi = isMultiSlot(cat as CharacterCategory)
    const variant = colorVariants[cat] ?? ''
    if (multi) {
      const ids = (config[cat as keyof CharacterConfig] as string[]) ?? []
      for (const id of ids) {
        const p = ALL_PIECES.find((x) => x.id === id)
        if (p) layers.push({ piece: p, src: resolveSrc(p, variant) })
      }
    } else {
      const id = config[cat as keyof CharacterConfig] as string | null
      if (id) {
        const p = ALL_PIECES.find((x) => x.id === id)
        if (p) layers.push({ piece: p, src: resolveSrc(p, variant) })
      }
    }
  }

  const height = Math.round(width * (350 / 222))

  const handleMouseDown = (e: React.MouseEvent) => {
    if (pinned) return
    if (e.button !== 0) return
    e.stopPropagation()
    e.preventDefault()
    dragging.current = true
    lastMouse.current = { x: e.clientX, y: e.clientY }

    const onMove = (ev: MouseEvent) => {
      if (!dragging.current) return
      const dx = (ev.clientX - lastMouse.current.x) / sceneScale
      const dy = (ev.clientY - lastMouse.current.y) / sceneScale
      lastMouse.current = { x: ev.clientX, y: ev.clientY }
      setPos((p) => ({ x: p.x + dx, y: p.y + dy }))
    }

    const onUp = () => {
      dragging.current = false
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
      // Notifica posição final
      setPos((p) => {
        onPositionChange?.(p)
        return p
      })
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    if (pinned) return
    e.stopPropagation()
    dragging.current = true
    const t = e.touches[0]
    lastMouse.current = { x: t.clientX, y: t.clientY }

    const onMove = (ev: TouchEvent) => {
      if (!dragging.current) return
      const touch = ev.touches[0]
      const dx = (touch.clientX - lastMouse.current.x) / sceneScale
      const dy = (touch.clientY - lastMouse.current.y) / sceneScale
      lastMouse.current = { x: touch.clientX, y: touch.clientY }
      setPos((p) => ({ x: p.x + dx, y: p.y + dy }))
    }

    const onEnd = () => {
      dragging.current = false
      window.removeEventListener('touchmove', onMove)
      window.removeEventListener('touchend', onEnd)
      setPos((p) => {
        onPositionChange?.(p)
        return p
      })
    }

    window.addEventListener('touchmove', onMove, { passive: false })
    window.addEventListener('touchend', onEnd)
  }

  return (
    <div
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onContextMenu={handleContextMenu}
      style={{
        position: 'absolute',
        left: pos.x,
        top: pos.y,
        width,
        height,
        cursor: pinned ? 'default' : 'grab',
        userSelect: 'none',
        touchAction: 'none',
        filter: 'drop-shadow(0 6px 16px rgba(61,26,16,0.22))',
        transform: flipped ? 'scaleX(-1)' : 'none',
        zIndex: 90,
      }}
    >
      {layers.map(({ piece, src }) => (
        <img
          key={piece.id}
          src={src}
          alt=""
          draggable={false}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            imageRendering: 'pixelated',
            pointerEvents: 'none',
          }}
        />
      ))}

      {/* Botão de fixar — só aparece após clique direito, some em 3s */}
      {showPin && (
        <button
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation()
            onPinnedChange?.(!pinned)
            if (pinned) setShowPin(false)
            else schedulePinHide()
          }}
          onMouseEnter={() => {
            // Renova o timer enquanto hover
            if (pinTimeoutRef.current) clearTimeout(pinTimeoutRef.current)
          }}
          onMouseLeave={() => schedulePinHide()}
          title={pinned ? 'desafixar (clique direito)' : 'fixar (clique direito)'}
          style={{
            position: 'absolute',
            top: Math.round(height * 0.05) - 14,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 26,
            height: 26,
            borderRadius: '50%',
            border: '1.5px solid rgba(200,120,140,0.6)',
            background: pinned ? 'rgba(232,160,176,0.95)' : 'rgba(253,242,246,0.92)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(61,26,16,0.2)',
            padding: 0,
            zIndex: 2,
            animation: 'fadeInPin 0.15s ease',
          }}
        >
          {pinned ? (
            <PinOff size={12} strokeWidth={2.2} color="#3d1a10" />
          ) : (
            <Pin size={12} strokeWidth={2.2} color="rgba(122,48,64,0.7)" />
          )}
        </button>
      )}

      {showPin && (
        <button
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation()
            setFlipped((v) => {
              const next = !v
              onFlippedChange?.(next)
              return next
            })
            schedulePinHide()
          }}
          onMouseEnter={() => {
            if (pinTimeoutRef.current) clearTimeout(pinTimeoutRef.current)
          }}
          onMouseLeave={() => schedulePinHide()}
          title="espelhar"
          style={{
            position: 'absolute',
            top: Math.round(height * 0.05) - 14,
            left: '50%',
            transform: 'translateX(calc(-50% + 32px))',
            width: 26,
            height: 26,
            borderRadius: '50%',
            border: '1.5px solid rgba(200,120,140,0.6)',
            background: flipped ? 'rgba(232,160,176,0.95)' : 'rgba(253,242,246,0.92)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(61,26,16,0.2)',
            padding: 0,
            zIndex: 2,
            animation: 'fadeInPin 0.15s ease',
          }}
        >
          <FlipHorizontal2
            size={12}
            strokeWidth={2.2}
            color={flipped ? '#3d1a10' : 'rgba(122,48,64,0.7)'}
          />
        </button>
      )}

      <style>
        {`
    @keyframes fadeInPin {
          from { opacity: 0; transform: translateX(-50%) scale(0.7); }
          to   { opacity: 1; transform: translateX(-50%) scale(1); }
        }
      `}
      </style>
    </div>
  )
}
