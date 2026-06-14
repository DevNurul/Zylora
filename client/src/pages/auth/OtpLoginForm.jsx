import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import { sendOTP, verifyOTP } from '../../utils/authApi'

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

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

function OTPBoxes({ value, onChange, inputRefs }) {
  const handleKey = (index, e) => {
    if (e.key === 'Backspace') {
      if (!value[index] && index > 0) {
        const next = [...value]
        next[index - 1] = ''
        onChange(next)
        inputRefs.current[index - 1]?.focus()
      } else if (value[index]) {
        const next = [...value]
        next[index] = ''
        onChange(next)
      }
    }
  }

  const handleChange = (index, e) => {
    const char = e.target.value.replace(/\D/g, '').slice(-1)
    const next = [...value]
    next[index] = char
    onChange(next)
    if (char && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!pasted) return
    const next = Array(6).fill('')
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i]
    onChange(next)
    const focusIdx = Math.min(pasted.length, 5)
    inputRefs.current[focusIdx]?.focus()
  }

  return (
    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '24px' }}>
      {value.map((digit, i) => (
        <input
          key={i}
          ref={(el) => (inputRefs.current[i] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKey(i, e)}
          onPaste={handlePaste}
          style={{
            width: '40px',
            height: '48px',
            border: 'none',
            borderBottom: '2px solid #E5E5E5',
            textAlign: 'center',
            fontSize: '20px',
            fontWeight: 600,
            background: 'transparent',
            outline: 'none',
            color: '#0A0A0A',
          }}
        />
      ))}
    </div>
  )
}

export default function OtpLoginForm({ onSwitchTab }) {
  const { login } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()
  const from      = location.state?.from || '/'

  const [step, setStep]           = useState(1)
  const [email, setEmail]         = useState('')
  const [emailError, setEmailError] = useState('')
  const [otpDigits, setOtpDigits] = useState(Array(6).fill(''))
  const [loading, setLoading]     = useState(false)
  const [timer, setTimer]         = useState(0)

  const inputRefs = useRef([])
  const timerRef  = useRef(null)

  const startTimer = useCallback(() => {
    setTimer(30)
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current)
          return 0
        }
        return t - 1
      })
    }, 1000)
  }, [])

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current) }, [])

  const handleSendOTP = async (e) => {
    e.preventDefault()
    if (!emailRegex.test(email.trim())) {
      setEmailError('Enter a valid email address')
      return
    }
    setEmailError('')
    setLoading(true)
    try {
      await sendOTP({ email: email.trim() })
      toast.success(`OTP sent to ${email}`)
      setStep(2)
      startTimer()
      setTimeout(() => inputRefs.current[0]?.focus(), 100)
    } catch (err) {
      if (err.response?.status === 404) {
        toast.error('No account found. Please sign up.')
        onSwitchTab('signup')
      } else {
        toast.error(err.response?.data?.error || 'Could not send OTP')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setLoading(true)
    try {
      await sendOTP({ email: email.trim() })
      toast.success(`OTP sent to ${email}`)
      setOtpDigits(Array(6).fill(''))
      startTimer()
      setTimeout(() => inputRefs.current[0]?.focus(), 100)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not resend OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (e) => {
    e.preventDefault()
    const otp = otpDigits.join('')
    if (otp.length < 6) {
      toast.error('Enter the 6-digit OTP')
      return
    }
    setLoading(true)
    try {
      const { data } = await verifyOTP({ email: email.trim(), otp })
      login(data.token, data.user)
      toast.success(`Welcome back, ${data.user.name}!`)
      navigate(from, { replace: true })
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid OTP. Please try again.')
      setOtpDigits(Array(6).fill(''))
      setTimeout(() => inputRefs.current[0]?.focus(), 50)
    } finally {
      setLoading(false)
    }
  }

  if (step === 1) {
    return (
      <form onSubmit={handleSendOTP} noValidate>
        <p style={{ fontSize: '16px', fontWeight: 500, color: '#0A0A0A', margin: '0 0 8px' }}>
          Login with OTP
        </p>
        <p style={{ fontSize: '13px', color: '#6B6B6B', marginBottom: '24px' }}>
          We'll send a 6-digit OTP to your registered email address
        </p>

        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            fontSize: '11px',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: '#6B6B6B',
            marginBottom: '4px',
          }}>
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setEmailError('') }}
            placeholder="your@email.com"
            style={inputStyle(!!emailError)}
            autoFocus
          />
          {emailError && (
            <span style={{ fontSize: '12px', color: '#EF4444', marginTop: '4px', display: 'block' }}>
              {emailError}
            </span>
          )}
        </div>

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
          }}
        >
          {loading && <Loader2 size={14} className="animate-spin" />}
          {loading ? 'Sending...' : 'Send OTP'}
        </button>
      </form>
    )
  }

  return (
    <form onSubmit={handleVerify} noValidate>
      <p style={{ fontSize: '16px', fontWeight: 500, color: '#0A0A0A', margin: '0 0 6px' }}>
        Enter OTP
      </p>
      <p style={{ fontSize: '13px', color: '#6B6B6B', margin: '0 0 4px' }}>
        We sent a 6-digit code to
      </p>
      <p style={{ fontSize: '13px', color: '#0A0A0A', fontWeight: 500, marginBottom: '8px' }}>
        {email}
      </p>
      <button
        type="button"
        onClick={() => { setStep(1); setOtpDigits(Array(6).fill('')); setTimer(0) }}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: '12px',
          color: '#6B6B6B',
          padding: 0,
          marginBottom: '24px',
          textDecoration: 'underline',
        }}
      >
        Change email
      </button>

      <OTPBoxes value={otpDigits} onChange={setOtpDigits} inputRefs={inputRefs} />

      <div style={{ textAlign: 'center', marginBottom: '16px', fontSize: '13px' }}>
        {timer > 0 ? (
          <span style={{ color: '#6B6B6B' }}>
            Resend OTP in 0:{String(timer).padStart(2, '0')}
          </span>
        ) : (
          <button
            type="button"
            onClick={handleResend}
            disabled={loading}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#EE6B83',
              fontWeight: 500,
              fontSize: '13px',
              textDecoration: 'underline',
            }}
          >
            Resend OTP
          </button>
        )}
      </div>

      <button
        type="submit"
        disabled={loading || otpDigits.join('').length < 6}
        style={{
          width: '100%',
          height: '48px',
          background: '#EE6B83',
          color: '#fff',
          fontSize: '13px',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          border: 'none',
          cursor: (loading || otpDigits.join('').length < 6) ? 'not-allowed' : 'pointer',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          opacity: (loading || otpDigits.join('').length < 6) ? 0.7 : 1,
        }}
      >
        {loading && <Loader2 size={14} className="animate-spin" />}
        {loading ? 'Verifying...' : 'Verify & Login'}
      </button>
    </form>
  )
}
