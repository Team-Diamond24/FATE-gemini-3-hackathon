import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

/**
 * DataViewer Component - Visual localStorage inspector
 * Add to any page with: <DataViewer />
 */
export default function DataViewer() {
  const [isOpen, setIsOpen] = useState(false)
  const [data, setData] = useState({})
  const [selectedKey, setSelectedKey] = useState(null)

  useEffect(() => {
    if (isOpen) {
      loadData()
    }
  }, [isOpen])

  const loadData = () => {
    const fateData = {}
    Object.keys(localStorage)
      .filter(key => key.startsWith('fate_'))
      .forEach(key => {
        try {
          fateData[key] = JSON.parse(localStorage.getItem(key))
        } catch {
          fateData[key] = localStorage.getItem(key)
        }
      })
    setData(fateData)
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(JSON.stringify(text, null, 2))
    alert('Copied to clipboard!')
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-fate-orange text-black px-4 py-2 rounded font-mono text-xs z-50 hover:bg-fate-orange-light"
      >
        VIEW DATA
      </button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex">
      {/* Sidebar */}
      <div className="w-80 bg-fate-card border-r border-fate-gray p-4 overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-mono text-sm text-white">localStorage Keys</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="text-fate-text hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {Object.keys(data).length === 0 ? (
          <p className="text-fate-muted text-sm">No FATE data found</p>
        ) : (
          <div className="space-y-2">
            {Object.keys(data).map(key => (
              <button
                key={key}
                onClick={() => setSelectedKey(key)}
                className={`w-full text-left px-3 py-2 rounded font-mono text-xs transition-colors ${
                  selectedKey === key
                    ? 'bg-fate-orange text-black'
                    : 'bg-fate-gray text-white hover:bg-fate-gray/70'
                }`}
              >
                {key.replace('fate_', '')}
              </button>
            ))}
          </div>
        )}

        <button
          onClick={loadData}
          className="w-full mt-4 bg-fate-gray text-white px-3 py-2 rounded font-mono text-xs hover:bg-fate-gray/70"
        >
          Refresh
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        {selectedKey ? (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-mono text-lg text-white">{selectedKey}</h3>
              <button
                onClick={() => copyToClipboard(data[selectedKey])}
                className="bg-fate-orange text-black px-4 py-2 rounded font-mono text-xs hover:bg-fate-orange-light"
              >
                Copy JSON
              </button>
            </div>
            <pre className="bg-fate-card border border-fate-gray rounded p-4 text-xs text-white overflow-x-auto">
              {JSON.stringify(data[selectedKey], null, 2)}
            </pre>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-fate-muted font-mono text-sm">
              Select a key to view data
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
