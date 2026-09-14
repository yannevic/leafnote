// src/lib/collectionRewards.ts
//
// Orquestra a recompensa de "coleção completa" (seção 25 do Plano de
// Cartinhas): detecta quando uma coleção normal fecha 100%, libera uma
// lista de 4 prêmios resgatáveis individualmente (badge/moedas/pacote/
// carta especial), e executa o resgate de cada um separadamente.

import { ref, get, set, push, remove, runTransaction, onValue, off } from 'firebase/database'
import { db } from './firebase'
import { CARDS, COLLECTIONS, CardDefinition } from './cards'
import { CardRarity } from './rarity'
import { PACK_ODDS } from './dropRates'
import { unlockBadge } from './profileBadges'
import { addCoins } from './personalCoin'
import { addPendingCards, addPendingSpecialCard } from './pendingCards'
import { drawRandomSpecialCard, SpecialCardDefinition } from './specialCards'
import { COLLECTION_COMPLETE_COINS } from './economyConfig'

const MINI_PACK_SIZE = 3 // mesmo valor do plano, seção 25.5 item 3

export interface ClaimedRewards {
  badge: boolean
  coins: boolean
  pack: boolean
  card: boolean
}

export interface PendingCollectionReward {
  collectionId: string
  claimed: ClaimedRewards
  unlockedAt: number
}

export interface SpecialCardInventoryEntry {
  quantity: number
  lastAcquiredAt: number
}

function rewardRef(coupleId: string, uid: string, collectionId: string) {
  return ref(db, `couples/${coupleId}/cards/specialCards/pendingRewards/${uid}/${collectionId}`)
}

// contagem por uid, excluindo secret:true — mesma regra já usada no
// desbloqueio de badge do Perfil Pessoal
async function isCollectionComplete(
  coupleId: string,
  uid: string,
  collectionId: string
): Promise<boolean> {
  const collection = COLLECTIONS[collectionId as keyof typeof COLLECTIONS]
  if (!collection) return false
  const invSnap = await get(ref(db, `couples/${coupleId}/cards/inventory/${uid}/${collectionId}`))
  const inventory = (invSnap.val() as Record<string, number>) ?? {}
  const collectionCards = CARDS.filter((c) => c.collectionId === collectionId && !c.secret)
  const ownedCount = collectionCards.filter((c) => (inventory[c.id] ?? 0) > 0).length
  return ownedCount >= collection.total
}

// chamar depois de QUALQUER crédito no inventário normal (hoje só
// placePendingCard, em lib/pendingCards.ts). Só CRIA o registro pendente
// com os 4 itens por resgatar — não credita nada ainda. Idempotente: não
// faz nada se a coleção já tinha sido completada antes (evita reabrir a
// lista de prêmios toda vez que uma carta nova entra depois da coleção
// já fechada). ⚠️ Este node NUNCA é apagado depois de criado — é também a
// fonte do indicativo permanente "coleção completa" no CollectionGrid.tsx.
export async function unlockCollectionRewardIfComplete(
  coupleId: string,
  uid: string,
  collectionId: string
): Promise<boolean> {
  const existing = await get(rewardRef(coupleId, uid, collectionId))
  if (existing.exists()) return false

  const complete = await isCollectionComplete(coupleId, uid, collectionId)
  if (!complete) return false

  const reward: PendingCollectionReward = {
    collectionId,
    claimed: { badge: false, coins: false, pack: false, card: false },
    unlockedAt: Date.now(),
  }
  await set(rewardRef(coupleId, uid, collectionId), reward)
  return true
}

export function subscribeCollectionReward(
  coupleId: string,
  uid: string,
  collectionId: string,
  callback: (reward: PendingCollectionReward | null) => void
) {
  const r = rewardRef(coupleId, uid, collectionId)
  const listener = onValue(r, (snap) => {
    queueMicrotask(() => callback((snap.val() as PendingCollectionReward) ?? null))
  })
  return () => off(r, 'value', listener)
}

async function markClaimed(
  coupleId: string,
  uid: string,
  collectionId: string,
  key: keyof ClaimedRewards
) {
  await runTransaction(rewardRef(coupleId, uid, collectionId), (current) => {
    if (!current) return current
    return { ...current, claimed: { ...current.claimed, [key]: true } }
  })
}

export async function claimBadgeReward(coupleId: string, uid: string, collectionId: string) {
  await unlockBadge(uid, collectionId)
  await markClaimed(coupleId, uid, collectionId, 'badge')
}

export async function claimCoinsReward(coupleId: string, uid: string, collectionId: string) {
  const name = COLLECTIONS[collectionId as keyof typeof COLLECTIONS]?.name ?? collectionId
  await addCoins(uid, COLLECTION_COMPLETE_COINS, `coleção completa: ${name}`)
  await markClaimed(coupleId, uid, collectionId, 'coins')
}

function weightedRarity(): CardRarity {
  const pool = Object.keys(PACK_ODDS) as CardRarity[]
  const weights = pool.map((r) => PACK_ODDS[r])
  const total = weights.reduce((a, b) => a + b, 0)
  let roll = Math.random() * total
  for (let i = 0; i < pool.length; i++) {
    roll -= weights[i]
    if (roll <= 0) return pool[i]
  }
  return pool[pool.length - 1]
}

function drawMiniPackCards(chosenCollectionId: string): CardDefinition[] {
  const pool = CARDS.filter((c) => c.collectionId === chosenCollectionId)
  const cards: CardDefinition[] = []
  for (let i = 0; i < MINI_PACK_SIZE; i++) {
    const rarity = weightedRarity()
    const options = pool.filter((c) => c.rarity === rarity)
    const choice =
      options.length > 0
        ? options[Math.floor(Math.random() * options.length)]
        : pool[Math.floor(Math.random() * pool.length)] // fallback defensivo
    cards.push(choice)
  }
  return cards
}

// chosenCollectionId = coleção normal escolhida pela pessoa no momento do
// resgate (dropdown na UI) — mesmas odds/raridade de um pacote normal.
// Continua revelando IMEDIATAMENTE no momento do resgate (PackOpenModal,
// disparado pelo CollectionRewardsModal.tsx) — cai direto em pendingCards
// já revelado, esperando drag até a coleção. Só a carta especial (abaixo)
// virou pacote fechado.
export async function claimPackReward(
  coupleId: string,
  uid: string,
  rewardCollectionId: string,
  chosenCollectionId: string
): Promise<CardDefinition[]> {
  const cards = drawMiniPackCards(chosenCollectionId)
  await addPendingCards(coupleId, uid, cards)
  await markClaimed(coupleId, uid, rewardCollectionId, 'pack')
  return cards
}

// ─── Carta especial: agora vira um PACOTE FECHADO na mochila ──────────
// (antes creditava direto em specialCards/inventory). A pessoa abre quando
// quiser — só então sorteia, e a carta cai solta na mochila, esperando ser
// arrastada até o slot certo na vitrine (placeSpecialPendingCard credita de
// verdade, permitindo repetida sem bloqueio).

export interface SpecialUnopenedPack {
  id: string
  boughtAt: number
}

function specialUnopenedPacksRef(coupleId: string, uid: string) {
  return ref(db, `couples/${coupleId}/cards/specialCards/unopenedPacks/${uid}`)
}

export async function claimSpecialCardReward(
  coupleId: string,
  uid: string,
  rewardCollectionId: string
): Promise<void> {
  await push(specialUnopenedPacksRef(coupleId, uid), { boughtAt: Date.now() })
  await markClaimed(coupleId, uid, rewardCollectionId, 'card')
}

export function subscribeSpecialUnopenedPacks(
  coupleId: string,
  uid: string,
  callback: (packs: SpecialUnopenedPack[]) => void
) {
  const r = specialUnopenedPacksRef(coupleId, uid)
  const listener = onValue(r, (snap) => {
    const val = snap.val() ?? {}
    const list: SpecialUnopenedPack[] = Object.entries(val).map(([id, v]) => ({
      id,
      boughtAt: (v as { boughtAt: number }).boughtAt,
    }))
    list.sort((a, b) => a.boughtAt - b.boughtAt)
    callback(list)
  })
  return () => off(r, 'value', listener)
}

// abertura: sorteia AGORA (nunca no resgate) e joga a carta solta na
// mochila — nunca credita direto
export async function openSpecialRewardPack(
  coupleId: string,
  uid: string,
  packInstanceId: string
): Promise<SpecialCardDefinition> {
  const card = drawRandomSpecialCard()
  await addPendingSpecialCard(coupleId, uid, card)
  await remove(
    ref(db, `couples/${coupleId}/cards/specialCards/unopenedPacks/${uid}/${packInstanceId}`)
  )
  return card
}

export function subscribeSpecialCardsInventory(
  coupleId: string,
  uid: string,
  callback: (inventory: Record<string, SpecialCardInventoryEntry>) => void
) {
  const r = ref(db, `couples/${coupleId}/cards/specialCards/inventory/${uid}`)
  const listener = onValue(r, (snap) => {
    queueMicrotask(() => callback((snap.val() as Record<string, SpecialCardInventoryEntry>) ?? {}))
  })
  return () => off(r, 'value', listener)
}
