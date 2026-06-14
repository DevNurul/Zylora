import { useNavigate } from 'react-router-dom'
import ProductCard from '../product/ProductCard'
import { useProductList } from '../../hooks/useProductList'

export default function FeaturedProducts() {
  const navigate = useNavigate()
  const products = useProductList('/products/featured')

  if (products.length === 0) return null

  return (
    <section className="px-4 md:px-8 lg:px-16 py-16 bg-[#FAFAF9]">
      <div className="flex items-end justify-between mb-3">
        <h2 className="text-2xl md:text-3xl font-semibold">Featured Collection</h2>
        <button
          onClick={() => navigate('/products')}
          className="hidden sm:block text-sm text-[#6B6B6B] hover:text-[#0A0A0A] transition-colors border-b border-transparent hover:border-[#0A0A0A] pb-0.5"
        >
          View All
        </button>
      </div>
      <div className="w-16 h-px bg-[#EE6B83] mb-10" />

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10">
        {products.slice(0, 8).map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      <div className="sm:hidden mt-8 text-center">
        <button
          onClick={() => navigate('/products')}
          className="text-sm border border-[#EE6B83] text-[#EE6B83] px-8 py-3 hover:bg-[#FCD4DB] hover:text-[#EE6B83] transition-colors rounded-lg"
        >
          View All Products
        </button>
      </div>
    </section>
  )
}
