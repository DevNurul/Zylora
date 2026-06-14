import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchMyOrderById, clearSelectedOrder } from '../store/slices/myOrdersSlice'
import { fetchMyReturnRequests } from '../store/slices/returnSlice'
import ReturnStatusCard from '../components/returns/ReturnStatusCard'
import ReturnRequestForm from '../components/returns/ReturnRequestForm'
import { RETURN_WINDOW_DAYS, EXCHANGE_WINDOW_DAYS } from '../utils/returnReasons'

/* ── Formatters ──────────────────────────────────────────────────────────────── */
function fmt(n) {
  return '₹' + Number(n).toLocaleString('en-IN')
}
function fmtDate(iso) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
}
function fmtDatetime(iso) {
  if (!iso) return null
  return new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

/* ── Skeleton ────────────────────────────────────────────────────────────────── */
function OrderDetailSkeleton() {
  return (
    <div className="max-w-[860px] mx-auto py-12 px-4">
      <div className="h-4 w-32 bg-gray-200 animate-pulse mb-8 rounded" />
      <div className="h-8 w-48 bg-gray-200 animate-pulse mb-2 rounded" />
      <div className="h-4 w-64 bg-gray-200 animate-pulse mb-8 rounded" />
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-6">
          <div className="bg-white p-6">
            <div className="h-4 w-24 bg-gray-200 animate-pulse mb-6 rounded" />
            {[0, 1].map(i => (
              <div key={i} className="flex gap-4 mb-6">
                <div className="w-20 h-24 bg-gray-200 animate-pulse flex-shrink-0 rounded" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 bg-gray-200 animate-pulse rounded" />
                  <div className="h-3 w-1/2 bg-gray-200 animate-pulse rounded" />
                  <div className="h-3 w-1/3 bg-gray-200 animate-pulse rounded" />
                </div>
              </div>
            ))}
          </div>
          <div className="bg-white p-6">
            <div className="h-4 w-32 bg-gray-200 animate-pulse mb-6 rounded" />
            {[0, 1, 2, 3, 4].map(i => (
              <div key={i} className="flex gap-4 mb-6">
                <div className="w-5 h-5 rounded-full bg-gray-200 animate-pulse flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 bg-gray-200 animate-pulse rounded" />
                  <div className="h-3 w-48 bg-gray-200 animate-pulse rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <div className="bg-white p-6">
            <div className="h-4 w-28 bg-gray-200 animate-pulse mb-6 rounded" />
            {[0, 1, 2, 3].map(i => (
              <div key={i} className="flex justify-between mb-4">
                <div className="h-3 w-20 bg-gray-200 animate-pulse rounded" />
                <div className="h-3 w-16 bg-gray-200 animate-pulse rounded" />
              </div>
            ))}
          </div>
          <div className="bg-white p-6">
            <div className="h-4 w-24 bg-gray-200 animate-pulse mb-4 rounded" />
            <div className="space-y-2">
              <div className="h-4 w-32 bg-gray-200 animate-pulse rounded" />
              <div className="h-3 w-24 bg-gray-200 animate-pulse rounded" />
              <div className="h-3 w-full bg-gray-200 animate-pulse rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── OrderItemsCard ──────────────────────────────────────────────────────────── */
function OrderItemsCard({ items }) {
  return (
    <div className="bg-white p-6">
      <p style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500, color: '#0A0A0A', margin: '0 0 20px' }}>
        Items Ordered
      </p>
      <div>
        {items.map((item, i) => (
          <div key={i}>
            {i > 0 && <div style={{ borderTop: '1px solid #F0F0F0', margin: '16px 0' }} />}
            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              {item.image
                ? <img src={item.image} alt={item.name} style={{ width: 80, height: 96, objectFit: 'cover', border: '1px solid #E5E5E5', flexShrink: 0 }} />
                : <div style={{ width: 80, height: 96, background: '#FCD4DB', border: '1px solid #E5E5E5', flexShrink: 0 }} />
              }
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 15, fontWeight: 500, color: '#0A0A0A', margin: '0 0 4px' }}>{item.name}</p>
                <p style={{ fontSize: 13, color: '#6B6B6B', margin: '0 0 2px' }}>Size: {item.size}</p>
                <p style={{ fontSize: 13, color: '#6B6B6B', margin: '0 0 2px' }}>Color: {item.color}</p>
                <p style={{ fontSize: 13, color: '#6B6B6B', margin: 0 }}>Qty: {item.qty}</p>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <p style={{ fontSize: 13, color: '#6B6B6B', margin: '0 0 4px' }}>{fmt(item.price)} × {item.qty}</p>
                <p style={{ fontSize: 15, fontWeight: 600, color: '#0A0A0A', margin: 0 }}>{fmt(item.subtotal ?? item.price * item.qty)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── StatusTimelineCard ──────────────────────────────────────────────────────── */
const TIMELINE_STEPS = [
  { key: 'pending',          label: 'Order Placed' },
  { key: 'confirmed',        label: 'Order Confirmed' },
  { key: 'shipped',          label: 'Shipped' },
  { key: 'out_for_delivery', label: 'Out for Delivery' },
  { key: 'delivered',        label: 'Delivered' },
]
const STEP_KEYS = TIMELINE_STEPS.map(s => s.key)

function StatusTimelineCard({ status, statusHistory, trackingNumber }) {
  const currentIdx  = STEP_KEYS.indexOf(status)
  const isCancelled = status === 'cancelled'

  const getTimestamp = (key) => {
    const entry = statusHistory?.find(h => h.status === key)
    return entry ? fmtDatetime(entry.timestamp) : null
  }

  return (
    <div className="bg-white p-6">
      <p style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500, color: '#0A0A0A', margin: '0 0 20px' }}>
        Order Timeline
      </p>

      {isCancelled ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px', background: '#fef2f2', border: '1px solid #fecaca' }}>
          <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#EF4444', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>✕</div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 500, color: '#b91c1c', margin: 0 }}>Order Cancelled</p>
            {getTimestamp('cancelled') && (
              <p style={{ fontSize: 12, color: '#ef4444', margin: '2px 0 0' }}>{getTimestamp('cancelled')}</p>
            )}
          </div>
        </div>
      ) : (
        TIMELINE_STEPS.map((step, i) => {
          const isCompleted = i < currentIdx
          const isCurrent   = i === currentIdx
          const isLast      = i === TIMELINE_STEPS.length - 1
          const ts          = getTimestamp(step.key)

          return (
            <div key={step.key} style={{ display: 'flex', gap: 12 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 20 }}>
                <div style={{
                  width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700,
                  background: (step.key === 'delivered' && status === 'delivered') ? '#22c55e' : isCompleted ? '#EE6B83' : isCurrent ? '#EE6B83' : '#fff',
                  border: (isCompleted || isCurrent) ? 'none' : '2px solid #E5E5E5',
                  color: '#fff',
                  boxShadow: (step.key === 'delivered' && status === 'delivered') ? '0 0 0 3px #bbf7d060' : isCurrent ? '0 0 0 3px #EE6B8340' : 'none',
                }}>
                  {isCompleted && '✓'}
                </div>
                {!isLast && (
                  <div style={{ width: 2, flex: 1, minHeight: 24, background: (status === 'delivered' && isCompleted) ? '#22c55e' : isCompleted ? '#EE6B83' : '#E5E5E5', margin: '2px 0' }} />
                )}
              </div>
              <div style={{ paddingBottom: isLast ? 0 : 20, flex: 1 }}>
                <p style={{
                  fontSize: 14, fontWeight: (isCurrent || (status === 'delivered' && step.key === 'delivered')) ? 600 : 500, margin: '0 0 2px',
                  color: (status === 'delivered' && step.key === 'delivered') ? '#16a34a' : isCompleted ? '#0A0A0A' : isCurrent ? '#EE6B83' : '#9CA3AF',
                }}>
                  {step.label}
                  {isCurrent && status !== 'delivered' && (
                    <span style={{ marginLeft: 8, fontSize: 10, background: '#EE6B8320', color: '#EE6B83', border: '1px solid #EE6B83', padding: '1px 6px', borderRadius: 2, fontWeight: 500 }}>
                      In Progress
                    </span>
                  )}
                </p>
                <p style={{ fontSize: 12, color: '#9CA3AF', margin: 0 }}>
                  {ts || '—'}
                </p>
              </div>
            </div>
          )
        })
      )}

      {trackingNumber && (
        <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid #F0F0F0' }}>
          <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#6B6B6B', margin: '0 0 6px' }}>
            Tracking Number
          </p>
          <p style={{ fontFamily: 'monospace', fontWeight: 500, fontSize: 15, color: '#0A0A0A', margin: 0 }}>{trackingNumber}</p>
        </div>
      )}
    </div>
  )
}

/* ── ReturnSection ───────────────────────────────────────────────────────────── */
function ReturnSection({ order }) {
  const dispatch = useDispatch()
  const { requests: returnRequests } = useSelector(s => s.returns)
  const [showForm, setShowForm] = useState(null) // 'return' | 'exchange' | null

  useEffect(() => {
    dispatch(fetchMyReturnRequests())
  }, [dispatch])

  if (order.status !== 'delivered') return null

  const existingRequest = returnRequests.find(r => r.orderId === order.orderId)

  const deliveredEntry = order.statusHistory?.find(h => h.status === 'delivered')
  const deliveredAt    = deliveredEntry?.timestamp || order.createdAt
  const days           = Math.floor((Date.now() - new Date(deliveredAt)) / 86_400_000)
  const canReturn      = days <= RETURN_WINDOW_DAYS
  const canExchange    = days <= EXCHANGE_WINDOW_DAYS

  return (
    <div style={{ background: '#fff', padding: 24, marginTop: 16 }}>
      <p style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500, color: '#0A0A0A', margin: '0 0 16px' }}>
        Returns & Exchange
      </p>

      {existingRequest ? (
        <ReturnStatusCard request={existingRequest} />
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {/* Return card */}
            <div style={{ border: '1px solid #E5E5E5', padding: 20, textAlign: 'center' }}>
              <p style={{ fontSize: 15, fontWeight: 500, color: '#0A0A0A', margin: '0 0 4px' }}>Request Refund</p>
              <p style={{ fontSize: 13, color: '#6B6B6B', margin: '0 0 6px' }}>Return your item for a full refund</p>
              <p style={{ fontSize: 12, color: canReturn ? '#16a34a' : '#ef4444', margin: '0 0 12px' }}>
                {canReturn ? `${RETURN_WINDOW_DAYS - days} days left` : 'Return window expired'}
              </p>
              <button
                onClick={() => setShowForm(showForm === 'return' ? null : 'return')}
                disabled={!canReturn}
                style={{
                  width: '100%', height: 40,
                  background: canReturn ? '#EE6B83' : '#E5E5E5',
                  color: canReturn ? '#fff' : '#9CA3AF',
                  border: 'none', fontSize: 12,
                  textTransform: 'uppercase', letterSpacing: '0.06em',
                  cursor: canReturn ? 'pointer' : 'not-allowed',
                  borderRadius: 8,
                }}>
                {canReturn ? 'Start Return' : 'Not Available'}
              </button>
            </div>

            {/* Exchange card */}
            <div style={{ border: '1px solid #E5E5E5', padding: 20, textAlign: 'center' }}>
              <p style={{ fontSize: 15, fontWeight: 500, color: '#0A0A0A', margin: '0 0 4px' }}>Exchange Size</p>
              <p style={{ fontSize: 13, color: '#6B6B6B', margin: '0 0 6px' }}>Swap for a different size</p>
              <p style={{ fontSize: 12, color: canExchange ? '#16a34a' : '#ef4444', margin: '0 0 12px' }}>
                {canExchange ? `${EXCHANGE_WINDOW_DAYS - days} days left` : 'Exchange window expired'}
              </p>
              <button
                onClick={() => setShowForm(showForm === 'exchange' ? null : 'exchange')}
                disabled={!canExchange}
                style={{
                  width: '100%', height: 40, background: 'none',
                  border: `1px solid ${canExchange ? '#EE6B83' : '#E5E5E5'}`,
                  color: canExchange ? '#EE6B83' : '#9CA3AF',
                  fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.06em',
                  cursor: canExchange ? 'pointer' : 'not-allowed',
                  borderRadius: 8,
                }}>
                {canExchange ? 'Start Exchange' : 'Not Available'}
              </button>
            </div>
          </div>

          <p style={{ fontSize: 11, color: '#9CA3AF', textAlign: 'center', margin: '12px 0 0' }}>
            Exchange available for {EXCHANGE_WINDOW_DAYS} days · Returns available for {RETURN_WINDOW_DAYS} days after delivery
          </p>

          {showForm && (
            <ReturnRequestForm
              type={showForm}
              order={order}
              onClose={() => setShowForm(null)}
              onSuccess={() => {
                setShowForm(null)
                dispatch(fetchMyReturnRequests())
              }}
            />
          )}
        </>
      )}
    </div>
  )
}

/* ── OrderSummaryCard ────────────────────────────────────────────────────────── */
function OrderSummaryCard({ order }) {
  return (
    <div style={{ background: '#fff', padding: 24 }}>
      <p style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500, color: '#0A0A0A', margin: '0 0 16px' }}>
        Order Summary
      </p>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#6B6B6B', paddingBottom: 12 }}>
        <span>Subtotal</span>
        <span style={{ color: '#0A0A0A' }}>{fmt(order.subtotal)}</span>
      </div>
      {order.discount > 0 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#6B6B6B', paddingBottom: 12 }}>
          <span>
            Discount{' '}
            {order.couponCode && (
              <span style={{ fontSize: 10, background: '#FCD4DB', padding: '2px 6px', marginLeft: 4 }}>{order.couponCode}</span>
            )}
          </span>
          <span style={{ color: '#16A34A' }}>−{fmt(order.discount)}</span>
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#6B6B6B', paddingBottom: 12 }}>
        <span>Shipping</span>
        <span style={{ color: order.shippingCharge === 0 ? '#16A34A' : '#0A0A0A' }}>
          {order.shippingCharge === 0 ? 'FREE' : fmt(order.shippingCharge)}
        </span>
      </div>
      <div style={{ borderTop: '1px solid #E5E5E5', paddingTop: 12, display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 600, color: '#0A0A0A' }}>
        <span>Total</span>
        <span>{fmt(order.total)}</span>
      </div>
      <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #F0F0F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 13, color: '#6B6B6B' }}>Payment</span>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: 13, color: '#0A0A0A' }}>
            {order.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Online'}
          </span>
          <span style={{
            display: 'block', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em',
            marginTop: 3, padding: '2px 8px', borderRadius: 2,
            background: order.paymentStatus === 'paid' ? '#f0fdf4' : order.paymentStatus === 'failed' ? '#fef2f2' : '#fefce8',
            color:      order.paymentStatus === 'paid' ? '#15803d' : order.paymentStatus === 'failed' ? '#b91c1c' : '#a16207',
            border:     `1px solid ${order.paymentStatus === 'paid' ? '#bbf7d0' : order.paymentStatus === 'failed' ? '#fecaca' : '#fde68a'}`,
          }}>
            {order.paymentStatus}
          </span>
        </div>
      </div>
    </div>
  )
}

/* ── ShippingDetailsCard ─────────────────────────────────────────────────────── */
function ShippingDetailsCard({ address }) {
  if (!address) return null
  return (
    <div style={{ background: '#fff', padding: 24, marginTop: 16 }}>
      <p style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500, color: '#0A0A0A', margin: '0 0 16px' }}>
        Delivering To
      </p>
      <p style={{ fontSize: 15, fontWeight: 500, color: '#0A0A0A', margin: '0 0 4px' }}>
        {address.fullName || address.customerName}
      </p>
      <p style={{ fontSize: 13, color: '#6B6B6B', margin: '0 0 8px' }}>{address.phone}</p>
      <p style={{ fontSize: 13, color: '#6B6B6B', lineHeight: 1.8, margin: 0 }}>
        {address.addressLine1}
        {address.addressLine2 && <><br />{address.addressLine2}</>}
        <br />{address.city}, {address.state} — {address.pincode}
      </p>
    </div>
  )
}

/* ── Main component ──────────────────────────────────────────────────────────── */
export default function OrderDetailPage() {
  const { orderId } = useParams()
  const dispatch    = useDispatch()
  const navigate    = useNavigate()

  const { selectedOrder, detailLoading, error } = useSelector(s => s.myOrders)

  useEffect(() => {
    if (orderId) {
      dispatch(fetchMyOrderById(orderId))
    }
    return () => {
      dispatch(clearSelectedOrder())
    }
  }, [orderId, dispatch])

  // Loading
  if (detailLoading) {
    return (
      <div style={{ minHeight: '100vh', background: '#FCD4DB' }}>
        <OrderDetailSkeleton />
      </div>
    )
  }

  // Error
  if (error) {
    return (
      <div style={{ minHeight: '100vh', background: '#FCD4DB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', background: '#fff', padding: 48 }}>
          <p style={{ color: '#EF4444', marginBottom: 16 }}>{error}</p>
          <button
            onClick={() => dispatch(fetchMyOrderById(orderId))}
            style={{ background: '#EE6B83', color: '#fff', border: 'none', padding: '10px 24px', cursor: 'pointer', fontSize: 13, marginRight: 12, borderRadius: 8 }}>
            Retry
          </button>
          <button
            onClick={() => navigate('/my-orders')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#6B6B6B', textDecoration: 'underline' }}>
            Back to My Orders
          </button>
        </div>
      </div>
    )
  }

  // Not found (loading done but no order)
  if (!selectedOrder) {
    return (
      <div style={{ minHeight: '100vh', background: '#FCD4DB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#6B6B6B', marginBottom: 16 }}>Order not found.</p>
          <button
            onClick={() => navigate('/my-orders')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#EE6B83', textDecoration: 'underline' }}>
            Back to My Orders
          </button>
        </div>
      </div>
    )
  }

  // Render order
  return (
    <div style={{ minHeight: '100vh', background: '#FCD4DB', padding: '48px 16px' }}>
      <div style={{ maxWidth: 860, margin: '0 auto' }}>

        {/* Back */}
        <button
          onClick={() => navigate('/my-orders')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#6B6B6B', marginBottom: 24, padding: 0 }}>
          ← Back to My Orders
        </button>

        {/* Heading */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontFamily: '"Playfair Display",Georgia,serif', fontSize: 28, fontWeight: 400, color: '#0A0A0A', margin: '0 0 6px' }}>
            Order Details
          </h1>
          <p style={{ fontSize: 13, color: '#6B6B6B', margin: 0 }}>
            {selectedOrder.orderId} &nbsp;·&nbsp; {fmtDate(selectedOrder.createdAt)}
          </p>
        </div>

        {/* Two-column layout */}
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' }}>

          {/* Left column */}
          <div style={{ flex: '1 1 400px', minWidth: 0 }}>
            <OrderItemsCard items={selectedOrder.items} />
            <div style={{ marginTop: 16 }}>
              <StatusTimelineCard
                status={selectedOrder.status}
                statusHistory={selectedOrder.statusHistory || []}
                trackingNumber={selectedOrder.trackingNumber}
              />
            </div>
            <ReturnSection order={selectedOrder} />
          </div>

          {/* Right column */}
          <div style={{ flex: '0 1 320px', minWidth: 260 }}>
            <OrderSummaryCard order={selectedOrder} />
            <ShippingDetailsCard address={selectedOrder.shippingAddress} />
          </div>
        </div>
      </div>
    </div>
  )
}
