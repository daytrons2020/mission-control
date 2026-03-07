import { useState, useEffect } from 'react';
import { Plus, Search, Trash2, Edit2, Check, X, Database } from 'lucide-react';

// Mock catalog - would sync with Firebase in production
const MOCK_CATALOG = {
  '123456789': { name: 'Widget A', category: 'Electronics' },
  '987654321': { name: 'Gadget B', category: 'Tools' },
  'ABC123': { name: 'Part C', category: 'Hardware' },
  'TEST001': { name: 'Test Item', category: 'Misc' }
};

export function AdminPanel() {
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ sku: '', name: '', category: '' });

  useEffect(() => {
    // Load from localStorage or use mock data
    const saved = localStorage.getItem('inventory-catalog');
    if (saved) {
      setItems(JSON.parse(saved));
    } else {
      const mockItems = Object.entries(MOCK_CATALOG).map(([sku, data]) => ({
        id: Date.now() + Math.random(),
        sku,
        ...data
      }));
      setItems(mockItems);
      localStorage.setItem('inventory-catalog', JSON.stringify(mockItems));
    }
  }, []);

  const saveItems = (newItems) => {
    setItems(newItems);
    localStorage.setItem('inventory-catalog', JSON.stringify(newItems));
  };

  const handleAdd = () => {
    if (!formData.sku.trim() || !formData.name.trim()) return;
    
    const newItem = {
      id: Date.now(),
      sku: formData.sku.trim(),
      name: formData.name.trim(),
      category: formData.category.trim() || 'Uncategorized'
    };
    
    saveItems([...items, newItem]);
    setFormData({ sku: '', name: '', category: '' });
    setShowAddModal(false);
  };

  const handleUpdate = () => {
    if (!formData.name.trim()) return;
    
    const updated = items.map(item =>
      item.id === editingItem.id
        ? { ...item, name: formData.name.trim(), category: formData.category.trim() || 'Uncategorized' }
        : item
    );
    
    saveItems(updated);
    setEditingItem(null);
    setFormData({ sku: '', name: '', category: '' });
  };

  const handleDelete = (id) => {
    if (confirm('Delete this item?')) {
      saveItems(items.filter(item => item.id !== id));
    }
  };

  const startEdit = (item) => {
    setEditingItem(item);
    setFormData({ sku: item.sku, name: item.name, category: item.category });
  };

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h2><Database size={24} /> Item Catalog</h2>
        <button className="btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus size={18} /> Add Item
        </button>
      </div>

      <div className="search-bar">
        <Search size={18} />
        <input
          type="text"
          placeholder="Search items..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="admin-stats">
        <span>{items.length} total items</span>
        <span>{filteredItems.length} shown</span>
      </div>

      <div className="admin-list">
        {filteredItems.map(item => (
          <div key={item.id} className="admin-item">
            <div className="admin-item-info">
              <span className="item-name">{item.name}</span>
              <span className="item-meta">{item.sku} · {item.category}</span>
            </div>
            <div className="admin-item-actions">
              <button className="btn-icon" onClick={() => startEdit(item)}>
                <Edit2 size={16} />
              </button>
              <button className="btn-icon btn-danger" onClick={() => handleDelete(item.id)}>
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {(showAddModal || editingItem) && (
        <div className="modal">
          <div className="modal-content modal-small">
            <h3>{editingItem ? 'Edit Item' : 'Add New Item'}</h3>
            
            <div className="form-group">
              <label>SKU / Barcode</label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                placeholder="e.g., 123456789"
                disabled={!!editingItem}
              />
            </div>

            <div className="form-group">
              <label>Item Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Widget A"
                autoFocus
              />
            </div>

            <div className="form-group">
              <label>Category</label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="e.g., Electronics"
              />
            </div>

            <div className="modal-actions">
              <button 
                className="btn-secondary" 
                onClick={() => {
                  setShowAddModal(false);
                  setEditingItem(null);
                  setFormData({ sku: '', name: '', category: '' });
                }}
              >
                <X size={18} /> Cancel
              </button>
              <button 
                className="btn-primary" 
                onClick={editingItem ? handleUpdate : handleAdd}
              >
                <Check size={18} /> {editingItem ? 'Update' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
