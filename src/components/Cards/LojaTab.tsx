import { useState, useEffect, useRef } from 'react'
import { useCountdown, formatCountdown } from '../../hooks/useCountdown'
import { Package, ZoomIn, HelpCircle } from 'lucide-react'
import CardsGuideModal from './CardsGuideModal'
import { CardDefinition, CARDS, COLLECTIONS } from '../../lib/cards'
import { RARITY_COLOR } from '../../lib/rarity'
import { PackType, PACK_PRICES } from '../../lib/packs'
import { buyPack } from '../../lib/unopenedPacks'
import { buyFromRotatingShop, SHOP_PRICES } from '../../lib/rotatingShop'

import { useRotatingShop } from '../../hooks/useRotatingShop'
import { usePromoCollection } from '../../hooks/usePromoCollection'
import { usePersonalCoin } from '../../hooks/usePersonalCoin'
import { COIN_ICONS } from '../../lib/personalCoinIcons'

import CardZoomModal from './CardZoomModal'
import { PACK_ART, getPromoPackArt } from '../../assets/cards/packs'

interface LojaTabProps {
  coupleId: string
  uid: string
}

const PACK_THEME: Record<PackType, { label: string; gradient: string; accent: string }> = {
  comum: {
    label: 'pacote comum',
    gradient: 'linear-gradient(160deg, #7FB87F 0%, #4A7A4A 100%)',
    accent: '#2D4A2D',
  },
  promocional: {
    label: 'pacote promocional',
    gradient: 'linear-gradient(160deg, #F5D5DC 0%, #c87090 100%)',
    accent: '#7a3040',
  },
}

export default function LojaTab({ coupleId, uid }: LojaTabProps) {
  const [opening, setOpening] = useState<PackType | null>(null)
  const [confirmPack, setConfirmPack] = useState<PackType | null>(null)
  const [confirmShopCard, setConfirmShopCard] = useState<CardDefinition | null>(null)
  const [zoomCard, setZoomCard] = useState<CardDefinition | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [shopRefresh, setShopRefresh] = useState(0)
  const [showGuide, setShowGuide] = useState(false)
  const [hoveredPack, setHoveredPack] = useState<PackType | null>(null)

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }
  const { data: shopData, loading: shopLoading } = useRotatingShop(coupleId, shopRefresh)
  const { state: promoState } = usePromoCollection(coupleId)
  const promoCountdown = useCountdown(promoState?.nextRotation ?? null)
  const promoCollectionName = promoState?.current
    ? COLLECTIONS[promoState.current as keyof typeof COLLECTIONS]?.name
    : null
  const { coin } = usePersonalCoin(uid)
  const CoinIcon = coin ? COIN_ICONS[coin.icon] : Package
  const coinColor = coin?.color ?? '#8b6914'

  function packImageFor(type: PackType) {
    return type === 'comum'
      ? PACK_ART.comum
      : promoState?.current
        ? getPromoPackArt(promoState.current)
        : null
  }

  async function handleConfirmPurchase() {
    if (!confirmPack) return
    const type = confirmPack
    setConfirmPack(null)
    setOpening(type)
    const ok = await buyPack(coupleId, uid, type)
    setOpening(null)
    if (!ok) {
      showToast('saldo insuficiente')
      return
    }
    showToast('pacote guardado na mochila!')
  }

  async function handleConfirmShopPurchase() {
    if (!confirmShopCard) return
    const card = confirmShopCard
    setConfirmShopCard(null)
    const ok = await buyFromRotatingShop(coupleId, uid, card)
    if (!ok) {
      showToast('saldo insuficiente')
      return
    }
    setShopRefresh((v) => v + 1)
    showToast(`${card.name} adicionada à coleção!`)
  }

  const shopCards = (shopData?.cardIds ?? [])
    .map((id) => CARDS.find((c) => c.id === id))
    .filter((c): c is CardDefinition => !!c)

  const countdown = useCountdown(shopData?.nextRotation ?? null)

  // quando o contador zera, força um refresh do hook da loja rotativa
  // pra buscar as cartas novas assim que a rotação virar
  const hasRefreshedRef = useRef(false)
  useEffect(() => {
    if (countdown?.expired && !hasRefreshedRef.current) {
      hasRefreshedRef.current = true
      setShopRefresh((v) => v + 1)
    }
    if (countdown && !countdown.expired) {
      hasRefreshedRef.current = false
    }
  }, [countdown?.expired])

  return (
    <div
      style={{
        padding: '20px 24px 40px',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'stretch',
        justifyContent: 'center',
        gap: 16,
        position: 'relative',
      }}
    >
      <style>{`
        @keyframes lojaShineSweep {
          0% { transform: translateX(-130%) skewX(-20deg); }
          100% { transform: translateX(230%) skewX(-20deg); }
        }
        @keyframes modalPopIn {
          0% { opacity: 0; transform: scale(0.82) translateY(12px); }
          55% { opacity: 1; transform: scale(1.04) translateY(-3px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes modalBackdropIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .pack-buy-btn {
          transition: transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.22s;
        }
        .pack-buy-btn:hover:not(:disabled) { transform: translateY(-4px) scale(1.035); }
        .pack-buy-btn:active:not(:disabled) { transform: translateY(-1px) scale(0.98); }
        .pack-shine {
          position: absolute;
          top: 0;
          left: 0;
          width: 40%;
          height: 100%;
          background: linear-gradient(100deg, transparent, rgba(255,255,255,0.55), transparent);
          animation: lojaShineSweep 3.2s ease-in-out infinite;
          pointer-events: none;
        }
        .confirm-btn-anim {
          transition: transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .confirm-btn-anim:hover { transform: scale(1.05); }
        .confirm-btn-anim:active { transform: scale(0.95); }
        @keyframes lojaCardGlow {
          0%, 100% { box-shadow: 0 6px 20px rgba(122,48,64,0.12); }
          50% { box-shadow: 0 6px 20px rgba(122,48,64,0.12), 0 0 18px 3px var(--glow-color, rgba(0,0,0,0)); }
        }
        .shop-card {
          animation: lojaCardGlow 2.6s ease-in-out infinite;
          transition: transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .shop-card:hover { transform: translateY(-4px) scale(1.03); }
        @keyframes modalImagePop {
          0% { opacity: 0; transform: scale(0.85); }
          100% { opacity: 1; transform: scale(1); }
        }
        .confirm-modal-image {
          animation: modalImagePop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) 0.05s both;
        }
      `}</style>
      <button
        onClick={() => setShowGuide(true)}
        style={{
          position: 'absolute',
          top: 20,
          right: 24,
          width: 30,
          height: 30,
          borderRadius: '50%',
          border: 'none',
          background: 'rgba(200,120,140,0.15)',
          color: 'rgba(122,48,64,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 10,
        }}
      >
        <HelpCircle size={16} strokeWidth={2.2} />
      </button>
      {/* ── Bloco pacotes ── */}
      <section
        style={{
          flex: 1,
          minWidth: 0,
          background: 'rgba(255,255,255,0.4)',
          borderRadius: 20,
          padding: '20px 24px 26px',
        }}
      >
        <SectionTitle>pacotes</SectionTitle>
        <div
          style={{
            display: 'flex',
            gap: 20,
            justifyContent: 'center',
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          {(['comum', 'promocional'] as PackType[]).map((type) => {
            const theme = PACK_THEME[type]
            const tooltipText =
              type === 'comum'
                ? Object.values(COLLECTIONS)
                    .map((c) => c.name)
                    .join(', ')
                : (promoCollectionName ?? '...')
            const packImage = packImageFor(type)
            return (
              <div
                key={type}
                onMouseEnter={() => setHoveredPack(type)}
                onMouseLeave={() => setHoveredPack(null)}
                style={{
                  position: 'relative',
                  flex: '1 1 200px',
                  maxWidth: 260,
                }}
              >
                {hoveredPack === type && (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '100%',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      marginBottom: 8,
                      background: 'rgba(44,20,8,0.92)',
                      color: '#fff',
                      fontSize: 11,
                      fontWeight: 700,
                      fontFamily: 'Baloo 2',
                      padding: '8px 12px',
                      borderRadius: 10,
                      whiteSpace: 'nowrap',
                      zIndex: 20,
                      pointerEvents: 'none',
                      boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
                    }}
                  >
                    pode conter: {tooltipText}
                  </div>
                )}
                <button
                  onClick={() => setConfirmPack(type)}
                  disabled={opening !== null || !packImage}
                  className="pack-buy-btn"
                  style={{
                    width: '100%',
                    border: 'none',
                    borderRadius: 18,
                    overflow: 'hidden',
                    cursor: opening ? 'default' : 'pointer',
                    background: '#fff',
                    boxShadow: '0 6px 20px rgba(122,48,64,0.16)',
                    fontFamily: 'Baloo 2',
                    padding: 0,
                    position: 'relative',
                  }}
                >
                  {packImage && <div className="pack-shine" />}
                  <div
                    style={{
                      aspectRatio: '5 / 8',
                      background: 'transparent',
                      overflow: 'hidden',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {packImage && (
                      <img
                        src={packImage}
                        alt={theme.label}
                        style={{
                          width: '80%',
                          height: '80%',
                          objectFit: 'contain',
                          display: 'block',
                        }}
                      />
                    )}
                  </div>
                  <div
                    style={{
                      padding: '14px 12px 16px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    <div style={{ fontSize: 14, fontWeight: 800, color: theme.accent }}>
                      {opening === type ? 'abrindo...' : theme.label}
                    </div>
                    {type === 'promocional' && promoCountdown !== null && (
                      <div
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          color: theme.accent,
                          fontVariantNumeric: 'tabular-nums',
                        }}
                      >
                        troca em {formatCountdown(promoCountdown)}
                      </div>
                    )}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        background: `${coinColor}1a`,
                        color: coinColor,
                        fontWeight: 800,
                        fontSize: 13,
                        padding: '6px 16px',
                        borderRadius: 999,
                      }}
                    >
                      <CoinIcon size={14} /> {PACK_PRICES[type]}
                    </div>
                  </div>
                </button>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── Bloco loja rotativa ── */}
      <section
        style={{
          flex: 1,
          minWidth: 0,
          background: 'rgba(255,255,255,0.4)',
          borderRadius: 20,
          padding: '20px 24px 26px',
        }}
      >
        <SectionTitle>
          loja rotativa
          {countdown !== null && (
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: '#8b6914',
                marginLeft: 8,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              renova em {formatCountdown(countdown)}
            </span>
          )}
        </SectionTitle>
        {shopLoading ? (
          <div style={{ textAlign: 'center', color: '#8b6914', fontSize: 12 }}>carregando...</div>
        ) : (
          <div
            style={{
              display: 'flex',
              gap: 16,
              justifyContent: 'center',
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            {shopCards.map((card) => {
              const color = RARITY_COLOR[card.rarity]
              return (
                <div
                  key={card.id}
                  className="shop-card"
                  style={
                    {
                      flex: '1 1 180px',
                      maxWidth: 220,
                      borderRadius: 16,
                      overflow: 'hidden',
                      background: '#fff',
                      border: `2px solid ${color}`,
                      boxShadow: '0 6px 20px rgba(122,48,64,0.12)',
                      '--glow-color': `${color}88`,
                    } as React.CSSProperties
                  }
                >
                  <div
                    onClick={() => setZoomCard(card)}
                    style={{ position: 'relative', cursor: 'pointer' }}
                    onMouseEnter={(e) => {
                      const hint = e.currentTarget.querySelector('.zoom-hint') as HTMLElement
                      if (hint) hint.style.opacity = '1'
                    }}
                    onMouseLeave={(e) => {
                      const hint = e.currentTarget.querySelector('.zoom-hint') as HTMLElement
                      if (hint) hint.style.opacity = '0'
                    }}
                  >
                    <img
                      src={card.image}
                      alt={card.name}
                      style={{
                        width: '100%',
                        aspectRatio: '5 / 7',
                        objectFit: 'cover',
                        display: 'block',
                      }}
                    />
                    <div className="pack-shine" />
                    <div
                      className="zoom-hint"
                      style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'rgba(0,0,0,0.28)',
                        opacity: 0,
                        transition: 'opacity 0.15s',
                      }}
                    >
                      <ZoomIn size={24} color="#fff" strokeWidth={2.2} />
                    </div>
                  </div>
                  <div
                    style={{
                      padding: '10px 10px 12px',
                      textAlign: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 800,
                        color,
                        minHeight: 30,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        lineHeight: 1.25,
                      }}
                    >
                      {card.name}
                    </div>
                    <button
                      onClick={() => setConfirmShopCard(card)}
                      className="confirm-btn-anim"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 5,
                        width: '100%',
                        border: 'none',
                        borderRadius: 999,
                        padding: '7px 0',
                        background: `${coinColor}1a`,
                        color: coinColor,
                        fontWeight: 800,
                        fontSize: 12,
                        cursor: 'pointer',
                        fontFamily: 'Baloo 2',
                      }}
                    >
                      <CoinIcon size={13} />{' '}
                      {SHOP_PRICES[card.rarity as 'incomum' | 'rara' | 'epica']}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {confirmPack && (
        <ConfirmPurchaseModal
          label={PACK_THEME[confirmPack].label}
          price={PACK_PRICES[confirmPack]}
          image={packImageFor(confirmPack) ?? ''}
          imageAspect="5 / 8"
          CoinIcon={CoinIcon}
          coinColor={coinColor}
          accentColor={PACK_THEME[confirmPack].accent}
          onConfirm={handleConfirmPurchase}
          onCancel={() => setConfirmPack(null)}
        />
      )}

      {confirmShopCard && (
        <ConfirmPurchaseModal
          label={confirmShopCard.name}
          price={SHOP_PRICES[confirmShopCard.rarity as 'incomum' | 'rara' | 'epica']}
          image={confirmShopCard.image}
          imageAspect="5 / 7"
          CoinIcon={CoinIcon}
          coinColor={coinColor}
          accentColor={RARITY_COLOR[confirmShopCard.rarity]}
          onConfirm={handleConfirmShopPurchase}
          onCancel={() => setConfirmShopCard(null)}
        />
      )}

      {zoomCard && <CardZoomModal card={zoomCard} onClose={() => setZoomCard(null)} />}

      {showGuide && <CardsGuideModal coupleId={coupleId} onClose={() => setShowGuide(false)} />}

      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: 32,
            left: '50%',
            transform: 'translateX(-50%)',
            background:
              'linear-gradient(160deg, rgba(253,246,240,0.97) 0%, rgba(252,232,238,0.97) 100%)',
            border: '1.5px solid rgba(232,160,176,0.4)',
            color: '#3d1a10',
            borderRadius: 14,
            padding: '10px 22px',
            fontSize: 13,
            fontWeight: 800,
            fontFamily: 'Baloo 2, sans-serif',
            zIndex: 9999999,
            boxShadow: '0 8px 40px rgba(200,120,140,0.2)',
            backdropFilter: 'blur(18px)',
            whiteSpace: 'nowrap',
          }}
        >
          {toast}
        </div>
      )}
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: 13,
        fontWeight: 800,
        color: '#2D4A2D',
        textAlign: 'center',
        marginBottom: 16,
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
      }}
    >
      {children}
    </div>
  )
}

function ConfirmPurchaseModal({
  label,
  price,
  image,
  imageAspect = '5 / 7',
  CoinIcon,
  coinColor,
  accentColor,
  onConfirm,
  onCancel,
}: {
  label: string
  price: number
  image: string
  imageAspect?: string
  CoinIcon: React.ComponentType<{ size?: number; color?: string }>
  coinColor: string
  accentColor: string
  onConfirm: () => void
  onCancel: () => void
}) {
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
        animation: 'modalBackdropIn 0.2s ease-out',
      }}
      onClick={onCancel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'linear-gradient(160deg, #FBEAF0 0%, #F5ECD7 100%)',
          border: `1.5px solid ${accentColor}66`,
          borderRadius: 18,
          padding: '24px 26px',
          width: 300,
          fontFamily: 'Baloo 2, sans-serif',
          textAlign: 'center',
          animation: 'modalPopIn 0.38s cubic-bezier(0.34, 1.56, 0.64, 1)',
          boxShadow: `0 12px 40px rgba(122,48,64,0.25), 0 0 0 4px ${accentColor}22`,
        }}
      >
        <div
          className="confirm-modal-image"
          style={{
            width: 150,
            aspectRatio: imageAspect,
            margin: '0 auto 16px',
            borderRadius: 14,
            overflow: 'hidden',
            border: `2.5px solid ${accentColor}`,
            boxShadow: `0 8px 24px ${accentColor}55`,
          }}
        >
          <img
            src={image}
            alt={label}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        </div>
        <div style={{ fontSize: 14, fontWeight: 800, color: '#3d1a10', marginBottom: 8 }}>
          comprar {label}?
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            color: coinColor,
            fontWeight: 800,
            fontSize: 14,
            marginBottom: 18,
          }}
        >
          <CoinIcon size={16} color={coinColor} /> {price} moedas
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={onCancel}
            className="confirm-btn-anim"
            style={{
              flex: 1,
              padding: '9px 0',
              borderRadius: 10,
              background: 'transparent',
              border: '1.5px solid rgba(212,160,176,0.5)',
              color: 'rgba(61,26,16,0.6)',
              fontFamily: 'Baloo 2',
              fontWeight: 800,
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            cancelar
          </button>
          <button
            onClick={onConfirm}
            className="confirm-btn-anim"
            style={{
              flex: 1,
              padding: '9px 0',
              borderRadius: 10,
              background: '#4A7A4A',
              border: 'none',
              color: '#fff',
              fontFamily: 'Baloo 2',
              fontWeight: 800,
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            confirmar
          </button>
        </div>
      </div>
    </div>
  )
}
