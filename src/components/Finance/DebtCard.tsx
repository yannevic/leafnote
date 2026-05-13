import { useState } from 'react'
import { Check, Trash2 } from 'lucide-react'
import { Debt, formatCurrency } from '../../lib/finance'

interface Props {
  debt: Debt
  uid: string
  myNick: string
  partnerNick: string
  onPay: (id: string) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

export default function DebtCard({ debt, uid, myNick, partnerNick, onPay, onDelete }: Props) {
  const [confirmPay, setConfirmPay] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [loading, setLoading] = useState(false)

  function nickForUid(u: string) {
    if (u === uid) return myNick
    return partnerNick
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  async function handlePay() {
    setLoading(true)
    try {
      await onPay(debt.id)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    setLoading(true)
    try {
      await onDelete(debt.id)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        background: 'rgba(253,242,246,0.7)',
        border: '1.5px solid rgba(232,160,176,0.3)',
        borderRadius: 12,
        padding: '10px 12px',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        opacity: debt.paid ? 0.55 : 1,
      }}
    >
      {/* linha principal */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* quem deve pra quem */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
            <span
              style={{
                fontSize: 11,
                fontWeight: 800,
                color: debt.fromUid === uid ? '#e8607a' : '#4A7A4A',
                background: debt.fromUid === uid ? 'rgba(232,96,122,0.1)' : 'rgba(74,122,74,0.1)',
                padding: '2px 7px',
                borderRadius: 99,
              }}
            >
              {nickForUid(debt.fromUid)}
            </span>
            <span style={{ fontSize: 10, fontWeight: 600, color: 'rgba(61,26,16,0.4)' }}>
              deve para
            </span>
            <span
              style={{
                fontSize: 11,
                fontWeight: 800,
                color: debt.toUid === uid ? '#4A7A4A' : '#e8607a',
                background: debt.toUid === uid ? 'rgba(74,122,74,0.1)' : 'rgba(232,96,122,0.1)',
                padding: '2px 7px',
                borderRadius: 99,
              }}
            >
              {nickForUid(debt.toUid)}
            </span>
          </div>

          <div style={{ marginTop: 3, display: 'flex', gap: 6, alignItems: 'center' }}>
            {debt.description && (
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: '#3d1a10',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {debt.description}
              </span>
            )}
            <span
              style={{ fontSize: 9, color: 'rgba(61,26,16,0.35)', fontWeight: 600, flexShrink: 0 }}
            >
              {formatDate(debt.date)}
            </span>
          </div>
        </div>

        {/* valor */}
        <span
          style={{
            fontSize: 13,
            fontWeight: 800,
            color: '#3d1a10',
            flexShrink: 0,
          }}
        >
          {formatCurrency(debt.amount)}
        </span>

        {/* ações — só se não pago */}
        {!debt.paid && (
          <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
            <button
              onClick={() => {
                setConfirmPay((v) => !v)
                setConfirmDelete(false)
              }}
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                background: confirmPay ? 'rgba(74,122,74,0.15)' : 'rgba(74,122,74,0.1)',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Check size={12} strokeWidth={2.5} color="#4A7A4A" />
            </button>
            <button
              onClick={() => {
                setConfirmDelete((v) => !v)
                setConfirmPay(false)
              }}
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                background: confirmDelete ? 'rgba(232,96,122,0.15)' : 'rgba(232,96,122,0.1)',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Trash2 size={11} strokeWidth={2.5} color="#e8607a" />
            </button>
          </div>
        )}

        {/* badge pago */}
        {debt.paid && (
          <span
            style={{
              fontSize: 9,
              fontWeight: 800,
              color: '#4A7A4A',
              background: 'rgba(74,122,74,0.12)',
              padding: '2px 8px',
              borderRadius: 99,
              textTransform: 'uppercase',
              letterSpacing: '0.6px',
              flexShrink: 0,
            }}
          >
            pago
          </span>
        )}
      </div>

      {/* confirmação pagar */}
      {confirmPay && (
        <div
          style={{
            padding: '7px 10px',
            background: 'rgba(74,122,74,0.08)',
            border: '1.5px solid rgba(74,122,74,0.2)',
            borderRadius: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span style={{ fontSize: 11, fontWeight: 700, color: '#4A7A4A' }}>marcar como pago?</span>
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              onClick={() => setConfirmPay(false)}
              style={{
                padding: '4px 10px',
                borderRadius: 8,
                border: '1.5px solid rgba(232,160,176,0.4)',
                background: 'transparent',
                fontSize: 10,
                fontWeight: 800,
                color: 'rgba(61,26,16,0.5)',
                cursor: 'pointer',
                fontFamily: 'Baloo 2, sans-serif',
              }}
            >
              não
            </button>
            <button
              onClick={handlePay}
              disabled={loading}
              style={{
                padding: '4px 10px',
                borderRadius: 8,
                border: 'none',
                background: 'rgba(74,122,74,0.15)',
                fontSize: 10,
                fontWeight: 800,
                color: '#4A7A4A',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'Baloo 2, sans-serif',
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? '...' : 'sim'}
            </button>
          </div>
        </div>
      )}

      {/* confirmação deletar */}
      {confirmDelete && (
        <div
          style={{
            padding: '7px 10px',
            background: 'rgba(232,96,122,0.08)',
            border: '1.5px solid rgba(232,96,122,0.2)',
            borderRadius: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span style={{ fontSize: 11, fontWeight: 700, color: '#e8607a' }}>
            apagar essa dívida?
          </span>
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              onClick={() => setConfirmDelete(false)}
              style={{
                padding: '4px 10px',
                borderRadius: 8,
                border: '1.5px solid rgba(232,160,176,0.4)',
                background: 'transparent',
                fontSize: 10,
                fontWeight: 800,
                color: 'rgba(61,26,16,0.5)',
                cursor: 'pointer',
                fontFamily: 'Baloo 2, sans-serif',
              }}
            >
              não
            </button>
            <button
              onClick={handleDelete}
              disabled={loading}
              style={{
                padding: '4px 10px',
                borderRadius: 8,
                border: 'none',
                background: 'rgba(232,96,122,0.15)',
                fontSize: 10,
                fontWeight: 800,
                color: '#e8607a',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'Baloo 2, sans-serif',
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? '...' : 'sim'}
            </button>
          </div>
        </div>
      )}

      {/* data de pagamento */}
      {debt.paid && debt.paidDate && (
        <span style={{ fontSize: 9, fontWeight: 600, color: 'rgba(61,26,16,0.35)' }}>
          pago em {formatDate(debt.paidDate)}
        </span>
      )}
    </div>
  )
}
