import { useState, useEffect } from 'react'
import { subscribeToItems, getItemBySKU } from '../firebase'

export function useItems() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    const unsubscribe = subscribeToItems((itemsData) => {
      setItems(itemsData)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const lookupItem = async (sku) => {
    try {
      const item = await getItemBySKU(sku)
      return item
    } catch (err) {
      setError(err.message)
      return null
    }
  }

  return { items, loading, error, lookupItem }
}
