// src/components/PurchaseConfirmModal.tsx
import { useEffect, useState } from 'react'
import { Check, ShoppingBag } from 'lucide-react'
import { subscribePersonalCoin } from '../lib/personalCoin'
import PersonalCoinBadge from './PersonalCoinBadge'

const T = {
  bg: 'linear-gradient(160deg, rgba(253,246,240,0.97) 0%, rgba(252,232,238,0.97) 100%)',
  card: 'rgba(253,242,246,0.7)',
  cardBorder: '1.5px solid rgba(232,160,176,0.3)',
  border: '1.5px solid rgba(232,160,176,0.4)',
  borderDashed: '2px dashed rgba(232,160,176,0.4)',
  text: '#3d1a10',
  textSub: 'rgba(61,26,16,0.5)',
}

interface Props {
  uid: string
  label: string
  price: number
  onConfirm: () => void
  onCancel: () => void
}

export default function PurchaseConfirmModal({ uid, label, price, onConfirm, onCancel }: Props) {
  const [coins, setCoins] = useState(0)

  useEffect(() => subscribePersonalCoin(uid, (d) => setCoins(d?.balance ?? 0)), [uid])

  const canAfford = coins >= price

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999999,
        background: 'rgba(61,26,16,0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backdropFilter: 'blur(4px)',
      }}
      onClick={onCancel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 260,
          background: T.bg,
          border: T.border,
          borderRadius: 18,
          overflow: 'hidden',
          fontFamily: 'Baloo 2, sans-serif',
        }}
      >
        <div
          style={{
            padding: '20px 18px 14px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8,
            borderBottom: T.borderDashed,
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              background: canAfford ? 'rgba(74,122,74,0.15)' : 'rgba(232,96,122,0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ShoppingBag size={19} color={canAfford ? '#4A7A4A' : '#e8607a'} strokeWidth={2} />
          </div>
          <span style={{ fontSize: 14, fontWeight: 800, color: T.text, textAlign: 'center' }}>
            {canAfford ? `comprar ${label}?` : 'moedas insuficientes'}
          </span>
        </div>

        <div
          style={{ padding: '14px 18px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: T.card,
              borderRadius: 10,
              padding: '7px 12px',
              border: T.cardBorder,
            }}
          >
            <span style={{ fontSize: 11, color: T.textSub, fontWeight: 600 }}>custo</span>
            <PersonalCoinBadge uid={uid} amount={price} size={15} />
          </div>

          {!canAfford && (
            <p
              style={{
                margin: 0,
                textAlign: 'center',
                fontSize: 11,
                color: T.textSub,
                lineHeight: 1.5,
              }}
            >
              continue jogando pra ganhar mais moedas
            </p>
          )}

          <div style={{ display: 'flex', gap: 8, marginTop: 2 }}>
            <button
              onClick={onCancel}
              style={{
                flex: 1,
                padding: '9px 0',
                borderRadius: 12,
                border: T.border,
                background: 'transparent',
                fontFamily: 'Baloo 2, sans-serif',
                fontWeight: 800,
                fontSize: 12,
                cursor: 'pointer',
                color: T.textSub,
              }}
            >
              {canAfford ? 'cancelar' : 'fechar'}
            </button>
            {canAfford && (
              <button
                onClick={onConfirm}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 5,
                  padding: '9px 0',
                  borderRadius: 12,
                  border: 'none',
                  background: 'rgba(232,160,176,0.55)',
                  fontFamily: 'Baloo 2, sans-serif',
                  fontWeight: 800,
                  fontSize: 12,
                  cursor: 'pointer',
                  color: T.text,
                }}
              >
                <Check size={12} strokeWidth={2.5} /> comprar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
