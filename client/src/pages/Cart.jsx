import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShoppingBag } from 'lucide-react'
import { useCart } from '../hooks/useCart'
import CartItem from '../components/cart/CartItem'
import CartSummary from '../components/cart/CartSummary'
import api from '../utils/api'

export default function Cart() {
  const navigate = useNavigate()
  const { items, count } = useCart()
  const [stockWarnings, setStockWarnings] = useState([])

  useEffect(() => {
    if (items.length === 0) return
    const checkStock = async () => {
      const checks = await Promise.all(
        items.map((item) =>
          api.get(`/products/${item.id}`)
            .then((res) => ({
              id: item.id,
              size: item.size,
              stock: res.data.product.stock,
              sizeStock: res.data.product.sizeStock,
            }))
            .catch(() => null)
        )
      )
      setStockWarnings(checks.filter(Boolean))
    }
    checkStock()
  }, [])

  const getItemWarning = (item) => {
    const check = stockWarnings.find((w) => w.id === item.id && w.size === item.size)
    if (!check) return null

    let availableStock = check.stock
    if (check.sizeStock && Object.keys(check.sizeStock).length > 0) {
      const sizeVal = check.sizeStock[item.size]
      if (sizeVal !== undefined) availableStock = sizeVal
    }

    if (availableStock === 0) return { type: 'error', message: 'Out of stock — remove from cart' }
    if (availableStock < item.qty) return { type: 'warning', message: `Only ${availableStock} available — reduce quantity` }
    if (availableStock < 5) return { type: 'info', message: `Only ${availableStock} left in this size` }
    return null
  }

  const hasOutOfStockItems = items.some((item) => getItemWarning(item)?.type === 'error')

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-6 px-4">
        <div className="w-24 h-24 border border-[#B8976A]/20 rounded-full flex items-center justify-center">
          <ShoppingBag size={32} className="text-[#B8976A]/40" />
        </div>
        <div className="text-center">
          <h2 className="font-serif text-2xl text-white mb-2">Your bag is empty</h2>
          <p className="text-sm text-[#5C5C5C]">Add items you love to get started.</p>
        </div>
        <button
          onClick={() => navigate('/products')}
          className="mt-4 bg-gradient-to-r from-[#B8976A] to-[#A88345] text-white rounded-xl px-7 md:px-10 py-4 text-xs uppercase tracking-[0.12em] font-medium hover:shadow-lg hover:shadow-[#B8976A]/20 transition-all"
        >
          Continue Shopping
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="px-4 md:px-8 lg:px-16 py-6 md:py-10">
        <h1 className="font-serif text-2xl md:text-3xl text-white mb-6 md:mb-10 font-light">
          Shopping Bag
          <span className="text-sm text-[#5C5C5C] font-sans font-light ml-3">
            ({count} {count === 1 ? 'item' : 'items'})
          </span>
        </h1>
      </div>

      <div className="px-4 md:px-8 lg:px-16 pb-16">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-12">
          {/* Cart items */}
          <div className="flex-1">
            {items.map((item) => {
              const warning = getItemWarning(item)
              return (
                <div key={`${item.id}-${item.size}-${item.color}`}>
                  <CartItem item={item} />
                  {warning && (
                    <p className={`text-xs mt-1 mb-1 pl-1 ${
                      warning.type === 'error' ? 'text-[#E8A0B0]' :
                      warning.type === 'warning' ? 'text-[#E8A0B0]' : 'text-[#E8A0B0]/70'
                    }`}>
                      ⚠ {warning.message}
                    </p>
                  )}
                </div>
              )
            })}
          </div>

          {/* Order summary */}
          <div className="lg:w-[340px] xl:w-[380px]">
            <CartSummary hasOutOfStockItems={hasOutOfStockItems} />
          </div>
        </div>
      </div>
    </div>
  )
}
