import { useState, useRef, useCallback } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function ProductImageGallery({ images, name }) {
  const [selected, setSelected] = useState(0)
  const touchStart = useRef(null)
  const touchEnd = useRef(null)
  const minSwipeDistance = 50

  const goTo = useCallback((idx) => {
    if (idx < 0) setSelected(images.length - 1)
    else if (idx >= images.length) setSelected(0)
    else setSelected(idx)
  }, [images.length])

  const goPrev = () => goTo(selected - 1)
  const goNext = () => goTo(selected + 1)

  const onTouchStart = (e) => {
    touchEnd.current = null
    touchStart.current = e.targetTouches[0].clientX
  }

  const onTouchMove = (e) => {
    touchEnd.current = e.targetTouches[0].clientX
  }

  const onTouchEnd = () => {
    if (!touchStart.current || !touchEnd.current) return
    const distance = touchStart.current - touchEnd.current
    if (Math.abs(distance) >= minSwipeDistance) {
      if (distance > 0) goNext()
      else goPrev()
    }
    touchStart.current = null
    touchEnd.current = null
  }

  if (!images || images.length === 0) return null

  return (
    <div className="flex flex-col gap-3">
      {/* Main image with swipe + arrows */}
      <div
        className="relative overflow-hidden bg-[#141414] border border-[#242424] rounded-2xl aspect-[3/4] select-none"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <img
          src={images[selected]}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-300 ease-out"
          draggable={false}
        />

        {/* Arrow navigation — desktop only */}
        {images.length > 1 && (
          <>
            <button
              onClick={goPrev}
              className="hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 items-center justify-center rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm border border-white/10 text-white/70 hover:text-white transition-all duration-200 cursor-pointer"
              aria-label="Previous image"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={goNext}
              className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 items-center justify-center rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm border border-white/10 text-white/70 hover:text-white transition-all duration-200 cursor-pointer"
              aria-label="Next image"
            >
              <ChevronRight size={18} />
            </button>
          </>
        )}

        {/* Dot indicators — mobile */}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 md:hidden">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setSelected(i)}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  i === selected ? 'bg-[#B8976A] w-4' : 'bg-white/30'
                }`}
                aria-label={`Go to image ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      <div className="flex gap-2">
        {images.map((img, i) => (
          <button
            key={i}
            onClick={() => setSelected(i)}
            className={`flex-1 overflow-hidden border-2 transition-all duration-300 rounded-xl ${
              selected === i ? 'border-[#B8976A] shadow-[0_0_12px_rgba(184,151,106,0.2)]' : 'border-[#242424] hover:border-[#B8976A]/30'
            }`}
          >
            <img
              src={img}
              alt={`${name} view ${i + 1}`}
              className="w-full aspect-square object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  )
}
