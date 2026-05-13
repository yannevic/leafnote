import { useState, useEffect } from 'react'
import {
  Transaction,
  Goal,
  Debt,
  subscribeTransactions,
  subscribeGoals,
  subscribeDebts,
  addTransaction,
  updateTransaction,
  deleteTransaction,
  addGoal,
  updateGoal,
  depositToGoal,
  archiveGoal,
  addDebt,
  markDebtPaid,
  deleteDebt,
  GoalDeposit,
} from '../lib/finance'

export function useFinance(uid: string, partnerUid: string) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [debts, setDebts] = useState<Debt[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let loadedCount = 0
    const tryDone = () => {
      loadedCount += 1
      if (loadedCount >= 3) setLoading(false)
    }

    const unsubT = subscribeTransactions((list) => {
      setTransactions(list)
      tryDone()
    })
    const unsubG = subscribeGoals((list) => {
      setGoals(list)
      tryDone()
    })
    const unsubD = subscribeDebts((list) => {
      setDebts(list)
      tryDone()
    })

    return () => {
      unsubT()
      unsubG()
      unsubD()
    }
  }, [])

  // ─── Transactions ────────────────────────────────────────

  const createTransaction = (data: Omit<Transaction, 'id'>) => addTransaction(data)

  const editTransaction = (id: string, data: Partial<Omit<Transaction, 'id'>>) =>
    updateTransaction(id, data)

  const removeTransaction = (id: string) => deleteTransaction(id)

  // ─── Resumo do mês atual ─────────────────────────────────

  const currentMonth = new Date().toISOString().slice(0, 7) // "YYYY-MM"

  const monthTransactions = transactions.filter((t) => t.date.startsWith(currentMonth))

  const totalIncome = monthTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpense = monthTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  const balance = totalIncome - totalExpense

  // ─── Goals ───────────────────────────────────────────────

  const activeGoals = goals.filter((g) => !g.archived)
  const archivedGoals = goals.filter((g) => g.archived)

  const createGoal = (data: Omit<Goal, 'id' | 'current' | 'deposits'>) => addGoal(data)

  const editGoal = (id: string, data: Partial<Omit<Goal, 'id'>>) => updateGoal(id, data)

  const deposit = (goalId: string, currentTotal: number, dep: Omit<GoalDeposit, 'id'>) =>
    depositToGoal(goalId, currentTotal, dep)

  const archive = (id: string) => archiveGoal(id)

  // ─── Debts ───────────────────────────────────────────────

  const activeDebts = debts.filter((d) => !d.paid)
  const paidDebts = debts.filter((d) => d.paid)

  const iOwe = activeDebts.filter((d) => d.fromUid === uid)
  const theyOwe = activeDebts.filter((d) => d.fromUid === partnerUid)

  const createDebt = (data: Omit<Debt, 'id'>) => addDebt(data)
  const payDebt = (id: string) => markDebtPaid(id)
  const removeDebt = (id: string) => deleteDebt(id)

  return {
    loading,
    // transactions
    transactions,
    monthTransactions,
    totalIncome,
    totalExpense,
    balance,
    createTransaction,
    editTransaction,
    removeTransaction,
    // goals
    activeGoals,
    archivedGoals,
    createGoal,
    editGoal,
    deposit,
    archive,
    // debts
    activeDebts,
    paidDebts,
    iOwe,
    theyOwe,
    createDebt,
    payDebt,
    removeDebt,
  }
}
