import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Lock, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { updateUserProfile } from '../../store/slices/profileSlice'
import { useAuth } from '../../context/AuthContext'
import { TOKEN_KEY } from '../../utils/authApi'

function ViewRow({ label, value }) {
  return (
    <div>
      <span className="block text-[11px] uppercase tracking-[0.06em] text-[#5C5C5C] mb-1">{label}</span>
      <p className="text-sm font-medium text-white m-0">{value || '—'}</p>
    </div>
  )
}

function formatMonth(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
}

export default function PersonalDetails() {
  const dispatch  = useDispatch()
  const { user: profileUser, updating } = useSelector((s) => s.profile)
  const { login } = useAuth()

  const [editing,  setEditing]  = useState(false)
  const [name,     setName]     = useState('')
  const [phone,    setPhone]    = useState('')
  const [errors,   setErrors]   = useState({})

  const startEdit = () => {
    setName(profileUser?.name || '')
    setPhone(profileUser?.phone || '')
    setErrors({})
    setEditing(true)
  }

  const cancelEdit = () => setEditing(false)

  const validate = () => {
    const errs = {}
    if (!name.trim() || name.trim().length < 2) errs.name = 'Name must be at least 2 characters'
    if (!phone.trim() || !/^[0-9]{10}$/.test(phone.trim())) errs.phone = 'Enter a valid 10-digit phone number'
    return errs
  }

  const handleSave = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    const result = await dispatch(updateUserProfile({ name: name.trim(), phone: phone.trim() }))
    if (updateUserProfile.fulfilled.match(result)) {
      const token = localStorage.getItem(TOKEN_KEY)
      if (token) login(token, result.payload)
      toast.success('Profile updated successfully')
      setEditing(false)
    } else {
      toast.error(result.payload || 'Failed to update profile')
    }
  }

  return (
    <div className="bg-[#141414] border border-[#242424] rounded-2xl p-5 md:p-8">
      {/* Section header */}
      <div className="flex items-center justify-between mb-6">
        <span className="text-xs uppercase tracking-[0.1em] font-semibold text-white">
          Personal Details
        </span>
        {!editing && (
          <button
            onClick={startEdit}
            className="text-xs text-[#5C5C5C] hover:text-[#B8976A] transition-colors"
          >
            Edit
          </button>
        )}
      </div>

      {!editing ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ViewRow label="Full Name" value={profileUser?.name} />
          <div>
            <span className="block text-[11px] uppercase tracking-[0.06em] text-[#5C5C5C] mb-1">
              Email Address
              <span title="Cannot be changed" className="ml-1.5 inline-flex align-middle">
                <Lock size={10} className="text-[#5C5C5C]" />
              </span>
            </span>
            <p className="text-sm font-medium text-[#5C5C5C] m-0">{profileUser?.email || '—'}</p>
          </div>
          <ViewRow label="Phone Number" value={profileUser?.phone} />
          <ViewRow label="Member Since" value={formatMonth(profileUser?.createdAt)} />
        </div>
      ) : (
        <form onSubmit={handleSave} noValidate>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-[11px] uppercase tracking-[0.06em] text-[#5C5C5C] mb-1">Full Name</label>
              <input
                value={name}
                onChange={(e) => { setName(e.target.value); setErrors((er) => ({ ...er, name: '' })) }}
                className="w-full border-b border-[#242424] py-2.5 text-sm bg-transparent outline-none text-white focus:border-[#B8976A] transition-colors"
              />
              {errors.name && <span className="text-xs text-[#E8A0B0] mt-1 block">{errors.name}</span>}
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-[0.06em] text-[#5C5C5C] mb-1">
                Email Address
                <Lock size={10} className="ml-1.5 text-[#5C5C5C] inline align-middle" />
              </label>
              <input value={profileUser?.email || ''} disabled className="w-full border-b border-[#242424] py-2.5 text-sm bg-transparent outline-none text-[#5C5C5C] cursor-not-allowed" />
              <span className="text-[10px] text-[#5C5C5C] mt-1 block">Cannot be changed</span>
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-[0.06em] text-[#5C5C5C] mb-1">Phone Number</label>
              <input
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))
                  setErrors((er) => ({ ...er, phone: '' }))
                }}
                inputMode="numeric"
                maxLength={10}
                className="w-full border-b border-[#242424] py-2.5 text-sm bg-transparent outline-none text-white focus:border-[#B8976A] transition-colors"
              />
              {errors.phone && <span className="text-xs text-[#E8A0B0] mt-1 block">{errors.phone}</span>}
            </div>
          </div>

          <button
            type="submit"
            disabled={updating}
            className="w-full h-12 bg-gradient-to-r from-[#B8976A] to-[#A88345] text-white text-xs uppercase tracking-[0.1em] font-semibold border-none rounded-xl cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 transition-all"
          >
            {updating && <Loader2 size={14} className="animate-spin" />}
            {updating ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            type="button"
            onClick={cancelEdit}
            className="mt-3 text-xs text-[#5C5C5C] hover:text-white transition-colors w-full text-center cursor-pointer bg-transparent border-none"
          >
            Cancel
          </button>
        </form>
      )}
    </div>
  )
}
