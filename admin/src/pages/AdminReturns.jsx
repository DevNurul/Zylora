import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../lib/api'
import toast from 'react-hot-toast'
import { Search, RotateCcw, ShieldCheck, HelpCircle, ArrowUpRight, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react'
import Badge from '../components/Badge'

const ALL_STATUSES = [
  'requested','approved','rejected','pickup_scheduled','item_received',
  'refund_approved','refund_rejected','refund_processed',
  'exchange_dispatched','exchange_delivered','cancelled',
]

const TYPE_STYLES = {
  return: 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20',
  exchange: 'bg-sky-50 text-sky-700 border-sky-100 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/20',
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
    { label: 'Approved Pickups',  value: statusCounts.approved  || 0 },
    { label: 'Refunds Settled',   value: statusCounts.refund_processed || 0 },
    { label: 'Exchanges Done',    value: statusCounts.exchange_delivered || 0 },
  ]

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Returns & Exchanges</h2>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Manage customer return workflows, inspect item conditions, and authorize refunds or product exchanges</p>
      </div>

      {/* Quick stats mini cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white dark:bg-dark-card border border-gray-100 dark:border-white/5 rounded-2xl p-5 shadow-2xs">
            <p className="text-2xl font-bold text-gray-900 dark:text-white font-sans">{s.value}</p>
            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase mt-1 tracking-wider">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-dark-card p-4 rounded-2xl border border-gray-100 dark:border-white/5 shadow-xs">
        <form onSubmit={handleSearch} className="flex flex-1 max-w-md gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search Return ID, Order ID..."
              className="w-full bg-gray-50 dark:bg-dark-bg border border-gray-100 dark:border-white/5 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:text-white"
            />
          </div>
          <button type="submit" className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-sm font-semibold transition-all cursor-pointer">
            Search
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <select 
              value={status} 
              onChange={(e) => { setStatus(e.target.value); setPage(1) }}
              className="appearance-none bg-gray-50 dark:bg-dark-bg border border-gray-100 dark:border-white/5 rounded-xl pl-4 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:text-white cursor-pointer"
            >
              <option value="">All Statuses</option>
              {ALL_STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g,' ')}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          <div className="relative">
            <select 
              value={type} 
              onChange={(e) => { setType(e.target.value); setPage(1) }}
              className="appearance-none bg-gray-50 dark:bg-dark-bg border border-gray-100 dark:border-white/5 rounded-xl pl-4 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:text-white cursor-pointer"
            >
              <option value="">All Types</option>
              <option value="return">Return</option>
              <option value="exchange">Exchange</option>
            </select>
            <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-white/5 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 dark:bg-[#181818] border-b border-gray-100 dark:border-white/5">
              <tr>
                {['Request ID','Workflow Type','Order ID','Customer Email','Items Count','Refund Value','Workflow Status','Lodged Date','Action'].map(h => (
                  <th key={h} className="px-6 py-4 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-white/2">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-20 text-center">
                    <div className="inline-block h-6 w-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin mb-2" />
                    <p className="text-xs text-gray-400 dark:text-gray-500">Loading returns...</p>
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-20 text-center text-gray-400 dark:text-gray-500 font-medium">No return requests found.</td>
                </tr>
              ) : (
                requests.map((req) => {
                  const typeStyle = TYPE_STYLES[req.type?.toLowerCase()] || 'bg-slate-50 text-slate-700 dark:bg-white/5 dark:text-gray-400'
                  return (
                    <tr key={req.returnId} className="hover:bg-gray-50/50 dark:hover:bg-white/1 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-gray-900 dark:text-white">{req.returnId}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-0.5 rounded-md text-[9px] font-bold border uppercase tracking-wider ${typeStyle}`}>
                          {req.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-gray-500 dark:text-gray-400">{req.orderId}</td>
                      <td className="px-6 py-4 text-xs font-medium text-gray-750 dark:text-gray-300 max-w-[160px] truncate">{req.customerEmail}</td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{req.items?.length || 0} item(s)</td>
                      <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">
                        {req.type === 'return' && req.refundAmount ? `₹${req.refundAmount.toLocaleString('en-IN')}` : '—'}
                      </td>
                      <td className="px-6 py-4"><Badge status={req.status} /></td>
                      <td className="px-6 py-4 text-xs text-gray-400 dark:text-gray-500">
                        {new Date(req.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => navigate(`/returns/${req.returnId}`)}
                          className="text-primary hover:text-primary-hover text-xs font-bold flex items-center gap-0.5 cursor-pointer"
                        >
                          Review <ArrowUpRight size={14} />
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between py-2 text-xs font-semibold text-gray-400 dark:text-gray-500">
          <span>Showing {requests.length} of {total} requests</span>
          <div className="flex items-center gap-3">
            <button 
              disabled={page === 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="p-2 bg-white dark:bg-dark-card border border-gray-100 dark:border-white/5 rounded-xl hover:bg-gray-50 disabled:opacity-40 shadow-2xs transition-colors cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="px-3.5 py-1.5 bg-white dark:bg-dark-card border border-gray-100 dark:border-white/5 rounded-xl text-gray-900 dark:text-white shadow-2xs">
              Page {page} of {totalPages}
            </span>
            <button 
              disabled={page === totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              className="p-2 bg-white dark:bg-dark-card border border-gray-100 dark:border-white/5 rounded-xl hover:bg-gray-50 disabled:opacity-40 shadow-2xs transition-colors cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
