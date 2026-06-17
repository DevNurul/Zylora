import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const WHATSAPP_NUMBER =
  typeof process !== 'undefined'
    ? process.env?.REACT_APP_WHATSAPP_NUMBER
    : undefined
  || import.meta.env.VITE_WHATSAPP_NUMBER

const WHATSAPP_MESSAGE = "Hi ZYLARA JEWELLERY! I need help with my order."

const WhatsAppButton = () => {
  const location = useLocation()
  const [visible, setVisible] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)

  const hiddenRoutes = ['/checkout']
  const isHidden = hiddenRoutes.includes(location.pathname)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 2000)
    return () => clearTimeout(t)
  }, [])

  const handleClick = () => {
    const phone = WHATSAPP_NUMBER?.replace(/[^0-9]/g, '')
    const message = encodeURIComponent(WHATSAPP_MESSAGE)
    const url = `https://wa.me/${phone}?text=${message}`
    window.open(url, '_blank')
  }

  if (isHidden) return null

  return (
    <div
      className="whatsapp-float"
      style={{
        position: 'fixed',
        zIndex: 999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: '8px',
        opacity: visible ? 1 : 0,
        transform: visible
          ? 'translateY(0) scale(1)'
          : 'translateY(20px) scale(0.8)',
        transition:
          'opacity 400ms ease, transform 400ms cubic-bezier(0.16,1,0.3,1)'
      }}>

      {showTooltip && (
        <div style={{
          background: '#1A1A1A',
          color: 'white',
          fontSize: '11px',
          padding: '8px 14px',
          whiteSpace: 'nowrap',
          letterSpacing: '0.04em',
          pointerEvents: 'none',
          opacity: 1,
          transition: 'opacity 200ms ease',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          borderRadius: '8px',
          fontWeight: 500,
        }}>
          Chat with us
        </div>
      )}

      <button
        onClick={handleClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        aria-label="Chat with us on WhatsApp"
        className="whatsapp-btn"
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: '#EE6B83',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(238,107,131,0.4)',
          position: 'relative',
          transition: 'transform 200ms ease, box-shadow 200ms ease'
        }}
        onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.92)' }}
        onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)' }}>

        <span style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          backgroundColor: '#EE6B83',
          opacity: 0.4,
          animation: 'whatsappPulse 2s ease-out infinite'
        }} />

        <svg
          width="26"
          height="26"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ position: 'relative', zIndex: 1 }}>
          <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
          <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1zm5 0a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1z" />
        </svg>
      </button>
    </div>
  )
}

export default WhatsAppButton
