import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Star, Heart, Truck, Plus, Minus, Sparkles, ShieldCheck } from 'lucide-react'
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
          className={n <= Math.round(rating) ? 'fill-[#B8976A] stroke-[#B8976A]' : 'stroke-[#242424] fill-[#141414]'}
        />
      ))}
    </div>
  )
}

function Accordion({ title, children }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-[#242424]/50">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full py-5 text-left group cursor-pointer"
      >
        <span className="text-[11px] uppercase tracking-[0.15em] font-semibold text-[#9A9A9A] group-hover:text-white transition-colors">{title}</span>
        <span className={`text-xl text-[#5C5C5C] group-hover:text-white transition-all duration-300 ${open ? 'rotate-45 text-[#B8976A]' : 'rotate-0'}`}>+</span>
      </button>
      <div
        className="overflow-hidden transition-all duration-500"
        style={{ maxHeight: open ? '400px' : '0', transitionTimingFunction: 'cubic-bezier(0.16,1,0.3,1)' }}
      >
        <div className="pb-6 text-sm text-[#9A9A9A] leading-relaxed font-light">{children}</div>
      </div>
    </div>
  )
}

function SkeletonDetail() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 px-4 md:px-8 lg:px-16 py-10 bg-[#0A0A0A] min-h-screen">
      <div className="aspect-[3/4] bg-[#141414] animate-pulse rounded-2xl border border-[#242424]" />
      <div className="space-y-6 pt-4">
        <div className="h-4 bg-[#141414] animate-pulse w-1/4 rounded-lg" />
        <div className="h-10 bg-[#141414] animate-pulse w-3/4 rounded-lg" />
        <div className="h-6 bg-[#141414] animate-pulse w-1/3 rounded-lg" />
        <div className="h-32 bg-[#141414] animate-pulse rounded-2xl" />
        <div className="h-14 bg-[#141414] animate-pulse rounded-xl" />
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
  const [stockAlert, setStockAlert] = useState(null)

  const fetchProduct = async (silent = false) => {
    try {
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(id)
      const productUrl = isObjectId ? `/products/${id}` : `/products/slug/${id}`
      const pRes = await api.get(productUrl)
      const p = normalizeProduct(pRes.data.product)

      if (silent && product) {
        const prevSizeStock = product.sizeStock || {}
        const newSizeStock = p.sizeStock || {}
        const prevTotal = Object.values(prevSizeStock).reduce((a, b) => a + b, 0)
        const newTotal = Object.values(newSizeStock).reduce((a, b) => a + b, 0)

        if (newTotal < prevTotal && newTotal > 0) {
          setStockAlert('Stock updated — selling fast!')
          setTimeout(() => setStockAlert(null), 3000)
        }

        if (selectedSize) {
          const oldStock = prevSizeStock[selectedSize] ?? product.stock
          const newStock = newSizeStock[selectedSize] ?? p.stock
          if (newStock === 0 && oldStock > 0) {
            setStockAlert(`Sorry, ${selectedSize} just went out of stock`)
            setSelectedSize('')
            setQty(1)
            setTimeout(() => setStockAlert(null), 4000)
          } else if (newStock > 0 && newStock < oldStock) {
            setQty(q => Math.min(q, newStock))
            if (newStock < 5) {
              setStockAlert(`Hurry! Only ${newStock} left in ${selectedSize}`)
              setTimeout(() => setStockAlert(null), 3000)
            }
          }
        }

        setProduct(p)
        return
      }

      setProduct(p)
      setSelectedColor(p.colors?.[0] || '')
      setSelectedSize('')
    } catch {
      if (!silent) setProduct(null)
    }
  }

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setProduct(null)
    setRelated([])
    setAdded(false)

    fetchProduct(false).then(() => {
      if (!cancelled) setLoading(false)
    })

    return () => { cancelled = true }
  }, [id])

  useEffect(() => {
    if (!product) return
    const interval = setInterval(() => {
      fetchProduct(true)
    }, 15000)
    return () => clearInterval(interval)
  }, [product?.id, selectedSize])

  const handleIncreaseQty = async () => {
    try {
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(id)
      const productUrl = isObjectId ? `/products/${id}` : `/products/slug/${id}`
      const res = await api.get(productUrl)
      const fresh = normalizeProduct(res.data.product)
      setProduct(fresh)

      const freshStock = selectedSize
        ? (fresh.sizeStock?.[selectedSize] ?? fresh.stock)
        : fresh.stock

      if (freshStock === 0) {
        setStockAlert(`Sorry, ${selectedSize || 'this product'} just went out of stock`)
        setSelectedSize('')
        setQty(1)
        setTimeout(() => setStockAlert(null), 4000)
        return
      }

      if (qty >= freshStock) {
        setStockAlert(`Only ${freshStock} available in stock`)
        setTimeout(() => setStockAlert(null), 3000)
        return
      }

      setQty(q => Math.min(freshStock, q + 1))
    } catch {
      setQty(q => Math.min(currentStock, q + 1))
    }
  }

  if (loading) return <SkeletonDetail />

  if (!product) {
    return (
      <div className="min-h-[60vh] bg-[#0A0A0A] flex flex-col items-center justify-center gap-6">
        <h1 className="font-serif text-3xl text-white">Product not found</h1>
        <button
          onClick={() => navigate('/products')}
          className="bg-gradient-to-r from-[#B8976A] to-[#A88345] text-white rounded-xl px-8 py-3 text-xs uppercase tracking-[0.12em] font-medium hover:shadow-lg hover:shadow-[#B8976A]/20 transition-all cursor-pointer"
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
    if (qty > currentStock) {
      toast.error(`Only ${currentStock} available in stock`)
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
    <div className="min-h-screen bg-[#0A0A0A] text-white pb-24 lg:pb-12">
      <div className="px-4 md:px-8 lg:px-16 py-8 max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-[10px] text-[#5C5C5C] mb-8 uppercase tracking-[0.1em] font-medium">
          <Link to="/" className="hover:text-[#B8976A] transition-colors">Home</Link>
          <span className="text-[#242424]">/</span>
          <Link to={`/products?category=${product.category}`} className="hover:text-[#B8976A] transition-colors">{product.category}</Link>
          <span className="text-[#242424]">/</span>
          <span className="text-[#B8976A] truncate max-w-[200px]">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-6 lg:gap-12 xl:gap-20">
          {/* Gallery Component */}
          <ProductImageGallery images={product.images} name={product.name} />

          {/* Info Side */}
          <div className="space-y-6">
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-[#B8976A] font-medium mb-3">{product.category}</p>
              <h1 className="font-serif text-3xl md:text-[2.5rem] text-white leading-tight">{product.name}</h1>
            </div>

            {product.rating > 0 && (
              <div className="flex items-center gap-3 bg-[#141414] border border-[#242424] rounded-xl px-5 py-3 w-fit">
                <Stars rating={product.rating} />
                <span className="text-xs text-[#9A9A9A] font-medium">
                  {product.rating} <span className="text-[#242424] mx-1">·</span> {product.reviewCount} reviews
                </span>
              </div>
            )}

            {/* Price block */}
            <div className="flex items-baseline gap-4 py-4 border-y border-[#242424]/50">
              <span className="font-serif text-[1.75rem] text-white">{formatPrice(product.price)}</span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-base text-[#5C5C5C] line-through font-light">{formatPrice(product.originalPrice)}</span>
              )}
              {savings > 0 && (
                <span className="text-[10px] uppercase font-medium tracking-wider bg-[#E8A0B0]/10 text-[#E8A0B0] border border-[#E8A0B0]/20 px-2.5 py-1 rounded-lg">
                  SAVE {formatPrice(savings)}
                </span>
              )}
            </div>

            {/* Color Select */}
            {product.colors?.length > 0 && (
              <div className="space-y-3">
                <p className="text-[10px] uppercase tracking-[0.15em] font-medium text-[#B8976A]">
                  Color: <span className="text-white font-normal capitalize font-sans">{selectedColor}</span>
                </p>
                <ColorSelector colors={product.colors} selected={selectedColor} onChange={setSelectedColor} />
              </div>
            )}

            {/* Size Select */}
            {product.sizes?.length > 0 && (
            <div className="space-y-3">
              {product.isOutOfStock && (
                <div className="bg-[#E8A0B0]/5 border border-[#E8A0B0]/20 p-4 rounded-xl">
                  <p className="text-xs text-[#E8A0B0] font-medium uppercase tracking-wider">Temporarily Out of Stock</p>
                  <p className="text-xs text-[#9A9A9A] mt-1 font-light">Check back soon or add to wishlist to receive notification.</p>
                </div>
              )}
              {stockAlert && (
                <div className="bg-[#EE6B83]/10 border border-[#EE6B83]/30 p-3 rounded-xl flex items-center gap-2 animate-pulse">
                  <span className="text-[#EE6B83] text-sm">!</span>
                  <p className="text-xs text-[#EE6B83] font-medium">{stockAlert}</p>
                </div>
              )}
                <div className="flex items-center justify-between">
                  <p className="text-[10px] uppercase tracking-[0.15em] font-medium text-[#B8976A]">Size Selection</p>
                  <button className="text-[10px] text-[#5C5C5C] border-b border-[#5C5C5C] hover:text-white hover:border-white transition-colors uppercase font-medium tracking-wider">
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
                        className={`px-5 py-2.5 text-xs border tracking-wide transition-all rounded-xl font-medium
                          ${isOOS ? 'border-[#242424] text-[#5C5C5C] line-through cursor-not-allowed opacity-40 bg-[#0A0A0A]' : ''}
                          ${selectedSize === size && !isOOS ? 'bg-gradient-to-r from-[#B8976A] to-[#A88345] text-white border-transparent shadow-[0_4px_20px_rgba(201,168,106,0.3)]' : ''}
                          ${selectedSize !== size && !isOOS && isLow ? 'border-[#E8A0B0]/30 hover:border-[#E8A0B0] text-[#E8A0B0] cursor-pointer bg-[#141414]' : ''}
                          ${selectedSize !== size && !isOOS && !isLow ? 'border-[#242424] text-[#9A9A9A] hover:border-[#B8976A] hover:text-white cursor-pointer bg-[#141414]' : ''}
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
                    <p className="text-xs text-[#E8A0B0] font-bold uppercase tracking-wider flex items-center gap-1"><span>✕</span> Out of stock</p>
                  )
                  if (stock < 5) return (
                    <p className="text-xs text-[#EE6B83] font-bold uppercase tracking-wider flex items-center gap-1"><span>⚠</span> Only {stock} left — selling fast!</p>
                  )
                  return (
                    <p className="text-xs text-[#2E7D32] font-bold uppercase tracking-wider flex items-center gap-1"><span>✓</span> In stock</p>
                  )
                })()}
              </div>
            )}

            {/* Qty Selector */}
            {currentStock > 0 && (
              <div className="space-y-3">
                <p className="text-[10px] uppercase tracking-[0.15em] font-semibold text-[#B8976A]">
                  Quantity
                </p>
                <div className="flex items-center border border-[#242424] bg-[#141414] w-fit rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="px-4 py-3 hover:bg-white/5 transition-colors text-[#9A9A9A] hover:text-white"
                  >
                    <Minus size={12} />
                  </button>
                  <span className="px-5 py-3 text-sm font-semibold border-x border-[#242424] min-w-[50px] text-center text-white">{qty}</span>
                  <button
                    onClick={handleIncreaseQty}
                    className="px-4 py-3 hover:bg-white/5 transition-colors text-[#9A9A9A] hover:text-white"
                  >
                    <Plus size={12} />
                  </button>
                </div>
              </div>
            )}

            {/* Purchase Actions */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
              {product.isOutOfStock ? (
                <button
                  disabled
                  className="flex-1 h-14 sm:h-14 py-4 text-[11px] sm:text-xs uppercase tracking-widest font-semibold bg-[#242424] text-[#5C5C5C] cursor-not-allowed rounded-xl"
                >
                  Out of Stock
                </button>
              ) : (
                <>
                  <button
                    onClick={handleAddToCart}
                    disabled={adding || added || isAddToCartDisabled}
                    className={`flex-1 h-14 sm:h-14 py-4 text-[11px] sm:text-xs uppercase tracking-widest font-semibold transition-all duration-500 rounded-xl cursor-pointer ${
                      added
                        ? 'bg-gradient-to-r from-[#B8976A] to-[#A88345] text-white'
                        : isAddToCartDisabled
                        ? 'bg-[#242424] text-[#5C5C5C] cursor-not-allowed'
                        : 'bg-gradient-to-r from-[#E8A0B0] to-[#D48A9A] text-white hover:shadow-[0_8px_30px_rgba(238,107,131,0.3)]'
                    }`}
                  >
                    {adding ? 'Adding...' : added ? '✓ Added' : isAddToCartDisabled ? 'Select a Size' : 'Add to Bag'}
                  </button>
                  <button
                    onClick={handleBuyNow}
                    disabled={isAddToCartDisabled}
                    className={`flex-1 h-14 sm:h-14 py-4 text-[11px] sm:text-xs uppercase tracking-widest font-semibold transition-all duration-500 rounded-xl cursor-pointer ${
                      isAddToCartDisabled
                        ? 'border border-[#242424] text-[#5C5C5C] cursor-not-allowed'
                        : 'bg-transparent border border-[#B8976A] text-[#B8976A] hover:bg-[#B8976A]/10'
                    }`}
                  >
                    Buy Now
                  </button>
                </>
              )}
            </div>

            <button
              onClick={() => product && toggle(product)}
              className="w-full h-14 py-4 border border-[#242424] text-[11px] uppercase tracking-[0.15em] font-semibold flex items-center justify-center gap-2 hover:border-[#E8A0B0]/50 hover:bg-[#E8A0B0]/5 transition-all rounded-xl cursor-pointer text-[#9A9A9A] hover:text-[#E8A0B0]"
            >
              <Heart
                size={14}
                className={isLiked(product?.id) ? 'fill-[#EE6B83] stroke-[#EE6B83]' : ''}
              />
              {isLiked(product?.id) ? 'Wishlisted' : 'Add to Wishlist'}
            </button>

            {/* Shipping Banner */}
            <div className="flex items-center gap-4 text-sm text-[#9A9A9A] bg-[#141414] border border-[#242424] rounded-2xl px-6 py-4">
              <Truck size={18} className="text-[#B8976A] flex-shrink-0" />
              <span>Complimentary insured shipping on all orders above ₹999</span>
            </div>

            {/* Accordions */}
            <div className="border-t border-[#242424]/50 pt-2">
              <Accordion title="Description">
                <p className="font-light">{product.description}</p>
                <div className="mt-4 flex gap-4 text-xs text-[#B8976A] font-semibold uppercase tracking-wider">
                  <span className="flex items-center gap-1"><Sparkles size={12} /> 925 Hallmarked</span>
                  <span className="flex items-center gap-1"><ShieldCheck size={12} /> 6-Month Warranty</span>
                </div>
              </Accordion>
              <Accordion title="Craftsmanship & Care">
                <p>Keep your silver jewelry shining by storing it in a dry, airtight zip bag. Avoid contact with perfumes, household cleaners, and abrasive chemicals. Gently polish with our microfibre jewelry cloth to restore brilliance.</p>
              </Accordion>
              <Accordion title="Shipping & Returns">
                <p>All shipments are fully insured and packaged in gold-stamped velvet cases. Delivery takes 3-5 working days nationwide. Easy 30-day exchange and returns are supported via our online dashboard.</p>
              </Accordion>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <section className="mt-12 md:mt-24 border-t border-[#242424]/50 pt-10 md:pt-16">
            <div className="flex flex-col items-center text-center mb-12">
              <p className="text-[10px] font-bold text-[#B8976A] tracking-[0.22em] uppercase mb-3">COMPLETE THE LOOK</p>
              <h2 className="font-serif text-2xl md:text-3xl text-white">You May Also Like</h2>
              <div className="w-12 h-[1px] bg-gradient-to-r from-transparent via-[#B8976A] to-transparent mt-4" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
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
