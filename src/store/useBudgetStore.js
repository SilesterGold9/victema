import { useState, useCallback, useEffect } from 'react'
import { APP_CONFIG } from '../config/app'

const STORAGE_KEY = APP_CONFIG.storageKeys.budgetData

export function useBudgetStore() {
  const [budgetData, setBudgetData] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : null
  })
  const [isLoaded, setIsLoaded] = useState(true)

  useEffect(() => {
    if (budgetData) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(budgetData))
    }
  }, [budgetData])

  const initializeBudget = useCallback((data) => {
    const cycleStart = new Date()
    const cycleEnd = new Date(cycleStart.getFullYear(), cycleStart.getMonth() + 1, 0)
    
    const categories = {}
    data.categories.forEach(cat => {
      categories[cat.id] = {
        ...cat,
        spent: 0
      }
    })

    const savings = {}
    data.savings.forEach(sav => {
      savings[sav.id] = {
        ...sav,
        funded: 0
      }
    })

    setBudgetData({
      income: data.income,
      cycleStart: cycleStart.toISOString(),
      cycleEnd: cycleEnd.toISOString(),
      categories,
      savings,
      transactions: []
    })
  }, [])

  const logExpense = useCallback((amount, categoryId) => {
    setBudgetData(prev => {
      if (!prev) return prev
      
      const updated = {
        ...prev,
        categories: {
          ...prev.categories,
          [categoryId]: {
            ...prev.categories[categoryId],
            spent: prev.categories[categoryId].spent + amount
          }
        },
        transactions: [
          {
            id: Date.now(),
            date: new Date().toISOString(),
            categoryId,
            amount
          },
          ...prev.transactions
        ]
      }
      return updated
    })
  }, [])

  const fundSavings = useCallback((amount, savingsId) => {
    setBudgetData(prev => {
      if (!prev) return prev
      
      const updated = {
        ...prev,
        savings: {
          ...prev.savings,
          [savingsId]: {
            ...prev.savings[savingsId],
            funded: prev.savings[savingsId].funded + amount
          }
        }
      }
      return updated
    })
  }, [])

  const resetBudget = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setBudgetData(null)
  }, [])

  const totalSpent = budgetData 
    ? Object.values(budgetData.categories).reduce((sum, cat) => sum + cat.spent, 0)
    : 0

  const totalRemaining = budgetData ? budgetData.income - totalSpent : 0

  const remainingDays = budgetData ? (() => {
    const today = new Date()
    const end = new Date(budgetData.cycleEnd)
    const diff = end - today
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  })() : 0

  return {
    budgetData,
    initializeBudget,
    logExpense,
    fundSavings,
    resetBudget,
    totalSpent,
    totalRemaining,
    remainingDays
  }
}