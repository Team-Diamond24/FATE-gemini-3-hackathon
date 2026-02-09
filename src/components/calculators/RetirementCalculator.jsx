import { useState } from 'react'
import { motion } from 'framer-motion'

export default function RetirementCalculator() {
    const [currentAge, setCurrentAge] = useState(25)
    const [retirementAge, setRetirementAge] = useState(60)
    const [monthlyExpense, setMonthlyExpense] = useState(30000)
    const [inflation, setInflation] = useState(6)
    const [returnRate, setReturnRate] = useState(12)
    const [result, setResult] = useState(null)

    const calculate = () => {
        const yearsToRetirement = retirementAge - currentAge
        const yearsInRetirement = 25 // Assuming 25 years post-retirement
        
        // Future monthly expense at retirement
        const futureExpense = monthlyExpense * Math.pow(1 + inflation / 100, yearsToRetirement)
        
        // Corpus needed at retirement (considering inflation during retirement)
        const realReturn = ((1 + returnRate / 100) / (1 + inflation / 100)) - 1
        const corpusNeeded = (futureExpense * 12) * ((1 - Math.pow(1 + realReturn, -yearsInRetirement)) / realReturn)
        
        // Monthly SIP needed
        const r = returnRate / 12 / 100
        const n = yearsToRetirement * 12
        const monthlySIP = corpusNeeded / (((Math.pow(1 + r, n) - 1) / r) * (1 + r))

        setResult({
            corpusNeeded: Math.round(corpusNeeded),
            monthlySIP: Math.round(monthlySIP),
            futureExpense: Math.round(futureExpense),
            yearsToRetirement
        })
    }

    return (
        <div>
            <h2 className="font-heading text-2xl font-bold mb-2">Retirement Calculator</h2>
            <p className="text-fate-text text-sm mb-6">Plan for your retirement</p>

            <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Current Age</label>
                        <input type="number" value={currentAge} onChange={(e) => setCurrentAge(Number(e.target.value))}
                            className="w-full bg-fate-gray border border-fate-gray/30 rounded-lg px-4 py-3 text-white font-mono" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Retirement Age</label>
                        <input type="number" value={retirementAge} onChange={(e) => setRetirementAge(Number(e.target.value))}
                            className="w-full bg-fate-gray border border-fate-gray/30 rounded-lg px-4 py-3 text-white font-mono" />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">Current Monthly Expense (₹)</label>
                    <input type="number" value={monthlyExpense} onChange={(e) => setMonthlyExpense(Number(e.target.value))}
                        className="w-full bg-fate-gray border border-fate-gray/30 rounded-lg px-4 py-3 text-white font-mono" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Inflation Rate (%)</label>
                        <input type="number" value={inflation} onChange={(e) => setInflation(Number(e.target.value))} step="0.5"
                            className="w-full bg-fate-gray border border-fate-gray/30 rounded-lg px-4 py-3 text-white font-mono" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Expected Return (%)</label>
                        <input type="number" value={returnRate} onChange={(e) => setReturnRate(Number(e.target.value))} step="0.5"
                            className="w-full bg-fate-gray border border-fate-gray/30 rounded-lg px-4 py-3 text-white font-mono" />
                    </div>
                </div>

                <motion.button whileTap={{ scale: 0.98 }} onClick={calculate}
                    className="w-full bg-fate-orange text-black font-bold py-3 rounded-lg hover:bg-fate-orange-light transition-colors">
                    Calculate Retirement Plan
                </motion.button>

                {result && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        className="bg-fate-gray/30 rounded-lg p-6 space-y-4">
                        <div className="flex justify-between items-center pb-4 border-b border-fate-gray/30">
                            <span className="text-fate-text">Corpus Needed</span>
                            <span className="font-mono text-2xl font-bold text-fate-orange">
                                ₹{(result.corpusNeeded / 10000000).toFixed(2)}Cr
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-fate-text">Monthly SIP Required</span>
                            <span className="font-mono text-xl font-bold text-green-400">₹{result.monthlySIP.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-fate-text">Years to Retirement</span>
                            <span className="font-mono font-bold">{result.yearsToRetirement} years</span>
                        </div>
                        <div className="flex justify-between items-center pt-4 border-t border-fate-gray/30">
                            <span className="text-fate-text">Future Monthly Expense</span>
                            <span className="font-mono font-bold">₹{result.futureExpense.toLocaleString()}</span>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    )
}
