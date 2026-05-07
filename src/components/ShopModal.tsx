import { useState, useRef, useEffect } from 'react'
import { ShoppingBag, ChevronLeft, Home, Shirt, X, Eye, ShoppingCart } from 'lucide-react'
import { useShop, getCharacterShopPieces, type BuyResult } from '../hooks/useShop'
import {
  HouseScene,
  FLOOR_GROUPS,
  WALL_GROUPS,
  BACKGROUNDS,
  DEFAULT_BACKGROUND,
  getBgStyle,
  findSheetDims,
  type TileOption,
} from './HouseSceneShared'
import {
  SHOP_HOUSE_ITEMS,
  HOUSE_TILE_MAP,
  getDiscountedCost,
  isAvailableToday,
  type ShopItem,
} from '../shop/shopPrices'
import {
  ALL_PIECES,
  type CharacterPiece,
  LAYER_ORDER,
  COLOR_VARIANT_LABELS,
} from '../assets/character/index'
import { FIRST_TIME_COLOR_VARIANTS } from '../assets/character/firstTimeConfig'
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
  isCart?: boolean // carrinho de casinha
  isClothesCart?: boolean // carrinho de roupas
}

// ─────────────────────────────────────────────
// SHEET COLS
// ─────────────────────────────────────────────

const SHEET_COLS: Record<string, number> = {
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
// SEÇÕES
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
      )
        .sort((a, b) => a.cost - b.cost)
        .map((i) => i.id),
    },
    {
      label: 'Xadrez',
      ids: SHOP_HOUSE_ITEMS.filter(
        (i) => i.category === 'floor' && i.id.startsWith('floor_checker_')
      )
        .sort((a, b) => a.cost - b.cost)
        .map((i) => i.id),
    },
    {
      label: 'Preto & Branco',
      ids: SHOP_HOUSE_ITEMS.filter((i) => i.category === 'floor' && i.id.startsWith('floor_bw_'))
        .sort((a, b) => a.cost - b.cost)
        .map((i) => i.id),
    },
    {
      label: 'Madeira',
      ids: SHOP_HOUSE_ITEMS.filter((i) => i.category === 'floor' && i.id.startsWith('floor_wood_'))
        .sort((a, b) => a.cost - b.cost)
        .map((i) => i.id),
    },
    {
      label: 'Pedra',
      ids: SHOP_HOUSE_ITEMS.filter(
        (i) =>
          i.category === 'floor' &&
          (i.id.startsWith('floor_stone_') ||
            i.id.startsWith('floor_cobble_') ||
            i.id.startsWith('floor_pebble_'))
      )
        .sort((a, b) => a.cost - b.cost)
        .map((i) => i.id),
    },
    {
      label: 'Cute Decor ✦',
      cute: true,
      ids: SHOP_HOUSE_ITEMS.filter((i) => i.category === 'floor' && i.id.startsWith('floor_cute_'))
        .sort((a, b) => a.cost - b.cost)
        .map((i) => i.id),
    },
  ].filter((s) => s.ids.length > 0)
}

function getWallSections(): ShopSection[] {
  return [
    {
      label: 'Tinta lisa',
      ids: SHOP_HOUSE_ITEMS.filter((i) => i.category === 'wall' && i.id.startsWith('wall_paint_'))
        .sort((a, b) => a.cost - b.cost)
        .map((i) => i.id),
    },
    {
      label: 'Tinta listrada',
      ids: SHOP_HOUSE_ITEMS.filter((i) => i.category === 'wall' && i.id.startsWith('wall_stripes_'))
        .sort((a, b) => a.cost - b.cost)
        .map((i) => i.id),
    },
    {
      label: 'Tijolo',
      ids: SHOP_HOUSE_ITEMS.filter((i) => i.category === 'wall' && i.id.startsWith('wall_brick_'))
        .sort((a, b) => a.cost - b.cost)
        .map((i) => i.id),
    },
    {
      label: 'Azulejo xadrez',
      ids: SHOP_HOUSE_ITEMS.filter(
        (i) => i.category === 'wall' && i.id.startsWith('wall_tile_checker_')
      )
        .sort((a, b) => a.cost - b.cost)
        .map((i) => i.id),
    },
    {
      label: 'Pedra',
      ids: SHOP_HOUSE_ITEMS.filter((i) => i.category === 'wall' && i.id.startsWith('wall_stone_'))
        .sort((a, b) => a.cost - b.cost)
        .map((i) => i.id),
    },
    {
      label: 'Madeira ornada',
      ids: SHOP_HOUSE_ITEMS.filter(
        (i) => i.category === 'wall' && i.id.startsWith('wall_wood_ornate_')
      )
        .sort((a, b) => a.cost - b.cost)
        .map((i) => i.id),
    },
    {
      label: 'Madeira simples',
      ids: SHOP_HOUSE_ITEMS.filter(
        (i) => i.category === 'wall' && i.id.startsWith('wall_wood_simple_')
      )
        .sort((a, b) => a.cost - b.cost)
        .map((i) => i.id),
    },
    {
      label: 'Cute Decor ✦',
      cute: true,
      ids: SHOP_HOUSE_ITEMS.filter((i) => i.category === 'wall' && i.id.startsWith('wall_cute_'))
        .sort((a, b) => a.cost - b.cost)
        .map((i) => i.id),
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
// THUMBNAIL
// ─────────────────────────────────────────────

function HouseThumbnail({ itemId, isFloor }: { itemId: string; isFloor: boolean }) {
  const tile = HOUSE_TILE_MAP[itemId]

  if (!tile || tile?.sheet?.startsWith('bg_')) {
    const bgId = itemId.replace('bg_', '')
    const bgOption = BACKGROUNDS.find((b) => b.id === bgId)

    return (
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: 8,
          background: bgOption?.css ?? '#e5e7eb',
          flexShrink: 0,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {bgOption?.svg && (
          <div
            dangerouslySetInnerHTML={{ __html: bgOption.svg }}
            style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
          />
        )}
      </div>
    )
  }

  const realW = 256
  const realH = isFloor ? 128 : 384
  const displayW = isFloor ? 80 : 52
  const displayH = isFloor ? 40 : 78
  const cols = SHEET_COLS[tile.sheet] ?? 4
  const scaleX = displayW / realW
  const scaleY = displayH / realH

  const sheetRows = isFloor
    ? ((
        {
          'base floor/carpet spritesheet.png': 4,
          'base floor/chckerboard spritesheet.png': 4,
          'base floor/stone square spritesheet.png': 5,
          'base floor/wood spritesheet.png': 3,
          'base floor/black and white.png': 3,
          'base floor/cobblestone spritesheet.png': 2,
          'base floor/pebbles spritesheet.png': 2,
          'floor (tiles)/cut_floor_blue.png': 2,
          'floor (tiles)/cut_floor_green.png': 2,
          'floor (tiles)/cut_floor_orange.png': 2,
          'floor (tiles)/cut_floor_pink.png': 2,
          'floor (tiles)/cut_floor_violet.png': 2,
        } as Record<string, number>
      )[tile.sheet] ?? 2)
    : ((
        {
          'base walls/walls_paint_pastel.png': 2,
          'base walls/walls_paint_earthy.png': 2,
          'base walls/walls_paint_bright.png': 2,
          'base walls/walls_paint_grey.png': 2,
          'base walls/walls_paint_pastel_stripes.png': 2,
          'base walls/walls_paint_earthy_stripes.png': 2,
          'base walls/walls_paint_bright_stripes.png': 2,
          'base walls/walls_paint_grey_stripes.png': 2,
          'base walls/spritesheet(10).png': 2,
          'base walls/spritesheet(11).png': 3,
          'base walls/spritesheet(12).png': 2,
          'base walls/spritesheet(13).png': 2,
          'base walls/spritesheet(14).png': 2,
          'walls (tiles)/cutie blue pastels.png': 3,
          'walls (tiles)/cutie green pastels.png': 3,
          'walls (tiles)/cutie orange pastels.png': 3,
          'walls (tiles)/cutie pink pastels.png': 3,
          'walls (tiles)/cutie violet pastels.png': 3,
        } as Record<string, number>
      )[tile.sheet] ?? 2)

  const sheetW = cols * realW
  const sheetH = sheetRows * realH

  return (
    <div
      style={{
        width: displayW,
        height: displayH,
        flexShrink: 0,
        borderRadius: 6,
        overflow: 'hidden',
        background: 'repeating-linear-gradient(45deg,#e5e7eb 0,#e5e7eb 4px,#fff 0,#fff 8px)',
      }}
    >
      <div
        style={{
          width: displayW,
          height: displayH,
          backgroundImage: `url("./house/${tile.sheet.replace(/ /g, '%20')}")`,
          backgroundSize: `${sheetW * scaleX}px ${sheetH * scaleY}px`,
          backgroundPosition: `-${tile.col * realW * scaleX}px -${tile.row * realH * scaleY}px`,
          backgroundRepeat: 'no-repeat',
          imageRendering: 'pixelated',
          marginLeft: isFloor ? 0 : 13,
          marginTop: isFloor ? 0 : 8,
        }}
      />
    </div>
  )
}

// ─────────────────────────────────────────────
// APPLY EXCLUSION — lógica de preview de roupas
// ─────────────────────────────────────────────

function applyExclusion(cart: CharacterPiece[], newPiece: CharacterPiece): CharacterPiece[] {
  if (cart.find((p) => p.id === newPiece.id)) {
    return cart.filter((p) => p.id !== newPiece.id)
  }
  if (newPiece.category === 'dress') {
    return [...cart.filter((p) => p.category !== 'top' && p.category !== 'bottom'), newPiece]
  }
  if (newPiece.category === 'top' || newPiece.category === 'bottom') {
    return [
      ...cart.filter((p) => p.category !== 'dress' && p.category !== newPiece.category),
      newPiece,
    ]
  }
  const SINGLE_SLOT = [
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
  return [...cart, newPiece]
}

// ─────────────────────────────────────────────
// MANEQUIM
// ─────────────────────────────────────────────

function Mannequin({
  cart,
  variants,
}: {
  cart: CharacterPiece[]
  variants: Record<string, string>
}) {
  const bodyPiece = ALL_PIECES.find((p) => p.id === 'body-b-1')
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
          src={
            p.hasColor
              ? `./character/${p.src.replace(/(\d+)(\.png)$/, `$1${variants[p.category] ?? 'b'}$2`)}`
              : `./character/${p.src}`
          }
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
// ITEM CARD
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
  isSmallPiece?: boolean
  isMediumPiece?: boolean
  piece?: CharacterPiece
  selected?: boolean
  inCart?: boolean
  tryOnVariants?: Record<string, string>
  onBuy: () => void
  onPreview?: () => void
  onAddCart?: () => void
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
  isSmallPiece,
  isMediumPiece,
  piece,
  selected,
  inCart,
  tryOnVariants = {},
  onBuy,
  onPreview,
  onAddCart,
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
            position: 'relative',
          }}
        >
          <img
            src={
              piece.hasColor
                ? `./character/${piece.src.replace(/(\d+)(\.png)$/, `$1${tryOnVariants[piece.category] ?? 'b'}$2`)}`
                : `./character/${piece.src}`
            }
            style={{
              width: 56,
              height: 72,
              imageRendering: 'pixelated',
              objectFit: 'contain',
              transform: isSmallPiece
                ? `scale(2.5) translateY(${(() => {
                    const t: Record<string, string> = {
                      gloves: '-8px',
                      accessory_cima: '-8px',
                      beard: '6px',
                      accessory_topo: '6px',
                      mouth: '0px',
                      eyebrows: '0px',
                      eyelashes: '0px',
                      pupils: '0px',
                      accessory: '0px',
                      shoes: '-25px',
                    }
                    return t[piece?.category ?? ''] ?? '0px'
                  })()})`
                : isMediumPiece
                  ? `scale(1.8) translateY(${(() => {
                      const t: Record<string, string> = {
                        hair: '4px',
                        bangs: '4px',
                        bottom: '-16px',
                        dress: '-8px',
                        saia_costas: '-16px',
                        saia_top: '-16px',
                      }
                      return t[piece?.category ?? ''] ?? '-4px'
                    })()})`
                  : 'none',
              transformOrigin: 'center center',
            }}
            alt={label}
          />
        </div>
      ) : (
        <HouseThumbnail itemId={id} isFloor={isFloor ?? true} />
      )}

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
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            width: '100%',
            alignItems: 'center',
          }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation()
              onAddCart?.()
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 5,
              background: inCart ? '#e8f4e8' : '#f9f5f0',
              border: `2px solid ${inCart ? 'var(--color-leaf-500, #6aaa6a)' : '#e0d8d0'}`,
              borderRadius: 20,
              padding: '5px 12px',
              width: '100%',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            <ShoppingCart size={13} color={inCart ? 'var(--color-leaf-600, #5a9a5a)' : '#a0998f'} />
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 3,
                fontSize: 12,
                fontWeight: 700,
                fontFamily: 'Baloo 2, sans-serif',
                color: inCart ? 'var(--color-leaf-600, #5a9a5a)' : '#7a7068',
              }}
            >
              <img src={coinIcon} style={{ width: 12, height: 12, imageRendering: 'pixelated' }} />
              {discount ? (
                <>
                  <span style={{ textDecoration: 'line-through', opacity: 0.45, fontSize: 10 }}>
                    {cost}
                  </span>{' '}
                  {finalCost}
                </>
              ) : (
                finalCost
              )}
            </span>
          </button>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────
// SECTION
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
// CONFIRM MODAL
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
        <div
          style={{
            background: canAfford
              ? 'linear-gradient(135deg,#e8f5e8 0%,#f0faf0 100%)'
              : 'linear-gradient(135deg,#fff3e0 0%,#fff8f0 100%)',
            padding: '28px 24px 20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 12,
            borderBottom: '1.5px solid #f0ebe4',
          }}
        >
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
            }}
          >
            {canAfford ? (
              '🛍️'
            ) : (
              <img src={coinIcon} style={{ width: 44, height: 44, imageRendering: 'pixelated' }} />
            )}
          </div>
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
        <div
          style={{ padding: '20px 24px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              fontFamily: 'Baloo 2, sans-serif',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: canAfford ? '#f9f5f0' : '#fff3e0',
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
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: canAfford ? '#f9f5f0' : '#fff3e0',
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
                  color: canAfford ? '#3d2408' : '#ef4444',
                }}
              >
                <img
                  src={coinIcon}
                  style={{ width: 14, height: 14, imageRendering: 'pixelated' }}
                />
                {coins}
              </span>
            </div>
            {!canAfford && (
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
            )}
          </div>
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

  // cart = preview do manequim (o que está sendo experimentado)
  const [cart, setCart] = useState<CharacterPiece[]>([])
  // clothesCart = carrinho de compra de roupas
  const [clothesCart, setClothesCart] = useState<CharacterPiece[]>([])
  // houseCart = carrinho de compra de itens da casinha
  const [houseCart, setHouseCart] = useState<ShopItem[]>([])
  const [tryOnVariants, setTryOnVariants] = useState<Record<string, string>>({})
  const tryOnVariant = tryOnVariants[charSubTab] ?? 'b'
  const setTryOnVariant = (v: string) => setTryOnVariants((prev) => ({ ...prev, [charSubTab]: v }))

  // Painel preview casinha
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewScale, setPreviewScale] = useState(0.4)
  const [previewOffset, setPreviewOffset] = useState({ x: 0, y: 0 })
  const previewDragging = useRef(false)
  const previewLastPos = useRef({ x: 0, y: 0 })
  const [previewBtnY, setPreviewBtnY] = useState(100)
  const btnDragging = useRef(false)
  const btnLastY = useRef(0)

  // Painel provador roupas
  const [clothesPreviewOpen, setClothesPreviewOpen] = useState(false)
  const [clothesBtnY, setClothesBtnY] = useState(100)
  const clothesBtnDragging = useRef(false)
  const clothesBtnLastY = useRef(0)

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (btnDragging.current) {
        const dy = e.clientY - btnLastY.current
        btnLastY.current = e.clientY
        setPreviewBtnY((y) => Math.max(0, y + dy))
      }
      if (clothesBtnDragging.current) {
        const dy = e.clientY - clothesBtnLastY.current
        clothesBtnLastY.current = e.clientY
        setClothesBtnY((y) => Math.max(0, y + dy))
      }
    }
    const onUp = () => {
      btnDragging.current = false
      clothesBtnDragging.current = false
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [])

  // ── Helpers de carrinho de roupas ──
  const addToClothesCart = (piece: CharacterPiece) => {
    if (clothesCart.find((p) => p.id === piece.id)) return
    setClothesCart((prev) => [...prev, piece])
  }
  const removeFromClothesCart = (pieceId: string) => {
    setClothesCart((prev) => prev.filter((p) => p.id !== pieceId))
  }
  const clothesCartUnowned = clothesCart.filter((p) => !characterOwned.has(p.id))
  const clothesCartTotal = clothesCartUnowned.reduce((sum, p) => sum + (p.cost ?? 0), 0)

  // ── Helpers de carrinho de casa ──
  const toggleHouseCart = (item: ShopItem) => {
    setHouseCart((prev) =>
      prev.find((i) => i.id === item.id) ? prev.filter((i) => i.id !== item.id) : [...prev, item]
    )
  }
  const houseCartTotal = houseCart.reduce((sum, i) => sum + getDiscountedCost(i), 0)

  // ── Preview tiles casinha ──
  const DEFAULT_FLOOR: TileOption = {
    id: 'preview-floor',
    label: '',
    sheet: 'base floor/carpet spritesheet.png',
    col: 0,
    row: 3,
    tileW: 256,
    tileH: 128,
    sheetW: 1024,
    sheetH: 512,
  }
  const DEFAULT_WALL: TileOption = {
    id: 'preview-wall',
    label: '',
    sheet: 'base walls/walls_paint_grey_stripes.png',
    col: 0,
    row: 0,
    tileW: 256,
    tileH: 384,
    sheetW: 1024,
    sheetH: 768,
  }
  const [previewFloor, setPreviewFloor] = useState<TileOption>(DEFAULT_FLOOR)
  const [previewWall, setPreviewWall] = useState<TileOption>(DEFAULT_WALL)
  const [previewBg, setPreviewBg] = useState<string>('sky')

  function tileOptionFromId(itemId: string, isFloor: boolean): TileOption | null {
    const ref = HOUSE_TILE_MAP[itemId]
    if (!ref) return null
    const groups = isFloor ? FLOOR_GROUPS : WALL_GROUPS
    const dims = findSheetDims(groups, ref.sheet)
    return {
      id: itemId,
      label: '',
      sheet: ref.sheet,
      col: ref.col,
      row: ref.row,
      tileW: 256,
      tileH: isFloor ? 128 : 384,
      sheetW: dims.sheetW,
      sheetH: dims.sheetH,
    }
  }

  const floorSections = getFloorSections()
  const wallSections = getWallSections()
  const charSections = getCharSections()
  const MEDIUM_PIECE_CATEGORIES = new Set([
    'hair',
    'bangs',
    'top',
    'bottom',
    'dress',
    'jaqueta',
    'saia_costas',
    'saia_top',
  ])
  const SMALL_PIECE_CATEGORIES = new Set([
    'mouth',
    'eyebrows',
    'eyelashes',
    'pupils',
    'beard',
    'accessory',
    'accessory_cima',
    'accessory_topo',
    'gloves',
    'shoes',
  ])
  const charPieces = getCharacterShopPieces().filter((p) => p.category === charSubTab)
  const COLOR_VARIANTS = FIRST_TIME_COLOR_VARIANTS

  const itemById: Record<string, ShopItem> = {}
  SHOP_HOUSE_ITEMS.forEach((i) => {
    itemById[i.id] = i
  })

  // ── Handlers de compra ──
  const handleBuyHouse = (item: ShopItem) => setConfirm({ item, piece: null, open: true })
  const handleBuyPiece = (piece: CharacterPiece) => setConfirm({ item: null, piece, open: true })

  const handleConfirm = async () => {
    const { item, piece, isCart, isClothesCart } = confirm
    setConfirm({ item: null, piece: null, open: false })

    if (isCart) {
      // Carrinho de casinha
      let successCount = 0
      for (const i of houseCart) {
        const result = await buy(i as ShopItem)
        if (result.success) successCount++
      }
      if (successCount > 0) {
        setHouseCart([])
        setFeedback({
          msg: `✓ ${successCount} ${successCount === 1 ? 'item comprado' : 'itens comprados'}!`,
        })
        setTimeout(() => setFeedback(null), 2500)
      }
      return
    }

    if (isClothesCart) {
      // Carrinho de roupas
      const itemsToBuy = clothesCartUnowned.map((p) => ({
        id: p.id,
        label: p.label,
        category: 'character' as const,
        tier: 'common' as const,
        cost: p.cost ?? 0,
      }))
      let successCount = 0
      for (const i of itemsToBuy) {
        const result = await buy(i as ShopItem)
        if (result.success) successCount++
      }
      if (successCount > 0) {
        setClothesCart([])
        setFeedback({
          msg: `✓ ${successCount} ${successCount === 1 ? 'item comprado' : 'itens comprados'}!`,
        })
        setTimeout(() => setFeedback(null), 2500)
      }
      return
    }

    // Compra individual
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

  const confirmCost = confirm.isCart
    ? houseCartTotal
    : confirm.isClothesCart
      ? clothesCartTotal
      : confirm.item
        ? getDiscountedCost(confirm.item)
        : (confirm.piece?.cost ?? 0)
  const confirmLabel = confirm.isCart
    ? `${houseCart.length} ${houseCart.length === 1 ? 'item' : 'itens'}`
    : confirm.isClothesCart
      ? `${clothesCartUnowned.length} ${clothesCartUnowned.length === 1 ? 'item' : 'itens'}`
      : (confirm.item?.label ?? confirm.piece?.label ?? '')
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
          <ChevronLeft size={16} /> Voltar
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
          <div style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>
            {/* Botão flutuante de preview/carrinho */}
            <div style={{ position: 'relative', flexShrink: 0, zIndex: 51 }}>
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  top: previewBtnY,
                  display: 'flex',
                  alignItems: 'stretch',
                  flexDirection: 'row',
                }}
              >
                {previewOpen && (
                  <div
                    style={{
                      width: 300,
                      position: 'relative',
                      border: '2px solid var(--color-wood-300)',
                      borderRadius: '0 0 12px 0',
                      display: 'flex',
                      flexDirection: 'column',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: (BACKGROUNDS.find((b) => b.id === previewBg) ?? BACKGROUNDS[0])
                          .css,
                        zIndex: 0,
                      }}
                    />
                    {(() => {
                      const activeBg = BACKGROUNDS.find((b) => b.id === previewBg) ?? BACKGROUNDS[0]
                      return activeBg.svg ? (
                        <div
                          dangerouslySetInnerHTML={{ __html: activeBg.svg }}
                          style={{
                            position: 'absolute',
                            inset: 0,
                            pointerEvents: 'none',
                            zIndex: 0,
                          }}
                        />
                      ) : null
                    })()}

                    {/* Cena */}
                    <div
                      style={{
                        height: 300,
                        flexShrink: 0,
                        overflow: 'hidden',
                        cursor: previewDragging.current ? 'grabbing' : 'grab',
                        position: 'relative',
                        zIndex: 1,
                      }}
                      onWheel={(e) => {
                        e.preventDefault()
                        setPreviewScale((s) => Math.min(1.5, Math.max(0.2, s - e.deltaY * 0.001)))
                      }}
                      onMouseDown={(e) => {
                        previewDragging.current = true
                        previewLastPos.current = { x: e.clientX, y: e.clientY }
                        e.stopPropagation()
                      }}
                      onMouseMove={(e) => {
                        if (!previewDragging.current) return
                        const dx = e.clientX - previewLastPos.current.x
                        const dy = e.clientY - previewLastPos.current.y
                        previewLastPos.current = { x: e.clientX, y: e.clientY }
                        setPreviewOffset((o) => ({ x: o.x + dx, y: o.y + dy }))
                        e.stopPropagation()
                      }}
                      onMouseUp={(e) => {
                        previewDragging.current = false
                        e.stopPropagation()
                      }}
                      onMouseLeave={() => {
                        previewDragging.current = false
                      }}
                    >
                      <div
                        style={{
                          position: 'absolute',
                          inset: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <div
                          style={{
                            transform: `translate(${previewOffset.x}px, ${previewOffset.y}px) scale(${previewScale})`,
                            transformOrigin: 'center center',
                          }}
                        >
                          <HouseScene
                            floorTile={previewFloor}
                            wallTile={previewWall}
                            wallRightTile={previewWall}
                            overlap={0}
                          />
                        </div>
                      </div>
                    </div>
                    {/* Carrinho de casinha */}
                    {houseCart.length > 0 && (
                      <div
                        style={{
                          background: 'rgba(255,255,255,0.92)',
                          borderTop: '1.5px solid var(--color-wood-300)',
                          display: 'flex',
                          flexDirection: 'column',
                          maxHeight: 280,
                          flexShrink: 0,
                          position: 'relative',
                          zIndex: 1,
                        }}
                      >
                        <div
                          style={{
                            background: 'var(--color-wood-300)',
                            padding: '3px 8px',
                            fontSize: 10,
                            fontWeight: 800,
                            color: '#3d2408',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            textAlign: 'center',
                            fontFamily: 'Baloo 2, sans-serif',
                          }}
                        >
                          🛒 carrinho
                        </div>
                        <div
                          style={{
                            overflowY: 'auto',
                            padding: '4px 8px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 3,
                          }}
                        >
                          {houseCart.map((i) => (
                            <div
                              key={i.id}
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
                                  fontFamily: 'Baloo 2, sans-serif',
                                }}
                              >
                                {i.category === 'floor'
                                  ? 'Pisos'
                                  : i.category === 'wall'
                                    ? 'Paredes'
                                    : 'Fundos'}{' '}
                                — {i.label}
                              </span>
                              <span
                                style={{
                                  fontSize: 10,
                                  fontWeight: 700,
                                  color: '#3d2408',
                                  flexShrink: 0,
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 2,
                                  fontFamily: 'Baloo 2, sans-serif',
                                }}
                              >
                                <img
                                  src={coinIcon}
                                  style={{ width: 10, height: 10, imageRendering: 'pixelated' }}
                                />
                                {getDiscountedCost(i)}
                              </span>
                              <button
                                onClick={() =>
                                  setHouseCart((prev) => prev.filter((x) => x.id !== i.id))
                                }
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  cursor: 'pointer',
                                  color: '#c4b8a8',
                                  padding: 0,
                                  display: 'flex',
                                  alignItems: 'center',
                                }}
                              >
                                <X size={11} />
                              </button>
                            </div>
                          ))}
                        </div>
                        <div
                          style={{
                            padding: '4px 8px',
                            borderTop: '1.5px solid var(--color-wood-300)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 800,
                              color: '#3d2408',
                              fontFamily: 'Baloo 2, sans-serif',
                            }}
                          >
                            Total
                          </span>
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 800,
                              color: '#3d2408',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 3,
                              fontFamily: 'Baloo 2, sans-serif',
                            }}
                          >
                            <img
                              src={coinIcon}
                              style={{ width: 12, height: 12, imageRendering: 'pixelated' }}
                            />
                            {houseCartTotal}
                          </span>
                        </div>
                        <div style={{ padding: '4px 8px 6px' }}>
                          <button
                            onClick={() =>
                              setConfirm({
                                item: houseCart[0],
                                piece: null,
                                open: true,
                                isCart: true,
                              })
                            }
                            style={{
                              width: '100%',
                              padding: '5px 0',
                              borderRadius: 8,
                              border: 'none',
                              background:
                                coins >= houseCartTotal
                                  ? 'var(--color-leaf-600, #5a9a5a)'
                                  : '#d1d5db',
                              color: 'white',
                              fontFamily: 'Baloo 2, sans-serif',
                              fontWeight: 700,
                              fontSize: 11,
                              cursor: 'pointer',
                            }}
                          >
                            Comprar tudo
                          </button>
                        </div>
                        <div style={{ padding: '0 8px 6px', textAlign: 'center' }}>
                          <button
                            onClick={() => setHouseCart([])}
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
                )}
                {/* Botão arrastável */}
                <button
                  onClick={() => setPreviewOpen((v) => !v)}
                  onMouseDown={(e) => {
                    btnDragging.current = true
                    btnLastY.current = e.clientY
                    e.preventDefault()
                    e.stopPropagation()
                  }}
                  style={{
                    width: 32,
                    height: 80,
                    background: 'var(--color-bark-100)',
                    border: '2px solid var(--color-wood-300)',
                    borderLeft: 'none',
                    borderRadius: '0 12px 12px 0',
                    cursor: 'grab',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-leaf-600)',
                    fontSize: 10,
                    fontFamily: 'Baloo 2, sans-serif',
                    fontWeight: 800,
                    writingMode: 'vertical-rl',
                    letterSpacing: '0.05em',
                    flexShrink: 0,
                    userSelect: 'none',
                  }}
                >
                  {houseCart.length > 0 ? <ShoppingCart size={13} /> : <Eye size={13} />}
                  {houseCart.length > 0 ? 'Carrinho' : 'Preview'}
                </button>
              </div>
            </div>

            {/* Grid + sub-tabs */}
            <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
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
                            selected={
                              previewFloor.sheet === HOUSE_TILE_MAP[id]?.sheet &&
                              previewFloor.col === HOUSE_TILE_MAP[id]?.col &&
                              previewFloor.row === HOUSE_TILE_MAP[id]?.row
                            }
                            onPreview={() => {
                              const t = tileOptionFromId(id, true)
                              if (t) setPreviewFloor(t)
                            }}
                            onAddCart={() => toggleHouseCart(item)}
                            inCart={houseCart.some((i) => i.id === id)}
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
                            selected={
                              previewWall.sheet === HOUSE_TILE_MAP[id]?.sheet &&
                              previewWall.col === HOUSE_TILE_MAP[id]?.col &&
                              previewWall.row === HOUSE_TILE_MAP[id]?.row
                            }
                            onPreview={() => {
                              const t = tileOptionFromId(id, false)
                              if (t) setPreviewWall(t)
                            }}
                            onAddCart={() => toggleHouseCart(item)}
                            inCart={houseCart.some((i) => i.id === id)}
                            onBuy={() => handleBuyHouse(item)}
                          />
                        )
                      })}
                    </Section>
                  ))}

                {houseSubTab === 'background' && (
                  <Section label="Fundos">
                    {SHOP_HOUSE_ITEMS.filter((i) => i.category === 'background')
                      .sort((a, b) => a.cost - b.cost)
                      .map((item) => {
                        const owned = isOwned(item.id, 'background')
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
                            selected={previewBg === item.id.replace('bg_', '')}
                            onPreview={() => setPreviewBg(item.id.replace('bg_', ''))}
                            onAddCart={() => toggleHouseCart(item)}
                            inCart={houseCart.some((i) => i.id === item.id)}
                            onBuy={() => handleBuyHouse(item)}
                          />
                        )
                      })}
                  </Section>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ───── ABA ROUPAS ───── */}
        {mainTab === 'roupas' && (
          <div style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>
            {/* Botão flutuante de provador/carrinho */}
            <div style={{ position: 'relative', flexShrink: 0, zIndex: 51 }}>
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  top: clothesBtnY,
                  display: 'flex',
                  alignItems: 'stretch',
                  flexDirection: 'row',
                }}
              >
                {clothesPreviewOpen && (
                  <div
                    style={{
                      width: 240,
                      background: 'var(--color-bark-100)',
                      border: '2px solid var(--color-wood-300)',
                      borderRadius: '0 0 12px 0',
                      display: 'flex',
                      flexDirection: 'column',
                      overflow: 'hidden',
                    }}
                  >
                    {/* Manequim */}
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        padding: '10px 8px 6px',
                        gap: 6,
                        background: '#f5ede4',
                        flexShrink: 0,
                      }}
                    >
                      <Mannequin cart={cart} variants={tryOnVariants} />
                      {cart.length > 0 && (
                        <button
                          onClick={() => setCart([])}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            background: 'none',
                            border: '1.5px solid #e0d8d0',
                            borderRadius: 20,
                            padding: '3px 10px',
                            fontSize: 11,
                            fontWeight: 600,
                            fontFamily: 'Baloo 2, sans-serif',
                            color: '#a0998f',
                            cursor: 'pointer',
                          }}
                        >
                          <X size={11} /> Tirar tudo
                        </button>
                      )}
                    </div>

                    {/* Carrinho de roupas */}
                    {clothesCart.length > 0 && (
                      <div
                        style={{
                          background: 'rgba(255,255,255,0.95)',
                          borderTop: '1.5px solid var(--color-wood-300)',
                          display: 'flex',
                          flexDirection: 'column',
                          maxHeight: 260,
                          flexShrink: 0,
                        }}
                      >
                        <div
                          style={{
                            background: 'var(--color-wood-300)',
                            padding: '3px 8px',
                            fontSize: 10,
                            fontWeight: 800,
                            color: '#3d2408',
                            textTransform: 'uppercase' as const,
                            letterSpacing: '0.05em',
                            textAlign: 'center' as const,
                            fontFamily: 'Baloo 2, sans-serif',
                          }}
                        >
                          <ShoppingCart
                            size={11}
                            style={{ marginRight: 4, verticalAlign: 'middle' }}
                          />{' '}
                          carrinho
                        </div>
                        <div
                          style={{
                            overflowY: 'auto',
                            padding: '4px 8px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 3,
                          }}
                        >
                          {clothesCart.map((p) => {
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
                                    fontFamily: 'Baloo 2, sans-serif',
                                  }}
                                >
                                  {getCharSections().find((s) => s.key === p.category)?.label ??
                                    p.category}{' '}
                                  — {p.label}
                                </span>
                                <span
                                  style={{
                                    fontSize: 10,
                                    fontWeight: 700,
                                    color: alreadyOwned ? 'var(--color-leaf-600)' : '#3d2408',
                                    flexShrink: 0,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 2,
                                    fontFamily: 'Baloo 2, sans-serif',
                                  }}
                                >
                                  {alreadyOwned ? (
                                    '✓'
                                  ) : (
                                    <>
                                      <img
                                        src={coinIcon}
                                        style={{
                                          width: 10,
                                          height: 10,
                                          imageRendering: 'pixelated',
                                        }}
                                      />
                                      {p.cost ?? 0}
                                    </>
                                  )}
                                </span>
                                <button
                                  onClick={() => removeFromClothesCart(p.id)}
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: '#c4b8a8',
                                    padding: 0,
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
                        {clothesCartUnowned.length > 0 && (
                          <>
                            <div
                              style={{
                                padding: '4px 8px',
                                borderTop: '1.5px solid var(--color-wood-300)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                              }}
                            >
                              <span
                                style={{
                                  fontSize: 10,
                                  fontWeight: 800,
                                  color: '#3d2408',
                                  fontFamily: 'Baloo 2, sans-serif',
                                }}
                              >
                                Total
                              </span>
                              <span
                                style={{
                                  fontSize: 11,
                                  fontWeight: 800,
                                  color: '#3d2408',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 3,
                                  fontFamily: 'Baloo 2, sans-serif',
                                }}
                              >
                                <img
                                  src={coinIcon}
                                  style={{ width: 12, height: 12, imageRendering: 'pixelated' }}
                                />
                                {clothesCartTotal}
                              </span>
                            </div>
                            <div style={{ padding: '4px 8px 6px' }}>
                              <button
                                onClick={() =>
                                  setConfirm({
                                    item: null,
                                    piece: clothesCartUnowned[0],
                                    open: true,
                                    isClothesCart: true,
                                  })
                                }
                                style={{
                                  width: '100%',
                                  padding: '5px 0',
                                  borderRadius: 8,
                                  border: 'none',
                                  background:
                                    coins >= clothesCartTotal
                                      ? 'var(--color-leaf-600, #5a9a5a)'
                                      : '#d1d5db',
                                  color: 'white',
                                  fontFamily: 'Baloo 2, sans-serif',
                                  fontWeight: 700,
                                  fontSize: 11,
                                  cursor: 'pointer',
                                }}
                              >
                                Comprar tudo
                              </button>
                            </div>
                          </>
                        )}
                        <div style={{ padding: '0 8px 6px', textAlign: 'center' }}>
                          <button
                            onClick={() => setClothesCart([])}
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
                )}

                {/* Botão arrastável */}
                <button
                  onClick={() => setClothesPreviewOpen((v) => !v)}
                  onMouseDown={(e) => {
                    clothesBtnDragging.current = true
                    clothesBtnLastY.current = e.clientY
                    e.preventDefault()
                    e.stopPropagation()
                  }}
                  style={{
                    width: 32,
                    height: 80,
                    background: 'var(--color-bark-100)',
                    border: '2px solid var(--color-wood-300)',
                    borderLeft: 'none',
                    borderRadius: '0 12px 12px 0',
                    cursor: 'grab',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-leaf-600)',
                    fontSize: 10,
                    fontFamily: 'Baloo 2, sans-serif',
                    fontWeight: 800,
                    writingMode: 'vertical-rl',
                    letterSpacing: '0.05em',
                    flexShrink: 0,
                    userSelect: 'none',
                  }}
                >
                  {clothesCart.length > 0 ? <ShoppingCart size={13} /> : <Eye size={13} />}
                  {clothesCart.length > 0 ? 'Carrinho' : 'Provador'}
                </button>
              </div>
            </div>

            {/* Área direita: sub-tabs + grid */}
            <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0, flexShrink: 0 }}>
                {/* Seletor de cor — aparece só quando a categoria tem hasColor */}
                {charPieces.some((p) => p.hasColor) && (
                  <div
                    style={{
                      display: 'flex',
                      gap: 4,
                      flexWrap: 'wrap',
                      padding: '6px 16px',
                      background: 'rgba(255,255,255,0.5)',
                      borderBottom: '1px solid var(--color-wood-300)',
                    }}
                  >
                    {COLOR_VARIANTS.map((v) => (
                      <button
                        key={v}
                        onClick={() => setTryOnVariant(v)}
                        style={{
                          padding: '2px 10px',
                          borderRadius: 8,
                          border:
                            tryOnVariant === v
                              ? '2px solid var(--color-petal-400)'
                              : '2px solid transparent',
                          background:
                            tryOnVariant === v ? 'var(--color-petal-200)' : 'var(--color-wood-300)',
                          color: 'var(--color-soil-900)',
                          fontSize: 11,
                          fontFamily: 'Baloo 2, sans-serif',
                          cursor: 'pointer',
                          transition: 'all 0.15s',
                          fontWeight: tryOnVariant === v ? 700 : 400,
                        }}
                      >
                        {COLOR_VARIANT_LABELS[v]}
                      </button>
                    ))}
                  </div>
                )}
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
              </div>{' '}
              {/* fecha div externo seletor de cor + sub-tabs */}
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
                      .map((p) => (
                        <ItemCard
                          key={p.id}
                          id={p.id}
                          label={p.label}
                          cost={p.cost ?? 0}
                          owned={false}
                          canAfford={coins >= (p.cost ?? 0)}
                          available={true}
                          isCharacter
                          isSmallPiece={SMALL_PIECE_CATEGORIES.has(p.category)}
                          isMediumPiece={MEDIUM_PIECE_CATEGORIES.has(p.category)}
                          piece={p}
                          selected={cart.some((c) => c.id === p.id)}
                          inCart={clothesCart.some((c) => c.id === p.id)}
                          tryOnVariants={tryOnVariants}
                          onPreview={() => setCart((prev) => applyExclusion(prev, p))}
                          onAddCart={() => addToClothesCart(p)}
                          onBuy={() => handleBuyPiece(p)}
                        />
                      ))}
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
