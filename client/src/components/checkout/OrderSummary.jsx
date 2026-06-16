import { useCart } from '../../hooks/useCart'
import { formatPrice } from '../../utils/formatPrice'

export default function OrderSummary() {
  const { items, total, discountedTotal, coupon, shipping, finalTotal } = useCart()

  return (
    <div className="bg-[#141414] border border-[#242424] p-6 rounded-2xl">
      <h2 className="font-serif text-lg text-white mb-6">Order Summary</h2>

      {/* Items */}
      <div className="space-y-4 mb-6">
        {items.map((item) => (
          <div key={`${item.id}-${item.size}-${item.color}`} className="flex gap-3">
            <div className="relative flex-shrink-0">
              <img src={item.image} alt={item.name} className="w-14 h-18 object-cover bg-[#0A0A0A] rounded-xl border border-[#242424]" style={{ height: '72px' }} />
              <span className="absolute -top-1.5 -right-1.5 bg-gradient-to-r from-[#B8976A] to-[#A88345] text-white text-[9px] w-[18px] h-[18px] rounded-full flex items-center justify-center font-bold">
                {item.qty}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium truncate text-white">{item.name}</p>
              <p className="text-[10px] text-[#5C5C5C] uppercase tracking-wide mt-0.5">{item.size} · {item.color}</p>
              <p className="text-[13px] font-semibold mt-1 text-white">{formatPrice(item.price * item.qty)}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="border-t border-[#242424] pt-4 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-[#5C5C5C]">Subtotal</span>
          <span className="text-white">{formatPrice(total)}</span>
        </div>
        {coupon.code && (
          <div className="flex justify-between text-sm text-[#2E7D32]">
            <span>Discount ({coupon.code})</span>
            <span>-{formatPrice(total - discountedTotal)}</span>
          </div>
        )}
        <div className="flex justify-between text-sm">
          <span className="text-[#5C5C5C]">Shipping</span>
          <span className={shipping === 0 ? 'text-[#2E7D32]' : 'text-white'}>
            {shipping === 0 ? 'Free' : formatPrice(shipping)}
          </span>
        </div>
        <div className="flex justify-between items-baseline pt-3 border-t border-[#242424]">
          <span className="text-xs uppercase tracking-[0.1em] font-semibold text-[#9A9A9A]">Total</span>
          <span className="font-serif text-xl text-white">{formatPrice(finalTotal)}</span>
        </div>
      </div>
    </div>
  )
}
