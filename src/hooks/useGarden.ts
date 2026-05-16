import { useState, useEffect } from 'react'
import { ref, onValue, off, remove } from 'firebase/database'
import { db } from '../lib/firebase'
import {
  PlantData,
  SeedData,
  StageEvent,
  FlowerType,
  subscribePlants,
  subscribeSeeds,
  subscribeStageEvents,
  subscribePanicMode,
  subscribeWelcomeSeedGiven,
  waterPlant,
  plantSeed,
  addSeed,
  checkWiltAll,
  canPlantToday,
  saveEventRoll,
  saveWelcomeRoll,
  setPanicMode,
  resetPlantWater,
  subscribeCoins,
  sellSeed,
  sellFlower,
  BASE_MAX_PLANTS,
  subscribeMaxPlants,
  buySlot,
} from '../lib/garden'
import { recordFlowerHistory } from '../lib/achievements'

export function useGarden(uid: string, partnerUid: string) {
  const [plants, setPlants] = useState<PlantData[]>([])
  const [seeds, setSeeds] = useState<SeedData[]>([])
  const [stageEvents, setStageEvents] = useState<StageEvent[]>([])
  const [panicMode, setPanicModeState] = useState(false)
  const [welcomeGiven, setWelcomeGiven] = useState(true)
  const [welcomeRolls, setWelcomeRolls] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [coins, setCoins] = useState(0)
  const [maxPlants, setMaxPlants] = useState(BASE_MAX_PLANTS)

  useEffect(() => {
    const unsubPlants = subscribePlants((data) => {
      const today = new Date().toLocaleDateString('en-CA')
      data.forEach((plant) => {
        if (
          plant.water &&
          Object.keys(plant.water).length > 0 &&
          (plant as PlantData & { waterDate?: string }).waterDate !== today
        ) {
          resetPlantWater(plant.id)
        }
      })
      setPlants(data)
      setLoading(false)
    })
    const unsubSeeds = subscribeSeeds(setSeeds)
    const unsubEvents = subscribeStageEvents(setStageEvents)
    const unsubPanic = subscribePanicMode(setPanicModeState)
    const unsubWelcome = subscribeWelcomeSeedGiven(setWelcomeGiven)
    checkWiltAll()
    return () => {
      unsubPlants()
      unsubSeeds()
      unsubEvents()
      unsubPanic()
      unsubWelcome()
    }
  }, [])

  // Subscribe nos welcomeRolls
  useEffect(() => {
    const r = ref(db, 'garden/welcomeRolls')
    const handler = onValue(r, (snap) => {
      setWelcomeRolls((snap.val() as Record<string, number>) ?? {})
    })
    return () => off(r, 'value', handler)
  }, [])

  useEffect(() => {
    const unsub = subscribeCoins(setCoins)
    return unsub
  }, [])

  useEffect(() => {
    const unsub = subscribeMaxPlants(setMaxPlants)
    return unsub
  }, [])

  const water = async (plantId: string) => {
    await waterPlant(plantId, uid, partnerUid, panicMode)
  }
  const plant = async (seedId: string, flowerType: FlowerType) => {
    await plantSeed(seedId, flowerType)
    await recordFlowerHistory(flowerType)
  }

  const addNewSeed = async (flowerType: FlowerType) => {
    await addSeed(flowerType)
  }

  const alreadyWatered = (plantId: string) => {
    const p = plants.find((x) => x.id === plantId)
    if (!p) return false
    const today = new Date().toLocaleDateString('en-CA')
    if (p.waterDate === today && !p.water?.[uid] && !p.water?.[partnerUid]) return true
    return (p.water ?? {})[uid] === true
  }

  const partnerWatered = (plantId: string) => {
    const p = plants.find((x) => x.id === plantId)
    if (!p) return false
    const today = new Date().toLocaleDateString('en-CA')
    if (p.waterDate === today && !p.water?.[uid] && !p.water?.[partnerUid]) return true
    return (p.water ?? {})[partnerUid] === true
  }

  // Eventos onde este uid ainda não rolou
  const pendingEvents = stageEvents.filter((e) => e.rolls?.[uid] == null)
  const currentEvent = pendingEvents[0] ?? null

  const rollForEvent = async (
    eventId: string,
    roll: number
  ): Promise<{ done: boolean; flowerType: FlowerType | null }> => {
    return saveEventRoll(eventId, uid, roll, partnerUid, panicMode)
  }

  const rollForWelcome = async (
    roll: number
  ): Promise<{ done: boolean; flowerType: FlowerType | null }> => {
    return saveWelcomeRoll(uid, roll, partnerUid, panicMode)
  }

  const togglePanic = async () => {
    await setPanicMode(!panicMode)
  }

  const partnerRolledEvent = (eventId: string) => {
    const event = stageEvents.find((e) => e.id === eventId)
    return event ? event.rolls?.[partnerUid] != null : false
  }

  const canPlant = canPlantToday(plants) && plants.length < maxPlants
  const welcomePending = !welcomeGiven
  const partnerRolledWelcome = welcomeRolls[partnerUid] != null
  const iAlreadyRolledWelcome = welcomeRolls[uid] != null

  const handleSellSeed = async (seedId: string, flowerType: FlowerType): Promise<number> => {
    return sellSeed(seedId, flowerType)
  }

  const handleSellFlower = async (plantId: string, flowerType: FlowerType): Promise<number> => {
    return sellFlower(plantId, flowerType)
  }

  const handleRemovePlant = async (plantId: string): Promise<void> => {
    await remove(ref(db, `garden/plants/${plantId}`))
  }

  const handleBuySlot = async (): Promise<{ success: boolean; cost: number }> => {
    return buySlot(maxPlants, coins)
  }

  return {
    plants,
    seeds,
    loading,
    coins,
    water,
    plant,
    addNewSeed,
    alreadyWatered,
    partnerWatered,
    canPlant,
    currentEvent,
    pendingEvents,
    rollForEvent,
    rollForWelcome,
    panicMode,
    togglePanic,
    welcomePending,
    partnerRolledEvent,
    partnerRolledWelcome,
    iAlreadyRolledWelcome,
    sellSeed: handleSellSeed,
    sellFlower: handleSellFlower,
    removePlant: handleRemovePlant,
    maxPlants,
    buySlot: handleBuySlot,
  }
}
