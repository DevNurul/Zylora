import { useEffect, useState } from 'react'
import api from '../lib/api'
import Badge from '../components/Badge'
import toast from 'react-hot-toast'
import { Search, ChevronLeft, ChevronRight, X, Calendar, User, ShoppingBag, CreditCard, ChevronDown, Printer } from 'lucide-react'
import { formatPrice } from '../utils/formatPrice'
import { downloadPdf } from '../utils/downloadPdf'

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
  const [downloading, setDownloading] = useState(false)

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
      // Update selected item in-place to reflect new status without closing
      setSelected(prev => ({ ...prev, status: newStatus }))
      load()
    } catch {
      toast.error('Failed to update status')
    } finally {
      setUpdating(false)
    }
  }

  const handleDeleteOrder = async (orderId, onSuccess) => {
    if (!window.confirm(`Are you sure you want to delete order ${orderId}?`)) return
    try {
      await api.delete(`/admin/orders/${orderId}`)
      toast.success('Order deleted successfully')
      load()
      if (onSuccess) onSuccess()
    } catch {
      toast.error('Failed to delete order')
    }
  }

  const handlePrint = async (orderId) => {
    try {
      setDownloading(true)
      await downloadPdf(`/admin/orders/${orderId}/print`, `ZYLARA-${orderId}.pdf`)
    } catch (err) {
      toast.error('Failed to download')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Orders</h2>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Manage customer purchases, delivery tracking, and invoice statuses</p>
      </div>

      {/* Filters & Actions Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-dark-card p-4 rounded-2xl border border-gray-100 dark:border-white/5 shadow-xs">
        <form onSubmit={handleSearch} className="flex flex-1 max-w-md gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search order ID, customer name..."
              className="w-full bg-gray-50 dark:bg-dark-bg border border-gray-100 dark:border-white/5 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:text-white"
            />
          </div>
          <button type="submit" className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-sm font-semibold transition-colors shadow-xs cursor-pointer">
            Search
          </button>
        </form>

        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1) }}
              className="appearance-none bg-gray-50 dark:bg-dark-bg border border-gray-100 dark:border-white/5 rounded-xl pl-4 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:text-white cursor-pointer"
            >
              <option value="">All Statuses</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Orders Table Card */}
      <div className="bg-white dark:bg-dark-card rounded-2xl shadow-xs border border-gray-100 dark:border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 dark:bg-[#181818] border-b border-gray-100 dark:border-white/5">
              <tr>
                {['Order ID', 'Customer', 'Items Count', 'Grand Total', 'Delivery Status', 'Purchase Date', 'Actions'].map((h) => (
                  <th key={h} className="px-6 py-4 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-white/2">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-20 text-center">
                    <div className="inline-block h-6 w-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin mb-2" />
                    <p className="text-xs text-gray-400 dark:text-gray-500">Loading orders data...</p>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-20 text-center text-gray-400 dark:text-gray-500 font-medium">
                    No orders found matching the filter criteria.
                  </td>
                </tr>
              ) : orders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50/50 dark:hover:bg-white/1 transition-colors group">
                  <td className="px-6 py-4 font-mono font-bold text-gray-900 dark:text-white">{order.orderId}</td>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-gray-900 dark:text-white">{order.customerName}</p>
                    <p className="text-gray-400 dark:text-gray-500 text-xs mt-0.5">{order.email}</p>
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</td>
                  <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">{formatPrice(order.total)}</td>
                  <td className="px-6 py-4"><Badge status={order.status} /></td>
                  <td className="px-6 py-4 text-gray-400 dark:text-gray-500 text-xs">{new Date(order.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => openOrder(order)}
                        className="text-primary hover:text-primary-hover text-xs font-bold cursor-pointer"
                      >
                        Manage Order
                      </button>
                      <button
                        onClick={() => handleDeleteOrder(order.orderId)}
                        className="text-rose-500 hover:text-rose-700 text-xs font-bold cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between py-2 text-xs font-semibold text-gray-400 dark:text-gray-500">
        <span>Showing {orders.length} of {total} orders</span>
        <div className="flex items-center gap-3">
          <button
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
            className="p-2 bg-white dark:bg-dark-card border border-gray-100 dark:border-white/5 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-40 transition-colors shadow-2xs cursor-pointer"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="px-3.5 py-1.5 bg-white dark:bg-dark-card border border-gray-100 dark:border-white/5 rounded-xl text-gray-900 dark:text-white shadow-2xs">
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage(p => p + 1)}
            className="p-2 bg-white dark:bg-dark-card border border-gray-100 dark:border-white/5 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-40 transition-colors shadow-2xs cursor-pointer"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* ── Order Detail Slide-over Drawer ── */}
      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs">
          <div className="fixed inset-0" onClick={() => setSelected(null)} />
          
          <div className="relative w-full max-w-lg bg-white dark:bg-dark-card h-full shadow-2xl flex flex-col z-10 border-l border-gray-100 dark:border-white/5 animate-slide-in-right">
            {/* Drawer Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-white/5">
              <div>
                <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 tracking-wider">Order Reference</span>
                <h3 className="font-mono font-bold text-xl text-gray-900 dark:text-white mt-0.5">{selected.orderId}</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePrint(selected.orderId)}
                  disabled={downloading}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-primary hover:bg-primary-hover text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <Printer size={14} />
                  {downloading ? 'Downloading...' : 'Print'}
                </button>
                <button 
                  onClick={() => setSelected(null)}
                  className="p-2 hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
              
              {/* Customer Info Card */}
              <div className="bg-gray-50/50 dark:bg-white/1 border border-gray-100 dark:border-white/2 rounded-2xl p-4 space-y-3.5">
                <div className="flex items-center gap-2">
                  <User size={16} className="text-primary" />
                  <span className="text-xs uppercase font-bold text-gray-900 dark:text-white tracking-wider">Customer Details</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">{selected.customerName}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{selected.email} · {selected.phone}</p>
                </div>
                <div className="pt-2.5 border-t border-gray-100 dark:border-white/5">
                  <p className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 tracking-wider">Shipping Address</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">
                    {selected.shippingAddress?.address}, {selected.shippingAddress?.city}, {selected.shippingAddress?.state} — {selected.shippingAddress?.pincode}
                  </p>
                </div>
              </div>

              {/* Items Card */}
              <div className="bg-gray-50/50 dark:bg-white/1 border border-gray-100 dark:border-white/2 rounded-2xl p-4 space-y-3.5">
                <div className="flex items-center gap-2">
                  <ShoppingBag size={16} className="text-primary" />
                  <span className="text-xs uppercase font-bold text-gray-900 dark:text-white tracking-wider">Order Items</span>
                </div>
                <div className="space-y-3">
                  {selected.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-xs py-1 border-b border-gray-50 dark:border-white/2 last:border-0 last:pb-0">
                      <div className="min-w-0 pr-2">
                        <p className="font-bold text-gray-800 dark:text-gray-200 truncate">{item.name}</p>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">Qty: {item.qty} {item.size ? `· Size: ${item.size}` : ''}</p>
                      </div>
                      <span className="font-bold text-gray-900 dark:text-white">{formatPrice(item.price * item.qty)}</span>
                    </div>
                  ))}
                </div>
                
                {/* Grand Totals */}
                <div className="pt-3 border-t border-gray-100 dark:border-white/5 text-xs space-y-2">
                  <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>{formatPrice(selected.subtotal)}</span></div>
                  {selected.discount > 0 && <div className="flex justify-between text-green-600 dark:text-green-500"><span>Discount Code</span><span>-{formatPrice(selected.discount)}</span></div>}
                  <div className="flex justify-between text-gray-500"><span>Shipping Fees</span><span>{selected.shippingCharge === 0 ? 'FREE' : formatPrice(selected.shippingCharge)}</span></div>
                  <div className="flex justify-between font-bold text-sm text-gray-950 dark:text-white pt-1.5 border-t border-dashed border-gray-100 dark:border-white/5">
                    <span>Total Amount</span>
                    <span>{formatPrice(selected.total)}</span>
                  </div>
                </div>
              </div>

              {/* Order Status Config Panel */}
              <div className="bg-gray-50/50 dark:bg-white/1 border border-gray-100 dark:border-white/2 rounded-2xl p-4 space-y-4">
                <div className="flex items-center gap-2">
                  <CreditCard size={16} className="text-primary" />
                  <span className="text-xs uppercase font-bold text-gray-900 dark:text-white tracking-wider">Update Order Status</span>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 tracking-wider">Select Status</label>
                    <div className="relative mt-1">
                      <select
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                        className="w-full appearance-none bg-white dark:bg-dark-bg border border-gray-150 dark:border-white/5 rounded-xl pl-4 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:text-white cursor-pointer"
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 tracking-wider">Internal Note</label>
                    <input
                      placeholder="e.g. Dispatched via BlueDart..."
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      className="mt-1 w-full bg-white dark:bg-dark-bg border border-gray-150 dark:border-white/5 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:text-white"
                    />
                  </div>
                </div>

                <button
                  onClick={updateStatus}
                  disabled={updating}
                  className="w-full mt-2 bg-primary hover:bg-primary-hover text-white py-3 rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-98 disabled:opacity-60 cursor-pointer"
                >
                  {updating ? 'Saving Changes...' : 'Update Status'}
                </button>

                <div className="pt-4 border-t border-gray-150 dark:border-white/5 mt-4">
                  <button
                    onClick={() => handleDeleteOrder(selected.orderId, () => setSelected(null))}
                    className="w-full bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 py-3 rounded-xl text-sm font-semibold transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2"
                  >
                    Delete Order
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
