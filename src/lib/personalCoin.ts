import {
  ref,
  onValue,
  set,
  runTransaction,
  push,
  query,
  orderByChild,
  limitToLast,
} from 'firebase/database'
import { db } from './firebase'
import type { CoinIconKey } from './personalCoinIcons'

export interface PersonalCoin {
  name: string
  icon: CoinIconKey
  color: string
  balance: number
}

export function subscribePersonalCoin(uid: string, callback: (data: PersonalCoin | null) => void) {
  const r = ref(db, `users/${uid}/personalCoin`)
  return onValue(r, (snap) => callback(snap.val()))
}

export async function setupPersonalCoin(
  uid: string,
  name: string,
  icon: CoinIconKey,
  color: string
) {
  await set(ref(db, `users/${uid}/personalCoin`), { name, icon, color, balance: 0 })
}

export async function addCoins(uid: string, amount: number, reason: string) {
  const balRef = ref(db, `users/${uid}/personalCoin/balance`)
  const result = await runTransaction(balRef, (current) => (current ?? 0) + amount)
  const newBalance = (result.snapshot.val() as number) ?? amount
  await push(ref(db, `users/${uid}/coinLedger`), {
    amount,
    reason,
    timestamp: Date.now(),
    balanceAfter: newBalance,
  })
}

export async function spendCoins(uid: string, amount: number, reason: string): Promise<boolean> {
  const balRef = ref(db, `users/${uid}/personalCoin/balance`)
  const result = await runTransaction(balRef, (current) => {
    const cur = current ?? 0
    if (cur < amount) return undefined // aborta a transaction, saldo insuficiente
    return cur - amount
  })
  if (!result.committed) return false
  const newBalance = result.snapshot.val() as number
  await push(ref(db, `users/${uid}/coinLedger`), {
    amount: -amount,
    reason,
    timestamp: Date.now(),
    balanceAfter: newBalance,
  })
  return true
}
export interface CoinLedgerEntry {
  id: string
  amount: number
  reason: string
  timestamp: number
  balanceAfter: number
}

export function subscribeCoinLedger(
  uid: string,
  callback: (entries: CoinLedgerEntry[]) => void,
  limit = 50
) {
  const q = query(ref(db, `users/${uid}/coinLedger`), orderByChild('timestamp'), limitToLast(limit))
  return onValue(q, (snap) => {
    const entries: CoinLedgerEntry[] = []
    snap.forEach((child) => {
      entries.push({ id: child.key as string, ...(child.val() as Omit<CoinLedgerEntry, 'id'>) })
    })
    entries.reverse() // mais recente primeiro
    callback(entries)
  })
}
