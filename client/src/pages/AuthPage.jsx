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
    <div style={{
      minHeight: '100vh',
      background: '#FCD4DB',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
      padding: '0 16px 40px',
    }}>
      <div style={{
        background: '#fff',
        width: '100%',
        maxWidth: '448px',
        marginTop: '64px',
        padding: '40px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
      }}>
        {/* Brand header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            fontFamily: '"Playfair Display", Georgia, serif',
            fontSize: '28px',
            letterSpacing: '0.3em',
            color: '#0A0A0A',
            marginBottom: '8px',
          }}>
            LUXORA
          </div>
          <div style={{
            fontSize: '12px',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: '#6B6B6B',
          }}>
            JEWELLERY
          </div>
        </div>

        {/* Tab switcher */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid #E5E5E5',
          marginBottom: '32px',
        }}>
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                flex: 1,
                background: 'none',
                border: 'none',
                borderBottom: activeTab === tab.key ? '2px solid #EE6B83' : '2px solid transparent',
                padding: '10px 4px',
                fontSize: '13px',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                fontWeight: activeTab === tab.key ? 500 : 400,
                color: activeTab === tab.key ? '#EE6B83' : '#6B6B6B',
                cursor: 'pointer',
                marginBottom: '-1px',
                transition: 'color 200ms',
                whiteSpace: 'nowrap',
              }}
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
  )
}
