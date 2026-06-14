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
          className={n <= Math.round(rating) ? 'fill-[#EE6B83] stroke-[#EE6B83]' : 'stroke-gray-200 fill-gray-200'}
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

  // When a size is selected while buyNowPending, auto-proceed to checkout
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
        className="relative overflow-hidden bg-[#FCD4DB] aspect-[3/4] cursor-pointer"
        onClick={() => navigate(`/products/${product.id || product._id}`)}
      >
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

        {/* Status badge */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
          {!product.inStock && (
            <span className="bg-gray-500 text-white text-[10px] uppercase tracking-[0.1em] px-2 py-0.5 leading-5">
              Out of Stock
            </span>
          )}
          {product.inStock && product.isNew && (
            <span className="bg-[#0A0A0A] text-white text-[10px] uppercase tracking-[0.1em] px-2 py-0.5 leading-5">
              New
            </span>
          )}
          {product.isSale && (
            <span className="bg-[#EE6B83] text-white text-[10px] uppercase tracking-[0.1em] px-2 py-0.5 leading-5">
              Sale
            </span>
          )}
        </div>

        {/* Remove button */}
        <button
          className="absolute top-3 right-3 z-10 p-2 bg-white/90 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 active:scale-95 hover:bg-red-50"
          onClick={(e) => { e.stopPropagation(); onRemove(product.id || product._id) }}
          aria-label="Remove from wishlist"
          title="Remove from wishlist"
        >
          <Trash2 size={14} className="text-gray-500 hover:text-red-500 transition-colors" />
        </button>
      </div>

      {/* Info */}
      <div
        className="pt-3 pb-1 space-y-1 cursor-pointer"
        onClick={() => navigate(`/products/${product.id || product._id}`)}
      >
        <p className="text-[11px] uppercase tracking-[0.08em] text-[#6B6B6B]">{product.category}</p>
        <h3 className="text-[14px] font-medium text-[#0A0A0A] leading-snug line-clamp-2">{product.name}</h3>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[15px] font-semibold">{formatPrice(product.price)}</span>
          {product.originalPrice && product.originalPrice > product.price && (
            <>
              <span className="text-[12px] text-[#9CA3AF] line-through">{formatPrice(product.originalPrice)}</span>
              {discountPct > 0 && (
                <span className="text-[11px] text-red-500 font-medium">{discountPct}% off</span>
              )}
            </>
          )}
        </div>
        {product.rating > 0 && (
          <div className="flex items-center gap-1.5">
            <Stars rating={product.rating} />
            {product.reviewCount > 0 && (
              <span className="text-[11px] text-[#9CA3AF]">({product.reviewCount})</span>
            )}
          </div>
        )}
      </div>

      {/* Inline size picker */}
      {showSizes && hasSizes && (
        <div className="pt-2" onClick={(e) => e.stopPropagation()}>
          <p className="text-[11px] text-[#6B6B6B] mb-1.5 uppercase tracking-[0.08em]">Select size:</p>
          <div className="flex gap-1.5 flex-wrap">
            {product.sizes.map((s) => (
              <button
                key={s}
                onClick={() => handleSizeSelect(s)}
                className={`min-w-[34px] h-7 px-2 text-[11px] uppercase tracking-wide border transition-all duration-150 rounded ${
                  selectedSize === s
                    ? 'bg-[#EE6B83] text-white border-[#EE6B83]'
                    : 'border-gray-200 text-[#0A0A0A] hover:border-[#EE6B83]'
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
          className="flex-1 bg-[#EE6B83] text-white text-[11px] py-2.5 uppercase tracking-[0.1em] hover:bg-[#D9506A] transition-colors disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed rounded-lg"
        >
          {showSizes && !selectedSize ? 'Select Size' : 'Add to Bag'}
        </button>
        <button
          onClick={handleBuyNow}
          disabled={!product.inStock}
          className="flex-1 border border-[#EE6B83] text-[#EE6B83] text-[11px] py-2.5 uppercase tracking-[0.1em] hover:bg-[#FCD4DB] hover:text-[#EE6B83] transition-colors disabled:border-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed rounded-lg"
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
      <div className="aspect-[3/4] bg-gray-200 animate-pulse" />
      <div className="pt-3 space-y-2">
        <div className="h-3 bg-gray-200 animate-pulse rounded w-1/3" />
        <div className="h-4 bg-gray-200 animate-pulse rounded w-3/4" />
        <div className="h-4 bg-gray-200 animate-pulse rounded w-1/2" />
      </div>
      <div className="pt-3 flex gap-2">
        <div className="flex-1 h-9 bg-gray-200 animate-pulse" />
        <div className="flex-1 h-9 bg-gray-200 animate-pulse" />
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
        <div className="h-8 bg-gray-200 animate-pulse rounded w-1/4 mb-10" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10">
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-6 px-4 text-center">
        <div className="w-20 h-20 border border-gray-100 rounded-full flex items-center justify-center">
          <Heart size={28} className="text-gray-300" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold mb-2">Your wishlist is empty</h2>
          <p className="text-[14px] text-[#6B6B6B]">
            Save items you love by clicking the ♥ icon on any product.
          </p>
        </div>
        {!isAuthenticated && (
          <p className="text-[13px] text-[#6B6B6B] max-w-xs">
            <button
              onClick={() => navigate('/auth')}
              className="text-[#EE6B83] border-b border-[#EE6B83] hover:text-[#D9506A] hover:border-[#D9506A] transition-colors"
            >
              Sign in
            </button>
            {' '}to keep your wishlist across devices.
          </p>
        )}
        <button
          onClick={() => navigate('/products')}
          className="mt-2 bg-[#EE6B83] text-white px-10 py-4 text-[12px] uppercase tracking-[0.12em] font-medium hover:bg-[#D9506A] transition-all duration-300 rounded-lg"
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
          <h1 className="text-2xl md:text-3xl font-semibold">My Wishlist</h1>
          <span className="text-base text-[#9CA3AF] font-normal">
            {items.length} {items.length === 1 ? 'item' : 'items'}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10">
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
