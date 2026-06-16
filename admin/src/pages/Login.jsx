import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../lib/api'
import toast from 'react-hot-toast'
import { Lock, Sparkles, Eye, EyeOff } from 'lucide-react'

export default function Login() {
  const [secretKey, setSecretKey] = useState('')
  const [loading, setLoading] = useState(false)
  const [showKey, setShowKey] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!secretKey.trim()) return
    setLoading(true)
    try {
      const { data } = await api.post('/auth/verify-otp', { otp: secretKey.trim() })
      if (data.user?.role !== 'admin') {
        toast.error('Access denied. Admin account required.')
        return
      }
      login(data.token, data.user)
      toast.success(`Welcome back, ${data.user.name || 'Admin'}!`)
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Verification failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#121212] flex flex-col justify-center items-center px-4 relative overflow-hidden select-none">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#C9A96E]/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Main card */}
      <div className="w-full max-w-md bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 sm:p-10 shadow-2xl relative z-10">
        
        {/* Brand header */}
        <div className="flex flex-col items-center mb-8">
          <div className="h-14 w-14 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center text-primary mb-4 shadow-lg animate-pulse-soft">
            <Sparkles size={28} className="stroke-[2]" />
          </div>
          <h1 className="font-serif text-3xl font-bold tracking-wide text-white">Zylora</h1>
          <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mt-1.5 leading-none">JEWELRY ADMIN PORTAL</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Developer Access Key</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500">
                <Lock size={16} />
              </span>
              <input
                type={showKey ? 'text' : 'password'}
                placeholder="Enter bypass key..."
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-11 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-white placeholder-gray-600 transition-all font-mono tracking-wider text-center"
                autoFocus
                required
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
              >
                {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-hover text-white py-3.5 rounded-xl text-sm font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 active:scale-[0.98] disabled:opacity-60 cursor-pointer"
          >
            {loading ? 'Verifying Credentials…' : 'Authenticate Securely'}
          </button>
        </form>

        {/* Footer info */}
        <p className="text-center text-[10px] text-gray-500 mt-8 leading-relaxed">
          Authorized development personnel only. Unauthorized access attempts are monitored and recorded.
        </p>
      </div>
    </div>
  )
}
