import { useState } from 'react'
import { motion } from 'framer-motion'

export default function CompoundInterestCalculator() {
    const [principal, setPrincipal] = useState(100000)
    const [rate, setRate] = useState(8)
    const [time, setTime] = useState(5)
    const [frequency, setFrequency] = useState(12)
    const [result, setResult] = useState(null)

    const calculate = () => {
        const P = principal
        const r = rate / 100
        const t = time
        const n = frequency

        const amount = P * Math.pow((1 + r / n), n * t)
        const interest = amount - P

        setResult({
            amount: Math.round(amount),
            interest: Math.round(interest),
            principal: P
        })
    }

    return (
        <div>
            <h2 className="font-heading text-2xl font-bold mb-2">Compound Interest Calculator</h2>
            <p className="text-fate-text text-sm mb-6">Calculate compound interest on your investments</p>

            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium mb-2">Principal Amount (₹)</label>
                    <input type="number" value={principal} onChange={(e) => setPrincipal(Number(e.target.value))}
                        className="w-full bg-fate-gray border border-fate-gray/30 rounded-lg px-4 py-3 text-white font-mono" />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">Annual Interest Rate (%)</label>
                    <input type="number" value={rate} onChange={(e) => setRate(Number(e.target.value))} step="0.1"
                        className="w-full bg-fate-gray border border-fate-gray/30 rounded-lg px-4 py-3 text-white font-mono" />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">Time Period (years)</label>
                    <input type="number" value={time} onChange={(e) => setTime(Number(e.target.value))}
                        className="w-full bg-fate-gray border border-fate-gray/30 rounded-lg px-4 py-3 text-white font-mono" />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">Compounding Frequency</label>
                    <select value={frequency} onChange={(e) => setFrequency(Number(e.target.value))}
                        className="w-full bg-fate-gray border border-fate-gray/30 rounded-lg px-4 py-3 text-white font-mono">
                        <option value={1}>Annually</option>
                        <option value={2}>Semi-Annually</option>
                        <option value={4}>Quarterly</option>
                        <option value={12}>Monthly</option>
                        <option value={365}>Daily</option>
                    </select>
                </div>

                <motion.button whileTap={{ scale: 0.98 }} onClick={calculate}
                    className="w-full bg-fate-orange text-black font-bold py-3 rounded-lg hover:bg-fate-orange-light transition-colors">
                    Calculate
                </motion.button>

                {result && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        className="bg-fate-gray/30 rounded-lg p-6 space-y-4">
                        <div className="flex justify-between items-center pb-4 border-b border-fate-gray/30">
                            <span className="text-fate-text">Final Amount</span>
                            <span className="font-mono text-2xl font-bold text-fate-orange">
                                ₹{result.amount.toLocaleString()}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-fate-text">Principal</span>
                            <span className="font-mono font-bold">₹{result.principal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center pt-4 border-t border-fate-gray/30">
                            <span className="text-fate-text">Interest Earned</span>
                            <span className="font-mono text-xl font-bold text-green-400">₹{result.interest.toLocaleString()}</span>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    )
}
