// ─────────────────────────────────────────────────────────────────────────────
// HouseSceneShared.tsx — tipos, dados e componente de cena compartilhados
// Usado por HouseModal e ShopModal
// ─────────────────────────────────────────────────────────────────────────────

import {
  Grip,
  Grid2x2,
  Hexagon,
  Circle,
  AlignJustify,
  Blend,
  Sparkles,
  PaintBucket,
  BrickWall,
  PaintRoller,
} from 'lucide-react'

// ─────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────

export interface TileOption {
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

export interface SheetDef {
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

export interface SheetGroup {
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

export interface BackgroundOption {
  id: string
  label: string
  css: string
}

// ─────────────────────────────────────────────
// BACKGROUNDS
// ─────────────────────────────────────────────

export const BACKGROUNDS: BackgroundOption[] = [
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

export const DEFAULT_BACKGROUND = 'sky'

// ─────────────────────────────────────────────
// FLOOR GROUPS
// ─────────────────────────────────────────────

export const FLOOR_GROUPS: SheetGroup[] = [
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

// ─────────────────────────────────────────────
// WALL GROUPS
// ─────────────────────────────────────────────

export const WALL_GROUPS: SheetGroup[] = [
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

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

export function groupToTiles(g: SheetGroup): TileOption[] {
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

export function tileStyle(
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

export function findSheetDims(
  groups: SheetGroup[],
  sheet: string
): { sheetW: number; sheetH: number } {
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

// ─────────────────────────────────────────────
// HOUSE SCENE
// ─────────────────────────────────────────────

export function HouseScene({
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
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++)
      floorTiles.push({ x: c * stepX - r * stepX, y: c * stepY + r * stepY, z: r * COLS + c })

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
