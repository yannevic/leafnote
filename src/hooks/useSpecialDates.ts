import { useEffect, useState, useCallback } from 'react'
import { ref, onValue, set } from 'firebase/database'
import { db } from '../lib/firebase'
import type { SpecialDates } from '../lib/specialDates'
import { EMPTY_SPECIAL_DATES } from '../lib/specialDates'

export function useSpecialDates(coupleId: string) {
  const [dates, setDates] = useState<SpecialDates>(EMPTY_SPECIAL_DATES)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const r = ref(db, `couples/${coupleId}/specialDates`)
    const unsub = onValue(r, (snap) => {
      const val = snap.val() as SpecialDates | null
      setDates(val ?? EMPTY_SPECIAL_DATES)
      setLoaded(true)
    })
    return () => unsub()
  }, [coupleId])

  const saveDates = useCallback(
    (d: SpecialDates) => {
      set(ref(db, `couples/${coupleId}/specialDates`), d)
    },
    [coupleId]
  )

  return { dates, loaded, saveDates }
}
