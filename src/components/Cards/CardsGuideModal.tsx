import { X, Package, Sparkles, Backpack, ShoppingBag, Repeat, Info } from 'lucide-react'
import { RARITY_COLOR } from '../../lib/rarity'
import { PACK_PRICES } from '../../lib/packs'
import { usePromoCollection } from '../../hooks/usePromoCollection'
import {
  PACK_ODDS,
  PITY_THRESHOLD,
  ROTATING_SHOP_WEIGHTS,
  ROTATING_SHOP_ROTATION_DAYS,
} from '../../lib/dropRates'
import { SHOP_PRICES } from '../../lib/rotatingShop'
import { COLLECTIONS } from '../../lib/cards'

interface Props {
  coupleId: string
  onClose: () => void
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

const InfoCard = ({ children }: { children: React.ReactNode }) => (
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
    {children}
  </div>
)

const Row = ({
  label,
  rarity,
  value,
  sub,
}: {
  label: string
  rarity?: keyof typeof RARITY_COLOR
  value: string
  sub?: string
}) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <span style={{ fontWeight: 700, color: rarity ? RARITY_COLOR[rarity] : 'rgba(61,26,16,0.7)' }}>
      {label}
      {sub && (
        <span style={{ fontWeight: 400, fontSize: 10, marginLeft: 5, opacity: 0.7 }}>({sub})</span>
      )}
    </span>
    <span style={{ fontSize: 11, color: 'rgba(61,26,16,0.45)', flexShrink: 0, marginLeft: 8 }}>
      {value}
    </span>
  </div>
)

export default function CardsGuideModal({ coupleId, onClose }: Props) {
  const { state: promoState } = usePromoCollection(coupleId)
  const currentPromoCollection = promoState?.current
    ? COLLECTIONS[promoState.current as keyof typeof COLLECTIONS]
    : null

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
        .cards-guide-scroll::-webkit-scrollbar { width: 4px; }
        .cards-guide-scroll::-webkit-scrollbar-track { background: transparent; }
        .cards-guide-scroll::-webkit-scrollbar-thumb { background: rgba(232,160,176,0.55); border-radius: 99px; }
        .cards-guide-scroll::-webkit-scrollbar-thumb:hover { background: rgba(232,160,176,0.99); }
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
          <span style={{ fontSize: 15, fontWeight: 800, color: '#3d1a10' }}>
            guia das cartinhas
          </span>
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
          className="cards-guide-scroll"
          style={{ overflowY: 'auto', padding: '20px 24px 24px', flex: 1 }}
        >
          <Section
            icon={<Sparkles size={14} color="rgba(122,48,64,0.6)" strokeWidth={2} />}
            title="como funciona a coleção"
          >
            cada carta é individual, e dá pra ter várias cópias da mesma carta — pode sair repetida
            no mesmo pacote sem problema. cada carta pertence a uma raridade:
            <InfoCard>
              <Row label="comum" rarity="comum" value="mais fácil de conseguir" />
              <Row label="incomum" rarity="incomum" value="um pouco mais rara" />
              <Row label="rara" rarity="rara" value="difícil de conseguir" />
              <Row label="épica" rarity="epica" value="a mais rara de todas" />
            </InfoCard>
          </Section>

          <Section
            icon={<Backpack size={14} color="rgba(122,48,64,0.6)" strokeWidth={2} />}
            title="mochila"
          >
            comprar um pacote não abre ele na hora — o pacote fica guardado na sua mochila (botão
            flutuante na tela de coleção) até você decidir abrir. o sorteio das cartas só acontece
            no momento em que você clica em "abrir", não na compra.
          </Section>

          <Section
            icon={<Package size={14} color="rgba(122,48,64,0.6)" strokeWidth={2} />}
            title="tipos de pacote"
          >
            cada pacote vem com 5 cartas. existem 2 tipos:
            <InfoCard>
              <Row label="comum" value={`${PACK_PRICES.comum} moedas`} />
              <Row label="promocional" value={`${PACK_PRICES.promocional} moedas`} />
            </InfoCard>
            <div style={{ marginTop: 10, lineHeight: 1.6 }}>
              o pacote <b>comum</b> sorteia de todas as coleções disponíveis no momento em que você
              abre — se guardar ele na mochila e uma coleção nova lançar antes de abrir, ele pode
              sair carta da coleção nova também. é uma aposta: segurar o pacote pode valer a pena,
              mas não tem garantia.
            </div>
            <div style={{ marginTop: 8, lineHeight: 1.6 }}>
              o pacote <b>promocional</b> é sempre da coleção "em cartaz" no momento em que você{' '}
              <b>compra</b> — hoje é{' '}
              <b style={{ color: '#2D4A2D' }}>{currentPromoCollection?.name ?? 'carregando...'}</b>.
              diferente do comum, ele não muda: se você comprar hoje e abrir daqui um mês, mesmo que
              a coleção em cartaz já tenha trocado, o seu pacote continua sorteando só da coleção de
              quando você comprou. a coleção em cartaz troca sozinha toda semana, aos domingos à
              meia-noite (horário de Brasília) — sempre priorizando alguma coleção que ainda não
              entrou em cartaz; quando todas já passaram por lá, intercala entre elas sem repetir a
              mesma duas vezes seguidas.
            </div>
          </Section>

          <Section
            icon={<Info size={14} color="rgba(122,48,64,0.6)" strokeWidth={2} />}
            title="chance por carta"
          >
            cada uma das 5 cartas do pacote é sorteada de forma independente, seguindo essas
            chances:
            <InfoCard>
              <Row label="comum" rarity="comum" value={`${(PACK_ODDS.comum * 100).toFixed(0)}%`} />
              <Row
                label="incomum"
                rarity="incomum"
                value={`${(PACK_ODDS.incomum * 100).toFixed(0)}%`}
              />
              <Row label="rara" rarity="rara" value={`${(PACK_ODDS.rara * 100).toFixed(0)}%`} />
              <Row label="épica" rarity="epica" value={`${(PACK_ODDS.epica * 100).toFixed(0)}%`} />
            </InfoCard>
            <div style={{ marginTop: 10, lineHeight: 1.6 }}>
              e tem uma garantia: a cada <b>{PITY_THRESHOLD} pacotes abertos</b>, o próximo vem com
              pelo menos 1 carta rara ou épica garantida — mesmo que o azar te acompanhe até lá.
              esse contador é por pessoa e conta pacotes abertos, não comprados.
            </div>
          </Section>

          <Section
            icon={<ShoppingBag size={14} color="rgba(122,48,64,0.6)" strokeWidth={2} />}
            title="loja rotativa"
          >
            além dos pacotes, tem 3 cartas específicas à venda direto (sem sorteio), sempre incomum,
            rara ou épica — nunca comum. elas trocam a cada {ROTATING_SHOP_ROTATION_DAYS} dias, à
            meia-noite (horário de Brasília):
            <InfoCard>
              <Row
                label="incomum"
                rarity="incomum"
                value={`${SHOP_PRICES.incomum} moedas — ${(ROTATING_SHOP_WEIGHTS.incomum * 100).toFixed(0)}% de chance de aparecer`}
              />
              <Row
                label="rara"
                rarity="rara"
                value={`${SHOP_PRICES.rara} moedas — ${(ROTATING_SHOP_WEIGHTS.rara * 100).toFixed(0)}% de chance de aparecer`}
              />
              <Row
                label="épica"
                rarity="epica"
                value={`${SHOP_PRICES.epica} moedas — ${(ROTATING_SHOP_WEIGHTS.epica * 100).toFixed(0)}% de chance de aparecer`}
              />
            </InfoCard>
            <div style={{ marginTop: 10, lineHeight: 1.6 }}>
              essas 3 cartas vão direto pra sua coleção assim que compradas — não precisam passar
              pela mochila nem por abertura de pacote.
            </div>
          </Section>

          <Section
            icon={<Repeat size={14} color="rgba(122,48,64,0.6)" strokeWidth={2} />}
            title="trocas"
          >
            em breve vocês vão poder trocar cartas repetidas entre si — essa parte ainda está em
            construção.
          </Section>
        </div>
      </div>
    </div>
  )
}
