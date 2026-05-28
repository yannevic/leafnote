import { useState, useEffect, useCallback } from 'react'
import {
  SharedDiceState,
  DiceMode,
  subscribeDice,
  saveDiceState,
  pushActivityLog,
} from '../lib/widgets'

export function useSharedDice(coupleId: string, uid: string, displayName: string) {
  const [remote, setRemote] = useState<SharedDiceState | null>(null)
  const [isRolling, setIsRolling] = useState(false)

  useEffect(() => {
    const unsub = subscribeDice(coupleId, setRemote)
    return unsub
  }, [])

  const rollTogether = useCallback(
    (diceCount: number) => {
      if (isRolling) return
      setIsRolling(true)
      let frame = 0
      const frames = 8
      const interval = setInterval(() => {
        const val = Math.floor(Math.random() * 6) + 1
        const interim: SharedDiceState = {
          mode: 'together',
          values: { [uid]: val },
          rolledBy: uid,
          rolledAt: Date.now(),
        }
        saveDiceState(coupleId, interim)
        frame += 1
        if (frame >= frames) {
          clearInterval(interval)
          const finalValues: number[] = Array.from(
            { length: diceCount },
            () => Math.floor(Math.random() * 6) + 1
          )
          const final: SharedDiceState = {
            mode: 'together',
            values: { [uid]: finalValues[0] },
            rolledBy: uid,
            rolledAt: Date.now(),
          }
          saveDiceState(coupleId, final)
          pushActivityLog(coupleId, displayName, `girou ${finalValues[0]} no dado 🎲`)
          setIsRolling(false)
        }
      }, 60)
    },
    [isRolling, uid, displayName]
  )

  const rollVersus = useCallback(() => {
    if (isRolling) return
    setIsRolling(true)
    let frame = 0
    const frames = 8
    const current = remote
    const interval = setInterval(() => {
      frame += 1
      const val = Math.floor(Math.random() * 6) + 1
      const interim: SharedDiceState = {
        mode: 'versus',
        values: { ...(current?.values ?? {}), [uid]: val },
        rolledBy: uid,
        rolledAt: Date.now(),
      }
      saveDiceState(coupleId, interim)
      if (frame >= frames) {
        clearInterval(interval)
        const finalVal = Math.floor(Math.random() * 6) + 1
        const finalState: SharedDiceState = {
          mode: 'versus',
          values: { ...(current?.values ?? {}), [uid]: finalVal },
          rolledBy: uid,
          rolledAt: Date.now(),
        }
        saveDiceState(coupleId, finalState)
        pushActivityLog(coupleId, displayName, `girou um ${finalVal} na disputa ⚔️`)
        setIsRolling(false)
      }
    }, 60)
  }, [isRolling, uid, displayName, remote])

  const setMode = useCallback(
    (mode: DiceMode) => {
      const next: SharedDiceState = {
        mode,
        values: {},
        rolledBy: uid,
        rolledAt: Date.now(),
      }
      saveDiceState(coupleId, next)
    },
    [uid]
  )

  return { remote, isRolling, rollTogether, rollVersus, setMode }
}
