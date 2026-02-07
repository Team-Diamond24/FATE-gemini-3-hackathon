import { useState, useEffect, useRef } from 'react'
import { User, Settings, LogOut, ChevronDown } from 'lucide-react'
import { logOut } from '../config/firebaseConfig'

export default function ProfileDropdown() {
    const [isOpen, setIsOpen] = useState(false)
    const [userName, setUserName] = useState('')
    const [userEmail, setUserEmail] = useState('')
    const dropdownRef = useRef(null)

    useEffect(() => {
        // Get user info from localStorage
        const name = localStorage.getItem('fate_userName') || 'Player'
        const email = localStorage.getItem('fate_userEmail') || ''
        setUserName(name)
        setUserEmail(email)

        // Close dropdown when clicking outside
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleLogout = async () => {
        await logOut()
        localStorage.removeItem('fate_userId')
        localStorage.removeItem('fate_userEmail')
        localStorage.removeItem('fate_userName')
        localStorage.removeItem('fate_usernameSet')
        window.location.hash = '#/'
        window.location.reload()
    }

    const getInitials = (name) => {
        if (!name) return 'P'
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Profile Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 p-1 rounded-lg hover:bg-fate-gray/30 transition-colors"
            >
                <div className="w-9 h-9 bg-fate-orange rounded-full flex items-center justify-center font-bold text-black text-sm">
                    {getInitials(userName)}
                </div>
                <ChevronDown
                    size={16}
                    className={`text-fate-text transition-transform ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-fate-card border border-fate-gray/30 rounded-xl shadow-2xl overflow-hidden z-50">
                    {/* User Info Header */}
                    <div className="p-4 border-b border-fate-gray/30">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-fate-orange rounded-full flex items-center justify-center font-bold text-black">
                                {getInitials(userName)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-white truncate">{userName}</p>
                                <p className="font-mono text-xs text-fate-text truncate">{userEmail}</p>
                            </div>
                        </div>
                    </div>

                    {/* Menu Items */}
                    <div className="p-2">
                        <button
                            onClick={() => {
                                setIsOpen(false)
                                window.location.hash = '#/profile'
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-fate-text hover:text-white hover:bg-fate-gray/30 transition-colors"
                        >
                            <User size={18} />
                            <span className="font-mono text-sm">Profile</span>
                        </button>

                        <button
                            onClick={() => {
                                setIsOpen(false)
                                window.location.hash = '#/settings'
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-fate-text hover:text-white hover:bg-fate-gray/30 transition-colors"
                        >
                            <Settings size={18} />
                            <span className="font-mono text-sm">Settings</span>
                        </button>
                    </div>

                    {/* Logout */}
                    <div className="p-2 border-t border-fate-gray/30">
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                        >
                            <LogOut size={18} />
                            <span className="font-mono text-sm">Log out</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
