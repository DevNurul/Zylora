import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Star, Heart, Truck, Plus, Minus, Info, Sparkles, ShieldCheck } from 'lucide-react'
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
          size={14}
          className={n <= Math.round(rating) ? 'fill-[#C9A86A] stroke-[#C9A86A]' : 'stroke-[#2A2A2A] fill-[#171717]'}
        />
      ))}
    </div>
  )
}

function Accordion({ title, children }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-[#2A2A2A]">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full py-4 text-left group cursor-pointer"
      >
        <span className="text-[11px] uppercase tracking-[0.15em] font-bold text-white group-hover:text-[#C9A86A] transition-colors">{title}</span>
        <span className={`text-[20px] text-[#B3B3B3] group-hover:text-white transition-all duration-300 ${open ? 'rotate-45 text-[#EE6B83]' : 'rotate-0'}`}>+</span>
      </button>
      <div
        className="overflow-hidden transition-all duration-300"
        style={{ maxHeight: open ? '400px' : '0', transitionTimingFunction: 'cubic-bezier(0.16,1,0.3,1)' }}
      >
        <div className="pb-5 text-[13px] text-[#B3B3B3] leading-relaxed font-light">{children}</div>
      </div>
    </div>
  )
}

function SkeletonDetail() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 px-4 md:px-8 lg:px-16 py-10 bg-[#0D0D0D] min-h-screen">
      <div className="aspect-[3/4] bg-[#171717] animate-pulse rounded-2xl border border-[#2A2A2A]" />
      <div className="space-y-6 pt-4">
        <div className="h-4 bg-[#171717] animate-pulse w-1/4 rounded-lg" />
        <div className="h-10 bg-[#171717] animate-pulse w-3/4 rounded-lg" />
        <div className="h-6 bg-[#171717] animate-pulse w-1/3 rounded-lg" />
        <div className="h-32 bg-[#171717] animate-pulse rounded-2xl" />
        <div className="h-14 bg-[#171717] animate-pulse rounded-xl" />
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
      <div className="min-h-[60vh] bg-[#0D0D0D] flex flex-col items-center justify-center gap-5">
        <h1 className="text-2xl font-serif text-white">Product not found</h1>
        <button
          onClick={() => navigate('/products')}
          className="border border-[#C9A86A] text-[#C9A86A] rounded-lg px-8 py-3 text-[11px] uppercase tracking-[0.1em] font-bold hover:bg-[#C9A86A]/10 transition-colors cursor-pointer"
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

  const handleBuyNow = () => {
    if (!selectedSize && product.sizes?.length > 0) {
      toast.error('Please select a size')
      return
    }
    if (selectedSize && getSizeStock(selectedSize) === 0) {
      toast.error('This size is out of stock')
      return
    }
    addToCart({ id: product.id, name: product.name, price: product.price, image: product.images[0], size: selectedSize, color: selectedColor, qty })
    navigate('/checkout')
  }

  const savings = product.originalPrice && product.originalPrice > product.price
    ? product.originalPrice - product.price : 0

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white pb-24 lg:pb-12">
      <div className="px-4 md:px-8 lg:px-16 py-8 max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-[10px] text-[#B3B3B3] mb-8 uppercase tracking-[0.1em] font-semibold">
          <Link to="/" className="hover:text-[#C9A86A] transition-colors">Home</Link>
          <span>›</span>
          <Link to={`/products?category=${product.category}`} className="hover:text-[#C9A86A] transition-colors">{product.category}</Link>
          <span>›</span>
          <span className="text-[#C9A86A] truncate max-w-[200px]">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-20">
          {/* Gallery Component */}
          <ProductImageGallery images={product.images} name={product.name} />

          {/* Info Side */}
          <div className="space-y-6">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#C9A86A] font-bold mb-2">{product.category}</p>
              <h1 className="text-3xl md:text-4xl font-light text-white font-serif tracking-wide leading-snug">{product.name}</h1>
            </div>

            {product.rating > 0 && (
              <div className="flex items-center gap-3 bg-[#171717] border border-[#2A2A2A] rounded-xl px-4 py-2.5 w-fit">
                <Stars rating={product.rating} />
                <span className="text-xs text-[#B3B3B3] font-semibold">
                  {product.rating} <span className="text-[#2A2A2A] mx-1">·</span> {product.reviewCount} reviews
                </span>
              </div>
            )}

            {/* Price block */}
            <div className="flex items-baseline gap-3.5 py-2 border-y border-[#2A2A2A]">
              <span className="text-3xl font-extrabold text-white font-sans">{formatPrice(product.price)}</span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-lg text-[#B3B3B3] line-through font-light">{formatPrice(product.originalPrice)}</span>
              )}
              {savings > 0 && (
                <span className="text-[10px] uppercase font-bold tracking-wider bg-rose-500/10 text-[#EE6B83] border border-rose-500/20 px-2 py-0.5 rounded">
                  SAVE {formatPrice(savings)}
                </span>
              )}
            </div>

            {/* Color Select */}
            {product.colors?.length > 0 && (
              <div className="space-y-2.5">
                <p className="text-[10px] uppercase tracking-[0.15em] font-bold text-[#C9A86A]">
                  Color: <span className="text-white font-medium capitalize font-sans">{selectedColor}</span>
                </p>
                <ColorSelector colors={product.colors} selected={selectedColor} onChange={setSelectedColor} />
              </div>
            )}

            {/* Size Select */}
            {product.sizes?.length > 0 && (
              <div className="space-y-3">
                {product.isOutOfStock && (
                  <div className="bg-rose-950/20 border border-rose-900/40 p-4 rounded-xl">
                    <p className="text-xs text-red-400 font-bold uppercase tracking-wider">Temporarily Out of Stock</p>
                    <p className="text-xs text-[#B3B3B3] mt-1 font-light">Check back soon or add to wishlist to receive notification.</p>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <p className="text-[10px] uppercase tracking-[0.15em] font-bold text-[#C9A86A]">Size Selection</p>
                  <button className="text-[10px] text-[#B3B3B3] border-b border-[#B3B3B3] hover:text-white hover:border-white transition-colors uppercase font-bold tracking-wider">
                    Size Guide
                  </button>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {product.sizes.map((size) => {
                    const sizeStock = getSizeStock(size)
                    const isOOS = sizeStock === 0
                    const isLow = sizeStock > 0 && sizeStock < 5
                    return (
                      <button
                        key={size}
                        disabled={isOOS}
                        onClick={() => !isOOS && setSelectedSize(size)}
                        className={`px-4.5 py-2 text-xs border tracking-wide transition-all rounded-lg font-bold
                          ${isOOS ? 'border-[#2A2A2A] text-white/20 line-through cursor-not-allowed opacity-40 bg-[#0D0D0D]' : ''}
                          ${selectedSize === size && !isOOS ? 'bg-[#EE6B83] text-white border-[#EE6B83]' : ''}
                          ${selectedSize !== size && !isOOS && isLow ? 'border-orange-500/50 hover:border-orange-500 text-orange-400 cursor-pointer bg-[#171717]' : ''}
                          ${selectedSize !== size && !isOOS && !isLow ? 'border-[#2A2A2A] text-[#B3B3B3] hover:border-[#C9A86A] hover:text-white cursor-pointer bg-[#171717]' : ''}
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
                    <p className="text-xs text-red-500 font-bold uppercase tracking-wider flex items-center gap-1"><span>✕</span> Out of stock</p>
                  )
                  if (stock < 5) return (
                    <p className="text-xs text-orange-400 font-bold uppercase tracking-wider flex items-center gap-1"><span>⚠</span> Only {stock} items left</p>
                  )
                  return (
                    <p className="text-xs text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1"><span>✓</span> Item In stock</p>
                  )
                })()}
              </div>
            )}

            {/* Qty Selector */}
            {currentStock > 0 && (
              <div className="space-y-3">
                <p className="text-[10px] uppercase tracking-[0.15em] font-bold text-[#C9A86A]">
                  Quantity
                </p>
                <div className="flex items-center border border-[#2A2A2A] bg-[#171717] w-fit rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="px-4 py-3 hover:bg-white/5 transition-colors text-white"
                  >
                    <Minus size={12} />
                  </button>
                  <span className="px-5 py-3 text-sm font-semibold border-x border-[#2A2A2A] min-w-[50px] text-center text-white">{qty}</span>
                  <button
                    onClick={() => setQty(Math.min(currentStock, qty + 1))}
                    className="px-4 py-3 hover:bg-white/5 transition-colors text-white"
                  >
                    <Plus size={12} />
                  </button>
                </div>
              </div>
            )}

            {/* Purchase Actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              {product.isOutOfStock ? (
                <button
                  disabled
                  className="flex-1 h-14 text-xs uppercase tracking-widest font-bold bg-[#2A2A2A] text-white/40 cursor-not-allowed rounded-xl"
                >
                  Out of Stock
                </button>
              ) : (
                <>
                  <button
                    onClick={handleAddToCart}
                    disabled={adding || added || isAddToCartDisabled}
                    className={`flex-1 h-14 text-xs uppercase tracking-widest font-bold transition-all duration-300 rounded-xl cursor-pointer ${
                      added
                        ? 'bg-[#EE6B83] text-white'
                        : isAddToCartDisabled
                        ? 'bg-[#2A2A2A] text-white/30 cursor-not-allowed'
                        : 'bg-[#EE6B83] hover:bg-[#D9506A] text-white hover:shadow-lg hover:shadow-[#EE6B83]/10'
                    }`}
                  >
                    {adding ? 'Adding...' : added ? '✓ Added' : isAddToCartDisabled ? 'Select a Size' : 'Add to Bag'}
                  </button>
                  <button
                    onClick={handleBuyNow}
                    disabled={isAddToCartDisabled}
                    className={`flex-1 h-14 text-xs uppercase tracking-widest font-bold transition-all duration-300 rounded-xl cursor-pointer ${
                      isAddToCartDisabled
                        ? 'border border-[#2A2A2A] text-white/20 cursor-not-allowed'
                        : 'bg-transparent border border-[#C9A86A] text-[#C9A86A] hover:bg-[#C9A86A]/10'
                    }`}
                  >
                    Buy Now
                  </button>
                </>
              )}
            </div>

            <button
              onClick={() => product && toggle(product)}
              className="w-full h-12 border border-[#2A2A2A] text-[10px] uppercase tracking-[0.15em] font-bold flex items-center justify-center gap-2 hover:border-[#C9A86A] hover:bg-white/5 transition-all rounded-xl cursor-pointer text-white"
            >
              <Heart
                size={14}
                className={isLiked(product?.id) ? 'fill-red-500 stroke-red-500' : 'text-[#B3B3B3]'}
              />
              {isLiked(product?.id) ? 'Wishlisted' : 'Add to Wishlist'}
            </button>

            {/* Shipping Banner */}
            <div className="flex items-center gap-3 text-xs text-[#B3B3B3] bg-[#171717] border border-[#2A2A2A] rounded-2xl px-5 py-4">
              <Truck size={16} className="text-[#C9A86A] flex-shrink-0" />
              <span>Complimentary insured shipping on all orders above ₹999</span>
            </div>

            {/* Accordions */}
            <div className="border-t border-[#2A2A2A] pt-2">
              <Accordion title="Description">
                <p className="font-light">{product.description}</p>
                <div className="mt-4 flex gap-4 text-xs text-[#C9A86A] font-semibold uppercase tracking-wider">
                  <span className="flex items-center gap-1"><Sparkles size={12} /> 925 Hallmarked</span>
                  <span className="flex items-center gap-1"><ShieldCheck size={12} /> 6-Month Warranty</span>
                </div>
              </Accordion>
              <Accordion title="Craftsmanship & Care">
                <p>Keep your silver jewelry shining by storing it in a dry, airtight zip bag. Avoid contact with perfumes, household cleaners, and abrasive chemicals. Gently polish with our microfibre jewelry cloth to restore brilliance.</p>
              </Accordion>
              <Accordion title="Shipping & Returns">
                <p>All shipments are fully insured and packaged in gold-stamped velvet cases. Delivery takes 3–5 working days nationwide. Easy 30-day exchange and returns are supported via our online dashboard.</p>
              </Accordion>
            </div>
          </div>
        </div>

        {/* Sticky Mobile purchase footer bar */}
        {!product.isOutOfStock && (
          <div className="lg:hidden fixed bottom-0 inset-x-0 bg-[#171717]/95 backdrop-blur-md border-t border-[#2A2A2A] p-4 flex gap-3 z-50 shadow-[0_-8px_30px_rgba(0,0,0,0.5)]">
            <button
              onClick={handleAddToCart}
              disabled={adding || added || isAddToCartDisabled}
              className={`flex-1 h-12 text-[10px] uppercase tracking-widest font-bold rounded-xl transition-all cursor-pointer ${
                added ? 'bg-[#EE6B83] text-white' : 'bg-[#EE6B83] text-white active:scale-95 disabled:opacity-50'
              }`}
            >
              {adding ? 'Adding...' : added ? '✓ Added' : isAddToCartDisabled ? 'Select Size' : 'Add to Bag'}
            </button>
            <button
              onClick={handleBuyNow}
              disabled={isAddToCartDisabled}
              className="flex-1 bg-transparent border border-[#C9A86A] text-[#C9A86A] h-12 text-[10px] uppercase tracking-widest font-bold rounded-xl active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
            >
              Buy Now
            </button>
          </div>
        )}

        {/* Related Products */}
        {related.length > 0 && (
          <section className="mt-24 border-t border-[#2A2A2A] pt-16">
            <div className="flex flex-col items-center text-center mb-12">
              <p className="text-[10px] font-bold text-[#C9A86A] tracking-[0.25em] uppercase mb-2">COMPLETE THE LOOK</p>
              <h2 className="text-2xl md:text-3xl font-light text-white tracking-wide font-serif">You May Also Like</h2>
              <div className="w-12 h-[1px] bg-[#EE6B83] mt-3" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-12">
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
