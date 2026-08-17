import { ref, push, remove, onValue, off, set } from 'firebase/database'
import { db } from './firebase'
import { addCoins as addPersonalCoins } from './personalCoin'
import { grantPack } from './unopenedPacks'
import { ACTIVITY_REWARD } from './economyConfig'

export type ActivityTier = 'leve' | 'medio' | 'alto'
export type ActivityRewardType = 'coins' | 'pack' // só relevante pro tier 'medio'

export interface FixedActivity {
  id: string
  name: string
  tier: ActivityTier
}

export const FIXED_ACTIVITIES: FixedActivity[] = [
  { id: 'exercicio', name: 'Fazer exercício', tier: 'leve' },
  { id: 'sair-fazer-algo', name: 'Sair pra fazer algo', tier: 'leve' },
  { id: 'diario-casal', name: 'Diário do casal', tier: 'leve' },
  { id: 'caminhada', name: 'Fazer uma caminhada', tier: 'leve' },
  { id: 'estudar-juntos', name: 'Estudar juntos', tier: 'leve' },
  { id: 'aprender-algo-novo', name: 'Aprender algo novo juntos', tier: 'medio' },
  { id: 'piquenique', name: 'Piquenique', tier: 'medio' },
  { id: 'encontro', name: 'Sair num encontro', tier: 'alto' },
]

export interface PendingActivity {
  id: string
  name: string
  description?: string
  tier: ActivityTier
  rewardType: ActivityRewardType // irrelevante pra 'leve'/'alto', usado só em 'medio'
  custom: boolean
  createdBy: string
  createdAt: number
}

export async function addPendingActivity(
  coupleId: string,
  data: Omit<PendingActivity, 'id' | 'createdAt'>
): Promise<void> {
  const activitiesRef = ref(db, `couples/${coupleId}/cards/activities`)
  await push(activitiesRef, { ...data, createdAt: Date.now() })
}

export async function removePendingActivity(coupleId: string, activityId: string): Promise<void> {
  await remove(ref(db, `couples/${coupleId}/cards/activities/${activityId}`))
}

export function subscribePendingActivities(
  coupleId: string,
  callback: (activities: PendingActivity[]) => void
): () => void {
  const activitiesRef = ref(db, `couples/${coupleId}/cards/activities`)
  const handler = onValue(activitiesRef, (snap) => {
    const val = (snap.val() ?? {}) as Record<string, Omit<PendingActivity, 'id'>>
    const list = Object.entries(val)
      .map(([id, a]) => ({ ...a, id }))
      .sort((a, b) => a.createdAt - b.createdAt)
    callback(list)
  })
  return () => off(activitiesRef, 'value', handler)
}

// credita a recompensa pros dois uids, avisa o parceiro (lastActivityCompleted)
// e remove a pendência. Qualquer um dos dois pode chamar isso.
export async function confirmActivity(
  coupleId: string,
  activity: PendingActivity,
  uid: string,
  partnerUid: string
): Promise<void> {
  const reason = `atividade: ${activity.name}`

  if (activity.tier === 'leve') {
    await addPersonalCoins(uid, ACTIVITY_REWARD.leve, reason)
    if (partnerUid) await addPersonalCoins(partnerUid, ACTIVITY_REWARD.leve, reason)
  }

  if (activity.tier === 'medio') {
    if (activity.rewardType === 'pack') {
      await grantPack(coupleId, uid, 'comum')
      if (partnerUid) await grantPack(coupleId, partnerUid, 'comum')
    } else {
      await addPersonalCoins(uid, ACTIVITY_REWARD.medio, reason)
      if (partnerUid) await addPersonalCoins(partnerUid, ACTIVITY_REWARD.medio, reason)
    }
  }

  if (activity.tier === 'alto') {
    await addPersonalCoins(uid, ACTIVITY_REWARD.alto, reason)
    if (partnerUid) await addPersonalCoins(partnerUid, ACTIVITY_REWARD.alto, reason)
    await grantPack(coupleId, uid, 'comum')
    if (partnerUid) await grantPack(coupleId, partnerUid, 'comum')
  }

  // avisa o parceiro via notificação (useNotificationCenter escuta esse nó)
  await set(ref(db, `couples/${coupleId}/cards/lastActivityCompleted`), {
    id: `${activity.id}-${Date.now()}`,
    name: activity.name,
    completedBy: uid,
    completedAt: Date.now(),
  })

  await removePendingActivity(coupleId, activity.id)
}
