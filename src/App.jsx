import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import OnboardingFlow from './components/OnboardingFlow'
import Dashboard from './components/Dashboard'
import useBudgetStore from './store/useBudgetStore'
import { APP_CONFIG } from './config/app'

export default function App() {
  const budgetData = useBudgetStore(state => state.budgetData)
  const hydrate = useBudgetStore(state => state.hydrate)
  const hydrated = useBudgetStore(state => state.hydrated)
  const [showOnboarding, setShowOnboarding] = useState(false)

  useEffect(() => {
    hydrate()
  }, [])

  useEffect(() => {
    if (hydrated) {
      setShowOnboarding(!budgetData)
    }
  }, [hydrated, budgetData])

  if (!hydrated) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-[3px] border-black border-t-[#FF6600] animate-spin" />
      </div>
    )
  }

  return (
    <AnimatePresence mode="wait">
      {showOnboarding ? (
        <motion.div
          key="onboarding"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <OnboardingFlow onComplete={() => setShowOnboarding(false)} />
        </motion.div>
      ) : (
        <motion.div
          key="dashboard"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <Dashboard appName={APP_CONFIG.name} />
        </motion.div>
      )}
    </AnimatePresence>
  )
}