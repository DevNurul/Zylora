import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchMyOrderById, clearSelectedOrder } from '../store/slices/myOrdersSlice'
import { fetchMyReturnRequests } from '../store/slices/returnSlice'
import ReturnStatusCard from '../components/returns/ReturnStatusCard'
import ReturnRequestForm from '../components/returns/ReturnRequestForm'
import { RETURN_WINDOW_DAYS, EXCHANGE_WINDOW_DAYS } from '../utils/returnReasons'
import { Printer } from 'lucide-react'
import { downloadPdf } from '../utils/downloadPdf'

function fmt(n) { return '₹' + Number(n).toLocaleString('en-IN') }
function fmtDate(iso) { return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) }
function fmtDatetime(iso) {
  if (!iso) return null
  return new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function OrderDetailSkeleton() {
  return (
    <div className="max-w-[860px] mx-auto py-12 px-4">
      <div className="h-4 w-32 bg-[#1C1C1C] animate-pulse mb-8 rounded" />
      <div className="h-8 w-48 bg-[#1C1C1C] animate-pulse mb-2 rounded" />
      <div className="h-4 w-64 bg-[#1C1C1C] animate-pulse mb-8 rounded" />
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-6">
          <div className="bg-[#141414] p-6 rounded-lg border border-[#242424]">
            <div className="h-4 w-24 bg-[#1C1C1C] animate-pulse mb-6 rounded" />
            {[0, 1].map(i => (
              <div key={i} className="flex gap-4 mb-6">
                <div className="w-20 h-24 bg-[#1C1C1C] animate-pulse flex-shrink-0 rounded" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 bg-[#1C1C1C] animate-pulse rounded" />
                  <div className="h-3 w-1/2 bg-[#1C1C1C] animate-pulse rounded" />
                  <div className="h-3 w-1/3 bg-[#1C1C1C] animate-pulse rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <div className="bg-[#141414] p-6 rounded-lg border border-[#242424]">
            <div className="h-4 w-28 bg-[#1C1C1C] animate-pulse mb-6 rounded" />
            {[0, 1, 2, 3].map(i => (
              <div key={i} className="flex justify-between mb-4">
                <div className="h-3 w-20 bg-[#1C1C1C] animate-pulse rounded" />
                <div className="h-3 w-16 bg-[#1C1C1C] animate-pulse rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function OrderItemsCard({ items }) {
  return (
    <div className="bg-[#141414] p-6 rounded-lg border border-[#242424]">
      <p className="text-[13px] uppercase tracking-[0.08em] font-medium text-white mb-5">Items Ordered</p>
      <div>
        {items.map((item, i) => (
          <div key={i}>
            {i > 0 && <div className="border-t border-[#242424] my-4" />}
            <div className="flex gap-4 items-start">
              {item.image
                ? <img src={item.image} alt={item.name} className="w-20 h-24 object-cover border border-[#242424] flex-shrink-0 rounded" />
                : <div className="w-20 h-24 bg-[#1C1C1C] border border-[#242424] flex-shrink-0 rounded" />
              }
              <div className="flex-1">
                <p className="text-[15px] font-medium text-white mb-1">{item.name}</p>
                <p className="text-[13px] text-[#9A9A9A] mb-0.5">Size: {item.size}</p>
                <p className="text-[13px] text-[#9A9A9A] mb-0.5">Color: {item.color}</p>
                <p className="text-[13px] text-[#9A9A9A] m-0">Qty: {item.qty}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-[13px] text-[#9A9A9A] mb-1">{fmt(item.price)} × {item.qty}</p>
                <p className="text-[15px] font-medium text-white mb-0">{fmt(item.subtotal ?? item.price * item.qty)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const TIMELINE_STEPS = [
  { key: 'pending', label: 'Order Placed' },
  { key: 'confirmed', label: 'Order Confirmed' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'out_for_delivery', label: 'Out for Delivery' },
  { key: 'delivered', label: 'Delivered' },
]
const STEP_KEYS = TIMELINE_STEPS.map(s => s.key)

function StatusTimelineCard({ status, statusHistory, trackingNumber }) {
  const currentIdx = STEP_KEYS.indexOf(status)
  const isCancelled = status === 'cancelled'
  const getTimestamp = (key) => { const entry = statusHistory?.find(h => h.status === key); return entry ? fmtDatetime(entry.timestamp) : null }

  return (
    <div className="bg-[#141414] p-6 rounded-lg border border-[#242424]">
      <p className="text-[13px] uppercase tracking-[0.08em] font-medium text-white mb-5">Order Timeline</p>
      {isCancelled ? (
        <div className="flex items-center gap-3 p-4 bg-[#fef2f2] border border-[#fecaca] rounded-lg">
          <div className="w-9 h-10 rounded-full bg-[#EF4444] text-white flex items-center justify-center text-[11px] font-bold flex-shrink-0">✕</div>
          <div>
            <p className="text-[14px] font-medium text-[#b91c1c] m-0">Order Cancelled</p>
            {getTimestamp('cancelled') && <p className="text-[12px] text-[#EF4444] m-0 mt-0.5">{getTimestamp('cancelled')}</p>}
          </div>
        </div>
      ) : (
        TIMELINE_STEPS.map((step, i) => {
          const isCompleted = i < currentIdx
          const isCurrent = i === currentIdx
          const isLast = i === TIMELINE_STEPS.length - 1
          const ts = getTimestamp(step.key)
          return (
            <div key={step.key} className="flex gap-3">
              <div className="flex flex-col items-center w-5">
                <div className={`w-9 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-[11px] font-bold text-white ${
                  (step.key === 'delivered' && status === 'delivered') ? 'bg-[#16a34a]' : isCompleted ? 'bg-[#B8976A]' : isCurrent ? 'bg-[#B8976A]' : 'bg-[#141414] border-2 border-[#242424]'
                }`} style={{ boxShadow: (step.key === 'delivered' && status === 'delivered') ? '0 0 0 3px #bbf7d060' : isCurrent ? '0 0 0 3px #B8976A40' : 'none' }}>
                  {isCompleted && '✓'}
                </div>
                {!isLast && <div className={`w-0.5 flex-1 min-h-6 my-0.5 ${status === 'delivered' && isCompleted ? 'bg-[#16a34a]' : isCompleted ? 'bg-[#B8976A]' : 'bg-[#242424]'}`} />}
              </div>
              <div className={`${isLast ? 'pb-0' : 'pb-5'} flex-1`}>
                <p className={`text-[14px] font-medium m-0 mb-0.5 ${
                  (status === 'delivered' && step.key === 'delivered') ? 'text-[#16a34a]' : isCompleted ? 'text-white' : isCurrent ? 'text-[#B8976A]' : 'text-[#5C5C5C]'
                }`} style={{ fontWeight: (isCurrent || (status === 'delivered' && step.key === 'delivered')) ? 600 : 500 }}>
                  {step.label}
                  {isCurrent && status !== 'delivered' && (
                    <span className="ml-2 text-[10px] bg-[#B8976A20] text-[#B8976A] border border-[#B8976A] px-1.5 py-0.5 font-medium rounded">In Progress</span>
                  )}
                </p>
                <p className="text-[12px] text-[#5C5C5C] m-0">{ts || '—'}</p>
              </div>
            </div>
          )
        })
      )}
      {trackingNumber && (
        <div className="mt-5 pt-5 border-t border-[#242424]">
          <p className="text-[11px] uppercase tracking-[0.08em] text-[#5C5C5C] mb-1.5">Tracking Number</p>
          <p className="font-mono font-medium text-[15px] text-white break-all m-0">{trackingNumber}</p>
        </div>
      )}
    </div>
  )
}

function ReturnSection({ order }) {
  const dispatch = useDispatch()
  const { requests: returnRequests } = useSelector(s => s.returns)
  const [showForm, setShowForm] = useState(null)

  useEffect(() => { dispatch(fetchMyReturnRequests()) }, [dispatch])
  if (order.status !== 'delivered') return null
  const existingRequest = returnRequests.find(r => r.orderId === order.orderId)
  const deliveredEntry = order.statusHistory?.find(h => h.status === 'delivered')
  const deliveredAt = deliveredEntry?.timestamp || order.createdAt
  const days = Math.floor((Date.now() - new Date(deliveredAt)) / 86_400_000)
  const canReturn = days <= RETURN_WINDOW_DAYS
  const canExchange = days <= EXCHANGE_WINDOW_DAYS

  return (
    <div className="bg-[#141414] p-6 mt-4 rounded-lg border border-[#242424]">
      <p className="text-[13px] uppercase tracking-[0.08em] font-medium text-white mb-4">Returns & Exchange</p>
      {existingRequest ? (
        <ReturnStatusCard request={existingRequest} />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="border border-[#242424] p-5 text-center rounded-lg">
              <p className="text-[15px] font-medium text-white m-0 mb-1">Request Refund</p>
              <p className="text-[13px] text-[#9A9A9A] m-0 mb-1.5">Return your item for a full refund</p>
              <p className={`text-[12px] m-0 mb-3 ${canReturn ? 'text-[#16a34a]' : 'text-[#EF4444]'}`}>
                {canReturn ? `${RETURN_WINDOW_DAYS - days} days left` : 'Return window expired'}
              </p>
              <button onClick={() => setShowForm(showForm === 'return' ? null : 'return')} disabled={!canReturn}
                className={`w-full h-10 border-none text-[12px] uppercase tracking-[0.06em] cursor-pointer rounded-lg transition-all ${
                  canReturn ? 'bg-gradient-to-r from-[#E8A0B0] to-[#D48A9A] text-white hover:shadow-[0_8px_30px_rgba(238,107,131,0.3)]' : 'bg-[#242424] text-[#5C5C5C] cursor-not-allowed'
                }`}>
                {canReturn ? 'Start Return' : 'Not Available'}
              </button>
            </div>
            <div className="border border-[#242424] p-5 text-center rounded-lg">
              <p className="text-[15px] font-medium text-white m-0 mb-1">Exchange Size</p>
              <p className="text-[13px] text-[#9A9A9A] m-0 mb-1.5">Swap for a different size</p>
              <p className={`text-[12px] m-0 mb-3 ${canExchange ? 'text-[#16a34a]' : 'text-[#EF4444]'}`}>
                {canExchange ? `${EXCHANGE_WINDOW_DAYS - days} days left` : 'Exchange window expired'}
              </p>
              <button onClick={() => setShowForm(showForm === 'exchange' ? null : 'exchange')} disabled={!canExchange}
                className={`w-full h-10 text-[12px] uppercase tracking-[0.06em] cursor-pointer rounded-lg transition-all bg-transparent ${
                  canExchange ? 'border border-[#B8976A] text-[#B8976A] hover:bg-[#B8976A] hover:text-white' : 'border border-[#242424] text-[#5C5C5C] cursor-not-allowed'
                }`}>
                {canExchange ? 'Start Exchange' : 'Not Available'}
              </button>
            </div>
          </div>
          <p className="text-[11px] text-[#5C5C5C] text-center mt-3">
            Exchange available for {EXCHANGE_WINDOW_DAYS} days · Returns available for {RETURN_WINDOW_DAYS} days after delivery
          </p>
          {showForm && <ReturnRequestForm type={showForm} order={order} onClose={() => setShowForm(null)} onSuccess={() => { setShowForm(null); dispatch(fetchMyReturnRequests()) }} />}
        </>
      )}
    </div>
  )
}

function OrderSummaryCard({ order }) {
  const [downloading, setDownloading] = useState(false)

  const handlePrint = async () => {
    try {
      setDownloading(true)
      await downloadPdf(`/api/my-orders/${order.orderId}/print`, `ZYLARA-${order.orderId}.pdf`)
    } catch (err) {
      console.error('Download failed:', err)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="bg-[#141414] p-6 rounded-lg border border-[#242424]">
      <p className="text-[13px] uppercase tracking-[0.08em] font-medium text-white mb-4">Order Summary</p>
      <div className="flex justify-between text-[14px] text-[#9A9A9A] pb-3">
        <span>Subtotal</span><span className="text-white">{fmt(order.subtotal)}</span>
      </div>
      {order.discount > 0 && (
        <div className="flex justify-between text-[14px] text-[#9A9A9A] pb-3">
          <span>Discount {order.couponCode && <span className="text-[10px] bg-[#1C1C1C] px-1.5 py-0.5 ml-1 rounded border border-[#242424]">{order.couponCode}</span>}</span>
          <span className="text-[#16a34a]">−{fmt(order.discount)}</span>
        </div>
      )}
      <div className="flex justify-between text-[14px] text-[#9A9A9A] pb-3">
        <span>Shipping</span>
        <span className={order.shippingCharge === 0 ? 'text-[#16a34a]' : 'text-white'}>
          {order.shippingCharge === 0 ? 'FREE' : fmt(order.shippingCharge)}
        </span>
      </div>
      <div className="border-t border-[#242424] pt-3 flex justify-between text-[16px] font-medium text-white">
        <span>Total</span><span>{fmt(order.total)}</span>
      </div>
      <div className="mt-4 pt-4 border-t border-[#242424] flex justify-between items-center">
        <span className="text-[13px] text-[#9A9A9A]">Payment</span>
        <div className="text-right">
          <span className="text-[13px] text-white">{order.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Online'}</span>
          <span className={`block text-[10px] uppercase tracking-[0.06em] mt-0.5 px-2 py-0.5 rounded ${
            order.paymentStatus === 'paid' ? 'bg-[#f0fdf4] text-[#15803d] border border-[#bbf7d0]'
            : order.paymentStatus === 'failed' ? 'bg-[#fef2f2] text-[#b91c1c] border border-[#fecaca]'
            : 'bg-[#fefce8] text-[#a16207] border border-[#fde68a]'
          }`}>{order.paymentStatus}</span>
        </div>
      </div>
      <button
        onClick={handlePrint}
        disabled={downloading}
        className="w-full mt-4 flex items-center justify-center gap-2 bg-gradient-to-r from-[#B8976A] to-[#A88345] text-white py-2.5 text-[12px] uppercase tracking-widest font-medium hover:shadow-lg hover:shadow-[#B8976A]/20 transition-all rounded-lg disabled:opacity-50"
      >
        <Printer size={13} />
        {downloading ? 'Downloading...' : 'Print Invoice + Label'}
      </button>
    </div>
  )
}

function ShippingDetailsCard({ address }) {
  if (!address) return null
  return (
    <div className="bg-[#141414] p-6 mt-4 rounded-lg border border-[#242424]">
      <p className="text-[13px] uppercase tracking-[0.08em] font-medium text-white mb-4">Delivering To</p>
      <p className="text-[15px] font-medium text-white m-0 mb-1">{address.fullName || address.customerName}</p>
      <p className="text-[13px] text-[#9A9A9A] m-0 mb-2">{address.phone}</p>
      <p className="text-[13px] text-[#9A9A9A] m-0" style={{ lineHeight: 1.8 }}>
        {address.addressLine1}{address.addressLine2 && <><br />{address.addressLine2}</>}
        <br />{address.city}, {address.state} — {address.pincode}
      </p>
    </div>
  )
}

export default function OrderDetailPage() {
  const { orderId } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { selectedOrder, detailLoading, error } = useSelector(s => s.myOrders)

  useEffect(() => {
    if (orderId) dispatch(fetchMyOrderById(orderId))
    return () => { dispatch(clearSelectedOrder()) }
  }, [orderId, dispatch])

  if (detailLoading) return <OrderDetailSkeleton />
  if (error) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center bg-[#141414] p-12 rounded-xl border border-[#242424]">
        <p className="text-[#EF4444] mb-4">{error}</p>
        <button onClick={() => dispatch(fetchMyOrderById(orderId))}
          className="bg-gradient-to-r from-[#E8A0B0] to-[#D48A9A] text-white border-none px-6 py-2.5 cursor-pointer text-[13px] mr-3 rounded-xl transition-all hover:shadow-[0_8px_30px_rgba(238,107,131,0.3)]">
          Retry
        </button>
        <button onClick={() => navigate('/my-orders')}
          className="bg-transparent border-none cursor-pointer text-[13px] text-[#9A9A9A] underline">
          Back to My Orders
        </button>
      </div>
    </div>
  )
  if (!selectedOrder) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-[#9A9A9A] mb-4">Order not found.</p>
        <button onClick={() => navigate('/my-orders')}
          className="bg-transparent border-none cursor-pointer text-[13px] text-[#B8976A] underline">
          Back to My Orders
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-[860px] mx-auto">
        <button onClick={() => navigate('/my-orders')}
          className="bg-transparent border-none cursor-pointer flex items-center gap-1.5 text-[13px] text-[#9A9A9A] mb-6 p-0 hover:text-white transition-colors">
          ← Back to My Orders
        </button>

        <div className="mb-7">
          <h1 className="text-[28px] font-light text-white m-0 mb-1.5" style={{ fontFamily: '"Cormorant Garamond",Georgia,serif' }}>Order Details</h1>
          <p className="text-[13px] text-[#9A9A9A] m-0">{selectedOrder.orderId} &nbsp;·&nbsp; {fmtDate(selectedOrder.createdAt)}</p>
        </div>

        <div className="flex gap-6 flex-wrap items-start">
          <div className="flex-1 min-w-0">
            <OrderItemsCard items={selectedOrder.items} />
            <div className="mt-4">
              <StatusTimelineCard status={selectedOrder.status} statusHistory={selectedOrder.statusHistory || []} trackingNumber={selectedOrder.trackingNumber} />
            </div>
            <ReturnSection order={selectedOrder} />
          </div>
          <div className="w-full sm:w-[320px] flex-shrink-0">
            <OrderSummaryCard order={selectedOrder} />
            <ShippingDetailsCard address={selectedOrder.shippingAddress} />
          </div>
        </div>
      </div>
    </div>
  )
}
