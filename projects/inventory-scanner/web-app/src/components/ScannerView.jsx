import { useScanner } from '../hooks/useScanner'
import { useState } from 'react'

export function ScannerView({ onScan, onClose }) {
  const [lastScan, setLastScan] = useState(null)
  const { isScanning, hasPermission, cameraError, startScanning, stopScanning, requestPermission } = useScanner(
    (code) => {
      setLastScan(code)
      onScan(code)
    }
  )

  return (
    <div className="scanner-view">
      <div className="scanner-header">
        <h2>Scan Barcode</h2>
        <button className="btn-close" onClick={onClose}>✕</button>
      </div>

      {cameraError && (
        <div className="error-message">
          <p>{cameraError}</p>
          <button className="btn-primary" onClick={requestPermission}>
            Try Again
          </button>
        </div>
      )}

      {!hasPermission && !cameraError && (
        <div className="permission-request">
          <p>Camera access is required to scan barcodes.</p>
          <button className="btn-primary" onClick={requestPermission}>
            Allow Camera Access
          </button>
        </div>
      )}

      {hasPermission && !isScanning && !cameraError && (
        <div className="scanner-ready">
          <button className="btn-primary btn-large" onClick={startScanning}>
            Start Scanning
          </button>
        </div>
      )}

      <div id="scanner-container" className={`scanner-container ${!isScanning ? 'hidden' : ''}`}></div>

      {isScanning && (
        <div className="scanning-indicator">
          <div className="scan-line"></div>
          <p>Point camera at barcode</p>
          <button className="btn-secondary" onClick={stopScanning}>
            Stop Scanning
          </button>
        </div>
      )}

      {lastScan && (
        <div className="last-scan">
          <p>Last scan: <strong>{lastScan}</strong></p>
        </div>
      )}
    </div>
  )
}
