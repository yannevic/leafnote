import { useState, ReactNode } from 'react'
import { X, Sprout, ShoppingBag, Sparkles, ArrowLeft, HelpCircle, Receipt } from 'lucide-react'
import CardsGuideModal from './CardsGuideModal'
import CardsExtractModal from './CardsExtractModal'
import CollectionGrid from './CollectionGrid'
import PersonalCoinSetupModal from './PersonalCoinSetupModal'
import { usePersonalCoin } from '../../hooks/usePersonalCoin'
import { COIN_ICONS } from '../../lib/personalCoinIcons'
import LojaTab from './LojaTab'
import ExtrasTab from './ExtrasTab'
import BackpackDrawer from './BackpackDrawer'

interface CardsModalProps {
  coupleId: string
  uid: string
  partnerUid: string
  onClose: () => void
}

type Tab = 'colecao' | 'loja' | 'extras'

export default function CardsModal({ coupleId, uid, partnerUid, onClose }: CardsModalProps) {
  const [tab, setTab] = useState<Tab>('colecao')
  const [showGuide, setShowGuide] = useState(false)
  const [showExtract, setShowExtract] = useState(false)
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
            active={tab === 'extras'}
            onClick={() => setTab('extras')}
            icon={<Sparkles size={16} />}
            label="extras"
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={() => setShowGuide(true)}
            style={{
              width: 30,
              height: 30,
              borderRadius: '50%',
              border: 'none',
              background: 'rgba(255,255,255,0.5)',
              color: '#2D4A2D',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <HelpCircle size={16} strokeWidth={2.2} />
          </button>
          <button
            onClick={() => setShowExtract(true)}
            style={{
              width: 30,
              height: 30,
              borderRadius: '50%',
              border: 'none',
              background: 'rgba(255,255,255,0.5)',
              color: '#2D4A2D',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <Receipt size={16} strokeWidth={2.2} />
          </button>
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
          <>
            <CollectionGrid coupleId={coupleId} uid={uid} partnerUid={partnerUid || null} />
            <BackpackDrawer coupleId={coupleId} uid={uid} />
          </>
        )}
        {tab === 'loja' && <LojaTab coupleId={coupleId} uid={uid} />}
        {tab === 'extras' && <ExtrasTab coupleId={coupleId} uid={uid} partnerUid={partnerUid} />}
      </div>
      {needsSetup && <PersonalCoinSetupModal uid={uid} onDone={() => {}} />}
      {showGuide && <CardsGuideModal coupleId={coupleId} onClose={() => setShowGuide(false)} />}
      {showExtract && <CardsExtractModal uid={uid} onClose={() => setShowExtract(false)} />}
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
