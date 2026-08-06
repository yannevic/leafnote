import { useEffect, useState } from 'react'
import { ref, onValue, off } from 'firebase/database'
import { db } from '../lib/firebase'
import { PresenceData, publishPresence } from '../lib/presence'

export function usePresence(coupleId: string, uid: string, displayName: string) {
  const [allPresence, setAllPresence] = useState<Record<string, PresenceData>>({})
  const [partnerUid, setPartnerUid] = useState('')

  useEffect(() => {
    if (!uid || !displayName) return
    publishPresence(uid, displayName)
    const interval = setInterval(() => publishPresence(uid, displayName), 30000)
    return () => clearInterval(interval)
  }, [uid, displayName])

  useEffect(() => {
    const presRef = ref(db, 'presence')
    const handler = onValue(presRef, (snap) => {
      setAllPresence((snap.val() as Record<string, PresenceData>) ?? {})
    })
    return () => off(presRef, 'value', handler)
  }, [])

  // ⚠️ o parceiro é SEMPRE determinado pelos membros reais do casal
  // (couples/{coupleId}/meta/members) — nunca "qualquer outro uid online",
  // já que o nó presence é global e pode conter outros casais/contas de teste
  useEffect(() => {
    if (!coupleId) return
    const membersRef = ref(db, `couples/${coupleId}/meta/members`)
    const handler = onValue(membersRef, (snap) => {
      const members = (snap.val() as Record<string, boolean>) ?? {}
      const otherUid = Object.keys(members).find((id) => id !== uid) ?? ''
      setPartnerUid(otherUid)
    })
    return () => off(membersRef, 'value', handler)
  }, [coupleId, uid])

  const myPresence = allPresence[uid] ?? null
  const partnerPresence = partnerUid ? (allPresence[partnerUid] ?? null) : null

  return { myPresence, partnerPresence, partnerUid }
}
