import { useState } from 'react'
import { Check } from 'lucide-react'
import { COIN_ICONS, COIN_COLORS, CoinIconKey } from '../../lib/personalCoinIcons'
import { setupPersonalCoin } from '../../lib/personalCoin'

interface PersonalCoinSetupModalProps {
  uid: string
  onDone: () => void
}

export default function PersonalCoinSetupModal({ uid, onDone }: PersonalCoinSetupModalProps) {
  const [name, setName] = useState('')
  const [icon, setIcon] = useState<CoinIconKey>('gem')
  const [color, setColor] = useState(COIN_COLORS[0])
  const [saving, setSaving] = useState(false)

  async function handleConfirm() {
    if (!name.trim()) return
    setSaving(true)
    await setupPersonalCoin(uid, name.trim(), icon, color)
    setSaving(false)
    onDone()
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999999,
        background: 'rgba(44,20,8,0.4)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          background: 'linear-gradient(160deg, #FBEAF0 0%, #F5ECD7 100%)',
          border: '1.5px solid rgba(212,160,176,0.5)',
          borderRadius: 20,
          padding: '28px 26px',
          width: 340,
          maxWidth: '90vw',
          fontFamily: 'Baloo 2, sans-serif',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        <div style={{ fontSize: 16, fontWeight: 800, color: '#3d1a10', textAlign: 'center' }}>
          crie sua moedinha pessoal
        </div>
        <div style={{ fontSize: 11, color: 'rgba(61,26,16,0.6)', textAlign: 'center' }}>
          essa moeda é só sua — usa pra comprar pacotes de cartinha
        </div>

        <input
          autoFocus
          type="text"
          placeholder="ex: NamiCoin"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={20}
          style={{
            background: 'rgba(255,255,255,0.6)',
            border: '1.5px solid rgba(212,160,176,0.5)',
            borderRadius: 10,
            padding: '10px 14px',
            fontSize: 13,
            color: '#3d1a10',
            outline: 'none',
            fontFamily: 'Baloo 2, sans-serif',
          }}
        />

        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#8b6914', marginBottom: 8 }}>
            ícone
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {(Object.keys(COIN_ICONS) as CoinIconKey[]).map((key) => {
              const Icon = COIN_ICONS[key]
              const selected = icon === key
              return (
                <button
                  key={key}
                  onClick={() => setIcon(key)}
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    border: selected ? `2px solid ${color}` : '1.5px solid rgba(212,160,176,0.4)',
                    background: selected ? `${color}22` : 'rgba(255,255,255,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <Icon size={18} color={selected ? color : '#8b6914'} />
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#8b6914', marginBottom: 8 }}>
            cor
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {COIN_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: '50%',
                  background: c,
                  border: color === c ? '2.5px solid #3d1a10' : '2px solid transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {color === c && <Check size={14} color="#fff" strokeWidth={3} />}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleConfirm}
          disabled={!name.trim() || saving}
          style={{
            marginTop: 4,
            padding: '10px 0',
            borderRadius: 12,
            border: 'none',
            background: name.trim() ? '#4A7A4A' : 'rgba(74,122,74,0.4)',
            color: '#fff',
            fontWeight: 800,
            fontSize: 13,
            cursor: name.trim() ? 'pointer' : 'default',
            fontFamily: 'Baloo 2, sans-serif',
          }}
        >
          {saving ? 'salvando...' : 'confirmar'}
        </button>
      </div>
    </div>
  )
}
