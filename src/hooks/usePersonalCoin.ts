import { useState, useEffect } from 'react'
import { subscribePersonalCoin, PersonalCoin } from '../lib/personalCoin'

export function usePersonalCoin(uid: string | null) {
  const [coin, setCoin] = useState<PersonalCoin | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!uid) {
      setCoin(null)
      setLoading(false)
      return
    }
    setLoading(true)
    const unsubscribe = subscribePersonalCoin(uid, (data) => {
      setCoin(data)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [uid])

  return { coin, loading, needsSetup: !loading && !coin?.name }
}
