import { useState } from 'react'
import { X, Trophy, Lock, Gift, CheckCircle } from 'lucide-react'
import {
  ACHIEVEMENTS,
  CATEGORY_BONUS,
  getByCategory,
  type AchievementCategory,
  type AchievementsMap,
} from '../lib/achievements'
import { FLOWERS, type FlowerType } from '../lib/garden'

// ═══════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════

interface ProgressData {
  streakDays: number
  movies: { tipo: string; status: string }[]
  goals: { archived?: boolean; current?: number; target?: number }[]
  debts: { paid?: boolean }[]
  transactions: unknown[]
  plants: { flowerType: string }[]
  seeds: { flowerType: string }[]
  coins: number
  maxPlants: number
  datingDate?: string | null
  letterCount?: number
  specialCount?: number
}

interface Props {
  achievements: AchievementsMap
  categoryBonus: Partial<Record<AchievementCategory, boolean>>
  onClose: () => void
  onClaim: (id: string) => Promise<void>
  onClaimCategoryBonus?: (categoria: AchievementCategory) => Promise<void>
  progress?: ProgressData
}

// ═══════════════════════════════════════
// CONFIG DE CATEGORIAS
// ═══════════════════════════════════════

const CATEGORIES: { id: AchievementCategory; label: string }[] = [
  { id: 'jardim', label: 'Jardim' },
  { id: 'streak', label: 'Streak' },
  { id: 'cartas', label: 'Cartas' },
  { id: 'financas', label: 'Finanças' },
  { id: 'filmes', label: 'Filmes e Séries' },
  { id: 'namoro', label: 'Namoro' },
  { id: 'secreta', label: 'Secretas' },
]

// ═══════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════

function formatDate(iso: string): string {
  if (iso === 'antes do sistema') return 'antes do sistema'
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function countUnlocked(achievements: AchievementsMap, categoria: AchievementCategory): number {
  return getByCategory(categoria).filter((a) => achievements[a.id]).length
}

function isCategoryComplete(
  achievements: AchievementsMap,
  categoria: AchievementCategory
): boolean {
  return getByCategory(categoria).every((a) => achievements[a.id])
}

function getHint(id: string, progress: ProgressData): string | null {
  const p = progress

  const watchedMovies = p.movies.filter(
    (m) =>
      (m.status === 'watched' || m.status === 'assistido') &&
      (m.tipo === 'filme' || m.tipo === 'movie')
  ).length
  const watchedSeries = p.movies.filter(
    (m) =>
      (m.status === 'watched' || m.status === 'assistido') &&
      (m.tipo === 'série' || m.tipo === 'serie' || m.tipo === 'series')
  ).length
  const watchedCartoons = p.movies.filter(
    (m) =>
      (m.status === 'watched' || m.status === 'assistido') &&
      (m.tipo === 'desenho' || m.tipo === 'cartoon')
  ).length

  const completedGoals = p.goals.filter(
    (g) => !g.archived && g.current !== undefined && g.target !== undefined && g.current >= g.target
  ).length
  const paidDebts = p.debts.filter((d) => d.paid).length

  const allFlowerIds = [
    ...new Set([...p.plants.map((x) => x.flowerType), ...p.seeds.map((x) => x.flowerType)]),
  ]

  const COMUM = ['rosa', 'margarida', 'peonia', 'papoula', 'lavanda']
  const INCOMUM = ['tulipa', 'girassol', 'jasmin', 'violeta']
  const RARA = ['orquidea', 'lirio']
  const EPICA = ['especial']
  const ALL = [...COMUM, ...INCOMUM, ...RARA, ...EPICA]

  const flowerName = (type: string) => FLOWERS[type as FlowerType]?.name ?? type
  const missing = (list: string[]) => list.filter((f) => !allFlowerIds.includes(f)).map(flowerName)

  const parseDating = (raw: string | undefined | null): Date | null => {
    if (!raw || raw === 'DD-MM-AAAA') return null
    const parts = raw.split('-')
    if (parts.length !== 3) return null
    const [dd, mm, yyyy] = parts
    if (!dd || !mm || !yyyy || yyyy.length !== 4) return null
    return new Date(`${yyyy}-${mm}-${dd}`)
  }

  switch (id) {
    // ── Jardim ──
    case 'first_plant':
      return p.plants.length === 0 ? 'plantem a primeira sementinha' : null
    case 'all_common': {
      const m = missing(COMUM)
      return m.length ? `faltam: ${m.join(', ')}` : null
    }
    case 'all_uncommon': {
      const m = missing(INCOMUM)
      return m.length ? `faltam: ${m.join(', ')}` : null
    }
    case 'all_rare': {
      const m = missing(RARA)
      return m.length ? `faltam: ${m.join(', ')}` : null
    }
    case 'full_catalog': {
      const m = missing(ALL)
      return m.length ? `faltam: ${m.join(', ')}` : null
    }
    case 'first_sell':
      return 'vendam uma flor ou semente no jardim'
    case 'coins_100':
      return p.coins < 100 ? `faltam ${100 - p.coins} moedas` : null
    case 'coins_500':
      return p.coins < 500 ? `faltam ${500 - p.coins} moedas` : null
    case 'coins_1000':
      return p.coins < 1000 ? `faltam ${1000 - p.coins} moedas` : null
    case 'all_slots':
      return p.maxPlants < 8 ? `${8 - p.maxPlants} vaso(s) ainda bloqueados` : null

    // ── Streak ──
    case 'streak_7':
      return `faltam ${Math.max(0, 7 - p.streakDays)} dia(s)`
    case 'streak_14':
      return `faltam ${Math.max(0, 14 - p.streakDays)} dia(s)`
    case 'streak_30':
      return `faltam ${Math.max(0, 30 - p.streakDays)} dia(s)`
    case 'streak_60':
      return `faltam ${Math.max(0, 60 - p.streakDays)} dia(s)`
    case 'streak_90':
      return `faltam ${Math.max(0, 90 - p.streakDays)} dia(s)`
    case 'streak_180':
      return `faltam ${Math.max(0, 180 - p.streakDays)} dia(s)`
    case 'streak_365':
      return `faltam ${Math.max(0, 365 - p.streakDays)} dia(s)`

    // ── Filmes ──
    case 'first_movie':
      return watchedMovies === 0 ? 'assistam ao primeiro filme juntos' : null
    case 'movies_5':
      return `${watchedMovies}/5 filmes assistidos`
    case 'movies_10':
      return `${watchedMovies}/10 filmes assistidos`
    case 'movies_50':
      return `${watchedMovies}/50 filmes assistidos`
    case 'first_series':
      return watchedSeries === 0 ? 'assistam à primeira série juntos' : null
    case 'series_5':
      return `${watchedSeries}/5 séries assistidas`
    case 'series_25':
      return `${watchedSeries}/25 séries assistidas`
    case 'cartoons_3':
      return `${watchedCartoons}/3 desenhos assistidos`

    // ── Finanças ──
    case 'first_goal':
      return p.goals.length === 0 ? 'criem a primeira meta juntos' : null
    case 'goal_complete':
      return completedGoals === 0 ? 'completem uma meta' : null
    case 'goals_5':
      return `${completedGoals}/5 metas completadas`
    case 'first_debt':
      return paidDebts === 0 ? 'quitem a primeira dívida' : null
    case 'transactions_30':
      return `${p.transactions.length}/30 lançamentos registrados`

    // ── Namoro ──
    case 'dating_1m':
    case 'dating_2m':
    case 'dating_3m':
    case 'dating_4m':
    case 'dating_5m':
    case 'dating_6m':
    case 'dating_7m':
    case 'dating_8m':
    case 'dating_9m':
    case 'dating_10m':
    case 'dating_11m':
    case 'dating_1y':
    case 'dating_2y':
    case 'dating_3y': {
      const start = parseDating(p.datingDate)
      if (!start) return 'configurem a data do namoro na agenda'
      const now = new Date()
      const diffMs = now.getTime() - start.getTime()
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
      const targets: Record<string, number> = {
        dating_1m: 30,
        dating_2m: 60,
        dating_3m: 90,
        dating_4m: 120,
        dating_5m: 150,
        dating_6m: 180,
        dating_7m: 210,
        dating_8m: 240,
        dating_9m: 270,
        dating_10m: 300,
        dating_11m: 330,
        dating_1y: 365,
        dating_2y: 730,
        dating_3y: 1095,
      }
      const target = targets[id]
      const left = Math.max(0, target - diffDays)
      return left === 0 ? null : `faltam ${left} dia(s)`
    }

    // ── Cartas ──
    case 'first_letter':
      return (p.letterCount ?? 0) === 0 ? 'criem a primeira cartinha' : null
    case 'letters_10':
      return `${p.letterCount ?? 0}/10 cartas`
    case 'letters_50':
      return `${p.letterCount ?? 0}/50 cartas`
    case 'first_special':
      return (p.specialCount ?? 0) === 0 ? 'enviem a primeira carta especial' : null
    case 'special_10':
      return `${p.specialCount ?? 0}/10 cartas especiais`
    case 'special_50':
      return `${p.specialCount ?? 0}/50 cartas especiais`

    default:
      return null
  }
}

// ═══════════════════════════════════════
// SUB-COMPONENTE — card de conquista
// ═══════════════════════════════════════

function AchievementCard({
  def,
  record,
  onClaim,
  progress,
}: {
  def: ReturnType<typeof getByCategory>[number]
  record?: { unlockedAt: string; unlockedBy: string; rewardClaimed?: boolean }
  onClaim: () => void
  progress?: ProgressData
}) {
  const [claiming, setClaiming] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const hint = !record && progress ? getHint(def.id, progress) : null
  const unlocked = !!record
  const isSecret = def.categoria === 'secreta'
  const canClaim = unlocked && def.recompensa > 0 && !record?.rewardClaimed

  const handleClaim = async () => {
    if (!canClaim || claiming) return
    setClaiming(true)
    await onClaim()
    setClaiming(false)
  }

  // ── Secreta bloqueada ──
  if (isSecret && !unlocked) {
    return (
      <div
        style={{
          borderRadius: 14,
          border: '1.5px solid rgba(232,160,176,0.2)',
          background: 'rgba(245,213,220,0.08)',
          padding: '12px 10px',
          display: 'flex',
          flexDirection: 'column',
          gap: 5,
          alignItems: 'center',
          textAlign: 'center',
          minHeight: 160,
          justifyContent: 'flex-start',
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 10,
            overflow: 'hidden',
            position: 'relative',
            border: '1.5px solid rgba(232,160,176,0.25)',
            flexShrink: 0,
          }}
        >
          <img
            src={def.imagem}
            alt=""
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              // visível mas com efeito secreto: blur leve + saturação baixa
              filter: 'blur(4px) saturate(0.3) brightness(0.7)',
              transform: 'scale(1.08)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(44,20,8,0.15)',
            }}
          >
            <Lock size={18} color="rgba(245,213,220,0.85)" strokeWidth={2.5} />
          </div>
        </div>
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: 'rgba(61,26,16,0.45)',
            fontFamily: 'Baloo 2, sans-serif',
          }}
        >
          ???
        </span>
        {def.dica && (
          <span
            style={{
              fontSize: 9.5,
              fontWeight: 600,
              color: 'rgba(139,105,20,0.55)',
              fontFamily: 'Baloo 2, sans-serif',
              fontStyle: 'italic',
              lineHeight: 1.3,
            }}
          >
            "{def.dica}"
          </span>
        )}
      </div>
    )
  }

  // ── Normal (bloqueada ou desbloqueada) ──
  return (
    <div
      style={{
        borderRadius: 14,
        border: unlocked
          ? '1.5px solid rgba(232,160,176,0.45)'
          : '1.5px solid rgba(200,160,170,0.2)',
        background: unlocked
          ? 'linear-gradient(135deg, rgba(253,242,246,0.92) 0%, rgba(245,236,215,0.75) 100%)'
          : 'rgba(245,213,220,0.07)',
        padding: '12px 10px',
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        alignItems: 'center',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
        minHeight: 160,
        justifyContent: 'flex-start',
      }}
    >
      {/* imagem */}
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: 10,
          overflow: 'hidden',
          flexShrink: 0,
          position: 'relative',
          border: unlocked
            ? '1.5px solid rgba(232,160,176,0.35)'
            : '1.5px solid rgba(200,160,170,0.15)',
        }}
      >
        <img
          src={def.imagem}
          alt={unlocked ? def.nome : ''}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            // bloqueada: imagem bem visível mas em tons frios/cinza — dá pra ver o que é
            filter: unlocked ? 'none' : 'grayscale(0.75) brightness(0.65) blur(1px)',
          }}
        />
        {/* cadeado só nas bloqueadas */}
        {!unlocked && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(44,20,8,0.25)',
            }}
          >
            <Lock size={16} color="rgba(245,213,220,0.9)" strokeWidth={2.5} />
          </div>
        )}
      </div>

      <span
        style={{
          fontSize: 10.5,
          fontWeight: 800,
          color: unlocked ? '#3d1a10' : 'rgba(61,26,16,0.45)',
          fontFamily: 'Baloo 2, sans-serif',
          lineHeight: 1.25,
        }}
      >
        {def.nome}
      </span>

      <span
        style={{
          fontSize: 9,
          fontWeight: 600,
          color: unlocked ? 'rgba(61,26,16,0.5)' : 'rgba(61,26,16,0.32)',
          fontFamily: 'Baloo 2, sans-serif',
          lineHeight: 1.3,
          minHeight: 24,
        }}
      >
        {def.descricao}
      </span>

      {unlocked && record && (
        <span
          style={{
            fontSize: 8.5,
            fontWeight: 700,
            color: 'rgba(139,105,20,0.5)',
            fontFamily: 'Baloo 2, sans-serif',
            letterSpacing: '0.2px',
          }}
        >
          {formatDate(record.unlockedAt)}
        </span>
      )}

      {/* botão resgatar ou badge "resgatado" */}
      {unlocked && def.recompensa > 0 && (
        <div style={{ marginTop: 3, width: '100%', display: 'flex', justifyContent: 'center' }}>
          {record?.rewardClaimed ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <CheckCircle size={10} color="rgba(74,122,74,0.7)" strokeWidth={2.5} />
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  color: 'rgba(74,122,74,0.7)',
                  fontFamily: 'Baloo 2, sans-serif',
                }}
              >
                {def.recompensa} moedas resgatadas
              </span>
            </div>
          ) : (
            <button
              onClick={handleClaim}
              disabled={claiming}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
                width: '100%',
                background: 'linear-gradient(135deg, rgba(232,160,176,0.7), rgba(196,149,106,0.6))',
                border: 'none',
                borderRadius: 8,
                padding: '4px 0',
                cursor: claiming ? 'default' : 'pointer',
                fontFamily: 'Baloo 2, sans-serif',
                fontSize: 9.5,
                fontWeight: 800,
                color: '#3d1a10',
                opacity: claiming ? 0.6 : 1,
                transition: 'opacity 0.15s',
              }}
            >
              <Gift size={10} strokeWidth={2.5} />
              {claiming ? '...' : `+${def.recompensa} ${def.recompensa === 1 ? 'moeda' : 'moedas'}`}
            </button>
          )}
        </div>
      )}

      {/* botão de dica nas bloqueadas */}
      {!unlocked && hint && (
        <div style={{ position: 'relative', marginTop: 2 }}>
          <button
            onClick={() => setShowHint((v) => !v)}
            style={{
              width: 18,
              height: 18,
              borderRadius: '50%',
              border: '1.5px solid rgba(196,149,106,0.45)',
              background: showHint ? 'rgba(196,149,106,0.25)' : 'rgba(196,149,106,0.1)',
              cursor: 'pointer',
              fontSize: 10,
              fontWeight: 800,
              color: 'rgba(139,105,20,0.7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
              fontFamily: 'Baloo 2, sans-serif',
              transition: 'all 0.15s',
            }}
          >
            ?
          </button>
          {showHint && (
            <div
              style={{
                position: 'absolute',
                bottom: 22,
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'rgba(253,246,240,0.97)',
                border: '1.5px solid rgba(196,149,106,0.4)',
                borderRadius: 8,
                padding: '5px 9px',
                fontSize: 9,
                fontWeight: 700,
                color: '#3d1a10',
                fontFamily: 'Baloo 2, sans-serif',
                boxShadow: '0 3px 12px rgba(44,20,8,0.15)',
                zIndex: 10,
                pointerEvents: 'none',
                lineHeight: 1.4,
                maxWidth: 160,
                whiteSpace: 'normal',
                textAlign: 'center',
              }}
            >
              {hint}
            </div>
          )}
        </div>
      )}

      {/* listra dourada no topo das desbloqueadas */}
      {unlocked && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 2,
            background: 'linear-gradient(90deg, transparent, rgba(196,149,106,0.55), transparent)',
            borderRadius: '14px 14px 0 0',
          }}
        />
      )}
    </div>
  )
}

// ═══════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════

export default function AchievementsModal({
  achievements,
  categoryBonus,
  onClose,
  onClaim,
  onClaimCategoryBonus,
  progress,
}: Props) {
  const total = ACHIEVEMENTS.length
  const totalUnlocked = Object.keys(achievements).length

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        background: 'rgba(44,20,8,0.4)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background:
            'linear-gradient(160deg, rgba(253,246,240,0.98) 0%, rgba(252,232,238,0.98) 100%)',
          border: '1.5px solid rgba(232,160,176,0.4)',
          borderRadius: 22,
          width: 640,
          maxWidth: '96vw',
          maxHeight: '88vh',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'Baloo 2, sans-serif',
          boxShadow: '0 12px 60px rgba(200,120,140,0.25), inset 0 1px 0 rgba(255,255,255,0.7)',
          overflow: 'hidden',
        }}
      >
        {/* ── Header ── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '18px 22px 14px',
            borderBottom: '2px dashed rgba(232,160,176,0.35)',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Trophy size={17} color="#8b6914" strokeWidth={2} />
            <span style={{ fontSize: 15, fontWeight: 800, color: '#3d1a10' }}>conquistas</span>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: 'rgba(139,105,20,0.7)',
                background: 'rgba(196,149,106,0.15)',
                border: '1px solid rgba(196,149,106,0.3)',
                borderRadius: 20,
                padding: '2px 10px',
              }}
            >
              {totalUnlocked}/{total}
            </span>
          </div>
          <button
            onClick={onClose}
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

        {/* ── Barra de progresso geral ── */}
        <div style={{ padding: '10px 22px 2px', flexShrink: 0 }}>
          <div
            style={{
              height: 5,
              borderRadius: 99,
              background: 'rgba(232,160,176,0.2)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${(totalUnlocked / total) * 100}%`,
                background: 'linear-gradient(90deg, #E8A0B0, #C4956A)',
                borderRadius: 99,
                transition: 'width 0.6s ease',
              }}
            />
          </div>
        </div>

        {/* ── Scroll de categorias ── */}
        <div
          className="achievement-scroll"
          style={{
            overflowY: 'auto',
            padding: '14px 22px 22px',
            display: 'flex',
            flexDirection: 'column',
            gap: 24,
          }}
        >
          <style>{`
            .achievement-scroll::-webkit-scrollbar { width: 5px; }
            .achievement-scroll::-webkit-scrollbar-thumb { background: rgba(212,170,128,0.5); border-radius: 99px; }
            .achievement-scroll::-webkit-scrollbar-track { background: transparent; }
          `}</style>

          {CATEGORIES.map(({ id, label }) => {
            const defs = getByCategory(id)
            const unlockedCount = countUnlocked(achievements, id)
            const complete = isCategoryComplete(achievements, id)
            const bonus = CATEGORY_BONUS[id]
            const bonusClaimed = !!categoryBonus[id]
            // botão de bônus aparece quando categoria completa e bônus > 0 e ainda não foi pago
            // (checkAndPayCategoryBonus paga automaticamente, mas se quiser mostrar feedback visual:)
            const showBonusBtn = complete && bonus > 0 && !bonusClaimed

            return (
              <div key={id}>
                {/* título da categoria */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    marginBottom: 10,
                    flexWrap: 'wrap',
                  }}
                >
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 800,
                      color: complete ? '#8b6914' : 'rgba(139,105,20,0.6)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.8px',
                    }}
                  >
                    {label}
                  </span>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: 'rgba(139,105,20,0.45)',
                    }}
                  >
                    {unlockedCount}/{defs.length}
                  </span>

                  {/* badge / botão de bônus de categoria */}
                  {bonus > 0 && (
                    <>
                      {showBonusBtn ? (
                        // categoria completa, bônus ainda não pago — botão para resgatar
                        <button
                          onClick={() => onClaimCategoryBonus?.(id)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            background:
                              'linear-gradient(135deg, rgba(196,149,106,0.75), rgba(232,160,176,0.6))',
                            border: 'none',
                            borderRadius: 99,
                            padding: '2px 10px',
                            cursor: 'pointer',
                            fontFamily: 'Baloo 2, sans-serif',
                            fontSize: 9,
                            fontWeight: 800,
                            color: '#3d1a10',
                          }}
                        >
                          <Gift size={9} strokeWidth={2.5} />
                          resgatar bônus +{bonus}
                        </button>
                      ) : bonusClaimed ? (
                        // já resgatado
                        <span
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 3,
                            fontSize: 9,
                            fontWeight: 700,
                            color: 'rgba(74,122,74,0.7)',
                            background: 'rgba(74,122,74,0.1)',
                            border: '1px solid rgba(74,122,74,0.25)',
                            borderRadius: 99,
                            padding: '1px 8px',
                            fontFamily: 'Baloo 2, sans-serif',
                          }}
                        >
                          <CheckCircle size={9} strokeWidth={2.5} />
                          bônus +{bonus} resgatado
                        </span>
                      ) : (
                        // ainda faltam conquistas
                        <span
                          style={{
                            fontSize: 9,
                            fontWeight: 800,
                            color: 'rgba(139,105,20,0.4)',
                            background: 'rgba(196,149,106,0.08)',
                            border: '1px solid rgba(196,149,106,0.18)',
                            borderRadius: 99,
                            padding: '1px 7px',
                            fontFamily: 'Baloo 2, sans-serif',
                          }}
                        >
                          bônus: +{bonus}
                        </span>
                      )}
                    </>
                  )}

                  <div
                    style={{
                      flex: 1,
                      height: '1px',
                      background: complete ? 'rgba(196,149,106,0.4)' : 'rgba(232,160,176,0.25)',
                      minWidth: 20,
                    }}
                  />
                </div>

                {/* grade */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                    gap: 8,
                  }}
                >
                  {defs.map((def) => (
                    <AchievementCard
                      key={def.id}
                      def={def}
                      record={achievements[def.id]}
                      onClaim={() => onClaim(def.id)}
                      progress={progress}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
