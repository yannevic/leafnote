import { createContext, useContext, useEffect, useState } from 'react'
import { ref, onValue } from 'firebase/database'
import { db } from '../lib/firebase'
import { User } from 'firebase/auth'
import { watchCoupleMembers } from '../lib/couple'

interface CoupleContextValue {
  coupleId: string | null
  loadingCoupleId: boolean
  waitingPartner: boolean
  inviteCode: string | null
}

const CoupleContext = createContext<CoupleContextValue>({
  coupleId: null,
  loadingCoupleId: true,
  waitingPartner: false,
  inviteCode: null,
})

export function CoupleProvider({ user, children }: { user: User; children: React.ReactNode }) {
  const [coupleId, setCoupleId] = useState<string | null>(null)
  const [loadingCoupleId, setLoadingCoupleId] = useState(true)
  const [waitingPartner, setWaitingPartner] = useState(false)
  const [inviteCode, setInviteCode] = useState<string | null>(null)

  // Ouve coupleId em tempo real
  useEffect(() => {
    const r = ref(db, `users/${user.uid}/coupleId`)
    const unsub = onValue(r, (snap) => {
      setCoupleId(snap.exists() ? String(snap.val()) : null)
      setLoadingCoupleId(false)
    })
    return unsub
  }, [user.uid])

  // Ouve membros + inviteCode quando coupleId existir
  useEffect(() => {
    if (!coupleId) {
      setWaitingPartner(false)
      setInviteCode(null)
      return
    }

    const unsubMembers = watchCoupleMembers(coupleId, (members) => {
      setWaitingPartner(Object.keys(members).length < 2)
    })

    const unsubCode = onValue(ref(db, `couples/${coupleId}/meta/inviteCode`), (snap) => {
      setInviteCode(snap.exists() ? String(snap.val()) : null)
    })

    return () => {
      unsubMembers()
      unsubCode()
    }
  }, [coupleId])

  return (
    <CoupleContext.Provider value={{ coupleId, loadingCoupleId, waitingPartner, inviteCode }}>
      {children}
    </CoupleContext.Provider>
  )
}

export function useCoupleId() {
  return useContext(CoupleContext)
}
