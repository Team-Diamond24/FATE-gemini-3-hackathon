import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Calculator, TrendingUp, PiggyBank, CreditCard, Home, Percent, DollarSign } from 'lucide-react'
import EMICalculator from '../components/calculators/EMICalculator'
import SIPCalculator from '../components/calculators/SIPCalculator'
import CompoundInterestCalculator from '../components/calculators/CompoundInterestCalculator'
import TaxCalculator from '../components/calculators/TaxCalculator'
import BudgetPlanner from '../components/calculators/BudgetPlanner'
import RetirementCalculator from '../components/calculators/RetirementCalculator'

export default function MathTools() {
    const [activeTool, setActiveTool] = useState('emi')

    const tools = [
        { id: 'emi', label: 'EMI Calculator', icon: CreditCard, component: EMICalculator },
        { id: 'sip', label: 'SIP Calculator', icon: TrendingUp, component: SIPCalculator },
        { id: 'compound', label: 'Compound Interest', icon: Percent, component: CompoundInterestCalculator },
        { id: 'tax', label: 'Tax Calculator', icon: Calculator, component: TaxCalculator },
        { id: 'budget', label: 'Budget Planner', icon: PiggyBank, component: BudgetPlanner },
        { id: 'retirement', label: 'Retirement Planner', icon: Home, component: RetirementCalculator }
    ]

    const ActiveComponent = tools.find(t => t.id === activeTool)?.component

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Header */}
            <header className="border-b border-fate-gray/30 bg-black sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => window.location.hash = '#/dashboard'}
                            className="w-10 h-10 border border-fate-gray rounded flex items-center justify-center hover:bg-fate-gray/50 transition-colors"
                        >
                            <ArrowLeft size={18} />
                        </button>
                        <div>
                            <h1 className="font-heading text-2xl font-bold">Financial Tools</h1>
                            <p className="font-mono text-xs text-fate-text">Calculate, plan, and optimize</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
                    {/* Sidebar */}
                    <aside className="space-y-2">
                        {tools.map((tool) => {
                            const Icon = tool.icon
                            return (
                                <button
                                    key={tool.id}
                                    onClick={() => setActiveTool(tool.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-mono text-sm transition-colors ${
                                        activeTool === tool.id
                                            ? 'bg-fate-orange text-black'
                                            : 'bg-fate-card text-white hover:bg-fate-gray border border-fate-gray/30'
                                    }`}
                                >
                                    <Icon size={18} />
                                    {tool.label}
                                </button>
                            )
                        })}
                    </aside>

                    {/* Calculator Content */}
                    <main className="bg-fate-card border border-fate-gray/30 rounded-xl p-6">
                        {ActiveComponent && <ActiveComponent />}
                    </main>
                </div>
            </div>
        </div>
    )
}
