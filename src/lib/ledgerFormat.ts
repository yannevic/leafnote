// src/lib/ledgerFormat.ts
//
// Traduz o `reason` técnico salvo em coinLedger (ex: "badge-holder:degrade-por-do-sol")
// pra um texto legível no extrato, sem alterar o dado bruto salvo no Firebase.
// Cada novo prefixo criado no app (ex: uma futura categoria de decoração) só
// precisa de uma entrada nova aqui — nunca de mudança no CardsExtractModal.tsx.

import { BADGE_HOLDER_MODELS } from './profileBadgeHolders'
import { PROFILE_BACKGROUNDS } from './profileBackground'

const BADGE_HOLDER_LABELS: Record<string, string> = Object.fromEntries(
  BADGE_HOLDER_MODELS.map((m) => [m.id, m.label])
)

const PROFILE_BACKGROUND_LABELS: Record<string, string> = Object.fromEntries(
  PROFILE_BACKGROUNDS.map((b) => [b.id, b.label])
)

export function formatLedgerReason(reason: string): string {
  const [prefix, id] = reason.split(':')

  if (prefix === 'badge-holder' && id) {
    const label = BADGE_HOLDER_LABELS[id] ?? id
    return `Moldura de badge: ${label}`
  }

  if (prefix === 'profile-background' && id) {
    const label = PROFILE_BACKGROUND_LABELS[id] ?? id
    return `Fundo do perfil: ${label}`
  }

  // qualquer outro reason (pacote, venda, streak, etc) já vem legível —
  // só capitaliza a primeira letra, igual o comportamento atual
  return reason.charAt(0).toUpperCase() + reason.slice(1)
}
