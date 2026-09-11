import { useState, useEffect, useMemo } from 'react'
import { X, Check, Recycle } from 'lucide-react'
import { CARDS, CardDefinition } from '../../lib/cards'
import { CardRarity, RARITY_COLOR } from '../../lib/rarity'
import { useCardInventory } from '../../hooks/useCardInventory'
import { subscribePendingCards, PendingCardInstance } from '../../lib/pendingCards'
import { getRedeemCost, redeemRarityPack } from '../../lib/rarityRedeem'
import { CARD_SELL_VALUE } from '../../lib/economyConfig'

interface RarityRedeemModalProps {
  coupleId: string
  uid: string
  onClose: () => void
  onRedeemed?: (msg: string) => void
}

interface DuplicateGroup {
  cardId: string
  card: CardDefinition
  instances: PendingCardInstance[]
}

const RARITY_ORDER: CardRarity[] = ['comum', 'incomum', 'rara', 'epica']
const RARITY_LABEL: Record<CardRarity, string> = {
  comum: 'comum',
  incomum: 'incomum',
  rara: 'rara',
  epica: 'épica',
}

export default function RarityRedeemModal({
  coupleId,
  uid,
  onClose,
  onRedeemed,
}: RarityRedeemModalProps) {
  const [pending, setPending] = useState<PendingCardInstance[]>([])
  const { inventory } = useCardInventory(coupleId, uid)
  const [targetRarity, setTargetRarity] = useState<CardRarity | null>(null)
  // quantas cópias de cada cardId estão selecionadas pra pagar (0 até instances.length)
  const [selectedCounts, setSelectedCounts] = useState<Record<string, number>>({})
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<'fail' | null>(null)

  useEffect(() => subscribePendingCards(coupleId, uid, setPending), [coupleId, uid])

  const ownedCardIds = useMemo(() => {
    const owned = new Set<string>()
    if (!inventory) return owned
    for (const collectionId of Object.keys(inventory)) {
      for (const cardId of Object.keys(inventory[collectionId] ?? {})) {
        if ((inventory[collectionId][cardId] ?? 0) > 0) owned.add(cardId)
      }
    }
    return owned
  }, [inventory])

  const missingByRarity = useMemo(() => {
    const map: Record<CardRarity, number> = { comum: 0, incomum: 0, rara: 0, epica: 0 }
    for (const c of CARDS) {
      if (c.secret) continue
      if (!ownedCardIds.has(c.id)) map[c.rarity]++
    }
    return map
  }, [ownedCardIds])

  const duplicateGroups: DuplicateGroup[] = useMemo(() => {
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

  const groupsByRarity = useMemo(() => {
    const map: Record<CardRarity, DuplicateGroup[]> = {
      comum: [],
      incomum: [],
      rara: [],
      epica: [],
    }
    for (const g of duplicateGroups) map[g.card.rarity].push(g)
    return map
  }, [duplicateGroups])

  const cost = targetRarity ? getRedeemCost(targetRarity) : 0

  const selectedTotal = useMemo(() => {
    let sum = 0
    for (const g of duplicateGroups) {
      const count = selectedCounts[g.cardId] ?? 0
      sum += count * CARD_SELL_VALUE[g.card.rarity]
    }
    return sum
  }, [duplicateGroups, selectedCounts])

  const selectedCount = useMemo(
    () => Object.values(selectedCounts).reduce((a, b) => a + b, 0),
    [selectedCounts]
  )

  const enough = selectedTotal >= cost
  const overshoot = selectedTotal - cost

  // clique na carta: 1º clique seleciona 1 cópia, cliques seguintes vão
  // selecionando as próximas cópias uma a uma; ao passar da última cópia
  // disponível, zera de novo (cancela todas daquela carta)
  function cycleCard(g: DuplicateGroup) {
    setSelectedCounts((prev) => {
      const current = prev[g.cardId] ?? 0
      const next = current + 1
      const copy = { ...prev }
      if (next > g.instances.length) {
        delete copy[g.cardId]
      } else {
        copy[g.cardId] = next
      }
      return copy
    })
    setResult(null)
  }

  // marca TODAS as cópias de todas as cartas daquela raridade de uma vez
  function selectAllOfRarity(rarity: CardRarity) {
    setSelectedCounts((prev) => {
      const copy = { ...prev }
      groupsByRarity[rarity].forEach((g) => {
        copy[g.cardId] = g.instances.length
      })
      return copy
    })
    setResult(null)
  }

  function pickRarity(rarity: CardRarity) {
    if (missingByRarity[rarity] === 0) return
    setTargetRarity(rarity)
    setSelectedCounts({})
    setResult(null)
  }

  function backToRarityPick() {
    setTargetRarity(null)
    setSelectedCounts({})
    setResult(null)
  }

  async function handleConfirm() {
    if (!targetRarity || busy || !enough) return
    setBusy(true)
    const instanceIds = duplicateGroups.flatMap((g) => {
      const count = selectedCounts[g.cardId] ?? 0
      return g.instances.slice(0, count).map((i) => i.id)
    })
    const ok = await redeemRarityPack(coupleId, uid, targetRarity, instanceIds)
    setBusy(false)
    if (ok) {
      onRedeemed?.(
        `resgate feito! abra o pacotinho ${RARITY_LABEL[targetRarity]} na mochila pra ver a carta`
      )
      onClose()
    } else {
      setResult('fail')
    }
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
      onClick={onClose}
    >
      <style>{`
        .redeem-scroll::-webkit-scrollbar { width: 4px; }
        .redeem-scroll::-webkit-scrollbar-track { background: transparent; }
        .redeem-scroll::-webkit-scrollbar-thumb { background: rgba(232,160,176,0.55); border-radius: 99px; }
        .redeem-scroll::-webkit-scrollbar-thumb:hover { background: rgba(232,160,176,0.99); }
      `}</style>
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
            flexShrink: 0,
          }}
        >
          <div style={{ fontSize: 15, fontWeight: 800, color: '#3d1a10' }}>
            resgate por raridade
          </div>
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

        {!targetRarity && (
          <div
            className="redeem-scroll"
            style={{
              flex: 1,
              minHeight: 0,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            <div
              style={{
                fontSize: 11.5,
                color: 'rgba(61,26,16,0.6)',
                lineHeight: 1.6,
                marginBottom: 4,
              }}
            >
              escolha a raridade que você quer resgatar. o custo é pago com suas cartas repetidas —
              pode misturar qualquer raridade/coleção.
            </div>
            {RARITY_ORDER.map((r) => {
              const missing = missingByRarity[r]
              const disabled = missing === 0
              const c = RARITY_COLOR[r]
              return (
                <button
                  key={r}
                  onClick={() => pickRarity(r)}
                  disabled={disabled}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    border: `2px solid ${disabled ? 'rgba(61,26,16,0.15)' : c}`,
                    background: disabled ? 'rgba(61,26,16,0.05)' : `${c}12`,
                    borderRadius: 14,
                    padding: '12px 16px',
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    opacity: disabled ? 0.55 : 1,
                  }}
                >
                  <div style={{ textAlign: 'left' }}>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 800,
                        color: disabled ? 'rgba(61,26,16,0.5)' : c,
                      }}
                    >
                      {RARITY_LABEL[r]}
                    </div>
                    <div style={{ fontSize: 10.5, color: 'rgba(61,26,16,0.5)', marginTop: 2 }}>
                      {disabled ? 'você já tem todas' : `${missing} faltando`}
                    </div>
                  </div>
                  <div
                    style={{
                      fontWeight: 800,
                      fontSize: 13,
                      color: disabled ? 'rgba(61,26,16,0.4)' : '#3d1a10',
                    }}
                  >
                    {getRedeemCost(r)} pts
                  </div>
                </button>
              )
            })}
          </div>
        )}

        {targetRarity && (
          <>
            <button
              onClick={backToRarityPick}
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
                marginBottom: 10,
                flexShrink: 0,
              }}
            >
              ← trocar raridade
            </button>

            {/* fica FORA do scroll — o peso selecionado continua visível
                mesmo rolando a lista de cartas lá embaixo */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'rgba(255,255,255,0.75)',
                border: `1.5px solid ${enough ? 'rgba(74,122,74,0.35)' : 'rgba(61,26,16,0.12)'}`,
                borderRadius: 12,
                padding: '10px 14px',
                marginBottom: 10,
                flexShrink: 0,
              }}
            >
              <span style={{ fontSize: 12, fontWeight: 800, color: RARITY_COLOR[targetRarity] }}>
                resgatando: {RARITY_LABEL[targetRarity]}
                {selectedCount > 0 && (
                  <span style={{ fontWeight: 600, color: 'rgba(61,26,16,0.5)', marginLeft: 6 }}>
                    ({selectedCount} carta{selectedCount !== 1 ? 's' : ''})
                  </span>
                )}
              </span>
              <span
                style={{ fontSize: 13, fontWeight: 800, color: enough ? '#4A7A4A' : '#3d1a10' }}
              >
                {selectedTotal} / {cost} pts
              </span>
            </div>

            <div
              className="redeem-scroll"
              style={{
                flex: 1,
                minHeight: 0,
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
            >
              {overshoot > 0 && enough && (
                <div style={{ fontSize: 10.5, color: 'rgba(61,26,16,0.55)', lineHeight: 1.5 }}>
                  selecionado {overshoot} ponto{overshoot !== 1 ? 's' : ''} a mais que o necessário
                  — desmarca alguma cópia se quiser gastar só o exato.
                </div>
              )}

              {duplicateGroups.length === 0 ? (
                <div
                  style={{
                    fontSize: 12,
                    color: 'rgba(61,26,16,0.6)',
                    textAlign: 'center',
                    padding: '20px 8px',
                  }}
                >
                  nenhuma carta repetida disponível pra pagar
                </div>
              ) : (
                RARITY_ORDER.filter((r) => groupsByRarity[r].length > 0).map((r) => (
                  <div key={r}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: 8,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 800,
                          color: RARITY_COLOR[r],
                          textTransform: 'uppercase',
                          letterSpacing: '0.06em',
                        }}
                      >
                        {RARITY_LABEL[r]} ({CARD_SELL_VALUE[r]} pt
                        {CARD_SELL_VALUE[r] !== 1 ? 's' : ''}/cópia)
                      </span>
                      <button
                        onClick={() => selectAllOfRarity(r)}
                        style={{
                          border: 'none',
                          background: 'transparent',
                          color: 'rgba(74,122,74,0.85)',
                          fontFamily: 'Baloo 2',
                          fontWeight: 700,
                          fontSize: 10,
                          cursor: 'pointer',
                        }}
                      >
                        selecionar todas
                      </button>
                    </div>
                    <div
                      style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}
                    >
                      {groupsByRarity[r].map((g) => {
                        const count = selectedCounts[g.cardId] ?? 0
                        const total = g.instances.length
                        const fullySelected = count === total && count > 0
                        return (
                          <button
                            key={g.cardId}
                            onClick={() => cycleCard(g)}
                            style={{
                              border: `2px solid ${count > 0 ? '#4A7A4A' : RARITY_COLOR[r]}`,
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
                            {total > 1 && (
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
                                {total}
                              </div>
                            )}
                            {count > 0 && (
                              <div
                                style={{
                                  position: 'absolute',
                                  top: 6,
                                  left: 6,
                                  minWidth: 18,
                                  height: 18,
                                  padding: fullySelected ? 0 : '0 5px',
                                  borderRadius: 999,
                                  border: '2px solid #fff',
                                  background: '#4A7A4A',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: 9.5,
                                  fontWeight: 800,
                                  color: '#fff',
                                }}
                              >
                                {fullySelected ? (
                                  <Check size={11} color="#fff" strokeWidth={3} />
                                ) : (
                                  `${count}/${total}`
                                )}
                              </div>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))
              )}

              {selectedCount > 0 && (
                <button
                  onClick={() => setSelectedCounts({})}
                  style={{
                    alignSelf: 'flex-start',
                    border: 'none',
                    background: 'transparent',
                    color: 'rgba(61,26,16,0.5)',
                    fontFamily: 'Baloo 2',
                    fontWeight: 700,
                    fontSize: 10.5,
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  limpar seleção
                </button>
              )}
            </div>

            <button
              onClick={handleConfirm}
              disabled={busy || !enough}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                border: 'none',
                borderRadius: 12,
                padding: '11px 0',
                background: enough ? '#4A7A4A' : 'rgba(74,122,74,0.35)',
                color: '#fff',
                fontFamily: 'Baloo 2',
                fontWeight: 800,
                fontSize: 13,
                cursor: busy || !enough ? 'default' : 'pointer',
                marginTop: 12,
                flexShrink: 0,
              }}
            >
              <Recycle size={16} />
              resgatar {RARITY_LABEL[targetRarity]}
            </button>

            {result === 'fail' && (
              <div
                style={{
                  fontSize: 11,
                  color: '#c0392b',
                  textAlign: 'center',
                  marginTop: 8,
                  flexShrink: 0,
                }}
              >
                não deu pra resgatar — tenta de novo.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
