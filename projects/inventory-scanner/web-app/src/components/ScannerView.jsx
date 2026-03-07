import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X, Camera } from 'lucide-react';

export function ScannerView({ onScan, onClose }) {
  const scannerRef = useRef(null);
  const [error, setError] = useState(null);
  const [isStarting, setIsStarting] = useState(true);

  useEffect(() => {
    const scanner = new Html5Qrcode('scanner-container');
    scannerRef.current = scanner;

    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0
    };

    scanner.start(
      { facingMode: 'environment' },
      config,
      (decodedText) => {
        onScan(decodedText);
        scanner.stop().catch(() => {});
      },
      () => {
        // QR code not found in this frame - ignore
      }
    )
    .then(() => setIsStarting(false))
    .catch((err) => {
      setError('Camera access denied or not available. Please allow camera permissions.');
      setIsStarting(false);
      console.error('Scanner error:', err);
    });

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, [onScan]);

  return (
    <div className="scanner-view">
      <div className="scanner-header">
        <h3>Scan Barcode</h3>
        <button className="btn-icon" onClick={onClose}>
          <X size={24} />
        </button>
      </div>

      {isStarting && (
        <div className="scanner-loading">
          <Camera size={48} />
          <p>Starting camera...</p>
        </div>
      )}

      {error && (
        <div className="scanner-error">
          <p>{error}</p>
          <button className="btn-primary" onClick={onClose}>
            Close
          </button>
        </div>
      )}

      <div 
        id="scanner-container" 
        className={`scanner-container ${isStarting ? 'hidden' : ''}`}
      />

      <p className="scanner-hint">
        Point camera at a barcode or QR code
      </p>
    </div>
  );
}
