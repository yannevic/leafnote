import { ref, set, get, push, remove, onValue, off, update } from 'firebase/database'
import { db } from './firebase'

export type FlowerType =
  | 'rosa'
  | 'margarida'
  | 'tulipa'
  | 'girassol'
  | 'orquidea'
  | 'lirio'
  | 'jasmin'
  | 'violeta'
  | 'peonia'
  | 'papoula'
  | 'lavanda'
  | 'especial'
export type FlowerRarity = 'comum' | 'incomum' | 'rara' | 'epica'

export interface FlowerInfo {
  type: FlowerType
  name: string
  rarity: FlowerRarity
  emoji: string
}

export const FLOWERS: Record<FlowerType, FlowerInfo> = {
  rosa: { type: 'rosa', name: 'Rosa', rarity: 'comum', emoji: '🌸' },
  margarida: { type: 'margarida', name: 'Margarida', rarity: 'comum', emoji: '🌼' },
  peonia: { type: 'peonia', name: 'Peônia', rarity: 'comum', emoji: '🌸' },
  papoula: { type: 'papoula', name: 'Papoula', rarity: 'comum', emoji: '🌺' },
  lavanda: { type: 'lavanda', name: 'Lavanda', rarity: 'comum', emoji: '💜' },
  tulipa: { type: 'tulipa', name: 'Tulipa', rarity: 'incomum', emoji: '🌷' },
  girassol: { type: 'girassol', name: 'Girassol', rarity: 'incomum', emoji: '🌻' },
  jasmin: { type: 'jasmin', name: 'Jasmim', rarity: 'incomum', emoji: '🤍' },
  violeta: { type: 'violeta', name: 'Violeta', rarity: 'incomum', emoji: '💜' },
  orquidea: { type: 'orquidea', name: 'Orquídea', rarity: 'rara', emoji: '🌺' },
  lirio: { type: 'lirio', name: 'Lírio', rarity: 'rara', emoji: '🌸' },
  especial: { type: 'especial', name: 'Flor Épica', rarity: 'epica', emoji: '🌸' },
}

export const RARITY_COLORS: Record<FlowerRarity, string> = {
  comum: '#7fb87f',
  incomum: '#8b6914',
  rara: '#c87090',
  epica: '#7a3040',
}

export interface SeedData {
  id: string
  flowerType: FlowerType
  gainedAt: string
}

export interface PlantData {
  id: string
  flowerType: FlowerType
  stage: number
  daysWatered: number
  lastWateredDate: string
  waterDate?: string
  water: Record<string, boolean>
  wilted: boolean
  plantedAt: string
}

export interface StageEvent {
  id: string
  plantId: string
  plantName: string
  newStage: number
  rolls: Record<string, number>
  claimedBy: Record<string, boolean>
  createdAt: string
}

// ─── Subscribes ──────────────────────────────────────────────────────────────

export function subscribePlants(callback: (plants: PlantData[]) => void): () => void {
  const r = ref(db, 'garden/plants')
  const handler = onValue(r, (snap) => {
    const val = snap.val() as Record<string, PlantData> | null
    const list = val ? Object.entries(val).map(([id, p]) => ({ ...p, id })) : []
    callback(list)
  })
  return () => off(r, 'value', handler)
}

export function subscribeSeeds(callback: (seeds: SeedData[]) => void): () => void {
  const r = ref(db, 'garden/seeds')
  const handler = onValue(r, (snap) => {
    const val = snap.val() as Record<string, SeedData> | null
    const list = val ? Object.entries(val).map(([id, s]) => ({ ...s, id })) : []
    callback(list)
  })
  return () => off(r, 'value', handler)
}

export function subscribeStageEvents(callback: (events: StageEvent[]) => void): () => void {
  const r = ref(db, 'garden/stageEvents')
  const handler = onValue(r, (snap) => {
    const val = snap.val() as Record<string, StageEvent> | null
    const list = val ? Object.entries(val).map(([id, e]) => ({ ...e, id })) : []
    callback(list)
  })
  return () => off(r, 'value', handler)
}

export function subscribePanicMode(callback: (active: boolean) => void): () => void {
  const r = ref(db, 'garden/panicMode')
  const handler = onValue(r, (snap) => {
    callback(snap.val() === true)
  })
  return () => off(r, 'value', handler)
}

export function subscribeWelcomeSeedGiven(callback: (given: boolean) => void): () => void {
  const r = ref(db, 'garden/welcomeSeedGiven')
  const handler = onValue(r, (snap) => {
    callback(snap.val() === true)
  })
  return () => off(r, 'value', handler)
}

// ─── Seeds ────────────────────────────────────────────────────────────────────

export async function addSeed(flowerType: FlowerType): Promise<void> {
  const seedsRef = ref(db, 'garden/seeds')
  const newRef = push(seedsRef)
  const seed: SeedData = {
    id: newRef.key!,
    flowerType,
    gainedAt: new Date().toISOString(),
  }
  await set(newRef, seed)
}

// ─── Plants ───────────────────────────────────────────────────────────────────

export async function plantSeed(seedId: string, flowerType: FlowerType): Promise<void> {
  const plantsRef = ref(db, 'garden/plants')
  const newRef = push(plantsRef)
  const plant: PlantData = {
    id: newRef.key!,
    flowerType,
    stage: 1,
    daysWatered: 0,
    lastWateredDate: '',
    water: {},
    wilted: false,
    plantedAt: new Date().toISOString(),
  }
  await set(newRef, plant)
  await remove(ref(db, `garden/seeds/${seedId}`))
}

export async function waterPlant(
  plantId: string,
  uid: string,
  partnerUid: string,
  panicMode: boolean
): Promise<void> {
  const plantRef = ref(db, `garden/plants/${plantId}`)
  const snap = await get(plantRef)
  if (!snap.exists()) return
  const plant = snap.val() as PlantData

  if (plant.stage >= 5) return

  const today = new Date().toLocaleDateString('en-CA')

  if (plant.water?.[uid] === true && plant.waterDate === today) return

  await update(plantRef, {
    [`water/${uid}`]: true,
    waterDate: today,
  })

  const snapAfter = await get(plantRef)
  if (!snapAfter.exists()) return
  const updated = snapAfter.val() as PlantData

  const bothWatered = panicMode
    ? true
    : updated.water?.[uid] === true && updated.water?.[partnerUid] === true

  if (!bothWatered) return

  const rarity = FLOWERS[plant.flowerType].rarity
  const daysNeeded = DAYS_PER_STAGE[rarity]
  const newDaysWatered = plant.daysWatered + 1
  const newStage = Math.min(5, Math.floor(newDaysWatered / daysNeeded) + 1)

  await update(plantRef, {
    lastWateredDate: today,
    waterDate: today,
    daysWatered: newDaysWatered,
    stage: newStage,
    wilted: false,
    [`water/${uid}`]: null,
    [`water/${partnerUid}`]: null,
  })

  if (newStage > plant.stage) {
    await createStageEvent(plantId, plant.flowerType, newStage)
  }
}

export async function resetPlantWater(plantId: string): Promise<void> {
  const plantRef = ref(db, `garden/plants/${plantId}`)
  await update(plantRef, { water: null, waterDate: null })
}

async function createStageEvent(
  plantId: string,
  flowerType: FlowerType,
  newStage: number
): Promise<void> {
  const eventsRef = ref(db, 'garden/stageEvents')
  const newRef = push(eventsRef)
  const event: StageEvent = {
    id: newRef.key!,
    plantId,
    plantName: FLOWERS[flowerType].name,
    newStage,
    rolls: {},
    claimedBy: {},
    createdAt: new Date().toISOString(),
  }
  await set(newRef, event)
}

// ─── Stage event — salvar roll e verificar conclusão ─────────────────────────

export async function saveEventRoll(
  eventId: string,
  uid: string,
  roll: number,
  partnerUid: string,
  panicMode: boolean
): Promise<{ done: boolean; flowerType: FlowerType | null }> {
  const eventRef = ref(db, `garden/stageEvents/${eventId}`)
  const snap = await get(eventRef)
  if (!snap.exists()) return { done: false, flowerType: null }
  const event = snap.val() as StageEvent

  const updatedRolls = { ...(event.rolls ?? {}), [uid]: roll }
  await update(eventRef, { rolls: updatedRolls })

  const partnerRoll = updatedRolls[partnerUid]
  const myRoll = updatedRolls[uid]

  const bothRolled = panicMode ? true : partnerRoll != null && myRoll != null

  if (!bothRolled) return { done: false, flowerType: null }

  // Soma dos dois rolls (ou dobra o único roll no modo pânico)
  const sum = panicMode ? myRoll : myRoll + partnerRoll
  const flowerType = getFlowerFromSum(sum)

  await addSeed(flowerType)
  await remove(eventRef)

  return { done: true, flowerType }
}

// ─── Welcome seed ─────────────────────────────────────────────────────────────

export async function checkWelcomeSeed(): Promise<boolean> {
  const snap = await get(ref(db, 'garden/welcomeSeedGiven'))
  return snap.val() === true
}

export async function claimWelcomeSeed(roll: number, panicMode: boolean): Promise<FlowerType> {
  const sum = panicMode ? roll * 2 : roll
  const flowerType = getFlowerFromSum(sum)
  await addSeed(flowerType)
  await set(ref(db, 'garden/welcomeSeedGiven'), true)
  return flowerType
}

// Salva o roll do welcome sem concluir ainda (aguarda parceiro)
export async function saveWelcomeRoll(
  uid: string,
  roll: number,
  partnerUid: string,
  panicMode: boolean
): Promise<{ done: boolean; flowerType: FlowerType | null }> {
  const rollsRef = ref(db, 'garden/welcomeRolls')
  await update(rollsRef, { [uid]: roll })

  const snap = await get(rollsRef)
  const rolls = (snap.val() ?? {}) as Record<string, number>

  const myRoll = rolls[uid]
  const partnerRoll = rolls[partnerUid]
  const bothRolled = panicMode ? true : myRoll != null && partnerRoll != null

  if (!bothRolled) return { done: false, flowerType: null }

  const sum = panicMode ? myRoll * 2 : myRoll + partnerRoll
  const flowerType = getFlowerFromSum(sum)

  await addSeed(flowerType)
  await set(ref(db, 'garden/welcomeSeedGiven'), true)
  await remove(rollsRef)

  return { done: true, flowerType }
}

// ─── Panic mode ───────────────────────────────────────────────────────────────

export async function setPanicMode(active: boolean): Promise<void> {
  await set(ref(db, 'garden/panicMode'), active)
}

// ─── Wilt check ───────────────────────────────────────────────────────────────

export async function checkWiltAll(): Promise<void> {
  const plantsRef = ref(db, 'garden/plants')
  const snap = await get(plantsRef)
  if (!snap.exists()) return
  const plants = snap.val() as Record<string, PlantData>
  const now = new Date()
  await Promise.all(
    Object.entries(plants).map(async ([id, plant]) => {
      if (plant.stage >= 5) return
      if (!plant.lastWateredDate) return
      const last = new Date(plant.lastWateredDate)
      const diffHours = (now.getTime() - last.getTime()) / (1000 * 60 * 60)
      if (diffHours >= 48 && !plant.wilted) {
        const newDaysWatered = Math.max(0, plant.daysWatered - 1)
        const today = now.toISOString().split('T')[0]
        await update(ref(db, `garden/plants/${id}`), {
          wilted: true,
          daysWatered: newDaysWatered,
          lastWateredDate: today,
          waterDate: today,
        })
      }
    })
  )
}

// ─── Seed Exchange ────────────────────────────────────────────────────────────

export const TIER_ORDER: FlowerRarity[] = ['comum', 'incomum', 'rara']

export const MAX_PLANTS = 4
export const BASE_MAX_PLANTS = 4

export const DAYS_PER_STAGE: Record<FlowerRarity, number> = {
  comum: 2,
  incomum: 3,
  rara: 5,
  epica: 6,
}

export const SEED_SELL_VALUE: Record<FlowerRarity, number> = {
  comum: 2,
  incomum: 5,
  rara: 14,
  epica: 40,
}

export const FLOWER_SELL_VALUE: Record<FlowerRarity, number> = {
  comum: 6,
  incomum: 18,
  rara: 55,
  epica: 180,
}

export const EXCHANGE_COST: Record<FlowerRarity, number> = {
  comum: 5,
  incomum: 6,
  rara: 7,
  epica: 999,
}

export function getExchangeOptions(tier: FlowerRarity, selectedTypes: FlowerType[]): FlowerType[] {
  const sameTier = (Object.values(FLOWERS) as FlowerInfo[])
    .filter((f) => f.rarity === tier && !selectedTypes.includes(f.type) && f.type !== 'especial')
    .map((f) => f.type)

  const tierIndex = TIER_ORDER.indexOf(tier)
  const nextTier = TIER_ORDER[tierIndex + 1]
  const nextTierFlowers = nextTier
    ? (Object.values(FLOWERS) as FlowerInfo[])
        .filter((f) => f.rarity === nextTier && f.type !== 'especial')
        .map((f) => f.type)
    : []

  return [...sameTier, ...nextTierFlowers]
}

export async function exchangeSeeds(seedIds: string[], rewardType: FlowerType): Promise<void> {
  await Promise.all(seedIds.map((id) => remove(ref(db, `garden/seeds/${id}`))))
  await addSeed(rewardType)
  const coinsRef = ref(db, 'garden/coins')
  const snap = await get(coinsRef)
  if (!snap.exists()) await set(coinsRef, 0)
}

export async function getCoins(): Promise<number> {
  const snap = await get(ref(db, 'garden/coins'))
  return (snap.val() as number) ?? 0
}

export async function addCoins(amount: number): Promise<void> {
  const coinsRef = ref(db, 'garden/coins')
  const snap = await get(coinsRef)
  const current = (snap.val() as number) ?? 0
  await set(coinsRef, current + amount)
}

export async function sellSeed(seedId: string, flowerType: FlowerType): Promise<number> {
  const rarity = FLOWERS[flowerType].rarity
  const value = SEED_SELL_VALUE[rarity]
  await remove(ref(db, `garden/seeds/${seedId}`))
  await addCoins(value)
  return value
}

export async function sellFlower(plantId: string, flowerType: FlowerType): Promise<number> {
  const rarity = FLOWERS[flowerType].rarity
  const value = FLOWER_SELL_VALUE[rarity]
  await remove(ref(db, `garden/plants/${plantId}`))
  await addCoins(value)
  return value
}

export function subscribeCoins(callback: (coins: number) => void): () => void {
  const r = ref(db, 'garden/coins')
  const handler = onValue(r, (snap) => {
    callback((snap.val() as number) ?? 0)
  })
  return () => off(r, 'value', handler)
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function rollDice(): number {
  return Math.floor(Math.random() * 6) + 1
}

const COMMON_FLOWERS: FlowerType[] = ['rosa', 'margarida', 'peonia', 'papoula', 'lavanda']
const UNCOMMON_FLOWERS: FlowerType[] = ['tulipa', 'girassol', 'jasmin', 'violeta']
const RARE_FLOWERS: FlowerType[] = ['orquidea', 'lirio']

function randomFrom(arr: FlowerType[]): FlowerType {
  return arr[Math.floor(Math.random() * arr.length)]
}

export function getFlowerFromSum(sum: number): FlowerType {
  if (sum <= 5) return randomFrom(COMMON_FLOWERS)
  if (sum <= 8) return randomFrom(COMMON_FLOWERS)
  if (sum <= 10) return randomFrom(UNCOMMON_FLOWERS)
  if (sum <= 11) return randomFrom(UNCOMMON_FLOWERS)
  return randomFrom(RARE_FLOWERS)
}

export function canPlantToday(plants: PlantData[]): boolean {
  const today = new Date().toLocaleDateString('en-CA')
  return !plants.some((p) => p.plantedAt.startsWith(today))
}
