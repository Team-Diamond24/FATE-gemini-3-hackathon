import { useState, useEffect } from 'react'
import ProfileDropdown from './ProfileDropdown'

export default function LandingPage({ onStart }) {
    const [isLoggedIn, setIsLoggedIn] = useState(false)

    useEffect(() => {
        // Check if user is logged in (has userId and username set)
        const userId = localStorage.getItem('fate_userId')
        const usernameSet = localStorage.getItem('fate_usernameSet')
        setIsLoggedIn(!!userId && !!usernameSet)
    }, [])

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Navigation */}
            <nav className="flex items-center justify-between p-6 border-b border-fate-gray/30">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-fate-orange rounded flex items-center justify-center font-bold text-black text-xl">
                        F
                    </div>
                    <span className="font-heading text-lg font-bold tracking-wider">FATE</span>
                </div>

                <div className="hidden md:flex items-center gap-8">
                    <a href="#simulator" className="font-mono text-xs text-fate-text hover:text-white transition-colors tracking-wider">
                        SIMULATOR
                    </a>
                    <a href="#math" className="font-mono text-xs text-fate-text hover:text-white transition-colors tracking-wider">
                        THE MATH
                    </a>
                    <a href="#archive" className="font-mono text-xs text-fate-text hover:text-white transition-colors tracking-wider">
                        ARCHIVE
                    </a>
                </div>

                {/* Auth Section - Show profile dropdown if logged in, otherwise login/signup buttons */}
                {isLoggedIn ? (
                    <ProfileDropdown />
                ) : (
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => window.location.hash = '#/login'}
                            className="font-mono text-xs text-fate-text hover:text-white transition-colors"
                        >
                            Log in
                        </button>
                        <button
                            onClick={() => window.location.hash = '#/signup'}
                            className="bg-fate-orange text-black font-bold px-4 py-2 rounded text-sm hover:bg-fate-orange-light transition-colors"
                        >
                            JOIN
                        </button>
                    </div>
                )}
            </nav>

            {/* Hero Section */}
            <section className="text-center px-8 py-24 md:py-32">
                <span className="font-mono text-xs text-fate-orange tracking-widest mb-6 block">
                    SESSION 001. INITIALIZING
                </span>
                <h1 className="font-heading text-6xl md:text-8xl lg:text-9xl font-bold leading-[0.9] mb-6">
                    FATE.<br />
                    <span className="text-white">MANY MONTHS.</span>
                </h1>
                <p className="text-fate-text text-lg md:text-xl italic mb-10 max-w-md mx-auto">
                    Play the game of money before it plays you.
                </p>

                <button
                    onClick={onStart}
                    className="bg-fate-orange text-black font-bold px-8 py-4 rounded text-sm tracking-wider hover:bg-fate-orange-light transition-all hover:scale-105"
                >
                    START YOUR FIRST MONTH
                </button>

                <p className="text-fate-muted text-sm mt-8 max-w-sm mx-auto">
                    A narrative-driven simulation where every choice has a price. No rewinds. No saving.
                </p>

                {/* Visual Element */}
                <div className="mt-16 flex justify-center">
                    <div className="w-72 h-48 bg-gradient-to-br from-fate-card to-black rounded-2xl shadow-2xl relative">
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-16 h-16 bg-fate-orange/20 rounded-full blur-xl" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="px-8 py-16 max-w-6xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-fate-card border border-fate-gray/30 rounded-xl p-8">
                        <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center text-2xl mb-6">
                            💬
                        </div>
                        <h3 className="font-heading text-xl font-bold mb-3">Live the Story</h3>
                        <p className="text-fate-text text-sm leading-relaxed">
                            Every playthrough is a branching narrative where your social standing is just as fragile as your bank balance.
                        </p>
                    </div>

                    <div className="bg-fate-card border border-fate-gray/30 rounded-xl p-8">
                        <div className="w-12 h-12 bg-fate-orange/20 rounded-lg flex items-center justify-center text-2xl mb-6">
                            ⚡
                        </div>
                        <h3 className="font-heading text-xl font-bold mb-3">Feel the Shock</h3>
                        <p className="text-fate-text text-sm leading-relaxed">
                            Experience the raw and often unexpected reality. The game simulates real-world market crashes and surprise emergencies.
                        </p>
                    </div>

                    <div className="bg-fate-card border border-fate-gray/30 rounded-xl p-8">
                        <div className="w-12 h-12 bg-gray-500/20 rounded-lg flex items-center justify-center text-2xl mb-6">
                            📊
                        </div>
                        <h3 className="font-heading text-xl font-bold mb-3">Master the Flow</h3>
                        <p className="text-fate-text text-sm leading-relaxed">
                            View all your behavior patterns. Every impulse buy, every investment decision — tracked through high-fidelity data.
                        </p>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="px-8 py-24 text-center bg-gradient-to-b from-black to-fate-dark">
                <span className="font-mono text-xs text-fate-muted tracking-widest mb-4 block">
                    THE REALITY
                </span>
                <h2 className="font-heading text-4xl md:text-6xl font-bold mb-6">
                    Numbers don't lie.<br />Humans do.
                </h2>
                <p className="text-fate-text max-w-lg mx-auto mb-12">
                    "FATE" isn't a game about winning. It's about surviving the friction between your ambitions and your monthly statements.
                </p>

                <div className="flex justify-center gap-16 flex-wrap">
                    <div className="text-center">
                        <div className="font-heading text-4xl md:text-5xl font-bold">14M+</div>
                        <div className="font-mono text-xs text-fate-muted tracking-wider mt-2">AVERAGE PLAYS</div>
                    </div>
                    <div className="text-center">
                        <div className="font-heading text-4xl md:text-5xl font-bold">0.4%</div>
                        <div className="font-mono text-xs text-fate-muted tracking-wider mt-2">RETIREMENT RATE</div>
                    </div>
                    <div className="text-center">
                        <div className="font-heading text-4xl md:text-5xl font-bold">—</div>
                        <div className="font-mono text-xs text-fate-muted tracking-wider mt-2">WINS LOGGED</div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="px-8 py-16">
                <div className="max-w-2xl mx-auto bg-gradient-to-br from-fate-card to-fate-dark rounded-2xl p-12 text-center border border-fate-gray/30 relative overflow-hidden">
                    <div className="absolute right-8 top-1/2 -translate-y-1/2 text-[120px] text-white/5 font-bold">
                        $
                    </div>
                    <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4 relative z-10">
                        Ready to face the numbers?
                    </h2>
                    <p className="text-fate-text mb-8 max-w-md mx-auto relative z-10">
                        Join thousands of players mastering the art of financial survival in the most unforgiving simulator ever built.
                    </p>
                    <button
                        onClick={onStart}
                        className="bg-fate-orange text-black font-bold px-8 py-4 rounded text-sm tracking-wider hover:bg-fate-orange-light transition-all relative z-10"
                    >
                        ENTER THE SIMULATOR
                    </button>
                </div>
            </section>

            {/* Footer */}
            <footer className="px-8 py-8 border-t border-fate-gray/30 flex flex-wrap justify-between items-center gap-4">
                <div>
                    <div className="font-heading font-bold tracking-wider">FATE</div>
                    <div className="font-mono text-xs text-fate-muted">© 2024 FATE Simulator. Play with caution.</div>
                </div>
                <div className="flex gap-4">
                    <a href="#" className="text-fate-muted hover:text-white text-xl">𝕏</a>
                    <a href="#" className="text-fate-muted hover:text-white text-xl">◯</a>
                </div>
                <div className="flex gap-6">
                    <a href="#" className="font-mono text-xs text-fate-muted hover:text-white tracking-wider">TERMS</a>
                    <a href="#" className="font-mono text-xs text-fate-muted hover:text-white tracking-wider">PRIVACY</a>
                    <a href="#" className="font-mono text-xs text-fate-muted hover:text-white tracking-wider">POLICY</a>
                </div>
            </footer>
        </div>
    )
}
