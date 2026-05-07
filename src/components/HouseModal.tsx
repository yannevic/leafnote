import { useState, useEffect, useRef } from 'react'
import {
  ChevronLeft,
  Save,
  Check,
  Home,
  Layers,
  PaintRoller,
  PaintBucket,
  Blend,
  Grid2x2,
  BrickWall,
  Hexagon,
  Circle,
  AlignJustify,
  Grip,
  ChevronRight,
  Sparkles,
  ImageIcon,
  Lock,
  ShoppingBag,
} from 'lucide-react'
import { ref, onValue, set } from 'firebase/database'
import { db } from '../lib/firebase'
import { subscribeHouseInventory } from '../hooks/useShop'
import { HOUSE_TILE_MAP } from '../shop/shopPrices'

interface HouseConfig {
  floor: { sheet: string; col: number; row: number }
  wall: { sheet: string; col: number; row: number }
  wallRight: { sheet: string; col: number; row: number }
  background?: string
}

interface BackgroundOption {
  id: string
  label: string
  css: string
}

const BACKGROUNDS: BackgroundOption[] = [
  {
    id: 'sky',
    label: 'Céu',
    css: 'linear-gradient(to bottom, #c8e6f5 0%, #eef7fd 60%, #f8f3ee 100%)',
  },
  {
    id: 'sunset',
    label: 'Pôr do sol',
    css: 'linear-gradient(to bottom, #fad4b0 0%, #f9c0c0 40%, #e8d5f5 100%)',
  },
  {
    id: 'mist',
    label: 'Névoa',
    css: 'repeating-linear-gradient(180deg, #f0ecf8 0px, #f0ecf8 12px, #e6e0f4 12px, #e6e0f4 24px)',
  },
  {
    id: 'garden',
    label: 'Jardim',
    css: 'radial-gradient(circle, #c8e8d0 1.5px, transparent 1.5px), #f0f8f2',
  },
  {
    id: 'night',
    label: 'Noturno',
    css: 'linear-gradient(to bottom, #1a1a3e 0%, #2d2060 50%, #3d2a6e 100%)',
  },
]

const DEFAULT_BACKGROUND = 'sky'

interface TileOption {
  id: string
  label: string
  sheet: string
  col: number
  row: number
  tileW: number
  tileH: number
  sheetW: number
  sheetH: number
}

interface SheetDef {
  sheet: string
  tileW: number
  tileH: number
  sheetW: number
  sheetH: number
  cols: number
  rows: number
  totalTiles?: number
  names?: string[]
  overlap?: number
}

interface SheetGroup {
  label: string
  icon?: React.ReactNode
  overlap?: number
  sheet?: string
  tileW?: number
  tileH?: number
  sheetW?: number
  sheetH?: number
  cols?: number
  rows?: number
  totalTiles?: number
  names?: string[]
  sheets?: SheetDef[]
}

const FLOOR_GROUPS: SheetGroup[] = [
  {
    label: 'Carpete',
    icon: <Grip size={12} />,
    sheet: 'base floor/carpet spritesheet.png',
    tileW: 256,
    tileH: 128,
    sheetW: 1024,
    sheetH: 512,
    cols: 4,
    rows: 4,
    totalTiles: 14,
    names: [
      'Verde escuro',
      'Verde médio',
      'Verde claro',
      'Amarelo',
      'Marrom',
      'Salmão',
      'Vermelho',
      'Rosa',
      'Lilás',
      'Azul',
      'Azul médio',
      'Ciano',
      'Cinza',
      'Branco',
    ],
  },
  {
    label: 'Xadrez',
    icon: <Grid2x2 size={12} />,
    sheet: 'base floor/chckerboard spritesheet.png',
    tileW: 256,
    tileH: 128,
    sheetW: 1024,
    sheetH: 512,
    cols: 4,
    rows: 4,
    totalTiles: 15,
  },
  {
    label: 'Pedra',
    icon: <Hexagon size={12} />,
    sheet: 'base floor/cobblestone spritesheet.png',
    tileW: 256,
    tileH: 128,
    sheetW: 512,
    sheetH: 256,
    cols: 2,
    rows: 2,
  },
  {
    label: 'Seixos',
    icon: <Circle size={12} />,
    sheet: 'base floor/pebbles spritesheet.png',
    tileW: 256,
    tileH: 128,
    sheetW: 512,
    sheetH: 256,
    cols: 2,
    rows: 2,
  },
  {
    label: 'Pedra quadrada',
    icon: <Grid2x2 size={12} />,
    sheet: 'base floor/stone square spritesheet.png',
    tileW: 256,
    tileH: 128,
    sheetW: 1280,
    sheetH: 640,
    cols: 5,
    rows: 5,
    totalTiles: 24,
    overlap: 2,
  },
  {
    label: 'Madeira',
    icon: <AlignJustify size={12} />,
    sheet: 'base floor/wood spritesheet.png',
    tileW: 256,
    tileH: 128,
    sheetW: 768,
    sheetH: 384,
    cols: 3,
    rows: 3,
    totalTiles: 8,
    overlap: 2,
  },
  {
    label: 'P&B',
    icon: <Blend size={12} />,
    sheet: 'base floor/black and white.png',
    tileW: 256,
    tileH: 128,
    sheetW: 1024,
    sheetH: 384,
    cols: 4,
    rows: 3,
  },
  {
    label: 'Cute Decor ✦',
    icon: <Sparkles size={12} />,
    sheets: [
      {
        sheet: 'floor (tiles)/cut_floor_blue.png',
        tileW: 256,
        tileH: 128,
        sheetW: 768,
        sheetH: 256,
        cols: 3,
        rows: 2,
      },
      {
        sheet: 'floor (tiles)/cut_floor_green.png',
        tileW: 256,
        tileH: 128,
        sheetW: 768,
        sheetH: 256,
        cols: 3,
        rows: 2,
      },
      {
        sheet: 'floor (tiles)/cut_floor_orange.png',
        tileW: 256,
        tileH: 128,
        sheetW: 768,
        sheetH: 256,
        cols: 3,
        rows: 2,
      },
      {
        sheet: 'floor (tiles)/cut_floor_pink.png',
        tileW: 256,
        tileH: 128,
        sheetW: 768,
        sheetH: 256,
        cols: 3,
        rows: 2,
      },
      {
        sheet: 'floor (tiles)/cut_floor_violet.png',
        tileW: 256,
        tileH: 128,
        sheetW: 768,
        sheetH: 256,
        cols: 3,
        rows: 2,
      },
    ],
  },
]

const WALL_GROUPS: SheetGroup[] = [
  {
    label: 'Tinta lisa',
    icon: <PaintBucket size={12} />,
    sheets: [
      {
        sheet: 'base walls/walls_paint_pastel.png',
        tileW: 256,
        tileH: 384,
        sheetW: 1024,
        sheetH: 768,
        cols: 4,
        rows: 2,
      },
      {
        sheet: 'base walls/walls_paint_earthy.png',
        tileW: 256,
        tileH: 384,
        sheetW: 1024,
        sheetH: 768,
        cols: 4,
        rows: 2,
      },
      {
        sheet: 'base walls/walls_paint_bright.png',
        tileW: 256,
        tileH: 384,
        sheetW: 1024,
        sheetH: 768,
        cols: 4,
        rows: 2,
      },
      {
        sheet: 'base walls/walls_paint_grey.png',
        tileW: 256,
        tileH: 384,
        sheetW: 1024,
        sheetH: 768,
        cols: 4,
        rows: 2,
      },
      {
        sheet: 'base walls/BASE_WHITE_WALL.png',
        tileW: 256,
        tileH: 384,
        sheetW: 256,
        sheetH: 384,
        cols: 1,
        rows: 1,
      },
    ],
  },
  {
    label: 'Tinta listrada',
    icon: <Blend size={12} />,
    sheets: [
      {
        sheet: 'base walls/walls_paint_pastel_stripes.png',
        tileW: 256,
        tileH: 384,
        sheetW: 1024,
        sheetH: 768,
        cols: 4,
        rows: 2,
      },
      {
        sheet: 'base walls/walls_paint_earthy_stripes.png',
        tileW: 256,
        tileH: 384,
        sheetW: 1024,
        sheetH: 768,
        cols: 4,
        rows: 2,
      },
      {
        sheet: 'base walls/walls_paint_bright_stripes.png',
        tileW: 256,
        tileH: 384,
        sheetW: 1024,
        sheetH: 768,
        cols: 4,
        rows: 2,
      },
      {
        sheet: 'base walls/walls_paint_grey_stripes.png',
        tileW: 256,
        tileH: 384,
        sheetW: 1024,
        sheetH: 768,
        cols: 4,
        rows: 2,
      },
    ],
  },
  {
    label: 'Tijolo',
    icon: <BrickWall size={12} />,
    sheet: 'base walls/spritesheet(10).png',
    tileW: 256,
    tileH: 384,
    sheetW: 768,
    sheetH: 768,
    cols: 3,
    rows: 2,
  },
  {
    label: 'Azulejo xadrez',
    icon: <Grid2x2 size={12} />,
    sheet: 'base walls/spritesheet(11).png',
    tileW: 256,
    tileH: 384,
    sheetW: 1280,
    sheetH: 1152,
    cols: 5,
    rows: 3,
    totalTiles: 13,
  },
  {
    label: 'Pedras',
    icon: <Hexagon size={12} />,
    sheet: 'base walls/spritesheet(12).png',
    tileW: 256,
    tileH: 384,
    sheetW: 1280,
    sheetH: 768,
    cols: 5,
    rows: 2,
  },
  {
    label: 'Madeira ornada',
    icon: <AlignJustify size={12} />,
    sheet: 'base walls/spritesheet(13).png',
    tileW: 256,
    tileH: 384,
    sheetW: 1280,
    sheetH: 768,
    cols: 5,
    rows: 2,
  },
  {
    label: 'Madeira simples',
    icon: <AlignJustify size={12} />,
    sheet: 'base walls/spritesheet(14).png',
    tileW: 256,
    tileH: 384,
    sheetW: 1280,
    sheetH: 768,
    cols: 5,
    rows: 2,
  },
  {
    label: 'Cute Decor ✦',
    icon: <Sparkles size={12} />,
    sheets: [
      {
        sheet: 'walls (tiles)/cutie blue pastels.png',
        tileW: 256,
        tileH: 384,
        sheetW: 1024,
        sheetH: 1152,
        cols: 4,
        rows: 3,
      },
      {
        sheet: 'walls (tiles)/cutie green pastels.png',
        tileW: 256,
        tileH: 384,
        sheetW: 1024,
        sheetH: 1152,
        cols: 4,
        rows: 3,
      },
      {
        sheet: 'walls (tiles)/cutie orange pastels.png',
        tileW: 256,
        tileH: 384,
        sheetW: 1024,
        sheetH: 1152,
        cols: 4,
        rows: 3,
      },
      {
        sheet: 'walls (tiles)/cutie pink pastels.png',
        tileW: 256,
        tileH: 384,
        sheetW: 1024,
        sheetH: 1152,
        cols: 4,
        rows: 3,
      },
      {
        sheet: 'walls (tiles)/cutie violet pastels.png',
        tileW: 256,
        tileH: 384,
        sheetW: 1024,
        sheetH: 1152,
        cols: 4,
        rows: 3,
      },
    ],
  },
]

// ─── helpers existentes (sem mudança) ────────────────────────────────────────

function groupToTiles(g: SheetGroup): TileOption[] {
  const tiles: TileOption[] = []
  if (g.sheets) {
    for (const s of g.sheets) {
      const total = s.totalTiles ?? s.cols * s.rows
      for (let row = 0; row < s.rows; row++) {
        for (let col = 0; col < s.cols; col++) {
          const idx = row * s.cols + col
          if (idx >= total) continue
          tiles.push({
            id: `${s.sheet}__${col}_${row}`,
            label: s.names?.[idx] ?? `${g.label} ${tiles.length + 1}`,
            sheet: s.sheet,
            col,
            row,
            tileW: s.tileW,
            tileH: s.tileH,
            sheetW: s.sheetW,
            sheetH: s.sheetH,
          })
        }
      }
    }
    return tiles
  }
  const total = g.totalTiles ?? g.cols! * g.rows!
  for (let row = 0; row < g.rows!; row++) {
    for (let col = 0; col < g.cols!; col++) {
      const idx = row * g.cols! + col
      if (idx >= total) continue
      tiles.push({
        id: `${g.sheet}__${col}_${row}`,
        label: g.names?.[idx] ?? `${g.label} ${idx + 1}`,
        sheet: g.sheet!,
        col,
        row,
        tileW: g.tileW!,
        tileH: g.tileH!,
        sheetW: g.sheetW!,
        sheetH: g.sheetH!,
      })
    }
  }
  return tiles
}

function tileStyle(
  t: TileOption,
  displayW: number,
  displayH: number,
  offsetX = 0,
  offsetY = 0
): React.CSSProperties {
  const scaleX = displayW / t.tileW
  const scaleY = displayH / t.tileH
  return {
    backgroundImage: `url("./house/${t.sheet.replace(/ /g, '%20')}")`,
    backgroundSize: `${t.sheetW * scaleX}px ${t.sheetH * scaleY}px`,
    backgroundPosition: `-${t.col * t.tileW * scaleX - offsetX}px -${t.row * t.tileH * scaleY - offsetY}px`,
    backgroundRepeat: 'no-repeat',
    width: displayW,
    height: displayH,
    imageRendering: 'pixelated',
  }
}

function findSheetDims(groups: SheetGroup[], sheet: string): { sheetW: number; sheetH: number } {
  for (const g of groups) {
    if (g.sheets) {
      const s = g.sheets.find((s) => s.sheet === sheet)
      if (s) return { sheetW: s.sheetW, sheetH: s.sheetH }
    } else if (g.sheet === sheet) {
      return { sheetW: g.sheetW!, sheetH: g.sheetH! }
    }
  }
  return { sheetW: 1024, sheetH: 768 }
}

// ─── Converte tile interno → itemId do shopPrices ─────────────────────────────
// Ex: sheet="base floor/carpet spritesheet.png", col=1, row=3
//     → busca no HOUSE_TILE_MAP a chave cujo valor bate com { sheet, col, row }

function tileToItemId(sheet: string, col: number, row: number): string | null {
  for (const [id, ref] of Object.entries(HOUSE_TILE_MAP)) {
    if (ref.sheet === sheet && ref.col === col && ref.row === row) return id
  }
  return null
}

// ─── Backgrounds: mapeia bg id → itemId da loja ───────────────────────────────
// ex: 'sky' → 'bg_sky'
function bgToItemId(bgId: string): string {
  return `bg_${bgId}`
}

// ─────────────────────────────────────────────
// CONSTANTES
// ─────────────────────────────────────────────

const DEFAULT_CONFIG: HouseConfig = {
  floor: { sheet: 'base floor/carpet spritesheet.png', col: 1, row: 3 },
  wall: { sheet: 'base walls/walls_paint_grey_stripes.png', col: 0, row: 0 },
  wallRight: { sheet: 'base walls/walls_paint_grey_stripes.png', col: 0, row: 0 },
  background: DEFAULT_BACKGROUND,
}

interface HouseModalProps {
  myUid: string
  onClose: () => void
  onOpenShop?: () => void
}

type HouseTab = 'floor' | 'wall' | 'background'
type WallSide = 'left' | 'right'

export default function HouseModal({ myUid, onClose, onOpenShop }: HouseModalProps) {
  const [config, setConfig] = useState<HouseConfig>(DEFAULT_CONFIG)
  const [tab, setTab] = useState<HouseTab>('floor')
  const [wallSide, setWallSide] = useState<WallSide>('left')
  const [savedFeedback, setSavedFeedback] = useState(false)
  const [activeFloorGroup, setActiveFloorGroup] = useState(0)
  const [activeWallGroup, setActiveWallGroup] = useState(0)
  const [activeWallRightGroup, setActiveWallRightGroup] = useState(0)
  const [panelOpen, setPanelOpen] = useState(true)

  // ── NOVO: inventário desbloqueado ──
  const [houseOwned, setHouseOwned] = useState<Set<string>>(new Set())

  const [scale, setScale] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const dragging = useRef(false)
  const lastPos = useRef({ x: 0, y: 0 })

  // Carrega config do Firebase
  useEffect(() => {
    const r = ref(db, 'house/config')
    return onValue(r, (snap) => {
      if (snap.exists()) {
        const data = snap.val() as HouseConfig
        setConfig({
          ...DEFAULT_CONFIG,
          ...data,
          wallRight: data.wallRight ?? DEFAULT_CONFIG.wallRight,
          background: data.background ?? DEFAULT_BACKGROUND,
        })
      }
    })
  }, [])

  // ── NOVO: subscribe no inventário da casinha ──
  useEffect(() => {
    const unsub = subscribeHouseInventory(setHouseOwned)
    return unsub
  }, [])

  // ── NOVO: verifica se um tile está desbloqueado ──
  function isTileOwned(sheet: string, col: number, row: number): boolean {
    const itemId = tileToItemId(sheet, col, row)
    if (!itemId) return true // tile não mapeado na loja = sempre disponível
    return houseOwned.has(itemId)
  }

  function isBgOwned(bgId: string): boolean {
    return houseOwned.has(bgToItemId(bgId))
  }

  const handleSave = async () => {
    await set(ref(db, 'house/config'), config)
    setSavedFeedback(true)
    setTimeout(() => setSavedFeedback(false), 2000)
  }

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    setScale((s) => Math.min(2, Math.max(0.4, s - e.deltaY * 0.001)))
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    dragging.current = true
    lastPos.current = { x: e.clientX, y: e.clientY }
  }
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging.current) return
    const dx = e.clientX - lastPos.current.x
    const dy = e.clientY - lastPos.current.y
    lastPos.current = { x: e.clientX, y: e.clientY }
    setOffset((o) => ({ x: o.x + dx, y: o.y + dy }))
  }
  const handleMouseUp = () => {
    dragging.current = false
  }

  const activeWallGroupIdx = wallSide === 'left' ? activeWallGroup : activeWallRightGroup
  const setActiveWallGroupIdx = wallSide === 'left' ? setActiveWallGroup : setActiveWallRightGroup

  const groups = tab === 'floor' ? FLOOR_GROUPS : WALL_GROUPS
  const activeGroup = tab === 'floor' ? activeFloorGroup : activeWallGroupIdx
  const setActiveGroup = tab === 'floor' ? setActiveFloorGroup : setActiveWallGroupIdx
  const tiles = tab !== 'background' ? groupToTiles(groups[activeGroup]) : []

  const floorDims = findSheetDims(FLOOR_GROUPS, config.floor.sheet)
  const wallDims = findSheetDims(WALL_GROUPS, config.wall.sheet)
  const wallRightDims = findSheetDims(WALL_GROUPS, config.wallRight.sheet)

  const selectedFloorTile: TileOption = {
    id: 'sel-floor',
    label: '',
    sheet: config.floor.sheet,
    col: config.floor.col,
    row: config.floor.row,
    tileW: 256,
    tileH: 128,
    ...floorDims,
  }
  const selectedWallTile: TileOption = {
    id: 'sel-wall',
    label: '',
    sheet: config.wall.sheet,
    col: config.wall.col,
    row: config.wall.row,
    tileW: 256,
    tileH: 384,
    ...wallDims,
  }
  const selectedWallRightTile: TileOption = {
    id: 'sel-wall-right',
    label: '',
    sheet: config.wallRight.sheet,
    col: config.wallRight.col,
    row: config.wallRight.row,
    tileW: 256,
    tileH: 384,
    ...wallRightDims,
  }

  const currentOverlap =
    tab === 'floor' ? (FLOOR_GROUPS.find((g) => g.sheet === config.floor.sheet)?.overlap ?? 0) : 0

  const editingWallConfig = wallSide === 'left' ? config.wall : config.wallRight
  const setEditingWallConfig = (val: { sheet: string; col: number; row: number }) => {
    if (wallSide === 'left') setConfig((c) => ({ ...c, wall: val }))
    else setConfig((c) => ({ ...c, wallRight: val }))
  }

  const backgroundCss =
    BACKGROUNDS.find((b) => b.id === (config.background ?? DEFAULT_BACKGROUND))?.css ??
    BACKGROUNDS[0].css

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        top: 32,
        zIndex: 200,
        background: 'var(--color-bark-100)',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'Baloo 2, sans-serif',
      }}
    >
      {/* HEADER — sem mudança */}
      <div
        style={{
          height: 56,
          minHeight: 56,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px',
          paddingTop: 8,
          borderBottom: '2px solid var(--color-wood-300)',
          background: 'var(--color-bark-100)',
          flexShrink: 0,
        }}
      >
        <button
          onClick={onClose}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: '6px 14px 6px 10px',
            borderRadius: 10,
            border: '1.5px solid var(--color-wood-300)',
            background: 'transparent',
            color: 'var(--color-leaf-600)',
            fontSize: 13,
            fontWeight: 600,
            fontFamily: 'Baloo 2, sans-serif',
            cursor: 'pointer',
          }}
        >
          <ChevronLeft size={16} /> Voltar
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <Home size={18} color="var(--color-leaf-600)" />
          <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-leaf-800)' }}>
            Nossa Casinha
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Botão loja */}
          {onOpenShop && (
            <button
              onClick={onOpenShop}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 14px',
                borderRadius: 10,
                border: '1.5px solid var(--color-wood-300)',
                background: 'transparent',
                color: 'var(--color-leaf-600)',
                fontSize: 13,
                fontWeight: 600,
                fontFamily: 'Baloo 2, sans-serif',
                cursor: 'pointer',
              }}
            >
              <ShoppingBag size={14} /> Loja
            </button>
          )}

          <button
            onClick={handleSave}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 18px',
              borderRadius: 10,
              border: 'none',
              background: savedFeedback ? 'var(--color-leaf-400)' : 'var(--color-leaf-600)',
              color: '#fff',
              fontSize: 13,
              fontWeight: 600,
              fontFamily: 'Baloo 2, sans-serif',
              cursor: 'pointer',
              transition: 'background 0.2s',
              minWidth: 100,
              justifyContent: 'center',
            }}
          >
            {savedFeedback ? (
              <>
                <Check size={14} /> Salvo!
              </>
            ) : (
              <>
                <Save size={14} /> Salvar
              </>
            )}
          </button>
        </div>
      </div>

      {/* BODY */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {/* CENA — sem mudança */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: backgroundCss,
            backgroundSize: '10px 10px',
            cursor: dragging.current ? 'grabbing' : 'grab',
            overflow: 'hidden',
          }}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
                transformOrigin: 'center center',
                transition: dragging.current ? 'none' : 'transform 0.05s',
              }}
            >
              <HouseScene
                floorTile={selectedFloorTile}
                wallTile={selectedWallTile}
                wallRightTile={selectedWallRightTile}
                overlap={currentOverlap}
              />
            </div>
          </div>
        </div>

        {/* PAINEL ESQUERDO RETRÁTIL */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            display: 'flex',
            zIndex: 10,
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              width: panelOpen ? 300 : 0,
              overflow: 'hidden',
              transition: 'width 0.25s ease',
              pointerEvents: 'auto',
            }}
          >
            <div
              style={{
                width: 300,
                height: '100%',
                background: 'var(--color-bark-100)',
                borderRight: '2px solid var(--color-wood-300)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
              }}
            >
              {/* Tabs chão / parede / fundos */}
              <div
                style={{
                  display: 'flex',
                  gap: 4,
                  padding: '10px 12px',
                  borderBottom: '1px solid var(--color-wood-300)',
                  flexShrink: 0,
                }}
              >
                {[
                  { id: 'floor' as const, icon: <Layers size={14} />, label: 'Chão' },
                  { id: 'wall' as const, icon: <PaintRoller size={14} />, label: 'Parede' },
                  { id: 'background' as const, icon: <ImageIcon size={14} />, label: 'Fundo' },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 5,
                      padding: '6px 4px',
                      borderRadius: 10,
                      border:
                        tab === t.id
                          ? '2px solid var(--color-leaf-500)'
                          : '2px solid var(--color-wood-300)',
                      background: tab === t.id ? 'var(--color-leaf-600)' : 'var(--color-bark-50)',
                      color: tab === t.id ? '#fff' : 'var(--color-leaf-700)',
                      fontSize: 12,
                      fontWeight: tab === t.id ? 700 : 500,
                      fontFamily: 'Baloo 2, sans-serif',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    {t.icon} {t.label}
                  </button>
                ))}
              </div>

              {/* Sub-tabs Esquerda / Direita */}
              {tab === 'wall' && (
                <div
                  style={{
                    display: 'flex',
                    gap: 4,
                    padding: '6px 12px',
                    borderBottom: '1px solid var(--color-wood-300)',
                    flexShrink: 0,
                  }}
                >
                  {[
                    { id: 'left' as const, label: 'Esquerda' },
                    { id: 'right' as const, label: 'Direita' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setWallSide(s.id)}
                      style={{
                        flex: 1,
                        padding: '4px 8px',
                        borderRadius: 8,
                        border:
                          wallSide === s.id
                            ? '2px solid var(--color-petal-400)'
                            : '2px solid var(--color-wood-300)',
                        background: wallSide === s.id ? 'var(--color-petal-200)' : 'transparent',
                        color:
                          wallSide === s.id ? 'var(--color-soil-900)' : 'var(--color-leaf-600)',
                        fontSize: 12,
                        fontWeight: wallSide === s.id ? 700 : 400,
                        fontFamily: 'Baloo 2, sans-serif',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Lista de grupos + grid de tiles */}
              {tab !== 'background' && (
                <>
                  <div
                    className="char-scroll"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 3,
                      padding: '8px 10px',
                      borderBottom: '1px solid var(--color-wood-300)',
                      flexShrink: 0,
                      overflowY: 'auto',
                      maxHeight: 180,
                    }}
                  >
                    {groups.map((g, i) => {
                      const isCute = g.label === 'Cute Decor ✦'
                      return (
                        <button
                          key={g.label}
                          onClick={() => setActiveGroup(i)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 7,
                            padding: '5px 10px',
                            borderRadius: 8,
                            textAlign: 'left',
                            background:
                              activeGroup === i
                                ? isCute
                                  ? '#e8d5f5'
                                  : 'var(--color-petal-200)'
                                : isCute
                                  ? '#f5eeff'
                                  : 'transparent',
                            color:
                              activeGroup === i
                                ? isCute
                                  ? '#6b3fa0'
                                  : 'var(--color-soil-900)'
                                : isCute
                                  ? '#9b5fd4'
                                  : 'var(--color-leaf-600)',
                            border:
                              activeGroup === i
                                ? isCute
                                  ? '2px solid #b57bee'
                                  : '2px solid var(--color-petal-400)'
                                : isCute
                                  ? '2px solid #d4aaee'
                                  : '2px solid transparent',
                            fontSize: 12,
                            fontWeight: activeGroup === i ? 700 : 400,
                            fontFamily: 'Baloo 2, sans-serif',
                            cursor: 'pointer',
                            transition: 'all 0.15s',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {g.icon} {g.label}
                        </button>
                      )
                    })}
                  </div>

                  {/* Grid de tiles — ALTERADO: mostra cadeado nos bloqueados */}
                  <div
                    className="char-scroll"
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 8,
                      padding: '10px 12px',
                      overflowY: 'auto',
                      alignContent: 'flex-start',
                      flex: 1,
                    }}
                  >
                    {tiles.map((tile) => {
                      const isFloor = tab === 'floor'
                      const owned = isTileOwned(tile.sheet, tile.col, tile.row)
                      const isSelected = isFloor
                        ? config.floor.sheet === tile.sheet &&
                          config.floor.col === tile.col &&
                          config.floor.row === tile.row
                        : editingWallConfig.sheet === tile.sheet &&
                          editingWallConfig.col === tile.col &&
                          editingWallConfig.row === tile.row
                      const displayW = isFloor ? 80 : 52
                      const displayH = isFloor ? 40 : 78

                      return (
                        <button
                          key={tile.id}
                          title={owned ? tile.label : `🔒 ${tile.label} — compre na loja`}
                          onClick={() => {
                            if (!owned) return // bloqueado — não faz nada
                            if (isFloor)
                              setConfig((c) => ({
                                ...c,
                                floor: { sheet: tile.sheet, col: tile.col, row: tile.row },
                              }))
                            else
                              setEditingWallConfig({
                                sheet: tile.sheet,
                                col: tile.col,
                                row: tile.row,
                              })
                          }}
                          style={{
                            padding: 0,
                            position: 'relative',
                            border: isSelected
                              ? '2.5px solid var(--color-petal-400)'
                              : owned
                                ? '2px solid var(--color-wood-300)'
                                : '2px solid #e5e7eb',
                            borderRadius: 8,
                            background: isSelected
                              ? 'var(--color-petal-200)'
                              : 'repeating-linear-gradient(45deg,#d0cdc8 0px,#d0cdc8 3px,#f0ede8 3px,#f0ede8 9px)',
                            cursor: owned ? 'pointer' : 'not-allowed',
                            overflow: 'hidden',
                            transition: 'all 0.15s',
                            outline: isSelected ? '2px solid var(--color-petal-300)' : 'none',
                            outlineOffset: 2,
                            boxShadow: isSelected ? '0 2px 8px rgba(196,149,106,0.3)' : 'none',
                            opacity: owned ? 1 : 0.55,
                          }}
                        >
                          <div style={{ overflow: 'hidden', width: displayW, height: displayH }}>
                            <div
                              style={{
                                ...tileStyle(tile, displayW, displayH),
                                marginLeft: isFloor ? 0 : 10,
                                marginTop: isFloor ? 0 : 8,
                              }}
                            />
                          </div>

                          {/* Overlay cadeado nos bloqueados */}
                          {!owned && (
                            <div
                              style={{
                                position: 'absolute',
                                inset: 0,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: 'rgba(255,255,255,0.45)',
                                borderRadius: 6,
                              }}
                            >
                              <Lock size={12} color="#6b7280" />
                            </div>
                          )}
                        </button>
                      )
                    })}

                    {/* Dica de loja se houver tiles bloqueados no grupo */}
                    {tiles.some((t) => !isTileOwned(t.sheet, t.col, t.row)) && onOpenShop && (
                      <div
                        style={{
                          width: '100%',
                          marginTop: 4,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          padding: '6px 8px',
                          borderRadius: 8,
                          background: 'var(--color-petal-200)',
                          border: '1.5px solid var(--color-petal-400)',
                        }}
                      >
                        <Lock size={11} color="var(--color-soil-900)" />
                        <span
                          style={{
                            fontSize: 11,
                            color: 'var(--color-soil-900)',
                            fontFamily: 'Baloo 2, sans-serif',
                            flex: 1,
                          }}
                        >
                          Tiles bloqueados
                        </span>
                        <button
                          onClick={onOpenShop}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            background: 'var(--color-leaf-600)',
                            color: 'white',
                            border: 'none',
                            borderRadius: 6,
                            padding: '3px 8px',
                            fontSize: 10,
                            fontWeight: 700,
                            fontFamily: 'Baloo 2, sans-serif',
                            cursor: 'pointer',
                          }}
                        >
                          <ShoppingBag size={10} /> Loja
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Grid de fundos — ALTERADO: mostra cadeado nos bloqueados */}
              {tab === 'background' && (
                <div
                  className="char-scroll"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                    padding: '12px',
                    overflowY: 'auto',
                    flex: 1,
                    alignContent: 'flex-start',
                  }}
                >
                  {BACKGROUNDS.map((bg) => {
                    const isSelected = (config.background ?? DEFAULT_BACKGROUND) === bg.id
                    const owned = isBgOwned(bg.id)
                    return (
                      <button
                        key={bg.id}
                        onClick={() => {
                          if (!owned) return
                          setConfig((c) => ({ ...c, background: bg.id }))
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                          padding: '8px 10px',
                          borderRadius: 10,
                          border: isSelected
                            ? '2.5px solid var(--color-petal-400)'
                            : '2px solid var(--color-wood-300)',
                          background: isSelected
                            ? 'var(--color-petal-200)'
                            : 'var(--color-bark-50)',
                          cursor: owned ? 'pointer' : 'not-allowed',
                          opacity: owned ? 1 : 0.6,
                          transition: 'all 0.15s',
                          outline: isSelected ? '2px solid var(--color-petal-300)' : 'none',
                          outlineOffset: 2,
                          boxShadow: isSelected ? '0 2px 8px rgba(196,149,106,0.3)' : 'none',
                          position: 'relative',
                        }}
                      >
                        <div
                          style={{
                            width: 64,
                            height: 40,
                            borderRadius: 7,
                            flexShrink: 0,
                            background:
                              bg.id === 'garden'
                                ? `radial-gradient(circle, #c8e8d0 1.5px, transparent 1.5px) 0 0 / 10px 10px, #f0f8f2`
                                : bg.css,
                            border: '1.5px solid rgba(0,0,0,0.08)',
                          }}
                        />
                        <span
                          style={{
                            fontSize: 13,
                            fontWeight: isSelected ? 700 : 500,
                            color: isSelected ? 'var(--color-soil-900)' : 'var(--color-leaf-700)',
                            fontFamily: 'Baloo 2, sans-serif',
                            flex: 1,
                          }}
                        >
                          {bg.label}
                        </span>
                        {!owned && <Lock size={13} color="#9ca3af" />}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Botão toggle */}
          <button
            onClick={() => setPanelOpen((v) => !v)}
            style={{
              pointerEvents: 'auto',
              alignSelf: 'center',
              width: 24,
              height: 48,
              background: 'var(--color-bark-100)',
              border: '2px solid var(--color-wood-300)',
              borderLeft: panelOpen ? 'none' : '2px solid var(--color-wood-300)',
              borderRadius: panelOpen ? '0 8px 8px 0' : '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-leaf-600)',
              transition: 'all 0.25s',
            }}
          >
            {panelOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Cena isométrica — sem mudança ───────────────────────────────────────────

function HouseScene({
  floorTile,
  wallTile,
  wallRightTile,
  overlap = 0,
}: {
  floorTile: TileOption
  wallTile: TileOption
  wallRightTile: TileOption
  overlap?: number
}) {
  const SCALE = 1.0
  const TW = 256 * SCALE
  const TH = 128 * SCALE
  const WW = 256 * SCALE
  const WH = 384 * SCALE
  const stepX = TW / 2
  const stepY = TH / 2
  const COLS = 4
  const ROWS = 4

  const floorTiles = []
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      floorTiles.push({ x: c * stepX - r * stepX, y: c * stepY + r * stepY, z: r * COLS + c })
    }
  }

  const minX = Math.min(...floorTiles.map((t) => t.x))
  const ox = -minX
  const floorNorm = floorTiles.map((t) => ({ ...t, x: Math.round(t.x + ox), y: Math.round(t.y) }))

  const wallLeftTiles = []
  for (let c = 0; c < COLS; c++) {
    const floor = floorNorm.find((t) => t.z === c)!
    wallLeftTiles.push({
      x: Math.round(floor.x - 4),
      y: Math.round(floor.y - WH + TH + stepY - c * stepY * 2 + 250),
      z: c,
    })
  }

  const wallRightTiles = []
  for (let r = 0; r < ROWS; r++) {
    const floor = floorNorm.find((t) => t.z === r * COLS + (COLS - 1))!
    wallRightTiles.push({
      x: Math.round(floor.x + TW + 380),
      y: Math.round(floor.y - WH + TH + stepY - r * stepY * 2 + 58),
      z: r,
    })
  }

  const maxFloorY = Math.max(...floorNorm.map((t) => t.y)) + TH
  const minWallY = Math.min(...wallLeftTiles.map((t) => t.y), ...wallRightTiles.map((t) => t.y))
  const sceneW = Math.max(...floorNorm.map((t) => t.x)) + TW + 380 + WW + 20
  const sceneH = maxFloorY - minWallY
  const wallOffsetY = -minWallY

  const cornerTile = wallLeftTiles[0]
  const cornerX = cornerTile.x + WW
  const cornerY = cornerTile.y + wallOffsetY

  return (
    <div style={{ position: 'relative', width: sceneW, height: sceneH, marginTop: 40 }}>
      {wallLeftTiles.map((pos, i) => (
        <div
          key={`wl${i}`}
          style={{
            position: 'absolute',
            left: pos.x,
            top: pos.y + wallOffsetY,
            zIndex: pos.z + 1,
            ...tileStyle(wallTile, WW, WH),
          }}
        />
      ))}

      {wallRightTiles.map((pos, i) => (
        <div
          key={`wr${i}`}
          style={{
            position: 'absolute',
            left: pos.x - WW,
            top: pos.y + wallOffsetY,
            zIndex: pos.z + 1,
            transform: 'scaleX(-1)',
            transformOrigin: 'center top',
            ...tileStyle(wallRightTile, WW, WH),
          }}
        />
      ))}

      <div
        style={{
          position: 'absolute',
          left: cornerX + 255,
          top: cornerY - 195,
          width: 2,
          height: WH - 130,
          zIndex: 50,
          background:
            'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.18) 20%, rgba(0,0,0,0.22) 50%, rgba(0,0,0,0.18) 80%, transparent 100%)',
          pointerEvents: 'none',
        }}
      />

      {floorNorm.map((pos, i) => (
        <div
          key={`f${i}`}
          style={{
            position: 'absolute',
            left: pos.x + 380,
            top: Math.round(pos.y + wallOffsetY + (WH - TH) - 124 - 10),
            zIndex: 20 + pos.z,
            ...tileStyle(floorTile, TW + overlap, TH + overlap / 2),
          }}
        />
      ))}
    </div>
  )
}
