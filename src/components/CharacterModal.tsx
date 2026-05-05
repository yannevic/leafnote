// src/components/CharacterModal.tsx
import { useState, useCallback } from 'react'
import { X, Sparkles, Save, AlertCircle } from 'lucide-react'
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

function assetUrl(path: string): string {
  return `/character/${path}`
}

// ─────────────────────────────────────────────
// TIPOS LOCAIS
// ─────────────────────────────────────────────

interface SubTab {
  id: string
  label: string
  // cada seção dentro da sub-aba
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
  // tabs simples sem sub (rosto, cabelo) usam flatSections
  flatSections?: Section[]
}

interface Props {
  myUid: string
  config: CharacterConfig
  onSave: (config: CharacterConfig) => void
  onClose: () => void
}

// ─────────────────────────────────────────────
// ESTRUTURA DE TABS
// ─────────────────────────────────────────────

const TABS: Tab[] = [
  // ── CORPO ──
  {
    id: 'corpo',
    label: 'Corpo',
    requiresBody: false,
    subTabs: [],
    flatSections: [{ label: 'Corpo', category: 'body' }],
  },

  // ── ROSTO ──
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

  // ── CABELO ──
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

  // ── ROUPAS ──
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

  // ── EXTRAS ──
  {
    id: 'extras',
    label: 'Extras',
    requiresBody: true,
    subTabs: [
      {
        id: 'padrao-extras',
        label: 'Padrão',
        sections: [{ label: 'Barba', category: 'beard' }],
      },
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

const COLOR_VARIANTS = ['b', 'c', 'd', 'e', 'f', 'g', 'h']

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

function resolveSrc(piece: CharacterPiece, variant: string): string {
  if (!variant || !piece.hasColor || !piece.srcColor) return assetUrl(piece.src)
  return assetUrl(piece.srcColor.replace(/(\d+)(\.png)$/, `$1${variant}$2`))
}

function sectionKey(s: Section): string {
  const parts: string[] = [s.category]
  if (s.genderFilter) parts.push(s.genderFilter)
  if (s.packFilter) parts.push(s.packFilter)
  return parts.join('|')
}

// ─────────────────────────────────────────────
// PREVIEW
// ─────────────────────────────────────────────

function CharacterPreview({
  config,
  colorVariants,
}: {
  config: CharacterConfig
  colorVariants: Record<string, string>
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

  return (
    <div style={{ position: 'relative', width: 222, height: 350 }}>
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
// MINI GRADE — grade de peças de uma seção
// ─────────────────────────────────────────────

function MiniGrid({
  section,
  config,
  colorVariants,
  onSelect,
  onColorChange,
}: {
  section: Section
  config: CharacterConfig
  colorVariants: Record<string, string>
  onSelect: (piece: CharacterPiece, category: CharacterCategory) => void
  onColorChange: (category: CharacterCategory, variant: string) => void
}) {
  const { category, genderFilter, packFilter } = section
  const pieces = getPiecesByCategory(category).filter((p) => {
    if (genderFilter && p.gender !== genderFilter) return false
    if (packFilter && p.pack !== packFilter) return false
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
      {/* Seletor de cor */}
      {hasSomeColor && (
        <div
          style={{
            display: 'flex',
            gap: 4,
            flexWrap: 'wrap',
            padding: '5px 10px',
            background: 'var(--color-bark-100)',
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

      {/* Grade */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))',
          gap: 8,
          alignContent: 'start',
        }}
      >
        {/* Botão nenhum */}
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
            <X size={20} />
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
                background: selected ? 'var(--color-petal-200)' : 'var(--color-bark-100)',
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
              {p.cost !== undefined && p.cost > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    bottom: 3,
                    right: 5,
                    fontSize: 10,
                    fontFamily: 'Baloo 2, sans-serif',
                    color: 'var(--color-bark-700)',
                    background: 'rgba(245,236,215,0.92)',
                    borderRadius: 4,
                    padding: '0 4px',
                    lineHeight: '15px',
                  }}
                >
                  {p.cost}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// PAINEL DE SEÇÕES — renderiza várias seções empilhadas
// ─────────────────────────────────────────────

function SectionsPanel({
  sections,
  config,
  colorVariants,
  onSelect,
  onColorChange,
}: {
  sections: Section[]
  config: CharacterConfig
  colorVariants: Record<string, string>
  onSelect: (piece: CharacterPiece, category: CharacterCategory) => void
  onColorChange: (category: CharacterCategory, variant: string) => void
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
        overflowY: 'auto',
        height: '100%',
        paddingRight: 4,
      }}
    >
      {sections.map((section) => {
        const key = sectionKey(section)
        // Verifica se tem peças antes de renderizar
        const pieces = getPiecesByCategory(section.category).filter((p) => {
          if (section.genderFilter && p.gender !== section.genderFilter) return false
          if (section.packFilter && p.pack !== section.packFilter) return false
          return true
        })
        if (pieces.length === 0) return null

        return (
          <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {/* Label da seção */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: 'var(--color-leaf-700)',
                  fontFamily: 'Baloo 2, sans-serif',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                {section.label}
              </span>
              <div
                style={{
                  flex: 1,
                  height: 1,
                  background: 'var(--color-wood-300)',
                  borderRadius: 1,
                }}
              />
            </div>

            <MiniGrid
              section={section}
              config={config}
              colorVariants={colorVariants}
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

export default function CharacterModal({ config: initialConfig, onSave, onClose }: Props) {
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
  const [activeTab, setActiveTab] = useState(TABS[0].id)
  const [activeSubTab, setActiveSubTab] = useState<string>('')
  const [bodyError, setBodyError] = useState(false)

  const currentTab = TABS.find((t) => t.id === activeTab) ?? TABS[0]
  const hasBody = !!config.body

  // Sub-tab ativa: usa a primeira do tab se não estiver definida
  const effectiveSubTab =
    currentTab.subTabs.length > 0 ? activeSubTab || currentTab.subTabs[0].id : ''

  const currentSubTab = currentTab.subTabs.find((s) => s.id === effectiveSubTab)

  // Seções a renderizar: sub-tab atual ou flatSections
  const activeSections: Section[] =
    currentTab.flatSections ?? currentSubTab?.sections ?? currentTab.subTabs[0]?.sections ?? []

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
    // Reset sub-tab para a primeira do novo tab
    setActiveSubTab(tab.subTabs[0]?.id ?? '')
  }

  const handleSelect = useCallback((piece: CharacterPiece, category: CharacterCategory) => {
    setConfig((prev) => {
      const next = { ...prev }

      if (piece.id === '__none__') {
        ;(next as Record<string, unknown>)[category] = isMultiSlot(category) ? [] : null
        return next
      }

      if (isMultiSlot(category)) {
        const arr = [...((prev[category as keyof CharacterConfig] as string[]) ?? [])]
        const idx = arr.indexOf(piece.id)
        if (idx >= 0) arr.splice(idx, 1)
        else arr.push(piece.id)
        ;(next as Record<string, unknown>)[category] = arr
      } else {
        const current = prev[category as keyof CharacterConfig] as string | null
        const newVal = category === 'body' ? piece.id : current === piece.id ? null : piece.id
        ;(next as Record<string, unknown>)[category] = newVal

        // Exclusão mútua: vestido limpa top e bottom; top/bottom limpa vestido
        if (category === 'dress' && newVal !== null) {
          next.top = null
          next.bottom = null
        }
        if ((category === 'top' || category === 'bottom') && newVal !== null) {
          next.dress = null
        }
      }

      return next
    })
  }, [])

  const handleColorChange = useCallback((category: CharacterCategory, variant: string) => {
    setColorVariants((prev) => ({ ...prev, [category]: variant }))
  }, [])

  const handleSave = () => {
    onSave({ ...config, colorVariants })
    onClose()
  }

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
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 20px',
          borderBottom: '2px solid var(--color-wood-300)',
          background: 'var(--color-bark-100)',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Sparkles size={18} color="var(--color-petal-400)" />
          <span style={{ fontSize: 17, fontWeight: 700, color: 'var(--color-leaf-800)' }}>
            Meu Personagem
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={handleSave}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '5px 14px',
              borderRadius: 10,
              border: 'none',
              background: 'var(--color-leaf-600)',
              color: '#fff',
              fontSize: 13,
              fontWeight: 600,
              fontFamily: 'Baloo 2, sans-serif',
              cursor: 'pointer',
            }}
          >
            <Save size={14} />
            Salvar
          </button>
          <button
            onClick={onClose}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 32,
              height: 32,
              borderRadius: 8,
              border: '1px solid var(--color-wood-300)',
              background: 'transparent',
              cursor: 'pointer',
              color: 'var(--color-leaf-600)',
            }}
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* BODY */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* PREVIEW */}
        <div
          style={{
            width: 250,
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            borderRight: '2px solid var(--color-wood-300)',
            background: 'var(--color-leaf-100)',
            padding: 16,
            gap: 12,
          }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: 20,
              padding: 16,
              boxShadow: '0 4px 20px rgba(74,122,74,0.10)',
              border: '2px solid var(--color-wood-300)',
            }}
          >
            <CharacterPreview config={config} colorVariants={colorVariants} />
          </div>
          <span style={{ fontSize: 11, color: 'var(--color-leaf-600)', textAlign: 'center' }}>
            Preview em tempo real
          </span>
        </div>

        {/* PAINEL DIREITO */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Tabs principais */}
          <div
            style={{
              display: 'flex',
              gap: 2,
              padding: '8px 16px 0',
              borderBottom: '2px solid var(--color-wood-300)',
              background: 'var(--color-bark-100)',
              flexShrink: 0,
            }}
          >
            {TABS.map((tab) => {
              const locked = tab.requiresBody && !hasBody
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  title={locked ? 'Escolha um corpo primeiro' : undefined}
                  style={{
                    padding: '5px 18px',
                    borderRadius: '10px 10px 0 0',
                    border: 'none',
                    background: activeTab === tab.id ? 'var(--color-leaf-100)' : 'transparent',
                    color: locked
                      ? 'var(--color-leaf-400)'
                      : activeTab === tab.id
                        ? 'var(--color-leaf-800)'
                        : 'var(--color-leaf-600)',
                    fontSize: 13,
                    fontWeight: activeTab === tab.id ? 700 : 400,
                    fontFamily: 'Baloo 2, sans-serif',
                    cursor: locked ? 'not-allowed' : 'pointer',
                    borderBottom:
                      activeTab === tab.id
                        ? '2px solid var(--color-leaf-100)'
                        : '2px solid transparent',
                    marginBottom: -2,
                    transition: 'all 0.15s',
                    opacity: locked ? 0.55 : 1,
                  }}
                >
                  {tab.label}
                </button>
              )
            })}
          </div>

          {/* Aviso de body obrigatório */}
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

          {/* Sub-tabs (Roupas e Extras) */}
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

          {/* Conteúdo — seções empilhadas */}
          <div style={{ flex: 1, minHeight: 0, overflow: 'hidden', padding: '12px 16px' }}>
            <SectionsPanel
              sections={activeSections}
              config={config}
              colorVariants={colorVariants}
              onSelect={handleSelect}
              onColorChange={handleColorChange}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
