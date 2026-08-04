import { useState, useEffect } from 'react'
import { ref, onValue } from 'firebase/database'
import { db } from '../lib/firebase'

export type Inventory = Record<string, Record<string, number>>
// formato: { collectionId: { cardId: quantidade } }

export function useCardInventory(coupleId: string | null, uid: string | null) {
  const [inventory, setInventory] = useState<Inventory>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!coupleId || !uid) {
      setInventory({})
      setLoading(false)
      return
    }
    const invRef = ref(db, `couples/${coupleId}/cards/inventory/${uid}`)
    const unsubscribe = onValue(invRef, (snapshot) => {
      setInventory(snapshot.val() ?? {})
      setLoading(false)
    })
    return () => unsubscribe()
  }, [coupleId, uid])

  return { inventory, loading }
}
