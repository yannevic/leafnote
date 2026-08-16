import pacoteComum from './pacote-comum.png'
import pacoteJardimSecreto from './pacote-jardimsecreto.png'
import pacoteDexter from './pacote-dexter.png'
import pacoteLucifer from './pacote-lucifer.png'
import pacoteLol from './pacote-lol.png'
// arte do pacote promocional, uma por coleção. Sempre que uma coleção nova
// for cadastrada em lib/cards.ts, adicionar a arte dela aqui também.
export const PROMO_PACK_ART: Record<string, string> = {
  'jardim-secreto': pacoteJardimSecreto,
  'dexter-serie': pacoteDexter,
  'lucifer-fallen-angel': pacoteLucifer,
  'league-of-legends': pacoteLol,
}

export const PACK_ART = {
  comum: pacoteComum,
}

export function getPromoPackArt(collectionId: string): string {
  return PROMO_PACK_ART[collectionId]
}
