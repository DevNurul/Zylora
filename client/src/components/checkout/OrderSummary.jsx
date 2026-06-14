import { useCart } from '../../hooks/useCart'
import { formatPrice } from '../../utils/formatPrice'

export default function OrderSummary() {
  const { items, total, discountedTotal, coupon, shipping, finalTotal } = useCart()

  return (
    <div className="border border-gray-200 p-6">
      <h2 className="text-lg font-semibold mb-6">Order Summary</h2>

      {/* Items */}
      <div className="space-y-4 mb-6">
        {items.map((item) => (
          <div key={`${item.id}-${item.size}-${item.color}`} className="flex gap-3">
            <div className="relative flex-shrink-0">
              <img src={item.image} alt={item.name} className="w-14 h-18 object-cover bg-[#E8E0D8]" style={{ height: '72px' }} />
              <span className="absolute -top-1.5 -right-1.5 bg-[#0A0A0A] text-white text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold" style={{ width: 18, height: 18 }}>
                {item.qty}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium truncate">{item.name}</p>
              <p className="text-[11px] text-[#9CA3AF] uppercase tracking-wide mt-0.5">{item.size} · {item.color}</p>
              <p className="text-[13px] font-semibold mt-1">{formatPrice(item.price * item.qty)}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="border-t border-gray-200 pt-4 space-y-3">
        <div className="flex justify-between text-[14px]">
          <span className="text-[#6B6B6B]">Subtotal</span>
          <span>{formatPrice(total)}</span>
        </div>
        {coupon.code && (
          <div className="flex justify-between text-[14px] text-green-600">
            <span>Discount ({coupon.code})</span>
            <span>−{formatPrice(total - discountedTotal)}</span>
          </div>
        )}
        <div className="flex justify-between text-[14px]">
          <span className="text-[#6B6B6B]">Shipping</span>
          <span className={shipping === 0 ? 'text-green-600' : ''}>
            {shipping === 0 ? 'Free' : formatPrice(shipping)}
          </span>
        </div>
        <div className="flex justify-between items-baseline pt-3 border-t border-gray-200">
          <span className="text-[13px] uppercase tracking-[0.08em] font-medium">Total</span>
          <span className="text-[1.3rem] font-semibold">{formatPrice(finalTotal)}</span>
        </div>
      </div>
    </div>
  )
}
