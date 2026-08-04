import { useEffect, useState } from 'react'
import { subscribeUnopenedPacks, UnopenedPack } from '../lib/unopenedPacks'

export function useUnopenedPacks(coupleId: string, uid: string) {
  const [packs, setPacks] = useState<UnopenedPack[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!coupleId || !uid) return
    setLoading(true)
    const unsubscribe = subscribeUnopenedPacks(coupleId, uid, (list) => {
      setPacks(list)
      setLoading(false)
    })
    return unsubscribe
  }, [coupleId, uid])

  return { packs, loading }
}
