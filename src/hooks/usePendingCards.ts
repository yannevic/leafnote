import { useEffect, useState } from 'react'
import { subscribePendingCards, PendingCardInstance } from '../lib/pendingCards'

export function usePendingCards(coupleId: string, uid: string) {
  const [pending, setPending] = useState<PendingCardInstance[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!coupleId || !uid) return
    setLoading(true)
    const unsubscribe = subscribePendingCards(coupleId, uid, (list) => {
      setPending(list)
      setLoading(false)
    })
    return unsubscribe
  }, [coupleId, uid])

  return { pending, loading }
}
