import { useState, useEffect, useMemo } from 'react'
import { X, HandCoins, Coins, Clock } from 'lucide-react'
import { CARDS, CardDefinition } from '../../lib/cards'
import { RARITY_COLOR } from '../../lib/rarity'
import { useCardInventory } from '../../hooks/useCardInventory'
import { subscribePendingCards, PendingCardInstance } from '../../lib/pendingCards'
import {
  getDefaultSellPrice,
  getNegotiateMaxPrice,
  getNegotiateChance,
  getSellCooldown,
  sellCardInstant,
  negotiateSellCard,
} from '../../lib/cardSelling'
import { useCountdown, formatCountdown } from '../../hooks/useCountdown'

interface SellCardModalProps {
  coupleId: string
  uid: string
  CoinIcon: React.ComponentType<{ size?: number; color?: string }>
  coinColor: string
  onClose: () => void
  onSold?: (msg: string) => void
}

interface DuplicateGroup {
  cardId: string
  card: CardDefinition
  instances: PendingCardInstance[]
}

export default function SellCardModal({
  coupleId,
  uid,
  CoinIcon,
  coinColor,
  onClose,
  onSold,
}: SellCardModalProps) {
  const [pending, setPending] = useState<PendingCardInstance[]>([])
  const { inventory } = useCardInventory(coupleId, uid)
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null)
  const [requestedAmount, setRequestedAmount] = useState(0)
  const [cooldownMs, setCooldownMs] = useState<number | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => subscribePendingCards(coupleId, uid, setPending), [coupleId, uid])

  // só cartas pendentes que já são duplicata (o jogador já tem 1 cópia creditada)
  const groups: DuplicateGroup[] = useMemo(() => {
    const map = new Map<string, PendingCardInstance[]>()
    for (const p of pending) {
      const owned = inventory?.[p.collectionId]?.[p.cardId] ?? 0
      if (owned < 1) continue
      const list = map.get(p.cardId) ?? []
      list.push(p)
      map.set(p.cardId, list)
    }
    return Array.from(map.entries())
      .map(([cardId, instances]) => ({
        cardId,
        instances: instances.sort((a, b) => a.addedAt - b.addedAt),
        card: CARDS.find((c) => c.id === cardId),
      }))
      .filter((g): g is DuplicateGroup => !!g.card)
  }, [pending, inventory])

  const selectedGroup = groups.find((g) => g.cardId === selectedCardId) ?? null

  useEffect(() => {
    if (!selectedGroup) return
    setRequestedAmount(getDefaultSellPrice(selectedGroup.card.rarity))
    setCooldownMs(null)
    getSellCooldown(coupleId, uid, selectedGroup.cardId).then(setCooldownMs)
  }, [selectedGroup?.cardId])

  // se a carta selecionada some da lista (vendida), volta pra lista
  useEffect(() => {
    if (selectedCardId && !groups.some((g) => g.cardId === selectedCardId)) {
      setSelectedCardId(null)
    }
  }, [groups, selectedCardId])

  const cooldown = useCountdown(cooldownMs !== null ? Date.now() + cooldownMs : null)

  async function handleSellInstant() {
    if (!selectedGroup || busy) return
    setBusy(true)
    const instance = selectedGroup.instances[0]
    await sellCardInstant(coupleId, uid, instance.id, selectedGroup.card.rarity)
    setBusy(false)
    onSold?.(`vendida por ${getDefaultSellPrice(selectedGroup.card.rarity)} moedas!`)
  }

  async function handleNegotiate() {
    if (!selectedGroup || busy) return
    setBusy(true)
    const instance = selectedGroup.instances[0]
    const result = await negotiateSellCard(
      coupleId,
      uid,
      instance.id,
      selectedGroup.cardId,
      selectedGroup.card.rarity,
      requestedAmount
    )
    setBusy(false)
    if (result === 'accepted') {
      onSold?.(`a Folhinha aceitou! +${requestedAmount} moedas`)
    } else {
      setCooldownMs(await getSellCooldown(coupleId, uid, selectedGroup.cardId))
      onSold?.('a Folhinha recusou a negociação dessa vez')
    }
  }

  const color = selectedGroup ? RARITY_COLOR[selectedGroup.card.rarity] : '#8b6914'
  const minPrice = selectedGroup ? getDefaultSellPrice(selectedGroup.card.rarity) : 0
  const maxPrice = selectedGroup ? getNegotiateMaxPrice(selectedGroup.card.rarity) : 0
  const chance = selectedGroup ? getNegotiateChance(selectedGroup.card.rarity, requestedAmount) : 0
  const isNegotiating = requestedAmount > minPrice
  const onCooldown = cooldownMs !== null

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
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'linear-gradient(160deg, #FBEAF0 0%, #F5ECD7 100%)',
          border: '1.5px solid rgba(212,160,176,0.4)',
          borderRadius: 18,
          padding: '20px 22px 24px',
          width: 460,
          maxHeight: '80vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'Baloo 2, sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 14,
          }}
        >
          <div style={{ fontSize: 15, fontWeight: 800, color: '#3d1a10' }}>vender pra Folhinha</div>
          <button
            onClick={onClose}
            style={{
              border: 'none',
              background: 'rgba(200,120,140,0.15)',
              color: 'rgba(122,48,64,0.7)',
              width: 26,
              height: 26,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <X size={14} strokeWidth={2.4} />
          </button>
        </div>

        {!selectedGroup && (
          <>
            {groups.length === 0 ? (
              <div
                style={{
                  fontSize: 12,
                  color: 'rgba(61,26,16,0.6)',
                  textAlign: 'center',
                  padding: '24px 8px',
                }}
              >
                nenhuma carta repetida pra vender agora
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 10,
                  overflowY: 'auto',
                  paddingBottom: 4,
                }}
              >
                {groups.map((g) => {
                  const c = RARITY_COLOR[g.card.rarity]
                  return (
                    <button
                      key={g.cardId}
                      onClick={() => setSelectedCardId(g.cardId)}
                      style={{
                        border: `2px solid ${c}`,
                        borderRadius: 12,
                        overflow: 'hidden',
                        background: '#fff',
                        cursor: 'pointer',
                        padding: 0,
                        position: 'relative',
                      }}
                    >
                      <img
                        src={g.card.image}
                        alt={g.card.name}
                        style={{
                          width: '100%',
                          aspectRatio: '5 / 7',
                          objectFit: 'cover',
                          display: 'block',
                        }}
                      />
                      {g.instances.length > 1 && (
                        <div
                          style={{
                            position: 'absolute',
                            bottom: 6,
                            right: 6,
                            background: '#c87090',
                            color: '#fff',
                            fontSize: 10,
                            fontWeight: 800,
                            borderRadius: 999,
                            padding: '2px 7px',
                          }}
                        >
                          {g.instances.length}
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            )}
          </>
        )}

        {selectedGroup && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <button
              onClick={() => setSelectedCardId(null)}
              style={{
                alignSelf: 'flex-start',
                border: 'none',
                background: 'transparent',
                color: 'rgba(61,26,16,0.6)',
                fontFamily: 'Baloo 2',
                fontWeight: 700,
                fontSize: 11,
                cursor: 'pointer',
                padding: 0,
              }}
            >
              ← voltar pra lista
            </button>

            <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
              <img
                src={selectedGroup.card.image}
                alt={selectedGroup.card.name}
                style={{
                  width: 90,
                  aspectRatio: '5 / 7',
                  objectFit: 'cover',
                  borderRadius: 10,
                  border: `2px solid ${color}`,
                }}
              />
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#3d1a10' }}>
                  {selectedGroup.card.name}
                </div>
                <div style={{ fontSize: 11, fontWeight: 700, color, marginTop: 2 }}>
                  {selectedGroup.card.rarity}
                </div>
                {selectedGroup.instances.length > 1 && (
                  <div style={{ fontSize: 11, color: 'rgba(61,26,16,0.55)', marginTop: 2 }}>
                    {selectedGroup.instances.length} cópias pendentes
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={handleSellInstant}
              disabled={busy}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                border: 'none',
                borderRadius: 12,
                padding: '11px 0',
                background: '#4A7A4A',
                color: '#fff',
                fontFamily: 'Baloo 2',
                fontWeight: 800,
                fontSize: 13,
                cursor: busy ? 'default' : 'pointer',
                opacity: busy ? 0.6 : 1,
              }}
            >
              <Coins size={16} /> vender direto por {minPrice}
            </button>

            <div
              style={{
                background: 'rgba(255,255,255,0.5)',
                borderRadius: 14,
                padding: '14px 16px 16px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: 12,
                  fontWeight: 800,
                  color: '#3d1a10',
                  marginBottom: 10,
                }}
              >
                <HandCoins size={15} /> negociar com a Folhinha
              </div>

              {onCooldown ? (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: 12,
                    color: 'rgba(61,26,16,0.6)',
                  }}
                >
                  <Clock size={13} />
                  ela recusou essa carta recentemente — tenta de novo em{' '}
                  {cooldown !== null ? formatCountdown(cooldown) : '...'}
                </div>
              ) : (
                <>
                  <input
                    type="range"
                    min={minPrice}
                    max={maxPrice}
                    value={requestedAmount}
                    onChange={(e) => setRequestedAmount(Number(e.target.value))}
                    style={{ width: '100%', accentColor: coinColor }}
                  />
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginTop: 8,
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 5,
                        color: coinColor,
                        fontWeight: 800,
                        fontSize: 14,
                      }}
                    >
                      <CoinIcon size={14} color={coinColor} /> {requestedAmount}
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(61,26,16,0.6)' }}>
                      {Math.round(chance * 100)}% de chance dela aceitar
                    </div>
                  </div>
                  <button
                    onClick={handleNegotiate}
                    disabled={busy || !isNegotiating}
                    style={{
                      marginTop: 12,
                      width: '100%',
                      border: 'none',
                      borderRadius: 10,
                      padding: '10px 0',
                      background: isNegotiating ? '#c87090' : 'rgba(200,120,140,0.35)',
                      color: '#fff',
                      fontFamily: 'Baloo 2',
                      fontWeight: 800,
                      fontSize: 12,
                      cursor: busy || !isNegotiating ? 'default' : 'pointer',
                    }}
                  >
                    propor {requestedAmount} moedas
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
