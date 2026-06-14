import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Star, Heart, Truck, Plus, Minus } from 'lucide-react'
import ProductImageGallery from '../components/product/ProductImageGallery'
import ColorSelector from '../components/product/ColorSelector'
import ProductCard from '../components/product/ProductCard'
import { formatPrice } from '../utils/formatPrice'
import { useCart } from '../hooks/useCart'
import { useWishlist } from '../hooks/useWishlist'
import api, { normalizeProduct } from '../utils/api'
import toast from 'react-hot-toast'

function Stars({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={13}
          className={n <= Math.round(rating) ? 'fill-[#EE6B83] stroke-[#EE6B83]' : 'stroke-gray-200 fill-gray-200'}
        />
      ))}
    </div>
  )
}

function Accordion({ title, children }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-gray-100">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full py-4 text-left group"
      >
        <span className="text-[13px] uppercase tracking-[0.1em] font-medium">{title}</span>
        <span className={`text-[18px] text-gray-400 group-hover:text-[#0A0A0A] transition-all duration-300 ${open ? 'rotate-45' : 'rotate-0'}`}>+</span>
      </button>
      <div
        className="overflow-hidden transition-all duration-400"
        style={{ maxHeight: open ? '400px' : '0', transitionTimingFunction: 'cubic-bezier(0.16,1,0.3,1)' }}
      >
        <div className="pb-5 text-[14px] text-[#6B6B6B] leading-[1.8]">{children}</div>
      </div>
    </div>
  )
}

function SkeletonDetail() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 px-4 md:px-8 lg:px-16 py-10">
      <div className="aspect-[3/4] bg-gray-200 animate-pulse" />
      <div className="space-y-5 pt-4">
        <div className="h-3 bg-gray-200 animate-pulse w-1/4 rounded" />
        <div className="h-8 bg-gray-200 animate-pulse w-3/4 rounded" />
        <div className="h-6 bg-gray-200 animate-pulse w-1/3 rounded" />
        <div className="h-20 bg-gray-200 animate-pulse rounded" />
        <div className="h-12 bg-gray-200 animate-pulse rounded" />
      </div>
    </div>
  )
}

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const { isLiked, toggle } = useWishlist()

  const [product, setProduct] = useState(null)
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  const [qty, setQty] = useState(1)
  const [adding, setAdding] = useState(false)
  const [added, setAdded] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setProduct(null)
    setRelated([])
    setAdded(false)

    const isObjectId = /^[0-9a-fA-F]{24}$/.test(id)
    const productUrl = isObjectId ? `/products/${id}` : `/products/slug/${id}`

    api.get(productUrl)
      .then((pRes) => {
        if (cancelled) return null
        const p = normalizeProduct(pRes.data.product)
        setProduct(p)
        setSelectedColor(p.colors?.[0] || '')
        setSelectedSize('')
        return api.get(`/products/${p.id}/related`)
      })
      .then((rRes) => {
        if (cancelled || !rRes) return
        setRelated((rRes.data.products || []).map(normalizeProduct))
      })
      .catch(() => { if (!cancelled) setProduct(null) })
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [id])

  if (loading) return <SkeletonDetail />

  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-5">
        <h1 className="text-2xl font-semibold">Product not found</h1>
        <button
          onClick={() => navigate('/products')}
          className="border border-[#EE6B83] text-[#EE6B83] rounded-lg px-8 py-3 text-[12px] uppercase tracking-[0.1em] hover:bg-[#FCD4DB] transition-colors"
        >
          Browse Products
        </button>
      </div>
    )
  }

  const hasSizeStock = product.sizeStock && Object.keys(product.sizeStock).length > 0
  const getSizeStock = (sizeName) => {
    if (hasSizeStock) {
      const val = product.sizeStock[sizeName]
      return val !== undefined ? val : 0
    }
    return product.stock
  }
  const selectedSizeStock = selectedSize ? getSizeStock(selectedSize) : null
  const isAddToCartDisabled = (product.sizes?.length > 0 && !selectedSize) || selectedSizeStock === 0
  const currentStock = selectedSize ? getSizeStock(selectedSize) : product.stock

  const handleAddToCart = async () => {
    if (!selectedSize && product.sizes?.length > 0) {
      toast.error('Please select a size')
      return
    }
    if (selectedSize && getSizeStock(selectedSize) === 0) {
      toast.error('This size is out of stock')
      return
    }
    setAdding(true)
    addToCart({ id: product.id, name: product.name, price: product.price, image: product.images[0], size: selectedSize, color: selectedColor, qty })
    await new Promise(r => setTimeout(r, 600))
    setAdding(false)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const savings = product.originalPrice && product.originalPrice > product.price
    ? product.originalPrice - product.price : 0

  return (
    <div className="min-h-screen">
      <div className="px-4 md:px-8 lg:px-16 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-[11px] text-[#9CA3AF] mb-10 uppercase tracking-[0.06em]">
          <Link to="/" className="hover:text-[#0A0A0A] transition-colors">Home</Link>
          <span>›</span>
          <Link to={`/products?category=${product.category}`} className="hover:text-[#0A0A0A] transition-colors">{product.category}</Link>
          <span>›</span>
          <span className="text-[#0A0A0A] truncate max-w-[200px]">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-20">
          <ProductImageGallery images={product.images} name={product.name} />

          <div className="space-y-5">
            <div>
              <p className="text-[11px] uppercase tracking-[0.12em] text-[#6B6B6B] mb-2">{product.category}</p>
              <h1 className="text-2xl md:text-3xl font-semibold leading-snug">{product.name}</h1>
            </div>

            {product.rating > 0 && (
              <div className="flex items-center gap-2.5">
                <Stars rating={product.rating} />
                <span className="text-[13px] text-[#6B6B6B]">
                  {product.rating} <span className="text-gray-300">·</span> {product.reviewCount} reviews
                </span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-[1.6rem] font-semibold">{formatPrice(product.price)}</span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-[1rem] text-[#9CA3AF] line-through">{formatPrice(product.originalPrice)}</span>
              )}
              {savings > 0 && (
                <span className="text-[12px] bg-red-50 text-red-600 px-2 py-0.5 font-medium">
                  SAVE {formatPrice(savings)}
                </span>
              )}
            </div>

           

            {/* Color */}
            {product.colors?.length > 0 && (
              <div>
                <p className="text-[11px] uppercase tracking-[0.1em] font-medium mb-3">
                  Color: <span className="font-normal text-[#6B6B6B]">{selectedColor}</span>
                </p>
                <ColorSelector colors={product.colors} selected={selectedColor} onChange={setSelectedColor} />
              </div>
            )}

            {/* Size */}
            {product.sizes?.length > 0 && (
              <div>
                {product.isOutOfStock && (
                  <div className="bg-red-50 border border-red-200 p-3 mb-4">
                    <p className="text-sm text-red-600 font-medium">This product is currently out of stock</p>
                    <p className="text-xs text-red-400 mt-1">Check back later or browse similar products</p>
                  </div>
                )}
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[11px] uppercase tracking-[0.1em] font-medium">Size</p>
                  <button className="text-[11px] text-[#6B6B6B] border-b border-[#6B6B6B] hover:text-[#0A0A0A] hover:border-[#0A0A0A] transition-colors">
                    Size Guide
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => {
                    const sizeStock = getSizeStock(size)
                    const isOOS = sizeStock === 0
                    const isLow = sizeStock > 0 && sizeStock < 5
                    return (
                      <button
                        key={size}
                        disabled={isOOS}
                        onClick={() => !isOOS && setSelectedSize(size)}
                        className={`px-4 py-2 text-sm border transition-all
                          ${isOOS ? 'border-gray-100 text-gray-300 line-through cursor-not-allowed opacity-50' : ''}
                          ${selectedSize === size && !isOOS ? 'bg-[#EE6B83] text-white border-[#EE6B83] rounded-lg' : ''}
                          ${selectedSize !== size && !isOOS && isLow ? 'border-orange-300 hover:border-orange-500 text-black cursor-pointer' : ''}
                          ${selectedSize !== size && !isOOS && !isLow ? 'border-gray-200 hover:border-black text-black cursor-pointer' : ''}
                        `}
                      >
                        {size}
                      </button>
                    )
                  })}
                </div>
                {selectedSize && (() => {
                  const stock = getSizeStock(selectedSize)
                  if (stock === 0) return (
                    <p className="text-sm text-red-500 mt-2 flex items-center gap-1"><span>✕</span> Out of stock</p>
                  )
                  if (stock < 5) return (
                    <p className="text-sm text-orange-500 mt-2 flex items-center gap-1"><span>⚠</span> Only {stock} left</p>
                  )
                  return (
                    <p className="text-sm text-green-600 mt-2 flex items-center gap-1"><span>✓</span> In stock</p>
                  )
                })()}
              </div>
            )}

            {/* Qty */}
            {currentStock > 0 && (
              <div>
                <p className="text-[11px] uppercase tracking-[0.1em] font-medium mb-3">
                  Quantity
                  {currentStock <= 5 && (
                    <span className="ml-2 text-orange-500 font-normal normal-case text-[12px]">
                      Only {currentStock} left
                    </span>
                  )}
                </p>
                <div className="flex items-center border border-gray-200 w-fit">
                  <button
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <Minus size={13} />
                  </button>
                  <span className="px-5 py-3 text-[14px] font-medium border-x border-gray-200 min-w-[52px] text-center">{qty}</span>
                  <button
                    onClick={() => setQty(Math.min(currentStock, qty + 1))}
                    className="px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <Plus size={13} />
                  </button>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col gap-3 pt-1">
              {product.isOutOfStock ? (
                <button
                  disabled
                  className="w-full h-14 text-[12px] uppercase tracking-[0.15em] font-medium bg-gray-100 text-gray-400 cursor-not-allowed"
                >
                  Out of Stock
                </button>
              ) : (
              <button
                onClick={handleAddToCart}
                disabled={adding || added || isAddToCartDisabled}
                className={`w-full h-14 text-[12px] uppercase tracking-[0.15em] font-medium transition-all duration-300 active:scale-[0.99] disabled:opacity-80 rounded-lg ${
                  added
                    ? 'bg-[#EE6B83] text-white'
                    : isAddToCartDisabled
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-[#EE6B83] text-white hover:bg-[#D9506A]'
                }`}
              >
                {adding ? 'Adding...' : added ? '✓ Added to Bag' : isAddToCartDisabled && selectedSize ? 'Out of Stock' : isAddToCartDisabled ? 'Select a Size' : 'Add to Bag'}
              </button>
              )}
              <button
                onClick={() => product && toggle(product)}
                className="w-full h-12 border border-gray-200 text-[12px] uppercase tracking-[0.12em] font-medium flex items-center justify-center gap-2 hover:border-[#0A0A0A] transition-colors"
              >
                <Heart
                  size={14}
                  className={isLiked(product?.id) ? 'fill-red-500 stroke-red-500' : ''}
                />
                {isLiked(product?.id) ? 'Wishlisted' : 'Add to Wishlist'}
              </button>
            </div>

            {/* Shipping note */}
            <div className="flex items-center gap-3 text-[13px] text-[#6B6B6B] bg-[#FCD4DB] px-5 py-4">
              <Truck size={15} className="flex-shrink-0" />
              <span>Free delivery on orders above ₹999</span>
            </div>

            {/* Accordions */}
            <div className="border-t border-gray-100 pt-2">
              <Accordion title="Description">
                <p>{product.description}</p>
                <ul className="mt-3 space-y-1 list-disc list-inside text-[#6B6B6B]">
                  <li>Premium quality materials</li>
                  <li>Ethically sourced and manufactured</li>
                  <li>Machine washable</li>
                </ul>
              </Accordion>
              <Accordion title="Size & Fit">
                <p>This style fits true to size. Model is 5′9″ wearing size S.</p>
                <p className="mt-2">For best fit, compare your measurements to our size chart.</p>
              </Accordion>
              <Accordion title="Shipping & Returns">
                <p>Free shipping on orders above ₹999. Standard delivery in 3–5 business days.</p>
                <p className="mt-2">Easy 30-day returns. Items must be unworn, unwashed, in original packaging.</p>
              </Accordion>
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <section className="mt-20">
            <h2 className="text-xl font-semibold mb-2">You May Also Like</h2>
            <div className="w-12 h-px bg-[#EE6B83] mb-8" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-5 gap-y-10">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
