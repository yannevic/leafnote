import { useState, ReactNode } from 'react'
import { X, Sprout, ShoppingBag, Repeat, ArrowLeft } from 'lucide-react'
import CollectionGrid from './CollectionGrid'
import PersonalCoinSetupModal from './PersonalCoinSetupModal'
import { usePersonalCoin } from '../../hooks/usePersonalCoin'
import { COIN_ICONS } from '../../lib/personalCoinIcons'

interface CardsModalProps {
  coupleId: string
  uid: string
  partnerUid: string
  onClose: () => void
}

type Tab = 'colecao' | 'loja' | 'trocas'

export default function CardsModal({ coupleId, uid, partnerUid, onClose }: CardsModalProps) {
  const [tab, setTab] = useState<Tab>('colecao')
  const { coin, needsSetup } = usePersonalCoin(uid)

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        background: 'linear-gradient(160deg, #FBEAF0 0%, #F5ECD7 100%)',
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
          padding: '16px 20px',
          paddingTop: 56,
        }}
      >
        <button
          onClick={onClose}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'rgba(255,255,255,0.5)',
            border: 'none',
            borderRadius: 999,
            padding: '8px 14px',
            cursor: 'pointer',
            color: '#2D4A2D',
            fontFamily: 'Baloo 2',
            fontWeight: 700,
            fontSize: 13,
          }}
        >
          <ArrowLeft size={16} /> voltar ao mural
        </button>

        <div style={{ display: 'flex', gap: 8 }}>
          <TabButton
            active={tab === 'colecao'}
            onClick={() => setTab('colecao')}
            icon={<Sprout size={16} />}
            label="coleção"
          />
          <TabButton
            active={tab === 'loja'}
            onClick={() => setTab('loja')}
            icon={<ShoppingBag size={16} />}
            label="loja"
          />
          <TabButton
            active={tab === 'trocas'}
            onClick={() => setTab('trocas')}
            icon={<Repeat size={16} />}
            label="trocas"
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {coin && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                background: 'rgba(255,255,255,0.5)',
                borderRadius: 999,
                padding: '6px 12px',
                fontFamily: 'Baloo 2',
                fontWeight: 800,
                fontSize: 13,
                color: coin.color,
              }}
            >
              {(() => {
                const Icon = COIN_ICONS[coin.icon]
                return <Icon size={16} />
              })()}
              {coin.balance}
            </div>
          )}
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2D4A2D' }}
          >
            <X size={24} />
          </button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {tab === 'colecao' && (
          <CollectionGrid coupleId={coupleId} uid={uid} partnerUid={partnerUid || null} />
        )}
        {tab === 'loja' && (
          <div style={{ padding: 24, textAlign: 'center', color: '#8B6914' }}>
            loja em construção — chega na Fase 3
          </div>
        )}
        {tab === 'trocas' && (
          <div style={{ padding: 24, textAlign: 'center', color: '#8B6914' }}>
            trocas em construção — chega na Fase 5
          </div>
        )}
      </div>
      {needsSetup && <PersonalCoinSetupModal uid={uid} onDone={() => {}} />}
    </div>
  )
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean
  onClick: () => void
  icon: ReactNode
  label: string
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '8px 14px',
        borderRadius: 999,
        border: 'none',
        background: active ? '#4A7A4A' : 'rgba(255,255,255,0.5)',
        color: active ? '#fff' : '#2D4A2D',
        cursor: 'pointer',
        fontFamily: 'Baloo 2',
        fontWeight: 700,
        fontSize: 13,
      }}
    >
      {icon} {label}
    </button>
  )
}
