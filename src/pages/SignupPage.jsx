import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, User, ArrowLeft } from 'lucide-react'
import GoogleAuthButton from '../components/GoogleAuthButton'
import { signInWithGoogle, signUpWithEmail } from '../config/firebaseConfig'

export default function SignupPage() {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const handleEmailSignup = async (e) => {
        e.preventDefault()
        setError('')

        if (password !== confirmPassword) {
            setError('Passwords do not match')
            return
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters')
            return
        }

        setIsLoading(true)

        const { user, error } = await signUpWithEmail(email, password)

        if (error) {
            setError(error)
            setIsLoading(false)
        } else if (user) {
            localStorage.setItem('fate_userId', user.uid)
            localStorage.setItem('fate_userEmail', user.email)
            localStorage.setItem('fate_userName', name)
            window.location.hash = '#/username-setup'
        }
    }

    const handleGoogleSignup = async () => {
        setError('')
        setIsLoading(true)

        const { user, error } = await signInWithGoogle()

        if (error) {
            setError(error)
            setIsLoading(false)
        } else if (user) {
            localStorage.setItem('fate_userId', user.uid)
            localStorage.setItem('fate_userEmail', user.email)
            localStorage.setItem('fate_userName', user.displayName || '')
            window.location.hash = '#/username-setup'
        }
    }

    return (
        <div className="min-h-screen bg-black text-white flex flex-col">
            {/* Header */}
            <nav className="flex items-center justify-between p-6 border-b border-fate-gray/30">
                <button
                    onClick={() => window.location.hash = '#/'}
                    className="flex items-center gap-2 text-fate-text hover:text-white transition-colors"
                >
                    <ArrowLeft size={18} />
                    <span className="font-mono text-xs tracking-wider">BACK</span>
                </button>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-fate-orange rounded flex items-center justify-center font-bold text-black text-xl">
                        F
                    </div>
                    <span className="font-heading text-lg font-bold tracking-wider">FATE</span>
                </div>
                <div className="w-20" />
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
                        <span className="font-mono text-xs text-fate-orange tracking-widest mb-4 block">
                            NEW PLAYER REGISTRATION
                        </span>
                        <h1 className="font-heading text-4xl md:text-5xl font-bold mb-3">
                            Join FATE
                        </h1>
                        <p className="text-fate-text">
                            Create your account and face financial reality
                        </p>
                    </div>

                    {/* Signup Card */}
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

                        {/* Google Signup */}
                        <GoogleAuthButton
                            onClick={handleGoogleSignup}
                            isLoading={isLoading}
                            label="Sign up with Google"
                        />

                        {/* Divider */}
                        <div className="flex items-center gap-4 my-6">
                            <div className="flex-1 h-px bg-fate-gray/50" />
                            <span className="font-mono text-xs text-fate-muted">OR</span>
                            <div className="flex-1 h-px bg-fate-gray/50" />
                        </div>

                        {/* Email Form */}
                        <form onSubmit={handleEmailSignup} className="space-y-4">
                            {/* Name Input */}
                            <div>
                                <label className="font-mono text-xs text-fate-text tracking-wider block mb-2">
                                    PLAYER NAME
                                </label>
                                <div className="relative">
                                    <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-fate-muted" />
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Your name"
                                        required
                                        className="w-full bg-fate-dark border border-fate-gray/50 rounded-lg py-3 pl-12 pr-4 text-white placeholder-fate-muted font-mono text-sm focus:outline-none focus:border-fate-orange transition-colors"
                                    />
                                </div>
                            </div>

                            {/* Email Input */}
                            <div>
                                <label className="font-mono text-xs text-fate-text tracking-wider block mb-2">
                                    EMAIL
                                </label>
                                <div className="relative">
                                    <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-fate-muted" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="player@fate.game"
                                        required
                                        className="w-full bg-fate-dark border border-fate-gray/50 rounded-lg py-3 pl-12 pr-4 text-white placeholder-fate-muted font-mono text-sm focus:outline-none focus:border-fate-orange transition-colors"
                                    />
                                </div>
                            </div>

                            {/* Password Input */}
                            <div>
                                <label className="font-mono text-xs text-fate-text tracking-wider block mb-2">
                                    PASSWORD
                                </label>
                                <div className="relative">
                                    <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-fate-muted" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Min. 6 characters"
                                        required
                                        minLength={6}
                                        className="w-full bg-fate-dark border border-fate-gray/50 rounded-lg py-3 pl-12 pr-12 text-white placeholder-fate-muted font-mono text-sm focus:outline-none focus:border-fate-orange transition-colors"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-fate-muted hover:text-white transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            {/* Confirm Password Input */}
                            <div>
                                <label className="font-mono text-xs text-fate-text tracking-wider block mb-2">
                                    CONFIRM PASSWORD
                                </label>
                                <div className="relative">
                                    <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-fate-muted" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Repeat password"
                                        required
                                        className="w-full bg-fate-dark border border-fate-gray/50 rounded-lg py-3 pl-12 pr-4 text-white placeholder-fate-muted font-mono text-sm focus:outline-none focus:border-fate-orange transition-colors"
                                    />
                                </div>
                            </div>

                            {/* Submit Button */}
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-fate-orange text-black font-bold py-4 rounded-lg font-mono tracking-wider hover:bg-fate-orange-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-6"
                            >
                                {isLoading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
                            </motion.button>
                        </form>

                        {/* Login Link */}
                        <p className="text-center mt-6 text-fate-text text-sm">
                            Already have an account?{' '}
                            <button
                                onClick={() => window.location.hash = '#/login'}
                                className="text-fate-orange hover:text-fate-orange-light font-semibold transition-colors"
                            >
                                Log in
                            </button>
                        </p>
                    </div>

                    {/* Footer Text */}
                    <p className="text-center text-fate-muted text-xs font-mono mt-6">
                        By signing up, you accept that financial choices have real consequences.
                    </p>
                </motion.div>
            </div>
        </div>
    )
}
