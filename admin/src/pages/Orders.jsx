import { useEffect, useState } from 'react'
import api from '../lib/api'
import Badge from '../components/Badge'
import toast from 'react-hot-toast'
import { Search, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { formatPrice } from '../utils/formatPrice'

const STATUSES = ['pending', 'confirmed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled']

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState('')
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [newStatus, setNewStatus] = useState('')
  const [note, setNote] = useState('')
  const [updating, setUpdating] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const params = { page }
      if (status) params.status = status
      if (search) params.search = search
      const { data } = await api.get('/admin/orders', { params })
      setOrders(data.orders)
      setTotal(data.total)
      setTotalPages(data.totalPages)
    } catch {
      toast.error('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [page, status, search])

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
    setSearch(searchInput)
  }

  const openOrder = (order) => {
    setSelected(order)
    setNewStatus(order.status)
    setNote('')
  }

  const updateStatus = async () => {
    if (!newStatus) return
    setUpdating(true)
    try {
      await api.patch(`/admin/orders/${selected.orderId}/status`, { status: newStatus, note })
      toast.success('Status updated')
      setSelected(null)
      load()
    } catch {
      toast.error('Failed to update status')
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Orders</h2>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search order ID, name, email..."
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A96E] w-72"
            />
          </div>
          <button type="submit" className="px-4 py-2 bg-[#C9A96E] text-white rounded-lg text-sm font-medium hover:bg-[#b8935a]">
            Search
          </button>
        </form>

        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1) }}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A96E]"
        >
          <option value="">All Statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-black/5 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {['Order ID', 'Customer', 'Items', 'Total', 'Status', 'Date', 'Action'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan={7} className="py-12 text-center text-gray-400">Loading...</td></tr>
            ) : orders.length === 0 ? (
              <tr><td colSpan={7} className="py-12 text-center text-gray-400">No orders found</td></tr>
            ) : orders.map((order) => (
              <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-mono font-medium text-gray-900">{order.orderId}</td>
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-900">{order.customerName}</p>
                  <p className="text-gray-400 text-xs">{order.email}</p>
                </td>
                <td className="px-4 py-3 text-gray-600">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</td>
                <td className="px-4 py-3 font-semibold">{formatPrice(order.total)}</td>
                <td className="px-4 py-3"><Badge status={order.status} /></td>
                <td className="px-4 py-3 text-gray-400 text-xs">{new Date(order.createdAt).toLocaleDateString('en-IN')}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => openOrder(order)}
                    className="text-[#C9A96E] hover:underline text-xs font-medium"
                  >
                    Manage
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
        <span>Showing {orders.length} of {total} orders</span>
        <div className="flex gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
            className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="px-3 py-1 bg-white border border-gray-200 rounded-lg">{page} / {totalPages}</span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage(p => p + 1)}
            className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="font-bold text-lg">{selected.orderId}</h3>
              <button onClick={() => setSelected(null)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Customer */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Customer</p>
                <p className="font-medium">{selected.customerName}</p>
                <p className="text-sm text-gray-500">{selected.email} · {selected.phone}</p>
                <p className="text-sm text-gray-500 mt-1">{selected.shippingAddress?.address}, {selected.shippingAddress?.city}, {selected.shippingAddress?.state} — {selected.shippingAddress?.pincode}</p>
              </div>

              {/* Items */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Items</p>
                <div className="space-y-2">
                  {selected.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-gray-700">{item.name} × {item.qty} {item.size ? `(${item.size})` : ''}</span>
                      <span className="font-medium">₹{item.price * item.qty}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t text-sm space-y-1">
                  <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>₹{selected.subtotal}</span></div>
                  {selected.discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-₹{selected.discount}</span></div>}
                  <div className="flex justify-between text-gray-500"><span>Shipping</span><span>{selected.shippingCharge === 0 ? 'FREE' : `₹${selected.shippingCharge}`}</span></div>
                  <div className="flex justify-between font-bold text-base pt-1"><span>Total</span><span>₹{selected.total}</span></div>
                </div>
              </div>

              {/* Update Status */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Update Status</p>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-[#C9A96E]"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                  ))}
                </select>
                <input
                  placeholder="Note (optional)"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A96E]"
                />
              </div>

              <button
                onClick={updateStatus}
                disabled={updating}
                className="w-full bg-[#C9A96E] text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-[#b8935a] transition-colors disabled:opacity-60"
              >
                {updating ? 'Updating...' : 'Update Status'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
