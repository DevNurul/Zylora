import { Minus, Plus, Trash2 } from 'lucide-react'
import { formatPrice } from '../../utils/formatPrice'
import { useCart } from '../../hooks/useCart'

export default function CartItem({ item, compact = false }) {
  const { removeFromCart, updateQty } = useCart()

  const handleRemove = () =>
    removeFromCart({ id: item.id, size: item.size, color: item.color })

  const handleQty = (delta) =>
    updateQty({ id: item.id, size: item.size, color: item.color, qty: item.qty + delta })

  if (compact) {
    return (
      <div className="flex gap-3 py-3.5 border-b border-gray-50 last:border-0">
        <div className="w-14 h-18 flex-shrink-0 bg-[#FCD4DB] overflow-hidden">
          <img src={item.image} alt={item.name} className="w-full h-full object-cover" style={{ height: '72px' }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-medium truncate">{item.name}</p>
          <p className="text-[10px] text-[#9CA3AF] mt-0.5 uppercase tracking-wide">{item.size} · {item.color}</p>
          <div className="flex items-center justify-between mt-2">
            <p className="text-[12px] font-semibold">{formatPrice(item.price * item.qty)}</p>
            <div className="flex items-center gap-2 text-[12px]">
              <button onClick={() => handleQty(-1)} className="text-[#9CA3AF] hover:text-[#0A0A0A] transition-colors w-5 text-center">−</button>
              <span className="w-4 text-center font-medium">{item.qty}</span>
              <button onClick={() => handleQty(1)} className="text-[#9CA3AF] hover:text-[#0A0A0A] transition-colors w-5 text-center">+</button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-5 py-8 border-b border-gray-100 last:border-0 group">
      {/* Image */}
      <div className="w-24 h-32 flex-shrink-0 bg-[#FCD4DB] overflow-hidden">
        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-[15px] font-medium leading-snug">{item.name}</h3>
            <p className="text-[12px] text-[#9CA3AF] mt-1 uppercase tracking-wide">{item.size} · {item.color}</p>
          </div>
          <button
            onClick={handleRemove}
            className="p-1 text-gray-300 hover:text-red-500 transition-colors"
            aria-label="Remove"
          >
            <Trash2 size={15} />
          </button>
        </div>

        <div className="flex items-center justify-between mt-5">
          {/* Qty */}
          <div className="flex items-center gap-0 border border-gray-150">
            <button
              onClick={() => handleQty(-1)}
              className="px-3 py-2 text-[#6B6B6B] hover:text-[#0A0A0A] hover:bg-gray-50 transition-colors text-[14px]"
            >
              −
            </button>
            <span className="px-4 py-2 text-[14px] font-medium border-x border-gray-100 min-w-[44px] text-center">{item.qty}</span>
            <button
              onClick={() => handleQty(1)}
              className="px-3 py-2 text-[#6B6B6B] hover:text-[#0A0A0A] hover:bg-gray-50 transition-colors text-[14px]"
            >
              +
            </button>
          </div>
          <span className="text-[15px] font-semibold">{formatPrice(item.price * item.qty)}</span>
        </div>
      </div>
    </div>
  )
}
