import { useEffect, useState } from 'react'
import api, { normalizeProduct } from '../utils/api'

export function useProductList(endpoint) {
  const [products, setProducts] = useState([])

  useEffect(() => {
    api.get(endpoint)
      .then(({ data }) => setProducts(data.products.map(normalizeProduct)))
      .catch(() => {})
  }, [endpoint])

  return products
}
