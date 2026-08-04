import { useEffect, useState } from 'react'

export interface Countdown {
  days: number
  hours: number
  minutes: number
  seconds: number
  totalMs: number
  expired: boolean
}

// targetTimestamp: epoch em ms (ex: shopData.nextRotation). Como é um
// timestamp absoluto, a diferença pro "agora" já funciona certo
// independente do fuso horário de quem está vendo — não precisa
// converter nada pra horário de Brasília aqui, isso já deve estar
// embutido em como nextRotation foi calculado em rotatingShop.ts.
export function useCountdown(targetTimestamp: number | null): Countdown | null {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (targetTimestamp === null) return
    const interval = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(interval)
  }, [targetTimestamp])

  if (targetTimestamp === null) return null

  const totalMs = Math.max(0, targetTimestamp - now)
  const days = Math.floor(totalMs / (24 * 60 * 60 * 1000))
  const hours = Math.floor((totalMs % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000))
  const minutes = Math.floor((totalMs % (60 * 60 * 1000)) / (60 * 1000))
  const seconds = Math.floor((totalMs % (60 * 1000)) / 1000)

  return { days, hours, minutes, seconds, totalMs, expired: totalMs <= 0 }
}

export function formatCountdown(c: Countdown): string {
  if (c.expired) return 'renovando...'
  if (c.days > 0) return `${c.days}d ${c.hours}h`
  if (c.hours > 0) return `${c.hours}h ${c.minutes}min`
  return `${c.minutes}min ${c.seconds}s`
}
