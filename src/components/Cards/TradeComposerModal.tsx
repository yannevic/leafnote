import { useState } from 'react'
import { X, ArrowLeftRight, Check } from 'lucide-react'
import { CARDS, CardDefinition } from '../../lib/cards'
import { RARITY_COLOR } from '../../lib/rarity'
import { useCardInventory } from '../../hooks/useCardInventory'
import { proposeTrade, counterTrade, CardRef } from '../../lib/trades'

interface Props {
  coupleId: string
  requesterUid: string // papel fixo da troca (não muda em contraproposta)
  partnerUid: string // papel fixo da troca
  viewerUid: string // quem está com o modal aberto agora
  mode: 'propose' | 'counter'
  tradeId?: string // obrigatório se mode === 'counter'
  initialCardsFromRequester?: CardRef[]
  initialCardsFromPartner?: CardRef[]
  onClose: () => void
  onDone: (msg: string) => void
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
  const { inventory: requesterInventory, loading: loadingRequester } = useCardInventory(
    coupleId,
    requesterUid
  )
  const { inventory: partnerInventory, loading: loadingPartner } = useCardInventory(
    coupleId,
    partnerUid
  )

  const [fromRequester, setFromRequester] = useState<CardRef[]>(initialCardsFromRequester)
  const [fromPartner, setFromPartner] = useState<CardRef[]>(initialCardsFromPartner)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const viewerIsRequester = viewerUid === requesterUid

  // Cartas que dá pra oferecer: tudo que a pessoa já tem.
  const requesterPool = CARDS.filter((c) => (requesterInventory[c.collectionId]?.[c.id] ?? 0) > 0)
  const partnerPool = CARDS.filter((c) => (partnerInventory[c.collectionId]?.[c.id] ?? 0) > 0)

  function toggle(list: CardRef[], setList: (v: CardRef[]) => void, card: CardDefinition) {
    const ref: CardRef = { collectionId: card.collectionId, cardId: card.id }
    const exists = list.some((c) => c.collectionId === ref.collectionId && c.cardId === ref.cardId)
    setList(
      exists
        ? list.filter((c) => !(c.collectionId === ref.collectionId && c.cardId === ref.cardId))
        : [...list, ref]
    )
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
          width: 560,
          maxWidth: '95vw',
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
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <ArrowLeftRight size={15} color="rgba(122,48,64,0.6)" strokeWidth={2} />
            <span style={{ fontSize: 15, fontWeight: 800, color: '#3d1a10' }}>
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
          style={{ padding: '14px 22px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}
        >
          <div
            style={{
              fontSize: 11.5,
              fontWeight: 600,
              color: 'rgba(61,26,16,0.6)',
              lineHeight: 1.5,
            }}
          >
            selecione as cartas de cada lado. pode escolher quantas quiser dos dois lados.
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <CardGrid
              title={viewerIsRequester ? 'suas cartas' : 'cartas do parceiro'}
              pool={requesterPool}
              selected={fromRequester}
              loading={loadingRequester}
              onToggle={(card) => toggle(fromRequester, setFromRequester, card)}
            />
            <div style={{ width: 1, background: 'rgba(232,160,176,0.3)', flexShrink: 0 }} />
            <CardGrid
              title={viewerIsRequester ? 'cartas do parceiro' : 'suas cartas'}
              pool={partnerPool}
              selected={fromPartner}
              loading={loadingPartner}
              onToggle={(card) => toggle(fromPartner, setFromPartner, card)}
            />
          </div>

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
              padding: '10px 0',
              fontSize: 13,
              fontWeight: 800,
              fontFamily: 'Baloo 2, sans-serif',
              cursor: totalSelected > 0 ? 'pointer' : 'default',
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
  pool,
  selected,
  loading,
  onToggle,
}: {
  title: string
  pool: CardDefinition[]
  selected: CardRef[]
  loading: boolean
  onToggle: (card: CardDefinition) => void
}) {
  return (
    <div
      className="trade-scroll"
      style={{
        flex: 1,
        background: 'rgba(253,242,246,0.7)',
        border: '1.5px solid rgba(232,160,176,0.3)',
        borderRadius: 12,
        padding: 8,
        maxHeight: 260,
        overflowY: 'auto',
      }}
    >
      <div
        style={{
          fontSize: 9,
          fontWeight: 800,
          color: 'rgba(122,48,64,0.55)',
          textTransform: 'uppercase',
          letterSpacing: '0.8px',
          marginBottom: 6,
        }}
      >
        {title} {selected.length > 0 && `(${selected.length})`}
      </div>
      {loading ? (
        <div style={{ fontSize: 10.5, color: '#8b6914', textAlign: 'center', padding: 10 }}>
          carregando...
        </div>
      ) : pool.length === 0 ? (
        <div
          style={{
            fontSize: 10.5,
            color: '#8b6914',
            textAlign: 'center',
            padding: 10,
            opacity: 0.7,
          }}
        >
          nenhuma carta
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 5 }}>
          {pool.map((card) => {
            const isSelected = selected.some(
              (c) => c.collectionId === card.collectionId && c.cardId === card.id
            )
            return (
              <button
                key={`${card.collectionId}-${card.id}`}
                onClick={() => onToggle(card)}
                title={card.name}
                style={{
                  position: 'relative',
                  background: isSelected ? 'rgba(232,160,176,0.3)' : 'rgba(253,242,246,0.8)',
                  border: isSelected
                    ? `2px solid ${RARITY_COLOR[card.rarity]}`
                    : '1.5px solid rgba(232,160,176,0.3)',
                  borderRadius: 6,
                  width: '100%',
                  aspectRatio: '0.72',
                  padding: 0,
                  overflow: 'hidden',
                  cursor: 'pointer',
                }}
              >
                <img
                  src={card.image}
                  alt={card.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                {isSelected && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 2,
                      right: 2,
                      background: '#4A7A4A',
                      borderRadius: '50%',
                      width: 14,
                      height: 14,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Check size={9} color="#fff" strokeWidth={3} />
                  </div>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
