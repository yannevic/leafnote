import { useState, useRef } from 'react'
import { X, ArrowLeftRight, Coins } from 'lucide-react'
import { transferPersonalToCouple, transferCoupleToPersonal } from '../../lib/coinTransfer'

interface Props {
  coupleId: string
  uid: string
  partnerUid: string
  personalBalance: number
  coupleBalance: number
  onClose: () => void
  onDone: (msg: string) => void
}

type Direction = 'toCouple' | 'toPersonal'

export default function CoinTransferModal({
  coupleId,
  uid,
  partnerUid,
  personalBalance,
  coupleBalance,
  onClose,
  onDone,
}: Props) {
  const [direction, setDirection] = useState<Direction>('toCouple')
  const [amount, setAmount] = useState('')
  const [confirming, setConfirming] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const mouseDownOnBackdrop = useRef(false)

  const numericAmount = parseInt(amount, 10) || 0
  const maxAvailable = direction === 'toCouple' ? personalBalance : coupleBalance
  const myShare = direction === 'toPersonal' ? Math.ceil(numericAmount / 2) : numericAmount
  const partnerShare = direction === 'toPersonal' ? numericAmount - myShare : 0

  function handleRequestConfirm() {
    setError(null)
    if (numericAmount <= 0) {
      setError('digite um valor válido')
      return
    }
    if (numericAmount > maxAvailable) {
      setError('saldo insuficiente')
      return
    }
    setConfirming(true)
  }

  async function handleConfirm() {
    setSubmitting(true)
    setError(null)
    try {
      const ok =
        direction === 'toCouple'
          ? await transferPersonalToCouple(coupleId, uid, numericAmount)
          : await transferCoupleToPersonal(coupleId, uid, partnerUid, numericAmount)

      if (!ok) {
        setError('não foi possível transferir — saldo insuficiente')
        setConfirming(false)
        return
      }
      onDone(
        direction === 'toCouple'
          ? `${numericAmount} moedas transferidas pra moeda conjunta!`
          : `${numericAmount} moedas puxadas — você ficou com ${myShare}, seu parceiro com ${partnerShare}`
      )
      onClose()
    } catch {
      setError('erro ao transferir, tenta de novo')
      setConfirming(false)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(44,20,8,0.35)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999999,
      }}
      onMouseDown={(e) => {
        mouseDownOnBackdrop.current = e.target === e.currentTarget
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && mouseDownOnBackdrop.current) onClose()
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background:
            'linear-gradient(160deg, rgba(253,246,240,0.97) 0%, rgba(252,232,238,0.97) 100%)',
          border: '1.5px solid rgba(232,160,176,0.4)',
          borderRadius: 20,
          width: 360,
          maxWidth: '95vw',
          fontFamily: 'Baloo 2, sans-serif',
          boxShadow: '0 8px 40px rgba(200,120,140,0.2), inset 0 1px 0 rgba(255,255,255,0.6)',
          backdropFilter: 'blur(18px) saturate(1.4)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '18px 22px 14px',
            borderBottom: '2px dashed rgba(232,160,176,0.4)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <ArrowLeftRight size={15} color="rgba(122,48,64,0.6)" strokeWidth={2} />
            <span style={{ fontSize: 15, fontWeight: 800, color: '#3d1a10' }}>
              transferir moeda
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(200,120,140,0.15)',
              border: 'none',
              borderRadius: '50%',
              width: 28,
              height: 28,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            <X size={13} color="rgba(122,48,64,0.7)" strokeWidth={2.5} />
          </button>
        </div>

        <div
          style={{ padding: '16px 22px 22px', display: 'flex', flexDirection: 'column', gap: 12 }}
        >
          {!confirming ? (
            <>
              <div style={{ display: 'flex', gap: 6 }}>
                <DirBtn
                  active={direction === 'toCouple'}
                  onClick={() => {
                    setDirection('toCouple')
                    setError(null)
                  }}
                  label="pessoal → conjunta"
                />
                <DirBtn
                  active={direction === 'toPersonal'}
                  onClick={() => {
                    setDirection('toPersonal')
                    setError(null)
                  }}
                  label="conjunta → pessoal"
                />
              </div>

              <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(61,26,16,0.55)' }}>
                {direction === 'toCouple' ? (
                  <>disponível: {personalBalance} moedas suas</>
                ) : (
                  <>
                    disponível: {coupleBalance} moedas do casal — o valor puxado é dividido entre
                    vocês dois (você fica com a parte maior se for ímpar)
                  </>
                )}
              </div>

              <div style={{ position: 'relative' }}>
                <Coins
                  size={14}
                  color="rgba(122,48,64,0.4)"
                  style={{
                    position: 'absolute',
                    left: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                  }}
                />
                <input
                  type="number"
                  min={1}
                  max={maxAvailable}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="quantidade"
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 32px',
                    borderRadius: 10,
                    border: '1.5px solid rgba(232,160,176,0.4)',
                    background: 'rgba(253,242,246,0.7)',
                    fontFamily: 'Baloo 2, sans-serif',
                    fontSize: 13,
                    fontWeight: 700,
                    color: '#3d1a10',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {direction === 'toPersonal' && numericAmount > 0 && (
                <div style={{ fontSize: 10.5, fontWeight: 700, color: '#4A7A4A' }}>
                  você recebe {myShare} · seu parceiro recebe {partnerShare}
                </div>
              )}

              {error && (
                <div style={{ fontSize: 11, color: '#e8607a', fontWeight: 700 }}>{error}</div>
              )}

              <button
                onClick={handleRequestConfirm}
                style={{
                  width: '100%',
                  background: 'rgba(232,160,176,0.55)',
                  color: '#3d1a10',
                  border: 'none',
                  borderRadius: 12,
                  padding: '11px 0',
                  fontSize: 13.5,
                  fontWeight: 800,
                  fontFamily: 'Baloo 2, sans-serif',
                  cursor: 'pointer',
                }}
              >
                continuar
              </button>
            </>
          ) : (
            <>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: '#3d1a10', lineHeight: 1.6 }}>
                {direction === 'toCouple' ? (
                  <>
                    tem certeza que quer enviar <b>{numericAmount} moedas suas</b> pra moeda do
                    casal?
                  </>
                ) : (
                  <>
                    tem certeza que quer puxar <b>{numericAmount} moedas</b> do casal? você fica com{' '}
                    {myShare}, seu parceiro com {partnerShare}.
                  </>
                )}
              </div>

              {error && (
                <div style={{ fontSize: 11, color: '#e8607a', fontWeight: 700 }}>{error}</div>
              )}

              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => setConfirming(false)}
                  disabled={submitting}
                  style={{
                    flex: 1,
                    background: 'rgba(139,105,20,0.12)',
                    color: '#8b6914',
                    border: 'none',
                    borderRadius: 12,
                    padding: '10px 0',
                    fontSize: 12.5,
                    fontWeight: 800,
                    fontFamily: 'Baloo 2, sans-serif',
                    cursor: 'pointer',
                  }}
                >
                  voltar
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={submitting}
                  style={{
                    flex: 1,
                    background: '#4A7A4A',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 12,
                    padding: '10px 0',
                    fontSize: 12.5,
                    fontWeight: 800,
                    fontFamily: 'Baloo 2, sans-serif',
                    cursor: 'pointer',
                    opacity: submitting ? 0.6 : 1,
                  }}
                >
                  {submitting ? 'enviando...' : 'confirmar'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function DirBtn({
  active,
  onClick,
  label,
}: {
  active: boolean
  onClick: () => void
  label: string
}) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        border: active ? '2px solid #4A7A4A' : '1.5px solid rgba(232,160,176,0.35)',
        borderRadius: 10,
        padding: '8px 4px',
        background: active ? 'rgba(74,122,74,0.12)' : 'rgba(253,242,246,0.7)',
        color: active ? '#2D4A2D' : 'rgba(61,26,16,0.55)',
        fontFamily: 'Baloo 2, sans-serif',
        fontSize: 10.5,
        fontWeight: 800,
        cursor: 'pointer',
      }}
    >
      {label}
    </button>
  )
}
