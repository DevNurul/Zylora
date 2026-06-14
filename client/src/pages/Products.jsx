import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SlidersHorizontal, X } from 'lucide-react'
import ProductFilters from '../components/product/ProductFilters'
import ProductGrid from '../components/product/ProductGrid'
import { useProducts } from '../hooks/useProducts'
import api, { normalizeProduct } from '../utils/api'

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams()
  const {
    filtered, loading,
    setProducts, setCategory, setSearch, setSortBy, clearFilters, setLoading,
  } = useProducts()
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [initialized, setInitialized] = useState(false)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    api.get('/products', { params: { limit: 50 } })
      .then(({ data }) => {
        if (cancelled) return
        setProducts(data.products.map(normalizeProduct))
        setTotal(data.total)
        setInitialized(true)
      })
      .catch(() => { if (!cancelled) setLoading(false) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (!initialized) return
    const cat = searchParams.get('category')
    const search = searchParams.get('search')
    clearFilters()
    if (cat) {
      if (cat === 'sale') setSortBy('sale')
      else setCategory(cat)
    }
    if (search) setSearch(search)
  }, [searchParams, initialized])

  const searchQuery = searchParams.get('search') || ''

  const handleClearSearch = () => {
    const next = new URLSearchParams(searchParams)
    next.delete('search')
    setSearchParams(next)
  }

  const title = searchQuery
    ? null
    : searchParams.get('category') === 'sale'
      ? 'Sale'
      : searchParams.get('category') || 'All Products'

  return (
    <div className="min-h-screen">
      <div className="px-4 md:px-8 lg:px-16 py-10 border-b border-gray-100">
        {searchQuery ? (
          <div>
            <h1 className="font-didot text-2xl md:text-3xl">
              Results for '{searchQuery}'
            </h1>
            <button
              onClick={handleClearSearch}
              className="mt-2 inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-[#6B6B6B] hover:text-[#0A0A0A] transition-colors"
            >
              <X size={12} />
              Clear search
            </button>
          </div>
        ) : (
          <h1 className="text-2xl md:text-3xl font-semibold">{title}</h1>
        )}
      </div>

      <div className="flex gap-10 px-4 md:px-8 lg:px-16 py-10">
        {/* Sidebar */}
        <aside className="hidden lg:block w-52 flex-shrink-0 sticky top-24 self-start">
          <ProductFilters />
        </aside>

        {/* Products */}
        <main className="flex-1 min-w-0">
          {/* Mobile filter button */}
          <div className="lg:hidden mb-6">
            <button
              onClick={() => setFiltersOpen(true)}
              className="flex items-center gap-2 border border-gray-200 px-5 py-2.5 text-[12px] uppercase tracking-[0.08em] hover:border-[#0A0A0A] hover:text-[#0A0A0A] transition-colors"
            >
              <SlidersHorizontal size={14} />
              Filter & Sort
            </button>
          </div>

          <ProductGrid products={filtered} loading={loading} total={total} />
        </main>
      </div>

      {/* Mobile filter drawer */}
      {filtersOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setFiltersOpen(false)} />
          <div className="relative ml-auto w-[min(300px,88vw)] h-full bg-white overflow-y-auto p-7 shadow-2xl">
            <ProductFilters onClose={() => setFiltersOpen(false)} />
          </div>
        </div>
      )}
    </div>
  )
}
