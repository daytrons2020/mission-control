import { useState } from 'react'
import { ScannerView } from './components/ScannerView'
import { ScanResult } from './components/ScanResult'
import { SessionList } from './components/SessionList'
import { AdminPanel } from './components/AdminPanel'
import { useLocalSession } from './hooks/useLocalSession'
import { Package, Settings, Barcode } from 'lucide-react'

function App() {
  const [view, setView] = useState('scanner') // 'scanner', 'admin'
  const [showScanner, setShowScanner] = useState(false)
  const [scannedCode, setScannedCode] = useState(null)
  
  const {
    session,
    addItem,
    updateItem,
    removeItem,
    clearSession,
    startSession,
    exportToCSV,
    itemCount,
    totalQuantity
  } = useLocalSession()

  const handleScan = (code) => {
    setScannedCode(code)
    setShowScanner(false)
  }

  const handleAddItem = (item) => {
    addItem(item)
    setScannedCode(null)
  }

  const handleCancelScan = () => {
    setScannedCode(null)
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="logo">
          <Package size={28} />
          <h1>Inventory Scanner</h1>
        </div>
        <nav className="nav-tabs">
          <button 
            className={view === 'scanner' ? 'active' : ''} 
            onClick={() => setView('scanner')}
          >
            <Barcode size={18} />
            Scan
          </button>
          <button 
            className={view === 'admin' ? 'active' : ''} 
            onClick={() => setView('admin')}
          >
            <Settings size={18} />
            Admin
          </button>
        </nav>
      </header>

      <main className="app-main">
        {view === 'scanner' ? (
          <>
            {!session.startedAt ? (
              <div className="start-session">
                <h2>Start New Session</h2>
                <input
                  type="text"
                  placeholder="Session name (e.g., Warehouse A - Jan 15)"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && e.target.value.trim()) {
                      startSession(e.target.value.trim())
                    }
                  }}
                  autoFocus
                />
                <button 
                  className="btn-primary btn-large"
                  onClick={() => {
                    const input = document.querySelector('.start-session input')
                    if (input.value.trim()) {
                      startSession(input.value.trim())
                    }
                  }}
                >
                  Start Scanning
                </button>
              </div>
            ) : (
              <>
                <div className="session-header">
                  <div className="session-info">
                    <h2>{session.name}</h2>
                    <span className="session-stats">
                      {itemCount} items · {totalQuantity} total
                    </span>
                  </div>
                  <div className="session-actions">
                    {itemCount > 0 && (
                      <>
                        <button className="btn-secondary" onClick={exportToCSV}>
                          Export CSV
                        </button>
                        <button className="btn-danger" onClick={() => {
                          if (confirm('Clear all items from this session?')) {
                            clearSession()
                          }
                        }}>
                          Clear
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <SessionList 
                  items={session.items}
                  onUpdateItem={updateItem}
                  onRemoveItem={removeItem}
                />

                <button 
                  className="fab"
                  onClick={() => setShowScanner(true)}
                  aria-label="Scan barcode"
                >
                  <Barcode size={28} />
                </button>
              </>
            )}
          </>
        ) : (
          <AdminPanel />
        )}
      </main>

      {showScanner && (
        <div className="modal">
          <div className="modal-content">
            <ScannerView 
              onScan={handleScan}
              onClose={() => setShowScanner(false)}
            />
          </div>
        </div>
      )}

      {scannedCode && (
        <div className="modal">
          <div className="modal-content">
            <ScanResult
              sku={scannedCode}
              onAdd={handleAddItem}
              onCancel={handleCancelScan}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default App
