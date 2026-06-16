import { useNavigate } from 'react-router-dom'
import HeroBanner from '../components/home/HeroBanner'
import CategoryGrid from '../components/home/CategoryGrid'
import FeaturedProducts from '../components/home/FeaturedProducts'
import ProductCard from '../components/product/ProductCard'
import { useProductList } from '../hooks/useProductList'
import { 
  ShieldCheck, 
  Award, 
  Sparkles, 
  Truck, 
  RotateCcw, 
  CheckSquare,
  ArrowRight
} from 'lucide-react'
import { formatPrice } from '../utils/formatPrice'

const TRUST_ITEMS = [
  { icon: Award, title: '925 Hallmarked', desc: 'Certified silver authenticity' },
  { icon: ShieldCheck, title: 'Premium Quality', desc: 'Handcrafted luxury checks' },
  { icon: Sparkles, title: 'Lifetime Plating', desc: 'Guaranteed shine & finish' },
  { icon: Truck, title: 'Free Shipping', desc: 'On orders above ₹999' },
  { icon: RotateCcw, title: 'Easy Returns', desc: '30-day hassle-free policy' },
  { icon: CheckSquare, title: 'Warranty Coverage', desc: '6 months warranty included' },
]

function TrustSection() {
  return (
    <section className="px-4 md:px-8 lg:px-16 py-12 md:py-10 md:py-20 bg-[#0A0A0A]">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
        {TRUST_ITEMS.map((item, idx) => {
          const Icon = item.icon
          return (
            <div 
              key={idx} 
              className="bg-[#141414] border border-[#242424] rounded-2xl p-6 text-center flex flex-col items-center justify-center space-y-4 transition-all duration-500 hover:border-[#B8976A]/30 hover:shadow-[0_0_30px_rgba(201,168,106,0.08)] group"
            >
              <div className="p-3 bg-[#B8976A]/5 text-[#B8976A] rounded-xl transition-all duration-500 group-hover:scale-110 group-hover:bg-[#B8976A]/10 group-hover:shadow-[0_0_20px_rgba(201,168,106,0.15)]">
                <Icon size={22} className="stroke-[1.5]" />
              </div>
              <div>
                <h4 className="text-[11px] font-semibold text-white tracking-[0.1em] uppercase">{item.title}</h4>
                <p className="text-[10px] text-[#5C5C5C] mt-1.5 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

function BestSellers() {
  const navigate = useNavigate()
  const products = useProductList('/products/featured')

  if (products.length === 0) return null

  return (
    <section className="px-4 md:px-8 lg:px-16 py-12 md:py-10 md:py-20 bg-[#0A0A0A] overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-4">
        <div>
          <p className="text-[10px] font-medium text-[#B8976A] tracking-[0.22em] uppercase mb-3">MOST LOVED ITEMS</p>
          <h2 className="font-serif text-3xl md:text-4xl lg:text-[2.75rem] text-white font-light">Best Sellers</h2>
        </div>
        <button 
          onClick={() => navigate('/products')}
          className="text-xs uppercase font-medium tracking-[0.12em] text-[#B8976A] hover:text-[#E8A0B0] transition-colors flex items-center gap-2 cursor-pointer group"
        >
          Explore More 
          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Horizontal Scroll List */}
      <div className="flex gap-6 overflow-x-auto no-scrollbar scroll-smooth pb-4 snap-x">
        {products.slice(0, 6).map((product) => {
          const discountPct = product.originalPrice && product.originalPrice > product.price
            ? Math.round((1 - product.price / product.originalPrice) * 100)
            : 0

          return (
            <div 
              key={product.id}
              onClick={() => navigate(`/products/${product.id}`)}
              className="flex-shrink-0 w-[260px] sm:w-[300px] snap-start group cursor-pointer"
            >
              {/* Product Large Image Container */}
              <div className="relative aspect-[3/4] bg-[#141414] border border-[#242424] rounded-2xl overflow-hidden mb-5 transition-all duration-500 group-hover:border-[#B8976A]/30 group-hover:shadow-[0_0_40px_rgba(201,168,106,0.1)]">
                <img 
                  src={product.images?.[0]} 
                  alt={product.name} 
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                />
                {discountPct > 0 && (
                  <span className="absolute top-4 left-4 bg-gradient-to-r from-[#E8A0B0] to-[#D48A9A] text-white text-[9px] uppercase font-semibold tracking-wider px-3 py-1 rounded-full">
                    {discountPct}% OFF
                  </span>
                )}
                {/* Minimal Overlay Info */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-end p-6">
                  <p className="text-[10px] uppercase font-medium tracking-[0.18em] text-[#B8976A]">View Product</p>
                </div>
              </div>
              {/* Minimalist details */}
              <h3 className="text-sm font-normal text-white font-sans truncate tracking-normal">{product.name}</h3>
              <div className="flex items-center gap-2.5 mt-1.5">
                <span className="text-sm font-semibold text-white">{formatPrice(product.price)}</span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-xs text-[#5C5C5C] line-through">{formatPrice(product.originalPrice)}</span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

function PromotionalBanner() {
  const navigate = useNavigate()
  return (
    <section className="relative overflow-hidden select-none">
      {/* Pink accent background */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#EE6B83] via-[#D48A9A] to-[#E8A0B0]" />
      
      {/* Decorative patterns */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-1/3 -translate-y-1/3 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-black/5 rounded-full -translate-x-1/3 translate-y-1/3 blur-3xl pointer-events-none" />
      
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />

      <div className="relative z-10 px-6 md:px-12 py-14 md:py-32">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 border border-white/20 rounded-full backdrop-blur-sm">
            <Sparkles size={12} className="text-white" />
            <p className="text-[9px] font-medium uppercase tracking-[0.22em] leading-none">Wedding &amp; Festival Exclusive</p>
          </div>
          <h2 className="font-serif text-4xl sm:text-5xl md:text-[3.5rem] text-white leading-tight font-light">
            Celebrate Love With <br className="hidden sm:inline" />
            <span className="text-[#0A0A0A]">Flat 15% Off</span>
          </h2>
          <p className="text-sm md:text-base font-light tracking-normal max-w-lg mx-auto text-white/80 leading-relaxed">
            Discover intricately crafted diamond rings, heritage choker necklaces, and matching earrings designed to reflect your style.
          </p>
          <div className="flex justify-center pt-4">
            <button 
              onClick={() => navigate('/products?collection=Wedding')} 
              className="bg-[#0A0A0A] text-white hover:bg-[#141414] px-7 md:px-10 py-4 rounded-xl text-xs uppercase font-medium tracking-[0.18em] transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.3)] active:scale-[0.98] cursor-pointer"
            >
              Shop Collection
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

function NewArrivals() {
  const navigate = useNavigate()
  const products = useProductList('/products/new-arrivals').slice(0, 4)

  if (products.length === 0) return null

  return (
    <section className="px-4 md:px-8 lg:px-16 py-12 md:py-10 md:py-20 bg-[#0A0A0A]">
      {/* Header */}
      <div className="flex flex-col items-center text-center mb-14">
        <p className="text-[10px] font-medium text-[#B8976A] tracking-[0.22em] uppercase mb-3">RECENTLY RELEASED</p>
        <h2 className="font-serif text-3xl md:text-4xl lg:text-[2.75rem] text-white font-light">New Arrivals</h2>
        <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-[#B8976A] to-transparent mt-5" />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* View All */}
      <div className="mt-16 text-center">
        <button
          onClick={() => navigate('/products?filter=new')}
          className="border border-[#B8976A]/30 text-[#B8976A] hover:bg-[#B8976A]/10 hover:border-[#B8976A] px-7 md:px-10 py-4 rounded-xl text-xs uppercase font-medium tracking-[0.18em] transition-all duration-300 active:scale-[0.98] cursor-pointer"
        >
          View New Arrivals
        </button>
      </div>
    </section>
  )
}

export default function Home() {
  return (
    <div className="bg-[#0A0A0A] min-h-screen">
      <HeroBanner />
      <TrustSection />
      <FeaturedProducts />
      <CategoryGrid />
      <PromotionalBanner />
      <BestSellers />
      <NewArrivals />
    </div>
  )
}
