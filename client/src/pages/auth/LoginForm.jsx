import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import { loginWithPassword } from '../../utils/authApi'

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

export default function LoginForm({ onSwitchTab }) {
  const { login } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()
  const from      = location.state?.from || '/'

  const [email, setEmail]     = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors]   = useState({})
  const [showPw, setShowPw]   = useState(false)
  const [loading, setLoading] = useState(false)

  const validateEmail = (val) => {
    if (!val.trim()) return 'Email address is required'
    if (!emailRegex.test(val)) return 'Enter a valid email address'
    return ''
  }

  const validatePassword = (val) => {
    if (!val) return 'Password is required'
    return ''
  }

  const handleBlurEmail = () => {
    const err = validateEmail(email)
    setErrors((e) => ({ ...e, email: err }))
  }

  const handleBlurPassword = () => {
    const err = validatePassword(password)
    setErrors((e) => ({ ...e, password: err }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const emailErr    = validateEmail(email)
    const passwordErr = validatePassword(password)
    if (emailErr || passwordErr) {
      setErrors({ email: emailErr, password: passwordErr })
      return
    }

    setLoading(true)
    try {
      const { data } = await loginWithPassword({ email: email.trim(), password })
      login(data.token, data.user)
      toast.success(`Welcome back, ${data.user.name}!`)
      navigate(from, { replace: true })
    } catch {
      toast.error('Invalid email or password')
      setPassword('')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <Field label="Email Address" error={errors.email}>
        <input
          type="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setErrors((err) => ({ ...err, email: '' })) }}
          onBlur={handleBlurEmail}
          placeholder="your@email.com"
          style={inputStyle(!!errors.email)}
        />
      </Field>

      <Field label="Password" error={errors.password}>
        <div style={{ position: 'relative' }}>
          <input
            type={showPw ? 'text' : 'password'}
            value={password}
            onChange={(e) => { setPassword(e.target.value); setErrors((err) => ({ ...err, password: '' })) }}
            onBlur={handleBlurPassword}
            placeholder="Enter your password"
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
        {loading ? 'Logging In...' : 'Login'}
      </button>

      <div style={{ textAlign: 'center', marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <p style={{ fontSize: '13px', color: '#6B6B6B', margin: 0 }}>
          Don't have an account?{' '}
          <button
            type="button"
            onClick={() => onSwitchTab('signup')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EE6B83', fontWeight: 500 }}
          >
            Sign Up →
          </button>
        </p>
        <p style={{ fontSize: '13px', color: '#6B6B6B', margin: 0 }}>
          <button
            type="button"
            onClick={() => onSwitchTab('otp')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EE6B83' }}
          >
            Login with OTP instead →
          </button>
        </p>
      </div>
    </form>
  )
}
