import { useNavigate } from 'react-router-dom'
import ProductCard from '../product/ProductCard'
import { useProductList } from '../../hooks/useProductList'

export default function FeaturedProducts() {
  const navigate = useNavigate()
  const products = useProductList('/products/featured')

  if (products.length === 0) return null

  return (
    <section className="px-4 md:px-8 lg:px-16 py-20 bg-[#0D0D0D]">
      {/* Header */}
      <div className="flex flex-col items-center text-center mb-12">
        <p className="text-[10px] font-bold text-[#C9A86A] tracking-[0.25em] uppercase mb-2">DISCOVER THE BEST</p>
        <h2 className="text-3xl md:text-4xl font-light text-white tracking-wide font-serif">Featured Collection</h2>
        <div className="w-12 h-[1px] bg-[#EE6B83] mt-4" />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
        {products.slice(0, 8).map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* CTA Button */}
      <div className="mt-16 text-center">
        <button
          onClick={() => navigate('/products')}
          className="border border-[#C9A86A] text-[#C9A86A] hover:bg-[#C9A86A]/10 px-10 py-3.5 rounded-lg text-[10px] uppercase font-bold tracking-widest transition-all duration-300 active:scale-[0.98] cursor-pointer"
        >
          View All Collections
        </button>
      </div>
    </section>
  )
}
