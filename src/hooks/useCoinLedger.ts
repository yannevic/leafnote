import { useState, useEffect } from 'react'
import { subscribeCoinLedger, CoinLedgerEntry } from '../lib/personalCoin'

export function useCoinLedger(uid: string | null, limit = 50) {
  const [entries, setEntries] = useState<CoinLedgerEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!uid) {
      setEntries([])
      setLoading(false)
      return
    }
    setLoading(true)
    const unsubscribe = subscribeCoinLedger(
      uid,
      (data) => {
        setEntries(data)
        setLoading(false)
      },
      limit
    )
    return () => unsubscribe()
  }, [uid, limit])

  return { entries, loading }
}
