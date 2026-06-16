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
      className="group bg-[#171717] border border-[#2A2A2A] hover:border-[#C9A86A] rounded-2xl p-3 flex flex-col justify-between transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.6)] hover:-translate-y-1 cursor-pointer select-none"
      onMouseLeave={() => { setShowSizes(false); setSelectedSize('') }}
      onClick={() => navigate(`/products/${product.id}`)}
    >
      <div>
        {/* Image Frame */}
        <div className="relative overflow-hidden bg-[#0D0D0D] rounded-xl aspect-[4/5] w-full">
          {product.images?.[0] ? (
            <img
              src={product.images[0]}
              alt={product.name}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-gray-600 bg-white/5"><ShoppingBag size={24} /></div>
          )}
          {product.images?.[1] && (
            <img
              src={product.images[1]}
              alt={product.name}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            />
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
            {!product.inStock && (
              <span className="bg-[#2A2A2A]/90 backdrop-blur-xs text-[#B3B3B3] text-[8px] uppercase tracking-[0.12em] font-extrabold px-2.5 py-1 rounded">
                Sold Out
              </span>
            )}
            {product.inStock && product.isNew && (
              <span className="bg-[#C9A86A] text-[#0D0D0D] text-[8px] uppercase tracking-[0.12em] font-extrabold px-2.5 py-1 rounded">
                New
              </span>
            )}
            {product.isSale && (
              <span className="bg-[#EE6B83] text-white text-[8px] uppercase tracking-[0.12em] font-extrabold px-2.5 py-1 rounded">
                Sale
              </span>
            )}
          </div>

          {/* Wishlist Button */}
          <button
            className="absolute top-3 right-3 z-10 p-2 bg-[#0D0D0D]/60 hover:bg-[#EE6B83]/10 border border-white/10 hover:border-[#EE6B83] text-white rounded-xl backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-all duration-300 active:scale-95 cursor-pointer"
            onClick={(e) => { e.stopPropagation(); toggle(product) }}
            aria-label={liked ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart
              size={14}
              className={liked ? 'fill-red-500 stroke-red-500 animate-scale-in' : 'stroke-white fill-transparent'}
            />
          </button>

          {/* Quick Add Overlay */}
          <div
            className="absolute bottom-0 inset-x-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-10"
            onClick={(e) => e.stopPropagation()}
          >
            {!product.inStock ? (
              <div className="w-full bg-[#2A2A2A] text-white/50 text-[10px] py-3 text-center uppercase tracking-[0.15em] font-bold">
                Out of Stock
              </div>
            ) : showSizes && product.sizes?.length > 0 ? (
              <div className="bg-[#171717]/95 backdrop-blur-md border-t border-[#2A2A2A] p-3">
                <div className="flex gap-1.5 flex-wrap justify-center mb-2.5">
                  {product.sizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(s)}
                      className={`min-w-[34px] h-7 px-1.5 text-[10px] uppercase tracking-wide border transition-all duration-150 rounded-lg font-bold cursor-pointer ${
                        selectedSize === s
                          ? 'bg-[#EE6B83] text-white border-[#EE6B83]'
                          : 'border-[#2A2A2A] text-[#B3B3B3] hover:border-[#EE6B83] hover:text-white'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleQuickAdd}
                  className="w-full bg-[#EE6B83] hover:bg-[#D9506A] text-white text-[10px] py-2 uppercase tracking-[0.15em] font-bold transition-colors rounded-lg cursor-pointer"
                >
                  Add to Bag
                </button>
              </div>
            ) : (
              <button
                onClick={handleQuickAdd}
                className="w-full bg-[#EE6B83]/90 backdrop-blur-md text-white text-[10px] py-3.5 uppercase tracking-[0.15em] font-bold hover:bg-[#D9506A] transition-all duration-200 rounded-b-xl cursor-pointer"
              >
                Quick Add
              </button>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="pt-3.5 space-y-1">
          <p className="text-[9px] uppercase tracking-[0.15em] font-bold text-[#C9A86A]">{product.category}</p>
          <h3 className="text-sm font-light text-white leading-snug line-clamp-1 font-sans">{product.name}</h3>
          
          {product.rating > 0 && (
            <div className="flex items-center gap-1">
              <Star size={10} className="fill-[#C9A86A] stroke-[#C9A86A]" />
              <span className="text-[10px] text-[#B3B3B3] font-semibold">{product.rating}</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap mt-2">
        <span className="text-sm font-bold text-white">{formatPrice(product.price)}</span>
        {product.originalPrice && product.originalPrice > product.price && (
          <>
            <span className="text-xs text-[#B3B3B3] line-through font-light">{formatPrice(product.originalPrice)}</span>
            {discountPct > 0 && (
              <span className="text-[10px] text-[#EE6B83] font-bold">{discountPct}% OFF</span>
            )}
          </>
        )}
      </div>
    </div>
  )
}
