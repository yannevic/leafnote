import { ref, onValue, off, update } from 'firebase/database'
import { db } from './firebase'

export interface DollLayout {
  x: number
  y: number
  pinned: boolean
  flipped: boolean
}

export const DEFAULT_DOLL_LAYOUT: DollLayout = {
  x: 200,
  y: 160,
  pinned: false,
  flipped: false,
}

// Path: users/{uid}/profile/layout/doll
// Já coberto pela regra geral de users/{uid}/profile
// (leitura liberada pro parceiro, escrita só do dono) — não precisa
// de regra nova no Firebase.
export function subscribeDollLayout(
  uid: string,
  callback: (layout: DollLayout) => void
): () => void {
  const r = ref(db, `users/${uid}/profile/layout/doll`)
  const handler = onValue(r, (snap) => {
    const val = snap.val() as Partial<DollLayout> | null
    const merged = { ...DEFAULT_DOLL_LAYOUT, ...(val ?? {}) }
    queueMicrotask(() => callback(merged))
  })
  return () => off(r, 'value', handler)
}

export async function saveDollLayout(uid: string, patch: Partial<DollLayout>): Promise<void> {
  const updates: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(patch)) {
    updates[`users/${uid}/profile/layout/doll/${key}`] = value
  }
  await update(ref(db), updates)
}

export interface PanelLayout {
  x: number
  y: number
}

export function subscribePanelLayout(
  uid: string,
  callback: (layout: PanelLayout | null) => void
): () => void {
  const r = ref(db, `users/${uid}/profile/layout/panel`)
  const handler = onValue(r, (snap) => {
    const val = snap.val() as PanelLayout | null
    queueMicrotask(() => callback(val))
  })
  return () => off(r, 'value', handler)
}

export async function savePanelLayout(uid: string, pos: PanelLayout): Promise<void> {
  await update(ref(db), {
    [`users/${uid}/profile/layout/panel/x`]: pos.x,
    [`users/${uid}/profile/layout/panel/y`]: pos.y,
  })
}
