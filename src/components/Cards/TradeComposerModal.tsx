import { useState, useEffect } from 'react'
import { X, ArrowLeftRight, Check, Sparkles } from 'lucide-react'
import { CARDS, CardDefinition } from '../../lib/cards'
import { RARITY_COLOR } from '../../lib/rarity'
import { useCardInventory, Inventory } from '../../hooks/useCardInventory'
import { subscribePendingCards, PendingCardInstance } from '../../lib/pendingCards'
import { proposeTrade, counterTrade, CardRef } from '../../lib/trades'
import { CARD_SELL_VALUE } from '../../lib/economyConfig'

interface Props {
  coupleId: string
  requesterUid: string
  partnerUid: string
  viewerUid: string
  mode: 'propose' | 'counter'
  tradeId?: string
  initialCardsFromRequester?: CardRef[]
  initialCardsFromPartner?: CardRef[]
  onClose: () => void
  onDone: (msg: string) => void
}

interface DuplicateGroup {
  cardId: string
  card: CardDefinition
  instances: PendingCardInstance[]
}

function buildDuplicateGroups(
  pending: PendingCardInstance[],
  inventory: Inventory
): DuplicateGroup[] {
  const map = new Map<string, PendingCardInstance[]>()
  for (const p of pending) {
    const owned = inventory[p.collectionId]?.[p.cardId] ?? 0
    if (owned < 1) continue // só entra se já tem 1 cópia creditada na coleção — essa é "repetida"
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
}

function sumPoints(list: CardRef[]) {
  return list.reduce((sum, ref) => {
    const card = CARDS.find((c) => c.collectionId === ref.collectionId && c.id === ref.cardId)
    return sum + (card ? CARD_SELL_VALUE[card.rarity] : 0)
  }, 0)
}

export default function TradeComposerModal({
  coupleId,
  requesterUid,
  partnerUid,
  viewerUid,
  mode,
  tradeId,
  initialCardsFromRequester = [],
  initialCardsFromPartner = [],
  onClose,
  onDone,
}: Props) {
  const { inventory: requesterInventory, loading: loadingRequesterInv } = useCardInventory(
    coupleId,
    requesterUid
  )
  const { inventory: partnerInventory, loading: loadingPartnerInv } = useCardInventory(
    coupleId,
    partnerUid
  )

  const [requesterPending, setRequesterPending] = useState<PendingCardInstance[]>([])
  const [partnerPending, setPartnerPending] = useState<PendingCardInstance[]>([])
  useEffect(
    () => subscribePendingCards(coupleId, requesterUid, setRequesterPending),
    [coupleId, requesterUid]
  )
  useEffect(
    () => subscribePendingCards(coupleId, partnerUid, setPartnerPending),
    [coupleId, partnerUid]
  )

  const [fromRequester, setFromRequester] = useState<CardRef[]>(initialCardsFromRequester)
  const [fromPartner, setFromPartner] = useState<CardRef[]>(initialCardsFromPartner)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const viewerIsRequester = viewerUid === requesterUid
  const loading = loadingRequesterInv || loadingPartnerInv

  const requesterGroups = buildDuplicateGroups(requesterPending, requesterInventory)
  const partnerGroups = buildDuplicateGroups(partnerPending, partnerInventory)

  // "meu lado" / "lado dele" já resolvido pra quem está vendo o modal
  const myGroups = viewerIsRequester ? requesterGroups : partnerGroups
  const myList = viewerIsRequester ? fromRequester : fromPartner
  const setMyList = viewerIsRequester ? setFromRequester : setFromPartner
  const myBadgeInventory = viewerIsRequester ? partnerInventory : requesterInventory // "ele não tem"

  const theirGroups = viewerIsRequester ? partnerGroups : requesterGroups
  const theirList = viewerIsRequester ? fromPartner : fromRequester
  const setTheirList = viewerIsRequester ? setFromPartner : setFromRequester
  const theirBadgeInventory = viewerIsRequester ? requesterInventory : partnerInventory // "eu não tenho"

  function cycleSelection(list: CardRef[], setList: (v: CardRef[]) => void, group: DuplicateGroup) {
    const currentCount = list.filter((c) => c.cardId === group.cardId).length
    const max = group.instances.length
    if (currentCount >= max) {
      setList(list.filter((c) => c.cardId !== group.cardId))
    } else {
      const nextInstance = group.instances[currentCount]
      setList([
        ...list,
        {
          collectionId: group.card.collectionId,
          cardId: group.cardId,
          instanceId: nextInstance.id,
        },
      ])
    }
  }

  async function handleSubmit() {
    setSubmitting(true)
    setError(null)
    try {
      if (mode === 'propose') {
        await proposeTrade(coupleId, requesterUid, partnerUid, fromRequester, fromPartner)
        onDone('troca proposta!')
      } else if (tradeId) {
        await counterTrade(coupleId, tradeId, viewerUid, fromRequester, fromPartner)
        onDone('contraproposta enviada!')
      }
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'não foi possível enviar')
    } finally {
      setSubmitting(false)
    }
  }

  const totalSelected = fromRequester.length + fromPartner.length
  const myPoints = sumPoints(myList)
  const theirPoints = sumPoints(theirList)

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(44,20,8,0.35)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999999,
      }}
      onClick={onClose}
    >
      <style>{`
        .trade-scroll::-webkit-scrollbar { width: 4px; }
        .trade-scroll::-webkit-scrollbar-track { background: transparent; }
        .trade-scroll::-webkit-scrollbar-thumb { background: rgba(232,160,176,0.55); border-radius: 99px; }
        .trade-scroll::-webkit-scrollbar-thumb:hover { background: rgba(232,160,176,0.99); }
      `}</style>

      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background:
            'linear-gradient(160deg, rgba(253,246,240,0.97) 0%, rgba(252,232,238,0.97) 100%)',
          border: '1.5px solid rgba(232,160,176,0.4)',
          borderRadius: 20,
          width: 760,
          maxWidth: '95vw',
          maxHeight: '88vh',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'Baloo 2, sans-serif',
          boxShadow: '0 8px 40px rgba(200,120,140,0.2), inset 0 1px 0 rgba(255,255,255,0.6)',
          backdropFilter: 'blur(18px) saturate(1.4)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '18px 22px 14px',
            borderBottom: '2px dashed rgba(232,160,176,0.4)',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <ArrowLeftRight size={16} color="rgba(122,48,64,0.6)" strokeWidth={2} />
            <span style={{ fontSize: 16, fontWeight: 800, color: '#3d1a10' }}>
              {mode === 'propose' ? 'propor troca' : 'ajustar troca'}
            </span>
          </div>
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
          style={{
            padding: '14px 22px 18px',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            overflowY: 'auto',
          }}
        >
          <div
            style={{
              fontSize: 11.5,
              fontWeight: 600,
              color: 'rgba(61,26,16,0.6)',
              lineHeight: 1.5,
            }}
          >
            só aparecem cartas repetidas (a única cópia de cada um nunca sai da coleção). clica pra
            selecionar — se tiver mais de uma cópia, clica de novo pra escolher quantas. o ✦ marca
            cartas que a outra pessoa ainda não tem.
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <CardGrid
              title={viewerIsRequester ? 'suas repetidas' : 'repetidas do parceiro'}
              groups={myGroups}
              selectedList={myList}
              onToggle={(g) => cycleSelection(myList, setMyList, g)}
              badgeInventory={myBadgeInventory}
              badgeLabel="a outra pessoa não tem essa carta"
              loading={loading}
            />
            <div style={{ width: 1, background: 'rgba(232,160,176,0.3)', flexShrink: 0 }} />
            <CardGrid
              title={viewerIsRequester ? 'repetidas do parceiro' : 'suas repetidas'}
              groups={theirGroups}
              selectedList={theirList}
              onToggle={(g) => cycleSelection(theirList, setTheirList, g)}
              badgeInventory={theirBadgeInventory}
              badgeLabel="você ainda não tem essa carta"
              loading={loading}
            />
          </div>

          <BalanceGauge giving={myPoints} receiving={theirPoints} />

          {error && <div style={{ fontSize: 11, color: '#e8607a', fontWeight: 700 }}>{error}</div>}

          <button
            onClick={handleSubmit}
            disabled={totalSelected === 0 || submitting}
            style={{
              width: '100%',
              background: totalSelected > 0 ? 'rgba(232,160,176,0.55)' : 'rgba(232,160,176,0.2)',
              color: totalSelected > 0 ? '#3d1a10' : 'rgba(61,26,16,0.35)',
              border: 'none',
              borderRadius: 12,
              padding: '11px 0',
              fontSize: 13.5,
              fontWeight: 800,
              fontFamily: 'Baloo 2, sans-serif',
              cursor: totalSelected > 0 ? 'pointer' : 'default',
              flexShrink: 0,
            }}
          >
            {submitting
              ? 'enviando...'
              : mode === 'propose'
                ? 'enviar proposta'
                : 'enviar contraproposta'}
          </button>
        </div>
      </div>
    </div>
  )
}

function CardGrid({
  title,
  groups,
  selectedList,
  onToggle,
  badgeInventory,
  badgeLabel,
  loading,
}: {
  title: string
  groups: DuplicateGroup[]
  selectedList: CardRef[]
  onToggle: (group: DuplicateGroup) => void
  badgeInventory: Inventory
  badgeLabel: string
  loading: boolean
}) {
  const totalSelected = selectedList.length
  return (
    <div
      className="trade-scroll"
      style={{
        flex: 1,
        background: 'rgba(253,242,246,0.7)',
        border: '1.5px solid rgba(232,160,176,0.3)',
        borderRadius: 14,
        padding: 10,
        maxHeight: 420,
        overflowY: 'auto',
      }}
    >
      <div
        style={{
          fontSize: 10.5,
          fontWeight: 800,
          color: 'rgba(122,48,64,0.55)',
          textTransform: 'uppercase',
          letterSpacing: '0.8px',
          marginBottom: 8,
        }}
      >
        {title} {totalSelected > 0 && `(${totalSelected})`}
      </div>
      {loading ? (
        <div style={{ fontSize: 11.5, color: '#8b6914', textAlign: 'center', padding: 20 }}>
          carregando...
        </div>
      ) : groups.length === 0 ? (
        <div
          style={{
            fontSize: 11.5,
            color: '#8b6914',
            textAlign: 'center',
            padding: 20,
            opacity: 0.7,
          }}
        >
          nenhuma carta repetida
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          {groups.map((group) => {
            const selectedCount = selectedList.filter((c) => c.cardId === group.cardId).length
            const isSelected = selectedCount > 0
            const lacks = (badgeInventory[group.card.collectionId]?.[group.cardId] ?? 0) < 1
            const color = RARITY_COLOR[group.card.rarity]
            return (
              <button
                key={group.cardId}
                onClick={() => onToggle(group)}
                title={group.card.name}
                style={{
                  position: 'relative',
                  background: isSelected ? 'rgba(232,160,176,0.3)' : 'rgba(253,242,246,0.9)',
                  border: isSelected
                    ? `2.5px solid ${color}`
                    : '1.5px solid rgba(232,160,176,0.35)',
                  borderRadius: 10,
                  width: '100%',
                  aspectRatio: '0.72',
                  padding: 0,
                  overflow: 'hidden',
                  cursor: 'pointer',
                }}
              >
                <img
                  src={group.card.image}
                  alt={group.card.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />

                {lacks && (
                  <div
                    title={badgeLabel}
                    style={{
                      position: 'absolute',
                      top: 4,
                      left: 4,
                      background: '#c87090',
                      borderRadius: '50%',
                      width: 18,
                      height: 18,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
                    }}
                  >
                    <Sparkles size={10} color="#fff" strokeWidth={2.5} />
                  </div>
                )}

                {group.instances.length > 1 ? (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 4,
                      right: 4,
                      background: isSelected ? '#4A7A4A' : 'rgba(61,26,16,0.55)',
                      color: '#fff',
                      fontSize: 10,
                      fontWeight: 800,
                      borderRadius: 999,
                      padding: '1px 6px',
                    }}
                  >
                    {selectedCount}/{group.instances.length}
                  </div>
                ) : isSelected ? (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 4,
                      right: 4,
                      background: '#4A7A4A',
                      borderRadius: '50%',
                      width: 18,
                      height: 18,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Check size={11} color="#fff" strokeWidth={3} />
                  </div>
                ) : null}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

function BalanceGauge({ giving, receiving }: { giving: number; receiving: number }) {
  const total = giving + receiving
  const ratio = total === 0 ? 0 : (receiving - giving) / total // -1 (só dando) .. +1 (só recebendo)
  const pct = ((ratio + 1) / 2) * 100
  const abs = Math.abs(ratio)
  const color = abs < 0.15 ? '#4A7A4A' : abs < 0.5 ? '#c9962e' : '#c0392b'

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 9.5,
          fontWeight: 700,
          color: 'rgba(61,26,16,0.5)',
          marginBottom: 5,
        }}
      >
        <span>você dá mais</span>
        <span>trocaajusta</span>
        <span>você recebe mais</span>
      </div>
      <div
        style={{
          position: 'relative',
          height: 8,
          borderRadius: 999,
          background:
            'linear-gradient(90deg, #c0392b 0%, #c9962e 25%, #4A7A4A 50%, #c9962e 75%, #c0392b 100%)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: -3,
            left: `calc(${pct}% - 7px)`,
            width: 14,
            height: 14,
            borderRadius: '50%',
            background: '#fff',
            border: `3px solid ${color}`,
            boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
            transition: 'left 0.25s ease',
          }}
        />
      </div>
      {total > 0 && (
        <div style={{ textAlign: 'center', fontSize: 10, fontWeight: 700, color, marginTop: 5 }}>
          você dá {giving} pontos · recebe {receiving} pontos
        </div>
      )}
    </div>
  )
}
