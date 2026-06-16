import { useEffect, useRef, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { verifyReturnPayment } from '../utils/returnApi'

const STATUS = { LOADING: 'loading', SUCCESS: 'success', FAILED: 'failed', PENDING: 'pending' }

export default function ReturnPaymentCallback() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState(STATUS.LOADING)
  const called = useRef(false)
  const transactionId = searchParams.get('transactionId')

  useEffect(() => {
    if (called.current || !transactionId) return
    called.current = true
    ;(async () => {
      try {
        const { data } = await verifyReturnPayment(transactionId)
        if (data.paymentStatus === 'PAYMENT_SUCCESS') { setStatus(STATUS.SUCCESS); setTimeout(() => navigate('/my-returns', { replace: true }), 1500) }
        else if (data.paymentStatus === 'PAYMENT_PENDING') setStatus(STATUS.PENDING)
        else setStatus(STATUS.FAILED)
      } catch { setStatus(STATUS.FAILED) }
    })()
  }, [transactionId, navigate])

  if (!transactionId) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-5 px-4">
        <p className="text-[#9A9A9A] text-sm">Invalid payment link.</p>
        <button onClick={() => navigate('/my-returns')} className="border border-[#B8976A] text-[#B8976A] px-8 py-3 text-sm hover:bg-[#B8976A] hover:text-white transition-colors rounded-xl">
          View My Returns
        </button>
      </div>
    )
  }

  if (status === STATUS.LOADING || status === STATUS.SUCCESS) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 px-4">
        <div className="w-10 h-10 border-2 border-[#B8976A] border-t-transparent rounded-full animate-spin" />
        <p className="text-[#9A9A9A] text-sm">
          {status === STATUS.SUCCESS ? 'Payment confirmed! Redirecting…' : 'Verifying your payment…'}
        </p>
      </div>
    )
  }

  if (status === STATUS.PENDING) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-5 px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-[#fefce8] border border-[#fde68a] flex items-center justify-center text-2xl">⏳</div>
        <h1 className="text-xl font-light text-white">Payment Processing</h1>
        <p className="text-[#9A9A9A] text-sm max-w-xs">Your payment is being processed. Please check your exchange status in a few minutes.</p>
        <button onClick={() => navigate('/my-returns')} className="bg-gradient-to-r from-[#E8A0B0] to-[#D48A9A] text-white px-8 py-3 text-sm hover:shadow-[0_8px_30px_rgba(238,107,131,0.3)] transition-all rounded-xl">
          View My Returns
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center gap-5 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-[#fef2f2] border border-[#fecaca] flex items-center justify-center text-2xl">✕</div>
      <h1 className="text-xl font-light text-white">Payment Failed</h1>
      <p className="text-[#9A9A9A] text-sm max-w-xs">Your payment could not be completed. You can try again from My Returns.</p>
      <div className="flex flex-col sm:flex-row gap-3 mt-2">
        <button onClick={() => navigate('/my-returns')} className="border border-[#B8976A] text-[#B8976A] px-8 py-3 text-sm hover:bg-[#B8976A] hover:text-white transition-colors rounded-xl">
          My Returns
        </button>
        <button onClick={() => navigate('/')} className="bg-gradient-to-r from-[#E8A0B0] to-[#D48A9A] text-white px-8 py-3 text-sm hover:shadow-[0_8px_30px_rgba(238,107,131,0.3)] transition-all rounded-xl">
          Go Home
        </button>
      </div>
    </div>
  )
}
