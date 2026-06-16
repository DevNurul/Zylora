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
    <span className="inline-block text-[11px] uppercase tracking-[0.06em] font-medium px-2.5 py-0.5 rounded"
      style={{ border: `1px solid ${cfg.border}`, background: cfg.bg, color: cfg.color }}>
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
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { requests, loading } = useSelector((s) => s.returns)
  const [filter, setFilter] = useState('all')

  useEffect(() => { dispatch(fetchMyReturnRequests()) }, [dispatch])

  const filtered = requests.filter(r => {
    if (filter === 'return') return r.type === 'return'
    if (filter === 'exchange') return r.type === 'exchange'
    if (filter === 'active') return isActive(r.status)
    if (filter === 'done') return isDone(r.status)
    return true
  })

  return (
    <div className="min-h-screen">
      <div className="max-w-[860px] mx-auto py-12 px-4">
        <div className="mb-7">
          <h1 className="text-[28px] font-normal text-white m-0 mb-1.5" style={{ fontFamily: '"Cormorant Garamond",Georgia,serif' }}>
            Returns & Exchanges
          </h1>
          <p className="text-[14px] text-[#9A9A9A] m-0">Track all your return and exchange requests</p>
        </div>

        <div className="flex gap-0 border-b border-[#242424] mb-6 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {FILTERS.map(({ key, label }) => {
            const active = filter === key
            return (
              <button key={key} onClick={() => setFilter(key)}
                className={`whitespace-nowrap px-4 py-2.5 text-[12px] uppercase tracking-[0.06em] border-none border-b-2 transition-all cursor-pointer bg-transparent ${
                  active ? 'border-b-[#B8976A] text-[#B8976A] font-medium' : 'border-b-transparent text-[#5C5C5C] font-normal hover:text-[#B8976A]'
                }`}>
                {label}
              </button>
            )
          })}
        </div>

        {loading && (
          <div className="text-center py-12 text-[#5C5C5C] text-[13px]">Loading requests...</div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="bg-[#141414] p-16 text-center rounded-xl border border-[#242424]">
            <RotateCcw size={48} className="text-[#242424] mx-auto mb-4" />
            <p className="text-[18px] font-medium text-white m-0 mb-2">No requests yet</p>
            <p className="text-[14px] text-[#9A9A9A] m-0 mb-6">
              {filter === 'all'
                ? 'You have not submitted any return or exchange requests'
                : `No ${FILTERS.find(f=>f.key===filter)?.label.toLowerCase()} found`}
            </p>
            <button onClick={() => navigate('/my-orders')}
              className="bg-gradient-to-r from-[#E8A0B0] to-[#D48A9A] text-white border-none px-7 py-3 text-[13px] uppercase tracking-[0.08em] cursor-pointer rounded-xl transition-all hover:shadow-[0_8px_30px_rgba(238,107,131,0.3)]">
              View My Orders
            </button>
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="flex flex-col gap-3">
            {filtered.map((req) => (
              <div key={req.returnId}
                onClick={() => navigate(`/my-orders/${req.orderId}`)}
                className="bg-[#141414] p-5 border border-[#242424] cursor-pointer transition-all duration-200 flex gap-4 flex-wrap items-center rounded-lg hover:border-[#B8976A]">
                <div className="flex-shrink-0 min-w-[160px]">
                  <span className={`inline-block text-[10px] uppercase tracking-[0.06em] px-2 py-0.5 mb-1.5 rounded ${
                    req.type === 'return' ? 'bg-[#fef2f2] text-[#b91c1c] border border-[#fecaca]' : 'bg-[#eff6ff] text-[#1d4ed8] border border-[#bfdbfe]'
                  }`}>
                    {req.type}
                  </span>
                  <p className="font-mono text-[14px] font-medium text-white m-0 mb-0.5">{req.returnId}</p>
                  <p className="text-[12px] text-[#5C5C5C] m-0">Order {req.orderId}</p>
                </div>

                <div className="flex items-center gap-1.5 flex-1">
                  {req.items?.slice(0,2).map((item, i) => (
                    item.image
                      ? <img key={i} src={item.image} alt={item.name} className="w-10 h-12 object-cover border border-[#242424] rounded" />
                      : <div key={i} className="w-10 h-12 bg-[#1C1C1C] rounded" />
                  ))}
                  <span className="text-[12px] text-[#9A9A9A]">{req.itemCount || req.items?.length || 0} item(s)</span>
                </div>

                <div className="text-right flex-shrink-0">
                  <StatusBadge status={req.status} />
                  <p className="text-[12px] text-[#5C5C5C] m-0 mt-1">
                    {new Date(req.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                  <span className="text-[12px] uppercase tracking-[0.04em] text-[#B8976A] underline">
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
