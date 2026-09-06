// src/components/PersonalCoinBadge.tsx
import { useEffect, useState } from 'react'
import { Coins } from 'lucide-react'
import { subscribePersonalCoin, type PersonalCoin } from '../lib/personalCoin'
import { COIN_ICONS } from '../lib/personalCoinIcons'

interface Props {
  uid: string
  size?: number
  amount?: number
}

export default function PersonalCoinBadge({ uid, size = 14, amount }: Props) {
  const [coin, setCoin] = useState<PersonalCoin | null>(null)

  useEffect(() => {
    return subscribePersonalCoin(uid, setCoin)
  }, [uid])

  const value = amount ?? coin?.balance ?? 0
  // ícone exato que a pessoa escolheu ao configurar a própria moeda pessoal
  // (CoinIconKey, lib/personalCoinIcons.tsx); Coins genérico só entra se a
  // pessoa ainda não configurou a moeda (setupPersonalCoin nunca chamado)
  const IconComponent = coin?.icon ? COIN_ICONS[coin.icon] : Coins

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        fontSize: size >= 14 ? 12 : 10,
        fontWeight: 800,
        color: '#3d1a10',
      }}
    >
      <IconComponent size={size} color={coin?.color || 'rgba(200,120,140,0.8)'} strokeWidth={2.2} />
      {value}
    </div>
  )
}
