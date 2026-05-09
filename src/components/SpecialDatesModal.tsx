import { useState } from 'react'
import { X, Save } from 'lucide-react'
import type { SpecialDates } from '../lib/specialDates'

interface Props {
  initial: SpecialDates
  myUid: string
  myNick: string
  partnerNick: string
  onSave: (dates: SpecialDates) => void
  onClose: () => void
}

export default function SpecialDatesModal({
  initial,
  myUid,
  myNick,
  partnerNick: rawPartner,
  onSave,
  onClose,
}: Props) {
  const partnerNick = !rawPartner || rawPartner === '...' ? 'parceiro(a)' : rawPartner

  const [birthdayMe, setBirthdayMe] = useState(initial.birthdayOf?.[myUid] ?? '')
  const [anniversary, setAnniversary] = useState(initial.anniversary ?? '')
  const [metDate, setMetDate] = useState(initial.metDate ?? '')
  const [datingDate, setDatingDate] = useState(initial.datingDate ?? '')

  function clean(v: string) {
    return v.replace(/[^\d-]/g, '')
  }

  function handleSave() {
    const next: SpecialDates = {
      birthdayOf: { ...(initial.birthdayOf ?? {}), [myUid]: birthdayMe },
      anniversary,
      metDate,
      datingDate,
    }
    onSave(next)
    onClose()
  }

  const fields = [
    {
      label: `aniversário de ${myNick}`,
      value: birthdayMe,
      set: setBirthdayMe,
      placeholder: 'DD-MM',
      max: 5,
    },
    {
      label: `aniversário de ${partnerNick}`,
      value: '',
      set: () => {},
      placeholder: 'preenchido pelo parceiro',
      max: 5,
      disabled: true,
    },
    {
      label: 'aniversário do casal',
      value: anniversary,
      set: setAnniversary,
      placeholder: 'DD-MM-AAAA',
      max: 10,
    },
    {
      label: 'dia que se conheceram',
      value: metDate,
      set: setMetDate,
      placeholder: 'DD-MM-AAAA',
      max: 10,
    },
    {
      label: 'início do namoro (opcional)',
      value: datingDate,
      set: setDatingDate,
      placeholder: 'DD-MM-AAAA',
      max: 10,
    },
  ]

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(44,20,8,0.35)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background:
            'linear-gradient(160deg, rgba(253,246,240,0.97) 0%, rgba(252,232,238,0.97) 100%)',
          border: '1.5px solid rgba(232,160,176,0.4)',
          borderRadius: 20,
          width: 420,
          maxWidth: '95vw',
          fontFamily: 'Baloo 2, sans-serif',
          boxShadow: '0 8px 40px rgba(200,120,140,0.2), inset 0 1px 0 rgba(255,255,255,0.6)',
          backdropFilter: 'blur(18px) saturate(1.4)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 24px 16px',
            borderBottom: '2px dashed rgba(232,160,176,0.4)',
          }}
        >
          <span style={{ fontSize: 15, fontWeight: 800, color: '#3d1a10' }}>datas especiais</span>
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
          style={{ padding: '20px 24px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}
        >
          {fields.map((f) => (
            <div key={f.label}>
              <label
                style={{
                  fontFamily: 'Baloo 2, sans-serif',
                  fontSize: 9,
                  fontWeight: 800,
                  color: 'rgba(122,48,64,0.55)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.8px',
                  display: 'block',
                  marginBottom: 5,
                }}
              >
                {f.label}
              </label>
              <input
                type="text"
                value={f.value}
                onChange={(e) => f.set(clean(e.target.value))}
                placeholder={f.placeholder}
                maxLength={f.max}
                disabled={f.disabled}
                style={{
                  width: '100%',
                  borderRadius: 10,
                  border: '1.5px solid rgba(232,160,176,0.35)',
                  background: f.disabled ? 'rgba(232,160,176,0.08)' : 'rgba(253,242,246,0.7)',
                  padding: '8px 14px',
                  fontFamily: 'Baloo 2, sans-serif',
                  fontSize: 13,
                  fontWeight: 600,
                  color: f.disabled ? 'rgba(61,26,16,0.3)' : '#3d1a10',
                  outline: 'none',
                  boxSizing: 'border-box',
                  letterSpacing: '0.05em',
                  cursor: f.disabled ? 'not-allowed' : 'text',
                }}
              />
              {f.disabled && (
                <span
                  style={{
                    fontSize: 10,
                    color: 'rgba(122,48,64,0.4)',
                    fontFamily: 'Baloo 2, sans-serif',
                    fontWeight: 600,
                  }}
                >
                  só {partnerNick} pode preencher o próprio aniversário
                </span>
              )}
            </div>
          ))}

          <button
            onClick={handleSave}
            style={{
              marginTop: 8,
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              background: 'rgba(232,160,176,0.55)',
              color: '#3d1a10',
              border: 'none',
              borderRadius: 12,
              padding: '11px 0',
              fontFamily: 'Baloo 2, sans-serif',
              fontSize: 13,
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            <Save size={13} strokeWidth={2} /> salvar datas
          </button>
        </div>
      </div>
    </div>
  )
}
