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

const inputStyle = 'w-full border-b border-[#242424] bg-transparent py-2.5 text-[14px] text-white outline-none focus:border-[#B8976A] transition-colors box-border'
const labelStyle = 'block text-[11px] uppercase tracking-[0.06em] text-[#5C5C5C] mb-1'
const accentHeading = 'text-[12px] uppercase tracking-[0.08em] font-semibold text-[#B8976A] mb-3'

function PaymentStep({ returnId, priceDifference, onDone }) {
  const dispatch = useDispatch()
  const { paymentLoading } = useSelector(s => s.returns)
  const [initiated, setInitiated] = useState(false)
  const [txnId, setTxnId] = useState(null)
  const [pollStatus, setPollStatus] = useState(null)
  const pollRef = useRef(null)

  useEffect(() => {
    if (!txnId) return
    let attempts = 0
    pollRef.current = setInterval(async () => {
      attempts++
      try {
        const { data } = await import('../../utils/returnApi').then(m => m.verifyReturnPayment(txnId))
        if (data.paymentStatus === 'PAYMENT_SUCCESS') { clearInterval(pollRef.current); setPollStatus('success'); setTimeout(() => onDone?.(), 1500) }
        else if (data.paymentStatus === 'PAYMENT_ERROR') { clearInterval(pollRef.current); setPollStatus('failed') }
      } catch { /* ignore */ }
      if (attempts >= 20) clearInterval(pollRef.current)
    }, 6000)
    return () => clearInterval(pollRef.current)
  }, [txnId])

  const handlePay = async () => {
    const result = await dispatch(initiateReturnPaymentThunk(returnId))
    if (initiateReturnPaymentThunk.fulfilled.match(result)) {
      const { redirectUrl, transactionId } = result.payload
      setTxnId(transactionId); setInitiated(true)
      if (redirectUrl) window.location.href = redirectUrl
      else toast.error('Payment gateway unavailable. Please try later.')
    } else { toast.error(result.payload || 'Failed to initiate payment') }
  }

  if (pollStatus === 'success') {
    return (
      <div className="text-center py-8">
        <div className="w-14 h-14 rounded-full bg-[#f0fdf4] flex items-center justify-center mx-auto mb-4">
          <Check size={28} className="text-[#16a34a]" />
        </div>
        <p className="text-[16px] font-semibold text-white m-0 mb-2">Payment Confirmed!</p>
        <p className="text-[13px] text-[#9A9A9A]">Your exchange is now being processed.</p>
      </div>
    )
  }

  return (
    <div className="bg-[#0A0A0A] border border-[#242424] p-7 mt-4 rounded-lg">
      <p className="text-[16px] font-semibold text-white m-0 mb-2">One Last Step — Pay Price Difference</p>
      <p className="text-[28px] font-bold text-white m-0 mb-3">₹{priceDifference?.toLocaleString('en-IN')}</p>
      <p className="text-[13px] text-[#9A9A9A] m-0 mb-5" style={{ lineHeight: 1.6 }}>
        Your exchange request has been submitted. To confirm it, please pay the price difference.
        Your exchange will only be processed after payment.
      </p>
      {pollStatus === 'failed' && (
        <div className="bg-[#fef2f2] border border-[#fecaca] p-2.5 px-3.5 mb-4 rounded-lg">
          <p className="text-[13px] text-[#b91c1c] m-0">Payment failed. Please try again.</p>
        </div>
      )}
      <button onClick={handlePay} disabled={paymentLoading || initiated}
        className="w-full h-12 bg-gradient-to-r from-[#E8A0B0] to-[#D48A9A] text-white border-none text-[13px] uppercase tracking-[0.1em] cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2 mb-3 rounded-xl transition-all hover:shadow-[0_8px_30px_rgba(238,107,131,0.3)]">
        {paymentLoading && <Loader2 size={14} className="animate-spin" />}
        {paymentLoading ? 'Opening payment...' : `Pay ₹${priceDifference?.toLocaleString('en-IN')} Now`}
      </button>
      <p className="text-[12px] text-[#5C5C5C] text-center m-0">
        You can pay later from My Returns page. Request will be cancelled if not paid within 24 hours.
      </p>
    </div>
  )
}

function RefundMethodSelector({ refundAmount, refundMethod, setRefundMethod, bankDetails, setBankDetails }) {
  const walletAmount = Math.round(refundAmount * 1.10 * 100) / 100
  const bonus = Math.round(refundAmount * 0.10 * 100) / 100

  const card = (selected) => `border ${selected ? 'border-[#B8976A]' : 'border-[#242424]'} ${selected ? 'bg-[#1C1C1C]' : 'bg-[#141414]'} p-4 cursor-pointer mb-2.5 transition-colors rounded-lg`

  return (
    <div>
      <p className="text-[13px] text-white font-medium mb-3">How would you like to receive your refund?</p>

      <div className={card(refundMethod === 'bank_transfer')} onClick={() => setRefundMethod('bank_transfer')}>
        <div className="flex items-center gap-2.5 mb-1">
          <Building size={16} className="text-[#B8976A]" />
          <span className="text-[14px] font-medium text-white">Bank Transfer</span>
          <span className="ml-auto text-[14px] font-semibold text-white">₹{refundAmount?.toLocaleString('en-IN')}</span>
        </div>
        <p className="text-[12px] text-[#9A9A9A] m-0">Exact amount transferred to your bank account within 5–7 business days</p>
        {refundMethod === 'bank_transfer' && (
          <div className="mt-4 flex flex-col gap-3.5" onClick={e => e.stopPropagation()}>
            {[
              { field: 'accountHolderName', label: 'Account Holder Name' },
              { field: 'accountNumber', label: 'Account Number' },
              { field: 'confirmAccountNumber', label: 'Re-enter Account Number' },
              { field: 'ifscCode', label: 'IFSC Code' },
              { field: 'bankName', label: 'Bank Name' },
            ].map(({ field, label }) => (
              <div key={field}>
                <label className={labelStyle}>{label}</label>
                <input type="text" value={bankDetails[field] || ''} onChange={e => setBankDetails(prev => ({ ...prev, [field]: e.target.value }))}
                  className={inputStyle} required />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={card(refundMethod === 'wallet')} onClick={() => setRefundMethod('wallet')}>
        <div className="flex items-center gap-2.5 mb-1">
          <Wallet size={16} className="text-[#B8976A]" />
          <span className="text-[14px] font-medium text-white">ZYLARA Store Wallet</span>
          <span className="ml-auto text-[14px] font-semibold text-[#16a34a]">₹{walletAmount?.toLocaleString('en-IN')}</span>
        </div>
        <p className="text-[12px] text-[#16a34a] font-medium m-0 mb-1">Extra ₹{bonus?.toLocaleString('en-IN')} bonus!</p>
        <p className="text-[12px] text-[#9A9A9A] m-0 mb-1">Instant credit to your ZYLARA wallet after admin approval. Use on your next purchase.</p>
        <p className="text-[11px] text-[#5C5C5C] m-0">Valid for 6 months. Covers up to 80% of any order.</p>
      </div>
    </div>
  )
}

export default function ReturnRequestForm({ type, order, onClose, onSuccess, prefillData }) {
  const dispatch = useDispatch()
  const { submitting, eligibleProducts, productsLoading } = useSelector(s => s.returns)
  const reasons = type === 'return' ? RETURN_REASONS : EXCHANGE_REASONS

  const [selectedItems, setSelectedItems] = useState(prefillData?.selectedItems || [])
  const [itemDetails, setItemDetails] = useState(prefillData?.itemDetails || {})
  const [selectedExchangeType, setSelectedExchangeType] = useState('same_product')
  const [selectedNewProduct, setSelectedNewProduct] = useState(null)
  const [refundMethod, setRefundMethod] = useState(null)
  const [bankDetails, setBankDetails] = useState({ accountHolderName: '', accountNumber: '', confirmAccountNumber: '', ifscCode: '', bankName: '' })
  const [comment, setComment] = useState('')
  const [submitted, setSubmitted] = useState(null)
  const [showPaymentStep, setShowPaymentStep] = useState(false)
  const [paymentReturnId, setPaymentReturnId] = useState(null)
  const [priceDiffResult, setPriceDiffResult] = useState(0)
  const wrapRef = useRef(null)

  useEffect(() => {
    setTimeout(() => wrapRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
    return () => dispatch(clearEligibleProducts())
  }, [])

  useEffect(() => {
    if (type !== 'exchange' || selectedExchangeType !== 'different_product') return
    if (selectedItems.length === 0) return
    const firstKey = selectedItems[0]
    const firstItem = order.items.find((item, i) => itemKey(item, i) === firstKey)
    if (firstItem?.productId) dispatch(fetchEligibleProducts({ productId: firstItem.productId, excludeProductId: firstItem.productId }))
  }, [selectedExchangeType, selectedItems])

  const itemKey = (item, i) => item.productId || `item-${i}`

  const toggleItem = (item, i) => {
    const key = itemKey(item, i)
    setSelectedItems(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key])
    setSelectedNewProduct(null)
  }

  const setDetail = (key, field, value) => {
    setItemDetails(prev => ({ ...prev, [key]: { ...prev[key], [field]: value } }))
  }

  const totalRefund = order.items.filter((item, i) => selectedItems.includes(itemKey(item, i))).reduce((sum, item) => sum + item.price * item.qty, 0)

  const computedPriceDiff = useMemo(() => {
    if (type !== 'exchange' || selectedExchangeType !== 'different_product' || !selectedNewProduct) return 0
    return selectedNewProduct.price - totalRefund
  }, [selectedNewProduct, totalRefund, type, selectedExchangeType])

  const getAvailableSizes = (item) => ['XS', 'S', 'M', 'L', 'XL', 'XXL'].filter(sz => sz !== item.size)

  const validate = () => {
    if (selectedItems.length === 0) { toast.error('Select at least one item'); return false }
    for (const key of selectedItems) {
      const d = itemDetails[key]
      if (!d?.reason) { toast.error('Please select a reason for each item'); return false }
      if (type === 'exchange' && selectedExchangeType === 'same_product' && !d?.exchangeSize) { toast.error('Please select a new size for each item'); return false }
    }
    if (type === 'exchange' && selectedExchangeType === 'different_product') {
      if (!selectedNewProduct) { toast.error('Please select a replacement product'); return false }
      if (!selectedNewProduct.selectedSize) { toast.error('Please select a size for the replacement product'); return false }
    }
    if (type === 'return' || (type === 'exchange' && computedPriceDiff < 0)) {
      if (!refundMethod) { toast.error('Please choose a refund method'); return false }
      if (refundMethod === 'bank_transfer') {
        const { accountHolderName, accountNumber, confirmAccountNumber, ifscCode, bankName } = bankDetails
        if (!accountHolderName || !accountNumber || !ifscCode || !bankName) { toast.error('Please fill all bank details'); return false }
        if (accountNumber !== confirmAccountNumber) { toast.error('Account numbers do not match'); return false }
      }
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    const items = order.items.map((item, i) => ({ item, key: itemKey(item, i) })).filter(({ key }) => selectedItems.includes(key))
      .map(({ item, key }) => ({ productId: item.productId, name: item.name, qty: item.qty, reason: itemDetails[key]?.reason, exchangeSize: itemDetails[key]?.exchangeSize || undefined }))

    const payload = {
      orderId: order.orderId, type, items, comment: comment.trim() || undefined,
      exchangeType: type === 'exchange' ? selectedExchangeType : undefined,
      newProduct: (type === 'exchange' && selectedExchangeType === 'different_product' && selectedNewProduct)
        ? { productId: selectedNewProduct._id, name: selectedNewProduct.name, image: selectedNewProduct.images?.[0]?.url || '', price: selectedNewProduct.price, size: selectedNewProduct.selectedSize, color: selectedNewProduct.colors?.[0] || '' }
        : undefined,
      refundMethod: (type === 'return' || (type === 'exchange' && computedPriceDiff < 0)) ? refundMethod : undefined,
      bankDetails: refundMethod === 'bank_transfer' ? { accountHolderName: bankDetails.accountHolderName, accountNumber: bankDetails.accountNumber, ifscCode: bankDetails.ifscCode, bankName: bankDetails.bankName } : undefined,
    }
    if (prefillData?.originalReturnId) payload.originalReturnId = prefillData.originalReturnId

    const result = await dispatch(submitReturn(payload))
    if (submitReturn.fulfilled.match(result)) {
      toast.success('Request submitted successfully!')
      dispatch(fetchMyReturnRequests())
      const { priceDifference, returnId } = result.payload
      if (priceDifference > 0) { setPriceDiffResult(priceDifference); setPaymentReturnId(returnId); setShowPaymentStep(true) }
      else { setSubmitted(result.payload); onSuccess?.() }
    } else { toast.error(result.payload || 'Failed to submit request') }
  }

  if (submitted) {
    return (
      <div ref={wrapRef} className="bg-[#141414] p-5 md:p-8 mt-4 text-center rounded-xl border border-[#242424]">
        <div className="w-14 h-14 rounded-full bg-[#f0fdf4] flex items-center justify-center mx-auto mb-4">
          <Check size={28} className="text-[#16a34a]" />
        </div>
        <p className="text-[18px] font-semibold text-white m-0 mb-2">Request Submitted!</p>
        <p className="text-[13px] text-[#9A9A9A] m-0 mb-4">Your {type} request has been submitted. You will receive a confirmation email shortly.</p>
        <div className="bg-[#1C1C1C] p-3 px-5 inline-block mb-5 rounded-lg border border-[#242424]">
          <p className="text-[11px] uppercase tracking-[0.06em] text-[#5C5C5C] m-0 mb-1">Return ID</p>
          <p className="font-mono text-[18px] font-bold text-white m-0">{submitted.returnId}</p>
        </div>
        <br />
        <button onClick={onClose} className="bg-transparent border-none cursor-pointer text-[13px] text-[#9A9A9A] underline hover:text-white transition-colors">Close</button>
      </div>
    )
  }

  if (showPaymentStep) {
    return (
      <div ref={wrapRef} className="bg-[#141414] p-6 mt-4 border border-[#242424] rounded-lg">
        <div className="bg-[#1C1C1C] p-3 px-5 mb-5 rounded-lg border border-[#242424]">
          <p className="text-[11px] uppercase tracking-[0.06em] text-[#5C5C5C] m-0 mb-1">Return ID</p>
          <p className="font-mono text-[16px] font-bold text-white m-0">{paymentReturnId}</p>
        </div>
        <PaymentStep returnId={paymentReturnId} priceDifference={priceDiffResult}
          onDone={() => { setShowPaymentStep(false); setSubmitted({ returnId: paymentReturnId }); onSuccess?.() }} />
      </div>
    )
  }

  return (
    <div ref={wrapRef} className="overflow-hidden max-h-[5000px] transition-[max-height] duration-[500ms] bg-[#141414] p-6 mt-4 border border-[#242424] rounded-lg">
      <form onSubmit={handleSubmit} noValidate>
        <div className="flex justify-between items-center mb-5">
          <p className="text-[16px] font-medium text-white m-0">
            Request {type === 'return' ? 'Refund' : 'Size Exchange'}
          </p>
          <button type="button" onClick={onClose} className="bg-transparent border-none cursor-pointer text-[#9A9A9A] p-0 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        <p className={accentHeading}>01 — Select Items to {type === 'return' ? 'Return' : 'Exchange'}</p>
        <div className="flex flex-col gap-2.5 mb-6">
          {order.items.map((item, i) => {
            const key = itemKey(item, i)
            const selected = selectedItems.includes(key)
            const disabled = type === 'exchange' && item.exchangeUsed
            return (
              <label key={key} className={`flex items-center gap-3 p-3 px-4 border rounded-lg cursor-pointer transition-colors ${
                selected ? 'border-[#B8976A] bg-[#1C1C1C]' : 'border-[#242424] bg-[#141414]'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
                <input type="checkbox" checked={selected} onChange={() => !disabled && toggleItem(item, i)} disabled={disabled}
                  className="accent-[#B8976A] w-4 h-4 flex-shrink-0" />
                {item.image
                  ? <img src={item.image} alt={item.name} className="w-12 h-14 object-cover border border-[#242424] rounded flex-shrink-0" />
                  : <div className="w-12 h-14 bg-[#1C1C1C] rounded flex-shrink-0" />
                }
                <div className="flex-1">
                  <p className="text-[14px] font-medium text-white m-0 mb-0.5">{item.name}</p>
                  <p className="text-[12px] text-[#9A9A9A] m-0">
                    Size: {item.size} &nbsp;·&nbsp; Qty: {item.qty}
                    {disabled && <span className="text-[#EF4444] ml-2">Already exchanged</span>}
                  </p>
                </div>
                <span className="text-[14px] font-semibold text-white flex-shrink-0">₹{(item.price * item.qty).toLocaleString('en-IN')}</span>
              </label>
            )
          })}
        </div>

        {selectedItems.length > 0 && (
          <>
            <p className={accentHeading}>02 — {type === 'return' ? 'Return' : 'Exchange'} Details</p>

            {type === 'exchange' && (
              <div className="mb-5">
                <p className="text-[13px] font-medium text-white mb-2.5">How would you like to exchange?</p>
                <div className="flex gap-2.5 flex-wrap">
                  {[
                    { value: 'same_product', Icon: Repeat, label: 'Different size — same product', sub: 'Get a different size of the same item' },
                    { value: 'different_product', Icon: ShoppingBag, label: 'Different product — same category', sub: 'Choose another product from same category' },
                  ].map(({ value, Icon, label, sub }) => (
                    <div key={value} onClick={() => { setSelectedExchangeType(value); setSelectedNewProduct(null) }}
                      className={`border p-3 cursor-pointer flex-1 min-w-[160px] sm:min-w-[200px] rounded-lg transition-colors ${
                        selectedExchangeType === value ? 'border-[#B8976A] bg-[#1C1C1C]' : 'border-[#242424] bg-[#141414]'
                      }`}>
                      <div className="flex items-center gap-2 mb-1">
                        <Icon size={14} className="text-[#B8976A]" />
                        <span className="text-[13px] font-medium text-white">{label}</span>
                      </div>
                      <p className="text-[11px] text-[#9A9A9A] m-0">{sub}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {order.items.map((item, i) => {
              const key = itemKey(item, i)
              if (!selectedItems.includes(key)) return null
              const detail = itemDetails[key] || {}
              return (
                <div key={key} className="mb-5 pb-5 border-b border-[#242424]">
                  <p className="text-[11px] uppercase tracking-[0.06em] font-medium text-white mb-3">{item.name}</p>
                  <div className={type === 'exchange' && selectedExchangeType === 'same_product' ? 'mb-4' : ''}>
                    <label className={labelStyle}>{type === 'return' ? 'Reason for Return' : 'Reason for Exchange'}</label>
                    <select value={detail.reason || ''} onChange={e => setDetail(key, 'reason', e.target.value)}
                      className={`${inputStyle} cursor-pointer`} required>
                      <option value="">Select a reason</option>
                      {reasons.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  {type === 'exchange' && selectedExchangeType === 'same_product' && (
                    <div className="mt-3">
                      <label className={labelStyle}>Select New Size</label>
                      <div className="flex gap-2 flex-wrap mt-1.5">
                        {getAvailableSizes(item).map(sz => {
                          const isCurrent = sz === item.size
                          const isSelected = detail.exchangeSize === sz
                          return (
                            <button key={sz} type="button" disabled={isCurrent}
                              title={isCurrent ? 'Currently ordered size' : undefined}
                              onClick={() => !isCurrent && setDetail(key, 'exchangeSize', sz)}
                              className={`w-11 h-11 border text-[12px] font-medium cursor-pointer rounded-lg transition-all ${
                                isSelected ? 'border-[#B8976A] bg-[#B8976A] text-white' : isCurrent ? 'border-[#242424] bg-[#1C1C1C] text-[#5C5C5C] cursor-not-allowed' : 'border-[#242424] bg-[#141414] text-white hover:border-[#B8976A]'
                              }`}>
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

            {type === 'exchange' && selectedExchangeType === 'different_product' && (
              <div className="mb-6">
                <p className="text-[13px] font-medium text-white mb-1">Choose a replacement product</p>
                <p className="text-[12px] text-[#9A9A9A] mb-4">Showing available products from the same category</p>
                {productsLoading ? (
                  <div className="text-center py-6"><Loader2 size={20} className="animate-spin text-[#9A9A9A]" /></div>
                ) : eligibleProducts.length === 0 ? (
                  <div className="text-center py-6 text-[#9A9A9A]">
                    <p className="text-[13px] m-0">No other products available in this category right now.</p>
                    <p className="text-[12px] m-1 text-[#5C5C5C]">Please check back later or contact support.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {eligibleProducts.map(prod => {
                      const originalTotal = order.items.filter((it, i) => selectedItems.includes(itemKey(it, i))).reduce((sum, it) => sum + it.price * it.qty, 0)
                      const diff = prod.price - originalTotal
                      const isSelected = selectedNewProduct?._id === prod._id
                      return (
                        <div key={prod._id}
                          className={`border p-3 relative cursor-pointer rounded-lg transition-colors ${isSelected ? 'border-[#B8976A] bg-[#1C1C1C]' : 'border-[#242424] bg-[#141414]'}`}>
                          {isSelected && (
                            <div className="absolute top-2 right-2 w-9 h-10 bg-[#B8976A] rounded-full flex items-center justify-center">
                              <Check size={12} className="text-white" />
                            </div>
                          )}
                          <img src={prod.images?.[0]?.url || ''} alt={prod.name} className="w-full aspect-square object-cover block mb-2 rounded" />
                          <p className="text-[13px] font-medium text-white m-0 mb-0.5 line-clamp-2">{prod.name}</p>
                          <p className="text-[14px] font-semibold text-white m-0 mb-1">₹{prod.price?.toLocaleString('en-IN')}</p>
                          <p className={`text-[12px] m-0 mb-2 ${diff > 0 ? 'text-[#b91c1c]' : diff < 0 ? 'text-[#15803d]' : 'text-[#9A9A9A]'}`}>
                            {diff > 0 ? `+₹${diff.toLocaleString('en-IN')} to pay` : diff < 0 ? `-₹${Math.abs(diff).toLocaleString('en-IN')} refund` : 'Same price'}
                          </p>
                          <div className="flex gap-1 flex-wrap mb-2">
                            {(prod.availableSizes || []).map(sz => (
                              <button key={sz} type="button"
                                onClick={(e) => { e.stopPropagation(); setSelectedNewProduct({ ...prod, selectedSize: sz }) }}
                                className={`px-2 py-0.5 border text-[11px] cursor-pointer rounded ${
                                  (selectedNewProduct?._id === prod._id && selectedNewProduct?.selectedSize === sz)
                                    ? 'border-[#B8976A] bg-[#B8976A] text-white' : 'border-[#242424] bg-[#141414] text-white'
                                }`}>
                                {sz}
                              </button>
                            ))}
                          </div>
                          <button type="button"
                            onClick={() => setSelectedNewProduct(p => p?._id === prod._id ? p : { ...prod, selectedSize: prod.availableSizes?.[0] || '' })}
                            className="w-full h-10 border border-[#B8976A] bg-transparent text-[13px] cursor-pointer text-[#B8976A] rounded-lg hover:bg-[#B8976A] hover:text-white transition-colors">
                            Select This Product
                          </button>
                        </div>
                      )
                    })}
                  </div>
                )}
                {selectedNewProduct && computedPriceDiff !== 0 && (
                  <div className={`mt-4 p-3 px-4 rounded-lg border ${computedPriceDiff > 0 ? 'bg-[#fefce8] border-[#fde68a]' : 'bg-[#f0fdf4] border-[#bbf7d0]'}`}>
                    {computedPriceDiff > 0 ? (
                      <>
                        <p className="text-[13px] font-semibold text-[#a16207] m-0 mb-1">Price Difference: +₹{computedPriceDiff.toLocaleString('en-IN')}</p>
                        <p className="text-[12px] text-[#92400e] m-0">The new item costs ₹{computedPriceDiff.toLocaleString('en-IN')} more. You will pay this after submitting.</p>
                      </>
                    ) : (
                      <>
                        <p className="text-[13px] font-semibold text-[#15803d] m-0 mb-2">You will receive ₹{Math.abs(computedPriceDiff).toLocaleString('en-IN')} back</p>
                        <RefundMethodSelector refundAmount={Math.abs(computedPriceDiff)} refundMethod={refundMethod} setRefundMethod={setRefundMethod} bankDetails={bankDetails} setBankDetails={setBankDetails} />
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {selectedItems.length > 0 && type === 'return' && (
          <>
            <p className={accentHeading}>03 — Refund Method</p>
            <div className="mb-6">
              <RefundMethodSelector refundAmount={totalRefund} refundMethod={refundMethod} setRefundMethod={setRefundMethod} bankDetails={bankDetails} setBankDetails={setBankDetails} />
            </div>
          </>
        )}

        <p className={accentHeading}>{type === 'return' ? '04' : '03'} — Additional Comments (Optional)</p>
        <div className="relative mb-5">
          <textarea value={comment} onChange={e => setComment(e.target.value.slice(0, 500))} placeholder="Describe your issue in detail..." rows={3}
            className="w-full border border-[#242424] bg-[#0A0A0A] p-3 text-[14px] resize-y outline-none box-border font-[inherit] text-white rounded-lg focus:border-[#B8976A] transition-colors" />
          <span className="absolute bottom-2 right-2.5 text-[12px] text-[#5C5C5C]">{comment.length}/500</span>
        </div>

        {selectedItems.length > 0 && (
          <div className="mt-1 p-4 bg-[#0A0A0A] border border-[#242424] mb-5 rounded-lg">
            <p className="text-[12px] uppercase tracking-[0.06em] font-medium text-white mb-2.5">Request Summary</p>
            <p className="text-[13px] text-[#9A9A9A] mb-1">{selectedItems.length} item{selectedItems.length > 1 ? 's' : ''} selected</p>
            {type === 'return' && (
              <>
                <p className="text-[13px] text-[#9A9A9A] mb-1">
                  Estimated refund: <strong className="text-white">₹{totalRefund.toLocaleString('en-IN')}</strong>
                  {refundMethod === 'wallet' && <span className="text-[#16a34a] ml-1.5">→ ₹{(totalRefund * 1.10).toFixed(0)} with wallet bonus</span>}
                </p>
                <p className="text-[11px] text-[#5C5C5C] italic m-0">Final amount confirmed after inspection</p>
              </>
            )}
            {type === 'exchange' && selectedExchangeType === 'same_product' && selectedItems.map(key => {
              const idx = order.items.findIndex((item, i) => itemKey(item, i) === key)
              const item = order.items[idx]
              const detail = itemDetails[key] || {}
              if (!item || !detail.exchangeSize) return null
              return <p key={key} className="text-[13px] text-[#9A9A9A] my-0.5">{item.name}: {item.size} → <strong className="text-[#1d4ed8]">{detail.exchangeSize}</strong></p>
            })}
            {type === 'exchange' && selectedExchangeType === 'different_product' && selectedNewProduct && (
              <p className="text-[13px] text-[#9A9A9A] my-0.5">
                Replacement: <strong className="text-white">{selectedNewProduct.name}</strong>
                {selectedNewProduct.selectedSize && <span> (Size: {selectedNewProduct.selectedSize})</span>}
                {computedPriceDiff !== 0 && <span className={`ml-2 ${computedPriceDiff > 0 ? 'text-[#b91c1c]' : 'text-[#15803d]'}`}>
                  {computedPriceDiff > 0 ? `+₹${computedPriceDiff.toLocaleString('en-IN')} to pay` : `-₹${Math.abs(computedPriceDiff).toLocaleString('en-IN')} refund`}
                </span>}
              </p>
            )}
          </div>
        )}

        <button type="submit" disabled={submitting || selectedItems.length === 0}
          className="w-full h-12 bg-gradient-to-r from-[#E8A0B0] to-[#D48A9A] text-white border-none text-[13px] uppercase tracking-[0.1em] cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2 rounded-xl transition-all hover:shadow-[0_8px_30px_rgba(238,107,131,0.3)]">
          {submitting && <Loader2 size={14} className="animate-spin" />}
          {submitting ? 'Submitting...' : `Submit ${type === 'return' ? 'Return' : 'Exchange'} Request`}
        </button>
      </form>
    </div>
  )
}
