import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import { sendOTP, verifyOTP } from '../../utils/authApi'

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

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
    <div className="flex gap-3 justify-center mb-6">
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
          className="w-10 h-12 border-b-2 border-[#242424] text-center text-xl font-semibold bg-transparent outline-none text-white focus:border-[#B8976A] transition-colors"
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

  const inputClass = (hasError) =>
    `w-full border-b ${hasError ? 'border-[#E8A0B0]' : 'border-[#242424]'} py-2.5 text-sm bg-transparent outline-none text-white focus:border-[#B8976A] transition-colors`

  if (step === 1) {
    return (
      <form onSubmit={handleSendOTP} noValidate>
        <p className="text-base font-medium text-white mb-2">
          Login with OTP
        </p>
        <p className="text-xs text-[#5C5C5C] mb-6">
          We'll send a 6-digit OTP to your registered email address
        </p>

        <div className="mb-5">
          <label className="block text-[11px] uppercase tracking-[0.06em] text-[#5C5C5C] mb-1.5">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setEmailError('') }}
            placeholder="your@email.com"
            className={inputClass(!!emailError)}
            autoFocus
          />
          {emailError && (
            <span className="text-xs text-[#E8A0B0] mt-1 block">{emailError}</span>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 bg-gradient-to-r from-[#E8A0B0] to-[#D48A9A] text-white text-xs uppercase tracking-[0.1em] font-semibold border-none rounded-xl mt-6 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 transition-all hover:shadow-[0_8px_30px_rgba(238,107,131,0.3)]"
        >
          {loading && <Loader2 size={14} className="animate-spin" />}
          {loading ? 'Sending...' : 'Send OTP'}
        </button>
      </form>
    )
  }

  return (
    <form onSubmit={handleVerify} noValidate>
      <p className="text-base font-medium text-white mb-1">
        Enter OTP
      </p>
      <p className="text-xs text-[#5C5C5C] mb-1">
        We sent a 6-digit code to
      </p>
      <p className="text-xs text-white font-medium mb-2">
        {email}
      </p>
      <button
        type="button"
        onClick={() => { setStep(1); setOtpDigits(Array(6).fill('')); setTimer(0) }}
        className="bg-transparent border-none cursor-pointer text-[11px] text-[#5C5C5C] p-0 mb-6 underline hover:text-white transition-colors"
      >
        Change email
      </button>

      <OTPBoxes value={otpDigits} onChange={setOtpDigits} inputRefs={inputRefs} />

      <div className="text-center mb-4 text-xs">
        {timer > 0 ? (
          <span className="text-[#5C5C5C]">
            Resend OTP in 0:{String(timer).padStart(2, '0')}
          </span>
        ) : (
          <button
            type="button"
            onClick={handleResend}
            disabled={loading}
            className="bg-transparent border-none cursor-pointer text-[#B8976A] font-semibold text-xs underline hover:text-[#E8A0B0] transition-colors"
          >
            Resend OTP
          </button>
        )}
      </div>

      <button
        type="submit"
        disabled={loading || otpDigits.join('').length < 6}
        className="w-full h-12 bg-gradient-to-r from-[#E8A0B0] to-[#D48A9A] text-white text-xs uppercase tracking-[0.1em] font-semibold border-none rounded-xl cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 transition-all hover:shadow-[0_8px_30px_rgba(238,107,131,0.3)]"
      >
        {loading && <Loader2 size={14} className="animate-spin" />}
        {loading ? 'Verifying...' : 'Verify & Login'}
      </button>
    </form>
  )
}
