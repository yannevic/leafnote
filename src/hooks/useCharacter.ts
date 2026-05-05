// src/hooks/useCharacter.ts
import { useEffect, useState, useCallback } from 'react'
import { ref, onValue, set } from 'firebase/database'
import { db } from '../lib/firebase'
import { CharacterConfig, DEFAULT_CHARACTER_CONFIG } from '../assets/character/index'

// ─────────────────────────────────────────────
// HELPER — normaliza dados vindos do Firebase
// Arrays podem vir como objetos { 0: 'x', 1: 'y' }
// ─────────────────────────────────────────────

function normalizeConfig(raw: Record<string, unknown>): CharacterConfig {
  const MULTI_KEYS = ['hair_back', 'hair_bonus', 'gloves', 'beard', 'accessory', 'tattoo'] as const

  const config: CharacterConfig = {
    ...DEFAULT_CHARACTER_CONFIG,
    ...raw,
    colorVariants: (raw.colorVariants as Record<string, string>) ?? {},
  }

  for (const key of MULTI_KEYS) {
    const val = raw[key]
    if (!val) {
      config[key] = []
    } else if (Array.isArray(val)) {
      config[key] = val.filter(Boolean)
    } else if (typeof val === 'object') {
      config[key] = Object.values(val as Record<string, string>).filter(Boolean)
    } else {
      config[key] = []
    }
  }

  return config
}

// ─────────────────────────────────────────────
// HOOK
// ─────────────────────────────────────────────

export function useCharacter(uid: string | null) {
  const [config, setConfig] = useState<CharacterConfig>(DEFAULT_CHARACTER_CONFIG)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!uid) {
      setLoading(false)
      return
    }

    const r = ref(db, `users/${uid}/character`)
    const unsub = onValue(r, (snap) => {
      if (snap.exists()) {
        setConfig(normalizeConfig(snap.val() as Record<string, unknown>))
      } else {
        setConfig(DEFAULT_CHARACTER_CONFIG)
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

  return { config, loading, saveConfig }
}
