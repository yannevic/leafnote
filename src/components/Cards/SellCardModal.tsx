import { useState, useEffect, useMemo, useCallback } from 'react'
import { X, HandCoins, Coins, Clock, Sparkles, Minus, Plus, Check, Layers } from 'lucide-react'
import { CARDS, CardDefinition } from '../../lib/cards'
import { SPECIAL_CARDS } from '../../lib/specialCards'
import { CARD_SELL_VALUE_SPECIAL } from '../../lib/economyConfig'
import { RARITY_COLOR } from '../../lib/rarity'
import { useCardInventory } from '../../hooks/useCardInventory'
import { subscribePendingCards, PendingCardInstance } from '../../lib/pendingCards'
import {
  subscribeSpecialCardsInventory,
  SpecialCardInventoryEntry,
} from '../../lib/collectionRewards'
import {
  getDefaultSellPrice,
  getNegotiateMaxPrice,
  getNegotiateChance,
  getSellCooldown,
  sellCardInstantBatch,
  negotiateSellCardBatch,
  sellSpecialCardInstant,
  NegotiateBatchOutcome,
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
  const [selectedCard, setSelectedCard] = useState<CardDefinition | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [requestedAmount, setRequestedAmount] = useState(0)
  const [cooldownMs, setCooldownMs] = useState<number | null>(null)
  const [batchResult, setBatchResult] = useState<
    (NegotiateBatchOutcome & { amountEach: number }) | null
  >(null)
  const [busy, setBusy] = useState(false)

  const [multiSelectMode, setMultiSelectMode] = useState(false)
  const [multiSelectedIds, setMultiSelectedIds] = useState<Set<string>>(new Set())
  const [multiRequestedAmount, setMultiRequestedAmount] = useState(0)
  const [showMultiNegotiate, setShowMultiNegotiate] = useState(false)
  const [multiResult, setMultiResult] = useState<{
    perCard: {
      cardId: string
      name: string
      image: string
      accepted: number
      refused: number
      total: number
    }[]
    totalAccepted: number
    totalRefused: number
    coins: number
  } | null>(null)

  useEffect(() => subscribePendingCards(coupleId, uid, setPending), [coupleId, uid])

  const [specialInventory, setSpecialInventory] = useState<
    Record<string, SpecialCardInventoryEntry>
  >({})
  const [sellingSpecialId, setSellingSpecialId] = useState<string | null>(null)
  useEffect(
    () => subscribeSpecialCardsInventory(coupleId, uid, setSpecialInventory),
    [coupleId, uid]
  )

  const ownedSpecialCards = SPECIAL_CARDS.filter((c) => (specialInventory[c.id]?.quantity ?? 0) > 0)

  async function handleSellSpecial(specialCardId: string) {
    if (busy) return
    setBusy(true)
    const ok = await sellSpecialCardInstant(coupleId, uid, specialCardId)
    setBusy(false)
    if (ok) {
      onSold?.(`vendida por ${CARD_SELL_VALUE_SPECIAL} moedas!`)
    }
  }

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

  // instâncias ainda disponíveis do grupo aberto — reativo (cai conforme
  // vende), mas os dados da carta em si (nome/raridade/imagem) ficam
  // fixos em `selectedCard`, pra não sumir a tela no meio de uma venda
  // em lote quando o grupo desaparece (tudo vendido)
  const liveInstances = useMemo(
    () => groups.find((g) => g.cardId === selectedCardId)?.instances ?? [],
    [groups, selectedCardId]
  )

  // cooldown de negociação de cada grupo, pra já separar na LISTA quem
  // já falhou negociação antes de a pessoa clicar de novo sem saber
  const [cooldownExpiries, setCooldownExpiries] = useState<Record<string, number>>({})
  const loadCooldowns = useCallback(async () => {
    const results = await Promise.all(
      groups.map(async (g) => {
        const ms = await getSellCooldown(coupleId, uid, g.cardId)
        return [g.cardId, ms !== null ? Date.now() + ms : null] as const
      })
    )
    const map: Record<string, number> = {}
    for (const [cardId, expiresAt] of results) {
      if (expiresAt !== null) map[cardId] = expiresAt
    }
    setCooldownExpiries(map)
  }, [coupleId, uid, groups])

  useEffect(() => {
    loadCooldowns()
  }, [loadCooldowns])

  const availableGroups = groups.filter((g) => !cooldownExpiries[g.cardId])
  const cooldownGroups = groups.filter((g) => !!cooldownExpiries[g.cardId])

  const multiSelectedGroups = useMemo(
    () => availableGroups.filter((g) => multiSelectedIds.has(g.cardId)),
    [availableGroups, multiSelectedIds]
  )
  const multiRarity = multiSelectedGroups[0]?.card.rarity ?? null
  const multiInstanceCount = multiSelectedGroups.reduce((sum, g) => sum + g.instances.length, 0)
  const multiInstantTotal = multiRarity ? getDefaultSellPrice(multiRarity) * multiInstanceCount : 0
  const multiMinPrice = multiRarity ? getDefaultSellPrice(multiRarity) : 0
  const multiMaxPrice = multiRarity ? getNegotiateMaxPrice(multiRarity) : 0
  const multiChance = multiRarity ? getNegotiateChance(multiRarity, multiRequestedAmount) : 0

  useEffect(() => {
    setMultiSelectedIds((prev) => {
      const validIds = new Set(availableGroups.map((g) => g.cardId))
      let changed = false
      const next = new Set<string>()
      prev.forEach((id) => {
        if (validIds.has(id)) next.add(id)
        else changed = true
      })
      return changed ? next : prev
    })
  }, [availableGroups])

  useEffect(() => {
    if (multiRarity) setMultiRequestedAmount(getDefaultSellPrice(multiRarity))
  }, [multiRarity])

  function toggleMultiSelectMode() {
    setMultiSelectMode((m) => !m)
    setMultiSelectedIds(new Set())
    setShowMultiNegotiate(false)
    setMultiResult(null)
  }

  function toggleMultiSelect(g: DuplicateGroup) {
    setMultiSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(g.cardId)) {
        next.delete(g.cardId)
      } else {
        if (multiRarity && g.card.rarity !== multiRarity) return prev
        next.add(g.cardId)
      }
      return next
    })
    setMultiResult(null)
  }

  async function handleMultiSellInstant() {
    if (busy || multiSelectedGroups.length === 0 || !multiRarity) return
    setBusy(true)
    const allIds = multiSelectedGroups.flatMap((g) => g.instances.map((i) => i.id))
    await sellCardInstantBatch(coupleId, uid, allIds, multiRarity)
    setBusy(false)
    onSold?.(`${allIds.length}x vendidas por ${multiInstantTotal} moedas!`)
    setMultiSelectedIds(new Set())
    setShowMultiNegotiate(false)
  }

  async function handleMultiNegotiate() {
    if (busy || multiSelectedGroups.length === 0 || !multiRarity) return
    setBusy(true)
    const amountUsed = multiRequestedAmount
    const perCard: {
      cardId: string
      name: string
      image: string
      accepted: number
      refused: number
      total: number
    }[] = []
    let anyRefused = false
    for (const g of multiSelectedGroups) {
      const outcome = await negotiateSellCardBatch(
        coupleId,
        uid,
        g.instances.map((i) => i.id),
        g.cardId,
        multiRarity,
        amountUsed
      )
      perCard.push({
        cardId: g.cardId,
        name: g.card.name,
        image: g.card.image,
        accepted: outcome.accepted,
        refused: outcome.refused,
        total: outcome.total,
      })
      if (outcome.refused > 0) anyRefused = true
    }
    setBusy(false)
    const totalAccepted = perCard.reduce((s, p) => s + p.accepted, 0)
    const totalRefused = perCard.reduce((s, p) => s + p.refused, 0)
    setMultiResult({ perCard, totalAccepted, totalRefused, coins: totalAccepted * amountUsed })
    if (totalAccepted > 0) onSold?.(`${totalAccepted}x aceita(s) pela Folhinha!`)
    if (anyRefused) await loadCooldowns()
    setMultiSelectedIds(new Set())
  }

  function openGroup(g: DuplicateGroup) {
    setSelectedCard(g.card)
    setSelectedCardId(g.cardId)
    setQuantity(1)
    setBatchResult(null)
  }

  function backToList() {
    setSelectedCardId(null)
    setSelectedCard(null)
    setBatchResult(null)
    loadCooldowns()
  }

  useEffect(() => {
    if (!selectedCard) return
    setRequestedAmount(getDefaultSellPrice(selectedCard.rarity))
    setCooldownMs(null)
    getSellCooldown(coupleId, uid, selectedCard.id).then(setCooldownMs)
  }, [selectedCard?.id])

  // clampa a quantidade escolhida se o estoque disponível diminuir (ex:
  // depois de vender parte do lote)
  useEffect(() => {
    setQuantity((q) => Math.min(q, Math.max(1, liveInstances.length || 1)))
  }, [liveInstances.length])

  const cooldown = useCountdown(cooldownMs !== null ? Date.now() + cooldownMs : null)

  async function handleSellInstant() {
    if (!selectedCard || busy || liveInstances.length === 0) return
    setBusy(true)
    const toSell = liveInstances.slice(0, quantity).map((i) => i.id)
    await sellCardInstantBatch(coupleId, uid, toSell, selectedCard.rarity)
    setBusy(false)
    const total = getDefaultSellPrice(selectedCard.rarity) * toSell.length
    onSold?.(
      toSell.length > 1
        ? `${toSell.length}x vendidas por ${total} moedas!`
        : `vendida por ${total} moedas!`
    )
  }

  async function handleNegotiate() {
    if (!selectedCard || busy || liveInstances.length === 0) return
    setBusy(true)
    const toNegotiate = liveInstances.slice(0, quantity).map((i) => i.id)
    const amountUsed = requestedAmount
    const outcome = await negotiateSellCardBatch(
      coupleId,
      uid,
      toNegotiate,
      selectedCard.id,
      selectedCard.rarity,
      amountUsed
    )
    setBusy(false)
    setBatchResult({ ...outcome, amountEach: amountUsed })
    if (outcome.refused > 0) {
      setCooldownMs(await getSellCooldown(coupleId, uid, selectedCard.id))
    }
    if (outcome.accepted > 0) {
      onSold?.(`${outcome.accepted}x aceita(s) pela Folhinha!`)
    }
  }

  const color = selectedCard ? RARITY_COLOR[selectedCard.rarity] : '#8b6914'
  const minPrice = selectedCard ? getDefaultSellPrice(selectedCard.rarity) : 0
  const maxPrice = selectedCard ? getNegotiateMaxPrice(selectedCard.rarity) : 0
  const chance = selectedCard ? getNegotiateChance(selectedCard.rarity, requestedAmount) : 0
  const isNegotiating = requestedAmount > minPrice
  const onCooldown = cooldownMs !== null
  const maxQuantity = Math.max(1, liveInstances.length)
  const soldOut = selectedCard !== null && liveInstances.length === 0

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
        .sellcard-scroll::-webkit-scrollbar { width: 4px; }
        .sellcard-scroll::-webkit-scrollbar-track { background: transparent; }
        .sellcard-scroll::-webkit-scrollbar-thumb { background: rgba(232,160,176,0.55); border-radius: 99px; }
        .sellcard-scroll::-webkit-scrollbar-thumb:hover { background: rgba(232,160,176,0.99); }
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

        {!selectedCard && (
          <div
            className="sellcard-scroll"
            style={{
              flex: 1,
              minHeight: 0,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 18,
            }}
          >
            {groups.length === 0 && ownedSpecialCards.length === 0 ? (
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
              <>
                {availableGroups.length > 0 && (
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <SectionLabel>disponíveis</SectionLabel>
                      <button
                        onClick={toggleMultiSelectMode}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          border: 'none',
                          background: multiSelectMode
                            ? 'rgba(200,120,140,0.25)'
                            : 'rgba(200,120,140,0.12)',
                          color: 'rgba(122,48,64,0.85)',
                          fontFamily: 'Baloo 2',
                          fontWeight: 800,
                          fontSize: 10,
                          borderRadius: 999,
                          padding: '4px 9px',
                          cursor: 'pointer',
                          marginBottom: 8,
                        }}
                      >
                        <Layers size={11} />
                        {multiSelectMode ? 'cancelar seleção' : 'vender várias'}
                      </button>
                    </div>
                    <div
                      style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}
                    >
                      {availableGroups.map((g) => {
                        const c = RARITY_COLOR[g.card.rarity]
                        const isSelected = multiSelectedIds.has(g.cardId)
                        const isOtherRarity =
                          multiSelectMode && multiRarity !== null && g.card.rarity !== multiRarity
                        return (
                          <button
                            key={g.cardId}
                            onClick={() => (multiSelectMode ? toggleMultiSelect(g) : openGroup(g))}
                            style={{
                              border: `2px solid ${isSelected ? '#4A7A4A' : c}`,
                              borderRadius: 12,
                              overflow: 'hidden',
                              background: '#fff',
                              cursor: isOtherRarity ? 'not-allowed' : 'pointer',
                              padding: 0,
                              position: 'relative',
                              opacity: isOtherRarity ? 0.35 : 1,
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
                            {multiSelectMode && (
                              <div
                                style={{
                                  position: 'absolute',
                                  top: 6,
                                  left: 6,
                                  width: 18,
                                  height: 18,
                                  borderRadius: '50%',
                                  border: '2px solid #fff',
                                  background: isSelected ? '#4A7A4A' : 'rgba(44,20,8,0.35)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}
                              >
                                {isSelected && <Check size={11} color="#fff" strokeWidth={3} />}
                              </div>
                            )}
                          </button>
                        )
                      })}
                    </div>

                    {multiSelectMode && multiSelectedIds.size > 0 && (
                      <div
                        style={{
                          marginTop: 12,
                          background: 'rgba(255,255,255,0.6)',
                          borderRadius: 14,
                          padding: '12px 14px 14px',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: 10,
                          }}
                        >
                          <span style={{ fontSize: 12, fontWeight: 800, color: '#3d1a10' }}>
                            {multiInstanceCount} carta{multiInstanceCount > 1 ? 's' : ''}{' '}
                            selecionada
                            {multiInstanceCount > 1 ? 's' : ''} ({multiRarity})
                          </span>
                          <button
                            onClick={() => {
                              setMultiSelectedIds(new Set())
                              setShowMultiNegotiate(false)
                              setMultiResult(null)
                            }}
                            style={{
                              border: 'none',
                              background: 'transparent',
                              color: 'rgba(61,26,16,0.5)',
                              fontFamily: 'Baloo 2',
                              fontWeight: 700,
                              fontSize: 10.5,
                              cursor: 'pointer',
                            }}
                          >
                            limpar
                          </button>
                        </div>

                        <button
                          onClick={handleMultiSellInstant}
                          disabled={busy}
                          style={{
                            width: '100%',
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
                          <Coins size={16} />
                          vender tudo direto por {multiInstantTotal}
                        </button>

                        <button
                          onClick={() => setShowMultiNegotiate((s) => !s)}
                          style={{
                            width: '100%',
                            marginTop: 8,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 8,
                            border: 'none',
                            borderRadius: 12,
                            padding: '9px 0',
                            background: 'rgba(200,120,140,0.18)',
                            color: '#7a3040',
                            fontFamily: 'Baloo 2',
                            fontWeight: 800,
                            fontSize: 12,
                            cursor: 'pointer',
                          }}
                        >
                          <HandCoins size={14} />
                          negociar em lote
                        </button>

                        {showMultiNegotiate && (
                          <div style={{ marginTop: 10 }}>
                            <input
                              type="range"
                              min={multiMinPrice}
                              max={multiMaxPrice}
                              value={multiRequestedAmount}
                              onChange={(e) => setMultiRequestedAmount(Number(e.target.value))}
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
                                <CoinIcon size={14} color={coinColor} /> {multiRequestedAmount}
                                <span style={{ fontSize: 11, fontWeight: 700, opacity: 0.7 }}>
                                  cada (total {multiRequestedAmount * multiInstanceCount})
                                </span>
                              </div>
                              <div
                                style={{
                                  fontSize: 11,
                                  fontWeight: 700,
                                  color: 'rgba(61,26,16,0.6)',
                                }}
                              >
                                {Math.round(multiChance * 100)}% de chance por unidade
                              </div>
                            </div>
                            <button
                              onClick={handleMultiNegotiate}
                              disabled={busy || multiRequestedAmount <= multiMinPrice}
                              style={{
                                marginTop: 10,
                                width: '100%',
                                border: 'none',
                                borderRadius: 10,
                                padding: '10px 0',
                                background:
                                  multiRequestedAmount > multiMinPrice
                                    ? '#c87090'
                                    : 'rgba(200,120,140,0.35)',
                                color: '#fff',
                                fontFamily: 'Baloo 2',
                                fontWeight: 800,
                                fontSize: 12,
                                cursor:
                                  busy || multiRequestedAmount <= multiMinPrice
                                    ? 'default'
                                    : 'pointer',
                              }}
                            >
                              propor {multiInstanceCount}x {multiRequestedAmount} moedas
                            </button>
                            <div
                              style={{
                                marginTop: 8,
                                fontSize: 10,
                                color: 'rgba(61,26,16,0.5)',
                                lineHeight: 1.5,
                              }}
                            >
                              cada carta é negociada separadamente com a Folhinha — algumas podem
                              ser aceitas e outras recusadas.
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {multiSelectMode && multiResult && (
                      <div
                        style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}
                      >
                        <div
                          style={{
                            borderRadius: 12,
                            padding: '10px 12px',
                            background:
                              multiResult.totalRefused === 0
                                ? 'rgba(74,122,74,0.12)'
                                : multiResult.totalAccepted === 0
                                  ? 'rgba(232,96,122,0.12)'
                                  : 'rgba(139,105,20,0.12)',
                            fontSize: 12,
                            fontWeight: 700,
                            color:
                              multiResult.totalRefused === 0
                                ? '#4A7A4A'
                                : multiResult.totalAccepted === 0
                                  ? '#c0392b'
                                  : '#8B6914',
                          }}
                        >
                          {multiResult.totalAccepted} aceita
                          {multiResult.totalAccepted !== 1 ? 's' : ''} (+
                          {multiResult.coins} moedas), {multiResult.totalRefused} recusada
                          {multiResult.totalRefused !== 1 ? 's' : ''}
                        </div>
                        <div
                          className="sellcard-scroll"
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 4,
                            maxHeight: 160,
                            overflowY: 'auto',
                          }}
                        >
                          {multiResult.perCard.map((p) => (
                            <div
                              key={p.cardId}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                background: 'rgba(255,255,255,0.5)',
                                borderRadius: 10,
                                padding: '6px 10px',
                              }}
                            >
                              <img
                                src={p.image}
                                alt={p.name}
                                style={{
                                  width: 22,
                                  height: 30,
                                  objectFit: 'cover',
                                  borderRadius: 4,
                                  flexShrink: 0,
                                }}
                              />
                              <span
                                style={{
                                  flex: 1,
                                  fontSize: 11,
                                  fontWeight: 700,
                                  color: '#3d1a10',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {p.name}
                              </span>
                              <span
                                style={{
                                  fontSize: 10,
                                  fontWeight: 800,
                                  borderRadius: 999,
                                  padding: '2px 8px',
                                  background:
                                    p.refused === 0
                                      ? 'rgba(74,122,74,0.18)'
                                      : p.accepted === 0
                                        ? 'rgba(232,96,122,0.18)'
                                        : 'rgba(139,105,20,0.18)',
                                  color:
                                    p.refused === 0
                                      ? '#4A7A4A'
                                      : p.accepted === 0
                                        ? '#c0392b'
                                        : '#8B6914',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {p.refused === 0
                                  ? p.total > 1
                                    ? `${p.total}x aceita`
                                    : 'aceita'
                                  : p.accepted === 0
                                    ? p.total > 1
                                      ? `${p.total}x recusada`
                                      : 'recusada'
                                    : `${p.accepted} aceita, ${p.refused} recusada`}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {cooldownGroups.length > 0 && (
                  <div>
                    <SectionLabel>em cooldown com a Folhinha</SectionLabel>
                    <div
                      style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}
                    >
                      {cooldownGroups.map((g) => {
                        const c = RARITY_COLOR[g.card.rarity]
                        return (
                          <button
                            key={g.cardId}
                            onClick={() => openGroup(g)}
                            style={{
                              border: `2px solid ${c}88`,
                              borderRadius: 12,
                              overflow: 'hidden',
                              background: '#fff',
                              cursor: 'pointer',
                              padding: 0,
                              position: 'relative',
                              opacity: 0.75,
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
                                filter: 'grayscale(30%)',
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
                            <CooldownBadge expiresAt={cooldownExpiries[g.cardId]} />
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {ownedSpecialCards.length > 0 && (
                  <div>
                    <SectionLabel>cartas especiais</SectionLabel>
                    <div
                      style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}
                    >
                      {ownedSpecialCards.map((card) => {
                        const qty = specialInventory[card.id]?.quantity ?? 0
                        const isSellingThis = sellingSpecialId === card.id
                        return (
                          <div key={card.id} style={{ position: 'relative' }}>
                            <div
                              style={{
                                border: '2px solid #ffd97e',
                                borderRadius: 12,
                                overflow: 'hidden',
                                background: '#fff',
                                position: 'relative',
                              }}
                            >
                              {card.image ? (
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
                              ) : (
                                <div
                                  style={{
                                    width: '100%',
                                    aspectRatio: '5 / 7',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: 8,
                                    textAlign: 'center',
                                    fontSize: 11,
                                    fontWeight: 800,
                                    color: '#8b6914',
                                  }}
                                >
                                  {card.name}
                                </div>
                              )}
                              {qty > 1 && (
                                <div
                                  style={{
                                    position: 'absolute',
                                    bottom: 6,
                                    right: 6,
                                    background: '#ffd97e',
                                    color: '#3d1a10',
                                    fontSize: 10,
                                    fontWeight: 800,
                                    borderRadius: 999,
                                    padding: '2px 7px',
                                  }}
                                >
                                  {qty}
                                </div>
                              )}
                            </div>
                            <button
                              onClick={() => {
                                setSellingSpecialId(card.id)
                                handleSellSpecial(card.id).finally(() => setSellingSpecialId(null))
                              }}
                              disabled={busy}
                              style={{
                                marginTop: 6,
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 4,
                                border: 'none',
                                borderRadius: 999,
                                padding: '6px 0',
                                background: '#4A7A4A',
                                color: '#fff',
                                fontWeight: 800,
                                fontSize: 10.5,
                                cursor: busy ? 'default' : 'pointer',
                                fontFamily: 'Baloo 2',
                              }}
                            >
                              <Sparkles size={11} />
                              {isSellingThis ? '...' : `vender por ${CARD_SELL_VALUE_SPECIAL}`}
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {selectedCard && (
          <div
            className="sellcard-scroll"
            style={{
              flex: 1,
              minHeight: 0,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
            }}
          >
            <button
              onClick={backToList}
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
                src={selectedCard.image}
                alt={selectedCard.name}
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
                  {selectedCard.name}
                </div>
                <div style={{ fontSize: 11, fontWeight: 700, color, marginTop: 2 }}>
                  {selectedCard.rarity}
                </div>
                <div style={{ fontSize: 11, color: 'rgba(61,26,16,0.55)', marginTop: 2 }}>
                  {soldOut ? 'nenhuma cópia restante' : `${liveInstances.length} disponíveis`}
                </div>
              </div>
            </div>

            {!soldOut && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(61,26,16,0.6)' }}>
                  quantidade:
                </span>
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    border: 'none',
                    background: 'rgba(200,120,140,0.15)',
                    color: 'rgba(122,48,64,0.7)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: quantity <= 1 ? 'default' : 'pointer',
                    opacity: quantity <= 1 ? 0.4 : 1,
                  }}
                >
                  <Minus size={12} />
                </button>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 800,
                    color: '#3d1a10',
                    minWidth: 18,
                    textAlign: 'center',
                  }}
                >
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => Math.min(maxQuantity, q + 1))}
                  disabled={quantity >= maxQuantity}
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    border: 'none',
                    background: 'rgba(200,120,140,0.15)',
                    color: 'rgba(122,48,64,0.7)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: quantity >= maxQuantity ? 'default' : 'pointer',
                    opacity: quantity >= maxQuantity ? 0.4 : 1,
                  }}
                >
                  <Plus size={12} />
                </button>
                <span style={{ fontSize: 10.5, color: 'rgba(61,26,16,0.45)' }}>
                  de {maxQuantity} disponíveis
                </span>
              </div>
            )}

            {!soldOut && (
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
                <Coins size={16} />
                vender {quantity > 1 ? `${quantity}x ` : ''}direto por {minPrice * quantity}
              </button>
            )}

            {!soldOut && (
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
                        {quantity > 1 && (
                          <span style={{ fontSize: 11, fontWeight: 700, opacity: 0.7 }}>
                            cada (total {requestedAmount * quantity})
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(61,26,16,0.6)' }}>
                        {Math.round(chance * 100)}% de chance dela aceitar (por unidade)
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
                      propor {quantity > 1 ? `${quantity}x ` : ''}
                      {requestedAmount} moedas
                    </button>
                    {quantity > 1 && (
                      <div
                        style={{
                          marginTop: 8,
                          fontSize: 10,
                          color: 'rgba(61,26,16,0.5)',
                          lineHeight: 1.5,
                        }}
                      >
                        cada cópia é testada individualmente — algumas podem ser aceitas e outras
                        recusadas no mesmo lote.
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {batchResult && (
              <div
                style={{
                  borderRadius: 12,
                  padding: '12px 14px',
                  background:
                    batchResult.refused === 0
                      ? 'rgba(74,122,74,0.12)'
                      : batchResult.accepted === 0
                        ? 'rgba(232,96,122,0.12)'
                        : 'rgba(139,105,20,0.12)',
                  fontSize: 12,
                  fontWeight: 700,
                  color:
                    batchResult.refused === 0
                      ? '#4A7A4A'
                      : batchResult.accepted === 0
                        ? '#c0392b'
                        : '#8B6914',
                }}
              >
                {batchResult.refused === 0
                  ? `todas as ${batchResult.total} vendidas! +${batchResult.accepted * batchResult.amountEach} moedas`
                  : batchResult.accepted === 0
                    ? `a Folhinha recusou ${batchResult.total > 1 ? 'todas as ' + batchResult.total : 'a negociação'}`
                    : `${batchResult.accepted} de ${batchResult.total} vendidas (+${batchResult.accepted * batchResult.amountEach} moedas), ${batchResult.refused} recusada(s)`}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: 10,
        fontWeight: 800,
        color: 'rgba(61,26,16,0.5)',
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        marginBottom: 8,
      }}
    >
      {children}
    </div>
  )
}

function CooldownBadge({ expiresAt }: { expiresAt: number }) {
  const remaining = useCountdown(expiresAt)
  return (
    <div
      style={{
        position: 'absolute',
        top: 6,
        left: 6,
        display: 'flex',
        alignItems: 'center',
        gap: 3,
        background: 'rgba(44,20,8,0.75)',
        color: '#fff',
        fontSize: 9,
        fontWeight: 800,
        borderRadius: 999,
        padding: '2px 6px',
      }}
    >
      <Clock size={9} />
      {remaining !== null ? formatCountdown(remaining) : '...'}
    </div>
  )
}
