import { useState } from 'react'
import { motion } from 'framer-motion'

export default function EMICalculator() {
    const [principal, setPrincipal] = useState(500000)
    const [rate, setRate] = useState(8.5)
    const [tenure, setTenure] = useState(12)
    const [result, setResult] = useState(null)

    const calculateEMI = () => {
        const P = principal
        const r = rate / 12 / 100
        const n = tenure

        const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
        const totalAmount = emi * n
        const totalInterest = totalAmount - P

        setResult({
            emi: Math.round(emi),
            totalAmount: Math.round(totalAmount),
            totalInterest: Math.round(totalInterest),
            principal: P
        })
    }

    return (
        <div>
            <h2 className="font-heading text-2xl font-bold mb-2">EMI Calculator</h2>
            <p className="text-fate-text text-sm mb-6">Calculate your Equated Monthly Installment</p>

            <div className="space-y-6">
                {/* Principal */}
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Loan Amount (₹)
                    </label>
                    <input
                        type="number"
                        value={principal}
                        onChange={(e) => setPrincipal(Number(e.target.value))}
                        className="w-full bg-fate-gray border border-fate-gray/30 rounded-lg px-4 py-3 text-white font-mono"
                    />
                    <input
                        type="range"
                        min="10000"
                        max="10000000"
                        step="10000"
                        value={principal}
                        onChange={(e) => setPrincipal(Number(e.target.value))}
                        className="w-full mt-2"
                    />
                </div>

                {/* Interest Rate */}
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Interest Rate (% per annum)
                    </label>
                    <input
                        type="number"
                        value={rate}
                        onChange={(e) => setRate(Number(e.target.value))}
                        step="0.1"
                        className="w-full bg-fate-gray border border-fate-gray/30 rounded-lg px-4 py-3 text-white font-mono"
                    />
                    <input
                        type="range"
                        min="1"
                        max="20"
                        step="0.1"
                        value={rate}
                        onChange={(e) => setRate(Number(e.target.value))}
                        className="w-full mt-2"
                    />
                </div>

                {/* Tenure */}
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Loan Tenure (months)
                    </label>
                    <input
                        type="number"
                        value={tenure}
                        onChange={(e) => setTenure(Number(e.target.value))}
                        className="w-full bg-fate-gray border border-fate-gray/30 rounded-lg px-4 py-3 text-white font-mono"
                    />
                    <input
                        type="range"
                        min="6"
                        max="360"
                        value={tenure}
                        onChange={(e) => setTenure(Number(e.target.value))}
                        className="w-full mt-2"
                    />
                </div>

                {/* Calculate Button */}
                <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={calculateEMI}
                    className="w-full bg-fate-orange text-black font-bold py-3 rounded-lg hover:bg-fate-orange-light transition-colors"
                >
                    Calculate EMI
                </motion.button>

                {/* Results */}
                {result && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-fate-gray/30 rounded-lg p-6 space-y-4"
                    >
                        <div className="flex justify-between items-center pb-4 border-b border-fate-gray/30">
                            <span className="text-fate-text">Monthly EMI</span>
                            <span className="font-mono text-2xl font-bold text-fate-orange">
                                ₹{result.emi.toLocaleString()}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-fate-text">Principal Amount</span>
                            <span className="font-mono font-bold">₹{result.principal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-fate-text">Total Interest</span>
                            <span className="font-mono font-bold text-red-400">₹{result.totalInterest.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center pt-4 border-t border-fate-gray/30">
                            <span className="text-fate-text">Total Amount</span>
                            <span className="font-mono text-xl font-bold">₹{result.totalAmount.toLocaleString()}</span>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    )
}
