import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import OnboardingFlow from './components/OnboardingFlow'
import Dashboard from './components/Dashboard'
import { useBudgetStore } from './store/useBudgetStore'
import { APP_CONFIG } from './config/app'

export default function App() {
  const { budgetData } = useBudgetStore()
  const [showOnboarding, setShowOnboarding] = useState(!budgetData)

  return (
    <AnimatePresence mode="wait">
      {showOnboarding || !budgetData ? (
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