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
          stroke="#B8976A"
          strokeWidth="2"
          strokeDasharray="226"
          strokeDashoffset="226"
          className="animate-checkmark"
          style={{ animationDuration: '600ms', animationFillMode: 'forwards' }}
        />
        <path
          fill="none"
          stroke="#B8976A"
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
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-6 px-4">
        <h1 className="font-serif text-2xl text-white">No order found</h1>
        <button
          onClick={() => navigate('/')}
          className="bg-gradient-to-r from-[#B8976A] to-[#A88345] text-white px-8 py-3 text-xs uppercase tracking-[0.12em] font-medium hover:shadow-lg hover:shadow-[#B8976A]/20 transition-all rounded-xl"
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
    <div className="min-h-screen flex items-start justify-center px-4 py-10 md:py-16">
      <div className="w-full max-w-lg text-center">
        <AnimatedCheck />

        <h1 className="font-serif text-2xl md:text-3xl text-white mb-2 font-light">Order Placed!</h1>
        <p className="text-sm text-[#5C5C5C] mb-10">
          Thank you, {order.fullName?.split(' ')[0] || 'there'}. We'll get it to you soon.
        </p>

        <div className="bg-[#141414] border border-[#242424] rounded-2xl px-6 py-5 flex items-center justify-between mb-3">
          <div className="text-left">
            <p className="text-[10px] text-[#5C5C5C] mb-1 uppercase tracking-wider">Order ID</p>
            <p className="font-mono text-lg font-medium tracking-wider text-white break-all">{order.orderId}</p>
          </div>
          <button
            onClick={copyOrderId}
            className="flex items-center gap-1.5 text-xs text-[#5C5C5C] hover:text-[#B8976A] transition-colors"
          >
            {copied ? <Check size={13} className="text-[#2E7D32]" /> : <Copy size={13} />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>

        <p className="text-xs text-[#5C5C5C] mb-8">Save this ID to track your delivery</p>

        {order.items?.length > 0 && (
          <div className="bg-[#141414] border border-[#242424] rounded-2xl text-left mb-6 overflow-hidden">
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center justify-between w-full px-5 py-4 text-sm font-medium hover:bg-white/5 transition-colors text-white"
            >
              <span>Order Items ({order.items.length})</span>
              {expanded ? <ChevronUp size={15} className="text-[#5C5C5C]" /> : <ChevronDown size={15} className="text-[#5C5C5C]" />}
            </button>
            {expanded && (
              <div className="border-t border-[#242424] px-5 py-4 space-y-3">
                {order.items.map((item) => (
                  <div key={`${item.id}-${item.size}-${item.color}`} className="flex justify-between text-sm">
                    <div>
                      <p className="font-medium text-white">{item.name}</p>
                      <p className="text-[10px] text-[#5C5C5C] mt-0.5 uppercase">{item.size} · {item.color} · x{item.qty}</p>
                    </div>
                    <span className="font-medium text-white">{formatPrice(item.price * item.qty)}</span>
                  </div>
                ))}
                <div className="border-t border-[#242424] pt-3 flex justify-between text-sm font-medium">
                  <span className="text-[#9A9A9A]">Total</span>
                  <span className="text-white">{formatPrice(order.total)}</span>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => navigate('/track-order')}
            className="flex-1 border border-[#B8976A]/30 text-[#B8976A] py-3.5 text-xs uppercase tracking-widest font-medium hover:bg-[#B8976A]/10 transition-all rounded-xl"
          >
            Track Order
          </button>
          <button
            onClick={() => navigate('/products')}
            className="flex-1 bg-gradient-to-r from-[#B8976A] to-[#A88345] text-white py-3.5 text-xs uppercase tracking-widest font-medium hover:shadow-lg hover:shadow-[#B8976A]/20 transition-all rounded-xl"
          >
            Continue Shopping
          </button>
        </div>
        {isAuthenticated && (
          <div className="mt-4 text-center">
            <Link
              to="/my-orders"
              className="text-sm text-[#5C5C5C] hover:text-[#B8976A] transition-colors"
            >
              View in My Orders →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
