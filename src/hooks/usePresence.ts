import { useEffect, useState } from 'react'
import { ref, onValue, off } from 'firebase/database'
import { db } from '../lib/firebase'
import { PresenceData, publishPresence } from '../lib/presence'

export function usePresence(uid: string, displayName: string) {
  const [allPresence, setAllPresence] = useState<Record<string, PresenceData>>({})

  useEffect(() => {
    if (!uid || !displayName) return
    publishPresence(uid, displayName)
    const interval = setInterval(() => publishPresence(uid, displayName), 30000)
    return () => clearInterval(interval)
  }, [uid, displayName])

  useEffect(() => {
    const presRef = ref(db, 'presence')
    onValue(presRef, (snap) => {
      setAllPresence((snap.val() as Record<string, PresenceData>) ?? {})
    })
    return () => off(presRef, 'value')
  }, [])

  const myPresence = allPresence[uid] ?? null

  const partnerEntry = Object.entries(allPresence).find(([id]) => id !== uid)
  const partnerUid = partnerEntry ? partnerEntry[0] : ''
  const partnerPresence = partnerEntry ? partnerEntry[1] : null

  return { myPresence, partnerPresence, partnerUid }
}
