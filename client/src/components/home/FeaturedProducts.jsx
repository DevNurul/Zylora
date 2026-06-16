import { useNavigate } from 'react-router-dom'
import ProductCard from '../product/ProductCard'
import { useProductList } from '../../hooks/useProductList'

export default function FeaturedProducts() {
  const navigate = useNavigate()
  const products = useProductList('/products/featured')

  if (products.length === 0) return null

  return (
    <section className="px-4 md:px-8 lg:px-16 py-12 md:py-10 md:py-20 bg-[#0A0A0A]">
      {/* Header */}
      <div className="flex flex-col items-center text-center mb-14">
        <p className="text-[10px] font-medium text-[#B8976A] tracking-[0.24em] uppercase mb-3">DISCOVER THE BEST</p>
        <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-white">Featured Collection</h2>
        <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-[#B8976A] to-transparent mt-5" />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
        {products.slice(0, 8).map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* CTA Button */}
      <div className="mt-16 text-center">
        <button
          onClick={() => navigate('/products')}
          className="border border-[#B8976A]/30 text-[#B8976A] hover:bg-[#B8976A]/10 hover:border-[#B8976A] px-7 md:px-10 py-4 rounded-xl text-xs uppercase font-medium tracking-[0.18em] transition-all duration-300 active:scale-[0.98] cursor-pointer"
        >
          View All Collections
        </button>
      </div>
    </section>
  )
}
