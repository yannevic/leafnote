import estagio1 from './estagio-1.png'
import estagio2 from './estagio-2.png'
import estagio3 from './estagio-3.png'

import rosaE4 from './rosa-estagio-4.png'
import rosaE5 from './rosa-estagio-5.png'
import margaridaE4 from './margarida-estagio-4.png'
import margaridaE5 from './margarida-estagio-5.png'
import tulipaE4 from './tulipa-estagio-4.png'
import tulipaE5 from './tulipa-estagio-5.png'
import girassolE4 from './girassol-estagio-4.png'
import girassolE5 from './girassol-estagio-5.png'
import orquidea4 from './orquidea-estagio-4.png'
import orquidea5 from './orquidea-estagio-5.png'
import lirioE4 from './lirio-estagio-4.png'
import lirioE5 from './lirio-estagio-5.png'
import jasminE4 from './jasmin-estagio-4.png'
import jasminE5 from './jasmin-estagio-5.png'
import violetaE4 from './violeta-estagio-4.png'
import violetaE5 from './violeta-estagio-5.png'
import peoniaE4 from './peonia-estagio-4.png'
import peoniaE5 from './peonia-estagio-5.png'
import papoulaE4 from './papoula-estagio-4.png'
import papoulaE5 from './papoula-estagio-5.png'
import lavandaE4 from './lavanda-estagio-4.png'
import lavandaE5 from './lavanda-estagio-5.png'
import especialE4 from './especial-estagio-4.png'
import especialE5 from './especial-estagio-5.png'
import bgCartoon from './bg-cartoon.jpg'
export { bgCartoon }

import type { FlowerType } from '../../lib/garden'

export const stageImages: Record<number, string> = {
  1: estagio1,
  2: estagio2,
  3: estagio3,
}

export const flowerStageImages: Record<FlowerType, Record<4 | 5, string>> = {
  rosa: { 4: rosaE4, 5: rosaE5 },
  margarida: { 4: margaridaE4, 5: margaridaE5 },
  tulipa: { 4: tulipaE4, 5: tulipaE5 },
  girassol: { 4: girassolE4, 5: girassolE5 },
  orquidea: { 4: orquidea4, 5: orquidea5 },
  lirio: { 4: lirioE4, 5: lirioE5 },
  jasmin: { 4: jasminE4, 5: jasminE5 },
  violeta: { 4: violetaE4, 5: violetaE5 },
  peonia: { 4: peoniaE4, 5: peoniaE5 },
  papoula: { 4: papoulaE4, 5: papoulaE5 },
  lavanda: { 4: lavandaE4, 5: lavandaE5 },
  especial: { 4: especialE4, 5: especialE5 },
}

export function getFlowerImage(flowerType: FlowerType, stage: number): string {
  if (stage <= 3) {
    return stageImages[stage] ?? stageImages[1]
  }
  const s = stage as 4 | 5
  return flowerStageImages[flowerType]?.[s] ?? stageImages[3]
}
