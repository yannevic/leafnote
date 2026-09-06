// src/components/ProfileBackgroundModal.tsx
import { useState, useEffect } from 'react'
import { X, Palette, Eye, ArrowLeft, Check } from 'lucide-react'
import PersonalCoinBadge from './PersonalCoinBadge'
import PurchaseConfirmModal from './PurchaseConfirmModal'
import {
  PROFILE_BACKGROUNDS,
  getBackgroundPrice,
  isProfileBackgroundOwned,
  subscribeOwnedProfileBackgrounds,
  buyProfileBackground,
  type ProfileBackgroundOption,
  type OwnedProfileBackgrounds,
} from '../lib/profileBackground'

const T = {
  text: '#3d1a10',
  textSub: 'rgba(61,26,16,0.5)',
  border: 'rgba(232,160,176,0.4)',
  btnPrimary: 'rgba(232,160,176,0.55)',
  ownedText: '#4A7A4A',
}

const SCROLLBAR_CSS = `
  .profile-bg-scroll::-webkit-scrollbar { width: 5px; }
  .profile-bg-scroll::-webkit-scrollbar-track { background: transparent; }
  .profile-bg-scroll::-webkit-scrollbar-thumb { background: rgba(232,160,176,0.55); border-radius: 99px; }
  .profile-bg-scroll::-webkit-scrollbar-thumb:hover { background: rgba(232,160,176,0.85); }
`

interface Props {
  uid: string
  currentId: string | null
  onSelect: (id: string) => void
  onBack: () => void
  onClose: () => void
}

export default function ProfileBackgroundModal({
  uid,
  currentId,
  onSelect,
  onBack,
  onClose,
}: Props) {
  const effectiveCurrent = currentId ?? 'default'
  const [owned, setOwned] = useState<OwnedProfileBackgrounds>({})
  const [previewOption, setPreviewOption] = useState<ProfileBackgroundOption | null>(null)
  const [confirmOption, setConfirmOption] = useState<ProfileBackgroundOption | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)

  useEffect(() => {
    return subscribeOwnedProfileBackgrounds(uid, setOwned)
  }, [uid])

  const handleConfirmBuy = async () => {
    if (!confirmOption) return
    const option = confirmOption
    const price = getBackgroundPrice(option)
    setConfirmOption(null)
    const ok = await buyProfileBackground(uid, option.id, price)
    if (ok) {
      onSelect(option.id) // já aplica assim que compra
      setFeedback(`${option.label} comprado e aplicado!`)
      setPreviewOption(null)
    } else {
      setFeedback('moedas insuficientes')
    }
    setTimeout(() => setFeedback(null), 2200)
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999999,
        background: 'rgba(61,26,16,0.35)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
    >
      <style>{SCROLLBAR_CSS}</style>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 300,
          height: 420,
          display: 'flex',
          flexDirection: 'column',
          background:
            'linear-gradient(160deg, rgba(253,246,240,0.98) 0%, rgba(252,232,238,0.98) 100%)',
          border: `1.5px solid ${T.border}`,
          borderRadius: 18,
          padding: 16,
          fontFamily: 'Baloo 2, sans-serif',
        }}
      >
        {/* header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 10,
            flexShrink: 0,
            gap: 8,
          }}
        >
          <button
            onClick={() => (previewOption ? setPreviewOption(null) : onBack())}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              padding: 0,
              color: T.text,
              minWidth: 0,
            }}
          >
            <ArrowLeft size={15} strokeWidth={2.3} />
            {previewOption ? (
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 800,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {previewOption.label}
              </span>
            ) : (
              <>
                <Palette size={15} color="rgba(200,120,140,0.7)" />
                <span style={{ fontSize: 13, fontWeight: 800 }}>fundo do perfil</span>
              </>
            )}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <PersonalCoinBadge uid={uid} />
            <button
              onClick={onClose}
              style={{
                width: 22,
                height: 22,
                borderRadius: '50%',
                border: 'none',
                background: 'rgba(200,120,140,0.18)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <X size={11} color="rgba(122,48,64,0.7)" />
            </button>
          </div>
        </div>

        <div className="profile-bg-scroll" style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
          {previewOption ? (
            (() => {
              const isOwned = isProfileBackgroundOwned(previewOption.id, owned)
              const price = getBackgroundPrice(previewOption)
              return (
                // centralizado no espaço disponível (minHeight:100%) e mockup
                // maior — antes ficava colado no topo com bastante vão em
                // branco embaixo
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    minHeight: '100%',
                    gap: 16,
                  }}
                >
                  <div
                    style={{
                      height: 220,
                      borderRadius: 16,
                      background: previewOption.background,
                      border: '1.5px solid rgba(255,255,255,0.6)',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    {/* mockup: barra de header + painel de recados, só pra dar noção de escala */}
                    <div
                      style={{
                        position: 'absolute',
                        top: 12,
                        left: 12,
                        right: 12,
                        height: 22,
                        borderRadius: 7,
                        border: '1.5px dashed rgba(255,255,255,0.7)',
                      }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        bottom: 14,
                        right: 14,
                        width: 96,
                        height: 130,
                        borderRadius: 10,
                        border: '1.5px dashed rgba(255,255,255,0.7)',
                      }}
                    />
                  </div>
                  <p
                    style={{
                      fontSize: 12,
                      color: T.textSub,
                      textAlign: 'center',
                      margin: 0,
                      lineHeight: 1.5,
                      padding: '0 6px',
                    }}
                  >
                    as bordas tracejadas só indicam onde ficam o cabeçalho e o painel de recados — o
                    fundo se aplica atrás de tudo.
                  </p>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button
                      onClick={() => setPreviewOption(null)}
                      style={{
                        flex: 1,
                        padding: '10px 0',
                        borderRadius: 12,
                        border: `1.5px solid ${T.border}`,
                        background: 'transparent',
                        fontFamily: 'Baloo 2, sans-serif',
                        fontWeight: 800,
                        fontSize: 13,
                        cursor: 'pointer',
                        color: T.textSub,
                      }}
                    >
                      voltar pra loja
                    </button>
                    {isOwned ? (
                      <button
                        onClick={() => {
                          onSelect(previewOption.id)
                          setPreviewOption(null)
                        }}
                        style={{
                          flex: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 5,
                          padding: '10px 0',
                          borderRadius: 12,
                          border: 'none',
                          background: T.btnPrimary,
                          color: T.text,
                          fontFamily: 'Baloo 2, sans-serif',
                          fontWeight: 800,
                          fontSize: 13,
                          cursor: 'pointer',
                        }}
                      >
                        <Check size={13} strokeWidth={2.5} /> usar
                      </button>
                    ) : (
                      <button
                        onClick={() => setConfirmOption(previewOption)}
                        style={{
                          flex: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 5,
                          padding: '10px 0',
                          borderRadius: 12,
                          border: 'none',
                          background: T.btnPrimary,
                          color: T.text,
                          fontFamily: 'Baloo 2, sans-serif',
                          fontWeight: 800,
                          fontSize: 13,
                          cursor: 'pointer',
                        }}
                      >
                        comprar · {price}
                      </button>
                    )}
                  </div>
                </div>
              )
            })()
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {PROFILE_BACKGROUNDS.map((opt) => {
                const selected = opt.id === effectiveCurrent
                const isOwned = isProfileBackgroundOwned(opt.id, owned)
                const price = getBackgroundPrice(opt)
                return (
                  <div
                    key={opt.id}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <div
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: 12,
                        background: opt.background,
                        border: selected
                          ? '2.5px solid rgba(232,96,122,0.7)'
                          : '1.5px solid rgba(255,255,255,0.6)',
                        position: 'relative',
                        boxShadow: '0 2px 8px rgba(122,48,64,0.15)',
                      }}
                    >
                      {selected && (
                        <div
                          style={{
                            position: 'absolute',
                            top: -6,
                            right: -6,
                            width: 16,
                            height: 16,
                            borderRadius: '50%',
                            background: 'rgba(232,96,122,0.85)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Check size={9} color="#fff" strokeWidth={3} />
                        </div>
                      )}
                    </div>
                    <span
                      style={{ fontSize: 9, fontWeight: 700, color: T.text, textAlign: 'center' }}
                    >
                      {opt.label}
                    </span>
                    {selected ? (
                      <span style={{ fontSize: 8, fontWeight: 800, color: T.ownedText }}>
                        em uso
                      </span>
                    ) : isOwned ? (
                      <button
                        onClick={() => onSelect(opt.id)}
                        style={{
                          fontSize: 9,
                          fontWeight: 800,
                          padding: '2px 8px',
                          borderRadius: 20,
                          border: 'none',
                          background: T.btnPrimary,
                          color: T.text,
                          cursor: 'pointer',
                        }}
                      >
                        usar
                      </button>
                    ) : (
                      <div style={{ display: 'flex', gap: 3 }}>
                        <button
                          onClick={() => setPreviewOption(opt)}
                          title="ver como fica"
                          style={{
                            width: 20,
                            height: 20,
                            borderRadius: '50%',
                            border: `1.5px solid ${T.border}`,
                            background: 'rgba(253,242,246,0.7)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: 0,
                          }}
                        >
                          <Eye size={10} color={T.text} />
                        </button>
                        <button
                          onClick={() => setConfirmOption(opt)}
                          style={{
                            fontSize: 9,
                            fontWeight: 800,
                            padding: '2px 6px',
                            borderRadius: 20,
                            border: 'none',
                            background: T.btnPrimary,
                            color: T.text,
                            cursor: 'pointer',
                          }}
                        >
                          {price}
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {confirmOption && (
        <PurchaseConfirmModal
          uid={uid}
          label={confirmOption.label}
          price={getBackgroundPrice(confirmOption)}
          onConfirm={handleConfirmBuy}
          onCancel={() => setConfirmOption(null)}
        />
      )}

      {feedback && (
        <div
          style={{
            position: 'fixed',
            bottom: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            background: T.text,
            color: 'white',
            padding: '8px 18px',
            borderRadius: 20,
            fontFamily: 'Baloo 2, sans-serif',
            fontWeight: 800,
            fontSize: 12,
            zIndex: 999999999,
          }}
        >
          {feedback}
        </div>
      )}
    </div>
  )
}
