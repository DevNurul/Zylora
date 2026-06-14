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
    <span style={{
      display: 'inline-block', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em',
      fontWeight: 500, padding: '3px 10px', borderRadius: 3,
      border: `1px solid ${cfg.border}`, background: cfg.bg, color: cfg.color,
    }}>{cfg.label}</span>
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
  if (req.status === 'cancelled')   return false
  if (req.type === 'return')    return ['requested', 'approved'].includes(req.status)
  if (req.type === 'exchange')  return ['requested', 'approved', 'pickup_scheduled'].includes(req.status)
  return false
}

export default function ReturnStatusCard({ request, onResubmit }) {
  const dispatch = useDispatch()
  const [showTimeline,   setShowTimeline]   = useState(false)
  const [confirmCancel,  setConfirmCancel]  = useState(false)
  const [payLoading,     setPayLoading]     = useState(false)

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
      if (redirectUrl) {
        window.location.href = redirectUrl
      } else {
        toast.error('Payment gateway unavailable. Please try later.')
      }
    } else {
      toast.error(result.payload || 'Failed to initiate payment')
    }
  }

  const canResubmit = request.status === 'rejected' && request.resubmissionAllowed && (request.resubmissionCount || 0) === 0

  return (
    <div style={{
      background: '#fff', padding: 24,
      border: '1px solid #E5E5E5', borderLeftWidth: 4, borderLeftColor: '#EE6B83',
      marginTop: 16,
    }}>
      {/* Payment Required notice */}
      {(request.status === 'payment_pending' || (request.status === 'approved' && request.priceDifference > 0)) && (
        <div style={{ background: '#fefce8', border: '1px solid #fde68a', padding: '12px 16px', marginBottom: 16 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#a16207', margin: '0 0 8px' }}>
            Payment Required — ₹{request.priceDifference?.toLocaleString('en-IN')}
          </p>
          <p style={{ fontSize: 12, color: '#92400e', margin: '0 0 10px' }}>
            Pay the price difference to confirm your exchange.
          </p>
          <button onClick={handlePayNow} disabled={payLoading}
            style={{
              height: 36, background: '#EE6B83', color: '#fff', border: 'none',
              padding: '0 20px', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em',
              cursor: payLoading ? 'not-allowed' : 'pointer', opacity: payLoading ? 0.6 : 1,
              display: 'inline-flex', alignItems: 'center', gap: 6, borderRadius: 8,
            }}>
            {payLoading && <Loader2 size={12} className="animate-spin" />}
            Pay Now
          </button>
        </div>
      )}

      {/* Top row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
        <div>
          <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#6B6B6B', margin: '0 0 4px' }}>
            {request.type === 'return' ? 'Return Request' : 'Exchange Request'}
          </p>
          <p style={{ fontFamily: 'monospace', fontSize: 16, fontWeight: 600, color: '#0A0A0A', margin: 0 }}>
            {request.returnId}
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <Badge status={request.status} />
          <p style={{ fontSize: 12, color: '#6B6B6B', margin: '4px 0 0' }}>
            {new Date(request.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Status message */}
      <p style={{ fontSize: 13, color: '#0A0A0A', margin: '0 0 8px' }}>{statusMessage(request)}</p>

      {/* Admin note */}
      {(request.status === 'rejected' || request.status === 'refund_rejected') && request.adminNote && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '10px 14px', marginBottom: 10 }}>
          <p style={{ fontSize: 13, color: '#b91c1c', margin: 0 }}>Reason: {request.adminNote}</p>
        </div>
      )}
      {request.adminNote && !['rejected', 'refund_rejected'].includes(request.status) && (
        <div style={{ background: '#FCD4DB', padding: '10px 14px', marginBottom: 10 }}>
          <p style={{ fontSize: 13, color: '#6B6B6B', margin: 0 }}>Note from LUXORA JEWELLERY: {request.adminNote}</p>
        </div>
      )}

      {/* Hard reject notice */}
      {request.status === 'rejected' && request.rejectionType === 'hard' && (
        <p style={{ fontSize: 13, color: '#ef4444', margin: '0 0 10px' }}>
          This request has been permanently closed.
        </p>
      )}

      {/* Refund method info */}
      {request.refundMethod && (
        <p style={{ fontSize: 12, color: '#6B6B6B', margin: '0 0 8px' }}>
          Refund method: <strong>{request.refundMethod === 'bank_transfer' ? 'Bank Transfer' : 'LUXORA Wallet'}</strong>
          {request.refundMethod === 'wallet' && request.walletCreditAmount > 0 && (
            <span> · ₹{request.walletCreditAmount?.toLocaleString('en-IN')} (incl. 10% bonus)</span>
          )}
        </p>
      )}

      {/* Wallet credit status */}
      {request.refundMethod === 'wallet' && request.status === 'refund_approved' && (
        <div style={{ background: '#fefce8', border: '1px solid #fde68a', padding: '8px 12px', marginBottom: 8, display: 'inline-block' }}>
          <p style={{ fontSize: 12, color: '#a16207', margin: 0 }}>
            Wallet credit of ₹{request.walletCreditAmount?.toLocaleString('en-IN')} pending admin approval
          </p>
        </div>
      )}
      {request.refundMethod === 'wallet' && request.status === 'refund_processed' && (
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '8px 12px', marginBottom: 8, display: 'inline-block' }}>
          <p style={{ fontSize: 12, color: '#15803d', margin: 0 }}>
            ₹{request.walletCreditAmount?.toLocaleString('en-IN')} credited to your LUXORA wallet
          </p>
        </div>
      )}

      {/* Items summary */}
      {request.items?.length > 0 && (
        <div style={{ marginTop: 12, marginBottom: 8 }}>
          {request.items.map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              {item.image
                ? <img src={item.image} alt={item.name} style={{ width: 40, height: 48, objectFit: 'cover', border: '1px solid #E5E5E5', flexShrink: 0 }} />
                : <div style={{ width: 40, height: 48, background: '#FCD4DB', flexShrink: 0 }} />
              }
              <div>
                <p style={{ fontSize: 13, fontWeight: 500, color: '#0A0A0A', margin: 0 }}>{item.name}</p>
                <p style={{ fontSize: 12, color: '#6B6B6B', margin: '2px 0 0' }}>
                  {item.orderedSize}
                  {request.type === 'exchange' && item.exchangeSize && (
                    <span style={{ color: '#1d4ed8' }}> → {item.exchangeSize}</span>
                  )}
                  {' '}&nbsp;·&nbsp; Qty {item.qty}
                </p>
              </div>
            </div>
          ))}
          {/* New product for different_product exchange */}
          {request.newProduct?.name && (
            <div style={{ marginTop: 8, padding: '8px 12px', background: '#eff6ff', border: '1px solid #bfdbfe' }}>
              <p style={{ fontSize: 12, color: '#6B6B6B', margin: 0 }}>
                Replacement: <strong style={{ color: '#1d4ed8' }}>{request.newProduct.name}</strong>
                {request.newProduct.size && <span> (Size: {request.newProduct.size})</span>}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Timeline */}
      {request.statusHistory?.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <button onClick={() => setShowTimeline(v => !v)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#6B6B6B', display: 'flex', alignItems: 'center', gap: 4, padding: 0 }}>
            {showTimeline ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            {showTimeline ? 'Hide Timeline' : 'View Timeline'}
          </button>
          {showTimeline && (
            <div style={{ marginTop: 12, paddingLeft: 8, borderLeft: '2px solid #E5E5E5' }}>
              {request.statusHistory.map((h, i) => (
                <div key={i} style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: i === request.statusHistory.length - 1 ? '#EE6B83' : '#0A0A0A', flexShrink: 0, marginLeft: -12 }} />
                    <Badge status={h.status} />
                    <span style={{ fontSize: 11, color: '#9CA3AF' }}>
                      {new Date(h.timestamp).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  {h.note && <p style={{ fontSize: 11, color: '#6B6B6B', margin: '2px 0 0 12px', fontStyle: 'italic' }}>{h.note}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Cancel button */}
      {canCancel(request) && (
        <div style={{ marginTop: 12 }}>
          {!confirmCancel ? (
            <button onClick={() => setConfirmCancel(true)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#ef4444', padding: 0, textDecoration: 'underline' }}>
              Cancel Request
            </button>
          ) : (
            <span style={{ fontSize: 12 }}>
              Are you sure?{' '}
              <button onClick={handleCancel}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontWeight: 600, textDecoration: 'underline', padding: 0, fontSize: 12 }}>
                Yes, Cancel
              </button>
              {' '}·{' '}
              <button onClick={() => setConfirmCancel(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B6B6B', padding: 0, fontSize: 12 }}>
                Keep Request
              </button>
            </span>
          )}
        </div>
      )}

      {/* Resubmission option */}
      {canResubmit && (
        <div style={{ marginTop: 12, background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '12px 16px' }}>
          <p style={{ fontSize: 13, color: '#15803d', margin: '0 0 8px' }}>You can resubmit this request once</p>
          <button
            onClick={() => onResubmit?.({ originalReturnId: request.returnId, type: request.type })}
            style={{
              height: 36, border: '1px solid #EE6B83', background: '#fff',
              padding: '0 20px', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em',
              cursor: 'pointer', color: '#EE6B83', borderRadius: 8
            }}>
            Resubmit Request
          </button>
        </div>
      )}
    </div>
  )
}
