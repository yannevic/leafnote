// src/assets/badges/index.ts
import jardimSecreto from './jardim-secreto.png'
import dexterSerie from './dexter-serie.png'
import luciferFallenAngel from './lucifer-fallen-angel.png'
import leagueOfLegends from './league-of-legends.png'

// chave = id da coleção em lib/cards.ts (COLLECTIONS), não o nome da pasta de arte de carta
export const BADGE_IMAGES: Record<string, string> = {
  'jardim-secreto': jardimSecreto,
  'dexter-serie': dexterSerie,
  'lucifer-fallen-angel': luciferFallenAngel,
  'league-of-legends': leagueOfLegends,
}
