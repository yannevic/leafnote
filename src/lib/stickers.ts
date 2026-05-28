import { ref, get, set, onValue, off, update } from 'firebase/database'
import { db } from './firebase'
import { addCoins } from './garden'
import { STICKER_PACKS } from '../assets/stickers/index'

export interface OwnedStickers {
  [stickerKey: string]: true
}

const sharedPath = (coupleId: string) => `couples/${coupleId}/customLetterStickers/shared/owned`

export function subscribeOwnedStickers(
  coupleId: string,
  _uid: string,
  callback: (owned: OwnedStickers) => void
): () => void {
  const r = ref(db, sharedPath(coupleId))
  const handler = onValue(r, (snap) => {
    callback((snap.val() as OwnedStickers) ?? {})
  })
  return () => off(r, 'value', handler)
}

export async function getOwnedStickers(coupleId: string, _uid: string): Promise<OwnedStickers> {
  const snap = await get(ref(db, sharedPath(coupleId)))
  return (snap.val() as OwnedStickers) ?? {}
}

export async function buyPack(
  coupleId: string,
  _uid: string,
  packId: string,
  coins: number
): Promise<{ success: boolean; error?: string }> {
  const pack = STICKER_PACKS.find((p) => p.id === packId)
  if (!pack) return { success: false, error: 'pack não encontrado' }

  const owned = await getOwnedStickers(coupleId, _uid)
  const price = getPackRemainingPrice(packId, owned)
  if (coins < price) return { success: false, error: 'moedas insuficientes' }

  await addCoins(coupleId, -price)

  const updates: Record<string, true> = {}
  pack.stickers.forEach((s) => {
    updates[s.key] = true
  })
  await update(ref(db, sharedPath(coupleId)), updates)

  return { success: true }
}

export async function buySticker(
  coupleId: string,
  _uid: string,
  stickerKey: string,
  coins: number
): Promise<{ success: boolean; error?: string }> {
  const pack = STICKER_PACKS.find((p) => p.stickers.some((s) => s.key === stickerKey))
  if (!pack) return { success: false, error: 'sticker não encontrado' }

  const price = Math.ceil(pack.price / pack.stickers.length)
  if (coins < price) return { success: false, error: 'moedas insuficientes' }

  await addCoins(coupleId, -price)
  await set(ref(db, `${sharedPath(coupleId)}/${stickerKey}`), true)

  return { success: true }
}

export function getStickerIndividualPrice(stickerKey: string): number {
  const pack = STICKER_PACKS.find((p) => p.stickers.some((s) => s.key === stickerKey))
  if (!pack) return 0
  return Math.ceil(pack.price / pack.stickers.length)
}

export function isPackFullyOwned(packId: string, owned: OwnedStickers): boolean {
  const pack = STICKER_PACKS.find((p) => p.id === packId)
  if (!pack) return false
  return pack.stickers.every((s) => owned[s.key] === true)
}

export function getPackRemainingPrice(packId: string, owned: OwnedStickers): number {
  const pack = STICKER_PACKS.find((p) => p.id === packId)
  if (!pack) return 0
  const ownedCount = pack.stickers.filter((s) => owned[s.key]).length
  if (ownedCount >= pack.stickers.length) return 0
  const pricePerSticker = pack.price / pack.stickers.length
  const remaining = pack.stickers.length - ownedCount
  return Math.ceil(pricePerSticker * remaining)
}
