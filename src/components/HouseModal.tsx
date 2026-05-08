import { useState, useEffect, useRef } from 'react'
import {
  ChevronLeft,
  Save,
  Check,
  Home,
  Layers,
  PaintRoller,
  ChevronRight,
  ImageIcon,
  Lock,
  ShoppingBag,
  Heart,
  X,
  Gift,
  Sparkles,
  Wallpaper,
  Shirt,
  ArrowRight,
} from 'lucide-react'
import { ref, onValue, set } from 'firebase/database'
import { db } from '../lib/firebase'
import {
  subscribeHouseInventory,
  subscribeWishlist,
  subscribeGifts,
  openGift,
  type Gift as GiftType,
} from '../hooks/useShop'
import chestSprite from '../assets/house/treasure_chests.png'
import { HOUSE_TILE_MAP, SHOP_HOUSE_ITEMS } from '../shop/shopPrices'
import type { SheetGroup } from './HouseSceneShared'
import { ALL_PIECES } from '../assets/character/index'
import {
  HouseScene,
  FLOOR_GROUPS,
  WALL_GROUPS,
  BACKGROUNDS,
  DEFAULT_BACKGROUND,
  groupToTiles,
  tileStyle,
  findSheetDims,
  type TileOption,
} from './HouseSceneShared'

// ─────────────────────────────────────────────
// CONSTANTES
// ─────────────────────────────────────────────

interface HouseConfig {
  floor: { sheet: string; col: number; row: number }
  wall: { sheet: string; col: number; row: number }
  wallRight: { sheet: string; col: number; row: number }
  background: string
}

function tileToItemId(sheet: string, col: number, row: number): string | null {
  const entry = Object.entries(HOUSE_TILE_MAP).find(
    ([, v]) => v.sheet === sheet && v.col === col && v.row === row
  )
  return entry ? entry[0] : null
}

function bgToItemId(bgId: string): string {
  return `bg_${bgId}`
}

const DEFAULT_CONFIG: HouseConfig = {
  floor: { sheet: 'base floor/carpet spritesheet.png', col: 1, row: 3 },
  wall: { sheet: 'base walls/walls_paint_grey_stripes.png', col: 0, row: 0 },
  wallRight: { sheet: 'base walls/walls_paint_grey_stripes.png', col: 0, row: 0 },
  background: DEFAULT_BACKGROUND,
}

interface HouseModalProps {
  myUid: string
  partnerUid?: string
  myName?: string
  partnerName?: string
  onClose: () => void
  onOpenShop?: (itemId?: string) => void
}

type HouseTab = 'floor' | 'wall' | 'background'
type WallSide = 'left' | 'right'

// ─────────────────────────────────────────────
// CHEST SPRITE
// ─────────────────────────────────────────────

const CHEST_COLOR_COL: Record<GiftType['color'], number> = {
  purple: 0,
  green: 1,
  white: 2,
  brown: 3,
  red: 4,
  blue: 5,
}

const FRAME_W = 32
const FRAME_H = 32
const SHEET_COLS_CHEST = 6
const DISPLAY_SCALE = 3

function ChestSprite({
  color,
  onClick,
  canOpen,
  resetKey,
}: {
  color: GiftType['color']
  onClick: () => void
  canOpen: boolean
  resetKey: number
}) {
  const [frame, setFrame] = useState(0)
  const [animating, setAnimating] = useState(false)
  const col = CHEST_COLOR_COL[color]

  const idleFrames = [0, 1, 2, 1]
  const openFrames = [3, 4, 5, 6, 8, 9, 10, 11, 12, 13, 7, 7]

  useEffect(() => {
    setAnimating(false)
    setFrame(0)
  }, [resetKey])

  useEffect(() => {
    if (animating) return
    let i = 0
    const interval = setInterval(() => {
      i = (i + 1) % idleFrames.length
      setFrame(idleFrames[i])
    }, 200)
    return () => clearInterval(interval)
  }, [animating])

  const handleClick = () => {
    if (!canOpen || animating) return
    setAnimating(true)
    let i = 0
    const interval = setInterval(() => {
      setFrame(openFrames[i])
      i++
      if (i >= openFrames.length) {
        clearInterval(interval)
        onClick()
      }
    }, 80)
  }

  const displayW = FRAME_W * DISPLAY_SCALE
  const displayH = FRAME_H * DISPLAY_SCALE
  const sheetW = FRAME_W * SHEET_COLS_CHEST * DISPLAY_SCALE
  const sheetH = FRAME_H * 15 * DISPLAY_SCALE

  return (
    <div
      onClick={handleClick}
      style={{
        width: displayW,
        height: displayH,
        backgroundImage: `url(${chestSprite})`,
        backgroundSize: `${sheetW}px ${sheetH}px`,
        backgroundPosition: `-${col * FRAME_W * DISPLAY_SCALE}px -${frame * FRAME_H * DISPLAY_SCALE}px`,
        backgroundRepeat: 'no-repeat',
        imageRendering: 'pixelated',
        cursor: canOpen && !animating ? 'pointer' : 'default',
        filter: canOpen ? 'drop-shadow(0 0 6px rgba(255,220,100,0.7))' : 'brightness(0.7)',
      }}
    />
  )
}

export default function HouseModal({
  myUid,
  partnerUid,
  myName,
  partnerName,
  onClose,
  onOpenShop,
}: HouseModalProps) {
  const [config, setConfig] = useState<HouseConfig>(DEFAULT_CONFIG)
  const [tab, setTab] = useState<HouseTab>('floor')
  const [wallSide, setWallSide] = useState<WallSide>('left')
  const [savedFeedback, setSavedFeedback] = useState(false)
  const [activeFloorGroup, setActiveFloorGroup] = useState(0)
  const [activeWallGroup, setActiveWallGroup] = useState(0)
  const [activeWallRightGroup, setActiveWallRightGroup] = useState(0)
  const [panelOpen, setPanelOpen] = useState(true)
  const [houseOwned, setHouseOwned] = useState<Set<string>>(new Set())
  const [myWishlist, setMyWishlist] = useState<Set<string>>(new Set())
  const [partnerWishlist, setPartnerWishlist] = useState<Set<string>>(new Set())
  const [wishlistOpen, setWishlistOpen] = useState(false)
  const [goToShopConfirm, setGoToShopConfirm] = useState<string | null>(null)
  const [gifts, setGifts] = useState<GiftType[]>([])
  const [activeGift, setActiveGift] = useState<GiftType | null>(null)
  const [chestResetKeys, setChestResetKeys] = useState<Record<string, number>>({})
  const [giftPhase, setGiftPhase] = useState<'message' | 'reveal' | null>(null)
  const [newItems, setNewItems] = useState<Set<string>>(new Set())
  const [seenItems, setSeenItems] = useState<Set<string>>(new Set())

  const [scale, setScale] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const dragging = useRef(false)
  const lastPos = useRef({ x: 0, y: 0 })
  const initialInventoryRef = useRef<Set<string> | null>(null)

  function groupHasNewItem(group: SheetGroup): boolean {
    return [...newItems].some((id) => {
      const info = HOUSE_TILE_MAP[id]
      if (!info) return false
      if (group.sheets) return group.sheets.some((s) => s.sheet === info.sheet)
      return group.sheet === info.sheet
    })
  }

  useEffect(() => {
    const r = ref(db, 'house/config')
    return onValue(r, (snap) => {
      if (snap.exists()) {
        const data = snap.val() as HouseConfig
        setConfig({
          ...DEFAULT_CONFIG,
          ...data,
          wallRight: data.wallRight ?? DEFAULT_CONFIG.wallRight,
          background: data.background ?? DEFAULT_BACKGROUND,
        })
      }
    })
  }, [])

  useEffect(() => {
    const unsub = subscribeHouseInventory(setHouseOwned)
    return unsub
  }, [])

  useEffect(() => {
    const unsub = subscribeWishlist(myUid, setMyWishlist)
    return unsub
  }, [myUid])

  useEffect(() => {
    if (!partnerUid) return
    const unsub = subscribeWishlist(partnerUid, setPartnerWishlist)
    return unsub
  }, [partnerUid])

  useEffect(() => {
    const unsub = subscribeGifts(setGifts)
    return unsub
  }, [])

  useEffect(() => {
    if (initialInventoryRef.current === null) {
      initialInventoryRef.current = new Set(houseOwned)
      return
    }
    setNewItems((prev) => {
      const next = new Set(prev)
      houseOwned.forEach((id) => {
        if (!initialInventoryRef.current!.has(id) && !seenItems.has(id)) {
          next.add(id)
        }
      })
      // remove itens já vistos
      seenItems.forEach((id) => next.delete(id))
      return next
    })
  }, [houseOwned, seenItems])

  function isTileOwned(sheet: string, col: number, row: number): boolean {
    const isDefault =
      (sheet === DEFAULT_CONFIG.floor.sheet &&
        col === DEFAULT_CONFIG.floor.col &&
        row === DEFAULT_CONFIG.floor.row) ||
      (sheet === DEFAULT_CONFIG.wall.sheet &&
        col === DEFAULT_CONFIG.wall.col &&
        row === DEFAULT_CONFIG.wall.row)
    if (isDefault) return true
    const itemId = tileToItemId(sheet, col, row)
    if (!itemId) return false
    return houseOwned.has(itemId)
  }

  function isBgOwned(bgId: string): boolean {
    if (bgId === DEFAULT_BACKGROUND) return true
    return houseOwned.has(bgToItemId(bgId))
  }

  const handleSave = async () => {
    await set(ref(db, 'house/config'), config)
    setSavedFeedback(true)
    setTimeout(() => setSavedFeedback(false), 2000)
  }

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    setScale((s) => Math.min(2, Math.max(0.4, s - e.deltaY * 0.001)))
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    dragging.current = true
    lastPos.current = { x: e.clientX, y: e.clientY }
  }
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging.current) return
    const dx = e.clientX - lastPos.current.x
    const dy = e.clientY - lastPos.current.y
    lastPos.current = { x: e.clientX, y: e.clientY }
    setOffset((o) => ({ x: o.x + dx, y: o.y + dy }))
  }
  const handleMouseUp = () => {
    dragging.current = false
  }

  const activeWallGroupIdx = wallSide === 'left' ? activeWallGroup : activeWallRightGroup
  const setActiveWallGroupIdx = wallSide === 'left' ? setActiveWallGroup : setActiveWallRightGroup

  const groups = tab === 'floor' ? FLOOR_GROUPS : WALL_GROUPS
  const activeGroup = tab === 'floor' ? activeFloorGroup : activeWallGroupIdx
  const setActiveGroup = tab === 'floor' ? setActiveFloorGroup : setActiveWallGroupIdx
  const tiles = tab !== 'background' ? groupToTiles(groups[activeGroup]) : []

  const floorDims = findSheetDims(FLOOR_GROUPS, config.floor.sheet)
  const wallDims = findSheetDims(WALL_GROUPS, config.wall.sheet)
  const wallRightDims = findSheetDims(WALL_GROUPS, config.wallRight.sheet)

  const selectedFloorTile: TileOption = {
    id: 'sel-floor',
    label: '',
    sheet: config.floor.sheet,
    col: config.floor.col,
    row: config.floor.row,
    tileW: 256,
    tileH: 128,
    ...floorDims,
  }
  const selectedWallTile: TileOption = {
    id: 'sel-wall',
    label: '',
    sheet: config.wall.sheet,
    col: config.wall.col,
    row: config.wall.row,
    tileW: 256,
    tileH: 384,
    ...wallDims,
  }
  const selectedWallRightTile: TileOption = {
    id: 'sel-wall-right',
    label: '',
    sheet: config.wallRight.sheet,
    col: config.wallRight.col,
    row: config.wallRight.row,
    tileW: 256,
    tileH: 384,
    ...wallRightDims,
  }

  const currentOverlap =
    tab === 'floor' ? (FLOOR_GROUPS.find((g) => g.sheet === config.floor.sheet)?.overlap ?? 0) : 0

  const editingWallConfig = wallSide === 'left' ? config.wall : config.wallRight
  const setEditingWallConfig = (val: { sheet: string; col: number; row: number }) => {
    if (wallSide === 'left') setConfig((c: HouseConfig) => ({ ...c, wall: val }))
    else setConfig((c: HouseConfig) => ({ ...c, wallRight: val }))
  }

  const activeBg =
    BACKGROUNDS.find((b) => b.id === (config.background ?? DEFAULT_BACKGROUND)) ?? BACKGROUNDS[0]

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        top: 32,
        zIndex: 200,
        background: 'var(--color-bark-100)',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'Baloo 2, sans-serif',
      }}
    >
      {/* HEADER */}
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
          <Home size={18} color="var(--color-leaf-600)" />
          <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-leaf-800)' }}>
            Nossa Casinha
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {onOpenShop && (
            <button
              onClick={() => onOpenShop?.()}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 14px',
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
              <ShoppingBag size={14} /> Loja
            </button>
          )}

          <button
            onClick={() => setWishlistOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 14px',
              borderRadius: 10,
              border: '1.5px solid #e85d8a',
              background: wishlistOpen ? '#fce8f0' : 'transparent',
              color: '#e85d8a',
              fontSize: 13,
              fontWeight: 600,
              fontFamily: 'Baloo 2, sans-serif',
              cursor: 'pointer',
            }}
          >
            <Heart
              size={14}
              fill={myWishlist.size > 0 || partnerWishlist.size > 0 ? '#e85d8a' : 'none'}
            />
            Desejos
          </button>

          <button
            onClick={handleSave}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 18px',
              borderRadius: 10,
              border: 'none',
              background: savedFeedback ? 'var(--color-leaf-400)' : 'var(--color-leaf-600)',
              color: '#fff',
              fontSize: 13,
              fontWeight: 600,
              fontFamily: 'Baloo 2, sans-serif',
              cursor: 'pointer',
              transition: 'background 0.2s',
              minWidth: 100,
              justifyContent: 'center',
            }}
          >
            {savedFeedback ? (
              <>
                <Check size={14} /> Salvo!
              </>
            ) : (
              <>
                <Save size={14} /> Salvar
              </>
            )}
          </button>
        </div>
      </div>

      {/* BODY */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {/* CENA */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: activeBg.css,
            backgroundSize: '10px 10px',
            cursor: dragging.current ? 'grabbing' : 'grab',
            overflow: 'hidden',
          }}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {activeBg.svg && (
            <div
              dangerouslySetInnerHTML={{ __html: activeBg.svg }}
              style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}
            />
          )}
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
                transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
                transformOrigin: 'center center',
                transition: dragging.current ? 'none' : 'transform 0.05s',
                position: 'relative',
              }}
            >
              <HouseScene
                floorTile={selectedFloorTile}
                wallTile={selectedWallTile}
                wallRightTile={selectedWallRightTile}
                overlap={currentOverlap}
              />
              {gifts.map((gift) => (
                <div
                  key={gift.id}
                  style={{
                    position: 'absolute',
                    left: gift.position.x,
                    top: gift.position.y,
                    zIndex: 100,
                  }}
                >
                  <ChestSprite
                    color={gift.color}
                    canOpen={gift.toUid === myUid}
                    resetKey={chestResetKeys[gift.id] ?? 0}
                    onClick={() => {
                      setActiveGift(gift)
                      setGiftPhase('message')
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* PAINEL ESQUERDO RETRÁTIL */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            display: 'flex',
            zIndex: 10,
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              width: panelOpen ? 300 : 0,
              overflow: 'hidden',
              transition: 'width 0.25s ease',
              pointerEvents: 'auto',
            }}
          >
            <div
              style={{
                width: 300,
                height: '100%',
                background: 'var(--color-bark-100)',
                borderRight: '2px solid var(--color-wood-300)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
              }}
            >
              {/* Tabs chão / parede / fundos */}
              <div
                style={{
                  display: 'flex',
                  gap: 4,
                  padding: '10px 12px',
                  borderBottom: '1px solid var(--color-wood-300)',
                  flexShrink: 0,
                }}
              >
                {[
                  { id: 'floor' as const, icon: <Layers size={14} />, label: 'Chão' },
                  { id: 'wall' as const, icon: <PaintRoller size={14} />, label: 'Parede' },
                  { id: 'background' as const, icon: <ImageIcon size={14} />, label: 'Fundo' },
                ].map((t) => {
                  const hasNew = [...newItems].some((id) => {
                    if (t.id === 'background') return id.startsWith('bg_')
                    const info = HOUSE_TILE_MAP[id]
                    if (!info) return false
                    if (t.id === 'floor')
                      return FLOOR_GROUPS.some((g) =>
                        g.sheets
                          ? g.sheets.some((s) => s.sheet === info.sheet)
                          : g.sheet === info.sheet
                      )
                    if (t.id === 'wall')
                      return WALL_GROUPS.some((g) =>
                        g.sheets
                          ? g.sheets.some((s) => s.sheet === info.sheet)
                          : g.sheet === info.sheet
                      )
                    return false
                  })
                  return (
                    <button
                      key={t.id}
                      onClick={() => setTab(t.id)}
                      style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 5,
                        padding: '6px 4px',
                        borderRadius: 10,
                        border:
                          tab === t.id
                            ? '2px solid var(--color-leaf-500)'
                            : '2px solid var(--color-wood-300)',
                        background: tab === t.id ? 'var(--color-leaf-600)' : 'var(--color-bark-50)',
                        color: tab === t.id ? '#fff' : 'var(--color-leaf-700)',
                        fontSize: 12,
                        fontWeight: tab === t.id ? 700 : 500,
                        fontFamily: 'Baloo 2, sans-serif',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                        position: 'relative',
                      }}
                    >
                      {t.icon} {t.label}
                      {hasNew && (
                        <span
                          style={{
                            position: 'absolute',
                            top: 3,
                            right: 3,
                            width: 7,
                            height: 7,
                            borderRadius: '50%',
                            background: '#4ade80',
                            border: '1.5px solid white',
                          }}
                        />
                      )}
                    </button>
                  )
                })}
              </div>

              {/* Sub-tabs Esquerda / Direita */}
              {tab === 'wall' && (
                <div
                  style={{
                    display: 'flex',
                    gap: 4,
                    padding: '6px 12px',
                    borderBottom: '1px solid var(--color-wood-300)',
                    flexShrink: 0,
                  }}
                >
                  {[
                    { id: 'left' as const, label: 'Esquerda' },
                    { id: 'right' as const, label: 'Direita' },
                  ].map((s) => {
                    const sideHasNew = [...newItems].some((id) => {
                      const info = HOUSE_TILE_MAP[id]
                      if (!info) return false
                      return WALL_GROUPS.some((g) =>
                        g.sheets
                          ? g.sheets.some((sh) => sh.sheet === info.sheet)
                          : g.sheet === info.sheet
                      )
                    })
                    return (
                      <button
                        key={s.id}
                        onClick={() => setWallSide(s.id)}
                        style={{
                          flex: 1,
                          padding: '4px 8px',
                          borderRadius: 8,
                          border:
                            wallSide === s.id
                              ? '2px solid var(--color-petal-400)'
                              : '2px solid var(--color-wood-300)',
                          background: wallSide === s.id ? 'var(--color-petal-200)' : 'transparent',
                          color:
                            wallSide === s.id ? 'var(--color-soil-900)' : 'var(--color-leaf-600)',
                          fontSize: 12,
                          fontWeight: wallSide === s.id ? 700 : 400,
                          fontFamily: 'Baloo 2, sans-serif',
                          cursor: 'pointer',
                          transition: 'all 0.15s',
                          position: 'relative',
                        }}
                      >
                        {s.label}
                        {sideHasNew && (
                          <span
                            style={{
                              position: 'absolute',
                              top: 3,
                              right: 3,
                              width: 7,
                              height: 7,
                              borderRadius: '50%',
                              background: '#4ade80',
                              border: '1.5px solid white',
                            }}
                          />
                        )}
                      </button>
                    )
                  })}
                </div>
              )}

              {/* Lista de grupos + grid de tiles */}
              {tab !== 'background' && (
                <>
                  <div
                    className="char-scroll"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 3,
                      padding: '8px 10px',
                      borderBottom: '1px solid var(--color-wood-300)',
                      flexShrink: 0,
                      overflowY: 'auto',
                      maxHeight: 180,
                    }}
                  >
                    {groups.map((g, i) => {
                      const isCute = g.label === 'Cute Decor ✦'
                      const groupHasNew = groupHasNewItem(g)
                      return (
                        <button
                          key={g.label}
                          onClick={() => setActiveGroup(i)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 7,
                            padding: '5px 10px',
                            borderRadius: 8,
                            textAlign: 'left',
                            background:
                              activeGroup === i
                                ? isCute
                                  ? '#e8d5f5'
                                  : 'var(--color-petal-200)'
                                : isCute
                                  ? '#f5eeff'
                                  : 'transparent',
                            color:
                              activeGroup === i
                                ? isCute
                                  ? '#6b3fa0'
                                  : 'var(--color-soil-900)'
                                : isCute
                                  ? '#9b5fd4'
                                  : 'var(--color-leaf-600)',
                            border:
                              activeGroup === i
                                ? isCute
                                  ? '2px solid #b57bee'
                                  : '2px solid var(--color-petal-400)'
                                : isCute
                                  ? '2px solid #d4aaee'
                                  : '2px solid transparent',
                            fontSize: 12,
                            fontWeight: activeGroup === i ? 700 : 400,
                            fontFamily: 'Baloo 2, sans-serif',
                            cursor: 'pointer',
                            transition: 'all 0.15s',
                            whiteSpace: 'nowrap',
                            position: 'relative',
                          }}
                        >
                          {g.icon} {g.label}
                          {groupHasNew && (
                            <span
                              style={{
                                position: 'absolute',
                                top: 4,
                                right: 6,
                                width: 7,
                                height: 7,
                                borderRadius: '50%',
                                background: '#4ade80',
                                border: '1.5px solid white',
                              }}
                            />
                          )}
                        </button>
                      )
                    })}
                  </div>

                  {/* Grid de tiles */}
                  <div
                    className="char-scroll"
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 8,
                      padding: '10px 12px',
                      overflowY: 'auto',
                      alignContent: 'flex-start',
                      flex: 1,
                    }}
                  >
                    {tiles.map((tile) => {
                      const isFloor = tab === 'floor'
                      const owned = isTileOwned(tile.sheet, tile.col, tile.row)
                      if (!owned) return null
                      const isSelected = isFloor
                        ? config.floor.sheet === tile.sheet &&
                          config.floor.col === tile.col &&
                          config.floor.row === tile.row
                        : editingWallConfig.sheet === tile.sheet &&
                          editingWallConfig.col === tile.col &&
                          editingWallConfig.row === tile.row
                      const displayW = isFloor ? 80 : 52
                      const displayH = isFloor ? 40 : 78
                      const tileItemId = tileToItemId(tile.sheet, tile.col, tile.row)
                      const tileIsNew = tileItemId ? newItems.has(tileItemId) : false
                      return (
                        <button
                          key={tile.id}
                          title={owned ? tile.label : `🔒 ${tile.label} — compre na loja`}
                          onClick={() => {
                            if (!owned) return
                            if (isFloor)
                              setConfig((c: HouseConfig) => ({
                                ...c,
                                floor: { sheet: tile.sheet, col: tile.col, row: tile.row },
                              }))
                            else
                              setEditingWallConfig({
                                sheet: tile.sheet,
                                col: tile.col,
                                row: tile.row,
                              })
                            if (tileItemId) {
                              setSeenItems((prev) => new Set([...prev, tileItemId]))
                              setNewItems((prev) => {
                                const next = new Set(prev)
                                next.delete(tileItemId)
                                return next
                              })
                            }
                          }}
                          style={{
                            padding: 0,
                            position: 'relative',
                            border: isSelected
                              ? '2.5px solid var(--color-petal-400)'
                              : owned
                                ? '2px solid var(--color-wood-300)'
                                : '2px solid #e5e7eb',
                            borderRadius: 8,
                            background: isSelected
                              ? 'var(--color-petal-200)'
                              : 'repeating-linear-gradient(45deg,#d0cdc8 0px,#d0cdc8 3px,#f0ede8 3px,#f0ede8 9px)',
                            cursor: owned ? 'pointer' : 'not-allowed',
                            overflow: 'hidden',
                            transition: 'all 0.15s',
                            outline: isSelected ? '2px solid var(--color-petal-300)' : 'none',
                            outlineOffset: 2,
                            boxShadow: isSelected ? '0 2px 8px rgba(196,149,106,0.3)' : 'none',
                            opacity: owned ? 1 : 0.55,
                          }}
                        >
                          <div style={{ overflow: 'hidden', width: displayW, height: displayH }}>
                            <div
                              style={{
                                ...tileStyle(tile, displayW, displayH),
                                marginLeft: isFloor ? 0 : 10,
                                marginTop: isFloor ? 0 : 8,
                              }}
                            />
                          </div>
                          {!owned && (
                            <div
                              style={{
                                position: 'absolute',
                                inset: 0,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: 'rgba(255,255,255,0.45)',
                                borderRadius: 6,
                              }}
                            >
                              <Lock size={12} color="#6b7280" />
                            </div>
                          )}
                          {tileIsNew && (
                            <span
                              style={{
                                position: 'absolute',
                                top: 3,
                                right: 3,
                                width: 7,
                                height: 7,
                                borderRadius: '50%',
                                background: '#4ade80',
                                border: '1.5px solid white',
                                zIndex: 2,
                              }}
                            />
                          )}
                        </button>
                      )
                    })}

                    {tiles.some((t) => !isTileOwned(t.sheet, t.col, t.row)) && onOpenShop && (
                      <div
                        style={{
                          width: '100%',
                          marginTop: 4,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          padding: '6px 8px',
                          borderRadius: 8,
                          background: 'var(--color-petal-200)',
                          border: '1.5px solid var(--color-petal-400)',
                        }}
                      >
                        <Lock size={11} color="var(--color-soil-900)" />
                        <span
                          style={{
                            fontSize: 11,
                            color: 'var(--color-soil-900)',
                            fontFamily: 'Baloo 2, sans-serif',
                            flex: 1,
                          }}
                        >
                          Tiles bloqueados
                        </span>
                        <button
                          onClick={() => onOpenShop?.()}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            background: 'var(--color-leaf-600)',
                            color: 'white',
                            border: 'none',
                            borderRadius: 6,
                            padding: '3px 8px',
                            fontSize: 10,
                            fontWeight: 700,
                            fontFamily: 'Baloo 2, sans-serif',
                            cursor: 'pointer',
                          }}
                        >
                          <ShoppingBag size={10} /> Loja
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Grid de fundos */}
              {tab === 'background' && (
                <div
                  className="char-scroll"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                    padding: '12px',
                    overflowY: 'auto',
                    flex: 1,
                    alignContent: 'flex-start',
                  }}
                >
                  {BACKGROUNDS.map((bg) => {
                    const isSelected = (config.background ?? DEFAULT_BACKGROUND) === bg.id
                    const owned = isBgOwned(bg.id)
                    const bgIsNew = newItems.has(bgToItemId(bg.id))
                    if (!owned) return null
                    return (
                      <button
                        key={bg.id}
                        onClick={() => {
                          if (!owned) return
                          setConfig((c: HouseConfig) => ({ ...c, background: bg.id }))
                          const bgItemId = bgToItemId(bg.id)
                          setSeenItems((prev) => new Set([...prev, bgItemId]))
                          setNewItems((prev) => {
                            const next = new Set(prev)
                            next.delete(bgItemId)
                            return next
                          })
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                          padding: '8px 10px',
                          borderRadius: 10,
                          border: isSelected
                            ? '2.5px solid var(--color-petal-400)'
                            : '2px solid var(--color-wood-300)',
                          background: isSelected
                            ? 'var(--color-petal-200)'
                            : 'var(--color-bark-50)',
                          cursor: owned ? 'pointer' : 'not-allowed',
                          opacity: owned ? 1 : 0.6,
                          transition: 'all 0.15s',
                          outline: isSelected ? '2px solid var(--color-petal-300)' : 'none',
                          outlineOffset: 2,
                          boxShadow: isSelected ? '0 2px 8px rgba(196,149,106,0.3)' : 'none',
                          position: 'relative',
                        }}
                      >
                        <div
                          style={{
                            width: 64,
                            height: 40,
                            borderRadius: 7,
                            flexShrink: 0,
                            background:
                              bg.id === 'garden'
                                ? `radial-gradient(circle, #c8e8d0 1.5px, transparent 1.5px) 0 0 / 10px 10px, #f0f8f2`
                                : bg.css,
                            border: '1.5px solid rgba(0,0,0,0.08)',
                          }}
                        />
                        <div
                          style={{
                            width: 64,
                            height: 40,
                            borderRadius: 7,
                            flexShrink: 0,
                            background: bg.css,
                            border: '1.5px solid rgba(0,0,0,0.08)',
                            overflow: 'hidden',
                            position: 'relative',
                          }}
                        >
                          {bg.svg && (
                            <div
                              dangerouslySetInnerHTML={{ __html: bg.svg }}
                              style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
                            />
                          )}
                        </div>
                        <span
                          style={{
                            fontSize: 13,
                            fontWeight: isSelected ? 700 : 500,
                            color: isSelected ? 'var(--color-soil-900)' : 'var(--color-leaf-700)',
                            fontFamily: 'Baloo 2, sans-serif',
                            flex: 1,
                          }}
                        >
                          {bg.label}
                        </span>
                        {!owned && <Lock size={13} color="#9ca3af" />}
                        {bgIsNew && (
                          <span
                            style={{
                              position: 'absolute',
                              top: 6,
                              right: 6,
                              width: 7,
                              height: 7,
                              borderRadius: '50%',
                              background: '#4ade80',
                              border: '1.5px solid white',
                            }}
                          />
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Botão toggle */}
          <button
            onClick={() => setPanelOpen((v) => !v)}
            style={{
              pointerEvents: 'auto',
              alignSelf: 'center',
              width: 24,
              height: 48,
              background: 'var(--color-bark-100)',
              border: '2px solid var(--color-wood-300)',
              borderLeft: panelOpen ? 'none' : '2px solid var(--color-wood-300)',
              borderRadius: panelOpen ? '0 8px 8px 0' : '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-leaf-600)',
              transition: 'all 0.25s',
            }}
          >
            {panelOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
          </button>
        </div>
      </div>

      {/* MODAL WISHLIST */}
      {wishlistOpen && (
        <div
          onClick={() => setWishlistOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 300,
            background: 'rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fdf6f0',
              borderRadius: 20,
              width: 480,
              maxWidth: '95vw',
              maxHeight: '80vh',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              boxShadow: '0 16px 48px rgba(0,0,0,0.25)',
              border: '2px solid var(--color-wood-300)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                borderBottom: '1.5px solid var(--color-wood-300)',
                background: 'var(--color-bark-100)',
                flexShrink: 0,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Heart size={16} color="#e85d8a" fill="#e85d8a" />
                <span
                  style={{
                    fontSize: 15,
                    fontWeight: 800,
                    color: '#3d2408',
                    fontFamily: 'Baloo 2, sans-serif',
                  }}
                >
                  Lista de desejos
                </span>
              </div>
              <button
                onClick={() => setWishlistOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#a0998f',
                  display: 'flex',
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
              {[
                { label: myName || 'Você', wishlist: myWishlist },
                { label: partnerName || 'Parceiro(a)', wishlist: partnerWishlist },
              ].map((col) => (
                <div
                  key={col.label}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    borderRight: '1.5px solid var(--color-wood-300)',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      padding: '8px 14px',
                      fontSize: 11,
                      fontWeight: 800,
                      color: '#e85d8a',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      fontFamily: 'Baloo 2, sans-serif',
                      borderBottom: '1px solid var(--color-wood-300)',
                      background: '#fff5f8',
                      flexShrink: 0,
                    }}
                  >
                    {col.label}
                  </div>
                  <div style={{ overflowY: 'auto', flex: 1, padding: '8px 0' }}>
                    {col.wishlist.size === 0 ? (
                      <div
                        style={{
                          padding: '24px 16px',
                          textAlign: 'center',
                          color: '#c4b8a8',
                          fontSize: 12,
                          fontFamily: 'Baloo 2, sans-serif',
                        }}
                      >
                        nenhum item ainda
                      </div>
                    ) : (
                      [...col.wishlist].map((itemId) => (
                        <button
                          key={itemId}
                          onClick={() => onOpenShop && setGoToShopConfirm(itemId)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            width: '100%',
                            padding: '7px 14px',
                            background: 'none',
                            border: 'none',
                            borderBottom: '1px dashed #e5ddd5',
                            cursor: onOpenShop ? 'pointer' : 'default',
                            textAlign: 'left',
                            fontFamily: 'Baloo 2, sans-serif',
                          }}
                        >
                          <Heart
                            size={11}
                            color="#e85d8a"
                            fill="#e85d8a"
                            style={{ flexShrink: 0 }}
                          />
                          <span
                            style={{
                              fontSize: 12,
                              color: '#3d2408',
                              flex: 1,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {SHOP_HOUSE_ITEMS.find((i) => i.id === itemId)?.label ??
                              ALL_PIECES.find((p) => p.id === itemId)?.label ??
                              itemId}
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL IR PARA LOJA */}
      {goToShopConfirm && (
        <div
          onClick={() => setGoToShopConfirm(null)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 400,
            background: 'rgba(0,0,0,0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'white',
              borderRadius: 20,
              padding: '28px 28px 24px',
              maxWidth: 300,
              width: '90%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 16,
              boxShadow: '0 16px 48px rgba(0,0,0,0.25)',
              fontFamily: 'Baloo 2, sans-serif',
            }}
          >
            <Heart size={32} color="#e85d8a" fill="#e85d8a" />
            <div style={{ fontSize: 15, fontWeight: 800, color: '#3d2408', textAlign: 'center' }}>
              Ir para a loja?
            </div>
            <div style={{ fontSize: 12, color: '#6b7280', textAlign: 'center' }}>
              Você será redirecionada para a loja para comprar este item.
            </div>
            <div style={{ display: 'flex', gap: 10, width: '100%' }}>
              <button
                onClick={() => setGoToShopConfirm(null)}
                style={{
                  flex: 1,
                  padding: '10px 0',
                  borderRadius: 12,
                  border: '2px solid #e5ddd5',
                  background: 'white',
                  fontFamily: 'Baloo 2, sans-serif',
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: 'pointer',
                  color: '#3d2408',
                }}
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  setGoToShopConfirm(null)
                  setWishlistOpen(false)
                  onOpenShop?.(goToShopConfirm ?? undefined)
                }}
                style={{
                  flex: 1,
                  padding: '10px 0',
                  borderRadius: 12,
                  border: 'none',
                  background: '#e85d8a',
                  fontFamily: 'Baloo 2, sans-serif',
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: 'pointer',
                  color: 'white',
                }}
              >
                Ir à loja
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE REVELAÇÃO DO PRESENTE */}
      {activeGift && giftPhase && (
        <div
          onClick={() => {
            if (giftPhase !== 'reveal') {
              setChestResetKeys((k) => ({ ...k, [activeGift.id]: (k[activeGift.id] ?? 0) + 1 }))
            }
            setActiveGift(null)
            setGiftPhase(null)
          }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 500,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'white',
              borderRadius: 24,
              maxWidth: 320,
              width: '90%',
              boxShadow: '0 24px 60px rgba(0,0,0,0.25)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'stretch',
            }}
          >
            <div
              style={{
                background: 'linear-gradient(135deg, #fff0f5 0%, #fce8f0 100%)',
                padding: '28px 24px 20px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 12,
                borderBottom: '1.5px solid #f0ebe4',
              }}
            >
              <ChestSprite
                color={activeGift.color}
                canOpen={false}
                resetKey={0}
                onClick={() => {}}
              />
              <div
                style={{
                  fontFamily: 'Baloo 2, sans-serif',
                  fontWeight: 800,
                  fontSize: 15,
                  color: '#3d2408',
                  textAlign: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                {giftPhase === 'message' ? (
                  <>{`presente de ${activeGift.fromName}`}</>
                ) : (
                  <>
                    <Sparkles size={16} color="#e85d8a" /> seus itens
                  </>
                )}
              </div>
            </div>

            <div
              style={{
                padding: '20px 24px 24px',
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
                fontFamily: 'Baloo 2, sans-serif',
              }}
            >
              {giftPhase === 'message' && (
                <>
                  {activeGift.message && (
                    <div
                      style={{
                        background: '#fdf6f0',
                        borderRadius: 12,
                        padding: '12px 14px',
                        fontSize: 13,
                        color: '#3d2408',
                        lineHeight: 1.6,
                        border: '1.5px solid #e5ddd5',
                        fontStyle: 'italic',
                      }}
                    >
                      "{activeGift.message}"
                    </div>
                  )}
                  <button
                    onClick={async () => {
                      await openGift(activeGift, myUid)
                      setGiftPhase('reveal')
                    }}
                    style={{
                      padding: '12px 0',
                      borderRadius: 14,
                      border: 'none',
                      background: '#e85d8a',
                      color: 'white',
                      fontFamily: 'Baloo 2, sans-serif',
                      fontWeight: 700,
                      fontSize: 14,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                    }}
                  >
                    <Gift size={16} /> Abrir presente
                  </button>
                </>
              )}

              {giftPhase === 'reveal' && (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6,
                    maxHeight: 200,
                    overflowY: 'auto',
                  }}
                >
                  {activeGift.items.map((item) => {
                    const cat = item.itemCategory
                    const targetTab: HouseTab =
                      cat === 'floor' ? 'floor' : cat === 'background' ? 'background' : 'wall'
                    return (
                      <div
                        key={item.itemId}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: '8px 12px',
                          borderRadius: 10,
                          background: '#f9f5f0',
                          border: '1.5px solid #e5ddd5',
                          fontSize: 13,
                          color: '#3d2408',
                          fontWeight: 600,
                        }}
                      >
                        {cat === 'floor' ? (
                          <Layers size={15} color="#c4956a" />
                        ) : cat === 'wall' ? (
                          <Wallpaper size={15} color="#c4956a" />
                        ) : cat === 'background' ? (
                          <ImageIcon size={15} color="#c4956a" />
                        ) : (
                          <Shirt size={15} color="#c4956a" />
                        )}
                        <span style={{ flex: 1 }}>{item.itemLabel}</span>
                        <button
                          onClick={() => {
                            setActiveGift(null)
                            setGiftPhase(null)
                            setPanelOpen(true)
                            setTab(targetTab)
                            // Marca só esse item como visto
                            setSeenItems((prev) => new Set([...prev, item.itemId]))
                            setNewItems((prev) => {
                              const next = new Set(prev)
                              next.delete(item.itemId)
                              return next
                            })
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            background: 'var(--color-leaf-600, #5a9a5a)',
                            color: 'white',
                            border: 'none',
                            borderRadius: 8,
                            padding: '4px 10px',
                            fontSize: 11,
                            fontWeight: 700,
                            fontFamily: 'Baloo 2, sans-serif',
                            cursor: 'pointer',
                          }}
                        >
                          ver <ArrowRight size={11} />
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
