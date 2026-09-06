// src/lib/profileBackground.ts
import { ref, set, onValue, off } from 'firebase/database'
import { db } from './firebase'
import { spendCoins } from './personalCoin'

export type ProfileBackgroundTier = 'padrao' | 'pastel' | 'gradient' | 'decorado'

export interface ProfileBackgroundOption {
  id: string
  label: string
  tier: ProfileBackgroundTier
  background: string
}

// preço por tier — mesma escada da moldura de badge (profileBadgeHolders.ts),
// pra manter a economia de "decoração" consistente entre categorias
const TIER_PRICE: Record<ProfileBackgroundTier, number> = {
  padrao: 0, // sempre grátis — é o estado inicial, ninguém paga pelo que já tinha
  pastel: 25,
  gradient: 45,
  decorado: 70,
}

export function getBackgroundPrice(option: ProfileBackgroundOption): number {
  return TIER_PRICE[option.tier]
}

// Paleta duplicada de profileBadgeHolders.ts de propósito, pra manter os
// dois arquivos pequenos e independentes — mesmo padrão já aceito no app
// (shopPrices.ts não migrado a economyConfig.ts "por ora").
export const PROFILE_BACKGROUNDS: ProfileBackgroundOption[] = [
  {
    id: 'default',
    label: 'Padrão',
    tier: 'padrao',
    background: 'linear-gradient(160deg, rgba(253,246,240,0.97) 0%, rgba(252,232,238,0.97) 100%)',
  },
  { id: 'pastel-petala', label: 'Pétala', tier: 'pastel', background: '#F5D5DC' },
  { id: 'pastel-folha', label: 'Folhinha', tier: 'pastel', background: '#E8F5E8' },
  { id: 'pastel-madeira', label: 'Madeira Clara', tier: 'pastel', background: '#F5ECD7' },
  { id: 'pastel-avela', label: 'Avelã', tier: 'pastel', background: '#D4AA80' },
  {
    id: 'degrade-por-do-sol',
    label: 'Pôr do Sol',
    tier: 'gradient',
    background: 'linear-gradient(to bottom, #f7c59f 0%, #f0a8b8 35%, #d9aee8 65%, #c4b8f0 100%)',
  },
  {
    id: 'degrade-jardim',
    label: 'Jardim',
    tier: 'gradient',
    background:
      'radial-gradient(ellipse at 50% 110%, #a8d8b0 0%, transparent 60%), linear-gradient(to bottom, #c2e8f0 0%, #d4f0da 40%, #b8e8c2 70%, #a0d4a8 100%)',
  },
  {
    id: 'degrade-aurora',
    label: 'Aurora',
    tier: 'gradient',
    background:
      'linear-gradient(to bottom, #2c1654 0%, #7b2d8b 20%, #d4546a 45%, #f0845a 65%, #f7b97a 82%, #fde3b0 100%)',
  },
  {
    id: 'decorado-nuvem',
    label: 'Nuvem',
    tier: 'decorado',
    background:
      'radial-gradient(ellipse at 50% 0%, #ffffffcc 0%, transparent 70%), linear-gradient(to bottom, #e8e4f4 0%, #ddd8ef 25%, #ece8f6 50%, #d8d4ed 75%, #e4e0f2 100%)',
  },
  {
    id: 'decorado-aconchego',
    label: 'Aconchego',
    tier: 'decorado',
    background:
      'radial-gradient(ellipse at 50% 0%, #fff8e844 0%, transparent 50%), linear-gradient(to bottom, #e8c99a 0%, #d4b080 20%, #c9a872 40%, #e8d5b0 70%, #f5ece0 100%)',
  },
  {
    id: 'decorado-confete',
    label: 'Confete',
    tier: 'decorado',
    background:
      'radial-gradient(circle, #E8A0B0 3px, transparent 3.5px) 0 0/26px 26px, radial-gradient(circle, #7FB87F 2.5px, transparent 3px) 13px 13px/26px 26px, radial-gradient(circle, #C4956A 2px, transparent 2.5px) 6px 19px/26px 26px, radial-gradient(circle, #8B6914 2px, transparent 2.5px) 19px 6px/26px 26px, #FDF6F0',
  },
  {
    id: 'decorado-bolhinhas',
    label: 'Bolinhas Pastel',
    tier: 'decorado',
    background:
      'radial-gradient(circle, #F5D5DC 5px, transparent 5.5px) 0 0/32px 32px, radial-gradient(circle, #E8F5E8 4px, transparent 4.5px) 16px 16px/32px 32px, radial-gradient(circle, #D4AA80 3px, transparent 3.5px) 8px 24px/32px 32px, #F5ECD7',
  },
  {
    id: 'decorado-listras',
    label: 'Listrinhas Candy',
    tier: 'decorado',
    background:
      'repeating-linear-gradient(45deg, #F5D5DC 0px, #F5D5DC 8px, #FDF6F0 8px, #FDF6F0 16px)',
  },
]

const equippedPath = (uid: string) => `users/${uid}/profile/backgroundId`
const ownedPath = (uid: string) => `users/${uid}/profile/backgroundsOwned`

export function subscribeProfileBackground(
  uid: string,
  callback: (backgroundId: string | null) => void
): () => void {
  const r = ref(db, equippedPath(uid))
  const handler = onValue(r, (snap) => {
    queueMicrotask(() => callback((snap.val() as string) ?? null))
  })
  return () => off(r, 'value', handler)
}

export async function setProfileBackground(uid: string, backgroundId: string): Promise<void> {
  await set(ref(db, equippedPath(uid)), backgroundId)
}

export interface OwnedProfileBackgrounds {
  [backgroundId: string]: true
}

export function subscribeOwnedProfileBackgrounds(
  uid: string,
  callback: (owned: OwnedProfileBackgrounds) => void
): () => void {
  const r = ref(db, ownedPath(uid))
  const handler = onValue(r, (snap) => {
    queueMicrotask(() => callback((snap.val() as OwnedProfileBackgrounds) ?? {}))
  })
  return () => off(r, 'value', handler)
}

// Debita moeda pessoal e marca posse — 'default' nunca passa por aqui, ver
// isProfileBackgroundOwned (é sempre considerado possuído)
export async function buyProfileBackground(
  uid: string,
  backgroundId: string,
  price: number
): Promise<boolean> {
  const ok = await spendCoins(uid, price, `profile-background:${backgroundId}`)
  if (!ok) return false
  await set(ref(db, `${ownedPath(uid)}/${backgroundId}`), true)
  return true
}

export function isProfileBackgroundOwned(
  backgroundId: string,
  owned: OwnedProfileBackgrounds
): boolean {
  return backgroundId === 'default' || !!owned[backgroundId]
}
