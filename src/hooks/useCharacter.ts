// src/hooks/useCharacter.ts
import { useEffect, useState, useCallback } from 'react'
import { ref, onValue, set } from 'firebase/database'
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
]

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
        // itens que o usuário já tem salvos também ficam desbloqueados no guarda-roupa
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
        // primeira vez — usa config vazio mas já mostra peças desbloqueadas
        setConfig(FIRST_TIME_DEFAULT_CONFIG)
        setUnlockedIds(FIRST_TIME_UNLOCKED_IDS)
      }
      setLoading(false)
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

  return { config, loading, saveConfig, unlockedIds }
}
