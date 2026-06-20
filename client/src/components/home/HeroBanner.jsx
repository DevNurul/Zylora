import { useEffect, useState } from 'react'
import api from '../../utils/api'

const FALLBACK = [
  {
    _id: 'fb1',
    image: { url: '/banner1.png' },
  },
  {
    _id: 'fb2',
    image: { url: '/banner2.png' },
  },
  {
    _id: 'fb3',
    image: { url: '/banner3.png' },
  },
]

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth >= 768)
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)')
    const handler = (e) => setIsDesktop(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])
  return isDesktop
}

export default function HeroBanner() {
  const [banners, setBanners] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const isDesktop = useIsDesktop()

  useEffect(() => {
    api.get('/banners', { params: { placement: 'hero' } })
      .then(({ data }) => { if (data.banners?.length) setBanners(data.banners) })
      .catch(() => {})
  }, [])

  const real = banners.length ? banners : FALLBACK

  useEffect(() => {
    if (real.length <= 1) return
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % real.length)
    }, 7000)
    return () => clearInterval(interval)
  }, [real.length])

  const bannerMaxHeight = isDesktop ? 'min(750px, 100vh)' : 'min(400px, 60vh)'

  return (
    <div className="relative w-full bg-[#0A0A0A] overflow-hidden select-none">
      <div className="relative w-full">
        {real.map((item, idx) => {
          const isActive = idx === currentIndex
          return (
            <div
              key={item._id || idx}
              className={`w-full transition-all duration-[1200ms] ease-in-out ${
                isActive ? 'opacity-100 scale-100 relative z-10' : 'opacity-0 scale-[1.02] absolute inset-0 z-0'
              }`}
            >
              <img
                src={item.image?.url}
                alt="Banner"
                draggable={false}
                className="w-full block"
                style={{ maxHeight: bannerMaxHeight, objectFit: 'cover', objectPosition: 'center' }}
              />
            </div>
          )
        })}
      </div>

      {real.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-3">
          {real.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className="w-8 h-8 flex items-center justify-center cursor-pointer"
            >
              <span className={`block h-[2px] rounded-full transition-all duration-500 ${
                idx === currentIndex
                  ? 'bg-[#B8976A] w-6'
                  : 'bg-white/20 hover:bg-white/40 w-4'
              }`} />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
