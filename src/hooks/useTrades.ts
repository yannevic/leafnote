import { useEffect, useState } from 'react'
import { subscribeTrades, Trade } from '../lib/trades'

export function useTrades(coupleId: string | null) {
  const [trades, setTrades] = useState<Trade[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!coupleId) {
      setTrades([])
      setLoading(false)
      return
    }
    setLoading(true)
    const unsubscribe = subscribeTrades(coupleId, (list) => {
      setTrades(list)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [coupleId])

  return { trades, loading }
}
