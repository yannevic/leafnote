import {
  X,
  Droplets,
  Sprout,
  Dices,
  ArrowLeftRight,
  Coins,
  FlameKindling,
  AlertTriangle,
} from 'lucide-react'
import { EXCHANGE_COST } from '../../lib/garden'

interface Props {
  onClose: () => void
}

const RARITY_COLORS = {
  comum: '#7fb87f',
  incomum: '#c4956a',
  rara: '#c87090',
  epica: '#7a3040',
}

const Section = ({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode
  title: string
  children: React.ReactNode
}) => (
  <div style={{ marginBottom: 18 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 6 }}>
      {icon}
      <span style={{ fontSize: 13, fontWeight: 800, color: '#1A2A1A' }}>{title}</span>
    </div>
    <div style={{ fontSize: 12, color: '#8E6D1A', lineHeight: 1.7, paddingLeft: 25 }}>
      {children}
    </div>
  </div>
)

export default function GardenGuideModal({ onClose }: Props) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 300,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#F5ECD7',
          border: '2px solid #C59F78',
          borderRadius: 16,
          width: 480,
          maxWidth: '95vw',
          maxHeight: '85vh',
          fontFamily: 'Baloo 2, sans-serif',
          boxShadow: '0 12px 48px rgba(0,0,0,0.22)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '18px 20px 14px',
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: 17, fontWeight: 800, color: '#1A2A1A' }}>Guia do Jardim</span>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#C59F78',
              padding: 2,
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Scroll */}
        <style>{`
          .garden-guide-scroll::-webkit-scrollbar { width: 6px; }
          .garden-guide-scroll::-webkit-scrollbar-track { background: #FCE8F0; border-radius: 4px; }
          .garden-guide-scroll::-webkit-scrollbar-thumb { background: rgba(232,160,176,0.5); border-radius: 4px; }
        `}</style>

        <div
          className="garden-guide-scroll"
          style={{ overflowY: 'auto', padding: '0 20px 20px', flex: 1 }}
        >
          <Section icon={<Droplets size={15} color="#5b9bd5" />} title="Como regar">
            Os dois precisam regar a mesma planta uma vez por dia. A cada 3 dias regados juntos, a
            planta sobe um estágio. Só é possível plantar uma semente por dia.
          </Section>

          <Section icon={<FlameKindling size={15} color="#c0392b" />} title="Modo pânico">
            Se o parceiro não estiver disponível, ative o Modo Pânico — você rega pelos dois. Use
            com moderação!
          </Section>

          <Section icon={<AlertTriangle size={15} color="#e67e22" />} title="Murcha">
            Se a planta ficar 48 horas sem ser regada, ela murcha. Cada dia seguinte sem rega remove
            mais um dia de progresso, até zerar no estágio atual. Não deixe murchar!
          </Section>

          <Section icon={<Dices size={15} color="#8b6914" />} title="Como ganhar sementes">
            Sempre que uma planta sobe de estágio, os dois rolam um dado. A soma determina a semente
            ganha — quanto maior a soma, mais rara:
            <div
              style={{
                marginTop: 8,
                background: '#FFF8F0',
                border: '1.5px solid #C59F78',
                borderRadius: 8,
                padding: '10px 12px',
              }}
            >
              {[
                { label: 'Rosa', rarity: 'comum', value: 'soma 2–5' },
                { label: 'Margarida', rarity: 'comum', value: 'soma 6–8' },
                { label: 'Tulipa', rarity: 'incomum', value: 'soma 9–10' },
                { label: 'Girassol', rarity: 'incomum', value: 'soma 11' },
                { label: 'Orquídea', rarity: 'rara', value: 'soma 12 (duplo 6!)' },
                { label: 'Flor Especial', rarity: 'epica', value: 'streak de 30 dias' },
              ].map((row) => (
                <div
                  key={row.label}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: 4,
                    alignItems: 'center',
                  }}
                >
                  <span
                    style={{
                      fontWeight: 700,
                      color: RARITY_COLORS[row.rarity as keyof typeof RARITY_COLORS],
                    }}
                  >
                    {row.label}
                    <span style={{ fontWeight: 400, fontSize: 10, marginLeft: 5, opacity: 0.8 }}>
                      ({row.rarity})
                    </span>
                  </span>
                  <span style={{ fontSize: 11, color: '#8E6D1A', opacity: 0.85 }}>{row.value}</span>
                </div>
              ))}
            </div>
          </Section>

          <Section icon={<Sprout size={15} color="#4F7E4E" />} title="Estágios da planta">
            Cada planta tem 5 estágios. No estágio 5 ela está completamente crescida e não precisa
            mais ser regada. A cada subida de estágio vocês ganham uma semente nova!
          </Section>

          <Section icon={<ArrowLeftRight size={15} color="#4F7E4E" />} title="Troca de sementes">
            Acumulou sementes repetidas? Junte sementes do mesmo tier e troque por uma diferente —
            do mesmo tier ou um acima. A quantidade necessária aumenta conforme a raridade:
            <div
              style={{
                marginTop: 8,
                background: '#FFF8F0',
                border: '1.5px solid #C59F78',
                borderRadius: 8,
                padding: '10px 12px',
              }}
            >
              {[
                { rarity: 'comum', label: 'Comum' },
                { rarity: 'incomum', label: 'Incomum' },
                { rarity: 'rara', label: 'Rara' },
              ].map((row) => (
                <div
                  key={row.rarity}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: 4,
                    alignItems: 'center',
                  }}
                >
                  <span
                    style={{
                      fontWeight: 700,
                      color: RARITY_COLORS[row.rarity as keyof typeof RARITY_COLORS],
                    }}
                  >
                    {row.label}
                  </span>
                  <span style={{ fontSize: 11, color: '#8E6D1A', opacity: 0.85 }}>
                    {EXCHANGE_COST[row.rarity as keyof typeof EXCHANGE_COST]} sementes
                  </span>
                </div>
              ))}
            </div>
            Orquídeas não podem ser trocadas por enquanto.
          </Section>

          <Section icon={<Coins size={15} color="#c59f78" />} title="Moedinhas (em breve)">
            Em breve será possível vender sementes por moedinhas e usá-las para comprar móveis e
            roupinhas para a casinha de vocês!
          </Section>
        </div>
      </div>
    </div>
  )
}
