/**
 * QR Code Scanner Component
 * 
 * Browser-based QR scanning using html5-qrcode library
 * Designed for mobile PWA use in respiratory departments
 */

import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';

// QR Code format: RTINV|{LAWSON_NUMBER}|{ITEM_NAME}|{CATEGORY}|{PAR_LEVEL}
// Example: RTINV|12345678|Nebulizer Tubing|Respiratory Supplies|50

export interface ScannedItem {
  lawsonNumber: string;
  name: string;
  category: string;
  parLevel: number;
  rawData: string;
  scannedAt: Date;
}

export interface ScanResult {
  success: boolean;
  item?: ScannedItem;
  error?: string;
}

export interface InventoryAction {
  type: 'in' | 'out' | 'count' | 'order';
  quantity: number;
  notes?: string;
}

export class QRScanner {
  private scanner: Html5Qrcode | null = null;
  private isScanning = false;
  private elementId: string;
  private onScanCallback: ((result: ScanResult) => void) | null = null;

  constructor(elementId: string = 'qr-reader') {
    this.elementId = elementId;
  }

  /**
   * Initialize and start the QR scanner
   */
  async start(onScan: (result: ScanResult) => void): Promise<void> {
    this.onScanCallback = onScan;

    try {
      this.scanner = new Html5Qrcode(this.elementId, {
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
        verbose: false
      });

      const devices = await Html5Qrcode.getCameras();
      
      if (devices.length === 0) {
        throw new Error('No cameras found');
      }

      // Prefer back camera (environment) for scanning items
      const backCamera = devices.find(d => 
        d.label.toLowerCase().includes('back') || 
        d.label.toLowerCase().includes('environment')
      );
      const cameraId = backCamera?.id || devices[0].id;

      await this.scanner.start(
        cameraId,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0
        },
        this.onScanSuccess.bind(this),
        this.onScanFailure.bind(this)
      );

      this.isScanning = true;
    } catch (err) {
      console.error('Failed to start scanner:', err);
      throw err;
    }
  }

  /**
   * Stop the scanner
   */
  async stop(): Promise<void> {
    if (this.scanner && this.isScanning) {
      await this.scanner.stop();
      this.isScanning = false;
    }
  }

  /**
   * Check if scanner is currently running
   */
  isRunning(): boolean {
    return this.isScanning;
  }

  /**
   * Handle successful QR scan
   */
  private onScanSuccess(decodedText: string): void {
    console.log('QR Code scanned:', decodedText);
    
    const result = this.parseQRCode(decodedText);
    
    if (this.onScanCallback) {
      this.onScanCallback(result);
    }

    // Optional: Pause scanning briefly to prevent duplicate reads
    this.pauseScanning(1500);
  }

  /**
   * Handle scan failure (no QR found in frame)
   */
  private onScanFailure(error: string): void {
    // This fires frequently when no QR is in view - can ignore
    // console.debug('Scan failure:', error);
  }

  /**
   * Pause scanning for specified milliseconds
   */
  private async pauseScanning(ms: number): Promise<void> {
    if (this.scanner) {
      await this.scanner.pause();
      setTimeout(() => {
        this.scanner?.resume();
      }, ms);
    }
  }

  /**
   * Parse QR code data into structured item
   */
  private parseQRCode(data: string): ScanResult {
    try {
      // Expected format: RTINV|LAWSON|NAME|CATEGORY|PAR
      const parts = data.split('|');
      
      if (parts.length !== 5) {
        return {
          success: false,
          error: 'Invalid QR code format'
        };
      }

      const [prefix, lawsonNumber, name, category, parLevel] = parts;

      if (prefix !== 'RTINV') {
        return {
          success: false,
          error: 'Unknown QR code type'
        };
      }

      return {
        success: true,
        item: {
          lawsonNumber,
          name: decodeURIComponent(name),
          category: decodeURIComponent(category),
          parLevel: parseInt(parLevel) || 0,
          rawData: data,
          scannedAt: new Date()
        }
      };
    } catch (err) {
      return {
        success: false,
        error: `Parse error: ${err}`
      };
    }
  }

  /**
   * Scan from image file (for testing or file upload)
   */
  async scanFromFile(file: File): Promise<ScanResult> {
    try {
      const scanner = new Html5Qrcode('qr-file-reader');
      const result = await scanner.scanFile(file, false);
      return this.parseQRCode(result);
    } catch (err) {
      return {
        success: false,
        error: `File scan error: ${err}`
      };
    }
  }
}

/**
 * Inventory Manager - handles scanned items and actions
 */
export class InventoryManager {
  private scanHistory: (ScannedItem & InventoryAction)[] = [];
  private pendingSync: (ScannedItem & InventoryAction)[] = [];

  /**
   * Record an inventory action for a scanned item
   */
  recordAction(item: ScannedItem, action: InventoryAction): void {
    const record = {
      ...item,
      ...action,
      recordedAt: new Date()
    };

    this.scanHistory.push(record);
    this.pendingSync.push(record);

    // Persist to local storage
    this.saveToLocalStorage();
  }

  /**
   * Get scan history
   */
  getHistory(): (ScannedItem & InventoryAction)[] {
    return [...this.scanHistory];
  }

  /**
   * Get pending sync items
   */
  getPendingSync(): (ScannedItem & InventoryAction)[] {
    return [...this.pendingSync];
  }

  /**
   * Clear pending sync after successful sync
   */
  clearPendingSync(): void {
    this.pendingSync = [];
    this.saveToLocalStorage();
  }

  /**
   * Get items that need ordering (below par level)
   */
  getItemsToOrder(): (ScannedItem & { currentCount: number })[] {
    // This would need to be populated from actual inventory data
    return [];
  }

  /**
   * Save to local storage for offline persistence
   */
  private saveToLocalStorage(): void {
    try {
      localStorage.setItem('rt_scan_history', JSON.stringify(this.scanHistory));
      localStorage.setItem('rt_pending_sync', JSON.stringify(this.pendingSync));
    } catch (err) {
      console.error('Failed to save to localStorage:', err);
    }
  }

  /**
   * Load from local storage
   */
  loadFromLocalStorage(): void {
    try {
      const history = localStorage.getItem('rt_scan_history');
      const pending = localStorage.getItem('rt_pending_sync');

      if (history) {
        this.scanHistory = JSON.parse(history);
      }
      if (pending) {
        this.pendingSync = JSON.parse(pending);
      }
    } catch (err) {
      console.error('Failed to load from localStorage:', err);
    }
  }

  /**
   * Export pending items as JSON for sync
   */
  exportForSync(): string {
    return JSON.stringify(this.pendingSync, null, 2);
  }

  /**
   * Generate summary report
   */
  generateReport(): {
    totalScans: number;
    byAction: Record<string, number>;
    byCategory: Record<string, number>;
    recentActivity: (ScannedItem & InventoryAction)[];
  } {
    const byAction: Record<string, number> = { in: 0, out: 0, count: 0, order: 0 };
    const byCategory: Record<string, number> = {};

    for (const record of this.scanHistory) {
      byAction[record.type] = (byAction[record.type] || 0) + 1;
      byCategory[record.category] = (byCategory[record.category] || 0) + 1;
    }

    return {
      totalScans: this.scanHistory.length,
      byAction,
      byCategory,
      recentActivity: this.scanHistory.slice(-10).reverse()
    };
  }
}

/**
 * QR Code Generator for creating inventory labels
 */
export class QRCodeGenerator {
  /**
   * Generate QR code data string for an inventory item
   */
  static generateData(item: {
    lawsonNumber: string;
    name: string;
    category: string;
    parLevel: number;
  }): string {
    const encodedName = encodeURIComponent(item.name);
    const encodedCategory = encodeURIComponent(item.category);
    return `RTINV|${item.lawsonNumber}|${encodedName}|${encodedCategory}|${item.parLevel}`;
  }

  /**
   * Validate QR code data format
   */
  static validateData(data: string): boolean {
    const parts = data.split('|');
    return parts.length === 5 && parts[0] === 'RTINV';
  }
}

export default QRScanner;
