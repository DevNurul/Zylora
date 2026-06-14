import { useNavigate } from 'react-router-dom'
import HeroBanner from '../components/home/HeroBanner'
import CategoryGrid from '../components/home/CategoryGrid'
import FeaturedProducts from '../components/home/FeaturedProducts'
import ProductCard from '../components/product/ProductCard'
import { useProductList } from '../hooks/useProductList'

function NewArrivals() {
  const navigate = useNavigate()
  const products = useProductList('/products/new-arrivals').slice(0, 4)

  if (products.length === 0) return null

  return (
    <section className="px-4 md:px-8 lg:px-16 py-16">
      <div className="flex items-end justify-between mb-3">
        <h2 className="text-2xl md:text-3xl font-semibold">New Arrivals</h2>
        <button
          onClick={() => navigate('/products?filter=new')}
          className="hidden sm:block text-sm text-[#6B6B6B] hover:text-[#0A0A0A] transition-colors border-b border-transparent hover:border-[#0A0A0A] pb-0.5"
        >
          View All
        </button>
      </div>
      <div className="w-16 h-px bg-[#EE6B83] mb-10" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-10">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  )
}

export default function Home() {
  return (
    <div>

      <HeroBanner />
      <FeaturedProducts />
      <CategoryGrid />
      <NewArrivals />
    </div>
  )
}
