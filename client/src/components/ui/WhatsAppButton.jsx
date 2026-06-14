import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const WHATSAPP_NUMBER =
  typeof process !== 'undefined'
    ? process.env?.REACT_APP_WHATSAPP_NUMBER
    : undefined
  || import.meta.env.VITE_WHATSAPP_NUMBER

const WHATSAPP_MESSAGE = "Hi LUXORA JEWELLERY! I need help with my order."

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
          backgroundColor: '#EE6B83',
          color: 'white',
          fontSize: '12px',
          padding: '6px 12px',
          whiteSpace: 'nowrap',
          letterSpacing: '0.04em',
          pointerEvents: 'none',
          opacity: 1,
          transition: 'opacity 200ms ease',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          borderRadius: '4px'
        }}>
          Chat with us on WhatsApp
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
          backgroundColor: '#25D366',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 16px rgba(37,211,102,0.4)',
          position: 'relative',
          transition: 'transform 200ms ease, box-shadow 200ms ease'
        }}
        onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.92)' }}
        onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)' }}>

        <span style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          backgroundColor: '#25D366',
          opacity: 0.4,
          animation: 'whatsappPulse 2s ease-out infinite'
        }} />

        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="white"
          style={{ position: 'relative', zIndex: 1 }}>
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </button>
    </div>
  )
}

export default WhatsAppButton
