import { useState, useRef, useEffect, useCallback } from 'react'
import { ref, onValue, set } from 'firebase/database'
import useSound from 'use-sound'
import { db } from '../lib/firebase'
import moodImages from '../assets/moods/index'
import moodSound from '../assets/sounds/mood.mp3'
import { SmilePlus } from 'lucide-react'

const MOODS: { id: string; label: string }[] = [
  { id: 'apaixonado', label: 'apaixonado' },
  { id: 'beijinho', label: 'beijinho' },
  { id: 'bravo', label: 'irado' },
  { id: 'chocado', label: 'embasbacado' },
  { id: 'chorando', label: 'chorinho' },
  { id: 'cocô', label: 'caquinha' },
  { id: 'confuso', label: 'confuso' },
  { id: 'corado', label: 'fofinho' },
  { id: 'com sono', label: 'soninho' },
  { id: 'estiloso', label: 'estiloso' },
  { id: 'língua de fora', label: 'bobinho' },
  { id: 'te observando', label: 'mlk neutro' },
  { id: 'piscando', label: 'piscadela' },
  { id: 'convicto', label: 'confiante' },
  { id: 'rindo', label: 'risadinha' },
  { id: 'sorrindo', label: 'sorrisinho' },
  { id: 'suado', label: 'cansadinho' },
  { id: 'triste', label: 'tristonho' },
]

const COLS = 6
const IMG_SIZE = 48
const TODAY = new Date().toISOString().slice(0, 10)

interface Props {
  uid: string
  partnerUid: string
}

interface MoodEntry {
  mood: string
  updatedAt: number
}

export default function MoodWidget({ uid, partnerUid }: Props) {
  const [expanded, setExpanded] = useState(false)
  const [myMood, setMyMood] = useState<string | null>(null)
  const [partnerMood, setPartnerMood] = useState<string | null>(null)
  const [hovered, setHovered] = useState<string | null>(null)
  const [pos, setPos] = useState({ x: 0, y: 60 })
  const [toast, setToast] = useState<string | null>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const prevPartnerMood = useRef<string | null>(null)
  const [play] = useSound(moodSound, { volume: 0.5 })
  const dragRef = useRef({ dragging: false, sx: 0, sy: 0, px: 0, py: 0 })
  const widgetRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setPos({ x: window.innerWidth / 2 - 26, y: 108 })
  }, [])

  useEffect(() => {
    const r = ref(db, `/mood/${uid}/${TODAY}`)
    return onValue(r, (snap) => {
      const val = snap.val() as MoodEntry | null
      setMyMood(val?.mood ?? null)
    })
  }, [uid])

  useEffect(() => {
    const r = ref(db, `/mood/${partnerUid}/${TODAY}`)
    return onValue(r, (snap) => {
      const val = snap.val() as MoodEntry | null
      setPartnerMood(val?.mood ?? null)
    })
  }, [partnerUid])

  useEffect(() => {
    if (!partnerMood) return
    if (partnerMood === prevPartnerMood.current) return
    prevPartnerMood.current = partnerMood
    const label = MOODS.find((m) => m.id === partnerMood)?.label ?? partnerMood
    play()
    if (toastTimer.current) clearTimeout(toastTimer.current)
    setToast(`Seu amor está se sentindo ${label} hoje 🌸`)
    toastTimer.current = setTimeout(() => setToast(null), 4000)
  }, [partnerMood, play])

  const selectMood = async (id: string) => {
    const entry: MoodEntry = { mood: id, updatedAt: Date.now() }
    await set(ref(db, `/mood/${uid}/${TODAY}`), entry)
    setExpanded(false)
  }
  const didDragRef = useRef(false)

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      didDragRef.current = false
      dragRef.current = {
        dragging: true,
        sx: e.clientX,
        sy: e.clientY,
        px: pos.x,
        py: pos.y,
      }
      e.preventDefault()
      const onMove = (ev: MouseEvent) => {
        const d = dragRef.current
        if (!d.dragging) return
        const dx = ev.clientX - d.sx
        const dy = ev.clientY - d.sy
        if (Math.abs(dx) > 4 || Math.abs(dy) > 4) didDragRef.current = true
        setPos({ x: d.px + dx, y: d.py + dy })
      }
      const onUp = () => {
        dragRef.current.dragging = false
        window.removeEventListener('mousemove', onMove)
        window.removeEventListener('mouseup', onUp)
      }
      window.addEventListener('mousemove', onMove)
      window.addEventListener('mouseup', onUp)
    },
    [pos]
  )

  useEffect(() => {
    if (!expanded) return
    const handler = (e: MouseEvent) => {
      if (widgetRef.current && !widgetRef.current.contains(e.target as Node)) {
        setExpanded(false)
      }
    }
    window.addEventListener('mousedown', handler)
    return () => window.removeEventListener('mousedown', handler)
  }, [expanded])

  const rows = Math.ceil(MOODS.length / COLS)

  return (
    <div
      ref={widgetRef}
      style={{
        position: 'fixed',
        left: pos.x,
        top: pos.y,
        zIndex: 49,
        userSelect: 'none',
        fontFamily: 'Baloo 2, sans-serif',
      }}
    >
      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: 32,
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'linear-gradient(180deg, #fdf6f0 0%, #fce8ee 100%)',
            border: '1.5px solid #e8a0b0',
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
          {toast}
        </div>
      )}

      <div
        onMouseDown={onMouseDown}
        onClick={() => {
          if (!didDragRef.current) setExpanded((v) => !v)
        }}
        style={{
          width: 42,
          height: 42,
          borderRadius: 14,
          background: 'rgba(245,185,210,0.32)',
          border: '1.5px solid rgba(215,145,180,0.45)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          boxShadow: '0 2px 10px rgba(44,20,8,0.10)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        {myMood ? (
          <img
            src={moodImages[myMood] ?? ''}
            alt={myMood}
            style={{ width: 34, height: 34, objectFit: 'contain', pointerEvents: 'none' }}
          />
        ) : (
          <SmilePlus size={20} color="rgba(122,48,64,0.6)" strokeWidth={2} />
        )}
      </div>

      {partnerMood && (
        <div
          style={{
            marginTop: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <img
            src={moodImages[partnerMood] ?? ''}
            alt={partnerMood}
            style={{ width: 28, height: 28, objectFit: 'contain', opacity: 0.85 }}
          />
          <span style={{ fontSize: 9, color: '#7a3040', fontWeight: 700 }}>
            {MOODS.find((m) => m.id === partnerMood)?.label ?? partnerMood}
          </span>
        </div>
      )}

      {expanded && (
        <div
          style={{
            position: 'absolute',
            top: 56, // expande pra baixo, abaixo do botão
            left: '50%',
            transform: 'translateX(-50%)', // centraliza em relação ao botão
            background:
              'linear-gradient(160deg, rgba(253,246,240,0.45) 0%, rgba(252,232,238,0.38) 100%)',
            border: '1.5px solid rgba(255,255,255,0.35)',
            backdropFilter: 'blur(18px) saturate(1.4)',
            WebkitBackdropFilter: 'blur(18px) saturate(1.4)',
            boxShadow: '0 8px 32px rgba(232,160,176,0.18), inset 0 1px 0 rgba(255,255,255,0.5)',
            borderRadius: 16,
            padding: 12,
            zIndex: 101,
            display: 'grid',
            gridTemplateColumns: `repeat(${COLS}, ${IMG_SIZE}px)`,
            gridTemplateRows: `repeat(${rows}, ${IMG_SIZE}px)`,
            gap: 6,
          }}
        >
          {MOODS.map((m) => (
            <div
              key={m.id}
              onClick={() => selectMood(m.id)}
              onMouseEnter={() => setHovered(m.id)}
              onMouseLeave={() => setHovered(null)}
              style={{
                width: IMG_SIZE,
                height: IMG_SIZE,
                borderRadius: 10,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                background:
                  myMood === m.id
                    ? 'rgba(232,160,176,0.35)'
                    : hovered === m.id
                      ? 'rgba(232,160,176,0.18)'
                      : 'transparent',
                border: myMood === m.id ? '1.5px solid #e8a0b0' : '1.5px solid transparent',
                transition: 'background 0.15s',
                position: 'relative',
              }}
            >
              <img
                src={moodImages[m.id] ?? ''}
                alt={m.label}
                style={{ width: 36, height: 36, objectFit: 'contain', pointerEvents: 'none' }}
              />
              {hovered === m.id && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: -15,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'rgba(44,20,8,0.75)',
                    color: '#fdf0e0',
                    fontSize: 10,
                    fontWeight: 700,
                    borderRadius: 6,
                    padding: '2px 7px',
                    whiteSpace: 'nowrap',
                    pointerEvents: 'none',
                    zIndex: 999,
                  }}
                >
                  {m.label}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
