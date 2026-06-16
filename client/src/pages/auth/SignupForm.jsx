import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import { registerUser } from '../../utils/authApi'

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
      toast.success(`Welcome to ZYLARA JEWELLERY, ${data.user.name}!`)
      navigate(from, { replace: true })
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = (hasError) =>
    `w-full border-b ${hasError ? 'border-[#E8A0B0]' : 'border-[#242424]'} py-2.5 text-sm bg-transparent outline-none text-white focus:border-[#B8976A] transition-colors`

  return (
    <form onSubmit={handleSubmit} noValidate>
      <Field label="Full Name" error={errors.name}>
        <input
          type="text"
          value={form.name}
          onChange={set('name')}
          onBlur={handleBlur('name')}
          placeholder="Your full name"
          className={inputClass(!!errors.name)}
        />
      </Field>

      <Field label="Email Address" error={errors.email}>
        <input
          type="email"
          value={form.email}
          onChange={set('email')}
          onBlur={handleBlur('email')}
          placeholder="your@email.com"
          className={inputClass(!!errors.email)}
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
          className={inputClass(!!errors.phone)}
        />
      </Field>

      <Field label="Password" error={errors.password}>
        <div className="relative">
          <input
            type={showPw ? 'text' : 'password'}
            value={form.password}
            onChange={set('password')}
            onBlur={handleBlur('password')}
            placeholder="Minimum 6 characters"
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
        {loading ? 'Creating Account...' : 'Create Account'}
      </button>

      <p className="text-xs text-[#5C5C5C] text-center mt-5">
        Already have an account?{' '}
        <button
          type="button"
          onClick={() => onSwitchTab('login')}
          className="bg-transparent border-none cursor-pointer text-[#B8976A] font-semibold hover:text-[#E8A0B0] transition-colors"
        >
          Login →
        </button>
      </p>
    </form>
  )
}
