import { useState, useRef, useEffect } from 'react'
import {
  ShoppingBag,
  ChevronLeft,
  Layers,
  Shirt,
  X,
  Eye,
  ShoppingCart,
  Heart,
  Gift as GiftIcon,
  Check,
} from 'lucide-react'
import {
  useShop,
  getCharacterShopPieces,
  sendGift,
  subscribePartnerInventory,
  type BuyResult,
  type Gift,
} from '../hooks/useShop'
import {
  HouseScene,
  FLOOR_GROUPS,
  WALL_GROUPS,
  BACKGROUNDS,
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
import { PiMoneyWavyLight } from 'react-icons/pi'
import { Lock, Sticker } from 'lucide-react'
import { STICKER_PACKS } from '../assets/stickers/index'
import {
  subscribeOwnedStickers,
  buyPack,
  buySticker,
  isPackFullyOwned,
  getStickerIndividualPrice,
  type OwnedStickers,
} from '../lib/stickers'

// ── Scrollbar custom global ──────────────────────────────────
const SCROLLBAR_CSS = `
  .shop-scroll::-webkit-scrollbar { width: 4px; height: 4px; }
  .shop-scroll::-webkit-scrollbar-track { background: transparent; }
  .shop-scroll::-webkit-scrollbar-thumb { background: rgba(232,160,176,0.55); border-radius: 99px; }
  .shop-scroll::-webkit-scrollbar-thumb:hover { background: rgba(232,160,176,0.99); }
  .shop-scroll { scrollbar-width: thin; scrollbar-color: rgba(232,160,176,0.55) transparent; }
`
if (!document.getElementById('shop-scroll-style')) {
  const s = document.createElement('style')
  s.id = 'shop-scroll-style'
  s.textContent = SCROLLBAR_CSS
  document.head.appendChild(s)
}

// ── Paleta leafnote ──────────────────────────────────────────
const T = {
  bg: 'linear-gradient(160deg, rgba(253,246,240,0.97) 0%, rgba(252,232,238,0.97) 100%)',
  bgSolid: 'rgba(253,246,240,0.97)',
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
  btnDestructive: 'rgba(232,96,122,0.12)',
  btnDestructiveText: '#e8607a',
  btnPositive: 'rgba(74,122,74,0.12)',
  btnPositiveText: '#4A7A4A',
  btnIcon: 'rgba(200,120,140,0.15)',
  selectedBg: 'rgba(232,160,176,0.2)',
  selectedBorder: 'rgba(232,160,176,0.7)',
  ownedBg: 'rgba(74,122,74,0.12)',
  ownedBorder: 'rgba(74,122,74,0.4)',
  ownedText: '#4A7A4A',
  cuteBg: 'rgba(180,140,220,0.1)',
  cuteBorder: 'rgba(180,140,220,0.4)',
  cuteText: 'rgba(120,60,160,0.8)',
}

// ─────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────

type MainTab = 'casa' | 'roupas' | 'stickers'
type HouseSubTab = 'floor' | 'wall' | 'background'

interface ConfirmState {
  item: ShopItem | null
  piece: CharacterPiece | null
  open: boolean
  isCart?: boolean
  isClothesCart?: boolean
  isGift?: boolean
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
      label: 'Cute Decor',
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
      label: 'Cute Decor',
      cute: true,
      ids: SHOP_HOUSE_ITEMS.filter((i) => i.category === 'wall' && i.id.startsWith('wall_cute_'))
        .sort((a, b) => a.cost - b.cost)
        .map((i) => i.id),
    },
  ].filter((s) => s.ids.length > 0)
}

function getCharSections(): { label: string; key: string }[] {
  return [
    { key: 'body', label: 'corpo' },
    { key: 'hair', label: 'cabelo' },
    { key: 'hair_back', label: 'cabelo (trás)' },
    { key: 'bangs', label: 'franja' },
    { key: 'mouth', label: 'boca' },
    { key: 'eyebrows', label: 'sobrancelhas' },
    { key: 'eyelashes', label: 'cílios' },
    { key: 'pupils', label: 'pupilas' },
    { key: 'top', label: 'parte de cima' },
    { key: 'bottom', label: 'parte de baixo' },
    { key: 'bottom_over', label: 'caguinha' },
    { key: 'dress', label: 'vestido' },
    { key: 'shoes', label: 'sapatos' },
    { key: 'jaqueta', label: 'jaquetas' },
    { key: 'gloves', label: 'luvas' },
    { key: 'accessory', label: 'acessórios' },
    { key: 'accessory_cima', label: 'acessórios (cima)' },
    { key: 'accessory_topo', label: 'acessórios (topo)' },
    { key: 'tattoo', label: 'tattoo / bronzeado' },
    { key: 'beard', label: 'barba' },
    { key: 'hair_bonus', label: 'enfeite de cabelo' },
    { key: 'saia_costas', label: 'saia (costas)' },
    { key: 'saia_top', label: 'saia (topo)' },
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
          background: bgOption?.css ?? 'rgba(232,160,176,0.2)',
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
        background: 'rgba(232,160,176,0.15)',
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
// APPLY EXCLUSION
// ─────────────────────────────────────────────

function applyExclusion(cart: CharacterPiece[], newPiece: CharacterPiece): CharacterPiece[] {
  if (cart.find((p) => p.id === newPiece.id)) {
    return cart.filter((p) => p.id !== newPiece.id)
  }
  if (newPiece.category === 'dress') {
    return [
      ...cart.filter(
        (p) =>
          p.category !== 'top' &&
          p.category !== 'bottom' &&
          p.category !== 'bottom_over' &&
          p.category !== 'dress'
      ),
      newPiece,
    ]
  }
  if (newPiece.category === 'bottom_over') {
    return [...cart.filter((p) => p.category !== 'dress'), newPiece]
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
            color: T.textSub,
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
  isWishlisted?: boolean
  onToggleWishlist?: () => void
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
  isWishlisted,
  onToggleWishlist,
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

  const borderColor = owned
    ? T.ownedBorder
    : selected
      ? T.selectedBorder
      : isCute
        ? T.cuteBorder
        : T.border

  const bgColor = owned ? T.ownedBg : selected ? T.selectedBg : isCute ? T.cuteBg : T.card

  return (
    <div
      onClick={onPreview}
      style={{
        border: `1.5px solid ${borderColor}`,
        borderRadius: 12,
        background: bgColor,
        padding: '10px 10px 8px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6,
        cursor: 'pointer',
        opacity: owned ? 0.6 : !available && !owned ? 0.5 : 1,
        pointerEvents: 'auto',
        transition: 'transform 0.12s, box-shadow 0.12s',
        position: 'relative',
      }}
      onMouseEnter={(e) => {
        ;(e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'
        ;(e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 16px rgba(200,120,140,0.15)'
      }}
      onMouseLeave={(e) => {
        ;(e.currentTarget as HTMLDivElement).style.transform = ''
        ;(e.currentTarget as HTMLDivElement).style.boxShadow = ''
      }}
    >
      {/* Wishlist */}
      {onToggleWishlist && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onToggleWishlist()
          }}
          style={{
            position: 'absolute',
            top: 5,
            left: 4,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            zIndex: 2,
          }}
        >
          <Heart
            size={13}
            color={isWishlisted ? '#e8607a' : 'rgba(200,120,140,0.4)'}
            fill={isWishlisted ? '#e8607a' : 'none'}
            strokeWidth={2}
          />
        </button>
      )}

      {/* Badge desconto */}
      {discount && !owned && (
        <div
          style={{
            position: 'absolute',
            top: -7,
            right: -7,
            background: '#e8607a',
            color: 'white',
            fontSize: 9,
            fontWeight: 800,
            borderRadius: 20,
            padding: '2px 6px',
            fontFamily: 'Baloo 2, sans-serif',
          }}
        >
          -{discount}%
        </div>
      )}

      {/* Badge owned */}
      {owned && (
        <div
          style={{
            position: 'absolute',
            top: -7,
            right: -7,
            background: 'rgba(74,122,74,0.85)',
            color: 'white',
            fontSize: 9,
            fontWeight: 800,
            borderRadius: 20,
            padding: '2px 7px',
            fontFamily: 'Baloo 2, sans-serif',
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Check size={9} strokeWidth={3} /> comprado
        </div>
      )}

      {/* Imagem */}
      {isCharacter && piece ? (
        <div
          style={{
            width: 64,
            height: 80,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(200,168,180,0.25)',
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

      {/* Label */}
      <span
        style={{
          fontSize: 11,
          color: T.text,
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

      {/* Ação */}
      {owned && !onAddCart ? (
        <span
          style={{
            fontSize: 10,
            color: T.ownedText,
            fontFamily: 'Baloo 2, sans-serif',
            fontWeight: 800,
          }}
        >
          no guarda-roupa
        </span>
      ) : owned && onAddCart ? (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onAddCart()
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
            background: inCart ? 'rgba(74,122,74,0.15)' : T.btnIcon,
            border: `1.5px solid ${inCart ? 'rgba(74,122,74,0.4)' : T.border}`,
            borderRadius: 20,
            padding: '4px 10px',
            width: '100%',
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
        >
          <GiftIcon size={11} color={inCart ? T.ownedText : T.textLabel} strokeWidth={2} />
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 3,
              fontSize: 11,
              fontWeight: 800,
              fontFamily: 'Baloo 2, sans-serif',
              color: inCart ? T.ownedText : T.text,
            }}
          >
            {inCart ? (
              'no carrinho'
            ) : (
              <>
                presentear <PiMoneyWavyLight size={12} />
                {finalCost}
              </>
            )}
          </span>
        </button>
      ) : !available ? (
        <span style={{ fontSize: 10, color: T.textSub, fontFamily: 'Baloo 2, sans-serif' }}>
          indisponível
        </span>
      ) : (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onAddCart?.()
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
            background: inCart ? 'rgba(74,122,74,0.15)' : T.btnIcon,
            border: `1.5px solid ${inCart ? 'rgba(74,122,74,0.4)' : T.border}`,
            borderRadius: 20,
            padding: '4px 10px',
            width: '100%',
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
        >
          <ShoppingCart size={11} color={inCart ? T.ownedText : T.textLabel} strokeWidth={2} />
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 3,
              fontSize: 11,
              fontWeight: 800,
              fontFamily: 'Baloo 2, sans-serif',
              color: inCart ? T.ownedText : T.text,
            }}
          >
            <PiMoneyWavyLight size={13} />
            {discount ? (
              <>
                <span style={{ textDecoration: 'line-through', opacity: 0.4, fontSize: 9 }}>
                  {cost}
                </span>{' '}
                {finalCost}
              </>
            ) : (
              finalCost
            )}
          </span>
        </button>
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
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span
          style={{
            fontSize: 9,
            fontWeight: 800,
            color: cute ? T.cuteText : T.textLabel,
            fontFamily: 'Baloo 2, sans-serif',
            textTransform: 'uppercase',
            letterSpacing: '0.8px',
            whiteSpace: 'nowrap',
          }}
        >
          {label}
        </span>
        <div
          style={{
            flex: 1,
            borderTop: cute
              ? '2px dashed rgba(180,140,220,0.35)'
              : '2px dashed rgba(232,160,176,0.4)',
          }}
        />
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
          gap: 8,
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
  canAfford,
  hasPartner,
  giftMode,
  giftMessage,
  onGiftModeChange,
  onGiftMessageChange,
  giftColor,
  onGiftColorChange,
  onConfirm,
  onCancel,
}: {
  label: string
  cost: number
  coins: number
  canAfford: boolean
  hasPartner: boolean
  giftMode: boolean
  giftMessage: string
  onGiftModeChange: (v: boolean) => void
  onGiftMessageChange: (v: string) => void
  giftColor: Gift['color']
  onGiftColorChange: (v: Gift['color']) => void
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 300,
        background: 'rgba(61,26,16,0.35)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backdropFilter: 'blur(4px)',
      }}
      onClick={onCancel}
    >
      <div
        style={{
          background: T.bg,
          borderRadius: 20,
          maxWidth: 300,
          width: '90%',
          boxShadow: T.shadow,
          border: T.borderVal,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          overflow: 'hidden',
          fontFamily: 'Baloo 2, sans-serif',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '24px 20px 16px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 10,
            borderBottom: T.borderDashed,
          }}
        >
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: '50%',
              background: canAfford ? 'rgba(74,122,74,0.15)' : 'rgba(232,96,122,0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {canAfford ? (
              <ShoppingBag size={22} color={T.ownedText} strokeWidth={2} />
            ) : (
              <PiMoneyWavyLight size={26} color={T.btnDestructiveText} />
            )}
          </div>
          <span
            style={{
              fontSize: 15,
              fontWeight: 800,
              color: T.text,
              textAlign: 'center',
            }}
          >
            {canAfford
              ? giftMode
                ? `presentear — ${label}?`
                : `comprar — ${label}?`
              : 'moedas insuficientes'}
          </span>
        </div>

        {/* Body */}
        <div
          style={{ padding: '16px 20px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}
        >
          {/* Custo */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: T.card,
              borderRadius: 10,
              padding: '7px 12px',
              border: T.cardBorder,
            }}
          >
            <span style={{ fontSize: 12, color: T.textSub, fontWeight: 600 }}>custo</span>
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                fontWeight: 800,
                fontSize: 14,
                color: T.text,
              }}
            >
              <PiMoneyWavyLight size={15} />
              {cost}
            </span>
          </div>

          {!canAfford && (
            <p
              style={{
                margin: 0,
                textAlign: 'center',
                fontSize: 12,
                color: T.textSub,
                lineHeight: 1.5,
              }}
            >
              continue cuidando do jardim para ganhar mais moedas
            </p>
          )}

          {/* Modo presente */}
          {hasPartner && canAfford && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button
                onClick={() => onGiftModeChange(!giftMode)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 7,
                  padding: '7px 12px',
                  borderRadius: 10,
                  border: `1.5px solid ${giftMode ? 'rgba(232,96,122,0.5)' : T.border}`,
                  background: giftMode ? 'rgba(232,96,122,0.08)' : T.card,
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: 700,
                  fontFamily: 'Baloo 2, sans-serif',
                  color: giftMode ? '#e8607a' : T.textSub,
                  transition: 'all 0.15s',
                }}
              >
                <GiftIcon size={13} color={giftMode ? '#e8607a' : T.textLabel} strokeWidth={2} />
                dar de presente
              </button>
              {giftMode && (
                <>
                  <textarea
                    placeholder="escreva um bilhete..."
                    value={giftMessage}
                    onChange={(e) => onGiftMessageChange(e.target.value)}
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: 10,
                      border: T.borderVal,
                      fontFamily: 'Baloo 2, sans-serif',
                      fontSize: 12,
                      fontWeight: 600,
                      color: T.text,
                      background: T.card,
                      resize: 'none',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                  <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                    {(
                      [
                        { id: 'purple', color: '#9b59b6' },
                        { id: 'green', color: '#27ae60' },
                        { id: 'white', color: '#ecf0f1' },
                        { id: 'brown', color: '#8b5e3c' },
                        { id: 'red', color: '#e74c3c' },
                        { id: 'blue', color: '#2980b9' },
                      ] as {
                        id: 'purple' | 'green' | 'white' | 'brown' | 'red' | 'blue'
                        color: string
                      }[]
                    ).map((c) => (
                      <button
                        key={c.id}
                        onClick={() => onGiftColorChange(c.id)}
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: '50%',
                          background: c.color,
                          border:
                            giftColor === c.id ? `3px solid ${T.text}` : '2px solid transparent',
                          cursor: 'pointer',
                          padding: 0,
                          outline: 'none',
                          transition: 'transform 0.12s',
                          transform: giftColor === c.id ? 'scale(1.2)' : 'scale(1)',
                        }}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Botões */}
          <div style={{ display: 'flex', gap: 8, marginTop: 2 }}>
            <button
              onClick={onCancel}
              style={{
                flex: 1,
                padding: '9px 0',
                borderRadius: 12,
                border: T.borderVal,
                background: 'transparent',
                fontFamily: 'Baloo 2, sans-serif',
                fontWeight: 800,
                fontSize: 13,
                cursor: 'pointer',
                color: T.textSub,
              }}
            >
              {canAfford ? 'cancelar' : 'fechar'}
            </button>
            {canAfford && (
              <button
                onClick={onConfirm}
                style={{
                  flex: 1,
                  padding: '9px 0',
                  borderRadius: 12,
                  border: 'none',
                  background: giftMode ? 'rgba(232,96,122,0.18)' : T.btnPrimary,
                  fontFamily: 'Baloo 2, sans-serif',
                  fontWeight: 800,
                  fontSize: 13,
                  cursor: 'pointer',
                  color: giftMode ? '#e8607a' : T.text,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 5,
                }}
              >
                {giftMode ? (
                  <>
                    <GiftIcon size={12} strokeWidth={2} /> presentear
                  </>
                ) : (
                  <>
                    <Check size={12} strokeWidth={2.5} /> comprar
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// PAINEL LATERAL (preview / carrinho)
// ─────────────────────────────────────────────

function SidePanel({
  open,
  children,
  btnY,
  onToggle,
  onMouseDown,
  icon,
  label,
}: {
  open: boolean
  children: React.ReactNode
  btnY: number
  onToggle: () => void
  onMouseDown: (e: React.MouseEvent) => void
  icon: React.ReactNode
  label: string
}) {
  return (
    <div style={{ position: 'relative', flexShrink: 0, zIndex: 51 }}>
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: btnY,
          display: 'flex',
          alignItems: 'stretch',
          flexDirection: 'row',
        }}
      >
        {open && (
          <div
            style={{
              width: 260,
              background:
                'linear-gradient(160deg, rgba(253,246,240,0.98) 0%, rgba(252,232,238,0.98) 100%)',
              border: T.borderVal,
              borderLeft: 'none',
              borderRadius: '0 0 14px 0',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {children}
          </div>
        )}
        {/* Aba arrastável */}
        <button
          onClick={onToggle}
          onMouseDown={onMouseDown}
          style={{
            width: 28,
            height: 72,
            background:
              'linear-gradient(160deg, rgba(253,246,240,0.97) 0%, rgba(252,232,238,0.97) 100%)',
            border: T.borderVal,
            borderLeft: 'none',
            borderRadius: '0 12px 12px 0',
            cursor: 'grab',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: T.textLabel,
            fontSize: 9,
            fontFamily: 'Baloo 2, sans-serif',
            fontWeight: 800,
            writingMode: 'vertical-rl',
            letterSpacing: '0.8px',
            flexShrink: 0,
            userSelect: 'none',
            gap: 4,
            textTransform: 'uppercase',
          }}
        >
          {icon}
          {label}
        </button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// CARRINHO LABEL
// ─────────────────────────────────────────────

function CartHeader({ label }: { label: string }) {
  return (
    <div
      style={{
        padding: '5px 10px',
        fontSize: 9,
        fontWeight: 800,
        color: T.textLabel,
        textTransform: 'uppercase',
        letterSpacing: '0.8px',
        fontFamily: 'Baloo 2, sans-serif',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        borderTop: T.borderDashed,
        background: 'rgba(232,160,176,0.08)',
      }}
    >
      <ShoppingCart size={10} strokeWidth={2} />
      {label}
    </div>
  )
}

// ─────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────

interface ShopModalProps {
  uid: string
  initialItemId?: string
  partnerUid?: string
  partnerName?: string
  myName?: string
  onClose: () => void
}

export function ShopModal({ uid, initialItemId, partnerUid, myName, onClose }: ShopModalProps) {
  console.log('ShopModal uid:', uid)
  const { coins, characterOwned, wishlist, buy, isOwned, toggleWishlist } = useShop(uid)
  const [partnerOwned, setPartnerOwned] = useState<Set<string>>(new Set())
  useEffect(() => {
    if (!partnerUid) return
    return subscribePartnerInventory(partnerUid, setPartnerOwned)
  }, [partnerUid])
  console.log('characterOwned', [...characterOwned])

  const [mainTab, setMainTab] = useState<MainTab>('casa')
  const [houseSubTab, setHouseSubTab] = useState<HouseSubTab>('floor')
  const [charSubTab, setCharSubTab] = useState<string>('top')
  const [confirm, setConfirm] = useState<ConfirmState>({ item: null, piece: null, open: false })
  const [feedback, setFeedback] = useState<{ msg: string } | null>(null)
  const [ownedStickers, setOwnedStickers] = useState<OwnedStickers>({})
  const [expandedPack, setExpandedPack] = useState<string | null>(null)
  const [stickerBuying, setStickerBuying] = useState(false)
  const [stickerConfirm, setStickerConfirm] = useState<{
    open: boolean
    type: 'pack' | 'sticker'
    packId?: string
    stickerKey?: string
    label: string
    cost: number
  } | null>(null)

  useEffect(() => {
    return subscribeOwnedStickers(uid, setOwnedStickers)
  }, [uid])

  const handleBuyPack = (packId: string) => {
    const pack = STICKER_PACKS.find((p) => p.id === packId)
    if (!pack) return
    setStickerConfirm({ open: true, type: 'pack', packId, label: pack.label, cost: pack.price })
  }

  const handleBuyStickerIndividual = (stickerKey: string) => {
    const price = getStickerIndividualPrice(stickerKey)
    const pack = STICKER_PACKS.find((p) => p.stickers.some((s) => s.key === stickerKey))
    const label = pack?.stickers.find((s) => s.key === stickerKey)?.key ?? stickerKey
    setStickerConfirm({ open: true, type: 'sticker', stickerKey, label, cost: price })
  }

  const handleStickerConfirm = async () => {
    if (!stickerConfirm) return
    setStickerConfirm(null)
    setStickerBuying(true)

    let result: { success: boolean; error?: string }
    if (stickerConfirm.type === 'pack' && stickerConfirm.packId) {
      result = await buyPack(uid, stickerConfirm.packId, coins)
      if (result.success) setFeedback({ msg: 'pack desbloqueado!' })
    } else if (stickerConfirm.type === 'sticker' && stickerConfirm.stickerKey) {
      result = await buySticker(uid, stickerConfirm.stickerKey, coins)
      if (result.success) setFeedback({ msg: 'sticker desbloqueado!' })
    } else {
      result = { success: false }
    }

    setStickerBuying(false)
    if (!result.success) setFeedback({ msg: result.error ?? 'erro ao comprar' })
    setTimeout(() => setFeedback(null), 2500)
  }

  const [giftMode, setGiftMode] = useState(false)
  const [giftMessage, setGiftMessage] = useState('')
  const [giftColor, setGiftColor] = useState<Gift['color']>('purple')

  useEffect(() => {
    if (!initialItemId) return
    const houseItem = SHOP_HOUSE_ITEMS.find((i) => i.id === initialItemId)
    if (houseItem) {
      setMainTab('casa')
      if (houseItem.category === 'floor') setHouseSubTab('floor')
      else if (houseItem.category === 'wall') setHouseSubTab('wall')
      else if (houseItem.category === 'background') setHouseSubTab('background')
      setHouseCart([houseItem])
      setPreviewOpen(true)
      return
    }
    const piece = getCharacterShopPieces().find((p) => p.id === initialItemId)
    if (piece) {
      setMainTab('roupas')
      setCharSubTab(piece.category)
      setClothesCart([piece])
      setClothesPreviewOpen(true)
      return
    }
    const stickerPack = STICKER_PACKS.find((p) => p.id === initialItemId)
    if (stickerPack) {
      setMainTab('stickers')
      setExpandedPack(initialItemId)
      return
    }
  }, [initialItemId])

  const [cart, setCart] = useState<CharacterPiece[]>([])
  const [clothesCart, setClothesCart] = useState<CharacterPiece[]>([])
  const [houseCart, setHouseCart] = useState<ShopItem[]>([])
  const [tryOnVariants, setTryOnVariants] = useState<Record<string, string>>({})
  const tryOnVariant = tryOnVariants[charSubTab] ?? 'b'
  const setTryOnVariant = (v: string) => setTryOnVariants((prev) => ({ ...prev, [charSubTab]: v }))

  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewScale, setPreviewScale] = useState(0.4)
  const [previewOffset, setPreviewOffset] = useState({ x: 0, y: 0 })
  const previewDragging = useRef(false)
  const previewLastPos = useRef({ x: 0, y: 0 })
  const previewSceneRef = useRef<HTMLDivElement>(null)
  const previewScaleRef = useRef(0.4)
  const [previewBtnY, setPreviewBtnY] = useState(100)
  const btnDragging = useRef(false)
  const btnLastY = useRef(0)

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

  useEffect(() => {
    const el = previewSceneRef.current
    if (!el) return
    const handler = (e: WheelEvent) => {
      e.preventDefault()
      previewScaleRef.current = Math.min(
        1.5,
        Math.max(0.2, previewScaleRef.current - e.deltaY * 0.001)
      )
      setPreviewScale(previewScaleRef.current)
    }
    el.addEventListener('wheel', handler, { passive: false })
    return () => el.removeEventListener('wheel', handler)
  }, [])

  const addToClothesCart = (piece: CharacterPiece) => {
    if (clothesCart.find((p) => p.id === piece.id)) return
    setClothesCart((prev) => [...prev, piece])
  }

  const removeFromClothesCart = (pieceId: string) => {
    setClothesCart((prev) => prev.filter((p) => p.id !== pieceId))
  }
  const clothesCartUnowned = clothesCart.filter((p) => !characterOwned.has(p.id))
  const clothesCartTotal = clothesCartUnowned.reduce((sum, p) => sum + (p.cost ?? 0), 0)
  const clothesCartForPartner = clothesCart.filter((p) => !partnerOwned.has(p.id))
  const clothesCartForPartnerTotal = clothesCartForPartner.reduce(
    (sum, p) => sum + (p.cost ?? 0),
    0
  )

  const toggleHouseCart = (item: ShopItem) => {
    setHouseCart((prev) =>
      prev.find((i) => i.id === item.id) ? prev.filter((i) => i.id !== item.id) : [...prev, item]
    )
  }
  const houseCartTotal = houseCart.reduce((sum, i) => sum + getDiscountedCost(i), 0)

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
    'bottom_over',
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

  const handleBuyHouse = (item: ShopItem) => setConfirm({ item, piece: null, open: true })
  const handleBuyPiece = (piece: CharacterPiece) => setConfirm({ item: null, piece, open: true })

  const handleConfirm = async () => {
    const { item, piece, isCart, isClothesCart } = confirm
    setConfirm({ item: null, piece: null, open: false })

    if (giftMode && partnerUid) {
      const itemsToGift: ShopItem[] = confirm.isCart
        ? houseCart
        : confirm.isClothesCart
          ? clothesCartForPartner.map((p) => ({
              id: p.id,
              label: p.label,
              category: 'character' as const,
              tier: 'common' as const,
              cost: p.cost ?? 0,
            }))
          : item
            ? [item]
            : piece
              ? [
                  {
                    id: piece.id,
                    label: piece.label,
                    category: 'character' as const,
                    tier: 'common' as const,
                    cost: piece.cost ?? 0,
                  },
                ]
              : []

      if (itemsToGift.length === 0) return
      const result = await sendGift(
        uid,
        myName ?? '',
        partnerUid,
        itemsToGift,
        giftMessage,
        giftColor
      )
      setGiftMode(false)
      setGiftMessage('')
      if (result.success) {
        if (confirm.isCart) setHouseCart([])
        if (confirm.isClothesCart) setClothesCart([])
        setFeedback({ msg: 'presente enviado!' })
        setTimeout(() => setFeedback(null), 2500)
      }
      return
    }

    if (isCart) {
      let successCount = 0
      for (const i of houseCart) {
        const result = await buy(i as ShopItem)
        if (result.success) successCount++
      }
      if (successCount > 0) {
        setHouseCart([])
        setFeedback({
          msg: `${successCount} ${successCount === 1 ? 'item comprado' : 'itens comprados'}!`,
        })
        setTimeout(() => setFeedback(null), 2500)
      }
      return
    }

    if (isClothesCart) {
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
          msg: `${successCount} ${successCount === 1 ? 'item comprado' : 'itens comprados'}!`,
        })
        setTimeout(() => setFeedback(null), 2500)
      }
      return
    }

    let result: BuyResult
    let resultLabel = ''

    if (item) {
      result = await buy(item)
      resultLabel = item.label
    } else if (piece) {
      const tempItem: ShopItem = {
        id: piece.id,
        label: piece.label,
        category: 'character',
        tier: 'common',
        cost: piece.cost ?? 0,
      }
      result = await buy(tempItem)
      resultLabel = piece.label
    } else return

    if (result.success) {
      setFeedback({ msg: `${resultLabel} comprado!` })
      setTimeout(() => setFeedback(null), 2500)
    }
  }

  const confirmCost = confirm.isCart
    ? houseCartTotal
    : confirm.isClothesCart
      ? confirm.isGift
        ? clothesCartForPartnerTotal
        : clothesCartTotal
      : confirm.item
        ? getDiscountedCost(confirm.item)
        : (confirm.piece?.cost ?? 0)
  const confirmLabel = confirm.isCart
    ? `${houseCart.length} ${houseCart.length === 1 ? 'item' : 'itens'}`
    : confirm.isClothesCart
      ? confirm.isGift
        ? `${clothesCartForPartner.length} ${clothesCartForPartner.length === 1 ? 'item' : 'itens'}`
        : `${clothesCartUnowned.length} ${clothesCartUnowned.length === 1 ? 'item' : 'itens'}`
      : (confirm.item?.label ?? confirm.piece?.label ?? '')
  const confirmCanAfford = coins >= confirmCost

  // ── Estilo botão de carrinho/compra ──
  const cartBtnStyle = (enabled: boolean, gift?: boolean): React.CSSProperties => ({
    width: '100%',
    padding: '6px 0',
    borderRadius: 10,
    border: 'none',
    background: !enabled ? 'rgba(232,160,176,0.2)' : gift ? 'rgba(232,96,122,0.12)' : T.btnPrimary,
    color: !enabled ? T.textSub : gift ? '#e8607a' : T.text,
    fontFamily: 'Baloo 2, sans-serif',
    fontWeight: 800,
    fontSize: 11,
    cursor: enabled ? 'pointer' : 'not-allowed',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    transition: 'all 0.15s',
  })

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        top: 32,
        zIndex: 100,
        background: T.bg,
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
          borderBottom: T.borderDashed,
          background: 'rgba(253,246,240,0.8)',
          flexShrink: 0,
        }}
      >
        <button
          onClick={onClose}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: '5px 12px 5px 8px',
            borderRadius: 10,
            border: T.borderVal,
            background: T.btnIcon,
            color: T.text,
            fontSize: 12,
            fontWeight: 800,
            fontFamily: 'Baloo 2, sans-serif',
            cursor: 'pointer',
          }}
        >
          <ChevronLeft size={15} strokeWidth={2.5} />
          voltar
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <ShoppingBag size={15} color="rgba(200,120,140,0.7)" strokeWidth={2} />
          <span style={{ fontSize: 15, fontWeight: 800, color: T.text }}>loja</span>
        </div>

        {/* Moedas */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            background: T.card,
            border: T.borderVal,
            borderRadius: 20,
            padding: '4px 12px',
            fontWeight: 800,
            fontSize: 14,
            color: T.text,
          }}
        >
          <PiMoneyWavyLight size={17} />
          {coins}
        </div>
      </div>

      {/* ── TABS PRINCIPAIS ── */}
      <div
        style={{
          display: 'flex',
          gap: 6,
          padding: '10px 16px',
          borderBottom: T.borderDashed,
          background: 'rgba(253,242,246,0.5)',
          flexShrink: 0,
        }}
      >
        {(
          [
            { key: 'casa', label: 'ambiente', icon: <Layers size={13} strokeWidth={2} /> },
            { key: 'roupas', label: 'roupas', icon: <Shirt size={13} strokeWidth={2} /> },
            { key: 'stickers', label: 'stickers', icon: <Sticker size={13} strokeWidth={2} /> },
          ] as { key: MainTab; label: string; icon: React.ReactNode }[]
        ).map((tab) => {
          const isActive = mainTab === tab.key
          return (
            <button
              key={tab.key}
              onClick={() => setMainTab(tab.key)}
              style={{
                padding: '4px 16px',
                borderRadius: 20,
                border: isActive ? `1.5px solid ${T.selectedBorder}` : T.borderVal,
                background: isActive ? T.btnPrimary : T.btnIcon,
                color: T.text,
                fontSize: 12,
                fontWeight: isActive ? 800 : 600,
                fontFamily: 'Baloo 2, sans-serif',
                cursor: 'pointer',
                transition: 'all 0.15s',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              {tab.icon} {tab.label}
            </button>
          )
        })}
      </div>

      {/* ── CONTEÚDO ── */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {/* ───── ABA STICKERS ───── */}
        {mainTab === 'stickers' && (
          <div
            className="shop-scroll"
            style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '16px 20px 32px' }}
          >
            {STICKER_PACKS.map((pack) => {
              const fullyOwned = isPackFullyOwned(pack.id, ownedStickers)
              const isExpanded = expandedPack === pack.id
              const ownedCount = pack.stickers.filter((s) => ownedStickers[s.key]).length
              const canAffordPack = coins >= pack.price

              return (
                <div
                  key={pack.id}
                  style={{
                    marginBottom: 12,
                    border: `1.5px solid ${fullyOwned ? T.ownedBorder : T.border}`,
                    borderRadius: 14,
                    background: fullyOwned ? T.ownedBg : T.card,
                    overflow: 'hidden',
                  }}
                >
                  {/* Cabeçalho do pack */}
                  <div
                    onClick={() => setExpandedPack(isExpanded ? null : pack.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '10px 14px',
                      cursor: 'pointer',
                    }}
                  >
                    {/* Preview */}
                    <div
                      style={{
                        width: 52,
                        height: 52,
                        borderRadius: 10,
                        background: 'rgba(232,160,176,0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        overflow: 'hidden',
                      }}
                    >
                      <img
                        src={`./stickers/${pack.preview}`}
                        style={{ width: 56, height: 56, objectFit: 'contain' }}
                        alt={pack.label}
                      />
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}
                      >
                        <span
                          style={{
                            fontSize: 13,
                            fontWeight: 800,
                            color: T.text,
                            fontFamily: 'Baloo 2, sans-serif',
                          }}
                        >
                          {pack.label}
                        </span>
                        {fullyOwned && (
                          <span
                            style={{
                              fontSize: 9,
                              fontWeight: 800,
                              color: T.ownedText,
                              background: T.ownedBg,
                              border: `1px solid ${T.ownedBorder}`,
                              borderRadius: 20,
                              padding: '1px 7px',
                              fontFamily: 'Baloo 2, sans-serif',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 3,
                            }}
                          >
                            <Check size={9} strokeWidth={3} /> completo
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span
                          style={{
                            fontSize: 11,
                            color: T.textSub,
                            fontFamily: 'Baloo 2, sans-serif',
                            fontWeight: 600,
                          }}
                        >
                          {ownedCount}/{pack.stickers.length} stickers
                        </span>
                        {!fullyOwned && (
                          <span
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 3,
                              fontSize: 11,
                              fontWeight: 800,
                              color: T.text,
                              fontFamily: 'Baloo 2, sans-serif',
                            }}
                          >
                            <PiMoneyWavyLight size={12} /> {pack.price}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Botão comprar pack */}
                    {!fullyOwned && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleBuyPack(pack.id)
                        }}
                        disabled={stickerBuying || !canAffordPack}
                        style={{
                          padding: '6px 14px',
                          borderRadius: 20,
                          border: 'none',
                          background: canAffordPack ? T.btnPrimary : 'rgba(232,160,176,0.2)',
                          color: canAffordPack ? T.text : T.textSub,
                          fontFamily: 'Baloo 2, sans-serif',
                          fontWeight: 800,
                          fontSize: 11,
                          cursor: canAffordPack ? 'pointer' : 'not-allowed',
                          flexShrink: 0,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          transition: 'all 0.15s',
                        }}
                      >
                        <ShoppingCart size={11} strokeWidth={2} />
                        pack
                      </button>
                    )}
                  </div>

                  {/* Grid de stickers expandido */}
                  {isExpanded && (
                    <div style={{ borderTop: T.borderDashed, padding: '10px 14px 14px' }}>
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fill, minmax(72px, 1fr))',
                          gap: 8,
                        }}
                      >
                        {pack.stickers.map((sticker) => {
                          const owned = !!ownedStickers[sticker.key]
                          const indivPrice = getStickerIndividualPrice(sticker.key)
                          const canAfford = coins >= indivPrice
                          return (
                            <div
                              key={sticker.key}
                              style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: 4,
                                padding: '8px 4px 6px',
                                borderRadius: 10,
                                border: `1.5px solid ${owned ? T.ownedBorder : T.border}`,
                                background: owned ? T.ownedBg : T.card,
                                position: 'relative',
                              }}
                            >
                              {/* Imagem */}
                              <div style={{ position: 'relative', width: 60, height: 60 }}>
                                <img
                                  src={`./stickers/${sticker.file}`}
                                  style={{
                                    width: 60,
                                    height: 60,
                                    objectFit: 'contain',
                                    filter: owned ? 'none' : 'grayscale(1) opacity(0.4)',
                                  }}
                                  alt={sticker.key}
                                />
                                {!owned && (
                                  <div
                                    style={{
                                      position: 'absolute',
                                      inset: 0,
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                    }}
                                  >
                                    <Lock size={14} color="rgba(122,48,64,0.5)" strokeWidth={2} />
                                  </div>
                                )}
                              </div>

                              {/* Ação */}
                              {owned ? (
                                <span
                                  style={{
                                    fontSize: 9,
                                    fontWeight: 800,
                                    color: T.ownedText,
                                    fontFamily: 'Baloo 2, sans-serif',
                                  }}
                                >
                                  desbloq.
                                </span>
                              ) : (
                                <button
                                  onClick={() => handleBuyStickerIndividual(sticker.key)}
                                  disabled={stickerBuying || !canAfford}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 2,
                                    padding: '2px 6px',
                                    borderRadius: 20,
                                    border: 'none',
                                    background: canAfford ? T.btnIcon : 'rgba(232,160,176,0.1)',
                                    color: canAfford ? T.text : T.textSub,
                                    fontSize: 9,
                                    fontWeight: 800,
                                    fontFamily: 'Baloo 2, sans-serif',
                                    cursor: canAfford ? 'pointer' : 'not-allowed',
                                  }}
                                >
                                  <PiMoneyWavyLight size={10} /> {indivPrice}
                                </button>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
        {/* ───── ABA AMBIENTE ───── */}
        {mainTab === 'casa' && (
          <div style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>
            {/* Painel lateral preview */}
            <SidePanel
              open={previewOpen}
              btnY={previewBtnY}
              onToggle={() => setPreviewOpen((v) => !v)}
              onMouseDown={(e) => {
                btnDragging.current = true
                btnLastY.current = e.clientY
                e.preventDefault()
                e.stopPropagation()
              }}
              icon={
                houseCart.length > 0 ? (
                  <ShoppingCart size={11} strokeWidth={2} />
                ) : (
                  <Eye size={11} strokeWidth={2} />
                )
              }
              label={houseCart.length > 0 ? 'carrinho' : 'preview'}
            >
              {/* Cena */}
              <div
                ref={previewSceneRef}
                style={{
                  height: 280,
                  flexShrink: 0,
                  overflow: 'hidden',
                  cursor: 'grab',
                  position: 'relative',
                  background: (BACKGROUNDS.find((b) => b.id === previewBg) ?? BACKGROUNDS[0]).css,
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
                {(() => {
                  const activeBg = BACKGROUNDS.find((b) => b.id === previewBg) ?? BACKGROUNDS[0]
                  return activeBg.svg ? (
                    <div
                      dangerouslySetInnerHTML={{ __html: activeBg.svg }}
                      style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}
                    />
                  ) : null
                })()}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1,
                  }}
                >
                  <div
                    style={{
                      transform: `translate(${previewOffset.x}px, ${previewOffset.y}px) scale(${previewScale})`,
                      transformOrigin: 'center center',
                      willChange: 'transform',
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
                    display: 'flex',
                    flexDirection: 'column',
                    maxHeight: 260,
                    flexShrink: 0,
                  }}
                >
                  <CartHeader label="carrinho" />
                  <div
                    className="shop-scroll"
                    style={{
                      overflowY: 'auto',
                      padding: '4px 10px',
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
                          padding: '3px 0',
                          borderBottom: T.borderDashed,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 11,
                            color: T.text,
                            flex: 1,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            fontFamily: 'Baloo 2, sans-serif',
                            fontWeight: 600,
                          }}
                        >
                          {i.category === 'floor'
                            ? 'piso'
                            : i.category === 'wall'
                              ? 'parede'
                              : 'fundo'}{' '}
                          — {i.label}
                        </span>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 800,
                            color: T.text,
                            flexShrink: 0,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            fontFamily: 'Baloo 2, sans-serif',
                          }}
                        >
                          <PiMoneyWavyLight size={12} />
                          {getDiscountedCost(i)}
                        </span>
                        <button
                          onClick={() => setHouseCart((prev) => prev.filter((x) => x.id !== i.id))}
                          style={{
                            width: 18,
                            height: 18,
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
                          <X size={10} strokeWidth={2.5} color="rgba(122,48,64,0.7)" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Total + botões */}
                  <div
                    style={{
                      padding: '6px 10px',
                      borderTop: T.borderDashed,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 800,
                        color: T.textLabel,
                        textTransform: 'uppercase',
                        letterSpacing: '0.8px',
                        fontFamily: 'Baloo 2, sans-serif',
                      }}
                    >
                      total
                    </span>
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 800,
                        color: T.text,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 3,
                        fontFamily: 'Baloo 2, sans-serif',
                      }}
                    >
                      <PiMoneyWavyLight size={14} />
                      {houseCartTotal}
                    </span>
                  </div>
                  <div
                    style={{
                      padding: '0 10px 8px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 5,
                    }}
                  >
                    <button
                      onClick={() =>
                        setConfirm({ item: houseCart[0], piece: null, open: true, isCart: true })
                      }
                      style={cartBtnStyle(coins >= houseCartTotal)}
                    >
                      <Check size={11} strokeWidth={2.5} /> comprar tudo
                    </button>
                    {partnerUid && (
                      <button
                        onClick={() => {
                          setGiftMode(true)
                          setConfirm({ item: houseCart[0], piece: null, open: true, isCart: true })
                        }}
                        style={cartBtnStyle(coins >= houseCartTotal, true)}
                      >
                        <GiftIcon size={11} strokeWidth={2} /> presentear
                      </button>
                    )}
                    <button
                      onClick={() => setHouseCart([])}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: 10,
                        color: T.textSub,
                        fontFamily: 'Baloo 2, sans-serif',
                        textDecoration: 'underline',
                        textAlign: 'center',
                      }}
                    >
                      limpar carrinho
                    </button>
                  </div>
                </div>
              )}
            </SidePanel>

            {/* Grid + sub-tabs */}
            <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              {/* Sub-tabs */}
              <div style={{ display: 'flex', gap: 6, padding: '10px 16px 0', flexShrink: 0 }}>
                {(
                  [
                    { key: 'floor', label: 'pisos' },
                    { key: 'wall', label: 'paredes' },
                    { key: 'background', label: 'fundos' },
                  ] as { key: HouseSubTab; label: string }[]
                ).map((sub) => {
                  const active = houseSubTab === sub.key
                  return (
                    <button
                      key={sub.key}
                      onClick={() => setHouseSubTab(sub.key)}
                      style={{
                        padding: '4px 14px',
                        borderRadius: 20,
                        border: active ? `1.5px solid ${T.selectedBorder}` : T.borderVal,
                        background: active ? T.selectedBg : 'transparent',
                        color: T.text,
                        fontFamily: 'Baloo 2, sans-serif',
                        fontWeight: active ? 800 : 600,
                        fontSize: 12,
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}
                    >
                      {sub.label}
                    </button>
                  )
                })}
              </div>

              <div
                className="shop-scroll"
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
                              if (t) {
                                setPreviewFloor(t)
                                setPreviewOpen(true)
                              }
                            }}
                            onAddCart={() => toggleHouseCart(item)}
                            inCart={houseCart.some((i) => i.id === id)}
                            isWishlisted={wishlist.has(id)}
                            onToggleWishlist={() => toggleWishlist(id)}
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
                              if (t) {
                                setPreviewWall(t)
                                setPreviewOpen(true)
                              }
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
                  <Section label="fundos">
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
                            onPreview={() => {
                              setPreviewBg(item.id.replace('bg_', ''))
                              setPreviewOpen(true)
                            }}
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
          <div style={{ flex: 1, overflow: 'hidden', display: 'flex', height: '100%' }}>
            {/* Painel lateral provador */}
            <SidePanel
              open={clothesPreviewOpen}
              btnY={clothesBtnY}
              onToggle={() => setClothesPreviewOpen((v) => !v)}
              onMouseDown={(e) => {
                clothesBtnDragging.current = true
                clothesBtnLastY.current = e.clientY
                e.preventDefault()
                e.stopPropagation()
              }}
              icon={
                clothesCart.length > 0 ? (
                  <ShoppingCart size={11} strokeWidth={2} />
                ) : (
                  <Eye size={11} strokeWidth={2} />
                )
              }
              label={clothesCart.length > 0 ? 'carrinho' : 'provador'}
            >
              {/* Manequim */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '12px 8px 8px',
                  gap: 8,
                  background: 'rgba(200,168,180,0.18)',
                  borderBottom: T.borderDashed,
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
                      border: T.borderVal,
                      borderRadius: 20,
                      padding: '3px 10px',
                      fontSize: 11,
                      fontWeight: 700,
                      fontFamily: 'Baloo 2, sans-serif',
                      color: T.textSub,
                      cursor: 'pointer',
                    }}
                  >
                    <X size={10} strokeWidth={2.5} /> tirar tudo
                  </button>
                )}
              </div>

              {/* Carrinho de roupas */}
              {clothesCart.length > 0 && (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    maxHeight: 260,
                    flexShrink: 0,
                  }}
                >
                  <CartHeader label="carrinho" />
                  <div
                    className="shop-scroll"
                    style={{
                      overflowY: 'auto',
                      padding: '4px 10px',
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
                            padding: '3px 0',
                            borderBottom: T.borderDashed,
                          }}
                        >
                          <span
                            style={{
                              fontSize: 11,
                              color: T.text,
                              flex: 1,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              fontFamily: 'Baloo 2, sans-serif',
                              fontWeight: 600,
                            }}
                          >
                            {getCharSections().find((s) => s.key === p.category)?.label ??
                              p.category}{' '}
                            — {p.label}
                          </span>
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 800,
                              color: alreadyOwned ? T.ownedText : T.text,
                              flexShrink: 0,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 2,
                              fontFamily: 'Baloo 2, sans-serif',
                            }}
                          >
                            {alreadyOwned ? (
                              <Check size={11} strokeWidth={2.5} />
                            ) : (
                              <>
                                <PiMoneyWavyLight size={12} />
                                {p.cost ?? 0}
                              </>
                            )}
                          </span>
                          <button
                            onClick={() => removeFromClothesCart(p.id)}
                            style={{
                              width: 18,
                              height: 18,
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
                            <X size={10} strokeWidth={2.5} color="rgba(122,48,64,0.7)" />
                          </button>
                        </div>
                      )
                    })}
                  </div>

                  {clothesCart.length > 0 && (
                    <>
                      {clothesCartUnowned.length > 0 && (
                        <div
                          style={{
                            padding: '6px 10px',
                            borderTop: T.borderDashed,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 800,
                              color: T.textLabel,
                              textTransform: 'uppercase',
                              letterSpacing: '0.8px',
                              fontFamily: 'Baloo 2, sans-serif',
                            }}
                          >
                            total
                          </span>
                          <span
                            style={{
                              fontSize: 13,
                              fontWeight: 800,
                              color: T.text,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 3,
                              fontFamily: 'Baloo 2, sans-serif',
                            }}
                          >
                            <PiMoneyWavyLight size={14} />
                            {clothesCartTotal}
                          </span>
                        </div>
                      )}
                      <div
                        style={{
                          padding: '0 10px 8px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 5,
                        }}
                      >
                        {clothesCartUnowned.length > 0 && (
                          <button
                            onClick={() =>
                              setConfirm({
                                item: null,
                                piece: clothesCartUnowned[0],
                                open: true,
                                isClothesCart: true,
                              })
                            }
                            style={cartBtnStyle(coins >= clothesCartTotal)}
                          >
                            <Check size={11} strokeWidth={2.5} /> comprar tudo
                          </button>
                        )}
                        {partnerUid && clothesCartForPartner.length > 0 && (
                          <button
                            onClick={() => {
                              setGiftMode(true)
                              setConfirm({
                                item: null,
                                piece: clothesCartForPartner[0],
                                open: true,
                                isClothesCart: true,
                                isGift: true,
                              })
                            }}
                            style={cartBtnStyle(coins >= clothesCartForPartnerTotal, true)}
                          >
                            <GiftIcon size={11} strokeWidth={2} /> presentear
                          </button>
                        )}
                      </div>
                    </>
                  )}
                  <div style={{ padding: '0 10px 8px', textAlign: 'center' }}>
                    <button
                      onClick={() => setClothesCart([])}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: 10,
                        color: T.textSub,
                        fontFamily: 'Baloo 2, sans-serif',
                        textDecoration: 'underline',
                      }}
                    >
                      limpar carrinho
                    </button>
                  </div>
                </div>
              )}
            </SidePanel>

            {/* Área direita: sub-tabs + grid */}
            <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              {/* Seletor de cor */}
              {charPieces.some((p) => p.hasColor) && (
                <div
                  style={{
                    display: 'flex',
                    gap: 4,
                    flexWrap: 'wrap',
                    padding: '7px 16px',
                    background: 'rgba(253,242,246,0.5)',
                    borderBottom: T.borderDashed,
                    flexShrink: 0,
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
                            ? `2px solid ${T.selectedBorder}`
                            : '2px solid transparent',
                        background: tryOnVariant === v ? T.selectedBg : 'rgba(232,160,176,0.12)',
                        color: T.text,
                        fontSize: 11,
                        fontFamily: 'Baloo 2, sans-serif',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                        fontWeight: tryOnVariant === v ? 800 : 600,
                      }}
                    >
                      {COLOR_VARIANT_LABELS[v]}
                    </button>
                  ))}
                </div>
              )}

              {/* Sub-tabs de categoria */}
              <div
                className="shop-scroll"
                style={{
                  display: 'flex',
                  gap: 6,
                  padding: '10px 16px 0',
                  overflowX: 'auto',
                  flexShrink: 0,
                }}
              >
                {charSections.map((cat) => {
                  const active = charSubTab === cat.key
                  return (
                    <button
                      key={cat.key}
                      onClick={() => setCharSubTab(cat.key)}
                      style={{
                        padding: '4px 14px',
                        borderRadius: 20,
                        whiteSpace: 'nowrap',
                        border: active ? `1.5px solid ${T.selectedBorder}` : T.borderVal,
                        background: active ? T.btnPrimary : T.btnIcon,
                        color: T.text,
                        fontFamily: 'Baloo 2, sans-serif',
                        fontWeight: active ? 800 : 600,
                        fontSize: 12,
                        cursor: 'pointer',
                        flexShrink: 0,
                        transition: 'all 0.15s',
                      }}
                    >
                      {cat.label}
                    </button>
                  )
                })}
              </div>

              {/* Grid de peças */}
              <div
                className="shop-scroll"
                style={{ flex: 1, overflowY: 'auto', padding: '12px 16px 24px' }}
              >
                {charPieces.length === 0 ? (
                  <div
                    style={{
                      textAlign: 'center',
                      color: T.textSub,
                      fontFamily: 'Baloo 2, sans-serif',
                      fontSize: 13,
                      fontWeight: 600,
                      padding: '40px 0',
                    }}
                  >
                    nenhum item nesta categoria
                  </div>
                ) : (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                      gap: 8,
                    }}
                  >
                    {charPieces.map((p) => (
                      <ItemCard
                        key={p.id}
                        id={p.id}
                        label={p.label}
                        cost={p.cost ?? 0}
                        owned={characterOwned.has(p.id)}
                        canAfford={coins >= (p.cost ?? 0)}
                        available={true}
                        isCharacter
                        isSmallPiece={SMALL_PIECE_CATEGORIES.has(p.category)}
                        isMediumPiece={MEDIUM_PIECE_CATEGORIES.has(p.category)}
                        piece={p}
                        selected={cart.some((c) => c.id === p.id)}
                        inCart={clothesCart.some((c) => c.id === p.id)}
                        tryOnVariants={tryOnVariants}
                        onPreview={() => {
                          setCart((prev) => applyExclusion(prev, p))
                          setClothesPreviewOpen(true)
                        }}
                        onAddCart={partnerUid ? () => addToClothesCart(p) : undefined}
                        isWishlisted={wishlist.has(p.id)}
                        onToggleWishlist={() => toggleWishlist(p.id)}
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
            background: T.text,
            color: 'white',
            padding: '9px 20px',
            borderRadius: 20,
            fontFamily: 'Baloo 2, sans-serif',
            fontWeight: 800,
            fontSize: 13,
            zIndex: 400,
            pointerEvents: 'none',
            boxShadow: T.shadow,
            animation: 'shopFadeUp 0.2s ease',
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
          hasPartner={!!partnerUid}
          giftMode={giftMode}
          giftMessage={giftMessage}
          onGiftModeChange={setGiftMode}
          onGiftMessageChange={setGiftMessage}
          giftColor={giftColor}
          onGiftColorChange={setGiftColor}
          onConfirm={handleConfirm}
          onCancel={() => {
            setConfirm({ item: null, piece: null, open: false })
            setGiftMode(false)
            setGiftMessage('')
            setGiftColor('purple')
          }}
        />
      )}

      {stickerConfirm?.open && (
        <ConfirmModal
          label={
            stickerConfirm.type === 'pack' ? `pack ${stickerConfirm.label}` : stickerConfirm.label
          }
          cost={stickerConfirm.cost}
          coins={coins}
          canAfford={coins >= stickerConfirm.cost}
          hasPartner={false}
          giftMode={false}
          giftMessage=""
          onGiftModeChange={() => {}}
          onGiftMessageChange={() => {}}
          giftColor="purple"
          onGiftColorChange={() => {}}
          onConfirm={handleStickerConfirm}
          onCancel={() => setStickerConfirm(null)}
        />
      )}

      <style>{`
        @keyframes shopFadeUp {
          from { opacity: 0; transform: translateX(-50%) translateY(8px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </div>
  )
}
