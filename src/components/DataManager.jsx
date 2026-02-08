import { useState } from 'react'
import { Download, Upload, Trash2 } from 'lucide-react'
import { exportUserDataToFile, importUserDataFromFile, clearUserData } from '../engine/persistence'
import { getUserSession } from '../utils/session'

/**
 * DataManager Component
 * Allows users to export, import, and manage their game data
 */
export default function DataManager() {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState('')
  const { userId, displayId } = getUserSession()

  const handleExport = () => {
    const success = exportUserDataToFile(userId)
    if (success) {
      setMessage('✅ Data exported successfully!')
      setTimeout(() => setMessage(''), 3000)
    } else {
      setMessage('❌ Export failed - no data found')
      setTimeout(() => setMessage(''), 3000)
    }
  }

  const handleImport = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const success = await importUserDataFromFile(file, userId)
      if (success) {
        setMessage('✅ Data imported successfully! Refresh the page.')
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      } else {
        setMessage('❌ Import failed - invalid file')
        setTimeout(() => setMessage(''), 3000)
      }
    } catch (error) {
      setMessage('❌ Import failed: ' + error.message)
      setTimeout(() => setMessage(''), 3000)
    }
  }

  const handleClear = () => {
    if (confirm('Are you sure you want to delete all your game data? This cannot be undone!')) {
      const success = clearUserData(userId)
      if (success) {
        setMessage('✅ Data cleared! Refresh the page.')
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      } else {
        setMessage('❌ Clear failed')
        setTimeout(() => setMessage(''), 3000)
      }
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 border border-fate-gray rounded font-mono text-xs text-fate-text hover:bg-fate-gray/50 transition-colors"
      >
        DATA
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-2 bg-fate-card border border-fate-gray rounded-lg p-4 z-50 w-80 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-mono text-sm text-white">Data Management</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-fate-text hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            {message && (
              <div className="mb-4 p-2 bg-fate-gray rounded text-xs text-white">
                {message}
              </div>
            )}

            <div className="space-y-2">
              {/* Export Button */}
              <button
                onClick={handleExport}
                className="w-full flex items-center gap-2 px-3 py-2 bg-fate-orange text-black rounded font-mono text-xs hover:bg-fate-orange-light transition-colors"
              >
                <Download size={14} />
                Export Game Data (JSON)
              </button>

              {/* Import Button */}
              <label className="w-full flex items-center gap-2 px-3 py-2 bg-fate-gray text-white rounded font-mono text-xs hover:bg-fate-gray/70 transition-colors cursor-pointer">
                <Upload size={14} />
                Import Game Data (JSON)
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                />
              </label>

              {/* Clear Button */}
              <button
                onClick={handleClear}
                className="w-full flex items-center gap-2 px-3 py-2 bg-red-500/20 text-red-400 rounded font-mono text-xs hover:bg-red-500/30 transition-colors"
              >
                <Trash2 size={14} />
                Clear All Data
              </button>
            </div>

            <div className="mt-4 pt-4 border-t border-fate-gray">
              <p className="text-fate-muted font-mono text-xs">
                User ID: {displayId}
              </p>
              <p className="text-fate-muted font-mono text-xs mt-1">
                Storage: localStorage
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
