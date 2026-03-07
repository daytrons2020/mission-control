import { useState } from 'react'
import { Trash2, Edit2, Check, X } from 'lucide-react'

export function SessionList({ items, onUpdateItem, onRemoveItem }) {
  const [editingSku, setEditingSku] = useState(null)
  const [editQuantity, setEditQuantity] = useState(1)

  const startEdit = (item) => {
    setEditingSku(item.sku)
    setEditQuantity(item.quantity)
  }

  const saveEdit = (sku) => {
    onUpdateItem(sku, { quantity: editQuantity })
    setEditingSku(null)
  }

  const cancelEdit = () => {
    setEditingSku(null)
  }

  if (items.length === 0) {
    return (
      <div className="session-list empty">
        <p>No items scanned yet.</p>
        <p className="hint">Tap the scan button to start adding items.</p>
      </div>
    )
  }

  return (
    <div className="session-list">
      <div className="list-header">
        <span>{items.length} item{items.length !== 1 ? 's' : ''}</span>
        <span>Qty: {items.reduce((sum, item) => sum + item.quantity, 0)}</span>
      </div>
      
      <ul className="items-list">
        {items.map((item) => (
          <li key={item.sku} className="item-row">
            <div className="item-info">
              <span className="item-name">{item.name}</span>
              <span className="item-sku">{item.sku}</span>
              {item.category && <span className="item-category">{item.category}</span>}
            </div>
            
            <div className="item-actions">
              {editingSku === item.sku ? (
                <>
                  <input
                    type="number"
                    value={editQuantity}
                    onChange={(e) => setEditQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="edit-input"
                    autoFocus
                  />
                  <button className="btn-icon btn-save" onClick={() => saveEdit(item.sku)}>
                    <Check size={18} />
                  </button>
                  <button className="btn-icon btn-cancel" onClick={cancelEdit}>
                    <X size={18} />
                  </button>
                </>
              ) : (
                <>
                  <span className="item-quantity">×{item.quantity}</span>
                  <button className="btn-icon" onClick={() => startEdit(item)}>
                    <Edit2 size={18} />
                  </button>
                  <button className="btn-icon btn-delete" onClick={() => onRemoveItem(item.sku)}>
                    <Trash2 size={18} />
                  </button>
                </>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
