import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../lib/api'
import toast from 'react-hot-toast'
import { Search } from 'lucide-react'

const ALL_STATUSES = [
  'requested','approved','rejected','pickup_scheduled','item_received',
  'refund_approved','refund_rejected','refund_processed',
  'exchange_dispatched','exchange_delivered','cancelled',
]

const STATUS_CFG = {
  requested:           { bg: '#fefce8', color: '#a16207', label: 'Pending Review'     },
  approved:            { bg: '#eff6ff', color: '#1d4ed8', label: 'Approved'           },
  rejected:            { bg: '#fef2f2', color: '#b91c1c', label: 'Rejected'           },
  pickup_scheduled:    { bg: '#faf5ff', color: '#7e22ce', label: 'Pickup Scheduled'   },
  item_received:       { bg: '#eef2ff', color: '#3730a3', label: 'Item Received'      },
  refund_approved:     { bg: '#f0fdf4', color: '#15803d', label: 'Refund Approved'    },
  refund_rejected:     { bg: '#fef2f2', color: '#b91c1c', label: 'Refund Rejected'    },
  refund_processed:    { bg: '#dcfce7', color: '#14532d', label: 'Refund Processed'   },
  exchange_dispatched: { bg: '#faf5ff', color: '#7e22ce', label: 'Dispatched'         },
  exchange_delivered:  { bg: '#f0fdf4', color: '#15803d', label: 'Delivered'          },
  cancelled:           { bg: '#f9fafb', color: '#6b7280', label: 'Cancelled'          },
}

function StatusBadge({ status }) {
  const c = STATUS_CFG[status] || { bg: '#f3f4f6', color: '#374151', label: status }
  return (
    <span className="text-[11px] uppercase px-2 py-0.5 rounded font-medium" style={{ background: c.bg, color: c.color }}>
      {c.label}
    </span>
  )
}

export default function AdminReturns() {
  const navigate = useNavigate()
  const [requests, setRequests] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [total,    setTotal]    = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [page,     setPage]     = useState(1)
  const [status,   setStatus]   = useState('')
  const [type,     setType]     = useState('')
  const [search,   setSearch]   = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [statusCounts, setStatusCounts] = useState({})

  const load = async () => {
    setLoading(true)
    try {
      const params = { page, limit: 20 }
      if (status) params.status = status
      if (type)   params.type   = type
      if (search) params.search = search
      const { data } = await api.get('/admin/returns', { params })
      setRequests(data.requests)
      setTotal(data.totalRequests)
      setTotalPages(data.totalPages)
      setStatusCounts(data.statusCounts || {})
    } catch {
      toast.error('Failed to load requests')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [page, status, type, search])

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
    setSearch(searchInput)
  }

  const stats = [
    { label: 'Total Requests',    value: total },
    { label: 'Pending Review',    value: statusCounts.requested || 0 },
    { label: 'Approved',          value: statusCounts.approved  || 0 },
    { label: 'Refunds Processed', value: statusCounts.refund_processed || 0 },
    { label: 'Exchanges Done',    value: statusCounts.exchange_delivered || 0 },
  ]

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Returns & Exchanges</h2>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="bg-white border border-gray-100 rounded-xl p-4">
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search Return ID, Order, Email..."
              className="pl-8 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A96E] w-64"
            />
          </div>
          <button type="submit" className="bg-gray-900 text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">
            Search
          </button>
          {search && (
            <button type="button" onClick={() => { setSearch(''); setSearchInput('') }}
              className="text-sm text-gray-500 hover:text-gray-700 px-2">
              Clear
            </button>
          )}
        </form>

        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1) }}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A96E] bg-white">
          <option value="">All Statuses</option>
          {ALL_STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g,' ')}</option>)}
        </select>

        <select value={type} onChange={(e) => { setType(e.target.value); setPage(1) }}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A96E] bg-white">
          <option value="">All Types</option>
          <option value="return">Return</option>
          <option value="exchange">Exchange</option>
        </select>

        <span className="text-sm text-gray-500 self-center">Showing {requests.length} of {total}</span>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading...</div>
      ) : requests.length === 0 ? (
        <div className="text-center py-12 text-gray-400">No requests found</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {['Return ID','Type','Order ID','Customer','Items','Amount','Status','Date','Action'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
                <tr key={req.returnId} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-gray-900">{req.returnId}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-0.5 rounded font-medium uppercase"
                      style={{ background: req.type === 'return' ? '#fef2f2' : '#eff6ff', color: req.type === 'return' ? '#b91c1c' : '#1d4ed8' }}>
                      {req.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">{req.orderId}</td>
                  <td className="px-4 py-3 text-xs text-gray-600 max-w-[140px] truncate">{req.customerEmail}</td>
                  <td className="px-4 py-3 text-xs text-gray-600">{req.items?.length || 0} item(s)</td>
                  <td className="px-4 py-3 text-xs text-gray-900">
                    {req.type === 'return' && req.refundAmount ? `₹${req.refundAmount.toLocaleString('en-IN')}` : '—'}
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={req.status} /></td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {new Date(req.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => navigate(`/returns/${req.returnId}`)}
                      className="text-xs text-[#C9A96E] font-semibold hover:text-[#a8893e] transition-colors">
                      Review →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-6 mt-6">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="text-sm text-gray-600 hover:text-gray-900 disabled:opacity-40">← Previous</button>
          <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            className="text-sm text-gray-600 hover:text-gray-900 disabled:opacity-40">Next →</button>
        </div>
      )}
    </div>
  )
}
