import { useEffect, useState } from 'react'
import { getRotatingShop, RotatingShopData } from '../lib/rotatingShop'

export function useRotatingShop(coupleId: string, refreshKey: number) {
  const [data, setData] = useState<RotatingShopData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    setLoading(true)
    getRotatingShop(coupleId).then((d) => {
      if (active) {
        setData(d)
        setLoading(false)
      }
    })
    return () => {
      active = false
    }
  }, [coupleId, refreshKey])

  return { data, loading }
}
