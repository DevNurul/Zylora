import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useAuth } from '../context/AuthContext'
import { Copy, Check, ChevronDown, ChevronUp } from 'lucide-react'
import { formatPrice } from '../utils/formatPrice'

function AnimatedCheck() {
  return (
    <div className="w-24 h-24 flex items-center justify-center mb-6">
      <svg viewBox="0 0 80 80" className="w-24 h-24">
        <circle
          cx="40" cy="40" r="36"
          fill="none"
          stroke="#22c55e"
          strokeWidth="2"
          strokeDasharray="226"
          strokeDashoffset="226"
          className="animate-checkmark"
          style={{ animationDuration: '600ms', animationFillMode: 'forwards' }}
        />
        <path
          fill="none"
          stroke="#22c55e"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="60"
          strokeDashoffset="60"
          d="M22 40l12 12 24-24"
          className="animate-checkmark"
          style={{ animationDelay: '500ms', animationDuration: '400ms', animationFillMode: 'forwards' }}
        />
      </svg>
    </div>
  )
}

export default function OrderSuccess() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const order = useSelector((s) => s.order.currentOrder)
  const [copied, setCopied] = useState(false)
  const [expanded, setExpanded] = useState(false)

  if (!order) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-5 px-4">
        <h1 className="text-2xl font-semibold">No order found</h1>
        <button
          onClick={() => navigate('/')}
          className="border border-[#EE6B83] text-[#EE6B83] px-8 py-3 text-sm hover:bg-[#FCD4DB] hover:text-[#EE6B83] transition-colors rounded-lg"
        >
          Go Home
        </button>
      </div>
    )
  }

  const copyOrderId = () => {
    navigator.clipboard.writeText(order.orderId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen flex items-start justify-center px-4 py-16">
      <div className="w-full max-w-lg text-center">
        <AnimatedCheck />

        <h1 className="text-2xl md:text-3xl font-semibold mb-2">Order Placed!</h1>
        <p className="text-[15px] text-[#6B6B6B] mb-10">
          Thank you, {order.fullName?.split(' ')[0] || 'there'}. We'll get it to you soon.
        </p>

        <div className="bg-gray-50 border border-gray-200 px-6 py-5 flex items-center justify-between mb-3">
          <div className="text-left">
            <p className="text-xs text-[#9CA3AF] mb-1 uppercase tracking-wide">Order ID</p>
            <p className="font-mono text-lg font-bold tracking-wider">{order.orderId}</p>
          </div>
          <button
            onClick={copyOrderId}
            className="flex items-center gap-1.5 text-xs text-[#9CA3AF] hover:text-[#0A0A0A] transition-colors"
          >
            {copied ? <Check size={13} className="text-green-500" /> : <Copy size={13} />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>

        <p className="text-xs text-[#9CA3AF] mb-8">Save this ID to track your delivery</p>

        {order.items?.length > 0 && (
          <div className="border border-gray-200 text-left mb-6">
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center justify-between w-full px-5 py-4 text-[13px] font-medium hover:bg-gray-50 transition-colors"
            >
              <span>Order Items ({order.items.length})</span>
              {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            </button>
            {expanded && (
              <div className="border-t border-gray-100 px-5 py-4 space-y-3">
                {order.items.map((item) => (
                  <div key={`${item.id}-${item.size}-${item.color}`} className="flex justify-between text-[13px]">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-[11px] text-[#9CA3AF] mt-0.5 uppercase">{item.size} · {item.color} · ×{item.qty}</p>
                    </div>
                    <span className="font-semibold">{formatPrice(item.price * item.qty)}</span>
                  </div>
                ))}
                <div className="border-t border-gray-100 pt-3 flex justify-between text-[14px] font-semibold">
                  <span>Total</span>
                  <span>{formatPrice(order.total)}</span>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => navigate('/track-order')}
            className="flex-1 border border-[#EE6B83] text-[#EE6B83] py-3.5 text-sm uppercase tracking-widest font-medium hover:bg-[#FCD4DB] hover:text-[#EE6B83] transition-colors rounded-lg"
          >
            Track Order
          </button>
          <button
            onClick={() => navigate('/products')}
            className="flex-1 bg-[#EE6B83] text-white py-3.5 text-sm uppercase tracking-widest font-medium hover:bg-[#D9506A] transition-colors rounded-lg"
          >
            Continue Shopping
          </button>
        </div>
        {isAuthenticated && (
          <div className="mt-4 text-center">
            <Link
              to="/my-orders"
              className="text-[13px] text-[#6B6B6B] hover:text-[#EE6B83] transition-colors"
            >
              View in My Orders →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
