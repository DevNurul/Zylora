import { useEffect, useRef, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { verifyReturnPayment } from '../utils/returnApi'

const STATUS = { LOADING: 'loading', SUCCESS: 'success', FAILED: 'failed', PENDING: 'pending' }

export default function ReturnPaymentCallback() {
  const [searchParams] = useSearchParams()
  const navigate       = useNavigate()
  const [status, setStatus] = useState(STATUS.LOADING)
  const called = useRef(false)

  const transactionId = searchParams.get('transactionId')

  useEffect(() => {
    if (called.current || !transactionId) return
    called.current = true

    ;(async () => {
      try {
        const { data } = await verifyReturnPayment(transactionId)

        if (data.paymentStatus === 'PAYMENT_SUCCESS') {
          setStatus(STATUS.SUCCESS)
          setTimeout(() => navigate('/my-returns', { replace: true }), 1500)
        } else if (data.paymentStatus === 'PAYMENT_PENDING') {
          setStatus(STATUS.PENDING)
        } else {
          setStatus(STATUS.FAILED)
        }
      } catch {
        setStatus(STATUS.FAILED)
      }
    })()
  }, [transactionId, navigate])

  if (!transactionId) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-5 px-4">
        <p className="text-[#6B6B6B] text-sm">Invalid payment link.</p>
        <button onClick={() => navigate('/my-returns')} className="border border-[#EE6B83] text-[#EE6B83] px-8 py-3 text-sm hover:bg-[#FCD4DB] hover:text-[#EE6B83] transition-colors rounded-lg">
          View My Returns
        </button>
      </div>
    )
  }

  if (status === STATUS.LOADING || status === STATUS.SUCCESS) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 px-4">
        <div className="w-10 h-10 border-2 border-[#EE6B83] border-t-transparent rounded-full animate-spin" />
        <p className="text-[#6B6B6B] text-sm">
          {status === STATUS.SUCCESS ? 'Payment confirmed! Redirecting…' : 'Verifying your payment…'}
        </p>
      </div>
    )
  }

  if (status === STATUS.PENDING) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-5 px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-yellow-50 border border-yellow-200 flex items-center justify-center text-2xl">⏳</div>
        <h1 className="text-xl font-semibold">Payment Processing</h1>
        <p className="text-[#6B6B6B] text-sm max-w-xs">Your payment is being processed. Please check your exchange status in a few minutes.</p>
        <button onClick={() => navigate('/my-returns')} className="bg-[#EE6B83] text-white px-8 py-3 text-sm hover:bg-[#D9506A] transition-colors rounded-lg">
          View My Returns
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center gap-5 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-red-50 border border-red-200 flex items-center justify-center text-2xl">✕</div>
      <h1 className="text-xl font-semibold">Payment Failed</h1>
      <p className="text-[#6B6B6B] text-sm max-w-xs">Your payment could not be completed. You can try again from My Returns.</p>
      <div className="flex flex-col sm:flex-row gap-3 mt-2">
        <button onClick={() => navigate('/my-returns')} className="border border-[#EE6B83] text-[#EE6B83] px-8 py-3 text-sm hover:bg-[#FCD4DB] hover:text-[#EE6B83] transition-colors rounded-lg">
          My Returns
        </button>
        <button onClick={() => navigate('/')} className="bg-[#EE6B83] text-white px-8 py-3 text-sm hover:bg-[#D9506A] transition-colors rounded-lg">
          Go Home
        </button>
      </div>
    </div>
  )
}
