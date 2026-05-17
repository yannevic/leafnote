import { ref, get, set, onValue, off, update } from 'firebase/database'
import { db } from './firebase'
import { addCoins } from './garden'
import { STICKER_PACKS } from '../assets/stickers/index'

export interface OwnedStickers {
  [stickerKey: string]: true
}

const SHARED_PATH = 'customLetterStickers/shared/owned'

export function subscribeOwnedStickers(
  _uid: string,
  callback: (owned: OwnedStickers) => void
): () => void {
  const r = ref(db, SHARED_PATH)
  const handler = onValue(r, (snap) => {
    callback((snap.val() as OwnedStickers) ?? {})
  })
  return () => off(r, 'value', handler)
}

export async function getOwnedStickers(_uid: string): Promise<OwnedStickers> {
  const snap = await get(ref(db, SHARED_PATH))
  return (snap.val() as OwnedStickers) ?? {}
}

export async function buyPack(
  _uid: string,
  packId: string,
  coins: number
): Promise<{ success: boolean; error?: string }> {
  const pack = STICKER_PACKS.find((p) => p.id === packId)
  if (!pack) return { success: false, error: 'pack não encontrado' }
  if (coins < pack.price) return { success: false, error: 'moedas insuficientes' }

  await addCoins(-pack.price)

  const updates: Record<string, true> = {}
  pack.stickers.forEach((s) => {
    updates[s.key] = true
  })
  await update(ref(db, SHARED_PATH), updates)

  return { success: true }
}

export async function buySticker(
  _uid: string,
  stickerKey: string,
  coins: number
): Promise<{ success: boolean; error?: string }> {
  const pack = STICKER_PACKS.find((p) => p.stickers.some((s) => s.key === stickerKey))
  if (!pack) return { success: false, error: 'sticker não encontrado' }

  const price = Math.ceil(pack.price / pack.stickers.length)
  if (coins < price) return { success: false, error: 'moedas insuficientes' }

  await addCoins(-price)
  await set(ref(db, `${SHARED_PATH}/${stickerKey}`), true)

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
