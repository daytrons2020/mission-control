import { useState, useEffect } from 'react'
import { useItems } from '../hooks/useItems'

export function ScanResult({ sku, onAdd, onCancel }) {
  const { lookupItem } = useItems()
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    const fetchItem = async () => {
      setLoading(true)
      const found = await lookupItem(sku)
      if (found) {
        setItem(found)
        setNotFound(false)
      } else {
        setNotFound(true)
      }
      setLoading(false)
    }
    fetchItem()
  }, [sku])

  const handleAdd = () => {
    onAdd({
      sku,
      name: item?.name || sku,
      category: item?.category || '',
      quantity,
      scannedAt: new Date().toISOString()
    })
  }

  if (loading) {
    return (
      <div className="scan-result loading">
        <div className="spinner"></div>
        <p>Looking up item...</p>
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="scan-result not-found">
        <div className="result-icon">❓</div>
        <h3>Item Not Found</h3>
        <p className="sku">{sku}</p>
        <p>This SKU is not in the catalog.</p>
        
        <div className="quantity-input">
          <label>Quantity:</label>
          <div className="quantity-controls">
            <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button>
            <input type="number" value={quantity} onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))} />
            <button onClick={() => setQuantity(quantity + 1)}>+</button>
          </div>
        </div>

        <div className="actions">
          <button className="btn-secondary" onClick={onCancel}>Cancel</button>
          <button className="btn-primary" onClick={handleAdd}>Add Anyway</button>
        </div>
      </div>
    )
  }

  return (
    <div className="scan-result found">
      <div className="result-icon">✓</div>
      <h3>{item.name}</h3>
      <p className="sku">{sku}</p>
      {item.category && <span className="category">{item.category}</span>}
      
      <div className="quantity-input">
        <label>Quantity:</label>
        <div className="quantity-controls">
          <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button>
          <input type="number" value={quantity} onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))} />
          <button onClick={() => setQuantity(quantity + 1)}>+</button>
        </div>
      </div>

      <div className="actions">
        <button className="btn-secondary" onClick={onCancel}>Cancel</button>
        <button className="btn-primary" onClick={handleAdd}>Add to Session</button>
      </div>
    </div>
  )
}
