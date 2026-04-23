import { describe, it, expect, beforeEach } from 'vitest'
import { APP_CONFIG } from '../config/app'
import useBudgetStore from '../store/useBudgetStore'

describe('APP_CONFIG', () => {
  it('should have correct app name', () => {
    expect(APP_CONFIG.name).toBe('Arkis Vectis')
  })

  it('should have tagline', () => {
    expect(APP_CONFIG.tagline).toBe('Zero-Based Budget')
  })

  it('should have storage keys', () => {
    expect(APP_CONFIG.storageKeys.budgetData).toBeDefined()
    expect(APP_CONFIG.storageKeys.settings).toBeDefined()
  })
})

describe('useBudgetStore', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('should have initial state', () => {
    const budgetData = useBudgetStore.getState().budgetData
    expect(budgetData).toBeNull()
  })

  it('should initialize budget', () => {
    const store = useBudgetStore.getState()
    store.initializeBudget({
      income: 100000,
      categories: [
        { id: 'tuition', name: 'Tuition', amount: 54500 }
      ],
      savings: [
        { id: 'emergency', name: 'Emergency', target: 10000 }
      ]
    })

    const budgetData = useBudgetStore.getState().budgetData
    expect(budgetData.income).toBe(100000)
    expect(budgetData.categories.tuition.spent).toBe(0)
  })

  it('should log expense', () => {
    const store = useBudgetStore.getState()
    store.initializeBudget({
      income: 100000,
      categories: [
        { id: 'food', name: 'Food', amount: 10000 }
      ],
      savings: []
    })

    store.logExpense(500, 'food')
    
    const budgetData = useBudgetStore.getState().budgetData
    expect(budgetData.categories.food.spent).toBe(500)
    expect(budgetData.transactions).toHaveLength(1)
  })

  it('should calculate total spent', () => {
    const store = useBudgetStore.getState()
    store.initializeBudget({
      income: 100000,
      categories: [
        { id: 'food', name: 'Food', amount: 10000 },
        { id: 'transport', name: 'Transport', amount: 5000 }
      ],
      savings: []
    })

    store.logExpense(500, 'food')
    store.logExpense(200, 'transport')

    expect(store.getTotalSpent()).toBe(700)
  })

  it('should calculate total remaining', () => {
    const store = useBudgetStore.getState()
    store.initializeBudget({
      income: 100000,
      categories: [
        { id: 'food', name: 'Food', amount: 10000 }
      ],
      savings: []
    })

    store.logExpense(500, 'food')

    expect(store.getTotalRemaining()).toBe(99500)
  })

  it('should reset budget', () => {
    const store = useBudgetStore.getState()
    store.initializeBudget({
      income: 100000,
      categories: [],
      savings: []
    })

    store.resetBudget()

    expect(useBudgetStore.getState().budgetData).toBeNull()
  })
})