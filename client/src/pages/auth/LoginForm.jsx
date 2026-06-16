import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import { loginWithPassword } from '../../utils/authApi'

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function Field({ label, error, children }) {
  return (
    <div className="mb-5">
      <label className="block text-[11px] uppercase tracking-[0.06em] text-[#5C5C5C] mb-1.5">
        {label}
      </label>
      {children}
      {error && (
        <span className="text-xs text-[#E8A0B0] mt-1 block">{error}</span>
      )}
    </div>
  )
}

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

  const inputClass = (hasError) =>
    `w-full border-b ${hasError ? 'border-[#E8A0B0]' : 'border-[#242424]'} py-2.5 text-sm bg-transparent outline-none text-white focus:border-[#B8976A] transition-colors`

  return (
    <form onSubmit={handleSubmit} noValidate>
      <Field label="Email Address" error={errors.email}>
        <input
          type="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setErrors((err) => ({ ...err, email: '' })) }}
          onBlur={handleBlurEmail}
          placeholder="your@email.com"
          className={inputClass(!!errors.email)}
        />
      </Field>

      <Field label="Password" error={errors.password}>
        <div className="relative">
          <input
            type={showPw ? 'text' : 'password'}
            value={password}
            onChange={(e) => { setPassword(e.target.value); setErrors((err) => ({ ...err, password: '' })) }}
            onBlur={handleBlurPassword}
            placeholder="Enter your password"
            className={`${inputClass(!!errors.password)} pr-8`}
          />
          <button
            type="button"
            onClick={() => setShowPw((v) => !v)}
            className="absolute right-0 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-[#5C5C5C] hover:text-white transition-colors p-0"
          >
            {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </Field>

      <button
        type="submit"
        disabled={loading}
        className="w-full h-12 bg-gradient-to-r from-[#E8A0B0] to-[#D48A9A] text-white text-xs uppercase tracking-[0.1em] font-semibold border-none rounded-xl mt-6 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 transition-all hover:shadow-[0_8px_30px_rgba(238,107,131,0.3)]"
      >
        {loading && <Loader2 size={14} className="animate-spin" />}
        {loading ? 'Logging In...' : 'Login'}
      </button>

      <div className="text-center mt-5 flex flex-col gap-2">
        <p className="text-xs text-[#5C5C5C] m-0">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={() => onSwitchTab('signup')}
            className="bg-transparent border-none cursor-pointer text-[#B8976A] font-semibold hover:text-[#E8A0B0] transition-colors"
          >
            Sign Up →
          </button>
        </p>
        <p className="text-xs text-[#5C5C5C] m-0">
          <button
            type="button"
            onClick={() => onSwitchTab('otp')}
            className="bg-transparent border-none cursor-pointer text-[#B8976A] hover:text-[#E8A0B0] transition-colors"
          >
            Login with OTP instead →
          </button>
        </p>
      </div>
    </form>
  )
}
