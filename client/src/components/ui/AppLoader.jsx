import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'

const LuxoraLogo = () => (
  <svg
    width="100"
    height="100"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ overflow: 'visible' }}>
    <path
      d="M12 2L3 9l9 13 9-13-9-7z"
      stroke="white"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="diamond-draw"
      style={{
        strokeDasharray: 100,
        strokeDashoffset: 100,
        animation: 'drawDiamond 1.8s ease forwards'
      }}
    />
    <path
      d="M3 9h18M12 2v20M12 2L3 9l9 3 9-3-9-7zm0 13l-9-6 9 6 9-6-9 6z"
      stroke="rgba(255,255,255,0.3)"
      strokeWidth="0.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="diamond-facet"
      style={{
        strokeDasharray: 120,
        strokeDashoffset: 120,
        animation: 'drawFacet 2s ease forwards 0.3s'
      }}
    />
    <style>{`
      @keyframes drawDiamond {
        to { strokeDashoffset: 0; }
      }
      @keyframes drawFacet {
        to { strokeDashoffset: 0; }
      }
    `}</style>
  </svg>
)

const AppLoader = ({ onComplete }) => {
  const { loading: authLoading } = useAuth()
  const [hiding, setHiding] = useState(false)
  const [showBrand, setShowBrand] = useState(false)
  const [lineWidth, setLineWidth] = useState(false)
  const [showDots, setShowDots] = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setShowBrand(true), 1200)
    const t2 = setTimeout(() => setLineWidth(true), 1400)
    const t3 = setTimeout(() => setShowDots(true), 1900)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
    }
  }, [])

  useEffect(() => {
    if (authLoading) return
    const minTime = 2600
    const elapsed = Date.now() - window.__amrinLoadStart
    const remaining = Math.max(0, minTime - elapsed)
    const t = setTimeout(() => {
      setHiding(true)
      setTimeout(onComplete, 500)
    }, remaining)
    return () => clearTimeout(t)
  }, [authLoading, onComplete])

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: '#0A0A0A',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '24px',
        transition: 'opacity 500ms ease',
        opacity: hiding ? 0 : 1,
        pointerEvents: hiding ? 'none' : 'all',
      }}>

      {/* Logo */}
      <LuxoraLogo />

      {/* Brand name + pink line + tagline */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          opacity: showBrand ? 1 : 0,
          transform: showBrand ? 'translateY(0)' : 'translateY(8px)',
          transition: 'opacity 600ms ease, transform 600ms ease',
        }}>

        <span
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: '22px',
            fontWeight: 400,
            letterSpacing: '10px',
            color: 'white',
            textIndent: '10px',
          }}>
          LUXORA
        </span>

        {/* Animated pink line */}
        <div
          style={{
            height: '1px',
            backgroundColor: '#EE6B83',
            width: lineWidth ? '80px' : '0px',
            transition: 'width 600ms ease-out',
          }}
        />

        <span
          style={{
            fontFamily: 'Arial, sans-serif',
            fontSize: '9px',
            letterSpacing: '3px',
            color: 'rgba(255,255,255,0.3)',
            textTransform: 'uppercase',
          }}>
          JEWELLERY
        </span>
      </div>

      {/* Pulsing pink dots */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          opacity: showDots ? 1 : 0,
          transition: 'opacity 400ms ease',
        }}>
        {[0, 1, 2].map(i => (
          <div
            key={i}
            style={{
              width: '5px',
              height: '5px',
              borderRadius: '50%',
              backgroundColor: '#EE6B83',
              animation: 'amrinPulse 1.3s ease-in-out infinite',
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </div>
    </div>
  )
}

export default AppLoader
