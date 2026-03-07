import { useState } from 'react'
import { Plus, Download, Trash2, Save } from 'lucide-react'

export function SessionControls({ 
  sessionName, 
  onStartSession, 
  onExport, 
  onClear, 
  itemCount,
  hasItems 
}) {
  const [name, setName] = useState(sessionName || '')
  const [isEditing, setIsEditing] = useState(!sessionName)

  const handleStart = () => {
    if (name.trim()) {
      onStartSession(name.trim())
      setIsEditing(false)
    }
  }

  if (isEditing) {
    return (
      <div className="session-controls start-session">
        <h3>Start New Session</h3>
        <input
          type="text"
          placeholder="Session name (e.g., Warehouse A - Jan 15)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleStart()}
          autoFocus
        />
        <button className="btn-primary" onClick={handleStart} disabled={!name.trim()}>
          <Save size={18} />
          Start Session
        </button>
      </div>
    )
  }

  return (
    <div className="session-controls">
      <div className="session-info">
        <h3>{sessionName}</h3>
        <button className="btn-text" onClick={() => setIsEditing(true)}>Edit</button>
      </div>
      
      <div className="action-buttons">
        <button className="btn-primary btn-scan" onClick={() => {}}>
          <Plus size={24} />
          Scan
        </button>
        
        {hasItems && (
          <>
            <button className="btn-secondary" onClick={onExport}>
              <Download size={18} />
              Export CSV
            </button>
            <button className="btn-danger" onClick={onClear}>
              <Trash2 size={18} />
              Clear
            </button>
          </>
        )}
      </div>
    </div>
  )
}
