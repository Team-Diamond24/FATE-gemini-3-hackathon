import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TrendingUp, Shield, Briefcase, X, DollarSign } from 'lucide-react'
import { useGame } from '../context/GameContext'
import SoundButton from './SoundButton'

export default function InvestmentManager() {
    const { state, dispatch } = useGame()
    const [isOpen, setIsOpen] = useState(false)
    const [activeTab, setActiveTab] = useState('insurance') // insurance, fd, mf
    const [amount, setAmount] = useState('')
    const [error, setError] = useState('')
    const [fdTenure, setFdTenure] = useState(12) // months
    const [mfType, setMfType] = useState('equity') // equity, debt, hybrid

    // Investment data
    const investments = state.investments || {
        insurance: { active: false, monthlyPremium: 0, coverage: 0 },
        fixedDeposits: [],
        mutualFunds: []
    }

    const handleInsuranceToggle = () => {
        if (investments.insurance.active) {
            // Cancel insurance
            dispatch({ 
                type: 'CANCEL_INSURANCE'
            })
            setError('')
        } else {
            // Start insurance
            const premium = parseFloat(amount)
            if (!premium || premium <= 0) {
                setError('Enter valid premium amount')
                return
            }
            if (premium > state.balance) {
                setError('Insufficient balance')
                return
            }

            dispatch({
                type: 'START_INSURANCE',
                payload: { monthlyPremium: premium, coverage: premium * 100 }
            })
            setAmount('')
            setError('')
        }
    }

    const handleFDInvestment = () => {
        const fdAmount = parseFloat(amount)
        if (!fdAmount || fdAmount <= 0) {
            setError('Enter valid amount')
            return
        }

        const source = document.querySelector('input[name="fd-source"]:checked')?.value || 'balance'
        const availableAmount = source === 'savings' ? state.savings : state.balance

        if (fdAmount > availableAmount) {
            setError(`Insufficient ${source}`)
            return
        }

        dispatch({
            type: 'START_FD',
            payload: { amount: fdAmount, tenure: fdTenure, source, interestRate: 7.5 }
        })
        setAmount('')
        setError('')
    }

    const handleMFInvestment = () => {
        const mfAmount = parseFloat(amount)
        if (!mfAmount || mfAmount <= 0) {
            setError('Enter valid amount')
            return
        }

        const source = document.querySelector('input[name="mf-source"]:checked')?.value || 'balance'
        const availableAmount = source === 'savings' ? state.savings : state.balance

        if (mfAmount > availableAmount) {
            setError(`Insufficient ${source}`)
            return
        }

        dispatch({
            type: 'START_MF',
            payload: { amount: mfAmount, type: mfType, source }
        })
        setAmount('')
        setError('')
    }

    return (
        <>
            <SoundButton
                onClick={() => setIsOpen(true)}
                className="bg-fate-card border border-fate-orange/30 rounded-xl p-4 hover:border-fate-orange/50 transition-all w-full"
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-purple-500/20 p-2 rounded-lg">
                            <TrendingUp size={20} className="text-purple-400" />
                        </div>
                        <div>
                            <p className="text-xs text-fate-text">Investments</p>
                            <p className="font-mono text-sm text-white">Insurance, FD, MF</p>
                        </div>
                    </div>
                    <DollarSign size={18} className="text-fate-text" />
                </div>
            </SoundButton>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
                            style={{ backdropFilter: 'blur(8px)' }}
                        >
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                onClick={(e) => e.stopPropagation()}
                                className="bg-fate-card border border-fate-orange/30 rounded-xl p-6 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
                            >
                                {/* Header */}
                                <div className="flex justify-between items-center mb-6 pb-4 border-b border-fate-gray/30">
                                    <div>
                                        <h3 className="font-heading text-2xl font-bold text-white">Investment Manager</h3>
                                        <p className="text-xs text-fate-text mt-1">Grow your wealth with smart investments</p>
                                    </div>
                                    <SoundButton
                                        onClick={() => setIsOpen(false)}
                                        className="text-fate-text hover:text-white transition-colors"
                                    >
                                        <X size={24} />
                                    </SoundButton>
                                </div>

                                {/* Tabs */}
                                <div className="flex gap-2 mb-6">
                                    <SoundButton
                                        onClick={() => { setActiveTab('insurance'); setError(''); setAmount('') }}
                                        className={`flex-1 py-2 rounded-lg font-mono text-sm transition-colors ${activeTab === 'insurance'
                                            ? 'bg-fate-orange text-black'
                                            : 'bg-fate-gray text-white hover:bg-fate-gray/70'
                                        }`}
                                    >
                                        <Shield size={16} className="inline mr-2" />
                                        Insurance
                                    </SoundButton>
                                    <SoundButton
                                        onClick={() => { setActiveTab('fd'); setError(''); setAmount('') }}
                                        className={`flex-1 py-2 rounded-lg font-mono text-sm transition-colors ${activeTab === 'fd'
                                            ? 'bg-fate-orange text-black'
                                            : 'bg-fate-gray text-white hover:bg-fate-gray/70'
                                        }`}
                                    >
                                        <Briefcase size={16} className="inline mr-2" />
                                        Fixed Deposit
                                    </SoundButton>
                                    <SoundButton
                                        onClick={() => { setActiveTab('mf'); setError(''); setAmount('') }}
                                        className={`flex-1 py-2 rounded-lg font-mono text-sm transition-colors ${activeTab === 'mf'
                                            ? 'bg-fate-orange text-black'
                                            : 'bg-fate-gray text-white hover:bg-fate-gray/70'
                                        }`}
                                    >
                                        <TrendingUp size={16} className="inline mr-2" />
                                        Mutual Funds
                                    </SoundButton>
                                </div>

                                {/* Content */}
                                <div className="space-y-4">
                                    {/* Insurance Tab */}
                                    {activeTab === 'insurance' && (
                                        <div>
                                            <div className="bg-fate-gray/30 rounded-lg p-4 mb-4">
                                                <h4 className="font-bold text-white mb-2">Life Insurance</h4>
                                                <p className="text-xs text-fate-text mb-3">
                                                    Protect yourself from unexpected events. Premium deducted monthly from balance.
                                                </p>
                                                {investments.insurance.active ? (
                                                    <div className="space-y-2">
                                                        <div className="flex justify-between text-sm">
                                                            <span className="text-fate-text">Monthly Premium:</span>
                                                            <span className="text-white font-mono">₹{investments.insurance.monthlyPremium}</span>
                                                        </div>
                                                        <div className="flex justify-between text-sm">
                                                            <span className="text-fate-text">Coverage:</span>
                                                            <span className="text-green-400 font-mono">₹{investments.insurance.coverage}</span>
                                                        </div>
                                                        <SoundButton
                                                            onClick={handleInsuranceToggle}
                                                            className="w-full bg-red-500/20 text-red-400 border border-red-500/30 py-2 rounded-lg hover:bg-red-500/30 transition-colors mt-3"
                                                        >
                                                            Cancel Insurance
                                                        </SoundButton>
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <label className="block text-sm font-medium mb-2">Monthly Premium (₹)</label>
                                                        <input
                                                            type="number"
                                                            value={amount}
                                                            onChange={(e) => { setAmount(e.target.value); setError('') }}
                                                            placeholder="e.g., 500"
                                                            className="w-full bg-fate-gray border border-fate-gray/30 rounded-lg px-4 py-3 text-white font-mono mb-3"
                                                        />
                                                        <p className="text-xs text-fate-text mb-3">
                                                            Coverage: ₹{amount ? parseFloat(amount) * 100 : 0} (100x premium)
                                                        </p>
                                                        <SoundButton
                                                            onClick={handleInsuranceToggle}
                                                            soundType="success"
                                                            className="w-full bg-fate-orange text-black font-bold py-3 rounded-lg hover:bg-fate-orange-light transition-colors"
                                                        >
                                                            Start Insurance
                                                        </SoundButton>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Fixed Deposit Tab */}
                                    {activeTab === 'fd' && (
                                        <div>
                                            <div className="bg-fate-gray/30 rounded-lg p-4 mb-4">
                                                <h4 className="font-bold text-white mb-2">Fixed Deposit</h4>
                                                <p className="text-xs text-fate-text mb-3">
                                                    Lock your money for guaranteed returns. 7.5% annual interest.
                                                </p>
                                                
                                                <label className="block text-sm font-medium mb-2">Amount (₹)</label>
                                                <input
                                                    type="number"
                                                    value={amount}
                                                    onChange={(e) => { setAmount(e.target.value); setError('') }}
                                                    placeholder="Enter amount"
                                                    className="w-full bg-fate-gray border border-fate-gray/30 rounded-lg px-4 py-3 text-white font-mono mb-3"
                                                />

                                                <label className="block text-sm font-medium mb-2">Tenure (months)</label>
                                                <select
                                                    value={fdTenure}
                                                    onChange={(e) => setFdTenure(parseInt(e.target.value))}
                                                    className="w-full bg-fate-gray border border-fate-gray/30 rounded-lg px-4 py-3 text-white font-mono mb-3"
                                                >
                                                    <option value={6}>6 months</option>
                                                    <option value={12}>12 months</option>
                                                    <option value={24}>24 months</option>
                                                    <option value={36}>36 months</option>
                                                </select>

                                                <label className="block text-sm font-medium mb-2">Source</label>
                                                <div className="flex gap-4 mb-3">
                                                    <label className="flex items-center gap-2 text-sm text-white">
                                                        <input type="radio" name="fd-source" value="balance" defaultChecked />
                                                        Balance (₹{state.balance})
                                                    </label>
                                                    <label className="flex items-center gap-2 text-sm text-white">
                                                        <input type="radio" name="fd-source" value="savings" />
                                                        Savings (₹{state.savings})
                                                    </label>
                                                </div>

                                                <p className="text-xs text-fate-text mb-3">
                                                    Maturity: ₹{amount ? Math.round(parseFloat(amount) * (1 + 0.075 * fdTenure / 12)) : 0}
                                                </p>

                                                <SoundButton
                                                    onClick={handleFDInvestment}
                                                    soundType="success"
                                                    className="w-full bg-fate-orange text-black font-bold py-3 rounded-lg hover:bg-fate-orange-light transition-colors"
                                                >
                                                    Start FD
                                                </SoundButton>
                                            </div>

                                            {/* Active FDs */}
                                            {investments.fixedDeposits.length > 0 && (
                                                <div className="space-y-2">
                                                    <h5 className="text-sm font-bold text-white">Active FDs</h5>
                                                    {investments.fixedDeposits.map((fd, idx) => (
                                                        <div key={idx} className="bg-fate-gray/20 rounded-lg p-3 text-xs">
                                                            <div className="flex justify-between">
                                                                <span className="text-fate-text">Amount:</span>
                                                                <span className="text-white font-mono">₹{fd.amount}</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="text-fate-text">Maturity:</span>
                                                                <span className="text-green-400 font-mono">₹{fd.maturityAmount}</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="text-fate-text">Matures in:</span>
                                                                <span className="text-white font-mono">{fd.remainingMonths} months</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Mutual Funds Tab */}
                                    {activeTab === 'mf' && (
                                        <div>
                                            <div className="bg-fate-gray/30 rounded-lg p-4 mb-4">
                                                <h4 className="font-bold text-white mb-2">Mutual Funds</h4>
                                                <p className="text-xs text-fate-text mb-3">
                                                    Market-linked returns. Higher risk, higher potential returns.
                                                </p>
                                                
                                                <label className="block text-sm font-medium mb-2">Amount (₹)</label>
                                                <input
                                                    type="number"
                                                    value={amount}
                                                    onChange={(e) => { setAmount(e.target.value); setError('') }}
                                                    placeholder="Enter amount"
                                                    className="w-full bg-fate-gray border border-fate-gray/30 rounded-lg px-4 py-3 text-white font-mono mb-3"
                                                />

                                                <label className="block text-sm font-medium mb-2">Fund Type</label>
                                                <select
                                                    value={mfType}
                                                    onChange={(e) => setMfType(e.target.value)}
                                                    className="w-full bg-fate-gray border border-fate-gray/30 rounded-lg px-4 py-3 text-white font-mono mb-3"
                                                >
                                                    <option value="equity">Equity (High Risk, 12-15% returns)</option>
                                                    <option value="debt">Debt (Low Risk, 6-8% returns)</option>
                                                    <option value="hybrid">Hybrid (Medium Risk, 9-11% returns)</option>
                                                </select>

                                                <label className="block text-sm font-medium mb-2">Source</label>
                                                <div className="flex gap-4 mb-3">
                                                    <label className="flex items-center gap-2 text-sm text-white">
                                                        <input type="radio" name="mf-source" value="balance" defaultChecked />
                                                        Balance (₹{state.balance})
                                                    </label>
                                                    <label className="flex items-center gap-2 text-sm text-white">
                                                        <input type="radio" name="mf-source" value="savings" />
                                                        Savings (₹{state.savings})
                                                    </label>
                                                </div>

                                                <SoundButton
                                                    onClick={handleMFInvestment}
                                                    soundType="success"
                                                    className="w-full bg-fate-orange text-black font-bold py-3 rounded-lg hover:bg-fate-orange-light transition-colors"
                                                >
                                                    Invest in MF
                                                </SoundButton>
                                            </div>

                                            {/* Active MFs */}
                                            {investments.mutualFunds.length > 0 && (
                                                <div className="space-y-2">
                                                    <h5 className="text-sm font-bold text-white">Active Mutual Funds</h5>
                                                    {investments.mutualFunds.map((mf, idx) => (
                                                        <div key={idx} className="bg-fate-gray/20 rounded-lg p-3 text-xs">
                                                            <div className="flex justify-between">
                                                                <span className="text-fate-text">Type:</span>
                                                                <span className="text-white font-mono capitalize">{mf.type}</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="text-fate-text">Invested:</span>
                                                                <span className="text-white font-mono">₹{mf.amount}</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="text-fate-text">Current Value:</span>
                                                                <span className={`font-mono ${mf.currentValue >= mf.amount ? 'text-green-400' : 'text-red-400'}`}>
                                                                    ₹{mf.currentValue}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Error Message */}
                                    {error && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="bg-red-500/10 border border-red-500/30 rounded-lg p-3"
                                        >
                                            <p className="text-red-400 text-sm">{error}</p>
                                        </motion.div>
                                    )}
                                </div>
                            </motion.div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    )
}
