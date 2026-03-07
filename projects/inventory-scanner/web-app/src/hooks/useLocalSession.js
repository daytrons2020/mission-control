import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'inventory-session-v1';

export function useLocalSession() {
  const [session, setSession] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : { startedAt: null, name: '', items: [] };
  });

  // Persist to localStorage whenever session changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  }, [session]);

  const startSession = useCallback((name) => {
    setSession({
      startedAt: new Date().toISOString(),
      name,
      items: []
    });
  }, []);

  const addItem = useCallback((item) => {
    setSession(prev => ({
      ...prev,
      items: [...prev.items, { ...item, id: Date.now() }]
    }));
  }, []);

  const updateItem = useCallback((id, updates) => {
    setSession(prev => ({
      ...prev,
      items: prev.items.map(item =>
        item.id === id ? { ...item, ...updates } : item
      )
    }));
  }, []);

  const removeItem = useCallback((id) => {
    setSession(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id)
    }));
  }, []);

  const clearSession = useCallback(() => {
    setSession({ startedAt: null, name: '', items: [] });
  }, []);

  const exportToCSV = useCallback(() => {
    if (session.items.length === 0) return;

    const headers = ['SKU', 'Name', 'Quantity', 'Scanned At'];
    const rows = session.items.map(item => [
      item.sku,
      item.name,
      item.quantity,
      new Date(item.scannedAt).toLocaleString()
    ]);

    const csv = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory-${session.name.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [session]);

  const itemCount = session.items.length;
  const totalQuantity = session.items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    session,
    addItem,
    updateItem,
    removeItem,
    clearSession,
    startSession,
    exportToCSV,
    itemCount,
    totalQuantity
  };
}
