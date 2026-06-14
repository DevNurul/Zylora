import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../lib/api'
import toast from 'react-hot-toast'
import { ArrowLeft, Loader2 } from 'lucide-react'

const TRANSITIONS = {
  requested:          [{ value:'approved', label:'Approve'}, {value:'rejected', label:'Reject'}, {value:'cancelled', label:'Cancel'}],
  approved:           [{ value:'pickup_scheduled', label:'Schedule Pickup'}, {value:'cancelled', label:'Cancel'}],
  payment_pending:    [{ value:'pickup_scheduled', label:'Mark Payment Received & Schedule Pickup'}],
  pickup_scheduled:   [{ value:'item_received', label:'Mark Item Received'}, {value:'cancelled', label:'Cancel'}],
  item_received:      null, // depends on type — handled below
  refund_approved:    [{ value:'refund_processed', label:'Mark Refund Processed'}],
  exchange_dispatched:[{ value:'exchange_delivered', label:'Mark Delivered'}],
}

const STATUS_CFG = {
  requested:           { bg:'#fefce8',color:'#a16207',label:'Pending Review' },
  approved:            { bg:'#eff6ff',color:'#1d4ed8',label:'Approved' },
  rejected:            { bg:'#fef2f2',color:'#b91c1c',label:'Rejected' },
  payment_pending:     { bg:'#fefce8',color:'#a16207',label:'Payment Required' },
  pickup_scheduled:    { bg:'#faf5ff',color:'#7e22ce',label:'Pickup Scheduled' },
  item_received:       { bg:'#eef2ff',color:'#3730a3',label:'Item Received' },
  refund_approved:     { bg:'#f0fdf4',color:'#15803d',label:'Refund Approved' },
  refund_rejected:     { bg:'#fef2f2',color:'#b91c1c',label:'Refund Rejected' },
  refund_processed:    { bg:'#dcfce7',color:'#14532d',label:'Refund Processed' },
  exchange_dispatched: { bg:'#faf5ff',color:'#7e22ce',label:'Dispatched' },
  exchange_delivered:  { bg:'#f0fdf4',color:'#15803d',label:'Exchange Delivered' },
  cancelled:           { bg:'#f9fafb',color:'#6b7280',label:'Cancelled' },
}

function StatusBadge({ status }) {
  const c = STATUS_CFG[status] || { bg:'#f3f4f6',color:'#374151',label:status }
  return <span className="text-[11px] uppercase px-2 py-0.5 rounded font-medium" style={{ background:c.bg,color:c.color }}>{c.label}</span>
}

function getTransitions(currentStatus, type) {
  if (currentStatus === 'item_received') {
    return type === 'return'
      ? [{ value:'refund_approved',label:'Approve Refund'}, {value:'refund_rejected',label:'Reject Refund'}]
      : [{ value:'exchange_dispatched',label:'Mark Exchange Dispatched'}]
  }
  return TRANSITIONS[currentStatus] || []
}

const LABEL = {
  approved:'Approving request',rejected:'Rejecting request',cancelled:'Cancelling request',
  pickup_scheduled:'Scheduling pickup',item_received:'Marking item received',
  payment_pending:'Moving to payment pending',
  refund_approved:'Approving refund',refund_rejected:'Rejecting refund',
  refund_processed:'Marking refund processed',exchange_dispatched:'Marking dispatched',
  exchange_delivered:'Marking delivered',
}

export default function AdminReturnDetail() {
  const { returnId } = useParams()
  const navigate     = useNavigate()
  const [req,      setReq]      = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [updating, setUpdating] = useState(false)

  const [newStatus,              setNewStatus]              = useState('')
  const [adminNote,              setAdminNote]              = useState('')
  const [internalNote,           setInternalNote]           = useState('')
  const [rejectionType,          setRejectionType]          = useState('soft')
  const [refundAmount,           setRefundAmount]           = useState('')
  const [refundReference,        setRefundReference]        = useState('')
  const [pickupDate,             setPickupDate]             = useState('')
  const [exchangeTrackingNumber, setExchangeTrackingNumber] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await api.get(`/admin/returns/${returnId}`)
      setReq(data.request)
      if (data.request.refundAmount) setRefundAmount(String(data.request.refundAmount))
    } catch {
      toast.error('Failed to load request')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [returnId])

  const handleUpdate = async () => {
    if (!newStatus) { toast.error('Select a status'); return }

    if (newStatus === 'rejected') {
      if (!adminNote.trim()) { toast.error('Rejection reason is required'); return }
      if (!rejectionType) { toast.error('Select rejection type (Soft or Hard)'); return }
    }
    if (newStatus === 'pickup_scheduled' && !pickupDate) { toast.error('Pickup date is required'); return }
    if (newStatus === 'refund_approved'   && !refundAmount) { toast.error('Refund amount is required'); return }
    if (newStatus === 'refund_processed'  && !refundReference.trim()) { toast.error('Refund reference is required'); return }
    if (newStatus === 'exchange_dispatched' && !exchangeTrackingNumber.trim()) { toast.error('Tracking number is required'); return }

    setUpdating(true)
    try {
      const body = { status: newStatus, adminNote, internalNote }
      if (newStatus === 'rejected')            body.rejectionType = rejectionType
      if (newStatus === 'refund_approved' || req.refundAmount)  body.refundAmount = Number(refundAmount)
      if (newStatus === 'refund_processed')    body.refundReference = refundReference
      if (newStatus === 'pickup_scheduled')    body.pickupDate = pickupDate
      if (newStatus === 'exchange_dispatched') body.exchangeTrackingNumber = exchangeTrackingNumber

      const { data } = await api.patch(`/admin/returns/${returnId}/status`, body)
      setReq(data.request)
      toast.success('Status updated successfully')
      setNewStatus(''); setAdminNote(''); setInternalNote('')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Update failed')
    } finally {
      setUpdating(false)
    }
  }

  if (loading) return <div className="p-8 text-center text-gray-400">Loading...</div>
  if (!req)    return <div className="p-8 text-center text-gray-400">Request not found</div>

  const transitions = getTransitions(req.status, req.type)
  const terminal    = transitions.length === 0

  return (
    <div className="p-8">
      <button onClick={() => navigate('/returns')}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors">
        <ArrowLeft size={14} /> All Returns
      </button>

      <div className="flex flex-col lg:flex-row gap-6 items-start">

        {/* ── Left column ───────────────────────────────────────────── */}
        <div className="flex-1 space-y-4 min-w-0">

          {/* Request info */}
          <div className="bg-white border border-gray-100 rounded-xl p-6">
            <div className="flex items-center gap-3 flex-wrap mb-4">
              <p className="font-mono text-2xl font-bold text-gray-900">{req.returnId}</p>
              <span className="text-xs px-2 py-0.5 rounded font-medium uppercase"
                style={{ background: req.type==='return'?'#fef2f2':'#eff6ff', color: req.type==='return'?'#b91c1c':'#1d4ed8' }}>
                {req.type}
              </span>
              {req.exchangeType === 'different_product' && (
                <span className="text-xs px-2 py-0.5 rounded font-medium uppercase bg-purple-50 text-purple-700">
                  different product
                </span>
              )}
              <StatusBadge status={req.status} />
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-xs text-gray-400 uppercase mb-1">Order ID</p><p className="font-mono font-semibold">{req.orderId}</p></div>
              <div><p className="text-xs text-gray-400 uppercase mb-1">Customer</p><p className="text-gray-700">{req.customerEmail}</p></div>
              <div><p className="text-xs text-gray-400 uppercase mb-1">Submitted</p><p className="text-gray-700">{new Date(req.createdAt).toLocaleString('en-IN',{day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'})}</p></div>
              {req.refundAmount > 0 && <div><p className="text-xs text-gray-400 uppercase mb-1">Refund Amount</p><p className="font-semibold text-green-700">₹{req.refundAmount.toLocaleString('en-IN')}</p></div>}
              {req.refundMethod && <div>
                <p className="text-xs text-gray-400 uppercase mb-1">Refund Method</p>
                <p className="text-gray-700 capitalize">{req.refundMethod === 'bank_transfer' ? 'Bank Transfer' : 'AMRIN Wallet'}</p>
              </div>}
              {req.priceDifference !== 0 && <div>
                <p className="text-xs text-gray-400 uppercase mb-1">Price Difference</p>
                <p className={`font-semibold ${req.priceDifference > 0 ? 'text-red-600' : 'text-green-700'}`}>
                  {req.priceDifference > 0 ? '+' : ''}₹{req.priceDifference.toLocaleString('en-IN')}
                  {req.priceDifferencePayment?.status === 'paid' && <span className="ml-2 text-xs bg-green-50 text-green-700 px-1.5 py-0.5 rounded">Paid</span>}
                  {req.priceDifferencePayment?.status === 'pending' && <span className="ml-2 text-xs bg-yellow-50 text-yellow-700 px-1.5 py-0.5 rounded">Awaiting payment</span>}
                </p>
              </div>}
              {req.rejectionType && <div>
                <p className="text-xs text-gray-400 uppercase mb-1">Rejection Type</p>
                <p className={`font-semibold ${req.rejectionType === 'hard' ? 'text-red-600' : 'text-orange-600'}`}>
                  {req.rejectionType === 'hard' ? 'Hard (Permanent)' : 'Soft (Resubmittable)'}
                </p>
              </div>}
              {req.resubmissionCount > 0 && <div>
                <p className="text-xs text-gray-400 uppercase mb-1">Resubmission</p>
                <p className="text-gray-700">#{req.resubmissionCount} (of {req.originalReturnId})</p>
              </div>}
            </div>
          </div>

          {/* Bank details (if bank transfer) */}
          {req.refundMethod === 'bank_transfer' && req.bankDetails?.accountNumber && (
            <div className="bg-white border border-gray-100 rounded-xl p-6">
              <h3 className="text-xs font-semibold uppercase text-gray-400 tracking-wide mb-3">Bank Details</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><p className="text-xs text-gray-400">Name</p><p>{req.bankDetails.accountHolderName}</p></div>
                <div><p className="text-xs text-gray-400">Account No.</p><p className="font-mono">{req.bankDetails.accountNumber}</p></div>
                <div><p className="text-xs text-gray-400">IFSC</p><p className="font-mono">{req.bankDetails.ifscCode}</p></div>
                <div><p className="text-xs text-gray-400">Bank</p><p>{req.bankDetails.bankName}</p></div>
              </div>
            </div>
          )}

          {/* New product (different_product exchange) */}
          {req.newProduct?.name && (
            <div className="bg-white border border-gray-100 rounded-xl p-6">
              <h3 className="text-xs font-semibold uppercase text-gray-400 tracking-wide mb-3">Replacement Product</h3>
              <div className="flex gap-4">
                {req.newProduct.image && <img src={req.newProduct.image} alt={req.newProduct.name} className="w-16 h-20 object-cover border border-gray-100 flex-shrink-0" />}
                <div>
                  <p className="font-medium text-gray-900">{req.newProduct.name}</p>
                  <p className="text-sm text-gray-500 mt-0.5">Size: {req.newProduct.size} · ₹{req.newProduct.price?.toLocaleString('en-IN')}</p>
                  {req.priceDifference > 0 && <p className="text-xs text-red-600 mt-1">Customer pays +₹{req.priceDifference.toLocaleString('en-IN')}</p>}
                  {req.priceDifference < 0 && <p className="text-xs text-green-600 mt-1">Refund ₹{Math.abs(req.priceDifference).toLocaleString('en-IN')} to customer</p>}
                </div>
              </div>
            </div>
          )}

          {/* Items */}
          <div className="bg-white border border-gray-100 rounded-xl p-6">
            <h3 className="text-xs font-semibold uppercase text-gray-400 tracking-wide mb-4">Items Requested</h3>
            {req.items.map((item, i) => (
              <div key={i} className={`flex gap-4 ${i > 0 ? 'mt-4 pt-4 border-t border-gray-50' : ''}`}>
                {item.image
                  ? <img src={item.image} alt={item.name} className="w-16 h-20 object-cover border border-gray-100 flex-shrink-0" />
                  : <div className="w-16 h-20 bg-gray-50 flex-shrink-0" />
                }
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{item.name}</p>
                  <p className="text-sm text-gray-500 mt-0.5">Size: {item.orderedSize} · Qty: {item.qty} · ₹{(item.price*item.qty).toLocaleString('en-IN')}</p>
                  <span className="inline-block mt-1.5 text-xs bg-gray-50 text-gray-600 px-2 py-0.5 rounded">{item.reason}</span>
                  {req.type === 'exchange' && req.exchangeType !== 'different_product' && item.exchangeSize && (
                    <span className="ml-2 text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">→ {item.exchangeSize}</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Comment */}
          {req.comment && (
            <div className="bg-white border border-gray-100 rounded-xl p-6">
              <h3 className="text-xs font-semibold uppercase text-gray-400 tracking-wide mb-3">Customer Comment</h3>
              <p className="text-sm text-gray-700 italic">"{req.comment}"</p>
            </div>
          )}

          {/* Status history */}
          <div className="bg-white border border-gray-100 rounded-xl p-6">
            <h3 className="text-xs font-semibold uppercase text-gray-400 tracking-wide mb-4">Status History</h3>
            {req.statusHistory?.map((h, i) => (
              <div key={i} className="flex items-start gap-3 mb-3">
                <StatusBadge status={h.status} />
                <div>
                  <p className="text-xs text-gray-500">{new Date(h.timestamp).toLocaleString('en-IN',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}</p>
                  {h.note && <p className="text-xs text-gray-600 mt-0.5">{h.note}</p>}
                  <p className="text-xs text-gray-400 mt-0.5">By: {h.updatedBy}</p>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* ── Right column ──────────────────────────────────────────── */}
        <div className="lg:w-80 flex-shrink-0 space-y-4">

          {/* Update status */}
          <div className="bg-white border border-gray-100 rounded-xl p-6">
            <h3 className="text-xs font-semibold uppercase text-gray-400 tracking-wide mb-4">Update Request Status</h3>
            <div className="mb-3 flex items-center gap-2">
              <span className="text-xs text-gray-500">Current:</span>
              <StatusBadge status={req.status} />
            </div>

            {terminal ? (
              <p className="text-sm text-gray-400 italic">No further actions available.</p>
            ) : (
              <>
                <select value={newStatus} onChange={e => setNewStatus(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A96E] bg-white mb-3">
                  <option value="">Select next status</option>
                  {transitions.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>

                {/* Rejection type selector */}
                {newStatus === 'rejected' && (
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 mb-2 font-medium">Rejection Type *</p>
                    <div className="space-y-2">
                      <label className={`flex gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${rejectionType === 'soft' ? 'border-orange-400 bg-orange-50' : 'border-gray-200'}`}>
                        <input type="radio" name="rejType" value="soft" checked={rejectionType === 'soft'} onChange={() => setRejectionType('soft')} />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Soft Reject</p>
                          <p className="text-xs text-gray-500">Customer can resubmit once. Use when more info is needed.</p>
                        </div>
                      </label>
                      <label className={`flex gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${rejectionType === 'hard' ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}>
                        <input type="radio" name="rejType" value="hard" checked={rejectionType === 'hard'} onChange={() => setRejectionType('hard')} />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Hard Reject</p>
                          <p className="text-xs text-gray-500">Permanently close. Use when request clearly violates policy.</p>
                        </div>
                      </label>
                    </div>
                    <div className="mt-3">
                      <label className="text-xs text-gray-500 block mb-1">Reason for rejection (shown to customer) *</label>
                      <textarea value={adminNote} onChange={e => setAdminNote(e.target.value)} rows={3}
                        placeholder="Explain reason to customer..."
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A96E] resize-none" />
                    </div>
                  </div>
                )}

                {/* Other conditional fields */}
                {newStatus === 'pickup_scheduled' && (
                  <div className="mb-3">
                    <label className="text-xs text-gray-500 block mb-1">Pickup Date *</label>
                    <input type="date" value={pickupDate} onChange={e => setPickupDate(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A96E]" />
                  </div>
                )}
                {newStatus === 'refund_approved' && (
                  <div className="mb-3">
                    <label className="text-xs text-gray-500 block mb-1">Refund Amount (₹) *</label>
                    <input type="number" value={refundAmount} onChange={e => setRefundAmount(e.target.value)} min={0}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A96E]" />
                    {req.refundMethod === 'wallet' && refundAmount && (
                      <p className="text-xs text-green-600 mt-1">Wallet credit: ₹{(Number(refundAmount) * 1.10).toFixed(2)} (incl. 10% bonus) — pending your approval</p>
                    )}
                  </div>
                )}
                {newStatus === 'refund_processed' && (
                  <div className="mb-3">
                    <label className="text-xs text-gray-500 block mb-1">
                      {req.refundMethod === 'wallet' ? 'Wallet Credit Reference' : 'UPI / Bank Reference'} *
                    </label>
                    <input value={refundReference} onChange={e => setRefundReference(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A96E]" />
                  </div>
                )}
                {newStatus === 'exchange_dispatched' && (
                  <div className="mb-3">
                    <label className="text-xs text-gray-500 block mb-1">Courier Tracking Number *</label>
                    <input value={exchangeTrackingNumber} onChange={e => setExchangeTrackingNumber(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A96E]" />
                  </div>
                )}
                {newStatus && newStatus !== 'rejected' && (
                  <div className="mb-3">
                    <label className="text-xs text-gray-500 block mb-1">Note to customer (optional)</label>
                    <textarea value={adminNote} onChange={e => setAdminNote(e.target.value)} rows={2}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A96E] resize-none" />
                  </div>
                )}

                <div className="mb-4">
                  <label className="text-xs text-gray-500 block mb-1">Internal note (not shown to customer)</label>
                  <textarea value={internalNote} onChange={e => setInternalNote(e.target.value)} rows={2}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A96E] resize-none" />
                </div>

                <button onClick={handleUpdate} disabled={updating || !newStatus}
                  className="w-full h-12 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  {updating && <Loader2 size={14} className="animate-spin" />}
                  {updating ? `${LABEL[newStatus] || 'Updating'}...` : 'Update Status'}
                </button>
              </>
            )}
          </div>

          {/* Internal note display */}
          {req.internalNote && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <p className="text-xs font-semibold text-yellow-800 uppercase mb-1">Internal Note</p>
              <p className="text-sm text-yellow-700">{req.internalNote}</p>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
