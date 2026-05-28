import { ref, push, set, update, remove, onValue, off } from 'firebase/database'
import { db } from './firebase'

// ─── Tipos ────────────────────────────────────────────────

export type TransactionType = 'income' | 'expense'

export type Category =
  | 'alimentação'
  | 'transporte'
  | 'lazer'
  | 'saúde'
  | 'moradia'
  | 'presente'
  | 'outro'

export type PaidBy = 'me' | 'partner' | 'both'

export interface Transaction {
  id: string
  type: TransactionType
  amount: number
  category: Category
  categoryCustom?: string
  description: string
  icon: string
  color: string
  date: string
  paidBy: PaidBy
  createdBy: string
  goalId?: string
}

export interface GoalDeposit {
  id: string
  amount: number
  date: string
  addedBy: string
}

export interface Goal {
  id: string
  title: string
  target: number
  current: number
  icon: string
  color: string
  deadline?: string
  createdBy: string
  archived?: boolean
  deposits?: Record<string, Omit<GoalDeposit, 'id'>>
}

export interface Debt {
  id: string
  fromUid: string
  toUid: string
  amount: number
  description: string
  date: string
  paid: boolean
  paidDate?: string
}

// ─── Constantes ───────────────────────────────────────────

export const CATEGORIES: Category[] = [
  'alimentação',
  'transporte',
  'lazer',
  'saúde',
  'moradia',
  'presente',
  'outro',
]

export const CATEGORY_ICONS: Record<Category, string> = {
  alimentação: 'UtensilsCrossed',
  transporte: 'Car',
  lazer: 'Gamepad2',
  saúde: 'HeartPulse',
  moradia: 'Home',
  presente: 'Gift',
  outro: 'Tag',
}

export const PICKER_COLORS = [
  '#E8A0B0',
  '#7FB87F',
  '#C4956A',
  '#A0C4E8',
  '#D4AA80',
  '#B0A0E8',
  '#E8C4A0',
  '#A0E8C4',
]

export const PAID_BY_LABELS: Record<PaidBy, string> = {
  me: 'eu',
  partner: 'parceiro(a)',
  both: 'os dois',
}

// ─── Helpers ──────────────────────────────────────────────

export function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function getCategoryLabel(t: Transaction): string {
  if (t.category === 'outro' && t.categoryCustom) return t.categoryCustom
  return t.category
}

// ─── Firebase — Transactions ──────────────────────────────

export function subscribeTransactions(
  coupleId: string,
  callback: (list: Transaction[]) => void
): () => void {
  const r = ref(db, `couples/${coupleId}/finance/transactions`)
  const handler = onValue(r, (snap) => {
    const val = snap.val() ?? {}
    const list: Transaction[] = Object.entries(val).map(([id, data]) => ({
      id,
      ...(data as Omit<Transaction, 'id'>),
    }))
    list.sort((a, b) => b.date.localeCompare(a.date))
    callback(list)
  })
  return () => off(r, 'value', handler)
}

export async function addTransaction(
  coupleId: string,
  data: Omit<Transaction, 'id'>
): Promise<void> {
  const r = ref(db, `couples/${coupleId}/finance/transactions`)
  const newRef = push(r)
  await set(newRef, data)
}

export async function updateTransaction(
  coupleId: string,
  id: string,
  data: Partial<Omit<Transaction, 'id'>>
): Promise<void> {
  await update(ref(db, `couples/${coupleId}/finance/transactions/${id}`), data)
}

export async function deleteTransaction(coupleId: string, id: string): Promise<void> {
  await remove(ref(db, `couples/${coupleId}/finance/transactions/${id}`))
}

// ─── Firebase — Goals ─────────────────────────────────────

export function subscribeGoals(coupleId: string, callback: (list: Goal[]) => void): () => void {
  const r = ref(db, `couples/${coupleId}/finance/goals`)
  const handler = onValue(r, (snap) => {
    const val = snap.val() ?? {}
    const list: Goal[] = Object.entries(val).map(([id, data]) => ({
      id,
      ...(data as Omit<Goal, 'id'>),
    }))
    list.sort((a, b) => a.title.localeCompare(b.title))
    callback(list)
  })
  return () => off(r, 'value', handler)
}

export async function addGoal(
  coupleId: string,
  data: Omit<Goal, 'id' | 'current' | 'deposits'>
): Promise<void> {
  const r = ref(db, `couples/${coupleId}/finance/goals`)
  const newRef = push(r)
  await set(newRef, { ...data, current: 0 })
}

export async function updateGoal(
  coupleId: string,
  id: string,
  data: Partial<Omit<Goal, 'id'>>
): Promise<void> {
  await update(ref(db, `couples/${coupleId}/finance/goals/${id}`), data)
}

export async function depositToGoal(
  coupleId: string,
  goalId: string,
  currentTotal: number,
  deposit: Omit<GoalDeposit, 'id'>
): Promise<void> {
  const depRef = push(ref(db, `couples/${coupleId}/finance/goals/${goalId}/deposits`))
  await set(depRef, deposit)
  await update(ref(db, `couples/${coupleId}/finance/goals/${goalId}`), {
    current: currentTotal + deposit.amount,
  })
}

export async function archiveGoal(coupleId: string, id: string): Promise<void> {
  await update(ref(db, `couples/${coupleId}/finance/goals/${id}`), { archived: true })
}

// ─── Firebase — Debts ─────────────────────────────────────
export function subscribeDebts(coupleId: string, callback: (list: Debt[]) => void): () => void {
  const r = ref(db, `couples/${coupleId}/finance/debts`)
  const handler = onValue(r, (snap) => {
    const val = snap.val() ?? {}
    const list: Debt[] = Object.entries(val).map(([id, data]) => ({
      id,
      ...(data as Omit<Debt, 'id'>),
    }))
    list.sort((a, b) => b.date.localeCompare(a.date))
    callback(list)
  })
  return () => off(r, 'value', handler)
}

export async function addDebt(coupleId: string, data: Omit<Debt, 'id'>): Promise<void> {
  const r = ref(db, `couples/${coupleId}/finance/debts`)
  const newRef = push(r)
  await set(newRef, data)
}

export async function markDebtPaid(coupleId: string, id: string): Promise<void> {
  await update(ref(db, `couples/${coupleId}/finance/debts/${id}`), {
    paid: true,
    paidDate: new Date().toISOString(),
  })
}

export async function deleteDebt(coupleId: string, id: string): Promise<void> {
  await remove(ref(db, `couples/${coupleId}/finance/debts/${id}`))
}
