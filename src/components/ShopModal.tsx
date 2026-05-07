// ─────────────────────────────────────────────────────────────────────────────
// ShopModal.tsx — v2
// Fixes: sem cadeado, imagens corretas, seções agrupadas, manequim de roupas
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react'
import { ShoppingBag, ChevronLeft, Home, Shirt, X } from 'lucide-react'
import { useShop, getCharacterShopPieces, type BuyResult } from '../hooks/useShop'
import {
  SHOP_HOUSE_ITEMS,
  HOUSE_TILE_MAP,
  getDiscountedCost,
  isAvailableToday,
  type ShopItem,
} from '../shop/shopPrices'
import { ALL_PIECES, type CharacterPiece, LAYER_ORDER } from '../assets/character/index'
import coinIcon from '../assets/coin.png'

// ─────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────

type MainTab = 'casa' | 'roupas'
type HouseSubTab = 'floor' | 'wall' | 'background'

interface ConfirmState {
  item: ShopItem | null
  piece: CharacterPiece | null
  open: boolean
  isCart?: boolean
}
// ─────────────────────────────────────────────
// SHEET COLS — quantas colunas cada spritesheet tem
// Necessário para backgroundSize correto
// ─────────────────────────────────────────────

const SHEET_COLS: Record<string, number> = {
  // floors
  'base floor/black and white.png': 4,
  'base floor/carpet spritesheet.png': 4,
  'base floor/chckerboard spritesheet.png': 4,
  'base floor/cobblestone spritesheet.png': 2,
  'base floor/pebbles spritesheet.png': 2,
  'base floor/stone square spritesheet.png': 5,
  'base floor/wood spritesheet.png': 3,
  'floor (tiles)/cut_floor_blue.png': 3,
  'floor (tiles)/cut_floor_green.png': 3,
  'floor (tiles)/cut_floor_orange.png': 3,
  'floor (tiles)/cut_floor_pink.png': 3,
  'floor (tiles)/cut_floor_violet.png': 3,
  // walls
  'base walls/BASE_WHITE_WALL.png': 1,
  'base walls/walls_paint_pastel.png': 4,
  'base walls/walls_paint_earthy.png': 4,
  'base walls/walls_paint_bright.png': 4,
  'base walls/walls_paint_grey.png': 4,
  'base walls/walls_paint_pastel_stripes.png': 4,
  'base walls/walls_paint_earthy_stripes.png': 4,
  'base walls/walls_paint_bright_stripes.png': 4,
  'base walls/walls_paint_grey_stripes.png': 4,
  'base walls/spritesheet(10).png': 3,
  'base walls/spritesheet(11).png': 5,
  'base walls/spritesheet(12).png': 5,
  'base walls/spritesheet(13).png': 5,
  'base walls/spritesheet(14).png': 5,
  'walls (tiles)/cutie blue pastels.png': 4,
  'walls (tiles)/cutie green pastels.png': 4,
  'walls (tiles)/cutie orange pastels.png': 4,
  'walls (tiles)/cutie pink pastels.png': 4,
  'walls (tiles)/cutie violet pastels.png': 4,
}

// ─────────────────────────────────────────────
// SEÇÕES da loja — agrupamento visual
// ─────────────────────────────────────────────

interface ShopSection {
  label: string
  ids: string[]
  cute?: boolean
}

function getFloorSections(): ShopSection[] {
  return [
    {
      label: 'Carpete',
      ids: SHOP_HOUSE_ITEMS.filter(
        (i) => i.category === 'floor' && i.id.startsWith('floor_carpet_')
      ).map((i) => i.id),
    },
    {
      label: 'Xadrez',
      ids: SHOP_HOUSE_ITEMS.filter(
        (i) => i.category === 'floor' && i.id.startsWith('floor_checker_')
      ).map((i) => i.id),
    },
    {
      label: 'Preto & Branco',
      ids: SHOP_HOUSE_ITEMS.filter(
        (i) => i.category === 'floor' && i.id.startsWith('floor_bw_')
      ).map((i) => i.id),
    },
    {
      label: 'Madeira',
      ids: SHOP_HOUSE_ITEMS.filter(
        (i) => i.category === 'floor' && i.id.startsWith('floor_wood_')
      ).map((i) => i.id),
    },
    {
      label: 'Pedra',
      ids: SHOP_HOUSE_ITEMS.filter(
        (i) =>
          i.category === 'floor' &&
          (i.id.startsWith('floor_stone_') ||
            i.id.startsWith('floor_cobble_') ||
            i.id.startsWith('floor_pebble_'))
      ).map((i) => i.id),
    },
    {
      label: 'Cute Decor ✦',
      cute: true,
      ids: SHOP_HOUSE_ITEMS.filter(
        (i) => i.category === 'floor' && i.id.startsWith('floor_cute_')
      ).map((i) => i.id),
    },
  ].filter((s) => s.ids.length > 0)
}

function getWallSections(): ShopSection[] {
  return [
    {
      label: 'Tinta lisa',
      ids: SHOP_HOUSE_ITEMS.filter(
        (i) => i.category === 'wall' && i.id.startsWith('wall_paint_')
      ).map((i) => i.id),
    },
    {
      label: 'Tinta listrada',
      ids: SHOP_HOUSE_ITEMS.filter(
        (i) => i.category === 'wall' && i.id.startsWith('wall_stripes_')
      ).map((i) => i.id),
    },
    {
      label: 'Tijolo',
      ids: SHOP_HOUSE_ITEMS.filter(
        (i) => i.category === 'wall' && i.id.startsWith('wall_brick_')
      ).map((i) => i.id),
    },
    {
      label: 'Azulejo xadrez',
      ids: SHOP_HOUSE_ITEMS.filter(
        (i) => i.category === 'wall' && i.id.startsWith('wall_tile_checker_')
      ).map((i) => i.id),
    },
    {
      label: 'Pedra',
      ids: SHOP_HOUSE_ITEMS.filter(
        (i) => i.category === 'wall' && i.id.startsWith('wall_stone_')
      ).map((i) => i.id),
    },
    {
      label: 'Madeira ornada',
      ids: SHOP_HOUSE_ITEMS.filter(
        (i) => i.category === 'wall' && i.id.startsWith('wall_wood_ornate_')
      ).map((i) => i.id),
    },
    {
      label: 'Madeira simples',
      ids: SHOP_HOUSE_ITEMS.filter(
        (i) => i.category === 'wall' && i.id.startsWith('wall_wood_simple_')
      ).map((i) => i.id),
    },
    {
      label: 'Branca',
      ids: SHOP_HOUSE_ITEMS.filter((i) => i.category === 'wall' && i.id === 'wall_white').map(
        (i) => i.id
      ),
    },
    {
      label: 'Cute Decor ✦',
      cute: true,
      ids: SHOP_HOUSE_ITEMS.filter(
        (i) => i.category === 'wall' && i.id.startsWith('wall_cute_')
      ).map((i) => i.id),
    },
  ].filter((s) => s.ids.length > 0)
}

function getCharSections(): { label: string; key: string }[] {
  return [
    { key: 'body', label: 'Corpo' },
    { key: 'hair', label: 'Cabelo' },
    { key: 'hair_back', label: 'Cabelo (trás)' },
    { key: 'bangs', label: 'Franja' },
    { key: 'mouth', label: 'Boca' },
    { key: 'eyebrows', label: 'Sobrancelhas' },
    { key: 'eyelashes', label: 'Cílios' },
    { key: 'pupils', label: 'Pupilas' },
    { key: 'top', label: 'Parte de cima' },
    { key: 'bottom', label: 'Parte de baixo' },
    { key: 'dress', label: 'Vestido' },
    { key: 'shoes', label: 'Sapatos' },
    { key: 'jaqueta', label: 'Jaquetas' },
    { key: 'gloves', label: 'Luvas' },
    { key: 'accessory', label: 'Acessórios' },
    { key: 'accessory_cima', label: 'Acessórios (cima)' },
    { key: 'accessory_topo', label: 'Acessórios (topo)' },
    { key: 'tattoo', label: 'Tattoo / Bronzeado' },
    { key: 'beard', label: 'Barba' },
    { key: 'hair_bonus', label: 'Enfeite de cabelo' },
    { key: 'saia_costas', label: 'Saia (costas)' },
    { key: 'saia_top', label: 'Saia (topo)' },
  ]
}

// ─────────────────────────────────────────────
// THUMBNAIL — tile da casinha
// ─────────────────────────────────────────────

function HouseThumbnail({ itemId, isFloor }: { itemId: string; isFloor: boolean }) {
  const tile = HOUSE_TILE_MAP[itemId]

  if (!tile || tile.sheet.startsWith('bg_')) {
    const bgColors: Record<string, string> = {
      bg_sky: 'linear-gradient(160deg,#b8dff7 0%,#e8f4fd 100%)',
      bg_forest: 'linear-gradient(160deg,#7fb87f 0%,#c8e6c8 100%)',
      bg_night: 'linear-gradient(160deg,#1a1a3e 0%,#2d2d6b 100%)',
      bg_sunset: 'linear-gradient(160deg,#f97316 0%,#fde68a 100%)',
      bg_indoor: 'linear-gradient(160deg,#d4a574 0%,#f5e6d3 100%)',
    }
    return (
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: 8,
          background: bgColors[itemId] ?? '#e5e7eb',
          flexShrink: 0,
        }}
      />
    )
  }

  const tileW = isFloor ? 80 : 52
  const tileH = isFloor ? 40 : 78
  const cols = SHEET_COLS[tile.sheet] ?? 4

  return (
    <div
      style={{
        width: tileW,
        height: tileH,
        flexShrink: 0,
        borderRadius: 6,
        background: 'repeating-linear-gradient(45deg,#e5e7eb 0,#e5e7eb 4px,#fff 0,#fff 8px)',
      }}
    >
      <div
        style={{
          width: tileW,
          height: tileH,
          backgroundImage: `url(./house/${tile.sheet})`,
          backgroundPosition: `-${tile.col * tileW}px -${tile.row * tileH}px`,
          backgroundSize: `${cols * tileW}px auto`,
          backgroundRepeat: 'no-repeat',
          imageRendering: 'pixelated',
        }}
      />
    </div>
  )
}

function applyExclusion(cart: CharacterPiece[], newPiece: CharacterPiece): CharacterPiece[] {
  // Toggle: se já está no carrinho, remove
  if (cart.find((p) => p.id === newPiece.id)) {
    return cart.filter((p) => p.id !== newPiece.id)
  }

  // Dress exclui top e bottom
  if (newPiece.category === 'dress') {
    return [...cart.filter((p) => p.category !== 'top' && p.category !== 'bottom'), newPiece]
  }
  // Top ou bottom excluem dress
  if (newPiece.category === 'top' || newPiece.category === 'bottom') {
    return [
      ...cart.filter((p) => p.category !== 'dress' && p.category !== newPiece.category),
      newPiece,
    ]
  }

  // Single-slot: substitui se já existe categoria
  const SINGLE_SLOT: string[] = [
    'body',
    'hair',
    'bangs',
    'eyebrows',
    'pupils',
    'eyelashes',
    'mouth',
    'shoes',
    'saia_costas',
    'saia_top',
  ]
  if (SINGLE_SLOT.includes(newPiece.category)) {
    return [...cart.filter((p) => p.category !== newPiece.category), newPiece]
  }

  // Multi-slot: apenas adiciona (sem substituir)
  return [...cart, newPiece]
}

// ─────────────────────────────────────────────
// MANEQUIM — preview da peça de roupa
// Body neutro (body-b-1) + peça selecionada
// ─────────────────────────────────────────────

function Mannequin({ cart }: { cart: CharacterPiece[] }) {
  const bodyPiece = ALL_PIECES.find((p) => p.id === 'body-b-1')

  // Ordena cart pela layer order para renderizar em camadas corretas
  const sorted = [...cart].sort(
    (a, b) => LAYER_ORDER.indexOf(a.category) - LAYER_ORDER.indexOf(b.category)
  )

  return (
    <div
      style={{
        width: 180,
        height: 240,
        position: 'relative',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {bodyPiece && (
        <img
          src={`./character/${bodyPiece.src}`}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            imageRendering: 'pixelated',
            zIndex: LAYER_ORDER.indexOf('body') + 2,
          }}
          alt="corpo"
        />
      )}
      {sorted.map((p) => (
        <img
          key={p.id}
          src={`./character/${p.src}`}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            imageRendering: 'pixelated',
            zIndex: LAYER_ORDER.indexOf(p.category) + 2,
          }}
          alt={p.label}
        />
      ))}
      {cart.length === 0 && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#c4b8a8',
            fontSize: 11,
            fontFamily: 'Baloo 2, sans-serif',
            textAlign: 'center',
            lineHeight: 1.4,
            padding: 8,
            zIndex: 10,
          }}
        >
          clique nas peças para experimentar
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────
// ITEM CARD — sem cadeado, sempre clicável
// ─────────────────────────────────────────────

interface ItemCardProps {
  id: string
  label: string
  cost: number
  discount?: number
  owned: boolean
  canAfford: boolean
  available: boolean
  isCute?: boolean
  isFloor?: boolean
  isCharacter?: boolean
  piece?: CharacterPiece
  selected?: boolean
  onBuy: () => void
  onPreview?: () => void
}

function ItemCard({
  id,
  label,
  cost,
  discount,
  owned,
  canAfford,
  available,
  isCute,
  isFloor,
  isCharacter,
  piece,
  selected,
  onBuy,
  onPreview,
}: ItemCardProps) {
  const finalCost = getDiscountedCost({
    id,
    label,
    category: 'floor',
    tier: 'basic',
    cost,
    discount,
  })

  return (
    <div
      onClick={onPreview}
      style={{
        border: selected
          ? '2px solid #c478a8'
          : owned
            ? '2px solid var(--color-leaf-600, #5a9a5a)'
            : isCute
              ? '2px solid #d4aaee'
              : '2px solid #e5ddd5',
        borderRadius: 12,
        background: selected ? '#fce8f5' : owned ? '#f0f7f0' : isCute ? '#faf5ff' : 'white',
        padding: '10px 10px 8px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6,
        cursor: 'pointer',
        opacity: !available && !owned ? 0.5 : 1,
        transition: 'transform 0.12s, box-shadow 0.12s',
        position: 'relative',
      }}
      onMouseEnter={(e) => {
        ;(e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'
        ;(e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.10)'
      }}
      onMouseLeave={(e) => {
        ;(e.currentTarget as HTMLDivElement).style.transform = ''
        ;(e.currentTarget as HTMLDivElement).style.boxShadow = ''
      }}
    >
      {/* Badge desconto */}
      {discount && !owned && (
        <div
          style={{
            position: 'absolute',
            top: -8,
            right: -8,
            background: '#ef4444',
            color: 'white',
            fontSize: 10,
            fontWeight: 700,
            borderRadius: 20,
            padding: '2px 6px',
            fontFamily: 'Baloo 2, sans-serif',
          }}
        >
          -{discount}%
        </div>
      )}

      {/* Badge comprado */}
      {owned && (
        <div
          style={{
            position: 'absolute',
            top: -8,
            right: -8,
            background: 'var(--color-leaf-600, #5a9a5a)',
            color: 'white',
            fontSize: 10,
            fontWeight: 700,
            borderRadius: 20,
            padding: '2px 8px',
            fontFamily: 'Baloo 2, sans-serif',
          }}
        >
          ✓
        </div>
      )}

      {/* Thumbnail */}
      {isCharacter && piece ? (
        <div
          style={{
            width: 64,
            height: 80,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#f5f0eb',
            borderRadius: 8,
            overflow: 'hidden',
          }}
        >
          <img
            src={`./character/${piece.src}`}
            style={{ width: 56, height: 72, imageRendering: 'pixelated', objectFit: 'contain' }}
            alt={label}
          />
        </div>
      ) : (
        <HouseThumbnail itemId={id} isFloor={isFloor ?? true} />
      )}

      {/* Label */}
      <span
        style={{
          fontSize: 11,
          color: '#3d2408',
          fontFamily: 'Baloo 2, sans-serif',
          fontWeight: 600,
          textAlign: 'center',
          lineHeight: 1.2,
          maxWidth: 88,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </span>

      {/* Preço / Comprado / Indisponível */}
      {owned ? (
        <span
          style={{
            fontSize: 10,
            color: 'var(--color-leaf-600, #5a9a5a)',
            fontFamily: 'Baloo 2, sans-serif',
            fontWeight: 700,
          }}
        >
          ✓ Comprado
        </span>
      ) : !available ? (
        <span style={{ fontSize: 10, color: '#9ca3af', fontFamily: 'Baloo 2, sans-serif' }}>
          Indisponível
        </span>
      ) : (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onBuy()
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 3,
            background: isCute ? '#9b5fd4' : 'var(--color-leaf-600, #5a9a5a)',
            color: 'white',
            border: 'none',
            borderRadius: 20,
            padding: '3px 10px',
            fontSize: 11,
            fontWeight: 700,
            fontFamily: 'Baloo 2, sans-serif',
            cursor: 'pointer',
            transition: 'background 0.15s',
          }}
        >
          <img src={coinIcon} style={{ width: 12, height: 12, imageRendering: 'pixelated' }} />{' '}
          {discount ? (
            <>
              <span style={{ textDecoration: 'line-through', opacity: 0.6, fontSize: 9 }}>
                {cost}
              </span>{' '}
              {finalCost}
            </>
          ) : (
            finalCost
          )}
        </button>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────
// SEÇÃO com título
// ─────────────────────────────────────────────

function Section({
  label,
  cute,
  children,
}: {
  label: string
  cute?: boolean
  children: React.ReactNode
}) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div
        style={{
          fontSize: 11,
          fontWeight: 800,
          fontFamily: 'Baloo 2, sans-serif',
          color: cute ? '#9b5fd4' : '#8b6914',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          marginBottom: 8,
          paddingBottom: 4,
          borderBottom: cute ? '1.5px solid #e8d5f5' : '1.5px solid #e5ddd5',
        }}
      >
        {label}
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
          gap: 10,
        }}
      >
        {children}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// MODAL DE CONFIRMAÇÃO
// ─────────────────────────────────────────────

function ConfirmModal({
  label,
  cost,
  coins,
  canAfford,
  onConfirm,
  onCancel,
}: {
  label: string
  cost: number
  coins: number
  canAfford: boolean
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        background: 'rgba(0,0,0,0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onClick={onCancel}
    >
      <div
        style={{
          background: 'white',
          borderRadius: 24,
          padding: '0',
          maxWidth: 300,
          width: '90%',
          boxShadow: '0 24px 60px rgba(0,0,0,0.22)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Topo colorido */}
        <div
          style={{
            background: canAfford
              ? 'linear-gradient(135deg, #e8f5e8 0%, #f0faf0 100%)'
              : 'linear-gradient(135deg, #fff3e0 0%, #fff8f0 100%)',
            padding: '28px 24px 20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 12,
            borderBottom: '1.5px solid #f0ebe4',
          }}
        >
          {/* Ícone */}
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: canAfford ? '#d4edda' : '#ffe4c4',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 32,
              boxShadow: canAfford
                ? '0 4px 16px rgba(90,154,90,0.18)'
                : '0 4px 16px rgba(251,146,60,0.18)',
            }}
          >
            {canAfford ? (
              '🛍️'
            ) : (
              <img src={coinIcon} style={{ width: 44, height: 44, imageRendering: 'pixelated' }} />
            )}
          </div>

          {/* Título */}
          <div
            style={{
              fontFamily: 'Baloo 2, sans-serif',
              fontWeight: 800,
              fontSize: 17,
              color: '#3d2408',
              textAlign: 'center',
            }}
          >
            {canAfford ? `Comprar ${label}?` : 'Moedas insuficientes'}
          </div>
        </div>

        {/* Corpo */}
        <div
          style={{ padding: '20px 24px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}
        >
          {canAfford ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                fontFamily: 'Baloo 2, sans-serif',
              }}
            >
              {/* linha custo */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: '#f9f5f0',
                  borderRadius: 10,
                  padding: '8px 12px',
                }}
              >
                <span style={{ fontSize: 13, color: '#6b7280' }}>Custo</span>
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    fontWeight: 800,
                    fontSize: 15,
                    color: '#3d2408',
                  }}
                >
                  <img
                    src={coinIcon}
                    style={{ width: 14, height: 14, imageRendering: 'pixelated' }}
                  />
                  {cost}
                </span>
              </div>
              {/* linha saldo */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: '#f9f5f0',
                  borderRadius: 10,
                  padding: '8px 12px',
                }}
              >
                <span style={{ fontSize: 13, color: '#6b7280' }}>Seu saldo</span>
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    fontWeight: 800,
                    fontSize: 15,
                    color: '#3d2408',
                  }}
                >
                  <img
                    src={coinIcon}
                    style={{ width: 14, height: 14, imageRendering: 'pixelated' }}
                  />
                  {coins}
                </span>
              </div>
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                fontFamily: 'Baloo 2, sans-serif',
              }}
            >
              {/* linha faltando */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: '#fff3e0',
                  borderRadius: 10,
                  padding: '8px 12px',
                }}
              >
                <span style={{ fontSize: 13, color: '#6b7280' }}>Necessário</span>
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    fontWeight: 800,
                    fontSize: 15,
                    color: '#3d2408',
                  }}
                >
                  <img
                    src={coinIcon}
                    style={{ width: 18, height: 18, imageRendering: 'pixelated', marginTop: -5 }}
                  />
                  {cost}
                </span>
              </div>
              {/* linha saldo */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: '#fff3e0',
                  borderRadius: 10,
                  padding: '8px 12px',
                }}
              >
                <span style={{ fontSize: 13, color: '#6b7280' }}>Seu saldo</span>
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    fontWeight: 800,
                    fontSize: 15,
                    color: '#ef4444',
                  }}
                >
                  <img
                    src={coinIcon}
                    style={{ width: 18, height: 18, imageRendering: 'pixelated', marginTop: -5 }}
                  />
                  {coins}
                </span>
              </div>
              <p
                style={{
                  margin: 0,
                  textAlign: 'center',
                  fontSize: 13,
                  color: '#6b7280',
                  fontFamily: 'Baloo 2, sans-serif',
                  lineHeight: 1.5,
                }}
              >
                Continue cuidando do jardim para ganhar mais! 🌱
              </p>
            </div>
          )}

          {/* Botões */}
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={onCancel}
              style={{
                flex: 1,
                padding: '11px 0',
                borderRadius: 14,
                border: '2px solid #e5ddd5',
                background: 'white',
                fontFamily: 'Baloo 2, sans-serif',
                fontWeight: 700,
                fontSize: 14,
                cursor: 'pointer',
                color: '#3d2408',
              }}
            >
              {canAfford ? 'Cancelar' : 'Fechar'}
            </button>
            {canAfford && (
              <button
                onClick={onConfirm}
                style={{
                  flex: 1,
                  padding: '11px 0',
                  borderRadius: 14,
                  border: 'none',
                  background: 'var(--color-leaf-600, #5a9a5a)',
                  fontFamily: 'Baloo 2, sans-serif',
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: 'pointer',
                  color: 'white',
                }}
              >
                Comprar ✓
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────

interface ShopModalProps {
  uid: string
  onClose: () => void
}

export function ShopModal({ uid, onClose }: ShopModalProps) {
  const { coins, characterOwned, buy, isOwned } = useShop(uid)

  const [mainTab, setMainTab] = useState<MainTab>('casa')
  const [houseSubTab, setHouseSubTab] = useState<HouseSubTab>('floor')
  const [charSubTab, setCharSubTab] = useState<string>('top')
  const [confirm, setConfirm] = useState<ConfirmState>({ item: null, piece: null, open: false })
  const [feedback, setFeedback] = useState<{ msg: string } | null>(null)
  const [cart, setCart] = useState<CharacterPiece[]>([])

  const cartTotal = cart
    .filter((p) => !characterOwned.has(p.id))
    .reduce((sum, p) => sum + (p.cost ?? 0), 0)
  const cartUnowned = cart.filter((p) => !characterOwned.has(p.id))

  const toggleCartPiece = (piece: CharacterPiece) => {
    setCart((prev) => applyExclusion(prev, piece))
  }

  const removeFromCart = (pieceId: string) => {
    setCart((prev) => prev.filter((p) => p.id !== pieceId))
  }

  // ── Seções da aba ativa ──
  const floorSections = getFloorSections()
  const wallSections = getWallSections()
  const charSections = getCharSections()
  const charPieces = getCharacterShopPieces().filter((p) => p.category === charSubTab)

  // Item map para lookup rápido
  const itemById: Record<string, ShopItem> = {}
  SHOP_HOUSE_ITEMS.forEach((i) => {
    itemById[i.id] = i
  })

  // ── Handlers ──

  const handleBuyHouse = (item: ShopItem) => {
    setConfirm({ item, piece: null, open: true })
  }

  const handleBuyPiece = (piece: CharacterPiece) => {
    setConfirm({ item: null, piece, open: true })
  }
  const handleConfirm = async () => {
    const { item, piece, isCart } = confirm
    setConfirm({ item: null, piece: null, open: false })

    if (isCart) {
      // Compra todas as peças do carrinho que não foram compradas ainda
      let successCount = 0
      for (const p of cartUnowned) {
        const tempItem: ShopItem = {
          id: p.id,
          label: p.label,
          category: 'character',
          tier: 'common',
          cost: p.cost ?? 0,
        }
        const result = await buy(tempItem)
        if (result.success) successCount++
      }
      if (successCount > 0) {
        setFeedback({
          msg: `✓ ${successCount} ${successCount === 1 ? 'item comprado' : 'itens comprados'}!`,
        })
        setTimeout(() => setFeedback(null), 2500)
      }
      return
    }

    let result: BuyResult
    let label = ''

    if (item) {
      result = await buy(item)
      label = item.label
    } else if (piece) {
      const tempItem: ShopItem = {
        id: piece.id,
        label: piece.label,
        category: 'character',
        tier: 'common',
        cost: piece.cost ?? 0,
      }
      result = await buy(tempItem)
      label = piece.label
    } else return

    if (result.success) {
      setFeedback({ msg: `✓ ${label} comprado!` })
      setTimeout(() => setFeedback(null), 2500)
    }
  }

  const confirmItem = confirm.item
  const confirmPiece = confirm.piece
  const isCartConfirm = confirm.isCart
  const confirmCost = isCartConfirm
    ? cartTotal
    : confirmItem
      ? getDiscountedCost(confirmItem)
      : (confirmPiece?.cost ?? 0)
  const confirmLabel = isCartConfirm
    ? `${cartUnowned.length} ${cartUnowned.length === 1 ? 'item' : 'itens'}`
    : (confirmItem?.label ?? confirmPiece?.label ?? '')
  const confirmCanAfford = coins >= confirmCost

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        top: 32,
        zIndex: 100,
        background: '#fdf6f0',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'Baloo 2, sans-serif',
      }}
    >
      {/* ── HEADER ── */}
      <div
        style={{
          height: 56,
          minHeight: 56,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px',
          paddingTop: 8,
          borderBottom: '2px solid var(--color-wood-300)',
          background: 'var(--color-bark-100)',
          flexShrink: 0,
        }}
      >
        <button
          onClick={onClose}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: '6px 14px 6px 10px',
            borderRadius: 10,
            border: '1.5px solid var(--color-wood-300)',
            background: 'transparent',
            color: 'var(--color-leaf-600)',
            fontSize: 13,
            fontWeight: 600,
            fontFamily: 'Baloo 2, sans-serif',
            cursor: 'pointer',
          }}
        >
          <ChevronLeft size={16} />
          Voltar
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <ShoppingBag size={18} color="var(--color-petal-400)" />
          <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-leaf-800)' }}>
            Loja
          </span>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'white',
            border: '1.5px solid var(--color-wood-300)',
            borderRadius: 20,
            padding: '4px 12px',
            fontWeight: 800,
            fontSize: 15,
            color: 'var(--color-leaf-800)',
            fontFamily: 'Baloo 2, sans-serif',
          }}
        >
          <img src={coinIcon} style={{ width: 18, height: 18, imageRendering: 'pixelated' }} />{' '}
          {coins}
        </div>
      </div>

      {/* ── TABS PRINCIPAIS ── */}
      <div
        style={{
          display: 'flex',
          borderBottom: '2px solid #e5ddd5',
          background: 'white',
          flexShrink: 0,
        }}
      >
        {(
          [
            { key: 'casa', label: 'Casinha', icon: <Home size={15} /> },
            { key: 'roupas', label: 'Roupas', icon: <Shirt size={15} /> },
          ] as { key: MainTab; label: string; icon: React.ReactNode }[]
        ).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setMainTab(tab.key)}
            style={{
              flex: 1,
              padding: '10px 0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'Baloo 2, sans-serif',
              fontWeight: 700,
              fontSize: 14,
              color: mainTab === tab.key ? 'var(--color-leaf-600, #5a9a5a)' : '#9ca3af',
              borderBottom:
                mainTab === tab.key
                  ? '3px solid var(--color-leaf-600, #5a9a5a)'
                  : '3px solid transparent',
              transition: 'all 0.15s',
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* ── CONTEÚDO ── */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {/* ───── ABA CASINHA ───── */}
        {mainTab === 'casa' && (
          <>
            {/* Sub-tabs */}
            <div style={{ display: 'flex', gap: 8, padding: '10px 16px 0', flexShrink: 0 }}>
              {(
                [
                  { key: 'floor', label: 'Pisos' },
                  { key: 'wall', label: 'Paredes' },
                  { key: 'background', label: 'Fundos' },
                ] as { key: HouseSubTab; label: string }[]
              ).map((sub) => (
                <button
                  key={sub.key}
                  onClick={() => setHouseSubTab(sub.key)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 20,
                    border: '2px solid',
                    borderColor:
                      houseSubTab === sub.key ? 'var(--color-leaf-600, #5a9a5a)' : '#e5ddd5',
                    background:
                      houseSubTab === sub.key ? 'var(--color-leaf-600, #5a9a5a)' : 'white',
                    color: houseSubTab === sub.key ? 'white' : '#3d2408',
                    fontFamily: 'Baloo 2, sans-serif',
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  {sub.label}
                </button>
              ))}
            </div>

            {/* Grid com seções */}
            <div
              className="char-scroll"
              style={{ flex: 1, overflowY: 'auto', padding: '12px 16px 24px' }}
            >
              {houseSubTab === 'floor' &&
                floorSections.map((sec) => (
                  <Section key={sec.label} label={sec.label} cute={sec.cute}>
                    {sec.ids.map((id) => {
                      const item = itemById[id]
                      if (!item) return null
                      const owned = isOwned(id, 'floor')
                      if (owned) return null
                      const available = isAvailableToday(item)
                      return (
                        <ItemCard
                          key={id}
                          id={id}
                          label={item.label}
                          cost={item.cost}
                          discount={item.discount}
                          owned={owned}
                          canAfford={coins >= getDiscountedCost(item)}
                          available={available}
                          isCute={sec.cute}
                          isFloor
                          onBuy={() => handleBuyHouse(item)}
                        />
                      )
                    })}
                  </Section>
                ))}

              {houseSubTab === 'wall' &&
                wallSections.map((sec) => (
                  <Section key={sec.label} label={sec.label} cute={sec.cute}>
                    {sec.ids.map((id) => {
                      const item = itemById[id]
                      if (!item) return null
                      const owned = isOwned(id, 'wall')
                      if (owned) return null
                      const available = isAvailableToday(item)
                      return (
                        <ItemCard
                          key={id}
                          id={id}
                          label={item.label}
                          cost={item.cost}
                          discount={item.discount}
                          owned={owned}
                          canAfford={coins >= getDiscountedCost(item)}
                          available={available}
                          isCute={sec.cute}
                          isFloor={false}
                          onBuy={() => handleBuyHouse(item)}
                        />
                      )
                    })}
                  </Section>
                ))}

              {houseSubTab === 'background' && (
                <Section label="Fundos">
                  {SHOP_HOUSE_ITEMS.filter(
                    (i) => i.category === 'background' && !isOwned(i.id, 'background')
                  ).map((item) => {
                    const owned = false
                    return (
                      <ItemCard
                        key={item.id}
                        id={item.id}
                        label={item.label}
                        cost={item.cost}
                        discount={item.discount}
                        owned={owned}
                        canAfford={coins >= getDiscountedCost(item)}
                        available={isAvailableToday(item)}
                        isFloor
                        onBuy={() => handleBuyHouse(item)}
                      />
                    )
                  })}
                </Section>
              )}
            </div>
          </>
        )}

        {/* ───── ABA ROUPAS ───── */}
        {mainTab === 'roupas' && (
          <div style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>
            {/* Manequim + carrinho lateral */}
            <div
              style={{
                width: 200,
                flexShrink: 0,
                borderRight: '2px solid var(--color-wood-300)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '12px 8px',
                gap: 8,
                background: 'var(--color-bark-100)',
                overflowY: 'auto',
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  color: '#8b6914',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Provador
              </div>
              <Mannequin cart={cart} />
              {cart.length > 0 && (
                <div
                  style={{
                    width: '100%',
                    background: 'white',
                    border: '1.5px solid var(--color-wood-300)',
                    borderRadius: 10,
                    overflow: 'hidden',
                    fontFamily: 'Baloo 2, sans-serif',
                  }}
                >
                  <div
                    style={{
                      background: 'var(--color-wood-300)',
                      padding: '4px 8px',
                      fontSize: 10,
                      fontWeight: 800,
                      color: '#3d2408',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      textAlign: 'center',
                    }}
                  >
                    🧾 carrinho
                  </div>
                  <div
                    style={{ padding: '6px 8px', display: 'flex', flexDirection: 'column', gap: 3 }}
                  >
                    {cart.map((p) => {
                      const alreadyOwned = characterOwned.has(p.id)
                      return (
                        <div
                          key={p.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 4,
                            padding: '2px 0',
                            borderBottom: '1px dashed #e5ddd5',
                          }}
                        >
                          <span
                            style={{
                              fontSize: 10,
                              color: '#3d2408',
                              flex: 1,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {p.label}
                          </span>
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 700,
                              color: alreadyOwned ? 'var(--color-leaf-600, #5a9a5a)' : '#3d2408',
                              flexShrink: 0,
                            }}
                          >
                            {alreadyOwned ? (
                              '✓'
                            ) : (
                              <>
                                <img
                                  src={coinIcon}
                                  style={{ width: 10, height: 10, imageRendering: 'pixelated' }}
                                />
                                {p.cost ?? 0}
                              </>
                            )}
                          </span>
                          <button
                            onClick={() => removeFromCart(p.id)}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              color: '#c4b8a8',
                              padding: 0,
                              flexShrink: 0,
                              display: 'flex',
                              alignItems: 'center',
                            }}
                          >
                            <X size={11} />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                  {cartUnowned.length > 0 && (
                    <div
                      style={{
                        borderTop: '1.5px solid var(--color-wood-300)',
                        padding: '5px 8px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <span style={{ fontSize: 10, fontWeight: 800, color: '#3d2408' }}>Total</span>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 800,
                          color: '#3d2408',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 3,
                        }}
                      >
                        <img
                          src={coinIcon}
                          style={{ width: 12, height: 12, imageRendering: 'pixelated' }}
                        />{' '}
                        {cartTotal}
                      </span>
                    </div>
                  )}
                  {cartUnowned.length > 0 && (
                    <div style={{ padding: '0 8px 8px' }}>
                      <button
                        onClick={() =>
                          setConfirm({
                            item: null,
                            piece: cartUnowned[0],
                            open: true,
                            isCart: true,
                          })
                        }
                        style={{
                          width: '100%',
                          padding: '6px 0',
                          borderRadius: 8,
                          border: 'none',
                          background:
                            coins >= cartTotal ? 'var(--color-leaf-600, #5a9a5a)' : '#d1d5db',
                          color: 'white',
                          fontFamily: 'Baloo 2, sans-serif',
                          fontWeight: 700,
                          fontSize: 12,
                          cursor: 'pointer',
                        }}
                      >
                        Comprar tudo
                      </button>
                    </div>
                  )}
                  <div style={{ padding: '0 8px 6px', textAlign: 'center' }}>
                    <button
                      onClick={() => setCart([])}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: 10,
                        color: '#9ca3af',
                        fontFamily: 'Baloo 2, sans-serif',
                        textDecoration: 'underline',
                      }}
                    >
                      limpar
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Área direita: sub-tabs + grid */}
            <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div
                className="char-scroll"
                style={{
                  display: 'flex',
                  gap: 8,
                  padding: '10px 16px 0',
                  overflowX: 'auto',
                  flexShrink: 0,
                }}
              >
                {charSections.map((cat) => (
                  <button
                    key={cat.key}
                    onClick={() => setCharSubTab(cat.key)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 20,
                      whiteSpace: 'nowrap',
                      border: '2px solid',
                      borderColor:
                        charSubTab === cat.key ? 'var(--color-leaf-600, #5a9a5a)' : '#e5ddd5',
                      background:
                        charSubTab === cat.key ? 'var(--color-leaf-600, #5a9a5a)' : 'white',
                      color: charSubTab === cat.key ? 'white' : '#3d2408',
                      fontFamily: 'Baloo 2, sans-serif',
                      fontWeight: 700,
                      fontSize: 13,
                      cursor: 'pointer',
                      flexShrink: 0,
                      transition: 'all 0.15s',
                    }}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
              <div
                className="char-scroll"
                style={{ flex: 1, overflowY: 'auto', padding: '12px 16px 24px' }}
              >
                {charPieces.length === 0 ? (
                  <div
                    style={{
                      textAlign: 'center',
                      color: '#9ca3af',
                      fontFamily: 'Baloo 2, sans-serif',
                      fontSize: 14,
                      padding: '40px 0',
                    }}
                  >
                    Nenhum item nesta categoria
                  </div>
                ) : (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                      gap: 10,
                    }}
                  >
                    {charPieces
                      .filter((p) => !characterOwned.has(p.id))
                      .map((p) => {
                        const owned = false
                        return (
                          <ItemCard
                            key={p.id}
                            id={p.id}
                            label={p.label}
                            cost={p.cost ?? 0}
                            owned={owned}
                            canAfford={coins >= (p.cost ?? 0)}
                            available={true}
                            isCharacter
                            piece={p}
                            selected={!!cart.find((c) => c.id === p.id)}
                            onPreview={() => toggleCartPiece(p)}
                            onBuy={() => handleBuyPiece(p)}
                          />
                        )
                      })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── FEEDBACK TOAST ── */}
      {feedback && (
        <div
          style={{
            position: 'fixed',
            bottom: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#3d2408',
            color: 'white',
            padding: '10px 20px',
            borderRadius: 20,
            fontFamily: 'Baloo 2, sans-serif',
            fontWeight: 700,
            fontSize: 14,
            zIndex: 300,
            pointerEvents: 'none',
            boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
            animation: 'fadeInUp 0.2s ease',
          }}
        >
          {feedback.msg}
        </div>
      )}

      {/* ── CONFIRM MODAL ── */}
      {confirm.open && (
        <ConfirmModal
          label={confirmLabel}
          cost={confirmCost}
          coins={coins}
          canAfford={confirmCanAfford}
          onConfirm={handleConfirm}
          onCancel={() => setConfirm({ item: null, piece: null, open: false })}
        />
      )}

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateX(-50%) translateY(8px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </div>
  )
}
