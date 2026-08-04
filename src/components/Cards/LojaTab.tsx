import { useState } from 'react'
import { Package, ZoomIn } from 'lucide-react'
import { CardDefinition, CARDS } from '../../lib/cards'
import { RARITY_COLOR } from '../../lib/rarity'
import { openPack, PackType, PACK_PRICES } from '../../lib/packs'
import { buyFromRotatingShop, SHOP_PRICES } from '../../lib/rotatingShop'
import { useCardInventory } from '../../hooks/useCardInventory'
import { useRotatingShop } from '../../hooks/useRotatingShop'
import { usePersonalCoin } from '../../hooks/usePersonalCoin'
import { COIN_ICONS } from '../../lib/personalCoinIcons'
import PackOpenModal from './PackOpenModal'
import CardZoomModal from './CardZoomModal'
import { PACK_ART } from '../../assets/cards/packs'

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
  const [result, setResult] = useState<CardDefinition[] | null>(null)
  const [ownedBefore, setOwnedBefore] = useState<Record<string, number>>({})
  const [toast, setToast] = useState<string | null>(null)
  const [shopRefresh, setShopRefresh] = useState(0)

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }
  const { inventory } = useCardInventory(coupleId, uid)
  const { data: shopData, loading: shopLoading } = useRotatingShop(coupleId, shopRefresh)
  const { coin } = usePersonalCoin(uid)
  const CoinIcon = coin ? COIN_ICONS[coin.icon] : Package
  const coinColor = coin?.color ?? '#8b6914'

  async function handleConfirmPurchase() {
    if (!confirmPack) return
    const type = confirmPack
    setConfirmPack(null)
    setOpening(type)
    const snapshotBefore = { ...(inventory['jardim-secreto'] ?? {}) }
    const res = await openPack(coupleId, uid, type)
    setOpening(null)
    if (!res) {
      showToast('saldo insuficiente')
      return
    }
    setOwnedBefore(snapshotBefore)
    setResult(res.cards)
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

  const daysLeft = shopData
    ? Math.max(0, Math.ceil((shopData.nextRotation - Date.now()) / (24 * 60 * 60 * 1000)))
    : null

  return (
    <div
      style={{
        padding: '20px 24px 40px',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'stretch',
        justifyContent: 'center',
        gap: 16,
      }}
    >
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
            return (
              <button
                key={type}
                onClick={() => setConfirmPack(type)}
                disabled={opening !== null}
                style={{
                  flex: '1 1 200px',
                  maxWidth: 260,
                  border: 'none',
                  borderRadius: 18,
                  overflow: 'hidden',
                  cursor: opening ? 'default' : 'pointer',
                  background: '#fff',
                  boxShadow: '0 6px 20px rgba(122,48,64,0.16)',
                  fontFamily: 'Baloo 2',
                  padding: 0,
                  transition: 'transform 0.15s',
                }}
              >
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
                  <img
                    src={PACK_ART[type]}
                    alt={theme.label}
                    style={{ width: '80%', height: '80%', objectFit: 'contain', display: 'block' }}
                  />
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
          {daysLeft !== null && (
            <span style={{ fontSize: 11, fontWeight: 700, color: '#8b6914', marginLeft: 8 }}>
              renova em {daysLeft}d
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
                  style={{
                    flex: '1 1 180px',
                    maxWidth: 220,
                    borderRadius: 16,
                    overflow: 'hidden',
                    background: '#fff',
                    border: `2px solid ${color}`,
                    boxShadow: '0 6px 20px rgba(122,48,64,0.12)',
                  }}
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
          CoinIcon={CoinIcon}
          coinColor={coinColor}
          onConfirm={handleConfirmPurchase}
          onCancel={() => setConfirmPack(null)}
        />
      )}

      {confirmShopCard && (
        <ConfirmPurchaseModal
          label={confirmShopCard.name}
          price={SHOP_PRICES[confirmShopCard.rarity as 'incomum' | 'rara' | 'epica']}
          CoinIcon={CoinIcon}
          coinColor={coinColor}
          onConfirm={handleConfirmShopPurchase}
          onCancel={() => setConfirmShopCard(null)}
        />
      )}

      {result && (
        <PackOpenModal cards={result} ownedBefore={ownedBefore} onClose={() => setResult(null)} />
      )}

      {zoomCard && <CardZoomModal card={zoomCard} onClose={() => setZoomCard(null)} />}

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
  CoinIcon,
  coinColor,
  onConfirm,
  onCancel,
}: {
  label: string
  price: number
  CoinIcon: React.ComponentType<{ size?: number; color?: string }>
  coinColor: string
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
      }}
      onClick={onCancel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'linear-gradient(160deg, #FBEAF0 0%, #F5ECD7 100%)',
          border: '1.5px solid rgba(212,160,176,0.5)',
          borderRadius: 18,
          padding: '24px 26px',
          width: 280,
          fontFamily: 'Baloo 2, sans-serif',
          textAlign: 'center',
        }}
      >
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
