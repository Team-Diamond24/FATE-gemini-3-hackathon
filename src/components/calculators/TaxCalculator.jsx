import { useState } from 'react'
import { motion } from 'framer-motion'

export default function TaxCalculator() {
    const [income, setIncome] = useState(800000)
    const [regime, setRegime] = useState('new')
    const [result, setResult] = useState(null)

    const calculate = () => {
        let tax = 0
        const taxableIncome = income

        if (regime === 'old') {
            // Old regime with standard deduction
            const deduction = 50000
            const netIncome = Math.max(0, taxableIncome - deduction)
            
            if (netIncome <= 250000) tax = 0
            else if (netIncome <= 500000) tax = (netIncome - 250000) * 0.05
            else if (netIncome <= 1000000) tax = 12500 + (netIncome - 500000) * 0.20
            else tax = 112500 + (netIncome - 1000000) * 0.30
        } else {
            // New regime
            if (taxableIncome <= 300000) tax = 0
            else if (taxableIncome <= 600000) tax = (taxableIncome - 300000) * 0.05
            else if (taxableIncome <= 900000) tax = 15000 + (taxableIncome - 600000) * 0.10
            else if (taxableIncome <= 1200000) tax = 45000 + (taxableIncome - 900000) * 0.15
            else if (taxableIncome <= 1500000) tax = 90000 + (taxableIncome - 1200000) * 0.20
            else tax = 150000 + (taxableIncome - 1500000) * 0.30
        }

        // Add 4% cess
        const cess = tax * 0.04
        const totalTax = Math.round(tax + cess)
        const netIncome = income - totalTax

        setResult({
            totalTax,
            netIncome,
            effectiveRate: ((totalTax / income) * 100).toFixed(2)
        })
    }

    return (
        <div>
            <h2 className="font-heading text-2xl font-bold mb-2">Income Tax Calculator</h2>
            <p className="text-fate-text text-sm mb-6">Calculate your income tax (India)</p>

            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium mb-2">Annual Income (₹)</label>
                    <input type="number" value={income} onChange={(e) => setIncome(Number(e.target.value))}
                        className="w-full bg-fate-gray border border-fate-gray/30 rounded-lg px-4 py-3 text-white font-mono" />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">Tax Regime</label>
                    <select value={regime} onChange={(e) => setRegime(e.target.value)}
                        className="w-full bg-fate-gray border border-fate-gray/30 rounded-lg px-4 py-3 text-white font-mono">
                        <option value="new">New Regime (FY 2023-24)</option>
                        <option value="old">Old Regime</option>
                    </select>
                </div>

                <motion.button whileTap={{ scale: 0.98 }} onClick={calculate}
                    className="w-full bg-fate-orange text-black font-bold py-3 rounded-lg hover:bg-fate-orange-light transition-colors">
                    Calculate Tax
                </motion.button>

                {result && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        className="bg-fate-gray/30 rounded-lg p-6 space-y-4">
                        <div className="flex justify-between items-center pb-4 border-b border-fate-gray/30">
                            <span className="text-fate-text">Total Tax</span>
                            <span className="font-mono text-2xl font-bold text-red-400">
                                ₹{result.totalTax.toLocaleString()}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-fate-text">Gross Income</span>
                            <span className="font-mono font-bold">₹{income.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-fate-text">Effective Tax Rate</span>
                            <span className="font-mono font-bold">{result.effectiveRate}%</span>
                        </div>
                        <div className="flex justify-between items-center pt-4 border-t border-fate-gray/30">
                            <span className="text-fate-text">Net Income</span>
                            <span className="font-mono text-xl font-bold text-green-400">₹{result.netIncome.toLocaleString()}</span>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    )
}
