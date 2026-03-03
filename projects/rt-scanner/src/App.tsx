import { useState, useEffect, useRef } from 'react';
import { Camera, Download, Plus, Minus, ClipboardList, Trash2, ScanLine } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import * as XLSX from 'xlsx';
import './App.css';

// QR Format: RTINV|LAWSON_NUMBER|ITEM_NAME|CATEGORY|PAR_LEVEL
interface InventoryItem {
  lawsonNumber: string;
  name: string;
  category: string;
  parLevel: number;
}

interface ScanRecord {
  id: string;
  item: InventoryItem;
  action: 'add' | 'remove' | 'count' | 'order';
  quantity: number;
  timestamp: string;
  notes?: string;
}

function App() {
  const [isScanning, setIsScanning] = useState(false);
  const [scanRecords, setScanRecords] = useState<ScanRecord[]>([]);
  const [lastScanned, setLastScanned] = useState<InventoryItem | null>(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerDivRef = useRef<HTMLDivElement>(null);

  // Load saved records
  useEffect(() => {
    const saved = localStorage.getItem('rt-scanner-records');
    if (saved) {
      setScanRecords(JSON.parse(saved));
    }
  }, []);

  // Save records
  useEffect(() => {
    localStorage.setItem('rt-scanner-records', JSON.stringify(scanRecords));
  }, [scanRecords]);

  const startScanner = async () => {
    if (!scannerDivRef.current) return;
    
    try {
      scannerRef.current = new Html5Qrcode('scanner-container');
      
      await scannerRef.current.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        onScanSuccess,
        onScanFailure
      );
      
      setIsScanning(true);
    } catch (err) {
      console.error('Scanner error:', err);
      alert('Could not start camera. Please allow camera permissions.');
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      await scannerRef.current.stop();
      scannerRef.current = null;
    }
    setIsScanning(false);
  };

  const onScanSuccess = (decodedText: string) => {
    // Parse QR: RTINV|LAWSON_NUMBER|ITEM_NAME|CATEGORY|PAR_LEVEL
    const parts = decodedText.split('|');
    
    if (parts.length >= 5 && parts[0] === 'RTINV') {
      const item: InventoryItem = {
        lawsonNumber: parts[1],
        name: parts[2],
        category: parts[3],
        parLevel: parseInt(parts[4]) || 0
      };
      
      setLastScanned(item);
      setShowActionModal(true);
      stopScanner();
    } else {
      alert('Invalid QR code format. Expected: RTINV|LAWSON|NAME|CATEGORY|PAR');
    }
  };

  const onScanFailure = () => {
    // Scan failed, ignore and continue
  };

  const addRecord = (action: ScanRecord['action'], quantity: number, notes?: string) => {
    if (!lastScanned) return;
    
    const record: ScanRecord = {
      id: crypto.randomUUID(),
      item: lastScanned,
      action,
      quantity,
      timestamp: new Date().toISOString(),
      notes
    };
    
    setScanRecords(prev => [record, ...prev]);
    setShowActionModal(false);
    setLastScanned(null);
  };

  const deleteRecord = (id: string) => {
    if (confirm('Delete this record?')) {
      setScanRecords(prev => prev.filter(r => r.id !== id));
    }
  };

  const clearAll = () => {
    if (confirm('Clear all scan records?')) {
      setScanRecords([]);
    }
  };

  const exportToExcel = () => {
    if (scanRecords.length === 0) {
      alert('No records to export');
      return;
    }

    // Group by action type for separate sheets
    const addRemoveRecords = scanRecords.filter(r => r.action === 'add' || r.action === 'remove' || r.action === 'count');
    const orderRecords = scanRecords.filter(r => r.action === 'order');

    // Sheet 1: Inventory Transactions
    const transactionData = [
      ['Lawson Number', 'Item Name', 'Category', 'PAR Level', 'Action', 'Quantity', 'Date/Time', 'Notes'],
      ...addRemoveRecords.map(r => [
        r.item.lawsonNumber,
        r.item.name,
        r.item.category,
        r.item.parLevel,
        r.action.toUpperCase(),
        r.quantity,
        new Date(r.timestamp).toLocaleString(),
        r.notes || ''
      ])
    ];

    // Sheet 2: Order List
    const orderData = [
      ['Lawson Number', 'Item Name', 'Category', 'PAR Level', 'Quantity to Order', 'Date Added'],
      ...orderRecords.map(r => [
        r.item.lawsonNumber,
        r.item.name,
        r.item.category,
        r.item.parLevel,
        r.quantity,
        new Date(r.timestamp).toLocaleString()
      ])
    ];

    // Create workbook
    const wb = XLSX.utils.book_new();
    
    const ws1 = XLSX.utils.aoa_to_sheet(transactionData);
    ws1['!cols'] = [
      { wch: 15 }, { wch: 30 }, { wch: 20 }, { wch: 10 }, 
      { wch: 12 }, { wch: 10 }, { wch: 20 }, { wch: 25 }
    ];
    XLSX.utils.book_append_sheet(wb, ws1, 'Transactions');

    if (orderData.length > 1) {
      const ws2 = XLSX.utils.aoa_to_sheet(orderData);
      ws2['!cols'] = [
        { wch: 15 }, { wch: 30 }, { wch: 20 }, { wch: 10 }, 
        { wch: 15 }, { wch: 20 }
      ];
      XLSX.utils.book_append_sheet(wb, ws2, 'Order List');
    }

    const fileName = `RT-Inventory-${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'add': return <Plus className="w-4 h-4 text-green-600" />;
      case 'remove': return <Minus className="w-4 h-4 text-red-600" />;
      case 'count': return <ClipboardList className="w-4 h-4 text-blue-600" />;
      case 'order': return <ScanLine className="w-4 h-4 text-purple-600" />;
      default: return null;
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'add': return 'Added';
      case 'remove': return 'Removed';
      case 'count': return 'Counted';
      case 'order': return 'Order';
      default: return action;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-green-600 text-white sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Camera className="w-8 h-8" />
            <div>
              <h1 className="text-xl font-bold">RT Scanner</h1>
              <p className="text-sm text-green-100">Inventory QR Scanner</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Scanner Section */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          {!isScanning ? (
            <button
              onClick={startScanner}
              className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-4 px-6 rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              <Camera className="w-6 h-6" />
              Start Scanning
            </button>
          ) : (
            <div className="space-y-4">
              <div 
                ref={scannerDivRef}
                id="scanner-container" 
                className="w-full aspect-square bg-black rounded-lg overflow-hidden"
              />
              <button
                onClick={stopScanner}
                className="w-full py-2 px-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel Scan
              </button>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-medium text-green-900 mb-2">How to Scan</h3>
          <ul className="text-sm text-green-800 space-y-1">
            <li>• Tap "Start Scanning" and point camera at QR code</li>
            <li>• After scan, select action: Add, Remove, Count, or Order</li>
            <li>• Enter quantity when prompted</li>
            <li>• Export to Excel when done</li>
          </ul>
        </div>

        {/* Records List */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800">
              Scan Records ({scanRecords.length})
            </h2>
            {scanRecords.length > 0 && (
              <button
                onClick={clearAll}
                className="text-sm text-red-600 hover:text-red-700"
              >
                Clear All
              </button>
            )}
          </div>

          {scanRecords.length === 0 ? (
            <p className="text-center text-gray-400 py-8">
              No scans yet. Start scanning to add records.
            </p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {scanRecords.map(record => (
                <div 
                  key={record.id}
                  className="border rounded-lg p-3 bg-gray-50"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {getActionIcon(record.action)}
                        <span className="font-medium text-gray-900 truncate">
                          {record.item.name}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Lawson: {record.item.lawsonNumber} • {record.item.category}
                      </p>
                      <p className="text-sm text-gray-500">
                        {getActionLabel(record.action)}: {record.quantity} • PAR: {record.item.parLevel}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(record.timestamp).toLocaleString()}
                      </p>
                      {record.notes && (
                        <p className="text-sm text-gray-600 mt-1 italic">
                          Note: {record.notes}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => deleteRecord(record.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Export Button */}
        {scanRecords.length > 0 && (
          <button
            onClick={exportToExcel}
            className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            <Download className="w-5 h-5" />
            Export to Excel
          </button>
        )}

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 pb-8">
          Data saves automatically to this device
        </p>
      </main>

      {/* Action Modal */}
      {showActionModal && lastScanned && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm space-y-4">
            <h3 className="font-semibold text-lg">{lastScanned.name}</h3>
            <p className="text-sm text-gray-500">
              Lawson: {lastScanned.lawsonNumber} • PAR: {lastScanned.parLevel}
            </p>
            
            <div className="grid grid-cols-2 gap-3">
              <ActionButton 
                label="Add Stock" 
                icon={<Plus className="w-5 h-5" />}
                color="green"
                onClick={() => {
                  const qty = prompt('Quantity to add:', '1');
                  if (qty) addRecord('add', parseInt(qty) || 1);
                }}
              />
              <ActionButton 
                label="Remove Stock" 
                icon={<Minus className="w-5 h-5" />}
                color="red"
                onClick={() => {
                  const qty = prompt('Quantity to remove:', '1');
                  if (qty) addRecord('remove', parseInt(qty) || 1);
                }}
              />
              <ActionButton 
                label="Physical Count" 
                icon={<ClipboardList className="w-5 h-5" />}
                color="blue"
                onClick={() => {
                  const qty = prompt('Current count:', '');
                  if (qty) addRecord('count', parseInt(qty) || 0);
                }}
              />
              <ActionButton 
                label="Add to Order" 
                icon={<ScanLine className="w-5 h-5" />}
                color="purple"
                onClick={() => {
                  const qty = prompt('Quantity to order:', '1');
                  if (qty) addRecord('order', parseInt(qty) || 1);
                }}
              />
            </div>
            
            <button
              onClick={() => {
                setShowActionModal(false);
                setLastScanned(null);
              }}
              className="w-full py-2 text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Action Button Component
function ActionButton({ 
  label, 
  icon, 
  color, 
  onClick 
}: { 
  label: string; 
  icon: React.ReactNode; 
  color: 'green' | 'red' | 'blue' | 'purple';
  onClick: () => void;
}) {
  const colors = {
    green: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100',
    red: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100',
    blue: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
    purple: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100'
  };

  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-2 p-4 rounded-lg border transition-colors ${colors[color]}`}
    >
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}

export default App;
