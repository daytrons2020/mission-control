import { useState, useEffect } from 'react';
import { Package, Plus, Minus, Check, X } from 'lucide-react';

// Mock catalog - in production this would come from Firebase
const MOCK_CATALOG = {
  '123456789': { name: 'Widget A', category: 'Electronics' },
  '987654321': { name: 'Gadget B', category: 'Tools' },
  'ABC123': { name: 'Part C', category: 'Hardware' },
  'TEST001': { name: 'Test Item', category: 'Misc' }
};

export function ScanResult({ sku, onAdd, onCancel }) {
  const [quantity, setQuantity] = useState(1);
  const [itemName, setItemName] = useState('');
  const [isNewItem, setIsNewItem] = useState(false);

  useEffect(() => {
    const catalogItem = MOCK_CATALOG[sku];
    if (catalogItem) {
      setItemName(catalogItem.name);
      setIsNewItem(false);
    } else {
      setItemName('');
      setIsNewItem(true);
    }
  }, [sku]);

  const handleAdd = () => {
    onAdd({
      sku,
      name: itemName || `Item ${sku}`,
      quantity: parseInt(quantity) || 1,
      scannedAt: new Date().toISOString()
    });
  };

  const adjustQty = (delta) => {
    setQuantity(prev => Math.max(1, parseInt(prev) + delta));
  };

  return (
    <div className="scan-result">
      <div className="scan-result-header">
        <Package size={32} />
        <h3>{isNewItem ? 'New Item Scanned' : 'Item Found'}</h3>
      </div>

      <div className="scan-result-content">
        <div className="form-group">
          <label>SKU / Barcode</label>
          <input type="text" value={sku} readOnly className="input-readonly" />
        </div>

        <div className="form-group">
          <label>Item Name {isNewItem && <span className="badge-new">NEW</span>}</label>
          <input
            type="text"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            placeholder="Enter item name"
            autoFocus
          />
        </div>

        <div className="form-group">
          <label>Quantity</label>
          <div className="quantity-input">
            <button className="btn-icon" onClick={() => adjustQty(-1)}>
              <Minus size={20} />
            </button>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
            <button className="btn-icon" onClick={() => adjustQty(1)}>
              <Plus size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="scan-result-actions">
        <button className="btn-secondary" onClick={onCancel}>
          <X size={18} />
          Cancel
        </button>
        <button className="btn-primary" onClick={handleAdd}>
          <Check size={18} />
          Add to Session
        </button>
      </div>
    </div>
  );
}
