import { useState } from 'react'
import { PiMoneyWavyLight } from 'react-icons/pi'
import { TbPlant2 } from 'react-icons/tb'
import {
  ChevronLeft,
  ChevronRight,
  Sprout,
  X,
  AlertTriangle,
  Leaf,
  ArrowLeftRight,
  HelpCircle,
} from 'lucide-react'
import GardenGuideModal from './GardenGuideModal'
import SeedExchangeModal from './SeedExchangeModal'
import { useGarden } from '../../hooks/useGarden'
import { FLOWERS, SeedData, SEED_SELL_VALUE, FlowerType } from '../../lib/garden'
import SlotUpgradeModal from './SlotUpgradeModal'
import Plant from './Plant'
import FlowerModal from './FlowerModal'
import SeedRollModal from './SeedRollModal'
import { bgCartoon } from '../../assets/garden'

interface GardenViewProps {
  uid: string
  partnerUid: string
  partnerName: string
  onClose: () => void
  onUnlockAchievement?: (id: string) => void
}

const RARITY_COLOR: Record<string, string> = {
  comum: '#3d7a3d',
  incomum: '#8b6914',
  rara: '#c87090',
  epica: '#7a3040',
}

const PLANTS_PER_PAGE = 4

export default function GardenView({
  uid,
  partnerUid,
  partnerName,
  onClose,
  onUnlockAchievement,
}: GardenViewProps) {
  const {
    plants,
    seeds,
    loading,
    coins,
    water,
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
    sellSeed,
    sellFlower,
    removePlant,
    maxPlants,
    buySlot,
  } = useGarden(uid, partnerUid)

  const [page, setPage] = useState(0)
  const [selectedPlantId, setSelectedPlantId] = useState<string | null>(null)
  const [showSeedModal, setShowSeedModal] = useState(false)
  const [plantingSeed, setPlantingSeed] = useState<SeedData | null>(null)
  const [closedEventIds, setClosedEventIds] = useState<string[]>([])
  const [showExchangeModal, setShowExchangeModal] = useState(false)
  const [showGuideModal, setShowGuideModal] = useState(false)
  const [showSlotModal, setShowSlotModal] = useState(false)
  const [sellFeedback, setSellFeedback] = useState<string | null>(null)

  const totalPages = Math.max(1, Math.ceil(plants.length / PLANTS_PER_PAGE))
  const visiblePlants = plants.slice(page * PLANTS_PER_PAGE, (page + 1) * PLANTS_PER_PAGE)
  const selectedPlant = plants.find((p) => p.id === selectedPlantId) ?? null
  const selectedPlantIndex = plants.findIndex((p) => p.id === selectedPlantId)

  const hasSpace = plants.length < maxPlants

  // Label e estado do botão plantar
  const plantBtnDisabled = seeds.length === 0 || !hasSpace || !canPlant
  const plantBtnLabel = !hasSpace
    ? 'sem espaços disponíveis'
    : !canPlant
      ? 'você já plantou hoje'
      : 'plantar'

  const handleWater = async () => {
    if (!selectedPlantId) return
    await water(selectedPlantId)
  }

  const handlePlant = async () => {
    if (!plantingSeed || !hasSpace || !canPlant) return
    await plant(plantingSeed.id, plantingSeed.flowerType)
    setPlantingSeed(null)
    setShowSeedModal(false)
  }

  // plant vem do hook mas não estava desestruturado — adicionamos aqui
  const { plant } = useGarden(uid, partnerUid)

  const [confirmSellSeed, setConfirmSellSeed] = useState<SeedData | null>(null)

  const handleSellSeed = async (seed: SeedData) => {
    setConfirmSellSeed(seed)
  }

  const handleConfirmSellSeed = async () => {
    if (!confirmSellSeed) return
    const value = await sellSeed(confirmSellSeed.id, confirmSellSeed.flowerType)
    onUnlockAchievement?.('first_sell')
    setSellFeedback(`+${value} moedas`)
    setConfirmSellSeed(null)
    setTimeout(() => setSellFeedback(null), 2000)
  }

  const handleSellFlower = async (plantId: string, flowerType: FlowerType) => {
    const value = await sellFlower(plantId, flowerType)
    onUnlockAchievement?.('first_sell')
    setSellFeedback(`+${value} moedas`)
    setSelectedPlantId(null)
    setTimeout(() => setSellFeedback(null), 2000)
    return value
  }

  const handleRemovePlant = async (plantId: string) => {
    await removePlant(plantId)
    setSelectedPlantId(null)
  }

  const showWelcomeRoll = welcomePending
  const showEventRoll =
    !showWelcomeRoll && currentEvent != null && !closedEventIds.includes(currentEvent.id)

  const handleCloseEventRoll = () => {
    if (currentEvent) {
      setClosedEventIds((prev) => [...prev, currentEvent.id])
    }
  }

  return (
    <>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(44,20,8,0.35)',
          backdropFilter: 'blur(4px)',
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
            background:
              'linear-gradient(160deg, rgba(253,246,240,0.97) 0%, rgba(252,232,238,0.97) 100%)',
            border: '1.5px solid rgba(232,160,176,0.4)',
            borderRadius: 20,
            width: 600,
            maxWidth: '95vw',
            padding: '24px 24px 20px',
            fontFamily: 'Baloo 2, sans-serif',
            boxShadow: '0 8px 40px rgba(200,120,140,0.2), inset 0 1px 0 rgba(255,255,255,0.6)',
            backdropFilter: 'blur(18px) saturate(1.4)',
            position: 'relative',
          }}
        >
          {/* Cabeçalho */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 7,
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <h2
                style={{
                  margin: 0,
                  fontSize: 16,
                  fontWeight: 800,
                  color: '#3d1a10',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontFamily: 'Baloo 2, sans-serif',
                }}
              >
                <Leaf size={16} strokeWidth={2} style={{ color: 'rgba(122,48,64,0.6)' }} /> jardim
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    color: 'rgba(122,48,64,0.45)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.6px',
                  }}
                >
                  {plants.length}/{maxPlants}
                </span>
              </h2>
            </div>

            {/* Botões do cabeçalho: guia, troca, pânico, fechar, moedas */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button
                onClick={() => setShowSlotModal(true)}
                title="expandir jardim"
                style={{
                  background: 'rgba(200,120,140,0.15)',
                  border: 'none',
                  borderRadius: 8,
                  width: 28,
                  height: 28,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  padding: 0,
                  fontSize: 16,
                  fontWeight: 800,
                  color: 'rgba(122,48,64,0.6)',
                  lineHeight: 1,
                }}
              >
                +
              </button>

              <button
                onClick={() => setShowGuideModal(true)}
                title="como funciona o jardim?"
                style={{
                  background: 'rgba(200,120,140,0.15)',
                  border: 'none',
                  borderRadius: 8,
                  width: 28,
                  height: 28,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                <HelpCircle size={13} color="rgba(122,48,64,0.6)" strokeWidth={2} />
              </button>

              <button
                onClick={() => setShowExchangeModal(true)}
                title="trocar sementes"
                style={{
                  background: 'rgba(200,120,140,0.15)',
                  border: 'none',
                  borderRadius: 8,
                  width: 28,
                  height: 28,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                <ArrowLeftRight size={13} color="rgba(122,48,64,0.6)" strokeWidth={2} />
              </button>

              <button
                onClick={togglePanic}
                title={
                  panicMode ? 'modo pânico ativo — clique para desativar' : 'ativar modo pânico'
                }
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  border: 'none',
                  background: 'rgba(200,120,140,0.15)',
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                <AlertTriangle
                  size={13}
                  strokeWidth={2}
                  color={panicMode ? '#e8607a' : 'rgba(122,48,64,0.6)'}
                />
              </button>

              {/* Moedas — último item */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  background: 'rgba(253,242,246,0.7)',
                  border: '1.5px solid rgba(232,160,176,0.35)',
                  borderRadius: 10,
                  padding: '4px 10px',
                }}
              >
                <PiMoneyWavyLight size={15} color="rgba(122,48,64,0.6)" />
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 800,
                    color: '#3d1a10',
                    fontFamily: 'Baloo 2, sans-serif',
                  }}
                >
                  {coins}
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
                  border: '1.5px solid rgba(232,160,176,0.35)',
                  borderRadius: 14,
                  padding: '16px 8px 12px',
                  marginBottom: 16,
                  minHeight: 280,
                  overflow: 'hidden',
                  background: 'rgba(253,242,246,0.4)',
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
                      <Sprout size={40} />
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
                  background: 'rgba(253,242,246,0.7)',
                  border: '1.5px solid rgba(232,160,176,0.3)',
                  borderRadius: 12,
                  padding: '12px 14px',
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    style={{
                      fontWeight: 800,
                      fontSize: 11,
                      color: 'rgba(122,48,64,0.55)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.8px',
                      fontFamily: 'Baloo 2, sans-serif',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 5,
                    }}
                  >
                    <Sprout size={12} strokeWidth={2} color="rgba(122,48,64,0.55)" /> sementes (
                    {seeds.length})
                  </span>

                  <button
                    onClick={() => setShowSeedModal(true)}
                    disabled={plantBtnDisabled}
                    style={{
                      background: !plantBtnDisabled
                        ? 'rgba(232,160,176,0.55)'
                        : 'rgba(232,160,176,0.2)',
                      color: !plantBtnDisabled ? '#3d1a10' : 'rgba(61,26,16,0.35)',
                      border: 'none',
                      borderRadius: 10,
                      padding: '5px 14px',
                      fontSize: 12,
                      fontWeight: 800,
                      cursor: !plantBtnDisabled ? 'pointer' : 'default',
                      fontFamily: 'Baloo 2, sans-serif',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                    title={plantBtnLabel}
                  >
                    <Sprout size={14} />
                    {plantBtnLabel}
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
                        <div
                          key={s.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            background: 'var(--color-leaf-100)',
                            borderRadius: 8,
                            padding: '3px 6px 3px 8px',
                            fontSize: 12,
                            fontWeight: 600,
                            color: 'var(--color-leaf-950)',
                          }}
                        >
                          <TbPlant2
                            size={14}
                            color={RARITY_COLOR[info.rarity]}
                            style={{ flexShrink: 0 }}
                          />
                          {info.name}
                          <button
                            onClick={() => handleSellSeed(s)}
                            title={`Vender por ${SEED_SELL_VALUE[info.rarity]} moedas`}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              color: '#8b6914',
                              fontSize: 10,
                              fontWeight: 700,
                              fontFamily: 'Baloo 2, sans-serif',
                              padding: '1px 4px',
                            }}
                          >
                            vender
                          </button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal de detalhes da planta */}
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
          onSellFlower={handleSellFlower}
          onRemovePlant={handleRemovePlant}
          hasPrev={selectedPlantIndex > 0}
          hasNext={selectedPlantIndex < plants.length - 1}
          onPrev={() => setSelectedPlantId(plants[selectedPlantIndex - 1]?.id ?? null)}
          onNext={() => setSelectedPlantId(plants[selectedPlantIndex + 1]?.id ?? null)}
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
          onClose={() => {
            /* welcome não fecha manualmente */
          }}
        />
      )}

      {/* Modal evento de estágio */}
      {showEventRoll && currentEvent && (
        <SeedRollModal
          key={currentEvent.id}
          eventId={currentEvent.id}
          plantName={currentEvent.plantName}
          newStage={currentEvent.newStage}
          panicMode={panicMode}
          partnerName={partnerName}
          partnerAlreadyRolled={partnerRolledEvent(currentEvent.id)}
          iAlreadyRolled={false}
          onRoll={(roll: number) => rollForEvent(currentEvent.id, roll)}
          onClose={handleCloseEventRoll}
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
              background:
                'linear-gradient(160deg, rgba(253,246,240,0.97) 0%, rgba(252,232,238,0.97) 100%)',
              border: '1.5px solid rgba(232,160,176,0.4)',
              borderRadius: 20,
              padding: '24px',
              width: 320,
              fontFamily: 'Baloo 2, sans-serif',
              boxShadow: '0 8px 40px rgba(200,120,140,0.2)',
            }}
          >
            <h3
              style={{
                margin: '0 0 14px',
                fontSize: 15,
                fontWeight: 800,
                color: '#3d1a10',
                fontFamily: 'Baloo 2, sans-serif',
              }}
            >
              escolha uma semente para plantar
            </h3>
            <style>{`
              .seed-list::-webkit-scrollbar { width: 4px; }
              .seed-list::-webkit-scrollbar-track { background: transparent; }
              .seed-list::-webkit-scrollbar-thumb { background: rgba(232,160,176,0.55); border-radius: 99px; }
              .seed-list::-webkit-scrollbar-thumb:hover { background: rgba(232,160,176,0.99); }
            `}</style>
            <div
              className="seed-list flex flex-col gap-2 mb-4"
              style={{
                maxHeight: 260,
                overflowY: 'auto',
                paddingRight: 4,
              }}
            >
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
                    <TbPlant2
                      size={16}
                      color={RARITY_COLOR[info.rarity]}
                      style={{ flexShrink: 0 }}
                    />
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
                  background: 'transparent',
                  border: '1.5px solid rgba(232,160,176,0.4)',
                  color: 'rgba(61,26,16,0.5)',
                  fontFamily: 'Baloo 2, sans-serif',
                  fontWeight: 800,
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                cancelar
              </button>
              <button
                onClick={handlePlant}
                disabled={!plantingSeed}
                style={{
                  flex: 1,
                  padding: '8px 0',
                  borderRadius: 10,
                  background: plantingSeed ? 'rgba(232,160,176,0.55)' : 'rgba(232,160,176,0.2)',
                  border: 'none',
                  color: plantingSeed ? '#3d1a10' : 'rgba(61,26,16,0.35)',
                  fontFamily: 'Baloo 2, sans-serif',
                  fontWeight: 800,
                  fontSize: 13,
                  cursor: plantingSeed ? 'pointer' : 'default',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                }}
              >
                <Sprout size={13} strokeWidth={2} /> plantar
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmSellSeed && (
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
          onClick={() => setConfirmSellSeed(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background:
                'linear-gradient(160deg, rgba(253,246,240,0.97) 0%, rgba(252,232,238,0.97) 100%)',
              border: '1.5px solid rgba(232,160,176,0.4)',
              borderRadius: 20,
              padding: '24px 28px',
              fontFamily: 'Baloo 2, sans-serif',
              textAlign: 'center',
              width: 280,
              boxShadow: '0 8px 40px rgba(200,120,140,0.2)',
            }}
          >
            <div
              style={{
                fontSize: 15,
                fontWeight: 800,
                color: '#3d1a10',
                marginBottom: 6,
                fontFamily: 'Baloo 2, sans-serif',
              }}
            >
              vender semente
            </div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: 'rgba(61,26,16,0.6)',
                marginBottom: 18,
                fontFamily: 'Baloo 2, sans-serif',
              }}
            >
              {FLOWERS[confirmSellSeed.flowerType].name} por{' '}
              <strong>{SEED_SELL_VALUE[FLOWERS[confirmSellSeed.flowerType].rarity]} moedas</strong>?
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => setConfirmSellSeed(null)}
                style={{
                  flex: 1,
                  padding: '7px 0',
                  borderRadius: 10,
                  background: 'transparent',
                  border: '1.5px solid rgba(232,160,176,0.4)',
                  color: 'rgba(61,26,16,0.5)',
                  fontFamily: 'Baloo 2, sans-serif',
                  fontWeight: 800,
                  fontSize: 12,
                  cursor: 'pointer',
                }}
              >
                cancelar
              </button>
              <button
                onClick={handleConfirmSellSeed}
                style={{
                  flex: 1,
                  padding: '7px 0',
                  borderRadius: 10,
                  background: 'rgba(232,160,176,0.55)',
                  border: 'none',
                  color: '#3d1a10',
                  fontFamily: 'Baloo 2, sans-serif',
                  fontWeight: 800,
                  fontSize: 12,
                  cursor: 'pointer',
                }}
              >
                vender
              </button>
            </div>
          </div>
        </div>
      )}

      {sellFeedback && (
        <div
          style={{
            position: 'fixed',
            bottom: 32,
            left: '50%',
            transform: 'translateX(-50%)',
            background:
              'linear-gradient(160deg, rgba(253,246,240,0.97) 0%, rgba(252,232,238,0.97) 100%)',
            border: '1.5px solid rgba(232,160,176,0.4)',
            color: '#3d1a10',
            borderRadius: 14,
            padding: '8px 20px',
            fontSize: 13,
            fontWeight: 800,
            fontFamily: 'Baloo 2, sans-serif',
            zIndex: 9999,
            boxShadow: '0 8px 40px rgba(200,120,140,0.2)',
            backdropFilter: 'blur(18px)',
          }}
        >
          {sellFeedback}
        </div>
      )}

      {showExchangeModal && (
        <SeedExchangeModal seeds={seeds} onClose={() => setShowExchangeModal(false)} />
      )}
      {showGuideModal && <GardenGuideModal onClose={() => setShowGuideModal(false)} />}
      {showSlotModal && (
        <SlotUpgradeModal
          currentMax={maxPlants}
          coins={coins}
          onBuy={async () => {
            const result = await buySlot()
            if (result.success) setSellFeedback(`+1 vaso desbloqueado!`)
            return result
          }}
          onClose={() => setShowSlotModal(false)}
        />
      )}
    </>
  )
}
