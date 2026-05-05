import { useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Sprout,
  X,
  AlertTriangle,
  Leaf,
  ArrowLeftRight,
} from 'lucide-react'
import SeedExchangeModal from './SeedExchangeModal'
import { useGarden } from '../../hooks/useGarden'
import { FLOWERS, SeedData } from '../../lib/garden'
import Plant from './Plant'
import FlowerModal from './FlowerModal'
import SeedRollModal from './SeedRollModal'
import { bgCartoon } from '../../assets/garden'

interface GardenViewProps {
  uid: string
  partnerUid: string
  partnerName: string
  onClose: () => void
}

const PLANTS_PER_PAGE = 4

export default function GardenView({ uid, partnerUid, partnerName, onClose }: GardenViewProps) {
  const {
    plants,
    seeds,
    loading,
    water,
    plant,
    alreadyWatered,
    partnerWatered,
    canPlant,
    currentEvent,
    rollForEvent,
    rollForWelcome,
    panicMode,
    togglePanic,
    welcomePending,
    partnerRolledEvent,
    partnerRolledWelcome,
    iAlreadyRolledWelcome,
  } = useGarden(uid, partnerUid)

  const [page, setPage] = useState(0)
  const [selectedPlantId, setSelectedPlantId] = useState<string | null>(null)
  const [showSeedModal, setShowSeedModal] = useState(false)
  const [plantingSeed, setPlantingSeed] = useState<SeedData | null>(null)
  const [_seedRollDone, setSeedRollDone] = useState(false)
  const [showExchangeModal, setShowExchangeModal] = useState(false)

  const totalPages = Math.max(1, Math.ceil(plants.length / PLANTS_PER_PAGE))
  const visiblePlants = plants.slice(page * PLANTS_PER_PAGE, (page + 1) * PLANTS_PER_PAGE)
  const selectedPlant = plants.find((p) => p.id === selectedPlantId) ?? null

  const handleWater = async () => {
    if (!selectedPlantId) return
    await water(selectedPlantId)
  }

  const handlePlant = async () => {
    if (!plantingSeed || !canPlant) return
    await plant(plantingSeed.id, plantingSeed.flowerType)
    setPlantingSeed(null)
    setShowSeedModal(false)
  }

  // Modal de roll ativo: welcome ou evento de estágio
  const showWelcomeRoll = welcomePending
  const showEventRoll = !showWelcomeRoll && currentEvent != null

  return (
    <>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 200,
        }}
        onClick={onClose}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            background: 'var(--color-bark-100)',
            border: '2px solid var(--color-wood-300)',
            borderRadius: 24,
            width: 600,
            maxWidth: '95vw',
            padding: '28px 24px 24px',
            fontFamily: 'Baloo 2, sans-serif',
            boxShadow: '0 12px 48px rgba(0,0,0,0.22)',
            position: 'relative',
          }}
        >
          {/* Cabeçalho */}
          <div className="flex items-center justify-between mb-5">
            <h2
              style={{
                margin: 0,
                fontSize: 22,
                fontWeight: 700,
                color: 'var(--color-leaf-950)',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Leaf size={20} style={{ color: 'var(--color-leaf-600)' }} /> Jardim
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {/* Toggle modo pânico */}
              <button
                onClick={() => setShowExchangeModal(true)}
                title="Trocar sementes"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  color: '#4F7E4E',
                }}
              >
                <ArrowLeftRight size={15} />
              </button>
              <button
                onClick={togglePanic}
                title={
                  panicMode ? 'Modo pânico ativo — clique para desativar' : 'Ativar modo pânico'
                }
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '5px 14px',
                  borderRadius: 20,
                  border: 'none',
                  background: panicMode ? '#c0392b' : '#e8d8c0',
                  color: panicMode ? '#fff' : 'var(--color-bark-700)',
                  fontFamily: 'Baloo 2, sans-serif',
                  fontWeight: 700,
                  fontSize: 12,
                  cursor: 'pointer',
                  boxShadow: panicMode ? '0 2px 8px rgba(192,57,43,0.4)' : 'none',
                  transition: 'all 0.2s',
                }}
              >
                <AlertTriangle size={13} />
                {panicMode ? 'Pânico ON' : 'Pânico'}
              </button>
              <button
                onClick={onClose}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--color-bark-700)',
                }}
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-10" style={{ color: 'var(--color-bark-700)' }}>
              Carregando jardim...
            </div>
          ) : (
            <>
              {/* Prateleira */}
              <div
                style={{
                  position: 'relative',
                  border: '2px solid var(--color-wood-300)',
                  borderRadius: 16,
                  padding: '16px 8px 12px',
                  marginBottom: 16,
                  minHeight: 280,
                  overflow: 'hidden',
                }}
              >
                <img
                  src={bgCartoon}
                  alt=""
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    filter: 'blur(7px) brightness(0.92)',
                    transform: 'scale(1.04)',
                    zIndex: 0,
                  }}
                />
                <div style={{ position: 'relative', zIndex: 1 }}>
                  {plants.length === 0 ? (
                    <div
                      className="flex flex-col items-center justify-center h-full"
                      style={{ minHeight: 220, color: 'var(--color-leaf-600)', gap: 8 }}
                    >
                      <span style={{ fontSize: 40 }}>🌱</span>
                      <span style={{ fontSize: 14, fontWeight: 600 }}>Nenhuma planta ainda</span>
                      <span style={{ fontSize: 12 }}>Plante uma semente para começar!</span>
                    </div>
                  ) : (
                    <div className="flex items-end justify-center gap-6" style={{ minHeight: 240 }}>
                      {visiblePlants.map((p) => (
                        <Plant key={p.id} plant={p} onClick={() => setSelectedPlantId(p.id)} />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Setas de navegação */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 mb-4">
                  <button
                    onClick={() => setPage((v) => Math.max(0, v - 1))}
                    disabled={page === 0}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: page === 0 ? 'default' : 'pointer',
                      opacity: page === 0 ? 0.3 : 1,
                      color: 'var(--color-bark-700)',
                    }}
                  >
                    <ChevronLeft size={22} />
                  </button>
                  <span style={{ fontSize: 13, color: 'var(--color-bark-700)' }}>
                    {page + 1} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((v) => Math.min(totalPages - 1, v + 1))}
                    disabled={page === totalPages - 1}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: page === totalPages - 1 ? 'default' : 'pointer',
                      opacity: page === totalPages - 1 ? 0.3 : 1,
                      color: 'var(--color-bark-700)',
                    }}
                  >
                    <ChevronRight size={22} />
                  </button>
                </div>
              )}

              {/* Estoque de sementes */}
              <div
                style={{
                  background: '#fff8f0',
                  border: '1.5px solid var(--color-wood-300)',
                  borderRadius: 12,
                  padding: '12px 14px',
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--color-bark-700)' }}>
                    <Sprout size={14} style={{ marginRight: 5, display: 'inline' }} /> Sementes (
                    {seeds.length})
                  </span>
                  <button
                    onClick={() => setShowSeedModal(true)}
                    disabled={seeds.length === 0 || !canPlant}
                    style={{
                      background: seeds.length > 0 && canPlant ? 'var(--color-leaf-600)' : '#ccc',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 8,
                      padding: '4px 12px',
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: seeds.length > 0 && canPlant ? 'pointer' : 'default',
                      fontFamily: 'Baloo 2, sans-serif',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                    title={
                      !canPlant
                        ? 'Já plantou hoje'
                        : seeds.length === 0
                          ? 'Sem sementes'
                          : 'Plantar semente'
                    }
                  >
                    <Sprout size={14} />
                    {!canPlant ? 'Já plantou hoje' : 'Plantar'}
                  </button>
                </div>

                {seeds.length === 0 ? (
                  <p style={{ fontSize: 12, color: 'var(--color-bark-700)', margin: 0 }}>
                    Sementes são ganhas quando uma planta sobe de estágio!
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {seeds.map((s) => {
                      const info = FLOWERS[s.flowerType]
                      return (
                        <span
                          key={s.id}
                          style={{
                            background: 'var(--color-leaf-100)',
                            borderRadius: 8,
                            padding: '3px 10px',
                            fontSize: 12,
                            fontWeight: 600,
                            color: 'var(--color-leaf-950)',
                          }}
                        >
                          {info.emoji} {info.name}
                        </span>
                      )
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal de detalhes da planta — fora do overlay */}
      {selectedPlant && (
        <FlowerModal
          plant={selectedPlant}
          uid={uid}
          partnerUid={partnerUid}
          partnerName={partnerName}
          alreadyWatered={alreadyWatered(selectedPlant.id)}
          partnerWatered={partnerWatered(selectedPlant.id)}
          onWater={handleWater}
          onClose={() => setSelectedPlantId(null)}
        />
      )}

      {/* Modal welcome seed */}
      {showWelcomeRoll && (
        <SeedRollModal
          isWelcome
          panicMode={panicMode}
          partnerName={partnerName}
          partnerAlreadyRolled={partnerRolledWelcome}
          iAlreadyRolled={iAlreadyRolledWelcome}
          onRoll={rollForWelcome}
          onClose={() => setSeedRollDone(true)}
        />
      )}

      {/* Modal evento de estágio */}
      {showEventRoll && currentEvent && (
        <SeedRollModal
          eventId={currentEvent.id}
          plantName={currentEvent.plantName}
          newStage={currentEvent.newStage}
          panicMode={panicMode}
          partnerName={partnerName}
          partnerAlreadyRolled={partnerRolledEvent(currentEvent.id)}
          iAlreadyRolled={false}
          onRoll={(roll: number) => rollForEvent(currentEvent.id, roll)}
          onClose={() => setSeedRollDone(true)}
        />
      )}

      {/* Modal de escolha de semente para plantar */}
      {showSeedModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 300,
          }}
          onClick={() => {
            setShowSeedModal(false)
            setPlantingSeed(null)
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--color-bark-100)',
              border: '2px solid var(--color-wood-300)',
              borderRadius: 18,
              padding: '24px',
              width: 320,
              fontFamily: 'Baloo 2, sans-serif',
            }}
          >
            <h3
              style={{
                margin: '0 0 14px',
                fontSize: 17,
                fontWeight: 700,
                color: 'var(--color-leaf-950)',
              }}
            >
              🌱 Escolha uma semente para plantar
            </h3>
            <div className="flex flex-col gap-2 mb-4">
              {seeds.map((s) => {
                const info = FLOWERS[s.flowerType]
                return (
                  <button
                    key={s.id}
                    onClick={() => setPlantingSeed(s)}
                    style={{
                      background: plantingSeed?.id === s.id ? 'var(--color-leaf-100)' : '#fff8f0',
                      border:
                        plantingSeed?.id === s.id
                          ? '2px solid var(--color-leaf-600)'
                          : '1.5px solid var(--color-wood-300)',
                      borderRadius: 10,
                      padding: '8px 14px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontFamily: 'Baloo 2, sans-serif',
                      fontSize: 14,
                      fontWeight: 600,
                      color: 'var(--color-leaf-950)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                    }}
                  >
                    <span style={{ fontSize: 20 }}>{info.emoji}</span>
                    <div>
                      <div>{info.name}</div>
                      <div
                        style={{
                          fontSize: 11,
                          color: 'var(--color-bark-700)',
                          fontWeight: 400,
                          textTransform: 'capitalize',
                        }}
                      >
                        {info.rarity}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
            <div className="flex gap-2" style={{ marginTop: 12 }}>
              <button
                onClick={() => {
                  setShowSeedModal(false)
                  setPlantingSeed(null)
                }}
                style={{
                  flex: 1,
                  padding: '8px 0',
                  borderRadius: 10,
                  background: '#f0e8d8',
                  border: '1.5px solid var(--color-wood-300)',
                  color: 'var(--color-bark-700)',
                  fontFamily: 'Baloo 2, sans-serif',
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: 'pointer',
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handlePlant}
                disabled={!plantingSeed}
                style={{
                  flex: 1,
                  padding: '8px 0',
                  borderRadius: 10,
                  background: plantingSeed ? 'var(--color-leaf-600)' : '#ccc',
                  border: 'none',
                  color: '#fff',
                  fontFamily: 'Baloo 2, sans-serif',
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: plantingSeed ? 'pointer' : 'default',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                }}
              >
                <Sprout size={14} />
                Plantar
              </button>
            </div>
          </div>
        </div>
      )}
      {showExchangeModal && (
        <SeedExchangeModal seeds={seeds} onClose={() => setShowExchangeModal(false)} />
      )}
    </>
  )
}
