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

export function useGarden(coupleId: string, uid: string, partnerUid: string) {
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
    const unsubPlants = subscribePlants(coupleId, (data: PlantData[]) => {
      const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' })
      data.forEach((plant) => {
        if (
          plant.water &&
          Object.keys(plant.water).length > 0 &&
          (plant as PlantData & { waterDate?: string }).waterDate !== today
        ) {
          resetPlantWater(coupleId, plant.id)
        }
      })
      setPlants(data)
      setLoading(false)
    })
    const unsubSeeds = subscribeSeeds(coupleId, setSeeds)
    const unsubEvents = subscribeStageEvents(coupleId, setStageEvents)
    const unsubPanic = subscribePanicMode(coupleId, setPanicModeState)
    const unsubWelcome = subscribeWelcomeSeedGiven(coupleId, setWelcomeGiven)
    checkWiltAll(coupleId)
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
    const r = ref(db, `couples/${coupleId}/garden/welcomeRolls`)
    const handler = onValue(r, (snap) => {
      setWelcomeRolls((snap.val() as Record<string, number>) ?? {})
    })
    return () => off(r, 'value', handler)
  }, [])

  useEffect(() => {
    const unsub = subscribeCoins(coupleId, setCoins)
    return unsub
  }, [])

  useEffect(() => {
    const unsub = subscribeMaxPlants(coupleId, setMaxPlants)
    return unsub
  }, [])

  const water = async (plantId: string) => {
    await waterPlant(coupleId, plantId, uid, partnerUid, panicMode)
  }
  const plant = async (seedId: string, flowerType: FlowerType) => {
    await plantSeed(coupleId, seedId, flowerType)
  }
  const addNewSeed = async (flowerType: FlowerType) => {
    await addSeed(coupleId, flowerType)
  }

  const alreadyWatered = (plantId: string) => {
    const p = plants.find((x) => x.id === plantId)
    if (!p) return false
    return (p.water ?? {})[uid] === true
  }

  const partnerWatered = (plantId: string) => {
    const p = plants.find((x) => x.id === plantId)
    if (!p) return false
    return (p.water ?? {})[partnerUid] === true
  }

  // Eventos onde este uid ainda não rolou
  const pendingEvents = stageEvents.filter((e) => e.rolls?.[uid] == null)
  const currentEvent = pendingEvents[0] ?? null

  const rollForEvent = async (
    eventId: string,
    roll: number
  ): Promise<{ done: boolean; flowerType: FlowerType | null }> => {
    return saveEventRoll(coupleId, eventId, uid, roll, partnerUid, panicMode)
  }

  const rollForWelcome = async (
    roll: number
  ): Promise<{ done: boolean; flowerType: FlowerType | null }> => {
    return saveWelcomeRoll(coupleId, uid, roll, partnerUid, panicMode)
  }

  const togglePanic = async () => {
    await setPanicMode(coupleId, !panicMode)
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
    return sellSeed(coupleId, seedId, flowerType, uid, partnerUid)
  }

  const handleSellFlower = async (plantId: string, flowerType: FlowerType): Promise<number> => {
    await recordFlowerHistory(flowerType, coupleId)
    return sellFlower(coupleId, plantId, flowerType, uid, partnerUid)
  }

  const handleRemovePlant = async (plantId: string): Promise<void> => {
    await remove(ref(db, `couples/${coupleId}/garden/plants/${plantId}`))
  }

  const handleBuySlot = async (): Promise<{ success: boolean; cost: number }> => {
    return buySlot(coupleId, maxPlants, coins)
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
