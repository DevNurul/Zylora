import { useState, useEffect } from 'react'
import { INDIAN_STATES } from '../../utils/constants'
import { useCart } from '../../hooks/useCart'
import { useDispatch, useSelector } from 'react-redux'
import { setOrder } from '../../store/slices/orderSlice'
import { selectCoupon } from '../../store/slices/cartSlice'
import { useNavigate } from 'react-router-dom'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import { isValidEmail } from '../../utils/formUtils'

const INITIAL = {
  fullName: '', email: '', phone: '',
  address1: '', address2: '',
  city: '', state: '', pincode: '',
  payment: 'cod',
}

const REQUIRED = ['fullName', 'email', 'phone', 'address1', 'city', 'state', 'pincode']

function validate(fields, values) {
  const errors = {}
  fields.forEach((f) => {
    if (!values[f]?.trim()) errors[f] = 'Required'
  })
  if (values.email && !isValidEmail(values.email)) errors.email = 'Invalid email'
  if (values.phone && !/^[6-9]\d{9}$/.test(values.phone)) errors.phone = 'Invalid phone number'
  if (values.pincode && !/^\d{6}$/.test(values.pincode)) errors.pincode = 'Invalid 6-digit pincode'
  return errors
}

function field(label, name, type, placeholder, values, errors, handleChange, handleBlur) {
  const base = `border ${errors[name] ? 'border-red-400' : 'border-gray-200'} px-3 py-2.5 w-full text-[15px] focus:outline-none focus:border-[#EE6B83] transition-colors`
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type || 'text'}
        name={name}
        value={values[name]}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={base}
      />
      {errors[name] && <p className="text-xs text-red-500 mt-1">{errors[name]}</p>}
    </div>
  )
}

export default function ShippingForm({ prefill }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { items, finalTotal, clearCart } = useCart()
  const coupon = useSelector(selectCoupon)
  const [values, setValues] = useState(INITIAL)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [stockError, setStockError] = useState(null)

  useEffect(() => {
    if (!prefill) return
    setValues((v) => ({
      ...v,
      fullName: prefill.fullName || '',
      phone:    prefill.phone    || '',
      address1: prefill.addressLine1 || '',
      address2: prefill.addressLine2 || '',
      city:     prefill.city    || '',
      state:    prefill.state   || '',
      pincode:  prefill.pincode || '',
    }))
    setErrors({})
  }, [prefill])

  const handleChange = (e) => {
    const { name, value } = e.target
    setValues((v) => ({ ...v, [name]: value }))
    if (errors[name]) setErrors((e) => ({ ...e, [name]: '' }))
    if (stockError) setStockError(null)
  }

  const handleBlur = (e) => {
    const { name } = e.target
    const errs = validate([name], values)
    setErrors((prev) => ({ ...prev, ...errs }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate(REQUIRED, values)
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setLoading(true)
    try {
      const { data } = await api.post('/orders', {
        customerName: values.fullName,
        email: values.email,
        phone: values.phone,
        shippingAddress: {
          addressLine1: values.address1,
          addressLine2: values.address2,
          city: values.city,
          state: values.state,
          pincode: values.pincode,
        },
        items: items.map((item) => ({
          productId: item.id,
          name: item.name, price: item.price, qty: item.qty,
          size: item.size, color: item.color, image: item.image,
        })),
        paymentMethod: values.payment === 'online' ? 'ONLINE' : 'COD',
        couponCode: coupon.code || undefined,
      })

      if (data.paymentMethod === 'ONLINE') {
        // Clear cart before leaving the site; order is already created in DB
        clearCart()
        window.location.href = data.redirectUrl
        return
      }

      dispatch(setOrder({
        orderId: data.orderId,
        fullName: values.fullName,
        email: values.email,
        total: data.total,
        estimatedDelivery: data.estimatedDelivery,
        items,
      }))
      clearCart()
      navigate('/order-success')
    } catch (err) {
      const message = err.response?.data?.error || 'Order placement failed. Please try again.'
      toast.error(message, { duration: 5000 })
      if (message.includes('out of stock') || message.includes('Only') || message.includes('not available')) {
        setStockError(message)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    } finally {
      setLoading(false)
    }
  }

  const selectCls = (name) =>
    `border ${errors[name] ? 'border-red-400' : 'border-gray-200'} px-3 py-2.5 w-full text-[15px] focus:outline-none focus:border-[#EE6B83] transition-colors bg-white`

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
      {stockError && (
        <div className="bg-red-50 border border-red-200 p-4">
          <p className="text-sm text-red-600 font-medium flex items-center gap-2">
            <span>⚠</span>
            {stockError}
          </p>
          <p className="text-xs text-red-400 mt-1">
            Please go back to your cart and update the quantities.
          </p>
          <button
            type="button"
            onClick={() => navigate('/cart')}
            className="text-xs underline text-red-500 mt-2"
          >
            Go to Cart →
          </button>
        </div>
      )}
      <div>
        <h2 className="text-base font-semibold mb-4">Contact Information</h2>
        <div className="space-y-4">
          {field('Full Name', 'fullName', 'text', 'Your full name', values, errors, handleChange, handleBlur)}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {field('Email', 'email', 'email', 'you@example.com', values, errors, handleChange, handleBlur)}
            {field('Phone', 'phone', 'tel', '9876543210', values, errors, handleChange, handleBlur)}
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-base font-semibold mb-4">Shipping Address</h2>
        <div className="space-y-4">
          {field('Address Line 1', 'address1', 'text', 'House / Flat no., Street', values, errors, handleChange, handleBlur)}
          {field('Address Line 2 (optional)', 'address2', 'text', 'Landmark, Colony', values, errors, handleChange, handleBlur)}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {field('City', 'city', 'text', 'Mumbai', values, errors, handleChange, handleBlur)}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
              <select name="state" value={values.state} onChange={handleChange} onBlur={handleBlur} className={selectCls('state')}>
                <option value="">Select State</option>
                {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              {errors.state && <p className="text-xs text-red-500 mt-1">{errors.state}</p>}
            </div>
            {field('Pincode', 'pincode', 'text', '400001', values, errors, handleChange, handleBlur)}
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-base font-semibold mb-4">Payment Method</h2>
        <div className="space-y-3">
          <label className={`flex items-center gap-3 border p-4 cursor-pointer transition-colors ${values.payment === 'cod' ? 'border-[#EE6B83]' : 'border-gray-200 hover:border-gray-300'}`}>
            <input type="radio" name="payment" value="cod" checked={values.payment === 'cod'} onChange={handleChange} className="accent-[#EE6B83]" />
            <div>
              <p className="text-sm font-medium">Cash on Delivery</p>
              <p className="text-xs text-gray-400 mt-0.5">Pay when your order arrives</p>
            </div>
          </label>

          <label className={`flex items-center gap-3 border p-4 cursor-pointer transition-colors ${values.payment === 'online' ? 'border-[#EE6B83]' : 'border-gray-200 hover:border-gray-300'}`}>
            <input type="radio" name="payment" value="online" checked={values.payment === 'online'} onChange={handleChange} className="accent-[#EE6B83]" />
            <div>
              <p className="text-sm font-medium">Online Payment</p>
              <p className="text-xs text-gray-400 mt-0.5">UPI, Cards, Net Banking via PhonePe</p>
            </div>
          </label>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#EE6B83] text-white py-4 text-sm uppercase tracking-widest font-medium hover:bg-[#D9506A] transition-colors disabled:opacity-60 disabled:cursor-not-allowed rounded-lg"
      >
        {loading
          ? (values.payment === 'online' ? 'Redirecting to PhonePe…' : 'Placing Order…')
          : 'Place Order'}
      </button>
    </form>
  )
}
