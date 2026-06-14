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
    <div className="relative w-full aspect-[2/1] md:aspect-[1920/600] bg-white overflow-hidden select-none">
      {/* ── Slide Container (Fade transitions) ───────────────────────────────── */}
      <div className="relative w-full h-full">
        {real.map((item, idx) => {
          const isActive = idx === currentIndex
          return (
            <div
              key={item._id || idx}
              onClick={() => item.ctaLink && navigate(item.ctaLink)}
              className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
                item.ctaLink ? 'cursor-pointer' : ''
              } ${
                isActive ? 'opacity-100 pointer-events-auto z-10' : 'opacity-0 pointer-events-none z-0'
              }`}
            >
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
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2.5">
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
