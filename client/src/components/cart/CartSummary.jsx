import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../../hooks/useCart'
import { formatPrice } from '../../utils/formatPrice'
import { applyCoupon, removeCoupon } from '../../store/slices/cartSlice'
import { useDispatch } from 'react-redux'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import { Check, X } from 'lucide-react'

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
    <div className="border border-gray-200 p-6">
      <h2 className="text-lg font-semibold mb-6">Order Summary</h2>

      {/* Line items */}
      <div className="space-y-3 mb-5">
        <div className="flex justify-between text-[14px]">
          <span className="text-[#6B6B6B]">Subtotal</span>
          <span>{formatPrice(total)}</span>
        </div>

        {coupon.code && (
          <div className="flex justify-between text-[14px] text-green-600">
            <span>Discount ({coupon.code})</span>
            <span>−{formatPrice(coupon.discountAmount)}</span>
          </div>
        )}

        <div className="flex justify-between text-[14px]">
          <span className="text-[#6B6B6B]">Shipping</span>
          <span className={shipping === 0 ? 'text-green-600 font-medium' : ''}>
            {shipping === 0 ? 'Free' : formatPrice(shipping)}
          </span>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-4 mb-6">
        <div className="flex justify-between items-baseline">
          <span className="text-[13px] font-medium uppercase tracking-[0.08em]">Total</span>
          <span className="text-[1.4rem] font-semibold">{formatPrice(finalTotal)}</span>
        </div>
      </div>

      {/* Coupon */}
      {!coupon.code ? (
        <div className="mb-6">
          <div className="flex border-b border-[#c5bdb4] pb-1 focus-within:border-[#EE6B83] transition-colors">
            <input
              type="text"
              placeholder="Coupon code"
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
              className="flex-1 bg-transparent text-[13px] focus:outline-none uppercase placeholder:normal-case placeholder:text-[#9CA3AF]"
            />
            <button
              onClick={handleApplyCoupon}
              disabled={validating}
              className="text-[11px] uppercase tracking-[0.1em] font-semibold text-[#0A0A0A] hover:text-[#EE6B83] transition-colors disabled:opacity-40 ml-3"
            >
              {validating ? '...' : 'Apply'}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between bg-green-50 border border-green-200 px-3 py-2.5 mb-6">
          <div className="flex items-center gap-2">
            <Check size={13} className="text-green-600" />
            <span className="text-[12px] text-green-700">
              <strong>{coupon.code}</strong> — {formatPrice(coupon.discountAmount)} off
            </span>
          </div>
          <button onClick={handleRemoveCoupon} className="text-gray-400 hover:text-red-500 transition-colors">
            <X size={13} />
          </button>
        </div>
      )}

      {hasOutOfStockItems && (
        <p className="text-xs text-red-500 mb-3 text-center">
          Remove out of stock items before checkout
        </p>
      )}
      <button
        onClick={() => navigate('/checkout')}
        disabled={hasOutOfStockItems}
        className={`w-full h-14 text-[12px] uppercase tracking-[0.15em] font-medium transition-all duration-300 active:scale-[0.99] mb-3 rounded-lg ${
          hasOutOfStockItems
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-[#EE6B83] text-white hover:bg-[#D9506A]'
        }`}
      >
        Proceed to Checkout
      </button>

      <button
        onClick={() => navigate('/products')}
        className="w-full text-center text-[11px] uppercase tracking-[0.08em] text-[#9CA3AF] hover:text-[#EE6B83] transition-colors"
      >
        Continue Shopping
      </button>
    </div>
  )
}
