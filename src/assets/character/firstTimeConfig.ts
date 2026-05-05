import { CharacterConfig } from './index'

export const FIRST_TIME_UNLOCKED_IDS = new Set([
  // Corpos
  'body-b-1',
  'body-b-6',
  'body-b-9',
  'body-b-16',

  // Rosto
  'pupil-b-3',
  'pupil-b-7',
  'mouth-b-1',
  'mouth-b-3',
  'eyelash-b-4',
  'eyebrow-b-1',

  // Cabelo trás
  'hair-back-b-1',
  'hair-back-b-10',

  // Cabelo frente
  'hair-b-1',
  'hair-b-2',
  'hair-b-7',

  // Franja extra (masc)
  'bangs-m-bananas',

  // Frente extra (masc)
  'hair-m-piques',

  // Padrão — top
  'top-b-1',
  'top-b-6',
  'top-b-10',

  // Padrão — bottom
  'bottom-b-3',
  'bottom-b-8',

  // Padrão — dress
  'dress-b-2',

  // Padrão — shoes
  'shoes-b-1',
  'shoes-b-2',

  // Masculino — top
  'top-m-marcel1',
  'top-m-marcel2',
  'top-m-tshirt-p1',
  'top-m-tshirt-p3',

  // Masculino — bottom
  'bottom-m-grey',
  'bottom-m-underwear',

  // Praia — shoes
  'shoes-s',

  // Barba (todas)
  'beard-b-1',
  'beard-b-2',
  'beard-b-3',
  'beard-b-4',
  'beard-b-5',
])

// Cores disponíveis na primeira vez (todas menos branco=g)
export const FIRST_TIME_COLOR_VARIANTS = ['b', 'c', 'd', 'e', 'f', 'h']

export const FIRST_TIME_DEFAULT_CONFIG: CharacterConfig = {
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
  colorVariants: {},
}
