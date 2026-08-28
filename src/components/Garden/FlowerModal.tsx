import { X, Droplets, Droplet, ChevronLeft, ChevronRight } from 'lucide-react'
import {
  PlantData,
  FLOWERS,
  RARITY_COLORS,
  FlowerType,
  FLOWER_SELL_VALUE,
  DAYS_PER_STAGE,
} from '../../lib/garden'
import { getFlowerImage } from '../../assets/garden'
import { useState, useRef } from 'react'
import { TbPlant2 } from 'react-icons/tb'
import { triggerCoinPopupFromEvent } from '../../lib/coinPopupBus'
import { WATER_REWARD } from '../../lib/economyConfig'

const T = {
  bg: 'linear-gradient(160deg, rgba(253,246,240,0.97) 0%, rgba(252,232,238,0.97) 100%)',
  card: 'rgba(253,242,246,0.7)',
  cardBorder: '1.5px solid rgba(232,160,176,0.3)',
  border: 'rgba(232,160,176,0.4)',
  borderVal: '1.5px solid rgba(232,160,176,0.4)',
  borderDashed: '2px dashed rgba(232,160,176,0.4)',
  shadow: '0 8px 40px rgba(200,120,140,0.2), inset 0 1px 0 rgba(255,255,255,0.6)',
  text: '#3d1a10',
  textSub: 'rgba(61,26,16,0.5)',
  textLabel: 'rgba(122,48,64,0.55)',
  btnPrimary: 'rgba(232,160,176,0.55)',
  btnIcon: 'rgba(200,120,140,0.15)',
  btnPositive: 'rgba(74,122,74,0.15)',
  btnPositiveText: '#4A7A4A',
  btnPositiveBorder: 'rgba(74,122,74,0.35)',
  btnDestructive: 'rgba(232,96,122,0.12)',
  btnDestructiveText: '#e8607a',
  btnDestructiveBorder: 'rgba(232,96,122,0.3)',
}

const RARITY_COLOR: Record<string, string> = {
  comum: '#3d7a3d',
  incomum: '#8b6914',
  rara: '#c87090',
  epica: '#7a3040',
}

interface FlowerModalProps {
  plant: PlantData
  uid: string
  partnerUid: string
  partnerName: string
  alreadyWatered: boolean
  partnerWatered: boolean
  onWater: () => void
  onClose: () => void
  onSellFlower: (plantId: string, flowerType: FlowerType) => Promise<number>
  onRemovePlant: (plantId: string) => Promise<void>
  onPrev?: () => void
  onNext?: () => void
  hasPrev?: boolean
  hasNext?: boolean
}

export default function FlowerModal({
  plant,
  partnerName,
  alreadyWatered,
  partnerWatered,
  onWater,
  onClose,
  onSellFlower,
  onRemovePlant,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
}: FlowerModalProps) {
  const info = FLOWERS[plant.flowerType]
  const imgSrc = getFlowerImage(plant.flowerType, plant.stage)
  const rarityColor = RARITY_COLORS[info.rarity]
  const isFullyGrown = plant.stage >= 5
  const [sellDone, setSellDone] = useState(false)
  const [removeDone, setRemoveDone] = useState(false)
  const [confirmRemove, setConfirmRemove] = useState(false)
  const [earnedCoins, setEarnedCoins] = useState<number | null>(null)
  const [selling, setSelling] = useState(false)
  const sellingRef = useRef(false)
  const wateringRef = useRef(false)
  const [wateringLocked, setWateringLocked] = useState(false)

  const daysNeeded = DAYS_PER_STAGE[info.rarity]
  const daysInStage = plant.daysWatered % daysNeeded
  const progressPct = (daysInStage / daysNeeded) * 100

  const handleSell = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (sellingRef.current) return
    sellingRef.current = true
    setSelling(true)
    const value = await onSellFlower(plant.id, plant.flowerType)
    setEarnedCoins(value)
    setSellDone(true)
    triggerCoinPopupFromEvent(e, value, 'moedas', '#4A7A4A')
  }

  const handleRemove = async () => {
    await onRemovePlant(plant.id)
    setRemoveDone(true)
  }

  const stageLabels: Record<number, string> = {
    1: 'semente',
    2: 'broto',
    3: 'jovem',
    4: 'adulta',
    5: 'florescida',
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(61,26,16,0.35)',
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
          background: T.bg,
          border: T.borderVal,
          borderRadius: 20,
          width: 360,
          maxWidth: '95vw',
          boxShadow: T.shadow,
          backdropFilter: 'blur(18px) saturate(1.4)',
          fontFamily: 'Baloo 2, sans-serif',
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
            padding: '16px 20px',
            borderBottom: T.borderDashed,
            flexShrink: 0,
          }}
        >
          <button
            onClick={onPrev}
            disabled={!hasPrev}
            style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              border: 'none',
              background: hasPrev ? T.btnIcon : 'transparent',
              cursor: hasPrev ? 'pointer' : 'default',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
              flexShrink: 0,
              opacity: hasPrev ? 1 : 0.2,
            }}
          >
            <ChevronLeft size={14} strokeWidth={2.5} color="rgba(122,48,64,0.7)" />
          </button>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              flex: 1,
              justifyContent: 'center',
            }}
          >
            <TbPlant2 size={16} color={RARITY_COLOR[info.rarity]} />
            <span style={{ fontSize: 15, fontWeight: 800, color: T.text }}>{info.name}</span>
            <span
              style={
                info.rarity === 'epica'
                  ? {
                      fontSize: 10,
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '0.7px',
                      background:
                        'linear-gradient(135deg, #ffd700 0%, #ff6ec7 25%, #6ec1ff 50%, #a06eff 75%, #ffd700 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }
                  : {
                      fontSize: 10,
                      fontWeight: 800,
                      color: rarityColor,
                      textTransform: 'uppercase',
                      letterSpacing: '0.7px',
                    }
              }
            >
              {info.rarity}
            </span>
          </div>

          <div style={{ display: 'flex', gap: 4 }}>
            <button
              onClick={onNext}
              disabled={!hasNext}
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                border: 'none',
                background: hasNext ? T.btnIcon : 'transparent',
                cursor: hasNext ? 'pointer' : 'default',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0,
                opacity: hasNext ? 1 : 0.2,
              }}
            >
              <ChevronRight size={14} strokeWidth={2.5} color="rgba(122,48,64,0.7)" />
            </button>
            <button
              onClick={onClose}
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                border: 'none',
                background: T.btnIcon,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0,
                flexShrink: 0,
              }}
            >
              <X size={13} strokeWidth={2.5} color="rgba(122,48,64,0.7)" />
            </button>
          </div>
        </div>

        {/* Conteúdo */}
        <div
          style={{ padding: '20px 20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}
        >
          {/* Imagem */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <img
              src={imgSrc}
              alt={info.name}
              style={{
                height: 130,
                objectFit: 'contain',
                filter: plant.wilted ? 'grayscale(100%) brightness(0.7)' : 'none',
                transition: 'filter 0.3s',
              }}
            />
          </div>

          {/* Estágio + progresso */}
          <div
            style={{
              background: T.card,
              border: T.cardBorder,
              borderRadius: 12,
              padding: '10px 14px',
            }}
          >
            <div
              style={{
                fontWeight: 800,
                fontSize: 13,
                color: T.text,
                textAlign: 'center',
                marginBottom: isFullyGrown ? 0 : 8,
              }}
            >
              estágio {plant.stage} — {stageLabels[plant.stage] ?? ''}
            </div>

            {!isFullyGrown && (
              <>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: 11,
                    fontWeight: 700,
                    color: T.textLabel,
                    marginBottom: 5,
                  }}
                >
                  <span>dias regados</span>
                  <span>
                    {daysInStage}/{daysNeeded}
                  </span>
                </div>
                <div
                  style={{
                    background: 'rgba(232,160,176,0.2)',
                    borderRadius: 999,
                    height: 7,
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      borderRadius: 999,
                      background: 'rgba(232,160,176,0.8)',
                      width: `${progressPct}%`,
                      transition: 'width 0.4s ease',
                    }}
                  />
                </div>
              </>
            )}

            {plant.wilted && (
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 12,
                  color: T.btnDestructiveText,
                  textAlign: 'center',
                  marginTop: 6,
                }}
              >
                murcha — regue para recuperar
              </div>
            )}
          </div>

          {/* Status de rega */}
          {!isFullyGrown && (
            <div style={{ display: 'flex', gap: 7 }}>
              {[
                { label: 'você', watered: alreadyWatered },
                { label: partnerName, watered: partnerWatered },
              ].map((p) => (
                <div
                  key={p.label}
                  style={{
                    flex: 1,
                    textAlign: 'center',
                    padding: '7px 8px',
                    borderRadius: 10,
                    background: p.watered ? 'rgba(74,122,74,0.12)' : T.card,
                    color: p.watered ? T.btnPositiveText : T.textSub,
                    fontWeight: 800,
                    fontSize: 12,
                    border: `1.5px solid ${p.watered ? T.btnPositiveBorder : T.border}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 5,
                  }}
                >
                  <Droplet size={12} strokeWidth={2} />
                  {p.label} {p.watered ? '✓' : '—'}
                </div>
              ))}
            </div>
          )}

          {/* Botão regar */}
          {!isFullyGrown && !alreadyWatered && !wateringLocked && (
            <button
              onClick={(e) => {
                if (wateringRef.current) return
                wateringRef.current = true
                setWateringLocked(true)
                onWater()
                triggerCoinPopupFromEvent(e, WATER_REWARD, 'moedas', '#4A7A4A')
              }}
              style={{
                width: '100%',
                padding: '10px 0',
                borderRadius: 12,
                background: T.btnPrimary,
                color: T.text,
                fontFamily: 'Baloo 2, sans-serif',
                fontWeight: 800,
                fontSize: 14,
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 7,
              }}
            >
              <Droplets size={15} strokeWidth={2} /> regar
            </button>
          )}

          {!isFullyGrown && alreadyWatered && (
            <div
              style={{
                textAlign: 'center',
                fontSize: 12,
                fontWeight: 700,
                color: T.btnPositiveText,
              }}
            >
              você já regou hoje!
            </div>
          )}

          {/* Florescida — vender */}
          {isFullyGrown && !sellDone && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div
                style={{
                  textAlign: 'center',
                  fontSize: 12,
                  fontWeight: 800,
                  color: T.btnPositiveText,
                }}
              >
                totalmente florescida
              </div>
              <button
                onClick={handleSell}
                disabled={selling}
                style={{
                  opacity: selling ? 0.6 : 1,
                  cursor: selling ? 'default' : 'pointer',
                  width: '100%',
                  padding: '10px 0',
                  borderRadius: 12,
                  background: T.btnPositive,
                  color: T.btnPositiveText,
                  fontFamily: 'Baloo 2, sans-serif',
                  fontWeight: 800,
                  fontSize: 13,
                  border: `1.5px solid ${T.btnPositiveBorder}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                }}
              >
                vender — {FLOWER_SELL_VALUE[info.rarity]} moedas
              </button>
            </div>
          )}

          {isFullyGrown && sellDone && (
            <div
              style={{
                textAlign: 'center',
                fontSize: 13,
                fontWeight: 800,
                color: T.btnPositiveText,
                padding: '6px 0',
              }}
            >
              +{earnedCoins} moedas recebidas!
            </div>
          )}

          {/* Arrancar planta */}
          {!isFullyGrown && !confirmRemove && !removeDone && (
            <button
              onClick={() => setConfirmRemove(true)}
              style={{
                width: '100%',
                padding: '7px 0',
                borderRadius: 12,
                background: 'transparent',
                color: T.btnDestructiveText,
                fontFamily: 'Baloo 2, sans-serif',
                fontWeight: 800,
                fontSize: 12,
                border: `1.5px solid ${T.btnDestructiveBorder}`,
                cursor: 'pointer',
              }}
            >
              arrancar planta
            </button>
          )}

          {!isFullyGrown && confirmRemove && !removeDone && (
            <div
              style={{
                background: T.btnDestructive,
                border: `1.5px solid ${T.btnDestructiveBorder}`,
                borderRadius: 12,
                padding: '10px 14px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <span style={{ fontSize: 12, fontWeight: 700, color: T.btnDestructiveText }}>
                arrancar mesmo?
              </span>
              <div style={{ display: 'flex', gap: 7, width: '100%' }}>
                <button
                  onClick={() => setConfirmRemove(false)}
                  style={{
                    flex: 1,
                    padding: '6px 0',
                    borderRadius: 10,
                    background: 'transparent',
                    border: T.borderVal,
                    color: T.textSub,
                    fontFamily: 'Baloo 2, sans-serif',
                    fontWeight: 800,
                    fontSize: 12,
                    cursor: 'pointer',
                  }}
                >
                  cancelar
                </button>
                <button
                  onClick={handleRemove}
                  style={{
                    flex: 1,
                    padding: '6px 0',
                    borderRadius: 10,
                    background: T.btnDestructive,
                    border: `1.5px solid ${T.btnDestructiveBorder}`,
                    color: T.btnDestructiveText,
                    fontFamily: 'Baloo 2, sans-serif',
                    fontWeight: 800,
                    fontSize: 12,
                    cursor: 'pointer',
                  }}
                >
                  arrancar
                </button>
              </div>
            </div>
          )}

          {!isFullyGrown && removeDone && (
            <div
              style={{
                textAlign: 'center',
                fontSize: 12,
                fontWeight: 700,
                color: T.btnDestructiveText,
                padding: '4px 0',
              }}
            >
              planta removida.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
