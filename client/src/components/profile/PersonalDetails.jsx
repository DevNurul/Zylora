import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Lock, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { updateUserProfile } from '../../store/slices/profileSlice'
import { useAuth } from '../../context/AuthContext'
import { TOKEN_KEY } from '../../utils/authApi'

const labelStyle = {
  display: 'block',
  fontSize: '11px',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  color: '#6B6B6B',
  marginBottom: '4px',
}

const inputStyle = (disabled, err) => ({
  width: '100%',
  border: 'none',
  borderBottom: `1px solid ${err ? '#EF4444' : disabled ? '#F0F0F0' : '#E5E5E5'}`,
  padding: '9px 0',
  fontSize: '15px',
  background: 'transparent',
  outline: 'none',
  color: disabled ? '#B0B0B0' : '#0A0A0A',
  boxSizing: 'border-box',
  cursor: disabled ? 'not-allowed' : 'text',
  transition: 'border-color 200ms',
})

function ViewRow({ label, value }) {
  return (
    <div>
      <span style={labelStyle}>{label}</span>
      <p style={{ fontSize: '15px', fontWeight: 500, color: '#0A0A0A', margin: '4px 0 0' }}>{value || '—'}</p>
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
      // Sync navbar — re-use existing token, just update user object in context
      const token = localStorage.getItem(TOKEN_KEY)
      if (token) login(token, result.payload)
      toast.success('Profile updated successfully')
      setEditing(false)
    } else {
      toast.error(result.payload || 'Failed to update profile')
    }
  }

  return (
    <div style={{ background: '#fff', padding: '32px' }}>
      {/* Section header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <span style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500, color: '#0A0A0A' }}>
          Personal Details
        </span>
        {!editing && (
          <button
            onClick={startEdit}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', color: '#6B6B6B' }}
            onMouseOver={(e) => { e.target.style.color = '#0A0A0A' }}
            onMouseOut={(e) => { e.target.style.color = '#6B6B6B' }}
          >
            Edit
          </button>
        )}
      </div>

      {!editing ? (
        /* ── View mode ─────────────────────────────────────────────────────── */
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <ViewRow label="Full Name" value={profileUser?.name} />
          <div>
            <span style={labelStyle}>
              Email Address
              <span title="Cannot be changed" style={{ marginLeft: '6px', cursor: 'help', display: 'inline-flex', verticalAlign: 'middle' }}>
                <Lock size={10} style={{ color: '#B0B0B0' }} />
              </span>
            </span>
            <p style={{ fontSize: '15px', fontWeight: 500, color: '#B0B0B0', margin: '4px 0 0' }}>{profileUser?.email || '—'}</p>
          </div>
          <ViewRow label="Phone Number" value={profileUser?.phone} />
          <ViewRow label="Member Since" value={formatMonth(profileUser?.createdAt)} />
        </div>
      ) : (
        /* ── Edit mode ─────────────────────────────────────────────────────── */
        <form onSubmit={handleSave} noValidate>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
            {/* Full Name */}
            <div>
              <label style={labelStyle}>Full Name</label>
              <input
                value={name}
                onChange={(e) => { setName(e.target.value); setErrors((er) => ({ ...er, name: '' })) }}
                style={inputStyle(false, !!errors.name)}
              />
              {errors.name && <span style={{ fontSize: '12px', color: '#EF4444', marginTop: '3px', display: 'block' }}>{errors.name}</span>}
            </div>

            {/* Email — locked */}
            <div>
              <label style={labelStyle}>
                Email Address
                <Lock size={10} style={{ marginLeft: '6px', color: '#B0B0B0', verticalAlign: 'middle' }} />
              </label>
              <input value={profileUser?.email || ''} disabled style={inputStyle(true, false)} />
              <span style={{ fontSize: '11px', color: '#B0B0B0', marginTop: '3px', display: 'block' }}>Cannot be changed</span>
            </div>

            {/* Phone */}
            <div>
              <label style={labelStyle}>Phone Number</label>
              <input
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))
                  setErrors((er) => ({ ...er, phone: '' }))
                }}
                inputMode="numeric"
                maxLength={10}
                style={inputStyle(false, !!errors.phone)}
              />
              {errors.phone && <span style={{ fontSize: '12px', color: '#EF4444', marginTop: '3px', display: 'block' }}>{errors.phone}</span>}
            </div>
          </div>

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
            {updating ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            type="button"
            onClick={cancelEdit}
            style={{ marginTop: '12px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', color: '#6B6B6B', display: 'block', width: '100%', textAlign: 'center' }}
          >
            Cancel
          </button>
        </form>
      )}
    </div>
  )
}
