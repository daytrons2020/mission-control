import { useState, useEffect } from 'react'

function ItemModal({ item, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    category: ''
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (item) {
      setFormData({
        sku: item.sku || '',
        name: item.name || '',
        category: item.category || ''
      })
    }
  }, [item])

  const validate = () => {
    const newErrors = {}
    if (!formData.sku.trim()) newErrors.sku = 'SKU is required'
    if (!formData.name.trim()) newErrors.name = 'Name is required'
    if (!formData.category.trim()) newErrors.category = 'Category is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validate()) {
      onSubmit(formData)
    }
  }

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
    if (errors[e.target.name]) {
      setErrors(prev => ({ ...prev, [e.target.name]: null }))
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{item ? 'Edit Item' : 'Add New Item'}</h2>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label htmlFor="sku">SKU *</label>
              <input
                type="text"
                id="sku"
                name="sku"
                className="form-control"
                value={formData.sku}
                onChange={handleChange}
                placeholder="e.g., PROD-001"
              />
              {errors.sku && <span style={{ color: '#dc3545', fontSize: '12px' }}>{errors.sku}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="name">Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                className="form-control"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Widget Pro"
              />
              {errors.name && <span style={{ color: '#dc3545', fontSize: '12px' }}>{errors.name}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="category">Category *</label>
              <input
                type="text"
                id="category"
                name="category"
                className="form-control"
                value={formData.category}
                onChange={handleChange}
                placeholder="e.g., Electronics"
                list="categories"
              />
              <datalist id="categories">
                <option value="Electronics" />
                <option value="Clothing" />
                <option value="Food & Beverage" />
                <option value="Office Supplies" />
                <option value="Tools" />
                <option value="Other" />
              </datalist>
              {errors.category && <span style={{ color: '#dc3545', fontSize: '12px' }}>{errors.category}</span>}
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {item ? 'Update' : 'Add'} Item
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ItemModal