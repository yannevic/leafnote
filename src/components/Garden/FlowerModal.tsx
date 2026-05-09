import { X, Droplets, Droplet } from 'lucide-react'
import {
  PlantData,
  FLOWERS,
  RARITY_COLORS,
  FlowerType,
  FLOWER_SELL_VALUE,
  DAYS_PER_STAGE,
} from '../../lib/garden'
import { getFlowerImage } from '../../assets/garden'
import { useState } from 'react'
import { TbPlant2 } from 'react-icons/tb'

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
}: FlowerModalProps) {
  const info = FLOWERS[plant.flowerType]
  const imgSrc = getFlowerImage(plant.flowerType, plant.stage)
  const rarityColor = RARITY_COLORS[info.rarity]
  const isFullyGrown = plant.stage >= 5
  const [sellDone, setSellDone] = useState(false)
  const [removeDone, setRemoveDone] = useState(false)
  const [confirmRemove, setConfirmRemove] = useState(false)
  const [earnedCoins, setEarnedCoins] = useState<number | null>(null)

  const handleSell = async () => {
    const value = await onSellFlower(plant.id, plant.flowerType)
    setEarnedCoins(value)
    setSellDone(true)
  }

  const handleRemove = async () => {
    await onRemovePlant(plant.id)
    setRemoveDone(true)
  }

  const stageLabels: Record<number, string> = {
    1: 'Semente 🌱',
    2: 'Broto 🌿',
    3: 'Jovem 🌾',
    4: 'Adulta 🌷',
    5: 'Florescida 🌸',
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.45)',
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
          borderRadius: 20,
          padding: '28px 36px',
          width: 380,
          boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
          fontFamily: 'Baloo 2, sans-serif',
          position: 'relative',
        }}
      >
        {/* Fechar */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--color-bark-700)',
          }}
        >
          <X size={18} />
        </button>

        {/* Imagem */}
        {/* Nome e raridade */}
        <div className="text-center mb-3">
          <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-leaf-950)', margin: 0 }}>
            <span
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
            >
              <TbPlant2 size={18} color={RARITY_COLOR[info.rarity]} />
              {info.name}
            </span>
          </h2>
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: rarityColor,
              textTransform: 'capitalize',
              letterSpacing: 1,
            }}
          >
            {info.rarity}
          </span>
        </div>

        {/* Imagem */}
        <div className="flex justify-center mb-8">
          <img
            src={imgSrc}
            alt={info.name}
            style={{
              height: 140,
              objectFit: 'contain',
              filter: plant.wilted ? 'grayscale(100%) brightness(0.7)' : 'none',
            }}
          />
        </div>

        {/* Estágio */}
        <div
          style={{
            background: 'var(--color-leaf-100)',
            borderRadius: 10,
            padding: isFullyGrown ? '8px 14px' : '10px 14px',
            marginBottom: 12,
            marginTop: 16,
          }}
        >
          <div
            style={{
              fontWeight: 700,
              fontSize: 14,
              color: 'var(--color-leaf-950)',
              marginBottom: isFullyGrown ? 0 : 8,
              textAlign: 'center',
            }}
          >
            Estágio {plant.stage} — {stageLabels[plant.stage] ?? ''}
          </div>
          {!isFullyGrown && (
            <>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: 11,
                  color: 'var(--color-leaf-600)',
                  marginBottom: 4,
                }}
              >
                <span>Dias regados</span>
                <span>
                  {plant.daysWatered % DAYS_PER_STAGE[info.rarity]}/{DAYS_PER_STAGE[info.rarity]}
                </span>
              </div>
              <div
                style={{ background: '#d4e8d4', borderRadius: 999, height: 8, overflow: 'hidden' }}
              >
                <div
                  style={{
                    height: '100%',
                    borderRadius: 999,
                    background: '#5b9bd5',
                    width: `${((plant.daysWatered % DAYS_PER_STAGE[info.rarity]) / DAYS_PER_STAGE[info.rarity]) * 100}%`,
                    transition: 'width 0.4s ease',
                  }}
                />
              </div>
            </>
          )}
          {plant.wilted && (
            <div
              style={{
                fontWeight: 600,
                fontSize: 13,
                color: '#b05050',
                textAlign: 'center',
                marginTop: 6,
              }}
            >
              Murcha — regue para recuperar
            </div>
          )}
        </div>

        {/* Status de rega */}
        {!isFullyGrown && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
            <div
              style={{
                flex: 1,
                textAlign: 'center',
                padding: '8px',
                borderRadius: 10,
                background: alreadyWatered ? '#a8d8a8' : '#e8d8c0',
                color: alreadyWatered ? '#2d5a2d' : '#7a5a30',
                fontWeight: 700,
                fontSize: 13,
                border: `2px solid ${alreadyWatered ? '#7fb87f' : '#c4956a'}`,
              }}
            >
              <Droplet size={13} style={{ display: 'inline', marginRight: 4 }} /> Você{' '}
              {alreadyWatered ? '✓' : '—'}
            </div>
            <div
              style={{
                flex: 1,
                textAlign: 'center',
                padding: '8px',
                borderRadius: 10,
                background: partnerWatered ? '#a8d8a8' : '#e8d8c0',
                color: partnerWatered ? '#2d5a2d' : '#7a5a30',
                fontWeight: 700,
                fontSize: 13,
                border: `2px solid ${partnerWatered ? '#7fb87f' : '#c4956a'}`,
              }}
            >
              <Droplet size={13} style={{ display: 'inline', marginRight: 4 }} /> {partnerName}{' '}
              {partnerWatered ? '✓' : '—'}
            </div>
          </div>
        )}

        {/* Botão regar */}
        {!isFullyGrown && !alreadyWatered && (
          <button
            onClick={onWater}
            style={{
              width: '100%',
              padding: '10px 0',
              borderRadius: 12,
              background: 'var(--color-leaf-600)',
              color: '#fff',
              fontFamily: 'Baloo 2, sans-serif',
              fontWeight: 700,
              fontSize: 15,
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            <Droplets size={16} />
            Regar
          </button>
        )}
        {!isFullyGrown && alreadyWatered && (
          <div
            style={{
              textAlign: 'center',
              fontSize: 13,
              color: 'var(--color-leaf-600)',
              fontWeight: 600,
            }}
          >
            Você já regou hoje!
          </div>
        )}
        {isFullyGrown && !sellDone && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div
              style={{
                textAlign: 'center',
                fontSize: 13,
                color: 'var(--color-leaf-600)',
                fontWeight: 700,
              }}
            >
              Totalmente florescida
            </div>
            <button
              onClick={handleSell}
              style={{
                width: '100%',
                padding: '10px 0',
                borderRadius: 12,
                background: '#8b6914',
                color: '#fff',
                fontFamily: 'Baloo 2, sans-serif',
                fontWeight: 700,
                fontSize: 14,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Vender — {FLOWER_SELL_VALUE[info.rarity]} moedas
            </button>
          </div>
        )}

        {isFullyGrown && sellDone && (
          <div
            style={{
              textAlign: 'center',
              fontSize: 14,
              color: '#2d5a2d',
              fontWeight: 700,
              padding: '10px 0',
            }}
          >
            +{earnedCoins} moedas recebidas!
          </div>
        )}

        {!isFullyGrown && !confirmRemove && !removeDone && (
          <button
            onClick={() => setConfirmRemove(true)}
            style={{
              width: '100%',
              marginTop: 8,
              padding: '7px 0',
              borderRadius: 12,
              background: 'none',
              color: '#b05050',
              fontFamily: 'Baloo 2, sans-serif',
              fontWeight: 600,
              fontSize: 13,
              border: '1.5px solid #e8a0a0',
              cursor: 'pointer',
            }}
          >
            Arrancar planta
          </button>
        )}

        {!isFullyGrown && confirmRemove && !removeDone && (
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button
              onClick={() => setConfirmRemove(false)}
              style={{
                flex: 1,
                padding: '7px 0',
                borderRadius: 12,
                background: 'none',
                border: '1.5px solid var(--color-wood-300)',
                color: 'var(--color-bark-700)',
                fontFamily: 'Baloo 2, sans-serif',
                fontWeight: 600,
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              Cancelar
            </button>
            <button
              onClick={handleRemove}
              style={{
                flex: 1,
                padding: '7px 0',
                borderRadius: 12,
                background: '#b05050',
                border: 'none',
                color: '#fff',
                fontFamily: 'Baloo 2, sans-serif',
                fontWeight: 700,
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              Confirmar
            </button>
          </div>
        )}

        {!isFullyGrown && removeDone && (
          <div
            style={{
              textAlign: 'center',
              fontSize: 13,
              color: '#b05050',
              fontWeight: 600,
              padding: '8px 0',
            }}
          >
            Planta removida.
          </div>
        )}
      </div>
    </div>
  )
}
