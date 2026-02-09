import { useState } from 'react'
import { motion } from 'framer-motion'
import { PlusCircle, MinusCircle } from 'lucide-react'

export default function BudgetPlanner() {
    const [income, setIncome] = useState(50000)
    const [expenses, setExpenses] = useState([
        { id: 1, category: 'Rent', amount: 15000 },
        { id: 2, category: 'Food', amount: 8000 },
        { id: 3, category: 'Transport', amount: 3000 },
        { id: 4, category: 'Utilities', amount: 2000 }
    ])

    const addExpense = () => {
        setExpenses([...expenses, { id: Date.now(), category: '', amount: 0 }])
    }

    const removeExpense = (id) => {
        setExpenses(expenses.filter(e => e.id !== id))
    }

    const updateExpense = (id, field, value) => {
        setExpenses(expenses.map(e => e.id === id ? { ...e, [field]: value } : e))
    }

    const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0)
    const savings = income - totalExpenses
    const savingsPercent = ((savings / income) * 100).toFixed(1)

    return (
        <div>
            <h2 className="font-heading text-2xl font-bold mb-2">Budget Planner</h2>
            <p className="text-fate-text text-sm mb-6">Plan your monthly budget</p>

            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium mb-2">Monthly Income (₹)</label>
                    <input type="number" value={income} onChange={(e) => setIncome(Number(e.target.value))}
                        className="w-full bg-fate-gray border border-fate-gray/30 rounded-lg px-4 py-3 text-white font-mono" />
                </div>

                <div>
                    <div className="flex justify-between items-center mb-3">
                        <label className="block text-sm font-medium">Expenses</label>
                        <button onClick={addExpense}
                            className="flex items-center gap-1 text-fate-orange hover:text-fate-orange-light text-sm">
                            <PlusCircle size={16} /> Add
                        </button>
                    </div>
                    <div className="space-y-2">
                        {expenses.map((expense) => (
                            <div key={expense.id} className="flex gap-2">
                                <input type="text" placeholder="Category" value={expense.category}
                                    onChange={(e) => updateExpense(expense.id, 'category', e.target.value)}
                                    className="flex-1 bg-fate-gray border border-fate-gray/30 rounded-lg px-3 py-2 text-white text-sm" />
                                <input type="number" placeholder="Amount" value={expense.amount || ''}
                                    onChange={(e) => updateExpense(expense.id, 'amount', Number(e.target.value))}
                                    className="w-32 bg-fate-gray border border-fate-gray/30 rounded-lg px-3 py-2 text-white font-mono text-sm" />
                                <button onClick={() => removeExpense(expense.id)}
                                    className="text-red-400 hover:text-red-300">
                                    <MinusCircle size={20} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-fate-gray/30 rounded-lg p-6 space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="text-fate-text">Total Income</span>
                        <span className="font-mono font-bold text-green-400">₹{income.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-fate-text">Total Expenses</span>
                        <span className="font-mono font-bold text-red-400">₹{totalExpenses.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t border-fate-gray/30">
                        <span className="text-fate-text">Savings</span>
                        <div className="text-right">
                            <div className={`font-mono text-2xl font-bold ${savings >= 0 ? 'text-fate-orange' : 'text-red-400'}`}>
                                ₹{savings.toLocaleString()}
                            </div>
                            <div className="text-xs text-fate-text">{savingsPercent}% of income</div>
                        </div>
                    </div>
                </motion.div>

                {savings < 0 && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                        <p className="text-red-400 text-sm">⚠️ Your expenses exceed your income. Consider reducing expenses.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
