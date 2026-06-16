import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../lib/api'
import toast from 'react-hot-toast'
import { 
  ArrowLeft, 
  Loader2, 
  Calendar, 
  DollarSign, 
  CreditCard, 
  Truck, 
  Info, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Building, 
  Package, 
  History, 
  User, 
  Copy, 
  Check 
} from 'lucide-react'

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
  requested:           { bg: 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20', label: 'Pending Review' },
  approved:            { bg: 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20', label: 'Approved' },
  rejected:            { bg: 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20', label: 'Rejected' },
  payment_pending:     { bg: 'bg-yellow-50 text-yellow-700 border-yellow-100 dark:bg-yellow-500/10 dark:text-yellow-400 dark:border-yellow-500/20', label: 'Payment Required' },
  pickup_scheduled:    { bg: 'bg-purple-50 text-purple-700 border-purple-100 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20', label: 'Pickup Scheduled' },
  item_received:       { bg: 'bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20', label: 'Item Received' },
  refund_approved:     { bg: 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20', label: 'Refund Approved' },
  refund_rejected:     { bg: 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20', label: 'Refund Rejected' },
  refund_processed:    { bg: 'bg-teal-50 text-teal-700 border-teal-100 dark:bg-teal-500/10 dark:text-teal-400 dark:border-teal-500/20', label: 'Refund Processed' },
  exchange_dispatched: { bg: 'bg-purple-50 text-purple-700 border-purple-100 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20', label: 'Dispatched' },
  exchange_delivered:  { bg: 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20', label: 'Exchange Delivered' },
  cancelled:           { bg: 'bg-slate-50 text-slate-700 border-slate-100 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20', label: 'Cancelled' },
}

function StatusBadge({ status }) {
  const c = STATUS_CFG[status] || { bg: 'bg-slate-50 text-slate-700 border-slate-100 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20', label: status }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border uppercase tracking-wider ${c.bg}`}>
      {c.label}
    </span>
  )
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

const getStepIndex = (status, type) => {
  const returnMapping = {
    requested: 0,
    approved: 1,
    payment_pending: 1,
    pickup_scheduled: 2,
    item_received: 3,
    refund_approved: 4,
    refund_processed: 5,
  }
  const exchangeMapping = {
    requested: 0,
    approved: 1,
    payment_pending: 1,
    pickup_scheduled: 2,
    item_received: 3,
    exchange_dispatched: 4,
    exchange_delivered: 5,
  }
  const mapping = type === 'return' ? returnMapping : exchangeMapping
  return mapping[status] ?? -1
}

export default function AdminReturnDetail() {
  const { returnId } = useParams()
  const navigate     = useNavigate()
  const [req,      setReq]      = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [updating, setUpdating] = useState(false)
  const [copied,   setCopied]   = useState(false)

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

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success('Copied Return ID')
    setTimeout(() => setCopied(false), 2000)
  }

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    )
  }
  if (!req) {
    return (
      <div className="p-8 text-center text-gray-500 dark:text-gray-400">
        <AlertCircle className="mx-auto text-gray-400 mb-2" size={32} />
        <p className="font-semibold text-lg">Request not found</p>
      </div>
    )
  }

  const transitions = getTransitions(req.status, req.type)
  const terminal    = transitions.length === 0

  const steps = req.type === 'return' 
    ? [
        { label: 'Requested', desc: 'Pending review' },
        { label: 'Approved', desc: 'Request approved' },
        { label: 'Pickup', desc: 'Item collection' },
        { label: 'Received', desc: 'Quality check' },
        { label: 'Refund Approved', desc: 'Refund authorized' },
        { label: 'Completed', desc: 'Refund processed' }
      ]
    : [
        { label: 'Requested', desc: 'Pending review' },
        { label: 'Approved', desc: 'Request approved' },
        { label: 'Pickup', desc: 'Item collection' },
        { label: 'Received', desc: 'Quality check' },
        { label: 'Dispatched', desc: 'Replacement sent' },
        { label: 'Delivered', desc: 'Exchange complete' }
      ]

  const currentStep = getStepIndex(req.status, req.type)
  const isFailed = ['rejected', 'cancelled', 'refund_rejected'].includes(req.status)

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Back button */}
      <button 
        onClick={() => navigate('/returns')}
        className="group flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" /> 
        Back to Returns
      </button>

      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-dark-card border border-gray-100 dark:border-white/5 p-6 rounded-2xl shadow-xs">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="font-mono text-xl md:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              {req.returnId}
              <button 
                onClick={() => copyToClipboard(req.returnId)} 
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1"
                title="Copy Return ID"
              >
                {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
              </button>
            </h1>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border ${
              req.type === 'return' 
                ? 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20' 
                : 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20'
            }`}>
              {req.type}
            </span>
            {req.exchangeType === 'different_product' && (
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-100 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20">
                Different Product Exchange
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            Order: <span className="font-mono font-medium">{req.orderId}</span> · Customer: {req.customerEmail}
          </p>
        </div>
        <div>
          <StatusBadge status={req.status} />
        </div>
      </div>

      {/* Stepper progress tracker */}
      <div className="bg-white dark:bg-dark-card border border-gray-100 dark:border-white/5 rounded-2xl p-6 shadow-xs overflow-x-auto no-scrollbar">
        {isFailed ? (
          <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400 p-2">
            <AlertCircle size={20} />
            <div>
              <p className="font-semibold text-sm">Request Terminated</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                This request is {req.status === 'rejected' ? 'rejected' : req.status === 'refund_rejected' ? 'refund rejected' : 'cancelled'}.
              </p>
            </div>
          </div>
        ) : (
          <div className="min-w-[650px] flex items-center justify-between relative px-4 py-2">
            {/* Background Line */}
            <div className="absolute top-1/2 left-8 right-8 h-0.5 bg-gray-100 dark:bg-white/10 -translate-y-1/2 z-0" />
            {/* Filled Line */}
            <div 
              className="absolute top-1/2 left-8 h-0.5 bg-primary -translate-y-1/2 transition-all duration-500 z-0" 
              style={{ width: `${(Math.max(0, currentStep) / (steps.length - 1)) * 92}%` }}
            />
            
            {steps.map((step, idx) => {
              const isCompleted = idx < currentStep
              const isActive = idx === currentStep
              return (
                <div key={idx} className="flex flex-col items-center relative z-10 flex-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                    isCompleted 
                      ? 'bg-primary border-primary text-white' 
                      : isActive 
                        ? 'bg-white dark:bg-dark-card border-primary text-primary shadow-sm shadow-primary/20 scale-110' 
                        : 'bg-white dark:bg-dark-card border-gray-200 dark:border-white/10 text-gray-400 dark:text-gray-500'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle2 size={16} className="stroke-[3]" />
                    ) : (
                      <span className="text-xs font-bold">{idx + 1}</span>
                    )}
                  </div>
                  <p className={`text-xs font-semibold mt-2 text-center transition-all ${
                    isActive ? 'text-primary' : isCompleted ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400'
                  }`}>{step.label}</p>
                  <p className="text-[9px] text-gray-400 dark:text-gray-500 mt-0.5 text-center hidden md:block">{step.desc}</p>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Left Column (Details) */}
        <div className="flex-1 space-y-6 min-w-0 w-full">
          {/* General Metadata */}
          <div className="bg-white dark:bg-dark-card border border-gray-100 dark:border-white/5 rounded-2xl p-6 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-4 flex items-center gap-2">
              <Info size={14} /> Request Overview
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
              <div>
                <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase mb-1">Submitted Date</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {new Date(req.createdAt).toLocaleString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>

              {req.refundAmount > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase mb-1">Refund Amount</p>
                  <p className="font-bold text-emerald-600 dark:text-emerald-400 text-base">
                    ₹{req.refundAmount.toLocaleString('en-IN')}
                  </p>
                </div>
              )}

              {req.refundMethod && (
                <div>
                  <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase mb-1">Refund Method</p>
                  <p className="font-medium text-gray-700 dark:text-gray-300 capitalize">
                    {req.refundMethod === 'bank_transfer' ? 'Bank Transfer' : 'Zylora Wallet'}
                  </p>
                </div>
              )}

              {req.priceDifference !== 0 && (
                <div>
                  <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase mb-1">Price Difference</p>
                  <p className={`font-bold text-base ${req.priceDifference > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                    {req.priceDifference > 0 ? '+' : ''}₹{req.priceDifference.toLocaleString('en-IN')}
                    {req.priceDifferencePayment?.status === 'paid' && (
                      <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20">Paid</span>
                    )}
                    {req.priceDifferencePayment?.status === 'pending' && (
                      <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20">Awaiting</span>
                    )}
                  </p>
                </div>
              )}

              {req.rejectionType && (
                <div>
                  <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase mb-1">Rejection Type</p>
                  <p className={`font-semibold ${req.rejectionType === 'hard' ? 'text-rose-600 dark:text-rose-400' : 'text-orange-600 dark:text-orange-400'}`}>
                    {req.rejectionType === 'hard' ? 'Hard (Permanent)' : 'Soft (Resubmittable)'}
                  </p>
                </div>
              )}

              {req.resubmissionCount > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase mb-1">Resubmission</p>
                  <p className="font-medium text-gray-700 dark:text-gray-300">
                    #{req.resubmissionCount} <span className="text-gray-400 dark:text-gray-500">(Original: {req.originalReturnId})</span>
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Replacement product (different_product exchange) */}
          {req.newProduct?.name && (
            <div className="bg-white dark:bg-dark-card border border-gray-100 dark:border-white/5 rounded-2xl p-6 shadow-xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-4 flex items-center gap-2">
                <Truck size={14} /> Replacement Product
              </h3>
              <div className="flex gap-4 p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                {req.newProduct.image ? (
                  <img 
                    src={req.newProduct.image} 
                    alt={req.newProduct.name} 
                    className="w-16 h-20 object-cover border border-gray-200 dark:border-white/10 rounded-lg flex-shrink-0" 
                  />
                ) : (
                  <div className="w-16 h-20 bg-gray-100 dark:bg-white/5 rounded-lg flex-shrink-0 flex items-center justify-center text-gray-400"><Package size={20} /></div>
                )}
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{req.newProduct.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Size: <span className="font-medium text-gray-700 dark:text-gray-300">{req.newProduct.size}</span> · Price: <span className="font-medium text-gray-700 dark:text-gray-300">₹{req.newProduct.price?.toLocaleString('en-IN')}</span>
                  </p>
                  {req.priceDifference > 0 && (
                    <p className="text-xs text-rose-600 dark:text-rose-400 mt-1 font-medium">Customer pays additional +₹{req.priceDifference.toLocaleString('en-IN')}</p>
                  )}
                  {req.priceDifference < 0 && (
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-medium">Refund ₹{Math.abs(req.priceDifference).toLocaleString('en-IN')} to customer</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Items Requested */}
          <div className="bg-white dark:bg-dark-card border border-gray-100 dark:border-white/5 rounded-2xl p-6 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-4 flex items-center gap-2">
              <Package size={14} /> Items Requested
            </h3>
            <div className="space-y-4">
              {req.items.map((item, i) => (
                <div 
                  key={i} 
                  className={`flex gap-4 p-4 rounded-xl bg-gray-50/50 dark:bg-white/5 border border-gray-100 dark:border-white/5 ${
                    i > 0 ? '' : ''
                  }`}
                >
                  {item.image ? (
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-16 h-20 object-cover border border-gray-200 dark:border-white/10 rounded-lg flex-shrink-0" 
                    />
                  ) : (
                    <div className="w-16 h-20 bg-gray-100 dark:bg-white/5 rounded-lg flex-shrink-0 flex items-center justify-center text-gray-400"><Package size={20} /></div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white truncate">{item.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Size: <span className="font-medium text-gray-700 dark:text-gray-300">{item.orderedSize}</span> · Qty: <span className="font-medium text-gray-700 dark:text-gray-300">{item.qty}</span> · Total: <span className="font-medium text-gray-700 dark:text-gray-300">₹{(item.price * item.qty).toLocaleString('en-IN')}</span>
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 border border-gray-200/50 dark:border-white/5">
                        Reason: {item.reason}
                      </span>
                      {req.type === 'exchange' && req.exchangeType !== 'different_product' && item.exchangeSize && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-500/20">
                          Exchanged Size: {item.exchangeSize}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bank Details */}
          {req.refundMethod === 'bank_transfer' && req.bankDetails?.accountNumber && (
            <div className="bg-white dark:bg-dark-card border border-gray-100 dark:border-white/5 rounded-2xl p-6 shadow-xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-4 flex items-center gap-2">
                <Building size={14} /> Bank Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 dark:bg-white/5 p-4 rounded-xl border border-gray-100 dark:border-white/5 text-sm">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase">Account Holder</p>
                  <p className="font-medium text-gray-900 dark:text-white mt-0.5">{req.bankDetails.accountHolderName}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase">Account Number</p>
                  <p className="font-mono font-medium text-gray-900 dark:text-white mt-0.5">{req.bankDetails.accountNumber}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase">IFSC Code</p>
                  <p className="font-mono font-medium text-gray-900 dark:text-white mt-0.5">{req.bankDetails.ifscCode}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase">Bank Name</p>
                  <p className="font-medium text-gray-900 dark:text-white mt-0.5">{req.bankDetails.bankName}</p>
                </div>
              </div>
            </div>
          )}

          {/* Customer Comment */}
          {req.comment && (
            <div className="bg-white dark:bg-dark-card border border-gray-100 dark:border-white/5 rounded-2xl p-6 shadow-xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2 flex items-center gap-2">
                <FileText size={14} /> Customer Comment
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-300 italic border-l-2 border-primary/40 pl-4 py-1">
                "{req.comment}"
              </p>
            </div>
          )}

          {/* Status History */}
          <div className="bg-white dark:bg-dark-card border border-gray-100 dark:border-white/5 rounded-2xl p-6 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-4 flex items-center gap-2">
              <History size={14} /> Status Log
            </h3>
            <div className="flow-root">
              <ul className="-mb-8">
                {req.statusHistory?.map((h, i) => (
                  <li key={i}>
                    <div className="relative pb-8">
                      {i !== req.statusHistory.length - 1 ? (
                        <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200 dark:bg-white/10" aria-hidden="true" />
                      ) : null}
                      <div className="relative flex space-x-3">
                        <div>
                          <span className="h-8 w-8 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center ring-8 ring-white dark:ring-dark-card">
                            <ClockIcon status={h.status} />
                          </span>
                        </div>
                        <div className="flex-1 min-w-0 pt-1.5 flex justify-between space-x-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <StatusBadge status={h.status} />
                              <span className="text-xs text-gray-400 dark:text-gray-500">by {h.updatedBy}</span>
                            </div>
                            {h.note && (
                              <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 bg-gray-50 dark:bg-white/5 p-2 rounded-lg border border-gray-100/50 dark:border-white/5">
                                {h.note}
                              </p>
                            )}
                          </div>
                          <div className="text-right text-xs whitespace-nowrap text-gray-400 dark:text-gray-500 font-medium">
                            {new Date(h.timestamp).toLocaleString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Right Column (Actions & Internal Notes) */}
        <div className="lg:w-85 flex-shrink-0 w-full space-y-6">
          {/* Update Status Card */}
          <div className="bg-white dark:bg-dark-card border border-gray-100 dark:border-white/5 rounded-2xl p-6 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-4 flex items-center gap-2">
              <CheckCircle2 size={14} /> Update Request Status
            </h3>

            <div className="mb-4 flex items-center gap-2">
              <span className="text-xs text-gray-400 dark:text-gray-500">Current Status:</span>
              <StatusBadge status={req.status} />
            </div>

            {terminal ? (
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 text-center text-sm text-gray-400 dark:text-gray-500 italic">
                No further actions available.
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">
                    Next Status
                  </label>
                  <select 
                    value={newStatus} 
                    onChange={e => setNewStatus(e.target.value)}
                    className="w-full border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white dark:bg-dark-bg text-gray-900 dark:text-white transition-all"
                  >
                    <option value="">Select next status</option>
                    {transitions.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>

                {/* Rejection Type Radios */}
                {newStatus === 'rejected' && (
                  <div className="space-y-3">
                    <p className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                      Rejection Type *
                    </p>
                    <div className="space-y-2">
                      <label className={`flex gap-3 p-4 border rounded-xl cursor-pointer transition-all ${
                        rejectionType === 'soft' 
                          ? 'border-orange-500/50 bg-orange-500/5 dark:bg-orange-500/10' 
                          : 'border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20'
                      }`}>
                        <input 
                          type="radio" 
                          name="rejType" 
                          value="soft" 
                          checked={rejectionType === 'soft'} 
                          onChange={() => setRejectionType('soft')}
                          className="accent-primary mt-1"
                        />
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">Soft Reject</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            Customer can resubmit once. Use when more info or action is needed.
                          </p>
                        </div>
                      </label>
                      <label className={`flex gap-3 p-4 border rounded-xl cursor-pointer transition-all ${
                        rejectionType === 'hard' 
                          ? 'border-rose-500/50 bg-rose-500/5 dark:bg-rose-500/10' 
                          : 'border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20'
                      }`}>
                        <input 
                          type="radio" 
                          name="rejType" 
                          value="hard" 
                          checked={rejectionType === 'hard'} 
                          onChange={() => setRejectionType('hard')}
                          className="accent-primary mt-1"
                        />
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">Hard Reject</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            Permanently close this request. Use when it violates return policy.
                          </p>
                        </div>
                      </label>
                    </div>

                    <div className="mt-3">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">
                        Reason for Rejection (Shown to Customer) *
                      </label>
                      <textarea 
                        value={adminNote} 
                        onChange={e => setAdminNote(e.target.value)} 
                        rows={3}
                        placeholder="Explain to customer..."
                        className="w-full border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white dark:bg-dark-bg text-gray-900 dark:text-white resize-none" 
                      />
                    </div>
                  </div>
                )}

                {/* Conditional pickup input */}
                {newStatus === 'pickup_scheduled' && (
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">
                      Pickup Date *
                    </label>
                    <input 
                      type="date" 
                      value={pickupDate} 
                      onChange={e => setPickupDate(e.target.value)}
                      className="w-full border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white dark:bg-dark-bg text-gray-900 dark:text-white" 
                    />
                  </div>
                )}

                {/* Conditional refund amount input */}
                {newStatus === 'refund_approved' && (
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">
                      Refund Amount (₹) *
                    </label>
                    <input 
                      type="number" 
                      value={refundAmount} 
                      onChange={e => setRefundAmount(e.target.value)} 
                      min={0}
                      className="w-full border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white dark:bg-dark-bg text-gray-900 dark:text-white" 
                    />
                    {req.refundMethod === 'wallet' && refundAmount && (
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2 font-medium bg-emerald-50 dark:bg-emerald-500/10 p-2 rounded-lg border border-emerald-100 dark:border-emerald-500/20">
                        Zylora Wallet credit: ₹{(Number(refundAmount) * 1.10).toFixed(2)} (includes 10% bonus) — pending wallet approval
                      </p>
                    )}
                  </div>
                )}

                {/* Conditional references */}
                {newStatus === 'refund_processed' && (
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">
                      {req.refundMethod === 'wallet' ? 'Wallet Credit Reference' : 'UPI / Bank Reference'} *
                    </label>
                    <input 
                      value={refundReference} 
                      onChange={e => setRefundReference(e.target.value)}
                      placeholder="Transaction Reference No."
                      className="w-full border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white dark:bg-dark-bg text-gray-900 dark:text-white" 
                    />
                  </div>
                )}

                {/* Conditional tracking number input */}
                {newStatus === 'exchange_dispatched' && (
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">
                      Courier Tracking Number *
                    </label>
                    <input 
                      value={exchangeTrackingNumber} 
                      onChange={e => setExchangeTrackingNumber(e.target.value)}
                      placeholder="e.g. Bluedart: 123456789"
                      className="w-full border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white dark:bg-dark-bg text-gray-900 dark:text-white" 
                    />
                  </div>
                )}

                {/* Optional public note */}
                {newStatus && newStatus !== 'rejected' && (
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">
                      Note to Customer (Optional)
                    </label>
                    <textarea 
                      value={adminNote} 
                      onChange={e => setAdminNote(e.target.value)} 
                      rows={2}
                      placeholder="Include a message for the customer..."
                      className="w-full border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white dark:bg-dark-bg text-gray-900 dark:text-white resize-none" 
                    />
                  </div>
                )}

                {/* Internal note */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">
                    Internal Note (Private)
                  </label>
                  <textarea 
                    value={internalNote} 
                    onChange={e => setInternalNote(e.target.value)} 
                    rows={2}
                    placeholder="For team members only..."
                    className="w-full border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white dark:bg-dark-bg text-gray-900 dark:text-white resize-none" 
                  />
                </div>

                <button 
                  onClick={handleUpdate} 
                  disabled={updating || !newStatus}
                  className="w-full h-12 bg-primary hover:bg-primary-hover text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-primary/10 hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {updating ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      {LABEL[newStatus] || 'Updating'}...
                    </>
                  ) : (
                    'Update Status'
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Internal note display */}
          {req.internalNote && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5 text-sm">
              <h4 className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <AlertCircle size={14} /> Internal Team Note
              </h4>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
                {req.internalNote}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ClockIcon({ status }) {
  if (['rejected', 'refund_rejected'].includes(status)) {
    return <XCircle className="text-rose-500" size={16} />
  }
  if (['refund_processed', 'exchange_delivered'].includes(status)) {
    return <CheckCircle2 className="text-emerald-500" size={16} />
  }
  return <Info className="text-gray-400 dark:text-gray-500" size={16} />
}
