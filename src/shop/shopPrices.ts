// ─────────────────────────────────────────────────────────────────────────────
// shopPrices.ts
// Fonte única de verdade para preços, categorias e itens da loja.
//
// ROUPAS: IDs vêm diretamente do index.ts (CharacterPiece.id)
//         Itens com cost: 0 ou free: true são desbloqueados por padrão
//         e nunca aparecem na loja.
//
// CASINHA: IDs limpos no formato {categoria}_{grupo}_{variante}
//          Mapeados para { sheet, col, row } em HOUSE_TILE_MAP abaixo.
//
// INVENTÁRIO INICIAL (desbloqueado sem compra):
//   Roupas   → all pieces onde cost === 0 (bodies 1–17, etc.)
//   Casinha  → DEFAULT_HOUSE_UNLOCKED (3 itens definidos na Fase 1)
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────

export type ShopCategory =
  | 'character' // roupas, acessórios, corpo, cabelo
  | 'floor' // pisos da casinha
  | 'wall' // paredes da casinha
  | 'background' // fundos da casinha
  | 'furniture' // móveis (fase 3+)
  | 'room' // cômodos extras (fase 4+)

export type ShopItemTier =
  | 'basic' // itens simples, preço baixo
  | 'common' // itens padrão
  | 'special' // itens de pack temático
  | 'premium' // itens raros / exclusivos

export interface ShopItem {
  id: string
  label: string
  category: ShopCategory
  tier: ShopItemTier
  cost: number
  /** Se true, aparece com badge de destaque na loja */
  featured?: boolean
  /** Dias da semana disponíveis (0=dom … 6=sáb). Undefined = sempre disponível */
  availableDays?: number[]
  /** Percentual de desconto (0–100). Undefined = sem desconto */
  discount?: number
  /** Thumbnail para exibir na loja (opcional — loja pode gerar do asset) */
  thumbnail?: string
}

// Tile da casinha referenciado por ID limpo
export interface HouseTileRef {
  sheet: string
  col: number
  row: number
}

// ─────────────────────────────────────────────
// PREÇOS BASE POR TIER / CATEGORIA
// Referência para manter consistência ao adicionar novos itens
// ─────────────────────────────────────────────

export const BASE_PRICES: Record<ShopCategory, Record<ShopItemTier, number>> = {
  character: {
    basic: 20, // boca, sobrancelha, cílios, pupila
    common: 40, // cabelo, franja, sapato, luva
    special: 70, // roupas de pack (top, bottom, dress)
    premium: 100, // itens especiais (capa real, príncipe)
  },
  floor: {
    basic: 50, // pisos comuns (madeira, pedra)
    common: 70, // pisos com padrão (carpet, checkerboard)
    special: 90, // Cute Decor ✦
    premium: 120, // futuro
  },
  wall: {
    basic: 80, // tinta lisa
    common: 100, // tinta listrada, tijolo
    special: 120, // Cute Decor ✦
    premium: 150, // futuro
  },
  background: {
    basic: 30,
    common: 50,
    special: 70,
    premium: 100,
  },
  furniture: {
    basic: 80,
    common: 150,
    special: 250,
    premium: 400,
  },
  room: {
    basic: 300,
    common: 300,
    special: 500,
    premium: 800,
  },
}

// ─────────────────────────────────────────────
// INVENTÁRIO PADRÃO (desbloqueado sem compra)
// ─────────────────────────────────────────────

/**
 * IDs de roupas desbloqueadas desde o início.
 * Complementa os itens com cost === 0 no index.ts.
 * Adicione aqui se quiser desbloquear algum item pago por padrão.
 */
export const DEFAULT_CHARACTER_UNLOCKED: string[] = [
  // bodies 1–17 têm cost: 0 no index.ts → desbloqueados automaticamente
  // Adicione IDs extras aqui se necessário
]

/**
 * IDs de itens da casinha desbloqueados desde o início (definidos na Fase 1).
 */
export const DEFAULT_HOUSE_UNLOCKED: string[] = [
  'floor_carpet_white', // carpete branco
  'wall_stripes_grey', // listrada cinza
  'bg_sky', // fundo céu
]

// ─────────────────────────────────────────────
// MAPA: ID limpo → tile da casinha
// Usado pelo HouseModal para renderizar o tile a partir do itemId
// ─────────────────────────────────────────────

export const HOUSE_TILE_MAP: Record<string, HouseTileRef> = {
  // ── FLOORS — base floor/ ──────────────────

  // Preto e branco (black and white.png — 4×3)
  floor_bw_1: { sheet: 'base floor/black and white.png', col: 0, row: 0 },
  floor_bw_2: { sheet: 'base floor/black and white.png', col: 1, row: 0 },
  floor_bw_3: { sheet: 'base floor/black and white.png', col: 2, row: 0 },
  floor_bw_4: { sheet: 'base floor/black and white.png', col: 3, row: 0 },
  floor_bw_5: { sheet: 'base floor/black and white.png', col: 0, row: 1 },
  floor_bw_6: { sheet: 'base floor/black and white.png', col: 1, row: 1 },
  floor_bw_7: { sheet: 'base floor/black and white.png', col: 2, row: 1 },
  floor_bw_8: { sheet: 'base floor/black and white.png', col: 3, row: 1 },
  floor_bw_9: { sheet: 'base floor/black and white.png', col: 0, row: 2 },
  floor_bw_10: { sheet: 'base floor/black and white.png', col: 1, row: 2 },
  floor_bw_11: { sheet: 'base floor/black and white.png', col: 2, row: 2 },
  floor_bw_12: { sheet: 'base floor/black and white.png', col: 3, row: 2 },

  // Carpete (carpet spritesheet.png — 4×4, 14 válidos)
  floor_carpet_white: { sheet: 'base floor/carpet spritesheet.png', col: 0, row: 0 },
  floor_carpet_pink: { sheet: 'base floor/carpet spritesheet.png', col: 1, row: 0 },
  floor_carpet_blue: { sheet: 'base floor/carpet spritesheet.png', col: 2, row: 0 },
  floor_carpet_green: { sheet: 'base floor/carpet spritesheet.png', col: 3, row: 0 },
  floor_carpet_yellow: { sheet: 'base floor/carpet spritesheet.png', col: 0, row: 1 },
  floor_carpet_purple: { sheet: 'base floor/carpet spritesheet.png', col: 1, row: 1 },
  floor_carpet_red: { sheet: 'base floor/carpet spritesheet.png', col: 2, row: 1 },
  floor_carpet_orange: { sheet: 'base floor/carpet spritesheet.png', col: 3, row: 1 },
  floor_carpet_teal: { sheet: 'base floor/carpet spritesheet.png', col: 0, row: 2 },
  floor_carpet_brown: { sheet: 'base floor/carpet spritesheet.png', col: 1, row: 2 },
  floor_carpet_grey: { sheet: 'base floor/carpet spritesheet.png', col: 2, row: 2 },
  floor_carpet_beige: { sheet: 'base floor/carpet spritesheet.png', col: 3, row: 2 },
  floor_carpet_mint: { sheet: 'base floor/carpet spritesheet.png', col: 0, row: 3 },
  floor_carpet_lilac: { sheet: 'base floor/carpet spritesheet.png', col: 1, row: 3 },

  // Xadrez (chckerboard — 4×4, 15 válidos)
  floor_checker_1: { sheet: 'base floor/chckerboard spritesheet.png', col: 0, row: 0 },
  floor_checker_2: { sheet: 'base floor/chckerboard spritesheet.png', col: 1, row: 0 },
  floor_checker_3: { sheet: 'base floor/chckerboard spritesheet.png', col: 2, row: 0 },
  floor_checker_4: { sheet: 'base floor/chckerboard spritesheet.png', col: 3, row: 0 },
  floor_checker_5: { sheet: 'base floor/chckerboard spritesheet.png', col: 0, row: 1 },
  floor_checker_6: { sheet: 'base floor/chckerboard spritesheet.png', col: 1, row: 1 },
  floor_checker_7: { sheet: 'base floor/chckerboard spritesheet.png', col: 2, row: 1 },
  floor_checker_8: { sheet: 'base floor/chckerboard spritesheet.png', col: 3, row: 1 },
  floor_checker_9: { sheet: 'base floor/chckerboard spritesheet.png', col: 0, row: 2 },
  floor_checker_10: { sheet: 'base floor/chckerboard spritesheet.png', col: 1, row: 2 },
  floor_checker_11: { sheet: 'base floor/chckerboard spritesheet.png', col: 2, row: 2 },
  floor_checker_12: { sheet: 'base floor/chckerboard spritesheet.png', col: 3, row: 2 },
  floor_checker_13: { sheet: 'base floor/chckerboard spritesheet.png', col: 0, row: 3 },
  floor_checker_14: { sheet: 'base floor/chckerboard spritesheet.png', col: 1, row: 3 },
  floor_checker_15: { sheet: 'base floor/chckerboard spritesheet.png', col: 2, row: 3 },

  // Paralelepípedo (cobblestone — 2×2)
  floor_cobble_1: { sheet: 'base floor/cobblestone spritesheet.png', col: 0, row: 0 },
  floor_cobble_2: { sheet: 'base floor/cobblestone spritesheet.png', col: 1, row: 0 },
  floor_cobble_3: { sheet: 'base floor/cobblestone spritesheet.png', col: 0, row: 1 },
  floor_cobble_4: { sheet: 'base floor/cobblestone spritesheet.png', col: 1, row: 1 },

  // Seixos (pebbles — 2×2)
  floor_pebble_1: { sheet: 'base floor/pebbles spritesheet.png', col: 0, row: 0 },
  floor_pebble_2: { sheet: 'base floor/pebbles spritesheet.png', col: 1, row: 0 },
  floor_pebble_3: { sheet: 'base floor/pebbles spritesheet.png', col: 0, row: 1 },
  floor_pebble_4: { sheet: 'base floor/pebbles spritesheet.png', col: 1, row: 1 },

  // Pedra quadrada (stone square — 5×5, 24 válidos)
  floor_stone_1: { sheet: 'base floor/stone square spritesheet.png', col: 0, row: 0 },
  floor_stone_2: { sheet: 'base floor/stone square spritesheet.png', col: 1, row: 0 },
  floor_stone_3: { sheet: 'base floor/stone square spritesheet.png', col: 2, row: 0 },
  floor_stone_4: { sheet: 'base floor/stone square spritesheet.png', col: 3, row: 0 },
  floor_stone_5: { sheet: 'base floor/stone square spritesheet.png', col: 4, row: 0 },
  floor_stone_6: { sheet: 'base floor/stone square spritesheet.png', col: 0, row: 1 },
  floor_stone_7: { sheet: 'base floor/stone square spritesheet.png', col: 1, row: 1 },
  floor_stone_8: { sheet: 'base floor/stone square spritesheet.png', col: 2, row: 1 },
  floor_stone_9: { sheet: 'base floor/stone square spritesheet.png', col: 3, row: 1 },
  floor_stone_10: { sheet: 'base floor/stone square spritesheet.png', col: 4, row: 1 },
  floor_stone_11: { sheet: 'base floor/stone square spritesheet.png', col: 0, row: 2 },
  floor_stone_12: { sheet: 'base floor/stone square spritesheet.png', col: 1, row: 2 },
  floor_stone_13: { sheet: 'base floor/stone square spritesheet.png', col: 2, row: 2 },
  floor_stone_14: { sheet: 'base floor/stone square spritesheet.png', col: 3, row: 2 },
  floor_stone_15: { sheet: 'base floor/stone square spritesheet.png', col: 4, row: 2 },
  floor_stone_16: { sheet: 'base floor/stone square spritesheet.png', col: 0, row: 3 },
  floor_stone_17: { sheet: 'base floor/stone square spritesheet.png', col: 1, row: 3 },
  floor_stone_18: { sheet: 'base floor/stone square spritesheet.png', col: 2, row: 3 },
  floor_stone_19: { sheet: 'base floor/stone square spritesheet.png', col: 3, row: 3 },
  floor_stone_20: { sheet: 'base floor/stone square spritesheet.png', col: 4, row: 3 },
  floor_stone_21: { sheet: 'base floor/stone square spritesheet.png', col: 0, row: 4 },
  floor_stone_22: { sheet: 'base floor/stone square spritesheet.png', col: 1, row: 4 },
  floor_stone_23: { sheet: 'base floor/stone square spritesheet.png', col: 2, row: 4 },
  floor_stone_24: { sheet: 'base floor/stone square spritesheet.png', col: 3, row: 4 },

  // Madeira (wood spritesheet — 3×3, 8 válidos)
  floor_wood_1: { sheet: 'base floor/wood spritesheet.png', col: 0, row: 0 },
  floor_wood_2: { sheet: 'base floor/wood spritesheet.png', col: 1, row: 0 },
  floor_wood_3: { sheet: 'base floor/wood spritesheet.png', col: 2, row: 0 },
  floor_wood_4: { sheet: 'base floor/wood spritesheet.png', col: 0, row: 1 },
  floor_wood_5: { sheet: 'base floor/wood spritesheet.png', col: 1, row: 1 },
  floor_wood_6: { sheet: 'base floor/wood spritesheet.png', col: 2, row: 1 },
  floor_wood_7: { sheet: 'base floor/wood spritesheet.png', col: 0, row: 2 },
  floor_wood_8: { sheet: 'base floor/wood spritesheet.png', col: 1, row: 2 },

  // ── FLOORS — floor (tiles)/ ───────────────

  // Azul (cut_floor_blue.png — 3×2)
  floor_cute_blue_1: { sheet: 'floor (tiles)/cut_floor_blue.png', col: 0, row: 0 },
  floor_cute_blue_2: { sheet: 'floor (tiles)/cut_floor_blue.png', col: 1, row: 0 },
  floor_cute_blue_3: { sheet: 'floor (tiles)/cut_floor_blue.png', col: 2, row: 0 },
  floor_cute_blue_4: { sheet: 'floor (tiles)/cut_floor_blue.png', col: 0, row: 1 },
  floor_cute_blue_5: { sheet: 'floor (tiles)/cut_floor_blue.png', col: 1, row: 1 },
  floor_cute_blue_6: { sheet: 'floor (tiles)/cut_floor_blue.png', col: 2, row: 1 },

  // Verde (cut_floor_green.png — 3×2)
  floor_cute_green_1: { sheet: 'floor (tiles)/cut_floor_green.png', col: 0, row: 0 },
  floor_cute_green_2: { sheet: 'floor (tiles)/cut_floor_green.png', col: 1, row: 0 },
  floor_cute_green_3: { sheet: 'floor (tiles)/cut_floor_green.png', col: 2, row: 0 },
  floor_cute_green_4: { sheet: 'floor (tiles)/cut_floor_green.png', col: 0, row: 1 },
  floor_cute_green_5: { sheet: 'floor (tiles)/cut_floor_green.png', col: 1, row: 1 },
  floor_cute_green_6: { sheet: 'floor (tiles)/cut_floor_green.png', col: 2, row: 1 },

  // Laranja (cut_floor_orange.png — 3×2)
  floor_cute_orange_1: { sheet: 'floor (tiles)/cut_floor_orange.png', col: 0, row: 0 },
  floor_cute_orange_2: { sheet: 'floor (tiles)/cut_floor_orange.png', col: 1, row: 0 },
  floor_cute_orange_3: { sheet: 'floor (tiles)/cut_floor_orange.png', col: 2, row: 0 },
  floor_cute_orange_4: { sheet: 'floor (tiles)/cut_floor_orange.png', col: 0, row: 1 },
  floor_cute_orange_5: { sheet: 'floor (tiles)/cut_floor_orange.png', col: 1, row: 1 },
  floor_cute_orange_6: { sheet: 'floor (tiles)/cut_floor_orange.png', col: 2, row: 1 },

  // Rosa (cut_floor_pink.png — 3×2)
  floor_cute_pink_1: { sheet: 'floor (tiles)/cut_floor_pink.png', col: 0, row: 0 },
  floor_cute_pink_2: { sheet: 'floor (tiles)/cut_floor_pink.png', col: 1, row: 0 },
  floor_cute_pink_3: { sheet: 'floor (tiles)/cut_floor_pink.png', col: 2, row: 0 },
  floor_cute_pink_4: { sheet: 'floor (tiles)/cut_floor_pink.png', col: 0, row: 1 },
  floor_cute_pink_5: { sheet: 'floor (tiles)/cut_floor_pink.png', col: 1, row: 1 },
  floor_cute_pink_6: { sheet: 'floor (tiles)/cut_floor_pink.png', col: 2, row: 1 },

  // Violeta (cut_floor_violet.png — 3×2)
  floor_cute_violet_1: { sheet: 'floor (tiles)/cut_floor_violet.png', col: 0, row: 0 },
  floor_cute_violet_2: { sheet: 'floor (tiles)/cut_floor_violet.png', col: 1, row: 0 },
  floor_cute_violet_3: { sheet: 'floor (tiles)/cut_floor_violet.png', col: 2, row: 0 },
  floor_cute_violet_4: { sheet: 'floor (tiles)/cut_floor_violet.png', col: 0, row: 1 },
  floor_cute_violet_5: { sheet: 'floor (tiles)/cut_floor_violet.png', col: 1, row: 1 },
  floor_cute_violet_6: { sheet: 'floor (tiles)/cut_floor_violet.png', col: 2, row: 1 },

  // ── WALLS — base walls/ ───────────────────

  // Tinta lisa — pastel (4×2)
  wall_paint_pastel_1: { sheet: 'base walls/walls_paint_pastel.png', col: 0, row: 0 },
  wall_paint_pastel_2: { sheet: 'base walls/walls_paint_pastel.png', col: 1, row: 0 },
  wall_paint_pastel_3: { sheet: 'base walls/walls_paint_pastel.png', col: 2, row: 0 },
  wall_paint_pastel_4: { sheet: 'base walls/walls_paint_pastel.png', col: 3, row: 0 },
  wall_paint_pastel_5: { sheet: 'base walls/walls_paint_pastel.png', col: 0, row: 1 },
  wall_paint_pastel_6: { sheet: 'base walls/walls_paint_pastel.png', col: 1, row: 1 },
  wall_paint_pastel_7: { sheet: 'base walls/walls_paint_pastel.png', col: 2, row: 1 },
  wall_paint_pastel_8: { sheet: 'base walls/walls_paint_pastel.png', col: 3, row: 1 },

  // Tinta lisa — terrosa (4×2)
  wall_paint_earthy_1: { sheet: 'base walls/walls_paint_earthy.png', col: 0, row: 0 },
  wall_paint_earthy_2: { sheet: 'base walls/walls_paint_earthy.png', col: 1, row: 0 },
  wall_paint_earthy_3: { sheet: 'base walls/walls_paint_earthy.png', col: 2, row: 0 },
  wall_paint_earthy_4: { sheet: 'base walls/walls_paint_earthy.png', col: 3, row: 0 },
  wall_paint_earthy_5: { sheet: 'base walls/walls_paint_earthy.png', col: 0, row: 1 },
  wall_paint_earthy_6: { sheet: 'base walls/walls_paint_earthy.png', col: 1, row: 1 },
  wall_paint_earthy_7: { sheet: 'base walls/walls_paint_earthy.png', col: 2, row: 1 },
  wall_paint_earthy_8: { sheet: 'base walls/walls_paint_earthy.png', col: 3, row: 1 },

  // Tinta lisa — clara (4×2)
  wall_paint_bright_1: { sheet: 'base walls/walls_paint_bright.png', col: 0, row: 0 },
  wall_paint_bright_2: { sheet: 'base walls/walls_paint_bright.png', col: 1, row: 0 },
  wall_paint_bright_3: { sheet: 'base walls/walls_paint_bright.png', col: 2, row: 0 },
  wall_paint_bright_4: { sheet: 'base walls/walls_paint_bright.png', col: 3, row: 0 },
  wall_paint_bright_5: { sheet: 'base walls/walls_paint_bright.png', col: 0, row: 1 },
  wall_paint_bright_6: { sheet: 'base walls/walls_paint_bright.png', col: 1, row: 1 },
  wall_paint_bright_7: { sheet: 'base walls/walls_paint_bright.png', col: 2, row: 1 },
  wall_paint_bright_8: { sheet: 'base walls/walls_paint_bright.png', col: 3, row: 1 },

  // Tinta lisa — cinza (4×2)
  wall_paint_grey_1: { sheet: 'base walls/walls_paint_grey.png', col: 0, row: 0 },
  wall_paint_grey_2: { sheet: 'base walls/walls_paint_grey.png', col: 1, row: 0 },
  wall_paint_grey_3: { sheet: 'base walls/walls_paint_grey.png', col: 2, row: 0 },
  wall_paint_grey_4: { sheet: 'base walls/walls_paint_grey.png', col: 3, row: 0 },
  wall_paint_grey_5: { sheet: 'base walls/walls_paint_grey.png', col: 0, row: 1 },
  wall_paint_grey_6: { sheet: 'base walls/walls_paint_grey.png', col: 1, row: 1 },
  wall_paint_grey_7: { sheet: 'base walls/walls_paint_grey.png', col: 2, row: 1 },
  wall_paint_grey_8: { sheet: 'base walls/walls_paint_grey.png', col: 3, row: 1 },

  // Tinta listrada — pastel (4×2)
  wall_stripes_pastel_1: { sheet: 'base walls/walls_paint_pastel_stripes.png', col: 0, row: 0 },
  wall_stripes_pastel_2: { sheet: 'base walls/walls_paint_pastel_stripes.png', col: 1, row: 0 },
  wall_stripes_pastel_3: { sheet: 'base walls/walls_paint_pastel_stripes.png', col: 2, row: 0 },
  wall_stripes_pastel_4: { sheet: 'base walls/walls_paint_pastel_stripes.png', col: 3, row: 0 },
  wall_stripes_pastel_5: { sheet: 'base walls/walls_paint_pastel_stripes.png', col: 0, row: 1 },
  wall_stripes_pastel_6: { sheet: 'base walls/walls_paint_pastel_stripes.png', col: 1, row: 1 },
  wall_stripes_pastel_7: { sheet: 'base walls/walls_paint_pastel_stripes.png', col: 2, row: 1 },
  wall_stripes_pastel_8: { sheet: 'base walls/walls_paint_pastel_stripes.png', col: 3, row: 1 },

  // Tinta listrada — terrosa (4×2)
  wall_stripes_earthy_1: { sheet: 'base walls/walls_paint_earthy_stripes.png', col: 0, row: 0 },
  wall_stripes_earthy_2: { sheet: 'base walls/walls_paint_earthy_stripes.png', col: 1, row: 0 },
  wall_stripes_earthy_3: { sheet: 'base walls/walls_paint_earthy_stripes.png', col: 2, row: 0 },
  wall_stripes_earthy_4: { sheet: 'base walls/walls_paint_earthy_stripes.png', col: 3, row: 0 },
  wall_stripes_earthy_5: { sheet: 'base walls/walls_paint_earthy_stripes.png', col: 0, row: 1 },
  wall_stripes_earthy_6: { sheet: 'base walls/walls_paint_earthy_stripes.png', col: 1, row: 1 },
  wall_stripes_earthy_7: { sheet: 'base walls/walls_paint_earthy_stripes.png', col: 2, row: 1 },
  wall_stripes_earthy_8: { sheet: 'base walls/walls_paint_earthy_stripes.png', col: 3, row: 1 },

  // Tinta listrada — clara (4×2)
  wall_stripes_bright_1: { sheet: 'base walls/walls_paint_bright_stripes.png', col: 0, row: 0 },
  wall_stripes_bright_2: { sheet: 'base walls/walls_paint_bright_stripes.png', col: 1, row: 0 },
  wall_stripes_bright_3: { sheet: 'base walls/walls_paint_bright_stripes.png', col: 2, row: 0 },
  wall_stripes_bright_4: { sheet: 'base walls/walls_paint_bright_stripes.png', col: 3, row: 0 },
  wall_stripes_bright_5: { sheet: 'base walls/walls_paint_bright_stripes.png', col: 0, row: 1 },
  wall_stripes_bright_6: { sheet: 'base walls/walls_paint_bright_stripes.png', col: 1, row: 1 },
  wall_stripes_bright_7: { sheet: 'base walls/walls_paint_bright_stripes.png', col: 2, row: 1 },
  wall_stripes_bright_8: { sheet: 'base walls/walls_paint_bright_stripes.png', col: 3, row: 1 },

  // Tinta listrada — cinza (4×2)
  wall_stripes_grey_1: { sheet: 'base walls/walls_paint_grey_stripes.png', col: 0, row: 0 },
  wall_stripes_grey_2: { sheet: 'base walls/walls_paint_grey_stripes.png', col: 1, row: 0 },
  wall_stripes_grey_3: { sheet: 'base walls/walls_paint_grey_stripes.png', col: 2, row: 0 },
  wall_stripes_grey_4: { sheet: 'base walls/walls_paint_grey_stripes.png', col: 3, row: 0 },
  wall_stripes_grey_5: { sheet: 'base walls/walls_paint_grey_stripes.png', col: 0, row: 1 },
  wall_stripes_grey_6: { sheet: 'base walls/walls_paint_grey_stripes.png', col: 1, row: 1 },
  wall_stripes_grey_7: { sheet: 'base walls/walls_paint_grey_stripes.png', col: 2, row: 1 },
  wall_stripes_grey_8: { sheet: 'base walls/walls_paint_grey_stripes.png', col: 3, row: 1 },

  // Tijolo (spritesheet(10) — 3×2)
  wall_brick_1: { sheet: 'base walls/spritesheet(10).png', col: 0, row: 0 },
  wall_brick_2: { sheet: 'base walls/spritesheet(10).png', col: 1, row: 0 },
  wall_brick_3: { sheet: 'base walls/spritesheet(10).png', col: 2, row: 0 },
  wall_brick_4: { sheet: 'base walls/spritesheet(10).png', col: 0, row: 1 },
  wall_brick_5: { sheet: 'base walls/spritesheet(10).png', col: 1, row: 1 },
  wall_brick_6: { sheet: 'base walls/spritesheet(10).png', col: 2, row: 1 },

  // Azulejo xadrez (spritesheet(11) — 5×3, 13 válidos)
  wall_tile_checker_1: { sheet: 'base walls/spritesheet(11).png', col: 0, row: 0 },
  wall_tile_checker_2: { sheet: 'base walls/spritesheet(11).png', col: 1, row: 0 },
  wall_tile_checker_3: { sheet: 'base walls/spritesheet(11).png', col: 2, row: 0 },
  wall_tile_checker_4: { sheet: 'base walls/spritesheet(11).png', col: 3, row: 0 },
  wall_tile_checker_5: { sheet: 'base walls/spritesheet(11).png', col: 4, row: 0 },
  wall_tile_checker_6: { sheet: 'base walls/spritesheet(11).png', col: 0, row: 1 },
  wall_tile_checker_7: { sheet: 'base walls/spritesheet(11).png', col: 1, row: 1 },
  wall_tile_checker_8: { sheet: 'base walls/spritesheet(11).png', col: 2, row: 1 },
  wall_tile_checker_9: { sheet: 'base walls/spritesheet(11).png', col: 3, row: 1 },
  wall_tile_checker_10: { sheet: 'base walls/spritesheet(11).png', col: 4, row: 1 },
  wall_tile_checker_11: { sheet: 'base walls/spritesheet(11).png', col: 0, row: 2 },
  wall_tile_checker_12: { sheet: 'base walls/spritesheet(11).png', col: 1, row: 2 },
  wall_tile_checker_13: { sheet: 'base walls/spritesheet(11).png', col: 2, row: 2 },

  // Pedras (spritesheet(12) — 5×2)
  wall_stone_1: { sheet: 'base walls/spritesheet(12).png', col: 0, row: 0 },
  wall_stone_2: { sheet: 'base walls/spritesheet(12).png', col: 1, row: 0 },
  wall_stone_3: { sheet: 'base walls/spritesheet(12).png', col: 2, row: 0 },
  wall_stone_4: { sheet: 'base walls/spritesheet(12).png', col: 3, row: 0 },
  wall_stone_5: { sheet: 'base walls/spritesheet(12).png', col: 4, row: 0 },
  wall_stone_6: { sheet: 'base walls/spritesheet(12).png', col: 0, row: 1 },
  wall_stone_7: { sheet: 'base walls/spritesheet(12).png', col: 1, row: 1 },
  wall_stone_8: { sheet: 'base walls/spritesheet(12).png', col: 2, row: 1 },
  wall_stone_9: { sheet: 'base walls/spritesheet(12).png', col: 3, row: 1 },
  wall_stone_10: { sheet: 'base walls/spritesheet(12).png', col: 4, row: 1 },

  // Madeira ornada (spritesheet(13) — 5×2)
  wall_wood_ornate_1: { sheet: 'base walls/spritesheet(13).png', col: 0, row: 0 },
  wall_wood_ornate_2: { sheet: 'base walls/spritesheet(13).png', col: 1, row: 0 },
  wall_wood_ornate_3: { sheet: 'base walls/spritesheet(13).png', col: 2, row: 0 },
  wall_wood_ornate_4: { sheet: 'base walls/spritesheet(13).png', col: 3, row: 0 },
  wall_wood_ornate_5: { sheet: 'base walls/spritesheet(13).png', col: 4, row: 0 },
  wall_wood_ornate_6: { sheet: 'base walls/spritesheet(13).png', col: 0, row: 1 },
  wall_wood_ornate_7: { sheet: 'base walls/spritesheet(13).png', col: 1, row: 1 },
  wall_wood_ornate_8: { sheet: 'base walls/spritesheet(13).png', col: 2, row: 1 },
  wall_wood_ornate_9: { sheet: 'base walls/spritesheet(13).png', col: 3, row: 1 },
  wall_wood_ornate_10: { sheet: 'base walls/spritesheet(13).png', col: 4, row: 1 },

  // Madeira simples (spritesheet(14) — 5×2)
  wall_wood_simple_1: { sheet: 'base walls/spritesheet(14).png', col: 0, row: 0 },
  wall_wood_simple_2: { sheet: 'base walls/spritesheet(14).png', col: 1, row: 0 },
  wall_wood_simple_3: { sheet: 'base walls/spritesheet(14).png', col: 2, row: 0 },
  wall_wood_simple_4: { sheet: 'base walls/spritesheet(14).png', col: 3, row: 0 },
  wall_wood_simple_5: { sheet: 'base walls/spritesheet(14).png', col: 4, row: 0 },
  wall_wood_simple_6: { sheet: 'base walls/spritesheet(14).png', col: 0, row: 1 },
  wall_wood_simple_7: { sheet: 'base walls/spritesheet(14).png', col: 1, row: 1 },
  wall_wood_simple_8: { sheet: 'base walls/spritesheet(14).png', col: 2, row: 1 },
  wall_wood_simple_9: { sheet: 'base walls/spritesheet(14).png', col: 3, row: 1 },
  wall_wood_simple_10: { sheet: 'base walls/spritesheet(14).png', col: 4, row: 1 },

  // ── WALLS — walls (tiles)/ ────────────────

  // Cutie azul (4×3)
  wall_cute_blue_1: { sheet: 'walls (tiles)/cutie blue pastels.png', col: 0, row: 0 },
  wall_cute_blue_2: { sheet: 'walls (tiles)/cutie blue pastels.png', col: 1, row: 0 },
  wall_cute_blue_3: { sheet: 'walls (tiles)/cutie blue pastels.png', col: 2, row: 0 },
  wall_cute_blue_4: { sheet: 'walls (tiles)/cutie blue pastels.png', col: 3, row: 0 },
  wall_cute_blue_5: { sheet: 'walls (tiles)/cutie blue pastels.png', col: 0, row: 1 },
  wall_cute_blue_6: { sheet: 'walls (tiles)/cutie blue pastels.png', col: 1, row: 1 },
  wall_cute_blue_7: { sheet: 'walls (tiles)/cutie blue pastels.png', col: 2, row: 1 },
  wall_cute_blue_8: { sheet: 'walls (tiles)/cutie blue pastels.png', col: 3, row: 1 },
  wall_cute_blue_9: { sheet: 'walls (tiles)/cutie blue pastels.png', col: 0, row: 2 },
  wall_cute_blue_10: { sheet: 'walls (tiles)/cutie blue pastels.png', col: 1, row: 2 },
  wall_cute_blue_11: { sheet: 'walls (tiles)/cutie blue pastels.png', col: 2, row: 2 },
  wall_cute_blue_12: { sheet: 'walls (tiles)/cutie blue pastels.png', col: 3, row: 2 },

  // Cutie verde (4×3)
  wall_cute_green_1: { sheet: 'walls (tiles)/cutie green pastels.png', col: 0, row: 0 },
  wall_cute_green_2: { sheet: 'walls (tiles)/cutie green pastels.png', col: 1, row: 0 },
  wall_cute_green_3: { sheet: 'walls (tiles)/cutie green pastels.png', col: 2, row: 0 },
  wall_cute_green_4: { sheet: 'walls (tiles)/cutie green pastels.png', col: 3, row: 0 },
  wall_cute_green_5: { sheet: 'walls (tiles)/cutie green pastels.png', col: 0, row: 1 },
  wall_cute_green_6: { sheet: 'walls (tiles)/cutie green pastels.png', col: 1, row: 1 },
  wall_cute_green_7: { sheet: 'walls (tiles)/cutie green pastels.png', col: 2, row: 1 },
  wall_cute_green_8: { sheet: 'walls (tiles)/cutie green pastels.png', col: 3, row: 1 },
  wall_cute_green_9: { sheet: 'walls (tiles)/cutie green pastels.png', col: 0, row: 2 },
  wall_cute_green_10: { sheet: 'walls (tiles)/cutie green pastels.png', col: 1, row: 2 },
  wall_cute_green_11: { sheet: 'walls (tiles)/cutie green pastels.png', col: 2, row: 2 },
  wall_cute_green_12: { sheet: 'walls (tiles)/cutie green pastels.png', col: 3, row: 2 },

  // Cutie laranja (4×3)
  wall_cute_orange_1: { sheet: 'walls (tiles)/cutie orange pastels.png', col: 0, row: 0 },
  wall_cute_orange_2: { sheet: 'walls (tiles)/cutie orange pastels.png', col: 1, row: 0 },
  wall_cute_orange_3: { sheet: 'walls (tiles)/cutie orange pastels.png', col: 2, row: 0 },
  wall_cute_orange_4: { sheet: 'walls (tiles)/cutie orange pastels.png', col: 3, row: 0 },
  wall_cute_orange_5: { sheet: 'walls (tiles)/cutie orange pastels.png', col: 0, row: 1 },
  wall_cute_orange_6: { sheet: 'walls (tiles)/cutie orange pastels.png', col: 1, row: 1 },
  wall_cute_orange_7: { sheet: 'walls (tiles)/cutie orange pastels.png', col: 2, row: 1 },
  wall_cute_orange_8: { sheet: 'walls (tiles)/cutie orange pastels.png', col: 3, row: 1 },
  wall_cute_orange_9: { sheet: 'walls (tiles)/cutie orange pastels.png', col: 0, row: 2 },
  wall_cute_orange_10: { sheet: 'walls (tiles)/cutie orange pastels.png', col: 1, row: 2 },
  wall_cute_orange_11: { sheet: 'walls (tiles)/cutie orange pastels.png', col: 2, row: 2 },
  wall_cute_orange_12: { sheet: 'walls (tiles)/cutie orange pastels.png', col: 3, row: 2 },

  // Cutie rosa (4×3)
  wall_cute_pink_1: { sheet: 'walls (tiles)/cutie pink pastels.png', col: 0, row: 0 },
  wall_cute_pink_2: { sheet: 'walls (tiles)/cutie pink pastels.png', col: 1, row: 0 },
  wall_cute_pink_3: { sheet: 'walls (tiles)/cutie pink pastels.png', col: 2, row: 0 },
  wall_cute_pink_4: { sheet: 'walls (tiles)/cutie pink pastels.png', col: 3, row: 0 },
  wall_cute_pink_5: { sheet: 'walls (tiles)/cutie pink pastels.png', col: 0, row: 1 },
  wall_cute_pink_6: { sheet: 'walls (tiles)/cutie pink pastels.png', col: 1, row: 1 },
  wall_cute_pink_7: { sheet: 'walls (tiles)/cutie pink pastels.png', col: 2, row: 1 },
  wall_cute_pink_8: { sheet: 'walls (tiles)/cutie pink pastels.png', col: 3, row: 1 },
  wall_cute_pink_9: { sheet: 'walls (tiles)/cutie pink pastels.png', col: 0, row: 2 },
  wall_cute_pink_10: { sheet: 'walls (tiles)/cutie pink pastels.png', col: 1, row: 2 },
  wall_cute_pink_11: { sheet: 'walls (tiles)/cutie pink pastels.png', col: 2, row: 2 },
  wall_cute_pink_12: { sheet: 'walls (tiles)/cutie pink pastels.png', col: 3, row: 2 },

  // Cutie violeta (4×3)
  wall_cute_violet_1: { sheet: 'walls (tiles)/cutie violet pastels.png', col: 0, row: 0 },
  wall_cute_violet_2: { sheet: 'walls (tiles)/cutie violet pastels.png', col: 1, row: 0 },
  wall_cute_violet_3: { sheet: 'walls (tiles)/cutie violet pastels.png', col: 2, row: 0 },
  wall_cute_violet_4: { sheet: 'walls (tiles)/cutie violet pastels.png', col: 3, row: 0 },
  wall_cute_violet_5: { sheet: 'walls (tiles)/cutie violet pastels.png', col: 0, row: 1 },
  wall_cute_violet_6: { sheet: 'walls (tiles)/cutie violet pastels.png', col: 1, row: 1 },
  wall_cute_violet_7: { sheet: 'walls (tiles)/cutie violet pastels.png', col: 2, row: 1 },
  wall_cute_violet_8: { sheet: 'walls (tiles)/cutie violet pastels.png', col: 3, row: 1 },
  wall_cute_violet_9: { sheet: 'walls (tiles)/cutie violet pastels.png', col: 0, row: 2 },
  wall_cute_violet_10: { sheet: 'walls (tiles)/cutie violet pastels.png', col: 1, row: 2 },
  wall_cute_violet_11: { sheet: 'walls (tiles)/cutie violet pastels.png', col: 2, row: 2 },
  wall_cute_violet_12: { sheet: 'walls (tiles)/cutie violet pastels.png', col: 3, row: 2 },

  // ── BACKGROUNDS ───────────────────────────
  bg_sky: { sheet: 'bg_sky', col: 0, row: 0 }, // item default
  bg_forest: { sheet: 'bg_forest', col: 0, row: 0 },
  bg_night: { sheet: 'bg_night', col: 0, row: 0 },
  bg_sunset: { sheet: 'bg_sunset', col: 0, row: 0 },
  bg_indoor: { sheet: 'bg_indoor', col: 0, row: 0 },
}

// ─────────────────────────────────────────────
// CATÁLOGO DA LOJA — itens da casinha
// Roupas não ficam aqui — a loja busca direto do ALL_PIECES (index.ts)
// filtrando cost > 0 e free === false.
// ─────────────────────────────────────────────

export const SHOP_HOUSE_ITEMS: ShopItem[] = [
  // ── PISOS — comuns ──────────────────────

  { id: 'floor_bw_1', label: 'P&B 1', category: 'floor', tier: 'common', cost: 60 },
  { id: 'floor_bw_2', label: 'P&B 2', category: 'floor', tier: 'common', cost: 60 },
  { id: 'floor_bw_3', label: 'P&B 3', category: 'floor', tier: 'common', cost: 60 },
  { id: 'floor_bw_4', label: 'P&B 4', category: 'floor', tier: 'common', cost: 60 },
  { id: 'floor_bw_5', label: 'P&B 5', category: 'floor', tier: 'common', cost: 60 },
  { id: 'floor_bw_6', label: 'P&B 6', category: 'floor', tier: 'common', cost: 60 },
  { id: 'floor_bw_7', label: 'P&B 7', category: 'floor', tier: 'common', cost: 60 },
  { id: 'floor_bw_8', label: 'P&B 8', category: 'floor', tier: 'common', cost: 60 },
  { id: 'floor_bw_9', label: 'P&B 9', category: 'floor', tier: 'common', cost: 60 },
  { id: 'floor_bw_10', label: 'P&B 10', category: 'floor', tier: 'common', cost: 60 },
  { id: 'floor_bw_11', label: 'P&B 11', category: 'floor', tier: 'common', cost: 60 },
  { id: 'floor_bw_12', label: 'P&B 12', category: 'floor', tier: 'common', cost: 60 },

  { id: 'floor_carpet_pink', label: 'Carpete 1', category: 'floor', tier: 'common', cost: 70 },
  { id: 'floor_carpet_blue', label: 'Carpete 2', category: 'floor', tier: 'common', cost: 70 },
  { id: 'floor_carpet_green', label: 'Carpete 3', category: 'floor', tier: 'common', cost: 70 },
  { id: 'floor_carpet_yellow', label: 'Carpete 4', category: 'floor', tier: 'common', cost: 70 },
  { id: 'floor_carpet_purple', label: 'Carpete 5', category: 'floor', tier: 'common', cost: 70 },
  { id: 'floor_carpet_red', label: 'Carpete 6', category: 'floor', tier: 'common', cost: 70 },
  { id: 'floor_carpet_orange', label: 'Carpete 7', category: 'floor', tier: 'common', cost: 70 },
  { id: 'floor_carpet_teal', label: 'Carpete 8', category: 'floor', tier: 'common', cost: 70 },
  { id: 'floor_carpet_brown', label: 'Carpete 9', category: 'floor', tier: 'common', cost: 70 },
  { id: 'floor_carpet_grey', label: 'Carpete 10', category: 'floor', tier: 'common', cost: 70 },
  { id: 'floor_carpet_beige', label: 'Carpete 11', category: 'floor', tier: 'common', cost: 70 },
  { id: 'floor_carpet_mint', label: 'Carpete 12', category: 'floor', tier: 'common', cost: 70 },
  { id: 'floor_carpet_lilac', label: 'Carpete 13', category: 'floor', tier: 'common', cost: 70 },

  { id: 'floor_checker_1', label: 'Xadrez 1', category: 'floor', tier: 'common', cost: 70 },
  { id: 'floor_checker_2', label: 'Xadrez 2', category: 'floor', tier: 'common', cost: 70 },
  { id: 'floor_checker_3', label: 'Xadrez 3', category: 'floor', tier: 'common', cost: 70 },
  { id: 'floor_checker_4', label: 'Xadrez 4', category: 'floor', tier: 'common', cost: 70 },
  { id: 'floor_checker_5', label: 'Xadrez 5', category: 'floor', tier: 'common', cost: 70 },
  { id: 'floor_checker_6', label: 'Xadrez 6', category: 'floor', tier: 'common', cost: 70 },
  { id: 'floor_checker_7', label: 'Xadrez 7', category: 'floor', tier: 'common', cost: 70 },
  { id: 'floor_checker_8', label: 'Xadrez 8', category: 'floor', tier: 'common', cost: 70 },
  { id: 'floor_checker_9', label: 'Xadrez 9', category: 'floor', tier: 'common', cost: 70 },
  { id: 'floor_checker_10', label: 'Xadrez 10', category: 'floor', tier: 'common', cost: 70 },
  { id: 'floor_checker_11', label: 'Xadrez 11', category: 'floor', tier: 'common', cost: 70 },
  { id: 'floor_checker_12', label: 'Xadrez 12', category: 'floor', tier: 'common', cost: 70 },
  { id: 'floor_checker_13', label: 'Xadrez 13', category: 'floor', tier: 'common', cost: 70 },
  { id: 'floor_checker_14', label: 'Xadrez 14', category: 'floor', tier: 'common', cost: 70 },
  { id: 'floor_checker_15', label: 'Xadrez 15', category: 'floor', tier: 'common', cost: 70 },

  { id: 'floor_cobble_1', label: 'Pedra 1', category: 'floor', tier: 'basic', cost: 50 },
  { id: 'floor_cobble_2', label: 'Pedra 2', category: 'floor', tier: 'basic', cost: 50 },
  { id: 'floor_cobble_3', label: 'Pedra 3', category: 'floor', tier: 'basic', cost: 50 },
  { id: 'floor_cobble_4', label: 'Pedra 4', category: 'floor', tier: 'basic', cost: 50 },

  { id: 'floor_pebble_1', label: 'Seixo 1', category: 'floor', tier: 'basic', cost: 50 },
  { id: 'floor_pebble_2', label: 'Seixo 2', category: 'floor', tier: 'basic', cost: 50 },
  { id: 'floor_pebble_3', label: 'Seixo 3', category: 'floor', tier: 'basic', cost: 50 },
  { id: 'floor_pebble_4', label: 'Seixo 4', category: 'floor', tier: 'basic', cost: 50 },

  ...Array.from({ length: 24 }, (_, i) => ({
    id: `floor_stone_${i + 1}` as string,
    label: `Pedra ${i + 1}`,
    category: 'floor' as ShopCategory,
    tier: 'basic' as ShopItemTier,
    cost: 50,
  })),

  ...Array.from({ length: 8 }, (_, i) => ({
    id: `floor_wood_${i + 1}` as string,
    label: `Madeira ${i + 1}`,
    category: 'floor' as ShopCategory,
    tier: 'basic' as ShopItemTier,
    cost: 50,
  })),

  // ── PISOS — Cute Decor ✦ ────────────────

  ...(['blue', 'green', 'orange', 'pink', 'violet'] as const).flatMap((color, ci) =>
    Array.from({ length: 6 }, (_, i) => ({
      id: `floor_cute_${color}_${i + 1}` as string,
      label: `Cute Decor ${i + 1 + ci * 6}`,
      category: 'floor' as ShopCategory,
      tier: 'special' as ShopItemTier,
      cost: 90,
    }))
  ),

  // ── PAREDES — comuns ────────────────────

  { id: 'wall_paint_pastel_1', label: 'Tinta lisa 1', category: 'wall', tier: 'basic', cost: 80 },
  { id: 'wall_paint_pastel_2', label: 'Tinta lisa 2', category: 'wall', tier: 'basic', cost: 80 },
  { id: 'wall_paint_pastel_3', label: 'Tinta lisa 3', category: 'wall', tier: 'basic', cost: 80 },
  { id: 'wall_paint_pastel_4', label: 'Tinta lisa 4', category: 'wall', tier: 'basic', cost: 80 },
  { id: 'wall_paint_pastel_5', label: 'Tinta lisa 5', category: 'wall', tier: 'basic', cost: 80 },
  { id: 'wall_paint_pastel_6', label: 'Tinta lisa 6', category: 'wall', tier: 'basic', cost: 80 },
  { id: 'wall_paint_pastel_7', label: 'Tinta lisa 7', category: 'wall', tier: 'basic', cost: 80 },
  { id: 'wall_paint_pastel_8', label: 'Tinta lisa 8', category: 'wall', tier: 'basic', cost: 80 },

  ...(['earthy', 'bright', 'grey'] as const).flatMap((group, gi) =>
    Array.from({ length: 8 }, (_, i) => ({
      id: `wall_paint_${group}_${i + 1}` as string,
      label: `Tinta lisa ${i + 1 + 8 + gi * 8}`,
      category: 'wall' as ShopCategory,
      tier: 'basic' as ShopItemTier,
      cost: 80,
    }))
  ),

  ...(['pastel', 'earthy', 'bright', 'grey'] as const).flatMap((group, gi) =>
    Array.from({ length: 8 }, (_, i) => ({
      id: `wall_stripes_${group}_${i + 1}` as string,
      label: `Tinta listrada ${i + 1 + gi * 8}`,
      category: 'wall' as ShopCategory,
      tier: 'common' as ShopItemTier,
      cost: 100,
    }))
  ),

  ...Array.from({ length: 6 }, (_, i) => ({
    id: `wall_brick_${i + 1}` as string,
    label: `Tijolo ${i + 1}`,
    category: 'wall' as ShopCategory,
    tier: 'common' as ShopItemTier,
    cost: 100,
  })),

  ...Array.from({ length: 13 }, (_, i) => ({
    id: `wall_tile_checker_${i + 1}` as string,
    label: `Azulejo xadrez ${i + 1}`,
    category: 'wall' as ShopCategory,
    tier: 'common' as ShopItemTier,
    cost: 100,
  })),

  ...Array.from({ length: 10 }, (_, i) => ({
    id: `wall_stone_${i + 1}` as string,
    label: `Pedra ${i + 1}`,
    category: 'wall' as ShopCategory,
    tier: 'common' as ShopItemTier,
    cost: 100,
  })),

  ...Array.from({ length: 10 }, (_, i) => ({
    id: `wall_wood_ornate_${i + 1}` as string,
    label: `Madeira ornada ${i + 1}`,
    category: 'wall' as ShopCategory,
    tier: 'common' as ShopItemTier,
    cost: 100,
  })),

  ...Array.from({ length: 10 }, (_, i) => ({
    id: `wall_wood_simple_${i + 1}` as string,
    label: `Madeira simples ${i + 1}`,
    category: 'wall' as ShopCategory,
    tier: 'basic' as ShopItemTier,
    cost: 80,
  })),

  // ── PAREDES — Cute Decor ✦ ──────────────

  ...(['blue', 'green', 'orange', 'pink', 'violet'] as const).flatMap((color, ci) =>
    Array.from({ length: 12 }, (_, i) => ({
      id: `wall_cute_${color}_${i + 1}` as string,
      label: `Cute Decor ${i + 1 + ci * 12}`,
      category: 'wall' as ShopCategory,
      tier: 'special' as ShopItemTier,
      cost: 120,
    }))
  ),

  // ── FUNDOS ──────────────────────────────

  { id: 'bg_forest', label: 'Floresta', category: 'background', tier: 'common', cost: 50 },
  { id: 'bg_night', label: 'Noturno', category: 'background', tier: 'common', cost: 50 },
  { id: 'bg_sunset', label: 'Pôr do sol', category: 'background', tier: 'special', cost: 70 },
  { id: 'bg_sunset2', label: 'Pôr do sol 2', category: 'background', tier: 'special', cost: 70 },
  { id: 'bg_mist', label: 'Névoa', category: 'background', tier: 'special', cost: 70 },
  { id: 'bg_garden', label: 'Jardim', category: 'background', tier: 'special', cost: 70 },
  { id: 'bg_indoor', label: 'Interior', category: 'background', tier: 'common', cost: 50 },
  { id: 'bg_dark', label: 'Noturno escuro', category: 'background', tier: 'special', cost: 70 },
]

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

/** Retorna o ShopItem da casinha pelo id, ou undefined */
export function getHouseShopItem(id: string): ShopItem | undefined {
  return SHOP_HOUSE_ITEMS.find((item) => item.id === id)
}

/** Retorna o tile ref de um item de casinha pelo id */
export function getHouseTileRef(id: string): HouseTileRef | undefined {
  return HOUSE_TILE_MAP[id]
}

/** Verifica se um item é desbloqueado por padrão (sem compra) */
export function isDefaultUnlocked(id: string): boolean {
  return DEFAULT_HOUSE_UNLOCKED.includes(id) || DEFAULT_CHARACTER_UNLOCKED.includes(id)
}

/**
 * Aplica desconto ao custo de um item.
 * Retorna o custo final arredondado para múltiplo de 5.
 */
export function getDiscountedCost(item: ShopItem): number {
  if (!item.discount) return item.cost
  const discounted = item.cost * (1 - item.discount / 100)
  return Math.round(discounted / 5) * 5
}

/**
 * Verifica se um item está disponível hoje (baseado em availableDays).
 * Undefined = sempre disponível.
 */
export function isAvailableToday(item: ShopItem): boolean {
  if (!item.availableDays) return true
  const today = new Date().getDay() // 0=dom, 6=sáb
  return item.availableDays.includes(today)
}
