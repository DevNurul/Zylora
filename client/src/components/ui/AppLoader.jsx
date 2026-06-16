import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'

const DiamondLogo = () => (
  <svg
    width="80"
    height="80"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ overflow: 'visible' }}>
    <path
      d="M12 2L3 9l9 13 9-13-9-7z"
      stroke="url(#goldGradient)"
      strokeWidth="0.8"
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
      stroke="url(#goldGradientLight)"
      strokeWidth="0.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="diamond-facet"
      style={{
        strokeDasharray: 120,
        strokeDashoffset: 120,
        animation: 'drawFacet 2s ease forwards 0.3s'
      }}
    />
    <defs>
      <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#B8976A" />
        <stop offset="50%" stopColor="#E8A0B0" />
        <stop offset="100%" stopColor="#B8976A" />
      </linearGradient>
      <linearGradient id="goldGradientLight" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="rgba(201,168,106,0.4)" />
        <stop offset="100%" stopColor="rgba(238,107,131,0.2)" />
      </linearGradient>
    </defs>
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
      className="fixed inset-0 z-[9999] bg-[#0A0A0A] flex flex-col items-center justify-center"
      style={{
        transition: 'opacity 500ms ease',
        opacity: hiding ? 0 : 1,
        pointerEvents: hiding ? 'none' : 'all',
      }}>

      {/* Subtle background glow */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(201,168,106,0.08) 0%, transparent 70%)',
        }}
      />

      {/* Logo */}
      <DiamondLogo />

      {/* Brand name + gold line + tagline */}
      <div
        className="flex flex-col items-center"
        style={{
          gap: '8px',
          opacity: showBrand ? 1 : 0,
          transform: showBrand ? 'translateY(0)' : 'translateY(8px)',
          transition: 'opacity 600ms ease, transform 600ms ease',
        }}>

        <span
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: '24px',
            fontWeight: 400,
            letterSpacing: '12px',
            color: 'white',
            textIndent: '12px',
          }}>
          ZYLARA
        </span>

        {/* Animated gold line */}
        <div
          style={{
            height: '1px',
            background: 'linear-gradient(90deg, transparent, #B8976A, #E8A0B0, #B8976A, transparent)',
            width: lineWidth ? '100px' : '0px',
            transition: 'width 600ms ease-out',
          }}
        />

        <span
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '9px',
            letterSpacing: '4px',
            color: 'rgba(201,168,106,0.6)',
            textTransform: 'uppercase',
          }}>
          JEWELLERY
        </span>
      </div>

      {/* Pulsing dots */}
      <div
        className="flex"
        style={{
          gap: '8px',
          opacity: showDots ? 1 : 0,
          transition: 'opacity 400ms ease',
        }}>
        {[0, 1, 2].map(i => (
          <div
            key={i}
            style={{
              width: '4px',
              height: '4px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #B8976A, #E8A0B0)',
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
