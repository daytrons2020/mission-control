import { useState } from 'react'
import { getAllItems, createItem, updateItem, deleteItem } from '../firebase'
import { Plus, Edit2, Trash2, Check, X, Search } from 'lucide-react'

export function AdminPanel() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [editingItem, setEditingItem] = useState(null)
  const [isAdding, setIsAdding] = useState(false)
  const [formData, setFormData] = useState({ sku: '', name: '', category: '' })

  // Load items on mount
  useState(() => {
    loadItems()
  }, [])

  const loadItems = async () => {
    setLoading(true)
    const data = await getAllItems()
    setItems(data)
    setLoading(false)
  }

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.category && item.category.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const handleAdd = async () => {
    if (!formData.sku.trim() || !formData.name.trim()) return
    await createItem(formData)
    setFormData({ sku: '', name: '', category: '' })
    setIsAdding(false)
    loadItems()
  }

  const handleUpdate = async () => {
    if (!formData.name.trim()) return
    await updateItem(editingItem.id, formData)
    setEditingItem(null)
    setFormData({ sku: '', name: '', category: '' })
    loadItems()
  }

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this item?')) {
      await deleteItem(id)
      loadItems()
    }
  }

  const startEdit = (item) => {
    setEditingItem(item)
    setFormData({ sku: item.sku, name: item.name, category: item.category || '' })
  }

  const startAdd = () => {
    setIsAdding(true)
    setFormData({ sku: '', name: '', category: '' })
  }

  const cancelForm = () => {
    setIsAdding(false)
    setEditingItem(null)
    setFormData({ sku: '', name: '', category: '' })
  }

  return (
    <div className="admin-panel">
      <header className="admin-header">
        <h2>Admin Panel</h2>
        <p>Manage inventory items</p>
      </header>

      <div className="search-bar">
        <Search size={20} />
        <input
          type="text"
          placeholder="Search items..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {(isAdding || editingItem) ? (
        <div className="item-form">
          <h3>{editingItem ? 'Edit Item' : 'Add New Item'}</h3>
          
          <div className="form-group">
            <label>SKU</label>
            <input
              type="text"
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              disabled={!!editingItem}
              placeholder="e.g., ABC-123"
            />
          </div>
          
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Item name"
            />
          </div>
          
          <div className="form-group">
            <label>Category (optional)</label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              placeholder="e.g., Electronics"
            />
          </div>

          <div className="form-actions">
            <button className="btn-secondary" onClick={cancelForm}>
              <X size={18} />
              Cancel
            </button>
            <button 
              className="btn-primary" 
              onClick={editingItem ? handleUpdate : handleAdd}
              disabled={!formData.sku.trim() || !formData.name.trim()}
            >
              <Check size={18} />
              {editingItem ? 'Update' : 'Add'} Item
            </button>
          </div>
        </div>
      ) : (
        <button className="btn-primary btn-add" onClick={startAdd}>
          <Plus size={20} />
          Add New Item
        </button>
      )}

      {loading ? (
        <div className="loading">Loading items...</div>
      ) : (
        <div className="items-table">
          {filteredItems.length === 0 ? (
            <p className="no-results">No items found.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map(item => (
                  <tr key={item.id}>
                    <td>{item.sku}</td>
                    <td>{item.name}</td>
                    <td>{item.category || '-'}</td>
                    <td className="actions">
                      <button className="btn-icon" onClick={() => startEdit(item)}>
                        <Edit2 size={16} />
                      </button>
                      <button className="btn-icon btn-delete" onClick={() => handleDelete(item.id)}>
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  )
}
