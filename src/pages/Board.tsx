import { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import { useBoard } from '../hooks/useBoard'
import { useLetterCounts } from '../hooks/useBoard'
import { useAuthState } from 'react-firebase-hooks/auth'
import { useNotifications } from '../hooks/useNotifications'
import { auth } from '../lib/firebase'
import { updateProfile } from 'firebase/auth'
import HouseModal from '../components/HouseModal'
import { useStreak } from '../hooks/useStreak'
import useMovies from '../hooks/useMovies'
import { useFinance } from '../hooks/useFinance'
import { useGarden } from '../hooks/useGarden'
import BoardSticker from '../components/BoardSticker'
import type { BoardStickerItem } from '../types/board'
import StickerPickerModal from '../components/StickerPickerModal'
import {
  House,
  ShoppingBag,
  X,
  Wallet,
  Trash2,
  RotateCcw,
  StickyNote,
  Pencil,
  CheckCheck,
  Tag as Tag2,
} from 'lucide-react'

import {
  BoardItemType,
  AnyBoardItem,
  PostItItem,
  ChecklistItem,
  TagItem,
  LetterItem,
} from '../types/board'

import Toolbar from '../components/Toolbar'
import StreakCounter from '../components/StreakCounter'
import PostIt from '../components/PostIt'
import Checklist from '../components/Checklist'
import Tag from '../components/Tag'
import Letter, { LetterModal } from '../components/Letter'
import DrawingSheet from '../components/DrawingSheet'
import WeekCalendar from '../components/WeekCalendar'
import { DrawingItem } from '../types/board'
import { usePresence } from '../hooks/usePresence'
import PresenceBadge from '../components/PresenceBadge'
import Dice from '../components/Dice'
import Timer, { TimerState, makeInitialTimerState } from '../components/Timer'
import ActivityFeed from '../components/ActivityFeed'
import Roulette from '../components/Roulette'
import { PostItModal } from '../components/PostIt'
import { ChecklistModal } from '../components/Checklist'
import MoodWidget from '../components/MoodWidget'
import MovieList from '../components/MovieList'
import TimerFloat from '../components/TimerFloat'
import {
  CalendarDays,
  LayoutGrid,
  Sprout,
  Film,
  ArrowRightLeft,
  Layers,
  User,
  Sparkles,
  Trophy,
  Gem,
  Heart,
} from 'lucide-react'
import WheelMenu from '../components/WheelMenu'
import SpecialLetterModal from '../components/SpecialLetterModal'
import CustomLetterModal from '../components/CustomLetterModal'
import CustomLetterViewer from '../components/CustomLetterViewer'
import CustomLetterEnvelope from '../components/CustomLetterEnvelope'
import type { CustomLetterBoardItem } from '../types/board'
import { ref as dbRef, onValue } from 'firebase/database'
import { db } from '../lib/firebase'
import { subscribePanicMode } from '../lib/garden'
import type { CustomLetterData } from '../types/board'
import SpecialLetter from '../components/SpecialLetter'
import type { SpecialLetterItem } from '../types/board'
import { Mail } from 'lucide-react'
import { useSpecialDates } from '../hooks/useSpecialDates'
import GardenView from '../components/Garden/GardenView'
import { DEFAULT_BOARD_ID, moveItemToBoard, moveItemsByTypeToBoard, BoardMeta } from '../lib/boards'
import { useCoupleId } from '../contexts/CoupleContext'
import { useBoards } from '../hooks/useBoards'
import { CARD_MODELS } from '../assets/letters/index'
import type { CountdownPinItem } from '../types/board'
import CountdownPin from '../components/CountdownPin'
import CyclePinItem from '../components/CyclePinItem'
import CycleModal from '../components/CycleModal'
import CharacterModal from '../components/CharacterModal'
import { useCharacter } from '../hooks/useCharacter'
import { ShopModal } from '../components/ShopModal'
import FinanceModal from '../components/Finance/FinanceModal'
import type { CyclePinItem as CyclePinItemType } from '../types/board'
import { subscribeAllCycles, computeCycleState } from '../lib/cycle'
import type { CycleData } from '../lib/cycle'
import { useAchievements } from '../hooks/useAchievements'
import GameLobbyTab from '../components/Games/GameLobbyTab'
import GameModal from '../components/Games/GameModal'
import { subscribeLobby } from '../lib/games'
import type { GameMode, GameLobby } from '../lib/games'
import CardsModal from '../components/Cards/CardsModal'
import AchievementsModal from '../components/AchievementsModal'
import AchievementToast from '../components/AchievementToast'
import { subscribeFlowerHistory } from '../lib/achievements'
import { ref as stickerRef, onValue as stickerOnValue, off as stickerOff } from 'firebase/database'
import { STICKER_PACKS } from '../assets/stickers/index'
import { useNotificationCenter } from '@/hooks/useNotificationCenter'

const MURAL_WIDTH = 1920
const MURAL_HEIGHT = 1080

function clampPan(next: { x: number; y: number }) {
  const vw = typeof window !== 'undefined' ? window.innerWidth : MURAL_WIDTH
  const vh = typeof window !== 'undefined' ? window.innerHeight : MURAL_HEIGHT
  const minX = Math.min(0, vw - MURAL_WIDTH)
  const minY = Math.min(0, vh - MURAL_HEIGHT)
  return {
    x: Math.max(minX, Math.min(0, next.x)),
    y: Math.max(minY, Math.min(0, next.y)),
  }
}

function makeId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

const POSTIT_COLORS = ['yellow', 'pink', 'green', 'blue', 'lavender', 'peach'] as const
let colorCursor = 0

function bringForward(items: AnyBoardItem[], id: string): AnyBoardItem[] {
  const sorted = [...items].sort((a, b) => (a.zOrder ?? 0) - (b.zOrder ?? 0))
  const idx = sorted.findIndex((i) => i.id === id)
  if (idx === sorted.length - 1) return items
  const cur = sorted[idx]
  const next = sorted[idx + 1]
  const curZ = cur.zOrder ?? idx
  const nextZ = next.zOrder ?? idx + 1
  return items.map((item) => {
    if (item.id === cur.id) return { ...item, zOrder: nextZ + 1 }
    if (item.id === next.id) return { ...item, zOrder: curZ }
    return item
  })
}

function sendBackward(items: AnyBoardItem[], id: string): AnyBoardItem[] {
  const sorted = [...items].sort((a, b) => (a.zOrder ?? 0) - (b.zOrder ?? 0))
  const idx = sorted.findIndex((i) => i.id === id)
  if (idx === 0) return items
  const cur = sorted[idx]
  const prev = sorted[idx - 1]
  const curZ = cur.zOrder ?? idx
  const prevZ = prev.zOrder ?? idx - 1
  return items.map((item) => {
    if (item.id === cur.id) return { ...item, zOrder: prevZ - 1 }
    if (item.id === prev.id) return { ...item, zOrder: curZ }
    return item
  })
}

const SPECIAL_LAYOUT_SIZE = {
  A: { width: 220, height: 350 },
  B: { width: 220, height: 283 },
  C: { width: 220, height: 352 },
}
const SPECIAL_LAYOUT_TEXT_AREA = {
  A: { top: '30%', bottom: '22%', left: '20%', right: '10%' },
  B: { top: '28%', bottom: '18%', left: '20%', right: '10%' },
  C: { top: '30%', bottom: '24%', left: '20%', right: '10%' },
}

export default function Board({ activeBoardId }: { activeBoardId: string }) {
  const [user] = useAuthState(auth)
  const { coupleId } = useCoupleId()
  if (!coupleId) return null
  const cid = coupleId
  const [items, setItems] = useState<AnyBoardItem[]>([])
  const [trashedItems, setTrashedItems] = useState<AnyBoardItem[]>([])
  const [trashOpen, setTrashOpen] = useState(false)
  const [selectedTool, setSelectedTool] = useState<BoardItemType | null>(null)
  const [editMode, setEditMode] = useState(false)
  const {
    saveItem,
    deleteItem,
    trashItem,
    restoreItem: restoreFromDeleted,
    markMoving,
  } = useBoard(items, setItems, activeBoardId)
  const boardRef = useRef<HTMLDivElement>(null)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const panRef = useRef({ x: 0, y: 0 })
  const panDragStartRef = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null)
  const didPanDragRef = useRef(false)
  const [isPanning, setIsPanning] = useState(false)

  const updatePan = useCallback((next: { x: number; y: number }) => {
    const clamped = clampPan(next)
    panRef.current = clamped
    setPan(clamped)
  }, [])

  const uid = user?.uid ?? 'anon'
  const displayName = user?.displayName ?? ''
  const { myPresence, partnerPresence, partnerUid } = usePresence(uid, displayName)
  useNotifications(uid, partnerUid, partnerPresence?.displayName ?? '', cid)
  const otherName = partnerPresence?.displayName ?? '...'
  const [nickSaved, setNickSaved] = useState(!!user?.displayName)
  const [nickInput, setNickInput] = useState('')
  const [nickLoading, setNickLoading] = useState(false)
  const [showCalendar, setShowCalendar] = useState(false)
  const [showMovies, setShowMovies] = useState(false)
  const [showGarden, setShowGarden] = useState(false)
  const [showWidgets, setShowWidgets] = useState(false)
  const [activeWidget, setActiveWidget] = useState<'dice' | 'timer' | 'roulette' | 'jogos'>('dice')
  const [activeGame, setActiveGame] = useState<{ mode: GameMode } | null>(null)

  const [sharedDice, setSharedDice] = useState(false)
  const [timerState, setTimerState] = useState<TimerState>(makeInitialTimerState)
  const [timerDismissed, setTimerDismissed] = useState(false)
  const [openModalItem, setOpenModalItem] = useState<AnyBoardItem | null>(null)
  const [openSpecialLetter, setOpenSpecialLetter] = useState<SpecialLetterItem | null>(null)
  const [openLetter, setOpenLetter] = useState<LetterItem | null>(null)
  const [showSpecialLetter, setShowSpecialLetter] = useState(false)
  const [pinColorPicker, setPinColorPicker] = useState<{
    entry: { id: string; text: string }
    dateKey: string
  } | null>(null)
  const isNana = uid === import.meta.env.VITE_NANA_UID
  const [showCycleModal, setShowCycleModal] = useState(false)
  const [showCharacter, setShowCharacter] = useState(false)
  const [showHouse, setShowHouse] = useState(false)
  const [showShop, setShowShop] = useState(false)
  const [showFinance, setShowFinance] = useState(false)
  const [showAchievements, setShowAchievements] = useState(false)
  const [showCards, setShowCards] = useState(false)
  const [panicMode, setPanicModeLocal] = useState(false)
  useEffect(() => {
    const unsub = subscribePanicMode(cid, setPanicModeLocal)
    return unsub
  }, [cid])
  const [showCustomLetter, setShowCustomLetter] = useState(false)
  const [stickerPickerPos, setStickerPickerPos] = useState<{ x: number; y: number } | null>(null)
  const [openCustomLetterViewer, setOpenCustomLetterViewer] = useState<CustomLetterData | null>(
    null
  )
  const [shopInitialItem, setShopInitialItem] = useState<string | undefined>()
  const [cycleToast, setCycleToast] = useState<string | null>(null)
  const [allCycles, setAllCycles] = useState<Record<string, CycleData>>({})
  const [flowerHistory, setFlowerHistory] = useState<string[]>([])
  const [ownedPacks, setOwnedPacks] = useState<Record<string, boolean>>({})
  const [uniqueStickersOnBoard, setUniqueStickersOnBoard] = useState(0)
  const [cyclePicker, setCyclePicker] = useState<{ key: string; data: CycleData }[] | null>(null)
  const { extraBoards } = useBoards(cid, uid)
  const extraBoardIds = extraBoards.map((b: BoardMeta) => b.id)

  const extraBoardNamesForNotif = useMemo(
    () => Object.fromEntries(extraBoards.map((b: BoardMeta) => [b.id, b.name])),
    [extraBoards]
  )
  const { notifications: boardNotifications } = useNotificationCenter({
    uid,
    partnerUid,
    coupleId: cid,
    myNick: displayName,
    partnerNick: partnerPresence?.displayName ?? '',
    extraBoardNames: extraBoardNamesForNotif,
  })

  const notifCountBySection = useMemo(() => {
    const garden = boardNotifications.filter((n) => n.type === 'garden-water').length
    const agenda = boardNotifications.filter((n) => n.type === 'calendar-event').length
    const carta = boardNotifications.filter(
      (n) => n.type === 'letter' || n.type === 'special-letter'
    ).length
    const total = boardNotifications.length
    return { garden, agenda, carta, total }
  }, [boardNotifications])
  // reconecta partida em andamento ao montar / ao abrir aba jogos
  useEffect(() => {
    if (!activeBoardId) return
    const unsub = subscribeLobby(cid, activeBoardId, (lobby: GameLobby | null) => {
      if (!activeGame && lobby?.state === 'starting' && lobby.mode) {
        setActiveGame({ mode: lobby.mode as GameMode })
      }
    })
    return unsub
  }, [activeBoardId, activeGame])

  useEffect(() => {
    const unsub = subscribeAllCycles(cid, setAllCycles)
    return unsub
  }, [])

  useEffect(() => {
    const unsub = subscribeFlowerHistory(cid, setFlowerHistory)
    return unsub
  }, [])
  useEffect(() => {
    const r = stickerRef(db, `couples/${cid}/customLetterStickers/shared/owned`)
    const handler = stickerOnValue(r, (snap) => {
      setOwnedPacks((snap.val() ?? {}) as Record<string, boolean>)
    })
    return () => stickerOff(r, 'value', handler)
  }, [])
  useEffect(() => {
    const allBoardIds = [DEFAULT_BOARD_ID, ...extraBoardIds]
    const keysByBoard: Record<string, Set<string>> = {}
    const unsubs: (() => void)[] = []

    function recalc() {
      const all = new Set<string>()
      for (const s of Object.values(keysByBoard)) s.forEach((k) => all.add(k))
      setUniqueStickersOnBoard(all.size)
    }

    for (const boardId of allBoardIds) {
      keysByBoard[boardId] = new Set()
      const path =
        boardId === DEFAULT_BOARD_ID
          ? `couples/${cid}/board/items`
          : `couples/${cid}/boards/${boardId}/items`
      const r = stickerRef(db, path)
      const handler = stickerOnValue(r, (snap) => {
        const data = (snap.val() ?? {}) as Record<string, { type: string; stickerKey?: string }>
        keysByBoard[boardId] = new Set(
          Object.values(data)
            .filter((i) => i.type === 'board-sticker' && i.stickerKey)
            .map((i) => i.stickerKey!)
        )
        recalc()
      })
      unsubs.push(() => stickerOff(r, 'value', handler))
    }

    return () => unsubs.forEach((u) => u())
  }, [extraBoardIds.join(',')])

  function showCycleToast(msg: string) {
    setCycleToast(msg)
    setTimeout(() => setCycleToast(null), 3000)
  }
  const {
    config: characterConfig,
    saveConfig: saveCharacterConfig,
    unlockedIds,
    presets,
    savePreset,
    deletePreset,
  } = useCharacter(uid)
  const { dates: specialDates, saveDates: saveSpecialDates } = useSpecialDates(cid)
  const { days } = useStreak(cid, uid, displayName, panicMode)
  const { movies, moviesLoaded } = useMovies(cid, uid, displayName)
  const {
    transactions,
    activeGoals: goals,
    activeDebts,
    paidDebts,
  } = useFinance(cid, uid, partnerUid ?? '')

  const ownedPackCount = STICKER_PACKS.filter((p) =>
    p.stickers.every((s) => (ownedPacks as Record<string, boolean>)[s.key] === true)
  ).length
  const totalPackCount = STICKER_PACKS.length
  const { plants, seeds, coins, maxPlants } = useGarden(cid, uid, partnerUid ?? '')
  const { achievements, unlock, claim, categoryBonus, newlyUnlocked, clearNewlyUnlocked, reset } =
    useAchievements({
      uid,
      plants,
      seeds,
      coins,
      maxPlants,
      streakDays: days,
      movies: movies.map((m) => ({ tipo: m.type, status: m.status })),
      goals,
      debts: [...activeDebts, ...paidDebts],
      transactions,
      datingDate: specialDates?.datingDate,
      moviesLoaded,
      ownedPackCount,
      totalPackCount,
      uniqueStickersOnBoard,
    })
  const { letterCount, specialCount } = useLetterCounts(extraBoardIds)
  // destrava conquistas retroativas de cartas já existentes
  useEffect(() => {
    if (letterCount >= 1) unlock('first_letter')
    if (letterCount >= 10) unlock('letters_10')
    if (letterCount >= 50) unlock('letters_50')
    if (specialCount >= 1) unlock('first_special')
    if (specialCount >= 10) unlock('special_10')
    if (specialCount >= 50) unlock('special_50')
  }, [letterCount, specialCount])
  const defaultBoard: BoardMeta = {
    id: DEFAULT_BOARD_ID,
    name: 'mural principal',
    createdAt: 0,
    createdBy: '',
  }
  const allBoards =
    activeBoardId === DEFAULT_BOARD_ID ? extraBoards : [defaultBoard, ...extraBoards]
  const otherBoards = allBoards.filter((b: BoardMeta) => b.id !== activeBoardId)

  const [contextMenu, setContextMenu] = useState<{
    x: number
    y: number
    item: AnyBoardItem
  } | null>(null)

  const handleContextMenu = useCallback(
    (e: React.MouseEvent, item: AnyBoardItem) => {
      if (otherBoards.length === 0) return
      e.preventDefault()
      e.stopPropagation()
      setContextMenu({ x: e.clientX, y: e.clientY, item })
    },
    [otherBoards]
  )

  const handleMoveItem = useCallback(
    async (item: AnyBoardItem, toBoardId: string) => {
      setContextMenu(null)
      setItems((prev) => prev.filter((i) => i.id !== item.id))
      markMoving(item.id)
      await moveItemToBoard(item, activeBoardId, toBoardId, cid)
    },
    [activeBoardId, markMoving]
  )

  const handleMoveByType = useCallback(
    async (type: string, toBoardId: string) => {
      setContextMenu(null)
      setItems((prev) => {
        const toMove = prev.filter((i) => i.type === type)
        moveItemsByTypeToBoard(toMove, type, activeBoardId, toBoardId, cid)
        return prev.filter((i) => i.type !== type)
      })
    },
    [activeBoardId, setItems]
  )

  const handleOpenModal = useCallback(
    (id: string) => {
      const found = items.find((i) => i.id === id) ?? null
      setOpenModalItem(found)
    },
    [items]
  )

  const handleSaveNick = async () => {
    if (!nickInput.trim() || !user) return
    setNickLoading(true)
    await updateProfile(user, { displayName: nickInput.trim() })
    setNickSaved(true)
    setNickLoading(false)
  }

  const nextZOrder = () => Math.max(0, ...items.map((i) => i.zOrder ?? 0)) + 1

  const makeBase = (type: BoardItemType, x: number, y: number) => {
    const now = new Date().toISOString()
    return {
      id: makeId(),
      type,
      x,
      y,
      width: type === 'postit' ? 150 : type === 'checklist' ? 160 : type === 'tag' ? 100 : 110,
      height: type === 'postit' ? 120 : type === 'checklist' ? 130 : type === 'tag' ? 32 : 80,
      createdBy: uid,
      updatedBy: uid,
      createdAt: now,
      updatedAt: now,
      zOrder: nextZOrder(),
    }
  }

  const handleBoardPanStart = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (editMode) return
      if (e.button !== 0) return
      const target = e.target as HTMLElement
      // só ativa em cima de um item do mural OU no fundo vazio do mural
      const isMuralArea = target === boardRef.current || !!target.closest('[data-item]')
      if (!isMuralArea) return

      document.body.style.userSelect = 'none'
      setIsPanning(true)

      panDragStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        panX: panRef.current.x,
        panY: panRef.current.y,
      }
      didPanDragRef.current = false

      const THRESHOLD = 6

      function onMove(ev: MouseEvent) {
        const start = panDragStartRef.current
        if (!start) return
        const dx = ev.clientX - start.x
        const dy = ev.clientY - start.y
        if (!didPanDragRef.current && (Math.abs(dx) > THRESHOLD || Math.abs(dy) > THRESHOLD)) {
          didPanDragRef.current = true
        }
        if (didPanDragRef.current) {
          updatePan({ x: start.panX + dx, y: start.panY + dy })
        }
      }

      function onUp() {
        window.removeEventListener('mousemove', onMove)
        window.removeEventListener('mouseup', onUp)
        panDragStartRef.current = null
        document.body.style.userSelect = ''
        setIsPanning(false)

        if (didPanDragRef.current && boardRef.current) {
          const swallowClick = (ev: MouseEvent) => {
            ev.stopPropagation()
            ev.preventDefault()
          }
          boardRef.current.addEventListener('click', swallowClick, { capture: true, once: true })
        }
        didPanDragRef.current = false
      }

      window.addEventListener('mousemove', onMove)
      window.addEventListener('mouseup', onUp)
    },
    [editMode, updatePan]
  )

  const handleBoardClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (editMode) return
      if (!selectedTool) return
      if ((e.target as HTMLElement).closest('[data-modal]')) return
      const target = e.target as HTMLElement
      const tag = target.tagName.toLowerCase()
      const isBackground =
        ['div', 'svg', 'rect', 'path', 'line', 'g', 'stop', 'radialgradient'].includes(tag) &&
        (target === boardRef.current || !target.closest('[data-item]'))
      if (!isBackground) return

      const rect = boardRef.current!.getBoundingClientRect()
      const x = e.clientX - rect.left - panRef.current.x - 75
      const y = e.clientY - rect.top - panRef.current.y - 40

      if (selectedTool === 'postit') {
        const postitColor = POSTIT_COLORS[colorCursor % POSTIT_COLORS.length]
        colorCursor += 1
        const item: PostItItem = {
          ...makeBase('postit', x, y),
          type: 'postit',
          content: '',
          color: postitColor,
        }
        setItems((prev) => [...prev, item])
        saveItem(item)
        setSelectedTool(null)
      } else if (selectedTool === 'checklist') {
        const item: ChecklistItem = {
          ...makeBase('checklist', x, y),
          type: 'checklist',
          entries: [],
          color: 'yellow',
        }
        setItems((prev) => [...prev, item])
        saveItem(item)
        setSelectedTool(null)
      } else if (selectedTool === 'tag') {
        const item: TagItem = {
          ...makeBase('tag', x, y),
          type: 'tag',
          label: 'nova tag',
          color: String(Math.floor(Math.random() * 6)),
        }
        setItems((prev) => [...prev, item])
        saveItem(item)
        setSelectedTool(null)
      } else if (selectedTool === 'letter') {
        const item: LetterItem = {
          ...makeBase('letter', x, y),
          type: 'letter',
          from: displayName,
          to: otherName,
          content: '',
          opened: false,
        }
        setItems((prev) => [...prev, item])
        saveItem(item)
        unlock('first_letter')
        const newLetterCount = letterCount + 1
        if (newLetterCount >= 10) unlock('letters_10')
        if (newLetterCount >= 50) unlock('letters_50')
        setSelectedTool(null)
      } else if (selectedTool === 'drawing') {
        const item: DrawingItem = {
          ...makeBase('drawing', x, y),
          type: 'drawing',
          drawingData: '',
        }
        setItems((prev) => [...prev, item])
        saveItem(item)
        setSelectedTool(null)
      }
    },
    [editMode, selectedTool, uid, displayName, otherName, items, unlock]
  )

  const handleUpdate = useCallback(
    (id: string, data: Partial<AnyBoardItem>) => {
      setItems((prev) => {
        const next = prev.map((item) =>
          item.id === id
            ? ({
                ...item,
                ...data,
                updatedAt: new Date().toISOString(),
                updatedBy: uid,
              } as AnyBoardItem)
            : item
        )
        const updated = next.find((item) => item.id === id)
        if (updated) saveItem(updated)
        return next
      })
    },
    [uid, saveItem]
  )

  const handleDelete = useCallback(
    (id: string) => {
      trashItem(id)
      setItems((prev) => {
        const item = prev.find((i) => i.id === id)
        if (item) {
          setTrashedItems((t) => {
            if (t.some((x) => x.id === id)) return t
            return [...t, item]
          })
        }
        return prev.filter((i) => i.id !== id)
      })
    },
    [trashItem]
  )

  const handleDeletePin = useCallback(
    (id: string) => {
      deleteItem(id)
      setItems((prev) => prev.filter((i) => i.id !== id))
    },
    [deleteItem]
  )

  const handleRestore = useCallback(
    (id: string) => {
      restoreFromDeleted(id)
      setTrashedItems((prev) => {
        const item = prev.find((i) => i.id === id)
        if (item) saveItem(item)
        return prev.filter((i) => i.id !== id)
      })
    },
    [saveItem, restoreFromDeleted]
  )

  const handleTrashClose = useCallback(() => {
    setTrashedItems((prev) => {
      prev.forEach((item) => deleteItem(item.id))
      return []
    })
    setTrashOpen(false)
  }, [deleteItem])

  const handleDeleteForever = useCallback(
    (id: string) => {
      setTrashedItems((prev) => {
        const item = prev.find((i) => i.id === id)
        if (item) deleteItem(item.id)
        return prev.filter((i) => i.id !== id)
      })
    },
    [deleteItem]
  )

  const handleBringForward = useCallback(
    (id: string) => {
      setItems((prev) => {
        const next = bringForward(prev, id)
        next.forEach((item) => {
          const old = prev.find((p) => p.id === item.id)
          if (old?.zOrder !== item.zOrder) saveItem(item)
        })
        return next
      })
    },
    [saveItem]
  )

  const handleSendBackward = useCallback(
    (id: string) => {
      setItems((prev) => {
        const next = sendBackward(prev, id)
        next.forEach((item) => {
          const old = prev.find((p) => p.id === item.id)
          if (old?.zOrder !== item.zOrder) saveItem(item)
        })
        return next
      })
    },
    [saveItem]
  )

  const handleFocus = useCallback(
    (id: string) => {
      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, zOrder: nextZOrder() } : item))
      )
    },
    [items]
  )

  const handlePinToBoard = useCallback(
    (entry: { id: string; text: string }, dateKey: string, color: string) => {
      const item: CountdownPinItem = {
        id: makeId(),
        type: 'countdown-pin',
        x: 300,
        y: 200,
        width: 210,
        height: 80,
        createdBy: uid,
        updatedBy: uid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        zOrder: nextZOrder(),
        label: entry.text,
        targetDate: dateKey,
        color,
      }
      console.log('onSent chamado, item:', item)
      setItems((prev) => [...prev, item as unknown as AnyBoardItem])
      saveItem(item as unknown as AnyBoardItem)
      unlock('first_special')
      const newSpecialCount = specialCount + 1
      if (newSpecialCount >= 10) unlock('special_10')
      if (newSpecialCount >= 50) unlock('special_50')
      setShowCustomLetter(false)
    },
    [uid, saveItem, items, unlock]
  )

  const sortedItems = [...items].sort((a, b) => (a.zOrder ?? 0) - (b.zOrder ?? 0))

  if (!nickSaved) {
    return (
      <div
        className="fixed inset-0 flex items-center justify-center"
        style={{ background: 'linear-gradient(160deg, #f0f7f0 0%, #e8f5e8 60%, #f5f0e8 100%)' }}
      >
        <div
          style={{
            background: '#f2faf2',
            border: '1px solid #d8eed8',
            borderRadius: 20,
            padding: '2rem 2.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
            alignItems: 'center',
            fontFamily: 'Baloo 2, sans-serif',
            minWidth: 300,
          }}
        >
          <span style={{ fontSize: 36 }}>🌱</span>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#2d4a2d' }}>
            qual é o seu apelido?
          </div>
          <input
            autoFocus
            type="text"
            placeholder="ex: nana, gueguel"
            value={nickInput}
            onChange={(e) => setNickInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSaveNick()
            }}
            style={{
              background: '#eaf5ea',
              border: '1.5px solid #a8d8a8',
              borderRadius: 10,
              padding: '0.75rem 1.1rem',
              fontSize: 13,
              color: '#2d4a2d',
              outline: 'none',
              width: '100%',
              fontFamily: 'Baloo 2, sans-serif',
            }}
          />
          <button
            onClick={handleSaveNick}
            disabled={nickLoading}
            style={{
              padding: '0.45rem 1.4rem',
              color: '#5a2e0e',
              fontWeight: 700,
              borderRadius: 10,
              background: 'linear-gradient(180deg, #d4956a 0%, #c4845a 40%, #b8744e 100%)',
              boxShadow: '0 3px 10px #8b5a2a44',
              border: '2px solid #8b5a2a',
              cursor: 'pointer',
              fontFamily: 'Baloo 2, sans-serif',
              fontSize: 13,
            }}
          >
            {nickLoading ? '...' : 'salvar 🌿'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <div
        ref={boardRef}
        className="fixed inset-0 overflow-hidden"
        style={{
          background: '#c8a882',
          cursor: editMode
            ? 'default'
            : selectedTool
              ? 'crosshair'
              : isPanning
                ? 'grabbing'
                : 'grab',
        }}
        onClick={handleBoardClick}
        onMouseDown={handleBoardPanStart}
      >
        {/* Textura de madeira */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <filter id="grain">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.9"
                numOctaves="4"
                stitchTiles="stitch"
              />
              <feColorMatrix type="saturate" values="0" />
              <feBlend in="SourceGraphic" mode="multiply" />
            </filter>
          </defs>
          <rect width="100%" height="100%" fill="#c8a882" />
          <g stroke="#8b5a2a" fill="none" opacity="0.18">
            <path d="M-100 120 Q300 100 700 130 Q1100 160 1500 120 Q1900 90 2200 125" />
            <path d="M-100 240 Q400 220 800 255 Q1200 280 1600 245 Q1900 220 2200 250" />
            <path d="M-100 380 Q350 360 750 390 Q1150 415 1550 385 Q1850 360 2200 380" />
            <path d="M-100 500 Q300 480 700 510 Q1100 535 1500 505 Q1850 480 2200 500" />
            <path d="M-100 640 Q400 620 800 648 Q1200 670 1600 642 Q1900 620 2200 640" />
            <path d="M-100 760 Q350 740 750 768 Q1150 790 1550 762 Q1850 742 2200 760" />
            <path d="M-100 60  Q300 42  700 68  Q1100 90  1500 62  Q1900 40  2200 62" />
            <path d="M-100 880 Q400 862 800 888 Q1200 908 1600 882 Q1900 862 2200 880" />
          </g>
          <g stroke="#7a4a20" fill="none" opacity="0.12">
            <path d="M-100 180 Q500 165 900 185 Q1300 205 1700 178 Q2000 160 2200 182" />
            <path d="M-100 310 Q450 295 850 318 Q1250 338 1650 312 Q1950 293 2200 315" />
            <path d="M-100 450 Q400 435 800 458 Q1200 478 1600 452 Q1900 432 2200 455" />
            <path d="M-100 590 Q350 575 750 595 Q1150 615 1550 590 Q1850 572 2200 592" />
            <path d="M-100 720 Q500 705 900 725 Q1300 745 1700 718 Q2000 700 2200 722" />
          </g>
          <g stroke="#7a4a20" fill="none" opacity="0.28">
            <path
              d="M100 268 Q140 252 185 258 Q225 263 248 278 Q228 298 185 302 Q140 306 100 292 Q82 282 100 268Z"
              strokeWidth="1.5"
            />
            <path
              d="M118 272 Q150 262 183 266 Q212 270 228 280 Q212 294 183 297 Q150 300 118 288 Q104 281 118 272Z"
              strokeWidth="1"
            />
            <path d="M100 280 Q50 276 -100 272" strokeWidth="1.2" />
            <path d="M248 278 Q400 274 650 278" strokeWidth="1.2" />
          </g>
          <g stroke="#7a4a20" fill="none" opacity="0.22">
            <path
              d="M1020 506 Q1065 488 1118 494 Q1168 499 1192 516 Q1170 538 1118 542 Q1065 546 1020 530 Q998 520 1020 506Z"
              strokeWidth="1.5"
            />
            <path d="M1020 518 Q880 514 650 518" strokeWidth="1.2" />
            <path d="M1192 516 Q1380 512 1700 516" strokeWidth="1.2" />
          </g>
          <g stroke="#7a4a20" fill="none" opacity="0.18">
            <path
              d="M340 738 Q368 728 398 732 Q424 736 436 748 Q422 762 398 765 Q368 768 340 756 Q326 748 340 738Z"
              strokeWidth="1.2"
            />
            <path d="M340 748 Q200 744 -100 748" strokeWidth="1" />
            <path d="M436 748 Q600 744 820 748" strokeWidth="1" />
          </g>
          <rect width="100%" height="100%" fill="url(#grain)" opacity="0.04" filter="url(#grain)" />
          <radialGradient id="vignette" cx="50%" cy="50%" r="70%">
            <stop offset="60%" stopColor="transparent" />
            <stop offset="100%" stopColor="#5a3010" stopOpacity="0.18" />
          </radialGradient>
          <rect width="100%" height="100%" fill="url(#vignette)" />
        </svg>
        {/* Itens do mural */}
        <div style={{ transform: `translate(${pan.x}px, ${pan.y}px)` }}>
          {sortedItems.map((item) => {
            const z = Math.min((item.zOrder ?? 0) + 10, 40)
            const commonProps = {
              editMode,
              zIndex: z,
              onUpdate: handleUpdate as never,
              onDelete: handleDelete,
              onBringForward: handleBringForward,
              onSendBackward: handleSendBackward,
              onFocus: handleFocus,
            }
            const withContext = (i: AnyBoardItem) => ({
              onContextMenu: (e: React.MouseEvent) => handleContextMenu(e, i),
            })
            if (item.type === 'postit') {
              return (
                <PostIt
                  key={item.id}
                  {...commonProps}
                  {...withContext(item)}
                  item={item as PostItItem}
                  onOpenModal={handleOpenModal}
                />
              )
            }
            if (item.type === 'checklist') {
              return (
                <Checklist
                  key={item.id}
                  {...commonProps}
                  {...withContext(item)}
                  item={item as ChecklistItem}
                  onOpenModal={handleOpenModal}
                />
              )
            }
            if (item.type === 'tag') {
              return (
                <Tag key={item.id} {...commonProps} {...withContext(item)} item={item as TagItem} />
              )
            }
            if (item.type === 'letter') {
              return (
                <Letter
                  key={item.id}
                  {...commonProps}
                  {...withContext(item)}
                  item={item as LetterItem}
                  currentUid={uid}
                  displayName={displayName}
                  otherName={otherName}
                  onOpenModal={(i) => {
                    const fresh = items.find((x) => x.id === i.id)
                    setOpenLetter((fresh as LetterItem) ?? i)
                  }}
                />
              )
            }
            if (item.type === 'drawing') {
              return (
                <DrawingSheet
                  key={item.id}
                  {...commonProps}
                  {...withContext(item)}
                  item={item as DrawingItem}
                />
              )
            }
            if (item.type === 'special-letter') {
              return (
                <SpecialLetter
                  key={item.id}
                  item={item as SpecialLetterItem}
                  isOwner={item.createdBy === uid}
                  editMode={editMode}
                  zIndex={z}
                  onOpen={(id) => handleUpdate(id, { opened: true })}
                  onOpenModal={(i) => setOpenSpecialLetter(i as SpecialLetterItem)}
                  onUpdate={handleUpdate as never}
                  onDelete={handleDelete}
                  onBringForward={handleBringForward}
                  onSendBackward={handleSendBackward}
                  onFocus={handleFocus}
                  {...withContext(item)}
                />
              )
            }

            if (item.type === 'countdown-pin') {
              return (
                <CountdownPin
                  key={item.id}
                  item={item as CountdownPinItem}
                  zIndex={z}
                  onUpdate={handleUpdate as never}
                  onDelete={handleDeletePin}
                  onFocus={handleFocus}
                />
              )
            }
            if (item.type === 'cycle-pin') {
              return (
                <CyclePinItem
                  key={item.id}
                  coupleId={coupleId}
                  item={item as CyclePinItemType}
                  zIndex={z}
                  onUpdate={handleUpdate as never}
                  onDelete={handleDeletePin}
                  onFocus={handleFocus}
                />
              )
            }
            if (item.type === 'board-sticker') {
              return (
                <BoardSticker
                  key={item.id}
                  item={item as BoardStickerItem}
                  editMode={editMode}
                  zIndex={z}
                  onUpdate={handleUpdate as never}
                  onDelete={handleDelete}
                  onBringForward={handleBringForward}
                  onSendBackward={handleSendBackward}
                  onFocus={handleFocus}
                  {...withContext(item)}
                />
              )
            }
            if (item.type === 'custom-letter') {
              return (
                <CustomLetterEnvelope
                  key={item.id}
                  item={item as CustomLetterBoardItem}
                  isOwner={item.createdBy === uid}
                  editMode={editMode}
                  zIndex={z}
                  panicMode={panicMode}
                  onOpen={(id: string) =>
                    handleUpdate(id, { opened: true, openedAt: new Date().toISOString() } as any)
                  }
                  onOpenViewer={(i: CustomLetterBoardItem) => {
                    const r = dbRef(db, `couples/${cid}/customLetters/${i.letterId}`)
                    onValue(
                      r,
                      (snap) => {
                        if (snap.exists()) setOpenCustomLetterViewer(snap.val() as CustomLetterData)
                      },
                      { onlyOnce: true }
                    )
                  }}
                  onUpdate={handleUpdate as never}
                  onDelete={handleDelete}
                  onBringForward={handleBringForward}
                  onSendBackward={handleSendBackward}
                  onFocus={handleFocus}
                  {...withContext(item)}
                />
              )
            }
            return null
          })}
        </div>
        {/* Dica inicial */}
        {!editMode && items.length === 0 && (
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            style={{ zIndex: 5 }}
          >
            <p
              style={{
                color: '#3a1a08',
                opacity: 0.35,
                fontSize: 15,
                fontFamily: 'Baloo 2, sans-serif',
                letterSpacing: '0.02em',
              }}
            >
              {activeBoardId === DEFAULT_BOARD_ID
                ? 'clique no mural pra adicionar algo 🌿'
                : 'mural vazio — clique pra adicionar algo 🌿'}
            </p>
          </div>
        )}
        <PresenceBadge myPresence={myPresence} partnerPresence={partnerPresence} />
        <MoodWidget coupleId={cid} uid={uid} partnerUid={partnerUid} />
        {cycleToast && (
          <div
            style={{
              position: 'fixed',
              bottom: 32,
              left: '50%',
              transform: 'translateX(-50%)',
              background:
                'linear-gradient(160deg, rgba(253,246,240,0.55) 0%, rgba(252,232,238,0.45) 100%)',
              border: '1.5px solid rgba(255,255,255,0.35)',
              backdropFilter: 'blur(18px) saturate(1.4)',
              WebkitBackdropFilter: 'blur(18px) saturate(1.4)',
              borderRadius: 14,
              padding: '10px 20px',
              fontFamily: 'Baloo 2, sans-serif',
              fontSize: 13,
              fontWeight: 700,
              color: '#7a3040',
              boxShadow: '0 4px 20px rgba(44,20,8,0.2)',
              zIndex: 999,
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
            }}
          >
            {cycleToast}
          </div>
        )}

        {/* ── Roda: essenciais (direita, embaixo) ── */}
        <WheelMenu
          bottom={9}
          right={9}
          radius={58}
          size={180}
          totalNotif={notifCountBySection.agenda + notifCountBySection.carta}
          centerIcon={<Sparkles size={20} strokeWidth={1.8} />}
          centerBg="rgba(210,185,245,0.42)"
          centerBgActive="rgba(220,175,235,0.55)"
          centerBorder="rgba(255,255,255,0.55)"
          centerShadow="0 4px 16px rgba(160,100,200,0.25)"
          items={[
            {
              id: 'agenda',
              icon: <CalendarDays size={17} strokeWidth={1.8} />,
              label: 'agenda',
              onClick: () => setShowCalendar(true),
              bg: 'rgba(175,220,215,0.48)',
              border: 'rgba(120,185,178,0.65)',
              notifCount: notifCountBySection.agenda,
              notifColor: '#c87090',
            },
            {
              id: 'carta',
              icon: <Mail size={17} strokeWidth={1.8} />,
              label: 'carta',
              onClick: () => setShowSpecialLetter(true),
              bg: 'rgba(245,185,210,0.48)',
              border: 'rgba(215,145,180,0.65)',
              notifCount: notifCountBySection.carta,
              notifColor: '#E8A0B0',
            },
            {
              id: 'widgets',
              icon: <LayoutGrid size={17} strokeWidth={1.8} />,
              label: 'widgets',
              onClick: () => setShowWidgets(true),
              bg: 'rgba(210,185,245,0.48)',
              border: 'rgba(170,140,225,0.65)',
            },
            {
              id: 'financas',
              icon: <Wallet size={17} strokeWidth={1.8} />,
              label: 'finanças',
              onClick: () => setShowFinance(true),
              bg: 'rgba(196,149,106,0.48)',
              border: 'rgba(175,120,70,0.65)',
            },
            {
              id: 'filmes',
              icon: <Film size={17} strokeWidth={1.8} />,
              label: 'filmes',
              onClick: () => setShowMovies(true),
              bg: 'rgba(180,210,245,0.48)',
              border: 'rgba(130,170,225,0.65)',
            },
          ]}
        />

        {/* ── Roda: nosso cantinho (direita, empilhada acima, reta com a de baixo) ── */}
        <WheelMenu
          bottom={195}
          right={9}
          radius={58}
          size={180}
          totalNotif={notifCountBySection.garden}
          centerIcon={<Heart size={20} strokeWidth={1.8} />}
          centerBg="rgba(232,160,176,0.42)"
          centerBgActive="rgba(232,140,160,0.55)"
          centerBorder="rgba(255,255,255,0.55)"
          centerShadow="0 4px 16px rgba(200,112,144,0.25)"
          items={[
            {
              id: 'jardim',
              icon: <Sprout size={20} strokeWidth={1.8} />,
              label: 'jardim',
              onClick: () => setShowGarden(true),
              bg: 'rgba(160,220,170,0.48)',
              border: 'rgba(140,200,150,0.65)',
              notifCount: notifCountBySection.garden,
              notifColor: '#7FB87F',
            },
            {
              id: 'casa',
              icon: <House size={17} strokeWidth={1.8} />,
              label: 'casa',
              onClick: () => setShowHouse(true),
              bg: 'rgba(180,210,245,0.48)',
              border: 'rgba(140,175,225,0.65)',
            },
            {
              id: 'roupa',
              icon: <User size={17} strokeWidth={1.8} />,
              label: 'roupa',
              onClick: () => setShowCharacter(true),
              bg: 'rgba(235,185,220,0.48)',
              border: 'rgba(205,145,190,0.65)',
            },
            {
              id: 'loja',
              icon: <ShoppingBag size={17} strokeWidth={1.8} />,
              label: 'loja',
              onClick: () => setShowShop(true),
              bg: 'rgba(245,210,160,0.48)',
              border: 'rgba(220,175,110,0.65)',
            },
            {
              id: 'cartinhas',
              icon: <Gem size={17} strokeWidth={1.8} />,
              label: 'coleção de cartas',
              onClick: () => setShowCards(true),
              bg: 'rgba(200,112,144,0.35)',
              border: 'rgba(200,112,144,0.55)',
            },
            {
              id: 'conquistas',
              icon: <Trophy size={17} strokeWidth={1.8} />,
              label: 'conquistas',
              onClick: () => setShowAchievements(true),
              bg: 'rgba(196,149,106,0.48)',
              border: 'rgba(175,120,70,0.65)',
            },
          ]}
        />

        {/* Painel de widgets */}
        {showWidgets && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 60,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(44,20,8,0.35)',
              backdropFilter: 'blur(4px)',
            }}
            onClick={() => setShowWidgets(false)}
          >
            <div
              style={{
                background:
                  'linear-gradient(160deg, rgba(253,246,240,0.97) 0%, rgba(252,232,238,0.97) 100%)',
                border: '1.5px solid rgba(232,160,176,0.4)',
                borderRadius: 20,
                boxShadow: '0 8px 40px rgba(200,120,140,0.2), inset 0 1px 0 rgba(255,255,255,0.6)',
                backdropFilter: 'blur(18px) saturate(1.4)',
                width: 340,
                maxWidth: '92vw',
                maxHeight: '80vh',
                fontFamily: 'Baloo 2, sans-serif',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
              }}
              onClick={(e) => e.stopPropagation()}
              data-modal="true"
            >
              {/* header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 20px',
                  borderBottom: '2px dashed rgba(232,160,176,0.4)',
                  flexShrink: 0,
                }}
              >
                <span style={{ fontSize: 15, fontWeight: 800, color: '#3d1a10' }}>widgets</span>
                <button
                  type="button"
                  onClick={() => setShowWidgets(false)}
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

              {/* tabs */}
              <div
                style={{
                  display: 'flex',
                  gap: 6,
                  padding: '12px 20px 0',
                  flexShrink: 0,
                }}
              >
                {(
                  [
                    { id: 'dice', label: 'dados' },
                    { id: 'timer', label: 'timer' },
                    { id: 'roulette', label: 'roleta' },
                    { id: 'jogos', label: 'jogos' },
                  ] as const
                ).map((w) => (
                  <button
                    key={w.id}
                    type="button"
                    onClick={() => setActiveWidget(w.id)}
                    style={{
                      flex: 1,
                      padding: '7px 0',
                      borderRadius: 10,
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: 12,
                      fontFamily: 'Baloo 2, sans-serif',
                      fontWeight: 800,
                      background:
                        activeWidget === w.id ? 'rgba(232,160,176,0.55)' : 'rgba(232,160,176,0.15)',
                      color: '#3d1a10',
                      transition: 'all 0.15s',
                    }}
                  >
                    {w.label}
                  </button>
                ))}
              </div>

              {/* conteúdo */}
              <div style={{ overflowY: 'auto', flex: 1, padding: '14px 20px 20px' }}>
                {activeWidget === 'dice' && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
                    <button
                      type="button"
                      onClick={() => setSharedDice((v) => !v)}
                      style={{
                        fontSize: 11,
                        fontFamily: 'Baloo 2, sans-serif',
                        fontWeight: 800,
                        cursor: 'pointer',
                        padding: '4px 12px',
                        borderRadius: 20,
                        border: '1.5px solid rgba(232,160,176,0.5)',
                        background: sharedDice ? 'rgba(232,160,176,0.55)' : 'transparent',
                        color: '#3d1a10',
                      }}
                    >
                      {sharedDice ? 'compartilhado' : 'só eu'}
                    </button>
                  </div>
                )}
                {activeWidget === 'dice' && (
                  <Dice
                    uid={uid}
                    displayName={displayName}
                    partnerName={partnerPresence?.displayName ?? '...'}
                    shared={sharedDice}
                  />
                )}
                {activeWidget === 'timer' && <Timer state={timerState} onChange={setTimerState} />}
                {activeWidget === 'roulette' && <Roulette />}
                {activeWidget === 'jogos' && (
                  <GameLobbyTab
                    coupleId={coupleId}
                    uid={uid}
                    partnerUid={partnerUid ?? ''}
                    myName={displayName}
                    partnerName={otherName}
                    roomId={activeBoardId}
                    onStartGame={(mode) => {
                      setActiveGame({ mode })
                      setShowWidgets(false)
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        )}
        <ActivityFeed />
        {/* Modais postit e checklist dentro do board (sem modal próprio de carta) */}
        {openModalItem?.type === 'postit' && (
          <PostItModal
            item={openModalItem as PostItItem}
            onUpdate={handleUpdate as never}
            onClose={() => setOpenModalItem(null)}
          />
        )}
        {openModalItem?.type === 'checklist' && (
          <ChecklistModal
            item={openModalItem as ChecklistItem}
            onUpdate={handleUpdate as never}
            onClose={() => setOpenModalItem(null)}
          />
        )}
        {showMovies && (
          <MovieList
            uid={uid}
            partnerUid={partnerUid ?? ''}
            displayName={displayName}
            partnerName={otherName}
            onClose={() => setShowMovies(false)}
          />
        )}
        {showHouse && (
          <HouseModal
            coupleId={cid}
            myUid={uid}
            partnerUid={partnerUid}
            myName={displayName}
            partnerName={otherName}
            onClose={() => setShowHouse(false)}
            characterConfig={characterConfig}
            characterColorVariants={characterConfig?.colorVariants ?? {}}
            onOpenShop={(itemId?: string) => {
              setShowHouse(false)
              setShopInitialItem(itemId)
              setShowShop(true)
            }}
          />
        )}
        {showShop && (
          <ShopModal
            uid={uid}
            initialItemId={shopInitialItem}
            partnerUid={partnerUid}
            myName={displayName}
            onClose={() => {
              setShowShop(false)
              setShopInitialItem(undefined)
            }}
          />
        )}
        {showGarden && (
          <GardenView
            uid={uid}
            partnerUid={partnerUid ?? ''}
            partnerName={otherName}
            onClose={() => setShowGarden(false)}
            onUnlockAchievement={unlock}
          />
        )}
        {showSpecialLetter && (
          <SpecialLetterModal
            specialDates={specialDates}
            myNick={displayName}
            partnerNick={otherName}
            myUid={uid}
            partnerUid={partnerUid ?? ''}
            onSend={(data) => {
              const item: SpecialLetterItem = {
                id: makeId(),
                type: 'special-letter',
                x: 200,
                y: 150,
                z: nextZOrder(),
                zOrder: nextZOrder(),
                width: 272,
                height: 432,
                createdBy: uid,
                updatedBy: uid,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                opened: false,
                ...data,
              }
              setItems((prev) => [...prev, item as unknown as AnyBoardItem])
              saveItem(item as unknown as AnyBoardItem)
              unlock('first_special')
              const newSpecialCount = specialCount + 1
              if (newSpecialCount >= 10) unlock('special_10')
              if (newSpecialCount >= 50) unlock('special_50')
            }}
            onClose={() => setShowSpecialLetter(false)}
            onSaveDates={saveSpecialDates}
            onOpenCustomLetter={() => setShowCustomLetter(true)}
          />
        )}
        {/* Menu de contexto — mover itens entre murais */}
        {contextMenu && (
          <div
            onClick={() => setContextMenu(null)}
            style={{ position: 'fixed', inset: 0, zIndex: 9000 }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                position: 'fixed',
                left: contextMenu.x,
                top: contextMenu.y,
                zIndex: 9001,
                background: '#fdf6f0',
                border: '1.5px solid #d4aa80',
                borderRadius: 12,
                boxShadow: '0 6px 24px rgba(44,20,8,0.25)',
                fontFamily: 'Baloo 2, sans-serif',
                minWidth: 220,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  padding: '8px 12px 4px',
                  fontSize: 9,
                  fontWeight: 800,
                  color: '#8b6914',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                mover este item para...
              </div>
              {otherBoards.map((board: BoardMeta) => (
                <button
                  key={board.id}
                  type="button"
                  onClick={() => handleMoveItem(contextMenu.item, board.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    width: '100%',
                    textAlign: 'left',
                    padding: '7px 16px',
                    background: 'none',
                    border: 'none',
                    fontSize: 13,
                    color: '#3d2408',
                    cursor: 'pointer',
                    fontFamily: 'Baloo 2, sans-serif',
                    fontWeight: 600,
                  }}
                  onMouseEnter={(e) => {
                    ;(e.currentTarget as HTMLButtonElement).style.background = '#f5ecd7'
                  }}
                  onMouseLeave={(e) => {
                    ;(e.currentTarget as HTMLButtonElement).style.background = 'none'
                  }}
                >
                  <ArrowRightLeft size={13} style={{ flexShrink: 0 }} />{' '}
                  {board.id === 'default' ? 'mural principal' : board.name}
                </button>
              ))}

              <div style={{ height: 1, background: '#d4aa8066', margin: '4px 0' }} />

              <div
                style={{
                  padding: '4px 12px 4px',
                  fontSize: 9,
                  fontWeight: 800,
                  color: '#8b6914',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                mover todos{' '}
                {contextMenu.item.type === 'postit'
                  ? 'os post-its'
                  : contextMenu.item.type === 'checklist'
                    ? 'as checklists'
                    : contextMenu.item.type === 'letter'
                      ? 'as cartinhas'
                      : contextMenu.item.type === 'drawing'
                        ? 'os desenhos'
                        : contextMenu.item.type === 'tag'
                          ? 'as tags'
                          : 'as cartas especiais'}{' '}
                para...
              </div>
              {otherBoards.map((board: BoardMeta) => (
                <button
                  key={board.id}
                  type="button"
                  onClick={() => handleMoveByType(contextMenu.item.type, board.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    width: '100%',
                    textAlign: 'left',
                    padding: '7px 16px',
                    background: 'none',
                    border: 'none',
                    fontSize: 13,
                    color: '#3d2408',
                    cursor: 'pointer',
                    fontFamily: 'Baloo 2, sans-serif',
                    fontWeight: 600,
                  }}
                  onMouseEnter={(e) => {
                    ;(e.currentTarget as HTMLButtonElement).style.background = '#f5ecd7'
                  }}
                  onMouseLeave={(e) => {
                    ;(e.currentTarget as HTMLButtonElement).style.background = 'none'
                  }}
                >
                  <Layers size={13} style={{ flexShrink: 0 }} />{' '}
                  {board.id === 'default' ? 'mural principal' : board.name}
                </button>
              ))}
            </div>
          </div>
        )}
        {/* Toolbar */}
        <Toolbar
          selected={selectedTool}
          editMode={editMode}
          onSelect={setSelectedTool}
          onToggleEdit={() => setEditMode((v) => !v)}
          onOpenTrash={() => setTrashOpen(true)}
          trashCount={trashedItems.length}
          onOpenStickerPicker={() => setStickerPickerPos({ x: 300, y: 200 })}
        />
        <StreakCounter uid={uid} nick={displayName} panicMode={panicMode} />
        {showCalendar && (
          <WeekCalendar
            displayName={displayName}
            myUid={uid}
            partnerUid={partnerUid}
            myNick={displayName}
            partnerNick={otherName}
            isNana={isNana}
            onClose={() => setShowCalendar(false)}
            onPinToBoard={(entry, dateKey) => setPinColorPicker({ entry, dateKey })}
            onOpenCycleModal={() => {
              setShowCycleModal(true)
            }}
            onPinCycleToBoard={() => {
              const alreadyPinned = items.some((i) => i.type === 'cycle-pin')
              if (alreadyPinned) {
                showCycleToast('o ciclo já está fixado no mural 🌸')
                return
              }
              const today = new Date().toISOString().slice(0, 10)
              const thisMonth = today.slice(0, 7)
              const lastMonthDate = new Date(new Date(today + 'T12:00:00').setDate(0))
              const lastMonth = lastMonthDate.toISOString().slice(0, 7)
              const candidates = [thisMonth, lastMonth]
                .map((k) => (allCycles[k] ? { key: k, data: allCycles[k] } : null))
                .filter((c): c is { key: string; data: CycleData } => {
                  if (!c) return false
                  const { state } = computeCycleState(c.data)
                  return state !== 'none' && state !== 'ended'
                })
              if (candidates.length > 1) {
                setCyclePicker(candidates)
                return
              }
              const item: CyclePinItemType = {
                id: makeId(),
                type: 'cycle-pin',
                x: 300,
                y: 200,
                width: 210,
                height: 80,
                createdBy: uid,
                updatedBy: uid,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                zOrder: nextZOrder(),
              }
              setItems((prev) => [...prev, item as unknown as AnyBoardItem])
              saveItem(item as unknown as AnyBoardItem)
              setShowCalendar(false)
            }}
          />
        )}
        {showCycleModal && <CycleModal myUid={uid} onClose={() => setShowCycleModal(false)} />}
        {showCharacter && (
          <CharacterModal
            myUid={uid}
            config={characterConfig}
            unlockedIds={unlockedIds}
            presets={presets}
            onSave={saveCharacterConfig}
            onSavePreset={savePreset}
            onDeletePreset={deletePreset}
            onClose={() => setShowCharacter(false)}
          />
        )}
        {trashOpen && (
          <div
            onClick={handleTrashClose}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(61,26,16,0.4)',
              backdropFilter: 'blur(4px)',
              zIndex: 200,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                width: 380,
                maxHeight: '80vh',
                display: 'flex',
                flexDirection: 'column',
                background:
                  'linear-gradient(160deg, rgba(253,246,240,0.97) 0%, rgba(252,232,238,0.97) 100%)',
                border: '1.5px solid rgba(232,160,176,0.4)',
                borderRadius: 20,
                boxShadow: '0 8px 40px rgba(200,120,140,0.2), inset 0 1px 0 rgba(255,255,255,0.6)',
                backdropFilter: 'blur(18px) saturate(1.4)',
                fontFamily: 'Baloo 2, sans-serif',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  padding: '14px 18px 12px',
                  borderBottom: '2px dashed rgba(232,160,176,0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexShrink: 0,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <Trash2 size={14} color="rgba(232,96,122,0.8)" strokeWidth={2} />
                  <span style={{ fontSize: 15, fontWeight: 800, color: '#3d1a10' }}>lixeira</span>
                  {trashedItems.length > 0 && (
                    <span style={{ fontSize: 10, color: '#e8607a', fontWeight: 700 }}>
                      {trashedItems.length} {trashedItems.length === 1 ? 'item' : 'itens'}
                    </span>
                  )}
                </div>
                <button
                  onClick={handleTrashClose}
                  style={{
                    background: 'rgba(232,96,122,0.12)',
                    border: '1px solid rgba(232,96,122,0.3)',
                    borderRadius: 10,
                    cursor: 'pointer',
                    fontSize: 10,
                    fontWeight: 800,
                    color: '#e8607a',
                    padding: '4px 10px',
                    fontFamily: 'Baloo 2, sans-serif',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <Trash2 size={10} strokeWidth={2} /> esvaziar e fechar
                </button>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', padding: '10px 12px 14px' }}>
                {trashedItems.length === 0 ? (
                  <div
                    style={{
                      textAlign: 'center',
                      color: 'rgba(61,26,16,0.4)',
                      fontSize: 12,
                      padding: '40px 0',
                    }}
                  >
                    lixeira vazia
                  </div>
                ) : (
                  trashedItems.map((item) => {
                    const NAMES: Record<string, string> = {
                      postit: 'post-it',
                      checklist: 'checklist',
                      drawing: 'desenho',
                      tag: 'tag',
                      letter: 'cartinha',
                    }
                    const label =
                      item.type === 'postit'
                        ? (item as PostItItem).title ||
                          (item as PostItItem).content?.slice(0, 28) ||
                          'sem conteúdo'
                        : item.type === 'checklist'
                          ? (item as ChecklistItem).title || 'checklist'
                          : item.type === 'letter'
                            ? `de: ${(item as LetterItem).from || '?'}`
                            : item.type === 'tag'
                              ? (item as TagItem).label
                              : 'desenho'
                    const ICON_MAP: Record<string, React.ReactNode> = {
                      postit: <StickyNote size={14} strokeWidth={2} color="rgba(122,48,64,0.6)" />,
                      checklist: (
                        <CheckCheck size={14} strokeWidth={2} color="rgba(122,48,64,0.6)" />
                      ),
                      drawing: <Pencil size={14} strokeWidth={2} color="rgba(122,48,64,0.6)" />,
                      tag: <Tag2 size={14} strokeWidth={2} color="rgba(122,48,64,0.6)" />,
                      letter: <Mail size={14} strokeWidth={2} color="rgba(122,48,64,0.6)" />,
                    }
                    return (
                      <div
                        key={item.id}
                        style={{
                          background: 'rgba(253,242,246,0.7)',
                          border: '1.5px solid rgba(232,160,176,0.3)',
                          borderRadius: 12,
                          marginBottom: 6,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          padding: '8px 10px',
                        }}
                      >
                        <div style={{ flexShrink: 0 }}>{ICON_MAP[item.type]}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 11, fontWeight: 800, color: '#3d1a10' }}>
                            {NAMES[item.type] ?? item.type}
                          </div>
                          <div
                            style={{
                              fontSize: 9,
                              color: 'rgba(122,48,64,0.55)',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {label}
                          </div>
                        </div>
                        <button
                          onClick={() => handleRestore(item.id)}
                          style={{
                            background: 'rgba(74,122,74,0.15)',
                            border: '1px solid rgba(74,122,74,0.35)',
                            borderRadius: 8,
                            padding: '4px 10px',
                            fontSize: 10,
                            fontWeight: 800,
                            color: '#4A7A4A',
                            cursor: 'pointer',
                            fontFamily: 'Baloo 2, sans-serif',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 3,
                            flexShrink: 0,
                          }}
                        >
                          <RotateCcw size={10} strokeWidth={2} /> restaurar
                        </button>
                        <button
                          onClick={() => handleDeleteForever(item.id)}
                          style={{
                            width: 26,
                            height: 26,
                            borderRadius: 8,
                            border: 'none',
                            background: 'rgba(232,96,122,0.12)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: 0,
                            flexShrink: 0,
                          }}
                        >
                          <X size={11} strokeWidth={2.5} color="#e8607a" />
                        </button>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {cyclePicker && (
        <div
          onClick={() => setCyclePicker(null)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 999999,
            background: 'rgba(44,20,8,0.35)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background:
                'linear-gradient(160deg, rgba(253,246,240,0.97) 0%, rgba(252,232,238,0.97) 100%)',
              border: '1.5px solid rgba(232,160,176,0.4)',
              borderRadius: 20,
              padding: '24px 28px',
              minWidth: 280,
              boxShadow: '0 8px 40px rgba(200,120,140,0.2)',
              fontFamily: 'Baloo 2, sans-serif',
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 15, fontWeight: 800, color: '#3d1a10' }}>
                qual ciclo fixar?
              </span>
              <button
                onClick={() => setCyclePicker(null)}
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {cyclePicker.map(({ key, data }) => {
                const { state, label } = computeCycleState(data)
                const stateLabel: Record<string, string> = {
                  chegando: 'vem aí',
                  tpm: 'tpm',
                  active: 'menstruada',
                }
                const stateColor: Record<string, string> = {
                  chegando: '#c87090',
                  tpm: '#9B7FD4',
                  active: '#D94F4F',
                }
                const [y, m] = key.split('-')
                const monthName = [
                  'jan',
                  'fev',
                  'mar',
                  'abr',
                  'mai',
                  'jun',
                  'jul',
                  'ago',
                  'set',
                  'out',
                  'nov',
                  'dez',
                ][parseInt(m) - 1]
                return (
                  <button
                    key={key}
                    onClick={() => {
                      const item: CyclePinItemType = {
                        id: makeId(),
                        type: 'cycle-pin',
                        x: 300,
                        y: 200,
                        width: 210,
                        height: 80,
                        createdBy: uid,
                        updatedBy: uid,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                        zOrder: nextZOrder(),
                        cycleKey: key,
                      }
                      setItems((prev) => [...prev, item as unknown as AnyBoardItem])
                      saveItem(item as unknown as AnyBoardItem)
                      setCyclePicker(null)
                      setShowCalendar(false)
                    }}
                    style={{
                      background: 'rgba(253,242,246,0.7)',
                      border: '1.5px solid rgba(232,160,176,0.3)',
                      borderRadius: 12,
                      padding: '12px 14px',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 4,
                      textAlign: 'left',
                    }}
                  >
                    <span
                      style={{
                        fontSize: 9,
                        fontWeight: 800,
                        color: 'rgba(122,48,64,0.55)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.8px',
                      }}
                    >
                      {monthName} {y}
                    </span>
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 800,
                        color: stateColor[state] ?? '#c87090',
                      }}
                    >
                      {stateLabel[state] ?? state}
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(61,26,16,0.5)' }}>
                      {label}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {pinColorPicker && (
        <div
          onClick={() => setPinColorPicker(null)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 999999,
            background: 'rgba(26,42,26,0.55)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fdf6ec',
              borderRadius: 16,
              padding: '24px 28px',
              fontFamily: 'Baloo 2, sans-serif',
              boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
              border: '1.5px solid #e8d5b0',
              minWidth: 260,
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 700, color: '#2C1810', marginBottom: 6 }}>
              fixar no mural
            </div>
            <div style={{ fontSize: 12, color: '#8b6914', marginBottom: 16, opacity: 0.8 }}>
              {pinColorPicker.entry.text}
            </div>
            <div style={{ fontSize: 12, color: '#8b6914', marginBottom: 10 }}>escolha uma cor:</div>
            <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
              {['#7FB87F', '#E8A0B0', '#C4956A', '#7a9ed4', '#9B7FD4', '#c87090'].map((color) => (
                <button
                  key={color}
                  onClick={() =>
                    handlePinToBoard(pinColorPicker.entry, pinColorPicker.dateKey, color)
                  }
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: color,
                    border: '2px solid transparent',
                    cursor: 'pointer',
                    transition: 'transform 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    ;(e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.2)'
                  }}
                  onMouseLeave={(e) => {
                    ;(e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'
                  }}
                />
              ))}
            </div>
            <button
              onClick={() => setPinColorPicker(null)}
              style={{
                width: '100%',
                background: 'none',
                border: '1px solid #d4aa80',
                borderRadius: 8,
                padding: '8px 0',
                fontSize: 12,
                color: '#8b6914',
                cursor: 'pointer',
                fontFamily: 'Baloo 2, sans-serif',
                fontWeight: 600,
              }}
            >
              cancelar
            </button>
          </div>
        </div>
      )}

      {/* ─── Modais de carta fora do overflow:hidden — fix z-index no Electron ─── */}

      {showCustomLetter && (
        <CustomLetterModal
          myNick={displayName}
          partnerNick={otherName}
          myUid={uid}
          partnerUid={partnerUid ?? ''}
          specialDates={specialDates}
          onClose={() => setShowCustomLetter(false)}
          onOpenShop={(packId) => {
            setShowCustomLetter(false)
            setShopInitialItem(packId)
            setShowShop(true)
          }}
          onSent={(letterId, fromName, toName, fromUid, toUid, availableFrom, specialDateLabel) => {
            const item: CustomLetterBoardItem = {
              id: makeId(),
              type: 'custom-letter',
              x: 200,
              y: 150,
              z: nextZOrder(),
              zOrder: nextZOrder(),
              width: 110,
              height: 100,
              createdBy: uid,
              updatedBy: uid,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              opened: false,
              letterId,
              fromName,
              toName,
              fromUid,
              toUid,
              ...(availableFrom ? { availableFrom } : {}),
              ...(specialDateLabel ? { specialDateLabel } : {}),
            }
            setItems((prev) => [...prev, item as unknown as AnyBoardItem])
            saveItem(item as unknown as AnyBoardItem)
            setShowCustomLetter(false)
          }}
        />
      )}

      {activeGame && (
        <GameModal
          coupleId={cid}
          mode={activeGame.mode}
          uid={uid}
          partnerUid={partnerUid ?? ''}
          myNick={displayName}
          partnerNick={otherName}
          myCoins={coins}
          roomId={activeBoardId}
          onClose={() => setActiveGame(null)}
        />
      )}

      {openLetter && (
        <LetterModal
          item={openLetter}
          currentUid={uid}
          displayName={displayName}
          otherName={otherName}
          onUpdate={handleUpdate as never}
          onClose={() => setOpenLetter(null)}
        />
      )}

      {openSpecialLetter &&
        (() => {
          const model = CARD_MODELS.find((m) => m.id === openSpecialLetter.cardModel)
          if (!model) return null
          const size = SPECIAL_LAYOUT_SIZE[openSpecialLetter.layout]
          const area = SPECIAL_LAYOUT_TEXT_AREA[openSpecialLetter.layout]
          const scale = Math.min(480 / size.width, 600 / size.height)
          const displayW = Math.round(size.width * scale)
          const displayH = Math.round(size.height * scale)
          return (
            <div
              onClick={() => setOpenSpecialLetter(null)}
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 999999,
                background: 'rgba(26,20,8,0.65)',
                backdropFilter: 'blur(6px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div
                onClick={(e) => e.stopPropagation()}
                style={{
                  position: 'relative',
                  width: displayW,
                  height: displayH,
                  animation: 'specialLetterPop 0.4s cubic-bezier(.34,1.56,.64,1)',
                }}
              >
                <style>{`
                @keyframes specialLetterPop {
                  from { transform: scale(0.8) translateY(30px); opacity: 0; }
                  to   { transform: scale(1) translateY(0); opacity: 1; }
                }
              `}</style>
                <img
                  src={model.image}
                  alt={model.label}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'fill',
                    display: 'block',
                    borderRadius: 12,
                    boxShadow: '0 16px 48px rgba(0,0,0,0.4), 0 0 0 2px #f5d06055',
                  }}
                  draggable={false}
                />
                <div
                  style={{
                    position: 'absolute',
                    top: area.top,
                    bottom: area.bottom,
                    left: area.left,
                    right: area.right,
                    overflow: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-start',
                  }}
                >
                  <p
                    style={{
                      fontFamily: "'Baloo 2', cursive",
                      fontSize: 13,
                      color: openSpecialLetter.cardModel === 'lua-noite' ? '#ffffff' : '#2a1010',
                      lineHeight: 1.7,
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      margin: 0,
                    }}
                  >
                    {openSpecialLetter.message}
                  </p>
                  <p
                    style={{
                      fontFamily: "'Baloo 2', cursive",
                      fontSize: 11,
                      color: openSpecialLetter.cardModel === 'lua-noite' ? '#ffffffcc' : '#5a2a2a',
                      marginTop: 10,
                      textAlign: 'right',
                      fontWeight: 700,
                    }}
                  >
                    {openSpecialLetter.from} → {openSpecialLetter.to}
                  </p>
                </div>
                <button
                  onClick={() => setOpenSpecialLetter(null)}
                  style={{
                    position: 'absolute',
                    top: -14,
                    right: -14,
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #ffe680, #c8960c)',
                    border: '2px solid #b8860b',
                    cursor: 'pointer',
                    fontSize: 14,
                    color: '#5a3a00',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                  }}
                >
                  ✕
                </button>
              </div>
            </div>
          )
        })()}

      {openCustomLetterViewer && (
        <CustomLetterViewer
          letter={openCustomLetterViewer}
          onClose={() => setOpenCustomLetterViewer(null)}
        />
      )}

      {showFinance && (
        <FinanceModal
          coupleId={cid}
          uid={uid}
          partnerUid={partnerUid ?? ''}
          myNick={displayName}
          partnerNick={otherName}
          onClose={() => setShowFinance(false)}
        />
      )}

      {showCards && (
        <CardsModal
          coupleId={cid}
          uid={uid}
          partnerUid={partnerUid ?? ''}
          onClose={() => setShowCards(false)}
        />
      )}

      {!showWidgets &&
        !timerDismissed &&
        (timerState.running || timerState.elapsed > 0 || timerState.finished) && (
          <TimerFloat
            state={timerState}
            onChange={setTimerState}
            onDismiss={() => setTimerDismissed(true)}
          />
        )}
      {newlyUnlocked.length > 0 && (
        <AchievementToast achievementId={newlyUnlocked[0]} onDone={clearNewlyUnlocked} />
      )}
      {showAchievements && (
        <AchievementsModal
          achievements={achievements}
          categoryBonus={categoryBonus}
          onClose={() => setShowAchievements(false)}
          onClaim={claim}
          progress={{
            streakDays: days,
            movies: movies.map((m) => ({ tipo: m.type, status: m.status })),
            goals,
            debts: [...activeDebts, ...paidDebts],
            transactions,
            plants,
            seeds,
            flowerHistory,
            coins,
            maxPlants,
            datingDate: specialDates?.datingDate,
            letterCount,
            specialCount,
            ownedPackCount,
            totalPackCount,
            uniqueStickersOnBoard,
          }}
          onClaimCategoryBonus={async (_cat) => {}}
          onResetBootstrap={reset}
        />
      )}
      {stickerPickerPos && (
        <StickerPickerModal
          uid={uid}
          onOpenShop={(packId) => {
            setStickerPickerPos(null)
            setShopInitialItem(packId)
            setShowShop(true)
          }}
          onSelect={(stickerKey) => {
            const item: BoardStickerItem = {
              id: makeId(),
              type: 'board-sticker',
              x: stickerPickerPos.x,
              y: stickerPickerPos.y,
              width: 100,
              height: 100,
              zOrder: nextZOrder(),
              createdBy: uid,
              updatedBy: uid,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              stickerKey,
              rotation: 0,
            }
            setItems((prev) => [...prev, item as unknown as AnyBoardItem])
            saveItem(item as unknown as AnyBoardItem)
            setStickerPickerPos(null)
          }}
          onClose={() => setStickerPickerPos(null)}
        />
      )}
    </>
  )
}
