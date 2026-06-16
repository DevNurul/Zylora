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

function FormField({ label, error, children }) {
  return (
    <div>
      <label className="block text-[11px] uppercase tracking-[0.06em] text-[#5C5C5C] mb-1">{label}</label>
      {children}
      {error && <span className="text-xs text-[#E8A0B0] mt-1 block">{error}</span>}
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

  const inputClass = (err) =>
    `w-full border-b ${err ? 'border-[#E8A0B0]' : 'border-[#242424]'} py-2.5 text-sm bg-transparent outline-none text-white focus:border-[#B8976A] transition-colors`

  const selectClass = (err) =>
    `w-full border-b ${err ? 'border-[#E8A0B0]' : 'border-[#242424]'} py-2.5 text-sm bg-transparent outline-none text-white focus:border-[#B8976A] transition-colors appearance-auto cursor-pointer`

  return (
    <form onSubmit={handleSubmit} noValidate className="mt-4">
      <div className="mb-4">
        <FormField label="Label">
          <select value={form.label} onChange={set('label')} className={selectClass(false)}>
            <option value="Home">Home</option>
            <option value="Work">Work</option>
            <option value="Other">Other</option>
          </select>
        </FormField>
      </div>

      <div className="mb-4">
        <FormField label="Full Name" error={errors.fullName}>
          <input value={form.fullName} onChange={set('fullName')} placeholder="Name for this address" className={inputClass(!!errors.fullName)} />
        </FormField>
      </div>

      <div className="mb-4">
        <FormField label="Phone Number" error={errors.phone}>
          <input value={form.phone} onChange={set('phone')} placeholder="10-digit number" inputMode="numeric" maxLength={10} className={inputClass(!!errors.phone)} />
        </FormField>
      </div>

      <div className="mb-4">
        <FormField label="Address Line 1" error={errors.addressLine1}>
          <input value={form.addressLine1} onChange={set('addressLine1')} placeholder="House/Flat no, Building, Street" className={inputClass(!!errors.addressLine1)} />
        </FormField>
      </div>

      <div className="mb-4">
        <FormField label="Address Line 2 (optional)">
          <input value={form.addressLine2} onChange={set('addressLine2')} placeholder="Area, Landmark (optional)" className={inputClass(false)} />
        </FormField>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <FormField label="City" error={errors.city}>
          <input value={form.city} onChange={set('city')} placeholder="City" className={inputClass(!!errors.city)} />
        </FormField>
        <FormField label="State" error={errors.state}>
          <select value={form.state} onChange={set('state')} className={selectClass(!!errors.state)}>
            <option value="">Select</option>
            {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </FormField>
        <FormField label="Pincode" error={errors.pincode}>
          <input value={form.pincode} onChange={set('pincode')} placeholder="6-digit pincode" inputMode="numeric" maxLength={6} className={inputClass(!!errors.pincode)} />
        </FormField>
      </div>

      <div className="flex items-center gap-2 mb-5">
        <input
          type="checkbox"
          id="isDefault"
          checked={form.isDefault}
          onChange={setCheck('isDefault')}
          className="cursor-pointer accent-[#B8976A]"
        />
        <label htmlFor="isDefault" className="text-xs text-[#5C5C5C] cursor-pointer">
          Set as my default address
        </label>
      </div>

      <button
        type="submit"
        disabled={updating}
        className="w-full h-12 bg-gradient-to-r from-[#B8976A] to-[#A88345] text-white text-xs uppercase tracking-[0.1em] font-semibold border-none rounded-xl cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 transition-all"
      >
        {updating && <Loader2 size={14} className="animate-spin" />}
        {updating ? 'Saving...' : 'Save Address'}
      </button>

      <button
        type="button"
        onClick={onCancel}
        className="mt-3 text-xs text-[#5C5C5C] hover:text-white transition-colors w-full text-center cursor-pointer bg-transparent border-none"
      >
        Cancel
      </button>
    </form>
  )
}
