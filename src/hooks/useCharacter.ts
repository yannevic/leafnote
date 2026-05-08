// src/hooks/useCharacter.ts
import { useEffect, useState, useCallback } from 'react'
import { ref, onValue, set, remove } from 'firebase/database'
import { db } from '../lib/firebase'
import { CharacterConfig, DEFAULT_CHARACTER_CONFIG } from '../assets/character/index'
import {
  FIRST_TIME_UNLOCKED_IDS,
  FIRST_TIME_DEFAULT_CONFIG,
} from '../assets/character/firstTimeConfig'

const MULTI_KEYS: (keyof CharacterConfig)[] = [
  'hair_back',
  'hair_bonus',
  'gloves',
  'beard',
  'accessory',
  'accessory_cima',
  'accessory_topo',
  'jaqueta',
  'tattoo',
  'bottom_over',
]

export interface CharacterPreset {
  id: string
  name: string
  config: CharacterConfig
  createdAt: number
}

function normalizeConfig(raw: Record<string, unknown>): CharacterConfig {
  const config = {
    ...DEFAULT_CHARACTER_CONFIG,
    ...raw,
    colorVariants: (raw.colorVariants as Record<string, string>) ?? {},
  } as unknown as Record<string, unknown>

  for (const key of MULTI_KEYS) {
    const val = raw[key as string]
    if (!val) {
      config[key as string] = []
    } else if (Array.isArray(val)) {
      config[key as string] = (val as string[]).filter(Boolean)
    } else if (typeof val === 'object') {
      config[key as string] = Object.values(val as Record<string, string>).filter(Boolean)
    } else {
      config[key as string] = []
    }
  }

  return config as unknown as CharacterConfig
}

export function useCharacter(uid: string | null) {
  const [config, setConfig] = useState<CharacterConfig>(DEFAULT_CHARACTER_CONFIG)
  const [loading, setLoading] = useState(true)
  const [unlockedIds, setUnlockedIds] = useState<Set<string>>(FIRST_TIME_UNLOCKED_IDS)
  const [presets, setPresets] = useState<CharacterPreset[]>([])

  useEffect(() => {
    if (!uid) {
      setLoading(false)
      return
    }

    const r = ref(db, `users/${uid}/character`)
    const unsub = onValue(r, (snap) => {
      if (snap.exists()) {
        const normalized = normalizeConfig(snap.val() as Record<string, unknown>)
        setConfig(normalized)
        const saved = new Set(FIRST_TIME_UNLOCKED_IDS)
        const singles = [
          'body',
          'hair',
          'bangs',
          'eyebrows',
          'eyelashes',
          'mouth',
          'pupils',
          'top',
          'bottom',
          'dress',
          'shoes',
          'saia_costas',
          'saia_top',
        ] as const
        for (const key of singles) {
          if (normalized[key]) saved.add(normalized[key] as string)
        }
        for (const key of MULTI_KEYS) {
          for (const id of normalized[key as keyof CharacterConfig] as string[]) {
            saved.add(id)
          }
        }
        setUnlockedIds(saved)
      } else {
        setConfig(FIRST_TIME_DEFAULT_CONFIG)
        setUnlockedIds(FIRST_TIME_UNLOCKED_IDS)
      }
      setLoading(false)
    })

    return () => unsub()
  }, [uid])

  useEffect(() => {
    if (!uid) return
    const r = ref(db, `users/${uid}/presets`)
    const unsub = onValue(r, (snap) => {
      if (snap.exists()) {
        const raw = snap.val() as Record<string, Omit<CharacterPreset, 'id'>>
        const list: CharacterPreset[] = Object.entries(raw)
          .map(([id, val]) => ({ id, ...val }))
          .sort((a, b) => a.createdAt - b.createdAt)
        setPresets(list)
      } else {
        setPresets([])
      }
    })
    return () => unsub()
  }, [uid])

  const saveConfig = useCallback(
    async (next: CharacterConfig) => {
      if (!uid) return
      setConfig(next)
      await set(ref(db, `users/${uid}/character`), next)
    },
    [uid]
  )

  const savePreset = useCallback(
    async (name: string, presetConfig: CharacterConfig) => {
      if (!uid) return
      const id = `preset_${Date.now()}`
      const preset: Omit<CharacterPreset, 'id'> = {
        name: name.trim() || 'Preset',
        config: presetConfig,
        createdAt: Date.now(),
      }
      await set(ref(db, `users/${uid}/presets/${id}`), preset)
    },
    [uid]
  )

  const deletePreset = useCallback(
    async (presetId: string) => {
      if (!uid) return
      await remove(ref(db, `users/${uid}/presets/${presetId}`))
    },
    [uid]
  )

  return { config, loading, saveConfig, unlockedIds, presets, savePreset, deletePreset }
}
