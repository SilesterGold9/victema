import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  Wallet, PiggyBank, TrendingDown, Calendar, Plus,
  AlertTriangle, Check, RefreshCw, History
} from 'lucide-react'
import { useBudgetStore } from '../store/useBudgetStore'
import { APP_CONFIG } from '../config/app'

export default function Dashboard({ appName }) {
  const { budgetData, logExpense, resetBudget, totalRemaining, totalSpent, remainingDays } = useBudgetStore()
  const [showInput, setShowInput] = useState(true)

  if (!budgetData) return null

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    })
  }

  return (
    <div className="min-h-dvh bg-white pb-20 md:pb-8">
      {/* Mobile Header */}
      <header className="sticky top-0 z-50 bg-black text-white border-b-3 border-black">
        <div className="px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold tracking-tight">{appName}</h1>
            <p className="text-xs text-gray-400 tracking-widest">{APP_CONFIG.tagline}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowInput(!showInput)}
              className="p-2 border-2 border-white/30 hover:border-white transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
            <button className="p-2 border-2 border-white/30 hover:border-white transition-colors">
              <History className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        
        {/* Global Status Panel */}
        <StatusPanel
          income={budgetData.income}
          totalRemaining={totalRemaining}
          remainingDays={remainingDays}
          cycleStart={budgetData.cycleStart}
          cycleEnd={budgetData.cycleEnd}
          totalSpent={totalSpent}
        />

        {/* Allocation Vault */}
        <AllocationVault categories={budgetData.categories} />

        {/* Savings Pillars */}
        <SavingsPillars savings={budgetData.savings} />

        {/* Transaction Input */}
        <AnimatePresence>
          {showInput && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <TransactionInput
                categories={budgetData.categories}
                onLogExpense={logExpense}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Transaction History */}
        <TransactionHistory transactions={budgetData.transactions} />

        {/* Reset Button */}
        <div className="flex justify-center pt-4">
          <button
            onClick={resetBudget}
            className="px-6 py-3 border-3 border-gray-300 text-sm font-bold hover:border-danger hover:text-danger transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            RESET BUDGET
          </button>
        </div>
      </main>
    </div>
  )
}

function StatusPanel({ income, totalRemaining, remainingDays, cycleStart, cycleEnd, totalSpent }) {
  const percentage = ((totalSpent / income) * 100).toFixed(1)
  
  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  })
  
  return (
    <section className="border-3 border-black">
      <div className="bg-black text-white px-4 py-3 flex items-center justify-between">
        <div className="text-xs font-bold tracking-widest">GLOBAL STATUS</div>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Calendar className="w-4 h-4" />
          {formatDate(cycleStart)} — {formatDate(cycleEnd)}
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 divide-x-3 divide-y-3 md:divide-y-0 divide-black border-x-3 border-b-3 border-black">
        <div className="p-4 md:p-6 flex flex-col justify-center">
          <div className="text-xs font-bold tracking-widest text-gray-500 mb-1">INCOME</div>
          <div className="text-xl md:text-2xl font-bold">{income.toLocaleString()}</div>
          <div className="text-xs text-gray-400">KZS</div>
        </div>

        <div className="p-4 md:p-6 bg-black text-white flex flex-col justify-center">
          <div className="text-xs font-bold tracking-widest text-gray-400 mb-1">REMAINING</div>
          <motion.div
            key={totalRemaining}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            className={`text-2xl md:text-4xl font-bold ${totalRemaining < 0 ? 'text-danger' : 'text-accent'}`}
          >
            {totalRemaining.toLocaleString()}
          </motion.div>
          <div className="text-xs text-gray-400">KZS</div>
        </div>

        <div className="p-4 md:p-6 flex flex-col justify-center">
          <div className="text-xs font-bold tracking-widest text-gray-500 mb-1">SPENT</div>
          <div className="text-xl md:text-2xl font-bold">{totalSpent.toLocaleString()}</div>
          <div className="text-xs text-gray-400">{percentage}%</div>
        </div>

        <div className="p-4 md:p-6 flex flex-col justify-center">
          <div className="text-xs font-bold tracking-widest text-gray-500 mb-1">DAYS LEFT</div>
          <div className="text-2xl md:text-3xl font-bold">{remainingDays > 0 ? remainingDays : 0}</div>
          <div className="text-xs text-gray-400">DAYS</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-3 bg-gray-200 border-t-3 border-l-3 border-r-3 border-black">
        <motion.div
          className={`h-full transition-all ${totalSpent > income ? 'bg-danger' : 'bg-black'}`}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min((totalSpent / income) * 100, 100)}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </section>
  )
}

function AllocationVault({ categories }) {
  const categoriesList = Object.values(categories)

  return (
    <section className="border-3 border-black">
      <div className="bg-black text-white px-4 py-3 flex items-center justify-between">
        <div className="text-xs font-bold tracking-widest flex items-center gap-2">
          <Wallet className="w-4 h-4" />
          ALLOCATION VAULT
        </div>
        <div className="text-xs text-gray-400">
          {categoriesList.length} CATEGORIES
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 divide-x-3 divide-y-3 md:divide-y-0 divide-black border-x-3 border-b-3 border-black">
        {categoriesList.map(cat => {
          const remaining = cat.amount - cat.spent
          const percentSpent = (cat.spent / cat.amount) * 100
          const isExceeded = remaining < 0
          const isWarning = percentSpent >= 80 && percentSpent < 100

          return (
            <motion.div
              key={cat.id}
              layout
              className={`p-4 md:p-6 ${isExceeded ? 'bg-danger/10' : ''}`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold tracking-widest text-gray-500">{cat.name.toUpperCase()}</span>
                {isExceeded && <span className="text-danger">⚠️</span>}
              </div>
              
              <div className={`text-xl md:text-2xl font-bold mb-3 ${isExceeded ? 'text-danger' : ''}`}>
                {Math.abs(remaining).toLocaleString()}
                <span className="text-xs font-normal text-gray-400 ml-1">KZS</span>
              </div>

              <div className="h-2 bg-gray-200 mb-2">
                <motion.div
                  className={`h-full ${isExceeded ? 'bg-danger' : isWarning ? 'bg-accent' : 'bg-black'}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(percentSpent, 100)}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>

              <div className="flex justify-between text-xs text-gray-400">
                <span>{cat.spent.toLocaleString()} spent</span>
                <span>{percentSpent.toFixed(0)}%</span>
              </div>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}

function SavingsPillars({ savings }) {
  const savingsList = Object.values(savings)

  return (
    <section className="border-3 border-black">
      <div className="bg-accent text-black px-4 py-3 flex items-center justify-between">
        <div className="text-xs font-bold tracking-widest flex items-center gap-2">
          <PiggyBank className="w-4 h-4" />
          SAVINGS PILLARS
        </div>
        <div className="text-xs font-bold">
          {savingsList.filter(s => s.target > 0).length} ACTIVE GOALS
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 divide-y-3 md:divide-y-0 md:divide-x-3 divide-black border-x-3 border-b-3 border-black">
        {savingsList.filter(s => s.target > 0).map(sav => {
          const remaining = sav.target - sav.funded
          const percentFunded = (sav.funded / sav.target) * 100
          const isComplete = remaining <= 0

          return (
            <motion.div
              key={sav.id}
              layout
              className="p-4 md:p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-bold tracking-widest">{sav.name.toUpperCase()}</span>
                <span className="text-xs text-gray-400">TARGET: {sav.target.toLocaleString()}</span>
              </div>

              <motion.div
                key={remaining}
                initial={{ scale: 1.05 }}
                animate={{ scale: 1 }}
                className={`text-3xl font-bold mb-4 ${isComplete ? 'text-accent' : ''}`}
              >
                {remaining.toLocaleString()}
                <span className="text-sm font-normal text-gray-400 ml-1">KZS LEFT</span>
              </motion.div>

              <div className="h-3 bg-gray-200 mb-2">
                <motion.div
                  className={`h-full ${isComplete ? 'bg-black' : 'bg-accent'}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(percentFunded, 100)}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>

              <div className="flex justify-between text-xs text-gray-400">
                <span>{sav.funded.toLocaleString()} funded</span>
                <span className="font-bold">{percentFunded.toFixed(1)}%</span>
              </div>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}

function TransactionInput({ categories, onLogExpense }) {
  const [amount, setAmount] = useState('')
  const [categoryId, setCategoryId] = useState(Object.keys(categories)[0])
  const [alert, setAlert] = useState(null)
  const [recentCategory, setRecentCategory] = useState(null)

  const handleSubmit = (e) => {
    e.preventDefault()
    const numAmount = parseInt(amount)
    
    if (!numAmount || numAmount <= 0) {
      showAlert('Enter a valid amount', 'error')
      return
    }

    const category = categories[categoryId]
    const remaining = category.amount - category.spent

    if (numAmount > remaining && remaining > 0) {
      showAlert(`Over budget for ${category.name}! Only ${remaining.toLocaleString()} KZS left`, 'warning')
    } else if (remaining <= 0) {
      showAlert(`${category.name} budget exceeded!`, 'error')
    }

    onLogExpense(numAmount, categoryId)
    setRecentCategory(categoryId)
    setAmount('')
    showAlert(`${numAmount.toLocaleString()} KZS logged to ${category.name}`, 'success')
  }

  const showAlert = (message, type) => {
    setAlert({ message, type })
    setTimeout(() => setAlert(null), 3000)
  }

  return (
    <section className="border-3 border-black">
      <div className="bg-gray-900 text-white px-4 py-3 flex items-center gap-2">
        <TrendingDown className="w-4 h-4" />
        <span className="text-xs font-bold tracking-widest">LOG EXPENSE</span>
      </div>

      <form onSubmit={handleSubmit} className="border-x-3 border-b-3 border-black">
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y-3 md:divide-y-0 md:divide-x-3 divide-black">
          <div className="p-4">
            <label className="block text-xs font-bold tracking-widest text-gray-500 mb-2">AMOUNT (KZS)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              className="w-full px-4 py-4 text-2xl font-bold border-3 border-black focus:outline-none focus:border-accent transition-colors"
              autoFocus
            />
          </div>

          <div className="p-4">
            <label className="block text-xs font-bold tracking-widest text-gray-500 mb-2">CATEGORY</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-4 py-4 text-lg font-bold border-3 border-black focus:outline-none focus:border-accent bg-white transition-colors"
            >
              {Object.values(categories).map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.name.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          <div className="p-4 flex items-center">
            <button
              type="submit"
              className="w-full h-full py-4 bg-black text-white border-3 border-black font-bold text-lg hover:bg-accent hover:text-black transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-6 h-6" />
              LOG EXPENSE
            </button>
          </div>
        </div>
      </form>

      {/* Alert */}
      <AnimatePresence>
        {alert && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`border-x-3 border-b-3 border-t-3 ${
              alert.type === 'error' ? 'bg-danger text-white' :
              alert.type === 'warning' ? 'bg-accent text-black' :
              'bg-black text-white'
            }`}
          >
            <div className="px-4 py-3 flex items-center gap-2 font-bold text-sm">
              {alert.type === 'error' && <AlertTriangle className="w-5 h-5" />}
              {alert.type === 'warning' && <AlertTriangle className="w-5 h-5" />}
              {alert.type === 'success' && <Check className="w-5 h-5" />}
              {alert.message}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

function TransactionHistory({ transactions }) {
  const formatTime = (dateStr) => {
    return new Date(dateStr).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDateFull = (dateStr) => {
    const date = new Date(dateStr)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) return 'TODAY'
    if (date.toDateString() === yesterday.toDateString()) return 'YESTERDAY'
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  if (transactions.length === 0) {
    return (
      <section className="border-3 border-black">
        <div className="bg-gray-100 px-4 py-3 border-b-3 border-black">
          <div className="text-xs font-bold tracking-widest flex items-center gap-2">
            <History className="w-4 h-4" />
            TRANSACTION HISTORY
          </div>
        </div>
        <div className="p-8 text-center text-gray-400 font-bold tracking-widest text-sm border-x-3">
          NO TRANSACTIONS YET
        </div>
      </section>
    )
  }

  return (
    <section className="border-3 border-black">
      <div className="bg-gray-100 px-4 py-3 border-b-3 border-black flex items-center justify-between">
        <div className="text-xs font-bold tracking-widest flex items-center gap-2">
          <History className="w-4 h-4" />
          TRANSACTION HISTORY
        </div>
        <div className="text-xs text-gray-400">{transactions.length} LOGGED</div>
      </div>

      <div className="border-x-3 border-b-3 border-black max-h-80 overflow-y-auto">
        {transactions.slice(0, 50).map((tx, i) => (
          <motion.div
            key={tx.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.03 }}
            className={`p-4 flex items-center justify-between ${
              i % 2 === 0 ? 'bg-white' : 'bg-gray-50'
            } border-b-2 border-black last:border-b-0`}
          >
            <div className="flex items-center gap-4">
              <div className="text-xs font-bold text-gray-400 w-16">
                {formatTime(tx.date)}
              </div>
              <div className="font-bold">{tx.categoryId.toUpperCase()}</div>
            </div>
            <div className="text-xl font-bold">-{tx.amount.toLocaleString()}</div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}