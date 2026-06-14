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
      style={{
        background:  '#fff',
        border:      '1px solid #E5E5E5',
        padding:     '24px',
        cursor:      'pointer',
        transition:  'border-color 200ms',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#EE6B83' }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#E5E5E5' }}
    >
      {/* Top row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 600, color: '#0A0A0A', margin: 0 }}>
            {order.orderId}
          </p>
          <p style={{ fontSize: 12, color: '#6B6B6B', margin: '4px 0 0' }}>{formatDate(order.createdAt)}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <StatusBadge status={order.status} />
          <p style={{ fontSize: 16, fontWeight: 600, color: '#0A0A0A', margin: '6px 0 0' }}>
            {formatPrice(order.total)}
          </p>
        </div>
      </div>

      {/* Product image strip */}
      <div style={{ display: 'flex', gap: 8, margin: '16px 0' }}>
        {preview.map((item, i) => (
          item.image
            ? <img key={i} src={item.image} alt={item.name} style={{ width: 64, height: 64, objectFit: 'cover', border: '1px solid #E5E5E5', flexShrink: 0 }} />
            : <div key={i} style={{ width: 64, height: 64, background: '#FCD4DB', border: '1px solid #E5E5E5', flexShrink: 0 }} />
        ))}
        {extra > 0 && (
          <div style={{ width: 64, height: 64, background: '#FCD4DB', border: '1px solid #E5E5E5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#6B6B6B', flexShrink: 0 }}>
            +{extra} more
          </div>
        )}
      </div>

      {/* Bottom row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <p style={{ fontSize: 12, color: '#6B6B6B', margin: 0 }}>
            {order.itemCount} {order.itemCount === 1 ? 'item' : 'items'}
          </p>
          {order.shippingAddress?.city && (
            <p style={{ fontSize: 12, color: '#6B6B6B', margin: '4px 0 0' }}>
              {order.shippingAddress.city}, {order.shippingAddress.state}
            </p>
          )}
        </div>
        <span style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#0A0A0A', transition: 'color 200ms' }}>
          View Details →
        </span>
      </div>
    </div>
  )
}
