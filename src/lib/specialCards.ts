// src/lib/specialCards.ts
// Coleção de Cartas Especial — separada de lib/cards.ts de propósito (seção 25
// do Plano de Cartinhas): não tem pacote comprável, não tem raridade variada,
// e agora funciona igual às coleções normais pra encaixe (drag-and-drop até o
// slot certo) — só que permite repetida sem bloqueio.
import { CLIMA_IMAGES } from '../assets/cards/especiais-climas'

export interface SpecialCardDefinition {
  id: string
  name: string
  image: string
}

export const SPECIAL_COLLECTION_NAME = 'Clima e Fenômenos'
export const SPECIAL_COLLECTION_ID = 'especiais-clima'

// cadastro manual, cresce aos poucos (Nana vai acrescentando) — nunca gerar
// dinamicamente, sempre um array fixo igual as coleções normais. A ORDEM
// deste array agora também define a posição fixa de cada carta na vitrine
// (virou grid com slot certo, igual as coleções normais)
export const SPECIAL_CARDS: SpecialCardDefinition[] = [
  { id: 'raio', name: 'Raio', image: CLIMA_IMAGES['raio'] },
  { id: 'furacao', name: 'Furacão', image: CLIMA_IMAGES['furacao'] },
  { id: 'aurora-boreal', name: 'Aurora Boreal', image: CLIMA_IMAGES['aurora-boreal'] },
  { id: 'arco-iris', name: 'Arco-Íris', image: CLIMA_IMAGES['arco-iris'] },
  { id: 'neve', name: 'Neve', image: CLIMA_IMAGES['neve'] },
  { id: 'tempestade', name: 'Tempestade', image: CLIMA_IMAGES['tempestade'] },
]

export function drawRandomSpecialCard(): SpecialCardDefinition {
  return SPECIAL_CARDS[Math.floor(Math.random() * SPECIAL_CARDS.length)]
}
