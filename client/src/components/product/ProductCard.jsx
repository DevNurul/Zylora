import { useState } from 'react'
import { Heart, Star, ShoppingBag } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { formatPrice } from '../../utils/formatPrice'
import { useCart } from '../../hooks/useCart'
import { useWishlist } from '../../hooks/useWishlist'
import toast from 'react-hot-toast'

const COLOR_MAP = {
  Black: '#0A0A0A',
  White: '#F0EDE8',
  Beige: '#C9A96E',
  Navy: '#1B2A4A',
  Red: '#DC2626',
  Blue: '#2563EB',
  Green: '#16A34A',
  Gray: '#9CA3AF',
  Brown: '#92400E',
  Pink: '#EC4899',
}

export default function ProductCard({ product }) {
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const { isLiked, toggle } = useWishlist()
  const [showSizes, setShowSizes] = useState(false)
  const [selectedSize, setSelectedSize] = useState('')

  const liked = isLiked(product.id)

  const discountPct = product.originalPrice && product.originalPrice > product.price
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0

  const handleQuickAdd = (e) => {
    e.stopPropagation()
    if (!product.inStock) return
    if (!product.sizes?.length) {
      addToCart({ id: product.id, name: product.name, price: product.price, image: product.images?.[0], size: 'One Size', color: product.colors?.[0] || '', qty: 1 })
      toast.success('Added to bag')
      return
    }
    if (!showSizes) { setShowSizes(true); return }
    if (!selectedSize) { toast.error('Select a size'); return }
    addToCart({ id: product.id, name: product.name, price: product.price, image: product.images?.[0], size: selectedSize, color: product.colors?.[0] || '', qty: 1 })
    toast.success('Added to bag')
    setShowSizes(false)
    setSelectedSize('')
  }

  return (
    <div
      className="group bg-[#141414] border border-[#242424] hover:border-[#B8976A]/30 rounded-2xl p-3 flex flex-col justify-between transition-all duration-500 hover:shadow-[0_10px_40px_rgba(0,0,0,0.4)] hover:-translate-y-1 cursor-pointer select-none"
      onMouseLeave={() => { setShowSizes(false); setSelectedSize('') }}
      onClick={() => navigate(`/products/${product.id}`)}
    >
      <div>
        {/* Image Frame */}
        <div className="relative overflow-hidden bg-[#0A0A0A] rounded-xl aspect-[4/5] w-full">
          {product.images?.[0] ? (
            <img
              src={product.images[0]}
              alt={product.name}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-[#5C5C5C] bg-white/5"><ShoppingBag size={24} /></div>
          )}
          {product.images?.[1] && (
            <img
              src={product.images[1]}
              alt={product.name}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-700"
            />
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
            {!product.inStock && (
              <span className="bg-[#0A0A0A]/80 backdrop-blur-sm text-[#5C5C5C] text-[8px] uppercase tracking-[0.12em] font-semibold px-2.5 py-1 rounded-lg border border-[#242424]">
                Sold Out
              </span>
            )}
            {product.inStock && product.isNew && (
              <span className="bg-gradient-to-r from-[#B8976A] to-[#A88345] text-white text-[8px] uppercase tracking-[0.12em] font-semibold px-2.5 py-1 rounded-lg">
                New
              </span>
            )}
            {product.isSale && (
              <span className="bg-gradient-to-r from-[#EE6B83] to-[#D48A9A] text-white text-[8px] uppercase tracking-[0.12em] font-semibold px-2.5 py-1 rounded-lg">
                Sale
              </span>
            )}
          </div>

          {/* Wishlist Button */}
          <button
            className="absolute top-3 right-3 z-10 w-10 h-10 flex items-center justify-center bg-[#0A0A0A]/60 hover:bg-[#E8A0B0]/20 border border-white/10 hover:border-[#E8A0B0]/50 text-white rounded-xl backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 active:scale-95 cursor-pointer"
            onClick={(e) => { e.stopPropagation(); toggle(product) }}
            aria-label={liked ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart
              size={14}
              className={liked ? 'fill-[#E8A0B0] stroke-[#E8A0B0] animate-scale-in' : 'stroke-white fill-transparent'}
            />
          </button>

          {/* Quick Add Overlay */}
          <div
            className="absolute bottom-0 inset-x-0 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out z-10"
            onClick={(e) => e.stopPropagation()}
          >
            {!product.inStock ? (
              <div className="w-full bg-[#0A0A0A]/90 backdrop-blur-sm text-[#5C5C5C] text-[10px] py-3.5 text-center uppercase tracking-[0.15em] font-medium border-t border-[#242424]">
                Out of Stock
              </div>
            ) : showSizes && product.sizes?.length > 0 ? (
              <div className="bg-[#141414]/95 backdrop-blur-xl border-t border-[#242424] p-4">
                <div className="flex gap-1.5 flex-wrap justify-center mb-3">
                  {product.sizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(s)}
                      className={`min-w-[40px] h-10 px-2 text-[10px] uppercase tracking-wide border transition-all duration-300 rounded-lg font-medium cursor-pointer ${
                        selectedSize === s
                          ? 'bg-gradient-to-r from-[#B8976A] to-[#A88345] text-white border-transparent'
                          : 'border-[#242424] text-[#9A9A9A] hover:border-[#B8976A] hover:text-white'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleQuickAdd}
                  className="w-full bg-gradient-to-r from-[#E8A0B0] to-[#D48A9A] text-white text-[10px] py-2.5 uppercase tracking-[0.14em] font-medium transition-all rounded-lg cursor-pointer hover:shadow-[0_4px_20px_rgba(238,107,131,0.3)]"
                >
                  Add to Bag
                </button>
              </div>
            ) : (
              <button
                onClick={handleQuickAdd}
                className="w-full bg-gradient-to-r from-[#EE6B83] to-[#D48A9A] backdrop-blur-sm text-white text-[10px] py-3.5 uppercase tracking-[0.14em] font-medium transition-all duration-300 rounded-b-xl cursor-pointer hover:shadow-[0_4px_20px_rgba(238,107,131,0.3)]"
              >
                Quick Add
              </button>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="pt-3.5 space-y-1.5">
          <p className="text-[9px] uppercase tracking-[0.14em] font-medium text-[#B8976A]">{product.category}</p>
          <h3 className="text-[13px] font-normal text-white leading-snug line-clamp-1 font-sans">{product.name}</h3>
          
          {product.rating > 0 && (
            <div className="flex items-center gap-1">
              <Star size={10} className="fill-[#B8976A] stroke-[#B8976A]" />
              <span className="text-[10px] text-[#5C5C5C] font-medium">{product.rating}</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap mt-2.5">
        <span className="text-[13px] font-medium text-white">{formatPrice(product.price)}</span>
        {product.originalPrice && product.originalPrice > product.price && (
          <>
            <span className="text-[11px] text-[#5C5C5C] line-through font-light">{formatPrice(product.originalPrice)}</span>
            {discountPct > 0 && (
            <span className="text-[10px] text-[#E8A0B0] font-medium">{discountPct}% OFF</span>
            )}
          </>
        )}
      </div>
    </div>
  )
}
