import { useState } from 'react'
import { X, ArrowLeftRight } from 'lucide-react'
import {
  FLOWERS,
  FlowerType,
  FlowerRarity,
  SeedData,
  TIER_ORDER,
  getExchangeOptions,
  exchangeSeeds,
} from '../../lib/garden'

interface Props {
  seeds: SeedData[]
  onClose: () => void
}

const TIER_LABEL: Record<FlowerRarity, string> = {
  comum: 'Comum',
  incomum: 'Incomum',
  rara: 'Rara',
  epica: 'Épica',
}

export default function SeedExchangeModal({ seeds, onClose }: Props) {
  const [selected, setSelected] = useState<string[]>([])
  const [chosenReward, setChosenReward] = useState<FlowerType | null>(null)
  const [confirmed, setConfirmed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [limitWarning, setLimitWarning] = useState(false)

  const selectedTier: FlowerRarity | null =
    selected.length > 0 ? FLOWERS[seeds.find((s) => s.id === selected[0])!.flowerType].rarity : null

  const selectedFlowerType: FlowerType | null =
    selected.length > 0 ? seeds.find((s) => s.id === selected[0])!.flowerType : null

  const exchangeOptions: FlowerType[] =
    selectedTier && selectedFlowerType ? getExchangeOptions(selectedTier, selectedFlowerType) : []

  const handleSelect = (seed: SeedData) => {
    const info = FLOWERS[seed.flowerType]

    if (info.rarity === 'epica') return

    if (info.rarity === 'rara' && info.type === 'orquidea') {
      alert(
        'Orquídeas não podem ser trocadas por enquanto. Em breve poderão ser vendidas por moedinhas!'
      )
      return
    }

    if (selected.includes(seed.id)) {
      setSelected((v) => v.filter((id) => id !== seed.id))
      setChosenReward(null)
      setLimitWarning(false)
      return
    }

    if (selected.length >= 5) {
      setLimitWarning(true)
      setTimeout(() => setLimitWarning(false), 2500)
      return
    }

    // Só permite selecionar do mesmo tier
    if (selectedTier && info.rarity !== selectedTier) return

    setSelected((v) => [...v, seed.id])
    setChosenReward(null)
  }

  const handleConfirm = async () => {
    if (!chosenReward || selected.length !== 5) return
    setLoading(true)
    await exchangeSeeds(selected, chosenReward)
    setLoading(false)
    setConfirmed(true)
  }

  const handleReset = () => {
    setSelected([])
    setChosenReward(null)
    setConfirmed(false)
  }

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
          width: 520,
          maxWidth: '95vw',
          fontFamily: 'Baloo 2, sans-serif',
          boxShadow: '0 12px 48px rgba(0,0,0,0.22)',
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
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ArrowLeftRight size={18} color="#4F7E4E" />
            <span style={{ fontSize: 18, fontWeight: 800, color: '#1A2A1A' }}>Trocas</span>
          </div>
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

        {/* Como funciona */}
        <div
          style={{
            margin: '0 16px 14px',
            background: '#FFF8F0',
            border: '1.5px solid #C59F78',
            borderRadius: 10,
            padding: '12px 14px',
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 800, color: '#8E6D1A', marginBottom: 4 }}>
            Como funciona?
          </div>
          <div style={{ fontSize: 12, color: '#8E6D1A', lineHeight: 1.7 }}>
            Selecione abaixo as 5 sementes coletadas do mesmo tier que deseja trocar. Depois,
            escolha à direita qual semente deseja receber no lugar delas.
          </div>
        </div>

        {limitWarning && (
          <div
            style={{
              margin: '0 16px 10px',
              background: '#fff0f0',
              border: '1.5px solid #e8a0b0',
              borderRadius: 8,
              padding: '8px 12px',
              fontSize: 11,
              color: '#c87090',
              fontWeight: 600,
            }}
          >
            Limite de 5 sementes atingido!
          </div>
        )}

        {/* Grids */}
        <div style={{ display: 'flex', gap: 0, padding: '0 16px 16px' }}>
          {/* Esquerda — inventário */}
          <div
            style={{
              flex: 1,
              background: '#FFF8F0',
              border: '1.5px solid #C59F78',
              borderRadius: 10,
              padding: 10,
              marginRight: 8,
              maxHeight: 300,
              overflowY: 'auto',
            }}
          >
            <ScrollbarStyle />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
              {Array.from({ length: Math.max(20, seeds.length) }).map((_, i) => {
                const seed = seeds[i]
                if (!seed) {
                  return <EmptySlot key={i} />
                }
                const info = FLOWERS[seed.flowerType]
                const isSelected = selected.includes(seed.id)
                const isDisabled =
                  !isSelected && selectedTier != null && info.rarity !== selectedTier
                return (
                  <button
                    key={seed.id}
                    onClick={() => handleSelect(seed)}
                    title={info.name}
                    disabled={isDisabled}
                    style={{
                      background: isSelected ? '#d4ead4' : '#E8F5E8',
                      border: isSelected ? '2px solid #518451' : '1.5px solid #A8D8A8',
                      borderRadius: 8,
                      width: '100%',
                      aspectRatio: '1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: isDisabled ? 'default' : 'pointer',
                      opacity: isDisabled ? 0.35 : 1,
                      fontSize: 22,
                      padding: 0,
                      transition: 'all 0.12s',
                    }}
                  >
                    {info.emoji}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Linha divisória */}
          <div
            style={{
              width: 1,
              background: 'rgba(197,159,120,0.28)',
              margin: '0 4px',
              flexShrink: 0,
            }}
          />

          {/* Direita — opções de troca */}
          <div
            style={{
              flex: 1,
              background: '#FFF8F0',
              border: '1.5px solid #C59F78',
              borderRadius: 10,
              padding: 10,
              marginLeft: 8,
              maxHeight: 300,
              overflowY: 'auto',
            }}
          >
            <ScrollbarStyle />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
              {Array.from({ length: Math.max(20, exchangeOptions.length) }).map((_, i) => {
                const type = exchangeOptions[i] as FlowerType | undefined
                if (!type || selected.length < 5) {
                  return <EmptySlot key={i} />
                }
                const info = FLOWERS[type]
                const isChosen = chosenReward === type
                return (
                  <button
                    key={type}
                    onClick={() => setChosenReward(type)}
                    title={`${info.name} (${TIER_LABEL[info.rarity]})`}
                    style={{
                      background: isChosen ? '#d4ead4' : '#E8F5E8',
                      border: isChosen ? '2px solid #518451' : '1.5px solid #A8D8A8',
                      borderRadius: 8,
                      width: '100%',
                      aspectRatio: '1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      fontSize: 22,
                      padding: 0,
                      transition: 'all 0.12s',
                    }}
                  >
                    {info.emoji}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Confirmar */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '0 16px 18px' }}>
          <button
            onClick={handleConfirm}
            disabled={selected.length !== 5 || !chosenReward || loading}
            style={{
              background: selected.length === 5 && chosenReward ? '#C59F78' : '#e0d0bb',
              color: selected.length === 5 && chosenReward ? '#fff' : '#b0a090',
              border: '1.5px solid #C59F78',
              borderRadius: 10,
              padding: '8px 24px',
              fontSize: 13,
              fontWeight: 800,
              fontFamily: 'Baloo 2, sans-serif',
              cursor: selected.length === 5 && chosenReward ? 'pointer' : 'default',
              transition: 'all 0.15s',
            }}
          >
            {loading ? 'Trocando...' : 'Confirmar'}
          </button>
        </div>
      </div>

      {/* Alert de sucesso */}
      {confirmed && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 400,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            style={{
              background: '#FFF8F0',
              border: '2px solid #C59F78',
              borderRadius: 14,
              padding: '28px 32px',
              fontFamily: 'Baloo 2, sans-serif',
              textAlign: 'center',
              maxWidth: 320,
              boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
            }}
          >
            <div
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: '#8E6D1A',
                marginBottom: 18,
                lineHeight: 1.6,
              }}
            >
              Suas sementes foram trocadas e sua nova semente já está disponível no seu inventário.
            </div>
            <button
              onClick={handleReset}
              style={{
                background: '#C59F78',
                color: '#fff',
                border: 'none',
                borderRadius: 10,
                padding: '8px 28px',
                fontSize: 13,
                fontWeight: 800,
                fontFamily: 'Baloo 2, sans-serif',
                cursor: 'pointer',
              }}
            >
              Ok
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function EmptySlot() {
  return (
    <div
      style={{
        background: '#E8F5E8',
        border: '1.5px solid #A8D8A8',
        borderRadius: 8,
        width: '100%',
        aspectRatio: '1',
      }}
    />
  )
}

function ScrollbarStyle() {
  return (
    <style>{`
      ::-webkit-scrollbar { width: 6px; }
      ::-webkit-scrollbar-track { background: #FCE8F0; border-radius: 4px; }
      ::-webkit-scrollbar-thumb { background: rgba(232,160,176,0.34); border-radius: 4px; border: 1px solid rgba(232,160,176,0.34); }
    `}</style>
  )
}
