import { create } from 'zustand'
import { APP_CONFIG } from '../config/app'

const useBudgetStore = create((set, get) => ({
  budgetData: null,
  hydrated: false,

  hydrate: () => {
    const stored = localStorage.getItem(APP_CONFIG.storageKeys.budgetData)
    if (stored) {
      set({ budgetData: JSON.parse(stored), hydrated: true })
    } else {
      set({ hydrated: true })
    }
  },

  save: () => {
    const { budgetData } = get()
    if (budgetData) {
      localStorage.setItem(APP_CONFIG.storageKeys.budgetData, JSON.stringify(budgetData))
    }
  },

  initializeBudget: (data) => {
    const cycleStart = new Date()
    const cycleEnd = new Date(cycleStart.getFullYear(), cycleStart.getMonth() + 1, 0)
    
    const categories = {}
    data.categories.forEach(cat => {
      categories[cat.id] = { ...cat, spent: 0 }
    })

    const savings = {}
    data.savings.forEach(sav => {
      savings[sav.id] = { ...sav, funded: 0 }
    })

    set({
      budgetData: {
        income: data.income,
        cycleStart: cycleStart.toISOString(),
        cycleEnd: cycleEnd.toISOString(),
        categories,
        savings,
        transactions: []
      }
    })
    get().save()
  },

  logExpense: (amount, categoryId) => {
    const { budgetData } = get()
    if (!budgetData) return

    set({
      budgetData: {
        ...budgetData,
        categories: {
          ...budgetData.categories,
          [categoryId]: {
            ...budgetData.categories[categoryId],
            spent: budgetData.categories[categoryId].spent + amount
          }
        },
        transactions: [
          {
            id: Date.now(),
            date: new Date().toISOString(),
            categoryId,
            amount
          },
          ...budgetData.transactions
        ]
      }
    })
    get().save()
  },

  fundSavings: (amount, savingsId) => {
    const { budgetData } = get()
    if (!budgetData) return

    set({
      budgetData: {
        ...budgetData,
        savings: {
          ...budgetData.savings,
          [savingsId]: {
            ...budgetData.savings[savingsId],
            funded: budgetData.savings[savingsId].funded + amount
          }
        }
      }
    })
    get().save()
  },

  resetBudget: () => {
    localStorage.removeItem(APP_CONFIG.storageKeys.budgetData)
    set({ budgetData: null })
  },

  getTotalSpent: () => {
    const { budgetData } = get()
    if (!budgetData) return 0
    return Object.values(budgetData.categories).reduce((sum, cat) => sum + cat.spent, 0)
  },

  getTotalRemaining: () => {
    const { budgetData } = get()
    if (!budgetData) return 0
    return budgetData.income - get().getTotalSpent()
  },

  getRemainingDays: () => {
    const { budgetData } = get()
    if (!budgetData) return 0
    const today = new Date()
    const end = new Date(budgetData.cycleEnd)
    const diff = end - today
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }
}))

export default useBudgetStore