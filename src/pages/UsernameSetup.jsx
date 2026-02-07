import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { User, Sparkles, ArrowRight } from 'lucide-react'

export default function UsernameSetup() {
    const [username, setUsername] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        // Check if username already exists
        const existingUsername = localStorage.getItem('fate_userName')
        if (existingUsername && existingUsername.trim()) {
            setUsername(existingUsername)
        }
    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        if (!username.trim()) {
            setError('Please enter a username')
            return
        }

        if (username.length < 3) {
            setError('Username must be at least 3 characters')
            return
        }

        if (username.length > 20) {
            setError('Username must be less than 20 characters')
            return
        }

        setIsLoading(true)

        // Simulate a brief loading state
        await new Promise(resolve => setTimeout(resolve, 500))

        // Save username
        localStorage.setItem('fate_userName', username.trim())
        localStorage.setItem('fate_usernameSet', 'true')

        // Navigate to home page
        window.location.hash = '#/'
    }

    return (
        <div className="min-h-screen bg-black text-white flex flex-col">
            {/* Header */}
            <nav className="flex items-center justify-center p-6 border-b border-fate-gray/30">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-fate-orange rounded flex items-center justify-center font-bold text-black text-xl">
                        F
                    </div>
                    <span className="font-heading text-lg font-bold tracking-wider">FATE</span>
                </div>
            </nav>

            {/* Main Content */}
            <div className="flex-1 flex items-center justify-center p-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="w-full max-w-md"
                >
                    {/* Title */}
                    <div className="text-center mb-10">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                            className="w-20 h-20 bg-fate-orange/20 rounded-full flex items-center justify-center mx-auto mb-6"
                        >
                            <Sparkles size={40} className="text-fate-orange" />
                        </motion.div>
                        <span className="font-mono text-xs text-fate-orange tracking-widest mb-4 block">
                            IDENTITY CREATION
                        </span>
                        <h1 className="font-heading text-4xl md:text-5xl font-bold mb-3">
                            Choose Your Name
                        </h1>
                        <p className="text-fate-text">
                            This is how you'll be known in your financial journey
                        </p>
                    </div>

                    {/* Username Card */}
                    <div className="bg-fate-card border border-fate-gray/30 rounded-xl p-8">
                        {/* Error Message */}
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-6"
                            >
                                <p className="text-red-400 text-sm font-mono">{error}</p>
                            </motion.div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Username Input */}
                            <div>
                                <label className="font-mono text-xs text-fate-text tracking-wider block mb-2">
                                    USERNAME
                                </label>
                                <div className="relative">
                                    <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-fate-muted" />
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        placeholder="Enter your username"
                                        maxLength={20}
                                        className="w-full bg-fate-dark border border-fate-gray/50 rounded-lg py-4 pl-12 pr-4 text-white placeholder-fate-muted font-mono text-lg focus:outline-none focus:border-fate-orange transition-colors"
                                    />
                                </div>
                                <div className="flex justify-between mt-2">
                                    <span className="font-mono text-xs text-fate-muted">
                                        3-20 characters
                                    </span>
                                    <span className="font-mono text-xs text-fate-muted">
                                        {username.length}/20
                                    </span>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                disabled={isLoading || !username.trim()}
                                className="w-full bg-fate-orange text-black font-bold py-4 rounded-lg font-mono tracking-wider hover:bg-fate-orange-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                            >
                                {isLoading ? (
                                    'SAVING...'
                                ) : (
                                    <>
                                        CONTINUE TO FATE
                                        <ArrowRight size={18} />
                                    </>
                                )}
                            </motion.button>
                        </form>
                    </div>

                    {/* Footer Text */}
                    <p className="text-center text-fate-muted text-xs font-mono mt-6">
                        Your username will be displayed throughout your journey.
                    </p>
                </motion.div>
            </div>
        </div>
    )
}
