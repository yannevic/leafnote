import { useState } from 'react'
import { ArrowLeftRight, CheckCircle2, XCircle, Ban } from 'lucide-react'
import { CARDS } from '../../lib/cards'
import { useTrades } from '../../hooks/useTrades'
import { acceptTrade, declineTrade, cancelTrade, CardRef } from '../../lib/trades'
import TradeComposerModal from './TradeComposerModal'

interface Props {
  coupleId: string
  uid: string
  partnerUid: string
  onFeedback: (msg: string) => void
}

export default function TradesPanel({ coupleId, uid, partnerUid, onFeedback }: Props) {
  const { trades, loading } = useTrades(coupleId)
  const [composerMode, setComposerMode] = useState<'propose' | 'counter' | null>(null)
  const [busy, setBusy] = useState(false)

  const activeTrade = trades.find(
    (t) => t.status === 'pending_response' || t.status === 'countered'
  )
  const isMyTurn = activeTrade ? activeTrade.proposedBy !== uid : false

  const myGiving: CardRef[] = activeTrade
    ? uid === activeTrade.requesterUid
      ? activeTrade.cardsFromRequester
      : activeTrade.cardsFromPartner
    : []

  const myReceiving: CardRef[] = activeTrade
    ? uid === activeTrade.requesterUid
      ? activeTrade.cardsFromPartner
      : activeTrade.cardsFromRequester
    : []

  async function handleAccept() {
    if (!activeTrade) return
    setBusy(true)
    try {
      await acceptTrade(coupleId, activeTrade.id, uid)
      onFeedback('troca aceita — cartas transferidas!')
    } catch (err) {
      onFeedback(err instanceof Error ? err.message : 'não foi possível aceitar')
    } finally {
      setBusy(false)
    }
  }

  async function handleDecline() {
    if (!activeTrade) return
    setBusy(true)
    await declineTrade(coupleId, activeTrade.id, uid)
    onFeedback('troca recusada')
    setBusy(false)
  }

  async function handleCancel() {
    if (!activeTrade) return
    setBusy(true)
    await cancelTrade(coupleId, activeTrade.id, uid)
    onFeedback('troca cancelada')
    setBusy(false)
  }

  return (
    <div
      style={{
        flex: 1,
        background: 'rgba(253,242,246,0.7)',
        border: '1.5px solid rgba(232,160,176,0.3)',
        borderRadius: 12,
        padding: 10,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        minHeight: 0,
      }}
    >
      <div
        style={{
          fontSize: 9,
          fontWeight: 800,
          color: 'rgba(122,48,64,0.55)',
          textTransform: 'uppercase',
          letterSpacing: '0.8px',
          display: 'flex',
          alignItems: 'center',
          gap: 5,
        }}
      >
        <ArrowLeftRight size={11} /> trocas
      </div>

      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 0,
        }}
      >
        {loading ? (
          <div style={{ fontSize: 11, color: '#8b6914', textAlign: 'center' }}>carregando...</div>
        ) : !activeTrade ? (
          <button
            onClick={() => setComposerMode('propose')}
            style={{
              border: 'none',
              borderRadius: 999,
              padding: '7px 14px',
              background: 'rgba(232,160,176,0.4)',
              color: '#3d1a10',
              fontFamily: 'Baloo 2',
              fontWeight: 800,
              fontSize: 11.5,
              cursor: 'pointer',
            }}
          >
            propor troca
          </button>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <CardStrip label="você dá" cards={myGiving} />
            <CardStrip label="você recebe" cards={myReceiving} />

            <div
              style={{
                fontSize: 9.5,
                color: 'rgba(61,26,16,0.55)',
                fontWeight: 700,
                textAlign: 'center',
              }}
            >
              {isMyTurn ? 'sua vez de responder' : 'aguardando parceiro'}
            </div>

            {isMyTurn ? (
              <div style={{ display: 'flex', gap: 5 }}>
                <MiniBtn
                  onClick={handleAccept}
                  icon={<CheckCircle2 size={11} />}
                  label="aceitar"
                  disabled={busy}
                />
                <MiniBtn
                  onClick={() => setComposerMode('counter')}
                  icon={<ArrowLeftRight size={11} />}
                  label="ajustar"
                  muted
                  disabled={busy}
                />
                <MiniBtn
                  onClick={handleDecline}
                  icon={<XCircle size={11} />}
                  label="recusar"
                  danger
                  disabled={busy}
                />
              </div>
            ) : (
              <MiniBtn
                onClick={handleCancel}
                icon={<Ban size={11} />}
                label="cancelar proposta"
                muted
                disabled={busy}
              />
            )}
          </div>
        )}
      </div>

      {composerMode && (
        <TradeComposerModal
          coupleId={coupleId}
          requesterUid={activeTrade ? activeTrade.requesterUid : uid}
          partnerUid={activeTrade ? activeTrade.partnerUid : partnerUid}
          viewerUid={uid}
          mode={composerMode}
          tradeId={activeTrade?.id}
          initialCardsFromRequester={
            composerMode === 'counter' ? activeTrade?.cardsFromRequester : []
          }
          initialCardsFromPartner={composerMode === 'counter' ? activeTrade?.cardsFromPartner : []}
          onClose={() => setComposerMode(null)}
          onDone={onFeedback}
        />
      )}
    </div>
  )
}

function CardStrip({ label, cards }: { label: string; cards: CardRef[] }) {
  if (cards.length === 0) return null

  return (
    <div>
      <div style={{ fontSize: 9, fontWeight: 700, color: '#8b6914', marginBottom: 3 }}>{label}</div>

      <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
        {cards.map((ref) => {
          const card = CARDS.find((c) => c.collectionId === ref.collectionId && c.id === ref.cardId)

          if (!card) return null

          return (
            <img
              key={`${ref.collectionId}-${ref.cardId}`}
              src={card.image}
              alt={card.name}
              title={card.name}
              style={{
                width: 24,
                height: 34,
                objectFit: 'cover',
                borderRadius: 4,
              }}
            />
          )
        })}
      </div>
    </div>
  )
}

function MiniBtn({
  onClick,
  icon,
  label,
  muted,
  danger,
  disabled,
}: {
  onClick: () => void
  icon: React.ReactNode
  label: string
  muted?: boolean
  danger?: boolean
  disabled?: boolean
}) {
  const bg = danger ? '#e8607a' : muted ? 'rgba(139,105,20,0.12)' : '#4A7A4A'
  const color = danger ? '#fff' : muted ? '#8b6914' : '#fff'

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 3,
        border: 'none',
        borderRadius: 999,
        padding: '6px 0',
        background: bg,
        color,
        fontWeight: 800,
        fontSize: 9.5,
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        fontFamily: 'Baloo 2',
      }}
    >
      {icon} {label}
    </button>
  )
}
