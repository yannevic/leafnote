import { useState, useEffect } from 'react'
import { subscribePityCount } from '../lib/packs'

export function usePityCount(coupleId: string, uid: string) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const unsubscribe = subscribePityCount(coupleId, uid, setCount)
    return () => unsubscribe()
  }, [coupleId, uid])

  return count
}
