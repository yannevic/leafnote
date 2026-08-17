import { useState, useEffect } from 'react'
import { subscribePendingActivities, PendingActivity } from '../lib/activities'

export function usePendingActivities(coupleId: string) {
  const [activities, setActivities] = useState<PendingActivity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = subscribePendingActivities(coupleId, (data) => {
      setActivities(data)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [coupleId])

  return { activities, loading }
}
