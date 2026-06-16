import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../utils/api'

const FALLBACK = [
  {
    _id: 'fb1',
    image: { url: '/banner1.png' },
    subtitle: 'ZYLORA PRESTIGE',
    title: 'Crafted To\nShine *Forever*',
    description: 'Discover our fine 925 hallmarked sterling silver jewellery and premium lab-grown diamond collections.',
    ctaText: 'SHOP NOW',
    ctaLink: '/products',
  },
  {
    _id: 'fb2',
    image: { url: '/banner2.png' },
    subtitle: 'THE ENGAGEMENT EDIT',
    title: 'Handcrafted Luxury,\nFor Every *Moment*',
    description: 'Explore our statement rings, eternity bands, and custom-cut luxury bracelets designed to last a lifetime.',
    ctaText: 'EXPLORE RINGS',
    ctaLink: '/products?category=Rings',
  },
  {
    _id: 'fb3',
    image: { url: '/banner3.png' },
    subtitle: 'CURATED GIFT SETS',
    title: 'The Art of Giving,\nPerfected by *Us*',
    description: 'Surprise your loved ones with our signature luxury gift bundles, complete with premium gold-stamped packaging.',
    ctaText: 'EXPLORE COLLECTIONS',
    ctaLink: '/products?category=Sets',
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
    }, 7000)
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
                <span key={pi} className="italic font-serif font-light text-[#C9A86A] tracking-normal">
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
    <div className="relative w-full min-h-[380px] md:h-[480px] bg-[#0D0D0D] overflow-hidden select-none">
      {/* ── Slide Container (Fade transitions) ───────────────────────────────── */}
      <div className="relative w-full h-full min-h-[380px] md:h-[480px]">
        {real.map((item, idx) => {
          const isActive = idx === currentIndex
          return (
            <div
              key={item._id || idx}
              onClick={() => item.ctaLink && navigate(item.ctaLink)}
              className={`absolute inset-0 w-full h-full transition-all duration-1000 ease-in-out ${
                item.ctaLink ? 'cursor-pointer' : ''
              } ${
                isActive ? 'opacity-100 scale-100 pointer-events-auto z-10' : 'opacity-0 scale-[1.03] pointer-events-none z-0'
              }`}
            >
              {/* Image background */}
              <img
                src={item.image?.url}
                alt={item.title || 'Banner'}
                draggable={false}
                className="w-full h-full object-cover object-center"
              />
            </div>
          )
        })}
      </div>

      {/* ── Slide Dots Indicators ────────────────────────────────────────────── */}
      {real.length > 1 && (
        <div className="absolute bottom-8 right-6 md:right-24 z-20 flex gap-3">
          {real.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`w-2 h-2 rounded-full transition-all duration-300 cursor-pointer ${
                idx === currentIndex
                  ? 'bg-[#EE6B83] scale-125'
                  : 'bg-white/20 hover:bg-white/50'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
