import { useNavigate } from 'react-router-dom'
import StatusBadge from './StatusBadge'

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
}

function formatPrice(n) {
  return '₹' + Number(n).toLocaleString('en-IN')
}

export default function OrderCard({ order }) {
  const navigate = useNavigate()
  const preview  = order.items.slice(0, 3)
  const extra    = order.items.length - 3

  return (
    <div
      onClick={() => navigate(`/my-orders/${order.orderId}`)}
      className="bg-[#141414] border border-[#242424] rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:border-[#B8976A]/30 hover:shadow-[0_0_30px_rgba(201,168,106,0.08)]"
    >
      {/* Top row */}
      <div className="flex justify-between items-start">
        <div>
          <p className="font-mono text-sm font-semibold text-white m-0">
            {order.orderId}
          </p>
          <p className="text-xs text-[#5C5C5C] mt-1">{formatDate(order.createdAt)}</p>
        </div>
        <div className="text-right">
          <StatusBadge status={order.status} />
          <p className="text-base font-semibold text-white mt-1.5">
            {formatPrice(order.total)}
          </p>
        </div>
      </div>

      {/* Product image strip */}
      <div className="flex gap-2 my-4">
        {preview.map((item, i) => (
          item.image
            ? <img key={i} src={item.image} alt={item.name} className="w-16 h-16 object-cover border border-[#242424] rounded-xl flex-shrink-0" />
            : <div key={i} className="w-16 h-16 bg-[#0A0A0A] border border-[#242424] rounded-xl flex-shrink-0" />
        ))}
        {extra > 0 && (
          <div className="w-16 h-16 bg-[#0A0A0A] border border-[#242424] rounded-xl flex items-center justify-center text-xs text-[#5C5C5C] flex-shrink-0">
            +{extra} more
          </div>
        )}
      </div>

      {/* Bottom row */}
      <div className="flex justify-between items-end">
        <div>
          <p className="text-xs text-[#5C5C5C] m-0">
            {order.itemCount} {order.itemCount === 1 ? 'item' : 'items'}
          </p>
          {order.shippingAddress?.city && (
            <p className="text-xs text-[#5C5C5C] mt-1">
              {order.shippingAddress.city}, {order.shippingAddress.state}
            </p>
          )}
        </div>
        <span className="text-xs uppercase tracking-[0.06em] text-[#9A9A9A] transition-colors hover:text-[#B8976A]">
          View Details →
        </span>
      </div>
    </div>
  )
}
