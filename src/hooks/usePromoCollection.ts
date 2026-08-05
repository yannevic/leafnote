import { useEffect, useState, useRef } from 'react'
import {
  subscribePromoCollection,
  ensurePromoCollectionCurrent,
  PromoCollectionState,
} from '../lib/promoCollection'

export function usePromoCollection(coupleId: string) {
  const [state, setState] = useState<PromoCollectionState | null>(null)
  const [loading, setLoading] = useState(true)
  const checkedRef = useRef(false)

  useEffect(() => {
    if (!checkedRef.current) {
      checkedRef.current = true
      ensurePromoCollectionCurrent(coupleId)
    }
    const unsubscribe = subscribePromoCollection(coupleId, (val) => {
      setState(val)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [coupleId])

  return { state, loading }
}
