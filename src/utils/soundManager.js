/**
 * Sound Manager
 * Handles all audio feedback in the game
 */

class SoundManager {
    constructor() {
        this.enabled = true
        this.volume = 0.15 // Reduced from 0.3 for more subtle sounds
        this.sounds = {}
        this.audioContext = null
        this.loadSettings()
    }

    // Lazy initialize AudioContext on first use (after user gesture)
    getAudioContext() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
        }
        return this.audioContext
    }

    loadSettings() {
        try {
            const settings = JSON.parse(localStorage.getItem('fate_settings') || '{}')
            this.enabled = settings.soundEffects !== false // Default to true
            this.volume = settings.volume || 0.15
        } catch (e) {
            console.warn('Failed to load sound settings:', e)
        }
    }

    // Generate sound using Web Audio API
    playTone(frequency, duration, type = 'sine') {
        if (!this.enabled) return

        try {
            const audioContext = this.getAudioContext()
            const oscillator = audioContext.createOscillator()
            const gainNode = audioContext.createGain()

            oscillator.connect(gainNode)
            gainNode.connect(audioContext.destination)

            oscillator.frequency.value = frequency
            oscillator.type = type

            gainNode.gain.setValueAtTime(this.volume, audioContext.currentTime)
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration)

            oscillator.start(audioContext.currentTime)
            oscillator.stop(audioContext.currentTime + duration)
        } catch (e) {
            console.warn('Audio playback failed:', e)
        }
    }

    // UI Sounds - More subtle and realistic
    click() {
        // Short, crisp click sound
        this.playTone(1200, 0.04, 'sine')
    }

    hover() {
        // Very subtle hover sound
        this.playTone(800, 0.02, 'sine')
    }

    success() {
        if (!this.enabled) return
        try {
            const audioContext = this.getAudioContext()
            const oscillator = audioContext.createOscillator()
            const gainNode = audioContext.createGain()

            oscillator.connect(gainNode)
            gainNode.connect(audioContext.destination)

            oscillator.frequency.setValueAtTime(523, audioContext.currentTime)
            oscillator.frequency.setValueAtTime(659, audioContext.currentTime + 0.1)
            oscillator.frequency.setValueAtTime(784, audioContext.currentTime + 0.2)

            gainNode.gain.setValueAtTime(this.volume, audioContext.currentTime)
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)

            oscillator.start(audioContext.currentTime)
            oscillator.stop(audioContext.currentTime + 0.3)
        } catch (e) {
            console.warn('Audio playback failed:', e)
        }
    }

    error() {
        if (!this.enabled) return
        try {
            const audioContext = this.getAudioContext()
            const oscillator = audioContext.createOscillator()
            const gainNode = audioContext.createGain()

            oscillator.connect(gainNode)
            gainNode.connect(audioContext.destination)

            oscillator.frequency.setValueAtTime(400, audioContext.currentTime)
            oscillator.frequency.setValueAtTime(300, audioContext.currentTime + 0.1)

            gainNode.gain.setValueAtTime(this.volume, audioContext.currentTime)
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2)

            oscillator.start(audioContext.currentTime)
            oscillator.stop(audioContext.currentTime + 0.2)
        } catch (e) {
            console.warn('Audio playback failed:', e)
        }
    }

    warning() {
        this.playTone(450, 0.15, 'square')
    }

    // Game-specific sounds
    choiceMade() {
        this.playTone(700, 0.1, 'triangle')
    }

    monthComplete() {
        this.success()
    }

    balanceIncrease() {
        if (!this.enabled) return
        try {
            const audioContext = this.getAudioContext()
            const oscillator = audioContext.createOscillator()
            const gainNode = audioContext.createGain()

            oscillator.connect(gainNode)
            gainNode.connect(audioContext.destination)

            oscillator.frequency.setValueAtTime(400, audioContext.currentTime)
            oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.2)

            gainNode.gain.setValueAtTime(this.volume, audioContext.currentTime)
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2)

            oscillator.start(audioContext.currentTime)
            oscillator.stop(audioContext.currentTime + 0.2)
        } catch (e) {
            console.warn('Audio playback failed:', e)
        }
    }

    balanceDecrease() {
        if (!this.enabled) return
        try {
            const audioContext = this.getAudioContext()
            const oscillator = audioContext.createOscillator()
            const gainNode = audioContext.createGain()

            oscillator.connect(gainNode)
            gainNode.connect(audioContext.destination)

            oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
            oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.2)

            gainNode.gain.setValueAtTime(this.volume, audioContext.currentTime)
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2)

            oscillator.start(audioContext.currentTime)
            oscillator.stop(audioContext.currentTime + 0.2)
        } catch (e) {
            console.warn('Audio playback failed:', e)
        }
    }

    notification() {
        this.playTone(880, 0.1, 'sine')
        setTimeout(() => this.playTone(1047, 0.1, 'sine'), 100)
    }

    // Control methods
    setEnabled(enabled) {
        this.enabled = enabled
        this.saveSettings()
    }

    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume))
        this.saveSettings()
    }

    saveSettings() {
        try {
            const settings = JSON.parse(localStorage.getItem('fate_settings') || '{}')
            settings.soundEffects = this.enabled
            settings.volume = this.volume
            localStorage.setItem('fate_settings', JSON.stringify(settings))
        } catch (e) {
            console.warn('Failed to save sound settings:', e)
        }
    }
}

// Create singleton instance
const soundManager = new SoundManager()

export default soundManager

// Export individual functions for convenience
export const playClick = () => soundManager.click()
export const playHover = () => soundManager.hover()
export const playSuccess = () => soundManager.success()
export const playError = () => soundManager.error()
export const playWarning = () => soundManager.warning()
export const playChoiceMade = () => soundManager.choiceMade()
export const playMonthComplete = () => soundManager.monthComplete()
export const playBalanceIncrease = () => soundManager.balanceIncrease()
export const playBalanceDecrease = () => soundManager.balanceDecrease()
export const playNotification = () => soundManager.notification()
