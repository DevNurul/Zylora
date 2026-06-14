import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../utils/api'

const FALLBACK = [
  {
    _id: 'fb1',
    image: { url: '/banner1.png' },
    subtitle: 'NEW COLLECTION',
    title: 'Timeless Elegance,\nMade for *You*',
    description: 'Discover our fine 925 silver jewellery crafted to shine every day.',
    ctaText: 'SHOP NEW ARRIVALS',
    ctaLink: '/products',
  },
  {
    _id: 'fb2',
    image: { url: '/banner2.png' },
    subtitle: 'ESSENTIAL RINGS',
    title: 'Handcrafted Luxury,\nFor Every *Moment*',
    description: 'Explore our collection of sterling silver rings and bracelets made to last.',
    ctaText: 'EXPLORE RINGS',
    ctaLink: '/products?category=Accessories',
  },
  {
    _id: 'fb3',
    image: { url: '/banner3.png' },
    subtitle: 'CURATED GIFTING',
    title: 'The Art of Giving,\nPerfected by *Us*',
    description: 'Find the perfect token of appreciation from our luxury gift sets.',
    ctaText: 'SHOP THE GIFT GUIDE',
    ctaLink: '/products',
  },
]

export default function HeroBanner() {
  const navigate = useNavigate()
  const [banners, setBanners] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)

  /* ── fetch banners ───────────────────────────────────────────────────────── */
  useEffect(() => {
    api.get('/banners')
      .then(({ data }) => { if (data.banners?.length) setBanners(data.banners) })
      .catch(() => {})
  }, [])

  const real = banners.length ? banners : FALLBACK

  /* ── auto play slider ────────────────────────────────────────────────────── */
  useEffect(() => {
    if (real.length <= 1) return
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % real.length)
    }, 6000)
    return () => clearInterval(interval)
  }, [real.length])

  /* ── title parser helper ─────────────────────────────────────────────────── */
  const renderTitle = (title) => {
    if (!title) return null
    return title.split('\n').map((line, li) => {
      const parts = line.split(/(\*[^*]+\*)/g)
      return (
        <span key={li} className="block leading-tight">
          {parts.map((part, pi) => {
            if (part.startsWith('*') && part.endsWith('*')) {
              return (
                <span key={pi} className="italic font-display font-light text-[#1a1a1a] tracking-normal">
                  {part.slice(1, -1)}
                </span>
              )
            }
            return part
          })}
        </span>
      )
    })
  }

  return (
    <div className="relative w-full h-[450px] sm:h-[500px] md:h-[580px] lg:h-[640px] bg-[#FCD4DB] overflow-hidden select-none">
      {/* ── Slide Container (Fade transitions) ───────────────────────────────── */}
      <div className="relative w-full h-full">
        {real.map((item, idx) => {
          const isActive = idx === currentIndex
          return (
            <div
              key={item._id || idx}
              className={`absolute inset-0 w-full h-full flex flex-col md:flex-row transition-opacity duration-1000 ease-in-out ${
                isActive ? 'opacity-100 pointer-events-auto z-10' : 'opacity-0 pointer-events-none z-0'
              }`}
            >
              {/* Left Text Column */}
              <div className="relative z-10 w-full md:w-[45%] lg:w-[42%] h-full flex flex-col justify-center bg-gradient-to-r from-[#FCD4DB] via-[#FCD4DB]/95 to-transparent md:from-transparent md:bg-[#FCD4DB] px-6 sm:px-12 md:px-16 lg:px-20 py-12 md:py-0 text-left">
                {/* Sparkle Subtitle */}
                {item.subtitle && (
                  <p className="flex items-center gap-1.5 uppercase font-medium text-[#6B6B6B] mb-4 tracking-[0.2em] text-[10px] sm:text-[11px]">
                    <span className="text-xs text-[#EE6B83]">✦</span>
                    {item.subtitle.replace(/^✦\s*/, '')}
                  </p>
                )}

                {/* Elegant Title */}
                {item.title && (
                  <h1 className="font-display text-[2.2rem] sm:text-[2.8rem] md:text-[3.2rem] lg:text-[3.8rem] text-[#1a1a1a] font-normal leading-[1.1] mb-5 tracking-tight">
                    {renderTitle(item.title)}
                  </h1>
                )}

                {/* Description */}
                {item.description && (
                  <p className="text-[13px] sm:text-[14px] text-[#555] font-light leading-relaxed mb-7 max-w-[360px]">
                    {item.description}
                  </p>
                )}

                {/* Call to Action Button */}
                {item.ctaText && item.ctaLink && (
                  <div>
                    <button
                      onClick={() => navigate(item.ctaLink)}
                      className="bg-[#EE6B83] text-white hover:bg-[#D9506A] uppercase tracking-[0.18em] text-[10px] sm:text-[11px] font-bold py-3.5 px-8 transition-all duration-300 hover:shadow-lg active:scale-98 rounded-lg"
                    >
                      {item.ctaText}
                    </button>
                  </div>
                )}
              </div>

              {/* Right Image Column */}
              <div className="absolute md:relative inset-0 md:inset-auto w-full md:w-[55%] lg:w-[58%] h-full">
                <img
                  src={item.image?.url}
                  alt={item.title || 'Banner'}
                  draggable={false}
                  className="w-full h-full object-cover object-center md:object-right-top"
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Slide Dots Indicators ────────────────────────────────────────────── */}
      {real.length > 1 && (
        <div className="absolute bottom-8 left-6 sm:left-12 md:left-16 lg:left-20 z-20 flex gap-2.5">
          {real.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                idx === currentIndex
                  ? 'bg-[#EE6B83] scale-125'
                  : 'bg-[#EE6B83]/25 hover:bg-[#EE6B83]/55'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
