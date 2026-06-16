import { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Camera, Trash2, Save, User as UserIcon, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { fetchProfile, saveProfile, uploadAvatar, removeAvatar } from '../store/slices/profileSlice'

const ACCEPTED = 'image/jpeg,image/jpg,image/png,image/webp'
const EMPTY_FORM = {
  name: '', phone: '', addressLine1: '', addressLine2: '', city: '', state: '', postalCode: '', country: '', alternatePhone: '',
}

function Avatar({ src, saving, onUpload, onDelete }) {
  const inputRef = useRef(null)
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-28 h-28 rounded-full overflow-hidden border border-[#242424] bg-[#1C1C1C] flex-shrink-0">
        {src ? <img src={src} alt="Profile" className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center"><UserIcon size={48} className="text-[#5C5C5C]" /></div>}
        {saving && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <Loader2 size={22} className="animate-spin text-[#B8976A]" />
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => inputRef.current?.click()} disabled={saving}
          className="flex items-center gap-1.5 text-[11px] uppercase tracking-widest font-medium px-3 py-1.5 border border-[#B8976A] text-[#B8976A] hover:bg-[#B8976A] hover:text-white transition-all duration-200 disabled:opacity-40 rounded-lg">
          <Camera size={13} />{src ? 'Change' : 'Upload'}
        </button>
        {src && (
          <button type="button" onClick={onDelete} disabled={saving}
            className="flex items-center gap-1.5 text-[11px] uppercase tracking-widest font-medium px-3 py-1.5 border border-[#EF4444] text-[#EF4444] hover:bg-[#EF4444] hover:text-white transition-all duration-200 disabled:opacity-40 rounded-lg">
            <Trash2 size={13} />Remove
          </button>
        )}
      </div>
      <input ref={inputRef} type="file" accept={ACCEPTED} className="hidden"
        onChange={(e) => { const file = e.target.files?.[0]; if (file) onUpload(file); e.target.value = '' }} />
      <p className="text-[10px] text-[#5C5C5C] text-center">JPG, JPEG, PNG or WEBP · Max 5 MB</p>
    </div>
  )
}

function Field({ label, id, readOnly, ...rest }) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-[11px] uppercase tracking-widest text-[#5C5C5C] font-medium">{label}</label>
      <input id={id} readOnly={readOnly}
        className={`border-b py-2 text-[13px] bg-transparent focus:outline-none transition-colors ${
          readOnly ? 'border-[#242424] text-[#5C5C5C] cursor-not-allowed select-none' : 'border-[#242424] focus:border-[#B8976A] text-white'
        }`} {...rest} />
      {readOnly && <p className="text-[10px] text-[#5C5C5C]">Email cannot be changed</p>}
    </div>
  )
}

export default function Profile() {
  const dispatch = useDispatch()
  const { data: profile, loading, saving, error } = useSelector((s) => s.profile)
  const [form, setForm] = useState(EMPTY_FORM)
  const [dirty, setDirty] = useState(false)

  useEffect(() => { dispatch(fetchProfile()) }, [dispatch])

  useEffect(() => {
    if (profile) {
      setForm({
        name: profile.name || '', phone: profile.phone || '', addressLine1: profile.addressLine1 || '',
        addressLine2: profile.addressLine2 || '', city: profile.city || '', state: profile.state || '',
        postalCode: profile.postalCode || '', country: profile.country || '', alternatePhone: profile.alternatePhone || '',
      })
      setDirty(false)
    }
  }, [profile])

  const handleChange = (e) => { setForm((f) => ({ ...f, [e.target.name]: e.target.value })); setDirty(true) }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!dirty) return
    const result = await dispatch(saveProfile(form))
    if (saveProfile.fulfilled.match(result)) { toast.success('Profile saved successfully'); setDirty(false) }
    else toast.error(result.payload || 'Failed to save profile')
  }

  const handleUpload = async (file) => {
    const result = await dispatch(uploadAvatar(file))
    if (uploadAvatar.fulfilled.match(result)) toast.success('Profile picture updated')
    else toast.error(result.payload || 'Failed to upload image')
  }

  const handleDelete = async () => {
    const result = await dispatch(removeAvatar())
    if (removeAvatar.fulfilled.match(result)) toast.success('Profile picture removed')
    else toast.error(result.payload || 'Failed to remove image')
  }

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 size={28} className="animate-spin text-[#B8976A]" /></div>
  if (error) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center px-4">
      <p className="text-sm text-[#EF4444]">{error}</p>
      <button onClick={() => dispatch(fetchProfile())}
        className="text-[11px] uppercase tracking-widest font-medium px-4 py-2 border border-[#B8976A] text-[#B8976A] hover:bg-[#B8976A] hover:text-white transition-all duration-200 rounded-lg">
        Retry
      </button>
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 md:py-14">
      <div className="mb-8">
        <h1 className="text-xl font-medium tracking-wide text-white">My Profile</h1>
        <p className="text-[13px] text-[#9A9A9A] mt-1">Manage your personal information and address</p>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="mb-10 flex justify-center">
          <Avatar src={profile?.profileImage} saving={saving} onUpload={handleUpload} onDelete={handleDelete} />
        </div>

        <div className="border-t border-[#242424] mb-8" />

        <section className="mb-8">
          <h2 className="text-[11px] uppercase tracking-widest font-medium text-white mb-5">Personal Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
            <Field label="Full Name" id="name" name="name" value={form.name} onChange={handleChange} maxLength={60} required aria-required="true" />
            <Field label="Email Address" id="email" name="email" type="email" value={profile?.email || ''} readOnly tabIndex={-1} />
            <Field label="Phone Number" id="phone" name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="10-digit mobile number" maxLength={14} />
            <Field label="Alternate Phone (optional)" id="alternatePhone" name="alternatePhone" type="tel" value={form.alternatePhone} onChange={handleChange} placeholder="10-digit mobile number" maxLength={14} />
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-[11px] uppercase tracking-widest font-medium text-white mb-5">Address</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
            <div className="sm:col-span-2">
              <Field label="Address Line 1" id="addressLine1" name="addressLine1" value={form.addressLine1} onChange={handleChange} placeholder="House / Flat / Building no." />
            </div>
            <div className="sm:col-span-2">
              <Field label="Address Line 2" id="addressLine2" name="addressLine2" value={form.addressLine2} onChange={handleChange} placeholder="Street, Area, Locality" />
            </div>
            <Field label="City" id="city" name="city" value={form.city} onChange={handleChange} />
            <Field label="State" id="state" name="state" value={form.state} onChange={handleChange} />
            <Field label="Postal Code" id="postalCode" name="postalCode" value={form.postalCode} onChange={handleChange} maxLength={10} />
            <Field label="Country" id="country" name="country" value={form.country} onChange={handleChange} />
          </div>
        </section>

        <button type="submit" disabled={saving || !dirty}
          className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-[#E8A0B0] to-[#D48A9A] text-white text-[11px] uppercase tracking-widest font-medium transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl hover:shadow-[0_8px_30px_rgba(238,107,131,0.3)]"
          aria-label="Save profile">
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </form>
    </div>
  )
}
