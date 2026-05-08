// ─────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────

export type CharacterCategorySingle =
  | 'body'
  | 'hair'
  | 'bangs'
  | 'eyebrows'
  | 'pupils'
  | 'eyelashes'
  | 'mouth'
  | 'top'
  | 'bottom'
  | 'dress'
  | 'shoes'
  | 'saia_costas'
  | 'saia_top'

export type CharacterCategoryMulti =
  | 'hair_back'
  | 'hair_bonus'
  | 'gloves'
  | 'beard'
  | 'accessory'
  | 'accessory_cima'
  | 'accessory_topo'
  | 'jaqueta'
  | 'tattoo'
  | 'bottom_over'

export type CharacterCategory = CharacterCategorySingle | CharacterCategoryMulti

export type CharacterPack =
  | 'chibi-basics'
  | 'masc-misc'
  | 'power-couples-1'
  | 'power-couples-2'
  | 'summer'

export type CharacterGender = 'fem' | 'masc' | 'neutral'

export const MULTI_SLOT_CATEGORIES: CharacterCategoryMulti[] = [
  'hair_back',
  'hair_bonus',
  'gloves',
  'beard',
  'accessory',
  'accessory_cima',
  'accessory_topo',
  'jaqueta',
  'tattoo',
  'bottom_over',
]

export function isMultiSlot(category: CharacterCategory): category is CharacterCategoryMulti {
  return (MULTI_SLOT_CATEGORIES as string[]).includes(category)
}

export interface CharacterPiece {
  id: string
  category: CharacterCategory
  pack: CharacterPack
  gender: CharacterGender
  src: string
  hasColor: boolean
  srcColor?: string
  free: boolean
  cost?: number
  label: string
}

export interface CharacterConfig {
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
  jaqueta: string[]
  saia_costas: string | null
  saia_top: string | null
  hair_back: string[]
  hair_bonus: string[]
  gloves: string[]
  beard: string[]
  accessory: string[]
  accessory_cima: string[]
  accessory_topo: string[]
  tattoo: string[]
  bottom_over: []
  colorVariants: Record<string, string>
}

export const DEFAULT_CHARACTER_CONFIG: CharacterConfig = {
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
  jaqueta: [],
  saia_costas: null,
  saia_top: null,
  hair_back: [],
  hair_bonus: [],
  gloves: [],
  beard: [],
  accessory: [],
  accessory_cima: [],
  accessory_topo: [],
  tattoo: [],
  bottom_over: [],
  colorVariants: {},
}

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

const B = 'chibi-basics'
const M = 'masc-misc'
const P1 = 'power-couples-1'
const P2 = 'power-couples-2'
const S = 'summer'

export const COLOR_VARIANT_LABELS: Record<string, string> = {
  '': 'Padrão',
  b: 'Ruivo',
  c: 'Vermelho',
  d: 'Louro escuro',
  e: 'Loiro',
  f: 'Preto',
  g: 'Branco',
  h: 'Cinza',
}

// ─────────────────────────────────────────────
// BODY
// ─────────────────────────────────────────────

export const BODIES: CharacterPiece[] = [
  ...Array.from({ length: 17 }, (_, i) =>
    piece(
      `body-b-${i + 1}`,
      'body',
      B,
      'neutral',
      `chibi-basics/body/${i + 1}.png`,
      `Pele ${i + 1}`,
      undefined,
      false,
      0
    )
  ),
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
  piece(
    'body-m-1',
    'body',
    M,
    'masc',
    'masc-misc/9-body1.png',
    'Corpo masc 1',
    undefined,
    false,
    0
  ),
  piece(
    'body-m-2',
    'body',
    M,
    'masc',
    'masc-misc/9-body2.png',
    'Corpo masc 2',
    undefined,
    false,
    0
  ),
  piece(
    'body-m-3',
    'body',
    M,
    'masc',
    'masc-misc/9-body3.png',
    'Corpo masc 3',
    undefined,
    false,
    0
  ),
]

// ─────────────────────────────────────────────
// HAIR (frente)
// ─────────────────────────────────────────────

export const HAIR: CharacterPiece[] = [
  ...Array.from({ length: 12 }, (_, i) => {
    const n = i + 1
    return piece(
      `hair-b-${n}`,
      'hair',
      B,
      'neutral',
      `chibi-basics/hair/COLOR/${n}.png`,
      `Cabelo ${n}`,
      `chibi-basics/hair/COLOR/${n}.png`,
      false,
      40
    )
  }),
  piece(
    'hair-m-lisses',
    'hair',
    M,
    'masc',
    'masc-misc/9-hair-lisses(color).png',
    'Liso',
    undefined,
    false,
    50
  ),
  piece(
    'hair-m-piques',
    'hair',
    M,
    'masc',
    'masc-misc/9-hair-piques(color).png',
    'Espetado',
    undefined,
    false,
    50
  ),
  piece(
    'hair-m-short1',
    'hair',
    M,
    'masc',
    'masc-misc/9-hair-short1(color).png',
    'Curto 1',
    undefined,
    false,
    50
  ),
  piece(
    'hair-m-shortwavy',
    'hair',
    M,
    'masc',
    'masc-misc/9-hair-short-wavy(color).png',
    'Ondulado curto',
    undefined,
    false,
    50
  ),
  piece(
    'hair-m-attaches',
    'hair',
    M,
    'masc',
    'masc-misc/9-hair-attachés(color).png',
    'Preso',
    undefined,
    false,
    50
  ),
  piece(
    'hair-m-attaches-tail',
    'hair',
    M,
    'masc',
    'masc-misc/9-hair-attachés-tail(color).png',
    'Preso com rabo',
    undefined,
    false,
    50
  ),
]

// ─────────────────────────────────────────────
// HAIR BACK
// ─────────────────────────────────────────────

export const HAIR_BACK: CharacterPiece[] = [
  ...Array.from({ length: 12 }, (_, i) => {
    const n = i + 1
    return piece(
      `hair-back-b-${n}`,
      'hair_back',
      B,
      'neutral',
      `chibi-basics/hair_back/COLOR/${n}.png`,
      `Trás ${n}`,
      `chibi-basics/hair_back/COLOR/${n}.png`,
      false,
      40
    )
  }),
  piece(
    'hair-back-m-braid',
    'hair_back',
    M,
    'masc',
    'masc-misc/9-hair-back-braid(color).png',
    'Trança',
    undefined,
    false,
    50
  ),
  piece(
    'hair-back-m-long',
    'hair_back',
    M,
    'masc',
    'masc-misc/9-hair-back-long(color).png',
    'Longo',
    undefined,
    false,
    50
  ),
]

// ─────────────────────────────────────────────
// HAIR BONUS
// ─────────────────────────────────────────────

export const HAIR_BONUS: CharacterPiece[] = Array.from({ length: 5 }, (_, i) => {
  const n = i + 1
  return piece(
    `hair-bonus-b-${n}`,
    'hair_bonus',
    B,
    'neutral',
    `chibi-basics/hair_bonus/COLOR/${n}.png`,
    `Enfeite ${n}`,
    `chibi-basics/hair_bonus/COLOR/${n}.png`,
    false,
    30
  )
})

// ─────────────────────────────────────────────
// BANGS (franja)
// ─────────────────────────────────────────────

export const BANGS: CharacterPiece[] = [
  ...Array.from({ length: 13 }, (_, i) => {
    const n = i + 1
    return piece(
      `bangs-b-${n}`,
      'bangs',
      B,
      'neutral',
      `chibi-basics/bangs/COLOR/${n}.png`,
      `Franja ${n}`,
      `chibi-basics/bangs/COLOR/${n}.png`,
      false,
      30
    )
  }),
  piece(
    'bangs-m-bananas',
    'bangs',
    M,
    'masc',
    'masc-misc/9-bangs-bananas(color).png',
    'Bananas',
    undefined,
    false,
    40
  ),
  piece(
    'bangs-m-longs',
    'bangs',
    M,
    'masc',
    'masc-misc/9-bangs-longs(color).png',
    'Longa',
    undefined,
    false,
    40
  ),
  piece(
    'bangs-m-longwavy',
    'bangs',
    M,
    'masc',
    'masc-misc/9-bangs-longswavy(color).png',
    'Longa ondulada',
    undefined,
    false,
    40
  ),
  piece(
    'bangs-m-pics',
    'bangs',
    M,
    'masc',
    'masc-misc/9-bangs-pics(color).png',
    'Pontuda',
    undefined,
    false,
    40
  ),
  piece(
    'bangs-m-wolf',
    'bangs',
    M,
    'masc',
    'masc-misc/9-bangs-wolf(color).png',
    'Wolf',
    undefined,
    false,
    40
  ),
]

// ─────────────────────────────────────────────
// FACE
// ─────────────────────────────────────────────

export const MOUTH: CharacterPiece[] = Array.from({ length: 20 }, (_, i) =>
  piece(
    `mouth-b-${i + 1}`,
    'mouth',
    B,
    'neutral',
    `chibi-basics/mouth/${i + 1}.png`,
    `Boca ${i + 1}`,
    undefined,
    false,
    20
  )
)

export const EYEBROWS: CharacterPiece[] = Array.from({ length: 5 }, (_, i) =>
  piece(
    `eyebrow-b-${i + 1}`,
    'eyebrows',
    B,
    'neutral',
    `chibi-basics/eyebrows/${i + 1}.png`,
    `Sobrancelha ${i + 1}`,
    undefined,
    false,
    20
  )
)

export const EYELASHES: CharacterPiece[] = Array.from({ length: 5 }, (_, i) =>
  piece(
    `eyelash-b-${i + 1}`,
    'eyelashes',
    B,
    'neutral',
    `chibi-basics/eyelashes/${i + 1}.png`,
    `Cílios ${i + 1}`,
    undefined,
    false,
    20
  )
)

export const PUPILS: CharacterPiece[] = Array.from({ length: 16 }, (_, i) =>
  piece(
    `pupil-b-${i + 1}`,
    'pupils',
    B,
    'neutral',
    `chibi-basics/pupils/${i + 1}.png`,
    `Pupila ${i + 1}`,
    undefined,
    false,
    20
  )
)

// ─────────────────────────────────────────────
// BEARD
// ─────────────────────────────────────────────

export const BEARD: CharacterPiece[] = Array.from({ length: 5 }, (_, i) =>
  piece(
    `beard-b-${i + 1}`,
    'beard',
    B,
    'masc',
    `chibi-basics/beard/${i + 1}.png`,
    `Barba ${i + 1}`,
    undefined,
    false,
    30
  )
)

// ─────────────────────────────────────────────
// TOP
// ─────────────────────────────────────────────

export const TOPS: CharacterPiece[] = [
  // ── chibi-basics ──
  ...Array.from({ length: 12 }, (_, i) => {
    const n = i + 1
    return piece(
      `top-b-${n}`,
      'top',
      B,
      'neutral',
      `chibi-basics/top/colors/${n}.png`,
      `Parte de cima ${n}`,
      undefined,
      false,
      50
    )
  }),

  // ── masc-misc ──
  piece(
    'top-m-blouson',
    'top',
    M,
    'masc',
    'masc-misc/9-top-blouson-shirt(color).png',
    'Blouson',
    undefined,
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
    'masc-misc/9-top-Kpop-suit(color).png',
    'Kpop suit',
    undefined,
    false,
    80
  ),
  piece(
    'top-m-polo',
    'top',
    M,
    'masc',
    'masc-misc/9-top-polo(color).png',
    'Polo',
    undefined,
    false,
    60
  ),
  piece(
    'top-m-pullshirt',
    'top',
    M,
    'masc',
    'masc-misc/9-top-pull-and-shirt(color).png',
    'Pull + camisa',
    undefined,
    false,
    60
  ),
  piece(
    'top-m-royalcape',
    'top',
    M,
    'masc',
    'masc-misc/9-top-royalcape-top(color).png',
    'Capa real',
    undefined,
    false,
    100
  ),
  piece(
    'top-m-royalback',
    'top',
    M,
    'masc',
    'masc-misc/9-top-royalcape-back(color).png',
    'Capa real (costas)',
    undefined,
    false,
    100
  ),
  piece(
    'top-m-royalprince',
    'top',
    M,
    'masc',
    'masc-misc/9-top-royal-prince(color).png',
    'Príncipe',
    undefined,
    false,
    100
  ),
  piece(
    'top-m-sweatshirt',
    'top',
    M,
    'masc',
    'masc-misc/9-top-sweatshirt(color).png',
    'Moletom',
    undefined,
    false,
    60
  ),
  piece(
    'top-m-timber',
    'top',
    M,
    'masc',
    'masc-misc/9-top-timber(color).png',
    'Timber',
    undefined,
    false,
    60
  ),
  // top-m-tshirt removido (arquivo não existe)
  piece(
    'top-m-tshirt-p1',
    'top',
    M,
    'masc',
    'masc-misc/9-top-tshirt(pattern1).png',
    'Camiseta estampa 1',
    undefined,
    false,
    70
  ),
  piece(
    'top-m-tshirt-p2',
    'top',
    M,
    'masc',
    'masc-misc/9-top-tshirt(pattern2).png',
    'Camiseta estampa 2',
    undefined,
    false,
    70
  ),
  piece(
    'top-m-tshirt-p3',
    'top',
    M,
    'masc',
    'masc-misc/9-top-tshirt(pattern3).png',
    'Camiseta estampa 3',
    undefined,
    false,
    70
  ),
  piece(
    'top-m-tshirt-p4',
    'top',
    M,
    'masc',
    'masc-misc/9-top-tshirt(pattern4).png',
    'Camiseta estampa 4',
    undefined,
    false,
    70
  ),
  piece(
    'top-m-tshirt-p5',
    'top',
    M,
    'masc',
    'masc-misc/9-top-tshirt(pattern5).png',
    'Camiseta estampa 5',
    undefined,
    false,
    70
  ),
  piece(
    'top-m-tshirtXXL',
    'top',
    M,
    'masc',
    'masc-misc/9-top-tshirtXXL(color).png',
    'Camiseta oversized',
    undefined,
    false,
    60
  ),
  piece(
    'top-m-marcel1',
    'top',
    M,
    'masc',
    'masc-misc/9-marcel1.png',
    'Marcel 1',
    undefined,
    false,
    60
  ),
  piece(
    'top-m-marcel2',
    'top',
    M,
    'masc',
    'masc-misc/9-marcel2.png',
    'Marcel 2',
    undefined,
    false,
    60
  ),

  // ── power-couples-1 ──
  piece(
    'top-p1',
    'top',
    P1,
    'neutral',
    'power-couples-1/top.png',
    'Top casal 1',
    undefined,
    false,
    80
  ),

  // ── power-couples-2 ──
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

  // ── summer ──
  ...Array.from({ length: 6 }, (_, i) =>
    piece(
      `top-s-${i + 1}`,
      'top',
      S,
      'fem',
      `summer/color-assets/top${i + 1}.png`,
      `Top praia ${i + 1}`,
      undefined,
      false,
      50
    )
  ),
]

// ─────────────────────────────────────────────
// BOTTOM
// ─────────────────────────────────────────────

export const BOTTOMS: CharacterPiece[] = [
  // ── chibi-basics ──
  ...Array.from({ length: 8 }, (_, i) => {
    const n = i + 1
    return piece(
      `bottom-b-${n}`,
      'bottom',
      B,
      'neutral',
      `chibi-basics/bottom/color/${n}.png`,
      `Parte de baixo ${n}`,
      undefined,
      false,
      50
    )
  }),

  // ── masc-misc ──
  piece(
    'bottom-m-academic',
    'bottom',
    M,
    'masc',
    'masc-misc/9-bottom-academic(color).png',
    'Acadêmico',
    undefined,
    false,
    60
  ),
  piece(
    'bottom-m-costume',
    'bottom',
    M,
    'masc',
    'masc-misc/9-bottom-costume(color).png',
    'Fantasia',
    undefined,
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
    'masc-misc/9-bottom-jean(color).png',
    'Jeans',
    undefined,
    false,
    50
  ),
  piece(
    'bottom-m-short',
    'bottom',
    M,
    'masc',
    'masc-misc/9-bottom-short(color).png',
    'Short',
    undefined,
    false,
    50
  ),
  piece(
    'bottom-m-underwear',
    'bottom',
    M,
    'masc',
    'masc-misc/9-bottom-underwear-boxer(color).png',
    'Boxer',
    undefined,
    false,
    40
  ),

  // ── power-couples-1 ──
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

  // ── power-couples-2 ──
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

  // ── summer ──
  ...Array.from({ length: 5 }, (_, i) =>
    piece(
      `bottom-s-${i + 1}`,
      'bottom',
      S,
      'fem',
      `summer/color-assets/bottom${i + 1}.png`,
      `Bottom praia ${i + 1}`,
      undefined,
      false,
      50
    )
  ),
  ...[7, 8].map((n) =>
    piece(
      `bottom-s-${n}`,
      'bottom',
      S,
      'fem',
      `summer/color-assets/bottom${n}.png`,
      `Bottom praia ${n}`,
      undefined,
      false,
      50
    )
  ),
]
export const BOTTOMS_OVER: CharacterPiece[] = [
  piece(
    'bottom-over-s-6',
    'bottom_over',
    S,
    'fem',
    'summer/color-assets/bottom6.png',
    'Caguinha praia',
    undefined,
    false,
    50
  ),
]

// ─────────────────────────────────────────────
// DRESS
// ─────────────────────────────────────────────

export const DRESSES: CharacterPiece[] = [
  // ── chibi-basics ──
  ...Array.from({ length: 7 }, (_, i) => {
    const n = i + 1
    return piece(
      `dress-b-${n}`,
      'dress',
      B,
      'fem',
      `chibi-basics/dress/COLORS/${n}.png`,
      `Vestido ${n}`,
      undefined,
      false,
      70
    )
  }),

  // ── power-couples-1 ──
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

  // ── summer ──
  piece(
    'dress-s-combi',
    'dress',
    S,
    'fem',
    'summer/color-assets/combi.png',
    'Maiô inteiro',
    undefined,
    false,
    60
  ),
]

// ─────────────────────────────────────────────
// SAIA COSTAS — fica atrás do body (layer própria)
// kit com saia e saia_top do P2
// ─────────────────────────────────────────────

export const SAIA_COSTAS: CharacterPiece[] = [
  piece(
    'saia-costas-p2',
    'saia_costas',
    P2,
    'neutral',
    'power-couples-2/skirt_back.png',
    'Saia (costas)',
    undefined,
    false,
    70
  ),
]

// ─────────────────────────────────────────────
// SAIA TOP — fica acima de tudo (layer própria)
// usa junto com saia costas e/ou skirt do P2
// ─────────────────────────────────────────────

export const SAIA_TOP: CharacterPiece[] = [
  piece(
    'saia-top-p2',
    'saia_top',
    P2,
    'neutral',
    'power-couples-2/skirt_top.png',
    'Saia (topo)',
    undefined,
    false,
    70
  ),
]

// ─────────────────────────────────────────────
// BOTTOM — saia do casal P2 (camada normal)
// complementa o kit saia costas + saia top
// adicionada aqui separada pra ficar clara
// ─────────────────────────────────────────────
// (já está em BOTTOMS como bottom-p2-skirt — mas removemos e passamos pra categoria bottom normal)
// Nota: skirt.png fica em bottom normal, skirt_back em saia_costas, skirt_top em saia_top

export const SKIRT_KIT: CharacterPiece[] = [
  piece(
    'bottom-p2-skirt',
    'bottom',
    P2,
    'neutral',
    'power-couples-2/skirt.png',
    'Saia casal',
    undefined,
    false,
    70
  ),
]

// ─────────────────────────────────────────────
// SHOES
// ─────────────────────────────────────────────

export const SHOES: CharacterPiece[] = [
  // ── chibi-basics ──
  ...Array.from({ length: 4 }, (_, i) => {
    const n = i + 1
    return piece(
      `shoes-b-${n}`,
      'shoes',
      B,
      'neutral',
      `chibi-basics/shoes/COLOR/${n}.png`,
      `Sapato ${n}`,
      undefined,
      false,
      40
    )
  }),

  // ── power-couples-1 ──
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

  // ── power-couples-2 ──
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

  // ── summer ──
  piece(
    'shoes-s',
    'shoes',
    S,
    'fem',
    'summer/color-assets/shoes.png',
    'Sandália praia',
    undefined,
    false,
    40
  ),
]

// ─────────────────────────────────────────────
// GLOVES
// ─────────────────────────────────────────────

export const GLOVES: CharacterPiece[] = [
  // ── chibi-basics ──
  ...Array.from({ length: 6 }, (_, i) =>
    piece(
      `gloves-b-${i + 1}`,
      'gloves',
      B,
      'neutral',
      `chibi-basics/gloves/COLOR/${i + 1}.png`,
      `Luva ${i + 1}`,
      undefined,
      false,
      40
    )
  ),

  // ── power-couples-1 ──
  piece(
    'gloves-p1',
    'gloves',
    P1,
    'neutral',
    'power-couples-1/glove.png',
    'Luva casal 1',
    undefined,
    false,
    40
  ),
  piece(
    'gloves-p1-b',
    'gloves',
    P1,
    'neutral',
    'power-couples-1/gloveB.png',
    'Luva casal 1b',
    undefined,
    false,
    40
  ),
]

// ─────────────────────────────────────────────
// ACESSÓRIOS — camada normal (abaixo do cabelo)
// ─────────────────────────────────────────────

export const ACCESSORIES: CharacterPiece[] = [
  // ── power-couples-1 ──
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

  // ── power-couples-2 ──
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
]

export const JAQUETAS: CharacterPiece[] = [
  piece(
    'acc-p1-jacket',
    'jaqueta',
    P1,
    'neutral',
    'power-couples-1/jacket.png',
    'Jaqueta 1',
    undefined,
    false,
    80
  ),
  piece(
    'acc-p2-jacket',
    'jaqueta',
    P2,
    'neutral',
    'power-couples-2/jacket.png',
    'Jaqueta 2',
    undefined,
    false,
    80
  ),
]

// ─────────────────────────────────────────────
// ACESSÓRIOS CIMA — acima dos acessórios normais, abaixo do cabelo
// access3 praia
// ─────────────────────────────────────────────

export const ACCESSORIES_CIMA: CharacterPiece[] = [
  piece(
    'acc-s-3',
    'accessory_cima',
    S,
    'neutral',
    'summer/color-assets/access3.png',
    'Acessório praia 3',
    undefined,
    false,
    30
  ),
  piece(
    'acc-s-4',
    'accessory_cima',
    S,
    'neutral',
    'summer/color-assets/access4.png',
    'Acessório praia 4',
    undefined,
    false,
    30
  ),
  piece(
    'acc-s-5',
    'accessory_cima',
    S,
    'neutral',
    'summer/color-assets/access5.png',
    'Acessório praia 5',
    undefined,
    false,
    30
  ),
]

// ─────────────────────────────────────────────
// ACESSÓRIOS TOPO — acima de tudo
// access1 e access2 praia + saia_top já tem layer própria
// ─────────────────────────────────────────────

export const ACCESSORIES_TOPO: CharacterPiece[] = [
  piece(
    'acc-s-1',
    'accessory_topo',
    S,
    'neutral',
    'summer/color-assets/access1.png',
    'Acessório praia 1',
    undefined,
    false,
    30
  ),
  piece(
    'acc-s-2',
    'accessory_topo',
    S,
    'neutral',
    'summer/color-assets/access2.png',
    'Acessório praia 2',
    undefined,
    false,
    30
  ),
]

// ─────────────────────────────────────────────
// TATUAGENS + BRONZEADO
// ─────────────────────────────────────────────

export const TATTOOS: CharacterPiece[] = [
  // ── power-couples-2 ──
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

  // ── summer ──
  piece(
    'tan-s-1',
    'tattoo',
    S,
    'fem',
    'summer/color-assets/tan1.png',
    'Bronzeado 1',
    undefined,
    false,
    30
  ),
  piece(
    'tan-s-2',
    'tattoo',
    S,
    'fem',
    'summer/color-assets/tan2.png',
    'Bronzeado 2',
    undefined,
    false,
    30
  ),
  piece(
    'tan-s-3',
    'tattoo',
    S,
    'fem',
    'summer/color-assets/tan3.png',
    'Bronzeado 3',
    undefined,
    false,
    30
  ),
  piece(
    'tan-s-4',
    'tattoo',
    S,
    'fem',
    'summer/color-assets/tan4.png',
    'Bronzeado 4',
    undefined,
    false,
    30
  ),
  piece(
    'sunburn-s',
    'tattoo',
    S,
    'fem',
    'summer/color-assets/sunburn.png',
    'Queimadura solar',
    undefined,
    false,
    30
  ),
  piece(
    'cream-s',
    'tattoo',
    S,
    'fem',
    'summer/color-assets/cream.png',
    'Protetor solar',
    undefined,
    false,
    20
  ),
]

// ─────────────────────────────────────────────
// CATÁLOGO COMPLETO
// ─────────────────────────────────────────────

export const ALL_PIECES: CharacterPiece[] = [
  ...BODIES,
  ...HAIR,
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
  ...BOTTOMS_OVER,
  ...SKIRT_KIT,
  ...DRESSES,
  ...SAIA_COSTAS,
  ...SAIA_TOP,
  ...SHOES,
  ...GLOVES,
  ...ACCESSORIES,
  ...JAQUETAS,
  ...ACCESSORIES_CIMA,
  ...ACCESSORIES_TOPO,
  ...TATTOOS,
]

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

// ─────────────────────────────────────────────
// LAYER ORDER — de baixo pra cima
// ─────────────────────────────────────────────

export const LAYER_ORDER: CharacterCategory[] = [
  'saia_costas',
  'hair_back',
  'body',
  'eyebrows',
  'tattoo',
  'shoes',
  'bottom',
  'bottom_over',
  'saia_top',
  'dress',
  'gloves',
  'top',
  'jaqueta',
  'accessory',
  'accessory_cima',
  'hair',
  'hair_bonus',
  'bangs',
  'beard',
  'eyelashes',
  'pupils',
  'mouth',
  'accessory_topo', // ← agora fica acima de tudo
]
