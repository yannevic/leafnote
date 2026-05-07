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

// ── Scrollbar custom global (injeta uma vez) ──────────────────
const SCROLLBAR_CSS = `
  .char-scroll::-webkit-scrollbar { width: 5px; height: 5px; }
  .char-scroll::-webkit-scrollbar-track { background: transparent; }
  .char-scroll::-webkit-scrollbar-thumb { background: var(--color-wood-300); border-radius: 99px; }
  .char-scroll::-webkit-scrollbar-thumb:hover { background: var(--color-wood-400); }
  .char-scroll { scrollbar-width: thin; scrollbar-color: var(--color-wood-300) transparent; }
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
    label: 'Corpo',
    requiresBody: false,
    subTabs: [],
    flatSections: [{ label: 'Corpo', category: 'body' }],
  },
  {
    id: 'rosto',
    label: 'Rosto',
    requiresBody: true,
    subTabs: [],
    flatSections: [
      { label: 'Pupila', category: 'pupils' },
      { label: 'Boca', category: 'mouth' },
      { label: 'Cílios', category: 'eyelashes' },
      { label: 'Sobrancelha', category: 'eyebrows' },
    ],
  },
  {
    id: 'cabelo',
    label: 'Cabelo',
    requiresBody: true,
    subTabs: [],
    flatSections: [
      { label: 'Trás', category: 'hair_back' },
      { label: 'Frente', category: 'hair', genderFilter: 'neutral' },
      { label: 'Franja', category: 'bangs', genderFilter: 'neutral' },
      { label: 'Enfeite', category: 'hair_bonus' },
      { label: 'Franja extra', category: 'bangs', genderFilter: 'masc' },
      { label: 'Frente extra', category: 'hair', genderFilter: 'masc' },
    ],
  },
  {
    id: 'roupas',
    label: 'Roupas',
    requiresBody: true,
    subTabs: [
      {
        id: 'padrao',
        label: 'Padrão',
        sections: [
          { label: 'Parte de cima', category: 'top', packFilter: 'chibi-basics' },
          { label: 'Parte de baixo', category: 'bottom', packFilter: 'chibi-basics' },
          { label: 'Vestido', category: 'dress', packFilter: 'chibi-basics' },
          { label: 'Sapato', category: 'shoes', packFilter: 'chibi-basics' },
          { label: 'Luva', category: 'gloves', packFilter: 'chibi-basics' },
        ],
      },
      {
        id: 'masculino',
        label: 'Masculino',
        sections: [
          { label: 'Parte de cima', category: 'top', packFilter: 'masc-misc' },
          { label: 'Parte de baixo', category: 'bottom', packFilter: 'masc-misc' },
          { label: 'Sapato', category: 'shoes', packFilter: 'masc-misc' },
        ],
      },
      {
        id: 'casal',
        label: 'Casal',
        sections: [
          { label: 'Parte de cima', category: 'top', packFilter: 'power-couples-1' },
          { label: 'Parte de baixo', category: 'bottom', packFilter: 'power-couples-1' },
          { label: 'Vestido', category: 'dress', packFilter: 'power-couples-1' },
          { label: 'Sapato', category: 'shoes', packFilter: 'power-couples-1' },
          { label: 'Luva', category: 'gloves', packFilter: 'power-couples-1' },
          { label: 'Parte de cima (casal 2)', category: 'top', packFilter: 'power-couples-2' },
          { label: 'Parte de baixo (casal 2)', category: 'bottom', packFilter: 'power-couples-2' },
          { label: 'Saia (costas)', category: 'saia_costas', packFilter: 'power-couples-2' },
          { label: 'Saia (topo)', category: 'saia_top', packFilter: 'power-couples-2' },
          { label: 'Sapato (casal 2)', category: 'shoes', packFilter: 'power-couples-2' },
        ],
      },
      {
        id: 'praia',
        label: 'Praia',
        sections: [
          { label: 'Parte de cima', category: 'top', packFilter: 'summer' },
          { label: 'Parte de baixo', category: 'bottom', packFilter: 'summer' },
          { label: 'Maiô inteiro', category: 'dress', packFilter: 'summer' },
          { label: 'Sandália', category: 'shoes', packFilter: 'summer' },
        ],
      },
    ],
  },
  {
    id: 'extras',
    label: 'Extras',
    requiresBody: true,
    subTabs: [
      { id: 'padrao-extras', label: 'Padrão', sections: [{ label: 'Barba', category: 'beard' }] },
      {
        id: 'casal-extras',
        label: 'Casal',
        sections: [
          { label: 'Jaqueta', category: 'jaqueta' },
          { label: 'Acessório (casal 1)', category: 'accessory', packFilter: 'power-couples-1' },
          { label: 'Acessório (casal 2)', category: 'accessory', packFilter: 'power-couples-2' },
          { label: 'Tatuagem', category: 'tattoo', packFilter: 'power-couples-2' },
        ],
      },
      {
        id: 'praia-extras',
        label: 'Praia',
        sections: [
          { label: 'Acessório praia', category: 'accessory_cima', packFilter: 'summer' },
          { label: 'Acessório topo', category: 'accessory_topo', packFilter: 'summer' },
          { label: 'Bronzeado', category: 'tattoo', packFilter: 'summer' },
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
    const trimmed = newName.trim() || 'Preset'

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
      setDuplicateWarning(`Nome "${duplicateName.name}" já está em uso`)
      setTimeout(() => setDuplicateWarning(null), 2500)
      return
    }

    if (duplicateVisual) {
      setDuplicateWarning(`Esse visual já está salvo como "${duplicateVisual.name}"`)
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '10px 12px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: 'var(--color-leaf-700)',
            fontFamily: 'Baloo 2, sans-serif',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          Presets ({presets.length}/{MAX_FREE_PRESETS})
        </span>
        {canAdd && (
          <button
            onClick={() => setSavingNew(true)}
            title="Salvar preset atual"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 3,
              padding: '2px 8px',
              borderRadius: 8,
              border: '1.5px solid var(--color-wood-300)',
              background: 'var(--color-bark-100)',
              color: 'var(--color-leaf-600)',
              fontSize: 11,
              fontFamily: 'Baloo 2, sans-serif',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <Plus size={12} /> Salvar atual
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
            placeholder="Nome do preset..."
            maxLength={20}
            style={{
              flex: 1,
              padding: '4px 8px',
              borderRadius: 8,
              border: '1.5px solid var(--color-wood-300)',
              background: '#fff',
              fontSize: 12,
              fontFamily: 'Baloo 2, sans-serif',
              color: 'var(--color-soil-900)',
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
              background: 'var(--color-leaf-600)',
              color: '#fff',
              fontSize: 11,
              fontWeight: 700,
              fontFamily: 'Baloo 2, sans-serif',
              cursor: 'pointer',
            }}
          >
            <Check size={12} />
          </button>
          <button
            onClick={() => {
              setSavingNew(false)
              setNewName('')
            }}
            style={{
              padding: '4px 8px',
              borderRadius: 8,
              border: '1.5px solid var(--color-wood-300)',
              background: 'transparent',
              color: 'var(--color-leaf-600)',
              fontSize: 11,
              cursor: 'pointer',
            }}
          >
            <X size={12} />
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
            background: 'var(--color-petal-200)',
            border: '1.5px solid var(--color-petal-400)',
            fontSize: 11,
            fontFamily: 'Baloo 2, sans-serif',
            color: 'var(--color-soil-900)',
          }}
        >
          <AlertCircle size={12} color="var(--color-petal-400)" style={{ flexShrink: 0 }} />
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
              color: 'var(--color-leaf-400)',
              fontFamily: 'Baloo 2, sans-serif',
              padding: '12px 0',
            }}
          >
            Nenhum preset salvo ainda
          </div>
        )}
        {presets.map((preset) => (
          <div
            key={preset.id}
            style={{
              position: 'relative',
              borderRadius: 10,
              border: '1.5px solid var(--color-wood-300)',
              background: 'rgba(255,255,255,0.6)',
              overflow: 'hidden',
              cursor: 'pointer',
            }}
          >
            {/* Miniatura clicável */}
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
                  fontWeight: 600,
                  color: 'var(--color-leaf-800)',
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

            {/* Botão excluir */}
            {deleteConfirm === preset.id ? (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'rgba(245,213,220,0.97)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 4,
                  borderRadius: 10,
                }}
              >
                <span
                  style={{
                    fontSize: 10,
                    color: 'var(--color-soil-900)',
                    fontFamily: 'Baloo 2, sans-serif',
                  }}
                >
                  Excluir?
                </span>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button
                    onClick={() => handleDelete(preset.id)}
                    style={{
                      padding: '2px 8px',
                      borderRadius: 6,
                      border: 'none',
                      background: 'var(--color-petal-400)',
                      color: '#fff',
                      fontSize: 10,
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontFamily: 'Baloo 2, sans-serif',
                    }}
                  >
                    Sim
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    style={{
                      padding: '2px 8px',
                      borderRadius: 6,
                      border: '1px solid var(--color-wood-300)',
                      background: 'transparent',
                      color: 'var(--color-leaf-600)',
                      fontSize: 10,
                      cursor: 'pointer',
                      fontFamily: 'Baloo 2, sans-serif',
                    }}
                  >
                    Não
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
                  background: 'rgba(232,160,176,0.7)',
                  color: '#fff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0,
                }}
              >
                <X size={10} />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Divisor */}
      <div
        style={{ height: 1, background: 'var(--color-wood-300)', borderRadius: 1, marginTop: 2 }}
      />
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
            color: 'var(--color-leaf-400)',
            fontSize: 12,
            fontFamily: 'Baloo 2, sans-serif',
            textAlign: 'center',
            padding: '0 16px',
          }}
        >
          Selecione um corpo para começar
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
            background: 'rgba(255,255,255,0.5)',
            borderRadius: 10,
            border: '1px solid var(--color-wood-300)',
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
                    ? '2px solid var(--color-petal-400)'
                    : '2px solid transparent',
                background:
                  currentVariant === v ? 'var(--color-petal-200)' : 'var(--color-wood-300)',
                color: 'var(--color-soil-900)',
                fontSize: 11,
                fontFamily: 'Baloo 2, sans-serif',
                cursor: 'pointer',
                transition: 'all 0.15s',
                fontWeight: currentVariant === v ? 700 : 400,
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
                  ? '2px solid var(--color-petal-400)'
                  : '2px solid var(--color-wood-300)',
              background:
                selectedIds.length === 0 ? 'var(--color-petal-200)' : 'var(--color-bark-100)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.15s',
              color: 'var(--color-leaf-600)',
            }}
          >
            <Trash2 size={18} />
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
                border: selected
                  ? '2px solid var(--color-petal-400)'
                  : '2px solid var(--color-wood-300)',
                background: selected ? 'var(--color-petal-200)' : 'rgba(255,255,255,0.55)',
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
  unlockedIds, // ← adiciona aqui
  onSelect,
  onColorChange,
}: {
  sections: Section[]
  config: CharacterConfig
  colorVariants: Record<string, string>
  unlockedIds: Set<string> // ← adiciona aqui
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
                  fontSize: 12,
                  fontWeight: 700,
                  color: 'var(--color-leaf-700)',
                  fontFamily: 'Baloo 2, sans-serif',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  whiteSpace: 'nowrap',
                }}
              >
                {section.label}
              </span>
              <div
                style={{ flex: 1, height: 1, background: 'var(--color-wood-300)', borderRadius: 1 }}
              />
            </div>
            <MiniGrid
              section={section}
              config={config}
              colorVariants={colorVariants}
              unlockedIds={unlockedIds} // ← adiciona essa linha
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

  // ✅ FIX: altura fixa para o botão limpar — sem layout shift
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

  // ✅ FIX: pushHistory recebe os valores finais como parâmetro, sem depender de stale closures
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

  // ✅ FIX: handleSelect usa functional update para pegar config atualizado
  // e passa os valores corretos para pushHistory de forma síncrona
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

  // Ref para colorVariants — permite acessar valor atual dentro de setConfig sem stale closure
  const colorVariantsRef = useRef(colorVariants)
  colorVariantsRef.current = colorVariants

  const handleColorChange = useCallback(
    (category: CharacterCategory, variant: string) => {
      setColorVariants((prev) => {
        const next = { ...prev, [category]: variant }
        // configRef para mesma razão
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

  // ✅ FIX: Limpar tudo preserva o body
  const handleClearAll = () => {
    const bodyId = config.body // preserva o corpo atual
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

  const actionBtnStyle = (enabled: boolean): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    padding: '7px 12px',
    borderRadius: 10,
    border: `1.5px solid ${enabled ? 'var(--color-wood-400)' : 'var(--color-wood-200)'}`,
    background: enabled ? 'var(--color-bark-50)' : 'transparent',
    color: enabled ? 'var(--color-leaf-700)' : 'var(--color-leaf-300)',
    fontSize: 12,
    fontFamily: 'Baloo 2, sans-serif',
    fontWeight: 600,
    cursor: enabled ? 'pointer' : 'not-allowed',
    transition: 'all 0.15s',
    opacity: enabled ? 1 : 0.5,
    flex: 1,
  })

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
      {/* ── HEADER ─────────────────────────────────────── */}
      {/* ✅ FIX: height fixa + alignItems center garante centralização vertical */}
      <div
        style={{
          height: 56,
          minHeight: 56,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px',
          paddingTop: 8, // ← adiciona isso
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

        {/* ✅ FIX: ícone Sparkles — muito mais bonito e legível */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <Sparkles size={18} color="var(--color-petal-400)" />
          <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-leaf-800)' }}>
            Meu Guarda-Roupa
          </span>
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

      {/* ── BODY ────────────────────────────────────────── */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* ── COLUNA ESQUERDA ──────────────────────────── */}
        {/* ✅ FIX: largura 280, preview maior, borda menor */}
        <div
          style={{
            width: 280,
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            borderRight: '2px solid var(--color-wood-300)',
            background: 'var(--color-leaf-100)',
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
          {/* Preview — flex 1, centralizado */}
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
            {/* ✅ FIX: padding menor (8px), sem borda grossa, preview maior */}
            <div
              style={{
                background: '#c9c9c9',
                borderRadius: 20,
                padding: 8,
                boxShadow: '0 2px 16px rgba(74,122,74,0.10)',
                border: '1.5px solid var(--color-wood-200)',
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
                title="Desfazer"
                style={actionBtnStyle(canUndo)}
              >
                <Undo2 size={13} /> Desfazer
              </button>
              <button
                onClick={handleRedo}
                disabled={!canRedo}
                title="Refazer"
                style={actionBtnStyle(canRedo)}
              >
                <Redo2 size={13} /> Refazer
              </button>
            </div>

            {/* ✅ FIX: altura fixa no container do botão limpar — sem layout shift */}
            <div style={{ height: 58, position: 'relative' }}>
              {/* Estado idle */}
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
                    border: '1.5px solid var(--color-petal-300)',
                    background: 'transparent',
                    color: 'var(--color-petal-500)',
                    fontSize: 12,
                    fontFamily: 'Baloo 2, sans-serif',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    width: '100%',
                  }}
                >
                  <Trash2 size={13} /> Limpar tudo
                </button>
              </div>

              {/* Estado confirm — mesma altura, sem pulo */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  opacity: clearState === 'confirm' ? 1 : 0,
                  pointerEvents: clearState === 'confirm' ? 'auto' : 'none',
                  transition: 'opacity 0.15s',
                  background: 'var(--color-petal-100)',
                  border: '1.5px solid var(--color-petal-300)',
                  borderRadius: 10,
                  padding: '8px 10px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                }}
              >
                {/* ✅ FIX: texto sem bold, menor, cor suave */}
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 400,
                    color: 'var(--color-soil-700)',
                    fontFamily: 'Baloo 2, sans-serif',
                    textAlign: 'center',
                    lineHeight: 1.3,
                  }}
                >
                  Remover tudo?
                </span>
                <div style={{ display: 'flex', gap: 6, width: '100%' }}>
                  <button
                    onClick={handleClearAll}
                    style={{
                      flex: 1,
                      padding: '4px 0',
                      borderRadius: 8,
                      border: 'none',
                      background: 'var(--color-petal-400)',
                      color: '#fff',
                      fontSize: 11,
                      fontWeight: 700,
                      fontFamily: 'Baloo 2, sans-serif',
                      cursor: 'pointer',
                    }}
                  >
                    Sim
                  </button>
                  <button
                    onClick={() => setClearState('idle')}
                    style={{
                      flex: 1,
                      padding: '4px 0',
                      borderRadius: 8,
                      border: '1.5px solid var(--color-wood-300)',
                      background: 'transparent',
                      color: 'var(--color-leaf-600)',
                      fontSize: 11,
                      fontWeight: 600,
                      fontFamily: 'Baloo 2, sans-serif',
                      cursor: 'pointer',
                    }}
                  >
                    Não
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
            background: 'var(--color-leaf-100)',
            minHeight: '100%',
          }}
        >
          {/* Tabs principais */}
          <div
            style={{
              display: 'flex',
              gap: 4,
              padding: '10px 16px',
              borderBottom: '2px solid var(--color-wood-300)',
              background: 'var(--color-leaf-100)',
              flexShrink: 0,
            }}
          >
            {TABS.map((tab) => {
              const locked = tab.requiresBody && !hasBody
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  title={locked ? 'Escolha um corpo primeiro' : undefined}
                  style={{
                    padding: '5px 18px',
                    borderRadius: 20,
                    border: isActive
                      ? '2px solid var(--color-leaf-500)'
                      : '2px solid var(--color-wood-300)',
                    background: isActive ? 'var(--color-leaf-600)' : 'var(--color-bark-50)',
                    color: locked
                      ? 'var(--color-leaf-300)'
                      : isActive
                        ? '#fff'
                        : 'var(--color-leaf-700)',
                    fontSize: 13,
                    fontWeight: isActive ? 700 : 500,
                    fontFamily: 'Baloo 2, sans-serif',
                    cursor: locked ? 'not-allowed' : 'pointer',
                    transition: 'all 0.15s',
                    opacity: locked ? 0.5 : 1,
                    boxShadow: isActive ? '0 2px 8px rgba(74,122,74,0.18)' : 'none',
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
                background: 'var(--color-petal-200)',
                border: '1.5px solid var(--color-petal-400)',
                borderRadius: 10,
                color: 'var(--color-soil-900)',
                fontSize: 13,
                fontFamily: 'Baloo 2, sans-serif',
                flexShrink: 0,
              }}
            >
              <AlertCircle size={16} color="var(--color-petal-400)" style={{ flexShrink: 0 }} />
              Escolha um corpo primeiro! Sem corpo as outras peças não aparecem corretamente.
            </div>
          )}

          {/* Sub-tabs */}
          {currentTab.subTabs.length > 0 && (
            <div
              style={{
                display: 'flex',
                gap: 6,
                padding: '8px 16px',
                borderBottom: '1px solid var(--color-wood-300)',
                background: 'var(--color-leaf-100)',
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
                      padding: '3px 16px',
                      borderRadius: 20,
                      border: active
                        ? '2px solid var(--color-petal-400)'
                        : '2px solid var(--color-wood-300)',
                      background: active ? 'var(--color-petal-200)' : 'transparent',
                      color: active ? 'var(--color-soil-900)' : 'var(--color-leaf-600)',
                      fontSize: 12,
                      fontFamily: 'Baloo 2, sans-serif',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      fontWeight: active ? 700 : 400,
                    }}
                  >
                    {sub.label}
                  </button>
                )
              })}
            </div>
          )}

          {/* Seções com scroll customizado */}
          <div
            className="char-scroll"
            style={{
              flex: 1,
              minHeight: 0,
              overflowY: 'auto',
              padding: '12px 16px',
              background: 'var(--color-leaf-100)',
              alignSelf: 'stretch',
            }}
          >
            <SectionsPanel
              sections={activeSections}
              config={config}
              colorVariants={colorVariants}
              unlockedIds={unlockedIds} // ← adiciona essa linha
              onSelect={handleSelect}
              onColorChange={handleColorChange}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
