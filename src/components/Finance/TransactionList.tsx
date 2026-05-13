import { useState } from 'react'
import { Pencil, Trash2, TrendingUp, TrendingDown } from 'lucide-react'
import * as LucideIcons from 'lucide-react'
import { Transaction, formatCurrency, getCategoryLabel } from '../../lib/finance'
import TransactionForm from './TransactionForm'

interface Props {
  transactions: Transaction[]
  uid: string
  partnerUid: string
  myNick: string
  partnerNick: string
  onEdit: (id: string, data: Partial<Omit<Transaction, 'id'>>) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

type Filter = 'all' | 'income' | 'expense'

export default function TransactionList({
  transactions,
  uid,
  partnerUid,
  myNick,
  partnerNick,
  onEdit,
  onDelete,
}: Props) {
  const [filter, setFilter] = useState<Filter>('all')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [confirmingId, setConfirmingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const filtered = transactions.filter((t) => (filter === 'all' ? true : t.type === filter))

  function nickForUid(u: string) {
    if (u === uid) return myNick
    if (u === partnerUid) return partnerNick
    return 'alguém'
  }

  function paidByLabel(t: Transaction) {
    if (t.paidBy === 'both') return 'os dois'
    if (t.paidBy === 'me') return nickForUid(uid)
    return nickForUid(partnerUid)
  }

  function formatDate(iso: string) {
    const d = new Date(iso)
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
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

  async function handleDelete(id: string) {
    setDeletingId(id)
    try {
      await onDelete(id)
    } finally {
      setDeletingId(null)
      setConfirmingId(null)
    }
  }

  const filterBtnStyle = (f: Filter): React.CSSProperties => ({
    flex: 1,
    padding: '5px 0',
    borderRadius: 10,
    border: filter === f ? '1.5px solid rgba(232,160,176,0.5)' : '1.5px solid transparent',
    background: filter === f ? 'rgba(232,160,176,0.22)' : 'transparent',
    color: filter === f ? '#7a3040' : 'rgba(61,26,16,0.4)',
    fontSize: 10,
    fontWeight: 800,
    cursor: 'pointer',
    fontFamily: 'Baloo 2, sans-serif',
    textTransform: 'uppercase',
    letterSpacing: '0.6px',
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {/* filtro */}
      <div style={{ display: 'flex', gap: 5 }}>
        <button style={filterBtnStyle('all')} onClick={() => setFilter('all')}>
          todos
        </button>
        <button style={filterBtnStyle('income')} onClick={() => setFilter('income')}>
          ganhos
        </button>
        <button style={filterBtnStyle('expense')} onClick={() => setFilter('expense')}>
          gastos
        </button>
      </div>

      {/* lista */}
      {filtered.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            paddingTop: 32,
            fontSize: 12,
            fontWeight: 600,
            color: 'rgba(61,26,16,0.35)',
          }}
        >
          nenhum lançamento ainda
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {filtered.map((t) => (
            <div key={t.id}>
              {/* editando */}
              {editingId === t.id ? (
                <TransactionForm
                  uid={uid}
                  myNick={myNick}
                  partnerNick={partnerNick}
                  initial={t}
                  onSave={async (data) => {
                    await onEdit(t.id, data)
                    setEditingId(null)
                  }}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <div
                  style={{
                    background: 'rgba(253,242,246,0.7)',
                    border: '1.5px solid rgba(232,160,176,0.3)',
                    borderRadius: 12,
                    padding: '8px 10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  {/* ícone colorido */}
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 9,
                      flexShrink: 0,
                      background: t.color + '22',
                      border: `1.5px solid ${t.color}44`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <LucideIcon name={t.icon} size={14} color={t.color} />
                  </div>

                  {/* info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: '#3d1a10',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {t.description}
                    </div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 1 }}>
                      <span
                        style={{
                          fontSize: 9,
                          fontWeight: 800,
                          color: 'rgba(122,48,64,0.5)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                        }}
                      >
                        {getCategoryLabel(t)}
                      </span>
                      <span style={{ fontSize: 9, color: 'rgba(61,26,16,0.3)', fontWeight: 600 }}>
                        {formatDate(t.date)}
                      </span>
                      <span style={{ fontSize: 9, color: 'rgba(61,26,16,0.3)', fontWeight: 600 }}>
                        {paidByLabel(t)}
                      </span>
                    </div>
                  </div>

                  {/* valor */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0 }}>
                    {t.type === 'income' ? (
                      <TrendingUp size={11} strokeWidth={2.5} color="#4A7A4A" />
                    ) : (
                      <TrendingDown size={11} strokeWidth={2.5} color="#e8607a" />
                    )}
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 800,
                        color: t.type === 'income' ? '#4A7A4A' : '#e8607a',
                      }}
                    >
                      {formatCurrency(t.amount)}
                    </span>
                  </div>

                  {/* ações */}
                  <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                    <button
                      onClick={() => {
                        setEditingId(t.id)
                        setConfirmingId(null)
                      }}
                      style={{
                        width: 26,
                        height: 26,
                        borderRadius: 8,
                        background: 'rgba(200,120,140,0.12)',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Pencil size={11} strokeWidth={2.5} color="rgba(122,48,64,0.6)" />
                    </button>
                    <button
                      onClick={() => setConfirmingId(confirmingId === t.id ? null : t.id)}
                      style={{
                        width: 26,
                        height: 26,
                        borderRadius: 8,
                        background: 'rgba(232,96,122,0.1)',
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
                </div>
              )}

              {/* confirmação delete inline */}
              {confirmingId === t.id && editingId !== t.id && (
                <div
                  style={{
                    marginTop: 4,
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
                    apagar esse lançamento?
                  </span>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      onClick={() => setConfirmingId(null)}
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
                      onClick={() => handleDelete(t.id)}
                      disabled={deletingId === t.id}
                      style={{
                        padding: '4px 10px',
                        borderRadius: 8,
                        border: 'none',
                        background: 'rgba(232,96,122,0.15)',
                        fontSize: 10,
                        fontWeight: 800,
                        color: '#e8607a',
                        cursor: deletingId === t.id ? 'not-allowed' : 'pointer',
                        fontFamily: 'Baloo 2, sans-serif',
                        opacity: deletingId === t.id ? 0.6 : 1,
                      }}
                    >
                      {deletingId === t.id ? 'apagando...' : 'sim'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
