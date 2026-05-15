import { useState } from 'react'
import { Check, X, Plus, Archive, ChevronDown, ChevronUp } from 'lucide-react'
import * as LucideIcons from 'lucide-react'
import { Goal, formatCurrency } from '../../lib/finance'

import { Transaction } from '../../lib/finance'

interface Props {
  goal: Goal
  uid: string
  onDeposit: (goalId: string, current: number, amount: number, addedBy: string) => Promise<void>
  onArchive: (id: string) => Promise<void>
  onCreateTransaction?: (data: Omit<Transaction, 'id'>) => Promise<void>
}

function LucideIcon({
  name,
  size = 14,
  color: c = '#3d1a10',
}: {
  name: string
  size?: number
  color?: string
}) {
  const Icon = (
    LucideIcons as unknown as Record<
      string,
      React.ComponentType<{
        size?: number
        strokeWidth?: number
        color?: string
      }>
    >
  )[name]
  if (!Icon) return null
  return <Icon size={size} strokeWidth={2} color={c} />
}

export default function GoalCard({ goal, uid, onDeposit, onArchive, onCreateTransaction }: Props) {
  const [showDeposit, setShowDeposit] = useState(false)
  const [depositVal, setDepositVal] = useState('')
  const [saving, setSaving] = useState(false)
  const [confirmArch, setConfirmArch] = useState(false)

  const pct = Math.min((goal.current / goal.target) * 100, 100)
  const reached = goal.current >= goal.target

  async function handleDeposit() {
    const val = Number(depositVal)
    if (!val || val <= 0) return
    setSaving(true)
    try {
      await onDeposit(goal.id, goal.current, val, uid)
      if (onCreateTransaction) {
        await onCreateTransaction({
          type: 'expense',
          amount: val,
          description: `depósito: ${goal.title}`,
          category: 'outro',
          categoryCustom: 'meta',
          icon: goal.icon,
          color: goal.color,
          date: new Date().toISOString(),
          paidBy: 'me',
          createdBy: uid,
          goalId: goal.id,
        })
      }
      setDepositVal('')
      setShowDeposit(false)
    } finally {
      setSaving(false)
    }
  }

  function formatDeadline(iso: string) {
    return new Date(iso).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  return (
    <div
      style={{
        background: 'rgba(253,242,246,0.7)',
        border: `1.5px solid ${goal.color}44`,
        borderRadius: 14,
        padding: '12px 12px 10px',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
    >
      {/* header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 9,
            flexShrink: 0,
            background: goal.color + '22',
            border: `1.5px solid ${goal.color}44`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <LucideIcon name={goal.icon} size={14} color={goal.color} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 800,
              color: '#3d1a10',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {goal.title}
          </div>
          {goal.deadline && (
            <div
              style={{ fontSize: 9, fontWeight: 600, color: 'rgba(61,26,16,0.4)', marginTop: 1 }}
            >
              até {formatDeadline(goal.deadline)}
            </div>
          )}
        </div>

        {/* valor */}
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: goal.color }}>
            {formatCurrency(goal.current)}
          </div>
          <div style={{ fontSize: 9, fontWeight: 600, color: 'rgba(61,26,16,0.4)' }}>
            de {formatCurrency(goal.target)}
          </div>
        </div>
      </div>

      {/* barra progresso */}
      <div style={{ height: 6, borderRadius: 99, background: 'rgba(232,160,176,0.2)' }}>
        <div
          style={{
            height: 6,
            borderRadius: 99,
            background: reached ? '#4A7A4A' : goal.color,
            width: `${pct}%`,
            transition: 'width 0.4s',
          }}
        />
      </div>

      {/* % + status */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(61,26,16,0.4)' }}>
          {pct.toFixed(0)}%
        </span>
        {reached && (
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
            }}
          >
            meta atingida
          </span>
        )}
      </div>

      {/* botões ação */}
      <div style={{ display: 'flex', gap: 6 }}>
        <button
          onClick={() => {
            setShowDeposit((v) => !v)
            setConfirmArch(false)
          }}
          style={{
            flex: 1,
            padding: '6px 0',
            borderRadius: 10,
            border: '1.5px solid rgba(232,160,176,0.4)',
            background: showDeposit ? 'rgba(232,160,176,0.22)' : 'transparent',
            color: '#7a3040',
            fontSize: 10,
            fontWeight: 800,
            cursor: 'pointer',
            fontFamily: 'Baloo 2, sans-serif',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
          }}
        >
          <Plus size={11} strokeWidth={2.5} />
          depositar
          {showDeposit ? (
            <ChevronUp size={10} strokeWidth={2.5} />
          ) : (
            <ChevronDown size={10} strokeWidth={2.5} />
          )}
        </button>

        <button
          onClick={() => {
            setConfirmArch((v) => !v)
            setShowDeposit(false)
          }}
          style={{
            width: 32,
            height: 32,
            borderRadius: 10,
            border: '1.5px solid rgba(232,160,176,0.3)',
            background: confirmArch ? 'rgba(232,96,122,0.1)' : 'transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Archive
            size={12}
            strokeWidth={2}
            color={confirmArch ? '#e8607a' : 'rgba(122,48,64,0.5)'}
          />
        </button>
      </div>

      {/* form depósito */}
      {showDeposit && (
        <div style={{ display: 'flex', gap: 6 }}>
          <input
            type="number"
            min="0"
            step="0.01"
            placeholder="valor (R$)"
            value={depositVal}
            onChange={(e) => setDepositVal(e.target.value)}
            style={{
              flex: 1,
              padding: '6px 10px',
              borderRadius: 10,
              border: '1.5px solid rgba(232,160,176,0.3)',
              background: 'rgba(253,242,246,0.9)',
              fontSize: 12,
              fontWeight: 600,
              color: '#3d1a10',
              fontFamily: 'Baloo 2, sans-serif',
              outline: 'none',
            }}
          />
          <button
            onClick={() => setShowDeposit(false)}
            style={{
              width: 32,
              height: 32,
              borderRadius: 10,
              border: '1.5px solid rgba(232,160,176,0.3)',
              background: 'transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={12} strokeWidth={2.5} color="rgba(122,48,64,0.5)" />
          </button>
          <button
            onClick={handleDeposit}
            disabled={saving}
            style={{
              width: 32,
              height: 32,
              borderRadius: 10,
              border: 'none',
              background: 'rgba(74,122,74,0.15)',
              cursor: saving ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: saving ? 0.6 : 1,
            }}
          >
            <Check size={12} strokeWidth={2.5} color="#4A7A4A" />
          </button>
        </div>
      )}

      {/* confirmação arquivar */}
      {confirmArch && (
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
            arquivar essa meta?
          </span>
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              onClick={() => setConfirmArch(false)}
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
              onClick={() => onArchive(goal.id)}
              style={{
                padding: '4px 10px',
                borderRadius: 8,
                border: 'none',
                background: 'rgba(232,96,122,0.15)',
                fontSize: 10,
                fontWeight: 800,
                color: '#e8607a',
                cursor: 'pointer',
                fontFamily: 'Baloo 2, sans-serif',
              }}
            >
              sim
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
