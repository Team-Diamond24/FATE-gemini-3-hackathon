import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Bell, Lock, Palette, Database, Trash2, Download, Upload, Moon, Sun, Volume2, VolumeX } from 'lucide-react'
import { getUserSession, savePreferences, getPreferences } from '../utils/session'
import { exportUserDataToFile, importUserDataFromFile, clearUserData } from '../engine/persistence'
import { useGame } from '../context/GameContext'
import soundManager from '../utils/soundManager'

export default function Settings() {
    const { userId, displayId } = getUserSession()
    const { reset } = useGame()
    const [activeTab, setActiveTab] = useState('general')
    const [settings, setSettings] = useState({
        notifications: true,
        soundEffects: true,
        darkMode: true,
        autoSave: true,
        showTips: true,
        language: 'en'
    })
    const [message, setMessage] = useState('')

    useEffect(() => {
        // Load saved settings
        const prefs = getPreferences(userId)
        if (prefs?.settings) {
            setSettings(prefs.settings)
        }
    }, [userId])

    const handleSettingChange = (key, value) => {
        const newSettings = { ...settings, [key]: value }
        setSettings(newSettings)
        
        // Update sound manager if sound settings changed
        if (key === 'soundEffects') {
            soundManager.setEnabled(value)
            if (value) soundManager.success() // Play test sound
        }
        
        // Save to preferences
        const prefs = getPreferences(userId) || {}
        savePreferences(userId, { ...prefs, settings: newSettings })
        
        showMessage('Settings saved successfully')
    }

    const showMessage = (msg) => {
        setMessage(msg)
        setTimeout(() => setMessage(''), 3000)
    }

    const handleExport = () => {
        const success = exportUserDataToFile(userId)
        showMessage(success ? '✅ Data exported successfully!' : '❌ Export failed')
    }

    const handleImport = async (event) => {
        const file = event.target.files?.[0]
        if (!file) return

        try {
            const success = await importUserDataFromFile(file, userId)
            if (success) {
                showMessage('✅ Data imported! Refreshing...')
                setTimeout(() => window.location.reload(), 2000)
            } else {
                showMessage('❌ Import failed - invalid file')
            }
        } catch (error) {
            showMessage('❌ Import failed: ' + error.message)
        }
    }

    const handleResetGame = () => {
        if (confirm('Are you sure you want to reset your game? This will delete all progress and cannot be undone!')) {
            reset()
            showMessage('✅ Game reset! Redirecting...')
            setTimeout(() => window.location.hash = '#/', 2000)
        }
    }

    const handleClearData = () => {
        if (confirm('Are you sure you want to delete all your data? This cannot be undone!')) {
            const success = clearUserData(userId)
            if (success) {
                showMessage('✅ Data cleared! Refreshing...')
                setTimeout(() => window.location.reload(), 2000)
            } else {
                showMessage('❌ Clear failed')
            }
        }
    }

    const tabs = [
        { id: 'general', label: 'General', icon: Palette },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'privacy', label: 'Privacy & Security', icon: Lock },
        { id: 'data', label: 'Data Management', icon: Database }
    ]

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
                            <h1 className="font-heading text-2xl font-bold">Settings</h1>
                            <p className="font-mono text-xs text-fate-text">User: {displayId}</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Message Toast */}
            {message && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="fixed top-20 right-6 bg-fate-card border border-fate-orange rounded-lg px-4 py-3 shadow-lg z-50"
                >
                    <p className="font-mono text-sm text-white">{message}</p>
                </motion.div>
            )}

            {/* Main Content */}
            <div className="max-w-6xl mx-auto px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
                    {/* Sidebar */}
                    <aside className="space-y-2">
                        {tabs.map((tab) => {
                            const Icon = tab.icon
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-mono text-sm transition-colors ${
                                        activeTab === tab.id
                                            ? 'bg-fate-orange text-black'
                                            : 'bg-fate-card text-white hover:bg-fate-gray border border-fate-gray/30'
                                    }`}
                                >
                                    <Icon size={18} />
                                    {tab.label}
                                </button>
                            )
                        })}
                    </aside>

                    {/* Content */}
                    <main className="bg-fate-card border border-fate-gray/30 rounded-xl p-6">
                        {/* General Settings */}
                        {activeTab === 'general' && (
                            <div className="space-y-6">
                                <div>
                                    <h2 className="font-heading text-xl font-bold mb-4">General Settings</h2>
                                    <p className="text-fate-text text-sm mb-6">Customize your FATE experience</p>
                                </div>

                                {/* Theme */}
                                <div className="flex items-center justify-between py-4 border-b border-fate-gray/30">
                                    <div className="flex items-center gap-3">
                                        {settings.darkMode ? <Moon size={20} /> : <Sun size={20} />}
                                        <div>
                                            <p className="font-medium">Dark Mode</p>
                                            <p className="text-xs text-fate-text">Toggle dark/light theme</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleSettingChange('darkMode', !settings.darkMode)}
                                        className={`relative w-12 h-6 rounded-full transition-colors ${
                                            settings.darkMode ? 'bg-fate-orange' : 'bg-fate-gray'
                                        }`}
                                    >
                                        <div
                                            className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                                                settings.darkMode ? 'translate-x-6' : ''
                                            }`}
                                        />
                                    </button>
                                </div>

                                {/* Sound Effects */}
                                <div className="flex items-center justify-between py-4 border-b border-fate-gray/30">
                                    <div className="flex items-center gap-3">
                                        {settings.soundEffects ? <Volume2 size={20} /> : <VolumeX size={20} />}
                                        <div>
                                            <p className="font-medium">Sound Effects</p>
                                            <p className="text-xs text-fate-text">Enable audio feedback</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleSettingChange('soundEffects', !settings.soundEffects)}
                                        className={`relative w-12 h-6 rounded-full transition-colors ${
                                            settings.soundEffects ? 'bg-fate-orange' : 'bg-fate-gray'
                                        }`}
                                    >
                                        <div
                                            className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                                                settings.soundEffects ? 'translate-x-6' : ''
                                            }`}
                                        />
                                    </button>
                                </div>

                                {/* Auto Save */}
                                <div className="flex items-center justify-between py-4 border-b border-fate-gray/30">
                                    <div>
                                        <p className="font-medium">Auto Save</p>
                                        <p className="text-xs text-fate-text">Automatically save progress</p>
                                    </div>
                                    <button
                                        onClick={() => handleSettingChange('autoSave', !settings.autoSave)}
                                        className={`relative w-12 h-6 rounded-full transition-colors ${
                                            settings.autoSave ? 'bg-fate-orange' : 'bg-fate-gray'
                                        }`}
                                    >
                                        <div
                                            className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                                                settings.autoSave ? 'translate-x-6' : ''
                                            }`}
                                        />
                                    </button>
                                </div>

                                {/* Show Tips */}
                                <div className="flex items-center justify-between py-4">
                                    <div>
                                        <p className="font-medium">Show Tips</p>
                                        <p className="text-xs text-fate-text">Display helpful hints</p>
                                    </div>
                                    <button
                                        onClick={() => handleSettingChange('showTips', !settings.showTips)}
                                        className={`relative w-12 h-6 rounded-full transition-colors ${
                                            settings.showTips ? 'bg-fate-orange' : 'bg-fate-gray'
                                        }`}
                                    >
                                        <div
                                            className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                                                settings.showTips ? 'translate-x-6' : ''
                                            }`}
                                        />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Notifications */}
                        {activeTab === 'notifications' && (
                            <div className="space-y-6">
                                <div>
                                    <h2 className="font-heading text-xl font-bold mb-4">Notifications</h2>
                                    <p className="text-fate-text text-sm mb-6">Manage your notification preferences</p>
                                </div>

                                <div className="flex items-center justify-between py-4 border-b border-fate-gray/30">
                                    <div>
                                        <p className="font-medium">Push Notifications</p>
                                        <p className="text-xs text-fate-text">Receive browser notifications</p>
                                    </div>
                                    <button
                                        onClick={() => handleSettingChange('notifications', !settings.notifications)}
                                        className={`relative w-12 h-6 rounded-full transition-colors ${
                                            settings.notifications ? 'bg-fate-orange' : 'bg-fate-gray'
                                        }`}
                                    >
                                        <div
                                            className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                                                settings.notifications ? 'translate-x-6' : ''
                                            }`}
                                        />
                                    </button>
                                </div>

                                <div className="bg-fate-gray/30 rounded-lg p-4">
                                    <p className="text-sm text-fate-text">
                                        💡 Notifications help you stay on track with your financial goals and remind you of important decisions.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Privacy & Security */}
                        {activeTab === 'privacy' && (
                            <div className="space-y-6">
                                <div>
                                    <h2 className="font-heading text-xl font-bold mb-4">Privacy & Security</h2>
                                    <p className="text-fate-text text-sm mb-6">Manage your data and privacy</p>
                                </div>

                                <div className="space-y-4">
                                    <div className="bg-fate-gray/30 rounded-lg p-4">
                                        <h3 className="font-medium mb-2">Your Data</h3>
                                        <p className="text-sm text-fate-text mb-3">
                                            All your game data is stored locally in your browser. We don't send your personal information to any servers.
                                        </p>
                                        <div className="flex gap-2 text-xs">
                                            <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded">Local Storage</span>
                                            <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded">No Tracking</span>
                                            <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded">Encrypted</span>
                                        </div>
                                    </div>

                                    <div className="bg-fate-gray/30 rounded-lg p-4">
                                        <h3 className="font-medium mb-2">User ID</h3>
                                        <p className="text-sm text-fate-text mb-2">Your unique identifier:</p>
                                        <code className="bg-black px-3 py-2 rounded text-fate-orange font-mono text-sm block">
                                            {displayId}
                                        </code>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Data Management */}
                        {activeTab === 'data' && (
                            <div className="space-y-6">
                                <div>
                                    <h2 className="font-heading text-xl font-bold mb-4">Data Management</h2>
                                    <p className="text-fate-text text-sm mb-6">Export, import, or delete your data</p>
                                </div>

                                {/* Export */}
                                <div className="bg-fate-gray/30 rounded-lg p-4">
                                    <div className="flex items-start gap-3 mb-3">
                                        <Download size={20} className="text-fate-orange mt-1" />
                                        <div className="flex-1">
                                            <h3 className="font-medium mb-1">Export Game Data</h3>
                                            <p className="text-sm text-fate-text mb-3">
                                                Download your complete game state as a JSON file for backup or transfer.
                                            </p>
                                            <button
                                                onClick={handleExport}
                                                className="px-4 py-2 bg-fate-orange text-black rounded font-mono text-xs hover:bg-fate-orange-light transition-colors"
                                            >
                                                Export Data
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Import */}
                                <div className="bg-fate-gray/30 rounded-lg p-4">
                                    <div className="flex items-start gap-3 mb-3">
                                        <Upload size={20} className="text-blue-400 mt-1" />
                                        <div className="flex-1">
                                            <h3 className="font-medium mb-1">Import Game Data</h3>
                                            <p className="text-sm text-fate-text mb-3">
                                                Restore your game from a previously exported JSON file.
                                            </p>
                                            <label className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded font-mono text-xs hover:bg-blue-500/30 transition-colors cursor-pointer inline-block">
                                                Choose File
                                                <input
                                                    type="file"
                                                    accept=".json"
                                                    onChange={handleImport}
                                                    className="hidden"
                                                />
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                {/* Reset Game */}
                                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                                    <div className="flex items-start gap-3">
                                        <Trash2 size={20} className="text-yellow-400 mt-1" />
                                        <div className="flex-1">
                                            <h3 className="font-medium mb-1 text-yellow-400">Reset Game Progress</h3>
                                            <p className="text-sm text-fate-text mb-3">
                                                Start over from Month 0. Your preferences will be kept.
                                            </p>
                                            <button
                                                onClick={handleResetGame}
                                                className="px-4 py-2 bg-yellow-500/20 text-yellow-400 rounded font-mono text-xs hover:bg-yellow-500/30 transition-colors"
                                            >
                                                Reset Game
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Delete All Data */}
                                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                                    <div className="flex items-start gap-3">
                                        <Trash2 size={20} className="text-red-400 mt-1" />
                                        <div className="flex-1">
                                            <h3 className="font-medium mb-1 text-red-400">Delete All Data</h3>
                                            <p className="text-sm text-fate-text mb-3">
                                                Permanently delete all your game data. This cannot be undone!
                                            </p>
                                            <button
                                                onClick={handleClearData}
                                                className="px-4 py-2 bg-red-500/20 text-red-400 rounded font-mono text-xs hover:bg-red-500/30 transition-colors"
                                            >
                                                Delete All Data
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    )
}
