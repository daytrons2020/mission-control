import { useState, useEffect } from 'react'

const STORAGE_KEY = 'inventory_scanner_session'

export function useLocalSession() {
  const [session, setSession] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : { items: [], name: '', startedAt: null }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
  }, [session])

  const addItem = (item) => {
    setSession(prev => {
      const existingIndex = prev.items.findIndex(i => i.sku === item.sku)
      if (existingIndex >= 0) {
        const updated = [...prev.items]
        updated[existingIndex] = { ...updated[existingIndex], quantity: updated[existingIndex].quantity + item.quantity }
        return { ...prev, items: updated }
      }
      return { ...prev, items: [...prev.items, item] }
    })
  }

  const updateItem = (sku, updates) => {
    setSession(prev => ({
      ...prev,
      items: prev.items.map(item => item.sku === sku ? { ...item, ...updates } : item)
    }))
  }

  const removeItem = (sku) => {
    setSession(prev => ({
      ...prev,
      items: prev.items.filter(item => item.sku !== sku)
    }))
  }

  const clearSession = () => {
    setSession({ items: [], name: '', startedAt: null })
  }

  const startSession = (name) => {
    setSession({ items: [], name, startedAt: new Date().toISOString() })
  }

  const exportToCSV = () => {
    if (session.items.length === 0) return null
    
    const headers = ['SKU', 'Name', 'Category', 'Quantity', 'Scanned At']
    const rows = session.items.map(item => [
      item.sku,
      item.name,
      item.category || '',
      item.quantity,
      item.scannedAt
    ])
    
    const csv = [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n')
    
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `inventory-session-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return {
    session,
    addItem,
    updateItem,
    removeItem,
    clearSession,
    startSession,
    exportToCSV,
    itemCount: session.items.length,
    totalQuantity: session.items.reduce((sum, item) => sum + item.quantity, 0)
  }
}
