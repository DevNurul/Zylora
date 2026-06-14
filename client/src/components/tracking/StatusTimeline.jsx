import { Check, Calendar } from 'lucide-react'

const STATUS_STEPS = ['pending', 'confirmed', 'shipped', 'out_for_delivery', 'delivered']
const STEP_LABELS = {
  pending: 'Order Placed',
  confirmed: 'Order Confirmed',
  shipped: 'Shipped',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
}

export default function StatusTimeline({ order }) {
  if (!order) return null

  const isCancelled = order.status === 'cancelled'
  const currentIndex = isCancelled ? -1 : STATUS_STEPS.indexOf(order.status)

  const historyMap = {}
  ;(order.statusHistory || []).forEach((h) => { historyMap[h.status] = h })

  const formatDate = (iso) => {
    if (!iso) return null
    return new Date(iso).toLocaleString('en-IN', {
      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
    })
  }

  return (
    <div className="mt-10">
      <div className="bg-gray-50 border border-gray-200 px-5 py-4 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.12em] text-[#9CA3AF] mb-0.5">Order ID</p>
            <p className="font-mono text-[15px] font-bold">{order.orderId}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-[0.12em] text-[#9CA3AF] mb-0.5">Email</p>
            <p className="text-[13px]">{order.email}</p>
          </div>
        </div>
      </div>

      {isCancelled ? (
        <div className="border border-red-200 bg-red-50 px-5 py-4 text-[14px] text-red-700">
          This order has been <strong>cancelled</strong>.
        </div>
      ) : (
        <div className="relative pl-10">
          {/* Vertical line */}
          <div className="absolute left-3.5 top-3 bottom-3 w-px bg-gray-100" />

          {STATUS_STEPS.map((status, i) => {
            const isDone = i < currentIndex
            const isCurrent = i === currentIndex
            const isFuture = i > currentIndex
            const history = historyMap[status]

            return (
              <div key={status} className="relative mb-9 last:mb-0">
                {/* Circle indicator */}
                <div className="absolute -left-10 top-0.5">
                  {isDone ? (
                    <div className="w-6 h-6 rounded-full bg-[#EE6B83] flex items-center justify-center">
                      <Check size={11} className="text-white" strokeWidth={3} />
                    </div>
                  ) : isCurrent ? (
                    <div className="w-6 h-6 rounded-full bg-[#EE6B83] animate-pulse-ring flex items-center justify-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-white" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full border-2 border-gray-150 bg-white" />
                  )}
                </div>

                {/* Content */}
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className={`text-[14px] font-medium ${isFuture ? 'text-gray-300' : 'text-[#0A0A0A]'}`}>
                      {STEP_LABELS[status]}
                    </p>
                    {isCurrent && (
                      <span className="text-[9px] uppercase tracking-wider bg-[#FCD4DB] text-[#D9506A] px-2 py-0.5 font-semibold">
                        In Progress
                      </span>
                    )}
                  </div>
                  {order.trackingNumber && status === 'shipped' && !isFuture && (
                    <p className="text-[12px] text-[#6B6B6B] mt-0.5">
                      Tracking: <span className="font-mono font-medium">{order.trackingNumber}</span>
                    </p>
                  )}
                  {history?.note && !isFuture && (
                    <p className="text-[12px] text-[#6B6B6B] mt-0.5">{history.note}</p>
                  )}
                  <p className={`text-[11px] mt-0.5 ${isFuture ? 'text-gray-200' : 'text-[#9CA3AF]'}`}>
                    {history?.timestamp ? formatDate(history.timestamp) : isFuture ? '—' : ''}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Estimated delivery */}
      {order.estimatedDelivery && order.status !== 'delivered' && order.status !== 'cancelled' && (
        <div className="mt-8 bg-gray-50 border border-gray-200 px-5 py-4 flex items-center gap-3">
          <Calendar size={16} className="text-[#EE6B83] flex-shrink-0" />
          <p className="text-[13px] text-[#0A0A0A]">
            Estimated Delivery:{' '}
            <strong>
              {new Date(order.estimatedDelivery).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'long', year: 'numeric',
              })}
            </strong>
          </p>
        </div>
      )}
    </div>
  )
}
