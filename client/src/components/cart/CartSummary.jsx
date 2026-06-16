import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../../hooks/useCart'
import { formatPrice } from '../../utils/formatPrice'
import { applyCoupon, removeCoupon } from '../../store/slices/cartSlice'
import { useDispatch } from 'react-redux'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import { Check, X, Tag } from 'lucide-react'

export default function CartSummary({ hasOutOfStockItems = false }) {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { total, discountedTotal, coupon, shipping, finalTotal } = useCart()
  const [couponInput, setCouponInput] = useState('')
  const [validating, setValidating] = useState(false)

  const handleApplyCoupon = async () => {
    const code = couponInput.trim().toUpperCase()
    if (!code) return
    setValidating(true)
    try {
      const { data } = await api.post('/orders/validate-coupon', { code, orderTotal: total })
      if (data.valid) {
        dispatch(applyCoupon({ code, discountAmount: data.discountAmount }))
        toast.success(data.message)
        setCouponInput('')
      } else {
        toast.error(data.message || 'Invalid coupon code')
      }
    } catch {
      toast.error('Could not validate coupon. Try again.')
    } finally {
      setValidating(false)
    }
  }

  const handleRemoveCoupon = () => {
    dispatch(removeCoupon())
    toast.success('Coupon removed')
  }

  return (
    <div className="bg-[#141414] border border-[#242424] p-6 rounded-2xl">
      <h2 className="font-serif text-lg text-white mb-6 font-light">Order Summary</h2>

      {/* Line items */}
      <div className="space-y-3 mb-5">
        <div className="flex justify-between text-sm">
          <span className="text-[#5C5C5C]">Subtotal</span>
          <span className="text-white">{formatPrice(total)}</span>
        </div>

        {coupon.code && (
          <div className="flex justify-between text-sm text-[#2E7D32]">
            <span>Discount ({coupon.code})</span>
            <span>-{formatPrice(coupon.discountAmount)}</span>
          </div>
        )}

        <div className="flex justify-between text-sm">
          <span className="text-[#5C5C5C]">Shipping</span>
          <span className={shipping === 0 ? 'text-[#2E7D32] font-medium' : 'text-white'}>
            {shipping === 0 ? 'Free' : formatPrice(shipping)}
          </span>
        </div>
      </div>

      <div className="border-t border-[#242424] pt-4 mb-6">
        <div className="flex justify-between items-baseline">
          <span className="text-xs font-medium uppercase tracking-[0.1em] text-[#9A9A9A]">Total</span>
          <span className="font-serif text-2xl text-white font-light">{formatPrice(finalTotal)}</span>
        </div>
      </div>

      {/* Coupon */}
      {!coupon.code ? (
        <div className="mb-6">
          <div className="flex items-center border border-[#242424] rounded-xl px-4 py-3 focus-within:border-[#B8976A] transition-colors bg-[#0A0A0A]">
            <Tag size={14} className="text-[#5C5C5C] mr-3" />
            <input
              type="text"
              placeholder="Coupon code"
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
              className="flex-1 bg-transparent text-sm focus:outline-none uppercase placeholder:normal-case placeholder:text-[#5C5C5C] text-white"
            />
            <button
              onClick={handleApplyCoupon}
              disabled={validating}
              className="text-[11px] uppercase tracking-[0.1em] font-medium text-[#B8976A] hover:text-[#E8A0B0] transition-colors disabled:opacity-40 ml-3"
            >
              {validating ? '...' : 'Apply'}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between bg-[#2E7D32]/10 border border-[#2E7D32]/20 px-4 py-3 rounded-xl mb-6">
          <div className="flex items-center gap-2">
            <Check size={14} className="text-[#2E7D32]" />
            <span className="text-xs text-[#2E7D32]">
              <strong>{coupon.code}</strong> — {formatPrice(coupon.discountAmount)} off
            </span>
          </div>
          <button onClick={handleRemoveCoupon} className="text-[#5C5C5C] hover:text-[#E8A0B0] transition-colors">
            <X size={14} />
          </button>
        </div>
      )}

      {hasOutOfStockItems && (
        <p className="text-xs text-[#E8A0B0] mb-3 text-center">
          Remove out of stock items before checkout
        </p>
      )}
      <button
        onClick={() => navigate('/checkout')}
        disabled={hasOutOfStockItems}
        className={`w-full h-14 text-xs uppercase tracking-[0.15em] font-medium transition-all duration-500 active:scale-[0.99] mb-3 rounded-xl ${
          hasOutOfStockItems
            ? 'bg-[#242424] text-[#5C5C5C] cursor-not-allowed'
            : 'bg-gradient-to-r from-[#E8A0B0] to-[#D48A9A] text-white hover:shadow-[0_8px_30px_rgba(238,107,131,0.3)]'
        }`}
      >
        Proceed to Checkout
      </button>

      <button
        onClick={() => navigate('/products')}
        className="w-full text-center text-[11px] uppercase tracking-[0.1em] text-[#5C5C5C] hover:text-[#B8976A] transition-colors py-2"
      >
        Continue Shopping
      </button>
    </div>
  )
}
