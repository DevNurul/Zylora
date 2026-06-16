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

  const inputCls = 'w-full border-b border-[#242424] bg-transparent py-2.5 text-[15px] text-white outline-none focus:border-[#B8976A] transition-colors font-mono'

  return (
    <div className="min-h-screen">
      <div className="px-4 md:px-8 lg:px-16 py-10">
        {isAuthenticated && (
          <div className="mb-6 bg-[#1C1C1C] border border-[#242424] px-4 py-3 flex items-center justify-between gap-4 max-w-lg rounded-lg">
            <span className="text-[13px] text-[#5C5C5C]">Looking for your recent orders?</span>
            <Link to="/my-orders" className="text-[13px] font-medium text-[#B8976A] hover:text-[#E8A0B0] transition-colors whitespace-nowrap">
              View My Orders →
            </Link>
          </div>
        )}

        <div className="flex items-center gap-3 mb-10">
          <Package size={24} className="text-[#B8976A]" />
          <h1 className="text-2xl md:text-3xl font-light text-white">Track Order</h1>
        </div>

        <div className="max-w-lg">
          <p className="text-[14px] text-[#9A9A9A] mb-8">
            Enter your Order ID and email to check delivery status.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#9A9A9A] mb-1">Order ID</label>
              <input
                type="text"
                placeholder="ORD-XXXXXX"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                className={inputCls + ' uppercase'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#9A9A9A] mb-1">Email Address</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputCls}
              />
            </div>

            {error && (
              <p className="text-[13px] text-[#E8A0B0] bg-[#E8A0B010] border border-[#E8A0B030] px-4 py-3 rounded-lg">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#E8A0B0] to-[#D48A9A] text-white py-4 text-sm uppercase tracking-widest font-medium hover:shadow-[0_8px_30px_rgba(238,107,131,0.3)] transition-all disabled:opacity-60 flex items-center justify-center gap-2 rounded-xl"
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
