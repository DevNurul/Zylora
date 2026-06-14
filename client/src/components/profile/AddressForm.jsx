import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { INDIAN_STATES } from '../../utils/constants'
import { addUserAddress, updateUserAddress } from '../../store/slices/profileSlice'

const EMPTY = {
  label: 'Home',
  fullName: '',
  phone: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  pincode: '',
  isDefault: false,
}

const inputStyle = (err) => ({
  width: '100%',
  border: 'none',
  borderBottom: `1px solid ${err ? '#EF4444' : '#E5E5E5'}`,
  padding: '9px 0',
  fontSize: '14px',
  background: 'transparent',
  outline: 'none',
  color: '#0A0A0A',
  boxSizing: 'border-box',
  transition: 'border-color 200ms',
})

const labelStyle = {
  display: 'block',
  fontSize: '11px',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  color: '#6B6B6B',
  marginBottom: '3px',
}

function FormField({ label, error, children }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      {children}
      {error && <span style={{ fontSize: '12px', color: '#EF4444', marginTop: '3px', display: 'block' }}>{error}</span>}
    </div>
  )
}

export default function AddressForm({ existing, onCancel, onSuccess }) {
  const dispatch  = useDispatch()
  const updating  = useSelector((s) => s.profile.updating)
  const addresses = useSelector((s) => s.profile.addresses)

  const [form, setForm]     = useState(existing ? { ...existing } : { ...EMPTY, isDefault: addresses.length === 0 })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (existing) setForm({ ...existing })
  }, [existing])

  const set = (field) => (e) => {
    const val = field === 'pincode'
      ? e.target.value.replace(/\D/g, '').slice(0, 6)
      : field === 'phone'
      ? e.target.value.replace(/\D/g, '').slice(0, 10)
      : e.target.value
    setForm((f) => ({ ...f, [field]: val }))
    if (errors[field]) setErrors((er) => ({ ...er, [field]: '' }))
  }

  const setCheck = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.checked }))

  const validate = () => {
    const errs = {}
    if (!form.fullName.trim()) errs.fullName = 'Required'
    if (!form.phone.trim() || !/^[0-9]{10}$/.test(form.phone.trim())) errs.phone = 'Enter a valid 10-digit number'
    if (!form.addressLine1.trim()) errs.addressLine1 = 'Required'
    if (!form.city.trim()) errs.city = 'Required'
    if (!form.state.trim()) errs.state = 'Required'
    if (!form.pincode.trim() || !/^[0-9]{6}$/.test(form.pincode.trim())) errs.pincode = 'Enter a valid 6-digit pincode'
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    const payload = { ...form, phone: form.phone.trim(), pincode: form.pincode.trim() }
    let result

    if (existing) {
      result = await dispatch(updateUserAddress({ id: existing._id, data: payload }))
      if (updateUserAddress.fulfilled.match(result)) {
        toast.success('Address updated successfully')
        onSuccess?.()
      } else {
        toast.error(result.payload || 'Failed to update address')
      }
    } else {
      result = await dispatch(addUserAddress(payload))
      if (addUserAddress.fulfilled.match(result)) {
        toast.success('Address added successfully')
        onSuccess?.()
      } else {
        toast.error(result.payload || 'Failed to add address')
      }
    }
  }

  const selectStyle = (err) => ({
    ...inputStyle(err),
    appearance: 'auto',
    cursor: 'pointer',
  })

  return (
    <form onSubmit={handleSubmit} noValidate style={{ marginTop: '16px' }}>
      {/* Label */}
      <div style={{ marginBottom: '16px' }}>
        <FormField label="Label">
          <select value={form.label} onChange={set('label')} style={selectStyle(false)}>
            <option value="Home">Home</option>
            <option value="Work">Work</option>
            <option value="Other">Other</option>
          </select>
        </FormField>
      </div>

      {/* Full Name */}
      <div style={{ marginBottom: '16px' }}>
        <FormField label="Full Name" error={errors.fullName}>
          <input value={form.fullName} onChange={set('fullName')} placeholder="Name for this address" style={inputStyle(!!errors.fullName)} />
        </FormField>
      </div>

      {/* Phone */}
      <div style={{ marginBottom: '16px' }}>
        <FormField label="Phone Number" error={errors.phone}>
          <input value={form.phone} onChange={set('phone')} placeholder="10-digit number" inputMode="numeric" maxLength={10} style={inputStyle(!!errors.phone)} />
        </FormField>
      </div>

      {/* Address Line 1 */}
      <div style={{ marginBottom: '16px' }}>
        <FormField label="Address Line 1" error={errors.addressLine1}>
          <input value={form.addressLine1} onChange={set('addressLine1')} placeholder="House/Flat no, Building, Street" style={inputStyle(!!errors.addressLine1)} />
        </FormField>
      </div>

      {/* Address Line 2 */}
      <div style={{ marginBottom: '16px' }}>
        <FormField label="Address Line 2 (optional)">
          <input value={form.addressLine2} onChange={set('addressLine2')} placeholder="Area, Landmark (optional)" style={inputStyle(false)} />
        </FormField>
      </div>

      {/* City / State / Pincode */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
        <FormField label="City" error={errors.city}>
          <input value={form.city} onChange={set('city')} placeholder="City" style={inputStyle(!!errors.city)} />
        </FormField>
        <FormField label="State" error={errors.state}>
          <select value={form.state} onChange={set('state')} style={selectStyle(!!errors.state)}>
            <option value="">Select</option>
            {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </FormField>
        <FormField label="Pincode" error={errors.pincode}>
          <input value={form.pincode} onChange={set('pincode')} placeholder="6-digit pincode" inputMode="numeric" maxLength={6} style={inputStyle(!!errors.pincode)} />
        </FormField>
      </div>

      {/* Default checkbox */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
        <input
          type="checkbox"
          id="isDefault"
          checked={form.isDefault}
          onChange={setCheck('isDefault')}
          style={{ cursor: 'pointer', accentColor: '#0A0A0A' }}
        />
        <label htmlFor="isDefault" style={{ fontSize: '13px', color: '#6B6B6B', cursor: 'pointer' }}>
          Set as my default address
        </label>
      </div>

      {/* Buttons */}
      <button
        type="submit"
        disabled={updating}
        style={{
          width: '100%',
          height: '48px',
          background: '#0A0A0A',
          color: '#fff',
          fontSize: '13px',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          border: 'none',
          cursor: updating ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          opacity: updating ? 0.7 : 1,
        }}
      >
        {updating && <Loader2 size={14} className="animate-spin" />}
        {updating ? 'Saving...' : 'Save Address'}
      </button>

      <button
        type="button"
        onClick={onCancel}
        style={{ marginTop: '12px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', color: '#6B6B6B', width: '100%' }}
      >
        Cancel
      </button>
    </form>
  )
}
