import { useState, useEffect } from 'react'
import { unlockAchievement } from '../lib/achievements'
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
  currentMonthBrasilia,
} from '../lib/finance'

export function useFinance(coupleId: string, uid: string, partnerUid: string) {
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

    const unsubT = subscribeTransactions(coupleId, (list) => {
      setTransactions(list)
      tryDone()
    })
    const unsubG = subscribeGoals(coupleId, (list) => {
      setGoals(list)
      tryDone()
    })
    const unsubD = subscribeDebts(coupleId, (list) => {
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

  const createTransaction = (data: Omit<Transaction, 'id'>) => addTransaction(coupleId, data)

  const editTransaction = (id: string, data: Partial<Omit<Transaction, 'id'>>) =>
    updateTransaction(coupleId, id, data)

  const removeTransaction = (id: string) => deleteTransaction(coupleId, id)

  // ─── Resumo do mês atual ─────────────────────────────────
  const currentMonth = currentMonthBrasilia()

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

  const createGoal = (data: Omit<Goal, 'id' | 'current' | 'deposits'>) => addGoal(coupleId, data)

  const editGoal = (id: string, data: Partial<Omit<Goal, 'id'>>) => updateGoal(coupleId, id, data)

  const deposit = (goalId: string, currentTotal: number, dep: Omit<GoalDeposit, 'id'>) =>
    depositToGoal(coupleId, goalId, currentTotal, dep)

  const archive = (id: string) => archiveGoal(coupleId, id)

  // ─── Debts ───────────────────────────────────────────────

  const activeDebts = debts.filter((d) => !d.paid)
  const paidDebts = debts.filter((d) => d.paid)

  const iOwe = activeDebts.filter((d) => d.fromUid === uid)
  const theyOwe = activeDebts.filter((d) => d.fromUid === partnerUid)

  const createDebt = (data: Omit<Debt, 'id'>) => addDebt(coupleId, data)
  const payDebt = async (id: string) => {
    await markDebtPaid(coupleId, id)
    await unlockAchievement('first_debt', uid, coupleId)
  }
  const removeDebt = (id: string) => deleteDebt(coupleId, id)

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
