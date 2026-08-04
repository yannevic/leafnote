import { CardRarity } from './rarity'
import { JARDIM_SECRETO_IMAGES } from '../assets/cards/jardim-secreto'

export interface CardDefinition {
  id: string
  name: string
  rarity: CardRarity
  collectionId: string
  number: number
  image: string
}

export const COLLECTIONS = {
  'jardim-secreto': {
    id: 'jardim-secreto',
    name: 'Jardim Secreto',
    total: 20,
  },
}

export const CARDS: CardDefinition[] = [
  {
    id: 'cogumelo-vermelho',
    name: 'Cogumelo Vermelho',
    rarity: 'comum',
    collectionId: 'jardim-secreto',
    number: 1,
    image: JARDIM_SECRETO_IMAGES['cogumelo-vermelho'],
  },
  {
    id: 'folhinha-verde',
    name: 'Folhinha Verde',
    rarity: 'comum',
    collectionId: 'jardim-secreto',
    number: 2,
    image: JARDIM_SECRETO_IMAGES['folhinha-verde'],
  },
  {
    id: 'margarida',
    name: 'Margarida',
    rarity: 'comum',
    collectionId: 'jardim-secreto',
    number: 3,
    image: JARDIM_SECRETO_IMAGES['margarida'],
  },
  {
    id: 'caracol-jardim',
    name: 'Caracol de Jardim',
    rarity: 'comum',
    collectionId: 'jardim-secreto',
    number: 4,
    image: JARDIM_SECRETO_IMAGES['caracol-jardim'],
  },
  {
    id: 'regador-velhinho',
    name: 'Regador Velhinho',
    rarity: 'comum',
    collectionId: 'jardim-secreto',
    number: 5,
    image: JARDIM_SECRETO_IMAGES['regador-velhinho'],
  },
  {
    id: 'borboleta-branca',
    name: 'Borboleta Branca',
    rarity: 'comum',
    collectionId: 'jardim-secreto',
    number: 6,
    image: JARDIM_SECRETO_IMAGES['borboleta-branca'],
  },
  {
    id: 'xicara-cha',
    name: 'Xícara de Chá Fumegante',
    rarity: 'comum',
    collectionId: 'jardim-secreto',
    number: 7,
    image: JARDIM_SECRETO_IMAGES['xicara-cha'],
  },
  {
    id: 'cesta-piquenique',
    name: 'Cesta de Piquenique',
    rarity: 'comum',
    collectionId: 'jardim-secreto',
    number: 8,
    image: JARDIM_SECRETO_IMAGES['cesta-piquenique'],
  },
  {
    id: 'cogumelo-azul',
    name: 'Cogumelo Azul Brilhante',
    rarity: 'incomum',
    collectionId: 'jardim-secreto',
    number: 9,
    image: JARDIM_SECRETO_IMAGES['cogumelo-azul'],
  },
  {
    id: 'coruja-bebe',
    name: 'Coruja Bebê',
    rarity: 'incomum',
    collectionId: 'jardim-secreto',
    number: 10,
    image: JARDIM_SECRETO_IMAGES['coruja-bebe'],
  },
  {
    id: 'ninho-ovinhos',
    name: 'Ninho com Ovinhos',
    rarity: 'incomum',
    collectionId: 'jardim-secreto',
    number: 11,
    image: JARDIM_SECRETO_IMAGES['ninho-ovinhos'],
  },
  {
    id: 'lanterna-vagalume',
    name: 'Lanterna de Vagalume',
    rarity: 'incomum',
    collectionId: 'jardim-secreto',
    number: 12,
    image: JARDIM_SECRETO_IMAGES['lanterna-vagalume'],
  },
  {
    id: 'casinha-arvore',
    name: 'Casinha na Árvore',
    rarity: 'incomum',
    collectionId: 'jardim-secreto',
    number: 13,
    image: JARDIM_SECRETO_IMAGES['casinha-arvore'],
  },
  {
    id: 'guarda-chuva-folha',
    name: 'Guarda-chuva de Folha',
    rarity: 'incomum',
    collectionId: 'jardim-secreto',
    number: 14,
    image: JARDIM_SECRETO_IMAGES['guarda-chuva-folha'],
  },
  {
    id: 'raposa-flores',
    name: 'Raposa das Flores',
    rarity: 'rara',
    collectionId: 'jardim-secreto',
    number: 15,
    image: JARDIM_SECRETO_IMAGES['raposa-flores'],
  },
  {
    id: 'fada-jardim',
    name: 'Fada do Jardim',
    rarity: 'rara',
    collectionId: 'jardim-secreto',
    number: 16,
    image: JARDIM_SECRETO_IMAGES['fada-jardim'],
  },
  {
    id: 'coelho-chapeuzinho',
    name: 'Coelho de Chapéuzinho',
    rarity: 'rara',
    collectionId: 'jardim-secreto',
    number: 17,
    image: JARDIM_SECRETO_IMAGES['coelho-chapeuzinho'],
  },
  {
    id: 'filhote-cervo',
    name: 'Filhote de Cervo com Chifres de Flor',
    rarity: 'rara',
    collectionId: 'jardim-secreto',
    number: 18,
    image: JARDIM_SECRETO_IMAGES['filhote-cervo'],
  },
  {
    id: 'guardiao-floresta',
    name: 'Guardião da Floresta',
    rarity: 'epica',
    collectionId: 'jardim-secreto',
    number: 19,
    image: JARDIM_SECRETO_IMAGES['guardiao-floresta'],
  },
  {
    id: 'jardim-secreto-lua',
    name: 'Jardim Secreto sob a Lua',
    rarity: 'epica',
    collectionId: 'jardim-secreto',
    number: 20,
    image: JARDIM_SECRETO_IMAGES['jardim-secreto-lua'],
  },
]
