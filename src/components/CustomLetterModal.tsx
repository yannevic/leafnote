import {
  X,
  Send,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Image,
  Calendar,
  Pen,
  Trash2,
  Lock,
  ShoppingBag,
} from 'lucide-react'
import { useState, useRef, useCallback, useEffect } from 'react'
import { STICKER_PACKS } from '../assets/stickers/index'
import { subscribeOwnedStickers, type OwnedStickers } from '../lib/stickers'
import { ref as dbRef, set } from 'firebase/database'
import { db } from '../lib/firebase'
import type { CustomLetterData, CustomLetterPhoto, CustomLetterSticker } from '../types/board'
import DatePicker from './DatePicker'
import { getAvailableDates, formatMmdd } from '../lib/specialDates'
import type { SpecialDates } from '../lib/specialDates'

function makeId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

const PAPER_COLORS = [
  { label: 'creme', value: '#fdf6f0' },
  { label: 'rosa', value: '#fde8f0' },
  { label: 'verde', value: '#edf7ed' },
  { label: 'azul', value: '#e8f0fd' },
  { label: 'lilás', value: '#f0eafd' },
  { label: 'amarelo', value: '#fdf7e0' },
  { label: 'branco', value: '#ffffff' },
]

const FONT_FAMILIES = [
  { label: 'Baloo 2', value: "'Baloo 2', sans-serif" },
  { label: 'Caveat', value: "'Caveat', cursive" },
  { label: 'Indie Flower', value: "'Indie Flower', cursive" },
]

const TEXT_COLORS = [
  '#2a1010',
  '#c87090',
  '#3a6a3a',
  '#2a4a8a',
  '#6a3a8a',
  '#8a6a10',
  '#8a2a2a',
  '#888888',
]

interface Props {
  myNick: string
  partnerNick: string
  myUid: string
  partnerUid: string
  specialDates: SpecialDates
  onClose: () => void
  onOpenShop?: (packId?: string) => void
  onSent?: (
    letterId: string,
    fromName: string,
    toName: string,
    fromUid: string,
    toUid: string,
    availableFrom?: string,
    specialDateLabel?: string
  ) => void
}

export default function CustomLetterModal({
  myNick,
  partnerNick,
  myUid,
  partnerUid,
  specialDates,
  onClose,
  onOpenShop,
  onSent,
}: Props) {
  // ── estado do editor ──
  const [paperColor, setPaperColor] = useState('#fdf6f0')
  const [lined, setLined] = useState(true)
  const [content, setContent] = useState('')
  const [fontSize, setFontSize] = useState(14)
  const [fontFamily, setFontFamily] = useState("'Baloo 2', sans-serif")
  const [textColor, setTextColor] = useState('#2a1010')
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right'>('left')
  const [bold, setBold] = useState(false)
  const [italic, setItalic] = useState(false)
  const [signature, setSignature] = useState(myNick)
  const [showDate, setShowDate] = useState(true)
  const [availableFrom, setAvailableFrom] = useState('')
  const availableDates = getAvailableDates(specialDates, myUid, partnerUid, myNick, partnerNick)
  const [selectedDateKey, setSelectedDateKey] = useState(availableDates[0]?.key ?? '')
  const selectedDateObj = availableDates.find((d) => d.key === selectedDateKey)
  const [photos, setPhotos] = useState<CustomLetterPhoto[]>([])
  const [stickers, setStickers] = useState<CustomLetterSticker[]>([])
  const [sending, setSending] = useState(false)
  const [tab, setTab] = useState<'editor' | 'preview'>('editor')
  const [rightTab, setRightTab] = useState<'escrever' | 'fotos' | 'stickers'>('escrever')
  const [ownedStickers, setOwnedStickers] = useState<OwnedStickers>({})
  const [expandedPack, setExpandedPack] = useState<string | null>(null)
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  // ── rascunho automático ──
  const DRAFT_KEY = `customletter_draft_${myUid}`

  useEffect(() => {
    const saved = localStorage.getItem(DRAFT_KEY)
    if (!saved) return
    try {
      const d = JSON.parse(saved)
      if (d.content) setContent(d.content)
      if (d.paperColor) setPaperColor(d.paperColor)
      if (d.lined !== undefined) setLined(d.lined)
      if (d.fontSize) setFontSize(d.fontSize)
      if (d.fontFamily) setFontFamily(d.fontFamily)
      if (d.textColor) setTextColor(d.textColor)
      if (d.textAlign) setTextAlign(d.textAlign)
      if (d.bold !== undefined) setBold(d.bold)
      if (d.italic !== undefined) setItalic(d.italic)
      if (d.signature) setSignature(d.signature)
      if (d.showDate !== undefined) setShowDate(d.showDate)
      if (d.photos) setPhotos(d.photos)
      if (d.stickers) setStickers(d.stickers)
    } catch {}
  }, [])

  useEffect(() => {
    localStorage.setItem(
      DRAFT_KEY,
      JSON.stringify({
        content,
        paperColor,
        lined,
        fontSize,
        fontFamily,
        textColor,
        textAlign,
        bold,
        italic,
        signature,
        showDate,
        photos,
        stickers,
      })
    )
  }, [
    content,
    paperColor,
    lined,
    fontSize,
    fontFamily,
    textColor,
    textAlign,
    bold,
    italic,
    signature,
    showDate,
    photos,
    stickers,
  ])

  useEffect(() => {
    return subscribeOwnedStickers(myUid, setOwnedStickers)
  }, [myUid])

  const handleAddSticker = (stickerKey: string) => {
    setStickers((prev) => [
      ...prev,
      {
        id: makeId(),
        stickerKey,
        x: 60,
        y: 60,
        width: 80,
        height: 80,
        rotation: 0,
      },
    ])
    setTab('preview')
  }

  // drag de sticker/foto no preview
  const dragTarget = useRef<{
    type: 'photo' | 'sticker'
    id: string
    startX: number
    startY: number
    origX: number
    origY: number
  } | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // ── linha height baseada no fontSize ──
  const lineHeight = Math.round(fontSize * 1.9)

  // ── adicionar foto ──
  const handleAddPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const url = ev.target?.result as string
      setPhotos((prev) => [...prev, { id: makeId(), url, x: 20, y: 20, width: 120, height: 90 }])
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  // ── drag no preview ──
  const startDrag = useCallback(
    (type: 'photo' | 'sticker', id: string, e: React.MouseEvent) => {
      e.preventDefault()
      const item =
        type === 'photo' ? photos.find((p) => p.id === id) : stickers.find((s) => s.id === id)
      if (!item) return
      dragTarget.current = {
        type,
        id,
        startX: e.clientX,
        startY: e.clientY,
        origX: item.x,
        origY: item.y,
      }
      const onMove = (ev: MouseEvent) => {
        const d = dragTarget.current
        if (!d) return
        const dx = ev.clientX - d.startX
        const dy = ev.clientY - d.startY
        if (type === 'photo') {
          setPhotos((prev) =>
            prev.map((p) => (p.id === id ? { ...p, x: d.origX + dx, y: d.origY + dy } : p))
          )
        } else {
          setStickers((prev) =>
            prev.map((s) => (s.id === id ? { ...s, x: d.origX + dx, y: d.origY + dy } : s))
          )
        }
      }
      const onUp = () => {
        dragTarget.current = null
        window.removeEventListener('mousemove', onMove)
        window.removeEventListener('mouseup', onUp)
      }
      window.addEventListener('mousemove', onMove)
      window.addEventListener('mouseup', onUp)
    },
    [photos, stickers]
  )

  // ── enviar ──
  const handleSend = async () => {
    if (!content.trim()) return
    setSending(true)
    try {
      const data: CustomLetterData = {
        id: makeId(),
        fromUid: myUid,
        fromName: myNick,
        toUid: partnerUid,
        toName: partnerNick,
        createdAt: Date.now(),
        opened: false,
        ...(availableFrom ? { availableFrom } : {}),
        ...(selectedDateObj
          ? {
              specialDate: selectedDateKey,
              specialDateMmdd: selectedDateObj.mmdd,
              specialDateLabel: selectedDateObj.label,
            }
          : {}),
        paperColor,
        lined,
        content: content.trim(),
        fontSize,
        fontFamily,
        textColor,
        textAlign,
        signature: signature.trim(),
        showDate,
        photos,
        stickers,
      }
      const r = dbRef(db, `customLetters/${data.id}`)
      await set(r, data)
      onSent?.(
        data.id,
        myNick,
        partnerNick,
        myUid,
        partnerUid,
        availableFrom || undefined,
        selectedDateObj?.label
      )
      localStorage.removeItem(DRAFT_KEY)
      onClose()
    } catch (err) {
      console.error(err)
    } finally {
      setSending(false)
    }
  }

  // ── preview da carta ──
  const LetterPreview = ({ interactive }: { interactive?: boolean }) => {
    const today = new Date().toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
    return (
      <div
        style={{
          position: 'relative',
          width: '100%',
          minHeight: 380,
          background: paperColor,
          borderRadius: 12,
          border: '1.5px solid rgba(0,0,0,0.08)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          overflow: 'hidden',
          padding: '24px 28px 32px',
          boxSizing: 'border-box',
        }}
      >
        {/* linhas */}
        {lined && (
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
            {Array.from({ length: Math.ceil(600 / lineHeight) }).map((_, i) => (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: 20,
                  right: 20,
                  top: 24 + i * lineHeight + fontSize * 1.2,
                  height: 1,
                  background: 'rgba(0,0,0,0.07)',
                }}
              />
            ))}
          </div>
        )}

        {/* data */}
        {showDate && (
          <div
            style={{
              fontSize: 10,
              color: 'rgba(0,0,0,0.35)',
              fontFamily: "'Baloo 2', sans-serif",
              marginBottom: 10,
              textAlign: 'right',
            }}
          >
            {today}
          </div>
        )}

        {/* texto */}
        <div
          style={{
            fontFamily,
            fontSize,
            color: textColor,
            textAlign,
            fontWeight: bold ? 700 : 400,
            fontStyle: italic ? 'italic' : 'normal',
            lineHeight: `${lineHeight}px`,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            minHeight: 200,
            position: 'relative',
            zIndex: 1,
          }}
        >
          {content || <span style={{ opacity: 0.3 }}>sua carta aparece aqui...</span>}
        </div>

        {/* assinatura */}
        {signature && (
          <div
            style={{
              marginTop: 16,
              textAlign: 'right',
              fontFamily,
              fontSize: fontSize - 1,
              color: textColor,
              fontStyle: 'italic',
              opacity: 0.7,
              position: 'relative',
              zIndex: 1,
            }}
          >
            — {signature}
          </div>
        )}

        {/* fotos */}
        {photos.map((photo) => (
          <div
            key={photo.id}
            style={{
              position: 'absolute',
              left: photo.x,
              top: photo.y,
              width: photo.width,
              height: photo.height,
              cursor: interactive ? 'grab' : 'default',
              zIndex: 2,
              transform: `rotate(${photo.rotation ?? 0}deg)`,
              transformOrigin: 'center center',
            }}
            onMouseDown={interactive ? (e) => startDrag('photo', photo.id, e) : undefined}
          >
            <img
              src={photo.url}
              alt=""
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: 8,
                border: '2px solid rgba(255,255,255,0.8)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                display: 'block',
              }}
              draggable={false}
            />
            {interactive && (
              <>
                {/* deletar */}
                <button
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={() => setPhotos((prev) => prev.filter((p) => p.id !== photo.id))}
                  style={{
                    position: 'absolute',
                    top: -8,
                    right: -8,
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    background: 'rgba(232,96,122,0.85)',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 10,
                  }}
                >
                  <X size={9} color="#fff" />
                </button>
                {/* handle girar — topo centro */}
                <div
                  onMouseDown={(e) => {
                    e.stopPropagation()
                    e.preventDefault()
                    const rect = (
                      e.currentTarget.parentElement as HTMLElement
                    ).getBoundingClientRect()
                    const cx = rect.left + rect.width / 2
                    const cy = rect.top + rect.height / 2
                    const startAngle = Math.atan2(e.clientY - cy, e.clientX - cx) * (180 / Math.PI)
                    const origRot = photo.rotation ?? 0
                    const onMove = (ev: MouseEvent) => {
                      const angle = Math.atan2(ev.clientY - cy, ev.clientX - cx) * (180 / Math.PI)
                      const delta = angle - startAngle
                      setPhotos((prev) =>
                        prev.map((p) =>
                          p.id === photo.id ? { ...p, rotation: origRot + delta } : p
                        )
                      )
                    }
                    const onUp = () => {
                      window.removeEventListener('mousemove', onMove)
                      window.removeEventListener('mouseup', onUp)
                    }
                    window.addEventListener('mousemove', onMove)
                    window.addEventListener('mouseup', onUp)
                  }}
                  style={{
                    position: 'absolute',
                    top: -20,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 14,
                    height: 14,
                    borderRadius: '50%',
                    background: '#c87090',
                    border: '2px solid #fff',
                    cursor: 'crosshair',
                    zIndex: 10,
                  }}
                />
                {/* handle redimensionar — canto inferior direito */}
                <div
                  onMouseDown={(e) => {
                    e.stopPropagation()
                    e.preventDefault()
                    const startX = e.clientX
                    const startY = e.clientY
                    const origW = photo.width
                    const origH = photo.height
                    const onMove = (ev: MouseEvent) => {
                      const newW = Math.max(40, origW + (ev.clientX - startX))
                      const newH = Math.max(30, origH + (ev.clientY - startY))
                      setPhotos((prev) =>
                        prev.map((p) =>
                          p.id === photo.id ? { ...p, width: newW, height: newH } : p
                        )
                      )
                    }
                    const onUp = () => {
                      window.removeEventListener('mousemove', onMove)
                      window.removeEventListener('mouseup', onUp)
                    }
                    window.addEventListener('mousemove', onMove)
                    window.addEventListener('mouseup', onUp)
                  }}
                  style={{
                    position: 'absolute',
                    bottom: -6,
                    right: -6,
                    width: 14,
                    height: 14,
                    borderRadius: 4,
                    background: '#c87090',
                    border: '2px solid #fff',
                    cursor: 'se-resize',
                    zIndex: 10,
                  }}
                />
              </>
            )}
          </div>
        ))}

        {/* stickers */}
        {stickers.map((sticker) => {
          const pack = STICKER_PACKS.find((p) =>
            p.stickers.some((s) => s.key === sticker.stickerKey)
          )
          const stickerItem = pack?.stickers.find((s) => s.key === sticker.stickerKey)
          if (!stickerItem) return null
          return (
            <div
              key={sticker.id}
              onMouseDown={interactive ? (e) => startDrag('sticker', sticker.id, e) : undefined}
              style={{
                position: 'absolute',
                left: sticker.x,
                top: sticker.y,
                width: sticker.width,
                height: sticker.height,
                cursor: interactive ? 'grab' : 'default',
                zIndex: 3,
                transform: `rotate(${sticker.rotation ?? 0}deg)`,
                transformOrigin: 'center center',
              }}
            >
              <img
                src={`./stickers/${stickerItem.file}`}
                alt={sticker.stickerKey}
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                draggable={false}
              />
              {interactive && (
                <>
                  {/* deletar */}
                  <button
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={() => setStickers((prev) => prev.filter((s) => s.id !== sticker.id))}
                    style={{
                      position: 'absolute',
                      top: -8,
                      right: -8,
                      width: 16,
                      height: 16,
                      borderRadius: '50%',
                      background: 'rgba(232,96,122,0.85)',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 0,
                      zIndex: 10,
                    }}
                  >
                    <X size={8} color="#fff" />
                  </button>
                  {/* handle girar — topo centro */}
                  <div
                    onMouseDown={(e) => {
                      e.stopPropagation()
                      e.preventDefault()
                      const rect = (
                        e.currentTarget.parentElement as HTMLElement
                      ).getBoundingClientRect()
                      const cx = rect.left + rect.width / 2
                      const cy = rect.top + rect.height / 2
                      const startAngle =
                        Math.atan2(e.clientY - cy, e.clientX - cx) * (180 / Math.PI)
                      const origRot = sticker.rotation ?? 0
                      const onMove = (ev: MouseEvent) => {
                        const angle = Math.atan2(ev.clientY - cy, ev.clientX - cx) * (180 / Math.PI)
                        setStickers((prev) =>
                          prev.map((s) =>
                            s.id === sticker.id
                              ? { ...s, rotation: origRot + (angle - startAngle) }
                              : s
                          )
                        )
                      }
                      const onUp = () => {
                        window.removeEventListener('mousemove', onMove)
                        window.removeEventListener('mouseup', onUp)
                      }
                      window.addEventListener('mousemove', onMove)
                      window.addEventListener('mouseup', onUp)
                    }}
                    style={{
                      position: 'absolute',
                      top: -20,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      background: '#9B7FD4',
                      border: '2px solid #fff',
                      cursor: 'crosshair',
                      zIndex: 10,
                    }}
                  />
                  {/* handle redimensionar — canto inferior direito */}
                  <div
                    onMouseDown={(e) => {
                      e.stopPropagation()
                      e.preventDefault()
                      const startX = e.clientX
                      const startY = e.clientY
                      const origW = sticker.width
                      const origH = sticker.height
                      const onMove = (ev: MouseEvent) => {
                        const newSize = Math.max(
                          24,
                          Math.max(origW + (ev.clientX - startX), origH + (ev.clientY - startY))
                        )
                        setStickers((prev) =>
                          prev.map((s) =>
                            s.id === sticker.id ? { ...s, width: newSize, height: newSize } : s
                          )
                        )
                      }
                      const onUp = () => {
                        window.removeEventListener('mousemove', onMove)
                        window.removeEventListener('mouseup', onUp)
                      }
                      window.addEventListener('mousemove', onMove)
                      window.addEventListener('mouseup', onUp)
                    }}
                    style={{
                      position: 'absolute',
                      bottom: -6,
                      right: -6,
                      width: 12,
                      height: 12,
                      borderRadius: 4,
                      background: '#9B7FD4',
                      border: '2px solid #fff',
                      cursor: 'se-resize',
                      zIndex: 10,
                    }}
                  />
                </>
              )}
            </div>
          )
        })}
      </div>
    )
  }

  // ── estilos base ──
  const toolBtn = (active?: boolean): React.CSSProperties => ({
    width: 28,
    height: 28,
    borderRadius: 7,
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: active ? 'rgba(232,160,176,0.5)' : 'rgba(232,160,176,0.15)',
    color: active ? '#3d1a10' : 'rgba(61,26,16,0.55)',
    transition: 'all .15s',
  })

  const labelStyle: React.CSSProperties = {
    fontSize: 9,
    fontWeight: 800,
    color: 'rgba(122,48,64,0.55)',
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
    display: 'block',
    marginBottom: 6,
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Caveat&family=Indie+Flower&display=swap');
        .custom-letter-scroll::-webkit-scrollbar { width: 4px; }
        .custom-letter-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-letter-scroll::-webkit-scrollbar-thumb { background: rgba(232,160,176,0.45); border-radius: 99px; }
      `}</style>

      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          background: 'rgba(44,20,8,0.35)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) e.currentTarget.dataset.closeOnUp = 'true'
        }}
        onMouseUp={(e) => {
          if (e.currentTarget.dataset.closeOnUp === 'true' && e.target === e.currentTarget)
            onClose()
          delete e.currentTarget.dataset.closeOnUp
        }}
      >
        <div
          onMouseDown={(e) => e.stopPropagation()}
          style={{
            background:
              'linear-gradient(160deg, rgba(253,246,240,0.97) 0%, rgba(252,232,238,0.97) 100%)',
            border: '1.5px solid rgba(232,160,176,0.4)',
            borderRadius: 20,
            width: 820,
            maxWidth: '96vw',
            maxHeight: '92vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 8px 40px rgba(200,120,140,0.2), inset 0 1px 0 rgba(255,255,255,0.6)',
            fontFamily: 'Baloo 2, sans-serif',
            overflow: 'hidden',
          }}
        >
          {/* ── header ── */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 22px 14px',
              borderBottom: '2px dashed rgba(232,160,176,0.4)',
              flexShrink: 0,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Pen size={14} color="rgba(122,48,64,0.6)" />
              <span style={{ fontSize: 15, fontWeight: 800, color: '#3d1a10' }}>
                carta livre para {partnerNick}
              </span>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {(['editor', 'preview'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  style={{
                    ...toolBtn(tab === t),
                    width: 'auto',
                    padding: '0 12px',
                    fontSize: 11,
                    fontWeight: 800,
                    fontFamily: 'Baloo 2, sans-serif',
                  }}
                >
                  {t === 'editor' ? 'editar' : 'preview'}
                </button>
              ))}
              <button onClick={onClose} style={toolBtn()}>
                <X size={13} color="rgba(122,48,64,0.7)" />
              </button>
            </div>
          </div>

          {/* ── corpo ── */}
          <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {tab === 'editor' ? (
              <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                {/* ── coluna esquerda — ferramentas de estilo ── */}
                <div
                  className="custom-letter-scroll"
                  style={{
                    width: 210,
                    flexShrink: 0,
                    padding: '16px',
                    borderRight: '2px dashed rgba(232,160,176,0.3)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 16,
                    overflowY: 'auto',
                  }}
                >
                  {/* papel */}
                  <div>
                    <span style={labelStyle}>cor do papel</span>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {PAPER_COLORS.map((c) => (
                        <div
                          key={c.value}
                          onClick={() => setPaperColor(c.value)}
                          title={c.label}
                          style={{
                            width: 22,
                            height: 22,
                            borderRadius: '50%',
                            background: c.value,
                            border: `2px solid ${paperColor === c.value ? '#c87090' : 'rgba(0,0,0,0.1)'}`,
                            cursor: 'pointer',
                            transition: 'transform .15s',
                            transform: paperColor === c.value ? 'scale(1.2)' : 'scale(1)',
                            boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* pauta */}
                  <div>
                    <span style={labelStyle}>estilo</span>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {[
                        { v: true, l: 'com pauta' },
                        { v: false, l: 'sem pauta' },
                      ].map((o) => (
                        <button
                          key={String(o.v)}
                          onClick={() => setLined(o.v)}
                          style={{
                            flex: 1,
                            padding: '5px 0',
                            borderRadius: 8,
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: 10,
                            fontWeight: 800,
                            fontFamily: 'Baloo 2, sans-serif',
                            background:
                              lined === o.v ? 'rgba(232,160,176,0.45)' : 'rgba(232,160,176,0.12)',
                            color: lined === o.v ? '#3d1a10' : 'rgba(61,26,16,0.5)',
                          }}
                        >
                          {o.l}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* fonte */}
                  <div>
                    <span style={labelStyle}>fonte</span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                      {FONT_FAMILIES.map((f) => (
                        <button
                          key={f.value}
                          onClick={() => setFontFamily(f.value)}
                          style={{
                            padding: '5px 10px',
                            borderRadius: 8,
                            border: 'none',
                            cursor: 'pointer',
                            background:
                              fontFamily === f.value
                                ? 'rgba(232,160,176,0.45)'
                                : 'rgba(232,160,176,0.12)',
                            fontFamily: f.value,
                            fontSize: 13,
                            color: '#3d1a10',
                            textAlign: 'left',
                            transition: 'all .15s',
                          }}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* tamanho */}
                  <div>
                    <span style={labelStyle}>tamanho — {fontSize}px</span>
                    <input
                      type="range"
                      min={11}
                      max={22}
                      value={fontSize}
                      onChange={(e) => setFontSize(Number(e.target.value))}
                      style={{ width: '100%', accentColor: '#c87090' }}
                    />
                  </div>

                  {/* cor do texto */}
                  <div>
                    <span style={labelStyle}>cor do texto</span>
                    <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                      {TEXT_COLORS.map((c) => (
                        <div
                          key={c}
                          onClick={() => setTextColor(c)}
                          style={{
                            width: 22,
                            height: 22,
                            borderRadius: '50%',
                            background: c,
                            border: `2px solid ${textColor === c ? '#c87090' : 'transparent'}`,
                            cursor: 'pointer',
                            transition: 'transform .15s',
                            transform: textColor === c ? 'scale(1.2)' : 'scale(1)',
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* data especial */}
                  <div>
                    <span style={labelStyle}>data especial</span>
                    {availableDates.length === 0 ? (
                      <div
                        style={{
                          fontSize: 10,
                          fontWeight: 600,
                          color: 'rgba(61,26,16,0.4)',
                          fontFamily: 'Baloo 2, sans-serif',
                          lineHeight: 1.5,
                        }}
                      >
                        nenhuma data cadastrada ainda
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <button
                          onClick={() => setSelectedDateKey('')}
                          style={{
                            padding: '4px 10px',
                            borderRadius: 8,
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: 10,
                            fontWeight: 800,
                            fontFamily: 'Baloo 2, sans-serif',
                            background:
                              selectedDateKey === ''
                                ? 'rgba(232,160,176,0.45)'
                                : 'rgba(232,160,176,0.12)',
                            color: '#3d1a10',
                            textAlign: 'left',
                          }}
                        >
                          nenhuma
                        </button>
                        {availableDates.map((d) => (
                          <button
                            key={d.key}
                            onClick={() => setSelectedDateKey(d.key)}
                            style={{
                              padding: '4px 10px',
                              borderRadius: 8,
                              border: 'none',
                              cursor: 'pointer',
                              fontSize: 10,
                              fontWeight: 800,
                              fontFamily: 'Baloo 2, sans-serif',
                              background:
                                selectedDateKey === d.key
                                  ? 'rgba(232,160,176,0.45)'
                                  : 'rgba(232,160,176,0.12)',
                              color: '#3d1a10',
                              textAlign: 'left',
                            }}
                          >
                            {d.label} · {formatMmdd(d.mmdd)}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* disponível a partir de */}
                  <div>
                    <span style={labelStyle}>disponível a partir de</span>
                    <DatePicker value={availableFrom} onChange={setAvailableFrom} />
                  </div>
                </div>

                {/* ── coluna direita ── */}
                <div
                  style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
                >
                  {/* sub-tabs */}
                  <div
                    style={{
                      display: 'flex',
                      gap: 6,
                      padding: '12px 20px 0',
                      borderBottom: '2px dashed rgba(232,160,176,0.3)',
                      flexShrink: 0,
                    }}
                  >
                    {(['escrever', 'fotos', 'stickers'] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => setRightTab(t)}
                        style={{
                          padding: '4px 14px',
                          borderRadius: '20px 20px 0 0',
                          border:
                            rightTab === t
                              ? '1.5px solid rgba(232,160,176,0.7)'
                              : '1.5px solid rgba(232,160,176,0.3)',
                          borderBottom:
                            rightTab === t
                              ? '1.5px solid transparent'
                              : '1.5px solid rgba(232,160,176,0.3)',
                          background:
                            rightTab === t ? 'rgba(232,160,176,0.35)' : 'rgba(232,160,176,0.1)',
                          fontFamily: 'Baloo 2, sans-serif',
                          fontSize: 11,
                          fontWeight: 800,
                          color: '#3d1a10',
                          cursor: 'pointer',
                          transition: 'all .15s',
                        }}
                      >
                        {t}
                      </button>
                    ))}
                  </div>

                  {/* conteúdo da aba direita */}
                  <div
                    className="custom-letter-scroll"
                    style={{ flex: 1, overflowY: 'auto', padding: '16px 20px 20px' }}
                  >
                    {/* ── aba escrever ── */}
                    {rightTab === 'escrever' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {/* barra de formatação */}
                        <div
                          style={{
                            display: 'flex',
                            gap: 5,
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            background: 'rgba(232,160,176,0.08)',
                            borderRadius: 10,
                            padding: '7px 10px',
                          }}
                        >
                          <button
                            onClick={() => setBold((v) => !v)}
                            style={toolBtn(bold)}
                            title="negrito"
                          >
                            <Bold size={13} />
                          </button>
                          <button
                            onClick={() => setItalic((v) => !v)}
                            style={toolBtn(italic)}
                            title="itálico"
                          >
                            <Italic size={13} />
                          </button>
                          <div
                            style={{
                              width: 1,
                              height: 20,
                              background: 'rgba(232,160,176,0.3)',
                              margin: '0 3px',
                            }}
                          />
                          <button
                            onClick={() => setTextAlign('left')}
                            style={toolBtn(textAlign === 'left')}
                            title="esquerda"
                          >
                            <AlignLeft size={13} />
                          </button>
                          <button
                            onClick={() => setTextAlign('center')}
                            style={toolBtn(textAlign === 'center')}
                            title="centro"
                          >
                            <AlignCenter size={13} />
                          </button>
                          <button
                            onClick={() => setTextAlign('right')}
                            style={toolBtn(textAlign === 'right')}
                            title="direita"
                          >
                            <AlignRight size={13} />
                          </button>
                          <div
                            style={{
                              width: 1,
                              height: 20,
                              background: 'rgba(232,160,176,0.3)',
                              margin: '0 3px',
                            }}
                          />
                          <button
                            onClick={() => setShowDate((v) => !v)}
                            style={toolBtn(showDate)}
                            title="data automática"
                          >
                            <Calendar size={13} />
                          </button>
                        </div>

                        {/* área de escrita */}
                        <div style={{ position: 'relative' }}>
                          {lined && (
                            <div
                              style={{
                                position: 'absolute',
                                inset: 0,
                                pointerEvents: 'none',
                                overflow: 'hidden',
                                borderRadius: 12,
                              }}
                            >
                              {Array.from({ length: 30 }).map((_, i) => (
                                <div
                                  key={i}
                                  style={{
                                    position: 'absolute',
                                    left: 14,
                                    right: 14,
                                    top: 14 + i * lineHeight + fontSize * 1.2,
                                    height: 1,
                                    background: 'rgba(200,120,140,0.12)',
                                  }}
                                />
                              ))}
                            </div>
                          )}
                          <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder={`escreva sua carta para ${partnerNick}...`}
                            style={{
                              width: '100%',
                              minHeight: 260,
                              resize: 'vertical',
                              borderRadius: 12,
                              border: '1.5px solid rgba(232,160,176,0.35)',
                              background: paperColor,
                              padding: '14px 16px',
                              fontFamily,
                              fontSize,
                              fontWeight: bold ? 700 : 400,
                              fontStyle: italic ? 'italic' : 'normal',
                              color: textColor,
                              textAlign,
                              outline: 'none',
                              lineHeight: `${lineHeight}px`,
                              boxSizing: 'border-box',
                              transition: 'background .2s',
                            }}
                          />
                        </div>

                        {/* assinatura */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ ...labelStyle, marginBottom: 0, flexShrink: 0 }}>
                            assinatura
                          </span>
                          <input
                            value={signature}
                            onChange={(e) => setSignature(e.target.value)}
                            style={{
                              flex: 1,
                              background: 'rgba(255,255,255,0.5)',
                              border: '1.5px solid rgba(232,160,176,0.35)',
                              borderRadius: 8,
                              padding: '5px 10px',
                              fontFamily: 'Baloo 2, sans-serif',
                              fontSize: 12,
                              color: '#3d1a10',
                              outline: 'none',
                            }}
                          />
                        </div>

                        {/* enviar */}
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <button
                            onClick={() => setShowClearConfirm(true)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 5,
                              background: 'none',
                              border: '1.5px solid rgba(232,96,122,0.3)',
                              borderRadius: 10,
                              padding: '8px 14px',
                              fontFamily: 'Baloo 2, sans-serif',
                              fontSize: 12,
                              fontWeight: 700,
                              color: 'rgba(232,96,122,0.7)',
                              cursor: 'pointer',
                            }}
                          >
                            <Trash2 size={12} /> limpar
                          </button>
                          <button
                            onClick={handleSend}
                            disabled={!content.trim() || sending}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 6,
                              background: content.trim()
                                ? 'rgba(232,160,176,0.55)'
                                : 'rgba(232,160,176,0.2)',
                              color: content.trim() ? '#3d1a10' : 'rgba(61,26,16,0.35)',
                              border: 'none',
                              borderRadius: 12,
                              padding: '10px 24px',
                              fontFamily: 'Baloo 2, sans-serif',
                              fontSize: 13,
                              fontWeight: 800,
                              cursor: content.trim() && !sending ? 'pointer' : 'default',
                              transition: 'all .2s',
                            }}
                          >
                            <Send size={13} strokeWidth={2} />
                            {sending ? 'enviando...' : 'enviar carta'}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* ── aba fotos ── */}
                    {rightTab === 'fotos' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          style={{
                            width: '100%',
                            padding: '12px 0',
                            borderRadius: 10,
                            border: '1.5px dashed rgba(232,160,176,0.5)',
                            background: 'rgba(232,160,176,0.08)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 6,
                            fontSize: 12,
                            fontWeight: 700,
                            color: 'rgba(122,48,64,0.6)',
                            fontFamily: 'Baloo 2, sans-serif',
                          }}
                        >
                          <Image size={14} /> adicionar foto
                        </button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          onChange={handleAddPhoto}
                        />
                        {photos.length === 0 && (
                          <p
                            style={{
                              fontSize: 11,
                              color: 'rgba(61,26,16,0.4)',
                              fontFamily: 'Baloo 2, sans-serif',
                              textAlign: 'center',
                              marginTop: 16,
                            }}
                          >
                            nenhuma foto ainda — adicione e posicione no preview
                          </p>
                        )}
                        {photos.map((p, i) => (
                          <div
                            key={p.id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 8,
                              background: 'rgba(232,160,176,0.1)',
                              borderRadius: 10,
                              padding: '8px 12px',
                            }}
                          >
                            <img
                              src={p.url}
                              alt=""
                              style={{ width: 40, height: 30, objectFit: 'cover', borderRadius: 6 }}
                            />
                            <span
                              style={{
                                flex: 1,
                                fontSize: 11,
                                color: 'rgba(61,26,16,0.55)',
                                fontFamily: 'Baloo 2, sans-serif',
                              }}
                            >
                              foto {i + 1}
                            </span>
                            <button
                              onClick={() => setPhotos((prev) => prev.filter((x) => x.id !== p.id))}
                              style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: 0,
                                display: 'flex',
                              }}
                            >
                              <Trash2 size={13} color="rgba(232,96,122,0.7)" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* ── aba stickers ── */}
                    {rightTab === 'stickers' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {STICKER_PACKS.map((pack) => {
                          const ownedInPack = pack.stickers.filter((s) => ownedStickers[s.key])
                          const hasAny = ownedInPack.length > 0
                          const isExpanded = expandedPack === pack.id
                          return (
                            <div
                              key={pack.id}
                              style={{
                                border: `1.5px solid ${hasAny ? 'rgba(74,122,74,0.3)' : 'rgba(232,160,176,0.3)'}`,
                                borderRadius: 12,
                                background: hasAny
                                  ? 'rgba(74,122,74,0.05)'
                                  : 'rgba(253,242,246,0.7)',
                                overflow: 'hidden',
                              }}
                            >
                              {/* cabeçalho do pack */}
                              <div
                                onClick={() =>
                                  hasAny && setExpandedPack(isExpanded ? null : pack.id)
                                }
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 10,
                                  padding: '8px 12px',
                                  cursor: hasAny ? 'pointer' : 'default',
                                }}
                              >
                                <img
                                  src={`./stickers/${pack.preview}`}
                                  style={{
                                    width: 36,
                                    height: 36,
                                    objectFit: 'contain',
                                    flexShrink: 0,
                                    filter: hasAny ? 'none' : 'grayscale(1) opacity(0.4)',
                                  }}
                                  alt={pack.label}
                                />
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div
                                    style={{
                                      fontSize: 12,
                                      fontWeight: 800,
                                      color: '#3d1a10',
                                      fontFamily: 'Baloo 2, sans-serif',
                                    }}
                                  >
                                    {pack.label}
                                  </div>
                                  <div
                                    style={{
                                      fontSize: 10,
                                      color: 'rgba(61,26,16,0.45)',
                                      fontFamily: 'Baloo 2, sans-serif',
                                    }}
                                  >
                                    {ownedInPack.length}/{pack.stickers.length} desbloqueados
                                  </div>
                                </div>
                                {!hasAny ? (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      onOpenShop?.(pack.id)
                                    }}
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: 4,
                                      padding: '4px 10px',
                                      borderRadius: 20,
                                      border: 'none',
                                      background: 'rgba(232,160,176,0.3)',
                                      fontFamily: 'Baloo 2, sans-serif',
                                      fontSize: 10,
                                      fontWeight: 800,
                                      color: '#3d1a10',
                                      cursor: 'pointer',
                                      flexShrink: 0,
                                    }}
                                  >
                                    <ShoppingBag size={10} /> loja
                                  </button>
                                ) : (
                                  <Lock
                                    size={12}
                                    color="rgba(74,122,74,0.5)"
                                    style={{ opacity: 0, pointerEvents: 'none' }}
                                  />
                                )}
                              </div>

                              {/* grid de stickers do pack */}
                              {isExpanded && hasAny && (
                                <div
                                  style={{
                                    borderTop: '1.5px dashed rgba(232,160,176,0.3)',
                                    padding: '10px 12px',
                                  }}
                                >
                                  <div
                                    style={{
                                      display: 'grid',
                                      gridTemplateColumns: 'repeat(auto-fill, minmax(52px, 1fr))',
                                      gap: 6,
                                    }}
                                  >
                                    {pack.stickers.map((sticker) => {
                                      const owned = !!ownedStickers[sticker.key]
                                      return (
                                        <div
                                          key={sticker.key}
                                          onClick={() => owned && handleAddSticker(sticker.key)}
                                          style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            padding: 5,
                                            borderRadius: 8,
                                            border: `1.5px solid ${owned ? 'rgba(232,160,176,0.4)' : 'rgba(200,180,190,0.2)'}`,
                                            background: owned
                                              ? 'rgba(255,255,255,0.6)'
                                              : 'rgba(200,180,190,0.1)',
                                            cursor: owned ? 'pointer' : 'default',
                                            position: 'relative',
                                            transition: 'transform .12s',
                                          }}
                                          onMouseEnter={(e) =>
                                            owned &&
                                            ((e.currentTarget as HTMLDivElement).style.transform =
                                              'scale(1.1)')
                                          }
                                          onMouseLeave={(e) =>
                                            ((e.currentTarget as HTMLDivElement).style.transform =
                                              '')
                                          }
                                        >
                                          <img
                                            src={`./stickers/${sticker.file}`}
                                            style={{
                                              width: 40,
                                              height: 40,
                                              objectFit: 'contain',
                                              filter: owned ? 'none' : 'grayscale(1) opacity(0.3)',
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
                                              <Lock size={11} color="rgba(122,48,64,0.4)" />
                                            </div>
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
                  </div>
                  {/* fim scroll wrapper */}
                </div>
                {/* fim coluna direita */}
              </div>
            ) : (
              /* ── aba preview ── */
              <div
                className="custom-letter-scroll"
                style={{ flex: 1, overflowY: 'auto', padding: '20px 24px 28px' }}
              >
                <p
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: 'rgba(122,48,64,0.5)',
                    marginBottom: 12,
                    fontFamily: 'Baloo 2, sans-serif',
                  }}
                >
                  arraste fotos e stickers para posicioná-los na carta
                </p>
                <LetterPreview interactive />
              </div>
            )}
          </div>
        </div>
      </div>
      {showClearConfirm && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            background: 'rgba(44,20,8,0.35)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onClick={() => setShowClearConfirm(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background:
                'linear-gradient(160deg, rgba(253,246,240,0.97) 0%, rgba(252,232,238,0.97) 100%)',
              border: '1.5px solid rgba(232,160,176,0.4)',
              borderRadius: 20,
              boxShadow: '0 8px 40px rgba(200,120,140,0.2), inset 0 1px 0 rgba(255,255,255,0.6)',
              padding: '28px 32px 24px',
              minWidth: 280,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 14,
              fontFamily: 'Baloo 2, sans-serif',
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: 'rgba(232,96,122,0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Trash2 size={20} color="#e8607a" strokeWidth={2} />
            </div>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#3d1a10', textAlign: 'center' }}>
              limpar a carta?
            </div>
            <div
              style={{
                fontSize: 12,
                color: 'rgba(61,26,16,0.5)',
                textAlign: 'center',
                lineHeight: 1.5,
              }}
            >
              isso apaga o texto, fotos e stickers. não tem como desfazer.
            </div>
            <div style={{ display: 'flex', gap: 10, width: '100%' }}>
              <button
                onClick={() => setShowClearConfirm(false)}
                style={{
                  flex: 1,
                  padding: '9px 0',
                  borderRadius: 12,
                  border: '1.5px solid rgba(232,160,176,0.4)',
                  background: 'transparent',
                  fontFamily: 'Baloo 2, sans-serif',
                  fontWeight: 800,
                  fontSize: 13,
                  cursor: 'pointer',
                  color: 'rgba(61,26,16,0.5)',
                }}
              >
                cancelar
              </button>
              <button
                onClick={() => {
                  setContent('')
                  setPaperColor('#fdf6f0')
                  setLined(true)
                  setFontSize(14)
                  setFontFamily("'Baloo 2', sans-serif")
                  setTextColor('#2a1010')
                  setTextAlign('left')
                  setBold(false)
                  setItalic(false)
                  setSignature(myNick)
                  setShowDate(true)
                  setPhotos([])
                  setStickers([])
                  localStorage.removeItem(DRAFT_KEY)
                  setShowClearConfirm(false)
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
                  gap: 6,
                }}
              >
                <Trash2 size={13} strokeWidth={2} /> limpar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
