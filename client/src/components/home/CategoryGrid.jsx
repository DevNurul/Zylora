import { useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const LAUNCH_CATEGORIES = [
  { name: 'Rings', path: '/products?category=Rings', image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=500&auto=format&fit=crop' },
  { name: 'Bracelets', path: '/products?category=Bracelets', image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=500&auto=format&fit=crop' },
  { name: 'Anklets', path: '/products?category=Anklets', image: 'https://images.unsplash.com/photo-1543294001-f7cbfe92237e?q=80&w=500&auto=format&fit=crop' },
  { name: 'Earrings', path: '/products?category=Earrings', image: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?q=80&w=500&auto=format&fit=crop' },
  { name: 'Pendants', path: '/products?category=Pendants', image: 'https://images.unsplash.com/photo-1611107683227-e9060eccd846?q=80&w=500&auto=format&fit=crop' },
  { name: 'Mens', path: '/products?category=Mens', image: 'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?q=80&w=500&auto=format&fit=crop' },
  { name: 'Perfumes', path: '/products?category=Perfumes', image: 'https://images.unsplash.com/photo-1619994403073-2cec844b8e63?q=80&w=500&auto=format&fit=crop' },
  { name: 'Sets', path: '/products?category=Sets', image: 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?q=80&w=500&auto=format&fit=crop' },
  { name: 'Pearls', path: '/products?category=Pearls', image: 'https://images.unsplash.com/photo-1561828995-aa79a2db86dd?q=80&w=500&auto=format&fit=crop' },
]

export default function CategoryGrid() {
  const navigate = useNavigate()
  const scrollerRef = useRef(null)

  const scrollByCard = (direction) => {
    const el = scrollerRef.current
    if (!el) return

    const card = el.querySelector('[data-category-card]')
    const amount = card ? card.getBoundingClientRect().width + 32 : 260
    el.scrollBy({ left: direction * amount * 2, behavior: 'smooth' })
  }

  return (
    <section className="bg-[#0A0A0A] overflow-hidden">
      {/* Section Header */}
      <div className="px-4 md:px-8 lg:px-16 py-10 md:py-16">
        <div className="flex flex-col items-center text-center mb-12">
          <p className="text-[10px] font-medium text-[#B8976A] tracking-[0.24em] uppercase mb-3">EXPLORE BY CATEGORY</p>
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-white">Our Collections</h2>
          <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-[#B8976A] to-transparent mt-5" />
        </div>

        <div className="relative">
          <button
            type="button"
            aria-label="Previous categories"
            onClick={() => scrollByCard(-1)}
            className="absolute left-0 top-1/2 z-20 w-12 h-12 -translate-y-1/2 bg-[#141414] border border-[#242424] rounded-full flex items-center justify-center text-[#9A9A9A] hover:text-white hover:border-[#B8976A] transition-all shadow-lg hidden md:flex"
          >
            <ChevronLeft size={20} />
          </button>

          <div
            ref={scrollerRef}
            className="no-scrollbar flex snap-x gap-6 overflow-x-auto scroll-smooth px-2 pb-4"
          >
            {LAUNCH_CATEGORIES.map((cat) => (
              <button
                key={cat.name}
                type="button"
                data-category-card
                onClick={() => navigate(cat.path)}
                className="group w-[160px] flex-none snap-start text-center sm:w-[180px] md:w-[200px]"
              >
                <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-[#141414] border border-[#242424] transition-all duration-500 group-hover:border-[#B8976A]/50 group-hover:shadow-[0_0_30px_rgba(201,168,106,0.15)]">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
                  <span className="absolute bottom-4 left-1/2 -translate-x-1/2 font-serif text-lg md:text-xl text-white tracking-wide whitespace-nowrap">
                    {cat.name}
                  </span>
                </div>
              </button>
            ))}
          </div>

          <button
            type="button"
            aria-label="Next categories"
            onClick={() => scrollByCard(1)}
            className="absolute right-0 top-1/2 z-20 w-12 h-12 -translate-y-1/2 bg-[#141414] border border-[#242424] rounded-full flex items-center justify-center text-[#9A9A9A] hover:text-white hover:border-[#B8976A] transition-all shadow-lg hidden md:flex"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </section>
  )
}
