// ─────────────────────────────────────────────────────────────────────────────
// useShop.ts
// Hook de loja — compra, inventário e saldo.
//
// INVENTÁRIO:
//   house/inventory/{itemId}: true   — pisos, paredes, fundos (compartilhado)
//   users/{uid}/inventory/{itemId}: true  — roupas e acessórios (por pessoa)
//
// SALDO:
//   garden/coins  — compartilhado entre o casal (mesmo nó do garden)
//
// PADRÃO:
//   Segue exatamente o mesmo padrão do garden.ts:
//   onValue para subscribes, get+set para writes, off para cleanup.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from 'react'
import { ref, onValue, off, get, set, update } from 'firebase/database'
import { db } from '../lib/firebase'
import { getCoins, subscribeCoins } from '../lib/garden'
import {
  DEFAULT_HOUSE_UNLOCKED,
  DEFAULT_CHARACTER_UNLOCKED,
  getDiscountedCost,
  isAvailableToday,
  type ShopItem,
  type ShopCategory,
} from '../shop/shopPrices'
import { ALL_PIECES, type CharacterPiece } from '../assets/character/index'
import { FIRST_TIME_UNLOCKED_IDS } from '../assets/character/firstTimeConfig'

// ─────────────────────────────────────────────
// WISHLIST
// Path: users/{uid}/wishlist/{itemId}: true
// Separada por usuário.
// ─────────────────────────────────────────────

export function subscribeWishlist(
  uid: string,
  callback: (wishlist: Set<string>) => void
): () => void {
  const r = ref(db, `users/${uid}/wishlist`)
  const handler = onValue(r, (snap) => {
    const val = snap.val() as Record<string, boolean> | null
    callback(new Set<string>(val ? Object.keys(val).filter((k) => val[k] === true) : []))
  })
  return () => off(r, 'value', handler)
}

export async function toggleWishlistItem(uid: string, itemId: string): Promise<void> {
  const r = ref(db, `users/${uid}/wishlist/${itemId}`)
  const snap = await get(r)
  await set(r, snap.val() === true ? null : true)
}

// ─────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────

export type BuyResult =
  | { success: true; finalCost: number }
  | { success: false; reason: 'insufficient_funds' | 'already_owned' | 'unavailable_today' }

// ─────────────────────────────────────────────
// GIFTS
// Path: house/gifts/{giftId}

export interface GiftItem {
  itemId: string
  itemLabel: string
  itemCategory: string
}

export interface Gift {
  id: string
  items: GiftItem[]
  fromUid: string
  fromName: string
  toUid: string
  message: string
  color: 'purple' | 'green' | 'white' | 'brown' | 'red' | 'blue'
  opened: boolean
  createdAt: string
  position: { x: number; y: number }
}

export function subscribeGifts(callback: (gifts: Gift[]) => void): () => void {
  const r = ref(db, 'house/gifts')
  const handler = onValue(r, (snap) => {
    const val = snap.val() as Record<string, Gift> | null
    const gifts = val
      ? Object.entries(val)
          .filter(([, g]) => !g.opened)
          .map(([id, g]) => ({ ...g, id }))
      : []
    callback(gifts)
  })
  return () => off(r, 'value', handler)
}

export async function sendGift(
  fromUid: string,
  fromName: string,
  toUid: string,
  items: ShopItem[],
  message: string,
  color: Gift['color'] = 'purple'
): Promise<BuyResult> {
  const unavailable = items.find((i) => !isAvailableToday(i))
  if (unavailable) return { success: false, reason: 'unavailable_today' }

  const totalCost = items.reduce((sum, i) => sum + getDiscountedCost(i), 0)
  const coins = await getCoins()
  if (coins < totalCost) return { success: false, reason: 'insufficient_funds' }

  const giftId = `gift_${Date.now()}_${Math.random().toString(36).slice(2)}`
  const position = {
    x: 400 + Math.floor(Math.random() * 200),
    y: 500 + Math.floor(Math.random() * 120),
  }

  const updates: Record<string, unknown> = {
    'garden/coins': coins - totalCost,
    [`house/gifts/${giftId}`]: {
      id: giftId,
      items: items.map((i) => ({
        itemId: i.id,
        itemLabel: i.label,
        itemCategory: i.category,
      })),
      fromUid,
      fromName,
      toUid,
      message,
      color,
      opened: false,
      createdAt: new Date().toISOString(),
      position,
    },
  }
  await update(ref(db), updates)
  return { success: true, finalCost: totalCost }
}

export async function openGift(gift: Gift, toUid: string): Promise<void> {
  const updates: Record<string, unknown> = {
    [`house/gifts/${gift.id}/opened`]: true,
  }

  for (const giftItem of gift.items) {
    const isHouse =
      giftItem.itemCategory === 'floor' ||
      giftItem.itemCategory === 'wall' ||
      giftItem.itemCategory === 'background' ||
      giftItem.itemCategory === 'furniture' ||
      giftItem.itemCategory === 'room'
    const path = isHouse
      ? `house/inventory/${giftItem.itemId}`
      : `users/${toUid}/inventory/${giftItem.itemId}`
    updates[path] = true
  }

  await update(ref(db), updates)
}

// ─────────────────────────────────────────────
// HELPERS FIREBASE — inventory
// ─────────────────────────────────────────────

/** Verifica categoria para decidir qual path usar */
function isHouseCategory(category: ShopCategory): boolean {
  return (
    category === 'floor' ||
    category === 'wall' ||
    category === 'background' ||
    category === 'furniture' ||
    category === 'room'
  )
}

// ─────────────────────────────────────────────
// SUBSCRIBE — inventário da casinha
// ─────────────────────────────────────────────

export function subscribeHouseInventory(callback: (owned: Set<string>) => void): () => void {
  const r = ref(db, 'house/inventory')
  const handler = onValue(r, (snap) => {
    const val = snap.val() as Record<string, boolean> | null
    const owned = new Set<string>(val ? Object.keys(val).filter((k) => val[k] === true) : [])
    // Sempre inclui os itens default
    callback(owned)
  })
  return () => off(r, 'value', handler)
}

// ─────────────────────────────────────────────
// SUBSCRIBE — inventário de roupas (por uid)
// Injeta peças gratuitas e defaults — usado para o próprio usuário.
// ─────────────────────────────────────────────

export function subscribeCharacterInventory(
  uid: string,
  callback: (owned: Set<string>) => void
): () => void {
  console.log('subscribeCharacterInventory chamado com uid:', uid)
  const r = ref(db, `users/${uid}/inventory`)
  const handler = onValue(r, (snap) => {
    const val = snap.val() as Record<string, boolean> | null
    console.log('inventory snap path:', `users/${uid}/inventory`, 'val:', val)
    const owned = new Set<string>(val ? Object.keys(val).filter((k) => val[k] === true) : [])
    ALL_PIECES.forEach((p) => {
      if (p.free || p.cost === 0) owned.add(p.id)
    })
    DEFAULT_CHARACTER_UNLOCKED.forEach((id) => owned.add(id))
    callback(new Set(owned))
  })
  return () => off(r, 'value', handler)
}

// ─────────────────────────────────────────────
// SUBSCRIBE — inventário do parceiro (sem injetar defaults)
// Usado para checar o que o parceiro já tem antes de presentear.
// ─────────────────────────────────────────────

export function subscribePartnerInventory(
  uid: string,
  callback: (owned: Set<string>) => void
): () => void {
  const r = ref(db, `users/${uid}/inventory`)
  const handler = onValue(r, (snap) => {
    const val = snap.val() as Record<string, boolean> | null
    callback(new Set(val ? Object.keys(val).filter((k) => val[k] === true) : []))
  })
  return () => off(r, 'value', handler)
}

// ─────────────────────────────────────────────
// WRITE — comprar item
// Atomicidade manual: checar saldo → debitar → salvar inventário
// (Firebase RTDB não tem transações multi-path atômicas no client,
//  mas o casal usa o app junto então race condition é improvável)
// ─────────────────────────────────────────────

export async function buyItem(uid: string, item: ShopItem): Promise<BuyResult> {
  // 1. Verifica disponibilidade (dias especiais)
  if (!isAvailableToday(item)) {
    return { success: false, reason: 'unavailable_today' }
  }

  const finalCost = getDiscountedCost(item)

  // 2. Verifica se já possui
  const inventoryPath = isHouseCategory(item.category)
    ? `house/inventory/${item.id}`
    : `users/${uid}/inventory/${item.id}`

  const ownedSnap = await get(ref(db, inventoryPath))
  const alreadyOwned = ownedSnap.val() === true
  if (alreadyOwned) {
    return { success: false, reason: 'already_owned' }
  }

  // 3. Verifica saldo
  const coins = await getCoins()
  if (coins < finalCost) {
    return { success: false, reason: 'insufficient_funds' }
  }

  // 4. Debita coins + salva inventário (multi-path update)
  const updates: Record<string, unknown> = {
    'garden/coins': coins - finalCost,
    [inventoryPath]: true,
  }
  await update(ref(db), updates)

  return { success: true, finalCost }
}

// ─────────────────────────────────────────────
// WRITE — dar item grátis (unlock sem custo)
// Usado na inicialização do inventário default
// ─────────────────────────────────────────────

export async function unlockItemFree(
  uid: string,
  itemId: string,
  category: ShopCategory
): Promise<void> {
  const path = isHouseCategory(category)
    ? `house/inventory/${itemId}`
    : `users/${uid}/inventory/${itemId}`
  await set(ref(db, path), true)
}

// ─────────────────────────────────────────────
// WRITE — inicializar inventário default
// Chama uma vez quando o usuário faz login pela primeira vez.
// Verifica se já foi inicializado antes de escrever.
// ─────────────────────────────────────────────

export async function initDefaultInventory(uid: string): Promise<void> {
  const flagSnap = await get(ref(db, `users/${uid}/inventoryInitialized`))
  if (flagSnap.val() === true) return

  const updates: Record<string, unknown> = {}

  // Roupas default
  DEFAULT_CHARACTER_UNLOCKED.forEach((id) => {
    updates[`users/${uid}/inventory/${id}`] = true
  })

  FIRST_TIME_UNLOCKED_IDS.forEach((id) => {
    updates[`users/${uid}/inventory/${id}`] = true
  })
  // Peças gratuitas
  ALL_PIECES.forEach((p) => {
    if (p.free || p.cost === 0) {
      updates[`users/${uid}/inventory/${p.id}`] = true
    }
  })

  // Migração: copia ids do character config pro inventário
  const charSnap = await get(ref(db, `users/${uid}/character`))
  if (charSnap.exists()) {
    const config = charSnap.val() as Record<string, unknown>
    const singles = [
      'body',
      'hair',
      'bangs',
      'eyebrows',
      'eyelashes',
      'mouth',
      'pupils',
      'top',
      'bottom',
      'dress',
      'shoes',
      'saia_costas',
      'saia_top',
    ]
    for (const key of singles) {
      const id = config[key] as string | null
      if (id) updates[`users/${uid}/inventory/${id}`] = true
    }
    const multiKeys = [
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
    for (const key of multiKeys) {
      const val = config[key]
      const ids: string[] = Array.isArray(val)
        ? val
        : val && typeof val === 'object'
          ? Object.values(val as Record<string, string>)
          : []
      for (const id of ids) {
        if (id) updates[`users/${uid}/inventory/${id}`] = true
      }
    }
  }

  updates[`users/${uid}/inventoryInitialized`] = true
  await update(ref(db), updates)
}

// ─────────────────────────────────────────────
// HOOK PRINCIPAL
// ─────────────────────────────────────────────

export interface UseShopReturn {
  coins: number
  houseOwned: Set<string>
  characterOwned: Set<string>
  wishlist: Set<string>
  buy: (item: ShopItem) => Promise<BuyResult>
  isOwned: (itemId: string, category: ShopCategory) => boolean
  toggleWishlist: (itemId: string) => Promise<void>
  loading: boolean
}

export function useShop(uid: string): UseShopReturn {
  const [coins, setCoins] = useState(0)
  const [houseOwned, setHouseOwned] = useState<Set<string>>(new Set(DEFAULT_HOUSE_UNLOCKED))
  const [characterOwned, setCharacterOwned] = useState<Set<string>>(() => {
    const initial = new Set<string>(DEFAULT_CHARACTER_UNLOCKED)
    ALL_PIECES.forEach((p) => {
      if (p.free || p.cost === 0) initial.add(p.id)
    })
    return initial
  })
  const [loading, setLoading] = useState(true)
  const [wishlist, setWishlist] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!uid) return

    // Inicializa inventário default na primeira vez
    initDefaultInventory(uid).catch(console.error)

    const unsubCoins = subscribeCoins((c) => {
      setCoins(c)
      setLoading(false)
    })

    const unsubHouse = subscribeHouseInventory(setHouseOwned)

    const unsubChar = subscribeCharacterInventory(uid, setCharacterOwned)
    const unsubWishlist = subscribeWishlist(uid, setWishlist)

    return () => {
      unsubCoins()
      unsubHouse()
      unsubChar()
      unsubWishlist()
    }
  }, [uid])

  useEffect(() => {
    if (!uid || wishlist.size === 0) return
    const toRemove = [...wishlist].filter((id) => characterOwned.has(id) || houseOwned.has(id))
    if (toRemove.length === 0) return
    toRemove.forEach((id) => toggleWishlistItem(uid, id))
  }, [characterOwned, houseOwned, wishlist, uid])

  const buy = useCallback((item: ShopItem) => buyItem(uid, item), [uid])

  const isOwned = useCallback(
    (itemId: string, category: ShopCategory): boolean => {
      if (isHouseCategory(category)) return houseOwned.has(itemId)
      return characterOwned.has(itemId)
    },
    [houseOwned, characterOwned]
  )

  const toggleWishlist = useCallback((itemId: string) => toggleWishlistItem(uid, itemId), [uid])
  return { coins, houseOwned, characterOwned, wishlist, buy, isOwned, toggleWishlist, loading }
}

// ─────────────────────────────────────────────
// HELPERS EXPORTADOS (para uso fora do hook)
// ─────────────────────────────────────────────

/**
 * Retorna as peças do personagem que estão desbloqueadas para um uid.
 * Combina Firebase + peças gratuitas do index.ts.
 * Uso: CharacterModal passar para MiniGrid.
 */
export async function getUnlockedCharacterIds(uid: string): Promise<Set<string>> {
  const snap = await get(ref(db, `users/${uid}/inventory`))
  const val = snap.val() as Record<string, boolean> | null
  const owned = new Set<string>(val ? Object.keys(val).filter((k) => val[k] === true) : [])
  ALL_PIECES.forEach((p) => {
    if (p.free || p.cost === 0) owned.add(p.id)
  })
  DEFAULT_CHARACTER_UNLOCKED.forEach((id) => owned.add(id))
  return owned
}

/**
 * Retorna os itens da casinha que estão desbloqueados (snapshot único).
 * Uso: HouseModal na inicialização.
 */
export async function getUnlockedHouseIds(): Promise<Set<string>> {
  const snap = await get(ref(db, 'house/inventory'))
  const val = snap.val() as Record<string, boolean> | null
  const owned = new Set<string>(val ? Object.keys(val).filter((k) => val[k] === true) : [])
  return owned
}

/**
 * Filtra itens da loja que o usuário ainda não possui.
 */
export function filterUnowned(items: ShopItem[], owned: Set<string>): ShopItem[] {
  return items.filter((item) => !owned.has(item.id))
}

/**
 * Retorna peças do personagem disponíveis na loja (cost > 0, não free).
 */
export function getCharacterShopPieces(): CharacterPiece[] {
  return ALL_PIECES.filter((p) => !p.free && (p.cost ?? 0) > 0)
}
