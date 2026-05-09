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

// ── Scrollbar custom global ──────────────────────────────────
const SCROLLBAR_CSS = `
  .house-scroll::-webkit-scrollbar { width: 4px; height: 4px; }
  .house-scroll::-webkit-scrollbar-track { background: transparent; }
  .house-scroll::-webkit-scrollbar-thumb { background: rgba(232,160,176,0.55); border-radius: 99px; }
  .house-scroll::-webkit-scrollbar-thumb:hover { background: rgba(232,160,176,0.99); }
  .house-scroll { scrollbar-width: thin; scrollbar-color: rgba(232,160,176,0.55) transparent; }
`
if (!document.getElementById('house-scroll-style')) {
  const s = document.createElement('style')
  s.id = 'house-scroll-style'
  s.textContent = SCROLLBAR_CSS
  document.head.appendChild(s)
}

// ── Paleta leafnote ──────────────────────────────────────────
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
  btnDestructiveText: '#e8607a',
  btnIcon: 'rgba(200,120,140,0.15)',
  selectedBg: 'rgba(232,160,176,0.2)',
  selectedBorder: 'rgba(232,160,176,0.7)',
  ownedText: '#4A7A4A',
  cuteText: 'rgba(120,60,160,0.8)',
  cuteBorder: 'rgba(180,140,220,0.5)',
  cuteBg: 'rgba(180,140,220,0.12)',
}

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
        filter: canOpen ? 'drop-shadow(0 0 6px rgba(232,160,176,0.8))' : 'brightness(0.7)',
      }}
    />
  )
}

// ─────────────────────────────────────────────
// MODAL PRINCIPAL
// ─────────────────────────────────────────────

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
        if (!initialInventoryRef.current!.has(id) && !seenItems.has(id)) next.add(id)
      })
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
    if (wallSide === 'left') setConfig((c) => ({ ...c, wall: val }))
    else setConfig((c) => ({ ...c, wallRight: val }))
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
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          alignItems: 'center',
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
            justifySelf: 'start',
          }}
        >
          <ChevronLeft size={15} strokeWidth={2.5} /> voltar
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <Home size={15} color="rgba(200,120,140,0.7)" strokeWidth={2} />
          <span style={{ fontSize: 15, fontWeight: 800, color: T.text }}>nossa casinha</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifySelf: 'end' }}>
          {onOpenShop && (
            <button
              onClick={() => onOpenShop?.()}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                padding: '5px 12px',
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
              <ShoppingBag size={13} strokeWidth={2} /> loja
            </button>
          )}

          <button
            onClick={() => setWishlistOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              padding: '5px 12px',
              borderRadius: 10,
              border: `1.5px solid rgba(232,96,122,0.4)`,
              background: wishlistOpen ? 'rgba(232,96,122,0.1)' : T.btnIcon,
              color: wishlistOpen ? T.btnDestructiveText : T.text,
              fontSize: 12,
              fontWeight: 800,
              fontFamily: 'Baloo 2, sans-serif',
              cursor: 'pointer',
            }}
          >
            <Heart
              size={13}
              strokeWidth={2}
              fill={myWishlist.size > 0 || partnerWishlist.size > 0 ? '#e8607a' : 'none'}
              color="#e8607a"
            />
            desejos
          </button>

          <button
            onClick={handleSave}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              padding: '5px 18px',
              borderRadius: 10,
              border: 'none',
              background: savedFeedback ? 'rgba(74,122,74,0.55)' : T.btnPrimary,
              color: T.text,
              fontSize: 12,
              fontWeight: 800,
              fontFamily: 'Baloo 2, sans-serif',
              cursor: 'pointer',
              transition: 'background 0.2s',
              minWidth: 90,
              justifyContent: 'center',
            }}
          >
            {savedFeedback ? (
              <>
                <Check size={13} strokeWidth={2.5} /> salvo!
              </>
            ) : (
              <>
                <Save size={13} strokeWidth={2} /> salvar
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── BODY ── */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {/* CENA */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: activeBg.css,
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

        {/* ── PAINEL ESQUERDO RETRÁTIL ── */}
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
                background:
                  'linear-gradient(160deg, rgba(253,246,240,0.98) 0%, rgba(252,232,238,0.98) 100%)',
                borderRight: T.borderVal,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
              }}
            >
              {/* Tabs chão / parede / fundos */}
              <div
                style={{
                  display: 'flex',
                  gap: 5,
                  padding: '10px 12px',
                  borderBottom: T.borderDashed,
                  flexShrink: 0,
                }}
              >
                {[
                  {
                    id: 'floor' as const,
                    icon: <Layers size={13} strokeWidth={2} />,
                    label: 'chão',
                  },
                  {
                    id: 'wall' as const,
                    icon: <PaintRoller size={13} strokeWidth={2} />,
                    label: 'parede',
                  },
                  {
                    id: 'background' as const,
                    icon: <ImageIcon size={13} strokeWidth={2} />,
                    label: 'fundo',
                  },
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
                  const isActive = tab === t.id
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
                        padding: '5px 4px',
                        borderRadius: 10,
                        border: isActive ? `1.5px solid ${T.selectedBorder}` : T.borderVal,
                        background: isActive ? T.btnPrimary : T.btnIcon,
                        color: T.text,
                        fontSize: 11,
                        fontWeight: isActive ? 800 : 600,
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

              {/* Sub-tabs esquerda / direita (parede) */}
              {tab === 'wall' && (
                <div
                  style={{
                    display: 'flex',
                    gap: 5,
                    padding: '7px 12px',
                    borderBottom: T.borderDashed,
                    flexShrink: 0,
                  }}
                >
                  {[
                    { id: 'left' as const, label: 'esquerda' },
                    { id: 'right' as const, label: 'direita' },
                  ].map((s) => {
                    const active = wallSide === s.id
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
                          borderRadius: 20,
                          border: active ? `1.5px solid ${T.selectedBorder}` : T.borderVal,
                          background: active ? T.selectedBg : 'transparent',
                          color: T.text,
                          fontSize: 11,
                          fontWeight: active ? 800 : 600,
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

              {/* Lista de grupos */}
              {tab !== 'background' && (
                <>
                  <div
                    className="house-scroll"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 3,
                      padding: '8px 10px',
                      borderBottom: T.borderDashed,
                      flexShrink: 0,
                      overflowY: 'auto',
                      maxHeight: 180,
                    }}
                  >
                    {groups.map((g, i) => {
                      const isCute = g.label.includes('Cute')
                      const groupHasNew = groupHasNewItem(g)
                      const isActive = activeGroup === i
                      return (
                        <button
                          key={g.label}
                          onClick={() => setActiveGroup(i)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 7,
                            padding: '5px 10px',
                            borderRadius: 10,
                            textAlign: 'left',
                            border: isActive
                              ? `1.5px solid ${isCute ? T.cuteBorder : T.selectedBorder}`
                              : `1.5px solid ${isCute ? T.cuteBorder : 'transparent'}`,
                            background: isActive
                              ? isCute
                                ? T.cuteBg
                                : T.selectedBg
                              : isCute
                                ? 'rgba(180,140,220,0.06)'
                                : 'transparent',
                            color: isCute ? T.cuteText : T.text,
                            fontSize: 12,
                            fontWeight: isActive ? 800 : 600,
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
                    className="house-scroll"
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 7,
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
                          title={owned ? tile.label : `bloqueado — ${tile.label}`}
                          onClick={() => {
                            if (!owned) return
                            if (isFloor)
                              setConfig((c) => ({
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
                            border: isSelected ? `2px solid ${T.selectedBorder}` : T.borderVal,
                            borderRadius: 10,
                            background: isSelected ? T.selectedBg : T.card,
                            cursor: owned ? 'pointer' : 'not-allowed',
                            overflow: 'hidden',
                            transition: 'all 0.15s',
                            outline: isSelected ? `2px solid rgba(232,160,176,0.3)` : 'none',
                            outlineOffset: 2,
                            opacity: owned ? 1 : 0.5,
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
                                background: 'rgba(253,242,246,0.55)',
                                borderRadius: 8,
                              }}
                            >
                              <Lock size={11} color={T.textSub} />
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
                          padding: '6px 10px',
                          borderRadius: 10,
                          background: T.selectedBg,
                          border: T.borderVal,
                        }}
                      >
                        <Lock size={11} color={T.textLabel} />
                        <span
                          style={{
                            fontSize: 11,
                            color: T.textSub,
                            fontFamily: 'Baloo 2, sans-serif',
                            flex: 1,
                          }}
                        >
                          tiles bloqueados
                        </span>
                        <button
                          onClick={() => onOpenShop?.()}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            background: T.btnPrimary,
                            color: T.text,
                            border: 'none',
                            borderRadius: 8,
                            padding: '3px 10px',
                            fontSize: 10,
                            fontWeight: 800,
                            fontFamily: 'Baloo 2, sans-serif',
                            cursor: 'pointer',
                          }}
                        >
                          <ShoppingBag size={10} strokeWidth={2} /> loja
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Grid de fundos */}
              {tab === 'background' && (
                <div
                  className="house-scroll"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6,
                    padding: '10px 12px',
                    overflowY: 'auto',
                    flex: 1,
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
                          setConfig((c) => ({ ...c, background: bg.id }))
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
                          gap: 10,
                          padding: '8px 10px',
                          borderRadius: 12,
                          border: isSelected ? `2px solid ${T.selectedBorder}` : T.borderVal,
                          background: isSelected ? T.selectedBg : T.card,
                          cursor: owned ? 'pointer' : 'not-allowed',
                          opacity: owned ? 1 : 0.55,
                          transition: 'all 0.15s',
                          position: 'relative',
                        }}
                      >
                        <div
                          style={{
                            width: 56,
                            height: 36,
                            borderRadius: 7,
                            flexShrink: 0,
                            background: bg.css,
                            border: T.borderVal,
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
                            fontSize: 12,
                            fontWeight: isSelected ? 800 : 600,
                            color: T.text,
                            fontFamily: 'Baloo 2, sans-serif',
                            flex: 1,
                          }}
                        >
                          {bg.label}
                        </span>
                        {!owned && <Lock size={12} color={T.textSub} />}
                        {bgIsNew && (
                          <span
                            style={{
                              position: 'absolute',
                              top: 5,
                              right: 5,
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

          {/* Botão toggle painel */}
          <button
            onClick={() => setPanelOpen((v) => !v)}
            style={{
              pointerEvents: 'auto',
              alignSelf: 'center',
              width: 22,
              height: 48,
              background:
                'linear-gradient(160deg, rgba(253,246,240,0.97) 0%, rgba(252,232,238,0.97) 100%)',
              border: T.borderVal,
              borderLeft: panelOpen ? 'none' : T.borderVal,
              borderRadius: panelOpen ? '0 10px 10px 0' : 10,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: T.textLabel,
              transition: 'all 0.25s',
            }}
          >
            {panelOpen ? (
              <ChevronLeft size={13} strokeWidth={2.5} />
            ) : (
              <ChevronRight size={13} strokeWidth={2.5} />
            )}
          </button>
        </div>
      </div>

      {/* ── MODAL WISHLIST ── */}
      {wishlistOpen && (
        <div
          onClick={() => setWishlistOpen(false)}
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
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: T.bg,
              borderRadius: 20,
              width: 480,
              maxWidth: '95vw',
              maxHeight: '80vh',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              boxShadow: T.shadow,
              border: T.borderVal,
            }}
          >
            {/* Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 18px',
                borderBottom: T.borderDashed,
                flexShrink: 0,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <Heart size={14} color="#e8607a" fill="#e8607a" strokeWidth={2} />
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 800,
                    color: T.text,
                    fontFamily: 'Baloo 2, sans-serif',
                  }}
                >
                  lista de desejos
                </span>
              </div>
              <button
                onClick={() => setWishlistOpen(false)}
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
                }}
              >
                <X size={13} strokeWidth={2.5} color="rgba(122,48,64,0.7)" />
              </button>
            </div>

            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
              {[
                { label: myName || 'você', wishlist: myWishlist },
                { label: partnerName || 'parceiro(a)', wishlist: partnerWishlist },
              ].map((col, ci) => (
                <div
                  key={col.label}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    borderRight: ci === 0 ? T.borderDashed : 'none',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      padding: '7px 14px',
                      fontSize: 9,
                      fontWeight: 800,
                      color: T.textLabel,
                      textTransform: 'uppercase',
                      letterSpacing: '0.8px',
                      fontFamily: 'Baloo 2, sans-serif',
                      borderBottom: T.borderDashed,
                      background: 'rgba(232,160,176,0.08)',
                      flexShrink: 0,
                    }}
                  >
                    {col.label}
                  </div>
                  <div
                    className="house-scroll"
                    style={{ overflowY: 'auto', flex: 1, padding: '6px 0' }}
                  >
                    {col.wishlist.size === 0 ? (
                      <div
                        style={{
                          padding: '20px 14px',
                          textAlign: 'center',
                          color: T.textSub,
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
                            gap: 7,
                            width: '100%',
                            padding: '6px 14px',
                            background: 'none',
                            border: 'none',
                            borderBottom: T.borderDashed,
                            cursor: onOpenShop ? 'pointer' : 'default',
                            textAlign: 'left',
                            fontFamily: 'Baloo 2, sans-serif',
                          }}
                        >
                          <Heart
                            size={10}
                            color="#e8607a"
                            fill="#e8607a"
                            style={{ flexShrink: 0 }}
                          />
                          <span
                            style={{
                              fontSize: 12,
                              fontWeight: 600,
                              color: T.text,
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

      {/* ── MODAL IR PARA LOJA ── */}
      {goToShopConfirm && (
        <div
          onClick={() => setGoToShopConfirm(null)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 400,
            background: 'rgba(61,26,16,0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(4px)',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: T.bg,
              borderRadius: 20,
              padding: '24px 24px 20px',
              maxWidth: 300,
              width: '90%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 14,
              boxShadow: T.shadow,
              border: T.borderVal,
              fontFamily: 'Baloo 2, sans-serif',
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: 'rgba(232,96,122,0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Heart size={20} color="#e8607a" fill="#e8607a" strokeWidth={2} />
            </div>
            <span style={{ fontSize: 14, fontWeight: 800, color: T.text, textAlign: 'center' }}>
              ir para a loja?
            </span>
            <span style={{ fontSize: 12, color: T.textSub, textAlign: 'center', lineHeight: 1.5 }}>
              você será redirecionada para a loja para comprar este item.
            </span>
            <div style={{ display: 'flex', gap: 8, width: '100%' }}>
              <button
                onClick={() => setGoToShopConfirm(null)}
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
                cancelar
              </button>
              <button
                onClick={() => {
                  setGoToShopConfirm(null)
                  setWishlistOpen(false)
                  onOpenShop?.(goToShopConfirm ?? undefined)
                }}
                style={{
                  flex: 1,
                  padding: '9px 0',
                  borderRadius: 12,
                  border: 'none',
                  background: 'rgba(232,96,122,0.18)',
                  fontFamily: 'Baloo 2, sans-serif',
                  fontWeight: 800,
                  fontSize: 13,
                  cursor: 'pointer',
                  color: '#e8607a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 5,
                }}
              >
                <ShoppingBag size={12} strokeWidth={2} /> ir à loja
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL PRESENTE ── */}
      {activeGift && giftPhase && (
        <div
          onClick={() => {
            if (giftPhase !== 'reveal')
              setChestResetKeys((k) => ({ ...k, [activeGift.id]: (k[activeGift.id] ?? 0) + 1 }))
            setActiveGift(null)
            setGiftPhase(null)
          }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 500,
            background: 'rgba(61,26,16,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(6px)',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: T.bg,
              borderRadius: 20,
              maxWidth: 320,
              width: '90%',
              boxShadow: T.shadow,
              border: T.borderVal,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'stretch',
            }}
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
              <ChestSprite
                color={activeGift.color}
                canOpen={false}
                resetKey={0}
                onClick={() => {}}
              />
              <span
                style={{
                  fontFamily: 'Baloo 2, sans-serif',
                  fontWeight: 800,
                  fontSize: 14,
                  color: T.text,
                  textAlign: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                {giftPhase === 'message' ? (
                  `presente de ${activeGift.fromName}`
                ) : (
                  <>
                    <Sparkles size={14} color="#e8607a" strokeWidth={2} /> seus itens
                  </>
                )}
              </span>
            </div>

            <div
              style={{
                padding: '16px 20px 20px',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                fontFamily: 'Baloo 2, sans-serif',
              }}
            >
              {giftPhase === 'message' && (
                <>
                  {activeGift.message && (
                    <div
                      style={{
                        background: T.card,
                        borderRadius: 12,
                        padding: '10px 14px',
                        fontSize: 13,
                        fontWeight: 600,
                        color: T.text,
                        lineHeight: 1.6,
                        border: T.cardBorder,
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
                      padding: '11px 0',
                      borderRadius: 12,
                      border: 'none',
                      background: T.btnPrimary,
                      color: T.text,
                      fontFamily: 'Baloo 2, sans-serif',
                      fontWeight: 800,
                      fontSize: 13,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 7,
                    }}
                  >
                    <Gift size={14} strokeWidth={2} /> abrir presente
                  </button>
                </>
              )}

              {giftPhase === 'reveal' && (
                <div
                  className="house-scroll"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6,
                    maxHeight: 220,
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
                          borderRadius: 12,
                          background: T.card,
                          border: T.cardBorder,
                          fontSize: 13,
                          fontWeight: 600,
                          color: T.text,
                        }}
                      >
                        {cat === 'floor' ? (
                          <Layers size={14} color={T.textLabel} strokeWidth={2} />
                        ) : cat === 'wall' ? (
                          <Wallpaper size={14} color={T.textLabel} strokeWidth={2} />
                        ) : cat === 'background' ? (
                          <ImageIcon size={14} color={T.textLabel} strokeWidth={2} />
                        ) : (
                          <Shirt size={14} color={T.textLabel} strokeWidth={2} />
                        )}
                        <span style={{ flex: 1 }}>{item.itemLabel}</span>
                        <button
                          onClick={() => {
                            setActiveGift(null)
                            setGiftPhase(null)
                            setPanelOpen(true)
                            setTab(targetTab)
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
                            background: 'rgba(74,122,74,0.15)',
                            color: T.ownedText,
                            border: '1.5px solid rgba(74,122,74,0.35)',
                            borderRadius: 8,
                            padding: '3px 10px',
                            fontSize: 11,
                            fontWeight: 800,
                            fontFamily: 'Baloo 2, sans-serif',
                            cursor: 'pointer',
                          }}
                        >
                          ver <ArrowRight size={10} strokeWidth={2.5} />
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
