import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import { registerUser } from '../../utils/authApi'

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function Field({ label, error, children }) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <label style={{
        display: 'block',
        fontSize: '11px',
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        color: '#6B6B6B',
        marginBottom: '4px',
      }}>
        {label}
      </label>
      {children}
      {error && (
        <span style={{ fontSize: '12px', color: '#EF4444', marginTop: '4px', display: 'block' }}>
          {error}
        </span>
      )}
    </div>
  )
}

const inputStyle = (hasError) => ({
  width: '100%',
  border: 'none',
  borderBottom: `1px solid ${hasError ? '#EF4444' : '#E5E5E5'}`,
  padding: '10px 0',
  fontSize: '15px',
  background: 'transparent',
  outline: 'none',
  color: '#0A0A0A',
  boxSizing: 'border-box',
})

export default function SignupForm({ onSwitchTab }) {
  const { login } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()
  const from      = location.state?.from || '/'

  const [form, setForm]     = useState({ name: '', email: '', phone: '', password: '' })
  const [errors, setErrors] = useState({})
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

  const set = (field) => (e) => {
    const value = field === 'phone'
      ? e.target.value.replace(/\D/g, '').slice(0, 10)
      : e.target.value
    setForm((f) => ({ ...f, [field]: value }))
    if (errors[field]) setErrors((err) => ({ ...err, [field]: '' }))
  }

  const validate = (field, value) => {
    if (field === 'name') {
      if (!value.trim()) return 'Full name is required'
      if (value.trim().length < 2) return 'Name must be at least 2 characters'
    }
    if (field === 'email') {
      if (!value.trim()) return 'Email address is required'
      if (!emailRegex.test(value)) return 'Enter a valid email address'
    }
    if (field === 'phone') {
      if (!value.trim()) return 'Phone number is required'
      if (!/^[0-9]{10}$/.test(value)) return 'Enter a valid 10-digit phone number'
    }
    if (field === 'password') {
      if (!value) return 'Password is required'
      if (value.length < 6) return 'Password must be at least 6 characters'
    }
    return ''
  }

  const handleBlur = (field) => () => {
    const err = validate(field, form[field])
    if (err) setErrors((e) => ({ ...e, [field]: err }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const newErrors = {}
    for (const field of ['name', 'email', 'phone', 'password']) {
      const err = validate(field, form[field])
      if (err) newErrors[field] = err
    }
    if (Object.keys(newErrors).length) {
      setErrors(newErrors)
      return
    }

    setLoading(true)
    try {
      const { data } = await registerUser({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password,
      })
      login(data.token, data.user)
      toast.success(`Welcome to LUXORA JEWELLERY, ${data.user.name}!`)
      navigate(from, { replace: true })
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <Field label="Full Name" error={errors.name}>
        <input
          type="text"
          value={form.name}
          onChange={set('name')}
          onBlur={handleBlur('name')}
          placeholder="Your full name"
          style={inputStyle(!!errors.name)}
        />
      </Field>

      <Field label="Email Address" error={errors.email}>
        <input
          type="email"
          value={form.email}
          onChange={set('email')}
          onBlur={handleBlur('email')}
          placeholder="your@email.com"
          style={inputStyle(!!errors.email)}
        />
      </Field>

      <Field label="Phone Number" error={errors.phone}>
        <input
          type="tel"
          value={form.phone}
          onChange={set('phone')}
          onBlur={handleBlur('phone')}
          placeholder="10-digit mobile number"
          maxLength={10}
          inputMode="numeric"
          style={inputStyle(!!errors.phone)}
        />
      </Field>

      <Field label="Password" error={errors.password}>
        <div style={{ position: 'relative' }}>
          <input
            type={showPw ? 'text' : 'password'}
            value={form.password}
            onChange={set('password')}
            onBlur={handleBlur('password')}
            placeholder="Minimum 6 characters"
            style={{ ...inputStyle(!!errors.password), paddingRight: '32px' }}
          />
          <button
            type="button"
            onClick={() => setShowPw((v) => !v)}
            style={{
              position: 'absolute',
              right: 0,
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#6B6B6B',
              padding: 0,
              lineHeight: 0,
            }}
          >
            {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </Field>

      <button
        type="submit"
        disabled={loading}
        style={{
          width: '100%',
          height: '48px',
          background: '#EE6B83',
          color: '#fff',
          fontSize: '13px',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          border: 'none',
          cursor: loading ? 'not-allowed' : 'pointer',
          borderRadius: '8px',
          marginTop: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          opacity: loading ? 0.7 : 1,
          transition: 'background 200ms',
        }}
      >
        {loading && <Loader2 size={14} className="animate-spin" />}
        {loading ? 'Creating Account...' : 'Create Account'}
      </button>

      <p style={{ fontSize: '13px', color: '#6B6B6B', textAlign: 'center', marginTop: '20px' }}>
        Already have an account?{' '}
        <button
          type="button"
          onClick={() => onSwitchTab('login')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EE6B83', fontWeight: 500 }}
        >
          Login →
        </button>
      </p>
    </form>
  )
}
