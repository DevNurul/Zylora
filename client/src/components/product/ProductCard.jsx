import { useState } from 'react'
import { Heart } from 'lucide-react'
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
      className="group cursor-pointer"
      onMouseLeave={() => { setShowSizes(false); setSelectedSize('') }}
      onClick={() => navigate(`/products/${product.id}`)}
    >
      {/* Image */}
      <div className="relative overflow-hidden bg-[#FCD4DB] aspect-[3/4]">
        <img
          src={product.images?.[0]}
          alt={product.name}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
        />
        {product.images?.[1] && (
          <img
            src={product.images[1]}
            alt={product.name}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          />
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
          {!product.inStock && (
            <span className="bg-gray-500 text-white text-[10px] uppercase tracking-[0.1em] px-2 py-0.5 leading-5">Sold Out</span>
          )}
          {product.inStock && product.isNew && (
            <span className="bg-[#0A0A0A] text-white text-[10px] uppercase tracking-[0.1em] px-2 py-0.5 leading-5">New</span>
          )}
          {product.isSale && (
            <span className="bg-[#EE6B83] text-white text-[10px] uppercase tracking-[0.1em] px-2 py-0.5 leading-5">Sale</span>
          )}
        </div>

        {/* Wishlist */}
        <button
          className="absolute top-3 right-3 z-10 p-2 bg-white/90 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 active:scale-95"
          onClick={(e) => { e.stopPropagation(); toggle(product) }}
          aria-label={liked ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart
            size={15}
            className={liked ? 'fill-red-500 stroke-red-500' : 'stroke-[#0A0A0A] fill-transparent'}
          />
        </button>

        {/* Quick Add panel */}
        <div
          className="absolute bottom-0 inset-x-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-10"
          onClick={(e) => e.stopPropagation()}
        >
          {!product.inStock ? (
            <div className="w-full bg-gray-100 text-gray-400 text-[11px] py-3 text-center uppercase tracking-[0.12em]">
              Out of Stock
            </div>
          ) : showSizes && product.sizes?.length > 0 ? (
            <div className="bg-white p-3">
              <div className="flex gap-1.5 flex-wrap justify-center mb-2.5">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(s)}
                    className={`min-w-[36px] h-8 px-2 text-[11px] uppercase tracking-wide border transition-all duration-150 rounded-lg ${
                      selectedSize === s
                        ? 'bg-[#EE6B83] text-white border-[#EE6B83]'
                        : 'border-gray-200 text-[#0A0A0A] hover:border-[#EE6B83]'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <button
                onClick={handleQuickAdd}
                className="w-full bg-[#EE6B83] text-white text-[11px] py-2.5 uppercase tracking-[0.12em] hover:bg-[#D9506A] transition-colors rounded-lg"
              >
                Add to Bag
              </button>
            </div>
          ) : (
            <button
              onClick={handleQuickAdd}
              className="w-full bg-[#EE6B83]/90 backdrop-blur-sm text-white text-[11px] py-3 uppercase tracking-[0.12em] hover:bg-[#D9506A] transition-all duration-200 rounded-lg"
            >
              Quick Add
            </button>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="pt-4 space-y-1">
        <p className="text-[11px] uppercase tracking-[0.08em] text-[#6B6B6B]">{product.category}</p>
        <h3 className="text-[15px] font-medium text-[#0A0A0A] leading-snug line-clamp-1">{product.name}</h3>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[15px] font-semibold">{formatPrice(product.price)}</span>
          {product.originalPrice && product.originalPrice > product.price && (
            <>
              <span className="text-[13px] text-[#9CA3AF] line-through">{formatPrice(product.originalPrice)}</span>
              {discountPct > 0 && (
                <span className="text-[11px] text-red-500 font-medium">{discountPct}% off</span>
              )}
            </>
          )}
        </div>
        {product.colors?.length > 0 && (
          <div className="flex gap-1.5 pt-1">
            {product.colors.slice(0, 5).map((color) => (
              <div
                key={color}
                title={color}
                className="w-4 h-4 rounded-full"
                style={{
                  backgroundColor: COLOR_MAP[color] || '#ccc',
                  border: color === 'White' ? '1px solid #ddd' : '1px solid rgba(0,0,0,0.08)',
                  outline: '1.5px solid transparent',
                  outlineOffset: '1px',
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
