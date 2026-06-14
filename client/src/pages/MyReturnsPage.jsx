import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { RotateCcw } from 'lucide-react'
import { fetchMyReturnRequests } from '../store/slices/returnSlice'

const STATUS_CFG = {
  requested:           { bg: '#fefce8', color: '#a16207', border: '#fde68a',  label: 'Pending Review'    },
  approved:            { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe',  label: 'Approved'          },
  rejected:            { bg: '#fef2f2', color: '#b91c1c', border: '#fecaca',  label: 'Rejected'          },
  pickup_scheduled:    { bg: '#faf5ff', color: '#7e22ce', border: '#e9d5ff',  label: 'Pickup Scheduled'  },
  item_received:       { bg: '#eef2ff', color: '#3730a3', border: '#c7d2fe',  label: 'Item Received'     },
  refund_approved:     { bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0',  label: 'Refund Approved'   },
  refund_rejected:     { bg: '#fef2f2', color: '#b91c1c', border: '#fecaca',  label: 'Refund Rejected'   },
  refund_processed:    { bg: '#dcfce7', color: '#14532d', border: '#86efac',  label: 'Refund Processed'  },
  exchange_dispatched: { bg: '#faf5ff', color: '#7e22ce', border: '#e9d5ff',  label: 'Dispatched'        },
  exchange_delivered:  { bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0',  label: 'Delivered'         },
  cancelled:           { bg: '#f9fafb', color: '#6b7280', border: '#d1d5db',  label: 'Cancelled'         },
}

function StatusBadge({ status }) {
  const cfg = STATUS_CFG[status] || { bg: '#f3f4f6', color: '#374151', border: '#d1d5db', label: status }
  return (
    <span style={{ display: 'inline-block', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 500, padding: '3px 10px', borderRadius: 3, border: `1px solid ${cfg.border}`, background: cfg.bg, color: cfg.color }}>
      {cfg.label}
    </span>
  )
}

const FILTERS = [
  { key: 'all',      label: 'All' },
  { key: 'return',   label: 'Returns' },
  { key: 'exchange', label: 'Exchanges' },
  { key: 'active',   label: 'Active' },
  { key: 'done',     label: 'Completed' },
]

function isActive(status) {
  return ['requested','approved','pickup_scheduled','item_received','refund_approved','exchange_dispatched'].includes(status)
}
function isDone(status) {
  return ['refund_processed','exchange_delivered','rejected','cancelled'].includes(status)
}

export default function MyReturnsPage() {
  const dispatch  = useDispatch()
  const navigate  = useNavigate()
  const { requests, loading } = useSelector((s) => s.returns)
  const [filter, setFilter] = useState('all')

  useEffect(() => { dispatch(fetchMyReturnRequests()) }, [dispatch])

  const filtered = requests.filter(r => {
    if (filter === 'return')   return r.type === 'return'
    if (filter === 'exchange') return r.type === 'exchange'
    if (filter === 'active')   return isActive(r.status)
    if (filter === 'done')     return isDone(r.status)
    return true
  })

  return (
    <div style={{ minHeight: '100vh', background: '#FCD4DB', padding: '48px 16px' }}>
      <div style={{ maxWidth: 860, margin: '0 auto' }}>

        {/* Heading */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontFamily: '"Playfair Display",Georgia,serif', fontSize: 32, fontWeight: 400, color: '#0A0A0A', margin: '0 0 6px' }}>
            Returns & Exchanges
          </h1>
          <p style={{ fontSize: 14, color: '#6B6B6B', margin: 0 }}>Track all your return and exchange requests</p>
        </div>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid #E5E5E5', marginBottom: 24, overflowX: 'auto' }}>
          {FILTERS.map(({ key, label }) => {
            const active = filter === key
            return (
              <button key={key} onClick={() => setFilter(key)} style={{
                background: 'none', border: 'none', borderBottom: active ? '2px solid #EE6B83' : '2px solid transparent',
                padding: '10px 16px', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.06em',
                fontWeight: active ? 500 : 400, color: active ? '#EE6B83' : '#6B6B6B', cursor: 'pointer',
                whiteSpace: 'nowrap', marginBottom: -1, transition: 'color 200ms',
              }}>{label}</button>
            )
          })}
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', padding: 48, color: '#6B6B6B', fontSize: 13 }}>Loading requests...</div>
        )}

        {/* Empty */}
        {!loading && filtered.length === 0 && (
          <div style={{ background: '#fff', padding: '64px 32px', textAlign: 'center' }}>
            <RotateCcw size={48} style={{ color: '#D1D5DB', margin: '0 auto 16px', display: 'block' }} />
            <p style={{ fontSize: 18, fontWeight: 500, color: '#0A0A0A', margin: '0 0 8px' }}>No requests yet</p>
            <p style={{ fontSize: 14, color: '#6B6B6B', margin: '0 0 24px' }}>
              {filter === 'all'
                ? 'You have not submitted any return or exchange requests'
                : `No ${FILTERS.find(f=>f.key===filter)?.label.toLowerCase()} found`}
            </p>
            <button onClick={() => navigate('/my-orders')}
              style={{ background: '#EE6B83', color: '#fff', border: 'none', padding: '12px 28px', fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.08em', cursor: 'pointer', borderRadius: 8 }}>
              View My Orders
            </button>
          </div>
        )}

        {/* Request cards */}
        {!loading && filtered.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.map((req) => (
              <div key={req.returnId}
                onClick={() => navigate(`/my-orders/${req.orderId}`)}
                style={{ background: '#fff', padding: 20, border: '1px solid #E5E5E5', cursor: 'pointer', transition: 'border-color 200ms', display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = '#EE6B83'}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#E5E5E5'}
              >
                {/* Left */}
                <div style={{ flex: '0 0 auto', minWidth: 160 }}>
                  <span style={{
                    display: 'inline-block', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', padding: '2px 8px',
                    background: req.type === 'return' ? '#fef2f2' : '#eff6ff',
                    color:      req.type === 'return' ? '#b91c1c' : '#1d4ed8',
                    border:     `1px solid ${req.type === 'return' ? '#fecaca' : '#bfdbfe'}`,
                    marginBottom: 6, borderRadius: 2, display: 'block', width: 'fit-content',
                  }}>{req.type}</span>
                  <p style={{ fontFamily: 'monospace', fontSize: 14, fontWeight: 500, color: '#0A0A0A', margin: '0 0 2px' }}>{req.returnId}</p>
                  <p style={{ fontSize: 12, color: '#6B6B6B', margin: 0 }}>Order {req.orderId}</p>
                </div>

                {/* Middle — item images */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1 }}>
                  {req.items?.slice(0,2).map((item, i) => (
                    item.image
                      ? <img key={i} src={item.image} alt={item.name} style={{ width: 40, height: 48, objectFit: 'cover', border: '1px solid #E5E5E5' }} />
                      : <div key={i} style={{ width: 40, height: 48, background: '#FCD4DB' }} />
                  ))}
                  <span style={{ fontSize: 12, color: '#6B6B6B' }}>{req.itemCount || req.items?.length || 0} item(s)</span>
                </div>

                {/* Right */}
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <StatusBadge status={req.status} />
                  <p style={{ fontSize: 12, color: '#6B6B6B', margin: '4px 0 4px' }}>
                    {new Date(req.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                  <span style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#EE6B83', textDecoration: 'underline' }}>
                    View Details →
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}
