// src/components/CharacterModal.tsx
import { useState, useCallback, useRef } from 'react'
import {
  ChevronLeft,
  Save,
  AlertCircle,
  Undo2,
  Redo2,
  Trash2,
  Sparkles,
  Plus,
  Check,
  X,
} from 'lucide-react'
import {
  ALL_PIECES,
  CharacterCategory,
  CharacterConfig,
  CharacterPiece,
  CharacterGender,
  CharacterPack,
  DEFAULT_CHARACTER_CONFIG,
  LAYER_ORDER,
  isMultiSlot,
  getPiecesByCategory,
  COLOR_VARIANT_LABELS,
} from '../assets/character/index'
import { FIRST_TIME_COLOR_VARIANTS } from '../assets/character/firstTimeConfig'
import type { CharacterPreset } from '../hooks/useCharacter'

// ── Scrollbar custom global ──────────────────────────────────
const SCROLLBAR_CSS = `
  .char-scroll::-webkit-scrollbar { width: 4px; height: 4px; }
  .char-scroll::-webkit-scrollbar-track { background: transparent; }
  .char-scroll::-webkit-scrollbar-thumb { background: rgba(232,160,176,0.55); border-radius: 99px; }
  .char-scroll::-webkit-scrollbar-thumb:hover { background: rgba(232,160,176,0.99); }
  .char-scroll { scrollbar-width: thin; scrollbar-color: rgba(232,160,176,0.55) transparent; }
`
if (!document.getElementById('char-scroll-style')) {
  const s = document.createElement('style')
  s.id = 'char-scroll-style'
  s.textContent = SCROLLBAR_CSS
  document.head.appendChild(s)
}

function assetUrl(path: string): string {
  return `./character/${path}`
}

// ── Paleta leafnote ──────────────────────────────────────────
const T = {
  bg: 'linear-gradient(160deg, rgba(253,246,240,0.97) 0%, rgba(252,232,238,0.97) 100%)',
  bgSolid: 'rgba(253,246,240,0.97)',
  card: 'rgba(253,242,246,0.7)',
  cardBorder: '1.5px solid rgba(232,160,176,0.3)',
  border: 'rgba(232,160,176,0.4)',
  borderDashed: '2px dashed rgba(232,160,176,0.4)',
  shadow: '0 8px 40px rgba(200,120,140,0.2), inset 0 1px 0 rgba(255,255,255,0.6)',
  text: '#3d1a10',
  textSub: 'rgba(61,26,16,0.5)',
  textLabel: 'rgba(122,48,64,0.55)',
  btnPrimary: 'rgba(232,160,176,0.55)',
  btnDestructive: 'rgba(232,96,122,0.12)',
  btnDestructiveText: '#e8607a',
  btnIcon: 'rgba(200,120,140,0.15)',
  selectedBg: 'rgba(232,160,176,0.2)',
  selectedBorder: 'rgba(232,160,176,0.7)',
}

// ─────────────────────────────────────────────
// TIPOS LOCAIS
// ─────────────────────────────────────────────

interface SubTab {
  id: string
  label: string
  sections: Section[]
}
interface Section {
  label: string
  category: CharacterCategory
  genderFilter?: CharacterGender
  packFilter?: CharacterPack
}
interface Tab {
  id: string
  label: string
  subTabs: SubTab[]
  requiresBody?: boolean
  flatSections?: Section[]
}
interface Props {
  myUid: string
  config: CharacterConfig
  unlockedIds: Set<string>
  presets: CharacterPreset[]
  onSave: (config: CharacterConfig) => void
  onSavePreset: (name: string, config: CharacterConfig) => Promise<void>
  onDeletePreset: (id: string) => Promise<void>
  onClose: () => void
}

// ─────────────────────────────────────────────
// ESTRUTURA DE TABS (igual ao original)
// ─────────────────────────────────────────────

const TABS: Tab[] = [
  {
    id: 'corpo',
    label: 'corpo',
    requiresBody: false,
    subTabs: [],
    flatSections: [{ label: 'corpo', category: 'body' }],
  },
  {
    id: 'rosto',
    label: 'rosto',
    requiresBody: true,
    subTabs: [],
    flatSections: [
      { label: 'pupila', category: 'pupils' },
      { label: 'boca', category: 'mouth' },
      { label: 'cílios', category: 'eyelashes' },
      { label: 'sobrancelha', category: 'eyebrows' },
    ],
  },
  {
    id: 'cabelo',
    label: 'cabelo',
    requiresBody: true,
    subTabs: [],
    flatSections: [
      { label: 'trás', category: 'hair_back' },
      { label: 'frente', category: 'hair', genderFilter: 'neutral' },
      { label: 'franja', category: 'bangs', genderFilter: 'neutral' },
      { label: 'enfeite', category: 'hair_bonus' },
      { label: 'franja extra', category: 'bangs', genderFilter: 'masc' },
      { label: 'frente extra', category: 'hair', genderFilter: 'masc' },
    ],
  },
  {
    id: 'roupas',
    label: 'roupas',
    requiresBody: true,
    subTabs: [
      {
        id: 'padrao',
        label: 'padrão',
        sections: [
          { label: 'parte de cima', category: 'top', packFilter: 'chibi-basics' },
          { label: 'caguinha', category: 'bottom_over', packFilter: 'summer' },
          { label: 'vestido', category: 'dress', packFilter: 'chibi-basics' },
          { label: 'sapato', category: 'shoes', packFilter: 'chibi-basics' },
          { label: 'luva', category: 'gloves', packFilter: 'chibi-basics' },
        ],
      },
      {
        id: 'masculino',
        label: 'masculino',
        sections: [
          { label: 'parte de cima', category: 'top', packFilter: 'masc-misc' },
          { label: 'parte de baixo', category: 'bottom', packFilter: 'masc-misc' },
          { label: 'sapato', category: 'shoes', packFilter: 'masc-misc' },
        ],
      },
      {
        id: 'casal',
        label: 'casal',
        sections: [
          { label: 'parte de cima', category: 'top', packFilter: 'power-couples-1' },
          { label: 'parte de baixo', category: 'bottom', packFilter: 'power-couples-1' },
          { label: 'vestido', category: 'dress', packFilter: 'power-couples-1' },
          { label: 'sapato', category: 'shoes', packFilter: 'power-couples-1' },
          { label: 'luva', category: 'gloves', packFilter: 'power-couples-1' },
          { label: 'parte de cima (casal 2)', category: 'top', packFilter: 'power-couples-2' },
          { label: 'parte de baixo (casal 2)', category: 'bottom', packFilter: 'power-couples-2' },
          { label: 'saia (costas)', category: 'saia_costas', packFilter: 'power-couples-2' },
          { label: 'saia (topo)', category: 'saia_top', packFilter: 'power-couples-2' },
          { label: 'sapato (casal 2)', category: 'shoes', packFilter: 'power-couples-2' },
        ],
      },
      {
        id: 'praia',
        label: 'praia',
        sections: [
          { label: 'parte de cima', category: 'top', packFilter: 'summer' },
          { label: 'parte de baixo', category: 'bottom', packFilter: 'summer' },
          { label: 'caguinha', category: 'bottom_over', packFilter: 'summer' },
          { label: 'maiô inteiro', category: 'dress', packFilter: 'summer' },
          { label: 'sandália', category: 'shoes', packFilter: 'summer' },
        ],
      },
    ],
  },
  {
    id: 'extras',
    label: 'extras',
    requiresBody: true,
    subTabs: [
      { id: 'padrao-extras', label: 'padrão', sections: [{ label: 'barba', category: 'beard' }] },
      {
        id: 'casal-extras',
        label: 'casal',
        sections: [
          { label: 'jaqueta', category: 'jaqueta' },
          { label: 'acessório (casal 1)', category: 'accessory', packFilter: 'power-couples-1' },
          { label: 'acessório (casal 2)', category: 'accessory', packFilter: 'power-couples-2' },
          { label: 'tatuagem', category: 'tattoo', packFilter: 'power-couples-2' },
        ],
      },
      {
        id: 'praia-extras',
        label: 'praia',
        sections: [
          { label: 'acessório praia', category: 'accessory_cima', packFilter: 'summer' },
          { label: 'acessório topo', category: 'accessory_topo', packFilter: 'summer' },
          { label: 'bronzeado', category: 'tattoo', packFilter: 'summer' },
        ],
      },
    ],
  },
]

const COLOR_VARIANTS = FIRST_TIME_COLOR_VARIANTS

function resolveSrc(piece: CharacterPiece, variant: string): string {
  if (!variant || !piece.hasColor || !piece.srcColor) return assetUrl(piece.src)
  return assetUrl(piece.srcColor.replace(/(\d+)(\.png)$/, `$1${variant}$2`))
}
function sectionKey(s: Section): string {
  return [s.category, s.genderFilter, s.packFilter].filter(Boolean).join('|')
}

// ─────────────────────────────────────────────
// PRESETS
// ─────────────────────────────────────────────

const MAX_FREE_PRESETS = 6

function PresetsPanel({
  presets,
  currentConfig,
  currentColorVariants,
  onApply,
  onSavePreset,
  onDeletePreset,
}: {
  presets: CharacterPreset[]
  currentConfig: CharacterConfig
  currentColorVariants: Record<string, string>
  onApply: (config: CharacterConfig) => void
  onSavePreset: (name: string, config: CharacterConfig) => Promise<void>
  onDeletePreset: (id: string) => Promise<void>
}) {
  const [savingNew, setSavingNew] = useState(false)
  const [newName, setNewName] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null)

  const handleSave = async () => {
    if (saving) return
    const trimmed = newName.trim() || 'preset'

    const currentSnapshot = JSON.stringify({
      ...currentConfig,
      colorVariants: currentColorVariants,
    })

    const duplicateName = presets.find((p) => p.name.toLowerCase() === trimmed.toLowerCase())
    const duplicateVisual = presets.find(
      (p) =>
        JSON.stringify({ ...p.config, colorVariants: p.config.colorVariants ?? {} }) ===
        currentSnapshot
    )

    if (duplicateName) {
      setDuplicateWarning(`nome "${duplicateName.name}" já está em uso`)
      setTimeout(() => setDuplicateWarning(null), 2500)
      return
    }

    if (duplicateVisual) {
      setDuplicateWarning(`esse visual já está salvo como "${duplicateVisual.name}"`)
      setTimeout(() => setDuplicateWarning(null), 2500)
      return
    }

    setSaving(true)
    await onSavePreset(trimmed, { ...currentConfig, colorVariants: currentColorVariants })
    setNewName('')
    setSavingNew(false)
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    await onDeletePreset(id)
    setDeleteConfirm(null)
  }

  const canAdd = presets.length < MAX_FREE_PRESETS

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '12px 12px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span
          style={{
            fontSize: 9,
            fontWeight: 800,
            color: T.textLabel,
            fontFamily: 'Baloo 2, sans-serif',
            textTransform: 'uppercase',
            letterSpacing: '0.8px',
          }}
        >
          presets ({presets.length}/{MAX_FREE_PRESETS})
        </span>
        {canAdd && (
          <button
            onClick={() => setSavingNew(true)}
            title="salvar preset atual"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '3px 10px',
              borderRadius: 8,
              border: `1.5px solid ${T.border}`,
              background: T.card,
              color: T.text,
              fontSize: 11,
              fontFamily: 'Baloo 2, sans-serif',
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            <Plus size={11} strokeWidth={2.5} /> salvar atual
          </button>
        )}
      </div>

      {/* Campo de nome novo preset */}
      {savingNew && (
        <div style={{ display: 'flex', gap: 4 }}>
          <input
            autoFocus
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave()
            }}
            placeholder="nome do preset..."
            maxLength={20}
            style={{
              flex: 1,
              padding: '4px 8px',
              borderRadius: 8,
              border: `1.5px solid ${T.border}`,
              background: T.card,
              fontSize: 11,
              fontFamily: 'Baloo 2, sans-serif',
              color: T.text,
              outline: 'none',
            }}
          />
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: '4px 10px',
              borderRadius: 8,
              border: 'none',
              background: T.btnPrimary,
              color: T.text,
              fontSize: 11,
              fontWeight: 800,
              fontFamily: 'Baloo 2, sans-serif',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Check size={12} strokeWidth={2.5} />
          </button>
          <button
            onClick={() => {
              setSavingNew(false)
              setNewName('')
            }}
            style={{
              padding: '4px 8px',
              borderRadius: 8,
              border: `1.5px solid ${T.border}`,
              background: 'transparent',
              color: T.textSub,
              fontSize: 11,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <X size={12} strokeWidth={2.5} />
          </button>
        </div>
      )}

      {duplicateWarning && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '5px 10px',
            borderRadius: 8,
            background: 'rgba(232,160,176,0.15)',
            border: `1.5px solid ${T.border}`,
            fontSize: 11,
            fontFamily: 'Baloo 2, sans-serif',
            color: T.text,
          }}
        >
          <AlertCircle size={12} color="rgba(200,120,140,0.7)" style={{ flexShrink: 0 }} />
          {duplicateWarning}
        </div>
      )}

      {/* Grade 2x2 com scroll */}
      <div
        className="char-scroll"
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 6,
          maxHeight: 180,
          overflowY: 'auto',
          paddingRight: 4,
          paddingBottom: 4,
        }}
      >
        {presets.length === 0 && (
          <div
            style={{
              gridColumn: '1 / -1',
              textAlign: 'center',
              fontSize: 11,
              color: T.textSub,
              fontFamily: 'Baloo 2, sans-serif',
              padding: '12px 0',
            }}
          >
            nenhum preset salvo ainda
          </div>
        )}
        {presets.map((preset) => (
          <div
            key={preset.id}
            style={{
              position: 'relative',
              borderRadius: 10,
              border: `1.5px solid ${T.border}`,
              background: T.card,
              overflow: 'hidden',
              cursor: 'pointer',
            }}
          >
            <div
              onClick={() => onApply(preset.config)}
              style={{
                padding: 4,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 3,
              }}
            >
              <CharacterPreview
                config={preset.config}
                colorVariants={preset.config.colorVariants ?? {}}
                size={80}
              />
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: T.text,
                  fontFamily: 'Baloo 2, sans-serif',
                  textAlign: 'center',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  width: '100%',
                  paddingInline: 2,
                }}
              >
                {preset.name}
              </span>
            </div>

            {deleteConfirm === preset.id ? (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'rgba(253,242,246,0.97)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 4,
                  borderRadius: 10,
                }}
              >
                <span style={{ fontSize: 10, color: T.text, fontFamily: 'Baloo 2, sans-serif' }}>
                  apagar?
                </span>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button
                    onClick={() => handleDelete(preset.id)}
                    style={{
                      padding: '2px 8px',
                      borderRadius: 6,
                      border: 'none',
                      background: T.btnDestructive,
                      color: T.btnDestructiveText,
                      fontSize: 10,
                      fontWeight: 800,
                      cursor: 'pointer',
                      fontFamily: 'Baloo 2, sans-serif',
                    }}
                  >
                    sim
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    style={{
                      padding: '2px 8px',
                      borderRadius: 6,
                      border: `1.5px solid ${T.border}`,
                      background: 'transparent',
                      color: T.textSub,
                      fontSize: 10,
                      cursor: 'pointer',
                      fontFamily: 'Baloo 2, sans-serif',
                    }}
                  >
                    não
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setDeleteConfirm(preset.id)}
                style={{
                  position: 'absolute',
                  top: 3,
                  right: 3,
                  width: 18,
                  height: 18,
                  borderRadius: 5,
                  border: 'none',
                  background: T.btnIcon,
                  color: T.textSub,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0,
                }}
              >
                <X size={10} strokeWidth={2.5} color="rgba(122,48,64,0.6)" />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Separador dashed */}
      <div style={{ borderTop: T.borderDashed, marginTop: 2 }} />
    </div>
  )
}

// ─────────────────────────────────────────────
// PREVIEW
// ─────────────────────────────────────────────

function CharacterPreview({
  config,
  colorVariants,
  size = 222,
}: {
  config: CharacterConfig
  colorVariants: Record<string, string>
  size?: number
}) {
  const layers: { piece: CharacterPiece; src: string }[] = []
  for (const cat of LAYER_ORDER) {
    const multi = isMultiSlot(cat as CharacterCategory)
    const variant = colorVariants[cat] ?? ''
    if (multi) {
      const ids = (config[cat as keyof CharacterConfig] as string[]) ?? []
      for (const id of ids) {
        const p = ALL_PIECES.find((x) => x.id === id)
        if (p) layers.push({ piece: p, src: resolveSrc(p, variant) })
      }
    } else {
      const id = config[cat as keyof CharacterConfig] as string | null
      if (id) {
        const p = ALL_PIECES.find((x) => x.id === id)
        if (p) layers.push({ piece: p, src: resolveSrc(p, variant) })
      }
    }
  }
  const height = Math.round(size * (350 / 222))
  return (
    <div style={{ position: 'relative', width: size, height }}>
      {layers.length === 0 && (
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
            padding: '0 16px',
          }}
        >
          selecione um corpo para começar
        </div>
      )}
      {layers.map(({ piece, src }) => (
        <img
          key={piece.id}
          src={src}
          alt={piece.label}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            imageRendering: 'pixelated',
          }}
        />
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────
// MINI GRADE
// ─────────────────────────────────────────────

function MiniGrid({
  section,
  config,
  colorVariants,
  unlockedIds,
  onSelect,
  onColorChange,
}: {
  section: Section
  config: CharacterConfig
  colorVariants: Record<string, string>
  unlockedIds: Set<string>
  onSelect: (piece: CharacterPiece, category: CharacterCategory) => void
  onColorChange: (category: CharacterCategory, variant: string) => void
}) {
  const { category, genderFilter, packFilter } = section
  const pieces = getPiecesByCategory(category).filter((p) => {
    if (genderFilter && p.gender !== genderFilter) return false
    if (packFilter && p.pack !== packFilter) return false
    if (!unlockedIds.has(p.id)) return false
    return true
  })
  if (pieces.length === 0) return null

  const multi = isMultiSlot(category)
  const currentVariant = colorVariants[category] ?? 'b'
  const selectedIds: string[] = multi
    ? ((config[category as keyof CharacterConfig] as string[]) ?? [])
    : (() => {
        const v = config[category as keyof CharacterConfig] as string | null
        return v ? [v] : []
      })()

  const isSelected = (id: string) => selectedIds.includes(id)
  const hasSomeColor = pieces.some((p) => p.hasColor)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {hasSomeColor && (
        <div
          style={{
            display: 'flex',
            gap: 4,
            flexWrap: 'wrap',
            padding: '5px 10px',
            background: T.card,
            borderRadius: 10,
            border: T.cardBorder,
          }}
        >
          {COLOR_VARIANTS.map((v) => (
            <button
              key={v}
              onClick={() => onColorChange(category, v)}
              style={{
                padding: '2px 10px',
                borderRadius: 8,
                border:
                  currentVariant === v
                    ? `2px solid rgba(232,160,176,0.7)`
                    : '2px solid transparent',
                background: currentVariant === v ? T.selectedBg : 'rgba(232,160,176,0.12)',
                color: T.text,
                fontSize: 11,
                fontFamily: 'Baloo 2, sans-serif',
                cursor: 'pointer',
                transition: 'all 0.15s',
                fontWeight: currentVariant === v ? 800 : 600,
              }}
            >
              {COLOR_VARIANT_LABELS[v]}
            </button>
          ))}
        </div>
      )}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))',
          gap: 8,
          alignContent: 'start',
        }}
      >
        {!multi && category !== 'body' && (
          <button
            onClick={() => onSelect({ id: '__none__', category } as CharacterPiece, category)}
            style={{
              width: '100%',
              aspectRatio: '3/4',
              borderRadius: 12,
              border:
                selectedIds.length === 0
                  ? `2px solid rgba(232,160,176,0.7)`
                  : `1.5px solid ${T.border}`,
              background: selectedIds.length === 0 ? T.selectedBg : T.card,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.15s',
              color: T.textSub,
            }}
          >
            <Trash2 size={18} strokeWidth={1.8} />
          </button>
        )}
        {pieces.map((p) => {
          const selected = isSelected(p.id)
          const src = resolveSrc(p, currentVariant)
          return (
            <button
              key={p.id}
              onClick={() => onSelect(p, category)}
              title={`${p.label}${p.cost ? ` — ${p.cost} moedas` : ''}`}
              style={{
                width: '100%',
                aspectRatio: '3/4',
                borderRadius: 12,
                border: selected ? `2px solid rgba(232,160,176,0.7)` : `1.5px solid ${T.border}`,
                background: selected ? T.selectedBg : T.card,
                padding: 3,
                cursor: 'pointer',
                transition: 'all 0.15s',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <img
                src={src}
                alt={p.label}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  imageRendering: 'pixelated',
                }}
              />
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// PAINEL DE SEÇÕES
// ─────────────────────────────────────────────

function SectionsPanel({
  sections,
  config,
  colorVariants,
  unlockedIds,
  onSelect,
  onColorChange,
}: {
  sections: Section[]
  config: CharacterConfig
  colorVariants: Record<string, string>
  unlockedIds: Set<string>
  onSelect: (piece: CharacterPiece, category: CharacterCategory) => void
  onColorChange: (category: CharacterCategory, variant: string) => void
}) {
  return (
    <div
      className="char-scroll"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
        overflowY: 'auto',
        height: '100%',
        paddingRight: 8,
      }}
    >
      {sections.map((section) => {
        const key = sectionKey(section)
        const pieces = getPiecesByCategory(section.category).filter((p) => {
          if (section.genderFilter && p.gender !== section.genderFilter) return false
          if (section.packFilter && p.pack !== section.packFilter) return false
          return true
        })
        if (pieces.length === 0) return null
        return (
          <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 800,
                  color: T.textLabel,
                  fontFamily: 'Baloo 2, sans-serif',
                  textTransform: 'uppercase',
                  letterSpacing: '0.8px',
                  whiteSpace: 'nowrap',
                }}
              >
                {section.label}
              </span>
              <div style={{ flex: 1, borderTop: T.borderDashed }} />
            </div>
            <MiniGrid
              section={section}
              config={config}
              colorVariants={colorVariants}
              unlockedIds={unlockedIds}
              onSelect={onSelect}
              onColorChange={onColorChange}
            />
          </div>
        )
      })}
    </div>
  )
}

// ─────────────────────────────────────────────
// MODAL PRINCIPAL
// ─────────────────────────────────────────────

const MAX_HISTORY = 40

interface HistoryEntry {
  config: CharacterConfig
  colorVariants: Record<string, string>
}

export default function CharacterModal({
  config: initialConfig,
  unlockedIds,
  presets,
  onSave,
  onSavePreset,
  onDeletePreset,
  onClose,
}: Props) {
  const [config, setConfig] = useState<CharacterConfig>(initialConfig ?? DEFAULT_CHARACTER_CONFIG)
  const [colorVariants, setColorVariants] = useState<Record<string, string>>(() => {
    const defaults: Record<string, string> = {}
    const colorCats = [
      'hair',
      'hair_back',
      'hair_bonus',
      'bangs',
      'top',
      'bottom',
      'gloves',
      'shoes',
      'dress',
    ]
    for (const cat of colorCats) defaults[cat] = 'b'
    return { ...defaults, ...(initialConfig?.colorVariants ?? {}) }
  })

  const historyRef = useRef<HistoryEntry[]>([
    { config: initialConfig ?? DEFAULT_CHARACTER_CONFIG, colorVariants: {} },
  ])
  const historyIndexRef = useRef(0)
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)

  const [clearState, setClearState] = useState<'idle' | 'confirm'>('idle')
  const [savedFeedback, setSavedFeedback] = useState(false)

  const [activeTab, setActiveTab] = useState(TABS[0].id)
  const [activeSubTab, setActiveSubTab] = useState<string>('')
  const [bodyError, setBodyError] = useState(false)

  const currentTab = TABS.find((t) => t.id === activeTab) ?? TABS[0]
  const hasBody = !!config.body
  const effectiveSubTab =
    currentTab.subTabs.length > 0 ? activeSubTab || currentTab.subTabs[0].id : ''
  const currentSubTab = currentTab.subTabs.find((s) => s.id === effectiveSubTab)
  const activeSections: Section[] =
    currentTab.flatSections ?? currentSubTab?.sections ?? currentTab.subTabs[0]?.sections ?? []

  const pushHistory = useCallback(
    (newConfig: CharacterConfig, newColorVariants: Record<string, string>) => {
      const history = historyRef.current
      const idx = historyIndexRef.current
      history.splice(idx + 1)
      history.push({ config: newConfig, colorVariants: newColorVariants })
      if (history.length > MAX_HISTORY) history.shift()
      historyIndexRef.current = history.length - 1
      setCanUndo(historyIndexRef.current > 0)
      setCanRedo(false)
    },
    []
  )

  const handleUndo = useCallback(() => {
    const idx = historyIndexRef.current
    if (idx <= 0) return
    historyIndexRef.current = idx - 1
    const entry = historyRef.current[historyIndexRef.current]
    setConfig(entry.config)
    setColorVariants(entry.colorVariants)
    setCanUndo(historyIndexRef.current > 0)
    setCanRedo(true)
  }, [])

  const handleRedo = useCallback(() => {
    const history = historyRef.current
    const idx = historyIndexRef.current
    if (idx >= history.length - 1) return
    historyIndexRef.current = idx + 1
    const entry = history[historyIndexRef.current]
    setConfig(entry.config)
    setColorVariants(entry.colorVariants)
    setCanUndo(true)
    setCanRedo(historyIndexRef.current < history.length - 1)
  }, [])

  const handleTabChange = (tabId: string) => {
    const tab = TABS.find((t) => t.id === tabId)
    if (!tab) return
    if (tab.requiresBody && !hasBody) {
      setBodyError(true)
      setTimeout(() => setBodyError(false), 3000)
      return
    }
    setBodyError(false)
    setActiveTab(tabId)
    setActiveSubTab(tab.subTabs[0]?.id ?? '')
  }

  const handleSelect = useCallback(
    (piece: CharacterPiece, category: CharacterCategory) => {
      const prev = configRef.current
      const next = { ...prev }

      if (piece.id === '__none__') {
        ;(next as Record<string, unknown>)[category] = isMultiSlot(category) ? [] : null
      } else if (isMultiSlot(category)) {
        const arr = [...((prev[category as keyof CharacterConfig] as string[]) ?? [])]
        const idx = arr.indexOf(piece.id)
        if (idx >= 0) arr.splice(idx, 1)
        else arr.push(piece.id)
        ;(next as Record<string, unknown>)[category] = arr
      } else {
        const current = prev[category as keyof CharacterConfig] as string | null
        const newVal = category === 'body' ? piece.id : current === piece.id ? null : piece.id
        ;(next as Record<string, unknown>)[category] = newVal
        if (category === 'dress' && newVal !== null) {
          next.top = null
          next.bottom = null
        }
        if ((category === 'top' || category === 'bottom') && newVal !== null) next.dress = null
      }

      setConfig(next)
      pushHistory(next, colorVariantsRef.current)
    },
    [pushHistory]
  )

  const colorVariantsRef = useRef(colorVariants)
  colorVariantsRef.current = colorVariants

  const handleColorChange = useCallback(
    (category: CharacterCategory, variant: string) => {
      setColorVariants((prev) => {
        const next = { ...prev, [category]: variant }
        pushHistory(configRef.current, next)
        return next
      })
    },
    [pushHistory]
  )

  const configRef = useRef(config)
  configRef.current = config

  const handleApplyPreset = useCallback(
    (presetConfig: CharacterConfig) => {
      const next = { ...presetConfig }
      const nextVariants = presetConfig.colorVariants ?? {}
      setConfig(next)
      setColorVariants(nextVariants)
      pushHistory(next, nextVariants)
    },
    [pushHistory]
  )

  const handleClearAll = () => {
    const bodyId = config.body
    const cleared: CharacterConfig = { ...DEFAULT_CHARACTER_CONFIG, body: bodyId }
    setConfig(cleared)
    pushHistory(cleared, colorVariants)
    setClearState('idle')
  }

  const handleSave = () => {
    onSave({ ...config, colorVariants })
    setSavedFeedback(true)
    setTimeout(() => setSavedFeedback(false), 2000)
  }

  // Estilo dos botões de ação (desfazer/refazer)
  const actionBtnStyle = (enabled: boolean): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    padding: '6px 12px',
    borderRadius: 10,
    border: `1.5px solid ${enabled ? T.border : 'rgba(232,160,176,0.2)'}`,
    background: enabled ? T.card : 'transparent',
    color: enabled ? T.text : T.textSub,
    fontSize: 11,
    fontFamily: 'Baloo 2, sans-serif',
    fontWeight: 700,
    cursor: enabled ? 'pointer' : 'not-allowed',
    transition: 'all 0.15s',
    opacity: enabled ? 1 : 0.4,
    flex: 1,
  })

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        top: 32,
        zIndex: 200,
        background:
          'linear-gradient(160deg, rgba(253,246,240,0.97) 0%, rgba(252,232,238,0.97) 100%)',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'Baloo 2, sans-serif',
      }}
    >
      {/* ── HEADER ────────────────────────────────────── */}
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
            border: `1.5px solid ${T.border}`,
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

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Sparkles size={15} color="rgba(200,120,140,0.7)" strokeWidth={2} />
          <span style={{ fontSize: 15, fontWeight: 800, color: T.text }}>meu guarda-roupa</span>
        </div>

        <button
          onClick={handleSave}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 18px',
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

      {/* ── BODY ────────────────────────────────────────── */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* ── COLUNA ESQUERDA ──────────────────────────── */}
        <div
          style={{
            width: 280,
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            borderRight: T.borderDashed,
            background: 'rgba(253,242,246,0.5)',
            overflow: 'hidden',
          }}
        >
          {/* Presets */}
          <PresetsPanel
            presets={presets}
            currentConfig={config}
            currentColorVariants={colorVariants}
            onApply={handleApplyPreset}
            onSavePreset={onSavePreset}
            onDeletePreset={onDeletePreset}
          />

          {/* Preview */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px 16px 8px',
              minHeight: 0,
            }}
          >
            <div
              style={{
                background: 'rgba(200,168,180,0.25)',
                borderRadius: 20,
                padding: 8,
                boxShadow: '0 2px 16px rgba(200,120,140,0.10)',
                border: `1.5px solid ${T.border}`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 6,
                width: '100%',
              }}
            >
              <CharacterPreview config={config} colorVariants={colorVariants} size={250} />
            </div>
          </div>

          {/* Controles fixos abaixo */}
          <div
            style={{
              padding: '8px 12px 14px',
              display: 'flex',
              flexDirection: 'column',
              gap: 7,
              flexShrink: 0,
            }}
          >
            {/* Undo / Redo */}
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                onClick={handleUndo}
                disabled={!canUndo}
                title="desfazer"
                style={actionBtnStyle(canUndo)}
              >
                <Undo2 size={12} strokeWidth={2} /> desfazer
              </button>
              <button
                onClick={handleRedo}
                disabled={!canRedo}
                title="refazer"
                style={actionBtnStyle(canRedo)}
              >
                <Redo2 size={12} strokeWidth={2} /> refazer
              </button>
            </div>

            {/* Limpar tudo */}
            <div style={{ height: 58, position: 'relative' }}>
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  opacity: clearState === 'idle' ? 1 : 0,
                  pointerEvents: clearState === 'idle' ? 'auto' : 'none',
                  transition: 'opacity 0.15s',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <button
                  onClick={() => setClearState('confirm')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    padding: '7px 12px',
                    borderRadius: 10,
                    border: `1.5px solid rgba(232,96,122,0.25)`,
                    background: 'transparent',
                    color: T.btnDestructiveText,
                    fontSize: 11,
                    fontFamily: 'Baloo 2, sans-serif',
                    fontWeight: 800,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    width: '100%',
                  }}
                >
                  <Trash2 size={12} strokeWidth={2} /> limpar tudo
                </button>
              </div>

              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  opacity: clearState === 'confirm' ? 1 : 0,
                  pointerEvents: clearState === 'confirm' ? 'auto' : 'none',
                  transition: 'opacity 0.15s',
                  background: 'rgba(253,242,246,0.7)',
                  border: `1.5px solid ${T.border}`,
                  borderRadius: 10,
                  padding: '8px 10px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                }}
              >
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: T.textSub,
                    fontFamily: 'Baloo 2, sans-serif',
                    textAlign: 'center',
                  }}
                >
                  remover tudo?
                </span>
                <div style={{ display: 'flex', gap: 6, width: '100%' }}>
                  <button
                    onClick={handleClearAll}
                    style={{
                      flex: 1,
                      padding: '4px 0',
                      borderRadius: 8,
                      border: 'none',
                      background: T.btnDestructive,
                      color: T.btnDestructiveText,
                      fontSize: 11,
                      fontWeight: 800,
                      fontFamily: 'Baloo 2, sans-serif',
                      cursor: 'pointer',
                    }}
                  >
                    sim
                  </button>
                  <button
                    onClick={() => setClearState('idle')}
                    style={{
                      flex: 1,
                      padding: '4px 0',
                      borderRadius: 8,
                      border: `1.5px solid ${T.border}`,
                      background: 'transparent',
                      color: T.textSub,
                      fontSize: 11,
                      fontWeight: 700,
                      fontFamily: 'Baloo 2, sans-serif',
                      cursor: 'pointer',
                    }}
                  >
                    não
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── PAINEL DIREITO ────────────────────────────── */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            background: 'rgba(253,246,240,0.4)',
            minHeight: '100%',
          }}
        >
          {/* Tabs principais */}
          <div
            style={{
              display: 'flex',
              gap: 6,
              padding: '10px 16px',
              borderBottom: T.borderDashed,
              background: 'rgba(253,242,246,0.5)',
              flexShrink: 0,
              flexWrap: 'wrap',
            }}
          >
            {TABS.map((tab) => {
              const locked = tab.requiresBody && !hasBody
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  title={locked ? 'escolha um corpo primeiro' : undefined}
                  style={{
                    padding: '4px 16px',
                    borderRadius: 20,
                    border: isActive
                      ? `1.5px solid rgba(232,160,176,0.7)`
                      : `1.5px solid ${T.border}`,
                    background: isActive ? T.btnPrimary : T.btnIcon,
                    color: locked ? T.textSub : T.text,
                    fontSize: 12,
                    fontWeight: isActive ? 800 : 600,
                    fontFamily: 'Baloo 2, sans-serif',
                    cursor: locked ? 'not-allowed' : 'pointer',
                    transition: 'all 0.15s',
                    opacity: locked ? 0.45 : 1,
                  }}
                >
                  {tab.label}
                </button>
              )
            })}
          </div>

          {/* Aviso body */}
          {bodyError && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                margin: '8px 16px 0',
                padding: '8px 14px',
                background: 'rgba(232,160,176,0.15)',
                border: `1.5px solid ${T.border}`,
                borderRadius: 10,
                color: T.text,
                fontSize: 12,
                fontFamily: 'Baloo 2, sans-serif',
                flexShrink: 0,
              }}
            >
              <AlertCircle size={14} color="rgba(200,120,140,0.7)" style={{ flexShrink: 0 }} />
              escolha um corpo primeiro! sem corpo as outras peças não aparecem corretamente.
            </div>
          )}

          {/* Sub-tabs */}
          {currentTab.subTabs.length > 0 && (
            <div
              style={{
                display: 'flex',
                gap: 6,
                padding: '8px 16px',
                borderBottom: `1px solid rgba(232,160,176,0.25)`,
                background: 'rgba(253,242,246,0.3)',
                flexShrink: 0,
                flexWrap: 'wrap',
              }}
            >
              {currentTab.subTabs.map((sub) => {
                const active = effectiveSubTab === sub.id
                return (
                  <button
                    key={sub.id}
                    onClick={() => setActiveSubTab(sub.id)}
                    style={{
                      padding: '2px 14px',
                      borderRadius: 20,
                      border: active
                        ? `1.5px solid rgba(232,160,176,0.6)`
                        : `1.5px solid ${T.border}`,
                      background: active ? T.selectedBg : 'transparent',
                      color: T.text,
                      fontSize: 11,
                      fontFamily: 'Baloo 2, sans-serif',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      fontWeight: active ? 800 : 600,
                    }}
                  >
                    {sub.label}
                  </button>
                )
              })}
            </div>
          )}

          {/* Seções com scroll */}
          <div
            className="char-scroll"
            style={{
              flex: 1,
              minHeight: 0,
              overflowY: 'auto',
              padding: '14px 16px',
              alignSelf: 'stretch',
            }}
          >
            <SectionsPanel
              sections={activeSections}
              config={config}
              colorVariants={colorVariants}
              unlockedIds={unlockedIds}
              onSelect={handleSelect}
              onColorChange={handleColorChange}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
