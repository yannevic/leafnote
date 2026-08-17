import { X, Receipt, ArrowUpCircle, ArrowDownCircle } from 'lucide-react'
import { useCoinLedger } from '../../hooks/useCoinLedger'

interface CardsExtractModalProps {
  uid: string
  onClose: () => void
}

export default function CardsExtractModal({ uid, onClose }: CardsExtractModalProps) {
  const { entries, loading } = useCoinLedger(uid)

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999999,
        background: 'rgba(26,42,26,0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <style>{`
        .cards-extract-scroll::-webkit-scrollbar { width: 4px; }
        .cards-extract-scroll::-webkit-scrollbar-track { background: transparent; }
        .cards-extract-scroll::-webkit-scrollbar-thumb { background: rgba(232,160,176,0.55); border-radius: 99px; }
        .cards-extract-scroll::-webkit-scrollbar-thumb:hover { background: rgba(232,160,176,0.99); }
      `}</style>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 420,
          maxHeight: '75vh',
          background: 'linear-gradient(160deg, #FBEAF0 0%, #F5ECD7 100%)',
          borderRadius: 20,
          padding: 20,
          fontFamily: 'Baloo 2, sans-serif',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#2D4A2D' }}>
            <Receipt size={20} strokeWidth={2.2} />
            <span style={{ fontWeight: 800, fontSize: 16 }}>extrato</span>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2D4A2D' }}
          >
            <X size={22} />
          </button>
        </div>

        <div className="cards-extract-scroll" style={{ flex: 1, overflowY: 'auto' }}>
          {loading && (
            <div style={{ textAlign: 'center', padding: 24, color: '#8B6914', fontSize: 13 }}>
              carregando...
            </div>
          )}
          {!loading && entries.length === 0 && (
            <div style={{ textAlign: 'center', padding: 24, color: '#8B6914', fontSize: 13 }}>
              nenhuma movimentação ainda
            </div>
          )}
          {entries.map((entry) => {
            const isPositive = entry.amount > 0
            const dateStr = new Date(entry.timestamp).toLocaleString('pt-BR', {
              timeZone: 'America/Sao_Paulo',
              day: '2-digit',
              month: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
            })
            return (
              <div
                key={entry.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 8px',
                  borderBottom: '1px solid rgba(139,105,20,0.12)',
                }}
              >
                {isPositive ? (
                  <ArrowUpCircle size={20} color="#4A7A4A" />
                ) : (
                  <ArrowDownCircle size={20} color="#E8607A" />
                )}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#2D4A2D' }}>
                    {entry.reason.charAt(0).toUpperCase() + entry.reason.slice(1)}
                  </div>
                  <div style={{ fontSize: 10.5, color: '#8B6914', opacity: 0.7 }}>{dateStr}</div>
                </div>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    gap: 1,
                  }}
                >
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 800,
                      color: isPositive ? '#4A7A4A' : '#E8607A',
                    }}
                  >
                    {isPositive ? '+' : ''}
                    {entry.amount}
                  </div>
                  <div style={{ fontSize: 9.5, color: '#8B6914', opacity: 0.6 }}>
                    saldo: {entry.balanceAfter}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
