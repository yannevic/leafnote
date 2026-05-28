import { useState, useEffect } from 'react'
import { useCoupleId } from '../contexts/CoupleContext'
import { ActivityEntry, subscribeActivityLog } from '../lib/widgets'

export function useActivityLog() {
  const { coupleId } = useCoupleId()
  const [entries, setEntries] = useState<ActivityEntry[]>([])

  useEffect(() => {
    const unsub = subscribeActivityLog(coupleId!, setEntries)
    return unsub
  }, [coupleId])

  return entries
}
