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
  comum: '#3d7a3d',
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
  <div style={{ marginBottom: 16 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 6 }}>
      {icon}
      <span
        style={{
          fontSize: 13,
          fontWeight: 800,
          color: '#3d1a10',
          fontFamily: 'Baloo 2, sans-serif',
        }}
      >
        {title}
      </span>
    </div>
    <div
      style={{
        fontSize: 12,
        fontWeight: 600,
        color: 'rgba(61,26,16,0.6)',
        lineHeight: 1.7,
        paddingLeft: 24,
        fontFamily: 'Baloo 2, sans-serif',
      }}
    >
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
        background: 'rgba(44,20,8,0.35)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 300,
      }}
      onClick={onClose}
    >
      <style>{`
        .garden-guide-scroll::-webkit-scrollbar { width: 4px; }
        .garden-guide-scroll::-webkit-scrollbar-track { background: transparent; }
        .garden-guide-scroll::-webkit-scrollbar-thumb { background: rgba(232,160,176,0.55); border-radius: 99px; }
        .garden-guide-scroll::-webkit-scrollbar-thumb:hover { background: rgba(232,160,176,0.99); }
      `}</style>

      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background:
            'linear-gradient(160deg, rgba(253,246,240,0.97) 0%, rgba(252,232,238,0.97) 100%)',
          border: '1.5px solid rgba(232,160,176,0.4)',
          borderRadius: 20,
          width: 480,
          maxWidth: '95vw',
          maxHeight: '85vh',
          fontFamily: 'Baloo 2, sans-serif',
          boxShadow: '0 8px 40px rgba(200,120,140,0.2), inset 0 1px 0 rgba(255,255,255,0.6)',
          backdropFilter: 'blur(18px) saturate(1.4)',
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
            padding: '20px 24px 16px',
            borderBottom: '2px dashed rgba(232,160,176,0.4)',
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: 15, fontWeight: 800, color: '#3d1a10' }}>guia do jardim</span>
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
          className="garden-guide-scroll"
          style={{ overflowY: 'auto', padding: '20px 24px 24px', flex: 1 }}
        >
          <Section icon={<Droplets size={14} color="#5b9bd5" strokeWidth={2} />} title="como regar">
            os dois precisam regar a mesma planta uma vez por dia. a cada 3 dias regados juntos, a
            planta sobe um estágio. só é possível plantar uma semente por dia.
          </Section>

          <Section
            icon={<FlameKindling size={14} color="#c0392b" strokeWidth={2} />}
            title="modo pânico"
          >
            se o parceiro não estiver disponível, ative o modo pânico — você rega pelos dois. use
            com moderação!
          </Section>

          <Section
            icon={<AlertTriangle size={14} color="rgba(122,48,64,0.6)" strokeWidth={2} />}
            title="murcha"
          >
            se a planta ficar 48 horas sem ser regada, ela murcha. cada dia seguinte sem rega remove
            mais um dia de progresso, até zerar no estágio atual. não deixe murchar!
          </Section>

          <Section
            icon={<Dices size={14} color="rgba(122,48,64,0.6)" strokeWidth={2} />}
            title="como ganhar sementes"
          >
            sempre que uma planta sobe de estágio, os dois rolam um dado. a soma determina a semente
            ganha — quanto maior a soma, mais rara:
            <div
              style={{
                marginTop: 8,
                background: 'rgba(253,242,246,0.7)',
                border: '1.5px solid rgba(232,160,176,0.3)',
                borderRadius: 10,
                padding: '10px 12px',
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
              }}
            >
              {[
                {
                  label: 'rosa, margarida, peônia, papoula, lavanda',
                  rarity: 'comum',
                  value: 'soma 2–8',
                },
                {
                  label: 'tulipa, girassol, jasmim, violeta',
                  rarity: 'incomum',
                  value: 'soma 9–11',
                },
                { label: 'orquídea, lírio', rarity: 'rara', value: 'soma 12 (duplo 6!)' },
                { label: 'flor especial', rarity: 'epica', value: 'streak de 30 dias' },
              ].map((row) => (
                <div
                  key={row.label}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <span
                    style={{
                      fontWeight: 700,
                      color: RARITY_COLORS[row.rarity as keyof typeof RARITY_COLORS],
                    }}
                  >
                    {row.label}
                    <span style={{ fontWeight: 400, fontSize: 10, marginLeft: 5, opacity: 0.7 }}>
                      ({row.rarity})
                    </span>
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      color: 'rgba(61,26,16,0.45)',
                      flexShrink: 0,
                      marginLeft: 8,
                    }}
                  >
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          </Section>

          <Section
            icon={<Sprout size={14} color="rgba(122,48,64,0.6)" strokeWidth={2} />}
            title="estágios da planta"
          >
            cada planta tem 5 estágios. no estágio 5 ela está completamente crescida e não precisa
            mais ser regada. a cada subida de estágio vocês ganham uma semente nova!
          </Section>

          <Section
            icon={<ArrowLeftRight size={14} color="rgba(122,48,64,0.6)" strokeWidth={2} />}
            title="troca de sementes"
          >
            acumulou sementes repetidas? junte sementes do mesmo tier e troque por uma diferente —
            do mesmo tier ou um acima. a quantidade necessária aumenta conforme a raridade:
            <div
              style={{
                marginTop: 8,
                background: 'rgba(253,242,246,0.7)',
                border: '1.5px solid rgba(232,160,176,0.3)',
                borderRadius: 10,
                padding: '10px 12px',
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
              }}
            >
              {[
                { rarity: 'comum', label: 'comum' },
                { rarity: 'incomum', label: 'incomum' },
                { rarity: 'rara', label: 'rara' },
              ].map((row) => (
                <div
                  key={row.rarity}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <span
                    style={{
                      fontWeight: 700,
                      color: RARITY_COLORS[row.rarity as keyof typeof RARITY_COLORS],
                    }}
                  >
                    {row.label}
                  </span>
                  <span style={{ fontSize: 11, color: 'rgba(61,26,16,0.45)' }}>
                    {EXCHANGE_COST[row.rarity as keyof typeof EXCHANGE_COST]} sementes
                  </span>
                </div>
              ))}
            </div>
            orquídeas e lírios podem ser trocados entre si.
          </Section>

          <Section
            icon={<Coins size={14} color="rgba(122,48,64,0.6)" strokeWidth={2} />}
            title="moedinhas (em breve)"
          >
            em breve será possível vender sementes por moedinhas e usá-las para comprar móveis e
            roupinhas para a casinha de vocês!
          </Section>
        </div>
      </div>
    </div>
  )
}
