import { useState, useRef, useCallback, useEffect } from 'react'
import {
  Pencil,
  Eraser,
  Minus,
  ArrowRight,
  Square,
  Circle,
  Triangle,
  Undo2,
  Redo2,
  Trash2,
  PaintBucket,
  Brush,
} from 'lucide-react'
import { DrawingItem } from '../types/board'

const PRESET_COLORS = [
  '#2c1810',
  '#7a3a2a',
  '#c4845a',
  '#e8c49a',
  '#4a7a4a',
  '#2d6e2d',
  '#a8d5a2',
  '#5b8dd9',
  '#1e3a5f',
  '#9b59b6',
  '#e8a0b0',
  '#e74c3c',
  '#f39c12',
  '#fffef8',
  '#000000',
]

type Tool =
  | 'pen'
  | 'eraser'
  | 'rect'
  | 'ellipse'
  | 'triangle'
  | 'line'
  | 'arrow'
  | 'star'
  | 'heart'
  | 'diamond'
  | 'pentagon'
  | 'hexagon'
  | 'fill'

const TOOLS: { id: Tool; icon: React.ReactNode }[] = [
  { id: 'pen', icon: <Pencil size={15} /> },
  { id: 'eraser', icon: <Eraser size={15} /> },
  { id: 'fill', icon: <PaintBucket size={15} /> },
  { id: 'line', icon: <Minus size={15} /> },
  { id: 'arrow', icon: <ArrowRight size={15} /> },
  { id: 'rect', icon: <Square size={15} /> },
  { id: 'ellipse', icon: <Circle size={15} /> },
  { id: 'triangle', icon: <Triangle size={15} /> },
  {
    id: 'diamond',
    icon: (
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polygon points="12,2 22,12 12,22 2,12" />
      </svg>
    ),
  },
  {
    id: 'heart',
    icon: (
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
  },
  {
    id: 'star',
    icon: (
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
      </svg>
    ),
  },
  {
    id: 'pentagon',
    icon: (
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polygon points="12,2 22,9.5 18,21 6,21 2,9.5" />
      </svg>
    ),
  },
  {
    id: 'hexagon',
    icon: (
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polygon points="12,2 21,7 21,17 12,22 3,17 3,7" />
      </svg>
    ),
  },
]

const SIZES = [2, 4, 8, 14]
const CANVAS_W = 780
const CANVAS_H = 580

interface Props {
  item: DrawingItem
  editMode: boolean
  zIndex: number
  onUpdate: (id: string, data: Partial<DrawingItem>) => void
  onDelete: (id: string) => void
  onBringForward: (id: string) => void
  onSendBackward: (id: string) => void
  onFocus: (id: string) => void
  onContextMenu?: (e: React.MouseEvent) => void
}

interface DrawingModalProps {
  initialData: string
  onSave: (dataUrl: string) => void
  onCancel: () => void
}

function drawShape(
  ctx: CanvasRenderingContext2D,
  tool: Tool,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: string,
  size: number,
  fill: boolean
) {
  ctx.strokeStyle = color
  ctx.fillStyle = color
  ctx.lineWidth = size
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  const cx = (x1 + x2) / 2
  const cy = (y1 + y2) / 2
  const rx = Math.abs(x2 - x1) / 2
  const ry = Math.abs(y2 - y1) / 2
  const r = Math.min(rx, ry)

  ctx.beginPath()

  if (tool === 'line') {
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.stroke()
    return
  }

  if (tool === 'arrow') {
    const dx = x2 - x1
    const dy = y2 - y1
    const angle = Math.atan2(dy, dx)
    const headLen = Math.max(14, size * 4)
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(x2, y2)
    ctx.lineTo(
      x2 - headLen * Math.cos(angle - Math.PI / 6),
      y2 - headLen * Math.sin(angle - Math.PI / 6)
    )
    ctx.moveTo(x2, y2)
    ctx.lineTo(
      x2 - headLen * Math.cos(angle + Math.PI / 6),
      y2 - headLen * Math.sin(angle + Math.PI / 6)
    )
    ctx.stroke()
    return
  }

  if (tool === 'rect') {
    ctx.rect(x1, y1, x2 - x1, y2 - y1)
  } else if (tool === 'ellipse') {
    ctx.ellipse(cx, cy, rx || 1, ry || 1, 0, 0, Math.PI * 2)
  } else if (tool === 'triangle') {
    ctx.moveTo(cx, y1)
    ctx.lineTo(x2, y2)
    ctx.lineTo(x1, y2)
    ctx.closePath()
  } else if (tool === 'diamond') {
    ctx.moveTo(cx, y1)
    ctx.lineTo(x2, cy)
    ctx.lineTo(cx, y2)
    ctx.lineTo(x1, cy)
    ctx.closePath()
  } else if (tool === 'pentagon') {
    for (let i = 0; i < 5; i += 1) {
      const a = (Math.PI * 2 * i) / 5 - Math.PI / 2
      const px = cx + r * Math.cos(a)
      const py = cy + r * Math.sin(a)
      if (i === 0) ctx.moveTo(px, py)
      else ctx.lineTo(px, py)
    }
    ctx.closePath()
  } else if (tool === 'hexagon') {
    for (let i = 0; i < 6; i += 1) {
      const a = (Math.PI * 2 * i) / 6
      const px = cx + r * Math.cos(a)
      const py = cy + r * Math.sin(a)
      if (i === 0) ctx.moveTo(px, py)
      else ctx.lineTo(px, py)
    }
    ctx.closePath()
  } else if (tool === 'star') {
    const outer = r
    const inner = r * 0.4
    for (let i = 0; i < 10; i += 1) {
      const a = (Math.PI * i) / 5 - Math.PI / 2
      const rad = i % 2 === 0 ? outer : inner
      const px = cx + rad * Math.cos(a)
      const py = cy + rad * Math.sin(a)
      if (i === 0) ctx.moveTo(px, py)
      else ctx.lineTo(px, py)
    }
    ctx.closePath()
  } else if (tool === 'heart') {
    const w = Math.abs(x2 - x1)
    const h = Math.abs(y2 - y1)
    const lx = Math.min(x1, x2)
    const ty = Math.min(y1, y2)
    const scaleX = w / 24
    const scaleY = h / 24
    ctx.save()
    ctx.translate(lx, ty)
    ctx.scale(scaleX, scaleY)
    ctx.moveTo(12, 21.593)
    ctx.bezierCurveTo(1.5, 13.5, 1.5, 6, 6.5, 3.5)
    ctx.bezierCurveTo(9, 2.5, 11, 3.5, 12, 5)
    ctx.bezierCurveTo(13, 3.5, 15, 2.5, 17.5, 3.5)
    ctx.bezierCurveTo(22.5, 6, 22.5, 13.5, 12, 21.593)
    ctx.closePath()
    ctx.restore()
  }

  if (fill) ctx.fill()
  ctx.stroke()
}

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '')
  const num = parseInt(
    clean.length === 3
      ? clean
          .split('')
          .map((c) => c + c)
          .join('')
      : clean,
    16
  )
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255]
}

function floodFill(
  ctx: CanvasRenderingContext2D,
  startX: number,
  startY: number,
  fillColor: string,
  canvasW: number,
  canvasH: number
) {
  const imageData = ctx.getImageData(0, 0, canvasW, canvasH)
  const data = imageData.data
  const px = Math.floor(startX)
  const py = Math.floor(startY)
  const idx = (py * canvasW + px) * 4
  const targetR = data[idx]
  const targetG = data[idx + 1]
  const targetB = data[idx + 2]
  const targetA = data[idx + 3]
  const [fillR, fillG, fillB] = hexToRgb(fillColor)
  if (targetR === fillR && targetG === fillG && targetB === fillB && targetA === 255) return
  const tolerance = 32
  function matchesTarget(i: number) {
    return (
      Math.abs(data[i] - targetR) <= tolerance &&
      Math.abs(data[i + 1] - targetG) <= tolerance &&
      Math.abs(data[i + 2] - targetB) <= tolerance &&
      Math.abs(data[i + 3] - targetA) <= tolerance
    )
  }
  const visited = new Uint8Array(canvasW * canvasH)
  const stack: number[] = [px + py * canvasW]
  visited[px + py * canvasW] = 1
  while (stack.length > 0) {
    const pos = stack.pop()!
    const x = pos % canvasW
    const y = Math.floor(pos / canvasW)
    const i = pos * 4
    data[i] = fillR
    data[i + 1] = fillG
    data[i + 2] = fillB
    data[i + 3] = 255
    const neighbors = [
      x > 0 ? pos - 1 : -1,
      x < canvasW - 1 ? pos + 1 : -1,
      y > 0 ? pos - canvasW : -1,
      y < canvasH - 1 ? pos + canvasW : -1,
    ]
    neighbors.forEach((n) => {
      if (n === -1 || visited[n]) return
      visited[n] = 1
      if (matchesTarget(n * 4)) stack.push(n)
    })
  }
  ctx.putImageData(imageData, 0, 0)
}

function DrawingModal({ initialData, onSave, onCancel }: DrawingModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const snapshotRef = useRef<ImageData | null>(null)
  const drawing = useRef(false)
  const startPos = useRef({ x: 0, y: 0 })
  const history = useRef<string[]>([])
  const historyIdx = useRef(-1)

  const [color, setColor] = useState('#2c1810')
  const [size, setSize] = useState(3)
  const [tool, setTool] = useState<Tool>('pen')
  const [fill, setFill] = useState(false)
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null)

  const pushHistory = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dataUrl = canvas.toDataURL()
    history.current = history.current.slice(0, historyIdx.current + 1)
    history.current.push(dataUrl)
    historyIdx.current = history.current.length - 1
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.fillStyle = '#fffef8'
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H)
    if (initialData) {
      const img = new Image()
      img.onload = () => {
        ctx.drawImage(img, 0, 0)
        pushHistory()
      }
      img.src = initialData
    } else {
      pushHistory()
    }
  }, [initialData, pushHistory])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey
      if (ctrl && !e.shiftKey && e.key === 'z') {
        e.preventDefault()
        handleUndo()
      }
      if (ctrl && ((e.shiftKey && e.key === 'z') || e.key === 'y')) {
        e.preventDefault()
        handleRedo()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  })

  const handleUndo = () => {
    if (historyIdx.current <= 0) return
    historyIdx.current -= 1
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    const img = new Image()
    img.onload = () => {
      ctx.clearRect(0, 0, CANVAS_W, CANVAS_H)
      ctx.drawImage(img, 0, 0)
    }
    img.src = history.current[historyIdx.current]
  }

  const handleRedo = () => {
    if (historyIdx.current >= history.current.length - 1) return
    historyIdx.current += 1
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    const img = new Image()
    img.onload = () => {
      ctx.clearRect(0, 0, CANVAS_W, CANVAS_H)
      ctx.drawImage(img, 0, 0)
    }
    img.src = history.current[historyIdx.current]
  }

  const getPos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY }
  }

  const onMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getPos(e)
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!

    if (tool === 'fill') {
      floodFill(ctx, pos.x, pos.y, color, canvas.width, canvas.height)
      pushHistory()
      return
    }

    drawing.current = true
    startPos.current = pos

    if (tool === 'pen' || tool === 'eraser') {
      ctx.beginPath()
      ctx.moveTo(pos.x, pos.y)
    } else {
      snapshotRef.current = ctx.getImageData(0, 0, canvas.width, canvas.height)
    }

    const onWindowMove = (ev: MouseEvent) => {
      if (!drawing.current) return
      const canvas2 = canvasRef.current!
      const ctx2 = canvas2.getContext('2d')!
      const rect = canvas2.getBoundingClientRect()
      const movePos = {
        x: Math.max(0, Math.min(CANVAS_W, ev.clientX - rect.left)),
        y: Math.max(0, Math.min(CANVAS_H, ev.clientY - rect.top)),
      }
      if (tool === 'pen') {
        ctx2.lineWidth = size
        ctx2.lineCap = 'round'
        ctx2.lineJoin = 'round'
        ctx2.strokeStyle = color
        ctx2.lineTo(movePos.x, movePos.y)
        ctx2.stroke()
        ctx2.beginPath()
        ctx2.moveTo(movePos.x, movePos.y)
      } else if (tool === 'eraser') {
        ctx2.lineWidth = size * 4
        ctx2.lineCap = 'round'
        ctx2.lineJoin = 'round'
        ctx2.strokeStyle = '#fffef8'
        ctx2.lineTo(movePos.x, movePos.y)
        ctx2.stroke()
        ctx2.beginPath()
        ctx2.moveTo(movePos.x, movePos.y)
      } else {
        ctx2.putImageData(snapshotRef.current!, 0, 0)
        drawShape(
          ctx2,
          tool,
          startPos.current.x,
          startPos.current.y,
          movePos.x,
          movePos.y,
          color,
          size,
          fill
        )
      }
    }

    const onWindowUp = (ev: MouseEvent) => {
      if (!drawing.current) return
      drawing.current = false
      if (tool !== 'pen' && tool !== 'eraser') {
        const canvas2 = canvasRef.current!
        const ctx2 = canvas2.getContext('2d')!
        const rect = canvas2.getBoundingClientRect()
        const upPos = {
          x: Math.max(0, Math.min(CANVAS_W, ev.clientX - rect.left)),
          y: Math.max(0, Math.min(CANVAS_H, ev.clientY - rect.top)),
        }
        ctx2.putImageData(snapshotRef.current!, 0, 0)
        drawShape(
          ctx2,
          tool,
          startPos.current.x,
          startPos.current.y,
          upPos.x,
          upPos.y,
          color,
          size,
          fill
        )
      }
      pushHistory()
      window.removeEventListener('mousemove', onWindowMove)
      window.removeEventListener('mouseup', onWindowUp)
    }

    window.addEventListener('mousemove', onWindowMove)
    window.addEventListener('mouseup', onWindowUp)
  }

  const onMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect()
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  }

  const onMouseUp = () => {}

  const handleClear = () => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = '#fffef8'
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H)
    pushHistory()
  }

  const handleSave = () => {
    const dataUrl = canvasRef.current!.toDataURL('image/png')
    onSave(dataUrl)
  }

  const eraser = tool === 'eraser'

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(44,20,8,0.55)',
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div
        style={{
          background:
            'linear-gradient(160deg, rgba(253,246,240,0.99) 0%, rgba(252,232,238,0.99) 100%)',
          border: '1.5px solid rgba(232,160,176,0.35)',
          backdropFilter: 'blur(18px) saturate(1.4)',
          borderRadius: 20,
          boxShadow: '0 8px 40px rgba(200,120,140,0.22), inset 0 1px 0 rgba(255,255,255,0.6)',
          padding: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          fontFamily: 'Baloo 2, sans-serif',
        }}
      >
        {/* título */}
        <div
          style={{
            fontSize: 14,
            fontWeight: 800,
            color: '#3d1a10',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <Brush size={16} color="#e8a0b0" /> desenho
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          {/* painel lateral de ferramentas */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
              background: 'rgba(253,242,246,0.85)',
              borderRadius: 14,
              padding: 8,
              border: '1.5px solid rgba(232,160,176,0.35)',
              width: 48,
              alignItems: 'center',
            }}
          >
            <button onClick={handleUndo} title="desfazer (Ctrl+Z)" style={toolBtnStyle(false)}>
              <Undo2 size={15} />
            </button>
            <button onClick={handleRedo} title="refazer (Ctrl+Y)" style={toolBtnStyle(false)}>
              <Redo2 size={15} />
            </button>

            <div
              style={{
                width: '100%',
                height: 1,
                background: 'rgba(232,160,176,0.4)',
                margin: '2px 0',
              }}
            />

            {TOOLS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTool(t.id)}
                title={t.id}
                style={toolBtnStyle(tool === t.id)}
              >
                {t.icon}
              </button>
            ))}

            <div
              style={{
                width: '100%',
                height: 1,
                background: 'rgba(232,160,176,0.4)',
                margin: '2px 0',
              }}
            />

            <button
              onClick={() => setFill((v) => !v)}
              title="preencher forma"
              style={toolBtnStyle(fill)}
            >
              ◼
            </button>
            <button onClick={handleClear} title="limpar tudo" style={toolBtnStyle(false)}>
              <Trash2 size={15} />
            </button>
          </div>

          {/* canvas + cores + tamanhos */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', maxWidth: 560 }}>
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    setColor(c)
                    setTool('pen')
                  }}
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    background: c,
                    border:
                      color === c && !eraser
                        ? '2.5px solid rgba(122,48,64,0.8)'
                        : '1.5px solid rgba(232,160,176,0.5)',
                    cursor: 'pointer',
                    outline: 'none',
                    flexShrink: 0,
                    boxShadow:
                      color === c && !eraser ? '0 0 0 1.5px rgba(253,242,246,0.9)' : 'none',
                  }}
                />
              ))}

              {/* color picker */}
              <div style={{ position: 'relative', width: 20, height: 20 }}>
                <input
                  type="color"
                  value={color}
                  onChange={(e) => {
                    setColor(e.target.value)
                    setTool('pen')
                  }}
                  style={{
                    opacity: 0,
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    cursor: 'pointer',
                    border: 'none',
                    padding: 0,
                  }}
                  title="mais cores"
                />
                <div
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    background: 'conic-gradient(red, yellow, lime, cyan, blue, magenta, red)',
                    border: '1.5px solid rgba(232,160,176,0.5)',
                    pointerEvents: 'none',
                  }}
                />
              </div>

              <div
                style={{
                  width: 1,
                  height: 20,
                  background: 'rgba(232,160,176,0.4)',
                  margin: '0 4px',
                }}
              />

              {SIZES.map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  title={`${s}px`}
                  style={{
                    width: Math.min(s + 8, 22),
                    height: Math.min(s + 8, 22),
                    borderRadius: '50%',
                    background: color,
                    border:
                      size === s ? '2px solid rgba(232,160,176,0.8)' : '2px solid transparent',
                    cursor: 'pointer',
                    outline: 'none',
                    flexShrink: 0,
                    alignSelf: 'center',
                  }}
                />
              ))}
            </div>

            {/* canvas */}
            <div style={{ position: 'relative', width: CANVAS_W, height: CANVAS_H }}>
              <canvas
                ref={canvasRef}
                width={CANVAS_W}
                height={CANVAS_H}
                onMouseDown={onMouseDown}
                onMouseMove={onMouseMove}
                onMouseUp={onMouseUp}
                onMouseLeave={() => {
                  drawing.current = false
                  setMousePos(null)
                }}
                style={{
                  borderRadius: 12,
                  border: '1.5px solid rgba(232,160,176,0.5)',
                  cursor: 'none',
                  display: 'block',
                  background: '#fffef8',
                  width: CANVAS_W,
                  height: CANVAS_H,
                }}
              />
              {mousePos && (
                <div
                  style={{
                    position: 'absolute',
                    left: mousePos.x,
                    top: mousePos.y,
                    width: eraser ? size * 4 : size + 4,
                    height: eraser ? size * 4 : size + 4,
                    borderRadius: '50%',
                    background: eraser ? 'transparent' : color,
                    border: eraser ? '1.5px solid rgba(122,48,64,0.6)' : 'none',
                    transform: 'translate(-50%, -50%)',
                    pointerEvents: 'none',
                    opacity: 0.85,
                  }}
                />
              )}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button
            onClick={onCancel}
            style={{
              padding: '6px 18px',
              borderRadius: 10,
              background: 'rgba(253,242,246,0.7)',
              border: '1.5px solid rgba(232,160,176,0.4)',
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: 700,
              color: '#3d1a10',
              fontFamily: 'Baloo 2, sans-serif',
            }}
          >
            cancelar
          </button>
          <button
            onClick={handleSave}
            style={{
              padding: '6px 18px',
              borderRadius: 10,
              background: 'rgba(232,160,176,0.55)',
              border: '1.5px solid rgba(200,120,140,0.4)',
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: 700,
              color: '#3d1a10',
              fontFamily: 'Baloo 2, sans-serif',
            }}
          >
            salvar
          </button>
        </div>
      </div>
    </div>
  )
}

function toolBtnStyle(active: boolean): React.CSSProperties {
  return {
    width: 32,
    height: 32,
    borderRadius: 8,
    background: active ? 'rgba(232,160,176,0.55)' : 'rgba(253,242,246,0.7)',
    border: active ? '1.5px solid rgba(200,120,140,0.5)' : '1.5px solid rgba(232,160,176,0.3)',
    cursor: 'pointer',
    fontSize: 14,
    color: active ? '#3d1a10' : 'rgba(61,26,16,0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    padding: 0,
    flexShrink: 0,
  }
}

export default function DrawingSheet({
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
  const [modalOpen, setModalOpen] = useState(!item.drawingData)
  const [showMenu, setShowMenu] = useState(false)
  const dragRef = useRef({ dragging: false, moved: false, sx: 0, sy: 0, px: 0, py: 0 })
  const resizeRef = useRef({ resizing: false, sx: 0, sy: 0, sw: 0, sh: 0 })
  const rotateRef = useRef({ rotating: false, startAngle: 0, currentRotation: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  const w = item.width || CANVAS_W
  const h = item.height || CANVAS_H
  const rotation = item.rotation ?? 0

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

  const onRotateMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      e.preventDefault()
      const rect = containerRef.current!.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const startAngle = Math.atan2(e.clientY - cy, e.clientX - cx) * (180 / Math.PI)
      rotateRef.current = { rotating: true, startAngle, currentRotation: rotation }
      const onMove = (ev: MouseEvent) => {
        const r = rotateRef.current
        if (!r.rotating) return
        const rect2 = containerRef.current!.getBoundingClientRect()
        const cx2 = rect2.left + rect2.width / 2
        const cy2 = rect2.top + rect2.height / 2
        const angle = Math.atan2(ev.clientY - cy2, ev.clientX - cx2) * (180 / Math.PI)
        const delta = angle - r.startAngle
        const newRotation = (r.currentRotation + delta + 360) % 360
        onUpdate(item.id, { rotation: newRotation })
      }
      const onUp = () => {
        rotateRef.current.rotating = false
        window.removeEventListener('mousemove', onMove)
        window.removeEventListener('mouseup', onUp)
      }
      window.addEventListener('mousemove', onMove)
      window.addEventListener('mouseup', onUp)
    },
    [item.id, rotation, onUpdate]
  )

  const onResizeMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      e.preventDefault()
      const ratio = (item.width || 560) / (item.height || 400)
      resizeRef.current = {
        resizing: true,
        sx: e.clientX,
        sy: e.clientY,
        sw: item.width || 560,
        sh: item.height || 400,
      }
      const onMove = (ev: MouseEvent) => {
        const r = resizeRef.current
        if (!r.resizing) return
        const dx = ev.clientX - r.sx
        const dy = ev.clientY - r.sy
        const delta = Math.abs(dx) > Math.abs(dy) ? dx : dy
        const newW = Math.max(120, r.sw + delta)
        const newH = Math.max(80, newW / ratio)
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

  const handleSave = useCallback(
    (dataUrl: string) => {
      onUpdate(item.id, {
        drawingData: dataUrl,
        width: item.width || CANVAS_W,
        height: item.height || CANVAS_H,
      })
      setModalOpen(false)
    },
    [item.id, item.width, item.height, onUpdate]
  )

  const handleCancel = useCallback(() => {
    if (!item.drawingData) onDelete(item.id)
    setModalOpen(false)
  }, [item.id, item.drawingData, onDelete])

  return (
    <>
      {modalOpen && (
        <DrawingModal initialData={item.drawingData} onSave={handleSave} onCancel={handleCancel} />
      )}

      {item.drawingData && (
        <div
          style={{
            position: 'absolute',
            left: item.x,
            top: item.y,
            width: w,
            height: h,
            zIndex,
            transform: `rotate(${rotation}deg)`,
            transformOrigin: 'center center',
          }}
          onMouseEnter={() => setShowMenu(true)}
          onMouseLeave={() => setShowMenu(false)}
        >
          <div
            data-item
            ref={containerRef}
            onMouseDown={onMouseDown}
            onContextMenu={onContextMenu}
            style={{
              width: '100%',
              height: '100%',
              borderRadius: 12,
              border: '1.5px solid rgba(232,160,176,0.5)',
              overflow: 'hidden',
              cursor: editMode ? 'grab' : 'default',
              boxShadow: '2px 4px 18px rgba(200,120,140,0.18), inset 0 1px 0 rgba(255,255,255,0.4)',
            }}
          >
            <img
              src={item.drawingData}
              alt="desenho"
              style={{ width: '100%', height: '100%', display: 'block', pointerEvents: 'none' }}
            />
          </div>

          {editMode && (
            <div
              onMouseDown={onRotateMouseDown}
              style={{
                position: 'absolute',
                top: -28,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 16,
                height: 16,
                borderRadius: '50%',
                background: 'rgba(232,160,176,0.55)',
                border: '1.5px solid rgba(200,120,140,0.5)',
                cursor: 'grab',
                boxShadow: '0 2px 6px rgba(200,120,140,0.25)',
                zIndex: 2,
              }}
            />
          )}
          {editMode && (
            <div
              style={{
                position: 'absolute',
                top: -12,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 1,
                height: 12,
                background: 'rgba(232,160,176,0.5)',
                pointerEvents: 'none',
              }}
            />
          )}

          {editMode && showMenu && (
            <div style={{ position: 'absolute', top: 6, right: 6, display: 'flex', gap: 3 }}>
              <CtxBtn
                label="✏"
                onClick={(e) => {
                  e.stopPropagation()
                  setModalOpen(true)
                }}
              />
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
                  stroke="rgba(200,120,140,0.7)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          )}
        </div>
      )}
    </>
  )
}

function CtxBtn({ label, onClick }: { label: string; onClick: (e: React.MouseEvent) => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: 22,
        height: 22,
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
