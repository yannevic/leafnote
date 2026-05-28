import { ref, push, set, get, onValue, query, orderByChild, equalTo } from 'firebase/database'
import { db } from './firebase'

function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)]
  return code
}

export async function createCouple(uid: string): Promise<{ coupleId: string; inviteCode: string }> {
  const inviteCode = generateInviteCode()
  const coupleRef = push(ref(db, 'couples'))
  const coupleId = coupleRef.key!

  await set(ref(db, `couples/${coupleId}/meta`), {
    inviteCode,
    createdBy: uid,
    members: { [uid]: true },
  })
  await set(ref(db, `users/${uid}/coupleId`), coupleId)

  return { coupleId, inviteCode }
}

export async function joinCouple(uid: string, code: string): Promise<string> {
  const snap = await get(
    query(ref(db, 'couples'), orderByChild('meta/inviteCode'), equalTo(code.toUpperCase().trim()))
  )

  if (!snap.exists()) throw new Error('Código inválido')

  let coupleId: string | null = null
  snap.forEach((child) => {
    coupleId = child.key
  })
  if (!coupleId) throw new Error('Código inválido')

  const membersSnap = await get(ref(db, `couples/${coupleId}/meta/members`))
  const members = membersSnap.val() ?? {}
  if (Object.keys(members).length >= 2 && !members[uid]) {
    throw new Error('Esse casal já está completo')
  }

  await set(ref(db, `couples/${coupleId}/meta/members/${uid}`), true)
  await set(ref(db, `users/${uid}/coupleId`), coupleId)

  return coupleId
}

export function watchCoupleMembers(
  coupleId: string,
  cb: (members: Record<string, boolean>) => void
): () => void {
  const r = ref(db, `couples/${coupleId}/meta/members`)
  const unsub = onValue(r, (snap) => cb(snap.val() ?? {}))
  return unsub
}

export function watchInviteCode(coupleId: string, cb: (code: string) => void): () => void {
  const r = ref(db, `couples/${coupleId}/meta/inviteCode`)
  const unsub = onValue(r, (snap) => {
    if (snap.exists()) cb(String(snap.val()))
  })
  return unsub
}
