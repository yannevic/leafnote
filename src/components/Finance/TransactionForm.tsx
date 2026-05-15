import { useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import * as LucideIcons from 'lucide-react'
import {
  Transaction,
  Goal,
  Category,
  PaidBy,
  CATEGORIES,
  CATEGORY_ICONS,
  PICKER_COLORS,
  formatCurrency,
} from '../../lib/finance'

interface Props {
  uid: string
  myNick: string
  partnerNick: string
  initial?: Transaction
  activeGoals?: Goal[]
  onSave: (data: Omit<Transaction, 'id'>, goalId?: string) => Promise<void>
  onCancel: () => void
}

const ICON_OPTIONS = [
  'UtensilsCrossed',
  'Car',
  'Gamepad2',
  'HeartPulse',
  'Home',
  'Gift',
  'Tag',
  'ShoppingBag',
  'Coffee',
  'Shirt',
  'Plane',
  'Music',
  'Book',
  'Dumbbell',
  'Tv',
  'Wifi',
  'Zap',
  'Droplets',
  'PawPrint',
  'Baby',
  'Wrench',
]

export default function TransactionForm({
  uid,
  myNick,
  partnerNick,
  initial,
  activeGoals = [],
  onSave,
  onCancel,
}: Props) {
  const [type, setType] = useState<'income' | 'expense'>(initial?.type ?? 'expense')
  const [amount, setAmount] = useState(initial ? String(initial.amount) : '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [category, setCategory] = useState<Category>(initial?.category ?? 'outro')
  const [categoryCustom, setCategoryCustom] = useState(initial?.categoryCustom ?? '')
  const [icon, setIcon] = useState(initial?.icon ?? CATEGORY_ICONS[initial?.category ?? 'outro'])
  const [color, setColor] = useState(initial?.color ?? PICKER_COLORS[0])
  const [date, setDate] = useState(
    initial?.date?.slice(0, 10) ?? new Date().toISOString().slice(0, 10)
  )

  const [paidBy, setPaidBy] = useState<PaidBy>(initial?.paidBy ?? 'me')
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(initial?.goalId ?? null)
  const [showIcons, setShowIcons] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const paidByOptions: { value: PaidBy; label: string }[] = [
    { value: 'me', label: myNick },
    { value: 'partner', label: partnerNick },
    { value: 'both', label: 'os dois' },
  ]

  async function handleSave() {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError('informe um valor válido')
      return
    }
    if (!description.trim()) {
      setError('informe uma descrição')
      return
    }
    if (category === 'outro' && !categoryCustom.trim()) {
      setError('informe o nome da categoria')
      return
    }
    setError('')

    setSaving(true)
    try {
      await onSave(
        {
          type,
          amount: Number(Number(amount).toFixed(2)),
          description: description.trim(),
          category,
          ...(category === 'outro' && { categoryCustom: categoryCustom.trim() }),
          icon,
          color,
          date: new Date(date + 'T12:00:00').toISOString(),
          paidBy,
          createdBy: uid,
          ...(selectedGoalId && { goalId: selectedGoalId }),
        },
        selectedGoalId ?? undefined
      )
    } finally {
      setSaving(false)
    }
  }

  // ícone dinâmico do lucide
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
        React.ComponentType<{ size?: number; strokeWidth?: number; color?: string }>
      >
    )[name]
    if (!Icon) return null
    return <Icon size={size} strokeWidth={2} color={c} />
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
      {/* tipo */}
      <div>
        <span style={labelStyle}>tipo</span>
        <div style={{ display: 'flex', gap: 6 }}>
          {(['income', 'expense'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              style={{
                flex: 1,
                padding: '6px 0',
                borderRadius: 10,
                border:
                  type === t ? '1.5px solid rgba(232,160,176,0.5)' : '1.5px solid transparent',
                background:
                  type === t
                    ? t === 'income'
                      ? 'rgba(74,122,74,0.15)'
                      : 'rgba(232,96,122,0.12)'
                    : 'rgba(253,242,246,0.5)',
                color: type === t ? (t === 'income' ? '#4A7A4A' : '#e8607a') : 'rgba(61,26,16,0.4)',
                fontSize: 11,
                fontWeight: 800,
                cursor: 'pointer',
                fontFamily: 'Baloo 2, sans-serif',
              }}
            >
              {t === 'income' ? 'ganho' : 'gasto'}
            </button>
          ))}
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
        <span style={labelStyle}>descrição</span>
        <input
          style={inputStyle}
          placeholder="ex: mercado, salário..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      {/* categoria */}
      <div>
        <span style={labelStyle}>categoria</span>
        <div style={{ position: 'relative' }}>
          <select
            style={{ ...inputStyle, appearance: 'none', paddingRight: 28, cursor: 'pointer' }}
            value={category}
            onChange={(e) => {
              const c = e.target.value as Category
              setCategory(c)
              setIcon(CATEGORY_ICONS[c])
            }}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <ChevronDown
            size={12}
            strokeWidth={2.5}
            color="rgba(122,48,64,0.5)"
            style={{
              position: 'absolute',
              right: 10,
              top: '50%',
              transform: 'translateY(-50%)',
              pointerEvents: 'none',
            }}
          />
        </div>
        {category === 'outro' && (
          <input
            style={{ ...inputStyle, marginTop: 6 }}
            placeholder="nome da categoria..."
            value={categoryCustom}
            onChange={(e) => setCategoryCustom(e.target.value)}
          />
        )}
      </div>

      {/* ícone + cor */}
      <div style={{ display: 'flex', gap: 8 }}>
        {/* ícone */}
        <div style={{ flex: 1 }}>
          <span style={labelStyle}>ícone</span>
          <button
            onClick={() => setShowIcons((v) => !v)}
            style={{
              ...inputStyle,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              cursor: 'pointer',
              border: '1.5px solid rgba(232,160,176,0.3)',
            }}
          >
            <div
              style={{
                width: 20,
                height: 20,
                borderRadius: 6,
                background: color + '33',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <LucideIcon name={icon} size={12} color={color} />
            </div>
            <span style={{ flex: 1, textAlign: 'left', fontSize: 11 }}>{icon}</span>
            <ChevronDown size={11} strokeWidth={2.5} color="rgba(122,48,64,0.5)" />
          </button>
          {showIcons && (
            <div
              style={{
                marginTop: 4,
                padding: 8,
                borderRadius: 10,
                background: 'rgba(253,242,246,0.97)',
                border: '1.5px solid rgba(232,160,176,0.3)',
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                gap: 4,
                zIndex: 9999,
                position: 'relative',
              }}
            >
              {ICON_OPTIONS.map((ic) => (
                <button
                  key={ic}
                  onClick={() => {
                    setIcon(ic)
                    setShowIcons(false)
                  }}
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 8,
                    border:
                      icon === ic ? '1.5px solid rgba(232,160,176,0.6)' : '1.5px solid transparent',
                    background: icon === ic ? color + '22' : 'transparent',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <LucideIcon
                    name={ic}
                    size={13}
                    color={icon === ic ? color : 'rgba(61,26,16,0.5)'}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* cor */}
        <div>
          <span style={labelStyle}>cor</span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, paddingTop: 2 }}>
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
      </div>

      {/* pago por */}
      <div>
        <span style={labelStyle}>pago por</span>
        <div style={{ display: 'flex', gap: 6 }}>
          {paidByOptions.map((o) => (
            <button
              key={o.value}
              onClick={() => setPaidBy(o.value)}
              style={{
                flex: 1,
                padding: '6px 4px',
                borderRadius: 10,
                border:
                  paidBy === o.value
                    ? '1.5px solid rgba(232,160,176,0.5)'
                    : '1.5px solid transparent',
                background: paidBy === o.value ? 'rgba(232,160,176,0.22)' : 'rgba(253,242,246,0.5)',
                color: paidBy === o.value ? '#7a3040' : 'rgba(61,26,16,0.4)',
                fontSize: 10,
                fontWeight: 800,
                cursor: 'pointer',
                fontFamily: 'Baloo 2, sans-serif',
              }}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {/* destinar a meta */}
      {activeGoals.length > 0 && (
        <div>
          <span style={labelStyle}>destinar a uma meta (opcional)</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <button
              onClick={() => setSelectedGoalId(null)}
              style={{
                padding: '6px 10px',
                borderRadius: 10,
                border:
                  selectedGoalId === null
                    ? '1.5px solid rgba(232,160,176,0.5)'
                    : '1.5px solid transparent',
                background: selectedGoalId === null ? 'rgba(232,160,176,0.22)' : 'transparent',
                color: selectedGoalId === null ? '#7a3040' : 'rgba(61,26,16,0.4)',
                fontSize: 11,
                fontWeight: 800,
                cursor: 'pointer',
                fontFamily: 'Baloo 2, sans-serif',
                textAlign: 'left',
              }}
            >
              nenhuma
            </button>
            {activeGoals.map((g) => (
              <button
                key={g.id}
                onClick={() => setSelectedGoalId(g.id)}
                style={{
                  padding: '6px 10px',
                  borderRadius: 10,
                  border:
                    selectedGoalId === g.id
                      ? `1.5px solid ${g.color}88`
                      : '1.5px solid transparent',
                  background: selectedGoalId === g.id ? g.color + '22' : 'transparent',
                  color: selectedGoalId === g.id ? g.color : 'rgba(61,26,16,0.5)',
                  fontSize: 11,
                  fontWeight: 800,
                  cursor: 'pointer',
                  fontFamily: 'Baloo 2, sans-serif',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span>{g.title}</span>
                <span style={{ fontSize: 10, opacity: 0.7 }}>
                  {formatCurrency(g.current)} / {formatCurrency(g.target)}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* erro */}
      {error && <span style={{ fontSize: 10, fontWeight: 700, color: '#e8607a' }}>{error}</span>}

      {/* botões */}
      <div style={{ display: 'flex', gap: 6, marginTop: 2 }}>
        <button
          onClick={onCancel}
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
          onClick={handleSave}
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
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 5,
            opacity: saving ? 0.7 : 1,
          }}
        >
          <Check size={13} strokeWidth={2.5} />
          {saving ? 'salvando...' : 'salvar'}
        </button>
      </div>
    </div>
  )
}
