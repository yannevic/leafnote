import { useState } from 'react'
import { Sparkles, Plus, CheckCircle2, XCircle, Trash2, Coins, Package, X } from 'lucide-react'
import {
  FIXED_ACTIVITIES,
  FixedActivity,
  PendingActivity,
  ActivityTier,
  ActivityRewardType,
  addPendingActivity,
  removePendingActivity,
  confirmActivity,
} from '../../lib/activities'
import { usePendingActivities } from '../../hooks/usePendingActivities'
import folhinhaVerde from '../../assets/cards/folhinha-verde.png'
import SellCardModal from './SellCardModal'
import { usePersonalCoin } from '../../hooks/usePersonalCoin'
import { COIN_ICONS } from '../../lib/personalCoinIcons'

const MAX_PENDING = 5

const TIER_LABEL: Record<ActivityTier, string> = {
  leve: 'leve',
  medio: 'médio',
  alto: 'alto',
}

const TIER_COLOR: Record<ActivityTier, string> = {
  leve: '#3d7a3d',
  medio: '#8b6914',
  alto: '#c87090',
}

interface ExtrasTabProps {
  coupleId: string
  uid: string
  partnerUid: string
}

export default function ExtrasTab({ coupleId, uid, partnerUid }: ExtrasTabProps) {
  const { activities, loading } = usePendingActivities(coupleId)
  const [showCustomForm, setShowCustomForm] = useState(false)
  const [mediumChoiceFor, setMediumChoiceFor] = useState<FixedActivity | null>(null)
  const [showSell, setShowSell] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const { coin } = usePersonalCoin(uid)
  const CoinIcon = coin ? COIN_ICONS[coin.icon] : Coins
  const coinColor = coin?.color ?? '#8b6914'

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }

  async function handleMarkFixed(activity: FixedActivity) {
    if (activities.length >= MAX_PENDING) {
      showToast('máximo de 5 atividades pendentes')
      return
    }
    if (activity.tier === 'medio') {
      setMediumChoiceFor(activity)
      return
    }
    await addPendingActivity(coupleId, {
      name: activity.name,
      tier: activity.tier,
      rewardType: 'coins',
      custom: false,
      createdBy: uid,
    })
    showToast('atividade marcada como pendente!')
  }

  async function handleMediumChoice(rewardType: ActivityRewardType) {
    if (!mediumChoiceFor) return
    await addPendingActivity(coupleId, {
      name: mediumChoiceFor.name,
      tier: 'medio',
      rewardType,
      custom: false,
      createdBy: uid,
    })
    setMediumChoiceFor(null)
    showToast('atividade marcada como pendente!')
  }

  async function handleConfirm(activity: PendingActivity) {
    await confirmActivity(coupleId, activity, uid, partnerUid)
    showToast(`"${activity.name}" confirmada — recompensa creditada!`)
  }

  async function handleDelete(activity: PendingActivity) {
    await removePendingActivity(coupleId, activity.id)
  }

  return (
    <div style={{ padding: '20px 24px 40px', fontFamily: 'Baloo 2, sans-serif' }}>
      <style>{`
        .extras-btn { transition: transform 0.18s cubic-bezier(0.34,1.56,0.64,1); }
        .extras-btn:hover { transform: translateY(-2px); }
        .extras-btn:active { transform: scale(0.96); }
      `}</style>

      {/* ── Atividades fixas / criar personalizada ── */}
      <SectionTitle>atividades</SectionTitle>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 10,
          justifyContent: 'center',
          marginBottom: 22,
        }}
      >
        {FIXED_ACTIVITIES.map((a) => (
          <button
            key={a.id}
            onClick={() => handleMarkFixed(a)}
            className="extras-btn"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
              border: `1.5px solid ${TIER_COLOR[a.tier]}55`,
              background: '#fff',
              borderRadius: 14,
              padding: '10px 14px',
              cursor: 'pointer',
              minWidth: 130,
            }}
          >
            <span style={{ fontSize: 12, fontWeight: 800, color: '#2D4A2D' }}>{a.name}</span>
            <span style={{ fontSize: 10, fontWeight: 700, color: TIER_COLOR[a.tier] }}>
              {TIER_LABEL[a.tier]}
            </span>
          </button>
        ))}
        <button
          onClick={() => setShowCustomForm(true)}
          className="extras-btn"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            border: '1.5px dashed rgba(122,48,64,0.4)',
            background: 'rgba(200,120,140,0.08)',
            borderRadius: 14,
            padding: '10px 14px',
            cursor: 'pointer',
            color: '#7a3040',
            fontWeight: 800,
            fontSize: 12,
            minWidth: 130,
          }}
        >
          <Plus size={14} /> personalizada
        </button>
      </div>

      {/* ── Pendentes ── */}
      <SectionTitle>
        pendentes {activities.length > 0 && `(${activities.length}/${MAX_PENDING})`}
      </SectionTitle>
      {loading ? (
        <div style={{ textAlign: 'center', color: '#8b6914', fontSize: 12 }}>carregando...</div>
      ) : activities.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            color: '#8b6914',
            fontSize: 12,
            opacity: 0.7,
            marginBottom: 22,
          }}
        >
          nenhuma atividade pendente
        </div>
      ) : (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 12,
            justifyContent: 'center',
            marginBottom: 22,
          }}
        >
          {activities.map((activity) => (
            <PendingActivityCard
              key={activity.id}
              activity={activity}
              onConfirm={() => handleConfirm(activity)}
              onDelete={() => handleDelete(activity)}
            />
          ))}
        </div>
      )}

      {/* ── Vender carta repetida (movido da Loja) ── */}
      <SectionTitle>vender pra Folhinha</SectionTitle>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
        <img
          src={folhinhaVerde}
          alt=""
          style={{ width: 150, height: 150, objectFit: 'contain', borderRadius: 16 }}
        />
        <button
          onClick={() => setShowSell(true)}
          className="extras-btn"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: 'none',
            borderRadius: 999,
            padding: '8px 18px',
            background: 'rgba(139,105,20,0.12)',
            color: '#8b6914',
            fontFamily: 'Baloo 2',
            fontWeight: 800,
            fontSize: 12,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          vender cartas repetidas pra o Folhinha
        </button>
      </div>

      {showSell && (
        <SellCardModal
          coupleId={coupleId}
          uid={uid}
          CoinIcon={CoinIcon}
          coinColor={coinColor}
          onClose={() => setShowSell(false)}
          onSold={showToast}
        />
      )}

      {mediumChoiceFor && (
        <MediumChoiceModal
          activityName={mediumChoiceFor.name}
          onChoose={handleMediumChoice}
          onCancel={() => setMediumChoiceFor(null)}
        />
      )}

      {showCustomForm && (
        <CustomActivityModal
          coupleId={coupleId}
          uid={uid}
          pendingCount={activities.length}
          onClose={() => setShowCustomForm(false)}
          onCreated={() => showToast('atividade personalizada criada!')}
        />
      )}

      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: 32,
            left: '50%',
            transform: 'translateX(-50%)',
            background:
              'linear-gradient(160deg, rgba(253,246,240,0.97) 0%, rgba(252,232,238,0.97) 100%)',
            border: '1.5px solid rgba(232,160,176,0.4)',
            color: '#3d1a10',
            borderRadius: 14,
            padding: '10px 22px',
            fontSize: 13,
            fontWeight: 800,
            fontFamily: 'Baloo 2, sans-serif',
            zIndex: 9999999,
            boxShadow: '0 8px 40px rgba(200,120,140,0.2)',
            backdropFilter: 'blur(18px)',
            whiteSpace: 'nowrap',
          }}
        >
          {toast}
        </div>
      )}
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: 13,
        fontWeight: 800,
        color: '#2D4A2D',
        textAlign: 'center',
        marginBottom: 14,
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
      }}
    >
      {children}
    </div>
  )
}

function PendingActivityCard({
  activity,
  onConfirm,
  onDelete,
}: {
  activity: PendingActivity
  onConfirm: () => void
  onDelete: () => void
}) {
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)

  return (
    <div
      style={{
        position: 'relative',
        width: 190,
        background: '#fff',
        borderRadius: 16,
        border: `1.5px solid ${TIER_COLOR[activity.tier]}55`,
        padding: '14px 14px 12px',
        boxShadow: '0 6px 20px rgba(122,48,64,0.1)',
      }}
    >
      {!deleting && (
        <button
          onClick={() => setDeleting(true)}
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'rgba(122,48,64,0.4)',
          }}
        >
          <X size={14} />
        </button>
      )}

      <div style={{ fontSize: 13, fontWeight: 800, color: '#2D4A2D', marginBottom: 2 }}>
        {activity.name}
      </div>
      {activity.description && (
        <div style={{ fontSize: 10.5, color: '#8B6914', opacity: 0.8, marginBottom: 6 }}>
          {activity.description}
        </div>
      )}
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          color: TIER_COLOR[activity.tier],
          marginBottom: 10,
        }}
      >
        {TIER_LABEL[activity.tier]}
        {activity.tier === 'medio' && (activity.rewardType === 'pack' ? ' · pacote' : ' · moedas')}
      </div>

      {deleting ? (
        <div style={{ display: 'flex', gap: 6 }}>
          <MiniBtn
            onClick={() => setDeleting(false)}
            icon={<XCircle size={14} />}
            label="cancelar"
            muted
          />
          <MiniBtn onClick={onDelete} icon={<Trash2 size={14} />} label="excluir" danger />
        </div>
      ) : confirming ? (
        <div style={{ display: 'flex', gap: 6 }}>
          <MiniBtn
            onClick={() => setConfirming(false)}
            icon={<XCircle size={14} />}
            label="cancelar"
            muted
          />
          <MiniBtn onClick={onConfirm} icon={<CheckCircle2 size={14} />} label="confirmar" />
        </div>
      ) : (
        <MiniBtn
          onClick={() => setConfirming(true)}
          icon={<CheckCircle2 size={14} />}
          label="marcar como feita"
          full
        />
      )}
    </div>
  )
}

function MiniBtn({
  onClick,
  icon,
  label,
  muted,
  danger,
  full,
}: {
  onClick: () => void
  icon: React.ReactNode
  label: string
  muted?: boolean
  danger?: boolean
  full?: boolean
}) {
  const bg = danger ? '#e8607a' : muted ? 'rgba(139,105,20,0.12)' : '#4A7A4A'
  const color = danger ? '#fff' : muted ? '#8b6914' : '#fff'
  return (
    <button
      onClick={onClick}
      style={{
        flex: full ? undefined : 1,
        width: full ? '100%' : undefined,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 5,
        border: 'none',
        borderRadius: 999,
        padding: '7px 0',
        background: bg,
        color,
        fontWeight: 800,
        fontSize: 11,
        cursor: 'pointer',
        fontFamily: 'Baloo 2',
      }}
    >
      {icon} {label}
    </button>
  )
}

function MediumChoiceModal({
  activityName,
  onChoose,
  onCancel,
}: {
  activityName: string
  onChoose: (rewardType: ActivityRewardType) => void
  onCancel: () => void
}) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999999,
        background: 'rgba(44,20,8,0.4)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onClick={onCancel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'linear-gradient(160deg, #FBEAF0 0%, #F5ECD7 100%)',
          border: '1.5px solid rgba(139,105,20,0.3)',
          borderRadius: 18,
          padding: '22px 24px',
          width: 280,
          textAlign: 'center',
          fontFamily: 'Baloo 2, sans-serif',
        }}
      >
        <div style={{ fontSize: 14, fontWeight: 800, color: '#3d1a10', marginBottom: 4 }}>
          {activityName}
        </div>
        <div style={{ fontSize: 11, color: '#8b6914', marginBottom: 16 }}>
          escolha a recompensa (pros dois)
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <MiniBtn
            onClick={() => onChoose('coins')}
            icon={<Coins size={14} />}
            label="20 moedas"
            full
          />
          <MiniBtn
            onClick={() => onChoose('pack')}
            icon={<Package size={14} />}
            label="1 pacote"
            full
          />
        </div>
      </div>
    </div>
  )
}

function CustomActivityModal({
  coupleId,
  uid,
  pendingCount,
  onClose,
  onCreated,
}: {
  coupleId: string
  uid: string
  pendingCount: number
  onClose: () => void
  onCreated: () => void
}) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [tier, setTier] = useState<ActivityTier>('leve')
  const [rewardType, setRewardType] = useState<ActivityRewardType>('coins')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit() {
    if (!name.trim()) {
      setError('dá um nome pra atividade')
      return
    }
    if (pendingCount >= MAX_PENDING) {
      setError('máximo de 5 atividades pendentes')
      return
    }
    await addPendingActivity(coupleId, {
      name: name.trim(),
      ...(description.trim() && { description: description.trim() }),
      tier,
      rewardType: tier === 'medio' ? rewardType : 'coins',
      custom: true,
      createdBy: uid,
    })
    onCreated()
    onClose()
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999999,
        background: 'rgba(44,20,8,0.4)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'linear-gradient(160deg, #FBEAF0 0%, #F5ECD7 100%)',
          border: '1.5px solid rgba(139,105,20,0.3)',
          borderRadius: 18,
          padding: '22px 24px',
          width: 320,
          fontFamily: 'Baloo 2, sans-serif',
        }}
      >
        <div style={{ fontSize: 14, fontWeight: 800, color: '#3d1a10', marginBottom: 14 }}>
          nova atividade personalizada
        </div>

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="nome da atividade"
          style={{
            width: '100%',
            padding: '9px 12px',
            borderRadius: 10,
            border: '1.5px solid rgba(139,105,20,0.25)',
            fontFamily: 'Baloo 2',
            fontSize: 12,
            marginBottom: 8,
            boxSizing: 'border-box',
          }}
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="descrição (opcional)"
          rows={2}
          style={{
            width: '100%',
            padding: '9px 12px',
            borderRadius: 10,
            border: '1.5px solid rgba(139,105,20,0.25)',
            fontFamily: 'Baloo 2',
            fontSize: 12,
            marginBottom: 10,
            resize: 'none',
            boxSizing: 'border-box',
          }}
        />

        <div style={{ fontSize: 11, fontWeight: 700, color: '#8b6914', marginBottom: 6 }}>
          nível de recompensa
        </div>
        <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
          {(['leve', 'medio', 'alto'] as ActivityTier[]).map((t) => (
            <button
              key={t}
              onClick={() => setTier(t)}
              style={{
                flex: 1,
                padding: '7px 0',
                borderRadius: 999,
                border: `1.5px solid ${TIER_COLOR[t]}`,
                background: tier === t ? TIER_COLOR[t] : 'transparent',
                color: tier === t ? '#fff' : TIER_COLOR[t],
                fontWeight: 800,
                fontSize: 11,
                cursor: 'pointer',
                fontFamily: 'Baloo 2',
              }}
            >
              {TIER_LABEL[t]}
            </button>
          ))}
        </div>

        {tier === 'medio' && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#8b6914', marginBottom: 6 }}>
              recompensa
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <MiniBtn
                onClick={() => setRewardType('coins')}
                icon={<Coins size={14} />}
                label="20 moedas"
                muted={rewardType !== 'coins'}
                full
              />
              <MiniBtn
                onClick={() => setRewardType('pack')}
                icon={<Package size={14} />}
                label="1 pacote"
                muted={rewardType !== 'pack'}
                full
              />
            </div>
          </div>
        )}

        {error && (
          <div style={{ fontSize: 11, color: '#e8607a', marginBottom: 8, fontWeight: 700 }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: 8 }}>
          <MiniBtn onClick={onClose} icon={<XCircle size={14} />} label="cancelar" muted full />
          <MiniBtn onClick={handleSubmit} icon={<Sparkles size={14} />} label="criar" full />
        </div>
      </div>
    </div>
  )
}
