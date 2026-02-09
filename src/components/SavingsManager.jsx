import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PiggyBank, ArrowUpCircle, ArrowDownCircle, X, DollarSign } from 'lucide-react'
import SoundButton from './SoundButton'
import soundManager from '../utils/soundManager'

export default function SavingsManager({ balance, savings, onDeposit, onWithdraw }) {
    const [isOpen, setIsOpen] = useState(false)
    const [amount, setAmount] = useState('')
    const [mode, setMode] = useState('deposit') // 'deposit' or 'withdraw'
    const [error, setError] = useState('')

    const handleSubmit = () => {
        const value = parseInt(amount)

        console.log('handleSubmit called', { mode, amount, value, balance, savings })

        if (!value || value <= 0) {
            setError('Please enter a valid amount')
            soundManager.error()
            return
        }

        if (mode === 'deposit') {
            if (value > balance) {
                setError('Insufficient balance')
                soundManager.error()
                return
            }
            console.log('Calling onDeposit with', value)
            onDeposit(value)
            soundManager.balanceIncrease()
        } else {
            if (value > savings) {
                setError('Insufficient savings')
                soundManager.error()
                return
            }
            console.log('Calling onWithdraw with', value)
            onWithdraw(value)
            soundManager.balanceDecrease()
        }

        setAmount('')
        setError('')
        setIsOpen(false)
    }

    const quickAmounts = [500, 1000, 2000, 5000]

    return (
        <>
            <SoundButton
                onClick={() => setIsOpen(true)}
                className="w-full bg-fate-card border border-fate-gray/30 rounded-lg p-4 hover:bg-fate-gray/50 transition-colors text-left"
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                            <PiggyBank size={20} className="text-blue-400" />
                        </div>
                        <div>
                            <p className="text-xs text-fate-text">Manage Savings</p>
                            <p className="font-mono text-sm text-white">Deposit / Withdraw</p>
                        </div>
                    </div>
                    <ArrowUpCircle size={18} className="text-fate-text" />
                </div>
            </SoundButton>

            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop with blur - acts as flex container */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
                            style={{ backdropFilter: 'blur(8px)' }}
                        >
                            {/* Modal - Centered by parent flex */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                onClick={(e) => e.stopPropagation()}
                                className="bg-fate-card border border-fate-orange/30 rounded-xl p-6 w-full max-w-md shadow-2xl"
                            >
                                {/* Header */}
                                <div className="flex justify-between items-center mb-6 pb-4 border-b border-fate-gray/30">
                                    <div>
                                        <h3 className="font-heading text-2xl font-bold text-white">Manage Savings</h3>
                                        <p className="text-xs text-fate-text mt-1">Transfer money between balance and savings</p>
                                    </div>
                                    <SoundButton
                                        onClick={() => setIsOpen(false)}
                                        className="text-fate-text hover:text-white transition-colors"
                                    >
                                        <X size={24} />
                                    </SoundButton>
                                </div>

                                {/* Current Balances */}
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="bg-gradient-to-br from-fate-orange/20 to-fate-gray/30 rounded-lg p-4 border border-fate-orange/30">
                                        <p className="text-xs text-fate-text mb-2 flex items-center gap-1">
                                            <DollarSign size={14} />
                                            Balance
                                        </p>
                                        <p className="font-mono text-xl font-bold text-white">₹{balance.toLocaleString()}</p>
                                    </div>
                                    <div className="bg-gradient-to-br from-blue-500/20 to-fate-gray/30 rounded-lg p-4 border border-blue-500/30">
                                        <p className="text-xs text-fate-text mb-2 flex items-center gap-1">
                                            <PiggyBank size={14} />
                                            Savings
                                        </p>
                                        <p className="font-mono text-xl font-bold text-blue-400">₹{savings.toLocaleString()}</p>
                                    </div>
                                </div>

                                {/* Mode Toggle */}
                                <div className="flex gap-2 mb-4">
                                    <SoundButton
                                        onClick={() => {
                                            setMode('deposit')
                                            setError('')
                                        }}
                                        className={`flex-1 py-2 rounded-lg font-mono text-sm transition-colors ${mode === 'deposit'
                                            ? 'bg-fate-orange text-black'
                                            : 'bg-fate-gray text-white hover:bg-fate-gray/70'
                                            }`}
                                    >
                                        <ArrowUpCircle size={16} className="inline mr-2" />
                                        Deposit
                                    </SoundButton>
                                    <SoundButton
                                        onClick={() => {
                                            setMode('withdraw')
                                            setError('')
                                        }}
                                        className={`flex-1 py-2 rounded-lg font-mono text-sm transition-colors ${mode === 'withdraw'
                                            ? 'bg-fate-orange text-black'
                                            : 'bg-fate-gray text-white hover:bg-fate-gray/70'
                                            }`}
                                    >
                                        <ArrowDownCircle size={16} className="inline mr-2" />
                                        Withdraw
                                    </SoundButton>
                                </div>

                                {/* Amount Input */}
                                <div className="mb-4">
                                    <label className="block text-sm font-medium mb-2">
                                        Amount (₹)
                                    </label>
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={(e) => {
                                            setAmount(e.target.value)
                                            setError('')
                                        }}
                                        placeholder="Enter amount"
                                        className="w-full bg-fate-gray border border-fate-gray/30 rounded-lg px-4 py-3 text-white font-mono"
                                    />
                                </div>

                                {/* Quick Amounts */}
                                <div className="mb-4">
                                    <p className="text-xs text-fate-text mb-2">Quick amounts:</p>
                                    <div className="flex gap-2">
                                        {quickAmounts.map((amt) => (
                                            <SoundButton
                                                key={amt}
                                                onClick={() => setAmount(amt.toString())}
                                                className="flex-1 py-2 bg-fate-gray rounded text-xs font-mono hover:bg-fate-gray/70 transition-colors"
                                            >
                                                ₹{amt}
                                            </SoundButton>
                                        ))}
                                    </div>
                                </div>

                                {/* Error Message */}
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4"
                                    >
                                        <p className="text-red-400 text-sm">{error}</p>
                                    </motion.div>
                                )}

                                {/* Submit Button */}
                                <SoundButton
                                    onClick={handleSubmit}
                                    soundType="success"
                                    type="button"
                                    className="w-full bg-fate-orange text-black font-bold py-3 rounded-lg hover:bg-fate-orange-light transition-colors font-mono"
                                >
                                    {mode === 'deposit' ? 'Deposit to Savings' : 'Withdraw from Savings'}
                                </SoundButton>

                                {/* Info */}
                                <p className="text-xs text-fate-text text-center mt-4">
                                    {mode === 'deposit'
                                        ? 'Move money from balance to savings for safekeeping'
                                        : 'Move money from savings back to balance'}
                                </p>
                            </motion.div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    )
}
