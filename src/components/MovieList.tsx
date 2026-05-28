import {
  Star,
  X,
  ChevronDown,
  ChevronUp,
  Trash2,
  RotateCcw,
  Calendar,
  Plus,
  GripVertical,
  CheckCheck,
  Play,
  Bookmark,
  Eye,
  Search,
  Film,
  Tv,
  Clapperboard,
  LayoutList,
} from 'lucide-react'
import useMovies from '../hooks/useMovies'
import { useCoupleId } from '../contexts/CoupleContext'
import { Movie, MovieStatus, addMovie, subscribeTrashedMovies } from '../lib/movies'
import { useEffect, useRef, useState } from 'react'
import type React from 'react'
import DatePicker from './DatePicker'

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
  btnIcon: 'rgba(200,120,140,0.15)',
  btnPositive: 'rgba(74,122,74,0.15)',
  btnPositiveText: '#4A7A4A',
  btnPositiveBorder: 'rgba(74,122,74,0.35)',
  btnDestructive: 'rgba(232,96,122,0.12)',
  btnDestructiveText: '#e8607a',
  btnDestructiveBorder: 'rgba(232,96,122,0.3)',
  selectedBg: 'rgba(232,160,176,0.2)',
  selectedBorder: 'rgba(232,160,176,0.7)',
}

type TabType = 'watched' | 'watching' | 'wishlist'
type FilterType = 'todos' | 'filme' | 'série' | 'desenho'
type SortType = 'data' | 'nota'

const TYPE_ICON: Record<string, React.ReactNode> = {
  filme: <Film size={13} strokeWidth={2} />,
  série: <Tv size={13} strokeWidth={2} />,
  desenho: <Clapperboard size={13} strokeWidth={2} />,
}

const TYPE_ICON_SM: Record<string, React.ReactNode> = {
  filme: <Film size={10} strokeWidth={2} />,
  série: <Tv size={10} strokeWidth={2} />,
  desenho: <Clapperboard size={10} strokeWidth={2} />,
}

const TMDB_KEY = '26818979413c5eb5bd1bb9e703c239a5'

interface SearchResult {
  title: string
  poster: string | null
  year: string
  type: Movie['type']
}

async function searchTMDB(query: string): Promise<SearchResult[]> {
  if (!query.trim()) return []
  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/search/multi?api_key=${TMDB_KEY}&query=${encodeURIComponent(query)}&language=pt-BR`
    )
    const data = await res.json()
    return (data.results ?? [])
      .filter((r: any) => r.media_type !== 'person' && (r.title || r.name))
      .slice(0, 6)
      .map((r: any) => ({
        title: r.title ?? r.name,
        poster: r.poster_path ? `https://image.tmdb.org/t/p/w200${r.poster_path}` : null,
        year: (r.release_date ?? r.first_air_date ?? '').slice(0, 4),
        type: r.media_type === 'tv' ? 'série' : ('filme' as Movie['type']),
      }))
  } catch {
    return []
  }
}

// ── Star Rating ──────────────────────────────────────────────────────────────
function StarRating({
  value,
  onChange,
  readonly,
}: {
  value: number
  onChange?: (v: number) => void
  readonly?: boolean
}) {
  const [hovered, setHovered] = useState<number | null>(null)

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      {[1, 2, 3, 4, 5].map((star) => {
        const active = hovered !== null ? hovered : value
        const full = active >= star
        const half = !full && active >= star - 0.5
        return (
          <div
            key={star}
            style={{
              position: 'relative',
              width: 18,
              height: 18,
              cursor: readonly ? 'default' : 'pointer',
            }}
            onMouseLeave={() => !readonly && setHovered(null)}
          >
            <div
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: '50%',
                height: '100%',
                zIndex: 2,
              }}
              onMouseEnter={() => !readonly && setHovered(star - 0.5)}
              onClick={() => !readonly && onChange?.(star - 0.5)}
            />
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: 0,
                width: '50%',
                height: '100%',
                zIndex: 2,
              }}
              onMouseEnter={() => !readonly && setHovered(star)}
              onClick={() => !readonly && onChange?.(star)}
            />
            <Star
              size={16}
              strokeWidth={1.5}
              style={{
                color: full || half ? '#f59e0b' : 'rgba(232,160,176,0.35)',
                fill: full ? '#f59e0b' : 'none',
              }}
            />
            {half && (
              <Star
                size={16}
                strokeWidth={1.5}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  color: '#f59e0b',
                  fill: '#f59e0b',
                  clipPath: 'inset(0 50% 0 0)',
                }}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Add Form ─────────────────────────────────────────────────────────────────
function AddMovieForm({
  defaultStatus,
  onAdd,
  onCancel,
  loading,
}: {
  defaultStatus: MovieStatus
  onAdd: (
    title: string,
    type: Movie['type'],
    poster: string | null,
    status: MovieStatus
  ) => Promise<void>
  onCancel: () => void
  loading: boolean
}) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [selected, setSelected] = useState<SearchResult | null>(null)
  const [searching, setSearching] = useState(false)
  const [newType, setNewType] = useState<Movie['type']>('filme')
  const [status] = useState<MovieStatus>(defaultStatus)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    if (selected) return
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!query.trim()) {
      setResults([])
      return
    }
    debounceRef.current = setTimeout(async () => {
      setSearching(true)
      const res = await searchTMDB(query)
      setResults(res)
      setSearching(false)
    }, 350)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query, selected])

  const handleSelect = (r: SearchResult) => {
    setSelected(r)
    setQuery(r.title)
    setResults([])
    setNewType(r.type)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        {!selected && (
          <select
            value={newType}
            onChange={(e) => setNewType(e.target.value as Movie['type'])}
            style={{
              background: T.card,
              border: T.borderVal,
              borderRadius: 8,
              padding: '6px',
              fontSize: 11,
              color: T.text,
              fontFamily: 'Baloo 2, sans-serif',
              flexShrink: 0,
            }}
          >
            <option value="filme">filme</option>
            <option value="série">série</option>
            <option value="desenho">desenho</option>
          </select>
        )}
        {selected?.poster && (
          <img
            src={selected.poster}
            alt={selected.title}
            style={{ width: 26, height: 38, objectFit: 'cover', borderRadius: 4, flexShrink: 0 }}
          />
        )}
        <div style={{ flex: 1, position: 'relative' }}>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setSelected(null)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !results.length)
                onAdd(
                  selected?.title ?? query.trim(),
                  selected?.type ?? newType,
                  selected?.poster ?? null,
                  status
                )
            }}
            placeholder="buscar título..."
            style={{
              width: '100%',
              background: T.card,
              border: T.borderVal,
              borderRadius: 8,
              padding: '6px 10px',
              fontSize: 12,
              color: T.text,
              fontFamily: 'Baloo 2, sans-serif',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          {searching && (
            <div
              style={{
                position: 'absolute',
                right: 8,
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: 10,
                color: T.textLabel,
              }}
            >
              ...
            </div>
          )}
        </div>
        <button
          onClick={() =>
            onAdd(
              selected?.title ?? query.trim(),
              selected?.type ?? newType,
              selected?.poster ?? null,
              status
            )
          }
          disabled={loading || !query.trim()}
          style={{
            background: T.btnPrimary,
            border: 'none',
            borderRadius: 8,
            padding: '6px 12px',
            fontSize: 11,
            fontWeight: 800,
            color: T.text,
            cursor: 'pointer',
            fontFamily: 'Baloo 2, sans-serif',
            opacity: loading || !query.trim() ? 0.5 : 1,
            flexShrink: 0,
          }}
        >
          {loading ? '...' : 'ok'}
        </button>
        <button
          onClick={onCancel}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: T.textLabel,
            display: 'flex',
          }}
        >
          <X size={15} strokeWidth={2.5} />
        </button>
      </div>

      {results.length > 0 && (
        <div
          style={{ background: T.card, border: T.borderVal, borderRadius: 12, overflow: 'hidden' }}
        >
          {results.map((r, i) => (
            <div
              key={i}
              onClick={() => handleSelect(r)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '7px 10px',
                cursor: 'pointer',
                borderBottom: i < results.length - 1 ? T.borderDashed : 'none',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = T.selectedBg)}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <div
                style={{
                  width: 26,
                  height: 38,
                  borderRadius: 4,
                  overflow: 'hidden',
                  flexShrink: 0,
                  background: 'rgba(232,160,176,0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {r.poster ? (
                  <img
                    src={r.poster}
                    alt={r.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <Film size={14} color={T.textLabel} strokeWidth={2} />
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: T.text,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {r.title}
                </div>
                <div style={{ fontSize: 10, color: T.textLabel }}>
                  {r.type}
                  {r.year ? ` · ${r.year}` : ''}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Poster Box ────────────────────────────────────────────────────────────────
function PosterBox({ movie, w = 36, h = 52 }: { movie: Movie; w?: number; h?: number }) {
  return (
    <div
      style={{
        width: w,
        height: h,
        borderRadius: 6,
        overflow: 'hidden',
        flexShrink: 0,
        background: 'rgba(232,160,176,0.15)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {movie.poster ? (
        <img
          src={movie.poster}
          alt={movie.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        <span style={{ color: T.textLabel, opacity: 0.7 }}>{TYPE_ICON[movie.type]}</span>
      )}
    </div>
  )
}

// ── Movie Card — Watched ──────────────────────────────────────────────────────
function WatchedCard({
  movie,
  uid,
  partnerUid,
  displayName,
  partnerName,
  onRate,
  onChangeDate,
  onDelete,
  onChangeStatus,
}: {
  movie: Movie
  uid: string
  partnerUid: string
  displayName: string
  partnerName: string
  onRate: (id: string, stars: number, comment: string) => void
  onChangeDate: (id: string, date: string) => void
  onDelete: (id: string) => void
  onChangeStatus: (id: string, status: MovieStatus, title: string) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [myStars, setMyStars] = useState(movie.ratings?.[uid]?.stars ?? 0)
  const [myComment, setMyComment] = useState(movie.ratings?.[uid]?.comment ?? '')
  const [editingDate, setEditingDate] = useState(false)
  const [dateVal, setDateVal] = useState(movie.watchedAt)

  const myRating = movie.ratings?.[uid]
  const partnerRating = movie.ratings?.[partnerUid]
  const avgStars =
    myRating && partnerRating
      ? (myRating.stars + partnerRating.stars) / 2
      : (myRating?.stars ?? partnerRating?.stars ?? null)

  const dateLabel = new Date(movie.watchedAt + 'T12:00:00').toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })

  return (
    <div
      style={{
        background: T.card,
        border: T.borderVal,
        borderRadius: 12,
        marginBottom: 6,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '8px 12px',
          cursor: 'pointer',
        }}
        onClick={() => setExpanded((v) => !v)}
      >
        <PosterBox movie={movie} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 800,
                color: T.text,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {movie.title}
            </div>
            {(movie.watchCount ?? 1) > 1 && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 3,
                  background: T.btnPositive,
                  border: `1px solid ${T.btnPositiveBorder}`,
                  borderRadius: 10,
                  padding: '1px 6px',
                  flexShrink: 0,
                }}
              >
                <Eye size={9} color={T.btnPositiveText} strokeWidth={2} />
                <span style={{ fontSize: 9, fontWeight: 800, color: T.btnPositiveText }}>
                  {movie.watchCount}x
                </span>
              </div>
            )}
          </div>
          <div style={{ fontSize: 10, color: T.textLabel, marginBottom: 2 }}>{dateLabel}</div>
          {avgStars !== null && <StarRating value={avgStars} readonly />}

          {!expanded && (myRating?.comment || partnerRating?.comment) && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1, marginTop: 2 }}>
              {[
                myRating?.comment ? { comment: myRating.comment, nick: displayName } : null,
                partnerRating?.comment
                  ? { comment: partnerRating.comment, nick: partnerName }
                  : null,
              ]
                .filter(Boolean)
                .map((r) => (
                  <div
                    key={r!.nick}
                    style={{
                      fontSize: 10,
                      color: T.textSub,
                      fontStyle: 'italic',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    &ldquo;{r!.comment}&rdquo;{' '}
                    <span style={{ fontStyle: 'normal', fontWeight: 800, color: T.textLabel }}>
                      — {r!.nick}
                    </span>
                  </div>
                ))}
            </div>
          )}
        </div>
        <div style={{ color: T.textLabel }}>
          {expanded ? (
            <ChevronUp size={14} strokeWidth={2} />
          ) : (
            <ChevronDown size={14} strokeWidth={2} />
          )}
        </div>
      </div>

      {expanded && (
        <div
          style={{
            borderTop: T.borderDashed,
            padding: '10px 12px',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Calendar size={12} color={T.textLabel} strokeWidth={2} />
            {editingDate ? (
              <div style={{ position: 'relative', zIndex: 9999 }}>
                <DatePicker
                  value={dateVal}
                  max={new Date().toISOString().split('T')[0]}
                  onChange={(v) => {
                    setDateVal(v)
                    onChangeDate(movie.id, v)
                    setEditingDate(false)
                  }}
                />
              </div>
            ) : (
              <span
                style={{
                  fontSize: 11,
                  color: T.textLabel,
                  cursor: 'pointer',
                  textDecoration: 'underline dotted',
                }}
                onClick={(e) => {
                  e.stopPropagation()
                  setEditingDate(true)
                }}
              >
                {dateLabel}
              </span>
            )}
          </div>

          <div>
            <div
              style={{
                fontSize: 10,
                fontWeight: 800,
                color: T.textLabel,
                textTransform: 'uppercase',
                letterSpacing: '0.7px',
                marginBottom: 4,
              }}
            >
              {displayName}
            </div>
            <StarRating
              value={myStars}
              onChange={(v) => {
                setMyStars(v)
                onRate(movie.id, v, myComment)
              }}
            />
            <input
              placeholder="comentário (opcional)"
              value={myComment}
              onChange={(e) => setMyComment(e.target.value)}
              onBlur={() => onRate(movie.id, myStars, myComment)}
              onClick={(e) => e.stopPropagation()}
              style={{
                marginTop: 5,
                width: '100%',
                background: T.card,
                border: T.borderVal,
                borderRadius: 8,
                padding: '4px 8px',
                fontSize: 11,
                color: T.text,
                fontFamily: 'Baloo 2, sans-serif',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {partnerRating && (
            <div>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  color: T.textLabel,
                  textTransform: 'uppercase',
                  letterSpacing: '0.7px',
                  marginBottom: 4,
                }}
              >
                {partnerName}
              </div>
              <StarRating value={partnerRating.stars} readonly />
              {partnerRating.comment && (
                <div style={{ fontSize: 11, color: T.textSub, marginTop: 3, fontStyle: 'italic' }}>
                  &ldquo;{partnerRating.comment}&rdquo;
                </div>
              )}
            </div>
          )}

          {myRating && partnerRating && (
            <div
              style={{
                background: T.selectedBg,
                border: T.borderVal,
                borderRadius: 10,
                padding: '5px 10px',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  color: T.textLabel,
                  textTransform: 'uppercase',
                  letterSpacing: '0.7px',
                }}
              >
                média
              </span>
              <StarRating value={avgStars!} readonly />
              <span style={{ fontSize: 11, fontWeight: 800, color: '#f59e0b' }}>
                {avgStars?.toFixed(1)}
              </span>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onChangeStatus(movie.id, 'watching', movie.title)
              }}
              style={{
                background: T.btnIcon,
                border: T.borderVal,
                borderRadius: 8,
                padding: '4px 10px',
                fontSize: 10,
                fontWeight: 800,
                color: T.text,
                cursor: 'pointer',
                fontFamily: 'Baloo 2, sans-serif',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <Play size={10} strokeWidth={2} /> assistir de novo
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDelete(movie.id)
              }}
              style={{
                background: T.btnDestructive,
                border: `1px solid ${T.btnDestructiveBorder}`,
                borderRadius: 8,
                padding: '4px 10px',
                fontSize: 10,
                fontWeight: 800,
                color: T.btnDestructiveText,
                cursor: 'pointer',
                fontFamily: 'Baloo 2, sans-serif',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <Trash2 size={10} strokeWidth={2} /> remover
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Movie Card — Watching ─────────────────────────────────────────────────────
function WatchingCard({
  movie,
  onSaveProgress,
  onDelete,
  onChangeStatus,
}: {
  movie: Movie
  uid: string
  displayName: string
  onSaveProgress: (id: string, season: number, episode: number) => void
  onDelete: (id: string) => void
  onChangeStatus: (id: string, status: MovieStatus, title: string) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [season, setSeason] = useState(movie.progress?.season ?? 1)
  const [episode, setEpisode] = useState(movie.progress?.episode ?? 1)

  return (
    <div
      style={{
        background: T.card,
        border: T.borderVal,
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 6,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '8px 12px',
          cursor: 'pointer',
        }}
        onClick={() => setExpanded((v) => !v)}
      >
        <PosterBox movie={movie} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 800,
              color: T.text,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {movie.title}
          </div>
          {movie.progress && movie.type !== 'filme' && (
            <div style={{ fontSize: 10, color: T.btnPositiveText, fontWeight: 800, marginTop: 2 }}>
              T{movie.progress.season} · E{movie.progress.episode}
            </div>
          )}
        </div>
        <div style={{ color: T.textLabel }}>
          {expanded ? (
            <ChevronUp size={14} strokeWidth={2} />
          ) : (
            <ChevronDown size={14} strokeWidth={2} />
          )}
        </div>
      </div>

      {expanded && (
        <div
          style={{
            borderTop: T.borderDashed,
            padding: '10px 12px',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          {movie.type !== 'filme' && (
            <div>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  color: T.textLabel,
                  textTransform: 'uppercase',
                  letterSpacing: '0.7px',
                  marginBottom: 6,
                }}
              >
                onde paramos
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {[
                  { label: 'T', val: season, set: setSeason },
                  { label: 'E', val: episode, set: setEpisode },
                ].map((f) => (
                  <div key={f.label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ fontSize: 10, fontWeight: 800, color: T.textLabel }}>
                      {f.label}
                    </span>
                    <input
                      type="number"
                      min={1}
                      value={f.val}
                      onChange={(e) => f.set(Number(e.target.value))}
                      onBlur={() => onSaveProgress(movie.id, season, episode)}
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        width: 44,
                        background: T.card,
                        border: T.borderVal,
                        borderRadius: 8,
                        padding: '4px 6px',
                        fontSize: 12,
                        color: T.text,
                        fontFamily: 'Baloo 2, sans-serif',
                        outline: 'none',
                        textAlign: 'center',
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onChangeStatus(movie.id, 'watched', movie.title)
              }}
              style={{
                background: T.btnPositive,
                border: `1px solid ${T.btnPositiveBorder}`,
                borderRadius: 8,
                padding: '5px 12px',
                fontSize: 10,
                fontWeight: 800,
                color: T.btnPositiveText,
                cursor: 'pointer',
                fontFamily: 'Baloo 2, sans-serif',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <CheckCheck size={10} strokeWidth={2} /> terminamos!
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDelete(movie.id)
              }}
              style={{
                background: T.btnDestructive,
                border: `1px solid ${T.btnDestructiveBorder}`,
                borderRadius: 8,
                padding: '4px 10px',
                fontSize: 10,
                fontWeight: 800,
                color: T.btnDestructiveText,
                cursor: 'pointer',
                fontFamily: 'Baloo 2, sans-serif',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <Trash2 size={10} strokeWidth={2} /> remover
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Movie Card — Wishlist ─────────────────────────────────────────────────────
function WishlistCard({
  movie,
  onDelete,
  onChangeStatus,
  dragHandleProps,
}: {
  movie: Movie
  onDelete: (id: string) => void
  onChangeStatus: (id: string, status: MovieStatus, title: string) => void
  dragHandleProps: React.HTMLAttributes<HTMLDivElement>
}) {
  return (
    <div
      style={{
        background: T.card,
        border: T.borderVal,
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 6,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 10px',
      }}
    >
      <div
        {...dragHandleProps}
        style={{ color: T.textLabel, opacity: 0.5, cursor: 'grab', flexShrink: 0 }}
      >
        <GripVertical size={14} strokeWidth={2} />
      </div>
      <PosterBox movie={movie} w={32} h={46} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 12,
            fontWeight: 800,
            color: T.text,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {movie.title}
        </div>
        <div
          style={{
            fontSize: 10,
            color: T.textLabel,
            display: 'flex',
            alignItems: 'center',
            gap: 3,
          }}
        >
          {TYPE_ICON_SM[movie.type]} {movie.type}
        </div>
      </div>
      <button
        onClick={() => onChangeStatus(movie.id, 'watching', movie.title)}
        style={{
          background: T.btnPositive,
          border: `1px solid ${T.btnPositiveBorder}`,
          borderRadius: 8,
          padding: '4px 9px',
          fontSize: 10,
          fontWeight: 800,
          color: T.btnPositiveText,
          cursor: 'pointer',
          fontFamily: 'Baloo 2, sans-serif',
          display: 'flex',
          alignItems: 'center',
          gap: 3,
          flexShrink: 0,
        }}
      >
        <Play size={9} strokeWidth={2} /> assistir
      </button>
      <button
        onClick={() => onDelete(movie.id)}
        style={{
          width: 22,
          height: 22,
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
        <X size={11} strokeWidth={2.5} color="rgba(122,48,64,0.7)" />
      </button>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
interface Props {
  uid: string
  partnerUid: string
  displayName: string
  partnerName: string
  onClose: () => void
}

export default function MovieList({ uid, partnerUid, displayName, partnerName, onClose }: Props) {
  const { coupleId } = useCoupleId()
  if (!coupleId) return null
  const {
    movies,
    addNewMovie,
    rateMovie,
    changeStatus,
    changeDate,
    saveProgress,
    removeMovie,
    restoreMovieById,
    deleteMovieForever,
    reorderWishlistMovies,
  } = useMovies(coupleId, uid, displayName)
  const [tab, setTab] = useState<TabType>('watched')
  const [filter, setFilter] = useState<FilterType>('todos')
  const [sort, setSort] = useState<SortType>('data')
  const [adding, setAdding] = useState(false)
  const [loading, setLoading] = useState(false)
  const [duplicate, setDuplicate] = useState<{
    title: string
    status: MovieStatus
    kind: 'same' | 'other'
  } | null>(null)
  const [search, setSearch] = useState('')
  const [showTrash, setShowTrash] = useState(false)
  const [trashed, setTrashed] = useState<Movie[]>([])

  useEffect(() => {
    return subscribeTrashedMovies(coupleId, setTrashed)
  }, [])

  const dragItem = useRef<number | null>(null)
  const dragOver = useRef<number | null>(null)
  const searchLower = search.toLowerCase()

  const watched = movies
    .filter(
      (m) =>
        m.status === 'watched' &&
        (filter === 'todos' || m.type === filter) &&
        (!search || m.title.toLowerCase().includes(searchLower))
    )
    .sort((a, b) =>
      sort === 'data'
        ? b.watchedAt !== a.watchedAt
          ? b.watchedAt.localeCompare(a.watchedAt)
          : (b.watchedAtMs ?? 0) - (a.watchedAtMs ?? 0)
        : (() => {
            const avg = (m: Movie) =>
              Object.values(m.ratings ?? {}).reduce((s, r) => s + r.stars, 0) /
              Math.max(1, Object.values(m.ratings ?? {}).length)
            return avg(b) - avg(a)
          })()
    )

  const watching = movies.filter(
    (m) => m.status === 'watching' && (!search || m.title.toLowerCase().includes(searchLower))
  )
  const wishlist = movies
    .filter(
      (m) => m.status === 'wishlist' && (!search || m.title.toLowerCase().includes(searchLower))
    )
    .sort((a, b) => (a.wishlistOrder ?? 0) - (b.wishlistOrder ?? 0))

  const grouped: { label: string; items: Movie[] }[] = []
  if (sort === 'data') {
    watched.forEach((m) => {
      const label = new Date(m.watchedAt + 'T12:00:00').toLocaleDateString('pt-BR', {
        month: 'long',
        year: 'numeric',
      })
      const last = grouped[grouped.length - 1]
      if (last?.label === label) last.items.push(m)
      else grouped.push({ label, items: [m] })
    })
  }

  const handleDragEnd = () => {
    if (dragItem.current === null || dragOver.current === null) return
    const reordered = [...wishlist]
    const dragged = reordered.splice(dragItem.current, 1)[0]
    reordered.splice(dragOver.current, 0, dragged)
    dragItem.current = null
    dragOver.current = null
    reorderWishlistMovies(reordered)
  }

  const TABS: { key: TabType; label: string; icon: React.ReactNode; count: number }[] = [
    {
      key: 'watched',
      label: 'assistidos',
      icon: <CheckCheck size={13} strokeWidth={2} />,
      count: movies.filter((m) => m.status === 'watched').length,
    },
    {
      key: 'watching',
      label: 'assistindo',
      icon: <Play size={13} strokeWidth={2} />,
      count: movies.filter((m) => m.status === 'watching').length,
    },
    {
      key: 'wishlist',
      label: 'quero ver',
      icon: <Bookmark size={13} strokeWidth={2} />,
      count: movies.filter((m) => m.status === 'wishlist').length,
    },
  ]

  const statusForTab: Record<TabType, MovieStatus> = {
    watched: 'watched',
    watching: 'watching',
    wishlist: 'wishlist',
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 60,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(61,26,16,0.4)',
        backdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 440,
          maxHeight: '88vh',
          background: T.bg,
          border: T.borderVal,
          borderRadius: 20,
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
            padding: '14px 18px 12px',
            borderBottom: T.borderDashed,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <LayoutList size={15} color="rgba(200,120,140,0.7)" strokeWidth={2} />
            <span style={{ fontSize: 15, fontWeight: 800, color: T.text }}>filmes & séries</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button
              onClick={() => setShowTrash(true)}
              style={{
                background: trashed.length > 0 ? T.btnDestructive : 'none',
                border: trashed.length > 0 ? `1px solid ${T.btnDestructiveBorder}` : 'none',
                borderRadius: 8,
                cursor: 'pointer',
                color: T.btnDestructiveText,
                opacity: trashed.length > 0 ? 1 : 0.35,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                padding: '3px 7px',
              }}
            >
              <Trash2 size={13} strokeWidth={2} />
              {trashed.length > 0 && (
                <span style={{ fontSize: 9, fontWeight: 800 }}>{trashed.length}</span>
              )}
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
              }}
            >
              <X size={13} strokeWidth={2.5} color="rgba(122,48,64,0.7)" />
            </button>
          </div>
        </div>

        {/* Abas */}
        <div style={{ display: 'flex', padding: '8px 12px 0', gap: 4, flexShrink: 0 }}>
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => {
                setTab(t.key)
                setAdding(false)
              }}
              style={{
                flex: 1,
                padding: '7px 4px',
                borderRadius: '10px 10px 0 0',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'Baloo 2, sans-serif',
                fontSize: 11,
                fontWeight: 700,
                background: tab === t.key ? T.selectedBg : 'transparent',
                color: tab === t.key ? T.text : T.textLabel,
                borderBottom:
                  tab === t.key ? `2px solid ${T.selectedBorder}` : '2px solid transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 5,
                transition: 'all 0.15s',
              }}
            >
              {t.icon} {t.label}
              {t.count > 0 && (
                <span
                  style={{ background: T.btnIcon, borderRadius: 10, padding: '0 5px', fontSize: 9 }}
                >
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Busca */}
        <div style={{ padding: '6px 12px 0', flexShrink: 0 }}>
          <div style={{ position: 'relative' }}>
            <Search
              size={12}
              color={T.textLabel}
              style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="buscar na lista..."
              style={{
                width: '100%',
                background: T.card,
                border: T.borderVal,
                borderRadius: 10,
                padding: '5px 28px',
                fontSize: 11,
                color: T.text,
                fontFamily: 'Baloo 2, sans-serif',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                style={{
                  position: 'absolute',
                  right: 7,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: T.textLabel,
                  padding: 0,
                  display: 'flex',
                }}
              >
                <X size={11} strokeWidth={2.5} />
              </button>
            )}
          </div>
        </div>

        {/* Filtros — só watched */}
        {tab === 'watched' && (
          <div
            style={{
              padding: '8px 12px 4px',
              display: 'flex',
              gap: 4,
              flexShrink: 0,
              flexWrap: 'wrap',
              alignItems: 'center',
            }}
          >
            {(
              [
                { key: 'todos', label: 'todos', icon: null },
                { key: 'filme', label: 'filme', icon: <Film size={10} strokeWidth={2} /> },
                { key: 'série', label: 'série', icon: <Tv size={10} strokeWidth={2} /> },
                {
                  key: 'desenho',
                  label: 'desenho',
                  icon: <Clapperboard size={10} strokeWidth={2} />,
                },
              ] as { key: FilterType; label: string; icon: React.ReactNode }[]
            ).map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                style={{
                  padding: '3px 10px',
                  borderRadius: 20,
                  border: filter === f.key ? `1.5px solid ${T.selectedBorder}` : T.borderVal,
                  fontSize: 10,
                  fontWeight: 800,
                  fontFamily: 'Baloo 2, sans-serif',
                  cursor: 'pointer',
                  background: filter === f.key ? T.btnPrimary : 'transparent',
                  color: T.text,
                  transition: 'all 0.15s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                {f.icon} {f.label}
              </button>
            ))}
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 3 }}>
              {(['data', 'nota'] as SortType[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setSort(s)}
                  style={{
                    padding: '3px 8px',
                    borderRadius: 20,
                    border: sort === s ? `1.5px solid ${T.selectedBorder}` : T.borderVal,
                    fontSize: 9,
                    fontWeight: 800,
                    fontFamily: 'Baloo 2, sans-serif',
                    cursor: 'pointer',
                    background: sort === s ? T.selectedBg : 'transparent',
                    color: T.textLabel,
                  }}
                >
                  {s === 'data' ? 'recente' : 'nota'}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Adicionar */}
        <div style={{ padding: '6px 12px 8px', flexShrink: 0 }}>
          {adding ? (
            <AddMovieForm
              defaultStatus={statusForTab[tab]}
              onAdd={async (title, type, poster, status) => {
                setLoading(true)
                try {
                  const result = await addNewMovie(title, type, poster, status)
                  if (result === 'duplicate_same' || result === 'duplicate_other') {
                    const found = movies.find((m) => m.title.toLowerCase() === title.toLowerCase())
                    if (found)
                      setDuplicate({
                        title: found.title,
                        status: found.status,
                        kind: result === 'duplicate_same' ? 'same' : 'other',
                      })
                  } else {
                    setAdding(false)
                  }
                } catch (err) {
                  console.error('Erro ao salvar filme:', err)
                } finally {
                  setLoading(false)
                }
              }}
              onCancel={() => setAdding(false)}
              loading={loading}
            />
          ) : (
            <button
              onClick={() => setAdding(true)}
              style={{
                width: '100%',
                padding: '7px',
                borderRadius: 10,
                border: T.borderDashed,
                background: 'none',
                color: T.textLabel,
                fontSize: 11,
                fontWeight: 800,
                cursor: 'pointer',
                fontFamily: 'Baloo 2, sans-serif',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 5,
              }}
            >
              <Plus size={13} strokeWidth={2.5} /> adicionar
            </button>
          )}
        </div>

        {/* Modal lixeira */}
        {showTrash && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 70,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(61,26,16,0.4)',
              backdropFilter: 'blur(4px)',
            }}
            onClick={() => setShowTrash(false)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                width: 400,
                maxHeight: '80vh',
                display: 'flex',
                flexDirection: 'column',
                background: T.bg,
                border: T.borderVal,
                borderRadius: 20,
                boxShadow: T.shadow,
              }}
            >
              <div
                style={{
                  padding: '14px 18px 12px',
                  borderBottom: T.borderDashed,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexShrink: 0,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <Trash2 size={14} color={T.btnDestructiveText} strokeWidth={2} />
                  <span style={{ fontSize: 13, fontWeight: 800, color: T.text }}>lixeira</span>
                  {trashed.length > 0 && (
                    <span style={{ fontSize: 10, color: T.btnDestructiveText }}>
                      {trashed.length} item{trashed.length > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setShowTrash(false)}
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
              <div style={{ flex: 1, overflowY: 'auto', padding: '10px 12px 14px' }}>
                {trashed.length === 0 ? (
                  <div
                    style={{
                      textAlign: 'center',
                      color: T.textSub,
                      fontSize: 12,
                      padding: '40px 0',
                    }}
                  >
                    lixeira vazia
                  </div>
                ) : (
                  trashed.map((m) => {
                    const deletedAgo = m.trashedAt
                      ? Math.floor((Date.now() - m.trashedAt) / 60000)
                      : null
                    const agoLabel =
                      deletedAgo === null
                        ? ''
                        : deletedAgo < 1
                          ? 'agora mesmo'
                          : deletedAgo < 60
                            ? `há ${deletedAgo} min`
                            : deletedAgo < 1440
                              ? `há ${Math.floor(deletedAgo / 60)}h`
                              : `há ${Math.floor(deletedAgo / 1440)}d`
                    return (
                      <div
                        key={m.id}
                        style={{
                          background: T.card,
                          border: T.borderVal,
                          borderRadius: 12,
                          marginBottom: 6,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          padding: '8px 10px',
                        }}
                      >
                        <PosterBox movie={m} w={32} h={46} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              fontSize: 12,
                              fontWeight: 800,
                              color: T.text,
                              opacity: 0.6,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {m.title}
                          </div>
                          <div style={{ fontSize: 9, color: T.btnDestructiveText, marginTop: 2 }}>
                            excluído {agoLabel}
                          </div>
                        </div>
                        <button
                          onClick={() => restoreMovieById(m.id)}
                          style={{
                            background: T.btnPositive,
                            border: `1px solid ${T.btnPositiveBorder}`,
                            borderRadius: 8,
                            padding: '4px 8px',
                            fontSize: 10,
                            fontWeight: 800,
                            color: T.btnPositiveText,
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
                          onClick={() => deleteMovieForever(m.id)}
                          style={{
                            width: 22,
                            height: 22,
                            borderRadius: '50%',
                            border: 'none',
                            background: T.btnDestructive,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: 0,
                            flexShrink: 0,
                          }}
                        >
                          <X size={11} strokeWidth={2.5} color={T.btnDestructiveText} />
                        </button>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* Modal duplicata */}
        {duplicate && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(61,26,16,0.5)',
              borderRadius: 20,
              backdropFilter: 'blur(4px)',
            }}
          >
            <div
              style={{
                background: T.bg,
                border: T.borderVal,
                borderRadius: 16,
                padding: '20px 22px',
                maxWidth: 300,
                textAlign: 'center',
                fontFamily: 'Baloo 2, sans-serif',
                boxShadow: T.shadow,
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 800, color: T.text, marginBottom: 6 }}>
                {duplicate.kind === 'same' ? 'já está nessa lista' : 'título já adicionado'}
              </div>
              <div style={{ fontSize: 11, color: T.textSub, marginBottom: 16, lineHeight: 1.5 }}>
                {duplicate.kind === 'same' ? (
                  <>
                    <strong style={{ color: T.text }}>{duplicate.title}</strong> já está em{' '}
                    <strong style={{ color: '#f59e0b' }}>
                      {duplicate.status === 'watching' ? 'assistindo' : 'quero ver'}
                    </strong>
                    . só pode ter um por vez nessa lista.
                  </>
                ) : (
                  <>
                    <strong style={{ color: T.text }}>{duplicate.title}</strong> já está como{' '}
                    <strong style={{ color: '#f59e0b' }}>
                      {duplicate.status === 'watched'
                        ? 'assistido'
                        : duplicate.status === 'watching'
                          ? 'assistindo'
                          : 'quero ver'}
                    </strong>
                    . deseja adicionar de novo?
                  </>
                )}
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                <button
                  onClick={() => setDuplicate(null)}
                  style={{
                    background: 'transparent',
                    border: T.borderVal,
                    borderRadius: 10,
                    padding: '6px 16px',
                    fontSize: 11,
                    fontWeight: 800,
                    color: T.textSub,
                    cursor: 'pointer',
                    fontFamily: 'Baloo 2, sans-serif',
                  }}
                >
                  {duplicate.kind === 'same' ? 'ok, entendi' : 'cancelar'}
                </button>
                {duplicate.kind === 'other' && (
                  <button
                    onClick={async () => {
                      const found = movies.find((m) => m.title === duplicate.title)
                      if (!found) return
                      if (statusForTab[tab] !== 'watched') {
                        setDuplicate(null)
                        return
                      }
                      setDuplicate(null)
                      setLoading(true)
                      try {
                        const newStatus =
                          tab === 'watched'
                            ? 'watched'
                            : tab === 'watching'
                              ? 'watching'
                              : ('wishlist' as MovieStatus)
                        const wishlistCount = movies.filter((m) => m.status === 'wishlist').length
                        const now = new Date()
                        const allWithTitle = movies.filter(
                          (m) => m.title.toLowerCase() === found.title.toLowerCase()
                        )
                        const maxCount = Math.max(...allWithTitle.map((m) => m.watchCount ?? 0))
                        const isWatched = newStatus === 'watched'
                        const isWishlist = newStatus === 'wishlist'
                        const newMovie: Omit<Movie, 'id'> = {
                          title: found.title,
                          poster: found.poster ?? null,
                          type: found.type,
                          status: newStatus,
                          watchedAt: now.toISOString().split('T')[0],
                          watchedAtMs: isWatched ? now.getTime() : 0,
                          createdAt: now.toISOString(),
                          ratings: {},
                          watchCount: isWatched ? maxCount + 1 : 0,
                          ...(isWishlist ? { wishlistOrder: wishlistCount } : {}),
                        }
                        await addMovie(coupleId, newMovie)
                        setAdding(false)
                      } catch (err) {
                        console.error('Erro ao duplicar filme:', err)
                      } finally {
                        setLoading(false)
                      }
                    }}
                    style={{
                      background: T.btnPrimary,
                      border: 'none',
                      borderRadius: 10,
                      padding: '6px 16px',
                      fontSize: 11,
                      fontWeight: 800,
                      color: T.text,
                      cursor: 'pointer',
                      fontFamily: 'Baloo 2, sans-serif',
                    }}
                  >
                    adicionar mesmo assim
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Lista */}
        <style>{`
          .movie-list-scroll::-webkit-scrollbar { width: 4px; }
          .movie-list-scroll::-webkit-scrollbar-track { background: transparent; }
          .movie-list-scroll::-webkit-scrollbar-thumb { background: rgba(232,160,176,0.55); border-radius: 99px; }
          .movie-list-scroll::-webkit-scrollbar-thumb:hover { background: rgba(232,160,176,0.99); }
        `}</style>
        <div
          className="movie-list-scroll"
          style={{ flex: 1, overflowY: 'auto', padding: '0 12px 14px' }}
        >
          {tab === 'watched' &&
            (watched.length === 0 ? (
              <div
                style={{ textAlign: 'center', color: T.textSub, fontSize: 12, padding: '28px 0' }}
              >
                nenhum título assistido ainda
              </div>
            ) : sort === 'data' ? (
              grouped.map((group) => (
                <div key={group.label}>
                  <div
                    style={{
                      fontSize: 9,
                      fontWeight: 800,
                      color: T.textLabel,
                      textTransform: 'capitalize',
                      padding: '8px 2px 5px',
                      letterSpacing: '0.8px',
                    }}
                  >
                    {group.label}
                  </div>
                  {group.items.map((m) => (
                    <WatchedCard
                      key={m.id}
                      movie={m}
                      uid={uid}
                      partnerUid={partnerUid}
                      displayName={displayName}
                      partnerName={partnerName}
                      onRate={(id, stars, comment) => rateMovie(id, { stars, comment })}
                      onChangeDate={changeDate}
                      onDelete={removeMovie}
                      onChangeStatus={changeStatus}
                    />
                  ))}
                </div>
              ))
            ) : (
              watched.map((m) => (
                <WatchedCard
                  key={m.id}
                  movie={m}
                  uid={uid}
                  partnerUid={partnerUid}
                  displayName={displayName}
                  partnerName={partnerName}
                  onRate={(id, stars, comment) => rateMovie(id, { stars, comment })}
                  onChangeDate={changeDate}
                  onDelete={removeMovie}
                  onChangeStatus={changeStatus}
                />
              ))
            ))}

          {tab === 'watching' &&
            (watching.length === 0 ? (
              <div
                style={{ textAlign: 'center', color: T.textSub, fontSize: 12, padding: '28px 0' }}
              >
                nenhum título em andamento
              </div>
            ) : (
              watching.map((m) => (
                <WatchingCard
                  key={m.id}
                  movie={m}
                  uid={uid}
                  displayName={displayName}
                  onSaveProgress={(id, s, e) => saveProgress(id, { season: s, episode: e })}
                  onDelete={removeMovie}
                  onChangeStatus={changeStatus}
                />
              ))
            ))}

          {tab === 'wishlist' &&
            (wishlist.length === 0 ? (
              <div
                style={{ textAlign: 'center', color: T.textSub, fontSize: 12, padding: '28px 0' }}
              >
                lista vazia — o que querem assistir?
              </div>
            ) : (
              wishlist.map((m, i) => (
                <WishlistCard
                  key={m.id}
                  movie={m}
                  onDelete={removeMovie}
                  onChangeStatus={changeStatus}
                  dragHandleProps={{
                    draggable: true,
                    onDragStart: () => {
                      dragItem.current = i
                    },
                    onDragEnter: () => {
                      dragOver.current = i
                    },
                    onDragEnd: handleDragEnd,
                    onDragOver: (e) => e.preventDefault(),
                  }}
                />
              ))
            ))}
        </div>
      </div>
    </div>
  )
}
