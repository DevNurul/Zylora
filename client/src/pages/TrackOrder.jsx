import { useState } from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { Package } from 'lucide-react'
import StatusTimeline from '../components/tracking/StatusTimeline'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'

export default function TrackOrder() {
  const { isAuthenticated } = useAuth()
  const currentOrder = useSelector((s) => s.order.currentOrder)

  const [orderId, setOrderId] = useState(currentOrder?.orderId || '')
  const [email, setEmail] = useState(currentOrder?.email || '')
  const [loading, setLoading] = useState(false)
  const [order, setOrder] = useState(null)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!orderId.trim() || !email.trim()) { setError('Please fill in all fields'); return }
    setError('')
    setOrder(null)
    setLoading(true)
    try {
      const { data } = await api.get('/orders/track', {
        params: { orderId: orderId.trim(), email: email.trim() },
      })
      setOrder(data.order)
    } catch (err) {
      setError(err.response?.data?.error || 'Order not found. Check your Order ID and email.')
    } finally {
      setLoading(false)
    }
  }

  const inputCls = 'border border-gray-200 px-3 py-2.5 w-full text-[15px] focus:outline-none focus:border-[#EE6B83] transition-colors'

  return (
    <div className="min-h-screen">
      <div className="px-4 md:px-8 lg:px-16 py-10">
        {isAuthenticated && (
          <div className="mb-6 bg-[#FCD4DB] px-4 py-3 flex items-center justify-between gap-4 max-w-lg">
            <span className="text-[13px] text-[#6B6B6B]">Looking for your recent orders?</span>
            <Link to="/my-orders" className="text-[13px] font-medium text-[#EE6B83] hover:text-[#D9506A] transition-colors whitespace-nowrap">
              View My Orders →
            </Link>
          </div>
        )}

        <div className="flex items-center gap-3 mb-10">
          <Package size={24} className="text-[#EE6B83]" />
          <h1 className="text-2xl md:text-3xl font-semibold">Track Order</h1>
        </div>

        <div className="max-w-lg">
          <p className="text-[14px] text-[#6B6B6B] mb-8">
            Enter your Order ID and email to check delivery status.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Order ID</label>
              <input
                type="text"
                placeholder="ORD-XXXXXX"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                className={inputCls + ' font-mono uppercase'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputCls}
              />
            </div>

            {error && (
              <p className="text-[13px] text-red-500 bg-red-50 border border-red-200 px-4 py-3">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#EE6B83] text-white py-4 text-sm uppercase tracking-widest font-medium hover:bg-[#D9506A] hover:text-white transition-colors disabled:opacity-60 flex items-center justify-center gap-2 rounded-lg"
            >
              {loading && (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              {loading ? 'Searching...' : 'Track Order'}
            </button>
          </form>

          {order && <StatusTimeline order={order} />}
        </div>
      </div>
    </div>
  )
}
