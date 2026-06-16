import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart, Trash2, Star, ShoppingBag } from 'lucide-react'
import { useWishlist } from '../hooks/useWishlist'
import { useCart } from '../hooks/useCart'
import { formatPrice } from '../utils/formatPrice'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

function Stars({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={11}
          className={n <= Math.round(rating) ? 'fill-[#B8976A] stroke-[#B8976A]' : 'stroke-[#242424] fill-[#141414]'}
        />
      ))}
    </div>
  )
}

function LikesCard({ product, onRemove }) {
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const [showSizes, setShowSizes]     = useState(false)
  const [selectedSize, setSelectedSize] = useState('')
  const [buyNowPending, setBuyNowPending] = useState(false)

  const hasSizes    = product.sizes?.length > 0
  const discountPct = product.originalPrice && product.originalPrice > product.price
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0

  const buildCartItem = (size) => ({
    id:    product.id || product._id,
    name:  product.name,
    price: product.price,
    image: product.images?.[0],
    size:  size || 'One Size',
    color: product.colors?.[0] || '',
    qty:   1,
  })

  const handleAddToBag = (e) => {
    e.stopPropagation()
    if (!product.inStock) return

    if (hasSizes) {
      if (!showSizes) {
        setShowSizes(true)
        return
      }
      if (!selectedSize) {
        toast.error('Please select a size')
        return
      }
      addToCart(buildCartItem(selectedSize))
      toast.success('Added to bag')
      setShowSizes(false)
      setSelectedSize('')
      return
    }

    addToCart(buildCartItem('One Size'))
    toast.success('Added to bag')
  }

  const handleBuyNow = (e) => {
    e.stopPropagation()
    if (!product.inStock) return

    if (hasSizes && !selectedSize) {
      setShowSizes(true)
      setBuyNowPending(true)
      toast.error('Please select a size first')
      return
    }

    addToCart(buildCartItem(selectedSize))
    navigate('/checkout')
  }

  const handleSizeSelect = (size) => {
    setSelectedSize(size)
    if (buyNowPending) {
      addToCart(buildCartItem(size))
      navigate('/checkout')
    }
  }

  return (
    <div className="group">
      {/* Image */}
      <div
        className="relative overflow-hidden bg-[#141414] border border-[#242424] aspect-[3/4] rounded-2xl cursor-pointer"
        onClick={() => navigate(`/products/${product.id || product._id}`)}
      >
        <img
          src={product.images?.[0]}
          alt={product.name}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
        />
        {product.images?.[1] && (
          <img
            src={product.images[1]}
            alt={product.name}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-700"
          />
        )}

        {/* Status badge */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
          {!product.inStock && (
            <span className="bg-[#0A0A0A]/80 backdrop-blur-sm text-[#5C5C5C] text-[8px] uppercase tracking-[0.12em] px-2.5 py-1 rounded-lg border border-[#242424]">
              Out of Stock
            </span>
          )}
          {product.inStock && product.isNew && (
            <span className="bg-gradient-to-r from-[#B8976A] to-[#A88345] text-white text-[8px] uppercase tracking-[0.12em] px-2.5 py-1 rounded-lg">
              New
            </span>
          )}
          {product.isSale && (
            <span className="bg-gradient-to-r from-[#E8A0B0] to-[#D48A9A] text-white text-[8px] uppercase tracking-[0.12em] px-2.5 py-1 rounded-lg">
              Sale
            </span>
          )}
        </div>

        {/* Remove button */}
        <button
          className="absolute top-3 right-3 z-10 w-10 h-10 flex items-center justify-center bg-[#0A0A0A]/60 hover:bg-[#E8A0B0]/20 border border-white/10 hover:border-[#E8A0B0]/50 rounded-xl backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 active:scale-95"
          onClick={(e) => { e.stopPropagation(); onRemove(product.id || product._id) }}
          aria-label="Remove from wishlist"
          title="Remove from wishlist"
        >
          <Trash2 size={14} className="text-[#5C5C5C] hover:text-[#E8A0B0] transition-colors" />
        </button>
      </div>

      {/* Info */}
      <div
        className="pt-3 pb-1 space-y-1.5 cursor-pointer"
        onClick={() => navigate(`/products/${product.id || product._id}`)}
      >
        <p className="text-[9px] uppercase tracking-[0.14em] text-[#B8976A] font-medium">{product.category}</p>
        <h3 className="text-sm font-medium text-white leading-snug line-clamp-2">{product.name}</h3>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-white">{formatPrice(product.price)}</span>
          {product.originalPrice && product.originalPrice > product.price && (
            <>
              <span className="text-xs text-[#5C5C5C] line-through">{formatPrice(product.originalPrice)}</span>
              {discountPct > 0 && (
                <span className="text-[10px] text-[#E8A0B0] font-medium">{discountPct}% OFF</span>
              )}
            </>
          )}
        </div>
        {product.rating > 0 && (
          <div className="flex items-center gap-1.5">
            <Stars rating={product.rating} />
            {product.reviewCount > 0 && (
              <span className="text-[10px] text-[#5C5C5C]">({product.reviewCount})</span>
            )}
          </div>
        )}
      </div>

      {/* Inline size picker */}
      {showSizes && hasSizes && (
        <div className="pt-2" onClick={(e) => e.stopPropagation()}>
          <p className="text-[10px] text-[#5C5C5C] mb-1.5 uppercase tracking-[0.08em]">Select size:</p>
          <div className="flex gap-1.5 flex-wrap">
            {product.sizes.map((s) => (
              <button
                key={s}
                onClick={() => handleSizeSelect(s)}
                className={`min-w-[40px] h-10 px-2 text-[10px] uppercase tracking-wide border transition-all duration-300 rounded-lg ${
                  selectedSize === s
                    ? 'bg-gradient-to-r from-[#B8976A] to-[#A88345] text-white border-transparent'
                    : 'border-[#242424] text-[#9A9A9A] hover:border-[#B8976A] hover:text-white'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="pt-3 flex gap-2" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={handleAddToBag}
          disabled={!product.inStock}
          className="flex-1 bg-gradient-to-r from-[#E8A0B0] to-[#D48A9A] text-white text-[10px] py-3 uppercase tracking-[0.1em] hover:shadow-[0_4px_20px_rgba(238,107,131,0.3)] transition-all disabled:opacity-40 disabled:cursor-not-allowed rounded-xl font-medium"
        >
          {showSizes && !selectedSize ? 'Select Size' : 'Add to Bag'}
        </button>
        <button
          onClick={handleBuyNow}
          disabled={!product.inStock}
          className="flex-1 border border-[#B8976A]/30 text-[#B8976A] text-[10px] py-3 uppercase tracking-[0.1em] hover:bg-[#B8976A]/10 transition-all disabled:opacity-40 disabled:cursor-not-allowed rounded-xl font-medium"
        >
          Buy Now
        </button>
      </div>
    </div>
  )
}

function SkeletonCard() {
  return (
    <div>
      <div className="aspect-[3/4] bg-[#141414] border border-[#242424] rounded-2xl animate-pulse" />
      <div className="pt-3 space-y-2">
        <div className="h-3 bg-[#141414] animate-pulse rounded-lg w-1/3" />
        <div className="h-4 bg-[#141414] animate-pulse rounded-lg w-3/4" />
        <div className="h-4 bg-[#141414] animate-pulse rounded-lg w-1/2" />
      </div>
      <div className="pt-3 flex gap-2">
        <div className="flex-1 h-10 bg-[#141414] animate-pulse rounded-xl" />
        <div className="flex-1 h-10 bg-[#141414] animate-pulse rounded-xl" />
      </div>
    </div>
  )
}

export default function Likes() {
  const navigate        = useNavigate()
  const { items, loading, remove } = useWishlist()
  const { isAuthenticated }        = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen px-4 md:px-8 lg:px-16 py-10">
        <div className="h-8 bg-[#141414] animate-pulse rounded-lg w-1/4 mb-10" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-6 px-4 text-center">
        <div className="w-24 h-24 border border-[#B8976A]/20 rounded-full flex items-center justify-center">
          <Heart size={32} className="text-[#B8976A]/40" />
        </div>
        <div>
          <h2 className="font-serif text-2xl text-white mb-2 font-light">Your wishlist is empty</h2>
          <p className="text-sm text-[#5C5C5C]">
            Save items you love by clicking the heart icon on any product.
          </p>
        </div>
        {!isAuthenticated && (
          <p className="text-sm text-[#5C5C5C] max-w-xs">
            <button
              onClick={() => navigate('/auth')}
              className="text-[#B8976A] border-b border-[#B8976A] hover:text-[#E8A0B0] hover:border-[#E8A0B0] transition-colors"
            >
              Sign in
            </button>
            {' '}to keep your wishlist across devices.
          </p>
        )}
        <button
          onClick={() => navigate('/products')}
          className="mt-2 bg-gradient-to-r from-[#B8976A] to-[#A88345] text-white px-7 md:px-10 py-4 text-xs uppercase tracking-[0.12em] font-medium hover:shadow-lg hover:shadow-[#B8976A]/20 transition-all rounded-xl"
        >
          Browse Products
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="px-4 md:px-8 lg:px-16 py-10">
        <div className="flex items-baseline gap-3 mb-10">
          <h1 className="font-serif text-2xl md:text-3xl text-white font-light">My Wishlist</h1>
          <span className="text-sm text-[#5C5C5C] font-light">
            {items.length} {items.length === 1 ? 'item' : 'items'}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
          {items.map((product) => (
            <LikesCard
              key={product.id || product._id}
              product={product}
              onRemove={remove}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
