import { useRef } from 'react'
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'
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
    const amount = card ? card.getBoundingClientRect().width + 42 : 260
    el.scrollBy({ left: direction * amount * 2, behavior: 'smooth' })
  }

  return (
    <section className="bg-[#F7ECE5] text-black overflow-hidden border-y border-[#E1D0C5]">
      <div className="bg-[#FFF4ED] px-4 py-3 md:py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-4">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black uppercase tracking-[0.08em] leading-none text-[#8F2930]">
            New Launch
          </h2>
          <button
            type="button"
            onClick={() => navigate('/products?filter=new')}
            className="hidden sm:inline-flex h-9 items-center gap-2 rounded-lg bg-[#BC7D82] px-6 text-sm font-bold text-white shadow-[0_2px_6px_rgba(143,41,48,0.25)] transition-all hover:bg-[#A9676D] active:scale-[0.98]"
          >
            Explore
            <span className="grid h-5 w-5 place-items-center rounded-full bg-white text-[#A45F66]">
              <ChevronRight size={15} strokeWidth={3} />
            </span>
          </button>
        </div>
      </div>

      <div className="relative px-4 py-3 md:px-6">
        <button
          type="button"
          aria-label="Previous categories"
          onClick={() => scrollByCard(-1)}
          className="absolute left-3 top-[42%] z-20 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/95 text-[#8D7F78] shadow-[0_8px_24px_rgba(77,46,35,0.16)] transition hover:text-[#8F2930] md:h-14 md:w-14"
        >
          <ChevronLeft size={22} />
        </button>

        <div
          ref={scrollerRef}
          className="no-scrollbar flex snap-x gap-7 overflow-x-auto scroll-smooth px-3 pb-3 md:gap-10"
        >
          {LAUNCH_CATEGORIES.map((cat) => (
            <button
              key={cat.name}
              type="button"
              data-category-card
              onClick={() => navigate(cat.path)}
              className="group w-[142px] flex-none snap-start text-center sm:w-[172px] md:w-[180px]"
            >
              <div className="relative aspect-square overflow-hidden rounded-[30px] bg-[#E7D6CA] shadow-[0_2px_0_rgba(255,255,255,0.55)_inset] ring-1 ring-black/5 transition duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_14px_30px_rgba(77,46,35,0.18)]">
                <img
                  src={cat.image}
                  alt={cat.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <span className="absolute left-1/2 top-0 inline-flex h-8 min-w-[92px] -translate-x-1/2 items-center justify-center gap-1 rounded-b-2xl bg-[#BE7F84] px-4 text-sm font-bold text-white">
                  <Sparkles size={13} fill="currentColor" />
                  New
                </span>
              </div>
              <span className="mt-3 block truncate text-2xl font-medium leading-tight tracking-normal text-black md:text-[28px]">
                {cat.name}
              </span>
            </button>
          ))}
        </div>

        <button
          type="button"
          aria-label="Next categories"
          onClick={() => scrollByCard(1)}
          className="absolute right-3 top-[42%] z-20 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/95 text-[#8D7F78] shadow-[0_8px_24px_rgba(77,46,35,0.16)] transition hover:text-[#8F2930] md:h-14 md:w-14"
        >
          <ChevronRight size={22} />
        </button>
      </div>
    </section>
  )
}
