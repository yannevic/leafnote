import { useRef } from 'react'
import { X, History, CheckCircle2, XCircle, Ban } from 'lucide-react'
import { CARDS } from '../../lib/cards'
import { useTrades } from '../../hooks/useTrades'
import type { Trade, CardRef } from '../../lib/trades'

interface Props {
  coupleId: string
  uid: string
  onClose: () => void
}

const STATUS_INFO: Record<
  'accepted' | 'declined' | 'cancelled',
  { label: string; color: string; icon: React.ReactNode }
> = {
  accepted: {
    label: 'aceita',
    color: '#4A7A4A',
    icon: <CheckCircle2 size={13} color="#4A7A4A" strokeWidth={2.5} />,
  },
  declined: {
    label: 'recusada',
    color: '#c0392b',
    icon: <XCircle size={13} color="#c0392b" strokeWidth={2.5} />,
  },
  cancelled: {
    label: 'cancelada',
    color: '#8b6914',
    icon: <Ban size={13} color="#8b6914" strokeWidth={2.5} />,
  },
}

function formatDate(ts: number) {
  return new Date(ts).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Sao_Paulo',
  })
}

export default function TradeHistoryModal({ coupleId, uid, onClose }: Props) {
  const { trades, loading } = useTrades(coupleId)
  const mouseDownOnBackdrop = useRef(false)

  const finished = trades
    .filter(
      (t): t is Trade & { status: 'accepted' | 'declined' | 'cancelled' } =>
        t.status === 'accepted' || t.status === 'declined' || t.status === 'cancelled'
    )
    .sort((a, b) => b.updatedAt - a.updatedAt)

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
      onMouseDown={(e) => {
        mouseDownOnBackdrop.current = e.target === e.currentTarget
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && mouseDownOnBackdrop.current) onClose()
      }}
    >
      <style>{`
        .trade-history-scroll::-webkit-scrollbar { width: 4px; }
        .trade-history-scroll::-webkit-scrollbar-track { background: transparent; }
        .trade-history-scroll::-webkit-scrollbar-thumb { background: rgba(232,160,176,0.55); border-radius: 99px; }
        .trade-history-scroll::-webkit-scrollbar-thumb:hover { background: rgba(232,160,176,0.99); }
      `}</style>

      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background:
            'linear-gradient(160deg, rgba(253,246,240,0.97) 0%, rgba(252,232,238,0.97) 100%)',
          border: '1.5px solid rgba(232,160,176,0.4)',
          borderRadius: 20,
          width: 420,
          maxWidth: '95vw',
          maxHeight: '80vh',
          fontFamily: 'Baloo 2, sans-serif',
          boxShadow: '0 8px 40px rgba(200,120,140,0.2), inset 0 1px 0 rgba(255,255,255,0.6)',
          backdropFilter: 'blur(18px) saturate(1.4)',
          display: 'flex',
          flexDirection: 'column',
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
            <History size={15} color="rgba(122,48,64,0.6)" strokeWidth={2} />
            <span style={{ fontSize: 15, fontWeight: 800, color: '#3d1a10' }}>
              histórico de trocas
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
          className="trade-history-scroll"
          style={{ overflowY: 'auto', padding: '14px 22px 20px', flex: 1 }}
        >
          {loading ? (
            <div style={{ fontSize: 12, color: '#8b6914', textAlign: 'center', padding: 24 }}>
              carregando...
            </div>
          ) : finished.length === 0 ? (
            <div
              style={{
                fontSize: 12,
                color: 'rgba(61,26,16,0.45)',
                textAlign: 'center',
                padding: 24,
                fontWeight: 600,
              }}
            >
              nenhuma troca concluída ainda
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {finished.map((trade) => {
                const info = STATUS_INFO[trade.status]
                const iGave =
                  uid === trade.requesterUid ? trade.cardsFromRequester : trade.cardsFromPartner
                const iReceived =
                  uid === trade.requesterUid ? trade.cardsFromPartner : trade.cardsFromRequester

                return (
                  <div
                    key={trade.id}
                    style={{
                      background: 'rgba(253,242,246,0.7)',
                      border: '1.5px solid rgba(232,160,176,0.3)',
                      borderRadius: 12,
                      padding: '10px 12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 6,
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        {info.icon}
                        <span style={{ fontSize: 11.5, fontWeight: 800, color: info.color }}>
                          {info.label}
                        </span>
                      </div>
                      <span style={{ fontSize: 10, color: 'rgba(61,26,16,0.4)', fontWeight: 600 }}>
                        {formatDate(trade.updatedAt)}
                      </span>
                    </div>

                    <MiniStrip label="você deu" cards={iGave} />
                    <MiniStrip label="você recebeu" cards={iReceived} />
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function MiniStrip({ label, cards }: { label: string; cards: CardRef[] }) {
  if (cards.length === 0) return null
  return (
    <div>
      <div style={{ fontSize: 9.5, fontWeight: 700, color: '#8b6914', marginBottom: 3 }}>
        {label}
      </div>
      <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
        {cards.map((ref) => {
          const card = CARDS.find((c) => c.collectionId === ref.collectionId && c.id === ref.cardId)
          if (!card) return null
          return (
            <img
              key={ref.instanceId}
              src={card.image}
              alt={card.name}
              title={card.name}
              style={{ width: 30, height: 42, objectFit: 'cover', borderRadius: 5 }}
            />
          )
        })}
      </div>
    </div>
  )
}
