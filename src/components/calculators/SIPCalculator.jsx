import { useState } from 'react'
import { motion } from 'framer-motion'

export default function SIPCalculator() {
    const [monthly, setMonthly] = useState(5000)
    const [rate, setRate] = useState(12)
    const [years, setYears] = useState(10)
    const [result, setResult] = useState(null)

    const calculate = () => {
        const P = monthly
        const r = rate / 12 / 100
        const n = years * 12

        const futureValue = P * (((Math.pow(1 + r, n) - 1) / r) * (1 + r))
        const invested = P * n
        const returns = futureValue - invested

        setResult({
            futureValue: Math.round(futureValue),
            invested: Math.round(invested),
            returns: Math.round(returns)
        })
    }

    return (
        <div>
            <h2 className="font-heading text-2xl font-bold mb-2">SIP Calculator</h2>
            <p className="text-fate-text text-sm mb-6">Systematic Investment Plan calculator</p>

            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium mb-2">Monthly Investment (₹)</label>
                    <input type="number" value={monthly} onChange={(e) => setMonthly(Number(e.target.value))}
                        className="w-full bg-fate-gray border border-fate-gray/30 rounded-lg px-4 py-3 text-white font-mono" />
                    <input type="range" min="500" max="100000" step="500" value={monthly}
                        onChange={(e) => setMonthly(Number(e.target.value))} className="w-full mt-2" />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">Expected Return (% p.a.)</label>
                    <input type="number" value={rate} onChange={(e) => setRate(Number(e.target.value))} step="0.5"
                        className="w-full bg-fate-gray border border-fate-gray/30 rounded-lg px-4 py-3 text-white font-mono" />
                    <input type="range" min="1" max="30" step="0.5" value={rate}
                        onChange={(e) => setRate(Number(e.target.value))} className="w-full mt-2" />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">Time Period (years)</label>
                    <input type="number" value={years} onChange={(e) => setYears(Number(e.target.value))}
                        className="w-full bg-fate-gray border border-fate-gray/30 rounded-lg px-4 py-3 text-white font-mono" />
                    <input type="range" min="1" max="40" value={years}
                        onChange={(e) => setYears(Number(e.target.value))} className="w-full mt-2" />
                </div>

                <motion.button whileTap={{ scale: 0.98 }} onClick={calculate}
                    className="w-full bg-fate-orange text-black font-bold py-3 rounded-lg hover:bg-fate-orange-light transition-colors">
                    Calculate Returns
                </motion.button>

                {result && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        className="bg-fate-gray/30 rounded-lg p-6 space-y-4">
                        <div className="flex justify-between items-center pb-4 border-b border-fate-gray/30">
                            <span className="text-fate-text">Future Value</span>
                            <span className="font-mono text-2xl font-bold text-fate-orange">
                                ₹{result.futureValue.toLocaleString()}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-fate-text">Total Invested</span>
                            <span className="font-mono font-bold">₹{result.invested.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center pt-4 border-t border-fate-gray/30">
                            <span className="text-fate-text">Estimated Returns</span>
                            <span className="font-mono text-xl font-bold text-green-400">₹{result.returns.toLocaleString()}</span>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    )
}
