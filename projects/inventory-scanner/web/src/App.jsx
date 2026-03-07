import { useState, useEffect } from 'react'
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore'
import { db } from './firebase'
import ItemModal from './components/ItemModal'
import './App.css'

function App() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'items'),
      (snapshot) => {
        const itemsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        setItems(itemsData)
        setLoading(false)
      },
      (err) => {
        setError('Failed to load items: ' + err.message)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [])

  const filteredItems = items.filter(item =>
    item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAddItem = async (itemData) => {
    try {
      await addDoc(collection(db, 'items'), {
        ...itemData,
        createdAt: new Date()
      })
      setIsModalOpen(false)
    } catch (err) {
      setError('Failed to add item: ' + err.message)
    }
  }

  const handleUpdateItem = async (itemData) => {
    try {
      const itemRef = doc(db, 'items', editingItem.id)
      await updateDoc(itemRef, itemData)
      setEditingItem(null)
      setIsModalOpen(false)
    } catch (err) {
      setError('Failed to update item: ' + err.message)
    }
  }

  const handleDeleteItem = async (itemId) => {
    if (!confirm('Are you sure you want to delete this item?')) return
    
    try {
      await deleteDoc(doc(db, 'items', itemId))
    } catch (err) {
      setError('Failed to delete item: ' + err.message)
    }
  }

  const openAddModal = () => {
    setEditingItem(null)
    setIsModalOpen(true)
  }

  const openEditModal = (item) => {
    setEditingItem(item)
    setIsModalOpen(true)
  }

  return (
    <div>
      <header>
        <div className="container">
          <h1>📦 Inventory Admin</h1>
        </div>
      </header>

      <div className="container">
        {error && (
          <div className="error">
            {error}
            <button onClick={() => setError(null)} style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer' }}>×</button>
          </div>
        )}

        <div className="card">
          <div className="toolbar">
            <input
              type="text"
              placeholder="Search items..."
              className="search-box"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="btn btn-primary" onClick={openAddModal}>
              <span>+</span> Add Item
            </button>
          </div>

          {loading ? (
            <div className="loading">Loading items...</div>
          ) : filteredItems.length === 0 ? (
            <div className="empty-state">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
              </svg>
              <p>{searchTerm ? 'No items match your search' : 'No items yet. Add your first item!'}</p>
            </div>
          ) : (
            <div className="table-container">
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
                      <td><code>{item.sku}</code></td>
                      <td>{item.name}</td>
                      <td><span className="badge badge-gray">{item.category}</span></td>
                      <td>
                        <div className="actions">
                          <button 
                            className="btn btn-secondary btn-sm"
                            onClick={() => openEditModal(item)}
                          >
                            Edit
                          </button>
                          <button 
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDeleteItem(item.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card" style={{ marginTop: '20px' }}>
          <h3 style={{ marginBottom: '12px', fontSize: '16px' }}>Statistics</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '20px' }}>
            <div>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#1a73e8' }}>{items.length}</div>
              <div style={{ color: '#666', fontSize: '14px' }}>Total Items</div>
            </div>
            <div>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#1a73e8' }}>
                {new Set(items.map(i => i.category)).size}
              </div>
              <div style={{ color: '#666', fontSize: '14px' }}>Categories</div>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <ItemModal
          item={editingItem}
          onClose={() => {
            setIsModalOpen(false)
            setEditingItem(null)
          }}
          onSubmit={editingItem ? handleUpdateItem : handleAddItem}
        />
      )}
    </div>
  )
}

export default App