import { useDispatch, useSelector } from 'react-redux'
import {
  setProducts, setCategory, setSearch, setSortBy,
  setPriceRange, toggleSize, toggleColor, clearFilters, setLoading,
} from '../store/slices/productSlice'

export const useProducts = () => {
  const dispatch = useDispatch()
  const state = useSelector((s) => s.product)

  return {
    ...state,
    setProducts: (products) => dispatch(setProducts(products)),
    setCategory: (cat) => dispatch(setCategory(cat)),
    setSearch: (query) => dispatch(setSearch(query)),
    setSortBy: (sort) => dispatch(setSortBy(sort)),
    setPriceRange: (range) => dispatch(setPriceRange(range)),
    toggleSize: (size) => dispatch(toggleSize(size)),
    toggleColor: (color) => dispatch(toggleColor(color)),
    clearFilters: () => dispatch(clearFilters()),
    setLoading: (val) => dispatch(setLoading(val)),
  }
}
