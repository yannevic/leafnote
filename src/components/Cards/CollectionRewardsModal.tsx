// src/components/Cards/CollectionRewardsModal.tsx
import { useState } from 'react'
import { X, Award, Coins, Package, Sparkles, Check } from 'lucide-react'
import { COLLECTIONS, CardDefinition } from '../../lib/cards'
import { COLLECTION_COMPLETE_COINS } from '../../lib/economyConfig'
import {
  PendingCollectionReward,
  claimBadgeReward,
  claimCoinsReward,
  claimPackReward,
  claimSpecialCardReward,
} from '../../lib/collectionRewards'
import type { SpecialCardDefinition } from '../../lib/specialCards'
import PackOpenModal from './PackOpenModal'
import SpecialCardRevealModal from './SpecialCardRevealModal'

interface Props {
  coupleId: string
  uid: string
  collectionId: string
  reward: PendingCollectionReward
  onClose: () => void
}

export default function CollectionRewardsModal({
  coupleId,
  uid,
  collectionId,
  reward,
  onClose,
}: Props) {
  const [claiming, setClaiming] = useState<string | null>(null)
  const [chosenPackCollection, setChosenPackCollection] = useState<string>(
    Object.keys(COLLECTIONS).find((id) => id !== collectionId) ?? collectionId
  )
  const [packResult, setPackResult] = useState<CardDefinition[] | null>(null)
  const [specialCardResult, setSpecialCardResult] = useState<SpecialCardDefinition | null>(null)

  const collectionName = COLLECTIONS[collectionId as keyof typeof COLLECTIONS]?.name ?? collectionId
  const allClaimed = Object.values(reward.claimed).every(Boolean)

  async function handleClaimBadge() {
    setClaiming('badge')
    await claimBadgeReward(coupleId, uid, collectionId)
    setClaiming(null)
  }

  async function handleClaimCoins() {
    setClaiming('coins')
    await claimCoinsReward(coupleId, uid, collectionId)
    setClaiming(null)
  }

  async function handleClaimPack() {
    setClaiming('pack')
    const cards = await claimPackReward(coupleId, uid, collectionId, chosenPackCollection)
    setClaiming(null)
    setPackResult(cards)
  }

  async function handleClaimCard() {
    setClaiming('card')
    const card = await claimSpecialCardReward(coupleId, uid, collectionId)
    setClaiming(null)
    setSpecialCardResult(card)
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999999,
        background: 'rgba(61,26,16,0.4)',
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
          width: 340,
          maxHeight: '80vh',
          overflowY: 'auto',
          background: 'linear-gradient(160deg, #FBEAF0 0%, #F5ECD7 100%)',
          border: '1.5px solid rgba(232,160,176,0.4)',
          borderRadius: 20,
          padding: 22,
          fontFamily: 'Baloo 2, sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 4,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: '#8B6914',
                textTransform: 'uppercase',
              }}
            >
              coleção completa!
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#2D4A2D' }}>{collectionName}</div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 26,
              height: 26,
              borderRadius: '50%',
              border: 'none',
              background: 'rgba(200,120,140,0.18)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <X size={13} color="rgba(122,48,64,0.7)" />
          </button>
        </div>

        <p style={{ fontSize: 12, color: 'rgba(61,26,16,0.6)', marginBottom: 18 }}>
          resgate cada prêmio abaixo, na ordem que quiser.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* Insígnia */}
          <RewardRow
            icon={<Award size={18} />}
            label="insígnia"
            description="disponível pra colocar no seu perfil"
            claimed={reward.claimed.badge}
            loading={claiming === 'badge'}
            onClaim={handleClaimBadge}
          />

          {/* Moedas */}
          <RewardRow
            icon={<Coins size={18} />}
            label={`${COLLECTION_COMPLETE_COINS} moedas`}
            description="creditadas na sua moeda pessoal"
            claimed={reward.claimed.coins}
            loading={claiming === 'coins'}
            onClaim={handleClaimCoins}
          />

          {/* Mini-pacote */}
          <div
            style={{
              border: '1.5px solid rgba(232,160,176,0.35)',
              borderRadius: 14,
              padding: 12,
              opacity: reward.claimed.pack ? 0.55 : 1,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                marginBottom: reward.claimed.pack ? 0 : 10,
              }}
            >
              <Package size={18} color="#4A7A4A" />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#3d1a10' }}>
                  mini-pacote (3 cartas)
                </div>
                <div style={{ fontSize: 10.5, color: 'rgba(61,26,16,0.55)' }}>
                  escolha de qual coleção
                </div>
              </div>
              {reward.claimed.pack && <Check size={16} color="#4A7A4A" />}
            </div>
            {!reward.claimed.pack && (
              <>
                <select
                  value={chosenPackCollection}
                  onChange={(e) => setChosenPackCollection(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '7px 10px',
                    borderRadius: 10,
                    border: '1.5px solid rgba(212,160,176,0.5)',
                    fontFamily: 'Baloo 2',
                    fontSize: 12,
                    color: '#3d1a10',
                    marginBottom: 8,
                  }}
                >
                  {Object.values(COLLECTIONS)
                    .filter((c) => c.id !== 'especiais-clima')
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                </select>
                <ClaimButton loading={claiming === 'pack'} onClick={handleClaimPack} />
              </>
            )}
          </div>

          {/* Carta especial */}
          <RewardRow
            icon={<Sparkles size={18} />}
            label="carta especial"
            description="sorteada da Coleção de Cartas Especial"
            claimed={reward.claimed.card}
            loading={claiming === 'card'}
            onClaim={handleClaimCard}
          />
        </div>

        {allClaimed && (
          <p
            style={{
              marginTop: 16,
              textAlign: 'center',
              fontSize: 12,
              fontWeight: 700,
              color: '#4A7A4A',
            }}
          >
            todas as recompensas resgatadas! ✓
          </p>
        )}
      </div>

      {packResult && (
        <PackOpenModal cards={packResult} ownedBefore={{}} onClose={() => setPackResult(null)} />
      )}
      {specialCardResult && (
        <SpecialCardRevealModal
          card={specialCardResult}
          onClose={() => setSpecialCardResult(null)}
        />
      )}
    </div>
  )
}

function RewardRow({
  icon,
  label,
  description,
  claimed,
  loading,
  onClaim,
}: {
  icon: React.ReactNode
  label: string
  description: string
  claimed: boolean
  loading: boolean
  onClaim: () => void
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        border: '1.5px solid rgba(232,160,176,0.35)',
        borderRadius: 14,
        padding: 12,
        opacity: claimed ? 0.55 : 1,
      }}
    >
      <div style={{ color: '#4A7A4A', flexShrink: 0 }}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: '#3d1a10' }}>{label}</div>
        <div style={{ fontSize: 10.5, color: 'rgba(61,26,16,0.55)' }}>{description}</div>
      </div>
      {claimed ? (
        <Check size={16} color="#4A7A4A" />
      ) : (
        <ClaimButton loading={loading} onClick={onClaim} />
      )}
    </div>
  )
}

function ClaimButton({ loading, onClick }: { loading: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      style={{
        flexShrink: 0,
        padding: '7px 14px',
        borderRadius: 999,
        border: 'none',
        background: '#4A7A4A',
        color: '#fff',
        fontWeight: 800,
        fontSize: 11.5,
        cursor: loading ? 'default' : 'pointer',
        fontFamily: 'Baloo 2',
      }}
    >
      {loading ? '...' : 'resgatar'}
    </button>
  )
}
