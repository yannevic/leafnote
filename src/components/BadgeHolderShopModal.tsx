// src/components/BadgeHolderShopModal.tsx
import { useState } from 'react'
import { X, ShoppingBag, Eye, ArrowLeft } from 'lucide-react'
import PersonalCoinBadge from './PersonalCoinBadge'
import PurchaseConfirmModal from './PurchaseConfirmModal'
import {
  BADGE_HOLDER_MODELS,
  MAX_BADGES_PER_HOLDER,
  buyBadgeHolderModel,
  type BadgeHolderModel,
} from '../lib/profileBadgeHolders'

const T = {
  text: '#3d1a10',
  textSub: 'rgba(61,26,16,0.5)',
  border: 'rgba(232,160,176,0.4)',
  btnPrimary: 'rgba(232,160,176,0.55)',
  card: 'rgba(253,242,246,0.7)',
}

const SCROLLBAR_CSS = `
  .badge-shop-scroll::-webkit-scrollbar { width: 5px; }
  .badge-shop-scroll::-webkit-scrollbar-track { background: transparent; }
  .badge-shop-scroll::-webkit-scrollbar-thumb { background: rgba(232,160,176,0.55); border-radius: 99px; }
  .badge-shop-scroll::-webkit-scrollbar-thumb:hover { background: rgba(232,160,176,0.85); }
`

interface Props {
  uid: string
  onBack: () => void
  onClose: () => void
}

export default function BadgeHolderShopModal({ uid, onBack, onClose }: Props) {
  const [previewModel, setPreviewModel] = useState<BadgeHolderModel | null>(null)
  const [confirmModel, setConfirmModel] = useState<BadgeHolderModel | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)

  const handleConfirmBuy = async () => {
    if (!confirmModel) return
    const model = confirmModel
    setConfirmModel(null)
    const ok = await buyBadgeHolderModel(uid, model.id, model.price)
    setFeedback(ok ? `${model.label} comprada!` : 'moedas insuficientes')
    setPreviewModel(null)
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
          width: 340,
          height: 460,
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
        {/* header — fixo, não rola */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 12,
            flexShrink: 0,
            gap: 8,
          }}
        >
          <button
            onClick={() => (previewModel ? setPreviewModel(null) : onBack())}
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
            {previewModel ? (
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 800,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {previewModel.label}
              </span>
            ) : (
              <>
                <ShoppingBag size={15} color="rgba(200,120,140,0.7)" />
                <span style={{ fontSize: 13, fontWeight: 800 }}>molduras de badge</span>
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

        {/* corpo — só essa parte rola */}
        <div className="badge-shop-scroll" style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
          {previewModel ? (
            // centralizado no espaço disponível (minHeight:100% dentro de um
            // container flex) — antes o conteúdo ficava colado no topo e
            // sobrava bastante vão em branco embaixo. Mockup e fontes também
            // maiores, pra preencher melhor o card.
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
                  background:
                    'linear-gradient(160deg, rgba(253,246,240,0.9) 0%, rgba(252,232,238,0.9) 100%)',
                  border: `1.5px dashed ${T.border}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '14px 22px',
                    borderRadius: 999,
                    background: previewModel.background,
                    border: '2px solid rgba(255,255,255,0.6)',
                    boxShadow: '0 8px 22px rgba(122,48,64,0.2)',
                  }}
                >
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      style={{
                        width: 46,
                        height: 46,
                        borderRadius: '50%',
                        border: '2px dashed rgba(255,255,255,0.85)',
                        background: 'rgba(255,255,255,0.25)',
                      }}
                    />
                  ))}
                </div>
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
                as bolinhas tracejadas são só ilustrativas — depois de comprada, você escolhe quais
                badges colocar (até {MAX_BADGES_PER_HOLDER}).
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={() => setPreviewModel(null)}
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
                <button
                  onClick={() => setConfirmModel(previewModel)}
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
                  comprar
                </button>
              </div>
            </div>
          ) : (
            <>
              <p
                style={{
                  fontSize: 10,
                  color: T.textSub,
                  marginTop: 0,
                  marginBottom: 10,
                  lineHeight: 1.4,
                }}
              >
                cada moldura comprada vai pro seu inventário — dá pra ter mais de uma igual, e cada
                uma guarda até {MAX_BADGES_PER_HOLDER} badges.
              </p>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: 10,
                  paddingBottom: 4,
                }}
              >
                {BADGE_HOLDER_MODELS.map((model) => (
                  <div
                    key={model.id}
                    style={{
                      border: `1.5px solid ${T.border}`,
                      borderRadius: 12,
                      padding: 10,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <div
                      style={{
                        width: 60,
                        height: 34,
                        borderRadius: 999,
                        background: model.background,
                        border: '2px solid rgba(255,255,255,0.6)',
                      }}
                    />
                    <span style={{ fontSize: 10, fontWeight: 700, color: T.text }}>
                      {model.label}
                    </span>
                    <div style={{ display: 'flex', gap: 4, width: '100%' }}>
                      <button
                        onClick={() => setPreviewModel(model)}
                        title="ver como fica no perfil"
                        style={{
                          width: 26,
                          height: 26,
                          borderRadius: '50%',
                          border: `1.5px solid ${T.border}`,
                          background: T.card,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          padding: 0,
                        }}
                      >
                        <Eye size={12} color={T.text} strokeWidth={2.2} />
                      </button>
                      <button
                        onClick={() => setConfirmModel(model)}
                        style={{
                          flex: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '3px 6px',
                          borderRadius: 20,
                          border: 'none',
                          background: T.btnPrimary,
                          cursor: 'pointer',
                        }}
                      >
                        <PersonalCoinBadge uid={uid} amount={model.price} size={11} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {confirmModel && (
        <PurchaseConfirmModal
          uid={uid}
          label={confirmModel.label}
          price={confirmModel.price}
          onConfirm={handleConfirmBuy}
          onCancel={() => setConfirmModel(null)}
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
