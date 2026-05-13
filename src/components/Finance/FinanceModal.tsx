import { useState } from 'react'
import { X, Wallet, LayoutDashboard, ArrowLeftRight, Target, HandCoins, Check } from 'lucide-react'
import { useFinance } from '../../hooks/useFinance'
import TransactionForm from './TransactionForm'
import TransactionList from './TransactionList'
import GoalCard from './GoalCard'
import DebtCard from './DebtCard'
import * as LucideIcons from 'lucide-react'
import { formatCurrency, PICKER_COLORS } from '../../lib/finance'

interface Props {
  uid: string
  partnerUid: string
  myNick: string
  partnerNick: string
  onClose: () => void
}

type Tab = 'overview' | 'transactions' | 'goals' | 'debts'

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'overview', label: 'visão geral', icon: <LayoutDashboard size={14} strokeWidth={2} /> },
  { id: 'transactions', label: 'lançamentos', icon: <ArrowLeftRight size={14} strokeWidth={2} /> },
  { id: 'goals', label: 'metas', icon: <Target size={14} strokeWidth={2} /> },
  { id: 'debts', label: 'dívidas', icon: <HandCoins size={14} strokeWidth={2} /> },
]

export default function FinanceModal({ uid, partnerUid, myNick, partnerNick, onClose }: Props) {
  const [tab, setTab] = useState<Tab>('overview')
  const finance = useFinance(uid, partnerUid)

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(44,24,16,0.18)',
        backdropFilter: 'blur(4px)',
      }}
    >
      <div
        style={{
          width: '92vw',
          maxWidth: 520,
          height: '88vh',
          maxHeight: 680,
          borderRadius: 20,
          background:
            'linear-gradient(160deg, rgba(253,246,240,0.97) 0%, rgba(252,232,238,0.97) 100%)',
          border: '1.5px solid rgba(232,160,176,0.4)',
          boxShadow: '0 8px 40px rgba(200,120,140,0.2), inset 0 1px 0 rgba(255,255,255,0.6)',
          backdropFilter: 'blur(18px) saturate(1.4)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          fontFamily: 'Baloo 2, sans-serif',
        }}
      >
        {/* ── Header ── */}
        <div
          style={{
            padding: '14px 16px 0',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 10,
              background: 'rgba(196,149,106,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Wallet size={16} strokeWidth={2} color="#8B6914" />
          </div>

          <span style={{ fontSize: 15, fontWeight: 800, color: '#3d1a10', flex: 1 }}>finanças</span>

          {/* saldo do mês */}
          {!finance.loading && (
            <div
              style={{
                padding: '3px 10px',
                borderRadius: 99,
                background: finance.balance >= 0 ? 'rgba(74,122,74,0.12)' : 'rgba(232,96,122,0.12)',
                fontSize: 11,
                fontWeight: 800,
                color: finance.balance >= 0 ? '#4A7A4A' : '#e8607a',
              }}
            >
              {finance.balance >= 0 ? '+' : ''}
              {formatCurrency(finance.balance)}
            </div>
          )}

          <button
            onClick={onClose}
            style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: 'rgba(200,120,140,0.15)',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={13} strokeWidth={2.5} color="rgba(122,48,64,0.7)" />
          </button>
        </div>

        {/* ── Separador ── */}
        <div style={{ margin: '10px 16px 0', borderTop: '2px dashed rgba(232,160,176,0.4)' }} />

        {/* ── Abas ── */}
        <div
          style={{
            display: 'flex',
            gap: 4,
            padding: '10px 16px 0',
            flexShrink: 0,
          }}
        >
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                flex: 1,
                padding: '6px 4px',
                borderRadius: 10,
                border:
                  tab === t.id ? '1.5px solid rgba(232,160,176,0.5)' : '1.5px solid transparent',
                background: tab === t.id ? 'rgba(232,160,176,0.22)' : 'transparent',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 3,
                color: tab === t.id ? '#7a3040' : 'rgba(61,26,16,0.4)',
                fontSize: 9,
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.6px',
                fontFamily: 'Baloo 2, sans-serif',
                transition: 'all 0.15s',
              }}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Conteúdo ── */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '12px 16px 16px',
          }}
          className="finance-scroll"
        >
          {finance.loading ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                fontSize: 12,
                fontWeight: 600,
                color: 'rgba(61,26,16,0.4)',
              }}
            >
              carregando...
            </div>
          ) : (
            <>
              {tab === 'overview' && <OverviewTab finance={finance} />}
              {tab === 'transactions' && (
                <TransactionsTab
                  finance={finance}
                  uid={uid}
                  myNick={myNick}
                  partnerNick={partnerNick}
                  partnerUid={partnerUid}
                />
              )}
              {tab === 'goals' && <GoalsTab finance={finance} uid={uid} />}
              {tab === 'debts' && (
                <DebtsTab
                  finance={finance}
                  uid={uid}
                  partnerUid={partnerUid}
                  myNick={myNick}
                  partnerNick={partnerNick}
                />
              )}
            </>
          )}
        </div>
      </div>

      <style>{`
        .finance-scroll::-webkit-scrollbar { width: 4px; }
        .finance-scroll::-webkit-scrollbar-track { background: transparent; }
        .finance-scroll::-webkit-scrollbar-thumb { background: rgba(232,160,176,0.55); border-radius: 99px; }
        .finance-scroll::-webkit-scrollbar-thumb:hover { background: rgba(232,160,176,0.99); }
      `}</style>
    </div>
  )
}

function OverviewTab({ finance }: { finance: ReturnType<typeof useFinance> }) {
  const { totalIncome, totalExpense, balance, monthTransactions, activeGoals } = finance

  // resumo por categoria
  const byCategory: Record<string, number> = {}
  monthTransactions
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      const label = t.category === 'outro' && t.categoryCustom ? t.categoryCustom : t.category
      byCategory[label] = (byCategory[label] ?? 0) + t.amount
    })
  const categoryEntries = Object.entries(byCategory).sort((a, b) => b[1] - a[1])
  const maxCategory = categoryEntries[0]?.[1] ?? 1

  const month = new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* mês */}
      <span
        style={{
          fontSize: 9,
          fontWeight: 800,
          color: 'rgba(122,48,64,0.45)',
          textTransform: 'uppercase',
          letterSpacing: '0.8px',
        }}
      >
        {month}
      </span>

      {/* cards ganho / gasto / saldo */}
      <div style={{ display: 'flex', gap: 6 }}>
        {[
          { label: 'ganhos', value: totalIncome, color: '#4A7A4A', bg: 'rgba(74,122,74,0.1)' },
          { label: 'gastos', value: totalExpense, color: '#e8607a', bg: 'rgba(232,96,122,0.1)' },
          {
            label: 'saldo',
            value: balance,
            color: balance >= 0 ? '#4A7A4A' : '#e8607a',
            bg: balance >= 0 ? 'rgba(74,122,74,0.1)' : 'rgba(232,96,122,0.1)',
          },
        ].map((item) => (
          <div
            key={item.label}
            style={{
              flex: 1,
              borderRadius: 12,
              padding: '8px 6px',
              background: item.bg,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <span
              style={{
                fontSize: 9,
                fontWeight: 800,
                color: item.color,
                textTransform: 'uppercase',
                letterSpacing: '0.6px',
                opacity: 0.7,
              }}
            >
              {item.label}
            </span>
            <span style={{ fontSize: 13, fontWeight: 800, color: item.color }}>
              {formatCurrency(item.value)}
            </span>
          </div>
        ))}
      </div>

      {/* gastos por categoria */}
      {categoryEntries.length > 0 && (
        <div
          style={{
            background: 'rgba(253,242,246,0.7)',
            border: '1.5px solid rgba(232,160,176,0.3)',
            borderRadius: 12,
            padding: '10px 12px',
            display: 'flex',
            flexDirection: 'column',
            gap: 7,
          }}
        >
          <span
            style={{
              fontSize: 9,
              fontWeight: 800,
              color: 'rgba(122,48,64,0.55)',
              textTransform: 'uppercase',
              letterSpacing: '0.8px',
            }}
          >
            gastos por categoria
          </span>
          {categoryEntries.map(([cat, val]) => (
            <div key={cat} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#3d1a10' }}>{cat}</span>
                <span style={{ fontSize: 11, fontWeight: 800, color: '#e8607a' }}>
                  {formatCurrency(val)}
                </span>
              </div>
              <div style={{ height: 5, borderRadius: 99, background: 'rgba(232,160,176,0.2)' }}>
                <div
                  style={{
                    height: 5,
                    borderRadius: 99,
                    background: 'rgba(232,96,122,0.45)',
                    width: `${(val / maxCategory) * 100}%`,
                    transition: 'width 0.3s',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* metas ativas resumo */}
      {activeGoals.length > 0 && (
        <div
          style={{
            background: 'rgba(253,242,246,0.7)',
            border: '1.5px solid rgba(232,160,176,0.3)',
            borderRadius: 12,
            padding: '10px 12px',
            display: 'flex',
            flexDirection: 'column',
            gap: 7,
          }}
        >
          <span
            style={{
              fontSize: 9,
              fontWeight: 800,
              color: 'rgba(122,48,64,0.55)',
              textTransform: 'uppercase',
              letterSpacing: '0.8px',
            }}
          >
            metas
          </span>
          {activeGoals.map((g) => {
            const pct = Math.min((g.current / g.target) * 100, 100)
            return (
              <div key={g.id} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#3d1a10' }}>{g.title}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(61,26,16,0.45)' }}>
                    {formatCurrency(g.current)} / {formatCurrency(g.target)}
                  </span>
                </div>
                <div style={{ height: 5, borderRadius: 99, background: 'rgba(232,160,176,0.2)' }}>
                  <div
                    style={{
                      height: 5,
                      borderRadius: 99,
                      background: g.color,
                      width: `${pct}%`,
                      transition: 'width 0.3s',
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* últimos lançamentos */}
      {monthTransactions.length > 0 && (
        <div
          style={{
            background: 'rgba(253,242,246,0.7)',
            border: '1.5px solid rgba(232,160,176,0.3)',
            borderRadius: 12,
            padding: '10px 12px',
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
          }}
        >
          <span
            style={{
              fontSize: 9,
              fontWeight: 800,
              color: 'rgba(122,48,64,0.55)',
              textTransform: 'uppercase',
              letterSpacing: '0.8px',
            }}
          >
            últimos lançamentos
          </span>
          {monthTransactions.slice(0, 5).map((t) => (
            <div
              key={t.id}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: '#3d1a10',
                  flex: 1,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {t.description}
              </span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  flexShrink: 0,
                  marginLeft: 8,
                  color: t.type === 'income' ? '#4A7A4A' : '#e8607a',
                }}
              >
                {t.type === 'income' ? '+' : '-'}
                {formatCurrency(t.amount)}
              </span>
            </div>
          ))}
        </div>
      )}

      {monthTransactions.length === 0 && (
        <div
          style={{
            textAlign: 'center',
            paddingTop: 24,
            fontSize: 12,
            fontWeight: 600,
            color: 'rgba(61,26,16,0.35)',
          }}
        >
          nenhum lançamento esse mês
        </div>
      )}
    </div>
  )
}

function TransactionsTab({
  finance,
  uid,
  myNick,
  partnerNick,
  partnerUid,
}: {
  finance: ReturnType<typeof useFinance>
  uid: string
  partnerUid: string
  myNick: string
  partnerNick: string
}) {
  const [showForm, setShowForm] = useState(false)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* botão novo */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          style={{
            width: '100%',
            padding: '8px 0',
            borderRadius: 12,
            border: '1.5px dashed rgba(232,160,176,0.5)',
            background: 'rgba(232,160,176,0.08)',
            fontSize: 11,
            fontWeight: 800,
            color: 'rgba(122,48,64,0.6)',
            cursor: 'pointer',
            fontFamily: 'Baloo 2, sans-serif',
          }}
        >
          + novo lançamento
        </button>
      )}

      {/* formulário */}
      {showForm && (
        <TransactionForm
          uid={uid}
          myNick={myNick}
          partnerNick={partnerNick}
          onSave={async (data) => {
            await finance.createTransaction(data)
            setShowForm(false)
          }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* lista */}
      <TransactionList
        transactions={finance.transactions}
        uid={uid}
        partnerUid={partnerUid}
        myNick={myNick}
        partnerNick={partnerNick}
        onEdit={finance.editTransaction}
        onDelete={finance.removeTransaction}
      />
    </div>
  )
}
function GoalsTab({ finance, uid }: { finance: ReturnType<typeof useFinance>; uid: string }) {
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [target, setTarget] = useState('')
  const [deadline, setDeadline] = useState('')
  const [icon, setIcon] = useState('Target')
  const [color, setColor] = useState(PICKER_COLORS[1])
  const [showArch, setShowArch] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleCreate() {
    if (!title.trim()) {
      setError('informe um nome')
      return
    }
    if (!target || Number(target) <= 0) {
      setError('informe um valor alvo')
      return
    }
    setError('')
    setSaving(true)
    try {
      await finance.createGoal({
        title: title.trim(),
        target: Number(Number(target).toFixed(2)),
        icon,
        color,
        createdBy: uid,
        ...(deadline && { deadline: new Date(deadline + 'T12:00:00').toISOString() }),
      })
      setTitle('')
      setTarget('')
      setDeadline('')
      setIcon('Target')
      setColor(PICKER_COLORS[1])
      setShowForm(false)
    } finally {
      setSaving(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '7px 10px',
    borderRadius: 10,
    border: '1.5px solid rgba(232,160,176,0.3)',
    background: 'rgba(253,242,246,0.7)',
    fontSize: 12,
    fontWeight: 600,
    color: '#3d1a10',
    fontFamily: 'Baloo 2, sans-serif',
    outline: 'none',
    boxSizing: 'border-box',
  }

  const labelStyle: React.CSSProperties = {
    fontSize: 9,
    fontWeight: 800,
    color: 'rgba(122,48,64,0.55)',
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
    marginBottom: 4,
    display: 'block',
  }

  const GOAL_ICONS = [
    'Target',
    'Home',
    'Car',
    'Plane',
    'ShoppingBag',
    'Gift',
    'Gamepad2',
    'GraduationCap',
    'Heart',
    'Star',
    'Zap',
    'Music',
    'Camera',
    'Bike',
    'Coffee',
  ]

  function LucideIcon({
    name,
    size = 13,
    color: c = '#3d1a10',
  }: {
    name: string
    size?: number
    color?: string
  }) {
    const Icon = (
      LucideIcons as unknown as Record<
        string,
        React.ComponentType<{ size?: number; strokeWidth?: number; color?: string }>
      >
    )[name]
    if (!Icon) return null
    return <Icon size={size} strokeWidth={2} color={c} />
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* botão nova meta */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          style={{
            width: '100%',
            padding: '8px 0',
            borderRadius: 12,
            border: '1.5px dashed rgba(232,160,176,0.5)',
            background: 'rgba(232,160,176,0.08)',
            fontSize: 11,
            fontWeight: 800,
            color: 'rgba(122,48,64,0.6)',
            cursor: 'pointer',
            fontFamily: 'Baloo 2, sans-serif',
          }}
        >
          + nova meta
        </button>
      )}

      {/* formulário nova meta */}
      {showForm && (
        <div
          style={{
            background: 'rgba(253,242,246,0.7)',
            border: '1.5px solid rgba(232,160,176,0.3)',
            borderRadius: 14,
            padding: 14,
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          <div>
            <span style={labelStyle}>nome da meta</span>
            <input
              style={inputStyle}
              placeholder="ex: viagem, tv nova..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ flex: 1 }}>
              <span style={labelStyle}>valor alvo (R$)</span>
              <input
                style={inputStyle}
                type="number"
                min="0"
                step="0.01"
                placeholder="0,00"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
              />
            </div>
            <div style={{ flex: 1 }}>
              <span style={labelStyle}>prazo (opcional)</span>
              <input
                style={inputStyle}
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </div>
          </div>

          {/* ícone */}
          <div>
            <span style={labelStyle}>ícone</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {GOAL_ICONS.map((ic) => (
                <button
                  key={ic}
                  onClick={() => setIcon(ic)}
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 8,
                    border:
                      icon === ic ? '1.5px solid rgba(232,160,176,0.6)' : '1.5px solid transparent',
                    background: icon === ic ? color + '22' : 'rgba(253,242,246,0.5)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <LucideIcon
                    name={ic}
                    size={13}
                    color={icon === ic ? color : 'rgba(61,26,16,0.4)'}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* cor */}
          <div>
            <span style={labelStyle}>cor</span>
            <div style={{ display: 'flex', gap: 5 }}>
              {PICKER_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: '50%',
                    background: c,
                    border: color === c ? '2px solid rgba(61,26,16,0.4)' : '2px solid transparent',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                />
              ))}
            </div>
          </div>

          {error && (
            <span style={{ fontSize: 10, fontWeight: 700, color: '#e8607a' }}>{error}</span>
          )}

          <div style={{ display: 'flex', gap: 6 }}>
            <button
              onClick={() => {
                setShowForm(false)
                setError('')
              }}
              style={{
                flex: 1,
                padding: '7px 0',
                borderRadius: 10,
                border: '1.5px solid rgba(232,160,176,0.4)',
                background: 'transparent',
                color: 'rgba(61,26,16,0.5)',
                fontSize: 11,
                fontWeight: 800,
                cursor: 'pointer',
                fontFamily: 'Baloo 2, sans-serif',
              }}
            >
              cancelar
            </button>
            <button
              onClick={handleCreate}
              disabled={saving}
              style={{
                flex: 2,
                padding: '7px 0',
                borderRadius: 10,
                border: 'none',
                background: 'rgba(232,160,176,0.55)',
                color: '#3d1a10',
                fontSize: 11,
                fontWeight: 800,
                cursor: saving ? 'not-allowed' : 'pointer',
                fontFamily: 'Baloo 2, sans-serif',
                opacity: saving ? 0.7 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 5,
              }}
            >
              <Check size={13} strokeWidth={2.5} />
              {saving ? 'salvando...' : 'criar meta'}
            </button>
          </div>
        </div>
      )}

      {/* cards de metas ativas */}
      {finance.activeGoals.length === 0 && !showForm && (
        <div
          style={{
            textAlign: 'center',
            paddingTop: 24,
            fontSize: 12,
            fontWeight: 600,
            color: 'rgba(61,26,16,0.35)',
          }}
        >
          nenhuma meta ainda
        </div>
      )}

      {finance.activeGoals.map((g) => (
        <GoalCard
          key={g.id}
          goal={g}
          uid={uid}
          onDeposit={(goalId, current, amount, addedBy) =>
            finance.deposit(goalId, current, {
              amount,
              addedBy,
              date: new Date().toISOString(),
            })
          }
          onArchive={finance.archive}
        />
      ))}

      {/* histórico arquivadas */}
      {finance.archivedGoals.length > 0 && (
        <div style={{ marginTop: 4 }}>
          <button
            onClick={() => setShowArch((v) => !v)}
            style={{
              width: '100%',
              padding: '6px 0',
              borderRadius: 10,
              border: '1.5px solid rgba(232,160,176,0.3)',
              background: 'transparent',
              fontSize: 10,
              fontWeight: 800,
              color: 'rgba(122,48,64,0.45)',
              cursor: 'pointer',
              fontFamily: 'Baloo 2, sans-serif',
            }}
          >
            {showArch ? 'ocultar arquivadas' : `ver arquivadas (${finance.archivedGoals.length})`}
          </button>

          {showArch && (
            <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {finance.archivedGoals.map((g) => (
                <div
                  key={g.id}
                  style={{
                    background: 'rgba(253,242,246,0.5)',
                    border: '1.5px solid rgba(232,160,176,0.2)',
                    borderRadius: 12,
                    padding: '8px 12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    opacity: 0.6,
                  }}
                >
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#3d1a10' }}>{g.title}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(61,26,16,0.5)' }}>
                    {formatCurrency(g.current)} / {formatCurrency(g.target)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function DebtsTab({
  finance,
  uid,
  partnerUid,
  myNick,
  partnerNick,
}: {
  finance: ReturnType<typeof useFinance>
  uid: string
  partnerUid: string
  myNick: string
  partnerNick: string
}) {
  const [showForm, setShowForm] = useState(false)
  const [fromUid, setFromUid] = useState<string>(uid)
  const [amount, setAmount] = useState('')
  const [desc, setDesc] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [showHist, setShowHist] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const toUid = fromUid === uid ? partnerUid : uid

  async function handleCreate() {
    if (!amount || Number(amount) <= 0) {
      setError('informe um valor válido')
      return
    }
    setError('')
    setSaving(true)
    try {
      await finance.createDebt({
        fromUid,
        toUid,
        amount: Number(Number(amount).toFixed(2)),
        description: desc.trim(),
        date: new Date(date + 'T12:00:00').toISOString(),
        paid: false,
      })
      setAmount('')
      setDesc('')
      setDate(new Date().toISOString().slice(0, 10))
      setShowForm(false)
    } finally {
      setSaving(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '7px 10px',
    borderRadius: 10,
    border: '1.5px solid rgba(232,160,176,0.3)',
    background: 'rgba(253,242,246,0.7)',
    fontSize: 12,
    fontWeight: 600,
    color: '#3d1a10',
    fontFamily: 'Baloo 2, sans-serif',
    outline: 'none',
    boxSizing: 'border-box',
  }

  const labelStyle: React.CSSProperties = {
    fontSize: 9,
    fontWeight: 800,
    color: 'rgba(122,48,64,0.55)',
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
    marginBottom: 4,
    display: 'block',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* aviso separação */}
      <div
        style={{
          padding: '6px 10px',
          borderRadius: 10,
          background: 'rgba(196,149,106,0.1)',
          border: '1.5px solid rgba(196,149,106,0.25)',
          fontSize: 10,
          fontWeight: 600,
          color: 'rgba(139,105,20,0.7)',
        }}
      >
        dívidas são apenas para controle — não afetam o saldo do app
      </div>

      {/* botão nova dívida */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          style={{
            width: '100%',
            padding: '8px 0',
            borderRadius: 12,
            border: '1.5px dashed rgba(232,160,176,0.5)',
            background: 'rgba(232,160,176,0.08)',
            fontSize: 11,
            fontWeight: 800,
            color: 'rgba(122,48,64,0.6)',
            cursor: 'pointer',
            fontFamily: 'Baloo 2, sans-serif',
          }}
        >
          + registrar dívida
        </button>
      )}

      {/* formulário */}
      {showForm && (
        <div
          style={{
            background: 'rgba(253,242,246,0.7)',
            border: '1.5px solid rgba(232,160,176,0.3)',
            borderRadius: 14,
            padding: 14,
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          {/* quem deve */}
          <div>
            <span style={labelStyle}>quem deve</span>
            <div style={{ display: 'flex', gap: 6 }}>
              {[
                { value: uid, label: myNick },
                { value: partnerUid, label: partnerNick },
              ].map((o) => (
                <button
                  key={o.value}
                  onClick={() => setFromUid(o.value)}
                  style={{
                    flex: 1,
                    padding: '6px 0',
                    borderRadius: 10,
                    border:
                      fromUid === o.value
                        ? '1.5px solid rgba(232,160,176,0.5)'
                        : '1.5px solid transparent',
                    background:
                      fromUid === o.value ? 'rgba(232,160,176,0.22)' : 'rgba(253,242,246,0.5)',
                    color: fromUid === o.value ? '#7a3040' : 'rgba(61,26,16,0.4)',
                    fontSize: 11,
                    fontWeight: 800,
                    cursor: 'pointer',
                    fontFamily: 'Baloo 2, sans-serif',
                  }}
                >
                  {o.label}
                </button>
              ))}
            </div>
            <div
              style={{
                marginTop: 6,
                fontSize: 10,
                fontWeight: 600,
                color: 'rgba(61,26,16,0.4)',
                textAlign: 'center',
              }}
            >
              {fromUid === uid ? myNick : partnerNick}
              {' deve para '}
              {fromUid === uid ? partnerNick : myNick}
            </div>
          </div>

          {/* valor + data */}
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ flex: 1 }}>
              <span style={labelStyle}>valor (R$)</span>
              <input
                style={inputStyle}
                type="number"
                min="0"
                step="0.01"
                placeholder="0,00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div style={{ flex: 1 }}>
              <span style={labelStyle}>data</span>
              <input
                style={inputStyle}
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          {/* descrição */}
          <div>
            <span style={labelStyle}>descrição (opcional)</span>
            <input
              style={inputStyle}
              placeholder="ex: jantar, ingresso..."
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />
          </div>

          {error && (
            <span style={{ fontSize: 10, fontWeight: 700, color: '#e8607a' }}>{error}</span>
          )}

          <div style={{ display: 'flex', gap: 6 }}>
            <button
              onClick={() => {
                setShowForm(false)
                setError('')
              }}
              style={{
                flex: 1,
                padding: '7px 0',
                borderRadius: 10,
                border: '1.5px solid rgba(232,160,176,0.4)',
                background: 'transparent',
                color: 'rgba(61,26,16,0.5)',
                fontSize: 11,
                fontWeight: 800,
                cursor: 'pointer',
                fontFamily: 'Baloo 2, sans-serif',
              }}
            >
              cancelar
            </button>
            <button
              onClick={handleCreate}
              disabled={saving}
              style={{
                flex: 2,
                padding: '7px 0',
                borderRadius: 10,
                border: 'none',
                background: 'rgba(232,160,176,0.55)',
                color: '#3d1a10',
                fontSize: 11,
                fontWeight: 800,
                cursor: saving ? 'not-allowed' : 'pointer',
                fontFamily: 'Baloo 2, sans-serif',
                opacity: saving ? 0.7 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 5,
              }}
            >
              <Check size={13} strokeWidth={2.5} />
              {saving ? 'salvando...' : 'registrar'}
            </button>
          </div>
        </div>
      )}

      {/* dívidas ativas */}
      {finance.activeDebts.length === 0 && !showForm && (
        <div
          style={{
            textAlign: 'center',
            paddingTop: 20,
            fontSize: 12,
            fontWeight: 600,
            color: 'rgba(61,26,16,0.35)',
          }}
        >
          nenhuma dívida ativa
        </div>
      )}

      {finance.activeDebts.map((d) => (
        <DebtCard
          key={d.id}
          debt={d}
          uid={uid}
          myNick={myNick}
          partnerNick={partnerNick}
          onPay={finance.payDebt}
          onDelete={finance.removeDebt}
        />
      ))}

      {/* histórico pagas */}
      {finance.paidDebts.length > 0 && (
        <div style={{ marginTop: 4 }}>
          <button
            onClick={() => setShowHist((v) => !v)}
            style={{
              width: '100%',
              padding: '6px 0',
              borderRadius: 10,
              border: '1.5px solid rgba(232,160,176,0.3)',
              background: 'transparent',
              fontSize: 10,
              fontWeight: 800,
              color: 'rgba(122,48,64,0.45)',
              cursor: 'pointer',
              fontFamily: 'Baloo 2, sans-serif',
            }}
          >
            {showHist ? 'ocultar histórico' : `ver histórico (${finance.paidDebts.length})`}
          </button>

          {showHist && (
            <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {finance.paidDebts.map((d) => (
                <DebtCard
                  key={d.id}
                  debt={d}
                  uid={uid}
                  myNick={myNick}
                  partnerNick={partnerNick}
                  onPay={finance.payDebt}
                  onDelete={finance.removeDebt}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
