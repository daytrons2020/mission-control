import { useState, useRef, useEffect } from 'react';
import { QrCode, Download, Upload, Plus, Trash2, Printer } from 'lucide-react';
import QRCode from 'qrcode';
import * as XLSX from 'xlsx';
import './App.css';

interface InventoryItem {
  id: string;
  lawsonNumber: string;
  name: string;
  category: string;
  parLevel: number;
}

function App() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [newItem, setNewItem] = useState({
    lawsonNumber: '',
    name: '',
    category: '',
    parLevel: ''
  });
  const [generatedQRs, setGeneratedQRs] = useState<{item: InventoryItem, dataUrl: string}[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Load saved items
  useEffect(() => {
    const saved = localStorage.getItem('rt-qr-items');
    if (saved) {
      setItems(JSON.parse(saved));
    }
  }, []);

  // Save items
  useEffect(() => {
    localStorage.setItem('rt-qr-items', JSON.stringify(items));
  }, [items]);

  const addItem = () => {
    if (!newItem.lawsonNumber || !newItem.name) {
      alert('Lawson Number and Item Name are required');
      return;
    }

    const item: InventoryItem = {
      id: crypto.randomUUID(),
      lawsonNumber: newItem.lawsonNumber,
      name: newItem.name,
      category: newItem.category || 'General',
      parLevel: parseInt(newItem.parLevel) || 0
    };

    setItems(prev => [...prev, item]);
    setNewItem({ lawsonNumber: '', name: '', category: '', parLevel: '' });
  };

  const deleteItem = (id: string) => {
    if (confirm('Delete this item?')) {
      setItems(prev => prev.filter(i => i.id !== id));
    }
  };

  const generateQR = async (item: InventoryItem) => {
    // Format: RTINV|LAWSON_NUMBER|ITEM_NAME|CATEGORY|PAR_LEVEL
    const qrData = `RTINV|${item.lawsonNumber}|${item.name}|${item.category}|${item.parLevel}`;
    
    try {
      const dataUrl = await QRCode.toDataURL(qrData, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      });
      
      return { item, dataUrl };
    } catch (err) {
      console.error('QR generation error:', err);
      return null;
    }
  };

  const generateAllQRs = async () => {
    if (items.length === 0) {
      alert('No items to generate QR codes for');
      return;
    }

    const generated = [];
    for (const item of items) {
      const result = await generateQR(item);
      if (result) generated.push(result);
    }
    
    setGeneratedQRs(generated);
  };

  const importFromExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(sheet);

        const importedItems: InventoryItem[] = jsonData.map((row: any) => ({
          id: crypto.randomUUID(),
          lawsonNumber: String(row['Lawson Number'] || row['lawsonNumber'] || row['Lawson'] || ''),
          name: String(row['Item Name'] || row['name'] || row['Name'] || ''),
          category: String(row['Category'] || row['category'] || 'General'),
          parLevel: parseInt(row['PAR Level'] || row['parLevel'] || row['PAR'] || '0') || 0
        })).filter(item => item.lawsonNumber && item.name);

        setItems(prev => [...prev, ...importedItems]);
        alert(`Imported ${importedItems.length} items`);
      } catch (err) {
        alert('Error importing file. Make sure it has columns: Lawson Number, Item Name, Category, PAR Level');
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = '';
  };

  const exportItemList = () => {
    if (items.length === 0) {
      alert('No items to export');
      return;
    }

    const data = [
      ['Lawson Number', 'Item Name', 'Category', 'PAR Level', 'QR Data'],
      ...items.map(item => [
        item.lawsonNumber,
        item.name,
        item.category,
        item.parLevel,
        `RTINV|${item.lawsonNumber}|${item.name}|${item.category}|${item.parLevel}`
      ])
    ];

    const ws = XLSX.utils.aoa_to_sheet(data);
    ws['!cols'] = [
      { wch: 15 }, { wch: 30 }, { wch: 20 }, { wch: 10 }, { wch: 50 }
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Inventory Items');
    XLSX.writeFile(wb, `RT-Inventory-Items-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const printQRs = () => {
    if (generatedQRs.length === 0) {
      alert('Generate QR codes first');
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>QR Codes - Print</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .qr-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
          .qr-item { border: 1px solid #ccc; padding: 15px; text-align: center; page-break-inside: avoid; }
          .qr-item img { max-width: 200px; height: auto; }
          .qr-item .name { font-weight: bold; margin-top: 10px; }
          .qr-item .details { font-size: 12px; color: #666; margin-top: 5px; }
          @media print { .qr-item { break-inside: avoid; } }
        </style>
      </head>
      <body>
        <h1>RT Inventory QR Codes</h1>
        <div class="qr-grid">
          ${generatedQRs.map(qr => `
            <div class="qr-item">
              <img src="${qr.dataUrl}" alt="QR Code" />
              <div class="name">${qr.item.name}</div>
              <div class="details">
                Lawson: ${qr.item.lawsonNumber} | PAR: ${qr.item.parLevel}<br/>
                ${qr.item.category}
              </div>
            </div>
          `).join('')}
        </div>
        <script>window.onload = () => { setTimeout(() => { window.print(); }, 500); };</script>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-purple-600 text-white sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <QrCode className="w-8 h-8" />
            <div>
              <h1 className="text-xl font-bold">RT QR Generator</h1>
              <p className="text-sm text-purple-100">Create QR codes for inventory</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Instructions */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h3 className="font-medium text-purple-900 mb-2">How to Use</h3>
          <ul className="text-sm text-purple-800 space-y-1">
            <li>• Add inventory items manually or import from Excel</li>
            <li>• Generate QR codes for all items</li>
            <li>• Print QR codes on labels or paper</li>
            <li>• Attach to physical inventory items</li>
          </ul>
        </div>

        {/* Import/Export */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h2 className="font-semibold text-gray-800 mb-4">Import / Export</h2>
          <div className="flex flex-wrap gap-3">
            <label className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors">
              <Upload className="w-4 h-4" />
              Import Excel
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={importFromExcel}
                className="hidden"
              />
            </label>
            <button
              onClick={exportItemList}
              disabled={items.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 disabled:bg-gray-100 disabled:text-gray-400 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export List
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Excel columns: Lawson Number, Item Name, Category, PAR Level
          </p>
        </div>

        {/* Add Item Form */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h2 className="font-semibold text-gray-800 mb-4">Add Item</h2>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Lawson Number *"
              value={newItem.lawsonNumber}
              onChange={(e) => setNewItem({...newItem, lawsonNumber: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
            <input
              type="text"
              placeholder="Item Name *"
              value={newItem.name}
              onChange={(e) => setNewItem({...newItem, name: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
            <input
              type="text"
              placeholder="Category"
              value={newItem.category}
              onChange={(e) => setNewItem({...newItem, category: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
            <input
              type="number"
              placeholder="PAR Level"
              value={newItem.parLevel}
              onChange={(e) => setNewItem({...newItem, parLevel: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <button
            onClick={addItem}
            className="mt-3 w-full flex items-center justify-center gap-2 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Item
          </button>
        </div>

        {/* Item List */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800">
              Items ({items.length})
            </h2>
            {items.length > 0 && (
              <button
                onClick={() => { if (confirm('Clear all items?')) setItems([]); }}
                className="text-sm text-red-600 hover:text-red-700"
              >
                Clear All
              </button>
            )}
          </div>

          {items.length === 0 ? (
            <p className="text-center text-gray-400 py-8">No items added yet</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {items.map(item => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 truncate">{item.name}</p>
                    <p className="text-sm text-gray-500">
                      Lawson: {item.lawsonNumber} • {item.category} • PAR: {item.parLevel}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteItem(item.id)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Generate QR Codes */}
        {items.length > 0 && (
          <button
            onClick={generateAllQRs}
            className="w-full flex items-center justify-center gap-2 bg-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-purple-700 transition-colors"
          >
            <QrCode className="w-5 h-5" />
            Generate All QR Codes
          </button>
        )}

        {/* Generated QR Codes */}
        {generatedQRs.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-800">
                Generated QR Codes ({generatedQRs.length})
              </h2>
              <button
                onClick={printQRs}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Printer className="w-4 h-4" />
                Print
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {generatedQRs.map((qr, idx) => (
                <div key={idx} className="border rounded-lg p-4 text-center">
                  <img src={qr.dataUrl} alt="QR Code" className="mx-auto w-32 h-32" />
                  <p className="font-medium text-sm mt-2 truncate">{qr.item.name}</p>
                  <p className="text-xs text-gray-500">
                    {qr.item.lawsonNumber} • PAR {qr.item.parLevel}
                  </p>
                  <a
                    href={qr.dataUrl}
                    download={`QR-${qr.item.lawsonNumber}.png`}
                    className="inline-flex items-center gap-1 mt-2 text-sm text-purple-600 hover:text-purple-700"
                  >
                    <Download className="w-3 h-3" />
                    Download
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Hidden canvas for QR generation */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 pb-8">
          QR Format: RTINV|LAWSON|NAME|CATEGORY|PAR
        </p>
      </main>
    </div>
  );
}

export default App;
