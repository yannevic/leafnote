// src/lib/profileComments.ts
import { ref, push, set, remove, onValue, off } from 'firebase/database'
import { db } from './firebase'

export interface ProfileComment {
  id: string
  authorUid: string
  text: string
  createdAt: number
}

export const MAX_COMMENT_LENGTH = 200

export function addProfileComment(profileUid: string, authorUid: string, text: string) {
  const trimmed = text.trim().slice(0, MAX_COMMENT_LENGTH)
  if (!trimmed) return
  const commentsRef = ref(db, `users/${profileUid}/profile/comments`)
  const newRef = push(commentsRef)
  return set(newRef, {
    authorUid,
    text: trimmed,
    createdAt: Date.now(),
  })
}

export function deleteProfileComment(profileUid: string, commentId: string) {
  return remove(ref(db, `users/${profileUid}/profile/comments/${commentId}`))
}

export function subscribeProfileComments(
  profileUid: string,
  callback: (comments: ProfileComment[]) => void
) {
  const commentsRef = ref(db, `users/${profileUid}/profile/comments`)
  const handler = onValue(commentsRef, (snap) => {
    const data = (snap.val() ?? {}) as Record<
      string,
      { authorUid: string; text: string; createdAt: number }
    >
    const list: ProfileComment[] = Object.entries(data).map(([id, c]) => ({ id, ...c }))
    list.sort((a, b) => b.createdAt - a.createdAt)
    callback(list)
  })
  return () => off(commentsRef, 'value', handler)
}
