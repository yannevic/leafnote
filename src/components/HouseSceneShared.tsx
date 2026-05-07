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
  svg?: string
}

// ─────────────────────────────────────────────
// BACKGROUNDS
// ─────────────────────────────────────────────

export const BACKGROUNDS: BackgroundOption[] = [
  {
    id: 'sky',
    label: 'Céu',
    css: 'linear-gradient(to bottom, #b8dff0 0%, #d6eefc 45%, #eef6fb 75%, #f5efe8 100%)',
  },
  {
    id: 'sunset',
    label: 'Pôr do sol',
    css: 'linear-gradient(to bottom, #f7c59f 0%, #f0a8b8 35%, #d9aee8 65%, #c4b8f0 100%)',
  },
  {
    id: 'sunset2',
    label: 'Pôr do sol 2',
    css: 'linear-gradient(to bottom, #2c1654 0%, #7b2d8b 20%, #d4546a 45%, #f0845a 65%, #f7b97a 82%, #fde3b0 100%)',
  },
  {
    id: 'mist',
    label: 'Névoa',
    css: `radial-gradient(ellipse at 50% 0%, #ffffffcc 0%, transparent 70%),
          linear-gradient(to bottom, #e8e4f4 0%, #ddd8ef 25%, #ece8f6 50%, #d8d4ed 75%, #e4e0f2 100%)`,
  },
  {
    id: 'garden',
    label: 'Jardim',
    css: `radial-gradient(ellipse at 50% 110%, #a8d8b0 0%, transparent 60%),
          linear-gradient(to bottom, #c2e8f0 0%, #d4f0da 40%, #b8e8c2 70%, #a0d4a8 100%)`,
  },
  {
    id: 'forest',
    label: 'Floresta',
    css: 'linear-gradient(to bottom, #1a3d16 0%, #3d7a33 50%, #6aad5e 100%)',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
      <defs>
        <radialGradient id="fl-light" cx="50%" cy="8%" r="40%">
          <stop offset="0%" stop-color="#a8d4a0" stop-opacity="0.32"/>
          <stop offset="100%" stop-color="#1a3d16" stop-opacity="0"/>
        </radialGradient>
        <radialGradient id="fl-floor" cx="50%" cy="100%" r="55%">
          <stop offset="0%" stop-color="#0e2610" stop-opacity="0.55"/>
          <stop offset="100%" stop-color="#0e2610" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#fl-floor)"/>
      <rect width="100%" height="100%" fill="url(#fl-light)"/>
      <rect x="4%" y="30%" width="3%" height="70%" rx="3" fill="#1e3a20" opacity="0.65"/>
      <ellipse cx="5.5%" cy="30%" rx="7%" ry="12%" fill="#2e5c30" opacity="0.72"/>
      <ellipse cx="5.5%" cy="23%" rx="5.5%" ry="9%" fill="#3a7040" opacity="0.68"/>
      <rect x="17%" y="38%" width="2.5%" height="62%" rx="3" fill="#1e3a20" opacity="0.58"/>
      <ellipse cx="18.2%" cy="38%" rx="6%" ry="10%" fill="#305c34" opacity="0.68"/>
      <ellipse cx="18.2%" cy="30%" rx="4.5%" ry="8%" fill="#3e7244" opacity="0.62"/>
      <rect x="36%" y="26%" width="3.2%" height="74%" rx="3" fill="#1a3618" opacity="0.62"/>
      <ellipse cx="37.6%" cy="26%" rx="8%" ry="13%" fill="#2c5a2e" opacity="0.75"/>
      <ellipse cx="37.6%" cy="18%" rx="6%" ry="9.5%" fill="#3a6e3c" opacity="0.68"/>
      <rect x="54%" y="34%" width="2.8%" height="66%" rx="3" fill="#1e3a20" opacity="0.6"/>
      <ellipse cx="55.4%" cy="34%" rx="6.5%" ry="11%" fill="#2e5c30" opacity="0.7"/>
      <ellipse cx="55.4%" cy="26%" rx="5%" ry="8%" fill="#3c7040" opacity="0.64"/>
      <rect x="72%" y="28%" width="3%" height="72%" rx="3" fill="#1a3618" opacity="0.65"/>
      <ellipse cx="73.5%" cy="28%" rx="7.5%" ry="12%" fill="#2a5828" opacity="0.74"/>
      <ellipse cx="73.5%" cy="20%" rx="5.5%" ry="9%" fill="#386c3a" opacity="0.67"/>
      <rect x="88%" y="36%" width="2.5%" height="64%" rx="3" fill="#1e3a20" opacity="0.58"/>
      <ellipse cx="89.2%" cy="36%" rx="6%" ry="10%" fill="#2e5c30" opacity="0.68"/>
      <ellipse cx="89.2%" cy="28%" rx="4.5%" ry="7.5%" fill="#3c6e3e" opacity="0.62"/>
      <line x1="38%" y1="0%" x2="22%" y2="75%" stroke="#b0d8a0" stroke-width="4%" opacity="0.07"/>
      <line x1="55%" y1="0%" x2="62%" y2="75%" stroke="#b0d8a0" stroke-width="3%" opacity="0.055"/>
      <ellipse cx="50%" cy="100%" rx="55%" ry="8%" fill="#0e2410" opacity="0.4"/>
    </svg>`,
  },
  {
    id: 'night',
    label: 'Noturno',
    css: 'linear-gradient(to bottom, #0e1c4a 0%, #1e2d6e 40%, #2e2468 70%, #1e1848 100%)',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
      <defs>
        <radialGradient id="nt-moon" cx="50%" cy="17%" r="18%">
          <stop offset="0%" stop-color="#fffde8" stop-opacity="0.55"/>
          <stop offset="100%" stop-color="#fffde8" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#nt-moon)"/>
      <circle cx="50%" cy="17%" r="2.2%" fill="#fffde8" opacity="0.96"/>
      <circle cx="50%" cy="17%" r="3.2%" fill="#fdf5c0" opacity="0.22"/>
      <circle cx="8%"  cy="6%"  r="0.55%" fill="#ffffff" opacity="0.96"/>
      <circle cx="15%" cy="12%" r="0.42%" fill="#fffde8" opacity="0.9"/>
      <circle cx="23%" cy="5%"  r="0.5%"  fill="#ffffff" opacity="0.93"/>
      <circle cx="31%" cy="9%"  r="0.38%" fill="#fffde8" opacity="0.88"/>
      <circle cx="40%" cy="4%"  r="0.48%" fill="#ffffff" opacity="0.9"/>
      <circle cx="61%" cy="5%"  r="0.52%" fill="#ffffff" opacity="0.94"/>
      <circle cx="69%" cy="11%" r="0.4%"  fill="#fffde8" opacity="0.87"/>
      <circle cx="78%" cy="4%"  r="0.5%"  fill="#ffffff" opacity="0.92"/>
      <circle cx="86%" cy="9%"  r="0.44%" fill="#fffde8" opacity="0.89"/>
      <circle cx="93%" cy="6%"  r="0.48%" fill="#ffffff" opacity="0.91"/>
      <circle cx="5%"  cy="16%" r="0.32%" fill="#e8e8ff" opacity="0.82"/>
      <circle cx="12%" cy="22%" r="0.3%"  fill="#ffffff" opacity="0.78"/>
      <circle cx="19%" cy="18%" r="0.34%" fill="#fffdf0" opacity="0.8"/>
      <circle cx="27%" cy="14%" r="0.28%" fill="#ffffff" opacity="0.76"/>
      <circle cx="35%" cy="20%" r="0.32%" fill="#e8e8ff" opacity="0.8"/>
      <circle cx="44%" cy="15%" r="0.3%"  fill="#ffffff" opacity="0.77"/>
      <circle cx="57%" cy="14%" r="0.34%" fill="#fffdf0" opacity="0.82"/>
      <circle cx="65%" cy="19%" r="0.28%" fill="#ffffff" opacity="0.75"/>
      <circle cx="73%" cy="15%" r="0.32%" fill="#e8e8ff" opacity="0.79"/>
      <circle cx="81%" cy="20%" r="0.3%"  fill="#ffffff" opacity="0.77"/>
      <circle cx="89%" cy="16%" r="0.34%" fill="#fffdf0" opacity="0.81"/>
      <circle cx="96%" cy="18%" r="0.28%" fill="#ffffff" opacity="0.74"/>
      <circle cx="3%"  cy="25%" r="0.2%"  fill="#ffffff" opacity="0.65"/>
      <circle cx="10%" cy="28%" r="0.18%" fill="#e8e8ff" opacity="0.62"/>
      <circle cx="17%" cy="26%" r="0.22%" fill="#ffffff" opacity="0.67"/>
      <circle cx="22%" cy="30%" r="0.18%" fill="#fffdf0" opacity="0.6"/>
      <circle cx="29%" cy="24%" r="0.2%"  fill="#ffffff" opacity="0.64"/>
      <circle cx="37%" cy="28%" r="0.18%" fill="#e8e8ff" opacity="0.61"/>
      <circle cx="47%" cy="22%" r="0.22%" fill="#ffffff" opacity="0.66"/>
      <circle cx="53%" cy="26%" r="0.2%"  fill="#fffdf0" opacity="0.63"/>
      <circle cx="60%" cy="23%" r="0.18%" fill="#ffffff" opacity="0.6"/>
      <circle cx="67%" cy="27%" r="0.22%" fill="#e8e8ff" opacity="0.65"/>
      <circle cx="75%" cy="24%" r="0.18%" fill="#ffffff" opacity="0.61"/>
      <circle cx="83%" cy="28%" r="0.2%"  fill="#fffdf0" opacity="0.63"/>
      <circle cx="91%" cy="25%" r="0.18%" fill="#ffffff" opacity="0.6"/>
      <circle cx="97%" cy="27%" r="0.22%" fill="#e8e8ff" opacity="0.64"/>
      <ellipse cx="25%" cy="18%" rx="12%" ry="5%" fill="#5555aa" opacity="0.07"/>
      <ellipse cx="75%" cy="16%" rx="10%" ry="4%" fill="#6666bb" opacity="0.06"/>
    </svg>`,
  },
  {
    id: 'indoor',
    label: 'Interior',
    css: `radial-gradient(ellipse at 50% 0%, #fff8e844 0%, transparent 50%),
          linear-gradient(to bottom, #e8c99a 0%, #d4b080 20%, #c9a872 40%, #e8d5b0 70%, #f5ece0 100%)`,
  },
  {
    id: 'dark',
    label: 'Noturno escuro',
    css: 'linear-gradient(to bottom, #030308 0%, #0e0620 40%, #1a0c38 75%, #0e0820 100%)',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
      <defs>
        <radialGradient id="dk-glow" cx="50%" cy="100%" r="60%">
          <stop offset="0%" stop-color="#2a1060" stop-opacity="0.55"/>
          <stop offset="100%" stop-color="#030308" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#dk-glow)"/>
      <circle cx="7%"  cy="5%"  r="0.5%"  fill="#ffffff" opacity="0.82"/>
      <circle cx="14%" cy="10%" r="0.38%" fill="#e8e0ff" opacity="0.76"/>
      <circle cx="22%" cy="4%"  r="0.46%" fill="#ffffff" opacity="0.8"/>
      <circle cx="30%" cy="8%"  r="0.36%" fill="#e8e0ff" opacity="0.74"/>
      <circle cx="39%" cy="3%"  r="0.44%" fill="#ffffff" opacity="0.78"/>
      <circle cx="62%" cy="4%"  r="0.48%" fill="#ffffff" opacity="0.81"/>
      <circle cx="70%" cy="9%"  r="0.38%" fill="#e8e0ff" opacity="0.75"/>
      <circle cx="79%" cy="3%"  r="0.46%" fill="#ffffff" opacity="0.79"/>
      <circle cx="87%" cy="8%"  r="0.4%"  fill="#e8e0ff" opacity="0.76"/>
      <circle cx="94%" cy="5%"  r="0.44%" fill="#ffffff" opacity="0.8"/>
      <circle cx="4%"  cy="14%" r="0.3%"  fill="#d8d0ff" opacity="0.7"/>
      <circle cx="11%" cy="19%" r="0.28%" fill="#ffffff" opacity="0.67"/>
      <circle cx="18%" cy="15%" r="0.32%" fill="#e8e0ff" opacity="0.7"/>
      <circle cx="26%" cy="12%" r="0.26%" fill="#ffffff" opacity="0.65"/>
      <circle cx="34%" cy="18%" r="0.3%"  fill="#d8d0ff" opacity="0.68"/>
      <circle cx="43%" cy="13%" r="0.28%" fill="#ffffff" opacity="0.66"/>
      <circle cx="48%" cy="7%"  r="0.32%" fill="#e8e0ff" opacity="0.71"/>
      <circle cx="56%" cy="12%" r="0.28%" fill="#ffffff" opacity="0.67"/>
      <circle cx="66%" cy="17%" r="0.3%"  fill="#d8d0ff" opacity="0.69"/>
      <circle cx="74%" cy="13%" r="0.26%" fill="#ffffff" opacity="0.64"/>
      <circle cx="82%" cy="17%" r="0.3%"  fill="#e8e0ff" opacity="0.68"/>
      <circle cx="90%" cy="14%" r="0.28%" fill="#ffffff" opacity="0.66"/>
      <circle cx="97%" cy="16%" r="0.3%"  fill="#d8d0ff" opacity="0.67"/>
      <circle cx="3%"  cy="22%" r="0.18%" fill="#ffffff" opacity="0.55"/>
      <circle cx="9%"  cy="26%" r="0.16%" fill="#d8d0ff" opacity="0.52"/>
      <circle cx="16%" cy="23%" r="0.2%"  fill="#ffffff" opacity="0.57"/>
      <circle cx="20%" cy="28%" r="0.16%" fill="#e8e0ff" opacity="0.5"/>
      <circle cx="28%" cy="21%" r="0.18%" fill="#ffffff" opacity="0.54"/>
      <circle cx="32%" cy="25%" r="0.16%" fill="#d8d0ff" opacity="0.51"/>
      <circle cx="36%" cy="22%" r="0.18%" fill="#ffffff" opacity="0.55"/>
      <circle cx="41%" cy="26%" r="0.16%" fill="#e8e0ff" opacity="0.5"/>
      <circle cx="46%" cy="19%" r="0.2%"  fill="#ffffff" opacity="0.56"/>
      <circle cx="52%" cy="23%" r="0.18%" fill="#d8d0ff" opacity="0.53"/>
      <circle cx="58%" cy="20%" r="0.16%" fill="#ffffff" opacity="0.5"/>
      <circle cx="63%" cy="25%" r="0.2%"  fill="#e8e0ff" opacity="0.55"/>
      <circle cx="68%" cy="22%" r="0.16%" fill="#ffffff" opacity="0.51"/>
      <circle cx="72%" cy="27%" r="0.18%" fill="#d8d0ff" opacity="0.52"/>
      <circle cx="77%" cy="21%" r="0.16%" fill="#ffffff" opacity="0.5"/>
      <circle cx="84%" cy="24%" r="0.2%"  fill="#e8e0ff" opacity="0.55"/>
      <circle cx="88%" cy="21%" r="0.16%" fill="#ffffff" opacity="0.51"/>
      <circle cx="92%" cy="26%" r="0.18%" fill="#d8d0ff" opacity="0.52"/>
      <circle cx="96%" cy="22%" r="0.16%" fill="#ffffff" opacity="0.5"/>
    </svg>`,
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

export function getBgStyle(bgId: string): React.CSSProperties {
  const bg = BACKGROUNDS.find((b) => b.id === bgId) ?? BACKGROUNDS[0]
  return bg.svg ? { background: bg.css } : { background: bg.css }
}
