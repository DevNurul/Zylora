import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import SignupForm from './auth/SignupForm'
import LoginForm from './auth/LoginForm'
import OtpLoginForm from './auth/OtpLoginForm'

const TABS = [
  { key: 'signup', label: 'Sign Up' },
  { key: 'login',  label: 'Login' },
  { key: 'otp',    label: 'Login with OTP' },
]

export default function AuthPage() {
  const { isAuthenticated } = useAuth()
  const [activeTab, setActiveTab] = useState('signup')

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-start justify-center px-4 py-16">
      <div className="w-full max-w-md">
        {/* Brand header */}
        <div className="text-center mb-10">
          <div className="flex flex-col items-center select-none mb-6">
            <span className="font-serif text-[2rem] tracking-[0.2em] font-light leading-none text-white">ZYLARA</span>
            <span className="text-[8px] uppercase tracking-[0.35em] text-[#B8976A] mt-2 leading-none pl-[0.35em]">JEWELLERY</span>
          </div>
          <div className="w-12 h-[1px] bg-gradient-to-r from-transparent via-[#B8976A] to-transparent mx-auto" />
        </div>

        {/* Card */}
        <div className="bg-[#141414] border border-[#242424] rounded-2xl p-6 md:p-8 shadow-[0_10px_40px_rgba(0,0,0,0.3)]">
          {/* Tab switcher */}
          <div className="flex border-b border-[#242424] mb-8">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 py-3 text-xs uppercase tracking-[0.08em] font-medium transition-all duration-300 border-b-2 -mb-[1px] ${
                  activeTab === tab.key
                    ? 'text-[#B8976A] border-[#B8976A]'
                    : 'text-[#5C5C5C] border-transparent hover:text-[#9A9A9A]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Active form */}
          {activeTab === 'signup' && <SignupForm onSwitchTab={setActiveTab} />}
          {activeTab === 'login'  && <LoginForm  onSwitchTab={setActiveTab} />}
          {activeTab === 'otp'    && <OtpLoginForm onSwitchTab={setActiveTab} />}
        </div>
      </div>
    </div>
  )
}
