import { useState } from 'react'
import { X, ArrowLeftRight } from 'lucide-react'
import {
  FLOWERS,
  FlowerType,
  FlowerRarity,
  SeedData,
  getExchangeOptions,
  exchangeSeeds,
  EXCHANGE_COST,
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

import { TbPlant2 } from 'react-icons/tb'

const RARITY_COLOR: Record<FlowerRarity, string> = {
  comum: '#3d7a3d',
  incomum: '#8b6914',
  rara: '#c87090',
  epica: '#7a3040',
}

function RarityBadge({ rarity }: { rarity: FlowerRarity }) {
  return <TbPlant2 size={16} color={RARITY_COLOR[rarity]} style={{ flexShrink: 0 }} />
}

export default function SeedExchangeModal({ seeds, onClose }: Props) {
  const [selected, setSelected] = useState<string[]>([])
  const [chosenReward, setChosenReward] = useState<FlowerType | null>(null)
  const [confirmed, setConfirmed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [limitWarning, setLimitWarning] = useState(false)

  const selectedTier: FlowerRarity | null =
    selected.length > 0 ? FLOWERS[seeds.find((s) => s.id === selected[0])!.flowerType].rarity : null

  const selectedTypes = selected.map((id) => seeds.find((s) => s.id === id)!.flowerType)
  const exchangeOptions: FlowerType[] = selectedTier
    ? getExchangeOptions(selectedTier, selectedTypes)
    : []

  const requiredCount = selectedTier ? EXCHANGE_COST[selectedTier] : EXCHANGE_COST['comum']

  const handleSelect = (seed: SeedData) => {
    const info = FLOWERS[seed.flowerType]
    if (info.rarity === 'epica') return
    if (selected.includes(seed.id)) {
      setSelected((v) => v.filter((id) => id !== seed.id))
      setChosenReward(null)
      setLimitWarning(false)
      return
    }
    const cost = EXCHANGE_COST[info.rarity]
    if (selected.length >= cost) {
      setLimitWarning(true)
      setTimeout(() => setLimitWarning(false), 2500)
      return
    }
    if (selectedTier && info.rarity !== selectedTier) return
    setSelected((v) => [...v, seed.id])
    setChosenReward(null)
  }

  const handleConfirm = async () => {
    if (!chosenReward || selected.length !== requiredCount) return
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
        .exchange-scroll::-webkit-scrollbar { width: 4px; }
        .exchange-scroll::-webkit-scrollbar-track { background: transparent; }
        .exchange-scroll::-webkit-scrollbar-thumb { background: rgba(232,160,176,0.55); border-radius: 99px; }
        .exchange-scroll::-webkit-scrollbar-thumb:hover { background: rgba(232,160,176,0.99); }
      `}</style>

      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background:
            'linear-gradient(160deg, rgba(253,246,240,0.97) 0%, rgba(252,232,238,0.97) 100%)',
          border: '1.5px solid rgba(232,160,176,0.4)',
          borderRadius: 20,
          width: 520,
          maxWidth: '95vw',
          fontFamily: 'Baloo 2, sans-serif',
          boxShadow: '0 8px 40px rgba(200,120,140,0.2), inset 0 1px 0 rgba(255,255,255,0.6)',
          backdropFilter: 'blur(18px) saturate(1.4)',
          overflow: 'hidden',
          position: 'relative',
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
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <ArrowLeftRight size={15} color="rgba(122,48,64,0.6)" strokeWidth={2} />
            <span style={{ fontSize: 15, fontWeight: 800, color: '#3d1a10' }}>trocar sementes</span>
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
          style={{ padding: '16px 24px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}
        >
          {/* Como funciona */}
          <div
            style={{
              background: 'rgba(253,242,246,0.7)',
              border: '1.5px solid rgba(232,160,176,0.3)',
              borderRadius: 12,
              padding: '12px 14px',
            }}
          >
            <div
              style={{
                fontSize: 9,
                fontWeight: 800,
                color: 'rgba(122,48,64,0.55)',
                textTransform: 'uppercase',
                letterSpacing: '0.8px',
                marginBottom: 5,
              }}
            >
              como funciona
            </div>
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: 'rgba(61,26,16,0.6)',
                lineHeight: 1.6,
              }}
            >
              selecione sementes do mesmo tier para trocar. depois, escolha à direita qual semente
              deseja receber.
            </div>
            {/* Legenda de raridade */}
            <div style={{ marginTop: 10, display: 'flex', gap: 6 }}>
              {(['comum', 'incomum', 'rara'] as FlowerRarity[]).map((r) => (
                <div
                  key={r}
                  style={{
                    flex: 1,
                    background:
                      selectedTier === r ? 'rgba(232,160,176,0.2)' : 'rgba(253,242,246,0.5)',
                    border:
                      selectedTier === r
                        ? '1.5px solid rgba(232,160,176,0.6)'
                        : '1.5px solid rgba(232,160,176,0.25)',
                    borderRadius: 8,
                    padding: '5px 8px',
                    textAlign: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 5,
                  }}
                >
                  <RarityBadge rarity={r} />
                  <div>
                    <div
                      style={{
                        fontSize: 10,
                        fontWeight: 800,
                        color: selectedTier === r ? '#3d1a10' : 'rgba(61,26,16,0.5)',
                        textTransform: 'lowercase',
                      }}
                    >
                      {r}
                    </div>
                    <div style={{ fontSize: 10, color: 'rgba(61,26,16,0.4)' }}>
                      {EXCHANGE_COST[r]}x
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {limitWarning && (
            <div
              style={{
                background: 'rgba(232,96,122,0.08)',
                border: '1.5px solid rgba(232,96,122,0.3)',
                borderRadius: 10,
                padding: '8px 12px',
                fontSize: 11,
                fontWeight: 600,
                color: '#e8607a',
              }}
            >
              limite de {requiredCount} sementes atingido para esse tier!
            </div>
          )}

          {/* Grids */}
          <div style={{ display: 'flex', gap: 10 }}>
            {/* Esquerda — inventário */}
            <div
              className="exchange-scroll"
              style={{
                flex: 1,
                background: 'rgba(253,242,246,0.7)',
                border: '1.5px solid rgba(232,160,176,0.3)',
                borderRadius: 12,
                padding: 10,
                maxHeight: 240,
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
                  marginBottom: 8,
                }}
              >
                suas sementes
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
                {Array.from({ length: Math.max(16, seeds.length) }).map((_, i) => {
                  const seed = seeds[i]
                  if (!seed) return <EmptySlot key={i} />
                  const info = FLOWERS[seed.flowerType]
                  const isSelected = selected.includes(seed.id)
                  const isDisabled =
                    !isSelected && selectedTier != null && info.rarity !== selectedTier
                  return (
                    <button
                      key={seed.id}
                      onClick={() => handleSelect(seed)}
                      title={`${info.name} (${TIER_LABEL[info.rarity]})`}
                      disabled={isDisabled}
                      style={{
                        background: isSelected ? 'rgba(232,160,176,0.3)' : 'rgba(253,242,246,0.8)',
                        border: isSelected
                          ? '2px solid rgba(232,160,176,0.7)'
                          : '1.5px solid rgba(232,160,176,0.3)',
                        borderRadius: 8,
                        width: '100%',
                        aspectRatio: '1',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: isDisabled ? 'default' : 'pointer',
                        opacity: isDisabled ? 0.3 : 1,
                        padding: 0,
                        transition: 'all 0.12s',
                        flexDirection: 'column',
                        gap: 2,
                      }}
                    >
                      <RarityBadge rarity={info.rarity} />
                      <span
                        style={{ fontSize: 8, color: '#3d1a10', fontWeight: 700, lineHeight: 1 }}
                      >
                        {info.name.slice(0, 6)}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Separador */}
            <div style={{ width: 1, background: 'rgba(232,160,176,0.3)', flexShrink: 0 }} />

            {/* Direita — opções */}
            <div
              className="exchange-scroll"
              style={{
                flex: 1,
                background: 'rgba(253,242,246,0.7)',
                border: '1.5px solid rgba(232,160,176,0.3)',
                borderRadius: 12,
                padding: 10,
                maxHeight: 240,
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
                  marginBottom: 8,
                }}
              >
                receber
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
                {Array.from({ length: Math.max(16, exchangeOptions.length) }).map((_, i) => {
                  const type = exchangeOptions[i] as FlowerType | undefined
                  if (!type || selected.length < requiredCount) return <EmptySlot key={i} />
                  const info = FLOWERS[type]
                  const isChosen = chosenReward === type
                  return (
                    <button
                      key={type}
                      onClick={() => setChosenReward(type)}
                      title={`${info.name} (${TIER_LABEL[info.rarity]})`}
                      style={{
                        background: isChosen ? 'rgba(232,160,176,0.3)' : 'rgba(253,242,246,0.8)',
                        border: isChosen
                          ? '2px solid rgba(232,160,176,0.7)'
                          : '1.5px solid rgba(232,160,176,0.3)',
                        borderRadius: 8,
                        width: '100%',
                        aspectRatio: '1',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        padding: 0,
                        transition: 'all 0.12s',
                        flexDirection: 'column',
                        gap: 2,
                      }}
                    >
                      <RarityBadge rarity={info.rarity} />
                      <span
                        style={{ fontSize: 8, color: '#3d1a10', fontWeight: 700, lineHeight: 1 }}
                      >
                        {info.name.slice(0, 6)}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Botão confirmar */}
          <button
            onClick={handleConfirm}
            disabled={selected.length !== requiredCount || !chosenReward || loading}
            style={{
              width: '100%',
              background:
                selected.length === requiredCount && chosenReward
                  ? 'rgba(232,160,176,0.55)'
                  : 'rgba(232,160,176,0.2)',
              color:
                selected.length === requiredCount && chosenReward
                  ? '#3d1a10'
                  : 'rgba(61,26,16,0.35)',
              border: 'none',
              borderRadius: 12,
              padding: '11px 0',
              fontSize: 13,
              fontWeight: 800,
              fontFamily: 'Baloo 2, sans-serif',
              cursor: selected.length === requiredCount && chosenReward ? 'pointer' : 'default',
              transition: 'all 0.15s',
            }}
          >
            {loading
              ? 'trocando...'
              : selected.length > 0
                ? `confirmar (${selected.length}/${requiredCount})`
                : 'confirmar'}
          </button>
        </div>

        {/* Sucesso */}
        {confirmed && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(253,246,240,0.97)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 20,
              zIndex: 10,
            }}
          >
            <div
              style={{
                background: 'rgba(253,242,246,0.9)',
                border: '1.5px solid rgba(232,160,176,0.4)',
                borderRadius: 16,
                padding: '28px 32px',
                fontFamily: 'Baloo 2, sans-serif',
                textAlign: 'center',
                maxWidth: 280,
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: 'rgba(61,26,16,0.6)',
                  marginBottom: 18,
                  lineHeight: 1.6,
                }}
              >
                suas sementes foram trocadas! a nova semente já está no seu inventário.
              </div>
              <button
                onClick={handleReset}
                style={{
                  background: 'rgba(232,160,176,0.55)',
                  color: '#3d1a10',
                  border: 'none',
                  borderRadius: 10,
                  padding: '8px 28px',
                  fontSize: 13,
                  fontWeight: 800,
                  fontFamily: 'Baloo 2, sans-serif',
                  cursor: 'pointer',
                }}
              >
                ok
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function EmptySlot() {
  return (
    <div
      style={{
        background: 'rgba(253,242,246,0.4)',
        border: '1.5px solid rgba(232,160,176,0.2)',
        borderRadius: 8,
        width: '100%',
        aspectRatio: '1',
      }}
    />
  )
}
