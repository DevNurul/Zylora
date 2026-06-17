import { Minus, Plus, Trash2 } from 'lucide-react'
import { formatPrice } from '../../utils/formatPrice'
import { useCart } from '../../hooks/useCart'

export default function CartItem({ item, compact = false, stockWarning }) {
  const { removeFromCart, updateQty } = useCart()

  const handleRemove = () =>
    removeFromCart({ id: item.id, size: item.size, color: item.color })

  const availableStock = stockWarning?.availableStock ?? Infinity

  const handleQty = (delta) => {
    const newQty = item.qty + delta
    if (newQty > availableStock) return
    updateQty({ id: item.id, size: item.size, color: item.color, qty: newQty })
  }

  if (compact) {
    return (
      <div className="flex gap-4 py-4 border-b border-[#242424]/50 last:border-0">
        <div className="w-16 h-20 flex-shrink-0 bg-[#141414] overflow-hidden rounded-xl">
          <img src={item.image} alt={item.name} className="w-full h-full object-cover" style={{ height: '80px' }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-medium truncate text-white">{item.name}</p>
          <p className="text-[10px] text-[#5C5C5C] mt-1 uppercase tracking-wide">{item.size} · {item.color}</p>
          <div className="flex items-center justify-between mt-2">
            <p className="text-[12px] font-semibold text-white">{formatPrice(item.price * item.qty)}</p>
            <div className="flex items-center gap-2 text-[12px]">
              <button onClick={() => handleQty(-1)} className="text-[#5C5C5C] hover:text-white transition-colors w-10 h-10 flex items-center justify-center rounded-lg">−</button>
              <span className="w-6 text-center font-medium text-white">{item.qty}</span>
              <button onClick={() => handleQty(1)} className="text-[#5C5C5C] hover:text-white transition-colors w-10 h-10 flex items-center justify-center rounded-lg">+</button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-4 md:gap-6 py-5 md:py-8 border-b border-[#242424]/50 last:border-0 group">
      {/* Image */}
      <div className="w-20 h-[104px] md:w-28 md:h-36 flex-shrink-0 bg-[#141414] overflow-hidden rounded-2xl">
        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-base font-medium leading-snug text-white">{item.name}</h3>
            <p className="text-xs text-[#5C5C5C] mt-1.5 uppercase tracking-wide">{item.size} · {item.color}</p>
          </div>
          <button
            onClick={handleRemove}
            className="p-2 text-[#5C5C5C] hover:text-[#E8A0B0] hover:bg-[#E8A0B0]/10 rounded-xl transition-all"
            aria-label="Remove"
          >
            <Trash2 size={15} />
          </button>
        </div>

        <div className="flex items-center justify-between mt-6">
          {/* Qty */}
          <div className="flex items-center gap-0 border border-[#242424] rounded-xl overflow-hidden">
            <button
              onClick={() => handleQty(-1)}
              className="px-3.5 py-2.5 text-[#5C5C5C] hover:text-white hover:bg-white/5 transition-colors text-sm"
            >
              −
            </button>
            <span className="px-4 py-2.5 text-sm font-medium border-x border-[#242424] min-w-[44px] text-center text-white">{item.qty}</span>
            <button
              onClick={() => handleQty(1)}
              className="px-3.5 py-2.5 text-[#5C5C5C] hover:text-white hover:bg-white/5 transition-colors text-sm"
            >
              +
            </button>
          </div>
          <span className="text-base font-semibold text-white">{formatPrice(item.price * item.qty)}</span>
        </div>
      </div>
    </div>
  )
}
