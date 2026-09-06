// src/lib/profileBadgeHolders.ts
import { ref, push, set, update, remove, runTransaction, onValue, off } from 'firebase/database'
import { db } from './firebase'
import { spendCoins } from './personalCoin'

// ─── Modelos (skins) — catálogo de compra ──────────────────────────
// Preço FIXO por modelo, sempre o mesmo — diferente dos slots do jardim
// (que sobem de preço a cada slot novo). Aqui não tem escada: comprar
// duas molduras iguais custa o preço x2, simples assim.
// Moeda PESSOAL (lib/personalCoin.ts) — mesma economia dos pacotes de
// carta (comum 40, promocional 55; ver economyConfig.ts).
// ⚠️ Cores ainda provisórias — trocar pela paleta de fundo da casinha
// (HouseSceneShared.tsx / BACKGROUNDS) quando reaproveitada.
export type BadgeHolderTier = 'pastel' | 'gradient' | 'decorado'

export interface BadgeHolderModel {
  id: string
  label: string
  tier: BadgeHolderTier
  background: string // CSS background — PROVISÓRIO
  price: number // moeda pessoal
}

export const MAX_BADGES_PER_HOLDER = 5

// Cores reaproveitadas de HouseSceneShared.tsx (BACKGROUNDS) — colado como
// valor literal, não importado, porque lib/ não importa de components/ em
// nenhum outro lugar do app. ⚠️ Se as cores de 'sunset'/'garden'/'sunset2'/
// 'mist'/'indoor' mudarem na casinha, atualizar aqui manualmente também.
export const BADGE_HOLDER_MODELS: BadgeHolderModel[] = [
  // ─── Pastel (sólida) — cores-token do próprio leafnote ───
  { id: 'pastel-petala', label: 'Pétala', tier: 'pastel', background: '#F5D5DC', price: 25 },
  { id: 'pastel-folha', label: 'Folhinha', tier: 'pastel', background: '#E8F5E8', price: 25 },
  {
    id: 'pastel-madeira',
    label: 'Madeira Clara',
    tier: 'pastel',
    background: '#F5ECD7',
    price: 25,
  },
  { id: 'pastel-avela', label: 'Avelã', tier: 'pastel', background: '#D4AA80', price: 25 },

  // ─── Degradê — reaproveitado de BACKGROUNDS (casinha) ───
  {
    id: 'degrade-por-do-sol',
    label: 'Pôr do Sol',
    tier: 'gradient',
    // = BACKGROUNDS.find(b => b.id === 'sunset').css
    background: 'linear-gradient(to bottom, #f7c59f 0%, #f0a8b8 35%, #d9aee8 65%, #c4b8f0 100%)',
    price: 45,
  },
  {
    id: 'degrade-jardim',
    label: 'Jardim',
    tier: 'gradient',
    // = BACKGROUNDS.find(b => b.id === 'garden').css
    background:
      'radial-gradient(ellipse at 50% 110%, #a8d8b0 0%, transparent 60%), linear-gradient(to bottom, #c2e8f0 0%, #d4f0da 40%, #b8e8c2 70%, #a0d4a8 100%)',
    price: 45,
  },
  {
    id: 'degrade-aurora',
    label: 'Aurora',
    tier: 'gradient',
    // = BACKGROUNDS.find(b => b.id === 'sunset2').css
    background:
      'linear-gradient(to bottom, #2c1654 0%, #7b2d8b 20%, #d4546a 45%, #f0845a 65%, #f7b97a 82%, #fde3b0 100%)',
    price: 45,
  },

  // ─── Decorado fofo — reaproveitado de BACKGROUNDS; escolhidos por já
  // terem uma camada radial extra por cima do linear (glow), o que já
  // rende um visual mais "trabalhado" que o tier degradê simples ───
  {
    id: 'decorado-nuvem',
    label: 'Nuvem',
    tier: 'decorado',
    // = BACKGROUNDS.find(b => b.id === 'mist').css
    background:
      'radial-gradient(ellipse at 50% 0%, #ffffffcc 0%, transparent 70%), linear-gradient(to bottom, #e8e4f4 0%, #ddd8ef 25%, #ece8f6 50%, #d8d4ed 75%, #e4e0f2 100%)',
    price: 70,
  },
  {
    id: 'decorado-aconchego',
    label: 'Aconchego',
    tier: 'decorado',
    // = BACKGROUNDS.find(b => b.id === 'indoor').css
    background:
      'radial-gradient(ellipse at 50% 0%, #fff8e844 0%, transparent 50%), linear-gradient(to bottom, #e8c99a 0%, #d4b080 20%, #c9a872 40%, #e8d5b0 70%, #f5ece0 100%)',
    price: 70,
  },

  {
    id: 'decorado-confete',
    label: 'Confete',
    tier: 'decorado',
    // 4 camadas de radial-gradient, cada uma com seu próprio ladrilho
    // <posição>/<tamanho> (26x26px) deslocado das outras — sem isso o
    // navegador desenha só 1 círculo centralizado (bug da versão anterior)
    background:
      'radial-gradient(circle, #E8A0B0 3px, transparent 3.5px) 0 0/26px 26px, radial-gradient(circle, #7FB87F 2.5px, transparent 3px) 13px 13px/26px 26px, radial-gradient(circle, #C4956A 2px, transparent 2.5px) 6px 19px/26px 26px, radial-gradient(circle, #8B6914 2px, transparent 2.5px) 19px 6px/26px 26px, #FDF6F0',
    price: 70,
  },
  {
    id: 'decorado-bolhinhas',
    label: 'Bolinhas Pastel',
    tier: 'decorado',
    background:
      'radial-gradient(circle, #F5D5DC 5px, transparent 5.5px) 0 0/32px 32px, radial-gradient(circle, #E8F5E8 4px, transparent 4.5px) 16px 16px/32px 32px, radial-gradient(circle, #D4AA80 3px, transparent 3.5px) 8px 24px/32px 32px, #F5ECD7',
    price: 70,
  },
  {
    id: 'decorado-listras',
    label: 'Listrinhas Candy',
    tier: 'decorado',
    background:
      'repeating-linear-gradient(45deg, #F5D5DC 0px, #F5D5DC 8px, #FDF6F0 8px, #FDF6F0 16px)',
    price: 70,
  },
]

export interface BadgeHolderPlacement {
  id: string
  modelId: string
  x: number
  y: number
  badgeIds: string[]
  zOrder?: number
  createdAt: string
  updatedAt: string
  updatedBy: string
}

// contagem, não booleano — dá pra possuir mais de uma moldura do mesmo
// modelo (ex: uma pros badges de coleção de carta, outra reservada pra
// uma futura categoria de badge diferente)
export interface BadgeHolderInventory {
  [modelId: string]: number
}

const inventoryPath = (uid: string) => `users/${uid}/profile/badgeHolderInventory`
const placementPath = (uid: string) => `users/${uid}/profile/badgeHolderPlacement`

export function subscribeBadgeHolderInventory(
  uid: string,
  callback: (owned: BadgeHolderInventory) => void
): () => void {
  const r = ref(db, inventoryPath(uid))
  const handler = onValue(r, (snap) => {
    queueMicrotask(() => callback((snap.val() as BadgeHolderInventory) ?? {}))
  })
  return () => off(r, 'value', handler)
}

// Debita a moeda pessoal e, só se o débito for confirmado, incrementa a
// contagem via transaction (evita duplicar se o clique disparar 2x rápido)
export async function buyBadgeHolderModel(
  uid: string,
  modelId: string,
  price: number
): Promise<boolean> {
  const ok = await spendCoins(uid, price, `badge-holder:${modelId}`)
  if (!ok) return false
  const countRef = ref(db, `${inventoryPath(uid)}/${modelId}`)
  await runTransaction(countRef, (current) => (current ?? 0) + 1)
  return true
}

export function subscribeBadgeHolderPlacements(
  uid: string,
  callback: (placements: BadgeHolderPlacement[]) => void
): () => void {
  const r = ref(db, placementPath(uid))
  const handler = onValue(r, (snap) => {
    const val = (snap.val() as Record<string, BadgeHolderPlacement>) ?? {}
    queueMicrotask(() => callback(Object.values(val)))
  })
  return () => off(r, 'value', handler)
}

// ⏳ hoje só permite 1 moldura colocada por vez no perfil (checagem fica
// na tela, não aqui) — "várias juntas" é feature futura já prevista, por
// isso já dá pra possuir mais de uma no inventário desde já
export async function addBadgeHolderPlacement(uid: string, modelId: string): Promise<void> {
  const r = ref(db, placementPath(uid))
  const newRef = push(r)
  const id = newRef.key!
  const now = new Date().toISOString()
  const placement: BadgeHolderPlacement = {
    id,
    modelId,
    x: 160,
    y: 320,
    badgeIds: [],
    zOrder: 1,
    createdAt: now,
    updatedAt: now,
    updatedBy: uid,
  }
  await set(newRef, placement)
}

export async function updateBadgeHolderPlacement(
  uid: string,
  id: string,
  data: Partial<BadgeHolderPlacement>
): Promise<void> {
  await update(ref(db, `${placementPath(uid)}/${id}`), {
    ...data,
    updatedAt: new Date().toISOString(),
    updatedBy: uid,
  })
}

export async function removeBadgeHolderPlacement(uid: string, id: string): Promise<void> {
  await remove(ref(db, `${placementPath(uid)}/${id}`))
}
