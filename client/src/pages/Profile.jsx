import { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Camera, Trash2, Save, User as UserIcon, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import {
  fetchProfile,
  saveProfile,
  uploadAvatar,
  removeAvatar,
} from '../store/slices/profileSlice'


/* ── Helpers ─────────────────────────────────────────────────────────────────── */
const ACCEPTED = 'image/jpeg,image/jpg,image/png,image/webp'

const EMPTY_FORM = {
  name: '', phone: '',
  addressLine1: '', addressLine2: '',
  city: '', state: '', postalCode: '', country: '',
  alternatePhone: '',
}

function Avatar({ src, saving, onUpload, onDelete }) {
  const inputRef = useRef(null)

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-28 h-28 rounded-full overflow-hidden border border-gray-100 bg-gray-50 flex-shrink-0">
        {src ? (
          <img src={src} alt="Profile" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <UserIcon size={48} className="text-gray-300" />
          </div>
        )}
        {saving && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
            <Loader2 size={22} className="animate-spin text-[#EE6B83]" />
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={saving}
          className="flex items-center gap-1.5 text-[11px] uppercase tracking-widest font-medium px-3 py-1.5 border border-[#EE6B83] text-[#EE6B83] hover:bg-[#FCD4DB] hover:text-[#EE6B83] transition-all duration-200 disabled:opacity-40 rounded-lg"
          aria-label="Upload profile picture"
        >
          <Camera size={13} />
          {src ? 'Change' : 'Upload'}
        </button>

        {src && (
          <button
            type="button"
            onClick={onDelete}
            disabled={saving}
            className="flex items-center gap-1.5 text-[11px] uppercase tracking-widest font-medium px-3 py-1.5 border border-red-300 text-red-500 hover:bg-red-50 transition-all duration-200 disabled:opacity-40 rounded-lg"
            aria-label="Remove profile picture"
          >
            <Trash2 size={13} />
            Remove
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) onUpload(file)
          e.target.value = ''
        }}
      />

      <p className="text-[10px] text-[#6B6B6B] text-center">
        JPG, JPEG, PNG or WEBP · Max 5 MB
      </p>
    </div>
  )
}

function Field({ label, id, readOnly, ...rest }) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-[11px] uppercase tracking-widest text-[#6B6B6B] font-medium">
        {label}
      </label>
      <input
        id={id}
        readOnly={readOnly}
        className={`border-b py-2 text-[13px] bg-transparent focus:outline-none transition-colors ${
          readOnly
            ? 'border-gray-100 text-[#9B9B9B] cursor-not-allowed select-none'
            : 'border-gray-200 focus:border-[#EE6B83] text-[#0A0A0A]'
        }`}
        {...rest}
      />
      {readOnly && (
        <p className="text-[10px] text-[#9B9B9B]">Email cannot be changed</p>
      )}
    </div>
  )
}

/* ── Main component ─────────────────────────────────────────────────────────── */

export default function Profile() {
  const dispatch = useDispatch()
  const { data: profile, loading, saving, error } = useSelector((s) => s.profile)

  const [form, setForm] = useState(EMPTY_FORM)
  const [dirty, setDirty] = useState(false)

  // ProtectedRoute in App.jsx guarantees this component only renders when
  // the user is authenticated, so no redirect logic needed here.
  useEffect(() => {
    dispatch(fetchProfile())
  }, [dispatch])

  // Sync form from server profile
  useEffect(() => {
    if (profile) {
      setForm({
        name:           profile.name          || '',
        phone:          profile.phone         || '',
        addressLine1:   profile.addressLine1  || '',
        addressLine2:   profile.addressLine2  || '',
        city:           profile.city          || '',
        state:          profile.state         || '',
        postalCode:     profile.postalCode    || '',
        country:        profile.country       || '',
        alternatePhone: profile.alternatePhone|| '',
      })
      setDirty(false)
    }
  }, [profile])

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
    setDirty(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!dirty) return

    const result = await dispatch(saveProfile(form))
    if (saveProfile.fulfilled.match(result)) {
      toast.success('Profile saved successfully')
      setDirty(false)
    } else {
      toast.error(result.payload || 'Failed to save profile')
    }
  }

  const handleUpload = async (file) => {
    const result = await dispatch(uploadAvatar(file))
    if (uploadAvatar.fulfilled.match(result)) {
      toast.success('Profile picture updated')
    } else {
      toast.error(result.payload || 'Failed to upload image')
    }
  }

  const handleDelete = async () => {
    const result = await dispatch(removeAvatar())
    if (removeAvatar.fulfilled.match(result)) {
      toast.success('Profile picture removed')
    } else {
      toast.error(result.payload || 'Failed to remove image')
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 size={28} className="animate-spin text-[#EE6B83]" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center px-4">
        <p className="text-sm text-red-500">{error}</p>
        <button
          onClick={() => dispatch(fetchProfile())}
          className="text-[11px] uppercase tracking-widest font-medium px-4 py-2 border border-[#EE6B83] text-[#EE6B83] hover:bg-[#FCD4DB] transition-all duration-200 rounded-lg"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 md:py-14">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-xl font-semibold tracking-wide text-[#0A0A0A]">My Profile</h1>
        <p className="text-[13px] text-[#6B6B6B] mt-1">Manage your personal information and address</p>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        {/* Avatar */}
        <div className="mb-10 flex justify-center">
          <Avatar
            src={profile?.profileImage}
            saving={saving}
            onUpload={handleUpload}
            onDelete={handleDelete}
          />
        </div>

        {/* Divider */}
        <div className="border-t border-gray-100 mb-8" />

        {/* Personal info */}
        <section className="mb-8">
          <h2 className="text-[11px] uppercase tracking-widest font-semibold text-[#0A0A0A] mb-5">
            Personal Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
            <Field
              label="Full Name"
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              maxLength={60}
              required
              aria-required="true"
            />
            <Field
              label="Email Address"
              id="email"
              name="email"
              type="email"
              value={profile?.email || ''}
              readOnly
              tabIndex={-1}
            />
            <Field
              label="Phone Number"
              id="phone"
              name="phone"
              type="tel"
              value={form.phone}
              onChange={handleChange}
              placeholder="10-digit mobile number"
              maxLength={14}
            />
            <Field
              label="Alternate Phone (optional)"
              id="alternatePhone"
              name="alternatePhone"
              type="tel"
              value={form.alternatePhone}
              onChange={handleChange}
              placeholder="10-digit mobile number"
              maxLength={14}
            />
          </div>
        </section>

        {/* Address */}
        <section className="mb-10">
          <h2 className="text-[11px] uppercase tracking-widest font-semibold text-[#0A0A0A] mb-5">
            Address
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
            <div className="sm:col-span-2">
              <Field
                label="Address Line 1"
                id="addressLine1"
                name="addressLine1"
                value={form.addressLine1}
                onChange={handleChange}
                placeholder="House / Flat / Building no."
              />
            </div>
            <div className="sm:col-span-2">
              <Field
                label="Address Line 2"
                id="addressLine2"
                name="addressLine2"
                value={form.addressLine2}
                onChange={handleChange}
                placeholder="Street, Area, Locality"
              />
            </div>
            <Field
              label="City"
              id="city"
              name="city"
              value={form.city}
              onChange={handleChange}
            />
            <Field
              label="State"
              id="state"
              name="state"
              value={form.state}
              onChange={handleChange}
            />
            <Field
              label="Postal Code"
              id="postalCode"
              name="postalCode"
              value={form.postalCode}
              onChange={handleChange}
              maxLength={10}
            />
            <Field
              label="Country"
              id="country"
              name="country"
              value={form.country}
              onChange={handleChange}
            />
          </div>
        </section>

        {/* Save button */}
        <button
          type="submit"
          disabled={saving || !dirty}
          className="flex items-center gap-2 px-8 py-3 bg-[#EE6B83] text-white text-[11px] uppercase tracking-widest font-medium hover:bg-[#D9506A] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg"
          aria-label="Save profile"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </form>
    </div>
  )
}
