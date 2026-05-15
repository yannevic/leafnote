import { X, Sprout, Lock } from 'lucide-react'
import { PiMoneyWavyLight } from 'react-icons/pi'
import { BASE_MAX_PLANTS, SLOT_PRICES, MAX_SLOTS } from '../../lib/garden'

interface SlotUpgradeModalProps {
  currentMax: number
  coins: number
  onBuy: () => Promise<{ success: boolean; cost: number }>
  onClose: () => void
}

const T = {
  bg: 'linear-gradient(160deg, rgba(253,246,240,0.97) 0%, rgba(252,232,238,0.97) 100%)',
  border: '1.5px solid rgba(232,160,176,0.4)',
  shadow: '0 8px 40px rgba(200,120,140,0.2), inset 0 1px 0 rgba(255,255,255,0.6)',
  text: '#3d1a10',
  textSub: 'rgba(61,26,16,0.5)',
  textLabel: 'rgba(122,48,64,0.55)',
  card: 'rgba(253,242,246,0.7)',
  cardBorder: '1.5px solid rgba(232,160,176,0.3)',
  btnIcon: 'rgba(200,120,140,0.15)',
  btnPrimary: 'rgba(232,160,176,0.55)',
  btnDisabled: 'rgba(232,160,176,0.2)',
}

export default function SlotUpgradeModal({
  currentMax,
  coins,
  onBuy,
  onClose,
}: SlotUpgradeModalProps) {
  const nextSlotIndex = currentMax - BASE_MAX_PLANTS
  const isMaxed = currentMax >= MAX_SLOTS
  const nextCost = !isMaxed ? SLOT_PRICES[nextSlotIndex] : null
  const canAfford = nextCost != null && coins >= nextCost

  const handleBuy = async () => {
    if (!canAfford) return
    await onBuy()
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(44,20,8,0.45)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 300,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: T.bg,
          border: T.border,
          borderRadius: 20,
          width: 320,
          maxWidth: '92vw',
          padding: '22px 22px 20px',
          fontFamily: 'Baloo 2, sans-serif',
          boxShadow: T.shadow,
          backdropFilter: 'blur(18px) saturate(1.4)',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 16,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <Sprout size={15} strokeWidth={2} color="rgba(122,48,64,0.6)" />
            <span style={{ fontSize: 15, fontWeight: 800, color: T.text }}>expandir jardim</span>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              border: 'none',
              background: T.btnIcon,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
            }}
          >
            <X size={13} strokeWidth={2.5} color="rgba(122,48,64,0.7)" />
          </button>
        </div>

        {/* Slots list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 16 }}>
          {SLOT_PRICES.map((price, i) => {
            const slotNum = BASE_MAX_PLANTS + i + 1
            const unlocked = currentMax > BASE_MAX_PLANTS + i
            const isNext = currentMax === BASE_MAX_PLANTS + i
            return (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: unlocked
                    ? 'rgba(74,122,74,0.08)'
                    : isNext
                      ? T.card
                      : 'rgba(200,120,140,0.06)',
                  border: unlocked
                    ? '1.5px solid rgba(74,122,74,0.25)'
                    : isNext
                      ? '1.5px solid rgba(232,160,176,0.5)'
                      : '1.5px dashed rgba(200,120,140,0.2)',
                  borderRadius: 11,
                  padding: '9px 13px',
                  opacity: !unlocked && !isNext ? 0.55 : 1,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {unlocked ? (
                    <Sprout size={14} color="#4A7A4A" strokeWidth={2} />
                  ) : (
                    <Lock size={13} color="rgba(122,48,64,0.4)" strokeWidth={2} />
                  )}
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 800,
                      color: unlocked ? '#4A7A4A' : T.text,
                    }}
                  >
                    {slotNum}º vaso
                  </span>
                  {unlocked && (
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: '#4A7A4A',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                      }}
                    >
                      desbloqueado
                    </span>
                  )}
                </div>
                {!unlocked && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <PiMoneyWavyLight size={13} color="rgba(122,48,64,0.5)" />
                    <span style={{ fontSize: 13, fontWeight: 800, color: T.textSub }}>{price}</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Saldo + botão */}
        {!isMaxed ? (
          <>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 12,
                padding: '7px 13px',
                background: T.card,
                border: T.cardBorder,
                borderRadius: 10,
              }}
            >
              <span style={{ fontSize: 12, fontWeight: 700, color: T.textLabel }}>seu saldo</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <PiMoneyWavyLight size={14} color="rgba(122,48,64,0.6)" />
                <span style={{ fontSize: 13, fontWeight: 800, color: T.text }}>{coins}</span>
              </div>
            </div>
            <button
              onClick={handleBuy}
              disabled={!canAfford}
              style={{
                width: '100%',
                padding: '10px 0',
                borderRadius: 12,
                border: 'none',
                background: canAfford ? T.btnPrimary : T.btnDisabled,
                color: canAfford ? T.text : 'rgba(61,26,16,0.35)',
                fontFamily: 'Baloo 2, sans-serif',
                fontWeight: 800,
                fontSize: 13,
                cursor: canAfford ? 'pointer' : 'default',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 7,
              }}
            >
              <PiMoneyWavyLight size={14} />
              {canAfford ? `comprar por ${nextCost} moedas` : `faltam ${nextCost! - coins} moedas`}
            </button>
          </>
        ) : (
          <div
            style={{
              textAlign: 'center',
              fontSize: 13,
              fontWeight: 800,
              color: '#4A7A4A',
              padding: '6px 0',
            }}
          >
            jardim no tamanho máximo!
          </div>
        )}
      </div>
    </div>
  )
}
