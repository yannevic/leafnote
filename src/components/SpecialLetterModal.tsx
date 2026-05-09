import { useState } from 'react'
import { X, Send, CalendarHeart } from 'lucide-react'
import { CARD_MODELS } from '../assets/letters/index'
import type { SpecialLetterLayout } from '../types/board'
import { getAvailableDates, formatMmdd } from '../lib/specialDates'
import type { SpecialDates } from '../lib/specialDates'
import SpecialDatesModal from './SpecialDatesModal'

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
}: Props) {
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
      <style>{`
        .special-letter-scroll::-webkit-scrollbar { width: 4px; }
        .special-letter-scroll::-webkit-scrollbar-track { background: transparent; }
        .special-letter-scroll::-webkit-scrollbar-thumb { background: rgba(232,160,176,0.55); border-radius: 99px; }
        .special-letter-scroll::-webkit-scrollbar-thumb:hover { background: rgba(232,160,176,0.99); }
      `}</style>

      <div
        onClick={(e) => e.stopPropagation()}
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
            padding: '20px 24px 16px',
            borderBottom: '2px dashed rgba(232,160,176,0.4)',
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: 15, fontWeight: 800, color: '#3d1a10' }}>
            carta especial para {partnerNick}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
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

        {/* Conteúdo scrollável */}
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
            <input
              type="date"
              value={availableFrom}
              onChange={(e) => setAvailableFrom(e.target.value)}
              style={{
                fontFamily: 'Baloo 2, sans-serif',
                fontSize: 13,
                fontWeight: 600,
                padding: '7px 12px',
                borderRadius: 10,
                border: '1.5px solid rgba(232,160,176,0.35)',
                background: 'rgba(253,242,246,0.7)',
                color: '#3d1a10',
                outline: 'none',
              }}
            />
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
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
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
