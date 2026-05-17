import { useState } from 'react'
import { X, Send, CalendarHeart, Mail, PenLine } from 'lucide-react'
import { CARD_MODELS } from '../assets/letters/index'
import type { SpecialLetterLayout } from '../types/board'
import { getAvailableDates, formatMmdd } from '../lib/specialDates'
import type { SpecialDates } from '../lib/specialDates'
import SpecialDatesModal from './SpecialDatesModal'
import DatePicker from './DatePicker'

type Tab = 'especial' | 'livre'

interface Props {
  myNick: string
  partnerNick: string
  myUid: string
  partnerUid: string
  specialDates: SpecialDates
  onSend: (data: {
    message: string
    cardModel: string
    layout: SpecialLetterLayout
    from: string
    to: string
    fromUid: string
    toUid: string
    specialDate: string
    specialDateMmdd: string
    specialDateLabel: string
    dayOnly?: boolean
    availableFrom?: string
  }) => void
  onClose: () => void
  onSaveDates: (dates: SpecialDates) => void
  onOpenCustomLetter: () => void
}

export default function SpecialLetterModal({
  myNick,
  partnerNick,
  myUid,
  partnerUid,
  specialDates,
  onSend,
  onClose,
  onSaveDates,
  onOpenCustomLetter,
}: Props) {
  const [tab, setTab] = useState<Tab>('especial')
  const [selectedModel, setSelectedModel] = useState(CARD_MODELS[0].id)
  const [message, setMessage] = useState('')
  const availableDates = getAvailableDates(specialDates, myUid, partnerUid, myNick, partnerNick)
  const [selectedDateKey, setSelectedDateKey] = useState(availableDates[0]?.key ?? '')
  const [availableFrom, setAvailableFrom] = useState('')
  const [showDatesModal, setShowDatesModal] = useState(false)

  const model = CARD_MODELS.find((m) => m.id === selectedModel)!
  const selectedDateObj = availableDates.find((d) => d.key === selectedDateKey)

  function handleSend() {
    if (!message.trim() || !selectedDateObj) return
    onSend({
      message: message.trim(),
      cardModel: selectedModel,
      layout: model.layout,
      from: myNick,
      to: partnerNick,
      fromUid: myUid,
      toUid: partnerUid,
      specialDate: selectedDateKey,
      specialDateMmdd: selectedDateObj.mmdd,
      specialDateLabel: selectedDateObj.label,
      availableFrom: availableFrom || undefined,
    })
    onClose()
  }

  function handleOpenCustomLetter() {
    onClose()
    onOpenCustomLetter()
  }

  const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    {
      id: 'especial',
      label: 'carta especial',
      icon: <Mail size={13} strokeWidth={2} />,
    },
    {
      id: 'livre',
      label: 'carta livre',
      icon: <PenLine size={13} strokeWidth={2} />,
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
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) e.currentTarget.dataset.closeOnUp = 'true'
      }}
      onMouseUp={(e) => {
        if (e.currentTarget.dataset.closeOnUp === 'true' && e.target === e.currentTarget) onClose()
        delete e.currentTarget.dataset.closeOnUp
      }}
    >
      <style>{`
        .special-letter-scroll::-webkit-scrollbar { width: 4px; }
        .special-letter-scroll::-webkit-scrollbar-track { background: transparent; }
        .special-letter-scroll::-webkit-scrollbar-thumb { background: rgba(232,160,176,0.55); border-radius: 99px; }
        .special-letter-scroll::-webkit-scrollbar-thumb:hover { background: rgba(232,160,176,0.99); }
      `}</style>

      <div
        style={{
          background:
            'linear-gradient(160deg, rgba(253,246,240,0.97) 0%, rgba(252,232,238,0.97) 100%)',
          border: '1.5px solid rgba(232,160,176,0.4)',
          borderRadius: 20,
          width: 640,
          maxWidth: '95vw',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 8px 40px rgba(200,120,140,0.2), inset 0 1px 0 rgba(255,255,255,0.6)',
          backdropFilter: 'blur(18px) saturate(1.4)',
          position: 'relative',
          overflow: 'hidden',
          fontFamily: 'Baloo 2, sans-serif',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 24px 0',
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: 15, fontWeight: 800, color: '#3d1a10' }}>
            carta para {partnerNick}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {tab === 'especial' && (
              <button
                onClick={() => setShowDatesModal(true)}
                title="editar datas especiais"
                style={{
                  background: 'rgba(200,120,140,0.15)',
                  border: 'none',
                  borderRadius: 8,
                  width: 28,
                  height: 28,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                <CalendarHeart size={13} color="rgba(122,48,64,0.6)" strokeWidth={2} />
              </button>
            )}
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
        </div>

        {/* Abas */}
        <div
          style={{
            display: 'flex',
            gap: 4,
            padding: '14px 24px 0',
            flexShrink: 0,
          }}
        >
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontFamily: 'Baloo 2, sans-serif',
                fontSize: 12,
                fontWeight: 800,
                padding: '7px 16px',
                borderRadius: '10px 10px 0 0',
                border: '1.5px solid',
                borderBottom:
                  tab === t.id ? '1.5px solid transparent' : '1.5px solid rgba(232,160,176,0.3)',
                borderColor: tab === t.id ? 'rgba(232,160,176,0.5)' : 'rgba(232,160,176,0.25)',
                background: tab === t.id ? 'rgba(252,232,238,0.97)' : 'rgba(253,242,246,0.4)',
                color: tab === t.id ? '#3d1a10' : 'rgba(61,26,16,0.45)',
                cursor: 'pointer',
                transition: 'all 0.15s',
                position: 'relative',
                bottom: -1,
              }}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        {/* Divisor sob as abas */}
        <div
          style={{
            height: 0,
            borderTop: '1.5px dashed rgba(232,160,176,0.4)',
            margin: '0 24px',
            flexShrink: 0,
          }}
        />

        {/* ── ABA: carta especial ── */}
        {tab === 'especial' && (
          <div
            className="special-letter-scroll"
            style={{
              overflowY: 'auto',
              padding: '20px 24px 24px',
              display: 'flex',
              flexDirection: 'column',
              gap: 18,
            }}
          >
            {/* Seletor de data */}
            <div>
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 800,
                  color: 'rgba(122,48,64,0.55)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.8px',
                  display: 'block',
                  marginBottom: 8,
                }}
              >
                para qual data especial é essa carta?
              </span>
              {availableDates.length === 0 ? (
                <div
                  style={{
                    background: 'rgba(253,242,246,0.7)',
                    border: '1.5px solid rgba(232,160,176,0.3)',
                    borderRadius: 12,
                    padding: '12px 16px',
                    fontSize: 12,
                    fontWeight: 600,
                    color: 'rgba(61,26,16,0.5)',
                  }}
                >
                  nenhuma data especial cadastrada ainda. cadastre no calendário primeiro!
                </div>
              ) : (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {availableDates.map((d) => (
                    <button
                      key={d.key}
                      onClick={() => setSelectedDateKey(d.key)}
                      style={{
                        fontFamily: 'Baloo 2, sans-serif',
                        fontSize: 12,
                        fontWeight: 800,
                        padding: '6px 14px',
                        borderRadius: 20,
                        cursor: 'pointer',
                        border:
                          selectedDateKey === d.key
                            ? '1.5px solid rgba(232,160,176,0.7)'
                            : '1.5px solid rgba(232,160,176,0.3)',
                        background:
                          selectedDateKey === d.key
                            ? 'rgba(232,160,176,0.3)'
                            : 'rgba(253,242,246,0.7)',
                        color: selectedDateKey === d.key ? '#3d1a10' : 'rgba(61,26,16,0.5)',
                        transition: 'all 0.15s',
                      }}
                    >
                      {d.label} · {formatMmdd(d.mmdd)}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Escolha do modelo */}
            <div>
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 800,
                  color: 'rgba(122,48,64,0.55)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.8px',
                  display: 'block',
                  marginBottom: 8,
                }}
              >
                escolha o modelo
              </span>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {CARD_MODELS.map((card) => (
                  <button
                    key={card.id}
                    onClick={() => setSelectedModel(card.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 4,
                      borderRadius: 8,
                      outline:
                        selectedModel === card.id
                          ? '2.5px solid rgba(232,160,176,0.7)'
                          : '2px solid transparent',
                      transition: 'outline 0.2s',
                    }}
                  >
                    <img
                      src={card.image}
                      alt={card.label}
                      style={{
                        width: 52,
                        height: 72,
                        objectFit: 'fill',
                        borderRadius: 6,
                        display: 'block',
                      }}
                    />
                    <span
                      style={{
                        fontFamily: 'Baloo 2, sans-serif',
                        fontSize: 10,
                        color: 'rgba(61,26,16,0.5)',
                        display: 'block',
                        textAlign: 'center',
                        marginTop: 2,
                      }}
                    >
                      {card.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Disponível a partir de */}
            <div>
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 800,
                  color: 'rgba(122,48,64,0.55)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.8px',
                  display: 'block',
                  marginBottom: 8,
                }}
              >
                disponível para abrir a partir de
              </span>
              <DatePicker value={availableFrom} onChange={(v) => setAvailableFrom(v)} />
            </div>

            {/* Preview + textarea */}
            <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
              <div style={{ flexShrink: 0 }}>
                <img
                  src={model.image}
                  alt={model.label}
                  style={{
                    width: 140,
                    display: 'block',
                    borderRadius: 10,
                    boxShadow: '0 4px 20px rgba(200,120,140,0.2)',
                  }}
                />
              </div>

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={`escreva sua carta para ${partnerNick}...`}
                  maxLength={600}
                  style={{
                    width: '100%',
                    height: 180,
                    resize: 'none',
                    borderRadius: 12,
                    border: '1.5px solid rgba(232,160,176,0.35)',
                    background: 'rgba(253,242,246,0.7)',
                    padding: '14px 16px',
                    fontFamily: 'Baloo 2, sans-serif',
                    fontSize: 13,
                    fontWeight: 600,
                    color: '#3d1a10',
                    outline: 'none',
                    lineHeight: 1.6,
                    boxSizing: 'border-box',
                  }}
                />
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'Baloo 2, sans-serif',
                      fontSize: 10,
                      color: 'rgba(61,26,16,0.4)',
                    }}
                  >
                    {message.length}/600
                  </span>
                  <button
                    onClick={handleSend}
                    disabled={!message.trim() || !selectedDateObj}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      background:
                        message.trim() && selectedDateObj
                          ? 'rgba(232,160,176,0.55)'
                          : 'rgba(232,160,176,0.2)',
                      color: message.trim() && selectedDateObj ? '#3d1a10' : 'rgba(61,26,16,0.35)',
                      border: 'none',
                      borderRadius: 12,
                      padding: '10px 22px',
                      fontFamily: 'Baloo 2, sans-serif',
                      fontSize: 13,
                      fontWeight: 800,
                      cursor: message.trim() && selectedDateObj ? 'pointer' : 'default',
                      transition: 'background 0.2s',
                    }}
                  >
                    <Send size={13} strokeWidth={2} /> enviar carta
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── ABA: carta livre ── */}
        {tab === 'livre' && (
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '32px 24px 36px',
              gap: 20,
            }}
          >
            {/* Ilustração decorativa */}
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                background: 'rgba(232,160,176,0.18)',
                border: '2px dashed rgba(232,160,176,0.45)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <PenLine size={28} color="rgba(200,100,130,0.7)" strokeWidth={1.5} />
            </div>

            {/* Texto descritivo */}
            <div style={{ textAlign: 'center', maxWidth: 360 }}>
              <p
                style={{
                  fontSize: 15,
                  fontWeight: 800,
                  color: '#3d1a10',
                  margin: '0 0 8px',
                }}
              >
                carta do seu jeito
              </p>
              <p
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: 'rgba(61,26,16,0.55)',
                  lineHeight: 1.7,
                  margin: 0,
                }}
              >
                escolha o papel, a fonte, as cores, adicione fotos e stickers. uma carta
                completamente personalizada para {partnerNick}.
              </p>
            </div>

            {/* Destaques */}
            <div
              style={{
                display: 'flex',
                gap: 10,
                flexWrap: 'wrap',
                justifyContent: 'center',
              }}
            >
              {['papel colorido', 'fontes especiais', 'fotos', 'stickers', 'assinatura'].map(
                (feat) => (
                  <span
                    key={feat}
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: '4px 12px',
                      borderRadius: 20,
                      background: 'rgba(232,160,176,0.18)',
                      border: '1.5px solid rgba(232,160,176,0.35)',
                      color: 'rgba(122,48,64,0.75)',
                    }}
                  >
                    {feat}
                  </span>
                )
              )}
            </div>

            {/* Botão criar */}
            <button
              onClick={handleOpenCustomLetter}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: 'rgba(232,160,176,0.55)',
                border: 'none',
                borderRadius: 14,
                padding: '12px 28px',
                fontFamily: 'Baloo 2, sans-serif',
                fontSize: 14,
                fontWeight: 800,
                color: '#3d1a10',
                cursor: 'pointer',
                boxShadow: '0 2px 12px rgba(200,120,140,0.2)',
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(232,160,176,0.75)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(232,160,176,0.55)')}
            >
              <PenLine size={15} strokeWidth={2} />
              criar carta livre
            </button>
          </div>
        )}
      </div>

      {showDatesModal && (
        <SpecialDatesModal
          initial={specialDates}
          myUid={myUid}
          myNick={myNick}
          partnerNick={partnerNick}
          onSave={(d) => {
            onSaveDates(d)
            setShowDatesModal(false)
          }}
          onClose={() => setShowDatesModal(false)}
        />
      )}
    </div>
  )
}
