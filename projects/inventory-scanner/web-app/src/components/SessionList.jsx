import { useState } from 'react';
import { Trash2, Edit2, Check, X, Package } from 'lucide-react';

export function SessionList({ items, onUpdateItem, onRemoveItem }) {
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({});

  if (items.length === 0) {
    return (
      <div className="session-list empty">
        <Package size={48} />
        <p>No items scanned yet</p>
        <p className="hint">Tap the barcode button to start scanning</p>
      </div>
    );
  }

  const startEdit = (item) => {
    setEditingId(item.id);
    setEditValues({
      name: item.name,
      quantity: item.quantity
    });
  };

  const saveEdit = (id) => {
    onUpdateItem(id, {
      name: editValues.name,
      quantity: parseInt(editValues.quantity) || 1
    });
    setEditingId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValues({});
  };

  return (
    <div className="session-list">
      {items.map((item) => (
        <div key={item.id} className="session-item">
          {editingId === item.id ? (
            <div className="session-item-edit">
              <input
                type="text"
                value={editValues.name}
                onChange={(e) => setEditValues({ ...editValues, name: e.target.value })}
                className="edit-name"
              />
              <input
                type="number"
                min="1"
                value={editValues.quantity}
                onChange={(e) => setEditValues({ ...editValues, quantity: e.target.value })}
                className="edit-qty"
              />
              <button className="btn-icon btn-success" onClick={() => saveEdit(item.id)}>
                <Check size={18} />
              </button>
              <button className="btn-icon" onClick={cancelEdit}>
                <X size={18} />
              </button>
            </div>
          ) : (
            <>
              <div className="session-item-info">
                <span className="item-name">{item.name}</span>
                <span className="item-sku">{item.sku}</span>
              </div>
              <div className="session-item-actions">
                <span className="item-qty">×{item.quantity}</span>
                <button className="btn-icon" onClick={() => startEdit(item)}>
                  <Edit2 size={16} />
                </button>
                <button className="btn-icon btn-danger" onClick={() => onRemoveItem(item.id)}>
                  <Trash2 size={16} />
                </button>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
