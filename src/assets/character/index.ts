// ─────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────

// Categorias com slot ÚNICO — clicar em outro troca o atual
export type CharacterCategorySingle =
  | 'body'
  | 'hair'
  | 'bangs'
  | 'eyebrows'
  | 'eyelashes'
  | 'mouth'
  | 'pupils'
  | 'top'
  | 'bottom'
  | 'dress'
  | 'shoes'

// Categorias com slot MÚLTIPLO — empilháveis, toggle on/off
export type CharacterCategoryMulti =
  | 'hair_back' // múltiplos estilos de cabelo atrás
  | 'hair_bonus' // enfeites de cabelo
  | 'gloves' // luvas
  | 'beard' // barba / face decor
  | 'accessory' // brinco, anel, colar, óculos, jaqueta...
  | 'tattoo' // tatuagens
// ── futuro (assets ainda não existem) ──
// | 'socks'     -- meias empilháveis
// | 'belt'      -- cintos empilháveis
// | 'necklace'  -- colares empilháveis (hoje em accessory)
// | 'face_decor'-- sardas, blush, sombra, barba decorativa
// | 'decor'     -- decorações gerais

export type CharacterCategory = CharacterCategorySingle | CharacterCategoryMulti

export type CharacterPack =
  | 'chibi-basics'
  | 'masc-misc'
  | 'power-couples-1'
  | 'power-couples-2'
  | 'summer'

export type CharacterGender = 'fem' | 'masc' | 'neutral'

/** Quais categorias são de slot múltiplo */
export const MULTI_SLOT_CATEGORIES: CharacterCategoryMulti[] = [
  'hair_back',
  'hair_bonus',
  'gloves',
  'beard',
  'accessory',
  'tattoo',
]

export function isMultiSlot(category: CharacterCategory): category is CharacterCategoryMulti {
  return (MULTI_SLOT_CATEGORIES as string[]).includes(category)
}

export interface CharacterPiece {
  id: string
  category: CharacterCategory
  pack: CharacterPack
  gender: CharacterGender
  /** Caminho relativo a src/assets/character/ */
  src: string
  /** Versão colorida disponível */
  hasColor: boolean
  /** Caminho da versão colorida (se hasColor = true) */
  srcColor?: string
  /** Item gratuito na criação do personagem */
  free: boolean
  /** Custo em moedas (se free = false) */
  cost?: number
  /** Label exibido na UI */
  label: string
}

export interface CharacterConfig {
  // Slots únicos — string | null
  body: string | null
  hair: string | null
  bangs: string | null
  eyebrows: string | null
  eyelashes: string | null
  mouth: string | null
  pupils: string | null
  top: string | null
  bottom: string | null
  dress: string | null
  shoes: string | null
  // Slots múltiplos — Set de IDs (string[] no Firebase)
  hair_back: string[]
  hair_bonus: string[]
  gloves: string[]
  beard: string[]
  accessory: string[]
  tattoo: string[]
  /** IDs das peças que estão na versão colorida */
  colorVariants: Record<string, boolean>
}

export const DEFAULT_CHARACTER_CONFIG: CharacterConfig = {
  // únicos
  body: null,
  hair: null,
  bangs: null,
  eyebrows: null,
  eyelashes: null,
  mouth: null,
  pupils: null,
  top: null,
  bottom: null,
  dress: null,
  shoes: null,
  // múltiplos
  hair_back: [],
  hair_bonus: [],
  gloves: [],
  beard: [],
  accessory: [],
  tattoo: [],
  colorVariants: {},
}

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

function piece(
  id: string,
  category: CharacterCategory,
  pack: CharacterPack,
  gender: CharacterGender,
  src: string,
  label: string,
  colorSrc?: string,
  free = false,
  cost?: number
): CharacterPiece {
  return {
    id,
    category,
    pack,
    gender,
    src,
    hasColor: !!colorSrc,
    srcColor: colorSrc,
    free,
    cost,
    label,
  }
}

// Caminho base por pack
const B = 'chibi-basics' // chibi-character-basics-reworked/
const M = 'masc-misc' // 9-masc_misc/
const P1 = 'power-couples-1' // 14_power couples/1/
const P2 = 'power-couples-2' // 14_power couples/2/
const S = 'summer' // summer/color assets/

// ─────────────────────────────────────────────
// CHIBI BASICS — BODY
// ─────────────────────────────────────────────
// Corpos 1–29 (tons de pele) + peças de corpo soltas
// Sem versão color separada — cada número já é uma cor de pele

export const BODIES: CharacterPiece[] = [
  // Tons de pele claros (rosa/bege)
  piece('body-b-1', 'body', B, 'neutral', 'chibi-basics/body/1.png', 'Pele 1', undefined, true),
  piece('body-b-2', 'body', B, 'neutral', 'chibi-basics/body/2.png', 'Pele 2', undefined, true),
  piece('body-b-3', 'body', B, 'neutral', 'chibi-basics/body/3.png', 'Pele 3', undefined, true),
  piece('body-b-4', 'body', B, 'neutral', 'chibi-basics/body/4.png', 'Pele 4', undefined, true),
  piece('body-b-5', 'body', B, 'neutral', 'chibi-basics/body/5.png', 'Pele 5', undefined, true),
  // Tons médios (oliva/marrom claro)
  piece('body-b-6', 'body', B, 'neutral', 'chibi-basics/body/6.png', 'Pele 6', undefined, true),
  piece('body-b-7', 'body', B, 'neutral', 'chibi-basics/body/7.png', 'Pele 7', undefined, true),
  piece('body-b-8', 'body', B, 'neutral', 'chibi-basics/body/8.png', 'Pele 8', undefined, true),
  piece('body-b-9', 'body', B, 'neutral', 'chibi-basics/body/9.png', 'Pele 9', undefined, true),
  piece('body-b-10', 'body', B, 'neutral', 'chibi-basics/body/10.png', 'Pele 10', undefined, true),
  piece('body-b-11', 'body', B, 'neutral', 'chibi-basics/body/11.png', 'Pele 11', undefined, true),
  piece('body-b-12', 'body', B, 'neutral', 'chibi-basics/body/12.png', 'Pele 12', undefined, true),
  // Tons escuros
  piece('body-b-13', 'body', B, 'neutral', 'chibi-basics/body/13.png', 'Pele 13', undefined, true),
  piece('body-b-14', 'body', B, 'neutral', 'chibi-basics/body/14.png', 'Pele 14', undefined, true),
  piece('body-b-15', 'body', B, 'neutral', 'chibi-basics/body/15.png', 'Pele 15', undefined, true),
  piece('body-b-16', 'body', B, 'neutral', 'chibi-basics/body/16.png', 'Pele 16', undefined, true),
  piece('body-b-17', 'body', B, 'neutral', 'chibi-basics/body/17.png', 'Pele 17', undefined, true),
  // Tons especiais (branco, cinza, preto, vibrantes)
  piece(
    'body-b-18',
    'body',
    B,
    'neutral',
    'chibi-basics/body/18.png',
    'Branco',
    undefined,
    false,
    30
  ),
  piece(
    'body-b-19',
    'body',
    B,
    'neutral',
    'chibi-basics/body/19.png',
    'Cinza',
    undefined,
    false,
    30
  ),
  piece(
    'body-b-20',
    'body',
    B,
    'neutral',
    'chibi-basics/body/20.png',
    'Preto',
    undefined,
    false,
    30
  ),
  piece(
    'body-b-21',
    'body',
    B,
    'neutral',
    'chibi-basics/body/21.png',
    'Rosa',
    undefined,
    false,
    30
  ),
  piece(
    'body-b-22',
    'body',
    B,
    'neutral',
    'chibi-basics/body/22.png',
    'Laranja',
    undefined,
    false,
    30
  ),
  piece(
    'body-b-23',
    'body',
    B,
    'neutral',
    'chibi-basics/body/23.png',
    'Amarelo',
    undefined,
    false,
    30
  ),
  piece(
    'body-b-24',
    'body',
    B,
    'neutral',
    'chibi-basics/body/24.png',
    'Verde',
    undefined,
    false,
    30
  ),
  piece(
    'body-b-25',
    'body',
    B,
    'neutral',
    'chibi-basics/body/25.png',
    'Ciano',
    undefined,
    false,
    30
  ),
  piece(
    'body-b-26',
    'body',
    B,
    'neutral',
    'chibi-basics/body/26.png',
    'Azul',
    undefined,
    false,
    30
  ),
  piece(
    'body-b-27',
    'body',
    B,
    'neutral',
    'chibi-basics/body/27.png',
    'Roxo',
    undefined,
    false,
    30
  ),
  piece(
    'body-b-28',
    'body',
    B,
    'neutral',
    'chibi-basics/body/28.png',
    'Lilás',
    undefined,
    false,
    30
  ),
  piece(
    'body-b-29',
    'body',
    B,
    'neutral',
    'chibi-basics/body/29.png',
    'Rosa claro',
    undefined,
    false,
    30
  ),
  // Corpos masc (masc-misc)
  piece('body-m-1', 'body', M, 'masc', 'masc-misc/9-body1.png', 'Corpo masc 1', undefined, true),
  piece('body-m-2', 'body', M, 'masc', 'masc-misc/9-body2.png', 'Corpo masc 2', undefined, true),
  piece('body-m-3', 'body', M, 'masc', 'masc-misc/9-body3.png', 'Corpo masc 3', undefined, true),
]

// ─────────────────────────────────────────────
// CHIBI BASICS — HAIR (franja frontal)
// ─────────────────────────────────────────────
// 12 estilos bw, cada um com 8 cores (b/c/d/e/f/g/h)

export const HAIR: CharacterPiece[] = Array.from({ length: 12 }, (_, i) => {
  const n = i + 1
  return piece(
    `hair-b-${n}`,
    'hair',
    B,
    'neutral',
    `chibi-basics/hair/${n}.png`,
    `Cabelo ${n}`,
    `chibi-basics/hair/COLOR/${n}.png`,
    n <= 3, // primeiros 3 gratuitos
    n > 3 ? 40 : undefined
  )
})

// Versões coloridas extras (b/c/d/e/f/g/h) — tratadas como variantes de cor no CharacterConfig
// Não entram como peças separadas, são acessadas via srcColor com sufixo

// Cabelos masc (masc-misc) — 9 estilos
export const HAIR_MASC: CharacterPiece[] = [
  piece(
    'hair-m-lisses',
    'hair',
    M,
    'masc',
    'masc-misc/9-hair-lisses(bw).png',
    'Liso',
    'masc-misc/9-hair-lisses(color).png',
    false,
    50
  ),
  piece(
    'hair-m-piques',
    'hair',
    M,
    'masc',
    'masc-misc/9-hair-piques(bw).png',
    'Espetado',
    'masc-misc/9-hair-piques(color).png',
    false,
    50
  ),
  piece(
    'hair-m-short1',
    'hair',
    M,
    'masc',
    'masc-misc/9-hair-short1(bw).png',
    'Curto 1',
    'masc-misc/9-hair-short1(color).png',
    true
  ),
  piece(
    'hair-m-shortwavy',
    'hair',
    M,
    'masc',
    'masc-misc/9-hair-short-wavy(bw).png',
    'Ondulado curto',
    'masc-misc/9-hair-short-wavy(color).png',
    false,
    50
  ),
  piece(
    'hair-m-marcel1',
    'hair',
    M,
    'masc',
    'masc-misc/9-marcel1.png',
    'Marcel 1',
    undefined,
    false,
    50
  ),
  piece(
    'hair-m-marcel2',
    'hair',
    M,
    'masc',
    'masc-misc/9-marcel2.png',
    'Marcel 2',
    undefined,
    false,
    50
  ),
]

// ─────────────────────────────────────────────
// CHIBI BASICS — HAIR BACK (parte de trás)
// ─────────────────────────────────────────────

export const HAIR_BACK: CharacterPiece[] = Array.from({ length: 12 }, (_, i) => {
  const n = i + 1
  return piece(
    `hair-back-b-${n}`,
    'hair_back',
    B,
    'neutral',
    `chibi-basics/hair_back/${n}.png`,
    `Cabelo trás ${n}`,
    `chibi-basics/hair_back/COLOR/${n}.png`,
    n <= 3,
    n > 3 ? 40 : undefined
  )
})

// ─────────────────────────────────────────────
// CHIBI BASICS — HAIR BONUS (acessórios de cabelo)
// ─────────────────────────────────────────────

export const HAIR_BONUS: CharacterPiece[] = Array.from({ length: 5 }, (_, i) => {
  const n = i + 1
  return piece(
    `hair-bonus-b-${n}`,
    'hair_bonus',
    B,
    'neutral',
    `chibi-basics/hair_bonus/${n}.png`,
    `Enfeite cabelo ${n}`,
    `chibi-basics/hair_bonus/COLOR/${n}.png`,
    false,
    30
  )
})

// ─────────────────────────────────────────────
// CHIBI BASICS — BANGS (franja)
// ─────────────────────────────────────────────
// masc-misc também tem bangs

export const BANGS: CharacterPiece[] = [
  ...Array.from({ length: 13 }, (_, i) => {
    const n = i + 1
    return piece(
      `bangs-b-${n}`,
      'bangs',
      B,
      'neutral',
      `chibi-basics/bangs/${n}.png`,
      `Franja ${n}`,
      `chibi-basics/bangs/COLOR/${n}.png`,
      n <= 2,
      n > 2 ? 30 : undefined
    )
  }),
  // masc bangs
  piece(
    'bangs-m-bananas',
    'bangs',
    M,
    'masc',
    'masc-misc/9-bangs-bananas(bw).png',
    'Bananas',
    'masc-misc/9-bangs-bananas(color).png',
    false,
    40
  ),
  piece(
    'bangs-m-longs',
    'bangs',
    M,
    'masc',
    'masc-misc/9-bangs-longs(bw).png',
    'Longa',
    'masc-misc/9-bangs-longs(color).png',
    false,
    40
  ),
  piece(
    'bangs-m-longwavy',
    'bangs',
    M,
    'masc',
    'masc-misc/9-bangs-longswavy(bw).png',
    'Longa ondulada',
    'masc-misc/9-bangs-longswavy(color).png',
    false,
    40
  ),
  piece(
    'bangs-m-pics',
    'bangs',
    M,
    'masc',
    'masc-misc/9-bangs-pics(bw).png',
    'Pontuda',
    'masc-misc/9-bangs-pics(color).png',
    false,
    40
  ),
  piece(
    'bangs-m-wolf',
    'bangs',
    M,
    'masc',
    'masc-misc/9-bangs-wolf(bw).png',
    'Wolf',
    'masc-misc/9-bangs-wolf(color).png',
    false,
    40
  ),
]

// ─────────────────────────────────────────────
// CHIBI BASICS — FACE (boca, sobrancelhas, cílios, pupilas)
// Sem versão color — são elementos de linha
// ─────────────────────────────────────────────

// MOUTH — precisamos ver quantos tem; vamos deixar placeholder range
// (ajustar o número depois de contar os arquivos)
export const MOUTH: CharacterPiece[] = Array.from({ length: 10 }, (_, i) => {
  const n = i + 1
  return piece(
    `mouth-b-${n}`,
    'mouth',
    B,
    'neutral',
    `chibi-basics/MOUTH/${n}.png`,
    `Boca ${n}`,
    undefined,
    n <= 3,
    n > 3 ? 20 : undefined
  )
})

export const EYEBROWS: CharacterPiece[] = Array.from({ length: 8 }, (_, i) => {
  const n = i + 1
  return piece(
    `eyebrow-b-${n}`,
    'eyebrows',
    B,
    'neutral',
    `chibi-basics/EYEBROWS/${n}.png`,
    `Sobrancelha ${n}`,
    undefined,
    n <= 2,
    n > 2 ? 20 : undefined
  )
})

export const EYELASHES: CharacterPiece[] = Array.from({ length: 6 }, (_, i) => {
  const n = i + 1
  return piece(
    `eyelash-b-${n}`,
    'eyelashes',
    B,
    'neutral',
    `chibi-basics/EYELASHES/${n}.png`,
    `Cílios ${n}`,
    undefined,
    n <= 2,
    n > 2 ? 20 : undefined
  )
})

export const PUPILS: CharacterPiece[] = Array.from({ length: 8 }, (_, i) => {
  const n = i + 1
  return piece(
    `pupil-b-${n}`,
    'pupils',
    B,
    'neutral',
    `chibi-basics/PUPILS/${n}.png`,
    `Pupila ${n}`,
    undefined,
    n <= 2,
    n > 2 ? 20 : undefined
  )
})

// ─────────────────────────────────────────────
// CHIBI BASICS — BEARD
// ─────────────────────────────────────────────

export const BEARD: CharacterPiece[] = Array.from({ length: 6 }, (_, i) => {
  const n = i + 1
  return piece(
    `beard-b-${n}`,
    'beard',
    B,
    'masc',
    `chibi-basics/BEARD/${n}.png`,
    `Barba ${n}`,
    undefined,
    false,
    30
  )
})

// ─────────────────────────────────────────────
// CHIBI BASICS — TOP
// ─────────────────────────────────────────────

export const TOPS: CharacterPiece[] = [
  // chibi-basics: 12 estilos
  ...Array.from({ length: 12 }, (_, i) => {
    const n = i + 1
    return piece(
      `top-b-${n}`,
      'top',
      B,
      'neutral',
      `chibi-basics/top/${n}.png`,
      `Top ${n}`,
      `chibi-basics/top/colors/${n}.png`,
      n === 1,
      n > 1 ? 50 : undefined
    )
  }),
  // masc-misc tops
  piece(
    'top-m-blouson',
    'top',
    M,
    'masc',
    'masc-misc/9-top-blouson-shirt(bw).png',
    'Blouson',
    'masc-misc/9-top-blouson-shirt(color).png',
    false,
    60
  ),
  piece(
    'top-m-chemise1',
    'top',
    M,
    'masc',
    'masc-misc/9-top-chemise1.png',
    'Camisa 1',
    undefined,
    false,
    60
  ),
  piece(
    'top-m-chemise2',
    'top',
    M,
    'masc',
    'masc-misc/9-top-chemise2.png',
    'Camisa 2',
    undefined,
    false,
    60
  ),
  piece(
    'top-m-chemise3',
    'top',
    M,
    'masc',
    'masc-misc/9-top-chemise3.png',
    'Camisa 3',
    undefined,
    false,
    60
  ),
  piece(
    'top-m-kpop',
    'top',
    M,
    'masc',
    'masc-misc/9-top-Kpop-suit(bw).png',
    'Kpop suit',
    'masc-misc/9-top-Kpop-suit(color).png',
    false,
    80
  ),
  piece(
    'top-m-polo',
    'top',
    M,
    'masc',
    'masc-misc/9-top-polo(bw).png',
    'Polo',
    'masc-misc/9-top-polo(color).png',
    false,
    60
  ),
  piece(
    'top-m-pullshirt',
    'top',
    M,
    'masc',
    'masc-misc/9-top-pull-and-shirt(bw).png',
    'Pull + camisa',
    'masc-misc/9-top-pull-and-shirt(color).png',
    false,
    60
  ),
  piece(
    'top-m-royalcape',
    'top',
    M,
    'masc',
    'masc-misc/9-top-royalcape-top(bw).png',
    'Capa real',
    'masc-misc/9-top-royalcape-top(color).png',
    false,
    100
  ),
  piece(
    'top-m-royalback',
    'top',
    M,
    'masc',
    'masc-misc/9-top-royalcape-back(bw).png',
    'Capa real (costas)',
    'masc-misc/9-top-royalcape-back(color).png',
    false,
    100
  ),
  piece(
    'top-m-royalprince',
    'top',
    M,
    'masc',
    'masc-misc/9-top-royal-prince(bw).png',
    'Príncipe',
    'masc-misc/9-top-royal-prince(color).png',
    false,
    100
  ),
  piece(
    'top-m-sweatshirt',
    'top',
    M,
    'masc',
    'masc-misc/9-top-sweatshirt(bw).png',
    'Moletom',
    'masc-misc/9-top-sweatshirt(color).png',
    false,
    60
  ),
  piece(
    'top-m-timber',
    'top',
    M,
    'masc',
    'masc-misc/9-top-timber(bw).png',
    'Timber',
    'masc-misc/9-top-timber(color).png',
    false,
    60
  ),
  piece(
    'top-m-tshirt',
    'top',
    M,
    'masc',
    'masc-misc/9-top-tshirt(bw).png',
    'Camiseta',
    'masc-misc/9-top-tshirt(color).png',
    true
  ),
  piece(
    'top-m-tshirtXXL',
    'top',
    M,
    'masc',
    'masc-misc/9-top-tshirtXXL(bw).png',
    'Camiseta oversized',
    'masc-misc/9-top-tshirtXXL(color).png',
    false,
    60
  ),
  // power couples 1
  piece(
    'top-p1',
    'top',
    P1,
    'neutral',
    'power-couples-1/top.png',
    'Conjunto 1',
    undefined,
    false,
    80
  ),
  // power couples 2
  piece(
    'top-p2',
    'top',
    P2,
    'neutral',
    'power-couples-2/top.png',
    'Camisa casal',
    undefined,
    false,
    80
  ),
  piece(
    'top-p2-shirt',
    'top',
    P2,
    'neutral',
    'power-couples-2/shirt.png',
    'Camisa 2',
    undefined,
    false,
    80
  ),
  // summer tops
  piece(
    'top-s-1',
    'top',
    S,
    'fem',
    'summer/color assets/top1.png',
    'Verão top 1',
    undefined,
    false,
    50
  ),
  piece(
    'top-s-2',
    'top',
    S,
    'fem',
    'summer/color assets/top2.png',
    'Verão top 2',
    undefined,
    false,
    50
  ),
  piece(
    'top-s-3',
    'top',
    S,
    'fem',
    'summer/color assets/top3.png',
    'Verão top 3',
    undefined,
    false,
    50
  ),
  piece(
    'top-s-4',
    'top',
    S,
    'fem',
    'summer/color assets/top4.png',
    'Verão top 4',
    undefined,
    false,
    50
  ),
  piece(
    'top-s-5',
    'top',
    S,
    'fem',
    'summer/color assets/top5.png',
    'Verão top 5',
    undefined,
    false,
    50
  ),
  piece(
    'top-s-6',
    'top',
    S,
    'fem',
    'summer/color assets/top6.png',
    'Verão top 6',
    undefined,
    false,
    50
  ),
  piece(
    'top-s-combi',
    'top',
    S,
    'fem',
    'summer/color assets/combi.png',
    'Maiô inteiro',
    undefined,
    false,
    60
  ),
  piece(
    'top-s-cream',
    'top',
    S,
    'fem',
    'summer/color assets/cream.png',
    'Cream',
    undefined,
    false,
    60
  ),
  piece(
    'top-s-sunburn',
    'top',
    S,
    'fem',
    'summer/color assets/sunburn.png',
    'Sunburn',
    undefined,
    false,
    60
  ),
  piece(
    'top-s-tan1',
    'top',
    S,
    'fem',
    'summer/color assets/tan1.png',
    'Tan 1',
    undefined,
    false,
    50
  ),
  piece(
    'top-s-tan2',
    'top',
    S,
    'fem',
    'summer/color assets/tan2.png',
    'Tan 2',
    undefined,
    false,
    50
  ),
  piece(
    'top-s-tan3',
    'top',
    S,
    'fem',
    'summer/color assets/tan3.png',
    'Tan 3',
    undefined,
    false,
    50
  ),
  piece(
    'top-s-tan4',
    'top',
    S,
    'fem',
    'summer/color assets/tan4.png',
    'Tan 4',
    undefined,
    false,
    50
  ),
]

// ─────────────────────────────────────────────
// BOTTOM
// ─────────────────────────────────────────────

export const BOTTOMS: CharacterPiece[] = [
  // chibi-basics: 8 estilos
  ...Array.from({ length: 8 }, (_, i) => {
    const n = i + 1
    return piece(
      `bottom-b-${n}`,
      'bottom',
      B,
      'neutral',
      `chibi-basics/bottom/${n}.png`,
      `Bottom ${n}`,
      `chibi-basics/bottom/color/${n}.png`,
      n === 1,
      n > 1 ? 50 : undefined
    )
  }),
  // masc-misc bottoms
  piece(
    'bottom-m-academic',
    'bottom',
    M,
    'masc',
    'masc-misc/9-bottom-academic(bw).png',
    'Acadêmico',
    'masc-misc/9-bottom-academic(color).png',
    false,
    60
  ),
  piece(
    'bottom-m-costume',
    'bottom',
    M,
    'masc',
    'masc-misc/9-bottom-costume(bw).png',
    'Fantasia',
    'masc-misc/9-bottom-costume(color).png',
    false,
    60
  ),
  piece(
    'bottom-m-grey',
    'bottom',
    M,
    'masc',
    'masc-misc/9-bottom-greysweatpants.png',
    'Moletom cinza',
    undefined,
    false,
    50
  ),
  piece(
    'bottom-m-jean',
    'bottom',
    M,
    'masc',
    'masc-misc/9-bottom-jean(bw).png',
    'Jeans',
    'masc-misc/9-bottom-jean(color).png',
    true
  ),
  piece(
    'bottom-m-short',
    'bottom',
    M,
    'masc',
    'masc-misc/9-bottom-short(bw).png',
    'Short',
    'masc-misc/9-bottom-short(color).png',
    false,
    50
  ),
  piece(
    'bottom-m-underwear',
    'bottom',
    M,
    'masc',
    'masc-misc/9-bottom-underwear-boxer(bw).png',
    'Boxer',
    'masc-misc/9-bottom-underwear-boxer(color).png',
    false,
    40
  ),
  // power couples
  piece(
    'bottom-p1',
    'bottom',
    P1,
    'neutral',
    'power-couples-1/bottom.png',
    'Calça casal 1',
    undefined,
    false,
    70
  ),
  piece(
    'bottom-p2',
    'bottom',
    P2,
    'neutral',
    'power-couples-2/bottom.png',
    'Calça casal 2',
    undefined,
    false,
    70
  ),
  piece(
    'bottom-p2-skirt',
    'bottom',
    P2,
    'neutral',
    'power-couples-2/skirt.png',
    'Saia',
    undefined,
    false,
    70
  ),
  piece(
    'bottom-p2-skirt-back',
    'bottom',
    P2,
    'neutral',
    'power-couples-2/skirt_back.png',
    'Saia (costas)',
    undefined,
    false,
    70
  ),
  piece(
    'bottom-p2-skirt-top',
    'bottom',
    P2,
    'neutral',
    'power-couples-2/skirt_top.png',
    'Saia top',
    undefined,
    false,
    70
  ),
  // summer
  ...Array.from({ length: 8 }, (_, i) => {
    const n = i + 1
    return piece(
      `bottom-s-${n}`,
      'bottom',
      S,
      'fem',
      `summer/color assets/bottom${n}.png`,
      `Verão bottom ${n}`,
      undefined,
      false,
      50
    )
  }),
]

// ─────────────────────────────────────────────
// DRESS
// ─────────────────────────────────────────────

export const DRESSES: CharacterPiece[] = [
  ...Array.from({ length: 7 }, (_, i) => {
    const n = i + 1
    return piece(
      `dress-b-${n}`,
      'dress',
      B,
      'fem',
      `chibi-basics/dress/${n}.png`,
      `Vestido ${n}`,
      `chibi-basics/dress/COLORS/${n}.png`,
      n === 1,
      n > 1 ? 70 : undefined
    )
  }),
  piece(
    'dress-p1',
    'dress',
    P1,
    'fem',
    'power-couples-1/dress.png',
    'Vestido casal 1',
    undefined,
    false,
    90
  ),
]

// ─────────────────────────────────────────────
// SHOES
// ─────────────────────────────────────────────

export const SHOES: CharacterPiece[] = [
  ...Array.from({ length: 4 }, (_, i) => {
    const n = i + 1
    return piece(
      `shoes-b-${n}`,
      'shoes',
      B,
      'neutral',
      `chibi-basics/shoes/${n}.png`,
      `Sapato ${n}`,
      `chibi-basics/shoes/COLOR/${n}.png`,
      n === 1,
      n > 1 ? 40 : undefined
    )
  }),
  piece(
    'shoes-p1',
    'shoes',
    P1,
    'neutral',
    'power-couples-1/shoes.png',
    'Sapato casal 1',
    undefined,
    false,
    50
  ),
  piece(
    'shoes-p1-b',
    'shoes',
    P1,
    'neutral',
    'power-couples-1/shoesb.png',
    'Sapato casal 1b',
    undefined,
    false,
    50
  ),
  piece(
    'shoes-p2',
    'shoes',
    P2,
    'neutral',
    'power-couples-2/shoes.png',
    'Sapato casal 2',
    undefined,
    false,
    50
  ),
  piece(
    'shoes-p2-b',
    'shoes',
    P2,
    'neutral',
    'power-couples-2/shoesB.png',
    'Sapato casal 2b',
    undefined,
    false,
    50
  ),
  piece(
    'shoes-s',
    'shoes',
    S,
    'fem',
    'summer/color assets/shoes.png',
    'Sandália verão',
    undefined,
    false,
    40
  ),
]

// ─────────────────────────────────────────────
// GLOVES
// ─────────────────────────────────────────────

export const GLOVES: CharacterPiece[] = Array.from({ length: 6 }, (_, i) => {
  const n = i + 1
  return piece(
    `gloves-b-${n}`,
    'gloves',
    B,
    'neutral',
    `chibi-basics/gloves/${n}.png`,
    `Luva ${n}`,
    `chibi-basics/gloves/COLOR/${n}.png`,
    false,
    40
  )
})

// ─────────────────────────────────────────────
// ACESSÓRIOS (power couples + summer)
// ─────────────────────────────────────────────

export const ACCESSORIES: CharacterPiece[] = [
  // power couples 1
  piece(
    'acc-p1-bracelet',
    'accessory',
    P1,
    'neutral',
    'power-couples-1/bracelet.png',
    'Pulseira 1',
    undefined,
    false,
    40
  ),
  piece(
    'acc-p1-earings',
    'accessory',
    P1,
    'neutral',
    'power-couples-1/earings.png',
    'Brinco 1',
    undefined,
    false,
    30
  ),
  piece(
    'acc-p1-glasses',
    'accessory',
    P1,
    'neutral',
    'power-couples-1/glasses.png',
    'Óculos 1',
    undefined,
    false,
    40
  ),
  piece(
    'acc-p1-glove',
    'accessory',
    P1,
    'neutral',
    'power-couples-1/glove.png',
    'Luva 1',
    undefined,
    false,
    40
  ),
  piece(
    'acc-p1-gloveB',
    'accessory',
    P1,
    'neutral',
    'power-couples-1/gloveB.png',
    'Luva 1b',
    undefined,
    false,
    40
  ),
  piece(
    'acc-p1-jacket',
    'accessory',
    P1,
    'neutral',
    'power-couples-1/jacket.png',
    'Jaqueta 1',
    undefined,
    false,
    80
  ),
  piece(
    'acc-p1-mouth',
    'accessory',
    P1,
    'neutral',
    'power-couples-1/mouth.png',
    'Boca casal',
    undefined,
    false,
    30
  ),
  piece(
    'acc-p1-nailpolish',
    'accessory',
    P1,
    'neutral',
    'power-couples-1/nailpolish.png',
    'Esmalte',
    undefined,
    false,
    20
  ),
  piece(
    'acc-p1-ring',
    'accessory',
    P1,
    'neutral',
    'power-couples-1/ring.png',
    'Anel',
    undefined,
    false,
    30
  ),
  // power couples 2
  piece(
    'acc-p2-belt',
    'accessory',
    P2,
    'neutral',
    'power-couples-2/belt.png',
    'Cinto',
    undefined,
    false,
    30
  ),
  piece(
    'acc-p2-bracelets',
    'accessory',
    P2,
    'neutral',
    'power-couples-2/bracelets.png',
    'Pulseiras',
    undefined,
    false,
    40
  ),
  piece(
    'acc-p2-cross',
    'accessory',
    P2,
    'neutral',
    'power-couples-2/cross.png',
    'Cruz',
    undefined,
    false,
    30
  ),
  piece(
    'acc-p2-earings',
    'accessory',
    P2,
    'neutral',
    'power-couples-2/earings.png',
    'Brinco 2',
    undefined,
    false,
    30
  ),
  piece(
    'acc-p2-eyeshadow',
    'accessory',
    P2,
    'neutral',
    'power-couples-2/eyeshadow.png',
    'Sombra',
    undefined,
    false,
    20
  ),
  piece(
    'acc-p2-jacket',
    'accessory',
    P2,
    'neutral',
    'power-couples-2/jacket.png',
    'Jaqueta 2',
    undefined,
    false,
    80
  ),
  piece(
    'acc-p2-necklace',
    'accessory',
    P2,
    'neutral',
    'power-couples-2/necklace.png',
    'Colar',
    undefined,
    false,
    40
  ),
  piece(
    'acc-p2-watch',
    'accessory',
    P2,
    'neutral',
    'power-couples-2/watch.png',
    'Relógio',
    undefined,
    false,
    40
  ),
  // summer
  piece(
    'acc-s-1',
    'accessory',
    S,
    'neutral',
    'summer/color assets/access1.png',
    'Acessório verão 1',
    undefined,
    false,
    30
  ),
  piece(
    'acc-s-2',
    'accessory',
    S,
    'neutral',
    'summer/color assets/access2.png',
    'Acessório verão 2',
    undefined,
    false,
    30
  ),
  piece(
    'acc-s-3',
    'accessory',
    S,
    'neutral',
    'summer/color assets/access3.png',
    'Acessório verão 3',
    undefined,
    false,
    30
  ),
  piece(
    'acc-s-4',
    'accessory',
    S,
    'neutral',
    'summer/color assets/access4.png',
    'Acessório verão 4',
    undefined,
    false,
    30
  ),
  piece(
    'acc-s-5',
    'accessory',
    S,
    'neutral',
    'summer/color assets/access5.png',
    'Acessório verão 5',
    undefined,
    false,
    30
  ),
]

// ─────────────────────────────────────────────
// TATUAGENS (power couples 2)
// ─────────────────────────────────────────────

export const TATTOOS: CharacterPiece[] = [
  piece(
    'tatoo-dragon',
    'tattoo',
    P2,
    'neutral',
    'power-couples-2/tatoo_dragon.png',
    'Tatuagem dragão',
    undefined,
    false,
    60
  ),
  piece(
    'tatoo-flowers',
    'tattoo',
    P2,
    'neutral',
    'power-couples-2/tatoo_flowers.png',
    'Tatuagem flores',
    undefined,
    false,
    60
  ),
  piece(
    'tatoo-ink',
    'tattoo',
    P2,
    'neutral',
    'power-couples-2/tatoo_ink.png',
    'Tatuagem tinta',
    undefined,
    false,
    60
  ),
  piece(
    'tatoo-marks',
    'tattoo',
    P2,
    'neutral',
    'power-couples-2/tatoo_marks.png',
    'Tatuagem marcas',
    undefined,
    false,
    60
  ),
]

// ─────────────────────────────────────────────
// CATÁLOGO COMPLETO
// ─────────────────────────────────────────────

export const ALL_PIECES: CharacterPiece[] = [
  ...BODIES,
  ...HAIR,
  ...HAIR_MASC,
  ...HAIR_BACK,
  ...HAIR_BONUS,
  ...BANGS,
  ...MOUTH,
  ...EYEBROWS,
  ...EYELASHES,
  ...PUPILS,
  ...BEARD,
  ...TOPS,
  ...BOTTOMS,
  ...DRESSES,
  ...SHOES,
  ...GLOVES,
  ...ACCESSORIES,
  ...TATTOOS,
]

// ─────────────────────────────────────────────
// HELPERS DE BUSCA
// ─────────────────────────────────────────────

export function getPieceById(id: string): CharacterPiece | undefined {
  return ALL_PIECES.find((p) => p.id === id)
}

export function getPiecesByCategory(category: CharacterCategory): CharacterPiece[] {
  return ALL_PIECES.filter((p) => p.category === category)
}

export function getFreePieces(): CharacterPiece[] {
  return ALL_PIECES.filter((p) => p.free)
}

export function getPiecesByPack(pack: CharacterPack): CharacterPiece[] {
  return ALL_PIECES.filter((p) => p.pack === pack)
}

// Ordem de renderização das camadas (de baixo pra cima)
export const LAYER_ORDER: CharacterCategory[] = [
  'body',
  'tattoo',
  'hair_back',
  'bottom',
  'dress',
  'top',
  'shoes',
  'gloves',
  'accessory',
  'hair',
  'bangs',
  'hair_bonus',
  'beard',
  'eyebrows',
  'eyelashes',
  'pupils',
  'mouth',
]
