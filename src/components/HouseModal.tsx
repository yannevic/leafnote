import { useState, useEffect } from 'react'
import { ChevronLeft, Save, Check, Home } from 'lucide-react'
import { ref, onValue, set } from 'firebase/database'
import { db } from '../lib/firebase'

interface HouseConfig {
  floor: { sheet: string; col: number; row: number }
  wall: { sheet: string; col: number; row: number }
}

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

interface SheetGroup {
  label: string
  sheet: string
  tileW: number
  tileH: number
  sheetW: number
  sheetH: number
  cols: number
  rows: number
  names?: string[]
  overlap?: number
}

const FLOOR_GROUPS: SheetGroup[] = [
  {
    label: 'Carpete',
    sheet: 'base floor/carpet spritesheet.png',
    tileW: 256,
    tileH: 128,
    sheetW: 1024,
    sheetH: 512,
    cols: 4,
    rows: 4,
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
      '',
      '',
    ],
  },
  {
    label: 'Xadrez',
    sheet: 'base floor/chckerboard spritesheet.png',
    tileW: 256,
    tileH: 128,
    sheetW: 1024,
    sheetH: 512,
    cols: 4,
    rows: 4,
  },
  {
    label: 'Pedra',
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
    sheet: 'base floor/stone square spritesheet.png',
    tileW: 256,
    tileH: 128,
    sheetW: 1280,
    sheetH: 640,
    cols: 5,
    rows: 5,
    overlap: 4,
  },
  {
    label: 'Madeira',
    sheet: 'base floor/wood spritesheet.png',
    tileW: 256,
    tileH: 128,
    sheetW: 768,
    sheetH: 384,
    cols: 3,
    rows: 3,
    overlap: 4,
  },
  {
    label: 'P&B',
    sheet: 'base floor/black and white.png',
    tileW: 256,
    tileH: 128,
    sheetW: 1024,
    sheetH: 384,
    cols: 4,
    rows: 3,
  },
]

const WALL_GROUPS: SheetGroup[] = [
  {
    label: 'Pastel',
    sheet: 'base walls/walls_paint_pastel.png',
    tileW: 256,
    tileH: 384,
    sheetW: 1024,
    sheetH: 768,
    cols: 4,
    rows: 2,
  },
  {
    label: 'Pastel listrado',
    sheet: 'base walls/walls_paint_pastel_stripes.png',
    tileW: 256,
    tileH: 384,
    sheetW: 1024,
    sheetH: 768,
    cols: 4,
    rows: 2,
  },
  {
    label: 'Tinta clara',
    sheet: 'base walls/walls_paint_bright.png',
    tileW: 256,
    tileH: 384,
    sheetW: 1024,
    sheetH: 768,
    cols: 4,
    rows: 2,
  },
  {
    label: 'Clara listrada',
    sheet: 'base walls/walls_paint_bright_stripes.png',
    tileW: 256,
    tileH: 384,
    sheetW: 1024,
    sheetH: 768,
    cols: 4,
    rows: 2,
  },
  {
    label: 'Terrosa',
    sheet: 'base walls/walls_paint_earthy.png',
    tileW: 256,
    tileH: 384,
    sheetW: 1024,
    sheetH: 768,
    cols: 4,
    rows: 2,
  },
  {
    label: 'Terrosa listrada',
    sheet: 'base walls/walls_paint_earthy_stripes.png',
    tileW: 256,
    tileH: 384,
    sheetW: 1024,
    sheetH: 768,
    cols: 4,
    rows: 2,
  },
  {
    label: 'Cinza',
    sheet: 'base walls/walls_paint_grey.png',
    tileW: 256,
    tileH: 384,
    sheetW: 1024,
    sheetH: 768,
    cols: 4,
    rows: 2,
  },
  {
    label: 'Cinza listrado',
    sheet: 'base walls/walls_paint_grey_stripes.png',
    tileW: 256,
    tileH: 384,
    sheetW: 1024,
    sheetH: 768,
    cols: 4,
    rows: 2,
  },
  {
    label: 'Pedra colorida',
    sheet: 'base walls/spritesheet(9).png',
    tileW: 256,
    tileH: 384,
    sheetW: 768,
    sheetH: 768,
    cols: 3,
    rows: 2,
  },
  {
    label: 'Tijolo',
    sheet: 'base walls/spritesheet(10).png',
    tileW: 256,
    tileH: 384,
    sheetW: 768,
    sheetH: 768,
    cols: 3,
    rows: 2,
  },
  {
    label: 'Xadrez parede',
    sheet: 'base walls/spritesheet(11).png',
    tileW: 256,
    tileH: 384,
    sheetW: 1280,
    sheetH: 1152,
    cols: 5,
    rows: 3,
  },
  {
    label: 'Madeira simples',
    sheet: 'base walls/spritesheet(12).png',
    tileW: 256,
    tileH: 384,
    sheetW: 1280,
    sheetH: 768,
    cols: 5,
    rows: 2,
  },
  {
    label: 'Pedra escura',
    sheet: 'base walls/spritesheet(13).png',
    tileW: 256,
    tileH: 384,
    sheetW: 1280,
    sheetH: 768,
    cols: 5,
    rows: 2,
  },
  {
    label: 'Madeira ornada',
    sheet: 'base walls/spritesheet(14).png',
    tileW: 256,
    tileH: 384,
    sheetW: 1280,
    sheetH: 768,
    cols: 5,
    rows: 2,
  },
  {
    label: 'Branca',
    sheet: 'base walls/BASE_WHITE_WALL.png',
    tileW: 256,
    tileH: 384,
    sheetW: 256,
    sheetH: 384,
    cols: 1,
    rows: 1,
  },
]

function groupToTiles(g: SheetGroup): TileOption[] {
  const tiles: TileOption[] = []
  for (let row = 0; row < g.rows; row++) {
    for (let col = 0; col < g.cols; col++) {
      const idx = row * g.cols + col
      tiles.push({
        id: `${g.sheet}__${col}_${row}`,
        label: g.names?.[idx] ?? `${g.label} ${idx + 1}`,
        sheet: g.sheet,
        col,
        row,
        tileW: g.tileW,
        tileH: g.tileH,
        sheetW: g.sheetW,
        sheetH: g.sheetH,
      })
    }
  }
  return tiles
}

function tileStyle(t: TileOption, displayW: number, displayH: number): React.CSSProperties {
  const scaleX = displayW / t.tileW
  const scaleY = displayH / t.tileH
  return {
    backgroundImage: `url("./house/${t.sheet.replace(/ /g, '%20')}")`,
    backgroundSize: `${t.sheetW * scaleX}px ${t.sheetH * scaleY}px`,
    backgroundPosition: `-${t.col * t.tileW * scaleX}px -${t.row * t.tileH * scaleY}px`,
    backgroundRepeat: 'no-repeat',
    width: displayW,
    height: displayH,
    imageRendering: 'pixelated',
  }
}

const DEFAULT_CONFIG: HouseConfig = {
  floor: { sheet: 'base floor/carpet spritesheet.png', col: 3, row: 3 },
  wall: { sheet: 'base walls/walls_paint_pastel.png', col: 0, row: 0 },
}

interface HouseModalProps {
  uid: string
  onClose: () => void
}

type HouseTab = 'floor' | 'wall'

export default function HouseModal({ onClose }: HouseModalProps) {
  const [config, setConfig] = useState<HouseConfig>(DEFAULT_CONFIG)
  const [tab, setTab] = useState<HouseTab>('floor')
  const [savedFeedback, setSavedFeedback] = useState(false)
  const [activeFloorGroup, setActiveFloorGroup] = useState(0)
  const [activeWallGroup, setActiveWallGroup] = useState(0)

  useEffect(() => {
    const r = ref(db, 'house/config')
    return onValue(r, (snap) => {
      if (snap.exists()) setConfig(snap.val() as HouseConfig)
    })
  }, [])

  const handleSave = async () => {
    await set(ref(db, 'house/config'), config)
    setSavedFeedback(true)
    setTimeout(() => setSavedFeedback(false), 2000)
  }

  const groups = tab === 'floor' ? FLOOR_GROUPS : WALL_GROUPS
  const activeGroup = tab === 'floor' ? activeFloorGroup : activeWallGroup
  const setActiveGroup = tab === 'floor' ? setActiveFloorGroup : setActiveWallGroup
  const tiles = groupToTiles(groups[activeGroup])

  const selectedFloorTile: TileOption = {
    id: 'sel-floor',
    label: '',
    sheet: config.floor.sheet,
    col: config.floor.col,
    row: config.floor.row,
    tileW: 256,
    tileH: 128,
    sheetW: FLOOR_GROUPS.find((g) => g.sheet === config.floor.sheet)?.sheetW ?? 1024,
    sheetH: FLOOR_GROUPS.find((g) => g.sheet === config.floor.sheet)?.sheetH ?? 512,
  }
  const selectedWallTile: TileOption = {
    id: 'sel-wall',
    label: '',
    sheet: config.wall.sheet,
    col: config.wall.col,
    row: config.wall.row,
    tileW: 256,
    tileH: 384,
    sheetW: WALL_GROUPS.find((g) => g.sheet === config.wall.sheet)?.sheetW ?? 2048,
    sheetH: WALL_GROUPS.find((g) => g.sheet === config.wall.sheet)?.sheetH ?? 384,
  }

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
      {/* HEADER */}
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

      {/* BODY */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', flexDirection: 'column' }}>
        {/* Cena isométrica */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--color-leaf-100)',
            overflow: 'hidden',
            minHeight: 0,
          }}
        >
          <HouseScene
            floorTile={selectedFloorTile}
            wallTile={selectedWallTile}
            overlap={groups[activeGroup].overlap ?? 0}
          />
        </div>

        {/* PAINEL INFERIOR */}
        <div
          style={{
            flexShrink: 0,
            borderTop: '2px solid var(--color-wood-300)',
            background: 'var(--color-bark-100)',
            display: 'flex',
            flexDirection: 'column',
            maxHeight: '40vh',
          }}
        >
          {/* Tabs chão / parede */}
          <div
            style={{
              display: 'flex',
              gap: 4,
              padding: '8px 16px',
              borderBottom: '1px solid var(--color-wood-300)',
              flexShrink: 0,
            }}
          >
            {[
              { id: 'floor' as const, label: '🪵 Chão' },
              { id: 'wall' as const, label: '🧱 Parede' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  padding: '5px 18px',
                  borderRadius: 20,
                  border:
                    tab === t.id
                      ? '2px solid var(--color-leaf-500)'
                      : '2px solid var(--color-wood-300)',
                  background: tab === t.id ? 'var(--color-leaf-600)' : 'var(--color-bark-50)',
                  color: tab === t.id ? '#fff' : 'var(--color-leaf-700)',
                  fontSize: 13,
                  fontWeight: tab === t.id ? 700 : 500,
                  fontFamily: 'Baloo 2, sans-serif',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  boxShadow: tab === t.id ? '0 2px 8px rgba(74,122,74,0.18)' : 'none',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Sub-tabs */}
          <div
            style={{
              display: 'flex',
              gap: 6,
              padding: '6px 16px',
              borderBottom: '1px solid var(--color-wood-300)',
              flexShrink: 0,
              flexWrap: 'wrap',
            }}
          >
            {groups.map((g, i) => (
              <button
                key={g.label}
                onClick={() => setActiveGroup(i)}
                style={{
                  padding: '3px 14px',
                  borderRadius: 20,
                  border:
                    activeGroup === i
                      ? '2px solid var(--color-petal-400)'
                      : '2px solid var(--color-wood-300)',
                  background: activeGroup === i ? 'var(--color-petal-200)' : 'transparent',
                  color: activeGroup === i ? 'var(--color-soil-900)' : 'var(--color-leaf-600)',
                  fontSize: 12,
                  fontWeight: activeGroup === i ? 700 : 400,
                  fontFamily: 'Baloo 2, sans-serif',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  whiteSpace: 'nowrap',
                }}
              >
                {g.label}
              </button>
            ))}
          </div>

          {/* Grid de tiles */}
          <div
            className="char-scroll"
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 8,
              padding: '10px 16px',
              overflowY: 'auto',
              alignContent: 'flex-start',
            }}
          >
            {tiles.map((tile) => {
              const isFloor = tab === 'floor'
              const isSelected = isFloor
                ? config.floor.sheet === tile.sheet &&
                  config.floor.col === tile.col &&
                  config.floor.row === tile.row
                : config.wall.sheet === tile.sheet &&
                  config.wall.col === tile.col &&
                  config.wall.row === tile.row
              const displayW = isFloor ? 80 : 52
              const displayH = isFloor ? 40 : 78

              return (
                <button
                  key={tile.id}
                  title={tile.label}
                  onClick={() => {
                    if (isFloor)
                      setConfig((c) => ({
                        ...c,
                        floor: { sheet: tile.sheet, col: tile.col, row: tile.row },
                      }))
                    else
                      setConfig((c) => ({
                        ...c,
                        wall: { sheet: tile.sheet, col: tile.col, row: tile.row },
                      }))
                  }}
                  style={{
                    padding: 0,
                    border: isSelected
                      ? '2.5px solid var(--color-petal-400)'
                      : '2px solid var(--color-wood-300)',
                    borderRadius: 8,
                    background: isSelected ? 'var(--color-petal-200)' : 'rgba(255,255,255,0.55)',
                    cursor: 'pointer',
                    overflow: 'hidden',
                    transition: 'all 0.15s',
                    outline: isSelected ? '2px solid var(--color-petal-300)' : 'none',
                    outlineOffset: 2,
                    boxShadow: isSelected ? '0 2px 8px rgba(196,149,106,0.3)' : 'none',
                  }}
                >
                  <div style={tileStyle(tile, displayW, displayH)} />
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Cena isométrica ──────────────────────────────────────────────────────────
// Tiles reais: chão 256x128, parede 256x384
// Num display menor usamos escala 0.5 → chão 128x64, parede 128x192
// Isométrico standard: tile ocupa stepX=tileW/2, stepY=tileH/2 por coluna/linha

function HouseScene({
  floorTile,
  wallTile,
  overlap = 0,
}: {
  floorTile: TileOption
  wallTile: TileOption
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

  // Chão
  const floorTiles = []
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      floorTiles.push({
        x: c * stepX - r * stepX,
        y: c * stepY + r * stepY,
        z: r * COLS + c,
      })
    }
  }

  const minX = Math.min(...floorTiles.map((t) => t.x))
  const ox = -minX
  const floorNorm = floorTiles.map((t) => ({
    ...t,
    x: Math.round(t.x + ox),
    y: Math.round(t.y),
  }))

  // Paredes: ficam na diagonal r=0, alinhadas com o topo do chão
  // Cada parede c alinha com o tile [r=0, col=c]
  // A borda de baixo da parede encosta no topo do tile do chão

  const wallTiles = []
  for (let c = 0; c < COLS; c++) {
    const floor = floorNorm.find((t) => t.z === c)!
    wallTiles.push({
      x: Math.round(floor.x - 4),
      y: Math.round(floor.y - WH + TH + stepY - c * stepY * 2 + 250),
      z: c,
    })
  }

  const maxFloorX = Math.max(...floorNorm.map((t) => t.x)) + TW
  const maxFloorY = Math.max(...floorNorm.map((t) => t.y)) + TH
  const minWallY = Math.min(...wallTiles.map((t) => t.y))
  const sceneW = maxFloorX
  const sceneH = maxFloorY - minWallY
  const wallOffsetY = -minWallY

  return (
    <div style={{ position: 'relative', width: sceneW, height: sceneH, marginTop: 40 }}>
      {wallTiles.map((pos, i) => (
        <div
          key={`w${i}`}
          style={{
            position: 'absolute',
            left: pos.x,
            top: pos.y + wallOffsetY,
            zIndex: pos.z + 1,
            transformOrigin: 'bottom left',
            ...tileStyle(wallTile, WW, WH),
          }}
        />
      ))}
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
