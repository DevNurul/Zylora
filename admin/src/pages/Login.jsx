import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../lib/api'
import toast from 'react-hot-toast'
import { Lock } from 'lucide-react'

export default function Login() {
  const [secretKey, setSecretKey] = useState('')
  const [loading,   setLoading]   = useState(false)
  const { login } = useAuth()
  const navigate  = useNavigate()

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
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Verification failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#111] flex items-center justify-center overflow-y-auto py-8">
      <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-10 w-full max-w-sm mx-4">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-[#C9A96E]/10 rounded-2xl">
            <Lock size={28} className="text-[#C9A96E]" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-center text-gray-900">AMRIN Admin</h1>
        <p className="text-center text-gray-500 text-sm mt-1 mb-8">
          Enter the secret key to sign in
        </p>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="password"
            placeholder="Secret Key"
            value={secretKey}
            onChange={(e) => setSecretKey(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A96E] focus:border-transparent text-center"
            autoFocus
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#C9A96E] text-white py-3 rounded-lg text-sm font-semibold hover:bg-[#b8935a] transition-colors disabled:opacity-60"
          >
            {loading ? 'Verifying…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}
