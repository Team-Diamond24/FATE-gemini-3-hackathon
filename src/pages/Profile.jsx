import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, User, TrendingUp, TrendingDown, Calendar, DollarSign, Shield, Award, Target, BarChart3 } from 'lucide-react'
import { getUserSession } from '../utils/session'
import { useGameState } from '../context/GameContext'

export default function Profile() {
    const { userId, displayId } = getUserSession()
    const state = useGameState()
    const [stats, setStats] = useState({
        totalDecisions: 0,
        avgRiskScore: 0,
        totalSpent: 0,
        totalEarned: 0,
        monthsPlayed: 0,
        insuranceMonths: 0,
        highestBalance: 0,
        lowestBalance: 0
    })

    useEffect(() => {
        if (state.isLoaded) {
            calculateStats()
        }
    }, [state])

    const calculateStats = () => {
        const history = state.history || []
        
        // Total decisions
        const totalDecisions = history.filter(h => h.type === 'choice').length
        
        // Average risk score
        const riskScores = history.filter(h => h.riskScore !== undefined).map(h => h.riskScore)
        const avgRiskScore = riskScores.length > 0 
            ? Math.round(riskScores.reduce((a, b) => a + b, 0) / riskScores.length)
            : state.riskScore
        
        // Total spent and earned
        const choices = history.filter(h => h.type === 'choice')
        const totalSpent = choices
            .filter(c => c.balanceChange < 0)
            .reduce((sum, c) => sum + Math.abs(c.balanceChange), 0)
        const totalEarned = choices
            .filter(c => c.balanceChange > 0)
            .reduce((sum, c) => sum + c.balanceChange, 0)
        
        // Months played
        const monthsPlayed = state.month
        
        // Insurance months
        const insuranceMonths = state.insuranceOpted ? monthsPlayed : 0
        
        // Highest and lowest balance from history
        const balances = history.filter(h => h.balance !== undefined).map(h => h.balance)
        const highestBalance = balances.length > 0 ? Math.max(...balances, state.balance) : state.balance
        const lowestBalance = balances.length > 0 ? Math.min(...balances, state.balance) : state.balance
        
        setStats({
            totalDecisions,
            avgRiskScore,
            totalSpent,
            totalEarned,
            monthsPlayed,
            insuranceMonths,
            highestBalance,
            lowestBalance
        })
    }

    const getRiskLevel = (score) => {
        if (score < 30) return { label: 'Low Risk', color: 'text-green-400', bg: 'bg-green-400/20' }
        if (score <= 70) return { label: 'Medium Risk', color: 'text-fate-orange', bg: 'bg-fate-orange/20' }
        return { label: 'High Risk', color: 'text-red-400', bg: 'bg-red-400/20' }
    }

    const riskLevel = getRiskLevel(state.riskScore)
    const netWorth = state.balance + state.savings

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Header */}
            <header className="border-b border-fate-gray/30 bg-black sticky top-0 z-10">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => window.location.hash = '#/dashboard'}
                            className="w-10 h-10 border border-fate-gray rounded flex items-center justify-center hover:bg-fate-gray/50 transition-colors"
                        >
                            <ArrowLeft size={18} />
                        </button>
                        <div>
                            <h1 className="font-heading text-2xl font-bold">Profile</h1>
                            <p className="font-mono text-xs text-fate-text">Your financial journey</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto px-6 py-8">
                {/* Profile Header */}
                <div className="bg-gradient-to-br from-fate-card to-fate-dark border border-fate-gray/30 rounded-xl p-8 mb-6">
                    <div className="flex items-start gap-6">
                        {/* Avatar */}
                        <div className="w-24 h-24 bg-fate-orange rounded-xl flex items-center justify-center">
                            <User size={48} className="text-black" />
                        </div>
                        
                        {/* Info */}
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <h2 className="font-heading text-3xl font-bold">{displayId}</h2>
                                <span className={`px-3 py-1 rounded-full text-xs font-mono ${riskLevel.bg} ${riskLevel.color}`}>
                                    {riskLevel.label}
                                </span>
                            </div>
                            <p className="text-fate-text mb-4">Student • Financial Simulator</p>
                            
                            {/* Quick Stats */}
                            <div className="flex gap-6">
                                <div>
                                    <div className="font-mono text-2xl font-bold text-fate-orange">
                                        ₹{netWorth.toLocaleString()}
                                    </div>
                                    <div className="text-xs text-fate-text">Net Worth</div>
                                </div>
                                <div>
                                    <div className="font-mono text-2xl font-bold text-white">
                                        {stats.monthsPlayed}
                                    </div>
                                    <div className="text-xs text-fate-text">Months Played</div>
                                </div>
                                <div>
                                    <div className="font-mono text-2xl font-bold text-white">
                                        {stats.totalDecisions}
                                    </div>
                                    <div className="text-xs text-fate-text">Decisions Made</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {/* Current Balance */}
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="bg-fate-card border border-fate-gray/30 rounded-xl p-6"
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-fate-orange/20 rounded-lg flex items-center justify-center">
                                <DollarSign size={20} className="text-fate-orange" />
                            </div>
                            <div className="text-xs text-fate-text">Current Balance</div>
                        </div>
                        <div className="font-mono text-2xl font-bold">₹{state.balance.toLocaleString()}</div>
                    </motion.div>

                    {/* Savings */}
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="bg-fate-card border border-fate-gray/30 rounded-xl p-6"
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                <Target size={20} className="text-blue-400" />
                            </div>
                            <div className="text-xs text-fate-text">Savings</div>
                        </div>
                        <div className="font-mono text-2xl font-bold">₹{state.savings.toLocaleString()}</div>
                    </motion.div>

                    {/* Risk Score */}
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="bg-fate-card border border-fate-gray/30 rounded-xl p-6"
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                                <TrendingUp size={20} className="text-red-400" />
                            </div>
                            <div className="text-xs text-fate-text">Risk Score</div>
                        </div>
                        <div className={`font-mono text-2xl font-bold ${riskLevel.color}`}>
                            {state.riskScore}/100
                        </div>
                    </motion.div>

                    {/* Insurance */}
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="bg-fate-card border border-fate-gray/30 rounded-xl p-6"
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                                <Shield size={20} className="text-green-400" />
                            </div>
                            <div className="text-xs text-fate-text">Insurance</div>
                        </div>
                        <div className={`font-mono text-2xl font-bold ${state.insuranceOpted ? 'text-green-400' : 'text-fate-muted'}`}>
                            {state.insuranceOpted ? 'Active' : 'Inactive'}
                        </div>
                    </motion.div>
                </div>

                {/* Detailed Stats */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Financial Overview */}
                    <div className="bg-fate-card border border-fate-gray/30 rounded-xl p-6">
                        <div className="flex items-center gap-2 mb-6">
                            <BarChart3 size={20} className="text-fate-orange" />
                            <h3 className="font-heading text-lg font-bold">Financial Overview</h3>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="flex justify-between items-center py-3 border-b border-fate-gray/30">
                                <span className="text-fate-text">Total Spent</span>
                                <span className="font-mono font-bold text-red-400">
                                    -₹{stats.totalSpent.toLocaleString()}
                                </span>
                            </div>
                            <div className="flex justify-between items-center py-3 border-b border-fate-gray/30">
                                <span className="text-fate-text">Total Earned</span>
                                <span className="font-mono font-bold text-green-400">
                                    +₹{stats.totalEarned.toLocaleString()}
                                </span>
                            </div>
                            <div className="flex justify-between items-center py-3 border-b border-fate-gray/30">
                                <span className="text-fate-text">Highest Balance</span>
                                <span className="font-mono font-bold">
                                    ₹{stats.highestBalance.toLocaleString()}
                                </span>
                            </div>
                            <div className="flex justify-between items-center py-3 border-b border-fate-gray/30">
                                <span className="text-fate-text">Lowest Balance</span>
                                <span className="font-mono font-bold">
                                    ₹{stats.lowestBalance.toLocaleString()}
                                </span>
                            </div>
                            <div className="flex justify-between items-center py-3">
                                <span className="text-fate-text">Net Worth</span>
                                <span className="font-mono font-bold text-fate-orange">
                                    ₹{netWorth.toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Achievements */}
                    <div className="bg-fate-card border border-fate-gray/30 rounded-xl p-6">
                        <div className="flex items-center gap-2 mb-6">
                            <Award size={20} className="text-fate-orange" />
                            <h3 className="font-heading text-lg font-bold">Achievements</h3>
                        </div>
                        
                        <div className="space-y-3">
                            {/* First Month */}
                            <div className={`flex items-center gap-3 p-3 rounded-lg ${stats.monthsPlayed >= 1 ? 'bg-fate-orange/20' : 'bg-fate-gray/30'}`}>
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stats.monthsPlayed >= 1 ? 'bg-fate-orange' : 'bg-fate-gray'}`}>
                                    <Calendar size={20} className={stats.monthsPlayed >= 1 ? 'text-black' : 'text-fate-muted'} />
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-sm">First Month</p>
                                    <p className="text-xs text-fate-text">Complete your first month</p>
                                </div>
                                {stats.monthsPlayed >= 1 && <span className="text-fate-orange">✓</span>}
                            </div>

                            {/* Decision Maker */}
                            <div className={`flex items-center gap-3 p-3 rounded-lg ${stats.totalDecisions >= 10 ? 'bg-fate-orange/20' : 'bg-fate-gray/30'}`}>
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stats.totalDecisions >= 10 ? 'bg-fate-orange' : 'bg-fate-gray'}`}>
                                    <Target size={20} className={stats.totalDecisions >= 10 ? 'text-black' : 'text-fate-muted'} />
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-sm">Decision Maker</p>
                                    <p className="text-xs text-fate-text">Make 10 decisions ({stats.totalDecisions}/10)</p>
                                </div>
                                {stats.totalDecisions >= 10 && <span className="text-fate-orange">✓</span>}
                            </div>

                            {/* Protected */}
                            <div className={`flex items-center gap-3 p-3 rounded-lg ${state.insuranceOpted ? 'bg-fate-orange/20' : 'bg-fate-gray/30'}`}>
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${state.insuranceOpted ? 'bg-fate-orange' : 'bg-fate-gray'}`}>
                                    <Shield size={20} className={state.insuranceOpted ? 'text-black' : 'text-fate-muted'} />
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-sm">Protected</p>
                                    <p className="text-xs text-fate-text">Purchase insurance</p>
                                </div>
                                {state.insuranceOpted && <span className="text-fate-orange">✓</span>}
                            </div>

                            {/* Survivor */}
                            <div className={`flex items-center gap-3 p-3 rounded-lg ${stats.monthsPlayed >= 5 ? 'bg-fate-orange/20' : 'bg-fate-gray/30'}`}>
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stats.monthsPlayed >= 5 ? 'bg-fate-orange' : 'bg-fate-gray'}`}>
                                    <TrendingUp size={20} className={stats.monthsPlayed >= 5 ? 'text-black' : 'text-fate-muted'} />
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-sm">Survivor</p>
                                    <p className="text-xs text-fate-text">Survive 5 months ({stats.monthsPlayed}/5)</p>
                                </div>
                                {stats.monthsPlayed >= 5 && <span className="text-fate-orange">✓</span>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
