// src/lib/profileDecoration.ts
import { ref, push, set, update, remove, onValue, off } from 'firebase/database'
import { db } from './firebase'
import type { BoardStickerItem } from '../types/board'

export type ProfileStickerItem = BoardStickerItem

const stickersPath = (ownerUid: string) => `users/${ownerUid}/profile/decoration/stickers`

export function subscribeProfileStickers(
  ownerUid: string,
  callback: (stickers: ProfileStickerItem[]) => void
): () => void {
  const r = ref(db, stickersPath(ownerUid))
  const handler = onValue(r, (snap) => {
    const val = (snap.val() as Record<string, ProfileStickerItem>) ?? {}
    // mesmo padrão do profileLayout.ts: adia pra não colidir com um setState
    // que pode estar rolando no componente que originou a escrita (ver bug v3.19.0)
    queueMicrotask(() => callback(Object.values(val)))
  })
  return () => off(r, 'value', handler)
}

export async function addProfileSticker(
  ownerUid: string,
  stickerKey: string,
  currentStickers: ProfileStickerItem[]
): Promise<void> {
  const r = ref(db, stickersPath(ownerUid))
  const newRef = push(r)
  const id = newRef.key!
  const maxZ = currentStickers.reduce((max, s) => Math.max(max, s.zOrder ?? 0), 0)
  const now = new Date().toISOString()
  const item: ProfileStickerItem = {
    id,
    type: 'board-sticker',
    stickerKey,
    x: 150,
    y: 180,
    width: 90,
    height: 90,
    rotation: 0,
    zOrder: maxZ + 1,
    createdBy: ownerUid,
    createdAt: now,
    updatedAt: now,
    updatedBy: ownerUid,
  }
  await set(newRef, item)
}

export async function updateProfileSticker(
  ownerUid: string,
  id: string,
  data: Partial<ProfileStickerItem>
): Promise<void> {
  await update(ref(db, `${stickersPath(ownerUid)}/${id}`), {
    ...data,
    updatedAt: new Date().toISOString(),
    updatedBy: ownerUid,
  })
}

export async function deleteProfileSticker(ownerUid: string, id: string): Promise<void> {
  await remove(ref(db, `${stickersPath(ownerUid)}/${id}`))
}
