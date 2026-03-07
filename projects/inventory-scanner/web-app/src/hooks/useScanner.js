import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'

export function useScanner(onScan, onError) {
  const scannerRef = useRef(null)
  const [isScanning, setIsScanning] = useState(false)
  const [hasPermission, setHasPermission] = useState(null)
  const [cameraError, setCameraError] = useState(null)

  const requestPermission = async () => {
    try {
      await Html5Qrcode.getCameras()
      setHasPermission(true)
      setCameraError(null)
      return true
    } catch (err) {
      setHasPermission(false)
      setCameraError('Camera permission denied. Please allow camera access in your browser settings.')
      return false
    }
  }

  const startScanning = async () => {
    if (!hasPermission) {
      const granted = await requestPermission()
      if (!granted) return
    }

    try {
      const cameras = await Html5Qrcode.getCameras()
      if (cameras.length === 0) {
        setCameraError('No cameras found on this device.')
        return
      }

      // Prefer back camera on mobile
      const backCamera = cameras.find(cam => cam.label.toLowerCase().includes('back'))
      const selectedCamera = backCamera || cameras[0]

      scannerRef.current = new Html5Qrcode('scanner-container')
      
      await scannerRef.current.start(
        selectedCamera.id,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1
        },
        (decodedText) => {
          onScan(decodedText)
        },
        (errorMessage) => {
          // Ignore scan errors (no QR code in frame)
        }
      )
      
      setIsScanning(true)
    } catch (err) {
      setCameraError('Failed to start camera: ' + err.message)
    }
  }

  const stopScanning = async () => {
    if (scannerRef.current && isScanning) {
      try {
        await scannerRef.current.stop()
        await scannerRef.current.clear()
      } catch (err) {
        console.error('Error stopping scanner:', err)
      }
      scannerRef.current = null
      setIsScanning(false)
    }
  }

  useEffect(() => {
    return () => {
      stopScanning()
    }
  }, [])

  return {
    isScanning,
    hasPermission,
    cameraError,
    startScanning,
    stopScanning,
    requestPermission
  }
}
