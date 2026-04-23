import { useState } from 'react'
import { motion } from 'motion/react'
import { ChevronRight, ChevronLeft, Target, Check, AlertTriangle } from 'lucide-react'
import { useBudgetStore } from '../store/useBudgetStore'
import { APP_CONFIG } from '../config/app'

const STEPS = [
  { id: 'income', title: 'MONTHLY INCOME', subtitle: 'Enter your total monthly income' },
  { id: 'fixed', title: 'FIXED COSTS', subtitle: 'Set aside for non-negotiable expenses' },
  { id: 'operational', title: 'OPERATIONAL BUDGET', subtitle: 'Allocate for daily needs' },
  { id: 'savings', title: 'SAVINGS GOALS', subtitle: 'Define your financial targets' },
  { id: 'review', title: 'REVIEW', subtitle: 'Confirm your budget allocation' }
]

const CATEGORY_TEMPLATES = [
  { id: 'tuition', name: 'Tuition', icon: '🎓', type: 'fixed' },
  { id: 'rent', name: 'Rent/Housing', icon: '🏠', type: 'fixed' },
  { id: 'utilities', name: 'Utilities', icon: '💡', type: 'fixed' },
  { id: 'transport', name: 'Transport', icon: '🚌', type: 'operational' },
  { id: 'data', name: 'Data/Internet', icon: '📱', type: 'operational' },
  { id: 'food', name: 'Food/Groceries', icon: '🍎', type: 'operational' },
  { id: 'personal', name: 'Personal Care', icon: '🧴', type: 'operational' },
  { id: 'entertainment', name: 'Entertainment', icon: '🎬', type: 'operational' },
  { id: 'subscriptions', name: 'Subscriptions', icon: '📺', type: 'operational' }
]

export default function OnboardingFlow({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState({
    income: '',
    fixed: [],
    operational: [],
    savings: [
      { id: 'academic', name: 'Academic Fund', target: 0 },
      { id: 'contingency', name: 'Emergency Fund', target: 0 },
      { id: 'lifestyle', name: 'Lifestyle Fund', target: 0 }
    ]
  })
  const { initializeBudget } = useBudgetStore()

  const updateField = (path, value) => {
    setFormData(prev => {
      const updated = { ...prev }
      if (path.includes('.')) {
        const [parent, child, grandchild] = path.split('.')
        if (grandchild !== undefined) {
          updated[parent][child][grandchild] = value
        } else {
          updated[parent][child] = value
        }
      } else {
        updated[path] = value
      }
      return updated
    })
  }

  const addCategory = (type) => {
    const newCat = {
      id: `custom_${Date.now()}`,
      name: '',
      amount: 0,
      type,
      isCustom: true
    }
    updateField(type, [...formData[type], newCat])
  }

  const removeCategory = (type, index) => {
    updateField(type, formData[type].filter((_, i) => i !== index))
  }

  const updateCategory = (type, index, field, value) => {
    const updated = [...formData[type]]
    updated[index] = { ...updated[index], [field]: value }
    updateField(type, updated)
  }

  const calculateTotal = (categories) => 
    categories.reduce((sum, cat) => sum + (cat.amount || 0), 0)

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleSubmit = () => {
    const allCategories = [
      ...formData.fixed.map(c => ({ ...c, type: 'fixed' })),
      ...formData.operational.map(c => ({ ...c, type: 'operational' }))
    ]

    const budgetConfig = {
      income: parseInt(formData.income),
      categories: allCategories.filter(c => c.amount > 0),
      savings: formData.savings.filter(s => s.target > 0)
    }

    initializeBudget(budgetConfig)
    onComplete()
  }

  const totalAllocated = () => {
    const fixed = calculateTotal(formData.fixed)
    const operational = calculateTotal(formData.operational)
    const savings = formData.savings.reduce((sum, s) => sum + s.target, 0)
    return fixed + operational + savings
  }

  const remaining = () => formData.income - totalAllocated()

  const isValid = () => {
    switch (currentStep) {
      case 0: return formData.income > 0
      case 1:
      case 2:
      case 3:
      case 4: return true
      default: return false
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-8">
            <div className="space-y-2">
              <label className="block text-xs font-bold tracking-widest text-gray-500 uppercase">
                Monthly Income (Kzs)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">KZS</span>
                <input
                  type="number"
                  value={formData.income}
                  onChange={(e) => updateField('income', parseInt(e.target.value) || 0)}
                  className="w-full pl-16 pr-4 py-4 text-3xl font-bold border-3 border-black bg-white focus:outline-none focus:bg-gray-50"
                  placeholder="0"
                  autoFocus
                />
              </div>
            </div>
            
            {formData.income > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 border-3 border-black bg-black text-white"
              >
                <div className="text-xs font-bold tracking-widest opacity-70">AVAILABLE FOR ALLOCATION</div>
                <div className="text-4xl font-bold mt-1">{formData.income.toLocaleString()} KZS</div>
              </motion.div>
            )}
          </div>
        )

      case 1:
        return (
          <CategoryStep
            type="fixed"
            title="Fixed Costs"
            description="Expenses that stay the same each month"
            items={formData.fixed}
            templates={CATEGORY_TEMPLATES.filter(t => t.type === 'fixed')}
            onAdd={() => addCategory('fixed')}
            onRemove={(i) => removeCategory('fixed', i)}
            onUpdate={(i, f, v) => updateCategory('fixed', i, f, v)}
            total={calculateTotal(formData.fixed)}
            income={formData.income}
          />
        )

      case 2:
        return (
          <CategoryStep
            type="operational"
            title="Operational Budget"
            description="Flexible spending for daily needs"
            items={formData.operational}
            templates={CATEGORY_TEMPLATES.filter(t => t.type === 'operational')}
            onAdd={() => addCategory('operational')}
            onRemove={(i) => removeCategory('operational', i)}
            onUpdate={(i, f, v) => updateCategory('operational', i, f, v)}
            total={calculateTotal(formData.operational)}
            income={formData.income}
          />
        )

      case 3:
        return (
          <SavingsStep
            savings={formData.savings}
            onUpdate={(i, target) => {
              const updated = [...formData.savings]
              updated[i].target = target
              updateField('savings', updated)
            }}
            totalSavings={formData.savings.reduce((sum, s) => sum + s.target, 0)}
            remaining={remaining()}
          />
        )

      case 4:
        return (
          <ReviewStep
            formData={formData}
            onReset={() => setCurrentStep(0)}
          />
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-dvh bg-white">
      <div className="max-w-lg mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <span className="text-accent">//</span> {APP_CONFIG.name.toUpperCase()} SETUP
          </h1>
          <p className="text-gray-500 text-sm mt-1">Zero-based budget allocation</p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex gap-1">
            {STEPS.map((step, i) => (
              <div
                key={step.id}
                className={`h-1 flex-1 transition-colors ${
                  i <= currentStep ? 'bg-black' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
          <div className="mt-3 flex justify-between text-xs font-bold tracking-widest text-gray-400">
            <span>STEP {currentStep + 1} OF {STEPS.length}</span>
            <span>{STEPS[currentStep].title}</span>
          </div>
        </div>

        {/* Content */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-xl font-bold mb-1">{STEPS[currentStep].title}</h2>
          <p className="text-gray-500 text-sm mb-6">{STEPS[currentStep].subtitle}</p>
          {renderStepContent()}
        </motion.div>

        {/* Allocation Summary */}
        {formData.income > 0 && (
          <div className="mb-6 p-4 border-3 border-black">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-xs font-bold tracking-widest text-gray-500">ALLOCATED</div>
                <div className="text-lg font-bold">{totalAllocated().toLocaleString()}</div>
              </div>
              <div>
                <div className="text-xs font-bold tracking-widest text-gray-500">REMAINING</div>
                <div className={`text-lg font-bold ${remaining() < 0 ? 'text-danger' : 'text-accent'}`}>
                  {remaining().toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-xs font-bold tracking-widest text-gray-500">INCOME</div>
                <div className="text-lg font-bold">{formData.income.toLocaleString()}</div>
              </div>
            </div>
            <div className="mt-3 h-2 bg-gray-200">
              <div
                className="h-full bg-black transition-all"
                style={{ width: `${Math.min((totalAllocated() / formData.income) * 100, 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3">
          {currentStep > 0 && (
            <button
              onClick={handleBack}
              className="flex-1 py-4 border-3 border-black font-bold tracking-widest flex items-center justify-center gap-2 hover:bg-black hover:text-white transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              BACK
            </button>
          )}
          {currentStep < STEPS.length - 1 ? (
            <button
              onClick={handleNext}
              disabled={!isValid()}
              className="flex-1 py-4 bg-black text-white border-3 border-black font-bold tracking-widest flex items-center justify-center gap-2 hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              NEXT
              <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={remaining() < 0}
              className="flex-1 py-4 bg-accent text-black border-3 border-black font-bold tracking-widest flex items-center justify-center gap-2 hover:bg-orange-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <Check className="w-5 h-5" />
              START TRACKING
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function CategoryStep({ type, title, description, items, templates, onAdd, onRemove, onUpdate, total, income }) {
  const presets = templates.filter(t => !items.some(i => i.id === t.id))

  return (
    <div className="space-y-6">
      {/* Selected Categories */}
      {items.length > 0 && (
        <div className="space-y-3">
          {items.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="flex gap-3 items-stretch"
            >
              <div className="flex-1 grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => onUpdate(i, 'name', e.target.value)}
                  placeholder="Category name"
                  className="px-3 py-3 border-3 border-black font-bold text-sm focus:outline-none focus:bg-gray-50"
                />
                <div className="relative">
                  <input
                    type="number"
                    value={item.amount || ''}
                    onChange={(e) => onUpdate(i, 'amount', parseInt(e.target.value) || 0)}
                    placeholder="0"
                    className="w-full px-3 py-3 pr-12 border-3 border-black font-bold text-sm focus:outline-none focus:bg-gray-50"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">KZS</span>
                </div>
              </div>
              <button
                onClick={() => onRemove(i)}
                className="px-3 border-3 border-black hover:bg-danger hover:text-white transition-colors font-bold"
              >
                ×
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Preset Templates */}
      {presets.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-bold tracking-widest text-gray-500 uppercase">Quick Add</div>
          <div className="flex flex-wrap gap-2">
            {presets.map(template => (
              <button
                key={template.id}
                onClick={() => onUpdate(items.length, 'name', template.name)}
                className="px-3 py-2 border-2 border-gray-300 text-sm font-bold hover:border-black hover:bg-black hover:text-white transition-colors"
              >
                {template.icon} {template.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Add Custom */}
      <button
        onClick={onAdd}
        className="w-full py-3 border-3 border-dashed border-gray-300 font-bold text-sm hover:border-black transition-colors"
      >
        + ADD CUSTOM CATEGORY
      </button>

      {/* Total */}
      <div className="p-4 bg-gray-100 border-3 border-black">
        <div className="flex justify-between items-center">
          <span className="font-bold tracking-widest">TOTAL {type.toUpperCase()}</span>
          <span className="text-2xl font-bold">{total.toLocaleString()} KZS</span>
        </div>
      </div>
    </div>
  )
}

function SavingsStep({ savings, onUpdate, totalSavings, remaining }) {
  return (
    <div className="space-y-6">
      {savings.map((sav, i) => (
        <div key={sav.id} className="space-y-2">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            <label className="font-bold">{sav.name}</label>
          </div>
          <div className="relative">
            <input
              type="number"
              value={sav.target || ''}
              onChange={(e) => onUpdate(i, parseInt(e.target.value) || 0)}
              placeholder="Target amount"
              className="w-full px-4 py-4 pr-14 border-3 border-black font-bold text-xl focus:outline-none focus:bg-gray-50"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">KZS</span>
          </div>
          {sav.target > 0 && (
            <div className="h-2 bg-gray-200">
              <div className="h-full bg-accent transition-all" style={{ width: '0%' }} />
            </div>
          )}
        </div>
      ))}

      <div className="p-4 bg-black text-white border-3 border-black">
        <div className="flex justify-between items-center">
          <span className="font-bold tracking-widest">TOTAL SAVINGS</span>
          <span className="text-2xl font-bold text-accent">{totalSavings.toLocaleString()} KZS</span>
        </div>
      </div>

      {remaining < 0 && (
        <div className="p-4 bg-danger text-white border-3 border-black flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          <span className="font-bold text-sm">You've over-allocated {Math.abs(remaining).toLocaleString()} KZS</span>
        </div>
      )}
    </div>
  )
}

function ReviewStep({ formData, onReset }) {
  const totalFixed = formData.fixed.reduce((sum, c) => sum + c.amount, 0)
  const totalOp = formData.operational.reduce((sum, c) => sum + c.amount, 0)
  const totalSavings = formData.savings.reduce((sum, s) => sum + s.target, 0)
  const totalAllocated = totalFixed + totalOp + totalSavings
  const remaining = formData.income - totalAllocated

  return (
    <div className="space-y-6">
      {/* Income */}
      <div className="p-4 border-3 border-black">
        <div className="text-xs font-bold tracking-widest text-gray-500 mb-1">MONTHLY INCOME</div>
        <div className="text-3xl font-bold">{formData.income.toLocaleString()} KZS</div>
      </div>

      {/* Fixed Costs */}
      <div className="border-3 border-black">
        <div className="p-3 bg-black text-white">
          <div className="text-xs font-bold tracking-widest">FIXED COSTS</div>
          <div className="text-lg font-bold">{totalFixed.toLocaleString()} KZS</div>
        </div>
        <div className="divide-y divide-gray-200">
          {formData.fixed.filter(c => c.amount > 0).map(cat => (
            <div key={cat.id} className="p-3 flex justify-between">
              <span className="font-bold">{cat.name}</span>
              <span className="font-bold">{cat.amount.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Operational */}
      <div className="border-3 border-black">
        <div className="p-3 bg-gray-100">
          <div className="text-xs font-bold tracking-widest">OPERATIONAL BUDGET</div>
          <div className="text-lg font-bold">{totalOp.toLocaleString()} KZS</div>
        </div>
        <div className="divide-y divide-gray-200">
          {formData.operational.filter(c => c.amount > 0).map(cat => (
            <div key={cat.id} className="p-3 flex justify-between">
              <span className="font-bold">{cat.name}</span>
              <span className="font-bold">{cat.amount.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Savings */}
      <div className="border-3 border-black">
        <div className="p-3 bg-accent text-black">
          <div className="text-xs font-bold tracking-widest">SAVINGS TARGETS</div>
          <div className="text-lg font-bold">{totalSavings.toLocaleString()} KZS</div>
        </div>
        <div className="divide-y divide-gray-200">
          {formData.savings.filter(s => s.target > 0).map(sav => (
            <div key={sav.id} className="p-3 flex justify-between">
              <span className="font-bold">{sav.name}</span>
              <span className="font-bold">{sav.target.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className={`p-4 border-3 ${remaining >= 0 ? 'border-black bg-black text-white' : 'border-danger bg-danger text-white'}`}>
        <div className="flex justify-between items-center">
          <span className="font-bold tracking-widest">REMAINING TO ALLOCATE</span>
          <span className="text-3xl font-bold text-accent">{remaining.toLocaleString()} KZS</span>
        </div>
      </div>

      <button
        onClick={onReset}
        className="w-full py-3 border-3 border-gray-300 font-bold text-sm hover:border-black transition-colors"
      >
        START OVER
      </button>
    </div>
  )
}