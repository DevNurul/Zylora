import { useState, useRef, useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { X, Loader2, Check, Repeat, ShoppingBag, Building, Wallet } from 'lucide-react'
import toast from 'react-hot-toast'
import {
  submitReturn,
  fetchMyReturnRequests,
  fetchEligibleProducts,
  initiateReturnPaymentThunk,
  clearEligibleProducts,
} from '../../store/slices/returnSlice'
import { RETURN_REASONS, EXCHANGE_REASONS } from '../../utils/returnReasons'

const inputStyle = {
  width: '100%', border: 'none', borderBottom: '1px solid #E5E5E5',
  padding: '9px 0', fontSize: '14px', background: 'transparent', outline: 'none', color: '#0A0A0A',
  boxSizing: 'border-box',
}
const labelStyle = {
  display: 'block', fontSize: '11px', textTransform: 'uppercase',
  letterSpacing: '0.06em', color: '#6B6B6B', marginBottom: '4px',
}
const accentHeading = {
  fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em',
  fontWeight: 600, color: '#EE6B83', margin: '0 0 12px',
}

/* ── PaymentStep shown after submission when price diff > 0 ─────────────────── */
function PaymentStep({ returnId, priceDifference, onDone }) {
  const dispatch = useDispatch()
  const { paymentLoading } = useSelector(s => s.returns)
  const [initiated, setInitiated]     = useState(false)
  const [txnId, setTxnId]             = useState(null)
  const [pollStatus, setPollStatus]   = useState(null)
  const pollRef = useRef(null)

  // Poll for payment status after initiation
  useEffect(() => {
    if (!txnId) return
    let attempts = 0
    pollRef.current = setInterval(async () => {
      attempts++
      try {
        const { data } = await import('../../utils/returnApi').then(m => m.verifyReturnPayment(txnId))
        if (data.paymentStatus === 'PAYMENT_SUCCESS') {
          clearInterval(pollRef.current)
          setPollStatus('success')
          setTimeout(() => onDone?.(), 1500)
        } else if (data.paymentStatus === 'PAYMENT_ERROR') {
          clearInterval(pollRef.current)
          setPollStatus('failed')
        }
      } catch { /* ignore */ }
      if (attempts >= 20) clearInterval(pollRef.current) // stop after ~2 min
    }, 6000)
    return () => clearInterval(pollRef.current)
  }, [txnId])

  const handlePay = async () => {
    const result = await dispatch(initiateReturnPaymentThunk(returnId))
    if (initiateReturnPaymentThunk.fulfilled.match(result)) {
      const { redirectUrl, transactionId } = result.payload
      setTxnId(transactionId)
      setInitiated(true)
      if (redirectUrl) {
        window.location.href = redirectUrl
      } else {
        toast.error('Payment gateway unavailable. Please try later.')
      }
    } else {
      toast.error(result.payload || 'Failed to initiate payment')
    }
  }

  if (pollStatus === 'success') {
    return (
      <div style={{ textAlign: 'center', padding: 32 }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <Check size={28} style={{ color: '#16a34a' }} />
        </div>
        <p style={{ fontSize: 16, fontWeight: 600, margin: '0 0 8px' }}>Payment Confirmed!</p>
        <p style={{ fontSize: 13, color: '#6B6B6B' }}>Your exchange is now being processed.</p>
      </div>
    )
  }

  return (
    <div style={{ background: '#fff', border: '1px solid #E5E5E5', padding: 28, marginTop: 16 }}>
      <p style={{ fontSize: 16, fontWeight: 600, color: '#0A0A0A', margin: '0 0 8px' }}>One Last Step — Pay Price Difference</p>
      <p style={{ fontSize: 28, fontWeight: 700, color: '#0A0A0A', margin: '0 0 12px' }}>₹{priceDifference?.toLocaleString('en-IN')}</p>
      <p style={{ fontSize: 13, color: '#6B6B6B', margin: '0 0 20px', lineHeight: 1.6 }}>
        Your exchange request has been submitted. To confirm it, please pay the price difference.
        Your exchange will only be processed after payment.
      </p>

      {pollStatus === 'failed' && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '10px 14px', marginBottom: 16 }}>
          <p style={{ fontSize: 13, color: '#b91c1c', margin: 0 }}>Payment failed. Please try again.</p>
        </div>
      )}

      <button
        onClick={handlePay}
        disabled={paymentLoading || initiated}
        style={{
          width: '100%', height: 48, background: '#EE6B83', color: '#fff',
          border: 'none', fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.1em',
          cursor: (paymentLoading || initiated) ? 'not-allowed' : 'pointer',
          opacity: (paymentLoading || initiated) ? 0.6 : 1,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 12, borderRadius: 8,
        }}>
        {paymentLoading && <Loader2 size={14} className="animate-spin" />}
        {paymentLoading ? 'Opening payment...' : `Pay ₹${priceDifference?.toLocaleString('en-IN')} Now`}
      </button>
      <p style={{ fontSize: 12, color: '#9CA3AF', textAlign: 'center', margin: 0 }}>
        You can pay later from My Returns page. Request will be cancelled if not paid within 24 hours.
      </p>
    </div>
  )
}

/* ── RefundMethodSelector ────────────────────────────────────────────────────── */
function RefundMethodSelector({ refundAmount, refundMethod, setRefundMethod, bankDetails, setBankDetails }) {
  const walletAmount = Math.round(refundAmount * 1.10 * 100) / 100
  const bonus        = Math.round(refundAmount * 0.10 * 100) / 100

  const card = (selected) => ({
    border:     `1px solid ${selected ? '#EE6B83' : '#E5E5E5'}`,
    background: selected ? '#FCD4DB' : '#fff',
    padding:    '16px 20px',
    cursor:     'pointer',
    marginBottom: 10,
    transition: 'border-color 150ms',
  })

  return (
    <div>
      <p style={{ fontSize: 13, color: '#0A0A0A', fontWeight: 500, margin: '0 0 12px' }}>
        How would you like to receive your refund?
      </p>

      {/* Bank Transfer */}
      <div style={card(refundMethod === 'bank_transfer')} onClick={() => setRefundMethod('bank_transfer')}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <Building size={16} color="#EE6B83" />
          <span style={{ fontSize: 14, fontWeight: 500 }}>Bank Transfer</span>
          <span style={{ marginLeft: 'auto', fontSize: 14, fontWeight: 600 }}>₹{refundAmount?.toLocaleString('en-IN')}</span>
        </div>
        <p style={{ fontSize: 12, color: '#6B6B6B', margin: 0 }}>
          Exact amount transferred to your bank account within 5–7 business days
        </p>

        {refundMethod === 'bank_transfer' && (
          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 14 }} onClick={e => e.stopPropagation()}>
            {[
              { field: 'accountHolderName', label: 'Account Holder Name' },
              { field: 'accountNumber',     label: 'Account Number' },
              { field: 'confirmAccountNumber', label: 'Re-enter Account Number' },
              { field: 'ifscCode',          label: 'IFSC Code' },
              { field: 'bankName',          label: 'Bank Name' },
            ].map(({ field, label }) => (
              <div key={field}>
                <label style={labelStyle}>{label}</label>
                <input
                  type={field.includes('Number') ? 'text' : 'text'}
                  value={bankDetails[field] || ''}
                  onChange={e => setBankDetails(prev => ({ ...prev, [field]: e.target.value }))}
                  style={inputStyle}
                  required
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* LUXORA Wallet */}
      <div style={card(refundMethod === 'wallet')} onClick={() => setRefundMethod('wallet')}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <Wallet size={16} color="#EE6B83" />
          <span style={{ fontSize: 14, fontWeight: 500 }}>LUXORA Store Wallet</span>
          <span style={{ marginLeft: 'auto', fontSize: 14, fontWeight: 600, color: '#16a34a' }}>
            ₹{walletAmount?.toLocaleString('en-IN')}
          </span>
        </div>
        <p style={{ fontSize: 12, color: '#16a34a', fontWeight: 500, margin: '0 0 4px' }}>
          Extra ₹{bonus?.toLocaleString('en-IN')} bonus!
        </p>
        <p style={{ fontSize: 12, color: '#6B6B6B', margin: '0 0 4px' }}>
          Instant credit to your LUXORA wallet after admin approval. Use on your next purchase.
        </p>
        <p style={{ fontSize: 11, color: '#9CA3AF', margin: 0 }}>
          Valid for 6 months. Covers up to 80% of any order.
        </p>
      </div>
    </div>
  )
}

/* ── Main Form ───────────────────────────────────────────────────────────────── */
export default function ReturnRequestForm({ type, order, onClose, onSuccess, prefillData }) {
  const dispatch    = useDispatch()
  const { submitting, eligibleProducts, productsLoading } = useSelector(s => s.returns)
  const reasons     = type === 'return' ? RETURN_REASONS : EXCHANGE_REASONS

  const [selectedItems,       setSelectedItems]       = useState(prefillData?.selectedItems || [])
  const [itemDetails,         setItemDetails]         = useState(prefillData?.itemDetails || {})
  const [selectedExchangeType,setSelectedExchangeType]= useState('same_product')
  const [selectedNewProduct,  setSelectedNewProduct]  = useState(null)
  const [refundMethod,        setRefundMethod]        = useState(null)
  const [bankDetails,         setBankDetails]         = useState({
    accountHolderName: '', accountNumber: '', confirmAccountNumber: '', ifscCode: '', bankName: '',
  })
  const [comment,             setComment]             = useState('')
  const [submitted,           setSubmitted]           = useState(null)
  const [showPaymentStep,     setShowPaymentStep]     = useState(false)
  const [paymentReturnId,     setPaymentReturnId]     = useState(null)
  const [priceDiffResult,     setPriceDiffResult]     = useState(0)

  const wrapRef = useRef(null)

  useEffect(() => {
    setTimeout(() => wrapRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
    return () => dispatch(clearEligibleProducts())
  }, [])

  // Fetch eligible products when switching to different_product
  useEffect(() => {
    if (type !== 'exchange' || selectedExchangeType !== 'different_product') return
    if (selectedItems.length === 0) return

    const firstKey  = selectedItems[0]
    const firstItem = order.items.find((item, i) => itemKey(item, i) === firstKey)
    if (firstItem?.productId) {
      dispatch(fetchEligibleProducts({ productId: firstItem.productId, excludeProductId: firstItem.productId }))
    }
  }, [selectedExchangeType, selectedItems])

  const itemKey = (item, i) => item.productId || `item-${i}`

  const toggleItem = (item, i) => {
    const key = itemKey(item, i)
    setSelectedItems(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    )
    setSelectedNewProduct(null)
  }

  const setDetail = (key, field, value) => {
    setItemDetails(prev => ({ ...prev, [key]: { ...prev[key], [field]: value } }))
  }

  const totalRefund = order.items
    .filter((item, i) => selectedItems.includes(itemKey(item, i)))
    .reduce((sum, item) => sum + item.price * item.qty, 0)

  // Price difference for exchange
  const computedPriceDiff = useMemo(() => {
    if (type !== 'exchange' || selectedExchangeType !== 'different_product' || !selectedNewProduct) return 0
    return selectedNewProduct.price - totalRefund
  }, [selectedNewProduct, totalRefund, type, selectedExchangeType])

  // Check if all other sizes for an item are out of stock
  const getAvailableSizes = (item) => {
    const allSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
    return allSizes.filter(sz => sz !== item.size)
  }

  const validate = () => {
    if (selectedItems.length === 0) { toast.error('Select at least one item'); return false }

    for (const key of selectedItems) {
      const d = itemDetails[key]
      if (!d?.reason) { toast.error('Please select a reason for each item'); return false }
      if (type === 'exchange' && selectedExchangeType === 'same_product' && !d?.exchangeSize) {
        toast.error('Please select a new size for each item'); return false
      }
    }

    if (type === 'exchange' && selectedExchangeType === 'different_product') {
      if (!selectedNewProduct) { toast.error('Please select a replacement product'); return false }
      if (!selectedNewProduct.selectedSize) { toast.error('Please select a size for the replacement product'); return false }
    }

    if (type === 'return' || (type === 'exchange' && computedPriceDiff < 0)) {
      if (!refundMethod) { toast.error('Please choose a refund method'); return false }
      if (refundMethod === 'bank_transfer') {
        const { accountHolderName, accountNumber, confirmAccountNumber, ifscCode, bankName } = bankDetails
        if (!accountHolderName || !accountNumber || !ifscCode || !bankName) {
          toast.error('Please fill all bank details'); return false
        }
        if (accountNumber !== confirmAccountNumber) {
          toast.error('Account numbers do not match'); return false
        }
      }
    }

    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    const items = order.items
      .map((item, i) => ({ item, key: itemKey(item, i) }))
      .filter(({ key }) => selectedItems.includes(key))
      .map(({ item, key }) => ({
        productId:    item.productId,
        name:         item.name,
        qty:          item.qty,
        reason:       itemDetails[key]?.reason,
        exchangeSize: itemDetails[key]?.exchangeSize || undefined,
      }))

    const payload = {
      orderId:      order.orderId,
      type,
      items,
      comment:      comment.trim() || undefined,
      exchangeType: type === 'exchange' ? selectedExchangeType : undefined,
      newProduct:   (type === 'exchange' && selectedExchangeType === 'different_product' && selectedNewProduct)
        ? {
            productId: selectedNewProduct._id,
            name:      selectedNewProduct.name,
            image:     selectedNewProduct.images?.[0]?.url || '',
            price:     selectedNewProduct.price,
            size:      selectedNewProduct.selectedSize,
            color:     selectedNewProduct.colors?.[0] || '',
          }
        : undefined,
      refundMethod:
        (type === 'return' || (type === 'exchange' && computedPriceDiff < 0))
          ? refundMethod : undefined,
      bankDetails:
        refundMethod === 'bank_transfer'
          ? {
              accountHolderName: bankDetails.accountHolderName,
              accountNumber:     bankDetails.accountNumber,
              ifscCode:          bankDetails.ifscCode,
              bankName:          bankDetails.bankName,
            }
          : undefined,
    }

    if (prefillData?.originalReturnId) {
      payload.originalReturnId = prefillData.originalReturnId
    }

    const result = await dispatch(submitReturn(payload))

    if (submitReturn.fulfilled.match(result)) {
      toast.success('Request submitted successfully!')
      dispatch(fetchMyReturnRequests())

      const { priceDifference, returnId } = result.payload
      if (priceDifference > 0) {
        setPriceDiffResult(priceDifference)
        setPaymentReturnId(returnId)
        setShowPaymentStep(true)
      } else {
        setSubmitted(result.payload)
        onSuccess?.()
      }
    } else {
      toast.error(result.payload || 'Failed to submit request')
    }
  }

  // Success screen
  if (submitted) {
    return (
      <div ref={wrapRef} style={{ background: '#fff', padding: 32, marginTop: 16, textAlign: 'center' }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <Check size={28} style={{ color: '#16a34a' }} />
        </div>
        <p style={{ fontSize: 18, fontWeight: 600, color: '#0A0A0A', margin: '0 0 8px' }}>Request Submitted!</p>
        <p style={{ fontSize: 13, color: '#6B6B6B', margin: '0 0 16px' }}>
          Your {type} request has been submitted. You will receive a confirmation email shortly.
        </p>
        <div style={{ background: '#FCD4DB', padding: '12px 20px', display: 'inline-block', marginBottom: 20 }}>
          <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#6B6B6B', margin: '0 0 4px' }}>Return ID</p>
          <p style={{ fontFamily: 'monospace', fontSize: 18, fontWeight: 700, color: '#0A0A0A', margin: 0 }}>{submitted.returnId}</p>
        </div>
        <br />
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#6B6B6B', textDecoration: 'underline' }}>
          Close
        </button>
      </div>
    )
  }

  // Payment step
  if (showPaymentStep) {
    return (
      <div ref={wrapRef} style={{ background: '#fff', padding: 24, marginTop: 16, border: '1px solid #E5E5E5' }}>
        <div style={{ background: '#FCD4DB', padding: '12px 20px', marginBottom: 20 }}>
          <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#6B6B6B', margin: '0 0 4px' }}>Return ID</p>
          <p style={{ fontFamily: 'monospace', fontSize: 16, fontWeight: 700, color: '#0A0A0A', margin: 0 }}>{paymentReturnId}</p>
        </div>
        <PaymentStep
          returnId={paymentReturnId}
          priceDifference={priceDiffResult}
          onDone={() => { setShowPaymentStep(false); setSubmitted({ returnId: paymentReturnId }); onSuccess?.() }}
        />
      </div>
    )
  }

  return (
    <div ref={wrapRef} style={{
      overflow: 'hidden', maxHeight: 5000,
      transition: 'max-height 500ms cubic-bezier(0.16,1,0.3,1)',
      background: '#fff', padding: 24, marginTop: 16, border: '1px solid #E5E5E5',
    }}>
      <form onSubmit={handleSubmit} noValidate>
        {/* Heading + close */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <p style={{ fontSize: 16, fontWeight: 500, color: '#0A0A0A', margin: 0 }}>
            Request {type === 'return' ? 'Refund' : 'Size Exchange'}
          </p>
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B6B6B', lineHeight: 0 }}>
            <X size={18} />
          </button>
        </div>

        {/* Step 1 — Select Items */}
        <p style={accentHeading}>01 — Select Items to {type === 'return' ? 'Return' : 'Exchange'}</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
          {order.items.map((item, i) => {
            const key      = itemKey(item, i)
            const selected = selectedItems.includes(key)
            const disabled = type === 'exchange' && item.exchangeUsed
            return (
              <label key={key} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
                border: `1px solid ${selected ? '#EE6B83' : '#E5E5E5'}`,
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.5 : 1,
                transition: 'border-color 200ms',
              }}>
                <input type="checkbox" checked={selected} onChange={() => !disabled && toggleItem(item, i)}
                  disabled={disabled}
                  style={{ accentColor: '#EE6B83', width: 16, height: 16, flexShrink: 0 }} />
                {item.image
                  ? <img src={item.image} alt={item.name} style={{ width: 48, height: 56, objectFit: 'cover', border: '1px solid #E5E5E5', flexShrink: 0 }} />
                  : <div style={{ width: 48, height: 56, background: '#FCD4DB', flexShrink: 0 }} />
                }
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 14, fontWeight: 500, color: '#0A0A0A', margin: '0 0 2px' }}>{item.name}</p>
                  <p style={{ fontSize: 12, color: '#6B6B6B', margin: 0 }}>
                    Size: {item.size} &nbsp;·&nbsp; Qty: {item.qty}
                    {disabled && <span style={{ color: '#ef4444', marginLeft: 8 }}>Already exchanged</span>}
                  </p>
                </div>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#0A0A0A', flexShrink: 0 }}>
                  ₹{(item.price * item.qty).toLocaleString('en-IN')}
                </span>
              </label>
            )
          })}
        </div>

        {/* Step 2 — Item Details + Exchange Type */}
        {selectedItems.length > 0 && (
          <>
            <p style={accentHeading}>02 — {type === 'return' ? 'Return' : 'Exchange'} Details</p>

            {/* Exchange type selection */}
            {type === 'exchange' && (
              <div style={{ marginBottom: 20 }}>
                <p style={{ fontSize: 13, fontWeight: 500, color: '#0A0A0A', margin: '0 0 10px' }}>How would you like to exchange?</p>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {[
                    { value: 'same_product',     Icon: Repeat,      label: 'Different size — same product', sub: 'Get a different size of the same item' },
                    { value: 'different_product', Icon: ShoppingBag, label: 'Different product — same category', sub: 'Choose another product from same category' },
                  ].map(({ value, Icon, label, sub }) => (
                    <div key={value}
                      onClick={() => { setSelectedExchangeType(value); setSelectedNewProduct(null) }}
                      style={{
                        border: `1px solid ${selectedExchangeType === value ? '#EE6B83' : '#E5E5E5'}`,
                        background: selectedExchangeType === value ? '#FCD4DB' : '#fff',
                        padding: '12px 16px', cursor: 'pointer', flex: '1 1 200px',
                        transition: 'border-color 150ms',
                      }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <Icon size={14} color="#EE6B83" />
                        <span style={{ fontSize: 13, fontWeight: 500 }}>{label}</span>
                      </div>
                      <p style={{ fontSize: 11, color: '#6B6B6B', margin: 0 }}>{sub}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reason per item */}
            {order.items.map((item, i) => {
              const key = itemKey(item, i)
              if (!selectedItems.includes(key)) return null
              const detail = itemDetails[key] || {}
              return (
                <div key={key} style={{ marginBottom: 20, paddingBottom: 20, borderBottom: '1px solid #F0F0F0' }}>
                  <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 500, color: '#0A0A0A', margin: '0 0 12px' }}>
                    {item.name}
                  </p>
                  <div style={{ marginBottom: type === 'exchange' && selectedExchangeType === 'same_product' ? 16 : 0 }}>
                    <label style={labelStyle}>{type === 'return' ? 'Reason for Return' : 'Reason for Exchange'}</label>
                    <select value={detail.reason || ''} onChange={e => setDetail(key, 'reason', e.target.value)}
                      style={{ ...inputStyle, cursor: 'pointer' }} required>
                      <option value="">Select a reason</option>
                      {reasons.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>

                  {/* Same-product size selector */}
                  {type === 'exchange' && selectedExchangeType === 'same_product' && (
                    <div style={{ marginTop: 12 }}>
                      <label style={labelStyle}>Select New Size</label>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 6 }}>
                        {getAvailableSizes(item).map(sz => {
                          const isCurrent  = sz === item.size
                          const isSelected = detail.exchangeSize === sz
                          return (
                            <button key={sz} type="button"
                              disabled={isCurrent}
                              title={isCurrent ? 'Currently ordered size' : undefined}
                              onClick={() => !isCurrent && setDetail(key, 'exchangeSize', sz)}
                              style={{
                                width: 44, height: 44,
                                border: `1px solid ${isSelected ? '#EE6B83' : isCurrent ? '#E5E5E5' : '#D0D0D0'}`,
                                background: isSelected ? '#EE6B83' : isCurrent ? '#FCD4DB' : '#fff',
                                color: isSelected ? '#fff' : isCurrent ? '#B0B0B0' : '#0A0A0A',
                                fontSize: 12, fontWeight: 500, cursor: isCurrent ? 'not-allowed' : 'pointer',
                              }}>
                              {sz}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}

            {/* Different-product browser */}
            {type === 'exchange' && selectedExchangeType === 'different_product' && (
              <div style={{ marginBottom: 24 }}>
                <p style={{ fontSize: 13, fontWeight: 500, color: '#0A0A0A', margin: '0 0 4px' }}>Choose a replacement product</p>
                <p style={{ fontSize: 12, color: '#6B6B6B', margin: '0 0 16px' }}>Showing available products from the same category</p>

                {productsLoading ? (
                  <div style={{ textAlign: 'center', padding: 24 }}>
                    <Loader2 size={20} className="animate-spin" style={{ color: '#6B6B6B' }} />
                  </div>
                ) : eligibleProducts.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 24, color: '#6B6B6B' }}>
                    <p style={{ fontSize: 13, margin: 0 }}>No other products available in this category right now.</p>
                    <p style={{ fontSize: 12, margin: '4px 0 0', color: '#9CA3AF' }}>Please check back later or contact support.</p>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                    {eligibleProducts.map(prod => {
                      const originalTotal = order.items
                        .filter((it, i) => selectedItems.includes(itemKey(it, i)))
                        .reduce((sum, it) => sum + it.price * it.qty, 0)
                      const diff    = prod.price - originalTotal
                      const isSelected = selectedNewProduct?._id === prod._id

                      return (
                        <div key={prod._id}
                          style={{
                            border: `1px solid ${isSelected ? '#EE6B83' : '#E5E5E5'}`,
                            background: isSelected ? '#FCD4DB' : '#fff',
                            padding: 12, position: 'relative', cursor: 'pointer',
                          }}>
                          {isSelected && (
                            <div style={{ position: 'absolute', top: 8, right: 8, width: 20, height: 20, background: '#EE6B83', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Check size={12} color="#fff" />
                            </div>
                          )}
                          <img
                            src={prod.images?.[0]?.url || ''}
                            alt={prod.name}
                            style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', display: 'block', marginBottom: 8 }}
                          />
                          <p style={{ fontSize: 13, fontWeight: 500, color: '#0A0A0A', margin: '0 0 2px', lineClamp: 2, overflow: 'hidden' }}>{prod.name}</p>
                          <p style={{ fontSize: 14, fontWeight: 600, color: '#0A0A0A', margin: '0 0 4px' }}>₹{prod.price?.toLocaleString('en-IN')}</p>
                          <p style={{
                            fontSize: 12, margin: '0 0 8px',
                            color: diff > 0 ? '#b91c1c' : diff < 0 ? '#15803d' : '#6B6B6B',
                          }}>
                            {diff > 0 ? `+₹${diff.toLocaleString('en-IN')} to pay` : diff < 0 ? `-₹${Math.abs(diff).toLocaleString('en-IN')} refund` : 'Same price'}
                          </p>

                          {/* Size selector */}
                          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 8 }}>
                            {(prod.availableSizes || []).map(sz => (
                              <button key={sz} type="button"
                                onClick={(e) => { e.stopPropagation(); setSelectedNewProduct({ ...prod, selectedSize: sz }) }}
                                style={{
                                  padding: '3px 8px', border: '1px solid',
                                  borderColor: (selectedNewProduct?._id === prod._id && selectedNewProduct?.selectedSize === sz) ? '#EE6B83' : '#D0D0D0',
                                  background:  (selectedNewProduct?._id === prod._id && selectedNewProduct?.selectedSize === sz) ? '#EE6B83' : '#fff',
                                  color:       (selectedNewProduct?._id === prod._id && selectedNewProduct?.selectedSize === sz) ? '#fff' : '#0A0A0A',
                                  fontSize: 11, cursor: 'pointer',
                                }}>
                                {sz}
                              </button>
                            ))}
                          </div>

                          <button type="button"
                            onClick={() => setSelectedNewProduct(p => p?._id === prod._id ? p : { ...prod, selectedSize: prod.availableSizes?.[0] || '' })}
                            style={{
                              width: '100%', height: 36, border: '1px solid #EE6B83', background: 'transparent',
                              fontSize: 13, cursor: 'pointer', color: '#EE6B83', borderRadius: 8
                            }}>
                            Select This Product
                          </button>
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Price difference notice */}
                {selectedNewProduct && computedPriceDiff !== 0 && (
                  <div style={{
                    marginTop: 16, padding: '12px 16px',
                    background: computedPriceDiff > 0 ? '#fefce8' : '#f0fdf4',
                    border: `1px solid ${computedPriceDiff > 0 ? '#fde68a' : '#bbf7d0'}`,
                  }}>
                    {computedPriceDiff > 0 ? (
                      <>
                        <p style={{ fontSize: 13, fontWeight: 600, color: '#a16207', margin: '0 0 4px' }}>
                          Price Difference: +₹{computedPriceDiff.toLocaleString('en-IN')}
                        </p>
                        <p style={{ fontSize: 12, color: '#92400e', margin: 0 }}>
                          The new item costs ₹{computedPriceDiff.toLocaleString('en-IN')} more. You will pay this after submitting.
                          Exchange is confirmed only after payment.
                        </p>
                      </>
                    ) : (
                      <>
                        <p style={{ fontSize: 13, fontWeight: 600, color: '#15803d', margin: '0 0 8px' }}>
                          You will receive ₹{Math.abs(computedPriceDiff).toLocaleString('en-IN')} back
                        </p>
                        <RefundMethodSelector
                          refundAmount={Math.abs(computedPriceDiff)}
                          refundMethod={refundMethod}
                          setRefundMethod={setRefundMethod}
                          bankDetails={bankDetails}
                          setBankDetails={setBankDetails}
                        />
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Refund method for return type */}
        {selectedItems.length > 0 && type === 'return' && (
          <>
            <p style={accentHeading}>03 — Refund Method</p>
            <div style={{ marginBottom: 24 }}>
              <RefundMethodSelector
                refundAmount={totalRefund}
                refundMethod={refundMethod}
                setRefundMethod={setRefundMethod}
                bankDetails={bankDetails}
                setBankDetails={setBankDetails}
              />
            </div>
          </>
        )}

        {/* Comments */}
        <p style={accentHeading}>{type === 'return' ? '04' : type === 'exchange' ? '03' : '03'} — Additional Comments (Optional)</p>
        <div style={{ position: 'relative', marginBottom: 20 }}>
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value.slice(0, 500))}
            placeholder="Describe your issue in detail..."
            rows={3}
            style={{ width: '100%', border: '1px solid #E5E5E5', padding: 12, fontSize: 14, resize: 'vertical', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', color: '#0A0A0A' }}
          />
          <span style={{ position: 'absolute', bottom: 8, right: 10, fontSize: 12, color: '#9CA3AF' }}>{comment.length}/500</span>
        </div>

        {/* Summary */}
        {selectedItems.length > 0 && (
          <div style={{ marginTop: 4, padding: 16, background: '#F9F9F9', border: '1px solid #E5E5E5', marginBottom: 20 }}>
            <p style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 500, color: '#0A0A0A', margin: '0 0 10px' }}>Request Summary</p>
            <p style={{ fontSize: 13, color: '#6B6B6B', margin: '0 0 4px' }}>{selectedItems.length} item{selectedItems.length > 1 ? 's' : ''} selected</p>
            {type === 'return' && (
              <>
                <p style={{ fontSize: 13, color: '#6B6B6B', margin: '0 0 4px' }}>
                  Estimated refund: <strong style={{ color: '#0A0A0A' }}>₹{totalRefund.toLocaleString('en-IN')}</strong>
                  {refundMethod === 'wallet' && (
                    <span style={{ color: '#16a34a', marginLeft: 6 }}>
                      → ₹{(totalRefund * 1.10).toFixed(0)} with wallet bonus
                    </span>
                  )}
                </p>
                <p style={{ fontSize: 11, color: '#9CA3AF', fontStyle: 'italic', margin: 0 }}>Final amount confirmed after inspection</p>
              </>
            )}
            {type === 'exchange' && selectedExchangeType === 'same_product' && selectedItems.map(key => {
              const idx  = order.items.findIndex((item, i) => itemKey(item, i) === key)
              const item = order.items[idx]
              const detail = itemDetails[key] || {}
              if (!item || !detail.exchangeSize) return null
              return (
                <p key={key} style={{ fontSize: 13, color: '#6B6B6B', margin: '2px 0' }}>
                  {item.name}: {item.size} → <strong style={{ color: '#1d4ed8' }}>{detail.exchangeSize}</strong>
                </p>
              )
            })}
            {type === 'exchange' && selectedExchangeType === 'different_product' && selectedNewProduct && (
              <p style={{ fontSize: 13, color: '#6B6B6B', margin: '2px 0' }}>
                Replacement: <strong style={{ color: '#0A0A0A' }}>{selectedNewProduct.name}</strong>
                {selectedNewProduct.selectedSize && <span> (Size: {selectedNewProduct.selectedSize})</span>}
                {computedPriceDiff !== 0 && (
                  <span style={{ marginLeft: 8, color: computedPriceDiff > 0 ? '#b91c1c' : '#15803d' }}>
                    {computedPriceDiff > 0 ? `+₹${computedPriceDiff.toLocaleString('en-IN')} to pay` : `-₹${Math.abs(computedPriceDiff).toLocaleString('en-IN')} refund`}
                  </span>
                )}
              </p>
            )}
          </div>
        )}

        {/* Submit */}
        <button type="submit" disabled={submitting || selectedItems.length === 0}
          style={{
            width: '100%', height: 48, background: '#EE6B83', color: '#fff',
            border: 'none', fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.1em',
            cursor: (submitting || selectedItems.length === 0) ? 'not-allowed' : 'pointer',
            opacity: (submitting || selectedItems.length === 0) ? 0.6 : 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 8,
          }}>
          {submitting && <Loader2 size={14} className="animate-spin" />}
          {submitting ? 'Submitting...' : `Submit ${type === 'return' ? 'Return' : 'Exchange'} Request`}
        </button>
      </form>
    </div>
  )
}
