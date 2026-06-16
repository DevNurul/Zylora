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
  ArrowRight,
  TrendingUp
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
    <section className="px-4 md:px-8 lg:px-16 py-16 bg-[#0D0D0D] border-t border-[#2A2A2A]">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        {TRUST_ITEMS.map((item, idx) => {
          const Icon = item.icon
          return (
            <div 
              key={idx} 
              className="bg-[#171717] border border-[#2A2A2A] rounded-2xl p-5 text-center flex flex-col items-center justify-center space-y-3 transition-all duration-300 hover:border-[#C9A86A] hover:shadow-[0_0_15px_rgba(201,168,106,0.12)] group"
            >
              <div className="p-3 bg-white/5 text-[#C9A86A] rounded-xl transition-all duration-300 group-hover:scale-105 group-hover:bg-[#C9A86A]/10">
                <Icon size={20} className="stroke-[2]" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-white tracking-wider uppercase">{item.title}</h4>
                <p className="text-[10px] text-[#B3B3B3] mt-1 leading-normal">{item.desc}</p>
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
  // Fetch products and treat them as best sellers
  const products = useProductList('/products/featured')

  if (products.length === 0) return null

  return (
    <section className="px-4 md:px-8 lg:px-16 py-20 bg-[#0D0D0D] overflow-hidden border-t border-[#2A2A2A]">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
        <div>
          <p className="text-[10px] font-bold text-[#C9A86A] tracking-[0.25em] uppercase mb-2">MOST LOVED ITEMS</p>
          <h2 className="text-3xl md:text-4xl font-light text-white tracking-wide font-serif">Best Sellers</h2>
        </div>
        <button 
          onClick={() => navigate('/products')}
          className="text-xs uppercase font-bold text-[#C9A86A] hover:text-[#EE6B83] transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          Explore More <ArrowRight size={14} />
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
              className="flex-shrink-0 w-[240px] sm:w-[280px] snap-start group cursor-pointer"
            >
              {/* Product Large Image Container */}
              <div className="relative aspect-[3/4] bg-[#171717] border border-[#2A2A2A] rounded-2xl overflow-hidden mb-4 transition-all duration-300 group-hover:border-[#C9A86A] group-hover:shadow-[0_0_20px_rgba(201,168,106,0.15)]">
                <img 
                  src={product.images?.[0]} 
                  alt={product.name} 
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                {discountPct > 0 && (
                  <span className="absolute top-3 left-3 bg-[#EE6B83] text-white text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full">
                    {discountPct}% OFF
                  </span>
                )}
                {/* Minimal Overlay Info */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end p-4">
                  <p className="text-[10px] uppercase font-bold tracking-widest text-[#C9A86A]">View Product</p>
                </div>
              </div>
              {/* Minimalist details */}
              <h3 className="text-sm font-light text-white font-sans truncate tracking-wide">{product.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm font-bold text-white">{formatPrice(product.price)}</span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-xs text-[#B3B3B3] line-through">{formatPrice(product.originalPrice)}</span>
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
    <section className="px-6 md:px-12 py-20 bg-[#EE6B83] text-white relative overflow-hidden select-none">
      {/* Decorative patterns */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-black/10 rounded-full translate-x-1/3 -translate-y-1/3 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/10 rounded-full -translate-x-1/3 translate-y-1/3 blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 border border-white/20 rounded-full">
          <Sparkles size={12} className="text-white" />
          <p className="text-[9px] font-bold uppercase tracking-[0.25em] leading-none">Wedding &amp; Festival Exclusive</p>
        </div>
        <h2 className="text-4xl sm:text-5xl font-light font-serif tracking-wide leading-tight">
          Celebrate Love With <br className="hidden sm:inline" />
          <span className="font-semibold text-black">Flat 15% Off</span>
        </h2>
        <p className="text-xs sm:text-sm font-light tracking-wide max-w-lg mx-auto text-white/90 leading-relaxed">
          Discover intricately crafted diamond rings, heritage choker necklaces, and matching earrings designed to reflect your style.
        </p>
        <div className="flex justify-center pt-2">
          <button 
            onClick={() => navigate('/products?collection=Wedding')} 
            className="bg-black text-white hover:bg-black/90 px-8 py-3.5 rounded-lg text-[10px] uppercase font-bold tracking-widest transition-all duration-300 hover:shadow-lg hover:shadow-black/20 active:scale-[0.98] cursor-pointer"
          >
            Shop Collection
          </button>
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
    <section className="px-4 md:px-8 lg:px-16 py-20 bg-[#0D0D0D] border-t border-[#2A2A2A]">
      {/* Header */}
      <div className="flex flex-col items-center text-center mb-12">
        <p className="text-[10px] font-bold text-[#C9A86A] tracking-[0.25em] uppercase mb-2">RECENTLY RELEASED</p>
        <h2 className="text-3xl md:text-4xl font-light text-white tracking-wide font-serif">New Arrivals</h2>
        <div className="w-12 h-[1px] bg-[#EE6B83] mt-4" />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* View All */}
      <div className="mt-16 text-center">
        <button
          onClick={() => navigate('/products?filter=new')}
          className="border border-[#C9A86A] text-[#C9A86A] hover:bg-[#C9A86A]/10 px-10 py-3.5 rounded-lg text-[10px] uppercase font-bold tracking-widest transition-all duration-300 active:scale-[0.98] cursor-pointer"
        >
          View New Arrivals
        </button>
      </div>
    </section>
  )
}

export default function Home() {
  return (
    <div className="bg-[#0D0D0D] min-h-screen">
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
