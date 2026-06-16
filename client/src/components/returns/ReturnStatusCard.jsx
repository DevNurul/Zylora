import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { ChevronDown, ChevronUp, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { cancelReturn, initiateReturnPaymentThunk } from '../../store/slices/returnSlice'

const STATUS_CFG = {
  requested:           { bg: '#fefce8', color: '#a16207', border: '#fde68a',  label: 'Pending Review'       },
  approved:            { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe',  label: 'Approved'             },
  rejected:            { bg: '#fef2f2', color: '#b91c1c', border: '#fecaca',  label: 'Rejected'             },
  payment_pending:     { bg: '#fefce8', color: '#a16207', border: '#fde68a',  label: 'Payment Required'     },
  pickup_scheduled:    { bg: '#faf5ff', color: '#7e22ce', border: '#e9d5ff',  label: 'Pickup Scheduled'     },
  item_received:       { bg: '#eef2ff', color: '#3730a3', border: '#c7d2fe',  label: 'Item Received'        },
  refund_approved:     { bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0',  label: 'Refund Approved'      },
  refund_rejected:     { bg: '#fef2f2', color: '#b91c1c', border: '#fecaca',  label: 'Refund Rejected'      },
  refund_processed:    { bg: '#dcfce7', color: '#14532d', border: '#86efac',  label: 'Refund Processed'     },
  exchange_dispatched: { bg: '#faf5ff', color: '#7e22ce', border: '#e9d5ff',  label: 'Exchange Dispatched'  },
  exchange_delivered:  { bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0',  label: 'Exchange Delivered'   },
  cancelled:           { bg: '#f9fafb', color: '#6b7280', border: '#d1d5db',  label: 'Cancelled'            },
}

function Badge({ status }) {
  const cfg = STATUS_CFG[status] || { bg: '#f3f4f6', color: '#374151', border: '#d1d5db', label: status }
  return (
    <span className="inline-block text-[11px] uppercase tracking-[0.06em] font-medium px-2.5 py-0.5 rounded"
      style={{ border: `1px solid ${cfg.border}`, background: cfg.bg, color: cfg.color }}>
      {cfg.label}
    </span>
  )
}

function statusMessage(req) {
  const msgs = {
    requested:           'Your request is under review. We will respond within 24–48 hours.',
    approved:            req.priceDifference > 0
      ? `Approved! Please pay the price difference of ₹${req.priceDifference?.toLocaleString('en-IN')} to confirm your exchange.`
      : 'Your request has been approved! Pickup will be scheduled soon.',
    rejected:            req.rejectionType === 'hard'
      ? 'Your request has been permanently rejected.'
      : 'Your request was not approved.',
    payment_pending:     `Payment of ₹${req.priceDifference?.toLocaleString('en-IN')} is required to confirm your exchange.`,
    pickup_scheduled:    `Pickup scheduled${req.pickupDate ? ` for ${new Date(req.pickupDate).toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'})}` : ''}. Please keep the item ready and packed.`,
    item_received:       'We have received your item. Our team is inspecting it now.',
    refund_approved:     `Refund of ₹${req.refundAmount?.toLocaleString('en-IN')} approved!`,
    refund_rejected:     'Your refund was not approved.',
    refund_processed:    `Refund of ₹${req.refundAmount?.toLocaleString('en-IN')} processed. Ref: ${req.refundReference || 'N/A'}`,
    exchange_dispatched: `Your new item is on its way! Tracking: ${req.exchangeTrackingNumber || 'N/A'}`,
    exchange_delivered:  'Your exchange item has been delivered. Enjoy your new item!',
    cancelled:           'This request has been cancelled.',
  }
  return msgs[req.status] || ''
}

const TERMINAL = new Set(['exchange_dispatched', 'exchange_delivered', 'refund_processed', 'cancelled'])

function canCancel(req) {
  if (TERMINAL.has(req.status)) return false
  if (req.status === 'cancelled') return false
  if (req.type === 'return') return ['requested', 'approved'].includes(req.status)
  if (req.type === 'exchange') return ['requested', 'approved', 'pickup_scheduled'].includes(req.status)
  return false
}

export default function ReturnStatusCard({ request, onResubmit }) {
  const dispatch = useDispatch()
  const [showTimeline, setShowTimeline] = useState(false)
  const [confirmCancel, setConfirmCancel] = useState(false)
  const [payLoading, setPayLoading] = useState(false)

  const handleCancel = async () => {
    const result = await dispatch(cancelReturn(request.returnId))
    if (cancelReturn.fulfilled.match(result)) {
      toast.success('Request cancelled')
      setConfirmCancel(false)
    } else {
      toast.error(result.payload || 'Failed to cancel')
    }
  }

  const handlePayNow = async () => {
    setPayLoading(true)
    const result = await dispatch(initiateReturnPaymentThunk(request.returnId))
    setPayLoading(false)
    if (initiateReturnPaymentThunk.fulfilled.match(result)) {
      const { redirectUrl } = result.payload
      if (redirectUrl) window.location.href = redirectUrl
      else toast.error('Payment gateway unavailable. Please try later.')
    } else {
      toast.error(result.payload || 'Failed to initiate payment')
    }
  }

  const canResubmit = request.status === 'rejected' && request.resubmissionAllowed && (request.resubmissionCount || 0) === 0

  return (
    <div className="bg-[#141414] p-6 border border-[#242424] border-l-4 border-l-[#B8976A] mt-4 rounded-lg">
      {(request.status === 'payment_pending' || (request.status === 'approved' && request.priceDifference > 0)) && (
        <div className="bg-[#fefce8] border border-[#fde68a] p-3 px-4 mb-4 rounded-lg">
          <p className="text-[13px] font-semibold text-[#a16207] mb-2">
            Payment Required — ₹{request.priceDifference?.toLocaleString('en-IN')}
          </p>
          <p className="text-[12px] text-[#92400e] mb-3">
            Pay the price difference to confirm your exchange.
          </p>
          <button onClick={handlePayNow} disabled={payLoading}
            className="h-9 bg-gradient-to-r from-[#E8A0B0] to-[#D48A9A] text-white border-none px-5 text-[12px] uppercase tracking-[0.08em] cursor-pointer disabled:opacity-60 inline-flex items-center gap-1.5 rounded-lg transition-all hover:shadow-[0_8px_30px_rgba(238,107,131,0.3)]">
            {payLoading && <Loader2 size={12} className="animate-spin" />}
            Pay Now
          </button>
        </div>
      )}

      <div className="flex justify-between items-start flex-wrap gap-2 mb-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.06em] text-[#5C5C5C] mb-1">
            {request.type === 'return' ? 'Return Request' : 'Exchange Request'}
          </p>
          <p className="font-mono text-[16px] font-semibold text-white m-0">{request.returnId}</p>
        </div>
        <div className="text-right">
          <Badge status={request.status} />
          <p className="text-[12px] text-[#5C5C5C] mt-1">
            {new Date(request.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>

      <p className="text-[13px] text-white mb-2">{statusMessage(request)}</p>

      {(request.status === 'rejected' || request.status === 'refund_rejected') && request.adminNote && (
        <div className="bg-[#fef2f2] border border-[#fecaca] p-2.5 px-3.5 mb-2.5 rounded-lg">
          <p className="text-[13px] text-[#b91c1c] m-0">Reason: {request.adminNote}</p>
        </div>
      )}
      {request.adminNote && !['rejected', 'refund_rejected'].includes(request.status) && (
        <div className="bg-[#1C1C1C] p-2.5 px-3.5 mb-2.5 rounded-lg">
          <p className="text-[13px] text-[#9A9A9A] m-0">Note from ZYLARA: {request.adminNote}</p>
        </div>
      )}

      {request.status === 'rejected' && request.rejectionType === 'hard' && (
        <p className="text-[13px] text-[#EF4444] mb-2.5">This request has been permanently closed.</p>
      )}

      {request.refundMethod && (
        <p className="text-[12px] text-[#9A9A9A] mb-2">
          Refund method: <strong className="text-white">{request.refundMethod === 'bank_transfer' ? 'Bank Transfer' : 'ZYLARA Wallet'}</strong>
          {request.refundMethod === 'wallet' && request.walletCreditAmount > 0 && (
            <span> · ₹{request.walletCreditAmount?.toLocaleString('en-IN')} (incl. 10% bonus)</span>
          )}
        </p>
      )}

      {request.refundMethod === 'wallet' && request.status === 'refund_approved' && (
        <div className="bg-[#fefce8] border border-[#fde68a] p-2 px-3 mb-2 inline-block rounded-lg">
          <p className="text-[12px] text-[#a16207] m-0">Wallet credit of ₹{request.walletCreditAmount?.toLocaleString('en-IN')} pending admin approval</p>
        </div>
      )}
      {request.refundMethod === 'wallet' && request.status === 'refund_processed' && (
        <div className="bg-[#f0fdf4] border border-[#bbf7d0] p-2 px-3 mb-2 inline-block rounded-lg">
          <p className="text-[12px] text-[#15803d] m-0">₹{request.walletCreditAmount?.toLocaleString('en-IN')} credited to your ZYLARA wallet</p>
        </div>
      )}

      {request.items?.length > 0 && (
        <div className="mt-3 mb-2">
          {request.items.map((item, i) => (
            <div key={i} className="flex items-center gap-2.5 mb-2">
              {item.image
                ? <img src={item.image} alt={item.name} className="w-10 h-12 object-cover border border-[#242424] rounded flex-shrink-0" />
                : <div className="w-10 h-12 bg-[#1C1C1C] rounded flex-shrink-0" />
              }
              <div>
                <p className="text-[13px] font-medium text-white m-0">{item.name}</p>
                <p className="text-[12px] text-[#9A9A9A] m-0 mt-0.5">
                  {item.orderedSize}
                  {request.type === 'exchange' && item.exchangeSize && <span className="text-[#1d4ed8]"> → {item.exchangeSize}</span>}
                  {' '}&nbsp;·&nbsp; Qty {item.qty}
                </p>
              </div>
            </div>
          ))}
          {request.newProduct?.name && (
            <div className="mt-2 p-2 px-3 bg-[#eff6ff] border border-[#bfdbfe] rounded-lg">
              <p className="text-[12px] text-[#9A9A9A] m-0">
                Replacement: <strong className="text-[#1d4ed8]">{request.newProduct.name}</strong>
                {request.newProduct.size && <span> (Size: {request.newProduct.size})</span>}
              </p>
            </div>
          )}
        </div>
      )}

      {request.statusHistory?.length > 0 && (
        <div className="mt-3">
          <button onClick={() => setShowTimeline(v => !v)}
            className="bg-transparent border-none cursor-pointer text-[13px] text-[#9A9A9A] flex items-center gap-1 p-0 hover:text-white transition-colors">
            {showTimeline ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            {showTimeline ? 'Hide Timeline' : 'View Timeline'}
          </button>
          {showTimeline && (
            <div className="mt-3 pl-2 border-l-2 border-[#242424]">
              {request.statusHistory.map((h, i) => (
                <div key={i} className="mb-2.5">
                  <div className="flex items-center gap-1.5">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 -ml-[9px] ${i === request.statusHistory.length - 1 ? 'bg-[#B8976A]' : 'bg-white'}`} />
                    <Badge status={h.status} />
                    <span className="text-[11px] text-[#5C5C5C]">
                      {new Date(h.timestamp).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  {h.note && <p className="text-[11px] text-[#9A9A9A] m-0 mt-0.5 ml-3 italic">{h.note}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {canCancel(request) && (
        <div className="mt-3">
          {!confirmCancel ? (
            <button onClick={() => setConfirmCancel(true)}
              className="bg-transparent border-none cursor-pointer text-[12px] text-[#EF4444] p-0 underline">
              Cancel Request
            </button>
          ) : (
            <span className="text-[12px]">
              Are you sure?{' '}
              <button onClick={handleCancel}
                className="bg-transparent border-none cursor-pointer text-[#EF4444] font-semibold underline p-0 text-[12px]">
                Yes, Cancel
              </button>
              {' '}·{' '}
              <button onClick={() => setConfirmCancel(false)}
                className="bg-transparent border-none cursor-pointer text-[#9A9A9A] p-0 text-[12px]">
                Keep Request
              </button>
            </span>
          )}
        </div>
      )}

      {canResubmit && (
        <div className="mt-3 bg-[#f0fdf4] border border-[#bbf7d0] p-3 px-4 rounded-lg">
          <p className="text-[13px] text-[#15803d] mb-2">You can resubmit this request once</p>
          <button onClick={() => onResubmit?.({ originalReturnId: request.returnId, type: request.type })}
            className="h-9 border border-[#B8976A] bg-transparent px-5 text-[12px] uppercase tracking-[0.08em] cursor-pointer text-[#B8976A] rounded-lg hover:bg-[#B8976A] hover:text-white transition-colors">
            Resubmit Request
          </button>
        </div>
      )}
    </div>
  )
}
